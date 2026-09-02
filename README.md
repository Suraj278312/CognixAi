# Cognix 🧠✨

> **Intelligent, Approachable, and Grounded AI Assistant**  
> Built with Next.js, TypeScript, Tailwind CSS, Google Gemini, and Firebase.

---

## 🌟 Overview

**Cognix** is a modern, free, general-purpose AI assistant designed to bridge the gap between simple conversational chatbots and advanced contextual AI workspaces. It provides an intuitive, calm, and distraction-free interface for everyday users, while offering powerful features such as streaming chat, document intelligence (RAG for PDFs), grounded web search with live citations, and persistent cross-session long-term memory.

Cognix is built to feel **professional, friendly, intelligent, and trustworthy**—deliberately avoiding cluttered UI paradigms, gimmicks, or generic chatbot clone aesthetics.

---

## 🚀 Core Capabilities

- **💬 Real-Time Conversational AI**: Fluid, streaming responses powered by Google Gemini with full Markdown rendering, LaTeX math support, and multi-language syntax-highlighted code blocks.
- **📄 Document Intelligence (PDF QA)**: Upload PDFs and query them directly. Cognix extracts, indexes, and retrieves relevant passages to deliver grounded, accurate answers.
- **🌐 Grounded Web Search**: Answers questions requiring up-to-date knowledge with real-time web retrieval, featuring explicit source attribution and clickable citations.
- **🧠 Cross-Session Long-Term Memory**: Cognix remembers user preferences, ongoing projects, and communication styles across sessions without storing raw transcripts blindly.
- **🔒 Granular User Control & Privacy**: Full transparency into saved memories with the ability to edit, toggle, or purge memory and delete conversations at any time.
- **🛡️ Secure Multi-Tenant Architecture**: Complete user isolation powered by Firebase Authentication, Cloud Firestore rules, and Cloud Storage security policies.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | [Next.js](https://nextjs.org/) (App Router, React 18/19) | Server-rendered & client-side hybrid architecture, API route handlers |
| **Language** | [TypeScript](https://www.typescriptlang.org/) (Strict Mode) | Type safety, maintainability, and domain modeling |
| **Styling & Design** | [Tailwind CSS](https://tailwindcss.com/) | Custom design token system, dark/light modes, micro-interactions |
| **Animation Engine** | [Framer Motion](https://www.framer.com/motion/) | Smooth layout transitions, streaming cursor effects, modal transitions |
| **AI Intelligence** | [Google Gemini API](https://ai.google.dev/) / Firebase AI Logic | LLM reasoning, multimodal processing, embeddings, and web grounding |
| **Authentication** | [Firebase Authentication](https://firebase.google.com/docs/auth) | Email/Password and Google OAuth with secure token management |
| **Database** | [Cloud Firestore](https://firebase.google.com/docs/firestore) | Real-time NoSQL storage for chat history, user profiles, and memories |
| **File Storage** | [Firebase Cloud Storage](https://firebase.google.com/docs/storage) | Secure storage for uploaded user documents and attachments |
| **Integrity & Security**| [Firebase App Check](https://firebase.google.com/docs/app-check) | Abuse prevention, API protection, and app attestation |

---

## 📊 Project Status & Roadmap

| Phase | Milestone | Status |
| :--- | :--- | :--- |
| **Phase 0** | **Foundation & Architectural Documentation** | 🟢 Complete / Active |
| **Phase 1** | **Design System & UI Primitives** | ⚪ Planned |
| **Phase 2** | **Firebase Auth & User Profiles** | ⚪ Planned |
| **Phase 3** | **Core Streaming AI Chat (Gemini API)** | ⚪ Planned |
| **Phase 4** | **Chat History & Session Management** | ⚪ Planned |
| **Phase 5** | **Long-Term Memory Synthesis & Management** | ⚪ Planned |
| **Phase 6** | **Document Upload & RAG QA Engine** | ⚪ Planned |
| **Phase 7** | **Grounded Web Search with Citations** | ⚪ Planned |
| **Phase 8** | **Security Hardening & App Check** | ⚪ Planned |
| **Phase 9** | **Automated Testing & QA Verification** | ⚪ Planned |
| **Phase 10**| **Production Deployment & Monitoring** | ⚪ Planned |

See [ROADMAP.md](file:///c:/Cognix%20Ai%20Chatbot/ROADMAP.md) for detailed milestone breakdown and deliverables.

---

## 📂 Repository Structure

```text
Cognix/
├── README.md                  # Project overview and quick start guide
├── PRD.md                     # Product Requirements Document
├── DESIGN.md                  # Design system and UI/UX guidelines
├── ARCHITECTURE.md            # Comprehensive system and data flow architecture
├── TECH_STACK.md              # Technical stack rationale and trade-offs
├── ROADMAP.md                 # Engineering roadmap and version milestones
├── SECURITY.md                # Security, privacy, and abuse prevention blueprint
├── CONTRIBUTING.md            # Contribution guidelines and coding conventions
├── AGENTS.md                  # Rules and constraints for AI coding assistants
├── .env.example               # Environment variable declaration template
├── .gitignore                 # Standardized git ignore rules
│
├── docs/                      # Deep-dive architectural and engineering documentation
│   ├── product/               # Product vision, feature matrix, and user flows
│   ├── ai/                    # Gemini API, Memory, RAG, and Web Search specs
│   ├── backend/               # Firebase, Firestore schema, Storage, and Auth
│   ├── frontend/              # Component hierarchy, responsive design, animations
│   ├── development/           # Coding standards, testing, deployment, errors
│   └── decisions/             # Architecture Decision Records (ADRs)
│
├── src/                       # Application source code (scaffolded)
│   ├── app/                   # Next.js App Router pages and API routes
│   ├── components/            # Shared UI components and primitives
│   ├── features/              # Feature modules (auth, chat, docs, memory, search)
│   ├── lib/                   # Integrations (firebase, gemini, utils)
│   ├── hooks/                 # Reusable React hooks
│   ├── types/                 # TypeScript interfaces and type definitions
│   ├── config/                # Application constants and configuration
│   └── styles/                # Global CSS and Tailwind style configurations
│
├── firebase/                  # Firebase configuration and security rules
│   ├── firestore.rules        # Cloud Firestore security rules
│   ├── firestore.indexes.json # Composite query index definitions
│   └── storage.rules          # Firebase Cloud Storage security rules
│
└── public/                    # Static assets (icons, images, fonts)
```

---

## 💻 Local Development Setup (Overview)

> [!NOTE]
> Cognix is currently in **Phase 0 (Foundation & Architectural Blueprinting)**. Application implementation will begin in subsequent phases.

When development begins, the standard setup workflow will be:

1. **Clone repository & Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**:
   Copy `.env.example` to `.env.local` and populate the Firebase and Gemini API keys:
   ```bash
   cp .env.example .env.local
   ```

3. **Start Local Development Server**:
   ```bash
   npm run dev
   ```

4. **Access the Application**:
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📖 Key Documentation Links

- 📋 [Product Requirements Document (PRD.md)](file:///c:/Cognix%20Ai%20Chatbot/PRD.md)
- 🎨 [Design Direction & System (DESIGN.md)](file:///c:/Cognix%20Ai%20Chatbot/DESIGN.md)
- 🏗️ [System Architecture (ARCHITECTURE.md)](file:///c:/Cognix%20Ai%20Chatbot/ARCHITECTURE.md)
- 🔒 [Security & Data Isolation (SECURITY.md)](file:///c:/Cognix%20Ai%20Chatbot/SECURITY.md)
- 🤖 [AI Agent Instructions (AGENTS.md)](file:///c:/Cognix%20Ai%20Chatbot/AGENTS.md)
- 📑 [Firestore Schema Specification (docs/backend/FIRESTORE_SCHEMA.md)](file:///c:/Cognix%20Ai%20Chatbot/docs/backend/FIRESTORE_SCHEMA.md)
- 🧠 [Document Intelligence & RAG Specification (docs/ai/RAG.md)](file:///c:/Cognix%20Ai%20Chatbot/docs/ai/RAG.md)

---

## ⚖️ License & Attribution

Cognix is developed as a modern portfolio-grade AI assistant project. Built with ❤️ using Google Gemini and Firebase.
