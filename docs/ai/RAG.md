# Document Intelligence & RAG Architecture — Cognix

**Document Version:** 2.0.0  
**AI Lead:** Senior AI Engineer & Systems Architect  
**Lifecycle Status:** Phase 4 Implemented & Verified  

---

## 1. End-to-End RAG Architecture

Cognix empowers users to upload PDF documents and ask questions grounded directly in the document’s contents through a robust **Retrieval-Augmented Generation (RAG)** pipeline:

```text
┌────────────────────────────────────────────────────────┐
│               PDF Ingestion & Processing Pipeline      │
└────────────────────────────────────────────────────────┘
                           │
             ┌─────────────▼─────────────┐
             │   Client Upload (PDF)     │ ── Max 10MB, MIME: application/pdf
             └─────────────┬─────────────┘
                           │
             ┌─────────────▼─────────────┐
             │   Firebase Storage Archive │ ── users/{userId}/documents/{docId}/{name}
             └─────────────┬─────────────┘
                           │
             ┌─────────────▼─────────────┐
             │    POST /api/rag/process  │
             └─────────────┬─────────────┘
                           │
             ┌─────────────▼─────────────┐
             │ PDFParser (Page Tracking) │ ── Extracts page-by-page text & boundaries
             └─────────────┬─────────────┘
                           │
             ┌─────────────▼─────────────┐
             │ Text Cleaning & Validation│ ── Strips control chars, detects scanned PDFs
             └─────────────┬─────────────┘
                           │
             ┌─────────────▼─────────────┐
             │ Structure-Aware Chunking  │ ── 800-char chunks, 150-char overlap
             └─────────────┬─────────────┘
                           │
             ┌─────────────▼─────────────┐
             │   Gemini Embeddings       │ ── Model: gemini-embedding-2 (768 dims)
             └─────────────┬─────────────┘
                           │
             ┌─────────────▼─────────────┐
             │ Firestore Vector Storage  │ ── users/{userId}/documents/{docId}/chunks
             └───────────────────────────┘
```

---

## 2. Ingestion & Preprocessing Subsystems

### 2.1 PDF Parsing & Page Tracking (`src/lib/rag/pdf-parser.ts`)
- Utilizes modern server-side PDF extraction to parse text while strictly tracking original 1-indexed page boundaries (`pageNumber: 1, 2, ...`).
- Checks magic bytes (`%PDF-`) before parsing.
- Detects scanned/image-only PDFs where alphanumeric density is below threshold and returns a clear warning: *"This PDF appears to contain scanned pages. OCR support is not available yet."*

### 2.2 Text Cleaning (`src/lib/rag/text-cleaner.ts`)
- Normalizes CRLF and irregular line endings.
- Strips null bytes and non-printable control characters.
- Seamlessly rejoins hyphenated line breaks (e.g. `inter-\nnational` $\rightarrow$ `international`).
- Collapses excessive horizontal whitespace while preserving paragraph boundaries (`\n\n`).

### 2.3 Semantic Chunking Engine (`src/lib/rag/chunker.ts`)
Raw page text is partitioned using a structure-aware hierarchy:
1. **Paragraph Splits (`\n\n`)**: Natural semantic boundaries.
2. **Sentence Splits (`[.!?]\s+`)**: Preserves complete assertions.
3. **Sliding Character Window**: Fallback with configurable parameters:
   - `CHUNK_SIZE`: Default `800` characters.
   - `CHUNK_OVERLAP`: Default `150` characters.
- Every chunk retains immutable metadata: `id`, `documentId`, `documentName`, `userId`, `pageNumber`, `chunkIndex`, `text`, `createdAt`.

---

## 3. Embedding Generation & Vector Storage

### 3.1 Embedding Model Specification
- **Model**: `gemini-embedding-2` (Google Gemini's current embedding model).
- **Task Types**:
  - Ingestion: `TaskType.RETRIEVAL_DOCUMENT`
  - Query: `TaskType.RETRIEVAL_QUERY`
- **Output Dimensionality**: `768` dimensions for maximum fidelity and Firestore vector index compatibility.
- **Batch Processing**: Chunks are processed in batches of 16 with automatic fallback to sequential embedding.

### 3.2 Multi-Tenant Storage Partition
Chunk records and vector embeddings are stored in tenant-isolated Firestore subcollections:
```text
users/{userId}/documents/{documentId}/chunks/{chunkId}
```
**Document Fields**:
- `id`: `chunk-${documentId}-${chunkIndex}` (deterministic & idempotent)
- `documentId`: Foreign key to parent document
- `documentName`: Human-readable file name
- `userId`: Tenant identifier
- `pageNumber`: Original PDF page number (1-indexed)
- `chunkIndex`: Monotonic sequence order
- `text`: Chunk text excerpt
- `embedding`: Float vector array (768 dimensions)
- `createdAt`: Timestamp

---

## 4. Semantic Retrieval Pipeline

When a user submits a prompt with attached documents in `/api/chat`:

```text
┌────────────────────────────────────────────────────────┐
│               Semantic Retrieval Pipeline              │
└────────────────────────────────────────────────────────┘
                           │
             ┌─────────────▼─────────────┐
             │     User Question         │
             └─────────────┬─────────────┘
                           │
             ┌─────────────▼─────────────┐
             │  Query Vector Generation  │ ── gemini-embedding-2 (RETRIEVAL_QUERY)
             └─────────────┬─────────────┘
                           │
             ┌─────────────▼─────────────┐
             │ Tenant-Scoped Fetch       │ ── Loads chunks for attached docIds
             └─────────────┬─────────────┘
                           │
             ┌─────────────▼─────────────┐
             │ Cosine Similarity Search  │ ── dot(A, B) / (norm(A) * norm(B))
             └─────────────┬─────────────┘
                           │
             ┌─────────────▼─────────────┐
             │ Top-K & Threshold Filter  │ ── Top 4 chunks with score >= 0.55
             └─────────────┬─────────────┘
                           │
             ┌─────────────▼─────────────┐
             │ Context Construction      │ ── Injects into <attached_document_context>
             └─────────────┬─────────────┘
                           │
             ┌─────────────▼─────────────┐
             │ Gemini Generation Stream  │ ── Answers with [Doc.pdf · p. X] citations
             └───────────────────────────┘
```

### 4.1 Cosine Similarity Formulation
$$\text{Similarity}(Q, C) = \frac{\sum_{i=1}^n Q_i C_i}{\sqrt{\sum_{i=1}^n Q_i^2} \sqrt{\sum_{i=1}^n C_i^2}}$$
- **Top-$K$**: `4` chunks.
- **Similarity Threshold**: `0.55`. Chunks below this threshold are discarded to prevent irrelevant context injection.

---

## 5. System Prompt & Grounding Directives

Cognix injects retrieved context inside structured XML tags with strict grounding constraints:

```text
DOCUMENT GROUNDING & EVIDENCE DIRECTIVES:
1. You have been provided with excerpts from one or more uploaded PDF documents inside <attached_document_context>.
2. Answer the user's questions strictly using the provided document excerpts.
3. Do not invent or assume information that is not directly supported by the text excerpts.
4. If the provided document excerpts do not contain enough information to answer the question, state: "I couldn't find that information in the uploaded document." instead of hallucinating.
5. Always cite specific page numbers and document titles where appropriate using [Document Title · p. X] or inline reference numbers [1], [2]. Never fabricate page numbers or citations.
6. Clearly distinguish verified facts from the document from any supplementary general knowledge.

<attached_document_context>
DOCUMENT: Attention-Is-All-You-Need.pdf
[Source Page 3]:
Self-attention connects all positions with a constant number of sequentially executed operations...
</attached_document_context>
```

---

## 6. Real Source Citations & Interactive Popover

- **Inline Markers**: Gemini generates citations as `[Document.pdf · p. 12]` or `[1]`.
- **Interactive UI**: `AssistantMessage.tsx` parses these markers and renders clickable `CitationPopover` pills displaying:
  - Document Title & Page Badge (`Page 12`)
  - Grounded quote snippet excerpt
- **Persistence**: Structured citation metadata is persisted in Firestore under `/conversations/{convId}/messages/{msgId}`.

---

## 7. Security & User Isolation Guarantees

1. **Zero Cross-Tenant Leakage**:
   - Firestore security rules strictly require `request.auth.uid == userId` for `/users/{userId}/documents/{documentId}` and all subcollection chunks.
   - Storage security rules enforce `request.auth.uid == userId` for `/users/{userId}/documents/{documentId}/{fileName}`.
2. **Server-Side API Keys**:
   - `GEMINI_API_KEY` is loaded exclusively inside Next.js Node.js server routes and is never sent to the browser.
3. **Prompt Injection Sandboxing**:
   - Document chunks are enclosed in strict delimiters and treated purely as passive data facts.

---

## 8. Centralized Configuration Reference

| Parameter | Environment Variable | Default Value | Description |
| :--- | :--- | :--- | :--- |
| `maxPdfSizeMb` | `MAX_PDF_SIZE_MB` | `10` | Maximum PDF file size in MB. |
| `chunkSize` | `CHUNK_SIZE` | `800` | Target character count per semantic chunk. |
| `chunkOverlap` | `CHUNK_OVERLAP` | `150` | Overlap characters across chunk boundaries. |
| `embeddingModel` | `EMBEDDING_MODEL` | `gemini-embedding-2` | Google GenAI embedding model. |
| `embeddingDimension` | `EMBEDDING_DIMENSION` | `768` | Vector dimensions stored in Firestore. |
| `topK` | `RAG_TOP_K` | `4` | Number of chunks retrieved per question. |
| `similarityThreshold` | `RAG_SIMILARITY_THRESHOLD` | `0.55` | Minimum cosine similarity score. |

---

## 9. Known Limitations & Roadmap

- **Scanned PDF OCR**: Scanned/image-only PDFs are detected and rejected gracefully. OCR support (via Google Cloud Vision / Gemini Vision) is planned for future phases.
- **Complex Table Parsing**: Dense non-text grid tables are flattened to plain text; table structure preservation via multimodal extraction is planned for Phase 5+.
- **Multi-document Cross-Querying**: Up to 3 attached documents are searched in V1. Enterprise-scale vector databases (e.g. Pinecone/Qdrant or Cloud Firestore KNN indexes) will scale this in V1.1.
