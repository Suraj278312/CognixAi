/**
 * Google Gemini AI Provider Implementation — Cognix
 * Server-only provider implementing streaming, multi-turn context, and rate-limit fallbacks.
 */

import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
  type Content,
  type Part,
} from '@google/generative-ai';
import { AI_CONFIG } from '@/config/ai';
import { MULTIMODAL_CONFIG } from '@/config/multimodal';
import { buildSystemInstruction } from './prompt';
import type { AIProvider, AIChatMessage, AIGenerationOptions } from './types';

export class GeminiProvider implements AIProvider {
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
   * Convert application messages into Gemini's multi-turn Content[] format,
   * supporting multimodal images and multi-turn visual context.
   */
  private formatMessages(messages: AIChatMessage[]): Content[] {
    const formattedReversed: Content[] = [];
    let includedImagesCount = 0;

    // Process from newest to oldest to prioritize recent visual context
    const reversedMessages = [...messages].reverse();

    for (const msg of reversedMessages) {
      if (msg.role === 'system') continue;

      const parts: Part[] = [];

      // Add image parts if present and within maxImagesInContext limit
      if (msg.images && msg.images.length > 0) {
        for (const img of msg.images) {
          if (
            img.base64Data &&
            img.mimeType &&
            includedImagesCount < MULTIMODAL_CONFIG.maxImagesInContext
          ) {
            const cleanBase64 = img.base64Data.replace(/^data:[^;]+;base64,/, '');
            parts.push({
              inlineData: {
                mimeType: img.mimeType,
                data: cleanBase64,
              },
            });
            includedImagesCount++;
          }
        }
      }

      if (msg.content && msg.content.trim()) {
        parts.push({ text: msg.content });
      } else if (parts.length > 0) {
        // Helpful fallback prompt for image-only user messages
        parts.push({ text: 'Please describe and analyze the attached image.' });
      }

      if (parts.length > 0) {
        formattedReversed.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts,
        });
      }
    }

    const result = formattedReversed.reverse();

    if (result.length > 0 && result[0].role !== 'user') {
      result.unshift({
        role: 'user',
        parts: [{ text: 'Hello' }],
      });
    }

    return result;
  }

  /**
   * Stream response tokens from Gemini with automatic retry and model fallback.
   */
  async *generateStream(
    messages: AIChatMessage[],
    options: AIGenerationOptions = {}
  ): AsyncGenerator<string, void, unknown> {
    const primaryModelId = options.modelId || AI_CONFIG.defaultModel;
    const fallbackModels = ['gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-3.7-flash'];
    const modelCandidates = [
      primaryModelId,
      ...fallbackModels.filter((m) => m !== primaryModelId),
    ];

    const systemInstruction = buildSystemInstruction(options.context);
    const contents = this.formatMessages(messages);

    let lastError: unknown = null;

    for (let i = 0; i < modelCandidates.length; i++) {
      const currentModelId = modelCandidates[i];

      try {
        const model = this.genAI.getGenerativeModel({
          model: currentModelId,
          systemInstruction,
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

        let yieldedTokens = 0;

        for await (const chunk of responseStream.stream) {
          if (options.signal?.aborted) {
            return;
          }

          const text = chunk.text();
          if (text) {
            yieldedTokens++;
            yield text;
          }
        }

        // If successfully generated content, return
        if (yieldedTokens > 0) {
          return;
        }
      } catch (err: unknown) {
        lastError = err;
        if (options.signal?.aborted) {
          return;
        }

        const msg = err instanceof Error ? err.message : String(err);

        // If rate limited or model not found, try the next model candidate
        if (
          (msg.includes('429') ||
            msg.includes('503') ||
            msg.includes('RESOURCE_EXHAUSTED') ||
            msg.includes('quota') ||
            msg.includes('404') ||
            msg.includes('not found')) &&
          i < modelCandidates.length - 1
        ) {
          console.warn(`Model ${currentModelId} hit quota/unavailable. Retrying with ${modelCandidates[i + 1]}...`);
          await new Promise((r) => setTimeout(r, 400));
          continue;
        }

        // Handle terminal errors
        if (msg.includes('API_KEY_INVALID') || msg.includes('API key not valid')) {
          throw new Error('Invalid Gemini API Key. Please check GEMINI_API_KEY in your .env.local file.');
        } else if (msg.includes('RESOURCE_EXHAUSTED') || msg.includes('quota')) {
          throw new Error('Gemini API rate limit exceeded on free tier. Please wait a moment before trying again.');
        } else if (msg.includes('SAFETY') || msg.includes('blocked')) {
          throw new Error('I am unable to generate a response in accordance with safety policies.');
        }

        throw err;
      }
    }

    if (lastError) {
      throw lastError;
    }
  }
}
