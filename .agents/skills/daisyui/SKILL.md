---
name: daisyui
description: daisyUI is a Tailwind CSS component library that adds semantic, ready-to-use component classes (like `btn`, `card`, `navbar`, `modal`, etc.) on top of Tailwind CSS, allowing you to build beautiful, consistent UIs extremely fast without writing hundreds of utility classes.
---

# DaisyUI Skill Guide for Agents (2026)

## Overview

**daisyUI** is the most popular **Tailwind CSS component library**. It adds semantic, ready-to-use component classes (like `btn`, `card`, `navbar`, `modal`, etc.) on top of Tailwind CSS, allowing you to build beautiful, consistent UIs extremely fast without writing hundreds of utility classes.

**Key Advantages**:

- Pure CSS — zero JavaScript runtime overhead
- ~65 components (as of daisyUI 5.x in 2026)
- 500+ utility classes & modifiers
- Beautiful built-in **themes** (light, dark, and 30+ colorful themes)
- Highly customizable via Tailwind config or CSS variables
- Works with any framework: Angular, React, Vue, Svelte, Astro, Next.js, etc.
- Fully responsive and RTL-ready

**Official Documentation**: [https://daisyui.com/components/](https://daisyui.com/components/)

**Current Status (2026)**: daisyUI 5.x — still actively maintained and widely adopted.

## How to Use

Just add daisyUI class names directly in your HTML/JSX/TSX templates.

**Example (Button + Card)**:

```html
<button class="btn btn-primary">Save</button>

<div class="card bg-base-100 w-96 shadow-xl">
  <figure>
    <img
      src="..."
      alt="Shoes"
    />
  </figure>
  <div class="card-body">
    <h2 class="card-title">Shoes!</h2>
    <p>If a dog chews shoes whose shoes does he choose?</p>
    <div class="card-actions justify-end">
      <button class="btn btn-primary">Buy Now</button>
    </div>
  </div>
</div>
```

## All Available Components (Organized by Category)

### Actions

- **Button** — Primary building block with many variants (`btn-primary`, `btn-secondary`, `btn-outline`, `btn-ghost`, sizes, etc.)
- **FAB / Speed Dial** — Floating Action Button + expandable actions
- **Dropdown** — Click to open menu/content

### Data Display

- **Alert**
- **Avatar**
- **Badge**
- **Calendar**
- **Card**
- **Carousel**
- **Chat bubble**
- **Countdown**
- **Diff** (side-by-side comparison)
- **Hover Gallery** (product image hover)
- **Indicator** (badge on corner of element)
- **Kbd** (keyboard shortcut)
- **List** (new in v5 — clean vertical rows)
- **Progress** / **Radial Progress**
- **Table** (usually combined with Tailwind)

### Navigation

- **Breadcrumbs**
- **Dock** (bottom navigation / bottom bar)
- **Menu** (vertical or horizontal)
- **Navbar**
- **Pagination**
- **Tabs**
- **Link**

### Forms

- **Checkbox**
- **Radio**
- **Text Input** / **Input**
- **Textarea**
- **Select**
- **File Input**
- **Range** (slider)
- **Toggle**
- **Label**
- **Fieldset** (new in v5)
- **Filter** (radio group with hide/show logic)

### Layout & Feedback

- **Accordion**
- **Collapse**
- **Divider**
- **Drawer** (sidebar)
- **Footer**
- **Hero**
- **Join** (group buttons/inputs together)
- **Loading** (spinners)
- **Mask** (shape cropping)
- **Modal**
- **Progress**
- **Step**
- **Toast**

### Mockups

- **Browser mockup**
- **Code mockup**
- **Phone mockup**
- **Window mockup**

### Special / Others

- **Hover 3D Card**
- **Status** (small online/offline indicator — new in v5)

> Total: **~65 components** in daisyUI 5.x

## Important Modifiers & Utilities

- Color system: `primary`, `secondary`, `accent`, `neutral`, `base-100`, `info`, `success`, `warning`, `error`
- Sizes: `btn-sm`, `btn-lg`, `btn-xs`, `btn-wide`, etc.
- States: `btn-active`, `btn-disabled`, `btn-outline`
- Glassmorphism: `glass`
- Theme-aware: `bg-base-100`, `text-base-content`

## Best Practices for Agents

1. **Start with semantic classes** — Use `btn`, `card`, `navbar`, `modal`, etc. instead of writing raw Tailwind utilities whenever possible.
2. **Combine with Tailwind** — daisyUI does not replace Tailwind. Mix them freely (e.g., `card bg-base-100 shadow-xl p-6`).
3. **Use themes wisely**:
   - Switch theme with `data-theme="dark"` or via config.
   - Create custom themes easily.
4. **Accessibility** — daisyUI components are generally accessible, but always add proper `aria-*` attributes, labels, and focus states when building complex UIs.
5. **Responsive** — Most components are mobile-friendly by default. Use Tailwind responsive prefixes when needed.
6. **When to use daisyUI vs Angular Material / Angular Aria**:
   - Use **daisyUI** → when you want beautiful, customizable, lightweight UI quickly with full design control.
   - Use **Angular Aria** → when you need strict WCAG compliance and complex ARIA patterns (keyboard navigation, focus management).
   - Use both together → Very powerful combo (daisyUI for looks + Angular Aria for deep accessibility).

## Recommended Workflow for Building UI

1. Plan layout using daisyUI high-level components (`navbar`, `drawer`, `hero`, `card`, etc.).
2. Fill content with form elements, buttons, lists.
3. Customize colors, spacing, and typography using Tailwind + daisyUI theme variables.
4. Add interactions (modals, dropdowns, accordions).
5. Polish with hover effects, glass, 3D cards, etc.

## Related Resources

- All Components: https://daisyui.com/components/
- Themes: https://daisyui.com/docs/themes/
- Customization: https://daisyui.com/docs/customize/
- Config: https://daisyui.com/docs/config/
- Colors: https://daisyui.com/docs/colors/
