# UiCollapse Component System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an enterprise-grade accessible Collapse / Accordion component system (`UiCollapse` and `UiCollapsePanel`) in `@libs/ui/collapse` adhering to WAI-ARIA Accordion patterns, Angular 22 Signals, and smooth pure-CSS dynamic height transitions.

**Architecture:** A standalone container `UiCollapse` coordinating `@angular/aria/accordion` (`AccordionGroup`) and child panels `UiCollapsePanel` (`AccordionTrigger` + `AccordionPanel`), supporting dual-level two-way reactivity (`[(activeIds)]` and `[(expanded)]`), template slot directives, CVA visual variants (`bordered`, `frameless`, `ghost`), and pure CSS Grid `0fr -> 1fr` dynamic height transitions.

**Tech Stack:** Angular 22, TypeScript 6.0, `@angular/aria/accordion`, Tailwind CSS 4, Vitest.

**Spec:** [`docs/superpowers/specs/2026-09-30-ui-collapse-design.md`](file:///home/tiendat/Code/angular-starter/docs/superpowers/specs/2026-09-30-ui-collapse-design.md)

## Global Constraints

- Standalone components and directives only (no `NgModules`).
- Change detection: `ChangeDetectionStrategy.OnPush` on every component.
- Prefix signal variables with `$` (e.g. `$isExpanded`, `$openPanels`), streams with `$`.
- Dependency injection via `inject()`, prefixed with `_`.
- Dynamic height transitions must be pure CSS Grid (`grid-template-rows: 0fr -> 1fr`) — zero JavaScript height polling.
- All exported entities must be accessible via `@libs/ui/collapse` and `@libs/ui`.

## Review Focus

1. **Extra Action Click Event Bubbling**: Clicking buttons or switches in `*uiCollapseExtra` must not toggle panel expansion.
2. **Accordion Mode Exclusivity**: When `accordion="true"`, expanding panel B must close panel A without emitting duplicate or out-of-order events.
3. **Keyboard Roving Tabindex**: Pressing `ArrowDown`, `ArrowUp`, `Home`, `End` on trigger buttons must shift focus to enabled headers and skip disabled ones.
4. **Lazy Content Lifecycle**: Heavy components inside `*uiCollapseContent` must not be initialized until the panel is expanded for the first time.
5. **Dynamic Height Transitions**: Panels must expand and collapse smoothly when contents change height dynamically without clipping or layout thrashing.

---

### Task 1: Package Scaffolding, Type Definitions, Tokens & CVA Variants

**Files:**
- Create: `libs/ui/collapse/ng-package.json`
- Create: `libs/ui/collapse/src/collapse.types.ts`
- Create: `libs/ui/collapse/src/collapse.tokens.ts`
- Create: `libs/ui/collapse/src/collapse.variants.ts`
- Modify: `tsconfig.json:24-34`

**Interfaces:**
- Produces: `UiCollapseVariant`, `UiCollapseIconPosition`, `UiCollapseContext`, `UI_COLLAPSE`, `collapseVariants`, `collapsePanelVariants`.

- [ ] **Step 1: Write test for CVA variants in `libs/ui/collapse/src/collapse.variants.spec.ts`**

```typescript
import { describe, expect, it } from 'vitest';
import { collapseVariants, collapsePanelVariants } from './collapse.variants';

describe('Collapse Variants', () => {
  it('should generate bordered variant classes by default', () => {
    const classes = collapseVariants({ variant: 'bordered' });
    expect(classes).toContain('border');
    expect(classes).toContain('rounded-lg');
  });

  it('should generate ghost variant classes', () => {
    const classes = collapseVariants({ variant: 'ghost' });
    expect(classes).toContain('bg-transparent');
    expect(classes).not.toContain('border');
  });

  it('should position expand icon on left or right', () => {
    expect(collapsePanelVariants({ iconPosition: 'left' })).toContain('flex-row');
    expect(collapsePanelVariants({ iconPosition: 'right' })).toContain('flex-row-reverse');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `export PATH="/home/tiendat/.local/share/fnm/node-versions/v24.16.0/installation/bin:$PATH" && npx ng test ui --include="../**/collapse.variants.spec.ts" --watch=false`
Expected: FAIL with module not found or missing exports.

- [ ] **Step 3: Implement `ng-package.json`, types, tokens, and CVA variants**

- Create `libs/ui/collapse/ng-package.json`:
  ```json
  {
    "$schema": "../../../node_modules/ng-packagr/ng-package.schema.json",
    "lib": {
      "entryFile": "src/public-api.ts"
    }
  }
  ```
- Create `libs/ui/collapse/src/collapse.types.ts` with `UiCollapseVariant = 'bordered' | 'frameless' | 'ghost'` and `UiCollapseIconPosition = 'left' | 'right'`.
- Create `libs/ui/collapse/src/collapse.tokens.ts` declaring `InjectionToken<UiCollapseContext>('UI_COLLAPSE')`.
- Create `libs/ui/collapse/src/collapse.variants.ts` using `cva` from `@libs/ui/core`.
- Register `"@libs/ui/collapse": ["./packages/ui/collapse", "./libs/ui/collapse/src/public-api"]` in `tsconfig.json`.

- [ ] **Step 4: Run test to verify it passes**

Run: `export PATH="/home/tiendat/.local/share/fnm/node-versions/v24.16.0/installation/bin:$PATH" && npx ng test ui --include="../**/collapse.variants.spec.ts" --watch=false`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add libs/ui/collapse/ tsconfig.json
git commit -m "feat(ui): ✨ scaffold collapse library, types, tokens, and variants"
```

---

### Task 2: Template Slot Directives

**Files:**
- Create: `libs/ui/collapse/src/collapse.directives.ts`

**Interfaces:**
- Produces: `UiCollapseHeaderDirective`, `UiCollapseExtraDirective`, `UiCollapseContentDirective`, `UiCollapseIconDirective`.

- [ ] **Step 1: Write test for template slot directives in `libs/ui/collapse/src/collapse.directives.spec.ts`**

```typescript
import { Component, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import {
  UiCollapseContentDirective,
  UiCollapseExtraDirective,
  UiCollapseHeaderDirective,
  UiCollapseIconDirective,
} from './collapse.directives';

@Component({
  standalone: true,
  imports: [
    UiCollapseHeaderDirective,
    UiCollapseExtraDirective,
    UiCollapseContentDirective,
    UiCollapseIconDirective,
  ],
  template: `
    <ng-template uiCollapseHeader>Header</ng-template>
    <ng-template uiCollapseExtra>Extra</ng-template>
    <ng-template uiCollapseContent>Content</ng-template>
    <ng-template uiCollapseIcon>Icon</ng-template>
  `,
})
class DirectiveHostComponent {
  readonly header = viewChild(UiCollapseHeaderDirective);
  readonly extra = viewChild(UiCollapseExtraDirective);
  readonly content = viewChild(UiCollapseContentDirective);
  readonly icon = viewChild(UiCollapseIconDirective);
}

describe('UiCollapse Directives', () => {
  it('should query all slot directives via viewChild', () => {
    TestBed.configureTestingModule({ imports: [DirectiveHostComponent] });
    const fixture = TestBed.createComponent(DirectiveHostComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.header()).toBeDefined();
    expect(fixture.componentInstance.extra()).toBeDefined();
    expect(fixture.componentInstance.content()).toBeDefined();
    expect(fixture.componentInstance.icon()).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `export PATH="/home/tiendat/.local/share/fnm/node-versions/v24.16.0/installation/bin:$PATH" && npx ng test ui --include="../**/collapse.directives.spec.ts" --watch=false`
Expected: FAIL with unresolved directive imports.

- [ ] **Step 3: Implement directives in `libs/ui/collapse/src/collapse.directives.ts`**

Implement standalone directives:
- `UiCollapseHeaderDirective` (`[uiCollapseHeader]`, `ng-template[uiCollapseHeader]`)
- `UiCollapseExtraDirective` (`[uiCollapseExtra]`, `ng-template[uiCollapseExtra]`)
- `UiCollapseContentDirective` (`ng-template[uiCollapseContent]`)
- `UiCollapseIconDirective` (`ng-template[uiCollapseIcon]`)

- [ ] **Step 4: Run test to verify it passes**

Run: `export PATH="/home/tiendat/.local/share/fnm/node-versions/v24.16.0/installation/bin:$PATH" && npx ng test ui --include="../**/collapse.directives.spec.ts" --watch=false`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add libs/ui/collapse/src/collapse.directives.ts libs/ui/collapse/src/collapse.directives.spec.ts
git commit -m "feat(ui): ✨ implement collapse template slot directives"
```

---

### Task 3: Core UiCollapse & UiCollapsePanel Components with @angular/aria Integration

**Files:**
- Create: `libs/ui/collapse/src/collapse-panel.component.ts`
- Create: `libs/ui/collapse/src/collapse.component.ts`
- Create: `libs/ui/collapse/src/public-api.ts`
- Create: `libs/ui/collapse/src/collapse.spec.ts`

**Interfaces:**
- Consumes: `@angular/aria/accordion` (`AccordionGroup`, `AccordionTrigger`, `AccordionPanel`), `UI_COLLAPSE`, `collapseVariants`, `collapsePanelVariants`.
- Produces: `UiCollapse`, `UiCollapsePanel`.

- [ ] **Step 1: Write initial component integration tests in `libs/ui/collapse/src/collapse.spec.ts`**

```typescript
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { UiCollapse, UiCollapsePanel } from './public-api';

@Component({
  standalone: true,
  imports: [UiCollapse, UiCollapsePanel],
  template: `
    <ui-collapse [accordion]="accordion()">
      <ui-collapse-panel [id]="'p1'" header="Panel 1" [(expanded)]="panel1Open">
        Content 1
      </ui-collapse-panel>
      <ui-collapse-panel [id]="'p2'" header="Panel 2" [(expanded)]="panel2Open">
        Content 2
      </ui-collapse-panel>
    </ui-collapse>
  `,
})
class TestHostComponent {
  readonly accordion = signal(false);
  readonly panel1Open = signal(false);
  readonly panel2Open = signal(false);
}

describe('UiCollapse & UiCollapsePanel', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TestHostComponent] });
    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render panels collapsed by default', () => {
    const triggers = fixture.nativeElement.querySelectorAll('button[ngAccordionTrigger]');
    expect(triggers.length).toBe(2);
    expect(triggers[0].getAttribute('aria-expanded')).toBe('false');
  });

  it('should toggle panel expansion when clicked', () => {
    const trigger = fixture.nativeElement.querySelector('button[ngAccordionTrigger]') as HTMLButtonElement;
    trigger.click();
    fixture.detectChanges();

    expect(host.panel1Open()).toBe(true);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `export PATH="/home/tiendat/.local/share/fnm/node-versions/v24.16.0/installation/bin:$PATH" && npx ng test ui --include="../**/collapse.spec.ts" --watch=false`
Expected: FAIL with missing components or public-api exports.

- [ ] **Step 3: Implement `UiCollapse` and `UiCollapsePanel`**

- In `collapse-panel.component.ts`:
  - Standalone component injecting `UI_COLLAPSE`.
  - Template hosting `<button ngAccordionTrigger [panel]="ariaPanel" [disabled]="disabled()" [(expanded)]="expanded">` for header, and `<div ngAccordionPanel #ariaPanel="ngAccordionPanel" [id]="contentId">` for content.
  - Compute classes via `collapsePanelVariants`.
- In `collapse.component.ts`:
  - Standalone component applying `ngAccordionGroup` from `@angular/aria/accordion`.
  - Provide `UI_COLLAPSE` context.
  - Compute container classes via `collapseVariants`.
- Export all classes in `libs/ui/collapse/src/public-api.ts`.

- [ ] **Step 4: Run test to verify it passes**

Run: `export PATH="/home/tiendat/.local/share/fnm/node-versions/v24.16.0/installation/bin:$PATH" && npx ng test ui --include="../**/collapse.spec.ts" --watch=false`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add libs/ui/collapse/src/
git commit -m "feat(ui): ✨ implement UiCollapse and UiCollapsePanel components"
```

---

### Task 4: Dual-Level State Synchronization & Accordion Mode

**Files:**
- Modify: `libs/ui/collapse/src/collapse.component.ts`
- Modify: `libs/ui/collapse/src/collapse-panel.component.ts`
- Modify: `libs/ui/collapse/src/collapse.spec.ts`

**Interfaces:**
- Consumes: `activeIds` container model, `expanded` panel model.
- Produces: Bidirectional reactive synchronization in both multi-expand and accordion modes.

- [ ] **Step 1: Write state synchronization tests in `collapse.spec.ts`**

```typescript
it('should enforce accordion mutual exclusivity when accordion is true', () => {
  host.accordion.set(true);
  fixture.detectChanges();

  const triggers = fixture.nativeElement.querySelectorAll('button[ngAccordionTrigger]');
  triggers[0].click();
  fixture.detectChanges();
  expect(host.panel1Open()).toBe(true);
  expect(host.panel2Open()).toBe(false);

  triggers[1].click();
  fixture.detectChanges();
  expect(host.panel1Open()).toBe(false);
  expect(host.panel2Open()).toBe(true);
});

it('should sync container activeIds two-way model', () => {
  // Test with [(activeIds)] bound host
  const triggers = fixture.nativeElement.querySelectorAll('button[ngAccordionTrigger]');
  triggers[0].click();
  fixture.detectChanges();
  // Expect activeIds to emit 'p1' or ['p1']
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `export PATH="/home/tiendat/.local/share/fnm/node-versions/v24.16.0/installation/bin:$PATH" && npx ng test ui --include="../**/collapse.spec.ts" --watch=false`
Expected: FAIL on accordion mutual exclusivity or `activeIds` sync.

- [ ] **Step 3: Implement state sync in `UiCollapse` and `UiCollapsePanel`**

- In `UiCollapse`:
  - Manage registration of child panels.
  - Implement bidirectional synchronization: when `activeIds` changes, update children; when a child expands, update `activeIds` and collapse siblings if `accordion()` is true.
- In `UiCollapsePanel`:
  - Sync local `expanded` model with parent context.

- [ ] **Step 4: Run test to verify it passes**

Run: `export PATH="/home/tiendat/.local/share/fnm/node-versions/v24.16.0/installation/bin:$PATH" && npx ng test ui --include="../**/collapse.spec.ts" --watch=false`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add libs/ui/collapse/src/collapse.component.ts libs/ui/collapse/src/collapse-panel.component.ts libs/ui/collapse/src/collapse.spec.ts
git commit -m "feat(ui): ✨ add dual-level state synchronization and accordion exclusivity"
```

---

### Task 5: Accessibility, Keyboard Navigation, and Slot Isolation

**Files:**
- Modify: `libs/ui/collapse/src/collapse-panel.component.ts`
- Modify: `libs/ui/collapse/src/collapse.spec.ts`

**Interfaces:**
- Produces: WAI-ARIA attributes, roving focus handling, click event isolation for extra actions.

- [ ] **Step 1: Write accessibility and event isolation tests in `collapse.spec.ts`**

```typescript
it('should isolate extra action clicks and not toggle panel', () => {
  const extraBtn = fixture.nativeElement.querySelector('.ui-collapse-extra button');
  extraBtn.click();
  fixture.detectChanges();

  expect(host.panel1Open()).toBe(false);
});

it('should apply role="region" and aria-labelledby on content panel', () => {
  const panel = fixture.nativeElement.querySelector('div[ngAccordionPanel]');
  expect(panel.getAttribute('role')).toBe('region');
  expect(panel.getAttribute('aria-labelledby')).toBeTruthy();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `export PATH="/home/tiendat/.local/share/fnm/node-versions/v24.16.0/installation/bin:$PATH" && npx ng test ui --include="../**/collapse.spec.ts" --watch=false`
Expected: FAIL on extra action click isolation.

- [ ] **Step 3: Implement click isolation and ARIA verification**

- Wrap extra action container with `(click)="$event.stopPropagation()"` and `(keydown)="$event.stopPropagation()"`.
- Verify trigger and panel element IDs and attribute linkage.

- [ ] **Step 4: Run test to verify it passes**

Run: `export PATH="/home/tiendat/.local/share/fnm/node-versions/v24.16.0/installation/bin:$PATH" && npx ng test ui --include="../**/collapse.spec.ts" --watch=false`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add libs/ui/collapse/src/collapse-panel.component.ts libs/ui/collapse/src/collapse.spec.ts
git commit -m "feat(ui): ✨ ensure WAI-ARIA compliance and extra slot event isolation"
```

---

### Task 6: Lazy Content Rendering & CSS Dynamic Height Animation

**Files:**
- Modify: `libs/ui/collapse/src/collapse-panel.component.ts`
- Modify: `libs/ui/collapse/src/collapse.spec.ts`

**Interfaces:**
- Consumes: `UiCollapseContentDirective` (`*uiCollapseContent`), CSS Grid `grid-template-rows`.
- Produces: Deferred instantiation of lazy content and smooth dynamic height transitions.

- [ ] **Step 1: Write lazy rendering test in `collapse.spec.ts`**

```typescript
it('should defer rendering when *uiCollapseContent is used until expanded', () => {
  // Check that lazy element is not in DOM initially
  expect(fixture.nativeElement.querySelector('.lazy-element')).toBeNull();

  // Expand panel
  const trigger = fixture.nativeElement.querySelector('button[ngAccordionTrigger]') as HTMLButtonElement;
  trigger.click();
  fixture.detectChanges();

  // Expect lazy element to be present in DOM
  expect(fixture.nativeElement.querySelector('.lazy-element')).not.toBeNull();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `export PATH="/home/tiendat/.local/share/fnm/node-versions/v24.16.0/installation/bin:$PATH" && npx ng test ui --include="../**/collapse.spec.ts" --watch=false`
Expected: FAIL on lazy content verification.

- [ ] **Step 3: Implement CSS Grid dynamic height structure and lazy template outlet**

- Structure the panel body with:
  ```html
  <div
    class="grid transition-[grid-template-rows] duration-200 ease-out"
    [class.grid-rows-[1fr]]="expanded()"
    [class.grid-rows-[0fr]]="!expanded()"
  >
    <div class="overflow-hidden">
      <div class="p-4 border-t border-base-200">
        @if (lazyContent()) {
          @if ($hasExpandedOnce() || expanded()) {
            <ng-container [ngTemplateOutlet]="lazyContent()!" />
          }
        } @else {
          <ng-content />
        }
      </div>
    </div>
  </div>
  ```
- Track `$hasExpandedOnce` signal to preserve instantiated content once expanded.

- [ ] **Step 4: Run test to verify it passes**

Run: `export PATH="/home/tiendat/.local/share/fnm/node-versions/v24.16.0/installation/bin:$PATH" && npx ng test ui --include="../**/collapse.spec.ts" --watch=false`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add libs/ui/collapse/src/collapse-panel.component.ts libs/ui/collapse/src/collapse.spec.ts
git commit -m "feat(ui): ✨ implement CSS Grid dynamic height animation and lazy content rendering"
```

---

### Task 7: Root Library Registration, Documentation Page & Full Verification

**Files:**
- Modify: `libs/ui/src/public-api.ts`
- Create: `apps/docs/src/app/features/collapse-doc/collapse-doc.component.ts`
- Create: `apps/docs/src/app/features/collapse-doc/collapse-doc.component.html`
- Modify: `apps/docs/src/app/app.routes.ts`
- Modify: `apps/docs/src/app/layout/docs-sidebar.component.ts`

**Interfaces:**
- Re-exports: `@libs/ui/collapse` in `@libs/ui`.
- Produces: Interactive documentation page demonstrating accordion mode, multi-expand, variants, custom slots, and nested panels.

- [ ] **Step 1: Export `@libs/ui/collapse` in root `@libs/ui` public API**

In `libs/ui/src/public-api.ts`:
Add `export * from '@libs/ui/collapse';`.

- [ ] **Step 2: Create documentation component in `apps/docs`**

Create `CollapseDocComponent` showcasing:
- Basic multi-expand mode.
- Accordion single-expansion mode.
- Variants (`bordered`, `frameless`, `ghost`).
- Custom header, extra action buttons, and expand icon slots.
- Nested collapse panels.
Register route `/collapse` in `apps/docs/src/app/app.routes.ts` and sidebar navigation.

- [ ] **Step 3: Run comprehensive verification pipeline**

Run:
```bash
export PATH="/home/tiendat/.local/share/fnm/node-versions/v24.16.0/installation/bin:$PATH" && \
npx ng test ui --include="../**/collapse*.spec.ts" --watch=false && \
npx eslint libs/ui/collapse/ && \
npx ng build ui && \
npx ng build main && \
npx ng build docs
```
Expected: All tests pass, linter reports 0 errors/warnings, all builds succeed.

- [ ] **Step 4: Commit**

```bash
git add libs/ui/src/public-api.ts apps/docs/
git commit -m "feat(ui): ✨ register collapse in root UI library and add interactive docs"
```
