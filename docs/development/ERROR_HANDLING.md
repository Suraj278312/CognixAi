# Unified Error Handling & Resilience Architecture — Cognix

**Document Version:** 1.0.0  
**Lead Systems Architect:** Lead Systems & AI Engineer  

---

## 1. Error Classification & Taxonomy

Cognix establishes a standardized error hierarchy to provide consistent, graceful error recovery for users:

| Error Domain | Code | Root Cause | User Experience / Fallback Action |
| :--- | :--- | :--- | :--- |
| **AI Generation** | `AI_RATE_LIMIT` | Gemini API 429 quota reached. | Automatic exponential backoff; displays inline retry button. |
| **AI Generation** | `AI_SAFETY_BLOCKED` | Query flagged by safety filters. | Shows friendly guidance: *"I cannot answer this query per safety guidelines."* |
| **Document Processing**| `DOC_INVALID_MIME` | Non-PDF file uploaded. | Toast error: *"Only PDF documents are supported at this time."* |
| **Document Processing**| `DOC_SIZE_EXCEEDED`| File exceeds 10MB limit. | Toast error: *"Document size exceeds the 10MB maximum limit."* |
| **Web Search** | `SEARCH_TIMEOUT` | Search API timed out (>4s). | Degrades gracefully; answers from Gemini base knowledge with disclaimer. |
| **Firebase Auth** | `AUTH_EXPIRED_TOKEN`| User session token expired. | Seamlessly refreshes token; prompts re-login if refresh fails. |
| **Firestore** | `PERMISSION_DENIED`| Unauthorized access attempt. | Logs security event; redirects user to safe dashboard. |
| **Network** | `NET_OFFLINE` | Client lost internet connection. | Displays floating banner: *"You are offline. Reconnecting..."* |

---

## 2. Server-Side Error Normalization Pattern

All serverless API routes wrap logic in a standard try/catch envelope returning typed JSON error responses:

```typescript
export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown;
    retryable: boolean;
  };
}

export function handleApiError(error: unknown): Response {
  console.error('[API_ERROR]', error);

  if (error instanceof GeminiRateLimitError) {
    return Response.json(
      { error: { code: 'AI_RATE_LIMIT', message: 'Model is currently busy. Retrying...', retryable: true } },
      { status: 429 }
    );
  }

  return Response.json(
    { error: { code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred.', retryable: false } },
    { status: 500 }
  );
}
```

---

## 3. Client-Side Error Boundaries & Toast System

- **React Error Boundary**: Wraps critical layout containers (`ChatCanvas`, `Sidebar`, `Modal`) to prevent unhandled React render errors from crashing the full page.
- **Actionable Retries**: Error cards render an explicit `[🔄 Try Again]` button allowing one-click retry of the failed turn.
