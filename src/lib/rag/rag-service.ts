/**
 * End-to-End RAG Pipeline & Context Orchestration Service — Cognix
 * Source of truth: docs/ai/RAG.md
 */

import { parsePdfBuffer } from './pdf-parser';
import { chunkDocumentPages } from './chunker';
import { generateQueryEmbedding, generateChunkEmbeddings } from './embeddings';
import {
  saveDocumentChunks,
  getDocumentChunks,
  searchSimilarChunks,
} from './vector-store';
import { RAG_CONFIG } from '@/config/rag';
import type { DocumentChunk, RetrievedChunk } from '@/types/document';
import type { CitationSource } from '@/types/chat';

export interface ProcessPdfResult {
  documentId: string;
  fileName: string;
  pageCount: number;
  chunkCount: number;
  chunks: DocumentChunk[];
}

export interface RagContextResult {
  activeDocuments: Array<{
    title: string;
    relevantChunks: string[];
  }>;
  citations: CitationSource[];
  retrievedChunks: RetrievedChunk[];
}

/**
 * 1. Ingestion Pipeline: Parse -> Chunk -> Embed -> Save
 */
export async function processPdfDocument(
  userId: string,
  documentId: string,
  fileName: string,
  buffer: Buffer | Uint8Array,
  apiKey?: string
): Promise<ProcessPdfResult> {
  // Step 1: Parse PDF buffer and extract page text
  const parseResult = await parsePdfBuffer(buffer);

  // Step 2: Intelligent semantic chunking
  const rawChunks = chunkDocumentPages(parseResult.pages, {
    documentId,
    userId,
    documentName: fileName,
  });

  if (rawChunks.length === 0) {
    throw new Error('No readable text content could be chunked from this PDF.');
  }

  // Step 3: Generate Gemini embeddings (gemini-embedding-2)
  const embeddedChunks = await generateChunkEmbeddings(rawChunks, apiKey);

  // Step 4: Persist chunks and vectors to Firestore
  await saveDocumentChunks(userId, documentId, embeddedChunks);

  return {
    documentId,
    fileName,
    pageCount: parseResult.pageCount,
    chunkCount: embeddedChunks.length,
    chunks: embeddedChunks,
  };
}

/**
 * 2. Retrieval Pipeline: Query Embedding -> Similarity Search -> Context Synthesizer -> Citations
 */
export async function retrieveGroundedContext(
  userId: string,
  documentIds: string[],
  queryText: string,
  apiKey?: string
): Promise<RagContextResult> {
  if (!documentIds || documentIds.length === 0 || !queryText.trim()) {
    return { activeDocuments: [], citations: [], retrievedChunks: [] };
  }

  // Step 1: Generate embedding vector for user query
  const queryVector = await generateQueryEmbedding(queryText, apiKey);

  // Step 2: Fetch chunks for attached documents and compute cosine similarity
  const allRetrievedChunks: RetrievedChunk[] = [];
  const docNamesMap = new Map<string, string>();

  for (const docId of documentIds) {
    const docChunks = await getDocumentChunks(userId, docId);
    if (docChunks.length === 0) continue;

    if (docChunks[0].documentName) {
      docNamesMap.set(docId, docChunks[0].documentName);
    }

    const topMatches = searchSimilarChunks(queryVector, docChunks, {
      topK: RAG_CONFIG.topK,
      threshold: RAG_CONFIG.similarityThreshold,
    });

    allRetrievedChunks.push(...topMatches);
  }

  // Sort all retrieved chunks across documents by similarity score descending
  allRetrievedChunks.sort((a, b) => b.similarityScore - a.similarityScore);
  const selectedChunks = allRetrievedChunks.slice(0, RAG_CONFIG.topK);

  if (selectedChunks.length === 0) {
    return { activeDocuments: [], citations: [], retrievedChunks: [] };
  }

  // Step 3: Format active documents context grouped by document
  const groupedByDoc = new Map<string, string[]>();
  const citations: CitationSource[] = [];

  selectedChunks.forEach((chunk, index) => {
    const docTitle = chunk.documentName || docNamesMap.get(chunk.documentId) || 'Uploaded Document';
    const chunkHeader = `[Source Page ${chunk.pageNumber}]:\n${chunk.text}`;

    if (!groupedByDoc.has(docTitle)) {
      groupedByDoc.set(docTitle, []);
    }
    groupedByDoc.get(docTitle)!.push(chunkHeader);

    // Create structured citation source with quote snippet
    citations.push({
      id: `cit-doc-${index + 1}`,
      type: 'document',
      title: `${docTitle} (p. ${chunk.pageNumber})`,
      documentId: chunk.documentId,
      documentName: docTitle,
      pageNumber: chunk.pageNumber,
      chunkId: chunk.id,
      snippet: chunk.text.length > 200 ? `${chunk.text.slice(0, 200)}...` : chunk.text,
    });
  });

  const activeDocuments = Array.from(groupedByDoc.entries()).map(([title, relevantChunks]) => ({
    title,
    relevantChunks,
  }));

  return {
    activeDocuments,
    citations,
    retrievedChunks: selectedChunks,
  };
}
