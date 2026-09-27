# Feedback & Data Display (Alert, Spinner / Progress, Card, Badge, Avatar, Tag) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add six presentational entry points to `@libs/ui` (`progress`, `alert`, `tag`, `badge`, `avatar`, `card`), each with tests and a docs page, and move the button's loading spinner onto a shared `spinner` CSS utility.

**Architecture:**
- Every component is a thin signal-based Angular wrapper that picks class names through `cva`. The look lives in Tailwind v4 `@utility` rules in `libs/ui/styles/components/*.css`, driven by custom properties (`--alert-*`, `--tag-*`, `--badge-*`, …) and the design tokens (`--color-*`).
- No CDK Overlay and no `@angular/aria`. The only CDK use is `AriaDescriber` for `[uiBadge]`'s description.
- A shared `UiColor` type in `@libs/ui/core` gives alert, progress, badge and tag one color scale.

**Tech Stack:** Angular 22 (standalone, signals: `input`, `model`, `output`, `computed`, `linkedSignal`, `contentChildren`), `@angular/cdk/a11y` (`AriaDescriber`), Tailwind CSS 4 `@utility`, Vitest through `@angular/build:unit-test` (jsdom).

**Spec:** `docs/superpowers/specs/2026-09-27-ui-feedback-data-display-design.md`

## Global Constraints

- Entry points: `libs/ui/<name>` → import path `@libs/ui/<name>` for `progress`, `alert`, `tag`, `badge`, `avatar`, `card`. Each is also re-exported from `@libs/ui` (`libs/ui/src/public-api.ts`).
- Class names follow the library convention: `Ui<Name>Component` / `Ui<Name>Directive` (the spec's `UiSpinner`, `UiAlert`, … are these).
- Selectors: `ui-spinner`, `ui-progress-bar`, `ui-alert`, `[uiAlertTitle]`, `[uiAlertIcon]`, `[uiAlertActions]`, `ui-tag`, `[uiTagIcon]`, `ui-badge`, `[uiBadge]`, `ui-avatar`, `ui-avatar-group`, `ui-card` / `[uiCard]`, `[uiCardHeader]`, `[uiCardTitle]`, `[uiCardDescription]`, `[uiCardAction]`, `[uiCardContent]`, `[uiCardFooter]`, `[uiCardMedia]`.
- `UiColor = 'neutral' | 'primary' | 'info' | 'success' | 'warning' | 'error'`.
- All components are `ChangeDetectionStrategy.OnPush` and use signal APIs. Boolean inputs use `booleanAttribute`, numeric inputs `numberAttribute` (or the transforms defined in this plan).
- **Class names in `cva` maps and templates must be literal strings.** Tailwind scans the source files, so a class built at runtime (`'badge-' + position`) is never emitted.
- Colors come only from tokens (`--color-*`). No hard-coded colors in the CSS, except the black `rgb(0 0 0 / …)` shadows.
- Every animation has a `prefers-reduced-motion: reduce` fallback.
- Nothing is rendered with `innerHTML`.
- Defaults (from the spec):
  - `ui-spinner`: `size` `'inherit'` (1em), `color` `'current'`, `label` `'Loading'`
  - `ui-progress-bar`: `size` `'md'`, `color` `'primary'`, `label` `'Progress'`
  - `ui-alert`: `color` `'neutral'`, `appearance` `'soft'`, `closeLabel` `'Dismiss'`
  - `ui-tag`: `color` `'neutral'`, `appearance` `'soft'`, `size` `'md'`, `removeLabel` `'Remove'`
  - badge: `max` `99`, `color` `'error'`, `size` `'md'`, `position` `'top-end'`
  - `ui-avatar`: `size` `'md'`, `shape` `'circle'`
  - `ui-card`: `appearance` `'outline'`, `padding` `'md'`
- **Prebuilt package:** `@libs/ui/*` resolves to the committed prebuilt `packages/ui/*` **first**, then to `libs/ui/*/src/public-api`. After changing `libs/ui/core` or `libs/ui/button`, run `npx ng build ui` before running specs of other entry points (Task 1 does this), and commit `packages/ui`.
- Commands:
  - One entry point's specs: `npx ng test ui --watch=false --include="../<entry>/**/*.spec.ts"`
  - The whole library: `npx ng test ui --watch=false`
  - Lint: `npx ng lint ui`
  - Docs build (also compiles the CSS): `npx ng build docs`
- Commit messages: `type(scope): emoji subject`, body lines ≤ 100 chars (commitlint). End with a blank line and `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Only `git add` the paths listed in each task.

### Decisions taken while planning (refinements of the spec)

- **`ui-card` is a component** (template `<ng-content />`), not a directive, so `<ui-card>` is a known element under `strictTemplates`. The `ui-card, [uiCard]` selector and API stay as in the spec.
- **Alert layout:** the component uses a new flex layout `alert-row` instead of `alert-horizontal`. The grid in `alert-horizontal` gives the close button the `1fr` column when the icon slot is empty. To make that possible without CSS-order conflicts, `alert` reads `display`, `align-items`, `border-width` and `border-radius` from new custom properties, with today's values as fallbacks.
- **Tag remove label:** the × button gets `aria-labelledby="<sr-only 'Remove' span> <label span>"`, so its name is "Remove Draft" without reading `textContent` at runtime.
- **Tag `removable` + `checkable`:** checked once in `ngOnInit`; a dev-mode error is thrown.
- **Avatar a11y:** the host is always `role="img"` with `aria-label` = `alt ?? name`, and the inner `<img>` has `alt=""`. With no accessible name (or `alt=""`) the host is `aria-hidden="true"`. This avoids announcing the name twice while the image loads.
- **Avatar doesn't clip** (no `overflow: hidden`; the image uses `border-radius: inherit`), so a `[uiBadge]` dot on an avatar stays visible.
- **Spinner / bar `aria-valuenow`** is the value clamped to `[0, max]`, and `aria-valuemax` is `max`.

## Review Focus

1. **`[uiBadge]` on `button[uiButton]`**, whose own `[class]` host binding could wipe `badge-anchor`. The anchor class and the badge span must survive change detection. Test in Task 6.
2. **A badge on `ui-avatar`, then the image loads.** The avatar's `@if` re-render must not remove the directive's badge span. Test in Task 7.
3. **A badge count dropping to 0 while `uiBadgeDescription` is set.** The description (`aria-describedby`) must go away, so screen readers don't announce "5 unread" for a hidden badge. Test in Task 6.
4. **A removable tag inside a clickable row.** Clicking × must emit `(removed)` without triggering the row's click. Test in Task 5.
5. **Static string attributes** (`<ui-spinner value="42" max="10">`, `<ui-progress-bar value="30">`) must behave like bound numbers. Tests in Tasks 2 and 3.

---

## File Structure

| File | Responsibility |
|---|---|
| `libs/ui/core/src/types/color.type.ts` | `UiColor` |
| `libs/ui/styles/components/progress.css` | `spinner`, `spinner-ring` (+ sizes, colors, modes), `progress-bar` (+ sizes, colors, indeterminate) |
| `libs/ui/progress/src/progress.utils.ts` | `clampProgress`, `clampValue`, `progressValueAttribute` |
| `libs/ui/progress/src/progress.types.ts` | `UiSpinnerSize`, `UiSpinnerColor`, `UiProgressBarSize` |
| `libs/ui/progress/src/progress.variants.ts` | `spinnerVariants`, `progressBarVariants` |
| `libs/ui/progress/src/spinner.component.ts` | `UiSpinnerComponent` |
| `libs/ui/progress/src/progress-bar.component.ts` | `UiProgressBarComponent` |
| `libs/ui/styles/components/alert.css` | + variable-driven display/radius/border, `alert-primary`, `alert-solid`, `alert-banner`, `alert-row`, `alert-title`, `alert-actions`, `alert-close` |
| `libs/ui/alert/src/alert.types.ts` | `UiAlertAppearance`, `UiAlertRole` |
| `libs/ui/alert/src/alert-icons.ts` | `UI_ALERT_ICONS` (default icon paths per color) |
| `libs/ui/alert/src/alert.variants.ts` | `alertVariants` |
| `libs/ui/alert/src/alert-parts.directive.ts` | `UiAlertTitleDirective`, `UiAlertIconDirective`, `UiAlertActionsDirective` |
| `libs/ui/alert/src/alert.component.ts` / `.html` | `UiAlertComponent` |
| `libs/ui/styles/components/tag.css` | Variable-driven `tag` + colors, `tag-outline`, `tag-solid`, `tag-lg`, `tag-checkable`, `tag-disabled`, `tag-icon`, `tag-label` |
| `libs/ui/tag/src/tag.types.ts` | `UiTagAppearance`, `UiTagSize` |
| `libs/ui/tag/src/tag.variants.ts` | `tagVariants` |
| `libs/ui/tag/src/tag-icon.directive.ts` | `UiTagIconDirective` |
| `libs/ui/tag/src/tag.component.ts` / `.html` | `UiTagComponent` |
| `libs/ui/styles/components/badge.css` | `badge` + sizes/colors/dot, `badge-anchor`, `badge-overlay`, positions, `badge-circular` |
| `libs/ui/badge/src/badge.utils.ts` | `formatBadgeCount` |
| `libs/ui/badge/src/badge.types.ts` | `UiBadgeSize`, `UiBadgePosition`, `UiBadgeOverlap` |
| `libs/ui/badge/src/badge.variants.ts` | `badgeVariants`, `badgeOverlayVariants` |
| `libs/ui/badge/src/badge.component.ts` | `UiBadgeComponent` (inline) |
| `libs/ui/badge/src/badge-anchor.directive.ts` | `UiBadgeAnchorDirective` (`[uiBadge]`) |
| `libs/ui/styles/components/avatar.css` | `avatar` + sizes, `avatar-square`, `avatar-group` |
| `libs/ui/avatar/src/initials.ts` | `getInitials` |
| `libs/ui/avatar/src/avatar.types.ts` | `UiAvatarShape` |
| `libs/ui/avatar/src/avatar.tokens.ts` | `UI_AVATAR_GROUP`, `UiAvatarGroupContext` |
| `libs/ui/avatar/src/avatar.variants.ts` | `avatarVariants` |
| `libs/ui/avatar/src/avatar.component.ts` / `.html` | `UiAvatarComponent` |
| `libs/ui/avatar/src/avatar-group.component.ts` | `UiAvatarGroupComponent` |
| `libs/ui/styles/components/card.css` | `card` + appearances, paddings, `card-interactive`, parts |
| `libs/ui/card/src/card.types.ts` | `UiCardAppearance`, `UiCardPadding` |
| `libs/ui/card/src/card.variants.ts` | `cardVariants` |
| `libs/ui/card/src/card.component.ts` | `UiCardComponent` |
| `libs/ui/card/src/card-parts.directive.ts` | The seven part directives |
| `projects/docs/src/app/features/<name>-doc/*` | One docs page per entry point |

---

### Task 1: `UiColor`, the `spinner` utility and the button migration

**Files:**
- Create: `libs/ui/core/src/types/color.type.ts`
- Modify: `libs/ui/core/src/public-api.ts`
- Create: `libs/ui/styles/components/progress.css`
- Modify: `libs/ui/styles/index.css`
- Modify: `libs/ui/button/src/button.component.ts` (template)
- Test: `libs/ui/button/src/button.spec.ts`
- Rebuild: `packages/ui`

**Interfaces:**
- Produces: `export type UiColor = 'neutral' | 'primary' | 'info' | 'success' | 'warning' | 'error'` from `@libs/ui/core`. The `spinner` CSS class and the `ui-spin` keyframes in `progress.css` (Task 2 appends to this file).

- [ ] **Step 1: Point the button spec at the new class**

In `libs/ui/button/src/button.spec.ts`, replace the test `should render a spinner and disable the button while loading` with:

```ts
  it('should render a spinner and disable the button while loading', () => {
    expect(buttonEl.querySelector('.spinner')).toBeNull();

    fixture.componentInstance.loading.set(true);
    fixture.detectChanges();
    const spinner = buttonEl.querySelector('.spinner');
    expect(spinner).not.toBeNull();
    expect(spinner!.getAttribute('aria-hidden')).toBe('true');
    expect(buttonEl.disabled).toBe(true);
    expect(buttonEl.getAttribute('aria-disabled')).toBe('true');

    fixture.componentInstance.loading.set(false);
    fixture.detectChanges();
    expect(buttonEl.querySelector('.spinner')).toBeNull();
    expect(buttonEl.disabled).toBe(false);
  });
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx ng test ui --watch=false --include="../button/**/*.spec.ts"`
Expected: FAIL. `should render a spinner…` finds no `.spinner`.

- [ ] **Step 3: Add `UiColor`**

`libs/ui/core/src/types/color.type.ts`:

```ts
/** Semantic color scale shared by alert, progress, badge and tag. Maps to the `--color-*` tokens. */
export type UiColor = 'neutral' | 'primary' | 'info' | 'success' | 'warning' | 'error';
```

`libs/ui/core/src/public-api.ts` (keep the other lines):

```ts
export * from './config/ui-config';
export * from './config/ui-config.interface';
export * from './form/form-field-control';
export * from './types/color.type';
export * from './types/size.type';
export * from './types/variant.type';
export * from './utils/cn';
export * from './utils/cva';
```

- [ ] **Step 4: Add the `spinner` utility**

`libs/ui/styles/components/progress.css`:

```css
/* ----------------------------------------------------------------------------------------------------- */
/*  @ Progress
/*
/*  `spinner`       minimal border spinner, used by the uiButton loading state
/*  `spinner-ring`  ui-spinner: SVG ring, indeterminate or determinate
/*  `progress-bar`  ui-progress-bar: linear track + `.progress-bar-fill`
/*
/*  Colors set `--spinner-color` / `--progress-color`; sizes set `--spinner-size` / `--progress-h`.
/* ----------------------------------------------------------------------------------------------------- */
@keyframes ui-spin {
  to {
    transform: rotate(360deg);
  }
}

@utility spinner {
  display: inline-block;
  flex-shrink: 0;
  width: 1em;
  height: 1em;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 9999px;
  animation: ui-spin 1s linear infinite;

  @media (prefers-reduced-motion: reduce) {
    animation-duration: 2s;
  }
}
```

In `libs/ui/styles/index.css`, add `@import './components/progress.css';` after the `alert.css` import:

```css
@import './components/alert.css';
@import './components/progress.css';
@import './components/layout.css';
```

- [ ] **Step 5: Use it in the button template**

In `libs/ui/button/src/button.component.ts`, replace the template's spinner span:

```ts
  template: `
    @if (loading()) {
      <span
        aria-hidden="true"
        class="spinner"
      ></span>
    }
    <ng-content />
  `,
```

- [ ] **Step 6: Run the button specs**

Run: `npx ng test ui --watch=false --include="../button/**/*.spec.ts"`
Expected: PASS (7 tests).

- [ ] **Step 7: Rebuild the prebuilt package and check the CSS compiles**

Run: `npx ng build ui && npx ng build docs`
Expected: both succeed. `grep -c "UiColor" packages/ui/types/libs-ui-core.d.ts` prints at least `1`.

- [ ] **Step 8: Commit**

```bash
git add libs/ui/core/src/types/color.type.ts libs/ui/core/src/public-api.ts \
  libs/ui/styles/components/progress.css libs/ui/styles/index.css \
  libs/ui/button/src/button.component.ts libs/ui/button/src/button.spec.ts packages/ui
git commit -m "feat(ui): ✨ add UiColor and a shared spinner css utility

refactor(ui): ♻️ use the spinner utility for the button loading state

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: `@libs/ui/progress` — utils and `ui-spinner`

**Files:**
- Create: `libs/ui/progress/ng-package.json`
- Create: `libs/ui/progress/src/public-api.ts`
- Create: `libs/ui/progress/src/progress.utils.ts`
- Create: `libs/ui/progress/src/progress.types.ts`
- Create: `libs/ui/progress/src/progress.variants.ts`
- Create: `libs/ui/progress/src/spinner.component.ts`
- Modify: `libs/ui/styles/components/progress.css` (append)
- Modify: `libs/ui/src/public-api.ts`
- Test: `libs/ui/progress/src/progress.utils.spec.ts`, `libs/ui/progress/src/spinner.spec.ts`

**Interfaces:**
- Consumes: `UiColor`, `UiSize`, `cva` from `@libs/ui/core`.
- Produces:
  - `clampProgress(value: number, max?: number): number` returns a percentage in `[0, 100]`
  - `clampValue(value: number, max?: number): number` returns a value in `[0, max]`
  - `progressValueAttribute(value: unknown): number | null`
  - `type UiSpinnerSize = UiSize | 'inherit'`, `type UiSpinnerColor = UiColor | 'current'`, `type UiProgressBarSize = 'sm' | 'md' | 'lg'`
  - `spinnerVariants`, `UiSpinnerComponent`

- [ ] **Step 1: Write the failing utils spec**

`libs/ui/progress/src/progress.utils.spec.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { clampProgress, clampValue, progressValueAttribute } from './progress.utils';

describe('clampProgress', () => {
  it('returns the percentage of value over max', () => {
    expect(clampProgress(50)).toBe(50);
    expect(clampProgress(5, 10)).toBe(50);
  });

  it('clamps to [0, 100]', () => {
    expect(clampProgress(150)).toBe(100);
    expect(clampProgress(-5)).toBe(0);
  });

  it('returns 0 for invalid input', () => {
    expect(clampProgress(5, 0)).toBe(0);
    expect(clampProgress(5, -1)).toBe(0);
    expect(clampProgress(Number.NaN)).toBe(0);
    expect(clampProgress(5, Number.NaN)).toBe(0);
  });
});

describe('clampValue', () => {
  it('clamps to [0, max]', () => {
    expect(clampValue(42)).toBe(42);
    expect(clampValue(150)).toBe(100);
    expect(clampValue(-3)).toBe(0);
    expect(clampValue(12, 10)).toBe(10);
  });

  it('returns 0 for invalid input', () => {
    expect(clampValue(Number.NaN)).toBe(0);
    expect(clampValue(5, 0)).toBe(0);
  });
});

describe('progressValueAttribute', () => {
  it('keeps null, undefined and empty string as null (indeterminate)', () => {
    expect(progressValueAttribute(null)).toBeNull();
    expect(progressValueAttribute(undefined)).toBeNull();
    expect(progressValueAttribute('')).toBeNull();
  });

  it('converts numbers and numeric strings', () => {
    expect(progressValueAttribute(7)).toBe(7);
    expect(progressValueAttribute('42')).toBe(42);
    expect(progressValueAttribute('abc')).toBeNaN();
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx ng test ui --watch=false --include="../progress/**/*.spec.ts"`
Expected: FAIL. It can't resolve `./progress.utils`.

- [ ] **Step 3: Create the entry point and the utils**

`libs/ui/progress/ng-package.json`:

```json
{
  "$schema": "../../../node_modules/ng-packagr/ng-package.schema.json",
  "lib": {
    "entryFile": "src/public-api.ts"
  }
}
```

`libs/ui/progress/src/progress.utils.ts`:

```ts
import { numberAttribute } from '@angular/core';

/** Percentage of `value` over `max`, clamped to [0, 100]. Invalid input (NaN, `max <= 0`) gives 0. */
export function clampProgress(value: number, max = 100): number {
  if (!Number.isFinite(value) || !Number.isFinite(max) || max <= 0) return 0;
  return Math.min(100, Math.max(0, (value / max) * 100));
}

/** `value` clamped to [0, max], for `aria-valuenow`. Invalid input gives 0. */
export function clampValue(value: number, max = 100): number {
  if (!Number.isFinite(value) || !Number.isFinite(max) || max <= 0) return 0;
  return Math.min(max, Math.max(0, value));
}

/** Input transform: `null`, `undefined` and `''` stay `null` (indeterminate); anything else becomes a number. */
export function progressValueAttribute(value: unknown): number | null {
  return value === null || value === undefined || value === '' ? null : numberAttribute(value, NaN);
}
```

`libs/ui/progress/src/progress.types.ts`:

```ts
import { UiColor, UiSize } from '@libs/ui/core';

/** `inherit` sizes the spinner to `1em`, so it scales with the surrounding text. */
export type UiSpinnerSize = UiSize | 'inherit';

/** `current` uses `currentColor`. */
export type UiSpinnerColor = UiColor | 'current';

export type UiProgressBarSize = 'sm' | 'md' | 'lg';
```

`libs/ui/progress/src/public-api.ts` (Task 3 adds the progress bar):

```ts
export * from './progress.types';
export * from './progress.utils';
export * from './progress.variants';
export * from './spinner.component';
```

- [ ] **Step 4: Write the failing spinner spec**

`libs/ui/progress/src/spinner.spec.ts`:

```ts
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { UiSpinnerColor, UiSpinnerSize } from './progress.types';
import { UiSpinnerComponent } from './spinner.component';

const CIRCUMFERENCE = 2 * Math.PI * 10;

@Component({
  imports: [UiSpinnerComponent],
  template: `
    <ui-spinner
      [value]="value()"
      [max]="max()"
      [size]="size()"
      [color]="color()"
      [strokeWidth]="strokeWidth()"
      [showValue]="showValue()"
      [label]="label()"
    />
  `,
})
class SpinnerHostComponent {
  readonly value = signal<number | null>(null);
  readonly max = signal(100);
  readonly size = signal<UiSpinnerSize>('inherit');
  readonly color = signal<UiSpinnerColor>('current');
  readonly strokeWidth = signal<number | null>(null);
  readonly showValue = signal(false);
  readonly label = signal('Loading');
}

@Component({
  imports: [UiSpinnerComponent],
  template: `<ui-spinner value="5" max="10" />`,
})
class StaticAttrHostComponent {}

describe('UiSpinnerComponent', () => {
  let fixture: ComponentFixture<SpinnerHostComponent>;
  let host: SpinnerHostComponent;
  let el: HTMLElement;

  const indicator = () => el.querySelector('.spinner-indicator')!;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [SpinnerHostComponent] });
    fixture = TestBed.createComponent(SpinnerHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    el = fixture.nativeElement.querySelector('ui-spinner');
  });

  it('is an indeterminate progressbar by default', () => {
    expect(el.getAttribute('role')).toBe('progressbar');
    expect(el.getAttribute('aria-label')).toBe('Loading');
    expect(el.hasAttribute('aria-valuenow')).toBe(false);
    expect(el.hasAttribute('aria-valuemin')).toBe(false);
    expect(el.hasAttribute('aria-valuemax')).toBe(false);
    expect(el.classList).toContain('spinner-ring');
    expect(el.classList).toContain('spinner-indeterminate');
    expect(el.querySelector('.spinner-track')).toBeNull();
    expect(indicator().hasAttribute('stroke-dasharray')).toBe(false);
  });

  it('renders a determinate ring when value is set', () => {
    host.value.set(42);
    fixture.detectChanges();

    expect(el.getAttribute('aria-valuenow')).toBe('42');
    expect(el.getAttribute('aria-valuemin')).toBe('0');
    expect(el.getAttribute('aria-valuemax')).toBe('100');
    expect(el.classList).toContain('spinner-determinate');
    expect(el.querySelector('.spinner-track')).not.toBeNull();
    expect(Number(indicator().getAttribute('stroke-dasharray'))).toBeCloseTo(CIRCUMFERENCE, 3);
    expect(Number(indicator().getAttribute('stroke-dashoffset'))).toBeCloseTo(CIRCUMFERENCE * 0.58, 3);
  });

  it('clamps out-of-range values', () => {
    host.value.set(150);
    fixture.detectChanges();
    expect(el.getAttribute('aria-valuenow')).toBe('100');
    expect(Number(indicator().getAttribute('stroke-dashoffset'))).toBeCloseTo(0, 5);

    host.value.set(-10);
    fixture.detectChanges();
    expect(el.getAttribute('aria-valuenow')).toBe('0');
  });

  it('respects a custom max', () => {
    host.value.set(5);
    host.max.set(10);
    fixture.detectChanges();
    expect(el.getAttribute('aria-valuenow')).toBe('5');
    expect(el.getAttribute('aria-valuemax')).toBe('10');
    expect(Number(indicator().getAttribute('stroke-dashoffset'))).toBeCloseTo(CIRCUMFERENCE * 0.5, 3);
  });

  it('shows the rounded percentage only when determinate and lg or xl', () => {
    host.showValue.set(true);
    host.size.set('lg');
    fixture.detectChanges();
    expect(el.querySelector('.spinner-value')).toBeNull(); // indeterminate

    host.value.set(42.4);
    fixture.detectChanges();
    expect(el.querySelector('.spinner-value')!.textContent!.trim()).toBe('42%');

    host.size.set('sm');
    fixture.detectChanges();
    expect(el.querySelector('.spinner-value')).toBeNull();
  });

  it('maps size and color to classes', () => {
    expect(el.className).not.toMatch(/spinner-(xs|sm|md|lg|xl)\b/);
    expect(el.className).not.toContain('spinner-primary');

    host.size.set('lg');
    host.color.set('primary');
    fixture.detectChanges();
    expect(el.classList).toContain('spinner-lg');
    expect(el.classList).toContain('spinner-primary');
  });

  it('uses a per-size default stroke width unless one is given', () => {
    host.size.set('xl');
    fixture.detectChanges();
    expect(indicator().getAttribute('stroke-width')).toBe('2');

    host.strokeWidth.set(4);
    fixture.detectChanges();
    expect(indicator().getAttribute('stroke-width')).toBe('4');
  });

  it('uses the label as aria-label', () => {
    host.label.set('Loading orders');
    fixture.detectChanges();
    expect(el.getAttribute('aria-label')).toBe('Loading orders');
  });
});

describe('UiSpinnerComponent (static attributes)', () => {
  it('accepts value and max as strings', () => {
    TestBed.configureTestingModule({ imports: [StaticAttrHostComponent] });
    const fixture = TestBed.createComponent(StaticAttrHostComponent);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement.querySelector('ui-spinner');
    expect(el.getAttribute('aria-valuenow')).toBe('5');
    expect(el.getAttribute('aria-valuemax')).toBe('10');
    expect(el.classList).toContain('spinner-determinate');
  });
});
```

- [ ] **Step 5: Run it to verify it fails**

Run: `npx ng test ui --watch=false --include="../progress/**/*.spec.ts"`
Expected: FAIL. It can't resolve `./spinner.component`. The utils spec passes.

- [ ] **Step 6: Implement the variants and the spinner**

`libs/ui/progress/src/progress.variants.ts` (Task 3 adds `progressBarVariants`):

```ts
import { cva } from '@libs/ui/core';

export const spinnerVariants = cva({
  base: 'spinner-ring',
  variants: {
    size: {
      inherit: '',
      xs: 'spinner-xs',
      sm: 'spinner-sm',
      md: 'spinner-md',
      lg: 'spinner-lg',
      xl: 'spinner-xl',
    },
    color: {
      current: '',
      neutral: 'spinner-neutral',
      primary: 'spinner-primary',
      info: 'spinner-info',
      success: 'spinner-success',
      warning: 'spinner-warning',
      error: 'spinner-error',
    },
    mode: {
      determinate: 'spinner-determinate',
      indeterminate: 'spinner-indeterminate',
    },
  },
  defaultVariants: { size: 'inherit', color: 'current', mode: 'indeterminate' },
});
```

`libs/ui/progress/src/spinner.component.ts`:

```ts
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  numberAttribute,
} from '@angular/core';
import { UiSpinnerColor, UiSpinnerSize } from './progress.types';
import { clampProgress, clampValue, progressValueAttribute } from './progress.utils';
import { spinnerVariants } from './progress.variants';

/** Ring radius in the 24×24 viewBox. */
const RADIUS = 10;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** Default stroke width (viewBox units) per size: small spinners stay visible, large ones stay light. */
const DEFAULT_STROKE: Record<UiSpinnerSize, number> = {
  inherit: 3,
  xs: 3,
  sm: 3,
  md: 2.5,
  lg: 2,
  xl: 2,
};

/**
 * Circular progress indicator. Indeterminate (rotating arc) while `value` is `null`; a determinate
 * ring filled to `value / max` otherwise.
 */
@Component({
  selector: 'ui-spinner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'progressbar',
    '[class]': 'hostClass()',
    '[attr.aria-label]': 'label()',
    '[attr.aria-valuemin]': 'determinate() ? 0 : null',
    '[attr.aria-valuemax]': 'determinate() ? max() : null',
    '[attr.aria-valuenow]': 'determinate() ? valueNow() : null',
  },
  template: `
    <svg
      class="spinner-svg"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      @if (determinate()) {
        <circle
          class="spinner-track"
          cx="12"
          cy="12"
          r="10"
          fill="none"
          [attr.stroke-width]="stroke()"
        />
      }
      <circle
        class="spinner-indicator"
        cx="12"
        cy="12"
        r="10"
        fill="none"
        [attr.stroke-width]="stroke()"
        [attr.stroke-dasharray]="determinate() ? circumference : null"
        [attr.stroke-dashoffset]="dashOffset()"
      />
    </svg>
    @if (showValueText()) {
      <span class="spinner-value" aria-hidden="true">{{ percentText() }}%</span>
    }
  `,
})
export class UiSpinnerComponent {
  readonly value = input<number | null, unknown>(null, { transform: progressValueAttribute });
  readonly max = input(100, { transform: numberAttribute });
  readonly size = input<UiSpinnerSize>('inherit');
  readonly strokeWidth = input<number | null, unknown>(null, { transform: progressValueAttribute });
  readonly color = input<UiSpinnerColor>('current');
  readonly showValue = input(false, { transform: booleanAttribute });
  readonly label = input('Loading');

  protected readonly circumference = CIRCUMFERENCE;
  protected readonly determinate = computed(() => this.value() !== null);
  protected readonly percent = computed(() => clampProgress(this.value() ?? 0, this.max()));
  protected readonly percentText = computed(() => Math.round(this.percent()));
  protected readonly valueNow = computed(() => clampValue(this.value() ?? 0, this.max()));
  protected readonly dashOffset = computed(() =>
    this.determinate() ? CIRCUMFERENCE * (1 - this.percent() / 100) : null
  );
  protected readonly stroke = computed(() => this.strokeWidth() ?? DEFAULT_STROKE[this.size()]);
  protected readonly showValueText = computed(
    () =>
      this.showValue() && this.determinate() && (this.size() === 'lg' || this.size() === 'xl')
  );

  protected readonly hostClass = computed(() =>
    spinnerVariants({
      size: this.size(),
      color: this.color(),
      mode: this.determinate() ? 'determinate' : 'indeterminate',
    })
  );
}
```

- [ ] **Step 7: Add the ring CSS**

Append to `libs/ui/styles/components/progress.css`:

```css
/* ------------------------------------------------------------------------------------------------- */
/*  ui-spinner (SVG ring, r = 10 in a 24×24 viewBox → circumference ≈ 62.83)
/* ------------------------------------------------------------------------------------------------- */
@keyframes ui-spinner-dash {
  0% {
    stroke-dasharray: 1 63;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 45 63;
    stroke-dashoffset: -15;
  }
  100% {
    stroke-dasharray: 45 63;
    stroke-dashoffset: -62;
  }
}

@utility spinner-ring {
  position: relative;
  display: inline-block;
  flex-shrink: 0;
  width: var(--spinner-size, 1em);
  height: var(--spinner-size, 1em);
  vertical-align: middle;
  color: var(--spinner-color, currentColor);

  & .spinner-svg {
    display: block;
    width: 100%;
    height: 100%;
  }

  & .spinner-track {
    stroke: color-mix(in oklab, currentColor 20%, transparent);
  }

  & .spinner-indicator {
    stroke: currentColor;
    stroke-linecap: round;
    transition: stroke-dashoffset 300ms ease;
  }

  & .spinner-value {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    font-size: calc(var(--spinner-size, 1em) * 0.26);
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    line-height: 1;
    color: var(--color-foreground);
  }

  @media (prefers-reduced-motion: reduce) {
    & .spinner-indicator {
      transition: none;
    }
  }
}

@utility spinner-xs {
  --spinner-size: 0.75rem;
}

@utility spinner-sm {
  --spinner-size: 1rem;
}

@utility spinner-md {
  --spinner-size: 1.5rem;
}

@utility spinner-lg {
  --spinner-size: 2rem;
}

@utility spinner-xl {
  --spinner-size: 3rem;
}

@utility spinner-neutral {
  --spinner-color: var(--color-foreground);
}

@utility spinner-primary {
  --spinner-color: var(--color-primary);
}

@utility spinner-info {
  --spinner-color: var(--color-info);
}

@utility spinner-success {
  --spinner-color: var(--color-success);
}

@utility spinner-warning {
  --spinner-color: var(--color-warning);
}

@utility spinner-error {
  --spinner-color: var(--color-error);
}

/* Start the determinate ring at 12 o'clock */
@utility spinner-determinate {
  & .spinner-svg {
    transform: rotate(-90deg);
  }
}

@utility spinner-indeterminate {
  & .spinner-svg {
    animation: ui-spin 1.4s linear infinite;
  }

  & .spinner-indicator {
    stroke-dasharray: 1 63;
    animation: ui-spinner-dash 1.4s ease-in-out infinite;
  }

  @media (prefers-reduced-motion: reduce) {
    & .spinner-svg {
      animation-duration: 3s;
    }

    & .spinner-indicator {
      stroke-dasharray: 16 63;
      animation: none;
    }
  }
}
```

- [ ] **Step 8: Re-export from `@libs/ui`**

In `libs/ui/src/public-api.ts`, add the line in alphabetical order:

```ts
export * from '@libs/ui/paginator';
export * from '@libs/ui/progress';
export * from '@libs/ui/radio';
```

- [ ] **Step 9: Run the specs**

Run: `npx ng test ui --watch=false --include="../progress/**/*.spec.ts"`
Expected: PASS (utils 7, spinner 9).

- [ ] **Step 10: Commit**

```bash
git add libs/ui/progress libs/ui/styles/components/progress.css libs/ui/src/public-api.ts
git commit -m "feat(ui): ✨ add ui-spinner with determinate and indeterminate modes

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: `ui-progress-bar` and the Progress docs page

**Files:**
- Create: `libs/ui/progress/src/progress-bar.component.ts`
- Modify: `libs/ui/progress/src/progress.variants.ts`, `libs/ui/progress/src/public-api.ts`
- Modify: `libs/ui/styles/components/progress.css` (append)
- Test: `libs/ui/progress/src/progress-bar.spec.ts`
- Create: `projects/docs/src/app/features/progress-doc/progress-doc.component.ts`, `.html`
- Modify: `projects/docs/src/app/app.routes.ts`, `projects/docs/src/app/layout/docs-sidebar.component.ts`

**Interfaces:**
- Consumes: `clampProgress`, `clampValue`, `progressValueAttribute`, `UiProgressBarSize` (Task 2); `UiColor`, `cva`.
- Produces: `progressBarVariants`, `UiProgressBarComponent`.

- [ ] **Step 1: Write the failing spec**

`libs/ui/progress/src/progress-bar.spec.ts`:

```ts
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UiColor } from '@libs/ui/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { UiProgressBarComponent } from './progress-bar.component';
import { UiProgressBarSize } from './progress.types';

@Component({
  imports: [UiProgressBarComponent],
  template: `
    <ui-progress-bar
      [value]="value()"
      [max]="max()"
      [size]="size()"
      [color]="color()"
      [label]="label()"
    />
  `,
})
class BarHostComponent {
  readonly value = signal<number | null>(50);
  readonly max = signal(100);
  readonly size = signal<UiProgressBarSize>('md');
  readonly color = signal<UiColor>('primary');
  readonly label = signal('Progress');
}

@Component({
  imports: [UiProgressBarComponent],
  template: `<ui-progress-bar value="30" />`,
})
class StaticAttrHostComponent {}

describe('UiProgressBarComponent', () => {
  let fixture: ComponentFixture<BarHostComponent>;
  let host: BarHostComponent;
  let el: HTMLElement;

  const fill = () => el.querySelector<HTMLElement>('.progress-bar-fill')!;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [BarHostComponent] });
    fixture = TestBed.createComponent(BarHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    el = fixture.nativeElement.querySelector('ui-progress-bar');
  });

  it('is a determinate progressbar scaled to the value', () => {
    expect(el.getAttribute('role')).toBe('progressbar');
    expect(el.getAttribute('aria-label')).toBe('Progress');
    expect(el.getAttribute('aria-valuenow')).toBe('50');
    expect(el.getAttribute('aria-valuemin')).toBe('0');
    expect(el.getAttribute('aria-valuemax')).toBe('100');
    expect(fill().style.transform).toBe('scaleX(0.5)');
    expect(el.classList).not.toContain('progress-bar-indeterminate');
  });

  it('clamps the fill and aria-valuenow', () => {
    host.value.set(150);
    fixture.detectChanges();
    expect(fill().style.transform).toBe('scaleX(1)');
    expect(el.getAttribute('aria-valuenow')).toBe('100');

    host.value.set(-5);
    fixture.detectChanges();
    expect(fill().style.transform).toBe('scaleX(0)');
    expect(el.getAttribute('aria-valuenow')).toBe('0');
  });

  it('respects a custom max', () => {
    host.value.set(3);
    host.max.set(4);
    fixture.detectChanges();
    expect(fill().style.transform).toBe('scaleX(0.75)');
    expect(el.getAttribute('aria-valuemax')).toBe('4');
  });

  it('is indeterminate when value is null', () => {
    host.value.set(null);
    fixture.detectChanges();
    expect(el.classList).toContain('progress-bar-indeterminate');
    expect(el.hasAttribute('aria-valuenow')).toBe(false);
    expect(el.hasAttribute('aria-valuemax')).toBe(false);
    expect(fill().style.transform).toBe('');
  });

  it('maps size and color to classes', () => {
    expect(el.classList).toContain('progress-bar');
    expect(el.classList).toContain('progress-bar-md');
    expect(el.classList).toContain('progress-bar-primary');

    host.size.set('lg');
    host.color.set('success');
    fixture.detectChanges();
    expect(el.classList).toContain('progress-bar-lg');
    expect(el.classList).toContain('progress-bar-success');
  });
});

describe('UiProgressBarComponent (static attributes)', () => {
  it('accepts value as a string', () => {
    TestBed.configureTestingModule({ imports: [StaticAttrHostComponent] });
    const fixture = TestBed.createComponent(StaticAttrHostComponent);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement.querySelector('ui-progress-bar');
    expect(el.getAttribute('aria-valuenow')).toBe('30');
    expect(el.querySelector<HTMLElement>('.progress-bar-fill')!.style.transform).toBe('scaleX(0.3)');
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx ng test ui --watch=false --include="../progress/**/progress-bar.spec.ts"`
Expected: FAIL. It can't resolve `./progress-bar.component`.

- [ ] **Step 3: Implement**

Append to `libs/ui/progress/src/progress.variants.ts`:

```ts
export const progressBarVariants = cva({
  base: 'progress-bar',
  variants: {
    size: { sm: 'progress-bar-sm', md: 'progress-bar-md', lg: 'progress-bar-lg' },
    color: {
      neutral: 'progress-bar-neutral',
      primary: 'progress-bar-primary',
      info: 'progress-bar-info',
      success: 'progress-bar-success',
      warning: 'progress-bar-warning',
      error: 'progress-bar-error',
    },
    mode: { determinate: '', indeterminate: 'progress-bar-indeterminate' },
  },
  defaultVariants: { size: 'md', color: 'primary', mode: 'determinate' },
});
```

`libs/ui/progress/src/progress-bar.component.ts`:

```ts
import { ChangeDetectionStrategy, Component, computed, input, numberAttribute } from '@angular/core';
import { UiColor } from '@libs/ui/core';
import { UiProgressBarSize } from './progress.types';
import { clampProgress, clampValue, progressValueAttribute } from './progress.utils';
import { progressBarVariants } from './progress.variants';

/** Linear progress indicator. Indeterminate while `value` is `null`. */
@Component({
  selector: 'ui-progress-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'progressbar',
    '[class]': 'hostClass()',
    '[attr.aria-label]': 'label()',
    '[attr.aria-valuemin]': 'determinate() ? 0 : null',
    '[attr.aria-valuemax]': 'determinate() ? max() : null',
    '[attr.aria-valuenow]': 'determinate() ? valueNow() : null',
  },
  template: `<div
    class="progress-bar-fill"
    [style.transform]="fillTransform()"
  ></div>`,
})
export class UiProgressBarComponent {
  readonly value = input<number | null, unknown>(null, { transform: progressValueAttribute });
  readonly max = input(100, { transform: numberAttribute });
  readonly size = input<UiProgressBarSize>('md');
  readonly color = input<UiColor>('primary');
  readonly label = input('Progress');

  protected readonly determinate = computed(() => this.value() !== null);
  protected readonly valueNow = computed(() => clampValue(this.value() ?? 0, this.max()));
  protected readonly fillTransform = computed(() =>
    this.determinate() ? `scaleX(${clampProgress(this.value() ?? 0, this.max()) / 100})` : null
  );

  protected readonly hostClass = computed(() =>
    progressBarVariants({
      size: this.size(),
      color: this.color(),
      mode: this.determinate() ? 'determinate' : 'indeterminate',
    })
  );
}
```

`libs/ui/progress/src/public-api.ts`:

```ts
export * from './progress-bar.component';
export * from './progress.types';
export * from './progress.utils';
export * from './progress.variants';
export * from './spinner.component';
```

Append to `libs/ui/styles/components/progress.css`:

```css
/* ------------------------------------------------------------------------------------------------- */
/*  ui-progress-bar
/* ------------------------------------------------------------------------------------------------- */
@keyframes ui-progress-indeterminate {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(250%);
  }
}

@keyframes ui-progress-pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}

@utility progress-bar {
  position: relative;
  display: block;
  width: 100%;
  height: var(--progress-h, 0.5rem);
  overflow: hidden;
  border-radius: 9999px;
  background-color: color-mix(in oklab, var(--progress-color, var(--color-primary)) 20%, transparent);

  & .progress-bar-fill {
    width: 100%;
    height: 100%;
    border-radius: inherit;
    background-color: var(--progress-color, var(--color-primary));
    transform-origin: left;
    transition: transform 300ms ease;
  }

  &:dir(rtl) .progress-bar-fill {
    transform-origin: right;
  }

  @media (prefers-reduced-motion: reduce) {
    & .progress-bar-fill {
      transition: none;
    }
  }
}

@utility progress-bar-sm {
  --progress-h: 0.25rem;
}

@utility progress-bar-md {
  --progress-h: 0.5rem;
}

@utility progress-bar-lg {
  --progress-h: 0.75rem;
}

@utility progress-bar-neutral {
  --progress-color: var(--color-foreground);
}

@utility progress-bar-primary {
  --progress-color: var(--color-primary);
}

@utility progress-bar-info {
  --progress-color: var(--color-info);
}

@utility progress-bar-success {
  --progress-color: var(--color-success);
}

@utility progress-bar-warning {
  --progress-color: var(--color-warning);
}

@utility progress-bar-error {
  --progress-color: var(--color-error);
}

@utility progress-bar-indeterminate {
  & .progress-bar-fill {
    width: 40%;
    animation: ui-progress-indeterminate 1.5s ease-in-out infinite;
  }

  &:dir(rtl) .progress-bar-fill {
    animation-direction: reverse;
  }

  @media (prefers-reduced-motion: reduce) {
    & .progress-bar-fill {
      margin-inline-start: 30%;
      animation: ui-progress-pulse 2s ease-in-out infinite;
    }
  }
}
```

- [ ] **Step 4: Run the specs**

Run: `npx ng test ui --watch=false --include="../progress/**/*.spec.ts"`
Expected: PASS (utils 7, spinner 9, bar 6).

- [ ] **Step 5: Add the docs page**

`projects/docs/src/app/features/progress-doc/progress-doc.component.ts`:

```ts
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UiButtonComponent } from '@libs/ui/button';
import { UiColor } from '@libs/ui/core';
import {
  UiProgressBarComponent,
  UiProgressBarSize,
  UiSpinnerComponent,
  UiSpinnerSize,
} from '@libs/ui/progress';
import { ApiRow, ApiTableComponent } from '../../shared/api-table/api-table.component';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';
import { PlaygroundComponent } from '../../shared/playground/playground.component';

type ProgressKind = 'spinner' | 'bar';

@Component({
  selector: 'doc-progress',
  imports: [
    FormsModule,
    UiButtonComponent,
    UiSpinnerComponent,
    UiProgressBarComponent,
    PlaygroundComponent,
    ApiTableComponent,
    CodeBlockComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './progress-doc.component.html',
})
export class ProgressDocComponent {
  readonly colors: UiColor[] = ['neutral', 'primary', 'info', 'success', 'warning', 'error'];
  readonly spinnerSizes: UiSpinnerSize[] = ['inherit', 'xs', 'sm', 'md', 'lg', 'xl'];
  readonly barSizes: UiProgressBarSize[] = ['sm', 'md', 'lg'];

  readonly kind = signal<ProgressKind>('spinner');
  readonly determinate = signal(false);
  readonly value = signal(42);
  readonly spinnerSize = signal<UiSpinnerSize>('lg');
  readonly barSize = signal<UiProgressBarSize>('md');
  readonly color = signal<UiColor>('primary');
  readonly showValue = signal(true);

  readonly currentValue = computed(() => (this.determinate() ? this.value() : null));

  readonly generatedCode = computed(() => {
    const attrs: string[] = [];
    if (this.determinate()) attrs.push(`[value]="${this.value()}"`);
    if (this.kind() === 'spinner') {
      if (this.color() !== 'neutral') attrs.push(`color="${this.color()}"`);
      if (this.spinnerSize() !== 'inherit') attrs.push(`size="${this.spinnerSize()}"`);
      if (this.determinate() && this.showValue()) attrs.push('showValue');
      return `<ui-spinner ${attrs.join(' ')} />`;
    }
    if (this.color() !== 'primary') attrs.push(`color="${this.color()}"`);
    if (this.barSize() !== 'md') attrs.push(`size="${this.barSize()}"`);
    return `<ui-progress-bar ${attrs.join(' ')} />`;
  });

  readonly buttonCode = `<button uiButton loading>Saving</button>

<!-- or inline, sized to the text -->
<p>Syncing <ui-spinner /></p>`;

  readonly labelledBarCode = `<div class="flex justify-between text-sm">
  <span>Uploading report.pdf</span>
  <span>{{ uploaded() }}%</span>
</div>
<ui-progress-bar [value]="uploaded()" label="Uploading report.pdf" />`;

  readonly spinnerRows: ApiRow[] = [
    {
      name: 'value',
      type: 'number | null',
      default: 'null',
      description: 'null spins (indeterminate); a number fills the ring to value / max.',
    },
    { name: 'max', type: 'number', default: '100', description: 'Upper bound of value.' },
    {
      name: 'size',
      type: "'inherit' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'",
      default: "'inherit'",
      description: 'inherit is 1em, so the spinner scales with the surrounding text.',
    },
    {
      name: 'color',
      type: "UiColor | 'current'",
      default: "'current'",
      description: 'current uses the text color.',
    },
    {
      name: 'strokeWidth',
      type: 'number | null',
      default: 'per size',
      description: 'Stroke width in 24×24 viewBox units.',
    },
    {
      name: 'showValue',
      type: 'boolean',
      default: 'false',
      description: 'Shows the percentage in the center (determinate, lg and xl only).',
    },
    { name: 'label', type: 'string', default: "'Loading'", description: 'aria-label.' },
  ];

  readonly barRows: ApiRow[] = [
    { name: 'value', type: 'number | null', default: 'null', description: 'null is indeterminate.' },
    { name: 'max', type: 'number', default: '100', description: 'Upper bound of value.' },
    { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Track height 4 / 8 / 12px.' },
    { name: 'color', type: 'UiColor', default: "'primary'", description: 'Fill color; the track is a 20% tint.' },
    { name: 'label', type: 'string', default: "'Progress'", description: 'aria-label.' },
  ];
}
```

`projects/docs/src/app/features/progress-doc/progress-doc.component.html`:

```html
<doc-playground
  title="Spinner & Progress"
  description="Circular and linear progress indicators, indeterminate or determinate. Both are role=progressbar with aria-valuenow in determinate mode."
  [code]="generatedCode()"
>
  <!-- Live Preview -->
  <div
    preview
    class="flex w-full max-w-md items-center justify-center p-4"
  >
    @if (kind() === 'spinner') {
      <ui-spinner
        [value]="currentValue()"
        [size]="spinnerSize()"
        [color]="color()"
        [showValue]="showValue()"
      />
    } @else {
      <ui-progress-bar
        [value]="currentValue()"
        [size]="barSize()"
        [color]="color()"
      />
    }
  </div>

  <!-- Controls -->
  <div
    controls
    class="space-y-4 text-xs"
  >
    <div>
      <label
        for="prg-kind"
        class="text-muted-foreground mb-1 block font-medium"
        >Kind</label
      >
      <select
        id="prg-kind"
        class="border-border bg-background text-foreground w-full rounded-lg border px-3 py-1.5"
        [ngModel]="kind()"
        (ngModelChange)="kind.set($event)"
      >
        <option value="spinner">ui-spinner</option>
        <option value="bar">ui-progress-bar</option>
      </select>
    </div>

    <div>
      <label
        for="prg-size"
        class="text-muted-foreground mb-1 block font-medium"
        >Size</label
      >
      @if (kind() === 'spinner') {
        <select
          id="prg-size"
          class="border-border bg-background text-foreground w-full rounded-lg border px-3 py-1.5"
          [ngModel]="spinnerSize()"
          (ngModelChange)="spinnerSize.set($event)"
        >
          @for (s of spinnerSizes; track s) {
            <option [value]="s">{{ s }}</option>
          }
        </select>
      } @else {
        <select
          id="prg-size"
          class="border-border bg-background text-foreground w-full rounded-lg border px-3 py-1.5"
          [ngModel]="barSize()"
          (ngModelChange)="barSize.set($event)"
        >
          @for (s of barSizes; track s) {
            <option [value]="s">{{ s }}</option>
          }
        </select>
      }
    </div>

    <div>
      <label
        for="prg-color"
        class="text-muted-foreground mb-1 block font-medium"
        >Color</label
      >
      <select
        id="prg-color"
        class="border-border bg-background text-foreground w-full rounded-lg border px-3 py-1.5"
        [ngModel]="color()"
        (ngModelChange)="color.set($event)"
      >
        @for (c of colors; track c) {
          <option [value]="c">{{ c }}</option>
        }
      </select>
    </div>

    <label class="flex cursor-pointer items-center gap-2">
      <input
        type="checkbox"
        class="border-border rounded"
        [ngModel]="determinate()"
        (ngModelChange)="determinate.set($event)"
      />
      <span>Determinate</span>
    </label>

    <div>
      <label
        for="prg-value"
        class="text-muted-foreground mb-1 block font-medium"
        >Value: {{ value() }}</label
      >
      <input
        id="prg-value"
        type="range"
        min="0"
        max="100"
        class="w-full"
        [disabled]="!determinate()"
        [ngModel]="value()"
        (ngModelChange)="value.set($event)"
      />
    </div>

    @if (kind() === 'spinner') {
      <label class="flex cursor-pointer items-center gap-2">
        <input
          type="checkbox"
          class="border-border rounded"
          [ngModel]="showValue()"
          (ngModelChange)="showValue.set($event)"
        />
        <span>Show value (lg / xl)</span>
      </label>
    }
  </div>

  <section class="space-y-4">
    <h2 class="text-foreground text-xl font-bold tracking-tight">In buttons and text</h2>
    <p class="text-muted-foreground text-sm">
      <code>uiButton</code>'s <code>loading</code> state uses the same <code>spinner</code> CSS utility. An inline
      <code>ui-spinner</code> defaults to <code>1em</code> and the text color.
    </p>
    <div class="flex items-center gap-6">
      <button
        uiButton
        loading
      >
        Saving
      </button>
      <p class="text-sm">Syncing <ui-spinner /></p>
    </div>
    <doc-code-block [code]="buttonCode" />
  </section>

  <section class="space-y-4">
    <h2 class="text-foreground text-xl font-bold tracking-tight">Labelled progress bar</h2>
    <p class="text-muted-foreground text-sm">
      The bar is a single element; put the visible label and percentage around it, and pass the same text to
      <code>label</code>.
    </p>
    <div class="max-w-md space-y-2">
      <div class="flex justify-between text-sm">
        <span>Uploading report.pdf</span>
        <span>{{ value() }}%</span>
      </div>
      <ui-progress-bar
        label="Uploading report.pdf"
        [value]="value()"
      />
    </div>
    <doc-code-block [code]="labelledBarCode" />
  </section>

  <doc-api-table
    title="ui-spinner"
    [rows]="spinnerRows"
  />
  <doc-api-table
    title="ui-progress-bar"
    [rows]="barRows"
  />
</doc-playground>
```

In `projects/docs/src/app/app.routes.ts`, add after the `loader` route:

```ts
  {
    path: 'progress',
    loadComponent: () =>
      import('./features/progress-doc/progress-doc.component').then((m) => m.ProgressDocComponent),
  },
```

In `projects/docs/src/app/layout/docs-sidebar.component.ts`, add to the `Overlays & Feedback` items, after `Loader`:

```ts
        { label: 'Spinner & Progress', path: '/progress' },
```

- [ ] **Step 6: Build the docs**

Run: `npx ng build docs`
Expected: success, with no new errors.

- [ ] **Step 7: Commit**

```bash
git add libs/ui/progress libs/ui/styles/components/progress.css \
  projects/docs/src/app/features/progress-doc projects/docs/src/app/app.routes.ts \
  projects/docs/src/app/layout/docs-sidebar.component.ts
git commit -m "feat(ui): ✨ add ui-progress-bar

feat(docs): ✨ add spinner and progress docs page

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: `@libs/ui/alert`

**Files:**
- Modify: `libs/ui/styles/components/alert.css`
- Create: `libs/ui/alert/ng-package.json`, `libs/ui/alert/src/public-api.ts`
- Create: `libs/ui/alert/src/alert.types.ts`, `alert-icons.ts`, `alert.variants.ts`, `alert-parts.directive.ts`, `alert.component.ts`, `alert.component.html`
- Modify: `libs/ui/src/public-api.ts`
- Test: `libs/ui/alert/src/alert.spec.ts`
- Create: `projects/docs/src/app/features/alert-doc/alert-doc.component.ts`, `.html`
- Modify: `projects/docs/src/app/app.routes.ts`, `projects/docs/src/app/layout/docs-sidebar.component.ts`

**Interfaces:**
- Consumes: `UiColor`, `cva`.
- Produces: `UiAlertComponent` (inputs `color`, `appearance`, `icon`, `banner`, `dismissible`, `closeLabel`, `role`; model `open`; output `closed`), `UiAlertTitleDirective`, `UiAlertIconDirective`, `UiAlertActionsDirective`, `type UiAlertAppearance = 'soft' | 'outline' | 'dash' | 'solid'`, `type UiAlertRole = 'alert' | 'status' | 'none'`, `UI_ALERT_ICONS`, `alertVariants`.

- [ ] **Step 1: Create the entry point skeleton**

`libs/ui/alert/ng-package.json`: same content as `libs/ui/progress/ng-package.json`.

`libs/ui/alert/src/public-api.ts`:

```ts
export * from './alert-icons';
export * from './alert-parts.directive';
export * from './alert.component';
export * from './alert.types';
export * from './alert.variants';
```

`libs/ui/alert/src/alert.types.ts`:

```ts
export type UiAlertAppearance = 'soft' | 'outline' | 'dash' | 'solid';

/** `none` renders no role (a static note); omitted (`null`) picks `alert` for error/warning, else `status`. */
export type UiAlertRole = 'alert' | 'status' | 'none';
```

- [ ] **Step 2: Write the failing spec**

`libs/ui/alert/src/alert.spec.ts`:

```ts
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UiColor } from '@libs/ui/core';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  UiAlertActionsDirective,
  UiAlertIconDirective,
  UiAlertTitleDirective,
} from './alert-parts.directive';
import { UiAlertComponent } from './alert.component';
import { UiAlertAppearance, UiAlertRole } from './alert.types';

@Component({
  imports: [UiAlertComponent, UiAlertTitleDirective, UiAlertActionsDirective],
  template: `
    <ui-alert
      [color]="color()"
      [appearance]="appearance()"
      [icon]="icon()"
      [banner]="banner()"
      [dismissible]="dismissible()"
      [role]="role()"
      [(open)]="open"
      (closed)="onClosed()"
    >
      <span uiAlertTitle>Heads up</span>
      Body text
      <div uiAlertActions><button type="button">Act</button></div>
    </ui-alert>
  `,
})
class AlertHostComponent {
  readonly color = signal<UiColor>('neutral');
  readonly appearance = signal<UiAlertAppearance>('soft');
  readonly icon = signal(true);
  readonly banner = signal(false);
  readonly dismissible = signal(false);
  readonly role = signal<UiAlertRole | null>(null);
  readonly open = signal(true);
  closedCount = 0;

  onClosed(): void {
    this.closedCount++;
  }
}

@Component({
  imports: [UiAlertComponent, UiAlertIconDirective],
  template: `
    <ui-alert color="success">
      <svg
        uiAlertIcon
        data-testid="custom-icon"
      ></svg>
      Saved.
    </ui-alert>
  `,
})
class CustomIconHostComponent {}

describe('UiAlertComponent', () => {
  let fixture: ComponentFixture<AlertHostComponent>;
  let host: AlertHostComponent;
  let el: HTMLElement;

  const iconSvg = () => el.querySelector('.alert-icon svg');
  const closeButton = () => el.querySelector<HTMLButtonElement>('.alert-close');

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [AlertHostComponent] });
    fixture = TestBed.createComponent(AlertHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    el = fixture.nativeElement.querySelector('ui-alert');
  });

  it('renders a neutral soft status alert by default', () => {
    for (const c of ['alert', 'alert-row', 'alert-neutral', 'alert-soft']) {
      expect(el.classList).toContain(c);
    }
    expect(el.classList).not.toContain('alert-banner');
    expect(el.getAttribute('role')).toBe('status');
    expect(iconSvg()).toBeNull();
    expect(closeButton()).toBeNull();
    expect(el.hasAttribute('hidden')).toBe(false);
  });

  it('picks role alert for error and warning, status otherwise', () => {
    host.color.set('error');
    fixture.detectChanges();
    expect(el.getAttribute('role')).toBe('alert');

    host.color.set('warning');
    fixture.detectChanges();
    expect(el.getAttribute('role')).toBe('alert');

    host.color.set('success');
    fixture.detectChanges();
    expect(el.getAttribute('role')).toBe('status');
  });

  it('lets role be overridden, and none removes it', () => {
    host.role.set('alert');
    fixture.detectChanges();
    expect(el.getAttribute('role')).toBe('alert');

    host.role.set('none');
    fixture.detectChanges();
    expect(el.hasAttribute('role')).toBe(false);
  });

  it('shows the default icon for the color unless icon is false', () => {
    host.color.set('error');
    fixture.detectChanges();
    expect(iconSvg()!.querySelector('path')!.getAttribute('d')).toContain('M10 14l2-2');

    host.color.set('info');
    fixture.detectChanges();
    expect(iconSvg()!.querySelector('path')!.getAttribute('d')).toContain('M13 16h-1v-4h-1');

    host.icon.set(false);
    fixture.detectChanges();
    expect(iconSvg()).toBeNull();
  });

  it('maps appearance and banner to classes', () => {
    host.color.set('info');
    host.appearance.set('solid');
    host.banner.set(true);
    fixture.detectChanges();
    expect(el.classList).toContain('alert-info');
    expect(el.classList).toContain('alert-solid');
    expect(el.classList).toContain('alert-banner');
    expect(el.classList).not.toContain('alert-soft');
  });

  it('dismisses: hides, updates open and emits closed', () => {
    host.dismissible.set(true);
    fixture.detectChanges();
    expect(closeButton()!.getAttribute('aria-label')).toBe('Dismiss');

    closeButton()!.click();
    fixture.detectChanges();
    expect(el.hasAttribute('hidden')).toBe(true);
    expect(host.open()).toBe(false);
    expect(host.closedCount).toBe(1);

    host.open.set(true);
    fixture.detectChanges();
    expect(el.hasAttribute('hidden')).toBe(false);
  });

  it('places title and actions in the body with their classes', () => {
    const body = el.querySelector('.alert-description')!;
    expect(body.querySelector('[uiAlertTitle]')!.classList).toContain('alert-title');
    expect(body.querySelector('[uiAlertActions]')!.classList).toContain('alert-actions');
    expect(body.textContent).toContain('Body text');
  });
});

describe('UiAlertComponent (custom icon)', () => {
  it('replaces the default icon with a projected uiAlertIcon', () => {
    TestBed.configureTestingModule({ imports: [CustomIconHostComponent] });
    const fixture = TestBed.createComponent(CustomIconHostComponent);
    fixture.detectChanges();
    const iconSlot = fixture.nativeElement.querySelector('ui-alert .alert-icon');
    expect(iconSlot.querySelector('[data-testid="custom-icon"]')).not.toBeNull();
    expect(iconSlot.querySelectorAll('svg').length).toBe(1);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `npx ng test ui --watch=false --include="../alert/**/*.spec.ts"`
Expected: FAIL. It can't resolve `./alert-parts.directive` / `./alert.component`.

- [ ] **Step 4: Implement the alert**

`libs/ui/alert/src/alert-icons.ts`:

```ts
import { UiColor } from '@libs/ui/core';

/** 24×24 stroke icon paths, the same as `@libs/ui/toast`. Neutral and primary have no default icon. */
export const UI_ALERT_ICONS: Partial<Record<UiColor, string>> = {
  info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  success: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  warning:
    'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
  error: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
};
```

`libs/ui/alert/src/alert.variants.ts`:

```ts
import { cva } from '@libs/ui/core';

export const alertVariants = cva({
  base: 'alert alert-row',
  variants: {
    color: {
      neutral: 'alert-neutral',
      primary: 'alert-primary',
      info: 'alert-info',
      success: 'alert-success',
      warning: 'alert-warning',
      error: 'alert-error',
    },
    appearance: {
      soft: 'alert-soft',
      outline: 'alert-outline',
      dash: 'alert-dash',
      solid: 'alert-solid',
    },
    banner: { true: 'alert-banner', false: '' },
  },
  defaultVariants: { color: 'neutral', appearance: 'soft', banner: 'false' },
});
```

`libs/ui/alert/src/alert-parts.directive.ts`:

```ts
import { Directive } from '@angular/core';

/** Bold first line of a `ui-alert`. */
@Directive({ selector: '[uiAlertTitle]', host: { class: 'alert-title' } })
export class UiAlertTitleDirective {}

/** Replaces the default icon of a `ui-alert`. */
@Directive({ selector: '[uiAlertIcon]' })
export class UiAlertIconDirective {}

/** Row of actions under the alert's message. */
@Directive({ selector: '[uiAlertActions]', host: { class: 'alert-actions' } })
export class UiAlertActionsDirective {}
```

`libs/ui/alert/src/alert.component.ts`:

```ts
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
  output,
} from '@angular/core';
import { UiColor } from '@libs/ui/core';
import { UI_ALERT_ICONS } from './alert-icons';
import { UiAlertAppearance, UiAlertRole } from './alert.types';
import { alertVariants } from './alert.variants';

/**
 * Inline message (or full-width banner). Dismissing only hides it and updates `open`; the consumer
 * decides whether to remove it.
 */
@Component({
  selector: 'ui-alert',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './alert.component.html',
  host: {
    '[class]': 'hostClass()',
    '[attr.role]': 'effectiveRole()',
    '[attr.hidden]': 'open() ? null : ""',
  },
})
export class UiAlertComponent {
  readonly color = input<UiColor>('neutral');
  readonly appearance = input<UiAlertAppearance>('soft');
  readonly icon = input(true, { transform: booleanAttribute });
  readonly banner = input(false, { transform: booleanAttribute });
  readonly dismissible = input(false, { transform: booleanAttribute });
  readonly closeLabel = input('Dismiss');
  readonly role = input<UiAlertRole | null>(null);
  readonly open = model(true);
  readonly closed = output<void>();

  protected readonly iconPath = computed(() =>
    this.icon() ? (UI_ALERT_ICONS[this.color()] ?? null) : null
  );

  protected readonly effectiveRole = computed(() => {
    const role = this.role();
    if (role === 'none') return null;
    if (role) return role;
    return this.color() === 'error' || this.color() === 'warning' ? 'alert' : 'status';
  });

  protected readonly hostClass = computed(() =>
    alertVariants({
      color: this.color(),
      appearance: this.appearance(),
      banner: this.banner() ? 'true' : 'false',
    })
  );

  close(): void {
    this.open.set(false);
    this.closed.emit();
  }
}
```

`libs/ui/alert/src/alert.component.html`:

```html
<div class="alert-icon">
  <ng-content select="[uiAlertIcon]">
    @if (iconPath(); as path) {
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          [attr.d]="path"
        />
      </svg>
    }
  </ng-content>
</div>

<div class="alert-description">
  <ng-content select="[uiAlertTitle]" />
  <ng-content />
  <ng-content select="[uiAlertActions]" />
</div>

@if (dismissible()) {
  <button
    type="button"
    class="alert-close"
    [attr.aria-label]="closeLabel()"
    (click)="close()"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      aria-hidden="true"
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  </button>
}
```

- [ ] **Step 5: Extend `alert.css`**

In `libs/ui/styles/components/alert.css`, change these four declarations inside `@utility alert` (keep everything else):

```css
  display: var(--alert-display, grid);
  /* … */
  align-items: var(--alert-items, center);
  /* … */
  border-width: var(--alert-border-width, 1px);
  /* … */
  border-radius: var(--alert-radius, 0.75rem);
```

Add `--alert-content` to each existing color utility, and add `alert-primary`:

```css
@utility alert-neutral {
  --alert-color: var(--color-foreground);
  --alert-content: var(--color-background);
  --alert-surface: transparent;
}

@utility alert-primary {
  --alert-color: var(--color-primary);
  --alert-content: var(--color-primary-content);
  --alert-surface: transparent;
}

@utility alert-info {
  --alert-color: var(--color-info);
  --alert-content: var(--color-info-content);
  --alert-surface: transparent;
}

@utility alert-success {
  --alert-color: var(--color-success);
  --alert-content: var(--color-success-content);
  --alert-surface: transparent;
}

@utility alert-warning {
  --alert-color: var(--color-warning);
  --alert-content: var(--color-warning-content);
  --alert-surface: transparent;
}

@utility alert-error {
  --alert-color: var(--color-error);
  --alert-content: var(--color-error-content);
  --alert-surface: transparent;
}
```

Append the new utilities at the end of the file:

```css
@utility alert-solid {
  --alert-bg: var(--alert-color, var(--color-foreground));
  --alert-fg: var(--alert-content, var(--color-background));
  --alert-border: transparent;
}

/* Full-width strip for the top of a page or panel: square corners, bottom border only */
@utility alert-banner {
  --alert-radius: 0;
  --alert-border-width: 0 0 1px;
}

/* ui-alert layout: icon | message | close, as flex so an empty icon slot takes no space */
@utility alert-row {
  --alert-display: flex;
  --alert-items: flex-start;

  & > .alert-icon {
    display: flex;
    flex-shrink: 0;
  }

  & > .alert-icon:empty {
    display: none;
  }

  & > .alert-description {
    flex: 1 1 auto;
    min-width: 0;
  }
}

@utility alert-title {
  display: block;
  margin-bottom: 0.25rem;
  font-weight: 600;
}

@utility alert-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

@utility alert-close {
  display: inline-grid;
  flex-shrink: 0;
  place-content: center;
  width: 1.75rem;
  height: 1.75rem;
  margin: -0.25rem -0.25rem -0.25rem 0;
  padding: 0;
  color: inherit;
  background: transparent;
  border: 0;
  border-radius: 0.375rem;
  opacity: 0.7;
  cursor: pointer;

  &:hover {
    opacity: 1;
    background-color: color-mix(in oklab, currentColor 10%, transparent);
  }

  &:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 1px;
    opacity: 1;
  }
}
```

- [ ] **Step 6: Re-export and run the specs**

In `libs/ui/src/public-api.ts`, add `export * from '@libs/ui/alert';` as the first line (alphabetical).

Run: `npx ng test ui --watch=false --include="../alert/**/*.spec.ts"`
Expected: PASS (8 tests).

Also run: `npx ng test ui --watch=false --include="../toast/**/*.spec.ts" --include="../dialog/**/*.spec.ts"`
Expected: PASS. Toast and dialog use the `alert` utility, and their DOM tests must still pass.

- [ ] **Step 7: Add the docs page**

`projects/docs/src/app/features/alert-doc/alert-doc.component.ts`:

```ts
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  UiAlertActionsDirective,
  UiAlertAppearance,
  UiAlertComponent,
  UiAlertTitleDirective,
} from '@libs/ui/alert';
import { UiButtonComponent } from '@libs/ui/button';
import { UiColor } from '@libs/ui/core';
import { ApiRow, ApiTableComponent } from '../../shared/api-table/api-table.component';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';
import { PlaygroundComponent } from '../../shared/playground/playground.component';

@Component({
  selector: 'doc-alert',
  imports: [
    FormsModule,
    UiAlertComponent,
    UiAlertTitleDirective,
    UiAlertActionsDirective,
    UiButtonComponent,
    PlaygroundComponent,
    ApiTableComponent,
    CodeBlockComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './alert-doc.component.html',
})
export class AlertDocComponent {
  readonly colors: UiColor[] = ['neutral', 'primary', 'info', 'success', 'warning', 'error'];
  readonly appearances: UiAlertAppearance[] = ['soft', 'outline', 'dash', 'solid'];

  readonly color = signal<UiColor>('info');
  readonly appearance = signal<UiAlertAppearance>('soft');
  readonly icon = signal(true);
  readonly banner = signal(false);
  readonly dismissible = signal(true);
  readonly withTitle = signal(true);
  readonly withActions = signal(false);
  readonly open = signal(true);

  readonly generatedCode = computed(() => {
    const attrs: string[] = [];
    if (this.color() !== 'neutral') attrs.push(`color="${this.color()}"`);
    if (this.appearance() !== 'soft') attrs.push(`appearance="${this.appearance()}"`);
    if (!this.icon()) attrs.push('[icon]="false"');
    if (this.banner()) attrs.push('banner');
    if (this.dismissible()) attrs.push('dismissible [(open)]="open"');
    const lines = [`<ui-alert${attrs.length ? ' ' + attrs.join(' ') : ''}>`];
    if (this.withTitle()) lines.push('  <span uiAlertTitle>Scheduled maintenance</span>');
    lines.push('  The service will be unavailable on Sunday from 02:00 to 04:00 UTC.');
    if (this.withActions()) {
      lines.push(
        '  <div uiAlertActions>',
        '    <button uiButton size="sm">View details</button>',
        '  </div>'
      );
    }
    lines.push('</ui-alert>');
    return lines.join('\n');
  });

  readonly bannerCode = `<ui-alert banner color="warning" dismissible>
  Your trial ends in 3 days.
</ui-alert>`;

  readonly apiRows: ApiRow[] = [
    { name: 'color', type: 'UiColor', default: "'neutral'", description: 'Semantic color.' },
    {
      name: 'appearance',
      type: "'soft' | 'outline' | 'dash' | 'solid'",
      default: "'soft'",
      description: 'How the color is applied.',
    },
    {
      name: 'icon',
      type: 'boolean',
      default: 'true',
      description: 'Default icon for info/success/warning/error. A projected [uiAlertIcon] always wins.',
    },
    { name: 'banner', type: 'boolean', default: 'false', description: 'Square corners, bottom border only.' },
    { name: 'dismissible', type: 'boolean', default: 'false', description: 'Shows a close button.' },
    { name: 'closeLabel', type: 'string', default: "'Dismiss'", description: 'Close button aria-label.' },
    {
      name: 'open',
      type: 'model<boolean>',
      default: 'true',
      description: 'false hides the alert. Two-way bindable.',
    },
    {
      name: 'role',
      type: "'alert' | 'status' | 'none' | null",
      default: 'null',
      description: 'null picks alert for error/warning and status otherwise. none renders no role.',
    },
    { name: '(closed)', type: 'void', description: 'Emitted when the close button hides the alert.' },
    {
      name: '[uiAlertTitle] / [uiAlertIcon] / [uiAlertActions]',
      type: 'directive',
      description: 'Title line, custom icon, and a row of actions under the message.',
    },
  ];
}
```

`projects/docs/src/app/features/alert-doc/alert-doc.component.html`:

```html
<doc-playground
  title="Alert"
  description="Inline messages and page banners with semantic colors, default icons, actions and an optional close button."
  [code]="generatedCode()"
>
  <!-- Live Preview -->
  <div
    preview
    class="flex w-full max-w-xl flex-col items-stretch gap-3 p-4"
  >
    <ui-alert
      [color]="color()"
      [appearance]="appearance()"
      [icon]="icon()"
      [banner]="banner()"
      [dismissible]="dismissible()"
      [(open)]="open"
    >
      @if (withTitle()) {
        <span uiAlertTitle>Scheduled maintenance</span>
      }
      The service will be unavailable on Sunday from 02:00 to 04:00 UTC.
      @if (withActions()) {
        <div uiAlertActions>
          <button
            uiButton
            size="sm"
          >
            View details
          </button>
          <button
            uiButton
            size="sm"
            variant="ghost"
          >
            Remind me
          </button>
        </div>
      }
    </ui-alert>
    @if (!open()) {
      <button
        uiButton
        variant="outline"
        size="sm"
        class="self-center"
        (click)="open.set(true)"
      >
        Show the alert again
      </button>
    }
  </div>

  <!-- Controls -->
  <div
    controls
    class="space-y-4 text-xs"
  >
    <div>
      <label
        for="alr-color"
        class="text-muted-foreground mb-1 block font-medium"
        >Color</label
      >
      <select
        id="alr-color"
        class="border-border bg-background text-foreground w-full rounded-lg border px-3 py-1.5"
        [ngModel]="color()"
        (ngModelChange)="color.set($event)"
      >
        @for (c of colors; track c) {
          <option [value]="c">{{ c }}</option>
        }
      </select>
    </div>
    <div>
      <label
        for="alr-appearance"
        class="text-muted-foreground mb-1 block font-medium"
        >Appearance</label
      >
      <select
        id="alr-appearance"
        class="border-border bg-background text-foreground w-full rounded-lg border px-3 py-1.5"
        [ngModel]="appearance()"
        (ngModelChange)="appearance.set($event)"
      >
        @for (a of appearances; track a) {
          <option [value]="a">{{ a }}</option>
        }
      </select>
    </div>
    <label class="flex cursor-pointer items-center gap-2">
      <input
        type="checkbox"
        class="border-border rounded"
        [ngModel]="icon()"
        (ngModelChange)="icon.set($event)"
      />
      <span>Icon</span>
    </label>
    <label class="flex cursor-pointer items-center gap-2">
      <input
        type="checkbox"
        class="border-border rounded"
        [ngModel]="withTitle()"
        (ngModelChange)="withTitle.set($event)"
      />
      <span>Title</span>
    </label>
    <label class="flex cursor-pointer items-center gap-2">
      <input
        type="checkbox"
        class="border-border rounded"
        [ngModel]="withActions()"
        (ngModelChange)="withActions.set($event)"
      />
      <span>Actions</span>
    </label>
    <label class="flex cursor-pointer items-center gap-2">
      <input
        type="checkbox"
        class="border-border rounded"
        [ngModel]="dismissible()"
        (ngModelChange)="dismissible.set($event)"
      />
      <span>Dismissible</span>
    </label>
    <label class="flex cursor-pointer items-center gap-2">
      <input
        type="checkbox"
        class="border-border rounded"
        [ngModel]="banner()"
        (ngModelChange)="banner.set($event)"
      />
      <span>Banner</span>
    </label>
  </div>

  <section class="space-y-4">
    <h2 class="text-foreground text-xl font-bold tracking-tight">Banner</h2>
    <p class="text-muted-foreground text-sm">
      <code>banner</code> removes the rounded corners and side borders so the alert can span the top of a page or
      panel. Placement (sticky, fixed, …) is up to the layout.
    </p>
    <div class="border-border overflow-hidden rounded-lg border">
      <ui-alert
        banner
        color="warning"
        dismissible
      >
        Your trial ends in 3 days.
      </ui-alert>
      <div class="text-muted-foreground p-6 text-sm">Page content</div>
    </div>
    <doc-code-block [code]="bannerCode" />
  </section>

  <doc-api-table [rows]="apiRows" />
</doc-playground>
```

In `app.routes.ts`, add before the `progress` route:

```ts
  {
    path: 'alert',
    loadComponent: () =>
      import('./features/alert-doc/alert-doc.component').then((m) => m.AlertDocComponent),
  },
```

In the sidebar's `Overlays & Feedback` group, insert `{ label: 'Alert', path: '/alert' },` before `Dialog`.

- [ ] **Step 8: Build the docs and lint**

Run: `npx ng build docs && npx ng lint ui`
Expected: both succeed with no errors.

- [ ] **Step 9: Commit**

```bash
git add libs/ui/alert libs/ui/styles/components/alert.css libs/ui/src/public-api.ts \
  projects/docs/src/app/features/alert-doc projects/docs/src/app/app.routes.ts \
  projects/docs/src/app/layout/docs-sidebar.component.ts
git commit -m "feat(ui): ✨ add ui-alert with banner, solid style, actions and dismiss

feat(docs): ✨ add alert docs page

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: `@libs/ui/tag`

**Files:**
- Modify: `libs/ui/styles/components/tag.css`
- Create: `libs/ui/tag/ng-package.json`, `libs/ui/tag/src/public-api.ts`
- Create: `libs/ui/tag/src/tag.types.ts`, `tag.variants.ts`, `tag-icon.directive.ts`, `tag.component.ts`, `tag.component.html`
- Modify: `libs/ui/src/public-api.ts`
- Test: `libs/ui/tag/src/tag.spec.ts`
- Create: `projects/docs/src/app/features/tag-doc/tag-doc.component.ts`, `.html`
- Modify: `projects/docs/src/app/app.routes.ts`, `projects/docs/src/app/layout/docs-sidebar.component.ts`

**Interfaces:**
- Consumes: `UiColor`, `cva`.
- Produces: `UiTagComponent` (inputs `color`, `appearance`, `size`, `removable`, `removeLabel`, `checkable`, `disabled`; model `checked`; output `removed`), `UiTagIconDirective`, `type UiTagAppearance = 'soft' | 'outline' | 'solid'`, `type UiTagSize = 'sm' | 'md' | 'lg'`, `tagVariants`.

- [ ] **Step 1: Create the entry point skeleton**

`libs/ui/tag/ng-package.json`: same content as `libs/ui/progress/ng-package.json`.

`libs/ui/tag/src/public-api.ts`:

```ts
export * from './tag-icon.directive';
export * from './tag.component';
export * from './tag.types';
export * from './tag.variants';
```

`libs/ui/tag/src/tag.types.ts`:

```ts
export type UiTagAppearance = 'soft' | 'outline' | 'solid';
export type UiTagSize = 'sm' | 'md' | 'lg';
```

- [ ] **Step 2: Write the failing spec**

`libs/ui/tag/src/tag.spec.ts`:

```ts
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UiColor } from '@libs/ui/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { UiTagIconDirective } from './tag-icon.directive';
import { UiTagComponent } from './tag.component';
import { UiTagAppearance, UiTagSize } from './tag.types';

@Component({
  imports: [UiTagComponent, UiTagIconDirective],
  template: `
    <div class="row">
      <ui-tag
        [color]="color()"
        [appearance]="appearance()"
        [size]="size()"
        [removable]="removable()"
        [removeLabel]="removeLabel()"
        [checkable]="checkable()"
        [disabled]="disabled()"
        [(checked)]="checked"
        (removed)="removedCount = removedCount + 1"
      >
        <svg uiTagIcon></svg>
        Draft
      </ui-tag>
    </div>
  `,
})
class TagHostComponent {
  readonly color = signal<UiColor>('neutral');
  readonly appearance = signal<UiTagAppearance>('soft');
  readonly size = signal<UiTagSize>('md');
  readonly removable = signal(false);
  readonly removeLabel = signal('Remove');
  readonly checkable = signal(false);
  readonly disabled = signal(false);
  readonly checked = signal(false);
  removedCount = 0;
}

@Component({
  imports: [UiTagComponent],
  template: `<ui-tag
    removable
    checkable
    >Bad</ui-tag
  >`,
})
class InvalidTagHostComponent {}

/** Accessible name computed from aria-labelledby, like a screen reader would. */
function nameFromLabelledBy(root: HTMLElement, el: Element): string {
  return el
    .getAttribute('aria-labelledby')!
    .split(' ')
    .map((id) => root.querySelector(`#${id}`)!.textContent!.trim())
    .join(' ');
}

describe('UiTagComponent', () => {
  let fixture: ComponentFixture<TagHostComponent>;
  let host: TagHostComponent;
  let root: HTMLElement;
  let el: HTMLElement;

  const removeButton = () => el.querySelector<HTMLButtonElement>('.tag-remove');
  const key = (target: Element, k: string) => {
    const event = new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true });
    target.dispatchEvent(event);
    fixture.detectChanges();
    return event;
  };

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TagHostComponent] });
    fixture = TestBed.createComponent(TagHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    root = fixture.nativeElement;
    el = root.querySelector('ui-tag')!;
  });

  it('renders a plain neutral md tag by default', () => {
    for (const c of ['tag', 'tag-neutral', 'tag-md']) expect(el.classList).toContain(c);
    expect(el.classList).not.toContain('tag-outline');
    expect(el.classList).not.toContain('tag-solid');
    expect(el.hasAttribute('role')).toBe(false);
    expect(el.hasAttribute('tabindex')).toBe(false);
    expect(removeButton()).toBeNull();
  });

  it('maps color, appearance and size to classes', () => {
    host.color.set('success');
    host.appearance.set('outline');
    host.size.set('lg');
    fixture.detectChanges();
    for (const c of ['tag-success', 'tag-outline', 'tag-lg']) expect(el.classList).toContain(c);
  });

  it('puts the icon slot first, with its class', () => {
    const icon = el.querySelector('[uiTagIcon]')!;
    expect(icon.classList).toContain('tag-icon');
    expect(el.firstElementChild).toBe(icon);
    expect(el.querySelector('.tag-label')!.textContent!.trim()).toBe('Draft');
  });

  it('removable: the × is named "Remove <label>" and emits removed', () => {
    host.removable.set(true);
    fixture.detectChanges();
    expect(nameFromLabelledBy(root, removeButton()!)).toBe('Remove Draft');

    removeButton()!.click();
    expect(host.removedCount).toBe(1);

    key(removeButton()!, 'Delete');
    key(removeButton()!, 'Backspace');
    expect(host.removedCount).toBe(3);

    host.removeLabel.set('Delete');
    fixture.detectChanges();
    expect(nameFromLabelledBy(root, removeButton()!)).toBe('Delete Draft');
  });

  it('removing does not click the surrounding row', () => {
    // Listener added in code, not the template, so the spec doesn't need a clickable <div>
    let rowClicks = 0;
    root.querySelector('.row')!.addEventListener('click', () => rowClicks++);
    host.removable.set(true);
    fixture.detectChanges();
    removeButton()!.click();
    expect(host.removedCount).toBe(1);
    expect(rowClicks).toBe(0);
  });

  it('disabled blocks remove', () => {
    host.removable.set(true);
    host.disabled.set(true);
    fixture.detectChanges();
    expect(removeButton()!.disabled).toBe(true);
    expect(el.getAttribute('aria-disabled')).toBe('true');
    expect(el.classList).toContain('tag-disabled');
    removeButton()!.click();
    expect(host.removedCount).toBe(0);
  });

  it('checkable: toggles on click, Enter and Space with aria-pressed', () => {
    host.checkable.set(true);
    fixture.detectChanges();
    expect(el.getAttribute('role')).toBe('button');
    expect(el.getAttribute('tabindex')).toBe('0');
    expect(el.getAttribute('aria-pressed')).toBe('false');
    expect(el.classList).toContain('tag-checkable');
    expect(el.classList).toContain('tag-outline');

    el.click();
    fixture.detectChanges();
    expect(host.checked()).toBe(true);
    expect(el.getAttribute('aria-pressed')).toBe('true');
    expect(el.classList).toContain('tag-solid');

    key(el, 'Enter');
    expect(host.checked()).toBe(false);

    const space = key(el, ' ');
    expect(host.checked()).toBe(true);
    expect(space.defaultPrevented).toBe(true);
  });

  it('disabled checkable is not focusable and does not toggle', () => {
    host.checkable.set(true);
    host.disabled.set(true);
    fixture.detectChanges();
    expect(el.getAttribute('tabindex')).toBe('-1');
    el.click();
    fixture.detectChanges();
    expect(host.checked()).toBe(false);
  });
});

describe('UiTagComponent (invalid)', () => {
  it('throws when removable and checkable are combined', () => {
    TestBed.configureTestingModule({ imports: [InvalidTagHostComponent] });
    expect(() => {
      const fixture = TestBed.createComponent(InvalidTagHostComponent);
      fixture.detectChanges();
    }).toThrowError(/removable.*checkable/);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `npx ng test ui --watch=false --include="../tag/**/*.spec.ts"`
Expected: FAIL. It can't resolve `./tag-icon.directive` / `./tag.component`.

- [ ] **Step 4: Implement the tag**

`libs/ui/tag/src/tag.variants.ts`:

```ts
import { cva } from '@libs/ui/core';

export const tagVariants = cva({
  base: 'tag',
  variants: {
    color: {
      neutral: 'tag-neutral',
      primary: 'tag-primary',
      info: 'tag-info',
      success: 'tag-success',
      warning: 'tag-warning',
      error: 'tag-error',
    },
    // soft is the base look of `tag`, so it needs no modifier
    appearance: { soft: '', outline: 'tag-outline', solid: 'tag-solid' },
    size: { sm: 'tag-sm', md: 'tag-md', lg: 'tag-lg' },
    checkable: { true: 'tag-checkable', false: '' },
    disabled: { true: 'tag-disabled', false: '' },
  },
  defaultVariants: {
    color: 'neutral',
    appearance: 'soft',
    size: 'md',
    checkable: 'false',
    disabled: 'false',
  },
});
```

`libs/ui/tag/src/tag-icon.directive.ts`:

```ts
import { Directive } from '@angular/core';

/** Leading icon or avatar of a `ui-tag`, sized to the tag's text. */
@Directive({ selector: '[uiTagIcon]', host: { class: 'tag-icon' } })
export class UiTagIconDirective {}
```

`libs/ui/tag/src/tag.component.ts`:

```ts
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  isDevMode,
  model,
  OnInit,
  output,
} from '@angular/core';
import { UiColor } from '@libs/ui/core';
import { UiTagAppearance, UiTagSize } from './tag.types';
import { tagVariants } from './tag.variants';

let nextTagId = 0;

/**
 * Text label chip. `removable` adds a × button that emits `(removed)` (the consumer removes the tag).
 * `checkable` turns the whole tag into a toggle button bound to `checked`. The two are exclusive.
 */
@Component({
  selector: 'ui-tag',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './tag.component.html',
  host: {
    '[class]': 'hostClass()',
    '[attr.role]': 'checkable() ? "button" : null',
    '[attr.tabindex]': 'checkable() ? (disabled() ? -1 : 0) : null',
    '[attr.aria-pressed]': 'checkable() ? checked() : null',
    '[attr.aria-disabled]': 'disabled() ? "true" : null',
    '(click)': 'toggle()',
    '(keydown.enter)': 'onToggleKey($event)',
    '(keydown.space)': 'onToggleKey($event)',
  },
})
export class UiTagComponent implements OnInit {
  readonly color = input<UiColor>('neutral');
  readonly appearance = input<UiTagAppearance>('soft');
  readonly size = input<UiTagSize>('md');
  readonly removable = input(false, { transform: booleanAttribute });
  readonly removeLabel = input('Remove');
  readonly checkable = input(false, { transform: booleanAttribute });
  readonly checked = model(false);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly removed = output<void>();

  private readonly _id = `ui-tag-${++nextTagId}`;
  protected readonly labelId = `${this._id}-label`;
  protected readonly removeTextId = `${this._id}-remove`;

  protected readonly hostClass = computed(() =>
    tagVariants({
      color: this.color(),
      appearance: this.checkable() ? (this.checked() ? 'solid' : 'outline') : this.appearance(),
      size: this.size(),
      checkable: this.checkable() ? 'true' : 'false',
      disabled: this.disabled() ? 'true' : 'false',
    })
  );

  ngOnInit(): void {
    if (isDevMode() && this.removable() && this.checkable()) {
      throw new Error(
        'ui-tag: `removable` and `checkable` cannot be combined (a button inside a button is invalid).'
      );
    }
  }

  protected toggle(): void {
    if (!this.checkable() || this.disabled()) return;
    this.checked.update((checked) => !checked);
  }

  protected onToggleKey(event: Event): void {
    if (!this.checkable()) return;
    event.preventDefault();
    this.toggle();
  }

  protected remove(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    if (this.disabled()) return;
    this.removed.emit();
  }
}
```

`libs/ui/tag/src/tag.component.html`:

```html
<ng-content select="[uiTagIcon]" />
<span class="tag-label" [id]="labelId"><ng-content /></span>
@if (removable()) {
  <button
    type="button"
    class="tag-remove"
    [disabled]="disabled()"
    [attr.aria-labelledby]="removeTextId + ' ' + labelId"
    (click)="remove($event)"
    (keydown.backspace)="remove($event)"
    (keydown.delete)="remove($event)"
  >
    <span
      class="sr-only"
      [id]="removeTextId"
      >{{ removeLabel() }}</span
    >
    <svg
      class="size-3"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      aria-hidden="true"
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  </button>
}
```

- [ ] **Step 5: Extend `tag.css`**

In `libs/ui/styles/components/tag.css`, replace the `color`, `background-color` and `border` declarations of `@utility tag` with the variable-driven versions. With no modifier they compute to exactly today's colors, because a token mixed with itself is itself:

```css
  color: var(--tag-fg, var(--tag-color, var(--color-foreground)));
  background-color: var(
    --tag-bg,
    color-mix(in oklab, var(--tag-color, var(--color-muted)) 12%, var(--tag-surface, var(--color-muted)))
  );
  border: 1px solid
    var(
      --tag-border,
      color-mix(in oklab, var(--tag-color, var(--color-border)) 25%, var(--tag-surface, var(--color-border)))
    );
```

Update the header comment's second line to: `Colors set --tag-color; appearances (outline/solid) decide how it is applied. Used by ui-tag and ui-select.`

Append at the end of the file:

```css
@utility tag-lg {
  --tag-size: 2rem;
  --tag-p: 0.625rem;
  --tag-fs: 0.875rem;
}

/* Colors: `--tag-content` is the text color on a solid tag */
@utility tag-neutral {
  --tag-content: var(--color-background);
}

@utility tag-primary {
  --tag-color: var(--color-primary);
  --tag-content: var(--color-primary-content);
  --tag-surface: transparent;
}

@utility tag-info {
  --tag-color: var(--color-info);
  --tag-content: var(--color-info-content);
  --tag-surface: transparent;
}

@utility tag-success {
  --tag-color: var(--color-success);
  --tag-content: var(--color-success-content);
  --tag-surface: transparent;
}

@utility tag-warning {
  --tag-color: var(--color-warning);
  --tag-content: var(--color-warning-content);
  --tag-surface: transparent;
}

@utility tag-error {
  --tag-color: var(--color-error);
  --tag-content: var(--color-error-content);
  --tag-surface: transparent;
}

@utility tag-outline {
  --tag-bg: transparent;
  --tag-border: var(--tag-color, var(--color-border));
}

@utility tag-solid {
  --tag-bg: var(--tag-color, var(--color-foreground));
  --tag-fg: var(--tag-content, var(--color-background));
  --tag-border: transparent;
}

@utility tag-checkable {
  cursor: pointer;
  user-select: none;

  &:hover {
    --tag-border: var(--tag-color, var(--color-foreground));
  }

  &:focus-visible {
    outline: 2px solid var(--tag-color, var(--color-primary));
    outline-offset: 2px;
  }
}

@utility tag-disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

@utility tag-icon {
  display: inline-flex;
  flex-shrink: 0;
  width: calc(var(--tag-fs, 0.75rem) + 0.125rem);
  height: calc(var(--tag-fs, 0.75rem) + 0.125rem);

  & > svg,
  & > img {
    width: 100%;
    height: 100%;
  }
}

@utility tag-label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}
```

- [ ] **Step 6: Re-export and run the specs (tag + select regression)**

In `libs/ui/src/public-api.ts`, add `export * from '@libs/ui/tag';` between `svg-icon` and `toast`.

Run: `npx ng test ui --watch=false --include="../tag/**/*.spec.ts"`
Expected: PASS (9 tests).

Run: `npx ng test ui --watch=false --include="../select/**/*.spec.ts"`
Expected: PASS, with the same count as before this task (ui-select still uses `tag tag-sm`).

- [ ] **Step 7: Add the docs page**

`projects/docs/src/app/features/tag-doc/tag-doc.component.ts`:

```ts
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UiButtonComponent } from '@libs/ui/button';
import { UiColor } from '@libs/ui/core';
import { UiTagAppearance, UiTagComponent, UiTagSize } from '@libs/ui/tag';
import { ApiRow, ApiTableComponent } from '../../shared/api-table/api-table.component';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';
import { PlaygroundComponent } from '../../shared/playground/playground.component';

const INITIAL_FILTERS = ['Design', 'Frontend', 'Urgent', 'Q4'];

@Component({
  selector: 'doc-tag',
  imports: [
    FormsModule,
    UiTagComponent,
    UiButtonComponent,
    PlaygroundComponent,
    ApiTableComponent,
    CodeBlockComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './tag-doc.component.html',
})
export class TagDocComponent {
  readonly colors: UiColor[] = ['neutral', 'primary', 'info', 'success', 'warning', 'error'];
  readonly appearances: UiTagAppearance[] = ['soft', 'outline', 'solid'];
  readonly sizes: UiTagSize[] = ['sm', 'md', 'lg'];
  readonly statuses = ['Open', 'In progress', 'Done'];

  readonly color = signal<UiColor>('primary');
  readonly appearance = signal<UiTagAppearance>('soft');
  readonly size = signal<UiTagSize>('md');
  readonly removable = signal(false);
  readonly checkable = signal(false);
  readonly disabled = signal(false);
  readonly checked = signal(false);
  readonly removedCount = signal(0);

  readonly filters = signal([...INITIAL_FILTERS]);
  readonly selectedStatuses = signal<ReadonlySet<string>>(new Set(['Open']));

  readonly generatedCode = computed(() => {
    const attrs: string[] = [];
    if (this.color() !== 'neutral') attrs.push(`color="${this.color()}"`);
    if (!this.checkable() && this.appearance() !== 'soft') attrs.push(`appearance="${this.appearance()}"`);
    if (this.size() !== 'md') attrs.push(`size="${this.size()}"`);
    if (this.removable()) attrs.push('removable (removed)="remove()"');
    if (this.checkable()) attrs.push('checkable [(checked)]="checked"');
    if (this.disabled()) attrs.push('disabled');
    return `<ui-tag${attrs.length ? ' ' + attrs.join(' ') : ''}>Design</ui-tag>`;
  });

  readonly filtersCode = `@for (f of filters(); track f) {
  <ui-tag removable (removed)="removeFilter(f)">{{ f }}</ui-tag>
}`;

  readonly checkableCode = `@for (s of statuses; track s) {
  <ui-tag checkable color="primary"
          [checked]="selected().has(s)" (checkedChange)="setSelected(s, $event)">
    {{ s }}
  </ui-tag>
}`;

  readonly apiRows: ApiRow[] = [
    { name: 'color', type: 'UiColor', default: "'neutral'", description: 'Semantic color.' },
    {
      name: 'appearance',
      type: "'soft' | 'outline' | 'solid'",
      default: "'soft'",
      description: 'Ignored while checkable: checked is solid, unchecked is outline.',
    },
    { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Height 22 / 28 / 32px.' },
    { name: 'removable', type: 'boolean', default: 'false', description: 'Shows a × button.' },
    {
      name: 'removeLabel',
      type: 'string',
      default: "'Remove'",
      description: 'The × button is announced as "<removeLabel> <tag text>".',
    },
    {
      name: 'checkable',
      type: 'boolean',
      default: 'false',
      description: 'Makes the tag a toggle button (aria-pressed). Cannot be combined with removable.',
    },
    { name: 'checked', type: 'model<boolean>', default: 'false', description: 'Checkable state.' },
    { name: 'disabled', type: 'boolean', default: 'false', description: 'Blocks remove and toggle.' },
    {
      name: '(removed)',
      type: 'void',
      description: 'The tag does not remove itself; drop it from your list.',
    },
    { name: '[uiTagIcon]', type: 'directive', description: 'Leading icon or avatar slot.' },
  ];

  setRemovable(value: boolean): void {
    this.removable.set(value);
    if (value) this.checkable.set(false);
  }

  setCheckable(value: boolean): void {
    this.checkable.set(value);
    if (value) this.removable.set(false);
  }

  onRemoved(): void {
    this.removedCount.update((n) => n + 1);
  }

  removeFilter(filter: string): void {
    this.filters.update((list) => list.filter((f) => f !== filter));
  }

  resetFilters(): void {
    this.filters.set([...INITIAL_FILTERS]);
  }

  setSelected(status: string, checked: boolean): void {
    this.selectedStatuses.update((current) => {
      const next = new Set(current);
      if (checked) next.add(status);
      else next.delete(status);
      return next;
    });
  }
}
```

`projects/docs/src/app/features/tag-doc/tag-doc.component.html`:

```html
<doc-playground
  title="Tag"
  description="Text labels and chips: semantic colors, three appearances, removable and checkable (toggle) modes."
  [code]="generatedCode()"
>
  <!-- Live Preview -->
  <div
    preview
    class="flex w-full flex-col items-center gap-3 p-4"
  >
    <!-- The toggles keep removable and checkable exclusive; ui-tag checks it once at init -->
    @if (checkable()) {
      <ui-tag
        checkable
        [color]="color()"
        [size]="size()"
        [disabled]="disabled()"
        [(checked)]="checked"
      >
        Design
      </ui-tag>
    } @else {
      <ui-tag
        [color]="color()"
        [appearance]="appearance()"
        [size]="size()"
        [removable]="removable()"
        [disabled]="disabled()"
        (removed)="onRemoved()"
      >
        Design
      </ui-tag>
    }
    @if (removable()) {
      <span class="text-muted-foreground text-xs">removed emitted {{ removedCount() }}×</span>
    }
  </div>

  <!-- Controls -->
  <div
    controls
    class="space-y-4 text-xs"
  >
    <div>
      <label
        for="tag-color"
        class="text-muted-foreground mb-1 block font-medium"
        >Color</label
      >
      <select
        id="tag-color"
        class="border-border bg-background text-foreground w-full rounded-lg border px-3 py-1.5"
        [ngModel]="color()"
        (ngModelChange)="color.set($event)"
      >
        @for (c of colors; track c) {
          <option [value]="c">{{ c }}</option>
        }
      </select>
    </div>
    <div>
      <label
        for="tag-appearance"
        class="text-muted-foreground mb-1 block font-medium"
        >Appearance</label
      >
      <select
        id="tag-appearance"
        class="border-border bg-background text-foreground w-full rounded-lg border px-3 py-1.5"
        [disabled]="checkable()"
        [ngModel]="appearance()"
        (ngModelChange)="appearance.set($event)"
      >
        @for (a of appearances; track a) {
          <option [value]="a">{{ a }}</option>
        }
      </select>
    </div>
    <div>
      <label
        for="tag-size"
        class="text-muted-foreground mb-1 block font-medium"
        >Size</label
      >
      <select
        id="tag-size"
        class="border-border bg-background text-foreground w-full rounded-lg border px-3 py-1.5"
        [ngModel]="size()"
        (ngModelChange)="size.set($event)"
      >
        @for (s of sizes; track s) {
          <option [value]="s">{{ s }}</option>
        }
      </select>
    </div>
    <label class="flex cursor-pointer items-center gap-2">
      <input
        type="checkbox"
        class="border-border rounded"
        [ngModel]="removable()"
        (ngModelChange)="setRemovable($event)"
      />
      <span>Removable</span>
    </label>
    <label class="flex cursor-pointer items-center gap-2">
      <input
        type="checkbox"
        class="border-border rounded"
        [ngModel]="checkable()"
        (ngModelChange)="setCheckable($event)"
      />
      <span>Checkable</span>
    </label>
    <label class="flex cursor-pointer items-center gap-2">
      <input
        type="checkbox"
        class="border-border rounded"
        [ngModel]="disabled()"
        (ngModelChange)="disabled.set($event)"
      />
      <span>Disabled</span>
    </label>
  </div>

  <section class="space-y-4">
    <h2 class="text-foreground text-xl font-bold tracking-tight">Removable filters</h2>
    <div class="flex flex-wrap items-center gap-2">
      @for (f of filters(); track f) {
        <ui-tag
          removable
          (removed)="removeFilter(f)"
          >{{ f }}</ui-tag
        >
      } @empty {
        <span class="text-muted-foreground text-sm">No filters.</span>
      }
      <button
        uiButton
        variant="ghost"
        size="sm"
        (click)="resetFilters()"
      >
        Reset
      </button>
    </div>
    <doc-code-block [code]="filtersCode" />
  </section>

  <section class="space-y-4">
    <h2 class="text-foreground text-xl font-bold tracking-tight">Checkable chips</h2>
    <div class="flex flex-wrap gap-2">
      @for (s of statuses; track s) {
        <ui-tag
          checkable
          color="primary"
          [checked]="selectedStatuses().has(s)"
          (checkedChange)="setSelected(s, $event)"
        >
          {{ s }}
        </ui-tag>
      }
    </div>
    <doc-code-block [code]="checkableCode" />
  </section>

  <doc-api-table [rows]="apiRows" />
</doc-playground>
```

In `app.routes.ts`, add before the `**` route:

```ts
  {
    path: 'tag',
    loadComponent: () => import('./features/tag-doc/tag-doc.component').then((m) => m.TagDocComponent),
  },
```

In the sidebar's `Data & Media` group, add `{ label: 'Tag', path: '/tag' },` at the end.

- [ ] **Step 8: Build the docs and lint**

Run: `npx ng build docs && npx ng lint ui`
Expected: both succeed.

- [ ] **Step 9: Commit**

```bash
git add libs/ui/tag libs/ui/styles/components/tag.css libs/ui/src/public-api.ts \
  projects/docs/src/app/features/tag-doc projects/docs/src/app/app.routes.ts \
  projects/docs/src/app/layout/docs-sidebar.component.ts
git commit -m "feat(ui): ✨ add ui-tag with colors, removable and checkable modes

feat(docs): ✨ add tag docs page

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: `@libs/ui/badge`

**Files:**
- Create: `libs/ui/styles/components/badge.css`
- Modify: `libs/ui/styles/index.css`
- Create: `libs/ui/badge/ng-package.json`, `libs/ui/badge/src/public-api.ts`
- Create: `libs/ui/badge/src/badge.utils.ts`, `badge.types.ts`, `badge.variants.ts`, `badge.component.ts`, `badge-anchor.directive.ts`
- Modify: `libs/ui/src/public-api.ts`
- Test: `libs/ui/badge/src/badge.utils.spec.ts`, `libs/ui/badge/src/badge.spec.ts`
- Create: `projects/docs/src/app/features/badge-doc/badge-doc.component.ts`, `.html`
- Modify: `projects/docs/src/app/app.routes.ts`, `projects/docs/src/app/layout/docs-sidebar.component.ts`

**Interfaces:**
- Consumes: `UiColor`, `cva`; `AriaDescriber` from `@angular/cdk/a11y`.
- Produces:
  - `formatBadgeCount(count: number | string | null | undefined, max?: number, showZero?: boolean): string`
  - `type UiBadgeSize = 'sm' | 'md'`
  - `type UiBadgePosition = 'top-end' | 'top-start' | 'bottom-end' | 'bottom-start'`
  - `type UiBadgeOverlap = 'rectangular' | 'circular'`
  - `badgeVariants`, `badgeOverlayVariants`
  - `UiBadgeComponent` (`ui-badge`)
  - `UiBadgeAnchorDirective` (`[uiBadge]`; inputs `uiBadge`, `uiBadgeMax`, `uiBadgeShowZero`, `uiBadgeDot`, `uiBadgeColor`, `uiBadgeSize`, `uiBadgePosition`, `uiBadgeOverlap`, `uiBadgeHidden`, `uiBadgeDescription`)

- [ ] **Step 1: Write the failing utils spec**

`libs/ui/badge/src/badge.utils.spec.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { formatBadgeCount } from './badge.utils';

describe('formatBadgeCount', () => {
  it('formats numbers up to max', () => {
    expect(formatBadgeCount(5)).toBe('5');
    expect(formatBadgeCount(99)).toBe('99');
    expect(formatBadgeCount(100)).toBe('99+');
    expect(formatBadgeCount(10, 9)).toBe('9+');
  });

  it('hides zero unless showZero', () => {
    expect(formatBadgeCount(0)).toBe('');
    expect(formatBadgeCount(0, 99, true)).toBe('0');
  });

  it('passes strings through', () => {
    expect(formatBadgeCount('new')).toBe('new');
    expect(formatBadgeCount('0')).toBe('0');
  });

  it('returns empty for null, empty, negative and non-finite values', () => {
    expect(formatBadgeCount(null)).toBe('');
    expect(formatBadgeCount(undefined)).toBe('');
    expect(formatBadgeCount('')).toBe('');
    expect(formatBadgeCount(-1)).toBe('');
    expect(formatBadgeCount(Number.NaN)).toBe('');
  });

  it('drops fractions', () => {
    expect(formatBadgeCount(4.7)).toBe('4');
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx ng test ui --watch=false --include="../badge/**/*.spec.ts"`
Expected: FAIL. It can't resolve `./badge.utils`.

- [ ] **Step 3: Implement the utils, types and variants**

`libs/ui/badge/ng-package.json`: same content as `libs/ui/progress/ng-package.json`.

`libs/ui/badge/src/badge.utils.ts`:

```ts
/**
 * Text shown in a badge. Numbers above `max` become "{max}+"; 0 is hidden unless `showZero`;
 * strings pass through; null, '', negative and non-finite numbers give ''.
 */
export function formatBadgeCount(
  count: number | string | null | undefined,
  max = 99,
  showZero = false
): string {
  if (count === null || count === undefined || count === '') return '';
  if (typeof count === 'string') return count;
  if (!Number.isFinite(count) || count < 0) return '';
  if (count === 0 && !showZero) return '';
  return count > max ? `${max}+` : String(Math.floor(count));
}
```

`libs/ui/badge/src/badge.types.ts`:

```ts
export type UiBadgeSize = 'sm' | 'md';
export type UiBadgePosition = 'top-end' | 'top-start' | 'bottom-end' | 'bottom-start';

/** `circular` insets the badge for round hosts (avatars, icon buttons). */
export type UiBadgeOverlap = 'rectangular' | 'circular';
```

`libs/ui/badge/src/badge.variants.ts`:

```ts
import { cva } from '@libs/ui/core';

export const badgeVariants = cva({
  base: 'badge',
  variants: {
    color: {
      neutral: 'badge-neutral',
      primary: 'badge-primary',
      info: 'badge-info',
      success: 'badge-success',
      warning: 'badge-warning',
      error: 'badge-error',
    },
    size: { sm: 'badge-sm', md: 'badge-md', dot: 'badge-dot' },
  },
  defaultVariants: { color: 'error', size: 'md' },
});

export const badgeOverlayVariants = cva({
  base: 'badge-overlay',
  variants: {
    position: {
      'top-end': 'badge-top-end',
      'top-start': 'badge-top-start',
      'bottom-end': 'badge-bottom-end',
      'bottom-start': 'badge-bottom-start',
    },
    overlap: { rectangular: '', circular: 'badge-circular' },
  },
  defaultVariants: { position: 'top-end', overlap: 'rectangular' },
});
```

`libs/ui/badge/src/public-api.ts`:

```ts
export * from './badge-anchor.directive';
export * from './badge.component';
export * from './badge.types';
export * from './badge.utils';
export * from './badge.variants';
```

Run: `npx ng test ui --watch=false --include="../badge/**/badge.utils.spec.ts"`
Expected: PASS (5 tests).

- [ ] **Step 4: Write the failing component spec**

`libs/ui/badge/src/badge.spec.ts`:

```ts
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UiButtonComponent } from '@libs/ui/button';
import { UiColor } from '@libs/ui/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { UiBadgeAnchorDirective } from './badge-anchor.directive';
import { UiBadgeComponent } from './badge.component';
import { UiBadgePosition, UiBadgeSize } from './badge.types';

@Component({
  imports: [UiBadgeComponent],
  template: `
    <ui-badge
      [count]="count()"
      [max]="max()"
      [showZero]="showZero()"
      [dot]="dot()"
      [color]="color()"
      [size]="size()"
    />
  `,
})
class InlineHostComponent {
  readonly count = signal<number | string | null>(5);
  readonly max = signal(99);
  readonly showZero = signal(false);
  readonly dot = signal(false);
  readonly color = signal<UiColor>('error');
  readonly size = signal<UiBadgeSize>('md');
}

@Component({
  imports: [UiButtonComponent, UiBadgeAnchorDirective],
  template: `
    @if (show()) {
      <button
        uiButton
        variant="ghost"
        [uiBadge]="count()"
        [uiBadgeDot]="dot()"
        [uiBadgeHidden]="hidden()"
        [uiBadgePosition]="position()"
        [uiBadgeDescription]="description()"
        uiBadgeOverlap="circular"
      >
        Inbox
      </button>
    }
  `,
})
class AnchorHostComponent {
  readonly show = signal(true);
  readonly count = signal<number | null>(3);
  readonly dot = signal(false);
  readonly hidden = signal(false);
  readonly position = signal<UiBadgePosition>('top-end');
  readonly description = signal('3 unread');
}

@Component({
  imports: [UiBadgeAnchorDirective],
  template: `<img
    alt=""
    uiBadge
    uiBadgeDot
  />`,
})
class ImgHostComponent {}

describe('UiBadgeComponent (inline)', () => {
  let fixture: ComponentFixture<InlineHostComponent>;
  let host: InlineHostComponent;
  let el: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [InlineHostComponent] });
    fixture = TestBed.createComponent(InlineHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    el = fixture.nativeElement.querySelector('ui-badge');
  });

  it('shows the count with default classes', () => {
    expect(el.textContent!.trim()).toBe('5');
    for (const c of ['badge', 'badge-error', 'badge-md']) expect(el.classList).toContain(c);
    expect(el.hasAttribute('hidden')).toBe(false);
  });

  it('caps at max', () => {
    host.count.set(120);
    fixture.detectChanges();
    expect(el.textContent!.trim()).toBe('99+');

    host.max.set(9);
    host.count.set(10);
    fixture.detectChanges();
    expect(el.textContent!.trim()).toBe('9+');
  });

  it('hides when there is nothing to show', () => {
    host.count.set(0);
    fixture.detectChanges();
    expect(el.hasAttribute('hidden')).toBe(true);

    host.showZero.set(true);
    fixture.detectChanges();
    expect(el.hasAttribute('hidden')).toBe(false);
    expect(el.textContent!.trim()).toBe('0');

    host.count.set(null);
    fixture.detectChanges();
    expect(el.hasAttribute('hidden')).toBe(true);
  });

  it('renders an empty visible dot', () => {
    host.count.set(null);
    host.dot.set(true);
    fixture.detectChanges();
    expect(el.hasAttribute('hidden')).toBe(false);
    expect(el.textContent!.trim()).toBe('');
    expect(el.classList).toContain('badge-dot');
  });

  it('maps color and size', () => {
    host.color.set('success');
    host.size.set('sm');
    fixture.detectChanges();
    expect(el.classList).toContain('badge-success');
    expect(el.classList).toContain('badge-sm');
  });
});

describe('UiBadgeAnchorDirective', () => {
  let fixture: ComponentFixture<AnchorHostComponent>;
  let host: AnchorHostComponent;

  const button = () => fixture.nativeElement.querySelector('button') as HTMLButtonElement;
  const badges = () => button().querySelectorAll<HTMLElement>('span.badge');
  const describedText = () => {
    const id = button().getAttribute('aria-describedby');
    return id ? document.getElementById(id)?.textContent : null;
  };

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [AnchorHostComponent] });
    fixture = TestBed.createComponent(AnchorHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('appends exactly one decorative badge to the host and keeps the host classes', () => {
    expect(badges().length).toBe(1);
    const badge = badges()[0];
    expect(badge.textContent).toBe('3');
    expect(badge.getAttribute('aria-hidden')).toBe('true');
    for (const c of ['badge-overlay', 'badge-top-end', 'badge-circular', 'badge-error']) {
      expect(badge.classList).toContain(c);
    }
    // uiButton's own [class] binding must not wipe badge-anchor
    expect(button().classList).toContain('badge-anchor');
    expect(button().classList).toContain('btn');
  });

  it('updates the badge in place', () => {
    host.count.set(120);
    host.position.set('bottom-start');
    fixture.detectChanges();
    expect(badges().length).toBe(1);
    expect(badges()[0].textContent).toBe('99+');
    expect(badges()[0].classList).toContain('badge-bottom-start');
    expect(badges()[0].classList).not.toContain('badge-top-end');
    expect(button().classList).toContain('badge-anchor');
  });

  it('hides for 0, null and uiBadgeHidden; a dot shows without a count', () => {
    host.count.set(0);
    fixture.detectChanges();
    expect(badges()[0].hidden).toBe(true);

    host.dot.set(true);
    fixture.detectChanges();
    expect(badges()[0].hidden).toBe(false);
    expect(badges()[0].classList).toContain('badge-dot');

    host.hidden.set(true);
    fixture.detectChanges();
    expect(badges()[0].hidden).toBe(true);
  });

  it('describes the host while visible and follows description changes', () => {
    expect(describedText()).toBe('3 unread');

    host.description.set('4 unread');
    fixture.detectChanges();
    expect(describedText()).toBe('4 unread');
  });

  it('drops the description when the badge hides', () => {
    host.count.set(0);
    fixture.detectChanges();
    expect(button().hasAttribute('aria-describedby')).toBe(false);
  });

  it('cleans up the description when destroyed', () => {
    const id = button().getAttribute('aria-describedby')!;
    expect(document.getElementById(id)).not.toBeNull();

    host.show.set(false);
    fixture.detectChanges();
    expect(document.getElementById(id)).toBeNull();
  });
});

describe('UiBadgeAnchorDirective (void host)', () => {
  it('throws on elements that cannot have children', () => {
    TestBed.configureTestingModule({ imports: [ImgHostComponent] });
    expect(() => {
      const fixture = TestBed.createComponent(ImgHostComponent);
      fixture.detectChanges();
    }).toThrowError(/uiBadge.*IMG/);
  });
});
```

- [ ] **Step 5: Run it to verify it fails**

Run: `npx ng test ui --watch=false --include="../badge/**/badge.spec.ts"`
Expected: FAIL. It can't resolve `./badge-anchor.directive` / `./badge.component`.

- [ ] **Step 6: Implement the inline badge and the anchor directive**

`libs/ui/badge/src/badge.component.ts`:

```ts
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  numberAttribute,
} from '@angular/core';
import { UiColor } from '@libs/ui/core';
import { UiBadgeSize } from './badge.types';
import { formatBadgeCount } from './badge.utils';
import { badgeVariants } from './badge.variants';

/** Inline count or dot, e.g. next to a menu label. Hidden when there is nothing to show. */
@Component({
  selector: 'ui-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'hostClass()',
    '[attr.hidden]': 'visible() ? null : ""',
  },
  template: `{{ text() }}`,
})
export class UiBadgeComponent {
  readonly count = input<number | string | null>(null);
  readonly max = input(99, { transform: numberAttribute });
  readonly showZero = input(false, { transform: booleanAttribute });
  readonly dot = input(false, { transform: booleanAttribute });
  readonly color = input<UiColor>('error');
  readonly size = input<UiBadgeSize>('md');

  protected readonly text = computed(() =>
    this.dot() ? '' : formatBadgeCount(this.count(), this.max(), this.showZero())
  );
  protected readonly visible = computed(() => this.dot() || this.text() !== '');
  protected readonly hostClass = computed(() =>
    badgeVariants({ color: this.color(), size: this.dot() ? 'dot' : this.size() })
  );
}
```

`libs/ui/badge/src/badge-anchor.directive.ts`:

```ts
import { AriaDescriber } from '@angular/cdk/a11y';
import {
  booleanAttribute,
  computed,
  DestroyRef,
  Directive,
  effect,
  ElementRef,
  inject,
  input,
  isDevMode,
  numberAttribute,
  Renderer2,
} from '@angular/core';
import { UiColor } from '@libs/ui/core';
import { UiBadgeOverlap, UiBadgePosition, UiBadgeSize } from './badge.types';
import { formatBadgeCount } from './badge.utils';
import { badgeOverlayVariants, badgeVariants } from './badge.variants';

/** Elements that cannot render a child badge. */
const VOID_HOSTS = new Set(['IMG', 'INPUT', 'TEXTAREA', 'SELECT', 'BR', 'HR']);

/**
 * Overlays a count or dot on its host (Material `matBadge` style). The badge span is decorative;
 * `uiBadgeDescription` is what assistive technology announces, via `aria-describedby`.
 */
@Directive({
  selector: '[uiBadge]',
  host: { class: 'badge-anchor' },
})
export class UiBadgeAnchorDirective {
  private readonly _host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly _renderer = inject(Renderer2);
  private readonly _describer = inject(AriaDescriber);

  readonly content = input<number | string | null>(null, { alias: 'uiBadge' });
  readonly max = input(99, { alias: 'uiBadgeMax', transform: numberAttribute });
  readonly showZero = input(false, { alias: 'uiBadgeShowZero', transform: booleanAttribute });
  readonly dot = input(false, { alias: 'uiBadgeDot', transform: booleanAttribute });
  readonly color = input<UiColor>('error', { alias: 'uiBadgeColor' });
  readonly size = input<UiBadgeSize>('md', { alias: 'uiBadgeSize' });
  readonly position = input<UiBadgePosition>('top-end', { alias: 'uiBadgePosition' });
  readonly overlap = input<UiBadgeOverlap>('rectangular', { alias: 'uiBadgeOverlap' });
  readonly hidden = input(false, { alias: 'uiBadgeHidden', transform: booleanAttribute });
  readonly description = input('', { alias: 'uiBadgeDescription' });

  private readonly _text = computed(() =>
    this.dot() ? '' : formatBadgeCount(this.content(), this.max(), this.showZero())
  );
  private readonly _visible = computed(
    () => !this.hidden() && (this.dot() || this._text() !== '')
  );
  private readonly _class = computed(() =>
    badgeVariants(
      { color: this.color(), size: this.dot() ? 'dot' : this.size() },
      badgeOverlayVariants({ position: this.position(), overlap: this.overlap() })
    )
  );

  private readonly _badge: HTMLElement;
  private _describedAs = '';

  constructor() {
    if (isDevMode() && VOID_HOSTS.has(this._host.tagName)) {
      throw new Error(
        `uiBadge cannot be placed on <${this._host.tagName}>: it can't contain the badge. Wrap it in an element.`
      );
    }

    this._badge = this._renderer.createElement('span');
    this._renderer.setAttribute(this._badge, 'aria-hidden', 'true');
    this._renderer.appendChild(this._host, this._badge);

    effect(() => {
      this._badge.textContent = this._text();
      this._badge.className = this._class();
      this._badge.hidden = !this._visible();
    });

    effect(() => {
      const next = this._visible() ? this.description().trim() : '';
      if (next === this._describedAs) return;
      if (this._describedAs) this._describer.removeDescription(this._host, this._describedAs);
      if (next) this._describer.describe(this._host, next);
      this._describedAs = next;
    });

    inject(DestroyRef).onDestroy(() => {
      if (this._describedAs) this._describer.removeDescription(this._host, this._describedAs);
      this._renderer.removeChild(this._host, this._badge);
    });
  }
}
```

- [ ] **Step 7: Add the CSS**

`libs/ui/styles/components/badge.css`:

```css
/* ----------------------------------------------------------------------------------------------------- */
/*  @ Badge
/*
/*  Count / dot indicator. Colors set `--badge-color` + `--badge-content`; sizes set `--badge-size`,
/*  `--badge-p`, `--badge-fs`. `badge-overlay` + a position place it on a `badge-anchor` host.
/* ----------------------------------------------------------------------------------------------------- */
@utility badge {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  min-width: var(--badge-size, 1.25rem);
  height: var(--badge-size, 1.25rem);
  padding-inline: var(--badge-p, 0.375rem);
  font-size: var(--badge-fs, 0.75rem);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  line-height: 1;
  white-space: nowrap;
  vertical-align: middle;
  color: var(--badge-content, var(--color-error-content));
  background-color: var(--badge-color, var(--color-error));
  border-radius: 9999px;
}

@utility badge-sm {
  --badge-size: 1rem;
  --badge-p: 0.25rem;
  --badge-fs: 0.625rem;
}

@utility badge-md {
  --badge-size: 1.25rem;
  --badge-p: 0.375rem;
  --badge-fs: 0.75rem;
}

@utility badge-dot {
  --badge-size: 0.5rem;
  --badge-p: 0;
}

@utility badge-neutral {
  --badge-color: var(--color-foreground);
  --badge-content: var(--color-background);
}

@utility badge-primary {
  --badge-color: var(--color-primary);
  --badge-content: var(--color-primary-content);
}

@utility badge-info {
  --badge-color: var(--color-info);
  --badge-content: var(--color-info-content);
}

@utility badge-success {
  --badge-color: var(--color-success);
  --badge-content: var(--color-success-content);
}

@utility badge-warning {
  --badge-color: var(--color-warning);
  --badge-content: var(--color-warning-content);
}

@utility badge-error {
  --badge-color: var(--color-error);
  --badge-content: var(--color-error-content);
}

/* Host of [uiBadge]. Hosts with overflow: hidden clip the badge. */
@utility badge-anchor {
  position: relative;
}

@utility badge-overlay {
  position: absolute;
  z-index: 1;
  top: var(--badge-top, auto);
  bottom: var(--badge-bottom, auto);
  inset-inline-start: var(--badge-start, auto);
  inset-inline-end: var(--badge-end, auto);
  transform: translate(var(--badge-tx, 50%), var(--badge-ty, -50%));
  pointer-events: none;
  box-shadow: 0 0 0 2px var(--color-background);
}

@utility badge-top-end {
  --badge-top: var(--badge-inset, 0px);
  --badge-end: var(--badge-inset, 0px);
  --badge-tx: 50%;
  --badge-ty: -50%;

  &:dir(rtl) {
    --badge-tx: -50%;
  }
}

@utility badge-top-start {
  --badge-top: var(--badge-inset, 0px);
  --badge-start: var(--badge-inset, 0px);
  --badge-tx: -50%;
  --badge-ty: -50%;

  &:dir(rtl) {
    --badge-tx: 50%;
  }
}

@utility badge-bottom-end {
  --badge-bottom: var(--badge-inset, 0px);
  --badge-end: var(--badge-inset, 0px);
  --badge-tx: 50%;
  --badge-ty: 50%;

  &:dir(rtl) {
    --badge-tx: -50%;
  }
}

@utility badge-bottom-start {
  --badge-bottom: var(--badge-inset, 0px);
  --badge-start: var(--badge-inset, 0px);
  --badge-tx: -50%;
  --badge-ty: 50%;

  &:dir(rtl) {
    --badge-tx: 50%;
  }
}

/* Round hosts: move the badge onto the circle's edge (~14% in from the bounding box corner) */
@utility badge-circular {
  --badge-inset: 14%;
}
```

In `libs/ui/styles/index.css`, add `@import './components/badge.css';` after the `tag.css` import.

- [ ] **Step 8: Re-export and run the specs**

In `libs/ui/src/public-api.ts`, add `export * from '@libs/ui/badge';` after `alert`.

Run: `npx ng test ui --watch=false --include="../badge/**/*.spec.ts"`
Expected: PASS (utils 5, component 12).

- [ ] **Step 9: Add the docs page**

`projects/docs/src/app/features/badge-doc/badge-doc.component.ts`:

```ts
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  UiBadgeAnchorDirective,
  UiBadgeComponent,
  UiBadgeOverlap,
  UiBadgePosition,
  UiBadgeSize,
} from '@libs/ui/badge';
import { UiButtonComponent } from '@libs/ui/button';
import { UiColor } from '@libs/ui/core';
import { ApiRow, ApiTableComponent } from '../../shared/api-table/api-table.component';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';
import { PlaygroundComponent } from '../../shared/playground/playground.component';

@Component({
  selector: 'doc-badge',
  imports: [
    FormsModule,
    UiBadgeComponent,
    UiBadgeAnchorDirective,
    UiButtonComponent,
    PlaygroundComponent,
    ApiTableComponent,
    CodeBlockComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './badge-doc.component.html',
})
export class BadgeDocComponent {
  readonly colors: UiColor[] = ['neutral', 'primary', 'info', 'success', 'warning', 'error'];
  readonly positions: UiBadgePosition[] = ['top-end', 'top-start', 'bottom-end', 'bottom-start'];

  readonly count = signal(5);
  readonly max = signal(99);
  readonly dot = signal(false);
  readonly showZero = signal(false);
  readonly color = signal<UiColor>('error');
  readonly size = signal<UiBadgeSize>('md');
  readonly position = signal<UiBadgePosition>('top-end');
  readonly overlap = signal<UiBadgeOverlap>('circular');

  readonly description = computed(() => `${this.count()} unread notifications`);

  readonly generatedCode = computed(() => {
    const attrs = [`[uiBadge]="${this.count()}"`];
    if (this.max() !== 99) attrs.push(`[uiBadgeMax]="${this.max()}"`);
    if (this.dot()) attrs.push('uiBadgeDot');
    if (this.showZero()) attrs.push('uiBadgeShowZero');
    if (this.color() !== 'error') attrs.push(`uiBadgeColor="${this.color()}"`);
    if (this.size() !== 'md') attrs.push(`uiBadgeSize="${this.size()}"`);
    if (this.position() !== 'top-end') attrs.push(`uiBadgePosition="${this.position()}"`);
    if (this.overlap() !== 'rectangular') attrs.push(`uiBadgeOverlap="${this.overlap()}"`);
    attrs.push(`uiBadgeDescription="${this.description()}"`);
    return `<button uiButton variant="ghost" size="icon" aria-label="Notifications"
        ${attrs.join('\n        ')}>
  <svg>…</svg>
</button>

<!-- inline -->
Inbox <ui-badge [count]="${this.count()}" />`;
  });

  readonly apiRows: ApiRow[] = [
    {
      name: 'uiBadge / count',
      type: 'number | string | null',
      default: 'null',
      description: 'Content. Numbers above max show "{max}+"; 0 is hidden unless showZero.',
    },
    { name: 'uiBadgeMax / max', type: 'number', default: '99', description: 'Overflow threshold.' },
    { name: 'uiBadgeShowZero / showZero', type: 'boolean', default: 'false', description: 'Show 0.' },
    { name: 'uiBadgeDot / dot', type: 'boolean', default: 'false', description: '8px dot without text.' },
    { name: 'uiBadgeColor / color', type: 'UiColor', default: "'error'", description: 'Fill color.' },
    { name: 'uiBadgeSize / size', type: "'sm' | 'md'", default: "'md'", description: 'Height 16 / 20px.' },
    {
      name: 'uiBadgePosition',
      type: "'top-end' | 'top-start' | 'bottom-end' | 'bottom-start'",
      default: "'top-end'",
      description: 'Corner of the host ([uiBadge] only). Follows the text direction.',
    },
    {
      name: 'uiBadgeOverlap',
      type: "'rectangular' | 'circular'",
      default: "'rectangular'",
      description: 'circular moves the badge onto the edge of round hosts.',
    },
    { name: 'uiBadgeHidden', type: 'boolean', default: 'false', description: 'Hide the badge.' },
    {
      name: 'uiBadgeDescription',
      type: 'string',
      default: "''",
      description: 'Announced through aria-describedby while visible. The badge itself is aria-hidden.',
    },
  ];
}
```

`projects/docs/src/app/features/badge-doc/badge-doc.component.html`:

```html
<doc-playground
  title="Badge"
  description="Counts and status dots, inline or overlaid on another element with [uiBadge]."
  [code]="generatedCode()"
>
  <!-- Live Preview -->
  <div
    preview
    class="flex w-full items-center justify-center gap-10 p-4"
  >
    <button
      uiButton
      variant="ghost"
      size="icon"
      aria-label="Notifications"
      [uiBadge]="count()"
      [uiBadgeMax]="max()"
      [uiBadgeDot]="dot()"
      [uiBadgeShowZero]="showZero()"
      [uiBadgeColor]="color()"
      [uiBadgeSize]="size()"
      [uiBadgePosition]="position()"
      [uiBadgeOverlap]="overlap()"
      [uiBadgeDescription]="description()"
    >
      <svg
        class="size-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
        aria-hidden="true"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
        />
      </svg>
    </button>

    <span class="flex items-center gap-2 text-sm">
      Inbox
      <ui-badge
        [count]="count()"
        [max]="max()"
        [dot]="dot()"
        [showZero]="showZero()"
        [color]="color()"
        [size]="size()"
      />
    </span>
  </div>

  <!-- Controls -->
  <div
    controls
    class="space-y-4 text-xs"
  >
    <div>
      <label
        for="bdg-count"
        class="text-muted-foreground mb-1 block font-medium"
        >Count</label
      >
      <input
        id="bdg-count"
        type="number"
        min="0"
        class="border-border bg-background text-foreground w-full rounded-lg border px-3 py-1.5"
        [ngModel]="count()"
        (ngModelChange)="count.set($event ?? 0)"
      />
    </div>
    <div>
      <label
        for="bdg-max"
        class="text-muted-foreground mb-1 block font-medium"
        >Max</label
      >
      <input
        id="bdg-max"
        type="number"
        min="1"
        class="border-border bg-background text-foreground w-full rounded-lg border px-3 py-1.5"
        [ngModel]="max()"
        (ngModelChange)="max.set($event ?? 99)"
      />
    </div>
    <div>
      <label
        for="bdg-color"
        class="text-muted-foreground mb-1 block font-medium"
        >Color</label
      >
      <select
        id="bdg-color"
        class="border-border bg-background text-foreground w-full rounded-lg border px-3 py-1.5"
        [ngModel]="color()"
        (ngModelChange)="color.set($event)"
      >
        @for (c of colors; track c) {
          <option [value]="c">{{ c }}</option>
        }
      </select>
    </div>
    <div>
      <label
        for="bdg-size"
        class="text-muted-foreground mb-1 block font-medium"
        >Size</label
      >
      <select
        id="bdg-size"
        class="border-border bg-background text-foreground w-full rounded-lg border px-3 py-1.5"
        [ngModel]="size()"
        (ngModelChange)="size.set($event)"
      >
        <option value="sm">sm</option>
        <option value="md">md</option>
      </select>
    </div>
    <div>
      <label
        for="bdg-position"
        class="text-muted-foreground mb-1 block font-medium"
        >Position</label
      >
      <select
        id="bdg-position"
        class="border-border bg-background text-foreground w-full rounded-lg border px-3 py-1.5"
        [ngModel]="position()"
        (ngModelChange)="position.set($event)"
      >
        @for (p of positions; track p) {
          <option [value]="p">{{ p }}</option>
        }
      </select>
    </div>
    <div>
      <label
        for="bdg-overlap"
        class="text-muted-foreground mb-1 block font-medium"
        >Overlap</label
      >
      <select
        id="bdg-overlap"
        class="border-border bg-background text-foreground w-full rounded-lg border px-3 py-1.5"
        [ngModel]="overlap()"
        (ngModelChange)="overlap.set($event)"
      >
        <option value="rectangular">rectangular</option>
        <option value="circular">circular</option>
      </select>
    </div>
    <label class="flex cursor-pointer items-center gap-2">
      <input
        type="checkbox"
        class="border-border rounded"
        [ngModel]="dot()"
        (ngModelChange)="dot.set($event)"
      />
      <span>Dot</span>
    </label>
    <label class="flex cursor-pointer items-center gap-2">
      <input
        type="checkbox"
        class="border-border rounded"
        [ngModel]="showZero()"
        (ngModelChange)="showZero.set($event)"
      />
      <span>Show zero</span>
    </label>
  </div>

  <doc-api-table [rows]="apiRows" />
</doc-playground>
```

In `app.routes.ts`, add before the `tag` route:

```ts
  {
    path: 'badge',
    loadComponent: () =>
      import('./features/badge-doc/badge-doc.component').then((m) => m.BadgeDocComponent),
  },
```

In the sidebar's `Data & Media` group, add `{ label: 'Badge', path: '/badge' },` before `Paginator`.

- [ ] **Step 10: Build the docs and lint**

Run: `npx ng build docs && npx ng lint ui`
Expected: both succeed.

- [ ] **Step 11: Commit**

```bash
git add libs/ui/badge libs/ui/styles/components/badge.css libs/ui/styles/index.css libs/ui/src/public-api.ts \
  projects/docs/src/app/features/badge-doc projects/docs/src/app/app.routes.ts \
  projects/docs/src/app/layout/docs-sidebar.component.ts
git commit -m "feat(ui): ✨ add ui-badge and the uiBadge overlay directive

feat(docs): ✨ add badge docs page

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: `@libs/ui/avatar`

**Files:**
- Create: `libs/ui/styles/components/avatar.css`
- Modify: `libs/ui/styles/index.css`
- Create: `libs/ui/avatar/ng-package.json`, `libs/ui/avatar/src/public-api.ts`
- Create: `libs/ui/avatar/src/initials.ts`, `avatar.types.ts`, `avatar.tokens.ts`, `avatar.variants.ts`, `avatar.component.ts`, `avatar.component.html`, `avatar-group.component.ts`
- Modify: `libs/ui/src/public-api.ts`
- Test: `libs/ui/avatar/src/initials.spec.ts`, `libs/ui/avatar/src/avatar.spec.ts`
- Create: `projects/docs/src/app/features/avatar-doc/avatar-doc.component.ts`, `.html`
- Modify: `projects/docs/src/app/app.routes.ts`, `projects/docs/src/app/layout/docs-sidebar.component.ts`

**Interfaces:**
- Consumes: `UiSize`, `cva`; `UiBadgeAnchorDirective` (Task 6, in the spec and the docs only).
- Produces:
  - `getInitials(name: string | null | undefined): string`
  - `type UiAvatarShape = 'circle' | 'square'`
  - `UI_AVATAR_GROUP`: `InjectionToken<UiAvatarGroupContext>`, where `UiAvatarGroupContext` is `{ size: Signal<UiSize>; shape: Signal<UiAvatarShape>; isHidden(avatar: object): boolean }`
  - `avatarVariants`
  - `UiAvatarComponent` (inputs `src`, `alt`, `name`, `size`, `shape`)
  - `UiAvatarGroupComponent` (inputs `max`, `size`, `shape`)

- [ ] **Step 1: Write the failing initials spec**

`libs/ui/avatar/src/initials.spec.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { getInitials } from './initials';

describe('getInitials', () => {
  it('takes the first letter of the first and last words', () => {
    expect(getInitials('Nguyễn Văn An')).toBe('NA');
    expect(getInitials('Linh Tran')).toBe('LT');
  });

  it('uses one letter for a single word and upper-cases it', () => {
    expect(getInitials('linh')).toBe('L');
  });

  it('ignores extra whitespace', () => {
    expect(getInitials('  Linh   Tran  ')).toBe('LT');
  });

  it('keeps Vietnamese letters and combining marks whole', () => {
    expect(getInitials('đặng thị ễ')).toBe('ĐỄ');
    // "Ễ" written as E + combining circumflex + combining tilde (NFD)
    expect(getInitials('An Ễm')).toBe('AỄ');
  });

  it('returns empty for empty, blank and nullish names', () => {
    expect(getInitials('')).toBe('');
    expect(getInitials('   ')).toBe('');
    expect(getInitials(null)).toBe('');
    expect(getInitials(undefined)).toBe('');
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx ng test ui --watch=false --include="../avatar/**/initials.spec.ts"`
Expected: FAIL. It can't resolve `./initials`.

- [ ] **Step 3: Implement `getInitials`**

`libs/ui/avatar/ng-package.json`: same content as `libs/ui/progress/ng-package.json`.

`libs/ui/avatar/src/initials.ts`:

```ts
/** First user-perceived character, so combining marks and emoji stay whole. */
function firstGrapheme(word: string): string {
  if (typeof Intl !== 'undefined' && typeof Intl.Segmenter === 'function') {
    const first = new Intl.Segmenter(undefined, { granularity: 'grapheme' })
      .segment(word)
      [Symbol.iterator]()
      .next();
    return first.done ? '' : first.value.segment;
  }
  return Array.from(word)[0] ?? '';
}

/** "Nguyễn Văn An" → "NA", "linh" → "L", blank → "". */
export function getInitials(name: string | null | undefined): string {
  const words = (name ?? '').trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '';
  const first = firstGrapheme(words[0]);
  const last = words.length > 1 ? firstGrapheme(words[words.length - 1]) : '';
  return (first + last).toLocaleUpperCase();
}
```

Run: `npx ng test ui --watch=false --include="../avatar/**/initials.spec.ts"`
Expected: PASS (5 tests).

- [ ] **Step 4: Create types, token, variants and public API**

`libs/ui/avatar/src/avatar.types.ts`:

```ts
export type UiAvatarShape = 'circle' | 'square';
```

`libs/ui/avatar/src/avatar.tokens.ts`:

```ts
import { InjectionToken, Signal } from '@angular/core';
import { UiSize } from '@libs/ui/core';
import { UiAvatarShape } from './avatar.types';

/** Provided by `ui-avatar-group` to its avatars. */
export interface UiAvatarGroupContext {
  readonly size: Signal<UiSize>;
  readonly shape: Signal<UiAvatarShape>;
  /** Whether the group hides this avatar (beyond `max`). Reads signals, so it's reactive. */
  isHidden(avatar: object): boolean;
}

export const UI_AVATAR_GROUP = new InjectionToken<UiAvatarGroupContext>('UI_AVATAR_GROUP');
```

`libs/ui/avatar/src/avatar.variants.ts`:

```ts
import { cva } from '@libs/ui/core';

export const avatarVariants = cva({
  base: 'avatar',
  variants: {
    size: {
      xs: 'avatar-xs',
      sm: 'avatar-sm',
      md: 'avatar-md',
      lg: 'avatar-lg',
      xl: 'avatar-xl',
    },
    shape: { circle: '', square: 'avatar-square' },
  },
  defaultVariants: { size: 'md', shape: 'circle' },
});
```

`libs/ui/avatar/src/public-api.ts`:

```ts
export * from './avatar-group.component';
export * from './avatar.component';
export * from './avatar.tokens';
export * from './avatar.types';
export * from './avatar.variants';
export * from './initials';
```

- [ ] **Step 5: Write the failing component spec**

`libs/ui/avatar/src/avatar.spec.ts`:

```ts
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UiBadgeAnchorDirective } from '@libs/ui/badge';
import { UiSize } from '@libs/ui/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { UiAvatarGroupComponent } from './avatar-group.component';
import { UiAvatarComponent } from './avatar.component';
import { UiAvatarShape } from './avatar.types';

@Component({
  imports: [UiAvatarComponent, UiBadgeAnchorDirective],
  template: `
    <ui-avatar
      uiBadge
      uiBadgeDot
      uiBadgeColor="success"
      [src]="src()"
      [alt]="alt()"
      [name]="name()"
      [size]="size()"
      [shape]="shape()"
    />
  `,
})
class AvatarHostComponent {
  readonly src = signal<string | null>(null);
  readonly alt = signal<string | null>(null);
  readonly name = signal<string | null>('Nguyễn Văn An');
  readonly size = signal<UiSize | undefined>(undefined);
  readonly shape = signal<UiAvatarShape | undefined>(undefined);
}

@Component({
  imports: [UiAvatarComponent],
  template: `<ui-avatar><span class="team">T</span></ui-avatar>`,
})
class ContentHostComponent {}

@Component({
  imports: [UiAvatarComponent, UiAvatarGroupComponent],
  template: `
    <ui-avatar-group
      [max]="max()"
      size="sm"
    >
      @for (n of names; track n; let i = $index) {
        <ui-avatar
          [name]="n"
          [size]="i === 0 ? 'xl' : undefined"
        />
      }
    </ui-avatar-group>
  `,
})
class GroupHostComponent {
  readonly names = ['Linh Tran', 'An Nguyen', 'Bao Le', 'Chi Pham', 'Dung Vo'];
  readonly max = signal<number | null>(3);
}

describe('UiAvatarComponent', () => {
  let fixture: ComponentFixture<AvatarHostComponent>;
  let host: AvatarHostComponent;
  let el: HTMLElement;

  const img = () => el.querySelector<HTMLImageElement>('img.avatar-image');
  const initials = () => el.querySelector('.avatar-initials');
  const fire = (target: Element, type: 'load' | 'error') => {
    target.dispatchEvent(new Event(type));
    fixture.detectChanges();
  };

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [AvatarHostComponent] });
    fixture = TestBed.createComponent(AvatarHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    el = fixture.nativeElement.querySelector('ui-avatar');
  });

  it('shows initials and is a named image', () => {
    expect(initials()!.textContent!.trim()).toBe('NA');
    expect(el.getAttribute('role')).toBe('img');
    expect(el.getAttribute('aria-label')).toBe('Nguyễn Văn An');
    expect(el.classList).toContain('avatar');
    expect(el.classList).toContain('avatar-md');
  });

  it('falls back to the default icon and is decorative without a name', () => {
    host.name.set(null);
    fixture.detectChanges();
    expect(initials()).toBeNull();
    expect(el.querySelector('.avatar-icon')).not.toBeNull();
    expect(el.hasAttribute('role')).toBe(false);
    expect(el.getAttribute('aria-hidden')).toBe('true');
  });

  it('keeps the fallback under the image until it loads', () => {
    host.src.set('/u/42.jpg');
    fixture.detectChanges();
    expect(img()).not.toBeNull();
    expect(img()!.getAttribute('alt')).toBe('');
    expect(initials()).not.toBeNull();

    fire(img()!, 'load');
    expect(initials()).toBeNull();
    expect(img()!.classList).toContain('avatar-image-loaded');
    expect(el.getAttribute('aria-label')).toBe('Nguyễn Văn An');
  });

  it('falls back to initials when the image fails, and retries when src changes', () => {
    host.src.set('/broken.jpg');
    fixture.detectChanges();
    fire(img()!, 'error');
    expect(img()).toBeNull();
    expect(initials()!.textContent!.trim()).toBe('NA');

    host.src.set('/u/43.jpg');
    fixture.detectChanges();
    expect(img()).not.toBeNull();
  });

  it('uses alt as the accessible name; alt="" makes it decorative', () => {
    host.alt.set('Profile photo');
    fixture.detectChanges();
    expect(el.getAttribute('aria-label')).toBe('Profile photo');

    host.alt.set('');
    fixture.detectChanges();
    expect(el.getAttribute('aria-hidden')).toBe('true');
    expect(el.hasAttribute('aria-label')).toBe(false);
  });

  it('maps size and shape', () => {
    host.size.set('lg');
    host.shape.set('square');
    fixture.detectChanges();
    expect(el.classList).toContain('avatar-lg');
    expect(el.classList).toContain('avatar-square');
  });

  it('keeps a [uiBadge] dot through image loading', () => {
    expect(el.querySelectorAll('span.badge').length).toBe(1);
    host.src.set('/u/42.jpg');
    fixture.detectChanges();
    fire(img()!, 'load');
    expect(el.querySelectorAll('span.badge').length).toBe(1);
    expect(el.classList).toContain('badge-anchor');
  });
});

describe('UiAvatarComponent (projected fallback)', () => {
  it('renders projected content instead of the default icon', () => {
    TestBed.configureTestingModule({ imports: [ContentHostComponent] });
    const fixture = TestBed.createComponent(ContentHostComponent);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement.querySelector('ui-avatar');
    expect(el.querySelector('.team')).not.toBeNull();
    expect(el.querySelector('.avatar-icon')).toBeNull();
  });
});

describe('UiAvatarGroupComponent', () => {
  let fixture: ComponentFixture<GroupHostComponent>;
  let host: GroupHostComponent;
  let group: HTMLElement;

  const avatars = () => Array.from(group.querySelectorAll<HTMLElement>('ui-avatar'));
  const more = () => group.querySelector<HTMLElement>('.avatar-more');

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [GroupHostComponent] });
    fixture = TestBed.createComponent(GroupHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    group = fixture.nativeElement.querySelector('ui-avatar-group');
  });

  it('hides avatars beyond max and shows +N', () => {
    expect(group.getAttribute('role')).toBe('group');
    expect(group.classList).toContain('avatar-group');
    expect(avatars().map((a) => a.hasAttribute('hidden'))).toEqual([false, false, false, true, true]);
    expect(more()!.textContent!.trim()).toBe('+2');
    expect(more()!.getAttribute('aria-label')).toBe('2 more');
  });

  it('shows everyone without max', () => {
    host.max.set(null);
    fixture.detectChanges();
    expect(avatars().every((a) => !a.hasAttribute('hidden'))).toBe(true);
    expect(more()).toBeNull();
  });

  it('applies the group size unless an avatar sets its own', () => {
    expect(avatars()[0].classList).toContain('avatar-xl');
    expect(avatars()[1].classList).toContain('avatar-sm');
    expect(more()!.classList).toContain('avatar-sm');
  });
});
```

- [ ] **Step 6: Run it to verify it fails**

Run: `npx ng test ui --watch=false --include="../avatar/**/avatar.spec.ts"`
Expected: FAIL. It can't resolve `./avatar-group.component` / `./avatar.component`.

- [ ] **Step 7: Implement the avatar and the group**

`libs/ui/avatar/src/avatar.component.ts`:

```ts
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  linkedSignal,
} from '@angular/core';
import { UiSize } from '@libs/ui/core';
import { UI_AVATAR_GROUP } from './avatar.tokens';
import { UiAvatarShape } from './avatar.types';
import { avatarVariants } from './avatar.variants';
import { getInitials } from './initials';

/**
 * User picture with a fallback chain: image → initials from `name` → projected content → user icon.
 * The fallback stays underneath until the image has loaded, and returns if it fails.
 */
@Component({
  selector: 'ui-avatar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './avatar.component.html',
  host: {
    '[class]': 'hostClass()',
    '[attr.role]': 'decorative() ? null : "img"',
    '[attr.aria-label]': 'decorative() ? null : accessibleName()',
    '[attr.aria-hidden]': 'decorative() ? "true" : null',
    '[attr.hidden]': 'hiddenByGroup() ? "" : null',
  },
})
export class UiAvatarComponent {
  private readonly _group = inject(UI_AVATAR_GROUP, { optional: true });

  readonly src = input<string | null>(null);
  readonly alt = input<string | null>(null);
  readonly name = input<string | null>(null);
  readonly size = input<UiSize | undefined>(undefined);
  readonly shape = input<UiAvatarShape | undefined>(undefined);

  /** Reset whenever `src` changes, so a new URL is tried again. */
  protected readonly failed = linkedSignal({ source: this.src, computation: () => false });
  protected readonly loaded = linkedSignal({ source: this.src, computation: () => false });

  protected readonly initials = computed(() => getInitials(this.name()));
  protected readonly showImage = computed(() => !!this.src() && !this.failed());
  protected readonly accessibleName = computed(() => (this.alt() ?? this.name() ?? '').trim());
  protected readonly decorative = computed(() => this.accessibleName() === '');
  protected readonly hiddenByGroup = computed(() => this._group?.isHidden(this) ?? false);

  protected readonly hostClass = computed(() =>
    avatarVariants({
      size: this.size() ?? this._group?.size() ?? 'md',
      shape: this.shape() ?? this._group?.shape() ?? 'circle',
    })
  );
}
```

`libs/ui/avatar/src/avatar.component.html`:

```html
@if (!loaded()) {
  @if (initials()) {
    <span
      class="avatar-initials"
      aria-hidden="true"
      >{{ initials() }}</span
    >
  } @else {
    <span
      class="avatar-fallback"
      aria-hidden="true"
    >
      <ng-content>
        <svg
          class="avatar-icon"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path
            d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-4.42 0-8 2.24-8 5v1a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-1c0-2.76-3.58-5-8-5Z"
          />
        </svg>
      </ng-content>
    </span>
  }
}
@if (showImage()) {
  <img
    class="avatar-image"
    alt=""
    [src]="src()"
    [class.avatar-image-loaded]="loaded()"
    (load)="loaded.set(true)"
    (error)="failed.set(true)"
  />
}
```

`libs/ui/avatar/src/avatar-group.component.ts`:

```ts
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  forwardRef,
  input,
  numberAttribute,
} from '@angular/core';
import { UiSize } from '@libs/ui/core';
import { UiAvatarComponent } from './avatar.component';
import { UI_AVATAR_GROUP, UiAvatarGroupContext } from './avatar.tokens';
import { UiAvatarShape } from './avatar.types';
import { avatarVariants } from './avatar.variants';

function optionalNumberAttribute(value: unknown): number | null {
  return value === null || value === undefined || value === '' ? null : numberAttribute(value);
}

/** Overlapping row of avatars. Avatars beyond `max` are hidden behind a "+N" avatar. */
@Component({
  selector: 'ui-avatar-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: UI_AVATAR_GROUP, useExisting: forwardRef(() => UiAvatarGroupComponent) }],
  host: {
    role: 'group',
    class: 'avatar-group',
  },
  template: `
    <ng-content />
    @if (overflow() > 0) {
      <span
        role="img"
        [class]="moreClass()"
        [attr.aria-label]="overflow() + ' more'"
        >+{{ overflow() }}</span
      >
    }
  `,
})
export class UiAvatarGroupComponent implements UiAvatarGroupContext {
  readonly max = input<number | null, unknown>(null, { transform: optionalNumberAttribute });
  readonly size = input<UiSize>('md');
  readonly shape = input<UiAvatarShape>('circle');

  private readonly _avatars = contentChildren(UiAvatarComponent);

  protected readonly overflow = computed(() => {
    const max = this.max();
    return max === null ? 0 : Math.max(0, this._avatars().length - max);
  });

  protected readonly moreClass = computed(() =>
    avatarVariants({ size: this.size(), shape: this.shape() }, 'avatar-more')
  );

  isHidden(avatar: object): boolean {
    const max = this.max();
    if (max === null) return false;
    return this._avatars().indexOf(avatar as UiAvatarComponent) >= max;
  }
}
```

- [ ] **Step 8: Add the CSS**

`libs/ui/styles/components/avatar.css`:

```css
/* ----------------------------------------------------------------------------------------------------- */
/*  @ Avatar
/*
/*  Sizes set `--avatar-size`; `avatar-square` sets `--avatar-radius`. The host doesn't clip (the
/*  image inherits the radius), so a [uiBadge] overlay stays visible.
/* ----------------------------------------------------------------------------------------------------- */
@utility avatar {
  position: relative;
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: var(--avatar-size, 2.5rem);
  height: var(--avatar-size, 2.5rem);
  font-size: calc(var(--avatar-size, 2.5rem) * 0.4);
  font-weight: 500;
  line-height: 1;
  vertical-align: middle;
  color: var(--color-muted-foreground);
  background-color: var(--color-muted);
  border-radius: var(--avatar-radius, 9999px);
  user-select: none;

  & .avatar-image {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: inherit;
    opacity: 0;
    transition: opacity 150ms ease;
  }

  & .avatar-image-loaded {
    opacity: 1;
  }

  & .avatar-fallback {
    display: inline-flex;
    width: 60%;
    height: 60%;
    align-items: center;
    justify-content: center;
  }

  & .avatar-icon {
    width: 100%;
    height: 100%;
  }

  @media (prefers-reduced-motion: reduce) {
    & .avatar-image {
      transition: none;
    }
  }
}

@utility avatar-xs {
  --avatar-size: 1.5rem;
}

@utility avatar-sm {
  --avatar-size: 2rem;
}

@utility avatar-md {
  --avatar-size: 2.5rem;
}

@utility avatar-lg {
  --avatar-size: 3rem;
}

@utility avatar-xl {
  --avatar-size: 4rem;
}

@utility avatar-square {
  --avatar-radius: calc(var(--avatar-size, 2.5rem) * 0.2);
}

@utility avatar-group {
  display: inline-flex;
  align-items: center;

  & > * {
    box-shadow: 0 0 0 2px var(--color-background);
  }

  & > * + * {
    margin-inline-start: calc(var(--avatar-size, 2.5rem) * -0.25);
  }
}
```

In `libs/ui/styles/index.css`, add `@import './components/avatar.css';` after the `badge.css` import.

- [ ] **Step 9: Re-export and run the specs**

In `libs/ui/src/public-api.ts`, add `export * from '@libs/ui/avatar';` after `alert`.

Run: `npx ng test ui --watch=false --include="../avatar/**/*.spec.ts"`
Expected: PASS (initials 5, avatar 11).

- [ ] **Step 10: Add the docs page**

`projects/docs/src/app/features/avatar-doc/avatar-doc.component.ts`:

```ts
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UiAvatarComponent, UiAvatarGroupComponent, UiAvatarShape } from '@libs/ui/avatar';
import { UiBadgeAnchorDirective } from '@libs/ui/badge';
import { UiSize } from '@libs/ui/core';
import { ApiRow, ApiTableComponent } from '../../shared/api-table/api-table.component';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';
import { PlaygroundComponent } from '../../shared/playground/playground.component';

type PhotoChoice = 'photo' | 'broken' | 'none';

/** Inline sample photo, so the docs don't depend on an external image host. */
const SAMPLE_PHOTO =
  'data:image/svg+xml;charset=utf-8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">' +
      '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="#6366f1"/><stop offset="1" stop-color="#ec4899"/></linearGradient></defs>' +
      '<rect width="64" height="64" fill="url(#g)"/>' +
      '<circle cx="32" cy="26" r="11" fill="#fff" fill-opacity=".85"/>' +
      '<path d="M12 60c2-12 11-18 20-18s18 6 20 18z" fill="#fff" fill-opacity=".85"/></svg>'
  );

@Component({
  selector: 'doc-avatar',
  imports: [
    FormsModule,
    UiAvatarComponent,
    UiAvatarGroupComponent,
    UiBadgeAnchorDirective,
    PlaygroundComponent,
    ApiTableComponent,
    CodeBlockComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './avatar-doc.component.html',
})
export class AvatarDocComponent {
  readonly sizes: UiSize[] = ['xs', 'sm', 'md', 'lg', 'xl'];
  readonly members = ['Linh Tran', 'An Nguyen', 'Bao Le', 'Chi Pham', 'Dung Vo', 'Giang Do'];

  readonly photo = signal<PhotoChoice>('photo');
  readonly name = signal('Nguyễn Văn An');
  readonly size = signal<UiSize>('lg');
  readonly shape = signal<UiAvatarShape>('circle');
  readonly max = signal(3);

  readonly src = computed(() => {
    switch (this.photo()) {
      case 'photo':
        return SAMPLE_PHOTO;
      case 'broken':
        return '/does-not-exist.png';
      default:
        return null;
    }
  });

  readonly generatedCode = computed(() => {
    const attrs: string[] = [];
    if (this.photo() !== 'none') attrs.push('[src]="user.avatarUrl"');
    if (this.name()) attrs.push(`name="${this.name()}"`);
    if (this.size() !== 'md') attrs.push(`size="${this.size()}"`);
    if (this.shape() !== 'circle') attrs.push(`shape="${this.shape()}"`);
    return `<ui-avatar${attrs.length ? ' ' + attrs.join(' ') : ''} />`;
  });

  readonly groupCode = computed(
    () => `<ui-avatar-group [max]="${this.max()}" size="sm">
  @for (m of members; track m.id) {
    <ui-avatar [src]="m.avatarUrl" [name]="m.name" />
  }
</ui-avatar-group>`
  );

  readonly statusCode = `<ui-avatar name="Linh Tran"
           uiBadge uiBadgeDot uiBadgeColor="success"
           uiBadgePosition="bottom-end" uiBadgeOverlap="circular"
           uiBadgeDescription="Online" />`;

  readonly apiRows: ApiRow[] = [
    { name: 'src', type: 'string | null', default: 'null', description: 'Image URL. Falls back if it fails.' },
    {
      name: 'name',
      type: 'string | null',
      default: 'null',
      description: 'Initials fallback (first + last word) and default accessible name.',
    },
    {
      name: 'alt',
      type: 'string | null',
      default: 'null',
      description: 'Overrides the accessible name. "" (or no name) makes the avatar decorative.',
    },
    {
      name: 'size',
      type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'",
      default: "group size ?? 'md'",
      description: '24 / 32 / 40 / 48 / 64px.',
    },
    { name: 'shape', type: "'circle' | 'square'", default: "'circle'", description: 'Corner style.' },
    { name: 'content', type: 'ng-content', description: 'Custom fallback, used when there are no initials.' },
    {
      name: 'ui-avatar-group [max]',
      type: 'number | null',
      default: 'null',
      description: 'Avatars beyond max are hidden behind a "+N" avatar.',
    },
    {
      name: 'ui-avatar-group [size] / [shape]',
      type: 'UiSize / UiAvatarShape',
      default: "'md' / 'circle'",
      description: 'Applied to avatars that do not set their own.',
    },
  ];
}
```

`projects/docs/src/app/features/avatar-doc/avatar-doc.component.html`:

```html
<doc-playground
  title="Avatar"
  description="User pictures with an initials and icon fallback, two shapes, five sizes, and overlapping groups."
  [code]="generatedCode()"
>
  <!-- Live Preview -->
  <div
    preview
    class="flex w-full items-center justify-center p-4"
  >
    <ui-avatar
      [src]="src()"
      [name]="name()"
      [size]="size()"
      [shape]="shape()"
    />
  </div>

  <!-- Controls -->
  <div
    controls
    class="space-y-4 text-xs"
  >
    <div>
      <label
        for="avt-photo"
        class="text-muted-foreground mb-1 block font-medium"
        >Image</label
      >
      <select
        id="avt-photo"
        class="border-border bg-background text-foreground w-full rounded-lg border px-3 py-1.5"
        [ngModel]="photo()"
        (ngModelChange)="photo.set($event)"
      >
        <option value="photo">valid</option>
        <option value="broken">broken URL</option>
        <option value="none">none</option>
      </select>
    </div>
    <div>
      <label
        for="avt-name"
        class="text-muted-foreground mb-1 block font-medium"
        >Name</label
      >
      <input
        id="avt-name"
        class="border-border bg-background text-foreground w-full rounded-lg border px-3 py-1.5"
        [ngModel]="name()"
        (ngModelChange)="name.set($event)"
      />
    </div>
    <div>
      <label
        for="avt-size"
        class="text-muted-foreground mb-1 block font-medium"
        >Size</label
      >
      <select
        id="avt-size"
        class="border-border bg-background text-foreground w-full rounded-lg border px-3 py-1.5"
        [ngModel]="size()"
        (ngModelChange)="size.set($event)"
      >
        @for (s of sizes; track s) {
          <option [value]="s">{{ s }}</option>
        }
      </select>
    </div>
    <div>
      <label
        for="avt-shape"
        class="text-muted-foreground mb-1 block font-medium"
        >Shape</label
      >
      <select
        id="avt-shape"
        class="border-border bg-background text-foreground w-full rounded-lg border px-3 py-1.5"
        [ngModel]="shape()"
        (ngModelChange)="shape.set($event)"
      >
        <option value="circle">circle</option>
        <option value="square">square</option>
      </select>
    </div>
  </div>

  <section class="space-y-4">
    <h2 class="text-foreground text-xl font-bold tracking-tight">Group</h2>
    <div class="flex items-center gap-4">
      <ui-avatar-group
        size="sm"
        [max]="max()"
      >
        @for (m of members; track m) {
          <ui-avatar [name]="m" />
        }
      </ui-avatar-group>
      <label class="text-muted-foreground flex items-center gap-2 text-xs">
        max
        <input
          type="number"
          min="1"
          class="border-border bg-background text-foreground w-16 rounded-lg border px-2 py-1"
          [ngModel]="max()"
          (ngModelChange)="max.set($event ?? 1)"
        />
      </label>
    </div>
    <doc-code-block [code]="groupCode()" />
  </section>

  <section class="space-y-4">
    <h2 class="text-foreground text-xl font-bold tracking-tight">Status dot</h2>
    <p class="text-muted-foreground text-sm">Compose with <code>[uiBadge]</code> for presence.</p>
    <ui-avatar
      name="Linh Tran"
      uiBadge
      uiBadgeDot
      uiBadgeColor="success"
      uiBadgePosition="bottom-end"
      uiBadgeOverlap="circular"
      uiBadgeDescription="Online"
    />
    <doc-code-block [code]="statusCode" />
  </section>

  <doc-api-table [rows]="apiRows" />
</doc-playground>
```

In `app.routes.ts`, add before the `badge` route:

```ts
  {
    path: 'avatar',
    loadComponent: () =>
      import('./features/avatar-doc/avatar-doc.component').then((m) => m.AvatarDocComponent),
  },
```

In the sidebar's `Data & Media` group, add `{ label: 'Avatar', path: '/avatar' },` as the first item.

- [ ] **Step 11: Build the docs and lint**

Run: `npx ng build docs && npx ng lint ui`
Expected: both succeed.

- [ ] **Step 12: Commit**

```bash
git add libs/ui/avatar libs/ui/styles/components/avatar.css libs/ui/styles/index.css libs/ui/src/public-api.ts \
  projects/docs/src/app/features/avatar-doc projects/docs/src/app/app.routes.ts \
  projects/docs/src/app/layout/docs-sidebar.component.ts
git commit -m "feat(ui): ✨ add ui-avatar with fallbacks and ui-avatar-group

feat(docs): ✨ add avatar docs page

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: `@libs/ui/card`

**Files:**
- Create: `libs/ui/styles/components/card.css`
- Modify: `libs/ui/styles/index.css`
- Create: `libs/ui/card/ng-package.json`, `libs/ui/card/src/public-api.ts`
- Create: `libs/ui/card/src/card.types.ts`, `card.variants.ts`, `card.component.ts`, `card-parts.directive.ts`
- Modify: `libs/ui/src/public-api.ts`
- Test: `libs/ui/card/src/card.spec.ts`
- Create: `projects/docs/src/app/features/card-doc/card-doc.component.ts`, `.html`
- Modify: `projects/docs/src/app/app.routes.ts`, `projects/docs/src/app/layout/docs-sidebar.component.ts`

**Interfaces:**
- Consumes: `cva`.
- Produces:
  - `UiCardComponent` (`ui-card, [uiCard]`; inputs `appearance`, `padding`, `interactive`)
  - `UiCardHeaderDirective`, `UiCardTitleDirective`, `UiCardDescriptionDirective`, `UiCardActionDirective`, `UiCardContentDirective`, `UiCardFooterDirective`, `UiCardMediaDirective`
  - `type UiCardAppearance = 'outline' | 'elevated' | 'filled'`, `type UiCardPadding = 'none' | 'sm' | 'md' | 'lg'`
  - `cardVariants`

- [ ] **Step 1: Create the entry point skeleton**

`libs/ui/card/ng-package.json`: same content as `libs/ui/progress/ng-package.json`.

`libs/ui/card/src/card.types.ts`:

```ts
export type UiCardAppearance = 'outline' | 'elevated' | 'filled';
export type UiCardPadding = 'none' | 'sm' | 'md' | 'lg';
```

`libs/ui/card/src/public-api.ts`:

```ts
export * from './card-parts.directive';
export * from './card.component';
export * from './card.types';
export * from './card.variants';
```

- [ ] **Step 2: Write the failing spec**

`libs/ui/card/src/card.spec.ts`:

```ts
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  UiCardActionDirective,
  UiCardContentDirective,
  UiCardDescriptionDirective,
  UiCardFooterDirective,
  UiCardHeaderDirective,
  UiCardMediaDirective,
  UiCardTitleDirective,
} from './card-parts.directive';
import { UiCardComponent } from './card.component';
import { UiCardAppearance, UiCardPadding } from './card.types';

@Component({
  imports: [
    UiCardComponent,
    UiCardHeaderDirective,
    UiCardTitleDirective,
    UiCardDescriptionDirective,
    UiCardActionDirective,
    UiCardContentDirective,
    UiCardFooterDirective,
    UiCardMediaDirective,
  ],
  template: `
    <ui-card
      id="card"
      [appearance]="appearance()"
      [padding]="padding()"
      [interactive]="interactive()"
    >
      <img
        uiCardMedia
        alt=""
        src="data:,"
      />
      <div uiCardHeader>
        <h3 uiCardTitle>Title</h3>
        <p uiCardDescription>Description</p>
        <button
          uiCardAction
          type="button"
        >
          More
        </button>
      </div>
      <div uiCardContent>Content</div>
      <div uiCardFooter>Footer</div>
    </ui-card>
    <a
      uiCard
      id="link"
      href="/x"
      >Link</a
    >
    <button
      uiCard
      id="btn"
      type="button"
    >
      Button
    </button>
    <article
      uiCard
      id="article"
    >
      Plain
    </article>
  `,
})
class CardHostComponent {
  readonly appearance = signal<UiCardAppearance>('outline');
  readonly padding = signal<UiCardPadding>('md');
  readonly interactive = signal(false);
}

describe('UiCardComponent', () => {
  let fixture: ComponentFixture<CardHostComponent>;
  let host: CardHostComponent;
  let root: HTMLElement;

  const byId = (id: string) => root.querySelector<HTMLElement>(`#${id}`)!;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [CardHostComponent] });
    fixture = TestBed.createComponent(CardHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    root = fixture.nativeElement;
  });

  it('applies default classes', () => {
    const card = byId('card');
    for (const c of ['card', 'card-outline', 'card-p-md']) expect(card.classList).toContain(c);
    expect(card.classList).not.toContain('card-interactive');
  });

  it('maps appearance, padding and interactive', () => {
    host.appearance.set('elevated');
    host.padding.set('lg');
    host.interactive.set(true);
    fixture.detectChanges();
    const card = byId('card');
    for (const c of ['card-elevated', 'card-p-lg', 'card-interactive']) {
      expect(card.classList).toContain(c);
    }
  });

  it('is interactive automatically on links and buttons only', () => {
    expect(byId('link').classList).toContain('card-interactive');
    expect(byId('btn').classList).toContain('card-interactive');
    expect(byId('article').classList).toContain('card');
    expect(byId('article').classList).not.toContain('card-interactive');
  });

  it('gives each part its class', () => {
    const card = byId('card');
    const expectations: [string, string][] = [
      ['[uiCardMedia]', 'card-media'],
      ['[uiCardHeader]', 'card-header'],
      ['[uiCardTitle]', 'card-title'],
      ['[uiCardDescription]', 'card-description'],
      ['[uiCardAction]', 'card-action'],
      ['[uiCardContent]', 'card-content'],
      ['[uiCardFooter]', 'card-footer'],
    ];
    for (const [selector, cls] of expectations) {
      expect(card.querySelector(selector)!.classList).toContain(cls);
    }
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `npx ng test ui --watch=false --include="../card/**/*.spec.ts"`
Expected: FAIL. It can't resolve `./card-parts.directive` / `./card.component`.

- [ ] **Step 4: Implement the card**

`libs/ui/card/src/card.variants.ts`:

```ts
import { cva } from '@libs/ui/core';

export const cardVariants = cva({
  base: 'card',
  variants: {
    appearance: { outline: 'card-outline', elevated: 'card-elevated', filled: 'card-filled' },
    padding: { none: 'card-p-none', sm: 'card-p-sm', md: 'card-p-md', lg: 'card-p-lg' },
    interactive: { true: 'card-interactive', false: '' },
  },
  defaultVariants: { appearance: 'outline', padding: 'md', interactive: 'false' },
});
```

`libs/ui/card/src/card.component.ts`:

```ts
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
} from '@angular/core';
import { UiCardAppearance, UiCardPadding } from './card.types';
import { cardVariants } from './card.variants';

/**
 * Surface for grouped content. Works as `<ui-card>` or on a semantic host (`article[uiCard]`,
 * `a[uiCard]`, `button[uiCard]`). Links and buttons get the interactive look automatically.
 */
@Component({
  // Attribute form keeps native <a>/<button>/<article> semantics
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'ui-card, [uiCard]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'hostClass()' },
  template: '<ng-content />',
})
export class UiCardComponent {
  private readonly _tagName = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement.tagName;

  readonly appearance = input<UiCardAppearance>('outline');
  readonly padding = input<UiCardPadding>('md');
  readonly interactive = input(false, { transform: booleanAttribute });

  protected readonly hostClass = computed(() =>
    cardVariants({
      appearance: this.appearance(),
      padding: this.padding(),
      interactive:
        this.interactive() || this._tagName === 'A' || this._tagName === 'BUTTON' ? 'true' : 'false',
    })
  );
}
```

`libs/ui/card/src/card-parts.directive.ts`:

```ts
import { Directive } from '@angular/core';

/** Title/description column with an optional action pinned to the top-right. */
@Directive({ selector: '[uiCardHeader]', host: { class: 'card-header' } })
export class UiCardHeaderDirective {}

@Directive({ selector: '[uiCardTitle]', host: { class: 'card-title' } })
export class UiCardTitleDirective {}

@Directive({ selector: '[uiCardDescription]', host: { class: 'card-description' } })
export class UiCardDescriptionDirective {}

/** Button or menu placed in the header's top-right corner. */
@Directive({ selector: '[uiCardAction]', host: { class: 'card-action' } })
export class UiCardActionDirective {}

@Directive({ selector: '[uiCardContent]', host: { class: 'card-content' } })
export class UiCardContentDirective {}

@Directive({ selector: '[uiCardFooter]', host: { class: 'card-footer' } })
export class UiCardFooterDirective {}

/** Full-bleed image or video; bleeds into the card's top/bottom padding when first/last. */
@Directive({ selector: '[uiCardMedia]', host: { class: 'card-media' } })
export class UiCardMediaDirective {}
```

- [ ] **Step 5: Add the CSS**

`libs/ui/styles/components/card.css`:

```css
/* ----------------------------------------------------------------------------------------------------- */
/*  @ Card
/*
/*  `--card-p` (from card-p-*) is the only spacing value: the card's gap and block padding, and each
/*  part's inline padding. Parts can be combined in any order without doubled spacing.
/* ----------------------------------------------------------------------------------------------------- */
@utility card {
  display: flex;
  flex-direction: column;
  gap: var(--card-p, 1.5rem);
  padding-block: var(--card-p, 1.5rem);
  overflow: clip;
  font: inherit;
  text-align: start;
  text-decoration: none;
  color: var(--color-foreground);
  background-color: var(--card-bg, var(--color-background));
  border: 1px solid var(--card-border, var(--color-border));
  border-radius: 0.75rem;
  box-shadow: var(--card-shadow, none);

  & > .card-media:first-child {
    margin-top: calc(var(--card-p, 1.5rem) * -1);
  }

  & > .card-media:last-child {
    margin-bottom: calc(var(--card-p, 1.5rem) * -1);
  }
}

@utility card-outline {
  --card-border: var(--color-border);
}

@utility card-elevated {
  --card-shadow: 0 1px 3px rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
}

@utility card-filled {
  --card-bg: var(--color-muted);
  --card-border: transparent;
}

@utility card-p-none {
  --card-p: 0px;
}

@utility card-p-sm {
  --card-p: 0.75rem;
}

@utility card-p-md {
  --card-p: 1.5rem;
}

@utility card-p-lg {
  --card-p: 2rem;
}

@utility card-interactive {
  cursor: pointer;
  transition:
    box-shadow 150ms ease,
    border-color 150ms ease;

  &:hover {
    --card-border: color-mix(in oklab, var(--color-foreground) 25%, var(--color-border));
    --card-shadow: 0 4px 12px rgb(0 0 0 / 0.08);
  }

  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
}

@utility card-header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: start;
  gap: 0.375rem 1rem;
  padding-inline: var(--card-p, 1.5rem);

  & > :not(.card-action) {
    grid-column: 1;
  }
}

@utility card-title {
  font-weight: 600;
  line-height: 1.25;
}

@utility card-description {
  font-size: 0.875rem;
  color: var(--color-muted-foreground);
}

@utility card-action {
  grid-column: 2;
  grid-row: 1 / span 2;
  align-self: start;
  justify-self: end;
}

@utility card-content {
  padding-inline: var(--card-p, 1.5rem);
}

@utility card-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
  padding-inline: var(--card-p, 1.5rem);
}

@utility card-media {
  display: block;
  width: 100%;
  object-fit: cover;
}
```

In `libs/ui/styles/index.css`, add `@import './components/card.css';` after the `avatar.css` import.

- [ ] **Step 6: Re-export and run the specs**

In `libs/ui/src/public-api.ts`, add `export * from '@libs/ui/card';` after `button`.

Run: `npx ng test ui --watch=false --include="../card/**/*.spec.ts"`
Expected: PASS (4 tests).

- [ ] **Step 7: Add the docs page**

`projects/docs/src/app/features/card-doc/card-doc.component.ts`:

```ts
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UiButtonComponent } from '@libs/ui/button';
import {
  UiCardActionDirective,
  UiCardAppearance,
  UiCardComponent,
  UiCardContentDirective,
  UiCardDescriptionDirective,
  UiCardFooterDirective,
  UiCardHeaderDirective,
  UiCardMediaDirective,
  UiCardPadding,
  UiCardTitleDirective,
} from '@libs/ui/card';
import { ApiRow, ApiTableComponent } from '../../shared/api-table/api-table.component';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';
import { PlaygroundComponent } from '../../shared/playground/playground.component';

/** Inline cover image, so the docs don't depend on an external image host. */
const SAMPLE_COVER =
  'data:image/svg+xml;charset=utf-8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 160">' +
      '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="#0ea5e9"/><stop offset="1" stop-color="#8b5cf6"/></linearGradient></defs>' +
      '<rect width="400" height="160" fill="url(#g)"/></svg>'
  );

@Component({
  selector: 'doc-card',
  imports: [
    FormsModule,
    UiButtonComponent,
    UiCardComponent,
    UiCardHeaderDirective,
    UiCardTitleDirective,
    UiCardDescriptionDirective,
    UiCardActionDirective,
    UiCardContentDirective,
    UiCardFooterDirective,
    UiCardMediaDirective,
    PlaygroundComponent,
    ApiTableComponent,
    CodeBlockComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './card-doc.component.html',
})
export class CardDocComponent {
  readonly cover = SAMPLE_COVER;
  readonly appearances: UiCardAppearance[] = ['outline', 'elevated', 'filled'];
  readonly paddings: UiCardPadding[] = ['none', 'sm', 'md', 'lg'];
  readonly projects = [
    { name: 'Alpha', description: 'Design system' },
    { name: 'Beta', description: 'Mobile app' },
    { name: 'Gamma', description: 'Data pipeline' },
  ];

  readonly appearance = signal<UiCardAppearance>('outline');
  readonly padding = signal<UiCardPadding>('md');
  readonly interactive = signal(false);
  readonly media = signal(true);

  readonly generatedCode = computed(() => {
    const attrs: string[] = [];
    if (this.appearance() !== 'outline') attrs.push(`appearance="${this.appearance()}"`);
    if (this.padding() !== 'md') attrs.push(`padding="${this.padding()}"`);
    if (this.interactive()) attrs.push('interactive');
    const lines = [`<ui-card${attrs.length ? ' ' + attrs.join(' ') : ''}>`];
    if (this.media()) lines.push('  <img uiCardMedia src="cover.jpg" alt="" />');
    lines.push(
      '  <div uiCardHeader>',
      '    <h3 uiCardTitle>Project Alpha</h3>',
      '    <p uiCardDescription>Updated 2 hours ago</p>',
      '    <button uiButton variant="ghost" size="icon" uiCardAction aria-label="More">⋯</button>',
      '  </div>',
      '  <div uiCardContent>…</div>',
      '  <div uiCardFooter>',
      '    <button uiButton variant="outline">Cancel</button>',
      '    <button uiButton>Open</button>',
      '  </div>',
      '</ui-card>'
    );
    return lines.join('\n');
  });

  readonly linkCode = `<a uiCard href="/projects/alpha">
  <div uiCardHeader>
    <h3 uiCardTitle>Alpha</h3>
    <p uiCardDescription>Design system</p>
  </div>
</a>`;

  readonly apiRows: ApiRow[] = [
    {
      name: 'appearance',
      type: "'outline' | 'elevated' | 'filled'",
      default: "'outline'",
      description: 'Border / border + shadow / muted surface without border.',
    },
    {
      name: 'padding',
      type: "'none' | 'sm' | 'md' | 'lg'",
      default: "'md'",
      description: 'Spacing used by the card and every part (0 / 12 / 24 / 32px).',
    },
    {
      name: 'interactive',
      type: 'boolean',
      default: 'false',
      description: 'Hover and focus styles. Automatic on a[uiCard] and button[uiCard].',
    },
    {
      name: '[uiCardHeader] [uiCardTitle] [uiCardDescription] [uiCardAction]',
      type: 'directive',
      description: 'Header with title, description and a top-right action.',
    },
    {
      name: '[uiCardContent] [uiCardFooter] [uiCardMedia]',
      type: 'directive',
      description: 'Body, right-aligned action row, and full-bleed media.',
    },
  ];
}
```

`projects/docs/src/app/features/card-doc/card-doc.component.html`:

```html
<doc-playground
  title="Card"
  description="Surface for grouped content with header, content, footer and media parts. Works as an element or on a semantic host."
  [code]="generatedCode()"
>
  <!-- Live Preview -->
  <div
    preview
    class="flex w-full justify-center p-4"
  >
    <ui-card
      class="w-full max-w-sm"
      [appearance]="appearance()"
      [padding]="padding()"
      [interactive]="interactive()"
    >
      @if (media()) {
        <img
          uiCardMedia
          alt=""
          class="h-32"
          [src]="cover"
        />
      }
      <div uiCardHeader>
        <h3 uiCardTitle>Project Alpha</h3>
        <p uiCardDescription>Updated 2 hours ago</p>
        <button
          uiButton
          uiCardAction
          variant="ghost"
          size="icon"
          aria-label="More"
        >
          ⋯
        </button>
      </div>
      <div
        uiCardContent
        class="text-sm"
      >
        A shared component library for every product surface.
      </div>
      <div uiCardFooter>
        <button
          uiButton
          variant="outline"
        >
          Cancel
        </button>
        <button uiButton>Open</button>
      </div>
    </ui-card>
  </div>

  <!-- Controls -->
  <div
    controls
    class="space-y-4 text-xs"
  >
    <div>
      <label
        for="crd-appearance"
        class="text-muted-foreground mb-1 block font-medium"
        >Appearance</label
      >
      <select
        id="crd-appearance"
        class="border-border bg-background text-foreground w-full rounded-lg border px-3 py-1.5"
        [ngModel]="appearance()"
        (ngModelChange)="appearance.set($event)"
      >
        @for (a of appearances; track a) {
          <option [value]="a">{{ a }}</option>
        }
      </select>
    </div>
    <div>
      <label
        for="crd-padding"
        class="text-muted-foreground mb-1 block font-medium"
        >Padding</label
      >
      <select
        id="crd-padding"
        class="border-border bg-background text-foreground w-full rounded-lg border px-3 py-1.5"
        [ngModel]="padding()"
        (ngModelChange)="padding.set($event)"
      >
        @for (p of paddings; track p) {
          <option [value]="p">{{ p }}</option>
        }
      </select>
    </div>
    <label class="flex cursor-pointer items-center gap-2">
      <input
        type="checkbox"
        class="border-border rounded"
        [ngModel]="interactive()"
        (ngModelChange)="interactive.set($event)"
      />
      <span>Interactive</span>
    </label>
    <label class="flex cursor-pointer items-center gap-2">
      <input
        type="checkbox"
        class="border-border rounded"
        [ngModel]="media()"
        (ngModelChange)="media.set($event)"
      />
      <span>Media</span>
    </label>
  </div>

  <section class="space-y-4">
    <h2 class="text-foreground text-xl font-bold tracking-tight">Cards as links</h2>
    <p class="text-muted-foreground text-sm">
      On <code>&lt;a&gt;</code> and <code>&lt;button&gt;</code> hosts the card keeps native semantics and gets hover and
      focus styles automatically.
    </p>
    <div class="grid gap-4 sm:grid-cols-3">
      @for (p of projects; track p.name) {
        <a
          uiCard
          href="/card"
        >
          <div uiCardHeader>
            <h3 uiCardTitle>{{ p.name }}</h3>
            <p uiCardDescription>{{ p.description }}</p>
          </div>
        </a>
      }
    </div>
    <doc-code-block [code]="linkCode" />
  </section>

  <doc-api-table [rows]="apiRows" />
</doc-playground>
```

In `app.routes.ts`, add before the `paginator` route:

```ts
  {
    path: 'card',
    loadComponent: () => import('./features/card-doc/card-doc.component').then((m) => m.CardDocComponent),
  },
```

In the sidebar's `Data & Media` group, add `{ label: 'Card', path: '/card' },` after `Badge`.

- [ ] **Step 8: Build the docs and lint**

Run: `npx ng build docs && npx ng lint ui`
Expected: both succeed.

- [ ] **Step 9: Commit**

```bash
git add libs/ui/card libs/ui/styles/components/card.css libs/ui/styles/index.css libs/ui/src/public-api.ts \
  projects/docs/src/app/features/card-doc projects/docs/src/app/app.routes.ts \
  projects/docs/src/app/layout/docs-sidebar.component.ts
git commit -m "feat(ui): ✨ add ui-card with header, content, footer and media parts

feat(docs): ✨ add card docs page

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 9: Rebuild, full verification, visual check, roadmap status

**Files:**
- Rebuild: `packages/ui`
- Modify: `docs/ui-roadmap-status.md` (§4 Phase 1 scorecard)

**Interfaces:**
- Consumes: everything above.

- [ ] **Step 1: Rebuild the prebuilt package**

Run: `npx ng build ui && npx ng build navigation`
Expected: both succeed. `ls packages/ui` now lists `alert avatar badge card progress tag` as well.

- [ ] **Step 2: Run the whole library test suite**

Run: `npx ng test ui --watch=false`
Expected: every test passes. That's the previous total plus the new specs: progress 22, alert 8, tag 9, badge 17, avatar 16, card 4.

- [ ] **Step 3: Lint and build the docs**

Run: `npx ng lint ui && npx ng build docs`
Expected: no lint errors, and the docs build succeeds.

- [ ] **Step 4: Visual check in a browser**

Run `npx ng serve docs --port 4312`, then open each page below. Restart the server if it was already running (it may serve a stale `packages/ui`). Check light and dark mode (header toggle), and once with the OS "reduce motion" setting on:

- `/progress`:
  - the indeterminate spinner arc grows and shrinks while rotating
  - the determinate ring starts at 12 o'clock and fills clockwise
  - `showValue` is centered at lg and xl
  - the bar slides when indeterminate
  - the button's loading spinner looks unchanged
- `/alert`:
  - every color × appearance is readable, including `solid`
  - the icon is aligned with the title's first line
  - without an icon, the text starts at the padding
  - the close button sits top-right
  - the banner has square corners and only a bottom border
- `/tag`:
  - the default neutral tag matches the tags inside `/select` (multiple mode)
  - outline and solid for every color
  - the checkable hover and focus ring
  - × stays aligned at every size
- `/badge`:
  - the badge sits on the bell's corner for every position
  - `circular` overlap moves it onto the curve
  - the dot is round
  - `99+` doesn't clip
- `/avatar`:
  - initials are centered
  - the broken URL falls back to initials without a flash
  - the group overlaps with a background ring and "+N"
  - the status dot isn't clipped
- `/card`:
  - the media bleeds to the top edge with rounded corners
  - the header action is pinned top-right
  - `padding="none"` has no stray gaps
  - link cards show hover and focus

Fix any visual issue in the relevant `libs/ui/styles/components/*.css` file, then re-run Steps 1–3.

- [ ] **Step 5: Update the roadmap status**

In `docs/ui-roadmap-status.md` §4 "Phase 1 — Must-have", replace these three rows:

```markdown
| Alert / Banner | ✅ | `ui-alert` (soft/outline/dash/solid, banner, actions, dismiss) |
| Spinner / Progress | ✅ | `ui-spinner` (circular, determinate or not) and `ui-progress-bar`; button uses the shared `spinner` utility |
| Card, Badge, Avatar, Tag | ✅ | `ui-card` + parts, `ui-badge` / `[uiBadge]`, `ui-avatar` / `ui-avatar-group`, `ui-tag` (removable, checkable) |
```

Then recount the ✅ / 🟡 / ❌ rows of that table (Select and Multi-select are ✅ since `ui-select` shipped) and rewrite the `**Phase 1: N done · N partial · N missing.**` line with the new numbers.

- [ ] **Step 6: Commit**

```bash
git add packages/ui docs/ui-roadmap-status.md
git commit -m "build(libs): 🏷️ rebuild packages/ui with alert, progress, card, badge, avatar and tag

docs: 📚 mark alert, progress, card, badge, avatar and tag done in the roadmap status

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```
