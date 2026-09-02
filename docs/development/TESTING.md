# Testing Strategy & Quality Assurance — Cognix

**Document Version:** 1.0.0  
**QA Lead:** Lead QA & Systems Engineer  

---

## 1. Testing Pyramid Strategy

Cognix applies a comprehensive multi-tier testing strategy to ensure stability across AI streaming, document processing, and cloud database operations:

```text
               ┌───────────────────────┐
               │    E2E Tests (10%)    │  ── Playwright (Full User Journeys)
               ├───────────────────────┤
               │ Integration Tests(30%)│  ── React Testing Library, Firebase Rules
               ├───────────────────────┤
               │   Unit Tests (60%)    │  ── Vitest (Parsers, Chunkers, Utilities)
               └───────────────────────┘
```

---

## 2. Unit Testing (`Vitest`)

Unit tests validate pure functions, chunking algorithms, prompt assemblers, and formatting helpers:
- **PDF Text Chunker**: Verify 800-character chunk splits and 150-character sliding overlaps without splitting words abnormally.
- **Markdown & Math Parser**: Verify LaTeX syntax extraction and safe HTML escaping.
- **Citation Parser**: Test accurate bracket citation identification (`[1]`, `[2]`).

---

## 3. Firebase Security Rules Testing (`@firebase/rules-unit-testing`)

Automated rules tests guarantee that unauthorized users cannot bypass data isolation:
```typescript
import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing';

describe('Firestore Security Rules', () => {
  it('should prevent User A from reading User B conversations', async () => {
    const testEnv = await initializeTestEnvironment({ projectId: 'cognix-test' });
    const userAContext = testEnv.authenticatedContext('user_a');
    const userBConversationRef = userAContext.firestore().doc('conversations/conv_user_b');

    await assertFails(userBConversationRef.get());
  });
});
```

---

## 4. AI-Specific Mocking & Deterministic Testing

Testing LLM responses without incurring external API costs or non-deterministic failures:
1. **Mock SSE Generator**: Simulates token-by-token streaming chunks in test environments.
2. **Fixed Golden Fixtures**: Standard prompt/response pairs used for regression testing formatting renderers and code block syntax highlighters.

---

## 5. End-to-End (E2E) Testing (`Playwright`)

Playwright executes key user flows against local emulators:
1. User registration & Google OAuth simulation.
2. Sending a prompt and verifying that streaming tokens appear on screen.
3. Uploading a test PDF and verifying that the document chip status becomes "Ready".
4. Verifying that clicking "Stop Generation" terminates the stream immediately.
5. Verifying that dark/light theme toggle updates CSS variables correctly.
