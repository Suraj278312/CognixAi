# Multimodal AI & Image Understanding — Cognix Phase 7

**Module:** `src/lib/multimodal/`, `src/components/chat/`, `src/config/multimodal.ts`  
**Status:** Implemented & Verified  
**Source of Truth for:** Vision models, image attachment workflows, magic byte validation, storage isolation, and multi-turn visual context.

---

## 1. Executive Summary

Cognix Phase 7 transforms the platform into a true multimodal AI assistant. Users can upload images (screenshots, diagrams, UI designs, code snippets, charts, photos) alongside or in place of text prompts. Cognix streams analytical responses using Google Gemini vision capabilities, maintains visual context across follow-up turns, and enforces strict security and tenant data isolation.

---

## 2. Core Capabilities & Specifications

| Dimension | Specification | Source / Setting |
| :--- | :--- | :--- |
| **Max Image Size** | 10 MB per file | `MULTIMODAL_CONFIG.maxImageSizeMb` / `MAX_IMAGE_SIZE_MB` |
| **Max Images Per Turn** | Up to 4 images per message | `MULTIMODAL_CONFIG.maxImagesPerMessage` |
| **Context Memory** | Up to 4 recent images preserved | `MULTIMODAL_CONFIG.maxImagesInContext` |
| **Supported Formats** | JPEG, PNG, WEBP, GIF | `MULTIMODAL_CONFIG.supportedMimeTypes` |
| **Magic Byte Inspection** | `FF D8 FF` (JPEG), `89 50 4E 47` (PNG), `47 49 46 38` (GIF), `RIFF...WEBP` (WEBP) | `detectMimeFromBytes()` in `image-validator.ts` |
| **Storage Architecture** | Firebase Storage: `/users/{userId}/images/{imageId}` | Owner-only read/write rules |
| **Model Engine** | Google Gemini (`gemini-3.6-flash`, `gemini-3.7-flash`, etc.) | Native `inlineData` Base64 parts |

---

## 3. Data Schema & Models

### `ImageAttachment` Schema
```typescript
export interface ImageAttachment {
  id: string;
  userId: string;
  conversationId?: string;
  name: string;
  storagePath: string;
  mimeType: string;
  sizeBytes: number;
  width?: number;
  height?: number;
  url?: string;
  base64Data?: string;
  createdAt: number;
}
```

### `Message` Schema Extension
```typescript
export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  images?: ImageAttachment[];
  citations?: CitationSource[];
  hasDocumentContext?: boolean;
  hasWebSearchGrounding?: boolean;
  hasImageContext?: boolean;
  isStreaming?: boolean;
  searchStatus?: string;
  createdAt: number;
}
```

---

## 4. Multimodal Message Assembly & Context Lifecycle

```
[User Selects / Pastes / Drops Image]
                 │
   ┌─────────────▼─────────────┐
   │ Client-Side File Validate │ ── Type (JPEG/PNG/WEBP/GIF) & Size (≤ 10MB) & Magic Bytes
   └─────────────┬─────────────┘
                 │
   ┌─────────────▼─────────────┐
   │ Local Object URL Preview  │ ── Instant thumbnail in composer with [X] remove
   └─────────────┬─────────────┘
                 │ (User clicks Send)
   ┌─────────────▼─────────────┐
   │ Firebase Storage Upload   │ ── /users/{userId}/images/{imageId}
   └─────────────┬─────────────┘
                 │
   ┌─────────────▼─────────────┐
   │ POST /api/chat Stream     │ ── Message + Inline base64 + Storage metadata
   └─────────────┬─────────────┘
                 │
   ┌─────────────▼─────────────┐
   │ Gemini Multimodal Engine  │ ── Generates streaming response with visual grounding
   └─────────────┬─────────────┘
                 │
   ┌─────────────▼─────────────┐
   │ Firestore Message Save    │ ── Persists text + image metadata array
   └───────────────────────────┘
```

### Multi-Turn Context Management
When user asks follow-up questions ("What does the blue bar mean?"):
1. The conversation history maintains the user turn with its attached `inlineData` part.
2. Up to `MAX_IMAGES_IN_CONTEXT` (4) recent images are preserved in reverse chronological order.
3. Older images beyond the context cap are pruned from the immediate API payload to prevent token bloat while persisting in Firestore for history rendering.

---

## 5. Security & Privacy Safeguards

1. **Strict User Isolation**: Storage path `/users/{userId}/images/{imageId}` ensures User A can never read, modify, or delete User B's images.
2. **No Public URLs**: Firebase Storage rules prevent unauthenticated access.
3. **Magic Byte Anti-Spoofing**: Rejects files with spoofed extensions whose internal byte headers do not match genuine image signatures.
4. **Memory Sandboxing**: Visual observations (photos of people, scenery, objects) are never automatically converted into long-term user memories. Only explicit user statements ("Remember that I own a red car") are extracted.

---

## 6. User Interface Components

1. **`ChatComposer.tsx`**:
   - Attachment dropdown on `+` / `Paperclip`:
     - 📷 **Upload Image** (native file dialog)
     - 📄 **Upload PDF Document** (document upload modal)
   - Image preview tray showing `ImageAttachmentPreview` chips with file size and remove buttons.
   - Clipboard paste (`Ctrl+V`) for instant screenshot pasting.
   - Drag-and-drop file target.
   - Image-only prompts supported without requiring text.
2. **`UserMessage.tsx`**:
   - Responsive grid of image thumbnails with aspect ratio preservation.
   - Click opens `ImageLightbox`.
3. **`ImageLightbox.tsx`**:
   - Fullscreen modal with backdrop blur.
   - Zoom in / zoom out toggle.
   - Download image button.
   - Esc key listener and close button.
