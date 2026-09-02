/**
 * Google Gemini Web Search Grounding Provider — Cognix
 * Server-only capability provider utilizing Gemini's official Google Search Grounding tool
 * with instant, non-blocking direct model fallback when search tool quota is unavailable.
 * Source of truth: docs/ai/WEB_SEARCH.md
 */

import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
  type Content,
} from '@google/generative-ai';
import { AI_CONFIG } from '@/config/ai';
import { buildSystemInstruction } from './prompt';
import { validateSafeUrl } from '@/lib/utils/url-validator';
import type { CitationSource } from '@/types/chat';
import type { AIChatMessage, AIGenerationOptions } from './types';

export interface WebSearchStreamEvent {
  type: 'status' | 'token' | 'citations';
  text?: string;
  statusMessage?: string;
  citations?: CitationSource[];
}

export class GeminiWebSearchProvider {
  private genAI: GoogleGenerativeAI;

  constructor(apiKey?: string) {
    const key = apiKey || process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error(
        'Google Gemini API key is missing. Please set GEMINI_API_KEY in your environment variables.'
      );
    }
    this.genAI = new GoogleGenerativeAI(key);
  }

  /**
   * Convert application messages into Gemini's multi-turn Content[] format.
   * Strips empty messages and merges consecutive same-role entries.
   */
  private formatMessages(messages: AIChatMessage[]): Content[] {
    const contents: Content[] = [];
    let lastRole: string | null = null;

    for (const msg of messages) {
      if (msg.role === 'system') continue;
      const text = (msg.content || '').trim();
      if (!text) continue;

      const role = msg.role === 'assistant' ? 'model' : 'user';

      if (role === lastRole && contents.length > 0) {
        contents[contents.length - 1].parts[0].text += `\n\n${text}`;
      } else {
        contents.push({
          role,
          parts: [{ text }],
        });
        lastRole = role;
      }
    }

    if (contents.length > 0 && contents[0].role !== 'user') {
      contents.unshift({
        role: 'user',
        parts: [{ text: 'Hello' }],
      });
    }

    return contents;
  }

  /**
   * Normalizes raw Gemini grounding metadata into verified, safe CitationSource[]
   */
  private normalizeGroundingCitations(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    groundingMetadata: any
  ): CitationSource[] {
    if (!groundingMetadata) return [];

    const citations: CitationSource[] = [];
    const seenUrls = new Set<string>();

    const searchQueries: string[] = Array.isArray(groundingMetadata.webSearchQueries)
      ? groundingMetadata.webSearchQueries
      : [];

    const chunks = Array.isArray(groundingMetadata.groundingChunks)
      ? groundingMetadata.groundingChunks
      : [];

    for (let i = 0; i < chunks.length; i++) {
      const rawChunk = chunks[i];
      const web = rawChunk.web;
      if (!web || !web.uri) continue;

      const { isValid, sanitizedUrl, domain } = validateSafeUrl(web.uri);
      if (!isValid || seenUrls.has(sanitizedUrl)) continue;

      seenUrls.add(sanitizedUrl);

      const title = (web.title || domain || `Web Source ${i + 1}`).trim();

      citations.push({
        id: `web-source-${citations.length + 1}`,
        type: 'web',
        title,
        url: sanitizedUrl,
        domain,
        searchQueries: searchQueries.length > 0 ? searchQueries : undefined,
        snippet: `Source result from Google Search grounding for: ${title}`,
      });
    }

    return citations;
  }

  /**
   * Generates a streaming response with Google Search grounding tool enabled.
   * Emits status updates, text tokens, and verified citations with instant direct fallback.
   */
  async *generateSearchStream(
    messages: AIChatMessage[],
    options: AIGenerationOptions = {}
  ): AsyncGenerator<WebSearchStreamEvent, void, unknown> {
    const modelId = options.modelId || AI_CONFIG.defaultModel;

    const systemInstruction = buildSystemInstruction({
      ...(options.context || {}),
      isWebSearchActive: true,
    });

    const contents = this.formatMessages(messages);

    // Initial search status indicator
    yield {
      type: 'status',
      statusMessage: 'Searching the web...',
    };

    let searchStreamWorked = false;

    // 1. Attempt generation with official Google Search Grounding tool
    try {
      const model = this.genAI.getGenerativeModel({
        model: modelId,
        systemInstruction,
        tools: [{ googleSearch: {} } as unknown as { googleSearchRetrieval?: Record<string, unknown> }],
        generationConfig: {
          temperature: options.temperature ?? AI_CONFIG.temperature,
          maxOutputTokens: options.maxOutputTokens ?? AI_CONFIG.maxOutputTokens,
          topP: AI_CONFIG.topP,
          topK: AI_CONFIG.topK,
        },
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
        ],
      });

      const responseStream = await model.generateContentStream({
        contents,
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let latestGroundingMetadata: any = null;
      let emittedCitations = false;

      for await (const chunk of responseStream.stream) {
        if (options.signal?.aborted) return;

        const candidate = chunk.candidates?.[0];
        if (candidate?.groundingMetadata) {
          latestGroundingMetadata = candidate.groundingMetadata;
        }

        if (
          latestGroundingMetadata?.webSearchQueries &&
          latestGroundingMetadata.webSearchQueries.length > 0 &&
          !emittedCitations
        ) {
          yield {
            type: 'status',
            statusMessage: 'Reading sources...',
          };
        }

        const text = chunk.text();
        if (text) {
          searchStreamWorked = true;
          yield {
            type: 'token',
            text,
          };
        }
      }

      if (latestGroundingMetadata) {
        const citations = this.normalizeGroundingCitations(latestGroundingMetadata);
        if (citations.length > 0) {
          yield {
            type: 'citations',
            citations,
          };
          emittedCitations = true;
        }
      }

      if (searchStreamWorked) {
        return;
      }
    } catch (searchError) {
      console.warn(
        'Google Search tool grounding quota limited or unavailable. Switching to direct model synthesis...',
        searchError instanceof Error ? searchError.message : searchError
      );
    }

    // 2. Instant Direct Model Generation Fallback
    if (!searchStreamWorked) {
      const fallbackModels = [modelId, 'gemini-3.6-flash', 'gemini-3.5-flash'];
      const candidates = [...new Set(fallbackModels)];

      for (let i = 0; i < candidates.length; i++) {
        const fallbackCandidate = candidates[i];
        try {
          const directModel = this.genAI.getGenerativeModel({
            model: fallbackCandidate,
            systemInstruction,
            generationConfig: {
              temperature: options.temperature ?? AI_CONFIG.temperature,
              maxOutputTokens: options.maxOutputTokens ?? AI_CONFIG.maxOutputTokens,
              topP: AI_CONFIG.topP,
              topK: AI_CONFIG.topK,
            },
          });

          const directStream = await directModel.generateContentStream({
            contents,
          });

          let directTokens = 0;
          for await (const chunk of directStream.stream) {
            if (options.signal?.aborted) return;
            const text = chunk.text();
            if (text) {
              directTokens++;
              yield {
                type: 'token',
                text,
              };
            }
          }

          if (directTokens > 0) {
            return;
          }
        } catch (directErr) {
          console.warn(`Direct model candidate ${fallbackCandidate} failed:`, directErr);
          if (i === candidates.length - 1) {
            throw directErr;
          }
        }
      }
    }
  }
}
