/**
 * Google Gemini Vector Embedding Service — Cognix
 * Source of truth: docs/ai/RAG.md
 */

import { GoogleGenerativeAI, TaskType } from '@google/generative-ai';
import { RAG_CONFIG } from '@/config/rag';
import type { DocumentChunk } from '@/types/document';

/**
 * Generates vector embeddings for a single text query using Google GenAI SDK.
 */
export async function generateQueryEmbedding(
  query: string,
  apiKey?: string
): Promise<number[]> {
  const key = apiKey || process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error('Google Gemini API key is missing for embedding generation.');
  }

  const genAI = new GoogleGenerativeAI(key);
  const modelName = RAG_CONFIG.embeddingModel;

  try {
    const embeddingModel = genAI.getGenerativeModel({ model: modelName });
    const result = await embeddingModel.embedContent({
      content: {
        role: 'user',
        parts: [{ text: query.trim() }],
      },
      taskType: TaskType.RETRIEVAL_QUERY,
    });

    return result.embedding.values;
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`Embedding generation failed for model ${modelName}:`, errorMsg);
    throw new Error(`Failed to generate query embedding: ${errorMsg}`);
  }
}

/**
 * Generates vector embeddings for a list of document chunks in batches.
 * Attaches the calculated embedding vector to each chunk.
 */
export async function generateChunkEmbeddings(
  chunks: DocumentChunk[],
  apiKey?: string
): Promise<DocumentChunk[]> {
  if (chunks.length === 0) return [];

  const key = apiKey || process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error('Google Gemini API key is missing for embedding generation.');
  }

  const genAI = new GoogleGenerativeAI(key);
  const modelName = RAG_CONFIG.embeddingModel;
  const embeddingModel = genAI.getGenerativeModel({ model: modelName });

  const BATCH_SIZE = 16;
  const updatedChunks: DocumentChunk[] = [];

  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE);

    try {
      // Try batch embedding first
      const batchResult = await embeddingModel.batchEmbedContents({
        requests: batch.map((chunk) => ({
          content: {
            role: 'user',
            parts: [{ text: chunk.text }],
          },
          taskType: TaskType.RETRIEVAL_DOCUMENT,
          title: chunk.documentName || undefined,
        })),
      });

      if (batchResult.embeddings && batchResult.embeddings.length === batch.length) {
        for (let j = 0; j < batch.length; j++) {
          updatedChunks.push({
            ...batch[j],
            embedding: batchResult.embeddings[j].values,
          });
        }
        continue;
      }
    } catch (batchError) {
      console.warn(
        `Batch embedding failed for batch ${i / BATCH_SIZE}, falling back to sequential embedding:`,
        batchError
      );
    }

    // Fallback: Embed individually if batch API fails or returns mismatched length
    for (const chunk of batch) {
      try {
        const singleResult = await embeddingModel.embedContent({
          content: {
            role: 'user',
            parts: [{ text: chunk.text }],
          },
          taskType: TaskType.RETRIEVAL_DOCUMENT,
          title: chunk.documentName || undefined,
        });

        updatedChunks.push({
          ...chunk,
          embedding: singleResult.embedding.values,
        });
      } catch (singleError: unknown) {
        const msg = singleError instanceof Error ? singleError.message : String(singleError);
        console.error(`Failed to embed chunk ${chunk.id}:`, msg);
        throw new Error(`Embedding error on chunk ${chunk.chunkIndex + 1}: ${msg}`);
      }
    }
  }

  return updatedChunks;
}
