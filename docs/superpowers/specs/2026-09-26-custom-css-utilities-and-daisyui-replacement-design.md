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

## 3. DaisyUI Scan Inventory & CSS Clone Replacements

A comprehensive AST and class scan across `libs/`, `src/`, and `projects/` identified the following DaisyUI classes actively in use:

### 3.1 Discovered Class Inventory

| Category | Discovered Classes | Location Examples |
|---|---|---|
| **Buttons** | `btn`, `btn-primary`, `btn-secondary`, `btn-outline`, `btn-ghost`, `btn-danger`, `btn-sm`, `btn-circle`, `btn-wide`, `btn-block` | `src/app/features/auth/`, `src/app/core/layouts/`, `libs/date-picker/`, `libs/dialog/`, `libs/toast/` |
| **Form Controls** | `form-control`, `input-bordered`, `label-text-alt`, `select`, `select-bordered` | `src/app/features/auth/`, `src/app/features/example/`, `libs/paginator/` |
| **Feedback** | `alert`, `alert-error`, `alert-warning`, `alert-success`, `alert-info` | `src/app/features/auth/` (sign-in, sign-up, forgot-password, reset-password) |
| **Layout & Grouping** | `divider`, `join`, `join-item` | `src/app/features/example/`, `libs/date-picker/`, `libs/paginator/` |
| **Navigation & Overlays** | `menu`, `dropdown`, `dropdown-bottom`, `dropdown-content`, `modal-header`, `modal-body` | `src/app/core/commons/theme-toggler/`, `libs/navigation/`, `libs/hotkeys/` |

---

### 3.2 Cloned CSS Utility Implementations (`src/styles/_components.css`)

All discovered classes will be implemented directly in `src/styles/_components.css` as zero-dependency Tailwind 4 utilities (`@utility`) and component styles:

```css
/* ----------------------------------------------------------------------------------------------------- */
/*  @ 1. Button Utilities
/* ----------------------------------------------------------------------------------------------------- */
@utility btn-wide {
  width: 16rem;
}

/* ----------------------------------------------------------------------------------------------------- */
/*  @ 2. Form Control Utilities
/* ----------------------------------------------------------------------------------------------------- */
@utility form-control {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

@utility input-bordered {
  border-width: 1px;
  border-style: solid;
  border-color: var(--color-border);
  background-color: var(--color-background);
  color: var(--color-foreground);
  border-radius: 0.5rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  outline-offset: 2px;
  transition: border-color 150ms ease, box-shadow 150ms ease;

  &:focus {
    outline-width: 2px;
    outline-style: solid;
    outline-color: var(--color-primary);
    border-color: var(--color-primary);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

@utility label-text-alt {
  font-size: 0.75rem;
  color: var(--color-muted-foreground);
}

@utility select {
  display: inline-flex;
  cursor: pointer;
  user-select: none;
  appearance: none;
  background-color: var(--color-background);
  color: var(--color-foreground);
  font-size: 0.875rem;
  border-radius: 0.5rem;
  padding-left: 0.75rem;
  padding-right: 2rem;
  height: 2.5rem;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1.25rem 1.25rem;
}

@utility select-bordered {
  border-width: 1px;
  border-style: solid;
  border-color: var(--color-border);

  &:focus {
    outline-width: 2px;
    outline-style: solid;
    outline-color: var(--color-primary);
  }
}

/* ----------------------------------------------------------------------------------------------------- */
/*  @ 3. Feedback: Alert Utilities
/* ----------------------------------------------------------------------------------------------------- */
@utility alert {
  display: grid;
  width: 100%;
  grid-auto-flow: row;
  align-content: center;
  align-items: center;
  justify-items: start;
  gap: 0.75rem;
  text-align: start;
  border-radius: 0.75rem;
  padding: 1rem;
  font-size: 0.875rem;
  background-color: var(--color-muted);
  color: var(--color-foreground);
  border: 1px solid var(--color-border);

  & svg {
    width: 1.25rem;
    height: 1.25rem;
    stroke-width: 2;
    flex-shrink: 0;
  }
}

@utility alert-error {
  background-color: color-mix(in srgb, var(--color-error) 12%, transparent);
  color: var(--color-error);
  border-color: color-mix(in srgb, var(--color-error) 25%, transparent);
}

@utility alert-warning {
  background-color: color-mix(in srgb, var(--color-warning) 12%, transparent);
  color: var(--color-warning);
  border-color: color-mix(in srgb, var(--color-warning) 25%, transparent);
}

@utility alert-success {
  background-color: color-mix(in srgb, var(--color-success) 12%, transparent);
  color: var(--color-success);
  border-color: color-mix(in srgb, var(--color-success) 25%, transparent);
}

@utility alert-info {
  background-color: color-mix(in srgb, var(--color-info) 12%, transparent);
  color: var(--color-info);
  border-color: color-mix(in srgb, var(--color-info) 25%, transparent);
}

/* ----------------------------------------------------------------------------------------------------- */
/*  @ 4. Layout & Grouping Utilities
/* ----------------------------------------------------------------------------------------------------- */
@utility divider {
  display: flex;
  flex-direction: row;
  align-items: center;
  align-self: stretch;
  height: 1rem;
  white-space: nowrap;
  margin-top: 1rem;
  margin-bottom: 1rem;
  color: var(--color-muted-foreground);
  font-size: 0.875rem;

  &:before,
  &:after {
    content: '';
    flex-grow: 1;
    height: 1px;
    width: 100%;
    background-color: var(--color-border);
  }

  &:not(:empty) {
    gap: 1rem;
  }
}

@utility join {
  display: inline-flex;
  align-items: stretch;
  border-radius: 0.5rem;

  & :where(.join-item) {
    border-radius: 0;
  }

  & :where(.join-item:first-child) {
    border-start-start-radius: inherit;
    border-end-start-radius: inherit;
  }

  & :where(.join-item:last-child) {
    border-start-end-radius: inherit;
    border-end-end-radius: inherit;
  }
}

/* ----------------------------------------------------------------------------------------------------- */
/*  @ 5. Navigation & Overlay Utilities
/* ----------------------------------------------------------------------------------------------------- */
@utility menu {
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  font-size: 0.875rem;
  padding: 0.5rem;
  gap: 0.125rem;

  & li {
    position: relative;
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    align-items: stretch;
  }

  & li > a,
  & li > button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    border-radius: 0.375rem;
    color: var(--color-foreground);
    transition: background-color 150ms ease;

    &:hover {
      background-color: var(--color-muted);
    }
  }
}

@utility dropdown {
  position: relative;
  display: inline-block;
}

@utility dropdown-content {
  position: absolute;
  z-index: 50;
}

@utility dropdown-bottom {
  & .dropdown-content {
    top: 100%;
    bottom: auto;
  }
}

@utility modal-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--color-border);
}

@utility modal-body {
  padding: 1.5rem;
}
```

---

### 3.3 DaisyUI Package Removal Steps

1. Replace `src/styles/_daisyui.css` with `src/styles/_components.css` containing the complete CSS clones.
2. In `src/styles/index.css`, update `@import './_daisyui.css';` to `@import './_components.css';`.
3. In `projects/docs/src/styles.css`, import `src/styles/_components.css`.
4. Run `npm uninstall daisyui` to completely remove the package from `package.json` and `node_modules`.
5. Re-run `npm test`, `node .ci/build-libs.js`, `npm run docs:build`, and `ng build angular-starter` to ensure all 22+ discovered DaisyUI class usages continue rendering identically with 0 errors.

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
