# `@libs/ui` Design System & Documentation App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a custom, tree-shakable Angular 22 design system (`@libs/ui`) in `libs/ui` with secondary entry points (`core`, `button`, `input`, `checkbox`, `radio`) and a dedicated documentation & interactive playground application (`projects/docs`).

**Architecture:** Monorepo secondary entry points built with `ng-packagr` and Tailwind CSS 4 class variance recipes (`cva`). Components prioritize attribute directives (`button[uiButton]`, `input[uiInput]`) for native HTML semantics and accessibility, with clean public template bindings (no `$` prefix in template inputs/outputs). Accompanied by a dedicated Angular app in `projects/docs` featuring real-time prop tweaking and synchronized copyable code snippets.

**Tech Stack:** Angular 22, TypeScript 6, Tailwind CSS 4, Vitest, `ng-packagr`.

**Spec:** `docs/superpowers/specs/2026-09-25-ui-design-system-design.md`

## Global Constraints

- Angular 22 standalone architecture with `changeDetection: ChangeDetectionStrategy.OnPush` on all components.
- Signal inputs (`input()`), model signals (`model()`), and output events (`output()`).
- Public template inputs and outputs must never use a `$` prefix (e.g. `variant="primary"`, not `[$variant]="'primary'"`).
- Zero dependency on DaisyUI class names for `@libs/ui` components (pure Tailwind CSS 4 primitives).
- Follow Conventional Commits format with emojis per `.agents/rules/commit-rule.md`.
- Automated testing via Vitest (`ng test`).

## Review Focus

- Disabled button or anchor elements must reject clicks, set `aria-disabled="true"`, and avoid triggering form submissions or navigation.
- Form controls must correctly propagate values and disabled states through Angular's `ControlValueAccessor` interface.
- Form fields must dynamically link `aria-describedby` to rendered hint and error IDs, setting `aria-invalid="true"` when invalid.
- Radio group must support roving keyboard focus (Arrow Up/Left and Arrow Down/Right) without form submission interference.
- The interactive playground in `projects/docs` must synchronize live rendered states with generated copyable code snippets without throwing expression-changed errors.

---

### Task 1: Foundation & Packaging Setup (`@libs/ui/core`)

**Files:**
- Create: `libs/ui/package.json`
- Create: `libs/ui/ng-package.json`
- Create: `libs/ui/src/public-api.ts`
- Create: `libs/ui/core/ng-package.json`
- Create: `libs/ui/core/src/types/size.type.ts`
- Create: `libs/ui/core/src/types/variant.type.ts`
- Create: `libs/ui/core/src/config/ui-config.interface.ts`
- Create: `libs/ui/core/src/config/ui-config.ts`
- Create: `libs/ui/core/src/utils/cva.ts`
- Create: `libs/ui/core/src/utils/cn.ts`
- Create: `libs/ui/core/src/form/form-field-control.ts`
- Create: `libs/ui/core/src/public-api.ts`
- Modify: `tsconfig.json`
- Modify: `angular.json`
- Test: `libs/ui/core/src/utils/cva.spec.ts`

**Interfaces:**
- Consumes: Angular core DI (`InjectionToken`, `Provider`).
- Produces: `UiSize`, `UiVariant`, `UI_CONFIG`, `provideUiConfig()`, `cva()`, `cn()`, `UiFormFieldControl<T>`.

- [ ] **Step 1: Write the failing test for `cva` and `cn` utilities**

```typescript
// libs/ui/core/src/utils/cva.spec.ts
import { describe, expect, it } from 'vitest';
import { cva } from './cva';
import { cn } from './cn';

describe('cva utility', () => {
  it('should generate class strings with default variants', () => {
    const buttonVariants = cva({
      base: 'btn',
      variants: {
        variant: { primary: 'btn-primary', secondary: 'btn-secondary' },
        size: { sm: 'text-sm', md: 'text-base' },
      },
      defaultVariants: { variant: 'primary', size: 'md' },
    });

    expect(buttonVariants()).toBe('btn btn-primary text-base');
    expect(buttonVariants({ variant: 'secondary' })).toBe('btn btn-secondary text-base');
    expect(buttonVariants({ size: 'sm' }, 'custom-class')).toBe('btn btn-primary text-sm custom-class');
  });
});

describe('cn utility', () => {
  it('should merge class names and omit falsy values', () => {
    expect(cn('base', false && 'hidden', undefined, 'active')).toBe('base active');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run libs/ui/core/src/utils/cva.spec.ts`
Expected: FAIL with "Cannot find module './cva'"

- [ ] **Step 3: Implement core types, config, utilities, and packaging metadata**

```typescript
// libs/ui/core/src/utils/cn.ts
export function cn(...inputs: (string | undefined | null | false)[]): string {
  return inputs.filter(Boolean).join(' ').trim();
}

// libs/ui/core/src/utils/cva.ts
import { cn } from './cn';

export interface CvaConfig<T extends Record<string, Record<string, string>>> {
  base?: string;
  variants?: T;
  defaultVariants?: { [K in keyof T]?: keyof T[K] };
}

export function cva<T extends Record<string, Record<string, string>>>(config: CvaConfig<T>) {
  return (props?: { [K in keyof T]?: keyof T[K] }, extraClass?: string): string => {
    const classes: string[] = [];
    if (config.base) classes.push(config.base);

    if (config.variants) {
      for (const variantKey in config.variants) {
        const propValue = props?.[variantKey] ?? config.defaultVariants?.[variantKey];
        if (propValue && config.variants[variantKey][propValue as string]) {
          classes.push(config.variants[variantKey][propValue as string]);
        }
      }
    }

    if (extraClass) classes.push(extraClass);
    return cn(...classes);
  };
}

// libs/ui/core/src/types/size.type.ts
export type UiSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// libs/ui/core/src/types/variant.type.ts
export type UiVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';

// libs/ui/core/src/config/ui-config.interface.ts
import { UiSize } from '../types/size.type';

export interface UiConfig {
  defaultSize?: UiSize;
  button?: {
    defaultVariant?: string;
    defaultSize?: UiSize;
  };
  formField?: {
    appearance?: 'outline' | 'filled';
  };
}

// libs/ui/core/src/config/ui-config.ts
import { InjectionToken, Provider } from '@angular/core';
import { UiConfig } from './ui-config.interface';

export const UI_CONFIG = new InjectionToken<UiConfig>('UI_CONFIG');

export function provideUiConfig(config: UiConfig): Provider {
  return { provide: UI_CONFIG, useValue: config };
}

// libs/ui/core/src/form/form-field-control.ts
import { Signal } from '@angular/core';

export abstract class UiFormFieldControl<T> {
  abstract readonly $value: Signal<T | null>;
  abstract readonly $disabled: Signal<boolean>;
  abstract readonly $focused: Signal<boolean>;
  abstract readonly $invalid: Signal<boolean>;
  abstract readonly id: string;
}
```

Setup `libs/ui/core/ng-package.json`, `libs/ui/ng-package.json`, `libs/ui/package.json`, and register `@libs/ui` and `@libs/ui/*` in `tsconfig.json` and `"ui"` in `angular.json`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run libs/ui/core/src/utils/cva.spec.ts`
Expected: PASS

- [ ] **Step 5: Verify library discovery**

Run: `node .ci/build-libs.js`
Expected: Discovers and verifies the `"ui"` project.

---

### Task 2: Button Component Family (`@libs/ui/button`)

**Files:**
- Create: `libs/ui/button/ng-package.json`
- Create: `libs/ui/button/src/types.ts`
- Create: `libs/ui/button/src/button.variants.ts`
- Create: `libs/ui/button/src/button.directive.ts`
- Create: `libs/ui/button/src/button-group.component.ts`
- Create: `libs/ui/button/src/public-api.ts`
- Test: `libs/ui/button/src/button.spec.ts`

**Interfaces:**
- Consumes: `cva`, `cn`, `UI_CONFIG`, `UiSize` from `@libs/ui/core`.
- Produces: `UiButtonDirective` (`button[uiButton]`, `a[uiButton]`), `UiButtonGroupComponent` (`ui-button-group`), `UiButtonVariant`, `UiButtonSize`.

- [ ] **Step 1: Write failing tests for `UiButtonDirective`**

```typescript
// libs/ui/button/src/button.spec.ts
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { UiButtonDirective } from './button.directive';

@Component({
  standalone: true,
  imports: [UiButtonDirective],
  template: `
    <button uiButton [variant]="variant()" [size]="size()" [loading]="loading()" [disabled]="disabled()">
      Click me
    </button>
  `,
})
class TestHostComponent {
  readonly variant = signal<'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'>('primary');
  readonly size = signal<'sm' | 'md' | 'lg' | 'icon'>('md');
  readonly loading = signal(false);
  readonly disabled = signal(false);
}

describe('UiButtonDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let buttonEl: HTMLButtonElement;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TestHostComponent] });
    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    buttonEl = fixture.nativeElement.querySelector('button');
  });

  it('should apply primary variant and md size classes', () => {
    expect(buttonEl.className).toContain('bg-primary');
    expect(buttonEl.className).toContain('h-10');
  });

  it('should reflect loading state and aria-busy', () => {
    fixture.componentInstance.loading.set(true);
    fixture.detectChanges();
    expect(buttonEl.getAttribute('aria-busy')).toBe('true');
  });

  it('should disable button when disabled signal is true', () => {
    fixture.componentInstance.disabled.set(true);
    fixture.detectChanges();
    expect(buttonEl.disabled).toBe(true);
    expect(buttonEl.getAttribute('aria-disabled')).toBe('true');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run libs/ui/button/src/button.spec.ts`
Expected: FAIL

- [ ] **Step 3: Implement `button.variants.ts`, `button.directive.ts`, and `button-group.component.ts`**

```typescript
// libs/ui/button/src/button.variants.ts
import { cva } from '@libs/ui/core';

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
    fullWidth: {
      true: 'w-full',
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

Implement `UiButtonDirective` using `input<UiButtonVariant>('primary')`, `input<UiButtonSize>('md')`, `computed()` for host classes, and an injected `UI_CONFIG` fallback.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run libs/ui/button/src/button.spec.ts`
Expected: PASS

---

### Task 3: Input & Form Field Component Family (`@libs/ui/input`)

**Files:**
- Create: `libs/ui/input/ng-package.json`
- Create: `libs/ui/input/src/input.variants.ts`
- Create: `libs/ui/input/src/input.directive.ts`
- Create: `libs/ui/input/src/textarea.directive.ts`
- Create: `libs/ui/input/src/form-field.component.ts`
- Create: `libs/ui/input/src/label.directive.ts`
- Create: `libs/ui/input/src/hint.directive.ts`
- Create: `libs/ui/input/src/error.directive.ts`
- Create: `libs/ui/input/src/prefix-suffix.directive.ts`
- Create: `libs/ui/input/src/public-api.ts`
- Test: `libs/ui/input/src/form-field.spec.ts`

**Interfaces:**
- Consumes: `cva`, `cn`, `UiFormFieldControl` from `@libs/ui/core`.
- Produces: `UiFormFieldComponent`, `UiInputDirective`, `UiTextareaDirective`, `UiLabelDirective`, `UiHintDirective`, `UiErrorDirective`, `UiPrefixDirective`, `UiSuffixDirective`.

- [ ] **Step 1: Write failing tests for form field orchestration and CVA**

```typescript
// libs/ui/input/src/form-field.spec.ts
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import {
  UiFormFieldComponent,
  UiInputDirective,
  UiLabelDirective,
  UiErrorDirective,
  UiHintDirective,
} from './public-api';

@Component({
  standalone: true,
  imports: [
    ReactiveFormsModule,
    UiFormFieldComponent,
    UiInputDirective,
    UiLabelDirective,
    UiErrorDirective,
    UiHintDirective,
  ],
  template: `
    <ui-form-field>
      <label uiLabel>Email</label>
      <input uiInput [formControl]="emailControl" placeholder="Enter email" />
      <span uiHint>Helpful note</span>
      @if (emailControl.invalid && emailControl.touched) {
        <span uiError>Email required</span>
      }
    </ui-form-field>
  `,
})
class FormHostComponent {
  readonly emailControl = new FormControl('', Validators.required);
}

describe('UiFormFieldComponent', () => {
  let fixture: ComponentFixture<FormHostComponent>;
  let inputEl: HTMLInputElement;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [FormHostComponent] });
    fixture = TestBed.createComponent(FormHostComponent);
    fixture.detectChanges();
    inputEl = fixture.nativeElement.querySelector('input');
  });

  it('should associate label for attribute with input id', () => {
    const labelEl = fixture.nativeElement.querySelector('label');
    expect(labelEl.getAttribute('for')).toBe(inputEl.id);
  });

  it('should mark aria-invalid when control is touched and invalid', () => {
    fixture.componentInstance.emailControl.markAsTouched();
    fixture.detectChanges();
    expect(inputEl.getAttribute('aria-invalid')).toBe('true');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run libs/ui/input/src/form-field.spec.ts`
Expected: FAIL

- [ ] **Step 3: Implement directives and form field coordinator component**

Implement `UiInputDirective` and `UiTextareaDirective` adhering to `ControlValueAccessor` and extending `UiFormFieldControl`.
Implement `UiFormFieldComponent` coordinating unique ID generation, focus rings, prefixes, suffixes, hints, and error elements.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run libs/ui/input/src/form-field.spec.ts`
Expected: PASS

---

### Task 4: Checkbox & Switch Component Family (`@libs/ui/checkbox`)

**Files:**
- Create: `libs/ui/checkbox/ng-package.json`
- Create: `libs/ui/checkbox/src/checkbox.variants.ts`
- Create: `libs/ui/checkbox/src/checkbox.component.ts`
- Create: `libs/ui/checkbox/src/switch.component.ts`
- Create: `libs/ui/checkbox/src/public-api.ts`
- Test: `libs/ui/checkbox/src/checkbox.spec.ts`

**Interfaces:**
- Consumes: `cva`, `cn`, `UiSize` from `@libs/ui/core`.
- Produces: `UiCheckboxComponent` (`<ui-checkbox>`), `UiSwitchComponent` (`<ui-switch>`).

- [ ] **Step 1: Write failing tests for checkbox and switch**

```typescript
// libs/ui/checkbox/src/checkbox.spec.ts
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { UiCheckboxComponent, UiSwitchComponent } from './public-api';

@Component({
  standalone: true,
  imports: [UiCheckboxComponent, UiSwitchComponent],
  template: `
    <ui-checkbox [(checked)]="checked" [disabled]="disabled()" label="Accept Terms" />
    <ui-switch [(checked)]="switchChecked" label="Notifications" />
  `,
})
class CheckboxHostComponent {
  readonly checked = signal(false);
  readonly disabled = signal(false);
  readonly switchChecked = signal(false);
}

describe('UiCheckboxComponent and UiSwitchComponent', () => {
  let fixture: ComponentFixture<CheckboxHostComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [CheckboxHostComponent] });
    fixture = TestBed.createComponent(CheckboxHostComponent);
    fixture.detectChanges();
  });

  it('should toggle checked signal when checkbox is clicked', () => {
    const checkboxEl = fixture.nativeElement.querySelector('ui-checkbox input');
    checkboxEl.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.checked()).toBe(true);
  });

  it('should have role="switch" and toggle aria-checked on switch', () => {
    const switchEl = fixture.nativeElement.querySelector('ui-switch button');
    expect(switchEl.getAttribute('role')).toBe('switch');
    switchEl.click();
    fixture.detectChanges();
    expect(switchEl.getAttribute('aria-checked')).toBe('true');
    expect(fixture.componentInstance.switchChecked()).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run libs/ui/checkbox/src/checkbox.spec.ts`
Expected: FAIL

- [ ] **Step 3: Implement `UiCheckboxComponent` and `UiSwitchComponent`**

Implement `UiCheckboxComponent` and `UiSwitchComponent` supporting `model<boolean>()`, `ControlValueAccessor`, keyboard Space toggling, and clean a11y attributes.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run libs/ui/checkbox/src/checkbox.spec.ts`
Expected: PASS

---

### Task 5: Radio & RadioGroup Component Family (`@libs/ui/radio`)

**Files:**
- Create: `libs/ui/radio/ng-package.json`
- Create: `libs/ui/radio/src/radio-group.component.ts`
- Create: `libs/ui/radio/src/radio.component.ts`
- Create: `libs/ui/radio/src/public-api.ts`
- Test: `libs/ui/radio/src/radio.spec.ts`

**Interfaces:**
- Consumes: `cn`, `UiSize` from `@libs/ui/core`.
- Produces: `UiRadioGroupComponent` (`<ui-radio-group>`), `UiRadioComponent` (`<ui-radio>`).

- [ ] **Step 1: Write failing tests for radio group selection and keyboard navigation**

```typescript
// libs/ui/radio/src/radio.spec.ts
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { UiRadioGroupComponent, UiRadioComponent } from './public-api';

@Component({
  standalone: true,
  imports: [UiRadioGroupComponent, UiRadioComponent],
  template: `
    <ui-radio-group [(value)]="selected">
      <ui-radio value="option1" label="Option 1" />
      <ui-radio value="option2" label="Option 2" />
    </ui-radio-group>
  `,
})
class RadioHostComponent {
  readonly selected = signal('option1');
}

describe('UiRadioGroupComponent', () => {
  let fixture: ComponentFixture<RadioHostComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [RadioHostComponent] });
    fixture = TestBed.createComponent(RadioHostComponent);
    fixture.detectChanges();
  });

  it('should mark first radio as checked and active', () => {
    const radios = fixture.nativeElement.querySelectorAll('ui-radio');
    expect(radios[0].getAttribute('aria-checked')).toBe('true');
    expect(radios[1].getAttribute('aria-checked')).toBe('false');
  });

  it('should change active selection on click', () => {
    const radios = fixture.nativeElement.querySelectorAll('ui-radio');
    radios[1].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.selected()).toBe('option2');
    expect(radios[1].getAttribute('aria-checked')).toBe('true');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run libs/ui/radio/src/radio.spec.ts`
Expected: FAIL

- [ ] **Step 3: Implement `UiRadioGroupComponent` and `UiRadioComponent`**

Implement container coordination, `model<any>()`, arrow navigation handling, and child radio registration.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run libs/ui/radio/src/radio.spec.ts`
Expected: PASS

---

### Task 6: Documentation & Preview App Setup (`projects/docs`)

**Files:**
- Create: `projects/docs/tsconfig.app.json`
- Create: `projects/docs/src/index.html`
- Create: `projects/docs/src/main.ts`
- Create: `projects/docs/src/styles.css`
- Create: `projects/docs/src/app/app.config.ts`
- Create: `projects/docs/src/app/app.routes.ts`
- Create: `projects/docs/src/app/app.component.ts`
- Create: `projects/docs/src/app/layout/docs-layout.component.ts`
- Create: `projects/docs/src/app/layout/docs-header.component.ts`
- Create: `projects/docs/src/app/layout/docs-sidebar.component.ts`
- Modify: `angular.json`
- Modify: `package.json`

**Interfaces:**
- Consumes: `@libs/ui/*` via TypeScript path aliases.
- Produces: Running preview server via `npm run docs:dev` (`ng serve docs`).

- [ ] **Step 1: Configure `docs` project in `angular.json` and `package.json`**

Register `"docs"` under `projects` in `angular.json` using `@angular/build:application` targeting `projects/docs`.
Add `"docs:dev": "ng serve docs"` and `"docs:build": "ng build docs"` to `package.json`.

- [ ] **Step 2: Create application entry points and layout**

Create `projects/docs/src/styles.css` importing Tailwind CSS 4.
Build `DocsLayoutComponent`, `DocsHeaderComponent` (with dark/light theme switcher), and `DocsSidebarComponent` listing getting started docs and component routes (`/button`, `/input`, `/checkbox`, `/radio`).

- [ ] **Step 3: Verify docs app compilation**

Run: `npx ng build docs`
Expected: Successful compilation without errors into `dist/docs`.

---

### Task 7: Interactive Component Showcases & Build Verification

**Files:**
- Create: `projects/docs/src/app/shared/playground/playground.component.ts`
- Create: `projects/docs/src/app/shared/code-block/code-block.component.ts`
- Create: `projects/docs/src/app/features/button-doc/button-doc.component.ts`
- Create: `projects/docs/src/app/features/input-doc/input-doc.component.ts`
- Create: `projects/docs/src/app/features/checkbox-doc/checkbox-doc.component.ts`
- Create: `projects/docs/src/app/features/radio-doc/radio-doc.component.ts`
- Modify: `.ci/build-libs.js`

**Interfaces:**
- Consumes: `@libs/ui/button`, `@libs/ui/input`, `@libs/ui/checkbox`, `@libs/ui/radio`.
- Produces: Interactive playground pages with live prop knobs, live rendered canvases, and synchronized copyable code blocks.

- [ ] **Step 1: Implement generic `PlaygroundComponent` and `CodeBlockComponent`**

Create `PlaygroundComponent` with viewport sizing, responsive preview container, and props control panel.
Create `CodeBlockComponent` formatting code strings with syntax highlighting and a clipboard copy button.

- [ ] **Step 2: Implement showcase pages for Button, Input, Checkbox, and Radio**

Wire up interactive state signals in each component doc page (`button-doc`, `input-doc`, `checkbox-doc`, `radio-doc`).
Connect controls to live component instances and generate synchronized Angular template snippets.

- [ ] **Step 3: Run comprehensive verification**

Run: `npm test`
Expected: All library and application tests PASS.

Run: `node .ci/build-libs.js`
Expected: All libraries (including `@libs/ui`) build successfully.

Run: `npm run docs:build`
Expected: Docs app builds cleanly.
