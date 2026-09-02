/**
 * Client-Side Streaming Chat API Consumer — Cognix
 * Consumes SSE events: text tokens, search status, and verified citations.
 * Source of truth: docs/ai/WEB_SEARCH.md
 */

import type { Message, CitationSource, ChatMode } from '@/types/chat';

export interface StreamChatOptions {
  modelId?: string;
  documentIds?: string[];
  userId?: string;
  webSearchEnabled?: boolean;
  mode?: ChatMode;
  signal?: AbortSignal;
  onChunk: (token: string) => void;
  onStatus?: (status: string) => void;
  onCitations?: (citations: CitationSource[]) => void;
  onError: (error: string) => void;
  onComplete: () => void;
}

export async function streamChatResponse(
  messages: Message[],
  options: StreamChatOptions
): Promise<void> {
  const {
    modelId,
    documentIds,
    userId,
    webSearchEnabled,
    mode,
    signal,
    onChunk,
    onStatus,
    onCitations,
    onError,
    onComplete,
  } = options;

  // Format messages for server API including multimodal images
  const formattedMessages = messages.map((m) => ({
    role: m.role,
    content: m.content,
    images: m.images?.map((img) => ({
      mimeType: img.mimeType,
      base64Data: img.base64Data || img.url || '',
      name: img.name,
    })),
  }));

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: formattedMessages,
        modelId,
        documentIds,
        userId,
        webSearchEnabled,
        mode,
      }),
      signal,
    });

    if (!response.ok) {
      let errorMessage = `HTTP Error ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData.error) {
          errorMessage = errorData.error;
        }
      } catch {
        // Fallback to generic status text
      }
      onError(errorMessage);
      return;
    }

    if (!response.body) {
      onError('Response body is missing from server stream.');
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n\n');
      buffer = lines.pop() || ''; // Keep partial event in buffer

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data:')) continue;

        const dataStr = trimmed.replace(/^data:\s*/, '');
        if (dataStr === '[DONE]') {
          onComplete();
          return;
        }

        try {
          const parsed = JSON.parse(dataStr);
          if (parsed.error) {
            onError(parsed.error);
            return;
          }
          if (parsed.status) {
            onStatus?.(parsed.status);
          }
          if (parsed.citations && Array.isArray(parsed.citations)) {
            onCitations?.(parsed.citations);
          }
          if (parsed.text) {
            onChunk(parsed.text);
          }
        } catch {
          // Incomplete JSON segment, ignore
        }
      }
    }

    onComplete();
  } catch (error: unknown) {
    if (signal?.aborted) {
      // Aborted intentionally by user, complete gracefully
      onComplete();
      return;
    }

    const message =
      error instanceof Error ? error.message : 'Network error occurred while connecting to AI.';
    onError(message);
  }
}
