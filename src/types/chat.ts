/**
 * Chat & Message Type Definitions — Cognix
 * Source of truth: docs/backend/FIRESTORE_SCHEMA.md, docs/ai/WEB_SEARCH.md & docs/ai/MULTIMODAL.md
 */

export type MessageRole = 'user' | 'assistant' | 'system';

export type CitationType = 'document' | 'web';

export interface CitationSource {
  id: string;
  type?: CitationType;
  title: string;
  // Web search citation fields
  url?: string;
  domain?: string;
  citedText?: string;
  startIndex?: number;
  endIndex?: number;
  searchQueries?: string[];
  // Document RAG citation fields
  documentId?: string;
  documentName?: string;
  pageNumber?: number;
  chunkId?: string;
  snippet?: string;
}

export type ChatMode = 'chat' | 'web' | 'document' | 'hybrid';

export interface ImageAttachment {
  id: string;
  userId: string;
  conversationId?: string;
  name: string;
  storagePath: string;
  mimeType: string;
  sizeBytes: number;
  width?: number;
  height?: number;
  url?: string;            // Secure download/preview URL
  base64Data?: string;     // Transient client-to-server payload for active turn
  createdAt: number;
}

export interface Message {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  images?: ImageAttachment[];
  citations?: CitationSource[];
  isStreaming?: boolean;
  searchStatus?: string;
  hasDocumentContext?: boolean;
  hasWebSearchGrounding?: boolean;
  hasImageContext?: boolean;
  createdAt: number;
}

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  isPinned?: boolean;
  attachedDocumentIds?: string[];
  lastMessageText?: string;
  updatedAt: number;
  createdAt: number;
}
