# ADR-001: Adoption of Firebase Serverless Cloud Services

**Status:** Accepted  
**Date:** 2026-08-31  
**Deciders:** Lead Architect, Senior Backend Engineer  

---

## Context & Problem Statement
Cognix requires a secure, scalable, and low-maintenance backend infrastructure to manage user authentication, real-time message streams, document blob storage, and security enforcement without requiring complex multi-server DevOps management.

---

## Decision Drivers
- Need for turnkey authentication supporting Email/Password and Google OAuth with built-in JWT rotation.
- Need for real-time document listeners for instant multi-device chat sync.
- Need for integrated blob storage with path-level security rules for PDF uploads.
- Desire to minimize infrastructure maintenance overhead for rapid product iteration.

---

## Considered Options
1. **Firebase (Auth, Firestore, Cloud Storage, App Check)** — *Selected*
2. **Supabase (PostgreSQL, GoTrue Auth, Storage)**
3. **Custom Node.js / Express Server + MongoDB Atlas + AWS S3**

---

## Decision Outcome
**Chosen Option:** **Firebase**.  
Firebase delivers complete serverless integration out of the box with zero container management. Cloud Firestore’s native subcollection model aligns naturally with hierarchical chat threads (`/conversations/{id}/messages`), and Firebase Security Rules enforce multi-tenant isolation at the database layer.

---

## Pros & Cons

### Pros
- Zero infrastructure provisioning or database maintenance.
- Robust SDKs for both browser clients and Next.js server route handlers.
- Native real-time database listeners for seamless multi-device updates.
- Built-in App Check for automated bot mitigation and API protection.

### Cons
- Vendor lock-in to Google Cloud / Firebase ecosystem.
- Deep relational SQL queries are not natively supported (mitigated by clean NoSQL schema design).
