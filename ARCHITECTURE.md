# System Architecture Specification — Cognix

**Document Version:** 1.0.0  
**Lead Software Architect:** Lead AI Engineer & Software Architect  
**Target Platform:** Next.js (App Router), TypeScript, Firebase, Google Gemini  

---

## 1. High-Level System Architecture

Cognix utilizes a hybrid architecture pairing a high-performance **Next.js Web Application** with **Firebase Serverless Cloud Services** and the **Google Gemini Generative AI Platform**.

```mermaid
flowchart TB
    subgraph ClientLayer [Client Layer - Next.js React 18/19]
        UI[Chat / Document / Memory UI]
        State[Context / Hooks State Layer]
        ClientFirebase[Firebase Client SDK]
    end

    subgraph EdgeServerLayer [Next.js API & Route Handlers]
        AuthGuard[Auth Token & App Check Guard]
        PromptEngine[Prompt & Context Synthesizer]
        RAGProcessor[PDF Chunking & Search Engine]
        MemoryExtractor[Memory Synthesis Engine]
    end

    subgraph FirebaseCloud [Firebase Managed Services]
        FirebaseAuth[Firebase Auth]
        Firestore[(Cloud Firestore NoSQL)]
        CloudStorage[(Firebase Cloud Storage)]
        AppCheck[Firebase App Check]
    end

    subgraph ExternalAI [AI & Intelligence Layer]
        GeminiAPI[Google Gemini 1.5 Flash / Pro API]
        EmbeddingsAPI[Gemini Text Embeddings API]
        WebSearchAPI[Web Search Engine API]
    end

    %% Client Connections
    UI --> State
    State --> ClientFirebase
    ClientFirebase --> FirebaseAuth
    ClientFirebase --> Firestore
    ClientFirebase --> CloudStorage
    UI -->|Server-Sent Events / POST Stream| EdgeServerLayer

    %% Server Middleware & Backend Connections
    EdgeServerLayer --> AuthGuard
    AuthGuard --> AppCheck
    PromptEngine --> ExternalAI
    RAGProcessor --> EmbeddingsAPI
    PromptEngine --> WebSearchAPI
    MemoryExtractor --> Firestore
```

---

## 2. Frontend Architectural Layers

### 2.1 Architecture Strategy
- **Framework**: Next.js 14+ App Router.
- **Rendering Strategy**: React Server Components (RSC) for initial shell, layout, and static landing components; Client Components (`"use client"`) for stateful chat sessions, streaming message loops, and drag-and-drop file uploaders.
- **State Management**:
  - `AuthContext`: Tracks authenticated user profile, token lifecycle, and session state.
  - `ChatContext`: Manages active conversation thread, message buffer, streaming tokens, and generation abort controllers (`AbortController`).
  - `DocumentContext`: Manages uploaded PDF metadata, parsing progress, and active document focus.
  - `MemoryContext`: Manages long-term memory list, real-time Firestore sync, and toggle states.

### 2.2 Feature-Driven Codebase Organization
```text
src/
├── app/                        # Next.js App Router (pages & endpoints)
│   ├── (auth)/login/           # Login / Signup routes
│   ├── (dashboard)/chat/       # Active chat & conversation views
│   ├── api/chat/route.ts       # Streaming Gemini proxy & RAG pipeline
│   ├── api/rag/route.ts        # PDF parsing and embedding endpoint
│   ├── api/search/route.ts     # Web search retrieval endpoint
│   └── layout.tsx              # Root layout with theme & auth providers
├── components/                 # Shared atomic UI primitives (Buttons, Modals, Inputs)
├── features/                   # Encapsulated domain feature modules
│   ├── auth/                   # Auth forms, Google OAuth button
│   ├── chat/                   # MessageList, MessageItem, ChatInput, CodeBlock
│   ├── documents/              # DocUploader, DocList, PDFPreviewModal
│   ├── memory/                 # MemoryManager, MemoryItemCard, MemoryToggle
│   └── web-search/             # SearchToggle, SourceCitationPopover
├── lib/                        # Infrastructure and third-party SDK clients
│   ├── firebase/               # Client SDK initialization & Firestore helpers
│   ├── gemini/                 # Gemini API client, system prompts, token counters
│   └── utils/                  # String helpers, date formatters, math renderers
├── hooks/                      # Custom hooks (useChatStream, useFirestoreQuery)
└── types/                      # TypeScript definitions (schema, models, API contracts)
```

---

## 3. Backend & API Route Architecture

To maintain strict zero-trust security, **all LLM interactions and search queries route through server-side Route Handlers** (`src/app/api/*`). The client never accesses the raw Gemini API key directly.

```text
POST /api/chat
Headers:
  Authorization: Bearer <Firebase_ID_Token>
  X-Firebase-AppCheck: <AppCheck_Token>
Body:
  {
    conversationId: string,
    message: string,
    documentIds?: string[],
    webSearchEnabled?: boolean
  }
Response:
  ReadableStream (Server-Sent Events: text/event-stream)
```

---

## 4. Detailed Data Flows & Sequence Diagrams

### 4.1 Authentication Flow
```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Client as Next.js Client
    participant Auth as Firebase Auth
    participant Firestore as Cloud Firestore

    User->>Client: Clicks "Sign in with Google"
    Client->>Auth: signInWithPopup(GoogleAuthProvider)
    Auth-->>Client: UserCredential + ID Token (JWT)
    Client->>Firestore: Check/Create /users/{uid} document
    Firestore-->>Client: User Profile Synced
    Client-->>User: Redirect to /chat (Dashboard)
```

---

### 4.2 Streaming Chat Data Flow
```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Client as Next.js Client
    participant API as /api/chat Route Handler
    participant Firestore as Cloud Firestore
    participant Gemini as Google Gemini API

    User->>Client: Submits message: "Explain async/await"
    Client->>Firestore: Optimistically save User Message in /messages
    Client->>API: POST /api/chat (stream request + User JWT)
    API->>API: Verify ID Token & Rate Limits
    API->>Firestore: Fetch last 10 messages (Episodic Context)
    API->>Firestore: Fetch relevant user memories
    API->>API: Construct System Prompt + Injected Context
    API->>Gemini: streamGenerateContent(promptContext)
    Gemini-->>API: Stream Chunks (SSE)
    API-->>Client: Stream SSE Events (Token Chunks)
    Client-->>User: Render real-time token stream via Markdown parser
    Gemini-->>API: Stream Complete
    API->>Firestore: Persist Completed Assistant Message
    API-->>Client: [DONE] Event + Message ID
```

---

### 4.3 Document Intelligence (RAG) Pipeline
```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Client as Next.js Client
    participant Storage as Firebase Cloud Storage
    participant API as /api/rag/process
    participant Embeddings as Gemini Embeddings API (gemini-embedding-2)
    participant Firestore as Cloud Firestore

    User->>Client: Drops PDF (e.g. "Research.pdf", 4MB)
    Client->>Storage: Upload to users/{uid}/documents/{docId}/Research.pdf
    Storage-->>Client: Upload complete (UploadTask progress 0% -> 100%)
    Client->>API: POST /api/rag/process {docId, storagePath, file}
    API->>API: Extract Text per Page -> Structure-Aware Chunking (800 chars, 150 overlap)
    API->>Embeddings: Generate text embeddings for chunks (gemini-embedding-2, 768 dims)
    Embeddings-->>API: 768-dimensional vector arrays returned
    API->>Firestore: Store chunks & vector metadata in /users/{uid}/documents/{docId}/chunks
    API-->>Client: Document Status: Ready / Indexed
```

---

### 4.4 Long-Term Memory Synthesis & Retrieval
```mermaid
sequenceDiagram
    autonumber
    participant Engine as Next.js Background Task
    participant Gemini as Gemini Mini / Flash
    participant Firestore as Cloud Firestore

    Note over Engine: Triggers on completed chat turn
    Engine->>Gemini: "Extract personal facts or preferences from: [Message]"
    Gemini-->>Engine: JSON: { hasMemory: true, memory: "Prefers concise Python code" }
    Engine->>Firestore: Check existing memories for duplicates
    alt Not Duplicate
        Engine->>Firestore: Create /users/{uid}/memories/{memoryId}
        Engine-->>Engine: Broadcast toast to client UI
    end
```

---

### 4.5 Grounded Web Search Flow (Gemini Google Search Grounding)
```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Client as Next.js Client
    participant API as /api/chat (Web Search Mode)
    participant Provider as GeminiWebSearchProvider
    participant Gemini as Google Gemini API (googleSearch tool)
    participant Firestore as Cloud Firestore

    User->>Client: "What are the latest developments in Gemini models?" (Web Search ON)
    Client->>API: POST /api/chat {messages, webSearchEnabled: true}
    API->>Provider: generateSearchStream(messages, options)
    Provider-->>API: Status Event: "Searching the web..."
    API-->>Client: SSE Status Event -> Render subtle pulsating search indicator
    Provider->>Gemini: generateContentStream({tools: [{googleSearch: {}}]})
    Gemini-->>Provider: Formulates webSearchQueries -> Status: "Reading sources..."
    API-->>Client: SSE Status Event -> "Reading sources..."
    Gemini-->>Provider: Stream Content Tokens + GroundingMetadata
    Provider-->>API: Stream Text Chunks
    API-->>Client: SSE Text Tokens (rendered in real-time)
    Gemini-->>Provider: Grounding chunks & support ranges
    Provider->>Provider: Validate URLs (HTTPS only, XSS protection, clean domain extraction)
    Provider-->>API: Emit CitationSource[] (type: 'web')
    API-->>Client: SSE Citations Event -> Renders inline [1],[2] & SourceCards
    API->>Firestore: Persist Message with structured citations (Zero-overhead reload)
```

---

## 5. Security Boundaries & Zero-Trust Architecture

| Boundary | Enforcement Mechanism | Failure Action |
| :--- | :--- | :--- |
| **API Key Protection** | Gemini and Search API keys loaded solely in Node.js server environment (`process.env.GEMINI_API_KEY`). | Keys never shipped in client bundle. |
| **User Data Isolation** | Firestore & Storage security rules validate `request.auth.uid == resource.data.userId`. | `PERMISSION_DENIED` (403) returned if attempting cross-user reads/writes. |
| **Client Attestation** | Firebase App Check with reCAPTCHA Enterprise / Play Integrity. | Rejects automated bots and unofficial client requests. |
| **File Validation** | Magic number / MIME type verification on upload; 10MB size limit cap. | Immediate reject with `INVALID_FILE_TYPE`. |
| **Prompt Sanitization** | Strict delimiter isolation between user instructions and external retrieved content to prevent prompt injection. | Grounding sandboxing applied. |

---

## 6. Scalability & Performance Strategy

1. **Context Trimming**: Smart sliding window keeps only the last $N$ turns in the immediate prompt, preventing token bloat and reducing API latency.
2. **Stream Direct-Piping**: Responses from Gemini are piped as raw Node `ReadableStream` chunks directly into standard Web Streams to avoid buffering large texts in server memory.
3. **Database Indexing**: Compound Firestore indexes pre-defined for querying chat messages ordered by `createdAt DESC` filtered by `conversationId`.
