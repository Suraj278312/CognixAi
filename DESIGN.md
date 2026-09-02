# Design Direction & System Specification — Cognix

**Document Version:** 1.0.0  
**Design Lead:** Senior UX Strategist & Lead Product Architect  
**Design Philosophy:** "Calm Intelligence" — Minimal, purposeful, and refined without visual clutter or generic clone aesthetics.

---

## 1. Brand Identity & Personality

Cognix is crafted around the concept of **Calm Intelligence**. It provides a distraction-free, aesthetically pleasing environment where humans and AI collaborate effortlessly.

### Personality Pillars
- **Professional**: Clean lines, balanced typography, reliable execution.
- **Friendly & Approachable**: Warm micro-interactions, humane tone, gentle transitions.
- **Intelligent**: Precise formatting, high-density syntax highlighting, well-structured citations.
- **Modern**: Subtle glassmorphism, refined border elevations, sleek dark and light palettes.
- **Trustworthy**: Explicit source badges, transparent memory controls, zero hidden tricks.
- **Minimal & Calm**: Abundant breathing room, restrained color accents, absence of sensory overload.

---

## 2. Design Principles (Avoiding the "Generic Clone" Trap)

1. **Depth Through Layering, Not Heavy Borders**: Use subtle background elevation (`surface-0`, `surface-1`, `surface-2`) and gentle backdrop blurs (`backdrop-blur-md`) rather than harsh solid borders.
2. **Context-Aware Floating Workspaces**: Tools like document chips, web search status toggles, and memory indicators float gracefully inside an integrated input command bar.
3. **Adaptive Asymmetry**: Clean distinction between user message cards (compact, right-aligned or high-contrast accent) and assistant responses (full-width typography with rich formatting).
4. **Purposeful Motion**: Every animation informs the user of state (e.g. streaming pulse indicator, gentle drawer expansion, spring-damped modal entrances).

---

## 3. Color System & Semantic Palette

Cognix uses a tailored HSL color system designed for deep visual comfort across dark and light modes.

### 3.1 Dark Mode (Primary Default)
```css
:root[data-theme="dark"] {
  /* Surfaces & Backgrounds */
  --bg-app: hsl(222, 47%, 7%);           /* #0a0e17 - Deep midnight background */
  --bg-surface-1: hsl(222, 44%, 11%);     /* #0f172a - Sidebar & Card surfaces */
  --bg-surface-2: hsl(222, 40%, 15%);     /* #162036 - Elevated cards, dropdowns */
  --bg-surface-3: hsl(222, 38%, 20%);     /* #1f2d4d - Hover states & active chips */

  /* Borders & Dividers */
  --border-subtle: hsl(222, 30%, 18%);   /* Subtle section dividers */
  --border-strong: hsl(222, 30%, 28%);   /* Interactive borders & inputs */

  /* Typography & Foreground */
  --text-primary: hsl(210, 40%, 98%);     /* High contrast body & headers */
  --text-secondary: hsl(215, 20%, 70%);   /* Secondary info, dates, metadata */
  --text-muted: hsl(215, 16%, 48%);       /* Placeholders, disabled states */

  /* Brand Accents (Electric Indigo / Cyan) */
  --brand-primary: hsl(245, 82%, 67%);    /* #6366f1 - Electric Indigo */
  --brand-primary-hover: hsl(245, 82%, 73%);
  --brand-glow: hsla(245, 82%, 67%, 0.15);/* Glow accents for active states */
  --brand-accent: hsl(188, 86%, 53%);     /* #22d3ee - Cyan highlight */

  /* Semantic Feedback */
  --color-success: hsl(158, 64%, 52%);    /* #22c55e */
  --color-warning: hsl(38, 92%, 50%);     /* #f59e0b */
  --color-error: hsl(0, 84%, 60%);        /* #ef4444 */
  --color-info: hsl(217, 91%, 60%);       /* #3b82f6 */
}
```

### 3.2 Light Mode
```css
:root[data-theme="light"] {
  /* Surfaces & Backgrounds */
  --bg-app: hsl(210, 40%, 98%);           /* #f8fafc - Crisp soft white */
  --bg-surface-1: hsl(0, 0%, 100%);       /* #ffffff - Card & Sidebar white */
  --bg-surface-2: hsl(210, 40%, 95%);     /* #f1f5f9 - Elevated chips & hovers */
  --bg-surface-3: hsl(214, 32%, 91%);     /* #e2e8f0 - Active state borders */

  /* Borders & Dividers */
  --border-subtle: hsl(214, 32%, 91%);
  --border-strong: hsl(215, 25%, 80%);

  /* Typography */
  --text-primary: hsl(222, 47%, 11%);     /* Deep slate text */
  --text-secondary: hsl(215, 25%, 40%);
  --text-muted: hsl(215, 16%, 60%);

  /* Brand Accents */
  --brand-primary: hsl(245, 75%, 58%);
  --brand-primary-hover: hsl(245, 75%, 50%);
  --brand-glow: hsla(245, 75%, 58%, 0.12);
  --brand-accent: hsl(190, 95%, 39%);
}
```

---

## 4. Typography Scale

Cognix adopts the **Inter** / **Geist** typeface family for optimal legibility, tabular numbers, and high code density readability.

| Token | Size | Line Height | Weight | Usage |
| :--- | :--- | :--- | :--- | :--- |
| `text-display` | 32px (2rem) | 1.2 | 700 (Bold) | Welcome screens, Hero titles |
| `text-h1` | 24px (1.5rem) | 1.3 | 600 (Semibold) | Modal headers, View titles |
| `text-h2` | 20px (1.25rem) | 1.35 | 600 (Semibold) | Assistant section headings |
| `text-h3` | 16px (1rem) | 1.4 | 600 (Semibold) | Card titles, Sidebar group headers |
| `text-body` | 15px (0.9375rem) | 1.6 | 400 (Regular) | Primary chat bubbles, markdown paragraphs |
| `text-body-sm` | 13px (0.8125rem) | 1.5 | 400 (Regular) | Secondary descriptions, timestamps, citations |
| `text-caption` | 11px (0.6875rem) | 1.4 | 500 (Medium) | Badges, keyboard shortcut tags, pill labels |
| `text-code` | 13.5px | 1.55 | 400 (Regular) | Fenced code blocks, inline `<code>` snippets (JetBrains Mono / Fira Code) |

---

## 5. Spacing, Elevation & Radii

### 5.1 Spacing Grid
Based on an **8px base system** with 4px half-steps:
- `space-1`: 4px (micro gaps between badge icons)
- `space-2`: 8px (input padding, button internal gap)
- `space-3`: 12px (card compact internal padding)
- `space-4`: 16px (standard component padding, chat message gap)
- `space-6`: 24px (section margins, modal container padding)
- `space-8`: 32px (layout gutters)
- `space-12`: 48px (hero spacing, empty state offsets)

### 5.2 Border Radius
- `radius-sm`: 6px (buttons, input fields, code tags)
- `radius-md`: 10px (dropdown menus, user chat cards, document preview cards)
- `radius-lg`: 16px (modals, command bar floating container)
- `radius-full`: 9999px (avatar circles, status pills, citation badges)

### 5.3 Elevation Shadows
- `shadow-subtle`: `0 1px 3px 0 hsla(0, 0%, 0%, 0.1), 0 1px 2px -1px hsla(0, 0%, 0%, 0.1)`
- `shadow-elevated`: `0 10px 25px -5px hsla(0, 0%, 0%, 0.25), 0 8px 10px -6px hsla(0, 0%, 0%, 0.2)`
- `shadow-floating`: `0 20px 35px -10px hsla(0, 0%, 0%, 0.35), 0 0 15px hsla(245, 82%, 67%, 0.1)`

---

## 6. Component Specifications

### 6.1 Chat Layout & Floating Command Bar
```text
+-----------------------------------------------------------------------------------+
|  [Sidebar Toggle]  Cognix [Model Badge: Gemini 1.5 Pro]           [User Avatar]   |
+-------------------+---------------------------------------------------------------+
|                   |                                                               |
|  [+ New Chat]     |  [Assistant Message]                                          |
|                   |  Hello! I am Cognix. How can I help you today?                |
|  TODAY            |                                                               |
|  - RAG Architect..|  [User Message Card]                                          |
|  - Next.js Setup  |  Explain how RAG chunking works with 150-char overlap.        |
|                   |                                                               |
|  YESTERDAY        |  [Assistant Message - Streaming]                              |
|  - Python Debug.. |  Chunking is the process of breaking large documents into... ▎|
|                   |  [Source Citation [1] "RAG Guide.pdf" p. 4]                   |
|                   |                                                               |
|                   |  +---------------------------------------------------------+  |
|                   |  | [📎 PDF Chip: rag_paper.pdf] [🌐 Web Search: ON]         |  |
|                   |  | Ask anything or drop a PDF...                    [⚡ Send] |  |
|                   |  +---------------------------------------------------------+  |
+-------------------+---------------------------------------------------------------+
```

### 6.2 Assistant Message Rendering
- **Markdown Headers**: Distinct visual weight with subtle bottom border on `##` and `###`.
- **Code Blocks**: Dark background (`bg-[#0d1117]`), language identifier pill in header, one-click copy button with checkmark animation on success, syntax highlighted via Prism/Shiki.
- **Inline Citations**: Rendered as interactive pills (e.g. `[1]`, `[2]`). Hovering reveals a mini popover preview card with the source title, domain, or PDF page number.
- **Action Toolbar**: Floating hover toolbar under assistant response with:
  - 📋 Copy full text
  - 🔄 Regenerate response
  - 👍 / 👎 Quality feedback

### 6.3 Document Intelligence Attachment Chip
- Pill badge displayed above input box when documents are attached:
  - Icon: Document PDF icon (colored red/orange)
  - Title: Truncated filename (e.g. `quarterly_report.pdf`)
  - Size indicator: `(2.4 MB)`
  - Status indicator: Spinner while parsing, Green checkmark when indexed
  - Action: `[✕]` remove button

### 6.4 Long-Term Memory Notification & Drawer
- When Cognix detects a new user preference during conversation, a subtle, unobtrusive toast pill appears at the bottom-right:
  - `💡 Remembered: "Prefers TypeScript strict mode examples"`
  - Action link: `Manage Memories`

---

## 7. Interaction & Animation Principles

Cognix uses **Framer Motion** for silky 60fps micro-animations.

1. **Streaming Cursor**: A smoothly pulsing vertical bar (`▎`) with a 750ms ease-in-out opacity loop (`opacity: 0.2 -> 1.0`).
2. **Message Arrival**: Messages slide up 8px with a subtle spring transition (`tension: 300, friction: 25`).
3. **Sidebar Drawer Transition**: Smooth slide-in/out (`width: 0 -> 260px`, `ease: [0.16, 1, 0.3, 1]`) with scrim backdrop on mobile.
4. **Modal Dialogs**: Scale from `0.96 -> 1.0` combined with backdrop blur fade (`backdrop-filter: blur(8px)`).
5. **Accessibility / Reduced Motion**: Respect `prefers-reduced-motion` media queries by disabling spring translations and using instantaneous opacity fades.

---

## 8. UX States & Edge Cases

### 8.1 Empty States
- **Home / New Chat**: Centered Cognix logo with a subtle ambient radial glow, welcoming headline, and 4 curated starter prompt cards (e.g. "Summarize a research PDF", "Debug a TypeScript function", "Explain quantum computing", "Search recent tech news").

### 8.2 Loading States
- **Document Processing**: Skeleton shimmer over document chip with real-time percentage text.
- **Thinking / Pre-token State**: Three pulsing ambient dots before the first token arrives.

### 8.3 Error States
- **Stream Interruption / Rate Limit**: Inline error banner with friendly recovery action:
  - `⚠️ Network connection dropped while streaming. [Retry Turn]`
  - `⏳ Gemini rate limit reached. Retrying automatically in 4s...`

---

## 9. Responsive Layout Breakpoints

- **Desktop (>= 1024px)**: Dual-pane layout. Left sidebar fixed (260px wide, collapsible). Main chat area centered with max-width `768px` for optimal reading line length.
- **Tablet (768px - 1023px)**: Left sidebar collapsed into an overlay drawer. Chat canvas dynamically resizes.
- **Mobile (< 768px)**: Fullscreen chat view. Sticky top bar with menu hamburger button and new chat icon. Floating bottom command bar optimized for touch targets (minimum 44x44px touch targets).
