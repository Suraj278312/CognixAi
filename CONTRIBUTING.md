# Contributing Guidelines & Engineering Standards — Cognix

Thank you for contributing to **Cognix**! To maintain high code quality, security, and architectural integrity, all contributors and AI coding assistants must adhere to the guidelines outlined below.

---

## 1. Code of Conduct & Core Engineering Tenets

1. **Simplicity First**: Write clean, readable, self-documenting code over clever, convoluted abstractions.
2. **Type Safety Without Compromise**: Strict TypeScript is mandatory. Avoid `any` or loose type assertions (`as unknown as T`).
3. **Component Modularity**: Keep React components focused, small, and decoupled from heavy business logic using custom hooks.
4. **Security by Default**: Never commit API keys, bypass Firebase security rules, or disable client-side input validation.

---

## 2. Git Workflow & Branching Strategy

We follow the standard **GitHub Flow**:

### 2.1 Branch Naming Conventions
All branch names must be prefixed with the work category:
- `feat/feature-name` (e.g. `feat/pdf-chunking-pipeline`)
- `fix/bug-description` (e.g. `fix/streaming-abort-cleanup`)
- `docs/doc-topic` (e.g. `docs/firestore-schema-update`)
- `refactor/scope` (e.g. `refactor/chat-state-hooks`)
- `test/test-scope` (e.g. `test/rules-unit-tests`)

### 2.2 Commit Message Convention (Conventional Commits)
All commit messages must follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```text
<type>(<scope>): <short summary in imperative mood>

[optional body explaining WHY the change was made]

[optional footer(s) referencing issue numbers]
```

#### Allowed Types:
- `feat`: A new feature for the user or system.
- `fix`: A bug fix.
- `docs`: Documentation changes only.
- `style`: Changes that do not affect the meaning of the code (white-space, formatting).
- `refactor`: A code change that neither fixes a bug nor adds a feature.
- `perf`: A code change that improves performance.
- `test`: Adding missing tests or correcting existing tests.
- `chore`: Changes to build process, dependency updates, or tooling configuration.

*Example:* `feat(chat): implement server-sent events streaming for Gemini 1.5 Flash`

---

## 3. TypeScript & React Guidelines

- **File Extensions**: Use `.tsx` for files containing JSX markup, `.ts` for pure logic, utilities, types, and hooks.
- **Naming Conventions**:
  - `PascalCase` for React components (`MessageItem.tsx`, `MemoryManager.tsx`).
  - `camelCase` for utilities, custom hooks, and instances (`useChatStream.ts`, `formatDate.ts`).
  - `SCREAMING_SNAKE_CASE` for global constants (`MAX_PDF_SIZE_BYTES`, `DEFAULT_SYSTEM_PROMPT`).
- **Props Interfaces**: Explicitly define an interface for every component's props (e.g. `interface MessageItemProps { ... }`).
- **Hook Rules**: Never call hooks conditionally. Encapsulate multi-step state logic inside custom hooks.

---

## 4. Pull Request (PR) Checklist

Before submitting a Pull Request, ensure that:
1. [ ] Branch is rebased onto the latest `main` branch.
2. [ ] TypeScript compiler runs clean with zero errors: `npm run type-check`.
3. [ ] ESLint and Prettier checks pass: `npm run lint`.
4. [ ] Relevant unit and integration tests pass: `npm test`.
5. [ ] Architecture changes (if any) are reflected in `ARCHITECTURE.md` and related docs.
6. [ ] No sensitive credentials, secrets, or `.env` files are included.

---

## 5. Documentation Maintenance

Documentation is treated as first-class code in Cognix. If a PR modifies an API contract, Firestore schema, or UI design pattern, the corresponding documentation in `docs/` must be updated within the same PR.
