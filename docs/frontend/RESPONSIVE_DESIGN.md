# Responsive Design & Multi-Device Specifications — Cognix

**Document Version:** 1.0.0  
**Design & Frontend Lead:** Senior UX & Frontend Architect  

---

## 1. Breakpoint System & Target Viewports

Cognix is engineered to deliver a seamless, high-performance experience across all screen sizes:

| Breakpoint | Range | Device Types | Layout Strategy |
| :--- | :--- | :--- | :--- |
| **Mobile (`<768px`)** | `320px` to `767px` | Smartphones (iOS, Android) | Single column, overlay drawer sidebar, sticky touch command bar. |
| **Tablet (`768px - 1023px`)** | `768px` to `1023px` | iPads, Tablets, Foldables | Adaptive split canvas, collapsible slide-over sidebar. |
| **Desktop (`1024px - 1439px`)** | `1024px` to `1439px` | Laptops, Desktop Monitors | Fixed 260px collapsible sidebar, centered reading canvas (max 768px). |
| **Wide Desktop (`>=1440px`)** | `1440px+` | Ultra-wide displays | Multi-pane workspace with optional document side-by-side preview. |

---

## 2. Viewport Behavior Specifications

### 2.1 Mobile Experience (`<768px`)
- **Top Header**: Minimalist bar with hamburger icon (opens sidebar drawer), centered Cognix logo, and a "New Chat" icon.
- **Sidebar Drawer**: Slides over from left with a dark scrim backdrop. Swiping left or tapping outside dismisses the drawer.
- **Touch Targets**: All interactive elements (send button, copy button, sidebar rows) maintain a minimum hit box of `44px x 44px`.
- **Command Input**: Sticky bottom container with auto-expanding textarea (max height 120px) preventing viewport jumps when virtual keyboards open (`viewport-fit=cover` and `dvh` dynamic viewport height units).

### 2.2 Desktop Experience (`>=1024px`)
- **Sidebar**: Permanently docked left navigation with smooth collapse toggle (`Ctrl + \` / `Cmd + \`).
- **Reading Canvas**: Chat bubbles maintain a maximum width of `768px` (`max-w-3xl`) to ensure optimal typography line-length (50-75 characters per line for reading comfort).

---

## 3. Dynamic Viewport Handling & Mobile Virtual Keyboards

To prevent iOS Safari and Android Chrome virtual keyboard layout thrashing:
```css
/* Responsive container height */
.app-container {
  height: 100vh;
  height: 100dvh; /* Dynamic viewport units */
}
```
Chat scroll position automatically snaps to the latest incoming streaming token, while preserving user scroll-up overrides when the user manually reviews earlier history.
