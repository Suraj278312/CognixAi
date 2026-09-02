# Real-Time Web Search & Grounded Answers — Cognix

**Document Version:** 1.0.0  
**AI Lead:** Senior AI Engineer & Systems Architect  
**Lifecycle Status:** Phase 5 Implemented & Verified  

---

## 1. Overview & Capability Architecture

Cognix provides real-time, factual, and web-grounded responses by integrating Google's official **Gemini Google Search Grounding** tool. When Web Search mode is active (or when answering questions regarding current events, recent software versions, latest AI models, or live prices), Cognix executes search grounding server-side, extracts verified citation metadata, and renders interactive inline citations and source cards.

```
┌────────────────────────────────────────────────────────┐
│               Web Search Grounding Architecture        │
└────────────────────────────────────────────────────────┘
                           │
             ┌─────────────▼─────────────┐
             │      User Question        │ ── "What is the latest Gemini model?"
             └─────────────┬─────────────┘
                           │
             ┌─────────────▼─────────────┐
             │  POST /api/chat (Server)  │ ── Authenticated with Firebase UID
             └─────────────┬─────────────┘
                           │
             ┌─────────────▼─────────────┐
             │ GeminiWebSearchProvider   │ ── tools: [{ googleSearch: {} }]
             └─────────────┬─────────────┘
                           │
             ┌─────────────▼─────────────┐
             │ Google Search Grounding   │ ── Model formulates search queries
             └─────────────┬─────────────┘
                           │
             ┌─────────────▼─────────────┐
             │ Streaming SSE Generation  │ ── Status events → Tokens → Citations
             └─────────────┬─────────────┘
                           │
             ┌─────────────▼─────────────┐
             │  Client Chat & UI Layer   │ ── Inline [1] badges + Compact SourceCards
             └─────────────┬─────────────┘
                           │
             ┌─────────────▼─────────────┐
             │  Firestore Persistence    │ ── Saved to /users/{uid}/conversations/...
             └───────────────────────────┘
```

---

## 2. Capability & Mode Decision Layer

Cognix decouples generation capabilities cleanly into specialized provider layers:

| Capability Mode | Trigger Condition | Execution Pipeline |
| :--- | :--- | :--- |
| **Normal Chat** | Web Search OFF, No PDFs | `GeminiProvider` with multi-turn context |
| **Web Search** | Web Search ON (`webSearchEnabled: true`) | `GeminiWebSearchProvider` with Google Search tool |
| **Document RAG** | Attached PDF Documents | `retrieveGroundedContext` + `<attached_document_context>` |
| **Hybrid Mode** | Attached PDF + Web Search ON | Semantic PDF Retrieval + Google Search Grounding Tool |

---

## 3. Gemini Google Search Grounding Implementation

### 3.1 Model Tool Configuration
Inside `src/lib/ai/gemini-web-search-provider.ts`:
```typescript
const model = this.genAI.getGenerativeModel({
  model: modelId,
  systemInstruction,
  tools: [{ googleSearch: {} } as any],
  generationConfig: {
    temperature: 0.7,
    maxOutputTokens: 2048,
  },
  safetySettings: [ ... ],
});
```

### 3.2 Streaming & Status Lifecycle
1. **Initial Search Dispatch**: Emits SSE event:
   ```json
   data: {"status": "Searching the web..."}
   ```
2. **Query Formulation**: When Gemini formulates `webSearchQueries` in `candidate.groundingMetadata`, emits:
   ```json
   data: {"status": "Reading sources..."}
   ```
3. **Token Streaming**: Response tokens stream in real-time.
4. **Citation Normalization**: Grounding chunks and supports are normalized to verified `CitationSource[]` and emitted before `[DONE]`.

---

## 4. Unified Citation & Source Card Architecture

### 4.1 Polymorphic `CitationSource` Data Model
```typescript
export type CitationType = 'document' | 'web';

export interface CitationSource {
  id: string;
  type: CitationType;
  title: string;
  // Web search citation properties
  url?: string;
  domain?: string;
  citedText?: string;
  startIndex?: number;
  endIndex?: number;
  searchQueries?: string[];
  // Document RAG citation properties
  documentId?: string;
  documentName?: string;
  pageNumber?: number;
  chunkId?: string;
  snippet?: string;
}
```

### 4.2 Safe URL Validation & Sanitization (`src/lib/utils/url-validator.ts`)
- **Protocol Whitelist**: Only `https:` (and `http:` in local dev) are allowed.
- **XSS Rejection**: `javascript:`, `data:`, `file:`, `vbscript:`, and `blob:` protocols are rejected.
- **Domain Extraction**: Automatically derives clean hostnames (e.g. `ai.google.dev`, `reuters.com`, `nytimes.com`) stripping redundant `www.` prefixes.

### 4.3 Compact Source Cards Component (`src/components/chat/SourceCards.tsx`)
- Renders below grounded responses as an accessible, compact grid.
- Features number badges (`1`, `2`), title, clean domain label, and secure external links (`target="_blank" rel="noopener noreferrer"`).

---

## 5. System Prompt Grounding Directives

When Web Search mode is active, the system prompt in `src/lib/ai/prompt.ts` instructs Gemini:

```text
WEB SEARCH GROUNDING DIRECTIVES:
1. Google Search grounding is active for this turn to provide accurate, up-to-date real-world information.
2. Factual claims requiring current knowledge (breaking news, current software versions, recent events, stock/crypto prices, latest AI developments) must be grounded in verified search sources.
3. Maintain a natural, articulate, conversational tone. Avoid beginning every sentence with "According to my search..." or "Search results indicate...".
4. Ground all factual assertions in real search sources. Never fabricate URLs, domain names, or fake references.
5. Cite your sources naturally using numbered reference brackets [1], [2] corresponding to the search sources.
6. If search results do not provide sufficient credible information, transparently acknowledge what is known and clarify uncertainty honestly.
```

---

## 6. Security, Privacy & Anti-Hallucination Guarantees

1. **Zero Secret Exposure**: `GEMINI_API_KEY` is loaded exclusively inside server Route Handlers (`src/app/api/chat/route.ts`).
2. **Server-Side Grounding**: Google Search execution is entirely mediated by Google's API on the server.
3. **Link Whitelisting**: Only URLs returned in official Google `groundingMetadata` are rendered. Model-invented markdown URLs are not converted to Source Cards without verification.
4. **Historical Immutability**: Historical messages restore stored citations from Firestore without re-running external searches.

---

## 7. Configuration Reference

| Parameter | Environment Variable | Default Value | Description |
| :--- | :--- | :--- | :--- |
| `defaultModel` | `NEXT_PUBLIC_DEFAULT_MODEL` | `gemini-1.5-flash` | Default Gemini model identifier. |
| `temperature` | `AI_TEMPERATURE` | `0.7` | Generation temperature. |
| `maxOutputTokens` | `AI_MAX_OUTPUT_TOKENS` | `2048` | Maximum output token generation cap. |

---

## 8. Known Limitations & Roadmap

- **Dynamic Search Thresholding**: Google Search grounding is triggered on request when Web Search toggle is ON. Auto-detection for un-toggled queries will be enhanced with heuristic classification in future updates.
- **Deep Research Mode**: Multi-step iterative research crawling is planned for advanced enterprise versions.
