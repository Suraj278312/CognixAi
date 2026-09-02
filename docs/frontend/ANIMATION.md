# Animation & Motion System Specification — Cognix

**Document Version:** 1.0.0  
**Frontend Lead:** Senior UX & Animation Engineer  

---

## 1. Motion Philosophy

Motion in Cognix is **purposeful, subtle, and high-performance**. Animations exist exclusively to provide feedback, orient the user spatially, and convey the living intelligence of the assistant—never for superficial distraction.

---

## 2. Core Motion Patterns (Framer Motion)

### 2.1 Message Entrance & Spring Physics
New messages enter with an upward translate and gentle opacity fade:
```typescript
export const messageVariants = {
  initial: { opacity: 0, y: 12, scale: 0.98 },
  animate: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { 
      type: 'spring', 
      stiffness: 350, 
      damping: 28 
    } 
  },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.15 } }
};
```

### 2.2 Streaming Cursor Pulse
The streaming cursor indicates active LLM generation with a calming 800ms pulse:
```typescript
export const streamingCursorAnimation = {
  animate: {
    opacity: [0.2, 1, 0.2],
    transition: {
      duration: 0.8,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};
```

### 2.3 Sidebar Drawer Transition
```typescript
export const sidebarVariants = {
  open: { 
    x: 0, 
    width: 260,
    transition: { ease: [0.16, 1, 0.3, 1], duration: 0.28 } 
  },
  closed: { 
    x: -260, 
    width: 0,
    transition: { ease: [0.16, 1, 0.3, 1], duration: 0.22 } 
  }
};
```

### 2.4 Modal Backdrop & Dialog Entrance
```typescript
export const modalBackdropVariants = {
  hidden: { opacity: 0, backdropFilter: 'blur(0px)' },
  visible: { opacity: 1, backdropFilter: 'blur(8px)', transition: { duration: 0.2 } },
  exit: { opacity: 0, backdropFilter: 'blur(0px)', transition: { duration: 0.15 } }
};

export const modalDialogVariants = {
  hidden: { opacity: 0, scale: 0.96, y: 8 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0, 
    transition: { type: 'spring', stiffness: 400, damping: 30 } 
  },
  exit: { opacity: 0, scale: 0.96, transition: { duration: 0.12 } }
};
```

---

## 3. Hardware Acceleration & Performance Guardrails

1. **GPU-Only Transforms**: Animations animate solely `transform` (`x`, `y`, `scale`) and `opacity`. Animating layout dimensions (`top`, `margin`, `padding`) is strictly prohibited.
2. **Will-Change Management**: Applied selectively on active stream containers and drawers, removed upon animation completion.

---

## 4. Accessibility & Reduced Motion Support

Cognix respects operating system accessibility preferences. When `prefers-reduced-motion: reduce` is enabled:
- Spring translations and positional shifts are disabled.
- Motion simplifies to instantaneous opacity transitions (`duration: 0.05s`).
- Streaming cursor renders as a static solid bar.
