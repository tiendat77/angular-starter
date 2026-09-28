# Tooltip Component Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the `@libs/ui/tooltip` entry point providing a high-performance, accessible floating tooltip directive (`[uiTooltip]`) on Angular CDK Overlay, styled via design tokens and CVA, with full docs playground and tests.

**Architecture:** A standalone `[uiTooltip]` directive injects CDK `Overlay` and lazily renders a floating `UiTooltipComponent` using `FlexibleConnectedPositionStrategy` with smart collision fallbacks. Hover and focus triggers are managed with timers and keydown listeners, while `tooltipVariants` (CVA) and `@utility tooltip` / `tooltip-arrow` handle token-driven styling and orientation.

**Tech Stack:** Angular 22 (standalone directives/components, signals), `@angular/cdk/overlay`, `class-variance-authority` (cva), Tailwind CSS v4 `@utility`, Vitest.

**Spec:** `docs/superpowers/specs/2026-09-27-ui-tooltip-design.md`

## Global Constraints

- Angular 22 standalone directives and components only; no NgModules.
- Secondary entry point `@libs/ui/tooltip` with its own `ng-package.json` pointing to `src/public-api.ts`.
- Reusable styling defined in `libs/ui/styles/components/tooltip.css` and imported in `libs/ui/styles/index.css`.
- Colors driven by design tokens via `UiColor` (`neutral`, `primary`, `info`, `success`, `warning`, `error`).
- All tests run via Vitest (`npx vitest run libs/ui/tooltip`).
- Zero direct dependencies on the host app or other non-core library entry points.

## Review Focus

1. **Host within `overflow: hidden` container:** Tooltip must be appended to CDK overlay container at document root so it is never clipped.
2. **Escape key dismissal:** Pressing `Escape` while tooltip is open must hide it immediately and stop event propagation, retaining focus on the host.
3. **Rapid mouseenter/mouseleave hover:** Leaving the host before `showDelay` (200ms) elapses must cancel the timer and prevent opening.
4. **Interactive template hover (WCAG 2.1 SC 1.4.13):** When content is a `TemplateRef` or `uiTooltipInteractive="true"`, moving the pointer from trigger into tooltip content must keep it open until pointer leaves the tooltip.
5. **Empty or dynamic null content:** Passing empty string `""` or `null` must prevent opening and clear `aria-describedby`.

---

### Task 1: Styling, Tokens & CVA Variants

**Files:**
- Create: `libs/ui/styles/components/tooltip.css`
- Modify: `libs/ui/styles/index.css`
- Create: `libs/ui/tooltip/src/tooltip.types.ts`
- Create: `libs/ui/tooltip/src/tooltip.variants.ts`
- Test: `libs/ui/tooltip/src/tooltip.variants.spec.ts`

**Interfaces:**
- Consumes: `UiColor` from `@libs/ui/core`
- Produces: `UiTooltipPosition`, `UiTooltipSize`, `UiTooltipConfig`, `UI_TOOLTIP_CONFIG`, `tooltipVariants`

- [ ] **Step 1: Write the failing test for `tooltipVariants`**

```ts
// libs/ui/tooltip/src/tooltip.variants.spec.ts
import { describe, expect, it } from 'vitest';
import { tooltipVariants } from './tooltip.variants';

describe('tooltipVariants', () => {
  it('applies default classes (neutral, md, non-interactive)', () => {
    const classes = tooltipVariants();
    expect(classes).toContain('tooltip');
    expect(classes).toContain('tooltip-neutral');
    expect(classes).toContain('tooltip-md');
    expect(classes).not.toContain('tooltip-interactive');
  });

  it('applies color variants', () => {
    expect(tooltipVariants({ color: 'primary' })).toContain('tooltip-primary');
    expect(tooltipVariants({ color: 'error' })).toContain('tooltip-error');
  });

  it('applies size and interactive modifiers', () => {
    expect(tooltipVariants({ size: 'sm', interactive: true })).toContain('tooltip-sm tooltip-interactive');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run libs/ui/tooltip/src/tooltip.variants.spec.ts`  
Expected: FAIL ("Cannot find module './tooltip.variants'")

- [ ] **Step 3: Implement types and CVA variants**

Create `libs/ui/tooltip/src/tooltip.types.ts`:
- Define `UiTooltipPosition = 'top' | 'bottom' | 'left' | 'right'`
- Define `UiTooltipSize = 'sm' | 'md'`
- Define `UiTooltipConfig` interface and `UI_TOOLTIP_CONFIG` injection token

Create `libs/ui/tooltip/src/tooltip.variants.ts`:
- Implement `tooltipVariants = cva('tooltip', { ... })` supporting `color`, `size`, and `interactive` variants.

Create `libs/ui/styles/components/tooltip.css`:
- Implement `@utility tooltip`, `@utility tooltip-arrow`, placement offsets `[data-placement^="top|bottom|left|right"]`, and color modifiers (`tooltip-neutral`, `tooltip-primary`, etc.).

Modify `libs/ui/styles/index.css`:
- Add `@import './components/tooltip.css';`

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run libs/ui/tooltip/src/tooltip.variants.spec.ts`  
Expected: PASS (3 tests passing)

- [ ] **Step 5: Commit**

```bash
git add libs/ui/styles/ libs/ui/tooltip/
git commit -m "feat(ui): ✨ add tooltip styles and cva variants"
```

---

### Task 2: Tooltip Host Component & Arrow Placement

**Files:**
- Create: `libs/ui/tooltip/src/tooltip.component.ts`
- Test: `libs/ui/tooltip/src/tooltip.component.spec.ts`

**Interfaces:**
- Consumes: `UiTooltipPosition`, `UiTooltipSize`, `UiColor` from `./tooltip.types`, `tooltipVariants` from `./tooltip.variants`
- Produces: `UiTooltipComponent` (renders `role="tooltip"`, `[id]`, projects text or `TemplateRef`, toggles arrow with `data-placement`)

- [ ] **Step 1: Write the failing test for `UiTooltipComponent`**

```ts
// libs/ui/tooltip/src/tooltip.component.spec.ts
import { Component, viewChild, TemplateRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { UiTooltipComponent } from './tooltip.component';

@Component({
  standalone: true,
  template: `<ng-template #customTpl><span class="custom-content">Hello Rich</span></ng-template>`,
})
class TestHostComponent {
  readonly tpl = viewChild.required<TemplateRef<unknown>>('customTpl');
}

describe('UiTooltipComponent', () => {
  let fixture: ComponentFixture<UiTooltipComponent>;
  let component: UiTooltipComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [UiTooltipComponent, TestHostComponent],
    });
    fixture = TestBed.createComponent(UiTooltipComponent);
    component = fixture.componentInstance;
  });

  it('renders string content with tooltip role and id', () => {
    component.id = 'test-tip-1';
    component.content = 'Simple message';
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    const tooltipEl = el.querySelector('[role="tooltip"]');
    expect(tooltipEl).not.toBeNull();
    expect(tooltipEl?.id).toBe('test-tip-1');
    expect(tooltipEl?.textContent).toContain('Simple message');
  });

  it('renders TemplateRef content when provided', () => {
    const hostFixture = TestBed.createComponent(TestHostComponent);
    hostFixture.detectChanges();
    component.content = hostFixture.componentInstance.tpl();
    fixture.detectChanges();

    const custom = fixture.nativeElement.querySelector('.custom-content');
    expect(custom).not.toBeNull();
    expect(custom.textContent).toBe('Hello Rich');
  });

  it('renders arrow element when arrow is true and sets data-placement', () => {
    component.arrow = true;
    component.placement.set('bottom');
    fixture.detectChanges();

    const arrow = fixture.nativeElement.querySelector('.tooltip-arrow');
    expect(arrow).not.toBeNull();
    const tooltipEl = fixture.nativeElement.querySelector('[role="tooltip"]');
    expect(tooltipEl?.getAttribute('data-placement')).toBe('bottom');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run libs/ui/tooltip/src/tooltip.component.spec.ts`  
Expected: FAIL ("Cannot find module './tooltip.component'")

- [ ] **Step 3: Implement `UiTooltipComponent`**

Create `libs/ui/tooltip/src/tooltip.component.ts`:
- Standalone component with `ChangeDetectionStrategy.OnPush`.
- Inputs: `id: string`, `content: string | TemplateRef<unknown> | null`, `color: UiColor`, `size: UiTooltipSize`, `arrow: boolean`, `interactive: boolean`.
- Signal: `placement = signal<UiTooltipPosition>('top')`.
- Computed `classes = computed(() => tooltipVariants({ color: this.color, size: this.size, interactive: this.interactive }))`.
- Template renders container with `role="tooltip"`, `[id]="id"`, `[class]="classes()"`, `[attr.data-placement]="placement()"`.
- Uses `ngTemplateOutlet` if `content instanceof TemplateRef`, otherwise interpolates string.
- Renders `<span class="tooltip-arrow" aria-hidden="true"></span>` when `arrow` is true.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run libs/ui/tooltip/src/tooltip.component.spec.ts`  
Expected: PASS (3 tests passing)

- [ ] **Step 5: Commit**

```bash
git add libs/ui/tooltip/src/tooltip.component.ts libs/ui/tooltip/src/tooltip.component.spec.ts
git commit -m "feat(ui): ✨ implement tooltip host component"
```

---

### Task 3: Positioning Strategy & Presets

**Files:**
- Create: `libs/ui/tooltip/src/tooltip.positions.ts`
- Test: `libs/ui/tooltip/src/tooltip.positions.spec.ts`

**Interfaces:**
- Consumes: `UiTooltipPosition` from `./tooltip.types`, `ConnectedPosition` from `@angular/cdk/overlay`
- Produces: `TOOLTIP_POSITIONS: Record<UiTooltipPosition, ConnectedPosition[]>`, `mapConnectedPositionToPlacement(pos: ConnectedPosition): UiTooltipPosition`

- [ ] **Step 1: Write the failing test for tooltip positioning presets**

```ts
// libs/ui/tooltip/src/tooltip.positions.spec.ts
import { describe, expect, it } from 'vitest';
import { TOOLTIP_POSITIONS, mapConnectedPositionToPlacement } from './tooltip.positions';

describe('tooltip positions', () => {
  it('defines 8px offset for all primary placements', () => {
    expect(TOOLTIP_POSITIONS.top[0].offsetY).toBe(-8);
    expect(TOOLTIP_POSITIONS.bottom[0].offsetY).toBe(8);
    expect(TOOLTIP_POSITIONS.left[0].offsetX).toBe(-8);
    expect(TOOLTIP_POSITIONS.right[0].offsetX).toBe(8);
  });

  it('maps flipped positions back to placement direction', () => {
    expect(mapConnectedPositionToPlacement(TOOLTIP_POSITIONS.top[0])).toBe('top');
    expect(mapConnectedPositionToPlacement(TOOLTIP_POSITIONS.bottom[0])).toBe('bottom');
    expect(mapConnectedPositionToPlacement(TOOLTIP_POSITIONS.left[0])).toBe('left');
    expect(mapConnectedPositionToPlacement(TOOLTIP_POSITIONS.right[0])).toBe('right');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run libs/ui/tooltip/src/tooltip.positions.spec.ts`  
Expected: FAIL ("Cannot find module './tooltip.positions'")

- [ ] **Step 3: Implement `tooltip.positions.ts`**

Create `libs/ui/tooltip/src/tooltip.positions.ts`:
- Define `TOOLTIP_POSITIONS` dictionary mapping `'top' | 'bottom' | 'left' | 'right'` to an array of `ConnectedPosition` entries including fallbacks.
- Implement `mapConnectedPositionToPlacement(pos: ConnectedPosition): UiTooltipPosition` using `originY` / `originX` analysis.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run libs/ui/tooltip/src/tooltip.positions.spec.ts`  
Expected: PASS (2 tests passing)

- [ ] **Step 5: Commit**

```bash
git add libs/ui/tooltip/src/tooltip.positions.ts libs/ui/tooltip/src/tooltip.positions.spec.ts
git commit -m "feat(ui): ✨ add tooltip connected position presets and mapping"
```

---

### Task 4: Directive & A11y / Overlay Lifecycle

**Files:**
- Create: `libs/ui/tooltip/src/tooltip.directive.ts`
- Create: `libs/ui/tooltip/src/public-api.ts`
- Test: `libs/ui/tooltip/src/tooltip.spec.ts`

**Interfaces:**
- Consumes: `Overlay` from `@angular/cdk/overlay`, `UiTooltipComponent`, `TOOLTIP_POSITIONS`, `mapConnectedPositionToPlacement`
- Produces: `UiTooltipDirective`, exported in `public-api.ts`

- [ ] **Step 1: Write the failing tests for `UiTooltipDirective`**

```ts
// libs/ui/tooltip/src/tooltip.spec.ts
import { Component } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { OverlayContainer } from '@angular/cdk/overlay';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { UiTooltipDirective } from './tooltip.directive';

@Component({
  standalone: true,
  imports: [UiTooltipDirective],
  template: `
    <button
      id="test-btn"
      [uiTooltip]="text"
      [uiTooltipPosition]="pos"
      [uiTooltipDelay]="delay"
      [uiTooltipDisabled]="disabled"
      [uiTooltipInteractive]="interactive"
    >
      Hover me
    </button>
  `,
})
class TestHostComponent {
  text: string | null = 'Tooltip message';
  pos: 'top' | 'bottom' | 'left' | 'right' = 'top';
  delay: number = 200;
  disabled: boolean = false;
  interactive: boolean = false;
}

describe('UiTooltipDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let overlayContainer: OverlayContainer;
  let overlayContainerElement: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent],
    });
    fixture = TestBed.createComponent(TestHostComponent);
    overlayContainer = TestBed.inject(OverlayContainer);
    overlayContainerElement = overlayContainer.getContainerElement();
    fixture.detectChanges();
  });

  afterEach(() => {
    overlayContainer.ngOnDestroy();
  });

  it('shows tooltip after delay on mouseenter and sets aria-describedby', fakeAsync(() => {
    const btn = fixture.nativeElement.querySelector('#test-btn');
    btn.dispatchEvent(new MouseEvent('mouseenter'));
    fixture.detectChanges();

    expect(overlayContainerElement.querySelector('[role="tooltip"]')).toBeNull();
    tick(200);
    fixture.detectChanges();

    const tooltip = overlayContainerElement.querySelector('[role="tooltip"]');
    expect(tooltip).not.toBeNull();
    expect(tooltip?.textContent).toContain('Tooltip message');
    expect(btn.getAttribute('aria-describedby')).toBe(tooltip?.id);
  }));

  it('cancels show if mouse leaves before delay', fakeAsync(() => {
    const btn = fixture.nativeElement.querySelector('#test-btn');
    btn.dispatchEvent(new MouseEvent('mouseenter'));
    tick(100);
    btn.dispatchEvent(new MouseEvent('mouseleave'));
    tick(200);
    fixture.detectChanges();

    expect(overlayContainerElement.querySelector('[role="tooltip"]')).toBeNull();
  }));

  it('opens immediately on focusin and closes on focusout', () => {
    const btn = fixture.nativeElement.querySelector('#test-btn');
    btn.dispatchEvent(new FocusEvent('focusin'));
    fixture.detectChanges();

    expect(overlayContainerElement.querySelector('[role="tooltip"]')).not.toBeNull();

    btn.dispatchEvent(new FocusEvent('focusout'));
    fixture.detectChanges();
    expect(overlayContainerElement.querySelector('[role="tooltip"]')).toBeNull();
  });

  it('dismisses immediately on Escape key without moving focus', () => {
    const btn = fixture.nativeElement.querySelector('#test-btn');
    btn.dispatchEvent(new FocusEvent('focusin'));
    fixture.detectChanges();
    expect(overlayContainerElement.querySelector('[role="tooltip"]')).not.toBeNull();

    const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
    btn.dispatchEvent(event);
    fixture.detectChanges();

    expect(overlayContainerElement.querySelector('[role="tooltip"]')).toBeNull();
    expect(btn.getAttribute('aria-describedby')).toBeNull();
  });

  it('does not open when disabled', fakeAsync(() => {
    fixture.componentInstance.disabled = true;
    fixture.detectChanges();

    const btn = fixture.nativeElement.querySelector('#test-btn');
    btn.dispatchEvent(new MouseEvent('mouseenter'));
    tick(200);
    fixture.detectChanges();

    expect(overlayContainerElement.querySelector('[role="tooltip"]')).toBeNull();
  }));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run libs/ui/tooltip/src/tooltip.spec.ts`  
Expected: FAIL ("Cannot find module './tooltip.directive'")

- [ ] **Step 3: Implement `UiTooltipDirective` and `public-api.ts`**

Create `libs/ui/tooltip/src/tooltip.directive.ts`:
- Inject `Overlay`, `ElementRef`, `ViewContainerRef`, `NgZone`, optional `UI_TOOLTIP_CONFIG`.
- Implement `@Input()`s matching the design: `uiTooltip`, `uiTooltipPosition`, `uiTooltipColor`, `uiTooltipSize`, `uiTooltipArrow`, `uiTooltipDelay`, `uiTooltipHideDelay`, `uiTooltipDisabled`, `uiTooltipInteractive`, `uiTooltipClass`.
- Implement `show(delay?: number)`, `hide(delay?: number)`, `toggle()`.
- Listen to `@HostListener('mouseenter')`, `@HostListener('mouseleave')`, `@HostListener('focusin')`, `@HostListener('focusout')`, `@HostListener('keydown.escape', ['$event'])`.
- Generate unique ID for `aria-describedby` when open; clean up on close or destroy.
- When `interactive` is true (or content is a `TemplateRef`), attach listeners to overlay element to prevent close on hover.
- Clean up subscriptions, timers, and dispose `OverlayRef` on `ngOnDestroy`.

Create `libs/ui/tooltip/src/public-api.ts`:
```ts
export * from './tooltip.types';
export * from './tooltip.variants';
export * from './tooltip.component';
export * from './tooltip.directive';
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run libs/ui/tooltip/src/tooltip.spec.ts`  
Expected: PASS (all tests passing)

- [ ] **Step 5: Commit**

```bash
git add libs/ui/tooltip/src/tooltip.directive.ts libs/ui/tooltip/src/public-api.ts libs/ui/tooltip/src/tooltip.spec.ts
git commit -m "feat(ui): ✨ implement tooltip directive with overlay and a11y"
```

---

### Task 5: Package Configuration & Library Integration

**Files:**
- Create: `libs/ui/tooltip/ng-package.json`
- Modify: `libs/ui/src/public-api.ts`
- Modify: `libs/ui/package.json`

**Interfaces:**
- Consumes: `libs/ui/tooltip`
- Produces: `@libs/ui/tooltip` export available to consumer applications

- [ ] **Step 1: Write `libs/ui/tooltip/ng-package.json`**

```json
{
  "$schema": "../../../node_modules/ng-packagr/ng-package.schema.json",
  "lib": {
    "entryFile": "src/public-api.ts"
  }
}
```

- [ ] **Step 2: Export from `libs/ui/src/public-api.ts`**

Add `export * from '@libs/ui/tooltip';` to `libs/ui/src/public-api.ts`.

- [ ] **Step 3: Run full library build to verify integration**

Run: `npx ng build ui`  
Expected: Build finishes with exit code 0 and bundles `packages/ui/tooltip`.

- [ ] **Step 4: Run all library tests**

Run: `npx ng test ui --watch=false`  
Expected: 34+ test files passed, 0 failures.

- [ ] **Step 5: Commit**

```bash
git add libs/ui/tooltip/ng-package.json libs/ui/src/public-api.ts
git commit -m "feat(ui): 📦 register tooltip secondary entry point"
```

---

### Task 6: Documentation Playground & Sidebar

**Files:**
- Create: `projects/docs/src/app/features/tooltip-doc/tooltip-doc.component.html`
- Create: `projects/docs/src/app/features/tooltip-doc/tooltip-doc.component.ts`
- Modify: `projects/docs/src/app/app.routes.ts`
- Modify: `projects/docs/src/app/layout/docs-sidebar.component.ts`

**Interfaces:**
- Consumes: `@libs/ui/tooltip`, `PlaygroundComponent`, `ApiTableComponent`, `CodeBlockComponent` from docs shared
- Produces: `/tooltip` interactive docs page

- [ ] **Step 1: Create `tooltip-doc.component.ts` and `tooltip-doc.component.html`**

- Include interactive playground with controls:
  - `content: string`
  - `position: 'top' | 'bottom' | 'left' | 'right'`
  - `color: UiColor`
  - `size: 'sm' | 'md'`
  - `arrow: boolean`
  - `delay: number`
  - `disabled: boolean`
- Include showcase sections:
  - Positions & Collision Auto-flip
  - Color Variants
  - Rich `TemplateRef` with Keyboard Shortcut `<kbd>`
- Include API reference table of inputs, outputs, and types.

- [ ] **Step 2: Register in `projects/docs/src/app/app.routes.ts` and `docs-sidebar.component.ts`**

- Add route `{ path: 'tooltip', loadComponent: () => import('./features/tooltip-doc/tooltip-doc.component').then(m => m.TooltipDocComponent) }`.
- Add `{ label: 'Tooltip', path: '/tooltip' }` under `Overlays & Feedback` group in `docs-sidebar.component.ts`.

- [ ] **Step 3: Verify docs build**

Run: `npx ng build docs`  
Expected: Build succeeds with 0 errors.

- [ ] **Step 4: Commit**

```bash
git add projects/docs/
git commit -m "docs: 📝 add tooltip documentation playground and navigation"
```
