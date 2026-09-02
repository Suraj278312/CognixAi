/**
 * Vector Storage & Cosine Similarity Search Engine — Cognix
 * Multi-tenant isolation: users/{userId}/documents/{documentId}/chunks/{chunkId}
 * Source of truth: docs/ai/RAG.md
 */

import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  type DocumentData,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { RAG_CONFIG } from '@/config/rag';
import type { DocumentChunk, RetrievedChunk } from '@/types/document';

/**
 * Calculates cosine similarity between two float vectors.
 * Returns a value between -1.0 and 1.0 (typically 0.0 - 1.0 for embeddings).
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0) {
    return 0;
  }

  const length = Math.min(vecA.length, vecB.length);
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
  return magnitude === 0 ? 0 : dotProduct / magnitude;
}

/**
 * Performs vector similarity search over an in-memory collection of document chunks.
 * Enforces relevance threshold and returns top-K ranked chunks.
 */
export function searchSimilarChunks(
  queryVector: number[],
  chunks: DocumentChunk[],
  options?: {
    topK?: number;
    threshold?: number;
  }
): RetrievedChunk[] {
  if (!queryVector || queryVector.length === 0 || !chunks || chunks.length === 0) {
    return [];
  }

  const topK = options?.topK ?? RAG_CONFIG.topK;
  const threshold = options?.threshold ?? RAG_CONFIG.similarityThreshold;

  const scoredChunks: RetrievedChunk[] = [];

  for (const chunk of chunks) {
    if (!chunk.embedding || chunk.embedding.length === 0) continue;

    const score = cosineSimilarity(queryVector, chunk.embedding);
    if (score >= threshold) {
      scoredChunks.push({
        ...chunk,
        similarityScore: score,
      });
    }
  }

  // Sort descending by similarity score
  scoredChunks.sort((a, b) => b.similarityScore - a.similarityScore);

  return scoredChunks.slice(0, topK);
}

/**
 * Persists document chunks and their embeddings into Firestore under the user-isolated path:
 * users/{userId}/documents/{documentId}/chunks/{chunkId}
 */
export async function saveDocumentChunks(
  userId: string,
  documentId: string,
  chunks: DocumentChunk[]
): Promise<void> {
  try {
    for (const chunk of chunks) {
      const chunkDocRef = doc(
        db,
        'users',
        userId,
        'documents',
        documentId,
        'chunks',
        chunk.id
      );

      await setDoc(chunkDocRef, {
        id: chunk.id,
        documentId: chunk.documentId,
        documentName: chunk.documentName || '',
        userId,
        pageNumber: chunk.pageNumber,
        chunkIndex: chunk.chunkIndex,
        text: chunk.text,
        embedding: chunk.embedding || [],
        createdAt: chunk.createdAt || Date.now(),
      });
    }
  } catch (error) {
    console.error(`Failed to save chunks for document ${documentId}:`, error);
    throw error;
  }
}

/**
 * Fetches all chunks and embeddings for a user document from Firestore.
 */
export async function getDocumentChunks(
  userId: string,
  documentId: string
): Promise<DocumentChunk[]> {
  try {
    const chunksColRef = collection(
      db,
      'users',
      userId,
      'documents',
      documentId,
      'chunks'
    );
    const q = query(chunksColRef, orderBy('chunkIndex', 'asc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((docSnap: QueryDocumentSnapshot<DocumentData>) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        documentId: data.documentId || documentId,
        documentName: data.documentName || '',
        userId: data.userId || userId,
        pageNumber: data.pageNumber || 1,
        chunkIndex: data.chunkIndex || 0,
        text: data.text || '',
        embedding: data.embedding || [],
        createdAt: data.createdAt || Date.now(),
      };
    });
  } catch (error) {
    console.error(`Failed to get chunks for document ${documentId}:`, error);
    return [];
  }
}

/**
 * Deletes all chunks in the document's subcollection.
 */
export async function deleteDocumentChunks(
  userId: string,
  documentId: string
): Promise<void> {
  try {
    const chunksColRef = collection(
      db,
      'users',
      userId,
      'documents',
      documentId,
      'chunks'
    );
    const snapshot = await getDocs(chunksColRef);
    const deletePromises = snapshot.docs.map((d: QueryDocumentSnapshot<DocumentData>) =>
      deleteDoc(d.ref)
    );
    await Promise.all(deletePromises);
  } catch (error) {
    console.error(`Failed to delete chunks for document ${documentId}:`, error);
    throw error;
  }
}
