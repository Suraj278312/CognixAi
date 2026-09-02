/**
 * Comprehensive RAG Pipeline Verification Test Suite — Cognix Phase 4
 */

import { cleanExtractedText, isScannedOrEmptyPdf } from '../src/lib/rag/text-cleaner.js';
import { chunkDocumentPages } from '../src/lib/rag/chunker.js';
import { cosineSimilarity, searchSimilarChunks } from '../src/lib/rag/vector-store.js';
import { buildSystemInstruction } from '../src/lib/ai/prompt.js';

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (!condition) {
    console.error(`❌ FAIL [Test ${totalTests}]: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  passedTests++;
  console.log(`✅ PASS [Test ${totalTests}]: ${message}`);
}

console.log('================================================================');
console.log(' COGNIX PHASE 4 — RAG PIPELINE & DOCUMENT INTELLIGENCE TESTS');
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// Test 1: Text Cleaning & Normalization
// -----------------------------------------------------------------------------
console.log('--- 1. Text Cleaning & Scanned PDF Detection Tests ---');
const rawDirtyText = "This  is   a   test\r\nof   inter-\r\nnational   AI\n\n\n\nresearch with    multiple    spaces.";
const { cleanedText, charCount, wordCount } = cleanExtractedText(rawDirtyText);
assert(cleanedText.includes('international AI'), 'Hyphenated linebreaks must be joined seamlessly');
assert(!cleanedText.includes('   '), 'Excessive spaces must be collapsed');
assert(cleanedText.includes('\n\n'), 'Paragraph boundaries must be preserved');
assert(wordCount > 0 && charCount > 0, 'Word count and char count must be calculated');

// -----------------------------------------------------------------------------
// Test 2: Scanned / Empty PDF Detection
// -----------------------------------------------------------------------------
const emptyPages = [{ pageNumber: 1, text: '   ' }, { pageNumber: 2, text: '---' }];
const scannedResult = isScannedOrEmptyPdf(emptyPages);
assert(scannedResult.isScanned === true, 'Scanned/empty PDF must be flagged accurately');
assert(scannedResult.reason.includes('scanned pages'), 'Error reason must clearly mention scanned pages and OCR');

const validPages = [
  { pageNumber: 1, text: 'Cognix is an intelligent AI chatbot utilizing Gemini models for grounded conversation.' },
  { pageNumber: 2, text: 'Retrieval Augmented Generation combines dense vector retrieval with LLM reasoning.' }
];
const validCheck = isScannedOrEmptyPdf(validPages);
assert(validCheck.isScanned === false, 'Valid PDF with extractable text must pass scanned check');

// -----------------------------------------------------------------------------
// Test 3: Intelligent Semantic Chunking & Overlap
// -----------------------------------------------------------------------------
console.log('\n--- 2. Intelligent Chunking & Metadata Preservation Tests ---');
const longTextPage = {
  pageNumber: 3,
  text: `Artificial intelligence has progressed through several distinct eras.
The first era focused on symbolic manipulation and expert systems built by hand.

The second era brought statistical machine learning and neural networks trained on large datasets.
Deep learning revolutionized computer vision and natural language processing through multi-layer architectures.

The third and current era is characterized by foundation models and generative transformers.
These models demonstrate emergent reasoning and few-shot contextual understanding across modalities.`,
};

const chunks = chunkDocumentPages(
  [longTextPage],
  {
    documentId: 'doc-ai-history-101',
    userId: 'user-suraj',
    documentName: 'AI-History.pdf',
  },
  { chunkSize: 200, chunkOverlap: 40 }
);

assert(chunks.length > 1, 'Long document page must be segmented into multiple chunks');
assert(chunks.every((c) => c.pageNumber === 3), 'All chunks must preserve the source pageNumber 3');
assert(chunks.every((c) => c.documentId === 'doc-ai-history-101'), 'All chunks must carry the documentId');
assert(chunks.every((c) => c.userId === 'user-suraj'), 'All chunks must carry the userId');
assert(chunks[0].chunkIndex === 0 && chunks[1].chunkIndex === 1, 'Chunk indices must be monotonically sequential');
assert(chunks[0].id === 'chunk-doc-ai-history-101-0', 'Chunk IDs must be deterministic and idempotent');

// -----------------------------------------------------------------------------
// Test 4: Cosine Similarity Vector Calculation
// -----------------------------------------------------------------------------
console.log('\n--- 3. Vector Similarity & Cosine Retrieval Tests ---');
const vecA = [1.0, 0.0, 0.0];
const vecIdentical = [1.0, 0.0, 0.0];
const vecOrthogonal = [0.0, 1.0, 0.0];
const vecOpposite = [-1.0, 0.0, 0.0];

assert(Math.abs(cosineSimilarity(vecA, vecIdentical) - 1.0) < 0.0001, 'Identical vectors must have cosine similarity = 1.0');
assert(Math.abs(cosineSimilarity(vecA, vecOrthogonal)) < 0.0001, 'Orthogonal vectors must have cosine similarity = 0.0');
assert(Math.abs(cosineSimilarity(vecA, vecOpposite) - (-1.0)) < 0.0001, 'Opposite vectors must have cosine similarity = -1.0');

// -----------------------------------------------------------------------------
// Test 5: Semantic Retrieval Ranking & Top-K Thresholding
// -----------------------------------------------------------------------------
const mockChunks = [
  {
    id: 'chunk-1',
    documentId: 'doc-1',
    documentName: 'Research.pdf',
    userId: 'user-1',
    pageNumber: 1,
    chunkIndex: 0,
    text: 'Transformers use multi-head self-attention mechanisms to weigh token dependencies.',
    embedding: [0.9, 0.1, 0.0],
    createdAt: Date.now(),
  },
  {
    id: 'chunk-2',
    documentId: 'doc-1',
    documentName: 'Research.pdf',
    userId: 'user-1',
    pageNumber: 2,
    chunkIndex: 1,
    text: 'Convolutional neural networks apply kernel filters over pixel matrices for spatial features.',
    embedding: [0.1, 0.9, 0.0],
    createdAt: Date.now(),
  },
  {
    id: 'chunk-3',
    documentId: 'doc-1',
    documentName: 'Research.pdf',
    userId: 'user-1',
    pageNumber: 3,
    chunkIndex: 2,
    text: 'Positional encodings inject sequence order into attention matrices without recurrence.',
    embedding: [0.85, 0.15, 0.0],
    createdAt: Date.now(),
  },
];

// Query about attention mechanisms (vector aligned with [1.0, 0.0, 0.0])
const queryVector = [1.0, 0.0, 0.0];
const topMatches = searchSimilarChunks(queryVector, mockChunks, { topK: 2, threshold: 0.5 });

assert(topMatches.length === 2, 'Top-K=2 must return exactly 2 relevant chunks');
assert(topMatches[0].id === 'chunk-1', 'Chunk 1 must rank highest based on cosine similarity');
assert(topMatches[1].id === 'chunk-3', 'Chunk 3 must rank second');
assert(topMatches[0].similarityScore > 0.8, 'Top match must have high similarity score');
assert(topMatches.every((m) => m.similarityScore >= 0.5), 'All returned matches must satisfy the threshold constraint');

// -----------------------------------------------------------------------------
// Test 6: Empty Retrieval Threshold Filter
// -----------------------------------------------------------------------------
const unrelatedQueryVector = [0.0, 0.0, 1.0]; // Orthogonal query
const emptyMatches = searchSimilarChunks(unrelatedQueryVector, mockChunks, { topK: 3, threshold: 0.7 });
assert(emptyMatches.length === 0, 'Unrelated queries below threshold must return 0 chunks (no false positive retrieval)');

// -----------------------------------------------------------------------------
// Test 7: RAG System Prompt Construction & Delimiter Grounding
// -----------------------------------------------------------------------------
console.log('\n--- 4. RAG Prompt & Grounding Directives Tests ---');
const promptContext = {
  userDisplayName: 'Alex',
  activeDocuments: [
    {
      title: 'Attention-Is-All-You-Need.pdf',
      relevantChunks: [
        '[Source Page 3]:\nSelf-attention connects all positions with a constant number of operations.',
        '[Source Page 5]:\nThe Transformer uses scaled dot-product attention.',
      ],
    },
  ],
};

const systemInstruction = buildSystemInstruction(promptContext);
assert(systemInstruction.includes('DOCUMENT GROUNDING & EVIDENCE DIRECTIVES:'), 'System prompt must include RAG directives');
assert(systemInstruction.includes('<attached_document_context>'), 'Context must be enclosed in <attached_document_context> delimiters');
assert(systemInstruction.includes('Attention-Is-All-You-Need.pdf'), 'Document title must be present in prompt');
assert(systemInstruction.includes('[Source Page 3]'), 'Source page reference must be present in chunk context');
assert(systemInstruction.includes("I couldn't find that information in the uploaded document."), 'Grounding instructions must mandate explicit negative responses when evidence is missing');

console.log('\n================================================================');
console.log(` ALL ${passedTests}/${totalTests} TESTS PASSED SUCCESSFULLY!`);
console.log('================================================================\n');
