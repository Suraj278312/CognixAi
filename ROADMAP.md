# Product & Engineering Roadmap — Cognix

**Document Version:** 1.0.0  
**Status:** Approved Blueprint  
**Lifecycle:** Phase 3 Completed  

---

## 1. Roadmap Milestones Overview

```text
Phase 0: Foundation & Documentation ──> [COMPLETED]
Phase 1: Design System & UI Shell   ──> [COMPLETED]
Phase 2: Core Streaming AI Chat (Gemini) ──> [COMPLETED]
Phase 3: Authentication & Persistent Chat ──> [COMPLETED]
Phase 4: PDF Document Intelligence & RAG Pipeline ──> [COMPLETED]
Phase 5: Real-Time Web Search & Grounded Web Answers ──> [COMPLETED]
Phase 6: Long-Term Memory + Personalization System ──> [COMPLETED]
Phase 7: Multimodal AI & Image Understanding ──> [COMPLETED]
Phase 8: Security Hardening & App Check
Phase 9: Quality Assurance & Testing
Phase 10: Production Deployment & Observability
```

---

## 2. Detailed Milestone Breakdown

### Phase 0: Foundation & Documentation Setup (Completed)
- [x] Create comprehensive architectural blueprints, PRD, and design system.
- [x] Establish secure Firebase rules skeleton and schema specifications.
- [x] Configure repository scaffolding, `.env.example`, and `.gitignore`.
- [x] Define developer guidelines and AI Agent rules (`AGENTS.md`).

---

### Phase 1: Design System & UI Primitives (Completed)
- [x] Initialize Next.js project with TypeScript and Tailwind CSS.
- [x] Configure custom HSL design tokens for dark and light themes in `globals.css`.
- [x] Implement atomic UI components (`Button`, `Input`, `Modal`, `Dropdown`, `Badge`, `Tooltip`, `CognixLogo`).
- [x] Build landing page with hero, product demo preview, feature grid, and GSAP scroll storytelling.
- [x] Build layout shell: Collapsible Sidebar, Main Header, Floating Command Bar.
- [x] Build Chat Canvas with user messages, assistant markdown, syntax-highlighted code blocks, and streaming indicator.
- [x] Build UI foundations for Document Upload (PDF RAG), Grounded Web Search, Memory Management, and Settings.
- [x] Build polished Authentication UI (`/login`, `/signup`).
- [x] Integrate Framer Motion for smooth layout transitions and responsive breakpoints.

---

### Phase 2: Core Streaming AI Chat (Gemini) (Completed)
- [x] Setup serverless API Route Handler `POST /api/chat`.
- [x] Integrate Google Gemini API (`@google/generative-ai`) with streaming support and configurable model tiers.
- [x] Implement Server-Sent Events (SSE) streaming pipeline to client with `AbortController` cancellation.
- [x] Create decoupled `AIProvider` and `GeminiProvider` abstraction layers.
- [x] Centralize Cognix system instruction builder (`src/lib/ai/prompt.ts`).
- [x] Maintain multi-turn conversational session context.
- [x] Fully eliminate simulated/mock response timers.
- [x] Rich Markdown parser and syntax-highlighted code blocks with copy feedback.
- [x] Client generation controls: "Stop Generation" and "Regenerate".

---

### Phase 3: Authentication & Persistent Chat (Completed)
- [x] Configure Firebase Client SDK with environment validation.
- [x] Implement Google OAuth and Email/Password registration/login.
- [x] Build password reset flow (`/forgot-password`).
- [x] Build global `AuthProvider` and `useAuth` hook with human-readable error resolution.
- [x] Implement route protection redirecting unauthenticated users to `/login`.
- [x] Implement multi-tenant Firestore schema (`users/{userId}/conversations/{conversationId}/messages/{messageId}`).
- [x] Implement deterministic conversation titling without token waste.
- [x] Implement optimistic user message persistence and final assistant streaming response commit.
- [x] Connect conversation sidebar with time-based grouping (Today, Yesterday, Previous 7 Days, Older).
- [x] Support conversation renaming and deletion with confirmation dialog.
- [x] Enforce path-based Firestore security rules (`isOwner(userId)`).
- [x] Real user profile state in top header with Sign Out integration.

---

### Phase 4: PDF Document Intelligence + RAG Pipeline (Completed)
- [x] Real server-side PDF text extraction preserving 1-indexed page boundaries (`src/lib/rag/pdf-parser.ts`).
- [x] Scanned PDF detection with graceful warning: *"This PDF appears to contain scanned pages. OCR support is not available yet."*
- [x] Text cleaning and whitespace normalization (`src/lib/rag/text-cleaner.ts`).
- [x] Structure-aware semantic chunking with configurable size (800) and overlap (150) (`src/lib/rag/chunker.ts`).
- [x] Google Gemini vector embeddings using `gemini-embedding-2` (768 dimensions) (`src/lib/rag/embeddings.ts`).
- [x] Multi-tenant vector storage in Firestore (`users/{userId}/documents/{documentId}/chunks/{chunkId}`).
- [x] Cosine similarity search engine with relevance threshold filtering (`src/lib/rag/vector-store.ts`).
- [x] End-to-end RAG ingestion and retrieval orchestrator (`src/lib/rag/rag-service.ts`).
- [x] RAG system instruction synthesis with zero-hallucination grounding rules (`src/lib/ai/prompt.ts`).
- [x] Real document citations (`[Document.pdf · p. X]`) with interactive preview popovers (`CitationPopover.tsx`).
- [x] Streaming chat route handler with RAG retrieval (`POST /api/chat`).
- [x] PDF processing endpoint (`POST /api/rag/process`) and cascading deletion endpoint (`POST /api/rag/delete`).
- [x] Document upload modal with real upload progress and status states (`DocumentUploadModal.tsx`).
- [x] Document chip with real upload, processing, ready, and error states (`DocumentChip.tsx`).
- [x] Strict user isolation in Firestore and Storage security rules (`isOwner(userId)`).
- [x] 100% test pass on automated RAG unit and integration test suite.

---

### Phase 5: Real-Time Web Search + Grounded Web Answers (Completed)
- [x] Dedicated `GeminiWebSearchProvider` with official Google Search Grounding (`googleSearch` tool) (`src/lib/ai/gemini-web-search-provider.ts`).
- [x] Server-side grounding and search query generation via Google GenAI SDK.
- [x] Safe URL validation, protocol whitelisting (HTTPS only), XSS defense, and clean domain extraction (`src/lib/utils/url-validator.ts`).
- [x] Unified polymorphic citation model (`CitationSource`) supporting both document and web citations (`src/types/chat.ts`).
- [x] Grounding metadata normalization and deduplication into structured citations.
- [x] Web search grounding system directives preventing hallucinated URLs and filler phrases (`src/lib/ai/prompt.ts`).
- [x] Streaming search state indicators (*"Searching the web..."* $\rightarrow$ *"Reading sources..."*) (`src/app/api/chat/route.ts`).
- [x] Interactive inline citation popovers (`[1]`, `[2]`) with domain badge, quote snippet, and external link (`CitationPopover.tsx`).
- [x] Compact, accessible Source Cards grid rendered below grounded responses (`SourceCards.tsx`).
- [x] Web Search toggle in composer with accessible keyboard navigation and tooltips (`ChatComposer.tsx`).
- [x] Zero-overhead persistence: citations saved in Firestore alongside assistant messages without re-running search on reload (`useChat.ts`).
- [x] Architectural support for future Hybrid (PDF + Web Search) workflows.
- [x] 100% test pass on automated Web Search test suite (`scripts/test-web-search.mjs`).

---

### Phase 6: Long-Term Memory + Personalization System (Completed)
- [x] Controlled 8-category memory taxonomy (`profile`, `preference`, `goal`, `project`, `instruction`, `skill`, `interest`, `context`) (`src/types/memory.ts`).
- [x] Multi-pattern sensitive information & credential rejection filter rejecting API keys, passwords, payment cards, SSNs, and health PII (`src/lib/memory/sensitive-filter.ts`).
- [x] Intent recognition & heuristic pre-filter skipping trivial greetings and one-word turns (`src/lib/memory/memory-extractor.ts`).
- [x] Explicit memory command detector (`"Remember that..."`) and natural-language forget request parser (`"Forget that..."`).
- [x] Structured memory extraction using Gemini model (`gemini-3.6-flash` / `gemini-3.5-flash`).
- [x] Non-blocking asynchronous post-turn memory extraction pipeline (`/api/memory/extract`).
- [x] Semantic deduplication & conflict resolution engine updating outdated facts instead of creating duplicate records (`src/lib/memory/memory-service.ts`).
- [x] Memory capacity management (max 50 active memories) and confidence scoring threshold (0.7).
- [x] Selective relevance-based memory retrieval scoring token overlap and category baselines (`retrieveRelevantMemories`).
- [x] Sandboxed prompt injection placing verified memories in `<user_long_term_memories>` as background context (`src/lib/ai/prompt.ts`).
- [x] Full REST API route suite (`GET/POST/DELETE /api/memory`, `PATCH/DELETE /api/memory/[id]`, `GET/PUT /api/memory/settings`, `POST /api/memory/extract`).
- [x] Interactive client hook `useMemory` managing state, filters, searches, and optimistic updates (`src/hooks/useMemory.ts`).
- [x] Real Long-Term Memory Manager modal with search bar, category filter pills, inline editing, active toggle, and confirmation modal (`MemoryManagerModal.tsx`).
- [x] Subtle Spring-animated toast notification when memories are recorded (`MemoryToast.tsx`).
- [x] Dynamic active memory counter badge in Sidebar (`Sidebar.tsx`).
- [x] Granular Firestore security rules on `/users/{userId}/memories/{memoryId}` enforcing owner isolation and immutable `userId` (`firebase/firestore.rules`).
- [x] 100% test pass (44/44 tests) on comprehensive automated test suite (`scripts/test-memory.mjs`).
- [x] Complete architectural deep-dive specification (`docs/ai/MEMORY.md`).

---

### Phase 7: Multimodal AI + Image Understanding (Completed)
- [x] Centralized multimodal configuration (`MULTIMODAL_CONFIG`) with 10MB limit, 4 images per message, and 4 images in context (`src/config/multimodal.ts`).
- [x] Comprehensive file validation and magic byte inspector (`detectMimeFromBytes`) detecting JPEG, PNG, GIF, and WEBP signatures (`src/lib/multimodal/image-validator.ts`).
- [x] Multimodal image service orchestrating uploads, base64 data conversion, and dimension extraction (`src/lib/multimodal/image-service.ts`).
- [x] Gemini provider multimodal integration streaming inline image data parts (`inlineData`) alongside prompt text (`src/lib/ai/gemini-provider.ts`).
- [x] Multi-turn visual context retention enabling follow-up questions about previously uploaded images within conversation history (`formatMessages`).
- [x] Strict visual grounding prompt directives preventing hallucinated text, numbers, or unobserved details (`src/lib/ai/prompt.ts`).
- [x] Stream status updates (*"Analyzing image..."*) during multimodal processing (`src/app/api/chat/route.ts`).
- [x] Composer attachment menu with options for Image upload and PDF document upload (`ChatComposer.tsx`).
- [x] Image preview tray in composer with thumbnail cards, file size badges, and remove buttons (`ImageAttachmentPreview.tsx`).
- [x] Clipboard paste support (`Ctrl+V`) and drag-and-drop file target on chat composer.
- [x] Image-only prompt support without requiring text.
- [x] Responsive image thumbnail grid in user messages with click-to-lightbox preview (`UserMessage.tsx`).
- [x] Accessible image lightbox modal with zoom toggle, download button, and Esc key dismissal (`ImageLightbox.tsx`).
- [x] Firebase Storage security rules enforcing owner isolation on `/users/{userId}/images/{imageId}` (`firebase/storage.rules`).
- [x] Memory extraction visual sandboxing ensuring visual observations are never converted into unverified personal memories (`src/lib/memory/memory-extractor.ts`).
- [x] 100% test pass (33/33 tests) on automated multimodal test suite (`scripts/test-multimodal.mjs`).
- [x] Comprehensive architectural deep-dive specification (`docs/ai/MULTIMODAL.md`).

