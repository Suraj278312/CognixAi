# AI Agent Operating Directives & Guidelines — Cognix

**Target Audience:** AI Coding Assistants, LLM Agents (e.g. Antigravity, Claude, Cursor, Copilot), and Automated Code Generators.  
**Effective Date:** Active Immediately  

---

## 🛑 MANDATORY CARDINAL RULE

> [!IMPORTANT]
> **DO NOT START IMPLEMENTING THE APPLICATION CODEBASE UNLESS THE USER EXPLICITLY INSTRUCTS YOU TO BEGIN IMPLEMENTATION.**  
> During foundational, planning, design, and documentation phases, your role is to analyze, document, specify, and plan. Do not create application code files, install packages, or build features without explicit user instruction.

---

## 🧭 Source of Truth Hierarchy

When working in the Cognix codebase, you must resolve any ambiguity by adhering to the following strict hierarchy of truth:

1. **[PRD.md](file:///c:/Cognix%20Ai%20Chatbot/PRD.md)** — The ultimate source of truth for product scope, user stories, acceptance criteria, and feature boundaries.
2. **[DESIGN.md](file:///c:/Cognix%20Ai%20Chatbot/DESIGN.md)** — The ultimate source of truth for visual identity, typography, color tokens, layout, spacing, and micro-interactions.
3. **[ARCHITECTURE.md](file:///c:/Cognix%20Ai%20Chatbot/ARCHITECTURE.md)** — The ultimate source of truth for system components, data flows, API contracts, and integration points.
4. **[SECURITY.md](file:///c:/Cognix%20Ai%20Chatbot/SECURITY.md)** — The ultimate source of truth for authentication boundaries, Firestore/Storage rules, App Check, and secret protection.
5. **[docs/](file:///c:/Cognix%20Ai%20Chatbot/docs/)** — Detailed deep-dive specifications for AI, backend, frontend, and engineering decisions.

---

## 📋 The 15 Core Agent Commandments

1. **Read Documentation First**: Always inspect existing documentation in `docs/` and root `.md` files before modifying or generating code.
2. **Respect the PRD**: Never build features that contradict or exceed the V1 scope defined in `PRD.md`.
3. **Respect the Design System**: Use defined HSL tokens, typography scales, and spacing constants from `DESIGN.md`. Do not introduce ad-hoc colors or arbitrary styles.
4. **Follow System Architecture**: Adhere strictly to the data flows, API route definitions, and service boundaries in `ARCHITECTURE.md`.
5. **Enforce Security Standards**: Never expose API keys in client bundles, never bypass Firebase security rules, and never use insecure `allow read, write: if true;` rules.
6. **Avoid Unnecessary Dependencies**: Leverage native Web APIs and existing utilities before introducing new `npm` packages. Every dependency must be justified.
7. **Preserve Functioning Systems**: Do not arbitrarily refactor or rewrite functioning modules unless explicitly requested or fixing a defect.
8. **Keep Components Modular**: Separate presentation from business logic. Keep UI components under 150 lines where practical and extract logic into custom hooks.
9. **Write Strict TypeScript**: Enforce complete type definitions, interfaces for all props, and avoid `any` or loose casting.
10. **Test Your Changes**: Verify that modifications compile cleanly, pass type checks, and do not break existing test suites.
11. **Keep Documentation in Sync**: Whenever an architectural change, schema alteration, or API modification is made, update the relevant markdown documents immediately.
12. **Zero Secret Exposure**: Never write API keys, private tokens, or credentials into repository files or commit logs. Use `.env.local` for local secrets.
13. **No Undocumented Major Features**: Do not silently invent features, unapproved models, or unsupported storage backends.
14. **Clarify Conflicting Requirements**: If a prompt or task description conflicts with `PRD.md` or `ARCHITECTURE.md`, pause and ask the user for clarification.
15. **Prefer Incremental Implementation**: Build features step-by-step with clear verification gates rather than massive, unverified batch edits.

---

## 🛠️ Code Modification Rules

- Always verify the current state of a file before editing it.
- Maintain existing comments and docstrings.
- Follow the Conventional Commits naming convention described in `CONTRIBUTING.md`.
- When technical decisions are open or unresolved, mark them explicitly with `DECISION NEEDED` rather than making arbitrary assumptions.
