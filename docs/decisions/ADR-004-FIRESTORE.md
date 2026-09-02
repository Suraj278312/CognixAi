# ADR-004: Selection of Cloud Firestore for NoSQL Data Modeling

**Status:** Accepted  
**Date:** 2026-08-31  
**Deciders:** Lead Database Architect, Backend Engineer  

---

## Context & Problem Statement
Cognix requires a persistent database to store user profiles, hierarchical conversation threads, individual message records, structured long-term memories, and document chunk metadata.

---

## Decision Drivers
- Document-oriented hierarchical modeling (`conversations/{id}/messages/{id}`).
- Real-time snapshot listeners for instant multi-tab and multi-device sync.
- Granular, declaratively enforced security rules tied to Firebase Auth.
- Fully managed serverless scalability with automatic replication and zero server maintenance.

---

## Considered Options
1. **Cloud Firestore (NoSQL Document Store)** — *Selected*
2. **PostgreSQL / Supabase (Relational Database)**
3. **MongoDB Atlas**

---

## Decision Outcome
**Chosen Option:** **Cloud Firestore**.  
Firestore's document hierarchy perfectly maps to user-scoped conversations and message subcollections. Real-time snapshot listeners enable instant reactive UI updates without requiring custom WebSocket infrastructure.

---

## Pros & Cons

### Pros
- Native subcollections provide clean data isolation per conversation thread.
- Real-time listeners eliminate polling overhead for multi-device sync.
- Declarative security rules enforce multi-tenant isolation directly at the database engine.
- Generous free tier and seamless integration with Firebase Auth and Storage.

### Cons
- Complex relational joins are not supported (addressed by embedding necessary metadata in parent conversation documents).
