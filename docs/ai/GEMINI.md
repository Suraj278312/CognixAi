# Google Gemini Integration Architecture & Specifications — Cognix

**Document Version:** 1.0.0  
**AI Lead:** Senior AI Engineer & Systems Architect  

---

## 1. Overview & Architecture Strategy

Cognix utilizes Google's **Gemini Foundation Models** via the Google Gen AI SDK (`@google/genai` or `@google/generative-ai`) and Firebase AI Logic. The architecture is deliberately designed with a **Provider Abstraction Layer** (`GeminiProvider`) so that model versions (e.g. `gemini-1.5-flash`, `gemini-1.5-pro`, or future variants) can be changed or upgraded through configuration without rewriting feature logic.

```text
┌────────────────────────────────────────────────────────┐
│               Cognix AI Layer (Client/Server)          │
└────────────────────────────────────────────────────────┘
                           │
             ┌─────────────▼─────────────┐
             │    AI Provider Interface   │
             │   (Model Abstraction Layer)│
             └─────────────┬─────────────┘
                           │
             ┌─────────────▼─────────────┐
             │       GeminiProvider      │
             └─────────────┬─────────────┘
                           │
     ┌─────────────────────┼─────────────────────┐
     ▼                     ▼                     ▼
Gemini 1.5 Flash      Gemini 1.5 Pro       Gemini Embeddings
(Fast Chat/Summaries) (Deep RAG / QA)      (Vector Embeddings)
```

---

## 2. Model Tiering & Allocation Strategy

| Use Case | Model Identifier | Rationale |
| :--- | :--- | :--- |
| **Standard Conversational Chat** | `gemini-3.6-flash` | Ultra-low latency (<1s TTFT), cost efficiency, high conversational fluency. |
| **Multimodal Vision & Image Understanding** | `gemini-3.6-flash` / `gemini-3.7-flash` | High-fidelity OCR, diagram reasoning, chart analytics, UI screenshot comprehension. |
| **Real-Time Web Search Grounding** | `gemini-3.6-flash` + `googleSearch` | Up-to-date real-world facts with verified inline citations and source metadata. |
| **Complex Document QA & RAG** | `gemini-3.6-flash` / `gemini-3.7-flash` | Exceptional long-context reasoning, complex document synthesis, high precision. |
| **Auto-Titling & Memory Extraction** | `gemini-3.6-flash` | Fast execution for background tasks with structured JSON output. |
| **Text Vectorization** | `gemini-embedding-2` | High semantic similarity accuracy for document chunk retrieval (768 dimensions). |

---

## 3. System Prompt Architecture

The system prompt is dynamically assembled on the server for each turn:

```typescript
export interface SystemPromptContext {
  userDisplayName?: string;
  userMemories?: string[];
  activeDocuments?: { title: string; relevantChunks: string[] }[];
  searchGroundingResults?: { title: string; url: string; snippet: string }[];
}

export function buildSystemInstruction(context: SystemPromptContext): string {
  return `
You are Cognix, an intelligent, calm, friendly, and highly capable AI assistant.
Your goal is to provide accurate, well-structured, and helpful assistance.

BEHAVIORAL PRINCIPLES:
1. Tone: Professional, warm, articulate, and concise. Avoid patronizing filler phrases.
2. Formatting: Use GitHub-flavored Markdown. Format code blocks with language identifiers. Use LaTeX for mathematical expressions ($...$ or $$...$$).
3. Grounding & Citations:
   - When answering from attached documents, cite specific page numbers and document titles.
   - When answering from web search results, include explicit numbered citations (e.g., [1]) corresponding to the provided sources. Never fabricate URLs or sources.
4. Memory & Personalization:
   - Discreetly adapt your response to the user's remembered preferences without explicitly announcing that you are using memory unless relevant.

${context.userMemories && context.userMemories.length > 0 ? `
<user_long_term_memories>
${context.userMemories.map(m => `- ${m}`).join('\n')}
</user_long_term_memories>
` : ''}

${context.activeDocuments && context.activeDocuments.length > 0 ? `
<attached_document_context>
${context.activeDocuments.map(doc => `Document: ${doc.title}\n${doc.relevantChunks.join('\n---\n')}`).join('\n\n')}
</attached_document_context>
` : ''}

${context.searchGroundingResults && context.searchGroundingResults.length > 0 ? `
<grounded_web_search_results>
${context.searchGroundingResults.map((r, i) => `[${i + 1}] ${r.title} (${r.url}):\n${r.snippet}`).join('\n\n')}
</grounded_web_search_results>
` : ''}
`.trim();
}
```

---

## 4. Streaming Mechanics & Server-Sent Events (SSE)

### 4.1 Route Handler Streaming Implementation Pattern
```typescript
// src/app/api/chat/route.ts
import { GoogleGenAI } from '@google/genai';

export async function POST(req: Request) {
  const { messages, context } = await req.json();
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const systemInstruction = buildSystemInstruction(context);
  const responseStream = await ai.models.generateContentStream({
    model: 'gemini-1.5-flash',
    contents: messages,
    config: {
      systemInstruction,
      temperature: 0.7,
      maxOutputTokens: 2048,
    }
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of responseStream) {
        const text = chunk.text();
        if (text) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
        }
      }
      controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      controller.close();
    }
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    }
  });
}
```

---

## 5. Token Context Trimming & Budgeting

To maintain sub-second response times and prevent exceeding API rate limits:
1. **Sliding Context Window**: The server maintains a token counter and retains the most recent 10-15 message turns.
2. **Context Compression**: For extensive conversation threads, older turns are summarized into a concise episodic synopsis prepended to the active message array.

---

## 6. Safety Filters & Content Moderation

Gemini safety thresholds are configured on the server:
```typescript
safetySettings: [
  { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
  { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
  { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
  { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }
]
```
If a response is flagged or blocked, the API route returns a friendly semantic error: `"I am unable to generate a response for this request in accordance with safety guidelines."`
