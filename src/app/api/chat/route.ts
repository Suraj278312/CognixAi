import { NextResponse } from 'next/server';
import { GeminiProvider } from '@/lib/ai/gemini-provider';
import { GeminiWebSearchProvider } from '@/lib/ai/gemini-web-search-provider';
import { retrieveGroundedContext } from '@/lib/rag/rag-service';
import { retrieveRelevantMemories } from '@/lib/memory/memory-service';
import type { AIChatMessage, AIPromptContext } from '@/lib/ai/types';
import type { CitationSource, ChatMode } from '@/types/chat';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface RequestBody {
  messages: AIChatMessage[];
  modelId?: string;
  context?: AIPromptContext;
  documentIds?: string[];
  userId?: string;
  webSearchEnabled?: boolean;
  mode?: ChatMode;
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            'Google Gemini API key is not configured. Please set GEMINI_API_KEY in your .env.local file.',
          code: 'MISSING_API_KEY',
        },
        { status: 503 }
      );
    }

    const body = (await req.json()) as RequestBody;
    const { messages, modelId, context, documentIds, userId, webSearchEnabled, mode } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request: "messages" array is required.' },
        { status: 400 }
      );
    }

    const isSearchActive = !!webSearchEnabled || mode === 'web' || mode === 'hybrid';
    const effectiveContext: AIPromptContext = {
      ...(context || {}),
      isWebSearchActive: isSearchActive,
    };
    let docCitations: CitationSource[] = [];

    const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user');

    // 1. Retrieve relevant user long-term memories if user is authenticated
    if (userId && lastUserMessage && lastUserMessage.content.trim()) {
      try {
        const relevantMemories = await retrieveRelevantMemories(
          userId,
          lastUserMessage.content
        );

        if (relevantMemories.length > 0) {
          effectiveContext.userMemories = [
            ...(effectiveContext.userMemories || []),
            ...relevantMemories,
          ];
        }
      } catch (memError) {
        console.warn('Memory retrieval notice:', memError);
      }
    }

    // 2. Execute semantic RAG retrieval if documentIds and userId are provided
    if (documentIds && Array.isArray(documentIds) && documentIds.length > 0 && userId) {
      if (lastUserMessage && lastUserMessage.content.trim()) {
        try {
          const ragResult = await retrieveGroundedContext(
            userId,
            documentIds,
            lastUserMessage.content,
            apiKey
          );

          if (ragResult.activeDocuments && ragResult.activeDocuments.length > 0) {
            effectiveContext.activeDocuments = [
              ...(effectiveContext.activeDocuments || []),
              ...ragResult.activeDocuments,
            ];
            docCitations = ragResult.citations.map((c) => ({
              ...c,
              type: 'document' as const,
            }));
          }
        } catch (ragError) {
          console.warn('RAG Retrieval failed for attached documents:', ragError);
        }
      }
    }

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // If RAG citations were retrieved, emit them immediately
          if (docCitations.length > 0) {
            const initialCitEvent = `data: ${JSON.stringify({ citations: docCitations })}\n\n`;
            controller.enqueue(encoder.encode(initialCitEvent));
          }

          // If message contains attached images, emit subtle status indicator
          const hasImages = messages.some((m) => m.images && m.images.length > 0);
          if (hasImages && !isSearchActive) {
            const imgStatusEvent = `data: ${JSON.stringify({ status: 'Analyzing image...' })}\n\n`;
            controller.enqueue(encoder.encode(imgStatusEvent));
          }

          if (isSearchActive) {
            // Web Search Grounding execution flow
            const searchProvider = new GeminiWebSearchProvider(apiKey);
            const searchStream = searchProvider.generateSearchStream(messages, {
              modelId,
              context: effectiveContext,
              signal: req.signal,
            });

            for await (const event of searchStream) {
              if (req.signal.aborted) {
                break;
              }

              if (event.type === 'status') {
                const statusEvent = `data: ${JSON.stringify({
                  status: event.statusMessage,
                })}\n\n`;
                controller.enqueue(encoder.encode(statusEvent));
              } else if (event.type === 'token' && event.text) {
                const textEvent = `data: ${JSON.stringify({ text: event.text })}\n\n`;
                controller.enqueue(encoder.encode(textEvent));
              } else if (event.type === 'citations' && event.citations) {
                // Combine document citations and web search citations
                const combinedCitations = [...docCitations, ...event.citations];
                const citEvent = `data: ${JSON.stringify({
                  citations: combinedCitations,
                })}\n\n`;
                controller.enqueue(encoder.encode(citEvent));
              }
            }
          } else {
            // Standard conversational chat execution flow
            const provider = new GeminiProvider(apiKey);
            const generator = provider.generateStream(messages, {
              modelId,
              context: effectiveContext,
              signal: req.signal,
            });

            for await (const token of generator) {
              if (req.signal.aborted) {
                break;
              }
              const sseEvent = `data: ${JSON.stringify({ text: token })}\n\n`;
              controller.enqueue(encoder.encode(sseEvent));
            }
          }

          if (!req.signal.aborted) {
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          }
          controller.close();
        } catch (error: unknown) {
          const errorMsg =
            error instanceof Error ? error.message : 'An unexpected AI generation error occurred.';
          const errorEvent = `data: ${JSON.stringify({ error: errorMsg })}\n\n`;
          controller.enqueue(encoder.encode(errorEvent));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: unknown) {
    const errorMsg =
      error instanceof Error ? error.message : 'Server encountered an unexpected error.';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
