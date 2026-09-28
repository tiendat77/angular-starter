# Tooltip Component Design — `@libs/ui/tooltip`

_Status: approved, ready for implementation planning · 2026-09-27_  
_Roadmap: Phase 1 "Tooltip" (`docs/ui-roadmap-status.md` §4 and §6 step 3)_

---

## 1. Goal & Scope

Add an accessible, flexible floating tooltip component to `@libs/ui` at secondary entry point `@libs/ui/tooltip`:

| Component / Directive | Entry point | Selector(s) |
|---|---|---|
| Tooltip Directive | `@libs/ui/tooltip` | `[uiTooltip]` |
| Tooltip Host Component | `@libs/ui/tooltip` | `ui-tooltip` |

### Key Decisions
1. **CDK Overlay Foundation**: Leverages `@angular/cdk/overlay` (`FlexibleConnectedPositionStrategy`) to escape `overflow: hidden` containers, auto-reposition on viewport edges, and handle z-index layering cleanly.
2. **Content Flexibility**: Accepts both simple string labels (`uiTooltip="Save"`) and rich custom templates (`[uiTooltip]="myTemplate"`).
3. **WCAG 2.1 SC 1.4.13 Compliance**:
   - **Dismissible**: `Escape` key dismisses tooltip immediately without loss of focus.
   - **Hoverable**: Supports hovering into tooltip content (`uiTooltipInteractive="true"` or automatically when using `TemplateRef`) without disappearing.
   - **Persistent**: Remains visible until pointer/focus moves away or user dismisses.
4. **Visual Styling & Arrow**: Driven by `@utility tooltip` and `cva` over design tokens. Includes pointer arrow (`uiTooltipArrow="true"` by default) that automatically repositions on viewport flip. Supports semantic color variants (`neutral`, `primary`, `info`, `success`, `warning`, `error`) and sizes (`sm`, `md`).

---

## 2. Public API & Interfaces

### 2.1 Types (`libs/ui/tooltip/src/tooltip.types.ts`)

```ts
import { InjectionToken } from '@angular/core';
import { UiColor } from '@libs/ui/core';

export type UiTooltipPosition = 'top' | 'bottom' | 'left' | 'right';
export type UiTooltipSize = 'sm' | 'md';

export interface UiTooltipConfig {
  position?: UiTooltipPosition;
  color?: UiColor;
  size?: UiTooltipSize;
  arrow?: boolean;
  showDelay?: number;
  hideDelay?: number;
  touchGestures?: 'auto' | 'on' | 'off';
}

export const UI_TOOLTIP_CONFIG = new InjectionToken<UiTooltipConfig>('UI_TOOLTIP_CONFIG');
```

### 2.2 Directive API (`UiTooltipDirective`)

```ts
@Directive({
  selector: '[uiTooltip]',
  exportAs: 'uiTooltip',
  standalone: true,
})
export class UiTooltipDirective implements OnDestroy {
  /** The content to show: plain string or an ng-template reference. */
  @Input({ alias: 'uiTooltip' })
  content: string | TemplateRef<unknown> | null = null;

  /** Preferred placement relative to host element. Defaults to 'top'. */
  @Input({ alias: 'uiTooltipPosition' })
  position: UiTooltipPosition = 'top';

  /** Color variant: neutral (default dark pill), primary, info, success, warning, error. */
  @Input({ alias: 'uiTooltipColor' })
  color: UiColor = 'neutral';

  /** Size: sm | md (default 'md'). */
  @Input({ alias: 'uiTooltipSize' })
  size: UiTooltipSize = 'md';

  /** Whether to render a pointer arrow pointing to the host element. Defaults to true. */
  @Input({ alias: 'uiTooltipArrow' })
  arrow: boolean = true;

  /** Delay in milliseconds before showing the tooltip on hover. Defaults to 200ms. */
  @Input({ alias: 'uiTooltipDelay' })
  showDelay: number = 200;

  /** Delay in milliseconds before hiding the tooltip on mouseleave. Defaults to 0ms. */
  @Input({ alias: 'uiTooltipHideDelay' })
  hideDelay: number = 0;

  /** Disables showing the tooltip. */
  @Input({ alias: 'uiTooltipDisabled' })
  disabled: boolean = false;

  /**
   * When true, keeps tooltip visible when hovering over the tooltip content itself.
   * Defaults to true if content is a TemplateRef, false if string.
   */
  @Input({ alias: 'uiTooltipInteractive' })
  interactive?: boolean;

  /** Custom CSS classes to pass to the tooltip overlay panel. */
  @Input({ alias: 'uiTooltipClass' })
  panelClass: string = '';

  /** Emits when tooltip opens or closes. */
  @Output()
  readonly tooltipVisibleChange = new EventEmitter<boolean>();

  /** Programmatic control */
  show(delay?: number): void;
  hide(delay?: number): void;
  toggle(): void;
  readonly isOpen: boolean;
}
```

### 2.3 Host Component (`UiTooltipComponent`)

```ts
@Component({
  selector: 'ui-tooltip',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet],
  template: `
    <div
      [id]="id"
      role="tooltip"
      [class]="classes()"
      [attr.data-placement]="placement()"
    >
      @if (isTemplate(content)) {
        <ng-container *ngTemplateOutlet="content" />
      } @else {
        {{ content }}
      }
      @if (arrow) {
        <span class="tooltip-arrow" aria-hidden="true"></span>
      }
    </div>
  `,
})
export class UiTooltipComponent {
  id: string = '';
  content: string | TemplateRef<unknown> | null = null;
  color: UiColor = 'neutral';
  size: UiTooltipSize = 'md';
  arrow: boolean = true;
  interactive: boolean = false;
  placement = signal<UiTooltipPosition>('top');

  readonly classes = computed(() =>
    tooltipVariants({
      color: this.color,
      size: this.size,
      interactive: this.interactive,
    })
  );

  isTemplate(val: unknown): val is TemplateRef<unknown> {
    return val instanceof TemplateRef;
  }
}
```

---

## 3. Overlay Architecture & Positioning

### 3.1 Connected Positions & Fallback Presets

Default offset: `8px`.

| Position | Primary Origin $\rightarrow$ Overlay | Primary Fallback | Secondary Fallbacks |
|---|---|---|---|
| `top` | `{ originX: 'center', originY: 'top' }` $\rightarrow$ `{ overlayX: 'center', overlayY: 'bottom' }` (offsetY: -8) | `bottom` (offsetY: 8) | `top-start`, `top-end` |
| `bottom` | `{ originX: 'center', originY: 'bottom' }` $\rightarrow$ `{ overlayX: 'center', overlayY: 'top' }` (offsetY: 8) | `top` (offsetY: -8) | `bottom-start`, `bottom-end` |
| `left` | `{ originX: 'start', originY: 'center' }` $\rightarrow$ `{ overlayX: 'end', overlayY: 'center' }` (offsetX: -8) | `right` (offsetX: 8) | `left-start`, `left-end` |
| `right` | `{ originX: 'end', originY: 'center' }` $\rightarrow$ `{ overlayX: 'start', overlayY: 'center' }` (offsetX: 8) | `left` (offsetX: -8) | `right-start`, `right-end` |

The directive listens to `strategy.positionChanges` and maps the active connection back to `'top' | 'bottom' | 'left' | 'right'`, setting `componentRef.instance.placement.set(activePosition)` to keep the pointer arrow aligned with the actual placement.

### 3.2 Scroll Strategy & Viewport Boundary
- Uses `overlay.scrollStrategies.reposition({ scrollThrottle: 20 })`.
- Viewport margins of `8px` ensure tooltips never overflow the screen edge.

---

## 4. Trigger & A11y Mechanics

### 4.1 Event Listeners
- **Host Mouse Listeners**:
  - `mouseenter`: schedules `show()` with `showDelay` timer.
  - `mouseleave`: schedules `hide()` with `hideDelay` timer.
- **Host Focus Listeners**:
  - `focusin`: calls `show(0)` immediately (zero delay for keyboard users).
  - `focusout`: calls `hide(0)` immediately.
- **Escape Key**:
  - `keydown.escape`: if visible, closes immediately, cancels timers, stops event propagation.
- **Interactivity Handling**:
  - If `interactive` is resolved true, directive binds listeners on `overlayRef.overlayElement`:
    - `mouseenter` cancels pending hide timer.
    - `mouseleave` restarts `hideDelay` timer.

### 4.2 ARIA Attributes
- When visible and content is present:
  - Generates unique ID `ui-tooltip-${counter++}`.
  - Sets host `[attr.aria-describedby]="tooltipId"`.
  - Tooltip container gets `role="tooltip"` and `[id]="tooltipId"`.
- When hidden, destroyed, disabled, or empty content:
  - Host `aria-describedby` is removed (`null`).

---

## 5. Styling System

### 5.1 Stylesheet: `libs/ui/styles/components/tooltip.css`

Included in `libs/ui/styles/index.css`:

```css
@utility tooltip {
  position: relative;
  display: inline-flex;
  align-items: center;
  border-radius: var(--tooltip-radius, 0.375rem);
  padding: var(--tooltip-py, 0.25rem) var(--tooltip-px, 0.625rem);
  font-size: var(--tooltip-fs, 0.75rem);
  line-height: var(--tooltip-lh, 1rem);
  font-weight: 500;
  max-width: var(--tooltip-max-w, 20rem);
  word-break: break-word;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.15), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  background-color: var(--tooltip-bg, var(--color-foreground));
  color: var(--tooltip-color, var(--color-background));
  pointer-events: var(--tooltip-pointer, none);
  transition: opacity 120ms ease, transform 120ms ease;

  &.tooltip-interactive {
    --tooltip-pointer: auto;
  }
}

@utility tooltip-arrow {
  position: absolute;
  width: 0.5rem;
  height: 0.5rem;
  background-color: inherit;
  transform: rotate(45deg);
}

[data-placement^="top"] > .tooltip-arrow {
  bottom: -0.25rem;
  left: 50%;
  margin-left: -0.25rem;
}

[data-placement^="bottom"] > .tooltip-arrow {
  top: -0.25rem;
  left: 50%;
  margin-left: -0.25rem;
}

[data-placement^="left"] > .tooltip-arrow {
  right: -0.25rem;
  top: 50%;
  margin-top: -0.25rem;
}

[data-placement^="right"] > .tooltip-arrow {
  left: -0.25rem;
  top: 50%;
  margin-top: -0.25rem;
}
```

### 5.2 Variants (`libs/ui/tooltip/src/tooltip.variants.ts`)

```ts
import { cva } from 'class-variance-authority';

export const tooltipVariants = cva('tooltip', {
  variants: {
    color: {
      neutral: 'tooltip-neutral',
      primary: 'tooltip-primary',
      info: 'tooltip-info',
      success: 'tooltip-success',
      warning: 'tooltip-warning',
      error: 'tooltip-error',
    },
    size: {
      sm: 'tooltip-sm',
      md: 'tooltip-md',
    },
    interactive: {
      true: 'tooltip-interactive',
      false: '',
    },
  },
  defaultVariants: {
    color: 'neutral',
    size: 'md',
    interactive: false,
  },
});
```

---

## 6. Testing Strategy (`libs/ui/tooltip/src/tooltip.spec.ts`)

Unit tests with Vitest + Angular TestBed:
1. **Triggers & Delays**:
   - `mouseenter` shows tooltip after 200ms `showDelay`.
   - `mouseleave` hides tooltip after `hideDelay`.
   - `focusin` opens tooltip immediately without delay; `focusout` hides immediately.
   - `Escape` dismisses tooltip immediately.
2. **Content Rendering**:
   - Renders plain text string.
   - Renders `TemplateRef` with rich content and bindings.
   - Does not render or attach overlay when content is `null`, `undefined`, or `""`.
3. **Disabled & Toggle State**:
   - Does not open when `uiTooltipDisabled="true"`.
   - Programmatic `show()`, `hide()`, `toggle()` methods operate correctly.
4. **Accessibility (a11y)**:
   - Sets `aria-describedby` to the matching tooltip ID when open.
   - Clears `aria-describedby` when closed or destroyed.
   - Container has `role="tooltip"`.
5. **Interactive Behavior**:
   - Mouse moving into the tooltip box cancels hide timer when interactive.
   - Mouse leaving tooltip box resumes dismiss.
6. **Arrow & Position**:
   - Passes correct arrow and placement to component.
   - Updates placement on collision position change.

---

## 7. Documentation & Playground (`projects/docs`)

1. **Docs Page**: `projects/docs/src/app/features/tooltip-doc/`
   - Registered under `/tooltip` route.
   - Listed under "Overlays & Feedback" in `docs-sidebar.component.ts`.
2. **Interactive Playground**:
   - Text input for tooltip content.
   - Radio buttons for position (`top`, `bottom`, `left`, `right`).
   - Select dropdown for color (`neutral`, `primary`, etc.).
   - Radio for size (`sm`, `md`).
   - Toggles for arrow, disabled, and interactive.
   - Slider for `showDelay`.
3. **Examples**:
   - Basic text tooltip.
   - Positions & auto-flip showcase.
   - Semantic color variants.
   - Rich Template with keyboard shortcut badge (`<kbd>`).
4. **API Table**: Full reference of inputs, outputs, methods, and types.
