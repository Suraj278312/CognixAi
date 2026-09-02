# Security, Privacy & Compliance Blueprint — Cognix

**Document Version:** 1.0.0  
**Security Lead:** Lead Security Architect & Systems Engineer  
**Policy Status:** Mandatory Engineering Standard  

---

## 1. Zero-Trust Security Philosophy

Cognix operates under a strict **Zero-Trust Architecture**. No client-side request is assumed to be safe, authenticated, or untampered. All external AI calls, document processing pipelines, and search operations must pass through authenticated and validated server-side boundaries.

---

## 2. API Key & Secret Management

### 2.1 Separation of Client and Server Variables
- **Public Client Variables**: Only parameters explicitly required by the Firebase Client SDK (API Key, Project ID, App ID) may use the `NEXT_PUBLIC_` prefix. These values are public by design and are protected by Firebase Security Rules and App Check.
- **Sensitive Server Secrets**: All API keys for Google Gemini (`GEMINI_API_KEY`), Search Providers (`SEARCH_API_KEY`), and Firebase Admin Private Keys (`FIREBASE_ADMIN_PRIVATE_KEY`) **must never be prefixed with `NEXT_PUBLIC_`** and must only be accessed inside server-side Route Handlers or Server Actions.

```text
CLIENT BUNDLE (Public)                     SERVER ENVIRONMENT (Protected)
├── NEXT_PUBLIC_FIREBASE_API_KEY           ├── GEMINI_API_KEY
├── NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN       ├── FIREBASE_ADMIN_CLIENT_EMAIL
└── NEXT_PUBLIC_FIREBASE_PROJECT_ID        ├── FIREBASE_ADMIN_PRIVATE_KEY
                                           └── SEARCH_API_KEY
```

---

## 3. Firebase Security Rules & Data Isolation

### 3.1 Firestore Security Principles
Every document in Firestore belongs to a specific user. Rules strictly enforce that users can only read, create, update, or delete their own data:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to verify authentication
    function isAuthenticated() {
      return request.auth != null && request.auth.uid != null;
    }

    // Helper function to verify ownership
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    // User profiles
    match /users/{userId} {
      allow read, write: if isOwner(userId);
    }

    // Conversations
    match /conversations/{conversationId} {
      allow read, update, delete: if isOwner(resource.data.userId);
      allow create: if isOwner(request.resource.data.userId);

      // Subcollection: Messages
      match /messages/{messageId} {
        allow read, write: if isAuthenticated() && 
          request.auth.uid == get(/databases/$(database)/documents/conversations/$(conversationId)).data.userId;
      }
    }

    // Long-Term Memories
    match /users/{userId}/memories/{memoryId} {
      allow read, write: if isOwner(userId);
    }

    // User Documents & Vector Chunks (PDF RAG)
    match /users/{userId}/documents/{documentId} {
      allow read, write: if isOwner(userId);

      match /chunks/{chunkId} {
        allow read, write: if isOwner(userId);
      }
    }
  }
}
```

### 3.2 Firebase Cloud Storage Security Principles
Uploaded files are stored under user-specific path segments (`users/{userId}/documents/{documentId}/{filename}`). Storage rules enforce:
- User isolation: Only the file owner may access or write the file.
- File size caps: Maximum file size is strictly 10MB (`10 * 1024 * 1024` bytes).
- MIME whitelist: Only `application/pdf` is permitted for document uploads in V1.

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/documents/{documentId}/{fileName} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null 
        && request.auth.uid == userId
        && request.resource.size < 10 * 1024 * 1024
        && request.resource.contentType.matches('application/pdf');
      allow delete: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## 4. Firebase App Check

Cognix leverages **Firebase App Check** to attest that requests originate from authentic Cognix application clients rather than automated scripts, scrapers, or rogue API callers:
- **Web Providers**: reCAPTCHA Enterprise / reCAPTCHA v3.
- **Enforcement**: Applied to Cloud Firestore, Cloud Storage, and Next.js Route Handlers via custom token verification headers (`X-Firebase-AppCheck`).

---

## 5. File Upload & Web Search Validation

### 5.1 PDF Upload Validation & Sanitization
To prevent malicious payload execution or server storage abuse:
1. **Client-Side Pre-Check**: Verify file size (< 10MB) and file extension (`.pdf`).
2. **Server-Side MIME & Magic Number Verification**: Inspect the first 4 bytes of uploaded files for the `%PDF-` magic header before parsing.
3. **Path Traversal Protection**: Filenames are hashed or sanitized to remove directory traversal characters (`../`, `\`, null bytes) before storage.

### 5.2 Web Search URL Security & Protocol Whitelisting
To prevent cross-site scripting (XSS) or malicious link redirection from search sources:
1. **Strict Protocol Whitelist**: Only `https:` (and `http:` in development) URLs are permitted for rendering and navigation.
2. **Disallowed Schemes**: `javascript:`, `data:`, `file:`, `vbscript:`, and `blob:` schemes are aggressively rejected by `validateSafeUrl()`.
3. **Secure Anchor Attributes**: All external source links enforce `target="_blank" rel="noopener noreferrer"`.
4. **Anti-Fabrication Guarantee**: Only verified URLs from official Google Search `groundingMetadata` are parsed into Source Cards. Model-invented links in raw markdown are never automatically converted into verified source cards.

---

## 6. Prompt Injection & AI Safety Defense

1. **System Prompt Delimiter Isolation**: User input and external retrieved context (from PDFs or Web Search) are enclosed in strict XML/Markdown delimiters:
   ```text
   <context_documents>
   {{RETRIEVED_CHUNKS}}
   </context_documents>
   
   <user_instruction>
   {{USER_INPUT}}
   </user_instruction>
   ```
2. **Instruction Sandboxing**: System instructions explicitly instruct Gemini to treat text inside `<context_documents>` purely as reference facts and never as executable commands or system overrides.
3. **Safety Filters**: Standard Gemini safety filters configured for Hate Speech, Harassment, Sexual Content, and Dangerous Content at standard recommended thresholds.

---

## 7. Rate Limiting & Abuse Prevention

To ensure equitable resource usage and protect Gemini API quotas:
- **Per-User Limits**: Max 25 chat turns per 10-minute window for active users.
- **Per-IP Limits**: Max 60 requests per minute on public endpoints.
- **Token Budget Guard**: Server truncates conversation history beyond the active context window limit (max 16,000 tokens per prompt request in V1).

---

## 8. Data Privacy & GDPR Compliance

1. **Zero Model Training**: User conversations and uploaded documents are not utilized for LLM model training.
2. **Memory Transparency**: Users can view, edit, and delete any synthesized long-term memory entry at any time.
3. **Right to Erasure (Account Deletion Cascade)**: When a user deletes their account:
   - User profile record is deleted from Firestore.
   - All conversations and messages are deleted in a batch transaction.
   - All uploaded documents are purged from Cloud Storage.
   - All long-term memories are wiped permanently.
   - Firebase Auth user record is deleted.
