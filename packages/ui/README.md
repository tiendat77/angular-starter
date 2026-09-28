# `@libs/ui` — Architectural Specification & Engineering Guide

> **Audience**: AI Agents, Frontend Architects, and Senior Angular Developers.  
> **Purpose**: Definitive standard and recipe book for understanding, maintaining, and implementing components in `@libs/ui`.

---

## 📑 Table of Contents

1. [Architectural Overview & Philosophy](#1-architectural-overview--philosophy)
2. [Package & Monorepo Structure](#2-package--monorepo-structure)
3. [Design System & Styling Architecture](#3-design-system--styling-architecture)
4. [Angular 22 Reactivity Standards](#4-angular-22-reactivity-standards)
5. [Component Archetypes & Implementation Patterns](#5-component-archetypes--implementation-patterns)
   - [Archetype A: Atomic Elements & Visual Modifiers](#archetype-a-atomic-elements--visual-modifiers)
   - [Archetype B: Floating & Overlay Systems](#archetype-b-floating--overlay-systems)
   - [Archetype C: Compound & Coordinated Directives](#archetype-c-compound--coordinated-directives)
   - [Archetype D: Form Controls (`UiFormFieldControl`)](#archetype-d-form-controls-uiformfieldcontrol)
   - [Archetype E: Headless State-Driven Systems](#archetype-e-headless-state-driven-systems)
6. [Accessibility (WAI-ARIA) Requirements](#6-accessibility-wai-aria-requirements)
7. [Step-by-Step Implementation Recipe](#7-step-by-step-implementation-recipe)
8. [Testing Conventions (Vitest + Signals)](#8-testing-conventions-vitest--signals)

---

## 1. Architectural Overview & Philosophy

`@libs/ui` is an enterprise-grade, accessible, headless-friendly UI component library built for **Angular 22+**.

### Core Tenets
1. **Signal-First Reactivity**: 100% reactive state using Angular Signals (`input()`, `output()`, `model()`, `computed()`, `linkedSignal()`).
2. **Strict Standalone & Zoneless-Ready**: Zero `NgModule` usage (except legacy compatibility bridges). Components must have no reliance on Zone.js dirty checking or timing hacks.
3. **Pure OnPush Change Detection**: Every component MUST explicitly declare `changeDetection: ChangeDetectionStrategy.OnPush`.
4. **Tailwind CSS v4 + Design Tokens**: Styling is driven by custom CSS tokens declared via `@theme` and `@utility` rules, avoiding tight coupling to 3rd-party component CSS.
5. **Class Variance Authority (CVA)**: Visual variants, sizes, and states are composed cleanly using the `@libs/ui/core` `cva()` utility.
6. **Native & Headless Preservation**: Prefer attribute directives decorating native elements (e.g. `button[uiButton]`, `input[uiInput]`) over wrapping elements. When a custom element is necessary, preserve semantic HTML and WAI-ARIA roles.
7. **Secondary Entry Points**: Every component folder is an independent secondary entrypoint compiled by `ng-packagr` to ensure fine-grained tree-shaking.

---

## 2. Package & Monorepo Structure

### 2.1 Secondary Entrypoints

Each component domain lives in its own folder under `libs/ui/` and publishes a discrete secondary entrypoint:

```
libs/ui/
├── ng-package.json            # Root library packaging definition
├── package.json               # Package metadata and peer dependencies
├── src/
│   └── public-api.ts          # Re-exports public APIs of all entrypoints
├── styles/                    # Global tokens, component utility CSS, CDK overrides
│   ├── index.css              # Main styles bundle entry
│   ├── tokens.css             # @theme variables, dark mode layer, icon utilities
│   └── components/            # Per-component @utility stylesheets
│       ├── button.css
│       ├── form.css
│       ├── tooltip.css
│       └── ...
└── <component-name>/          # Secondary entry point (e.g., button, tooltip, menu)
    ├── ng-package.json        # Points ng-packagr to src/public-api.ts
    └── src/
        ├── public-api.ts      # Public surface of this subpackage
        ├── <name>.types.ts    # Enums, interfaces, config tokens
        ├── <name>.variants.ts # CVA variant map
        ├── <name>.component.ts (or <name>.directive.ts)
        ├── <name>.tokens.ts   # Context tokens for compound communication
        ├── <name>.positions.ts# CDK Overlay positioning logic (if floating)
        ├── <name>.store.ts    # Headless signal store (if complex state)
        └── <name>.spec.ts     # Vitest specifications
```

### 2.2 Subpackage `ng-package.json`

Every subfolder MUST contain an `ng-package.json`:

```json
{
  "$schema": "../../../node_modules/ng-packagr/ng-package.schema.json",
  "lib": {
    "entryFile": "src/public-api.ts"
  }
}
```

### 2.3 Path Aliasing

Consumers import using specific entry points:
```typescript
import { UiButtonComponent } from '@libs/ui/button';
import { UiTooltipDirective } from '@libs/ui/tooltip';
import { cva, UiColor, UiSize } from '@libs/ui/core';
```
Path mappings are configured in root `tsconfig.json`:
```json
{
  "paths": {
    "@libs/ui": ["./packages/ui", "./libs/ui/src/public-api"],
    "@libs/ui/*": ["./packages/ui/*", "./libs/ui/*/src/public-api"]
  }
}
```

---

## 3. Design System & Styling Architecture

The library combines **Tailwind CSS v4** engine directives (`@theme`, `@utility`, `@layer base`) with runtime CSS variables.

### 3.1 Design Tokens (`libs/ui/styles/tokens.css`)

Tokens are mapped in `@theme` using runtime custom properties (`var(--color-*)`) so consuming applications can rebrand dynamically without rebuilding CSS:

```css
@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));

@theme {
  --color-background: #ffffff;
  --color-foreground: #09090b;
  --color-muted: #f4f4f5;
  --color-muted-foreground: #71717a;
  --color-border: #e4e4e7;
  --color-input: #e4e4e7;

  /* Semantic scale */
  --color-primary: #18181b;
  --color-primary-content: #fafafa;
  --color-secondary: #f4f4f5;
  --color-secondary-content: #18181b;
  --color-info: #3b82f6;
  --color-info-content: #ffffff;
  --color-success: #10b981;
  --color-success-content: #ffffff;
  --color-warning: #f59e0b;
  --color-warning-content: #ffffff;
  --color-error: #ef4444;
  --color-error-content: #ffffff;
}

@layer base {
  [data-theme='dark'] {
    --color-background: #09090b;
    --color-foreground: #fafafa;
    --color-muted: #27272a;
    --color-muted-foreground: #a1a1aa;
    --color-border: #27272a;
    --color-input: #27272a;
    --color-primary: #fafafa;
    --color-primary-content: #18181b;
    --color-secondary: #27272a;
    --color-secondary-content: #fafafa;
  }
}
```

### 3.2 Component Utility CSS Pattern (`libs/ui/styles/components/*.css`)

Component classes are defined using `@utility` blocks.
1. The **base class** declares private scoped variables (`--_color`, `--_bg`, `--_fg`, `--_border`, `--_hover-*`).
2. **Modifier utilities** only assign to intermediate `--<component>-*` variables. This ensures modifiers can be combined in **any order** without selector specificity wars.
3. State changes (hover, active, focus) utilize modern CSS `color-mix(in oklab, ...)` for seamless transitions.

```css
/* Example: libs/ui/styles/components/button.css */
@utility btn {
  --_color: var(--btn-color, var(--color-muted));
  --_bg: var(--btn-bg, var(--_color));
  --_fg: var(--btn-fg, var(--btn-content, var(--color-foreground)));
  --_border: var(--btn-border, var(--_color));
  --_hover-bg: var(--btn-hover-bg, color-mix(in oklab, var(--_bg) 90%, black));

  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--btn-gap, 0.5rem);
  height: var(--btn-size, 2.5rem);
  padding-inline: var(--btn-p, 1rem);
  border-radius: var(--btn-radius, 0.5rem);
  background-color: var(--_bg);
  color: var(--_fg);
  border: 1px solid var(--_border);
  transition: all 150ms cubic-bezier(0, 0, 0.2, 1);
}

@utility btn-primary {
  --btn-color: var(--color-primary);
  --btn-content: var(--color-primary-content, #ffffff);
}

@utility btn-sm {
  --btn-size: 2rem;
  --btn-p: 0.75rem;
  --btn-fs: 0.75rem;
}
```

### 3.3 Class Variance Authority (CVA) in TypeScript

`@libs/ui/core` provides lightweight, framework-native `cva()` and `cn()` utilities:

```typescript
// libs/ui/<component>/src/<component>.variants.ts
import { cva } from '@libs/ui/core';

export const componentVariants = cva({
  base: 'ui-element-base',
  variants: {
    variant: {
      primary: 'ui-element-primary',
      secondary: 'ui-element-secondary',
      outline: 'ui-element-outline',
    },
    size: {
      sm: 'ui-element-sm',
      md: 'ui-element-md',
      lg: 'ui-element-lg',
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
});
```

In the component, compute host classes reactively:
```typescript
protected readonly hostClass = computed(() =>
  componentVariants({
    variant: this.variant(),
    size: this.size(),
  }, this.customClass())
);
```

---

## 4. Angular 22 Reactivity Standards

### 4.1 Signals for State & Inputs

- **`input()` & `input.required()`**: Use for component inputs. Always add attribute transforms for booleans and numbers:
  ```typescript
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly maxItems = input(10, { transform: numberAttribute });
  ```
- **`output()`**: Use instead of `@Output() EventEmitter`:
  ```typescript
  readonly visibleChange = output<boolean>();
  ```
- **`model()`**: Use for two-way bound inputs:
  ```typescript
  readonly open = model(false);
  ```
- **`computed()`**: Use for all derived state, computed classes, and accessibility flags:
  ```typescript
  protected readonly isDisabled = computed(() => this.disabled() || this.loading());
  ```
- **`linkedSignal()`**: Use when internal state must mirror an input but reset when the input changes:
  ```typescript
  protected readonly failed = linkedSignal({
    source: this.src,
    computation: () => false,
  });
  ```

### 4.2 Host Bindings & Directives

**Never** use `@HostBinding` or `@HostListener`. Always declare them inside the `@Component` / `@Directive` metadata:

```typescript
@Component({
  selector: 'ui-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'hostClass()',
    '[attr.role]': 'role()',
    '[attr.aria-disabled]': 'disabled() ? "true" : null',
    '(click)': 'onHostClick($event)',
    '(keydown.escape)': 'onEscape()',
  },
})
```

### 4.3 Selector Naming Conventions (ESLint Enforced)

Rule defined in `libs/ui/eslint.config.js`:
- **Directives**: Attribute selector prefixed with `ui` in `camelCase`:
  - `[uiTooltip]`, `[uiMenu]`, `[uiTabs]`, `[uiTab]`, `button[uiButton], a[uiButton]`
- **Components**: Custom element tag prefixed with `ui-` in `kebab-case`:
  - `ui-avatar`, `ui-alert`, `ui-table`, `ui-badge`, `ui-spinner`

### 4.4 Dependency Injection Pattern

Always use `inject()` in property initializers:
```typescript
export class UiSampleComponent {
  private readonly _elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly _config = inject(UI_SAMPLE_CONFIG, { optional: true });
}
```

---

## 5. Component Archetypes & Implementation Patterns

### Archetype A: Atomic Elements & Visual Modifiers
*Examples: `button`, `badge`, `avatar`, `alert`, `card`, `tag`*

Used to apply design system visual treatments to native elements or simple markup wrappers.

```typescript
@Component({
  selector: 'button[uiButton], a[uiButton]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'hostClass()',
    '[attr.aria-disabled]': 'isDisabled() ? "true" : null',
    '[attr.disabled]': 'isButtonElement && isDisabled() ? "" : null',
    '(click)': 'onHostClick($event)',
  },
  template: `
    @if (loading()) {
      <span class="spinner" aria-hidden="true"></span>
    }
    <ng-content />
  `,
})
export class UiButtonComponent {
  private readonly _elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  protected readonly isButtonElement = this._elementRef.nativeElement.tagName === 'BUTTON';

  readonly variant = input<UiButtonVariant>('primary');
  readonly size = input<UiButtonSize>('md');
  readonly loading = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });

  protected readonly isDisabled = computed(() => this.disabled() || this.loading());

  protected readonly hostClass = computed(() =>
    buttonVariants({
      variant: this.variant(),
      size: this.size(),
    })
  );

  protected onHostClick(event: Event): void {
    if (this.isDisabled()) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }
}
```

---

### Archetype B: Floating & Overlay Systems
*Examples: `tooltip`, `menu`, `dialog`, `toast`*

Used for floating popovers, dropdowns, contextual dialogs, and tooltips using Angular CDK Overlay.

#### Essential Rules:
1. **Overlay Strategy**: Create a `FlexibleConnectedPositionStrategy` anchored to the host element or trigger.
2. **Viewport Boundary Flipping**: Use fallback positions (e.g. top → bottom, left → right) with viewport boundaries.
3. **Portal Attachment**: Attach either a `ComponentPortal` or `TemplatePortal`.
4. **Lifecycle & Cleanup**: Dispose overlays and unsubscribe on destroy (`takeUntilDestroyed()`, `OnDestroy`).
5. **Dismissal**: Provide Escape key handling and outside-click/backdrop listener cleanup.

```typescript
@Directive({
  selector: '[uiTooltip]',
  exportAs: 'uiTooltip',
  standalone: true,
})
export class UiTooltipDirective implements OnDestroy {
  private readonly _overlay = inject(Overlay);
  private readonly _elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly _viewContainerRef = inject(ViewContainerRef);

  private _overlayRef: OverlayRef | null = null;
  private _componentRef: ComponentRef<UiTooltipComponent> | null = null;

  readonly content = input<string | TemplateRef<unknown>>(null, { alias: 'uiTooltip' });
  readonly position = input<UiTooltipPosition>('top', { alias: 'uiTooltipPosition' });

  @HostListener('mouseenter')
  show(): void {
    if (this._overlayRef?.hasAttached()) return;

    const positionStrategy = this._overlay
      .position()
      .flexibleConnectedTo(this._elementRef)
      .withPositions(TOOLTIP_POSITIONS[this.position()]);

    this._overlayRef = this._overlay.create({
      positionStrategy,
      scrollStrategy: this._overlay.scrollStrategies.reposition(),
    });

    const portal = new ComponentPortal(UiTooltipComponent, this._viewContainerRef);
    this._componentRef = this._overlayRef.attach(portal);
    this._componentRef.instance.content.set(this.content());
  }

  @HostListener('mouseleave')
  hide(): void {
    this._overlayRef?.detach();
  }

  ngOnDestroy(): void {
    this._overlayRef?.dispose();
  }
}
```

---

### Archetype C: Compound & Coordinated Directives
*Examples: `tabs`, `menu` + `menu-item`, `avatar-group`*

Multiple directives working as a cohesive component unit without tight DOM coupling.

#### Essential Rules:
1. **Context Token**: Define an `InjectionToken` for the parent context.
2. **Provider**: The parent directive provides itself via the context token.
3. **Child Consumption**: Child components/directives inject the parent context optionally (`{ optional: true }`).
4. **Host Directives**: Compose with `@angular/aria` or `@angular/cdk` directives via `hostDirectives`.

```typescript
// 1. Context Token
export const UI_TABS_CONTEXT = new InjectionToken<UiTabsContext>('UI_TABS_CONTEXT');

// 2. Parent Directive
@Directive({
  selector: '[uiTabs]',
  exportAs: 'uiTabs',
  standalone: true,
  hostDirectives: [Tabs], // Delegating core ARIA to @angular/aria/tabs
  providers: [
    {
      provide: UI_TABS_CONTEXT,
      useExisting: UiTabsDirective,
    },
  ],
})
export class UiTabsDirective implements UiTabsContext {
  readonly variant = input<UiTabsVariant>('bordered');
  readonly size = input<UiTabsSize>('md');
}

// 3. Child Directive
@Directive({
  selector: '[uiTab]',
  standalone: true,
  hostDirectives: [{ directive: Tab, inputs: ['value', 'disabled', 'id'] }],
  host: {
    '[class]': 'classes()',
  },
})
export class UiTabDirective {
  private readonly _context = inject(UI_TABS_CONTEXT, { optional: true });

  readonly classes = computed(() =>
    tabVariants({
      variant: this._context?.variant() ?? 'bordered',
      size: this._context?.size() ?? 'md',
    })
  );
}
```

---

### Archetype D: Form Controls (`UiFormFieldControl`)
*Examples: `input`, `select`, `checkbox`, `radio`*

Components that integrate with Angular forms and `ui-form-field`.

#### Essential Rules:
1. Extend `UiFormFieldControl<T>` from `@libs/ui/core`.
2. Implement reactive signals: `$value`, `$disabled`, `$focused`, `$invalid`, and `id`.
3. Provide hints and error messaging by delegating `aria-describedby` IDs.

```typescript
// libs/ui/core/src/form/form-field-control.ts
export abstract class UiFormFieldControl<T> {
  abstract readonly $value: Signal<T | null>;
  abstract readonly $disabled: Signal<boolean>;
  abstract readonly $focused: Signal<boolean>;
  abstract readonly $invalid: Signal<boolean>;
  abstract readonly id: string;
  readonly ariaTarget?: Signal<HTMLElement | undefined>;
  setDescribedByIds?(ids: string[]): void;
}
```

---

### Archetype E: Headless State-Driven Systems
*Examples: `table`*

For data-dense or complex stateful components, isolate state and business logic into an `@Injectable()` store provided at component level.

#### Essential Rules:
1. Provide the store at component level (`providers: [UiTableStore]`), **never** in root.
2. Directives (header cells, sorters, filters, rows) inject the same store instance.
3. State transitions run through signals (`data` → `filtered` → `sorted` → `paged` → `viewData`).

```typescript
@Component({
  selector: 'ui-table',
  exportAs: 'uiTable',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [UiTableStore],
  template: `
    <div class="data-table-container">
      <ng-content select="table" />
    </div>
  `,
})
export class UiTable<T> {
  protected readonly store = inject(UiTableStore<T>);
  readonly data = input<readonly T[]>([]);

  constructor() {
    effect(() => this.store.setData(this.data()));
  }
}
```

---

## 6. Accessibility (WAI-ARIA) Requirements

Every component must satisfy WAI-ARIA authoring practices out of the box:

1. **Semantic Roles**: Bind explicit roles via host metadata when not implied by native tags (`role="alert"`, `role="status"`, `role="menu"`, `role="tooltip"`, `role="dialog"`).
2. **Conditional ARIA States**: Remove attributes with `null` when false or absent:
   ```typescript
   '[attr.aria-expanded]': 'isOpen() ? "true" : null',
   '[attr.aria-disabled]': 'isDisabled() ? "true" : null',
   '[attr.aria-hidden]': 'isDecorative() ? "true" : null',
   ```
3. **Keyboard Navigation Matrix**:
   | Component Type | Expected Keys | Action |
   | :--- | :--- | :--- |
   | **Overlays/Dialogs** | `Escape` | Dismiss and return focus to trigger |
   | **Menus/Dropdowns** | `ArrowDown`, `ArrowUp` | Focus next/previous item |
   | | `Home`, `End` | Focus first/last item |
   | | `Enter`, `Space` | Activate selected item |
   | **Tabs** | `ArrowRight`, `ArrowLeft` | Select adjacent tab (horizontal) |
   | | `ArrowDown`, `ArrowUp` | Select adjacent tab (vertical) |
   | **Accordion/Collapse** | `Enter`, `Space` | Toggle panel expansion |

4. **Focus Restoration**: Overlays and dialogs must preserve a reference to the active element before opening and restore focus to it on close.

---

## 7. Step-by-Step Implementation Recipe

When implementing a new component (e.g. `UiBottomSheet`, `UiCollapse`), follow this sequence:

### Step 1: Subpackage Scaffolding
Create `libs/ui/<component-name>/` with `ng-package.json`:
```
libs/ui/<component-name>/
├── ng-package.json
└── src/
    └── public-api.ts
```

### Step 2: Types & Tokens (`<name>.types.ts`)
Define variants, sizes, orientation, configurations, and injection tokens:
```typescript
export type UiBottomSheetSnapPoint = 'auto' | '50vh' | '90vh';

export interface UiBottomSheetConfig<D = unknown> {
  snapPoint?: UiBottomSheetSnapPoint;
  hasBackdrop?: boolean;
  disableClose?: boolean;
  data?: D;
}
```

### Step 3: Stylesheet (`libs/ui/styles/components/<name>.css`)
Create the Tailwind `@utility` definition with CSS variables and add `@import './components/<name>.css';` in `libs/ui/styles/index.css`.

### Step 4: CVA Variants (`<name>.variants.ts`)
Map style classes using `cva()`:
```typescript
import { cva } from '@libs/ui/core';

export const bottomSheetVariants = cva({
  base: 'bottom-sheet-panel',
  variants: {
    snapPoint: {
      auto: 'h-auto max-h-[85vh]',
      '50vh': 'h-[50vh]',
      '90vh': 'h-[90vh]',
    },
  },
  defaultVariants: {
    snapPoint: 'auto',
  },
});
```

### Step 5: Component / Directive Implementation
Build using Standalone, OnPush, Signals, and host bindings.

### Step 6: Public API Exports
In `libs/ui/<component-name>/src/public-api.ts`:
```typescript
export * from './<name>.component';
export * from './<name>.types';
export * from './<name>.variants';
```
And re-export in root `libs/ui/src/public-api.ts`:
```typescript
export * from '@libs/ui/<component-name>';
```

### Step 7: Specifications (`<name>.spec.ts`)
Write unit and accessibility tests in Vitest.

---

## 8. Testing Conventions (Vitest + Signals)

All unit tests are executed using Vitest (`ng test`).

### 8.1 TestHostComponent Pattern
Wrap components in a reactive `TestHostComponent` using Signals to verify inputs and reactivity:

```typescript
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { UiButtonComponent } from './button.component';

@Component({
  standalone: true,
  imports: [UiButtonComponent],
  template: `
    <button
      uiButton
      [variant]="variant()"
      [size]="size()"
      [disabled]="disabled()"
    >
      Action
    </button>
  `,
})
class TestHostComponent {
  readonly variant = signal<'primary' | 'secondary'>('primary');
  readonly size = signal<'sm' | 'md' | 'lg'>('md');
  readonly disabled = signal(false);
}

describe('UiButtonComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let buttonEl: HTMLButtonElement;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TestHostComponent] });
    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    buttonEl = fixture.nativeElement.querySelector('button');
  });

  it('should apply primary variant and md size classes', () => {
    expect(buttonEl.className).toContain('btn-primary');
    expect(buttonEl.className).toContain('btn-md');
  });

  it('should update classes when signal input changes', () => {
    fixture.componentInstance.variant.set('secondary');
    fixture.detectChanges();
    expect(buttonEl.className).toContain('btn-secondary');
  });

  it('should apply aria-disabled when disabled', () => {
    fixture.componentInstance.disabled.set(true);
    fixture.detectChanges();
    expect(buttonEl.getAttribute('aria-disabled')).toBe('true');
  });
});
```

---

## 9. Quick Verification Checklist for New Components

Before submitting a new component to `@libs/ui`:

- [ ] Subpackage has its own `ng-package.json`.
- [ ] Selector matches convention (`ui-name` element for components, `[uiName]` attribute for directives).
- [ ] `ChangeDetectionStrategy.OnPush` is explicitly configured.
- [ ] Inputs use `input()` or `input.required()` with `booleanAttribute` / `numberAttribute` transforms where applicable.
- [ ] Outputs use `output()`, two-way bindings use `model()`.
- [ ] Host bindings are declared exclusively in `host: { ... }` metadata.
- [ ] No hardcoded colors; styles use semantic CSS tokens or CVA.
- [ ] Keyboard navigation and ARIA attributes are tested and functional.
- [ ] Public surface is exported through subpackage `public-api.ts` and root `src/public-api.ts`.
- [ ] Vitest test suite passes with full branch and state coverage.
