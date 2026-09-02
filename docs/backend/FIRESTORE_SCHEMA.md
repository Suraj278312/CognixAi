# Cloud Firestore Schema & Data Modeling — Cognix

**Document Version:** 1.0.0  
**Backend Lead:** Lead Backend & Database Architect  

---

## 1. Schema Hierarchy Overview

Cognix organizes data hierarchically in Cloud Firestore to enforce strict user ownership, optimize real-time queries, and support high performance:

```text
/users/{userId}
  ├── /memories/{memoryId}
  └── /settings/{settingsDoc}

/conversations/{conversationId}
  └── /messages/{messageId}

/documents/{documentId}
  └── /chunks/{chunkId}

/usage_metrics/{metricId}
```

---

## 2. Collection Specifications & TypeScript Interfaces

### 2.1 Collection: `users`
**Path**: `/users/{userId}`  
**Ownership**: `request.auth.uid == userId`

```typescript
export interface UserDocument {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  themePreference: 'dark' | 'light' | 'system';
  isMemoryEnabled: boolean;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
  lastLoginAt: FirebaseFirestore.Timestamp;
}
```

---

### 2.2 Subcollection: `users/{userId}/memories`
**Path**: `/users/{userId}/memories/{memoryId}`  
**Ownership**: `request.auth.uid == userId`

```typescript
export interface MemoryDocument {
  id: string;
  userId: string;
  content: string;
  category: 'preference' | 'technical' | 'work' | 'personal';
  sourceConversationId: string;
  confidence: number; // 0.0 - 1.0
  isEnabled: boolean;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}
```

---

### 2.3 Collection: `conversations`
**Path**: `/conversations/{conversationId}`  
**Ownership**: `request.auth.uid == resource.data.userId`

```typescript
export interface ConversationDocument {
  id: string;
  userId: string;
  title: string;
  isPinned: boolean;
  isArchived: boolean;
  attachedDocumentIds: string[];
  lastMessageText: string;
  lastMessageAt: FirebaseFirestore.Timestamp;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}
```

---

### 2.4 Subcollection: `conversations/{conversationId}/messages`
**Path**: `/conversations/{conversationId}/messages/{messageId}`  
**Ownership**: Inherited from parent conversation `userId`

```typescript
export interface CitationSource {
  title: string;
  url?: string;
  pageNumber?: number;
  snippet: string;
}

export interface MessageDocument {
  id: string;
  conversationId: string;
  userId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  citations?: CitationSource[];
  tokenCount?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  hasDocumentContext?: boolean;
  hasWebSearchGrounding?: boolean;
  createdAt: FirebaseFirestore.Timestamp;
}
```

---

### 2.5 Collection: `documents`
**Path**: `/documents/{documentId}`  
**Ownership**: `request.auth.uid == resource.data.userId`

```typescript
export interface DocumentMetadata {
  id: string;
  userId: string;
  fileName: string;
  fileSizeBytes: number;
  mimeType: string;
  storagePath: string;
  pageCount: number;
  status: 'uploading' | 'processing' | 'ready' | 'error';
  errorMessage?: string;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}
```

---

### 2.6 Subcollection: `documents/{documentId}/chunks`
**Path**: `/documents/{documentId}/chunks/{chunkId}`  
**Ownership**: Inherited from parent document `userId`

```typescript
export interface ChunkDocument {
  id: string;
  documentId: string;
  userId: string;
  pageNumber: number;
  chunkIndex: number;
  text: string;
  embedding: number[]; // 768 float array
  createdAt: FirebaseFirestore.Timestamp;
}
```

---

### 2.7 Collection: `usage_metrics` (Admin / Internal)
**Path**: `/usage_metrics/{metricId}`  
**Access**: Server Admin SDK only

```typescript
export interface UsageMetricDocument {
  id: string;
  userId: string;
  action: 'chat_turn' | 'pdf_upload' | 'web_search' | 'memory_extract';
  modelUsed: string;
  tokenCount: number;
  latencyMs: number;
  timestamp: FirebaseFirestore.Timestamp;
}
```

---

## 3. Required Firestore Indexes

The following composite indexes are required to support efficient ordering and filtering without client-side sorting:

```json
{
  "indexes": [
    {
      "collectionGroup": "conversations",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "updatedAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "messages",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "conversationId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "memories",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "isEnabled", "order": "ASCENDING" },
        { "fieldPath": "updatedAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```
