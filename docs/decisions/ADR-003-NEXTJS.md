# ADR-003: Selection of Next.js (App Router) for Full-Stack Web Application

**Status:** Accepted  
**Date:** 2026-08-31  
**Deciders:** Lead Frontend Architect, Software Architect  

---

## Context & Problem Statement
Cognix requires a unified web application framework capable of delivering both server-side security (guarding Gemini API keys and handling SSE streaming) and client-side interactivity (rich markdown parsing, dynamic chat inputs, and drag-and-drop file uploaders).

---

## Decision Drivers
- Unified codebase combining React frontend and serverless API route handlers.
- Native support for Web Streams and Server-Sent Events (`ReadableStream`).
- React Server Components (RSC) to reduce client JavaScript bundle size.
- Frictionless deployment on Vercel and Firebase App Hosting.

---

## Considered Options
1. **Next.js 14+ (App Router, React 18/19, TypeScript)** — *Selected*
2. **Vite + React SPA + Standalone Express Backend**
3. **Remix / React Router v7**

---

## Decision Outcome
**Chosen Option:** **Next.js (App Router)**.  
Next.js provides an integrated full-stack architecture that eliminates the operational burden of maintaining a separate API server, while offering native streaming and edge routing capabilities.

---

## Pros & Cons

### Pros
- Unified repository for client UI and backend API routes.
- Zero client-side API key leakage through secure server route handlers.
- Built-in route middleware for protecting dashboard paths.
- Excellent TypeScript and Tailwind CSS developer experience.

### Cons
- App Router learning curve and hydration considerations for complex streaming client components (mitigated by clean feature module organization).
