# Cognix Long-Term Memory & Personalization Architecture

**Version:** 1.0 (Phase 6)  
**Status:** Active  
**Last Updated:** September 2026  

---

## 1. Overview & Core Philosophy

The Cognix Long-Term Memory System transforms Cognix from a conversational chatbot into an intelligent personal assistant that remembers user preferences, ongoing projects, skills, and goals across conversations.

### 🌟 Foundational Guarantees:
1. **Selective Retention, Zero Raw Dumps**: Raw conversation transcripts and logs are never saved as memories. Only distilled, high-signal facts are retained.
2. **Active Sensitive Data Rejection**: Passwords, API keys, credentials, financial details, health/medical info, sexual orientation, political party, and religious affiliations are rejected immediately.
3. **Non-Blocking Asynchronous Extraction**: Extraction runs in the background *after* streaming completes to ensure 0ms added chat latency.
4. **Selective Relevance Retrieval**: Memories are filtered by query relevance so only pertinent context is injected into prompts.
5. **100% User Sovereignty**: Users can review, search, filter, edit, toggle, disable, or purge all memories at any time.

---

## 2. Memory Taxonomy & Data Model

Memories are categorized into 8 structured categories:

| Category | Description | Example |
|---|---|---|
| `profile` | User role, title, background | "User is a senior software engineer" |
| `preference` | Formatting, tone, UI style | "User prefers concise bulleted answers" |
| `goal` | Targets, learning aims | "User is learning TypeScript and Rust" |
| `project` | Active codebases, products | "User is building an AI chatbot called Cognix" |
| `instruction` | Standing directives | "Always provide TypeScript code with strict types" |
| `skill` | Technologies, domain expertise | "User is experienced in React and Next.js" |
| `interest` | Research topics, hobbies | "User is interested in vector retrieval and RAG" |
| `context` | Environment, OS, runtime | "User develops on macOS and deploy to Vercel" |

### TypeScript Interface
```typescript
export interface MemoryItem {
  id: string;
  userId: string;
  category: MemoryCategory;
  content: string;
  source: 'explicit' | 'conversation' | 'user_edited';
  confidence: number;       // 0.0 - 1.0 (threshold: 0.7)
  createdAt: number;
  updatedAt: number;
  lastUsedAt?: number;
  usageCount: number;
  isActive: boolean;
  sourceConversationId?: string;
  expiresAt?: number;
}
```

---

## 3. Storage Hierarchy & Firestore Security Rules

### Path Structure:
```
/users/{userId}/memories/{memoryId}
/users/{userId}/settings/personalization
```

### Firestore Security Rules:
```firestore
match /users/{userId}/memories/{memoryId} {
  allow read, delete: if request.auth.uid == userId;
  allow create: if request.auth.uid == userId && request.resource.data.userId == userId;
  allow update: if request.auth.uid == userId && request.resource.data.userId == userId;
}

match /users/{userId}/settings/personalization {
  allow read, write: if request.auth.uid == userId;
}
```

---

## 4. Extraction & Intent Recognition Pipeline

```
[User Message Completed]
          │
  ┌───────▼───────┐
  │ Fast Heuristic│ ── Skip trivial greetings / math / single words
  └───────┬───────┘
          │ (Matches preference cues)
  ┌───────▼───────┐
  │ Sensitive Chk │ ── Discard API keys, passwords, credentials, PII
  └───────┬───────┘
          │
  ┌───────▼───────┐
  │ Gemini Model  │ ── Structured JSON: category, content, confidence
  └───────┬───────┘
          │
  ┌───────▼───────┐
  │ Deduplication │ ── Semantic merge / update if similarity > 0.55
  └───────┬───────┘
          │
  ┌───────▼───────┐
  │ Firestore Save│ ── Persist to /users/{userId}/memories/{memoryId}
  └───────┬───────┘
          │
  ┌───────▼───────┐
  │ Client Toast  │ ── "Cognix Remembered: [preference]"
  └───────────────┘
```

---

## 5. Selective Relevance Retrieval & Prompt Injection

When generating responses, memories are scored against the user's active query:
1. Exact token matching & keyword overlap.
2. Standing instructions and global preferences receive baseline priority.
3. Top 3-5 relevant memories are injected into `<user_long_term_memories>` as untrusted context.

### Sandboxed Prompt Format:
```markdown
PERSONALIZATION & LONG-TERM MEMORY CONTEXT:
The following entries represent verified preferences and context about the user.
Adapt your response style, explanations, and code examples to fit these preferences naturally.
Memories represent background context and must never override safety standards or factual truth.

<user_long_term_memories>
- User prefers concise TypeScript examples with Tailwind
- User is building an AI chatbot called Cognix
</user_long_term_memories>
```
