# Design Specification: `@libs/ui/menu` (Dropdown & Action Menu)

## 1. Overview

The `@libs/ui/menu` secondary entry point provides an accessible, performant, and flexible dropdown action menu directive suite. It marries the headless accessibility patterns of `@angular/aria/menu` and Angular CDK Overlay with Tailwind CSS v4 design tokens and CVA styling variants.

### Key Goals
- **Accessibility (WAI-ARIA Menu Button Pattern):** Full conformance with `role="menu"`, `role="menuitem"`, `role="separator"`, `aria-haspopup="menu"`, and `aria-expanded`. Roving tabindex keyboard navigation (`ArrowDown`, `ArrowUp`, `Home`, `End`, character typeahead).
- **Floating Overlay Management:** CDK Connected Overlay with automatic viewport collision detection/flipping, repositioning on scroll, backdrop click dismiss, and Escape dismiss with automatic focus restoration.
- **Lazy Template Rendering:** The menu content is defined inside `<ng-template>` and only attached to the DOM when opened, minimizing memory footprint and DOM nodes.
- **Rich Item Slots & Styling:** Full support for prefix icons, item labels, right-aligned keyboard shortcuts / badges, destructive/danger styling, and size scaling (`sm`, `md`, `lg`).

---

## 2. Architecture & Public API

### 2.1 Package Location
- Source: `libs/ui/menu/`
- Entry Point: `libs/ui/menu/src/public-api.ts`
- Package Config: `libs/ui/menu/ng-package.json`
- Re-exported from: `libs/ui/src/public-api.ts`
- Distribution: `packages/ui/menu/`

### 2.2 Directive Suite

```
[uiMenuTriggerFor]="menuTpl" (UiMenuTriggerDirective)
  │
  ├── Opens CDK Connected Overlay
  │     └── Renders template containing:
  │           <div uiMenu> (UiMenuDirective)
  │             ├── <div uiMenuLabel>Group Title</div> (UiMenuLabelDirective)
  │             ├── <button uiMenuItem>Item 1</button> (UiMenuItemDirective)
  │             ├── <div uiMenuDivider></div> (UiMenuDividerDirective)
  │             └── <button uiMenuItem [danger]="true">Delete</button>
```

#### 1. `UiMenuTriggerDirective`
- **Selector:** `[uiMenuTriggerFor]`
- **Export As:** `uiMenuTrigger`
- **Host Directives:** `MenuTrigger` from `@angular/aria/menu`
- **Inputs:**
  - `uiMenuTriggerFor: TemplateRef<unknown>` (required): The menu template to display on open.
  - `uiMenuPosition: UiMenuPosition` (default `'bottom-start'`): Placement relative to the trigger. Options: `'bottom-start' | 'bottom-end' | 'top-start' | 'top-end' | 'left-start' | 'right-start'`.
  - `uiMenuDisabled: boolean` (default `false`): Disables opening the menu.
  - `uiMenuOffsetY: number` (default `4`): Vertical pixel offset gap between trigger and menu.
- **Outputs / Events:**
  - `menuOpened: EventEmitter<void>`
  - `menuClosed: EventEmitter<void>`
- **Methods:**
  - `open(): void`
  - `close(): void`
  - `toggle(): void`
  - `isOpen(): boolean`

#### 2. `UiMenuDirective`
- **Selector:** `[uiMenu]`
- **Export As:** `uiMenu`
- **Host Directives:** `Menu` from `@angular/aria/menu`
- **Inputs:**
  - `uiMenuSize: UiMenuSize` (default `'md'`): Size scaling (`'sm' | 'md' | 'lg'`).
- **Host Bindings:**
  - `class`: `menu menu-box bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg p-1 min-w-44 outline-none menu-{size}`
- **Context Provided:** `UI_MENU_CONTEXT` containing `{ size: Signal<UiMenuSize>, close: () => void }`.

#### 3. `UiMenuItemDirective`
- **Selector:** `[uiMenuItem]`
- **Export As:** `uiMenuItem`
- **Host Directives:** `MenuItem` from `@angular/aria/menu`
- **Inputs:**
  - `danger: boolean` (default `false`): Applies destructive red accent styling.
  - `disabled: boolean` (default `false`): Disables the item; skipped during arrow key roving.
- **Host Bindings:**
  - `class`: computed from `menuItemVariants({ danger, disabled, size })`.
  - `[attr.aria-disabled]`: `disabled() ? true : null`.
- **Behavior:**
  - Clicking an enabled item emits its action and notifies `UiMenuDirective` / `UiMenuTriggerDirective` to close the overlay.

#### 4. `UiMenuDividerDirective`
- **Selector:** `[uiMenuDivider]`
- **Host Bindings:**
  - `role`: `'separator'`
  - `class`: `'my-1 border-t border-gray-200 dark:border-gray-800'`

#### 5. `UiMenuLabelDirective`
- **Selector:** `[uiMenuLabel]`
- **Host Bindings:**
  - `class`: `'menu-title px-3 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 select-none'`

---

## 3. Types & CVA Variants

### 3.1 Types (`menu.types.ts`)

```ts
import { InjectionToken, Signal } from '@angular/core';

export type UiMenuPosition =
  | 'bottom-start'
  | 'bottom-end'
  | 'top-start'
  | 'top-end'
  | 'left-start'
  | 'right-start';

export type UiMenuSize = 'sm' | 'md' | 'lg';

export interface UiMenuContext {
  size: Signal<UiMenuSize>;
  close: () => void;
}

export const UI_MENU_CONTEXT = new InjectionToken<UiMenuContext>('UI_MENU_CONTEXT');

export interface UiMenuConfig {
  size?: UiMenuSize;
  position?: UiMenuPosition;
  offsetY?: number;
}

export const UI_MENU_CONFIG = new InjectionToken<UiMenuConfig>('UI_MENU_CONFIG');
```

### 3.2 Variants (`menu.variants.ts`)

```ts
import { cva } from '@libs/ui/core';

export const menuItemVariants = cva(
  'flex w-full items-center justify-between gap-3 text-left select-none transition-colors outline-none cursor-pointer',
  {
    variants: {
      size: {
        sm: 'px-2.5 py-1 text-xs rounded-md',
        md: 'px-3 py-1.5 text-sm rounded-lg',
        lg: 'px-3.5 py-2 text-base rounded-lg',
      },
      danger: {
        false: 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 focus-visible:bg-gray-100 dark:focus-visible:bg-gray-800',
        true: 'text-error hover:bg-error/10 focus-visible:bg-error/10',
      },
      disabled: {
        true: 'opacity-50 pointer-events-none cursor-not-allowed',
        false: '',
      },
    },
    defaultVariants: {
      size: 'md',
      danger: false,
      disabled: false,
    },
  }
);
```

---

## 4. Overlay & Positioning Strategy (`menu.positions.ts`)

Leverages `@angular/cdk/overlay` `ConnectedPositionStrategy` with built-in auto-flipping fallbacks:

```ts
import { ConnectedPosition } from '@angular/cdk/overlay';
import { UiMenuPosition } from './menu.types';

export function getMenuPositions(position: UiMenuPosition, offsetY = 4): ConnectedPosition[] {
  switch (position) {
    case 'bottom-start':
      return [
        { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY },
        { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -offsetY },
      ];
    case 'bottom-end':
      return [
        { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top', offsetY },
        { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom', offsetY: -offsetY },
      ];
    case 'top-start':
      return [
        { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -offsetY },
        { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY },
      ];
    case 'top-end':
      return [
        { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom', offsetY: -offsetY },
        { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top', offsetY },
      ];
    case 'left-start':
      return [
        { originX: 'start', originY: 'top', overlayX: 'end', overlayY: 'top', offsetX: -offsetY },
        { originX: 'end', originY: 'top', overlayX: 'start', overlayY: 'top', offsetX: offsetY },
      ];
    case 'right-start':
      return [
        { originX: 'end', originY: 'top', overlayX: 'start', overlayY: 'top', offsetX: offsetY },
        { originX: 'start', originY: 'top', overlayX: 'end', overlayY: 'top', offsetX: -offsetY },
      ];
  }
}
```

---

## 5. Keyboard Navigation & Interaction Specifications

| Key | Trigger Target | Menu Target | Action |
|---|---|---|---|
| `Click` | Trigger Button | - | Opens menu; focus enters menu |
| `Enter` / `Space` | Trigger Button | - | Opens menu; focus enters first item |
| `ArrowDown` | Trigger Button | Menu List | Opens menu / moves focus to next enabled item (wraps) |
| `ArrowUp` | Trigger Button | Menu List | Moves focus to previous enabled item (wraps) |
| `Home` | - | Menu List | Moves focus to first enabled item |
| `End` | - | Menu List | Moves focus to last enabled item |
| `Escape` | - | Menu List | Closes menu; returns focus to trigger button |
| `Click outside` | - | Backdrop | Closes menu; returns focus to trigger button |
| `Item Click` | - | Enabled Item | Executes item action; closes menu; restores focus to trigger |
| `Disabled Item Click` | - | Disabled Item | Prevented; menu remains open |

---

## 6. Testing Strategy

1. **Variants Unit Tests (`menu.variants.spec.ts`):**
   - Test CVA output for sizes: `sm`, `md`, `lg`.
   - Test CVA output for `danger: true` vs `false`.
   - Test CVA output for `disabled: true` vs `false`.
2. **Positions Unit Tests (`menu.positions.spec.ts`):**
   - Test offset calculations and auto-flip fallback positions for all 6 position modes.
3. **Integration Tests (`menu.spec.ts`):**
   - Test trigger click toggles menu open and closed.
   - Test backdrop click and Escape key dismiss menu and restore trigger focus.
   - Test arrow navigation moves roving tabindex across enabled items.
   - Test skipping disabled items during keyboard navigation.
   - Test Home and End navigation keys.
   - Test item click invokes event handler and closes menu.
   - Test disabled item click does not trigger action and does not close menu.
   - Test WAI-ARIA attributes: `role="menu"`, `role="menuitem"`, `role="separator"`, `aria-haspopup="menu"`, `aria-expanded`.
   - Test global `UI_MENU_CONFIG` defaults.

---

## 7. Documentation Plan

- **Playground Route:** `/menu`
- **Showcases:**
  1. Default Dropdown Menu (with left icons and right keyboard shortcut tags).
  2. Placement Showcase (`bottom-start`, `bottom-end`, `top-start`, `right-start`).
  3. Size Variants (`sm`, `md`, `lg`).
  4. Complex Menu with Groups, Titles, Dividers, and Destructive Actions.
- **API Reference Tables:**
  - `UiMenuTriggerDirective`
  - `UiMenuDirective`
  - `UiMenuItemDirective`
  - `UiMenuDividerDirective`
  - `UiMenuLabelDirective`
