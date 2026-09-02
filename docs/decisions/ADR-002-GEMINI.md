# ADR-002: Selection of Google Gemini as Core AI Engine

**Status:** Accepted  
**Date:** 2026-08-31  
**Deciders:** Lead AI Engineer, Product Architect  

---

## Context & Problem Statement
Cognix requires a high-performance, cost-effective, and multimodal generative AI foundation model to power real-time streaming conversations, document comprehension (RAG), and background extraction tasks.

---

## Decision Drivers
- Ultra-low latency for streaming conversational chat (<1.2s TTFT).
- Massive context window (1M+ tokens) to support long conversation histories and document retrieval.
- First-class text embeddings model (`text-embedding-004`) for vector similarity.
- Native integration with Google Cloud and Firebase AI Logic.

---

## Considered Options
1. **Google Gemini (1.5 Flash / 1.5 Pro / text-embedding-004)** — *Selected*
2. **OpenAI (GPT-4o / GPT-4o-mini / text-embedding-3)**
3. **Anthropic Claude (Claude 3.5 Sonnet / Haiku)**

---

## Decision Outcome
**Chosen Option:** **Google Gemini**.  
Gemini 1.5 Flash provides the optimal blend of sub-second streaming speed, high reasoning fluency, and industry-leading context window capacity, while Gemini 1.5 Pro provides deep document comprehension for complex RAG tasks.

---

## Pros & Cons

### Pros
- Sub-second TTFT on Gemini 1.5 Flash.
- 1M+ token context window eliminates token truncation concerns for typical conversations.
- Unified SDK (`@google/genai`) for generation, embeddings, and multimodal processing.
- Direct alignment with Firebase AI Logic backend services.

### Cons
- API rate limits during peak usage (mitigated by exponential backoff and client retry mechanics).
