# Design System — Community Events Board

> **Status**: Proposed design tokens and component guidelines. No UI components have been implemented yet. This document defines the Claymorphism design language that will guide all UI development.

---

## Table of Contents

1. [Design Philosophy](#design-philosophy)
2. [Color Palette](#color-palette)
3. [Background and Surface Styles](#background-and-surface-styles)
4. [Typography](#typography)
5. [Spacing Scale](#spacing-scale)
6. [Border Radius](#border-radius)
7. [Shadow System](#shadow-system)
8. [Component Guidelines](#component-guidelines)
9. [Event Card Themes](#event-card-themes)
10. [Responsive Breakpoints](#responsive-breakpoints)
11. [Interaction States](#interaction-states)
12. [Feedback States](#feedback-states)
13. [Accessibility](#accessibility)
14. [Anti-Patterns](#anti-patterns)

---

## Design Philosophy

**Claymorphism** creates a tactile, friendly UI by combining:
- Soft pastel backgrounds that feel warm and approachable
- Raised elements with dual (highlight + shadow) box shadows that simulate depth
- Generous border radii that eliminate sharp edges
- Restrained animations that feel physical rather than flashy

The result should feel like a carefully arranged bulletin board — clear, welcoming, and easy to scan.

---

## Color Palette

Define these as CSS custom properties in `src/app/globals.css`. Components reference tokens, never raw hex values.

### Core Tokens

```css
:root {
  /* Page backgrounds */
  --color-bg-page:          #F0EAF8;   /* soft lavender */
  --color-bg-surface:       #FDFBFF;   /* near-white surface */
  --color-bg-sunken:        #E8E0F0;   /* inset / input background */

  /* Brand / accent */
  --color-accent-primary:   #A78BFA;   /* violet */
  --color-accent-secondary: #F9A8D4;   /* pink */
  --color-accent-success:   #6EE7B7;   /* mint green */
  --color-accent-warning:   #FCD34D;   /* amber */
  --color-accent-danger:    #FCA5A5;   /* soft red */

  /* Text */
  --color-text-primary:     #2D1B4E;   /* deep purple — high contrast */
  --color-text-secondary:   #6B5C8A;   /* muted purple */
  --color-text-disabled:    #B0A0C8;   /* low-contrast placeholder */
  --color-text-inverse:     #FFFFFF;

  /* Borders */
  --color-border:           #D8CEE8;
  --color-border-focus:     #A78BFA;

  /* Shadows (used in box-shadow values) */
  --shadow-highlight:       rgba(255, 255, 255, 0.75);
  --shadow-drop:            rgba(90, 60, 130, 0.22);
  --shadow-drop-strong:     rgba(90, 60, 130, 0.35);
}
```

### Category Accent Colors

Used for category badges and card accent borders.

```css
:root {
  --color-cat-music:    #DDD6FE;   /* violet tint */
  --color-cat-workshop: #FDE68A;   /* amber tint */
  --color-cat-food:     #FCA5A5;   /* rose tint */
  --color-cat-sports:   #A7F3D0;   /* green tint */
  --color-cat-kids:     #FBCFE8;   /* pink tint */

  --color-cat-music-text:    #5B21B6;
  --color-cat-workshop-text: #92400E;
  --color-cat-food-text:     #991B1B;
  --color-cat-sports-text:   #065F46;
  --color-cat-kids-text:     #9D174D;
}
```

---

## Background and Surface Styles

| Context | Token | Usage |
|---|---|---|
| Page background | `--color-bg-page` | `<body>`, outermost layout wrapper |
| Card / panel | `--color-bg-surface` | Event cards, dialogs, navbars |
| Input / sunken area | `--color-bg-sunken` | Text inputs, select boxes, textareas |

### Surface CSS Pattern

```css
.surface {
  background-color: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-raised);
}
```

---

## Typography

The application uses the **Geist Sans** and **Geist Mono** fonts already loaded in `layout.tsx`.

```css
:root {
  --font-sans: var(--font-geist-sans), 'Inter', system-ui, sans-serif;
  --font-mono: var(--font-geist-mono), 'Fira Code', monospace;

  /* Scale */
  --text-xs:   0.75rem;    /* 12px — labels, meta */
  --text-sm:   0.875rem;   /* 14px — secondary text */
  --text-base: 1rem;       /* 16px — body */
  --text-lg:   1.125rem;   /* 18px — card titles */
  --text-xl:   1.25rem;    /* 20px — section headings */
  --text-2xl:  1.5rem;     /* 24px — page headings */
  --text-3xl:  1.875rem;   /* 30px — hero heading */

  /* Weight */
  --font-regular:   400;
  --font-medium:    500;
  --font-semibold:  600;
  --font-bold:      700;

  /* Line height */
  --leading-tight:  1.25;
  --leading-normal: 1.5;
  --leading-loose:  1.75;
}
```

### Type Hierarchy

| Element | Size token | Weight | Color token |
|---|---|---|---|
| Hero heading (h1) | `--text-3xl` | bold | `--color-text-primary` |
| Page heading (h2) | `--text-2xl` | semibold | `--color-text-primary` |
| Section heading (h3) | `--text-xl` | semibold | `--color-text-primary` |
| Card title | `--text-lg` | semibold | `--color-text-primary` |
| Body | `--text-base` | regular | `--color-text-primary` |
| Secondary / meta | `--text-sm` | regular | `--color-text-secondary` |
| Caption / label | `--text-xs` | medium | `--color-text-secondary` |

---

## Spacing Scale

All spacing uses a base-4 scale (matching Tailwind's default scale):

```css
:root {
  --space-1:  0.25rem;   /*  4px */
  --space-2:  0.5rem;    /*  8px */
  --space-3:  0.75rem;   /* 12px */
  --space-4:  1rem;      /* 16px */
  --space-5:  1.25rem;   /* 20px */
  --space-6:  1.5rem;    /* 24px */
  --space-8:  2rem;      /* 32px */
  --space-10: 2.5rem;    /* 40px */
  --space-12: 3rem;      /* 48px */
  --space-16: 4rem;      /* 64px */
}
```

Standard card padding: `--space-6` (24px).
Standard section gap: `--space-8` (32px).

---

## Border Radius

```css
:root {
  --radius-sm:   0.5rem;    /*  8px — badges, tags */
  --radius-md:   0.75rem;   /* 12px — buttons, inputs */
  --radius-card: 1.25rem;   /* 20px — cards */
  --radius-xl:   1.75rem;   /* 28px — dialogs, hero panels */
  --radius-full: 9999px;    /* pill — chips, avatar */
}
```

---

## Shadow System

Claymorphism uses a **dual-layer shadow**: a soft white highlight above-left and a coloured drop shadow below-right.

```css
:root {
  /* Standard raised surface */
  --shadow-raised:
    -3px -3px 8px var(--shadow-highlight),
     4px  4px 12px var(--shadow-drop);

  /* More prominent raised (hover, focused card) */
  --shadow-raised-lg:
    -4px -4px 12px var(--shadow-highlight),
     6px  6px 18px var(--shadow-drop-strong);

  /* Pressed / active state */
  --shadow-pressed:
    inset -2px -2px 5px var(--shadow-highlight),
    inset  2px  2px 6px var(--shadow-drop);

  /* Sunken input field */
  --shadow-inset:
    inset 2px 2px 5px var(--shadow-drop),
    inset -1px -1px 4px var(--shadow-highlight);

  /* Subtle — used for navbar and footer */
  --shadow-subtle:
    0 2px 8px rgba(90, 60, 130, 0.12);
}
```

### Shadow Rules

1. Cards at rest: `--shadow-raised`
2. Cards on hover: transition to `--shadow-raised-lg`
3. Buttons at rest: `--shadow-raised`
4. Buttons on `active`/press: `--shadow-pressed`
5. Text inputs: `--shadow-inset`
6. Dialogs / modals: `--shadow-raised-lg` + a semi-transparent page overlay

---

## Component Guidelines

> Component implementations are proposed. This section defines the expected visual contract for each component.

### Buttons

Three variants:

| Variant | Background | Text | Shadow |
|---|---|---|---|
| Primary | `--color-accent-primary` | `--color-text-inverse` | `--shadow-raised` |
| Secondary | `--color-bg-surface` | `--color-text-primary` | `--shadow-raised` |
| Danger | `--color-accent-danger` | `#7F1D1D` | `--shadow-raised` |

- Border radius: `--radius-md`
- Padding: `--space-3` vertical, `--space-6` horizontal
- Font: `--font-semibold`, `--text-sm`
- Transition: `box-shadow 150ms ease, transform 100ms ease`
- Active state: `transform: translateY(1px); box-shadow: var(--shadow-pressed)`
- Disabled: `opacity: 0.5; cursor: not-allowed`

### Inputs and Textareas

- Background: `--color-bg-sunken`
- Border: `1px solid --color-border`
- Border radius: `--radius-md`
- Shadow: `--shadow-inset`
- Focus ring: `2px solid --color-border-focus`, `outline: none`
- Placeholder color: `--color-text-disabled`

### Cards

- Background: `--color-bg-surface`
- Border: `1px solid --color-border`
- Border radius: `--radius-card`
- Shadow: `--shadow-raised`
- Hover: `shadow: --shadow-raised-lg; transform: translateY(-2px)`
- Transition: `transform 200ms ease, box-shadow 200ms ease`
- Padding: `--space-6`

### Badges / Category Tags

- Background: category accent color (e.g. `--color-cat-music`)
- Text: category text color (e.g. `--color-cat-music-text`)
- Border radius: `--radius-sm`
- Padding: `--space-1` vertical, `--space-3` horizontal
- Font: `--text-xs`, `--font-medium`

### Dialogs / Modals

- Background: `--color-bg-surface`
- Border radius: `--radius-xl`
- Shadow: `--shadow-raised-lg`
- Backdrop: `rgba(45, 27, 78, 0.4)` semi-transparent overlay
- Max width: 480px (mobile-first; grows with container)

### Navigation

- Background: `--color-bg-surface`
- Bottom border: `1px solid --color-border`
- Shadow: `--shadow-subtle`
- Active link: `--color-accent-primary` underline or background tint
- Height: 64px (desktop), 56px (mobile)

---

## Event Card Themes

Themes control the card's background gradient, shadow colour, and accent strip. The user selects a theme in the card designer. Applied via a CSS class or data attribute.

| Theme | Background | Shadow colour | Accent |
|---|---|---|---|
| `pastel-cloud` | `#FDFBFF` → `#EDE9F8` | `rgba(90,60,130,0.22)` | violet `#A78BFA` |
| `sunset-peach` | `#FFF7ED` → `#FDE2CC` | `rgba(180,80,30,0.22)` | peach `#FB923C` |
| `mint-fresh` | `#F0FFF4` → `#D1FAE5` | `rgba(6,95,70,0.22)` | mint `#34D399` |
| `sky-blue` | `#EFF6FF` → `#DBEAFE` | `rgba(30,58,138,0.22)` | sky `#60A5FA` |
| `lilac-dream` | `#FAF5FF` → `#EDE9FE` | `rgba(109,40,217,0.22)` | lilac `#C084FC` |

---

## Responsive Breakpoints

Following Tailwind CSS v4 defaults:

| Name | Min width | Usage |
|---|---|---|
| `sm` | 640px | Single-column → two-column transitions |
| `md` | 768px | Side-by-side filter panel |
| `lg` | 1024px | Three-column event grid |
| `xl` | 1280px | Wider content max-width |

Content max-width: `1280px` centred with horizontal padding `--space-4` (mobile) → `--space-8` (desktop).

Event grid columns: 1 (mobile) → 2 (sm) → 3 (lg).

---

## Interaction States

| State | Effect |
|---|---|
| `:hover` (card) | `translateY(-2px)`, `--shadow-raised-lg` |
| `:hover` (button) | Slight background lightening, `--shadow-raised-lg` |
| `:active` (button) | `translateY(1px)`, `--shadow-pressed` |
| `:focus-visible` | `2px solid --color-border-focus` outline, `outline-offset: 2px` |
| `:disabled` | `opacity: 0.5`, no pointer events |
| `:checked` / selected | Accent background on toggle/chip |

All interactive transitions use `150ms ease` or `200ms ease`. Avoid transitions longer than `300ms` for routine interactions.

---

## Feedback States

### Loading

- Skeleton screens matching the card shape (pulsing opacity animation).
- Spinner icon (Lucide `Loader2` with `animate-spin`) for button loading states.
- Do not show blank pages; always show skeletons while data loads.

### Empty State

- Centred illustration or large icon.
- Friendly heading: "No events found."
- Subtext suggesting an action: "Try adjusting your filters."
- Optional CTA button.

### Success State

- Brief toast notification (bottom-right, auto-dismiss after 4 seconds).
- Background: `--color-accent-success` tint.
- Icon: Lucide `CheckCircle`.

### Error State

- Inline error message below the relevant field (form validation).
- Toast for API errors.
- Background: `--color-accent-danger` tint.
- Icon: Lucide `AlertCircle`.

---

## Accessibility

### Contrast

All text colours must meet **WCAG AA** minimums (4.5:1 for normal text, 3:1 for large text). The `--color-text-primary` (#2D1B4E) on `--color-bg-surface` (#FDFBFF) achieves approximately 12:1. Verify category badge combinations individually with a contrast checker.

### Focus Management

- All interactive elements must have a visible `:focus-visible` ring.
- Dialogs must trap focus and return focus to the trigger on close.
- Skip-to-content link at the top of each page.

### Semantic HTML

- Use `<button>` for actions, `<a>` for navigation.
- Use `<nav>`, `<main>`, `<footer>`, `<section>`, `<article>` landmarks.
- Event cards rendered as `<article>` with a descriptive `aria-label`.

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

Card hover transforms and Framer Motion animations must respect this preference. Use `useReducedMotion()` from Framer Motion to disable animations conditionally.

---

## Anti-Patterns

Avoid these common Claymorphism mistakes:

| Anti-pattern | Why it hurts |
|---|---|
| Stacking more than two shadow layers | Creates visual noise; one highlight + one drop is enough |
| Using dark backgrounds | Destroys the soft, airy feel; keep surfaces near-white or very pale |
| Over-saturated category colours | Pastel tints only; high saturation looks jarring against soft backgrounds |
| Animating box-shadow directly | Expensive repaint; animate `transform` and `opacity` instead, or use `filter: drop-shadow` |
| Applying raised shadows to text | Shadows belong on surfaces (cards, buttons), not individual text nodes |
| Inconsistent border radii | Mix `--radius-sm` and `--radius-card` only where intentional; don't use arbitrary values |
| Excessive motion | Framer Motion is available but every animation must serve a UX purpose |
