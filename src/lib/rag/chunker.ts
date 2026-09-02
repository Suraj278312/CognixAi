/**
 * Intelligent Semantic Chunking Engine — Cognix
 * Source of truth: docs/ai/RAG.md
 */

import { RAG_CONFIG } from '@/config/rag';
import { cleanExtractedText } from './text-cleaner';
import type { DocumentChunk } from '@/types/document';

export interface ExtractedPage {
  pageNumber: number;
  text: string;
}

export interface ChunkOptions {
  chunkSize?: number;
  chunkOverlap?: number;
}

/**
 * Splits text into sentences using common punctuation boundaries.
 */
function splitIntoSentences(text: string): string[] {
  // Regex to split on periods, question marks, exclamation marks followed by whitespace
  const sentences = text.match(/[^.!?]+[.!?]+(\s+|$)|[^.!?]+$/g);
  return sentences ? sentences.map((s) => s.trim()).filter(Boolean) : [text];
}

/**
 * Generates overlapping semantic chunks from extracted PDF pages.
 * Prioritizes section/paragraph boundaries, then sentence boundaries,
 * and maintains source page metadata for every chunk.
 */
export function chunkDocumentPages(
  pages: ExtractedPage[],
  metadata: {
    documentId: string;
    userId: string;
    documentName?: string;
  },
  options: ChunkOptions = {}
): DocumentChunk[] {
  const chunkSize = options.chunkSize || RAG_CONFIG.chunkSize;
  const chunkOverlap = options.chunkOverlap || RAG_CONFIG.chunkOverlap;

  const chunks: DocumentChunk[] = [];
  let globalChunkIndex = 0;

  for (const page of pages) {
    const { cleanedText } = cleanExtractedText(page.text);
    if (!cleanedText) continue;

    // If the entire page is smaller than the target chunk size, keep it as a single chunk
    if (cleanedText.length <= chunkSize) {
      chunks.push({
        id: `chunk-${metadata.documentId}-${globalChunkIndex}`,
        documentId: metadata.documentId,
        documentName: metadata.documentName,
        userId: metadata.userId,
        pageNumber: page.pageNumber,
        chunkIndex: globalChunkIndex,
        text: cleanedText,
        createdAt: Date.now(),
      });
      globalChunkIndex++;
      continue;
    }

    // Split page into paragraphs
    const paragraphs = cleanedText.split(/\n\s*\n/).filter(Boolean);
    let currentChunkText = '';

    for (const paragraph of paragraphs) {
      // If paragraph itself fits into remaining space of current chunk
      if (currentChunkText.length + paragraph.length + 2 <= chunkSize) {
        currentChunkText = currentChunkText
          ? `${currentChunkText}\n\n${paragraph}`
          : paragraph;
      } else {
        // If current chunk has text, finalize it
        if (currentChunkText.trim().length > 0) {
          chunks.push({
            id: `chunk-${metadata.documentId}-${globalChunkIndex}`,
            documentId: metadata.documentId,
            documentName: metadata.documentName,
            userId: metadata.userId,
            pageNumber: page.pageNumber,
            chunkIndex: globalChunkIndex,
            text: currentChunkText.trim(),
            createdAt: Date.now(),
          });
          globalChunkIndex++;

          // Carry over overlap from the end of the previous chunk
          const overlapStart = Math.max(0, currentChunkText.length - chunkOverlap);
          const overlapSlice = currentChunkText.slice(overlapStart).trim();
          currentChunkText = overlapSlice ? `${overlapSlice} ` : '';
        }

        // If paragraph alone is longer than chunkSize, split it by sentences
        if (paragraph.length > chunkSize) {
          const sentences = splitIntoSentences(paragraph);
          for (const sentence of sentences) {
            if (currentChunkText.length + sentence.length + 1 <= chunkSize) {
              currentChunkText = currentChunkText
                ? `${currentChunkText} ${sentence}`
                : sentence;
            } else {
              if (currentChunkText.trim().length > 0) {
                chunks.push({
                  id: `chunk-${metadata.documentId}-${globalChunkIndex}`,
                  documentId: metadata.documentId,
                  documentName: metadata.documentName,
                  userId: metadata.userId,
                  pageNumber: page.pageNumber,
                  chunkIndex: globalChunkIndex,
                  text: currentChunkText.trim(),
                  createdAt: Date.now(),
                });
                globalChunkIndex++;

                const overlapStart = Math.max(0, currentChunkText.length - chunkOverlap);
                const overlapSlice = currentChunkText.slice(overlapStart).trim();
                currentChunkText = overlapSlice ? `${overlapSlice} ` : '';
              }

              // If a single sentence is larger than chunkSize, hard-slice with overlap
              if (sentence.length > chunkSize) {
                let sIdx = 0;
                while (sIdx < sentence.length) {
                  const endIdx = Math.min(sIdx + chunkSize, sentence.length);
                  const chunkSlice = sentence.slice(sIdx, endIdx);
                  chunks.push({
                    id: `chunk-${metadata.documentId}-${globalChunkIndex}`,
                    documentId: metadata.documentId,
                    documentName: metadata.documentName,
                    userId: metadata.userId,
                    pageNumber: page.pageNumber,
                    chunkIndex: globalChunkIndex,
                    text: chunkSlice.trim(),
                    createdAt: Date.now(),
                  });
                  globalChunkIndex++;
                  sIdx += chunkSize - chunkOverlap;
                  if (sIdx >= sentence.length - chunkOverlap && endIdx === sentence.length) {
                    break;
                  }
                }
                currentChunkText = '';
              } else {
                currentChunkText = sentence;
              }
            }
          }
        } else {
          currentChunkText = currentChunkText
            ? `${currentChunkText}\n\n${paragraph}`
            : paragraph;
        }
      }
    }

    // Push any remaining text from this page
    if (currentChunkText.trim().length > 0) {
      chunks.push({
        id: `chunk-${metadata.documentId}-${globalChunkIndex}`,
        documentId: metadata.documentId,
        documentName: metadata.documentName,
        userId: metadata.userId,
        pageNumber: page.pageNumber,
        chunkIndex: globalChunkIndex,
        text: currentChunkText.trim(),
        createdAt: Date.now(),
      });
      globalChunkIndex++;
    }
  }

  return chunks;
}
