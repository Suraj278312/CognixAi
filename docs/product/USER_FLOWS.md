# End-to-End User Flows & Journeys — Cognix

**Document Version:** 1.0.0  
**Lead UX Architect:** Senior UX Strategist  

---

## 1. User Journey 1: New User Onboarding & Registration

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Landing as Landing Page
    participant AuthModal as Auth Modal
    participant FirebaseAuth as Firebase Auth
    participant Firestore as Cloud Firestore
    participant App as Chat Dashboard

    User->>Landing: Lands on Cognix home page
    User->>Landing: Clicks "Get Started / Sign Up"
    Landing->>AuthModal: Display Registration Form
    alt Email / Password
        User->>AuthModal: Enters Email, Password, Display Name
        AuthModal->>FirebaseAuth: createUserWithEmailAndPassword()
    else Google Sign-In
        User->>AuthModal: Clicks "Continue with Google"
        AuthModal->>FirebaseAuth: signInWithPopup(GoogleAuthProvider)
    end
    FirebaseAuth-->>AuthModal: Success (User UID + JWT)
    AuthModal->>Firestore: Create initial profile in /users/{uid}
    AuthModal-->>App: Redirect to /chat
    App-->>User: Display Empty State with Starter Prompts
```

---

## 2. User Journey 2: New Conversational Chat & Streaming

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant UI as Chat View
    participant API as /api/chat
    participant Gemini as Google Gemini API
    participant Firestore as Cloud Firestore

    User->>UI: Types message and presses Enter / Click Send
    UI->>UI: Optimistically append User Message to screen
    UI->>API: POST /api/chat (stream request)
    API->>Gemini: streamGenerateContent(prompt, context)
    loop Token Streaming
        Gemini-->>API: Yield Token Chunk
        API-->>UI: Server-Sent Event (Chunk)
        UI-->>User: Incrementally render Markdown + Code Blocks
    end
    Gemini-->>API: Stream Finished
    API->>Firestore: Persist Completed Message to /conversations/{id}/messages
    API-->>UI: [DONE] Event
    Note over API,Firestore: Background task triggers auto-titling if Turn 1
```

---

## 3. User Journey 3: PDF Document Upload & Grounded Question Answering

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant UI as Chat View
    participant Storage as Firebase Cloud Storage
    participant API as /api/rag/process
    participant Firestore as Cloud Firestore

    User->>UI: Drags and drops "MachineLearningGuide.pdf" (3.2 MB)
    UI->>UI: Validates file type (PDF) & size (<10MB)
    UI->>Storage: Upload to users/{uid}/documents/{docId}/guide.pdf
    Storage-->>UI: Upload Complete
    UI->>API: POST /api/rag/process { docId, storagePath }
    UI-->>User: Document Chip shows "Processing / Indexing..."
    API->>API: Extract Text -> Recursive Chunking -> Embeddings
    API->>Firestore: Store chunks & metadata
    API-->>UI: Document status: Ready
    UI-->>User: Document Chip shows Green Checkmark
    User->>UI: Types: "What does section 3 say about gradient descent?"
    UI->>API: POST /api/chat { docId, query }
    API->>Firestore: Query top-k matching chunks
    API->>API: Inject retrieved chunks into prompt
    API-->>UI: Stream answer with cited page numbers
```

---

## 4. User Journey 4: Grounded Web Search & Citation Inspection

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant UI as Chat View
    participant API as /api/chat
    participant SearchAPI as Web Search API
    participant Gemini as Google Gemini

    User->>UI: "What are the key announcements from Google I/O this year?"
    UI->>API: POST /api/chat (search query)
    API->>API: Detects temporal query -> generates search keywords
    API->>SearchAPI: Execute Search Query
    SearchAPI-->>API: Return Top 4 verified sources with snippets
    API->>Gemini: Synthesize grounded response using source snippets
    Gemini-->>API: Yield streaming response containing [1], [2] citations
    API-->>UI: Stream response with live citation pills
    User->>UI: Hovers cursor over citation [1]
    UI-->>User: Display Popover with page title, publisher, and direct link
```

---

## 5. User Journey 5: Long-Term Memory Creation & Management

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant UI as Chat / Settings View
    participant Engine as Memory Synthesis Worker
    participant Firestore as Cloud Firestore

    User->>UI: "I'm a senior frontend engineer building Next.js apps with Tailwind."
    UI->>UI: Normal conversation turn completes
    Engine->>Engine: Evaluates message for persistent personal facts
    Engine->>Firestore: Store memory: "Works as a senior frontend engineer with Next.js & Tailwind"
    UI-->>User: Show Toast: "💡 Remembered your frontend tech stack preference"
    
    Note over User,UI: Later in Settings...
    User->>UI: Opens Settings -> Memory Manager
    UI->>Firestore: Fetch list of all memories
    Firestore-->>UI: Return memory items
    User->>UI: Clicks "Delete" on an outdated memory
    UI->>Firestore: Delete /users/{uid}/memories/{memoryId}
    UI-->>User: Memory removed immediately
```

---

## 6. User Journey 6: Conversation Thread Management (Rename & Delete)

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Sidebar as Sidebar Component
    participant Modal as Confirmation Dialog
    participant Firestore as Cloud Firestore

    User->>Sidebar: Hovers over conversation item & clicks `...` menu
    alt Rename Conversation
        User->>Sidebar: Selects "Rename"
        Sidebar-->>User: Input becomes editable
        User->>Sidebar: Enters "Next.js Architectural Review" + Press Enter
        Sidebar->>Firestore: Update title in /conversations/{id}
    else Delete Conversation
        User->>Sidebar: Selects "Delete"
        Sidebar->>Modal: Open "Delete Conversation?" modal
        User->>Modal: Clicks "Confirm Delete"
        Modal->>Firestore: Delete /conversations/{id} and child messages
        Modal-->>Sidebar: Remove thread from list & switch to New Chat
    end
```
