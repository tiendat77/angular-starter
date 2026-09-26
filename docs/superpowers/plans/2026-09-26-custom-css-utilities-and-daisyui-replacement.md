# Custom CSS Utilities and DaisyUI Replacement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Completely replace `daisyui` with custom Tailwind CSS 4 `@utility` classes in `src/styles/_components.css`, adopt a dual styling strategy (pure HTML utilities + concise CVA directives), fix missing color-content tokens in `src/styles/_themes.css`, and clone all 22 identified DaisyUI classes so zero existing templates break in `src/`, `libs/`, or `projects/`.

**Architecture:** Pure CSS `@utility` layers compiled by Tailwind CSS 4 engine (`@tailwindcss/vite` / `@tailwindcss/postcss`) using semantic CSS variables (`--color-primary`, `--color-primary-content`, etc.). UI directives in `@libs/ui/*` consume concise semantic utility names via `cva()` recipes (`btn btn-primary btn-md`) rather than massive inline utility lists, allowing pure HTML components and Angular directives to share identical design tokens without runtime overhead.

**Tech Stack:** Tailwind CSS 4 (`@utility`, `@theme`), Angular 22 standalone directives & components, CVA (`class-variance-authority`), Vitest.

**Spec:** [`docs/superpowers/specs/2026-09-26-custom-css-utilities-and-daisyui-replacement-design.md`](file:///Users/tiendat/Code/tiendat/angular-starter/.worktrees/feat/libs-ui-design-system/docs/superpowers/specs/2026-09-26-custom-css-utilities-and-daisyui-replacement-design.md)

## Global Constraints

- **Zero Template Breakage:** Existing templates in `src/`, `libs/`, and `projects/` using `btn`, `btn-primary`, `alert`, `divider`, `input-bordered`, `select`, `join`, `menu`, etc. must continue to render and function identically without HTML modifications.
- **Pure Tailwind CSS 4:** All cloned utilities must use `@utility <name>` or CSS custom property variables defined in `_themes.css`. No legacy DaisyUI imports or dependencies allowed.
- **Type Safety & CVA:** `libs/ui/button/src/button.variants.ts` must export `buttonVariants` whose return values match the cloned utilities.
- **Git Commit Rules:** All commits must follow Conventional Commits with emojis (`feat(ui): ✨ ...`, `refactor(ui): 📦 ...`, `chore(deps): ♻️ ...`).
- **Vitest Testing:** Run all tests non-interactively using `--watch=false` to prevent blocking tasks.

## Review Focus

1. **Missing Theme Tokens In Dark Mode:** In both light and dark modes, `--color-primary-content` and companion tokens (`--color-secondary-content`, `--color-error-content`) must remain legible with correct foreground-background contrast.
2. **Interactive States on Anchor Elements (`<a>`):** An `a.btn` or `a[uiButton]` that has `disabled` must block pointer events, render with reduced opacity, and intercept clicks via `preventDefault()`.
3. **Select Arrow Rendering Across Browsers:** Custom `select` utility must maintain a crisp SVG chevron dropdown arrow using standard CSS `appearance: none;` and inline data-URI SVG without breaking form alignment.
4. **Grouped Elements with `join`:** Sibling items wrapped in `.join` (e.g. paginator buttons or input groups) must properly zero interior border-radii and retain rounded outer corners on first/last child.
5. **Button Size Overrides:** Buttons with `.btn-sm`, `.btn-lg`, or `.btn-icon` must accurately scale typography, padding, and heights (32px, 48px, 40x40px).

---

### Task 1: Add Missing Color Content Tokens in `src/styles/_themes.css`

**Files:**
- Modify: `src/styles/_themes.css:1-40`

**Interfaces:**
- Consumes: Existing `--on-primary`, `--on-secondary`, `--on-error` CSS variables from `src/styles/_colors.css` and light/dark theme blocks.
- Produces: Tailwind `@theme` properties `--color-primary-content`, `--color-secondary-content`, `--color-error-content`, `--color-muted-foreground` for utility and template consumption.

- [ ] **Step 1: Inspect `src/styles/_themes.css` current theme definition**

Examine the `@theme` block in `src/styles/_themes.css` to verify where color tokens are mapped.

- [ ] **Step 2: Add color content token definitions to `@theme` in `src/styles/_themes.css`**

Add the missing content color mappings to `@theme`:
```css
  --color-primary-content: var(--color-primary-content, var(--on-primary, #ffffff));
  --color-secondary-content: var(--color-secondary-content, var(--on-secondary, #18181b));
  --color-error-content: var(--color-error-content, var(--on-error, #ffffff));
```
And ensure `:root` and `[data-theme='dark']` provide fallback definitions:
In `:root`:
```css
  --color-primary-content: #ffffff;
  --color-secondary-content: #18181b;
  --color-error-content: #ffffff;
```
In `[data-theme='dark']`:
```css
  --color-primary-content: #18181b;
  --color-secondary-content: #fafafa;
  --color-error-content: #ffffff;
```

- [ ] **Step 3: Run quick build to verify CSS syntax validity**

Run: `node .ci/build-libs.js`
Expected: PASS with 0 build errors.

- [ ] **Step 4: Commit theme tokens update**

```bash
git add src/styles/_themes.css
git commit -m "fix(theme): 💄 add missing color-content tokens to tailwind theme"
```

---

### Task 2: Create Custom CSS Utility File `src/styles/_components.css` and Wire Imports

**Files:**
- Create: `src/styles/_components.css`
- Modify: `src/styles/index.css:1-10`
- Modify: `projects/docs/src/styles.css:1-10`

**Interfaces:**
- Consumes: `--color-primary`, `--color-primary-content`, `--color-secondary`, `--color-secondary-content`, `--color-error`, `--color-error-content`, `--color-border`, `--color-muted`, `--color-background`, `--color-foreground` from `_themes.css`.
- Produces: All 22 DaisyUI clone classes: `btn`, `btn-primary`, `btn-secondary`, `btn-outline`, `btn-ghost`, `btn-error`, `btn-danger`, `btn-sm`, `btn-md`, `btn-lg`, `btn-icon`, `btn-circle`, `btn-wide`, `btn-block`, `form-control`, `input-bordered`, `label-text-alt`, `select`, `select-bordered`, `alert`, `alert-error`, `alert-warning`, `alert-success`, `alert-info`, `divider`, `join`, `join-item`, `menu`, `dropdown`, `dropdown-bottom`, `dropdown-content`, `modal-header`, `modal-body`.

- [ ] **Step 1: Create `src/styles/_components.css` with all cloned utilities**

Write the complete CSS utilities into `src/styles/_components.css`:
```css
/* ----------------------------------------------------------------------------------------------------- */
/*  @ 1. Button Utilities
/* ----------------------------------------------------------------------------------------------------- */
@utility btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  text-decoration: none;
  user-select: none;
  cursor: pointer;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  height: 2.5rem;
  padding-left: 1rem;
  padding-right: 1rem;
  gap: 0.5rem;
  border: 1px solid transparent;
  transition: background-color 150ms ease, border-color 150ms ease, opacity 150ms ease;
  outline-offset: 2px;

  &:focus-visible {
    outline-width: 2px;
    outline-style: solid;
  }

  &:disabled,
  &[disabled],
  &[aria-disabled='true'] {
    pointer-events: none;
    opacity: 0.5;
    cursor: not-allowed;
  }
}

@utility btn-primary {
  background-color: var(--color-primary);
  color: var(--color-primary-content, #ffffff);
  border-color: var(--color-primary);

  &:hover:not(:disabled):not([aria-disabled='true']) {
    background-color: color-mix(in srgb, var(--color-primary) 90%, black);
    border-color: color-mix(in srgb, var(--color-primary) 90%, black);
  }

  &:focus-visible {
    outline-color: var(--color-primary);
  }
}

@utility btn-secondary {
  background-color: var(--color-secondary);
  color: var(--color-secondary-content, #18181b);
  border-color: var(--color-secondary);

  &:hover:not(:disabled):not([aria-disabled='true']) {
    background-color: color-mix(in srgb, var(--color-secondary) 85%, black);
    border-color: color-mix(in srgb, var(--color-secondary) 85%, black);
  }

  &:focus-visible {
    outline-color: var(--color-secondary);
  }
}

@utility btn-outline {
  background-color: transparent;
  color: var(--color-foreground);
  border-color: var(--color-border);

  &:hover:not(:disabled):not([aria-disabled='true']) {
    background-color: var(--color-muted);
  }

  &:focus-visible {
    outline-color: var(--color-border);
  }
}

@utility btn-ghost {
  background-color: transparent;
  color: var(--color-foreground);
  border-color: transparent;

  &:hover:not(:disabled):not([aria-disabled='true']) {
    background-color: var(--color-muted);
  }

  &:focus-visible {
    outline-color: var(--color-muted-foreground);
  }
}

@utility btn-error {
  background-color: var(--color-error);
  color: var(--color-error-content, #ffffff);
  border-color: var(--color-error);

  &:hover:not(:disabled):not([aria-disabled='true']) {
    background-color: color-mix(in srgb, var(--color-error) 90%, black);
    border-color: color-mix(in srgb, var(--color-error) 90%, black);
  }

  &:focus-visible {
    outline-color: var(--color-error);
  }
}

@utility btn-danger {
  background-color: var(--color-error);
  color: var(--color-error-content, #ffffff);
  border-color: var(--color-error);

  &:hover:not(:disabled):not([aria-disabled='true']) {
    background-color: color-mix(in srgb, var(--color-error) 90%, black);
    border-color: color-mix(in srgb, var(--color-error) 90%, black);
  }

  &:focus-visible {
    outline-color: var(--color-error);
  }
}

@utility btn-sm {
  height: 2rem;
  padding-left: 0.75rem;
  padding-right: 0.75rem;
  font-size: 0.75rem;
  border-radius: 0.375rem;
  gap: 0.375rem;
}

@utility btn-md {
  height: 2.5rem;
  padding-left: 1rem;
  padding-right: 1rem;
  font-size: 0.875rem;
  border-radius: 0.5rem;
  gap: 0.5rem;
}

@utility btn-lg {
  height: 3rem;
  padding-left: 1.5rem;
  padding-right: 1.5rem;
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

@utility btn-wide {
  width: 16rem;
}

@utility btn-block {
  width: 100%;
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

- [ ] **Step 2: Update `src/styles/index.css` and `projects/docs/src/styles.css`**

In `src/styles/index.css`, add `@import './_components.css';` right after `./_themes.css`.
In `projects/docs/src/styles.css`, add `@import '../../../src/styles/_components.css';`.

- [ ] **Step 3: Build docs and starter to verify stylesheet compilation**

Run: `npm run docs:build`
Expected: Docs app builds successfully with all utility classes generated.

- [ ] **Step 4: Commit components CSS file and imports**

```bash
git add src/styles/_components.css src/styles/index.css projects/docs/src/styles.css
git commit -m "feat(ui): ✨ add custom css components utilities to replace daisyui"
```

---

### Task 3: Refactor Button CVA Variants and Update Unit Tests

**Files:**
- Modify: `libs/ui/button/src/button.variants.ts:1-31`
- Modify: `libs/ui/button/src/button.spec.ts:35-56`

**Interfaces:**
- Consumes: `cva` from `@libs/ui/core`.
- Produces: `buttonVariants` mapping `variant`, `size`, `fullWidth` to `btn`, `btn-primary`, `btn-secondary`, `btn-outline`, `btn-ghost`, `btn-danger`, `btn-sm`, `btn-md`, `btn-lg`, `btn-icon`, `btn-block`.

- [ ] **Step 1: Update `button.spec.ts` with expected semantic class assertions**

In `libs/ui/button/src/button.spec.ts`:
Update test `should apply primary variant and md size classes`:
```typescript
  it('should apply primary variant and md size classes', () => {
    expect(buttonEl.className).toContain('btn');
    expect(buttonEl.className).toContain('btn-primary');
    expect(buttonEl.className).toContain('btn-md');
  });

  it('should apply custom variant and size classes when signals change', () => {
    fixture.componentInstance.variant.set('danger');
    fixture.componentInstance.size.set('lg');
    fixture.detectChanges();
    expect(buttonEl.className).toContain('btn-danger');
    expect(buttonEl.className).toContain('btn-lg');
  });
```

- [ ] **Step 2: Run test to confirm failure (asserting new classes before implementation)**

Run: `npx vitest run libs/ui/button/src/button.spec.ts`
Expected: FAIL (button still outputs legacy classes `bg-primary`, `h-10`).

- [ ] **Step 3: Update `libs/ui/button/src/button.variants.ts` to concise CVA classes**

Replace `libs/ui/button/src/button.variants.ts` with:
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

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run libs/ui/button/src/button.spec.ts`
Expected: PASS (all tests green).

- [ ] **Step 5: Commit button refactor**

```bash
git add libs/ui/button/src/button.variants.ts libs/ui/button/src/button.spec.ts
git commit -m "refactor(ui): 📦 simplify button cva variants to use semantic css utilities"
```

---

### Task 4: Uninstall DaisyUI Dependency and Remove `_daisyui.css`

**Files:**
- Delete: `src/styles/_daisyui.css`
- Modify: `src/styles/index.css:1-10`
- Modify: `package.json`

**Interfaces:**
- Consumes: None.
- Produces: Project without `daisyui` npm dependency or legacy `_daisyui.css` theme bindings.

- [ ] **Step 1: Remove `@import './_daisyui.css';` from `src/styles/index.css`**

Edit `src/styles/index.css` to remove `@import './_daisyui.css';`.

- [ ] **Step 2: Remove `src/styles/_daisyui.css`**

Delete `src/styles/_daisyui.css`.

- [ ] **Step 3: Uninstall `daisyui` package**

Run: `npm uninstall daisyui`
Verify `daisyui` is removed from `dependencies` / `devDependencies` in `package.json`.

- [ ] **Step 4: Run library tests to ensure no regressions**

Run: `npx vitest run --watch=false`
Expected: All test suites PASS.

- [ ] **Step 5: Commit DaisyUI removal**

```bash
git add src/styles/index.css package.json package-lock.json
git rm src/styles/_daisyui.css
git commit -m "chore(deps): ♻️ remove daisyui dependency in favor of native css utilities"
```

---

### Task 5: End-to-End Build and Showcase Verification

**Files:**
- None (verification across workspace)

**Interfaces:**
- Consumes: All UI libraries (`@libs/ui/*`), docs showcase (`projects/docs`), and main application (`angular-starter`).
- Produces: Zero compile errors, clean production bundles, and fully functioning design system utilities.

- [ ] **Step 1: Build all internal libraries**

Run: `node .ci/build-libs.js`
Expected: SUCCESS for all packages.

- [ ] **Step 2: Run all unit tests**

Run: `npx vitest run --watch=false`
Expected: All test suites PASS.

- [ ] **Step 3: Build docs showcase application**

Run: `npm run docs:build`
Expected: SUCCESS without build errors.

- [ ] **Step 4: Build main starter application**

Run: `npx ng build angular-starter`
Expected: SUCCESS without build errors.

- [ ] **Step 5: Grep for any remaining rogue DaisyUI references**

Run: `grep -rn "daisyui" src libs projects || echo "No daisyui references found"`
Expected: No active dependencies or imports found.
