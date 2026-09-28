# `@libs/ui/tabs` Design Specification

**Author:** Antigravity Team  
**Date:** 2026-09-28  
**Status:** Draft  
**Target:** `@libs/ui/tabs` (Phase 1 Roadmap: Navigation)

---

## 1. Overview & Goals

The `Tabs` feature package provides an accessible, compound tabbed interface built on top of `@angular/aria/tabs`. It pairs headless WAI-ARIA compliant state management with the `@libs/ui` styling architecture (Tailwind CSS v4 design tokens and CVA variants).

### Goals
1. **Headless-First Accessibility:** Fully powered by `@angular/aria/tabs`, providing WAI-ARIA `tablist`, `tab`, `tabpanel` semantics, keyboard navigation (Arrow keys, Home, End), and orientation awareness.
2. **Compound Directives via `hostDirectives`:** Expose clean `@libs/ui/tabs` directives (`[uiTabs]`, `[uiTabList]`, `[uiTab]`, `[uiTabPanel]`, `[uiTabContent]`) that automatically apply ARIA behaviors without redundant boilerplate.
3. **Visual Variants & Orientations:** Support 3 visual variants (`bordered`, `lift`, `pill`), 2 orientations (`horizontal`, `vertical`), 3 sizes (`sm`, `md`, `lg`), and semantic colors (`primary`, `neutral`, `secondary`, `success`, `warning`, `error`).
4. **Lazy Tab Content:** Seamless support for deferring rendering of inactive tab panels using `<ng-template uiTabContent>`.
5. **Interactive Docs Playground:** Full documentation page with live preview, interactive controls, and API references in `projects/docs`.

---

## 2. Architecture & API Design

### 2.1 Directive Suite & Roles

| Directive | Selector | ExportAs | Host Directive (`@angular/aria/tabs`) | Responsibility |
|---|---|---|---|---|
| `UiTabsDirective` | `[uiTabs]` | `uiTabs` | `Tabs` | Root container; manages and provides tabs context (variant, size, orientation, color) |
| `UiTabListDirective` | `[uiTabList]` | `uiTabList` | `TabList` | Tab header container; forwards `selectionMode`, applies tablist styling classes |
| `UiTabDirective` | `[uiTab]` | `uiTab` | `Tab` | Individual tab button; reads context, applies CVA variants, handles active & focus styling |
| `UiTabPanelDirective` | `[uiTabPanel]` | `uiTabPanel` | `TabPanel` | Panel container associated with a tab value; handles panel layout and a11y association |
| `UiTabContentDirective` | `ng-template[uiTabContent]` | `uiTabContent` | `TabContent` | Template directive for lazy content instantiation |

### 2.2 Public Interfaces & Types (`libs/ui/tabs/src/tabs.types.ts`)

```ts
import { InjectionToken, Signal } from '@angular/core';
import { UiColor } from '@libs/ui/core';

export type UiTabsVariant = 'bordered' | 'lift' | 'pill';
export type UiTabsSize = 'sm' | 'md' | 'lg';
export type UiTabsOrientation = 'horizontal' | 'vertical';

export interface UiTabsContext {
  variant: Signal<UiTabsVariant>;
  size: Signal<UiTabsSize>;
  orientation: Signal<UiTabsOrientation>;
  color: Signal<UiColor>;
}

export const UI_TABS_CONTEXT = new InjectionToken<UiTabsContext>('UI_TABS_CONTEXT');

export interface UiTabsConfig {
  variant?: UiTabsVariant;
  size?: UiTabsSize;
  orientation?: UiTabsOrientation;
  color?: UiColor;
  selectionMode?: 'follow' | 'explicit';
}

export const UI_TABS_CONFIG = new InjectionToken<UiTabsConfig>('UI_TABS_CONFIG');
```

### 2.3 Directive Inputs & Outputs

#### `UiTabsDirective` (`[uiTabs]`)
- **Inputs:**
  - `uiTabsVariant`: `UiTabsVariant` (default `'bordered'`)
  - `uiTabsSize`: `UiTabsSize` (default `'md'`)
  - `uiTabsOrientation`: `UiTabsOrientation` (default `'horizontal'`)
  - `uiTabsColor`: `UiColor` (default `'primary'`)
- **Context Provider:** Provides `UI_TABS_CONTEXT` containing reactive signals of all 4 inputs.

#### `UiTabListDirective` (`[uiTabList]`)
- **Forwarded Inputs from `TabList`:**
  - `selectedTab`: `string | null`
  - `selectionMode`: `'follow' | 'explicit'` (default `'follow'`)
- **Forwarded Outputs from `TabList`:**
  - `selectedTabChange`: `EventEmitter<string>`
- **Host Bindings:**
  - `class`: Computed classes binding `tabs`, `tabs-[variant]`, `tabs-[orientation]`, `tabs-[size]`.
  - `attr.aria-orientation`: Binds to `orientation()`.

#### `UiTabDirective` (`[uiTab]`)
- **Forwarded Inputs from `Tab`:**
  - `value`: `string` (required tab identifier)
  - `disabled`: `boolean` (default `false`)
- **Individual Override Inputs:**
  - `uiTabColor`: `UiColor` (optional override of tabs context color)
- **Host Bindings:**
  - `class`: Computed from `tabVariants({ variant, size, color, orientation })`.
  - Native cursor, focus ring, and disabled styles.

#### `UiTabPanelDirective` (`[uiTabPanel]`)
- **Forwarded Inputs from `TabPanel`:**
  - `value`: `string` (matches corresponding tab `value`)
- **Host Bindings:**
  - `class`: `tab-panel`.
  - `tabindex`: `0` for keyboard focusability when panel content lacks focusable elements.

#### `UiTabContentDirective` (`[uiTabContent]`)
- Applied to `<ng-template uiTabContent>`. Defers DOM creation until the parent `UiTabPanelDirective` is selected.

---

## 3. Styling & Token Specifications

### 3.1 CSS Utility Architecture (`libs/ui/styles/components/tabs.css`)

All classes are implemented in Tailwind CSS v4 using `@utility`:

```css
@layer components {
  /* Tab list container */
  @utility tabs {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    position: relative;
    user-select: none;
  }

  @utility tabs-vertical {
    flex-direction: column;
    align-items: stretch;
  }

  /* Variant: Bordered (underlined active tab) */
  @utility tabs-bordered {
    border-bottom: 1px solid var(--color-border);
  }

  @utility tabs-bordered.tabs-vertical {
    border-bottom: none;
    border-inline-end: 1px solid var(--color-border);
  }

  /* Variant: Lift (card folder style) */
  @utility tabs-lift {
    border-bottom: 1px solid var(--color-border);
  }

  /* Variant: Pill (segmented button background) */
  @utility tabs-pill {
    background-color: var(--color-muted);
    padding: 0.25rem;
    border-radius: var(--radius-xl, 0.75rem);
  }

  /* Individual Tab button */
  @utility tab {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-weight: 500;
    white-space: nowrap;
    cursor: pointer;
    transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
    outline: none;
    color: var(--color-muted-foreground);

    &:hover:not(:disabled):not([aria-disabled="true"]) {
      color: var(--color-foreground);
    }

    &:focus-visible {
      outline: 2px solid var(--color-primary);
      outline-offset: 2px;
    }

    &:disabled,
    &[aria-disabled="true"] {
      opacity: 0.5;
      cursor: not-allowed;
      pointer-events: none;
    }
  }

  /* Sizes */
  @utility tab-sm {
    height: 1.75rem;
    padding-inline: 0.625rem;
    font-size: 0.75rem;
    border-radius: var(--radius-md, 0.375rem);
  }

  @utility tab-md {
    height: 2.25rem;
    padding-inline: 0.875rem;
    font-size: 0.875rem;
    border-radius: var(--radius-lg, 0.5rem);
  }

  @utility tab-lg {
    height: 2.75rem;
    padding-inline: 1.25rem;
    font-size: 1rem;
    border-radius: var(--radius-lg, 0.5rem);
  }

  /* Panel container */
  @utility tab-panel {
    margin-top: 1rem;
    outline: none;

    &:focus-visible {
      outline: 2px solid var(--color-primary);
      outline-offset: 2px;
      border-radius: var(--radius-lg, 0.5rem);
    }
  }
}
```

### 3.2 Active Tab Styling (`[aria-selected="true"]`)

1. **Bordered Variant:**
   - Horizontal: Bottom border highlight `border-b-2`, margin offset `-1px` to overlap container border track.
   - Vertical: Inline-end border highlight `border-e-2`, margin offset `-1px`.
   - Text color matches active semantic color (`text-primary`, `text-neutral`, etc.).
2. **Lift Variant:**
   - Background matches `--color-background`, borders top, left, and right with `--color-border`.
   - Bottom border transparent with bottom offset overlapping the container track.
   - Subtle top shadow `shadow-xs`.
3. **Pill Variant:**
   - Active tab gets `bg-background text-foreground shadow-xs`.
   - Inactive tabs remain transparent text.

---

## 4. CVA Implementation (`libs/ui/tabs/src/tabs.variants.ts`)

```ts
import { cva, UiColor } from '@libs/ui/core';
import { UiTabsOrientation, UiTabsSize, UiTabsVariant } from './tabs.types';

export const tabVariants = cva({
  base: 'tab',
  variants: {
    variant: {
      bordered: 'tab-bordered-item',
      lift: 'tab-lift-item',
      pill: 'tab-pill-item',
    },
    size: {
      sm: 'tab-sm',
      md: 'tab-md',
      lg: 'tab-lg',
    },
    color: {
      primary: 'tab-color-primary',
      neutral: 'tab-color-neutral',
      secondary: 'tab-color-secondary',
      success: 'tab-color-success',
      warning: 'tab-color-warning',
      error: 'tab-color-error',
    },
    orientation: {
      horizontal: 'tab-horizontal',
      vertical: 'tab-vertical',
    },
  },
  defaultVariants: {
    variant: 'bordered',
    size: 'md',
    color: 'primary',
    orientation: 'horizontal',
  },
});
```

---

## 5. Usage Example

```html
<div uiTabs uiTabsVariant="bordered" uiTabsColor="primary">
  <div uiTabList selectedTab="account" (selectedTabChange)="onTabChange($event)">
    <button uiTab value="account">Account</button>
    <button uiTab value="password">Password</button>
    <button uiTab value="billing" [disabled]="isBillingDisabled()">Billing</button>
  </div>

  <div uiTabPanel value="account">
    <ng-template uiTabContent>
      <form-account />
    </ng-template>
  </div>

  <div uiTabPanel value="password">
    <ng-template uiTabContent>
      <form-password />
    </ng-template>
  </div>

  <div uiTabPanel value="billing">
    <ng-template uiTabContent>
      <billing-details />
    </ng-template>
  </div>
</div>
```

---

## 6. Testing Strategy

Unit and integration tests run via `npx ng test ui --watch=false`:
1. **CVA Variants (`tabs.variants.spec.ts`):**
   - Asserts default classes (`tab`, `tab-md`, `tab-bordered-item`, `tab-color-primary`).
   - Asserts variant modifiers (`tab-lift-item`, `tab-pill-item`).
   - Asserts size and orientation combinations.
2. **Compound Directives Integration (`tabs.spec.ts`):**
   - Initial active tab rendering and ARIA attribute verification (`aria-selected="true"`, `role="tab"`).
   - Keyboard navigation in horizontal orientation: Right/Left arrows navigate and select (in `'follow'` mode).
   - Keyboard navigation in vertical orientation: Down/Up arrows navigate and select.
   - Home and End keys jump to first and last enabled tabs.
   - Disabled tabs are skipped during keyboard navigation and ignore clicks.
   - Lazy template loading: verifies that `<ng-template uiTabContent>` inside `uiTabPanel` is only instantiated when that tab becomes active.
   - Dynamic context reactivity: changing `[uiTabsVariant]` or `[uiTabsSize]` on parent reactively propagates to all child tabs.

---

## 7. Documentation Playground Plan

- File: `projects/docs/src/app/features/tabs-doc/tabs-doc.component.ts` & `.html`
- Route: `/tabs` in `projects/docs/src/app/app.routes.ts`
- Navigation: Added to `docs-sidebar.component.ts` under `Navigation` section.
- Playground Controls:
  - Variant switcher (`bordered`, `lift`, `pill`)
  - Orientation switcher (`horizontal`, `vertical`)
  - Size switcher (`sm`, `md`, `lg`)
  - Color selector (`primary`, `neutral`, `secondary`, `success`, `warning`, `error`)
- Showcase Sections:
  - Visual Variants comparison
  - Vertical orientation with sidebar layout
  - Lazy content demonstration
  - Disabled tab state
- Complete API Table of inputs, outputs, and types.
