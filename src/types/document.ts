/**
 * Document & Chunk Type Definitions — Cognix
 * Source of truth: docs/backend/FIRESTORE_SCHEMA.md & docs/ai/RAG.md
 */

export type DocumentStatus = 'uploading' | 'processing' | 'ready' | 'error' | 'failed';

export interface UploadedDocument {
  id: string;
  userId: string;
  fileName: string;
  fileSizeBytes: number;
  mimeType: string;
  storagePath: string;
  pageCount?: number;
  chunkCount?: number;
  status: DocumentStatus;
  errorMessage?: string;
  createdAt: number;
  updatedAt?: number;
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  documentName?: string;
  userId: string;
  pageNumber: number;
  chunkIndex: number;
  text: string;
  embedding?: number[];
  createdAt: number;
}

export interface RetrievedChunk extends DocumentChunk {
  similarityScore: number;
}
