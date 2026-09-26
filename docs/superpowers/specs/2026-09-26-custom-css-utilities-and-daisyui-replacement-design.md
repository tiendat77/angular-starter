# Custom CSS Utility System & DaisyUI Replacement Design Spec

**Date:** 2026-09-26  
**Status:** Approved for Implementation  
**Topic:** Hybrid CSS-First Utilities and DaisyUI Removal  

---

## 1. Objective & Problem Statement

### 1.1 Problems with Current Setup
1. **DaisyUI 5 Dependency:** The application relies on the `@plugin "daisyui"` third-party package for basic component styling (`.btn`, `.card`, `.badge`, etc.), which adds opinionated color mappings, extra bundle size, and design constraints that clash with our custom design system tokens.
2. **Massive Tailwind Strings in TypeScript:** The current `@libs/ui/button` component uses verbose utility strings in `button.variants.ts` (e.g., `'bg-primary text-primary-content hover:bg-primary/90 focus-visible:outline-primary'`), making maintenance cumbersome and host HTML inspectability cluttered.
3. **High Friction for Simple Elements:** For simple buttons, developers must import `UiButtonDirective` in every Angular component `imports: [...]` array instead of using standard CSS classes.

### 1.2 Proposed Solution: The Dual/Hybrid Architecture
- **Layer 1: Native Tailwind CSS 4 Component Utilities:** Define custom, zero-dependency `@utility` classes in CSS (`.btn`, `.btn-primary`, `.btn-outline`, `.btn-sm`, etc.) mapped directly to project design tokens and CSS custom properties.
- **Layer 2: Concise Component Variants (`cva`):** In `@libs/ui/button`, simplify `button.variants.ts` so `cva` maps variants and sizes to these concise semantic class names (`btn btn-primary btn-md`).
- **Layer 3: Seamless Drop-in Compatibility:** Existing templates across the repository (`src/app/features/`, dialogs, auth screens) already using `class="btn btn-primary"` continue working with zero rewrites, paving the way to completely remove `@plugin "daisyui"`.

---

## 2. Architecture & Design

### 2.1 Foundation: Fix Missing Color Tokens (`src/styles/_themes.css`)

Previously, `--color-primary-content` and related content tokens were only injected into the page via the DaisyUI theme plugin in `src/styles/_daisyui.css` (`--color-primary-content: #ffffff`). With DaisyUI being removed, these tokens must be formally declared in the Tailwind 4 `@theme` block in `src/styles/_themes.css`:

```css
@theme {
  /* Primary & Contrast Content */
  --color-on-primary: var(--on-primary);
  --color-primary-content: var(--on-primary, #ffffff);
  --color-primary: var(--primary-500);
  
  /* Secondary & Contrast Content */
  --color-on-secondary: var(--on-secondary);
  --color-secondary-content: var(--on-secondary, #ffffff);
  --color-secondary: var(--secondary-500);

  /* Semantic State Colors */
  --color-error: #ef4444;
  --color-error-content: #ffffff;
  --color-success: #10b981;
  --color-success-content: #ffffff;
  --color-warning: #f59e0b;
  --color-warning-content: #ffffff;
  --color-info: #3b82f6;
  --color-info-content: #ffffff;

  /* Surfaces & Borders */
  --color-border: #e4e4e7;
  --color-muted: #f4f4f5;
  --color-muted-foreground: #71717a;
}
```

This guarantees that `var(--color-primary-content)` resolves properly across light/dark themes and works with native CSS `color-mix()` and background declarations without any dependency on DaisyUI.

### 2.2 CSS Layer: Tailwind CSS 4 Utilities (`src/styles/_components.css`)

We define native Tailwind 4 `@utility` blocks in `src/styles/_components.css` (imported by `src/styles/index.css` and `projects/docs/src/styles.css`):

```css
/* ----------------------------------------------------------------------------------------------------- */
/*  @ Base Button Utility
/* ----------------------------------------------------------------------------------------------------- */
@utility btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  user-select: none;
  cursor: pointer;
  transition-property: color, background-color, border-color, opacity, box-shadow;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
  outline-offset: 2px;
  line-height: 1.25rem;

  &:focus-visible {
    outline-width: 2px;
    outline-style: solid;
  }

  &:disabled,
  &[aria-disabled='true'] {
    pointer-events: none;
    opacity: 0.5;
  }
}

/* ----------------------------------------------------------------------------------------------------- */
/*  @ Button Style Variants
/* ----------------------------------------------------------------------------------------------------- */
@utility btn-primary {
  background-color: var(--color-primary);
  color: var(--color-primary-content);

  &:hover {
    background-color: color-mix(in srgb, var(--color-primary) 88%, black);
  }
  &:focus-visible {
    outline-color: var(--color-primary);
  }
}

@utility btn-secondary {
  background-color: var(--color-secondary);
  color: var(--color-secondary-content);

  &:hover {
    background-color: color-mix(in srgb, var(--color-secondary) 88%, black);
  }
  &:focus-visible {
    outline-color: var(--color-secondary);
  }
}

@utility btn-outline {
  border-width: 1px;
  border-style: solid;
  border-color: var(--color-border);
  background-color: transparent;
  color: var(--color-foreground);

  &:hover {
    background-color: var(--color-muted);
  }
  &:focus-visible {
    outline-color: var(--color-border);
  }
}

@utility btn-ghost {
  background-color: transparent;
  color: var(--color-foreground);

  &:hover {
    background-color: var(--color-muted);
  }
  &:focus-visible {
    outline-color: var(--color-muted);
  }
}

@utility btn-danger {
  background-color: var(--color-error);
  color: var(--color-error-content);

  &:hover {
    background-color: color-mix(in srgb, var(--color-error) 88%, black);
  }
  &:focus-visible {
    outline-color: var(--color-error);
  }
}

/* ----------------------------------------------------------------------------------------------------- */
/*  @ Button Sizing
/* ----------------------------------------------------------------------------------------------------- */
@utility btn-sm {
  height: 2rem;
  padding-inline: 0.75rem;
  font-size: 0.75rem;
  border-radius: 0.375rem;
  gap: 0.375rem;
}

@utility btn-md {
  height: 2.5rem;
  padding-inline: 1rem;
  font-size: 0.875rem;
  border-radius: 0.5rem;
  gap: 0.5rem;
}

@utility btn-lg {
  height: 3rem;
  padding-inline: 1.5rem;
  font-size: 1rem;
  border-radius: 0.75rem;
  gap: 0.625rem;
}

@utility btn-icon {
  height: 2.5rem;
  width: 2.5rem;
  padding: 0;
  border-radius: 0.5rem;
}

@utility btn-circle {
  border-radius: 9999px;
  padding: 0;
  height: 2.5rem;
  width: 2.5rem;
}

@utility btn-block {
  width: 100%;
}
```

---

### 2.3 TypeScript Layer: Simplified `@libs/ui/button`

In `libs/ui/button/src/button.variants.ts`, the recipe becomes a simple, maintainable mapping:

```typescript
import { cva } from '@libs/ui/core';

export const buttonVariants = cva({
  base: 'btn',
  variants: {
    variant: {
      primary: 'btn-primary',
      secondary: 'btn-secondary',
      outline: 'btn-outline',
      ghost: 'btn-ghost',
      danger: 'btn-danger',
    },
    size: {
      sm: 'btn-sm',
      md: 'btn-md',
      lg: 'btn-lg',
      icon: 'btn-icon',
    },
    fullWidth: {
      true: 'btn-block',
      false: '',
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md',
    fullWidth: 'false',
  },
});
```

### 2.4 Directive Responsibilities (`UiButtonDirective`)
`UiButtonDirective` (`button[uiButton]`, `a[uiButton]`) retains its exact responsibility boundaries:
1. Computes host class string via `buttonVariants(...)`.
2. Intercepts and suppresses click events when `disabled()` is true on both `<button>` and `<a>` elements (`stopImmediatePropagation()` and `preventDefault()`).
3. Reflects `aria-disabled="true"` and `aria-busy="true"` (when `loading()` is true).
4. Enables easy programmatic binding:
   ```html
   <button uiButton variant="primary" size="md" [loading]="isSubmitting()">Save</button>
   ```

---

## 3. DaisyUI Removal Strategy

1. **Audit & Replace:**
   - Remove `@plugin 'daisyui'` and `@plugin "daisyui/theme"` from `src/styles/_daisyui.css` (or delete `_daisyui.css` and replace with `_components.css`).
   - Uninstall `daisyui` from `package.json`.
2. **Compatibility Verification:**
   - Check all existing template usages of `.btn`, `.btn-primary`, `.btn-circle`, etc., to confirm visual appearance and interactions are preserved.
   - Run unit test suite `ng test` and `node .ci/build-libs.js`.
   - Run docs application `ng build docs`.

---

## 4. Verification & Testing Plan

1. **Unit Tests:**
   - Update `libs/ui/button/src/button.spec.ts` assertions to verify that `buttonEl.className` contains `btn`, `btn-primary`, `btn-md` instead of raw utility tokens.
   - Run `npx ng test ui --watch=false`.
2. **Build Verification:**
   - `node .ci/build-libs.js` builds all libraries cleanly.
   - `npx ng build docs` compiles the documentation app without errors.
   - `npx ng build angular-starter` compiles the main starter application without DaisyUI.
3. **Interactive Testing:**
   - Verify Button playground in `projects/docs` operates with live variants, sizes, and overrides.

---

## 5. Review Focus

- Ensure CSS `@utility` classes cleanly layer over Tailwind 4 base and theme styles.
- Verify that overriding styles with additional utility classes (e.g. `<button class="btn btn-primary px-8 rounded-full">`) works predictably according to Tailwind CSS 4 cascade rules.
- Confirm zero regressions in existing application templates that currently use DaisyUI button classes.
