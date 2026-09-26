# Design Specification: `@libs/ui` Design System & Documentation App

- **Date**: 2026-09-25
- **Status**: Draft (Approved in Brainstorming)
- **Target Version**: Angular 22, Tailwind CSS 4

---

## 1. Executive Summary

This specification defines the architectural design for a custom design system (`@libs/ui`) built as an internal Angular library in the monorepo, paired with an interactive documentation and preview application (`projects/docs`).

The design draws architectural lessons from enterprise design systems (**`@angular/material`** and **`ng-zorro-antd`**), modernized for **Angular 22** (Signals, Standalone components, modern control flow `@if` / `@for`) and **Tailwind CSS 4** custom primitives without coupling to DaisyUI class conventions.

---

## 2. Goals & Success Criteria

### 2.1 Goals
1. **Tree-Shakable Library Architecture**: Secondary entry points under `libs/ui` allowing consumers to import only what they need (e.g. `@libs/ui/button`, `@libs/ui/input`).
2. **Native Attribute Directives**: Prioritize attribute directives (`button[uiButton]`, `input[uiInput]`) over custom wrappers to preserve 100% native semantics, form submission, and accessibility.
3. **Clean Template APIs**: Ensure public template inputs and outputs do NOT have a `$` prefix (`variant="primary"`, `size="md"`), maintaining clean DX while utilizing Angular Signal reactivity internally.
4. **Custom Tailwind 4 Primitives**: Build styling with composable class-variance recipes (`cva`) using native Tailwind 4 utility tokens, isolated from third-party component classes.
5. **Dedicated Preview Portal**: Standalone Angular application in `projects/docs` featuring interactive controls, real-time prop tweaking, copyable code snippets, and accessibility notes.

### 2.2 Success Criteria
- Running `ng build ui` builds all sub-packages into `dist/packages/ui` (or `packages/ui`) with zero errors.
- Running `ng serve docs` launches an interactive documentation portal with live preview sandboxes.
- Core interactive controls (Button, Input/Textarea/FormField, Checkbox/Switch, Radio/RadioGroup) are fully functional, accessible, and unit-tested.

---

## 3. Architecture & Packaging

### 3.1 Directory Structure

```text
libs/ui/
├── ng-package.json                     # Root ng-packagr config
├── package.json                        # Package metadata (@libs/ui)
│
├── core/                               # Sub-entry point: @libs/ui/core
│   ├── ng-package.json
│   └── src/
│       ├── config/
│       │   ├── ui-config.ts            # UI_CONFIG InjectionToken & provideUiConfig()
│       │   └── ui-config.interface.ts  # Global defaults (default size, variants)
│       ├── types/
│       │   ├── size.type.ts            # UiSize ('xs' | 'sm' | 'md' | 'lg' | 'xl')
│       │   ├── variant.type.ts         # UiVariant ('primary' | 'secondary' | 'outline' | 'ghost' | 'danger')
│       │   └── color.type.ts
│       ├── form/
│       │   └── form-field-control.ts   # UiFormFieldControl<T> abstraction
│       ├── utils/
│       │   ├── cva.ts                  # Class variance recipe generator
│       │   └── cn.ts                   # Tailwind class merge helper
│       └── public-api.ts
│
├── button/                             # Sub-entry point: @libs/ui/button
│   ├── ng-package.json
│   └── src/
│       ├── button.directive.ts         # button[uiButton], a[uiButton]
│       ├── button-group.component.ts   # <ui-button-group>
│       ├── button.variants.ts          # Tailwind 4 CVA recipe
│       ├── button.spec.ts              # Vitest tests
│       ├── types.ts                    # UiButtonVariant, UiButtonSize
│       └── public-api.ts
│
├── input/                              # Sub-entry point: @libs/ui/input
│   ├── ng-package.json
│   └── src/
│       ├── input.directive.ts          # input[uiInput], textarea[uiTextarea]
│       ├── form-field.component.ts     # <ui-form-field> wrapper
│       ├── label.directive.ts          # label[uiLabel]
│       ├── hint.directive.ts           # span[uiHint]
│       ├── error.directive.ts          # span[uiError]
│       ├── prefix.directive.ts         # [uiPrefix], [uiSuffix]
│       ├── input.variants.ts
│       ├── input.spec.ts
│       └── public-api.ts
│
├── checkbox/                           # Sub-entry point: @libs/ui/checkbox
│   ├── ng-package.json
│   └── src/
│       ├── checkbox.component.ts       # <ui-checkbox>
│       ├── switch.component.ts         # <ui-switch>
│       ├── checkbox.variants.ts
│       ├── checkbox.spec.ts
│       └── public-api.ts
│
└── radio/                              # Sub-entry point: @libs/ui/radio
    ├── ng-package.json
    └── src/
        ├── radio-group.component.ts    # <ui-radio-group>
        ├── radio.component.ts          # <ui-radio>
        ├── radio.spec.ts
        └── public-api.ts
```

### 3.2 TypeScript Path Mappings (`tsconfig.json`)

To enable instant auto-import and immediate hot-reload without compiling first:
```json
{
  "compilerOptions": {
    "paths": {
      "@libs/ui": ["./packages/ui", "./libs/ui/src/public-api"],
      "@libs/ui/*": ["./packages/ui/*", "./libs/ui/*/src/public-api"]
    }
  }
}
```

### 3.3 Build Pipeline Integration
* Register the `"ui"` project in `angular.json` with `@angular/build:ng-packagr`.
* Output builds into `packages/ui` to align with the existing monorepo libraries.
* Automatically included in `.ci/build-libs.js` via `angular.json` library discovery.

---

## 4. Component Standards & API Design

### 4.1 Global Configuration Provider (`@libs/ui/core`)

Inspired by `MAT_FORM_FIELD_DEFAULT_OPTIONS` and `NzConfigService`:
```typescript
export interface UiConfig {
  defaultSize?: UiSize;
  button?: {
    defaultVariant?: UiButtonVariant;
    defaultSize?: UiButtonSize;
  };
  formField?: {
    appearance?: 'outline' | 'filled';
  };
}

export const UI_CONFIG = new InjectionToken<UiConfig>('UI_CONFIG');

export function provideUiConfig(config: UiConfig): Provider {
  return { provide: UI_CONFIG, useValue: config };
}
```

### 4.2 Class Variance Authority Helper (`cva`)
Zero-dependency recipe utility generating deterministic Tailwind 4 class strings based on incoming props.

```typescript
export const buttonVariants = cva({
  base: 'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer',
  variants: {
    variant: {
      primary: 'bg-primary text-primary-content hover:bg-primary/90 focus-visible:outline-primary',
      secondary: 'bg-secondary text-secondary-content hover:bg-secondary/90 focus-visible:outline-secondary',
      outline: 'border border-border bg-transparent hover:bg-muted text-foreground',
      ghost: 'hover:bg-muted text-foreground',
      danger: 'bg-error text-error-content hover:bg-error/90 focus-visible:outline-error',
    },
    size: {
      sm: 'h-8 px-3 text-xs rounded-md gap-1.5',
      md: 'h-10 px-4 text-sm rounded-lg gap-2',
      lg: 'h-12 px-6 text-base rounded-xl gap-2.5',
      icon: 'h-10 w-10 rounded-lg p-0',
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
});
```

### 4.3 Component Specifications

#### A. Button Directive (`@libs/ui/button`)
- **Selectors**: `button[uiButton]`, `a[uiButton]`
- **Inputs**:
  - `variant = input<UiButtonVariant>('primary')`
  - `size = input<UiButtonSize>('md')`
  - `loading = input<boolean, unknown>(false, { transform: booleanAttribute })`
  - `disabled = input<boolean, unknown>(false, { transform: booleanAttribute })`
  - `fullWidth = input<boolean, unknown>(false, { transform: booleanAttribute })`
- **Template Usage**:
  ```html
  <button uiButton variant="primary" size="md" [loading]="isLoading">Submit</button>
  <a uiButton variant="outline" href="/dashboard">Back</a>
  ```

#### B. Form Field & Input (`@libs/ui/input`)
- **Components & Directives**: `<ui-form-field>`, `input[uiInput]`, `textarea[uiTextarea]`, `label[uiLabel]`, `span[uiHint]`, `span[uiError]`, `[uiPrefix]`, `[uiSuffix]`.
- **Reactive Forms Integration**: Implements `ControlValueAccessor` and `UiFormFieldControl`.
- **Accessibility**: Automatically links `aria-describedby` to generated IDs on `uiHint` and `uiError`. Automatically toggles `aria-invalid` based on form control validity.
- **Template Usage**:
  ```html
  <ui-form-field>
    <label uiLabel>Email Address</label>
    <svg uiPrefix class="w-4 h-4 text-muted-foreground" ... />
    <input uiInput type="email" [formControl]="email" placeholder="you@domain.com" />
    <span uiHint>We will never share your email.</span>
    <span uiError>Email is required.</span>
  </ui-form-field>
  ```

#### C. Checkbox & Switch (`@libs/ui/checkbox`)
- **Components**: `<ui-checkbox>`, `<ui-switch>`.
- **Inputs**:
  - `checked = model<boolean>(false)`
  - `indeterminate = input<boolean, unknown>(false, { transform: booleanAttribute })` (Checkbox only)
  - `disabled = input<boolean, unknown>(false, { transform: booleanAttribute })`
  - `size = input<UiSize>('md')`
  - `label = input<string>()`
- **Accessibility**:
  - Encapsulates hidden native checkbox input for 100% native focus rings and Spacebar toggling.
  - `role="switch"` and `aria-checked` on `<ui-switch>`.

#### D. Radio Group & Radio (`@libs/ui/radio`)
- **Components**: `<ui-radio-group>`, `<ui-radio>`.
- **Inputs**:
  - Group: `value = model<any>()`, `name = input<string>()`.
  - Radio: `value = input.required<any>()`, `disabled = input<boolean, unknown>(false, { transform: booleanAttribute })`, `label = input<string>()`.
- **Keyboard Navigation**:
  - Arrow Up / Left selects previous radio item.
  - Arrow Down / Right selects next radio item.
  - `role="radiogroup"` and `role="radio"` with roaming `tabindex`.

---

## 5. Documentation & Preview App (`projects/docs`)

### 5.1 Project Setup
- **Directory**: `projects/docs`
- **Builder**: `@angular/build:application` in `angular.json`
- **Commands**:
  - Dev server: `ng serve docs`
  - Build: `ng build docs` -> `dist/docs`

### 5.2 Layout & Features
1. **Top Navigation**: Logo, search dialog (triggerable via hotkeys), theme switcher (dark/light), external repo links.
2. **Sidebar Navigation**:
   - Getting Started (Installation, Global Config, Theming)
   - Primitives & Form Controls (Button, Form Field & Input, Checkbox & Switch, Radio Group)
3. **Component Documentation Page**:
   - **Interactive Playground Canvas**: Live rendering of the component with background grid and resizable container.
   - **Props Control Panel**: Real-time controls (variants dropdown, size picker, disabled/loading toggles, text labels).
   - **Dynamic Code Snippet**: Synchronized HTML & TypeScript snippet updating with user selections, complete with one-click copy.
   - **API Reference Table**: Clear table documenting inputs, types, default values, and outputs.
   - **Keyboard & a11y Guidelines**: Detailed screen reader and keyboard interaction notes.

---

## 6. Testing Strategy

1. **Unit Testing (Vitest)**:
   - Button: verify classes rendered per variant/size, loading spinner presence, disabled event suppression.
   - Form Field & Input: verify `ControlValueAccessor` value propagation, validation error rendering, `aria-describedby` linking.
   - Checkbox & Switch: verify two-way binding, keyboard Space toggle, indeterminate icon display.
   - Radio Group: verify arrow key selection cycling, group value sync.
2. **Type Checking & Linting**:
   - `npx eslint libs/ui`
   - `ng build ui` to verify `ng-packagr` d.ts generation and package integrity.
3. **End-to-End Visual Verification**:
   - Launching `ng serve docs` to verify responsiveness, theme switching, and interaction across all components.

---

## 7. Phased Implementation Roadmap

1. **Phase 1: Foundation & Packaging**:
   - Setup `libs/ui/ng-package.json`, `libs/ui/package.json`, and `libs/ui/core/`.
   - Implement `cva`, `cn`, shared types, and `provideUiConfig()`.
   - Update `tsconfig.json` and `angular.json`.
2. **Phase 2: Core Components**:
   - Implement `@libs/ui/button` (Button, ButtonGroup, tests).
   - Implement `@libs/ui/input` (FormField, Input, Textarea, Label, Hint, Error, tests).
   - Implement `@libs/ui/checkbox` (Checkbox, Switch, tests).
   - Implement `@libs/ui/radio` (Radio, RadioGroup, tests).
3. **Phase 3: Documentation App**:
   - Scaffold `projects/docs` application in `angular.json`.
   - Build docs layout (sidebar, header, playground canvas, code block generator).
   - Author showcase pages for each component.
4. **Phase 4: Build Verification & CI**:
   - Update `.ci/build-libs.js` and `package.json` scripts (`docs:dev`, `docs:build`).
   - Run full test and build verification.
