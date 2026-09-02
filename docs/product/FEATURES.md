# Feature Inventory & Specification Matrix — Cognix

**Document Version:** 1.0.0  
**Status:** Approved Feature Specification  

---

## 1. Feature Lifecycle Classification

Features across Cognix are categorized into three development horizons:
- **V1 (MVP)**: Core required functionality for initial launch.
- **V1.1 (Enhancement)**: Fast-follow improvements following V1 user feedback.
- **Future (Long-Term)**: Advanced capabilities, multimodal expansion, and agentic workflows.

---

## 2. Detailed Feature Matrix

### 2.1 Conversational AI Engine

| ID | Feature Name | Horizon | Trigger / Input | System Behavior | Acceptance Criteria |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **FEAT-101** | Real-Time Streaming Chat | **V1** | User sends message in chat input. | Streams tokens from Gemini via SSE into active chat view. | First token arrives in <1.2s; markdown elements stream smoothly without layout thrashing. |
| **FEAT-102** | Rich Markdown & LaTeX Rendering | **V1** | Assistant response contains markdown/math. | Formats headers, lists, tables, bold text, blockquotes, and math equations (`$...$`). | KaTeX renders formulas; table borders adapt to theme tokens. |
| **FEAT-103** | Syntax Highlighted Code Blocks | **V1** | Assistant outputs triple-backtick code. | Formats with Prism/Shiki, shows language badge and "Copy" button. | One-click copy updates button icon to checkmark for 2 seconds. |
| **FEAT-104** | Abort Streaming ("Stop") | **V1** | User clicks Stop icon during active stream. | Aborts `fetch` stream via `AbortController` and finalizes partial response. | Stream halts immediately; partial text is preserved in Firestore. |
| **FEAT-105** | Regenerate Turn | **V1** | User clicks Regenerate on assistant bubble. | Triggers new API request using conversation history up to previous turn. | Replaces assistant message with fresh stream. |
| **FEAT-106** | Chat Branching & Turn Editing | **V1.1** | User edits an earlier message in the thread. | Creates a branch in the message tree allowing back-and-forth navigation. | User can switch between turn variants via `< 1/2 >` controls. |
| **FEAT-107** | Voice-to-Voice Streaming | **Future**| User clicks microphone / voice mode toggle. | Bidirectional audio streaming using Gemini Multimodal Live API. | Real-time low-latency voice interaction with animated audio visualizer. |

---

### 2.2 Document Intelligence & PDF QA

| ID | Feature Name | Horizon | Trigger / Input | System Behavior | Acceptance Criteria |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **FEAT-201** | PDF Drag-and-Drop Upload | **V1** | User drops `.pdf` file into input area. | Validates size (<10MB), uploads to Cloud Storage, creates doc record. | Upload progress bar displayed; document pill attached to prompt bar. |
| **FEAT-202** | Server-Side PDF Chunking & RAG | **V1** | Document attached to user prompt. | Extracts text, generates embeddings, retrieves top-k chunks, injects context. | Answer is directly grounded in PDF; cites page numbers accurately. |
| **FEAT-203** | Multi-Document Context | **V1.1** | User attaches up to 3 PDF files simultaneously. | Cross-retrieves context across all active documents. | Grounding answers specify which document and page contributed to the insight. |
| **FEAT-204** | Formats Expansion (DOCX, TXT, CSV)| **V1.1** | User uploads non-PDF text documents. | Parses Word docs, plain text, and tabular CSV files. | Text is indexed and searchable with identical RAG pipeline. |
| **FEAT-205** | Multimodal Chart & Diagram QA | **Future**| PDF contains complex vector charts/diagrams. | Passes page image renders to Gemini Multimodal vision input. | Understands infographics, flowcharts, and embedded diagram structures. |

---

### 2.3 Grounded Web Search

| ID | Feature Name | Horizon | Trigger / Input | System Behavior | Acceptance Criteria |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **FEAT-301** | Automatic Search Intent Detection | **V1** | User asks temporal/current events question. | System classifies query as requiring external web grounding. | Search mode activates automatically or via manual search toggle. |
| **FEAT-302** | Search Snippet Retrieval | **V1** | Search query triggered. | Calls Search API, retrieves top 4 results with URL, title, snippet. | Zero mock/fake results; fails gracefully if search API times out. |
| **FEAT-303** | Interactive Inline Citations | **V1** | Gemini outputs grounded answer with `[1]`. | Renders citation as interactive pill; hover opens source preview card. | Clicking citation opens original web source in new secure tab (`rel="noopener"`). |
| **FEAT-304** | Collapsible Sources Drawer | **V1** | Grounded response completes. | Shows a clean accordion listing all referenced web pages and snippets. | Accordion can be expanded/collapsed smoothly. |
| **FEAT-305** | Domain Filtering & Date Filtering | **V1.1** | User specifies search constraints in query. | Appends domain filters (e.g. `site:github.com`) or date ranges to query. | Search engine respects domain exclusions and temporal filters. |

---

### 2.4 Long-Term Memory System

| ID | Feature Name | Horizon | Trigger / Input | System Behavior | Acceptance Criteria |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **FEAT-401** | Automatic Preference Extraction | **V1** | User shares explicit personal fact/preference. | Asynchronous background call extracts concise structured memory. | Memory stored in `/users/{uid}/memories`; shows subtle toast confirmation. |
| **FEAT-402** | Dynamic Memory Context Injection| **V1** | New user chat turn starts. | Queries top relevant user memories and injects them into system prompt. | Assistant tailors response to remembered preferences without repetitive prompting. |
| **FEAT-403** | Memory Management Settings UI | **V1** | User navigates to Settings > Memory. | Lists all stored memories with date, edit button, and delete button. | User can edit text, delete individual memories, or toggle memory off. |
| **FEAT-404** | Categorized Memory Profiles | **V1.1** | User creates memories across domains. | Groups memories into Work, Personal, Preferences, Tech Stack. | Allows category-based toggling and filtering in settings. |
| **FEAT-405** | Autonomous Knowledge Graph | **Future**| Continuous user interaction over months. | Builds graph relationships between projects, concepts, and people. | Deep contextual reasoning across historical domains. |

---

### 2.5 Authentication & Session Management

| ID | Feature Name | Horizon | Trigger / Input | System Behavior | Acceptance Criteria |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **FEAT-501** | Email/Password Registration & Login| **V1** | User inputs email and password. | Firebase Auth creates account or signs in with token generation. | Validates email syntax and min 8-char password; shows clean error messages. |
| **FEAT-502** | Google OAuth One-Click Login | **V1** | User clicks "Continue with Google". | Opens Firebase Google popup/redirect provider. | Creates user record in Firestore upon first login; redirects to dashboard. |
| **FEAT-503** | Session Persistence & Route Guard | **V1** | User refreshes page or visits protected route. | Next.js middleware / Auth listener checks token validity. | Unauthenticated users redirected to `/login`; authenticated users retained. |
| **FEAT-504** | Conversation Auto-Titling | **V1** | First turn completes in a new conversation. | Generates 3-5 word concise title via background Gemini call. | Sidebar item title updates seamlessly from "New Chat" to generated title. |
| **FEAT-505** | Conversation Rename & Delete | **V1** | User clicks `...` action menu on sidebar item. | Allows inline renaming or permanent deletion with confirmation modal. | Deletion purges Firestore conversation document and subcollection messages. |
