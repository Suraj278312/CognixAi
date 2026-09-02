/**
 * RAG & PDF Document Intelligence Configuration — Cognix
 * Source of truth: docs/ai/RAG.md
 */

export const RAG_CONFIG = {
  // Maximum allowed PDF upload size in Megabytes (Default: 10MB)
  maxPdfSizeMb: Number(process.env.MAX_PDF_SIZE_MB) || 10,
  get maxPdfSizeBytes(): number {
    return this.maxPdfSizeMb * 1024 * 1024;
  },

  // Document Chunking Parameters
  // Target character count per semantic chunk (~150-200 words)
  chunkSize: Number(process.env.CHUNK_SIZE) || 800,
  // Character overlap between contiguous chunks to preserve context
  chunkOverlap: Number(process.env.CHUNK_OVERLAP) || 150,

  // Google Gemini Embedding Model
  // Current supported model per Google AI documentation
  embeddingModel: process.env.EMBEDDING_MODEL || 'gemini-embedding-2',

  // Vector dimensionality for Firestore vector indexing & storage
  embeddingDimension: Number(process.env.EMBEDDING_DIMENSION) || 768,

  // Semantic Retrieval Configuration
  // Number of top relevant chunks to inject into system context
  topK: Number(process.env.RAG_TOP_K) || 4,
  // Minimum cosine similarity score threshold (0.0 - 1.0)
  similarityThreshold: Number(process.env.RAG_SIMILARITY_THRESHOLD) || 0.55,

  // Supported MIME types
  supportedMimeTypes: ['application/pdf'],
};
