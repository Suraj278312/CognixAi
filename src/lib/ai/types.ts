/**
 * AI Provider Types & Contracts — Cognix
 * Source of truth: docs/ai/GEMINI.md & docs/ai/WEB_SEARCH.md
 */

import type { CitationSource } from '@/types/chat';

export interface AIChatMessage {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  images?: {
    mimeType: string;
    base64Data: string;
    name?: string;
  }[];
}

export interface AIPromptContext {
  userDisplayName?: string;
  userMemories?: string[];
  activeDocuments?: { title: string; relevantChunks: string[] }[];
  searchGroundingResults?: { title: string; url: string; snippet: string }[];
  isWebSearchActive?: boolean;
}

export interface AIGenerationOptions {
  modelId?: string;
  temperature?: number;
  maxOutputTokens?: number;
  context?: AIPromptContext;
  webSearchEnabled?: boolean;
  signal?: AbortSignal;
}

export interface AIGroundingMetadata {
  searchQueries?: string[];
  citations?: CitationSource[];
}

export interface StreamEventChunk {
  type: 'token' | 'status' | 'citations';
  text?: string;
  statusMessage?: string;
  citations?: CitationSource[];
}

export interface AIProvider {
  generateStream(
    messages: AIChatMessage[],
    options?: AIGenerationOptions
  ): AsyncGenerator<string, void, unknown>;
}
