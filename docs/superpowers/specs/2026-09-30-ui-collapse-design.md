# Technical Design Specification: UiCollapse Component System

- **Author**: Antigravity Assistant & Principal Frontend Architect
- **Date**: 2026-09-30
- **Target Package**: `@libs/ui/collapse` (`libs/ui/collapse/`)
- **Status**: Approved

---

## 1. Executive Summary

This specification defines the architecture, API, accessibility compliance, and styling system for `UiCollapse` and `UiCollapsePanel`, an enterprise-grade Collapse / Accordion component system for the Angular workspace.

Inspired by **NG-ZORRO**'s expressive composability, **Angular Aria**'s headless accessible primitives, and **DaisyUI / Tailwind CSS** design system tokens, the system provides:
1. **Full WAI-ARIA Accordion Pattern compliance** via `@angular/aria/accordion` (`AccordionGroup`, `AccordionTrigger`, `AccordionPanel`, `AccordionContent`).
2. **Dual-level two-way reactivity** using modern Angular 22 Signals (`input()`, `model()`, `computed()`).
3. **Pure CSS Grid dynamic height transitions** for 60fps smooth animation without JavaScript height measurement or layout thrashing.
4. **Composable template slots** for custom headers, action slot isolation (`extra`), lazy content loading, and customizable expand indicators.
5. **Three visual variants**: `bordered` (default), `frameless`, and `ghost`.

---

## 2. Architecture & File Structure

The component system is housed in `libs/ui/collapse/` as a secondary entry point of the shared `@libs/ui` library:

```
libs/ui/collapse/
├── ng-package.json
└── src/
    ├── public-api.ts                    # Public API exports
    ├── collapse.component.ts            # <ui-collapse> container component
    ├── collapse-panel.component.ts      # <ui-collapse-panel> item component
    ├── collapse.directives.ts           # Slot directives (*uiCollapseHeader, *uiCollapseExtra, *uiCollapseContent, *uiCollapseIcon)
    ├── collapse.tokens.ts               # UI_COLLAPSE injection token and context interface
    ├── collapse.types.ts                # TypeScript interfaces, variants, and position types
    ├── collapse.variants.ts             # CVA styling variants
    └── collapse.spec.ts                 # Vitest test suite
```

### Path Aliases & Exports
- Sibling import in `@libs/ui`: `libs/ui/src/public-api.ts` exports `export * from '@libs/ui/collapse';`.
- Package mapping in `tsconfig.json`: `@libs/ui/collapse` maps to `./packages/ui/collapse` and `./libs/ui/collapse/src/public-api`.
- Component styles integrated into `libs/ui/styles/components/collapse.css` or Tailwind utilities.

---

## 3. Public API Specification

### 3.1 `<ui-collapse>` (Container Component)
Selector: `ui-collapse`
ExportAs: `uiCollapse`

#### Inputs & Models
| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `accordion` | `boolean` (transformed) | `false` | When `true`, enforces single-panel expansion (accordion mode). |
| `variant` | `'bordered' \| 'frameless' \| 'ghost'` | `'bordered'` | Visual style of container and child panels. |
| `bordered` | `boolean` (transformed) | `true` | Convenience alias; `false` sets variant to `'frameless'`. |
| `ghost` | `boolean` (transformed) | `false` | Convenience alias; `true` sets variant to `'ghost'`. |
| `expandIconPosition` | `'left' \| 'right'` | `'left'` | Placement of the expand chevron/icon. |
| `[(activeIds)]` | `model<string \| number \| (string \| number)[] \| null>` | `null` | Two-way binding for active panel ID(s). In accordion mode emits scalar or 1-element array; in multi mode emits array of open IDs. |
| `disabled` | `boolean` (transformed) | `false` | Disables all panels in the container. |

---

### 3.2 `<ui-collapse-panel>` (Panel Component)
Selector: `ui-collapse-panel`
ExportAs: `uiCollapsePanel`

#### Inputs & Models
| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string \| number` | auto-generated | Unique identifier matching `activeIds`. |
| `header` | `string` | `''` | Plain text title rendered in header when custom template is not provided. |
| `extra` | `string` | `''` | Plain text extra action rendered on the opposite side of header. |
| `disabled` | `boolean` (transformed) | `false` | Disables interaction on this specific panel. |
| `showArrow` | `boolean` (transformed) | `true` | Controls whether the expand chevron/icon is displayed. |
| `[(expanded)]` | `model<boolean>` | `false` | Two-way model signal for panel expansion state. |

---

### 3.3 Template Slot Directives
All directives are standalone and exported via `public-api.ts`:

1. `UiCollapseHeaderDirective` (`ng-template[uiCollapseHeader]` / `[uiCollapseHeader]`):
   - Custom template projection for the header content.
2. `UiCollapseExtraDirective` (`ng-template[uiCollapseExtra]` / `[uiCollapseExtra]`):
   - Custom action slot (buttons, switches, dropdown triggers) with click event isolation.
3. `UiCollapseContentDirective` (`ng-template[uiCollapseContent]`):
   - Structural directive enabling lazy rendering. Content is not instantiated in the DOM until the panel is expanded for the first time.
4. `UiCollapseIconDirective` (`ng-template[uiCollapseIcon]`):
   - Custom expand indicator template, overriding default chevron SVG.

---

## 4. Accessibility & WAI-ARIA Compliance

The collapse system leverages `@angular/aria/accordion` (`AccordionGroup`, `AccordionTrigger`, `AccordionPanel`, `AccordionContent`) to implement the WAI-ARIA Accordion Pattern:

1. **Header Trigger (`AccordionTrigger`)**:
   - `role="button"` and `type="button"` on the inner button.
   - `aria-expanded="true | false"` reflects panel visibility.
   - `aria-controls="panel-{id}"` associates the header with the content region.
   - `aria-disabled="true"` when panel or container is disabled.
2. **Keyboard Navigation (`AccordionGroup`)**:
   - `ArrowDown`: Moves focus to the next enabled accordion header (wraps around).
   - `ArrowUp`: Moves focus to the previous enabled accordion header.
   - `Home`: Moves focus to the first enabled accordion header.
   - `End`: Moves focus to the last enabled accordion header.
   - `Enter` / `Space`: Toggles the focused panel.
3. **Content Region (`AccordionPanel`)**:
   - `role="region"`.
   - `aria-labelledby="header-{id}"`.
   - Sets browser-native `inert` attribute when collapsed to remove inactive panel elements from screen reader and keyboard tab sequences.
4. **Extra Action Click Isolation**:
   - Extra slot wrapper catches click and keydown events with `stopPropagation()`, preventing auxiliary buttons or switches from toggling the panel.

---

## 5. Animation & Dynamic Height Architecture

Smooth expansion is achieved using modern CSS Grid animation:

```html
<div
  class="grid transition-[grid-template-rows] duration-200 ease-out"
  [class.grid-rows-[1fr]]="expanded()"
  [class.grid-rows-[0fr]]="!expanded()"
>
  <div class="overflow-hidden">
    <div class="ui-collapse-content-body">
      @if (lazyContent()) {
        @if (hasExpandedOnce() || expanded()) {
          <ng-container [ngTemplateOutlet]="lazyContent()!" />
        }
      } @else {
        <ng-content />
      }
    </div>
  </div>
</div>
```

### Key Advantages:
- Zero JavaScript height calculation; no `scrollHeight` polling or layout thrashing.
- Fully dynamic: smoothly accommodates inner content height changes (e.g. data arrival, nested accordion opening).
- The expand chevron rotates 90° (`transition-transform duration-200 ease-out`) in lockstep with the expansion duration.

---

## 6. Styling & Visual Variants

### 6.1 Variants via CVA (`collapse.variants.ts`)

| Variant | Container Classes | Panel Classes | Header Classes | Content Classes |
| :--- | :--- | :--- | :--- | :--- |
| **`bordered`** | `border border-base-200 rounded-lg divide-y divide-base-200 bg-base-100` | `border-0` | `hover:bg-base-200/50 transition-colors` | `border-t border-base-200 bg-base-50/30` |
| **`frameless`** | `divide-y divide-base-200 bg-transparent border-0` | `border-0` | `hover:bg-base-200/30 transition-colors` | `border-t border-base-200` |
| **`ghost`** | `space-y-1 bg-transparent border-0` | `rounded-lg hover:bg-base-200/30 transition-colors` | `hover:bg-transparent` | `border-0` |

### 6.2 Icon Position
- `'left'`: Chevron on left, title in middle, extra on right.
- `'right'`: Title on left, extra in middle-right, chevron on right.

---

## 7. Usage Examples

### 7.1 Accordion Mode (Single-Panel Expansion)
```html
<ui-collapse [accordion]="true" [(activeIds)]="selectedPanelId">
  <ui-collapse-panel [id]="'p1'" header="Personal Details">
    <p>Personal information form content...</p>
  </ui-collapse-panel>
  <ui-collapse-panel [id]="'p2'" header="Billing Address">
    <p>Billing address content...</p>
  </ui-collapse-panel>
</ui-collapse>
```

### 7.2 Custom Slots & Extra Action
```html
<ui-collapse variant="bordered">
  <ui-collapse-panel [id]="'custom'">
    <ng-template uiCollapseHeader>
      <div class="flex items-center gap-2">
        <svg-icon key="heroicons_outline:shield-check" class="size-5 text-success" />
        <span class="font-medium">Security Settings</span>
      </div>
    </ng-template>

    <ng-template uiCollapseExtra>
      <button class="btn btn-xs btn-outline" (click)="onConfigureSecurity()">Configure</button>
    </ng-template>

    <ng-template uiCollapseContent>
      <!-- Lazy rendered content -->
      <app-heavy-security-settings />
    </ng-template>
  </ui-collapse-panel>
</ui-collapse>
```

### 7.3 Nested Panels
```html
<ui-collapse [accordion]="false" variant="bordered">
  <ui-collapse-panel header="Outer Panel 1">
    <ui-collapse [accordion]="true" variant="ghost">
      <ui-collapse-panel header="Inner Panel 1.1">
        <p>Nested content</p>
      </ui-collapse-panel>
      <ui-collapse-panel header="Inner Panel 1.2">
        <p>Nested content</p>
      </ui-collapse-panel>
    </ui-collapse>
  </ui-collapse-panel>
</ui-collapse>
```

---

## 8. Testing & Verification Plan

### Test Suite (`collapse.spec.ts`)
1. **Expansion State & Two-Way Binding**:
   - Verify panel expansion updates `[(expanded)]`.
   - Verify container `[(activeIds)]` syncs bidirectionally in both multi and accordion modes.
   - Verify accordion mode enforces mutual exclusivity (opening panel B closes panel A).
2. **Accessibility**:
   - Verify `aria-expanded`, `aria-controls`, `aria-labelledby`, and `role="region"` attributes match panel IDs.
   - Verify `inert` attribute is applied on collapsed content panels.
   - Verify keyboard navigation (`ArrowDown`, `ArrowUp`, `Home`, `End`) cycles focus across triggers.
3. **Template Slots & Event Isolation**:
   - Verify clicking inside `*uiCollapseExtra` does not trigger panel toggle.
   - Verify `*uiCollapseContent` is only rendered into the DOM once expanded.
4. **Variants & Icon Placement**:
   - Verify class outputs for `bordered`, `frameless`, and `ghost`.
   - Verify chevron order for `left` and `right` positions.
