# Technology Stack & Selection Rationale — Cognix

**Document Version:** 1.0.0  
**Lead Architect:** Software & Systems Architect  

---

## 1. Core Architecture Stack

```text
Frontend Framework: Next.js (App Router, React 18/19)
Language:           TypeScript (Strict Mode)
Styling:            Tailwind CSS
Animation:          Framer Motion
Backend Services:   Firebase (Auth, Firestore, Storage, App Check)
AI & Embeddings:    Google Gemini API (@google/genai / @google/generative-ai)
Deployment:         Vercel / Firebase App Hosting
```

---

## 2. Technology Selection & Comparative Rationale

### 2.1 Frontend Framework: Next.js (App Router)
- **Why Selected**:
  - Unifies React frontend and serverless API route handlers in a single repository.
  - Native streaming support (`ReadableStream`, Server-Sent Events) ideal for LLM output.
  - Server Components (RSC) keep client bundle sizes tiny while providing fast initial page renders.
- **Alternatives Considered**:
  - *Vite + React SPA*: Excellent for pure client apps, but requires maintaining a separate backend server (Express/FastAPI) to safeguard Gemini API keys.
  - *Remix*: Strong alternative, but Next.js offers deeper serverless ecosystem integration and wider community support.

### 2.2 Language: TypeScript (Strict Mode)
- **Why Selected**:
  - Eliminates entire classes of runtime errors across complex data models (e.g. streaming message deltas, Firestore document converters, RAG embeddings).
  - Provides end-to-end type safety between backend API contracts and frontend components.
- **Dependency Rule**: `strict: true` and `noImplicitAny: true` enforced across all `tsconfig.json` configurations.

### 2.3 Styling & Design: Tailwind CSS
- **Why Selected**:
  - High performance zero-runtime CSS with atomic utility generation.
  - Native support for CSS custom variables (HSL design tokens), dark mode switching via data-theme attributes, and responsive breakpoints.
- **Alternatives Considered**:
  - *Vanilla CSS*: Maximum control, but slower development velocity and harder to maintain consistent spacing scales across a team.
  - *Styled Components / Emotion*: CSS-in-JS adds runtime overhead and complicates React Server Components rendering.

### 2.4 Animation Engine: Framer Motion
- **Why Selected**:
  - Declarative layout animations, effortless exit animations for streaming messages, and smooth spring physics.
  - Native hardware-accelerated GPU transforms and built-in accessibility helpers (`useReducedMotion`).

### 2.5 Backend & Database: Firebase (Auth, Firestore, Cloud Storage)
- **Why Selected**:
  - **Firebase Authentication**: Turnkey security for Email/Password and Google OAuth with automatic JWT token refresh.
  - **Cloud Firestore**: Real-time NoSQL database providing sub-100ms listener sync for chat histories, user profiles, and memories.
  - **Firebase Cloud Storage**: Secure blob storage for uploaded user PDF documents with granular path-based access control.
  - **Firebase App Check**: Protects API routes and backend services from malicious bot scrapers and unauthorized traffic.
- **Alternatives Considered**:
  - *PostgreSQL / Supabase*: Robust relational model, but Firestore's real-time listeners and document nesting offer simpler DX for rapid chat and memory schemas.
  - *Custom Node/Express + MongoDB*: Increases server maintenance overhead compared to fully managed serverless infrastructure.

### 2.6 AI Reasoning & Multimodal Intelligence: Google Gemini
- **Why Selected**:
  - Industry-leading 1M+ token context window, state-of-the-art multimodal reasoning, and blazing-fast response speeds (Gemini 1.5 Flash).
  - Native embeddings API for document chunk vectorization.
  - First-party integration support with Google Cloud and Firebase AI Logic.
- **Alternatives Considered**:
  - *OpenAI GPT-4o*: Capable, but higher token pricing for large context windows and lacks direct Firebase ecosystem integration.
  - *Anthropic Claude 3.5 Sonnet*: Exceptional reasoning, but more complex deployment for a Firebase-centric architecture.

---

## 3. Dependency Management Principles

To maintain a lean, secure, and easily maintainable codebase:

1. **Zero Bloat Policy**: Every new `npm` dependency must be justified against standard Web APIs or native React hooks.
2. **Lockfile Enforcement**: `package-lock.json` must always be committed and synchronized.
3. **Security Auditing**: Regular automated `npm audit` execution in CI pipelines.
4. **Target Version Strategy**:
   - `next`: `^14.2.x` or `^15.x`
   - `react`: `^18.3.x` or `^19.0.x`
   - `firebase`: `^10.12.x`
   - `firebase-admin`: `^12.1.x`
   - `@google/genai` or `@google/generative-ai`: `^0.14.x`
   - `tailwindcss`: `^3.4.x`
   - `framer-motion`: `^11.2.x`
   - `lucide-react`: `^0.395.x` (Lightweight, consistent icon suite)
