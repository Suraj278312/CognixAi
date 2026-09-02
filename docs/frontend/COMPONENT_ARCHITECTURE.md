# Frontend Component Architecture & State Modeling — Cognix

**Document Version:** 1.0.0  
**Frontend Lead:** Senior Frontend Architect  

---

## 1. Layout & Component Hierarchy

Cognix follows a modular, feature-oriented component architecture:

```text
RootLayout (src/app/layout.tsx)
├── ThemeProvider (Dark / Light Context)
├── AuthProvider (User Session State)
└── ToastProvider (Notifications & Memory Alerts)
    └── DashboardLayout (src/app/(dashboard)/layout.tsx)
        ├── Sidebar (Collapsible Conversation Tree)
        │   ├── NewChatButton
        │   ├── ConversationSearchInput
        │   ├── ConversationList (Grouped by Today, Yesterday, Previous 7 Days)
        │   └── UserProfileDropdown
        │
        └── MainContentArea (src/app/(dashboard)/chat/page.tsx)
            ├── ChatHeader (Model Selector Badge, Web Search Toggle, Memory Indicator)
            ├── ChatCanvas / MessageList (Virtual or Scrollable Stream Container)
            │   ├── EmptyStateHero (Welcome Banner + Starter Prompt Cards)
            │   ├── UserMessageItem (Message Card + Timestamp)
            │   └── AssistantMessageItem (Markdown Streamer, LaTeX Renderer, CodeBlocks, Citations)
            │
            └── CommandBar / ChatInputArea (Sticky Floating Input)
                ├── DocumentAttachmentPillList (Active PDF Chips)
                ├── MultilineTextarea (Auto-resizing text area)
                ├── FileUploadButton (PDF Attachment trigger)
                ├── WebSearchToggleButton (Live search toggle)
                └── SendButton / StopStreamButton
```

---

## 2. Shared UI Primitives (`src/components/ui/`)

| Component | Responsibility | Key Props |
| :--- | :--- | :--- |
| `Button` | Accessible button with variants (`primary`, `secondary`, `ghost`, `danger`) and loading spinner state. | `variant`, `size`, `isLoading`, `icon`, `onClick` |
| `Input` | Text input with built-in label, validation error message, and prefix/suffix icons. | `label`, `error`, `icon`, `type`, `value`, `onChange` |
| `Modal` | Accessible dialog with backdrop blur, trap focus, and smooth scale entrance animation. | `isOpen`, `onClose`, `title`, `children` |
| `Dropdown` | Popover menu for action items (e.g. Rename, Delete thread, User Profile). | `trigger`, `items`, `placement` |
| `MarkdownRenderer` | High-performance Markdown parser rendering headings, lists, tables, blockquotes, and LaTeX. | `content`, `isStreaming` |
| `CodeBlock` | Syntax highlighted code container with language badge, line numbers, and copy button. | `code`, `language` |
| `CitationBadge` | Interactive citation pill (`[1]`) with hover popover preview and external link. | `index`, `source` |
| `DocumentChip` | Pill badge displaying attached PDF filename, size, processing status, and remove button. | `document`, `onRemove` |

---

## 3. State Management Architecture

Cognix utilizes a blend of **React Context Providers** for global app concerns and **Custom Hooks** for localized feature logic:

```text
┌────────────────────────────────────────────────────────┐
│                   GLOBAL CONTEXT LAYER                 │
├───────────────────┬────────────────────────────────────┤
│ AuthContext       │ User profile, auth status, logout  │
│ ThemeContext      │ Dark / Light / System mode switcher│
│ ToastContext      │ Global toasts & memory alerts      │
└───────────────────┴────────────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────┐
│                    FEATURE HOOKS LAYER                 │
├───────────────────┬────────────────────────────────────┤
│ useChatStream     │ Handles SSE stream, token buffering│
│ useConversations  │ Firestore real-time thread queries │
│ useDocumentUpload │ Upload progress, PDF validation    │
│ useMemories       │ Memory CRUD and real-time listeners│
└───────────────────┴────────────────────────────────────┘
```

---

## 4. Performance & Virtualization Rules

1. **Virtual Scrolling**: Message threads with $>50$ messages employ windowed list rendering to prevent DOM bloat.
2. **Memoized Markdown**: `MarkdownRenderer` uses React `memo` and selective token parsing during active streaming to prevent full-tree re-renders on every incoming character chunk.
3. **Dynamic Imports**: Heavy components like PDF Previewers or Code Highlighters are lazy-loaded via `next/dynamic` to keep initial bundle sizes minimal.
