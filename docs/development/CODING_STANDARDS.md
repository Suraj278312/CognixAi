# Coding Standards & TypeScript Guidelines — Cognix

**Document Version:** 1.0.0  
**Engineering Lead:** Lead Software Architect  

---

## 1. Core Principles & Philosophy

1. **Explicit Over Implicit**: Code should be readable and obvious. Avoid cryptic one-letter variables or excessive abstraction.
2. **Strict Type Safety**: Never use `any`. Use generics, discriminated unions, and strong typing for all API payloads and component props.
3. **Immutability by Default**: Prefer `const` over `let`, treat state as immutable, and avoid mutating array or object references directly.

---

## 2. TypeScript Guidelines

### 2.1 Compiler Configuration (`tsconfig.json`)
Cognix enforces strict compiler settings:
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### 2.2 Discriminated Unions for State Handling
When modeling async states (e.g. streaming or uploads), use discriminated unions rather than multiple disjoint boolean flags:

```typescript
// PREFERRED: Discriminated union
export type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };

// AVOID: Fragmented boolean flags
// const [isLoading, setIsLoading] = useState(false);
// const [isError, setIsError] = useState(false);
```

---

## 3. React Component Best Practices

1. **Functional Components Only**: Class components are forbidden.
2. **Explicit Props Interfaces**:
   ```typescript
   export interface ChatInputProps {
     onSendMessage: (text: string, attachedDocs?: string[]) => void;
     isStreaming: boolean;
     onStopStream: () => void;
     disabled?: boolean;
   }
   ```
3. **Logic Decoupling**: Isolate complex multi-step state operations into custom hooks (`useChat`, `usePDFParser`).
4. **Error Boundaries**: Wrap major feature boundaries (`ChatCanvas`, `Sidebar`) in React Error Boundaries to prevent a single component crash from breaking the entire application.

---

## 4. File Organization & Imports

Order imports consistently using the following grouping convention:
1. React and Next.js built-ins (`react`, `next/link`, `next/navigation`).
2. Third-party packages (`firebase/*`, `@google/genai`, `framer-motion`, `lucide-react`).
3. Internal library clients and configs (`@/lib/firebase`, `@/config/constants`).
4. Components and UI primitives (`@/components/ui/*`).
5. Types and interfaces (`@/types/*`).
6. Styles and CSS modules.
