import { FocusTrap, FocusTrapFactory, InteractivityChecker } from '@angular/cdk/a11y';
import {
  BasePortalOutlet,
  CdkPortalOutlet,
  ComponentPortal,
  DomPortal,
  TemplatePortal,
} from '@angular/cdk/portal';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ComponentRef,
  ElementRef,
  EmbeddedViewRef,
  Injector,
  NgZone,
  OnDestroy,
  ViewChild,
  afterNextRender,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Subject } from 'rxjs';
import { UiBottomSheetConfig } from './bottom-sheet-config';
import { resolveDragEnd, snapPointsToPixels } from './bottom-sheet-snap';

/**
 * Fallback so `exit()` can never hang forever waiting for a real `transitionend` that, for
 * whatever reason (a browser quirk, `prefers-reduced-motion` collapsing the transition to a
 * near-zero duration in a way that races the event, the element being removed from the DOM by
 * something else first, etc.), never fires. The real CSS transition is 300ms; 400ms gives a
 * comfortable margin without meaningfully delaying dismissal in the case this guards against.
 * Cleared immediately whenever the real `transitionend` fires first (the happy path), so it
 * never actually elapses during a normal, successful exit.
 */
const EXIT_FALLBACK_MS = 400;

@Component({
  selector: 'ui-bottom-sheet-container',
  templateUrl: './bottom-sheet-container.component.html',
  imports: [CdkPortalOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'bottom-sheet-overlay-pane',
  },
})
export class BottomSheetContainerComponent
  extends BasePortalOutlet
  implements AfterViewInit, OnDestroy
{
  private readonly _ngZone = inject(NgZone);
  private readonly _focusTrapFactory = inject(FocusTrapFactory);
  private readonly _interactivityChecker = inject(InteractivityChecker);
  private readonly _injector = inject(Injector);
  readonly config = inject(UiBottomSheetConfig);

  @ViewChild(CdkPortalOutlet, { static: true }) private _portalOutlet!: CdkPortalOutlet;
  @ViewChild('panel', { static: true }) readonly panelRef!: ElementRef<HTMLElement>;
  @ViewChild('handle') readonly handleRef?: ElementRef<HTMLElement>;
  @ViewChild('body', { static: true }) readonly bodyRef!: ElementRef<HTMLElement>;

  private _focusTrap: FocusTrap | null = null;
  private _destroyed = false;
  /** True once `exit()` has been called - guards against re-entering enter()/exit() and against
   *  a still-pending, deferred `enter()` sequence flipping `visible` back on after dismissal. */
  private _dismissed = false;
  /** True once `enter()` has been called - guards against calling it twice (e.g. a stale
   *  replacement-path subscription firing after the sheet already entered through another path). */
  private _enterStarted = false;
  private _hasEmittedEnter = false;
  private _hasEmittedExit = false;
  private _exitFallbackTimerId: ReturnType<typeof setTimeout> | null = null;
  private _previouslyFocusedElement: HTMLElement | null = null;
  private readonly _resizeListener = () => this._viewportHeightPx.set(window.innerHeight);

  private readonly _viewportHeightPx = signal(window.innerHeight);
  readonly visible = signal(false);
  readonly dragging = signal(false);
  readonly snapIndex = signal(this._clampIndex(this.config.initialSnapIndex));

  readonly snapPixels = computed(() =>
    snapPointsToPixels(this.config.snapPoints, this._viewportHeightPx())
  );
  readonly panelHeightPx = computed(() => Math.max(0, ...this.snapPixels()));

  /** The panel's resting translateY for the current snap index - i.e. where it sits once fully
   *  visible. Does NOT by itself account for whether the sheet is actually open. */
  readonly restingTranslateYPx = computed(
    () => this.panelHeightPx() - (this.snapPixels()[this.snapIndex()] ?? 0)
  );

  /**
   * The panel's actual rendered translateY. This is the crux of the Critical lifecycle fix:
   * it depends on `visible()`, not just `snapIndex()`. While hidden, the panel sits fully
   * off-screen at `panelHeightPx()` regardless of snapIndex; only once `visible()` is true does
   * it move to `restingTranslateYPx()`. Without this, `enter()`/`exit()` toggling `visible()`
   * would never change the rendered transform value at all, so the browser would never have
   * anything to transition and `transitionend` would never fire - which is exactly why every
   * dismissal used to hang forever outside of unit tests that bypass this and call
   * `onPanelTransitionEnd()`/`completeTransition()` directly.
   */
  readonly translateYPx = computed(() =>
    this.visible() ? this.restingTranslateYPx() : this.panelHeightPx()
  );
  readonly panelTransform = computed(() => `translateY(${this.translateYPx()}px)`);

  readonly _onExit = new Subject<void>();
  readonly _onEnter = new Subject<void>();
  /** Fired by the pointer-drag gesture when a drag resolves to "dismiss". */
  readonly _dismissRequested = new Subject<void>();

  private _activeDrag: {
    origin: 'handle' | 'body';
    claimed: boolean;
    startClientY: number;
    startTranslateY: number;
    lastClientY: number;
    lastTimestamp: number;
    velocityPxPerMs: number;
  } | null = null;
  private _activePointerId: number | null = null;
  /** Detaches the window pointer listeners of an in-flight drag. */
  private _removeDragListeners: (() => void) | null = null;

  constructor() {
    super();
    window.addEventListener('resize', this._resizeListener);
  }

  ngAfterViewInit(): void {
    this._ensureFocusTrap();
  }

  ngOnDestroy(): void {
    this._destroyed = true;
    this._clearExitFallbackTimer();
    window.removeEventListener('resize', this._resizeListener);
    this._removeDragListeners?.();
    this._focusTrap?.destroy();
    if (this.config.restoreFocus && this._previouslyFocusedElement) {
      this._previouslyFocusedElement.focus();
    }
  }

  attachComponentPortal<T>(portal: ComponentPortal<T>): ComponentRef<T> {
    return this._portalOutlet.attachComponentPortal(portal);
  }

  attachTemplatePortal<C>(portal: TemplatePortal<C>): EmbeddedViewRef<C> {
    return this._portalOutlet.attachTemplatePortal(portal);
  }

  override attachDomPortal = (portal: DomPortal) => this._portalOutlet.attachDomPortal(portal);

  private _ensureFocusTrap(): FocusTrap {
    if (!this._focusTrap) {
      this._focusTrap = this._focusTrapFactory.create(this.panelRef.nativeElement);
    }
    return this._focusTrap;
  }

  /**
   * Focuses the sheet's initial element on open (see the I6 finding).
   *
   * CDK's own `FocusTrap.focusInitialElement()` looks for a `[cdkFocusInitial]` marker
   * anywhere in the trap region and, failing that, falls back to the first tabbable element in
   * the WHOLE region - which here is the whole panel, including the drag handle. The handle is
   * deliberately tabbable (it's a keyboard-operable WAI-ARIA slider per the spec), so that
   * default fallback would land initial focus on it instead of the opened content whenever the
   * content has no `[cdkFocusInitial]` marker of its own.
   *
   * This replicates CDK's marker-based behavior exactly (delegating to
   * `focusTrap.focusInitialElement()` so a consumer-supplied `[cdkFocusInitial]` anywhere in
   * their content is honored, including CDK's own "not focusable itself -> first tabbable
   * descendant" handling for it) but, when no marker exists, scopes the "first tabbable
   * element" fallback to the body wrapper only - never the handle.
   */
  private _focusInitialElement(focusTrap: FocusTrap): boolean {
    const marker = this.panelRef.nativeElement.querySelector<HTMLElement>(
      '[cdkFocusInitial], [cdk-focus-initial]'
    );
    if (marker) {
      return focusTrap.focusInitialElement();
    }
    const firstTabbable = this._firstTabbableElement(this.bodyRef.nativeElement);
    if (firstTabbable) {
      firstTabbable.focus();
      return true;
    }
    return false;
  }

  /** Depth-first search for the first focusable + tabbable element within `root` (inclusive),
   *  mirroring CDK's own (private) tabbable-descendant walk. */
  private _firstTabbableElement(root: HTMLElement): HTMLElement | null {
    if (
      this._interactivityChecker.isFocusable(root) &&
      this._interactivityChecker.isTabbable(root)
    ) {
      return root;
    }
    for (const child of Array.from(root.children)) {
      if (child.nodeType === Node.ELEMENT_NODE) {
        const tabbable = this._firstTabbableElement(child as HTMLElement);
        if (tabbable) return tabbable;
      }
    }
    return null;
  }

  /**
   * Starts the enter transition and moves focus into the trapped content.
   *
   * The overlay attaches this container and calls `enter()` synchronously, right after
   * `overlayRef.attach()` - before Angular has necessarily run change detection on the
   * newly-created view even once. That means, at the moment this is called: (a) the
   * hidden-position `[style.transform]` binding may not be committed to the DOM yet, and (b)
   * `ngAfterViewInit` (which creates the focus trap) may not have run yet either, so
   * `focusInitialElement()` would silently find nothing and fall through to the panel
   * fallback (see the I1 finding). Deferring via `afterNextRender` guarantees a render has
   * actually happened before we touch either. A further animation-frame hop (`requestAnimationFrame`,
   * with a `setTimeout` fallback where rAF isn't available) then guarantees the hidden state
   * has been painted as its own frame before we flip to visible - otherwise the browser can
   * coalesce "hidden" and "visible" into a single paint with nothing to transition from, and
   * `transitionend` would never fire for the entering transform change either.
   */
  enter(): void {
    if (this._destroyed || this._dismissed || this._enterStarted) return;
    this._enterStarted = true;
    this._previouslyFocusedElement = document.activeElement as HTMLElement | null;

    afterNextRender(
      () => {
        if (this._destroyed || this._dismissed) return;
        this._requestAnimationFrame(() => {
          if (this._destroyed || this._dismissed) return;
          this._ngZone.run(() => {
            const focusTrap = this._ensureFocusTrap();
            this.visible.set(true);
            const focused = this._focusInitialElement(focusTrap);
            if (!focused) {
              this.panelRef.nativeElement.focus();
            }
          });
        });
      },
      { injector: this._injector }
    );
  }

  /**
   * Starts the exit transition. Consumers wait on `_onExit`, which normally fires from
   * `onPanelTransitionEnd()` once the real CSS transition completes, backstopped by a fallback
   * timer (see `EXIT_FALLBACK_MS`).
   *
   * If the sheet never actually became visible (its `enter()` sequence never ran, or was still
   * pending when `exit()` was called - see the I3 finding: a rapid replace-then-replace-again
   * can dismiss a sheet before its deferred `enter()` ever flips `visible` to true), there is no
   * committed "visible" transform to transition away from, so `_onExit` resolves immediately
   * instead of waiting on a transition that will never happen.
   */
  exit(): void {
    if (this._dismissed) return;
    this._dismissed = true;

    if (!this.visible()) {
      this._finishExit();
      return;
    }

    this.visible.set(false);
    this._exitFallbackTimerId = setTimeout(() => {
      this._ngZone.run(() => this._finishExit());
    }, EXIT_FALLBACK_MS);
  }

  /** Animates to a snap index, clamped to the configured snapPoints range. */
  snapTo(index: number): void {
    this.snapIndex.set(this._clampIndex(index));
  }

  onHandleKeydown(event: KeyboardEvent): void {
    if (this.config.disableDrag) return;
    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        this.snapTo(this.snapIndex() + 1);
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.snapTo(this.snapIndex() - 1);
        break;
      case 'Home':
        event.preventDefault();
        this.snapTo(0);
        break;
      case 'End':
        event.preventDefault();
        this.snapTo(this.snapPixels().length - 1);
        break;
    }
  }

  onHandlePointerDown(event: PointerEvent): void {
    if (this.config.disableDrag) return;
    this._beginDrag(event.pointerId, event.clientY, 'handle');
  }

  onBodyPointerDown(event: PointerEvent): void {
    if (this.config.disableDrag) return;
    this._beginDrag(event.pointerId, event.clientY, 'body');
  }

  private _beginDrag(pointerId: number, clientY: number, origin: 'handle' | 'body'): void {
    this._activePointerId = pointerId;
    this._processDragStart(clientY, origin);

    this._ngZone.runOutsideAngular(() => {
      const cleanup = () => {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('pointercancel', onCancel);
        this._removeDragListeners = null;
      };
      // Starting a new gesture while one is still tracked must not stack listeners
      this._removeDragListeners?.();
      this._removeDragListeners = cleanup;
      const onMove = (moveEvent: PointerEvent) => {
        if (moveEvent.pointerId !== this._activePointerId) return;
        if (this._processDragMove(moveEvent.clientY, moveEvent.timeStamp)) {
          moveEvent.preventDefault();
        }
      };
      const onUp = (upEvent: PointerEvent) => {
        if (upEvent.pointerId !== this._activePointerId) return;
        cleanup();
        this._ngZone.run(() => this._processDragEnd(upEvent.clientY));
      };
      const onCancel = (cancelEvent: PointerEvent) => {
        if (cancelEvent.pointerId !== this._activePointerId) return;
        cleanup();
        this._ngZone.run(() => this._processDragCancel());
      };
      window.addEventListener('pointermove', onMove, { passive: false });
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointercancel', onCancel);
    });
  }

  /** @docs-private Core drag-start logic; takes plain values so it's testable without a PointerEvent. */
  _processDragStart(clientY: number, origin: 'handle' | 'body'): void {
    this._activeDrag = {
      origin,
      claimed: origin === 'handle',
      startClientY: clientY,
      startTranslateY: this.translateYPx(),
      lastClientY: clientY,
      lastTimestamp: 0,
      velocityPxPerMs: 0,
    };
    if (origin === 'handle') {
      this.dragging.set(true);
      // See the I5 finding: `.bottom-sheet-body` normally allows native vertical touch
      // panning (`touch-action: pan-y`) so content can scroll. Once a drag is actually moving
      // the sheet, switch it to `none` so a touch that started on the handle and crosses over
      // the body doesn't get intercepted by the browser's native pan; restored on release/cancel.
      this._setBodyTouchActionForDrag(true);
    }
  }

  /**
   * @docs-private Core drag-move logic; takes plain values so it's testable without a PointerEvent.
   * Returns whether the drag was claimed (and the panel transform written) on this call.
   */
  _processDragMove(clientY: number, timestamp: number): boolean {
    const drag = this._activeDrag;
    if (!drag) return false;

    if (!drag.claimed) {
      const deltaY = clientY - drag.startClientY;
      const draggingDown = deltaY > 0;
      const atMaxSnap = this.snapIndex() === this.snapPixels().length - 1;
      const scrolledToTop = this.bodyRef.nativeElement.scrollTop <= 0;
      const shouldClaim = (draggingDown && scrolledToTop) || (!draggingDown && !atMaxSnap);
      if (!shouldClaim) return false;

      drag.claimed = true;
      drag.startTranslateY = this.translateYPx();
      drag.startClientY = clientY;
      // This branch runs from inside the pointermove listener, which for real drags is
      // registered via ngZone.runOutsideAngular in _beginDrag. Force re-entry so the
      // `dragging` write triggers change detection (e.g. to apply the
      // .bottom-sheet-panel-dragging class) instead of silently waiting for the next
      // zone re-entry at drag-end. Safe to call when already in-zone (e.g. from tests
      // that call _processDragMove directly).
      this._ngZone.run(() => this.dragging.set(true));
      this._setBodyTouchActionForDrag(true);
    }

    const rawTranslateY = drag.startTranslateY + (clientY - drag.startClientY);
    const clampedTranslateY = this._applyResistance(rawTranslateY);

    const dt = timestamp - drag.lastTimestamp;
    if (dt > 0) {
      drag.velocityPxPerMs = (clientY - drag.lastClientY) / dt;
    }
    drag.lastClientY = clientY;
    drag.lastTimestamp = timestamp;

    this.panelRef.nativeElement.style.transform = `translateY(${clampedTranslateY}px)`;
    return true;
  }

  /** @docs-private Core drag-end logic; takes a plain value so it's testable without a PointerEvent. */
  _processDragEnd(clientY: number): void {
    const drag = this._activeDrag;
    this._activeDrag = null;
    this._activePointerId = null;
    if (!drag || !drag.claimed) return;

    this.dragging.set(false);
    this._setBodyTouchActionForDrag(false);

    const rawTranslateY = drag.startTranslateY + (clientY - drag.startClientY);
    const currentTranslateY = this._applyResistance(rawTranslateY);

    const result = resolveDragEnd({
      currentTranslateY,
      velocityPxPerMs: drag.velocityPxPerMs,
      snapPixels: this.snapPixels(),
      panelHeightPx: this.panelHeightPx(),
      disableClose: this.config.disableClose,
    });

    if ('dismiss' in result) {
      this._dismissRequested.next();
    } else {
      this.snapTo(result.index);
      // `_processDragMove` wrote `style.transform` imperatively, bypassing the
      // `[style.transform]="panelTransform()"` binding's dirty-check bookkeeping. If the
      // drag resolves back to the same snap index it started from, `panelTransform()`
      // recomputes to the value Angular already believes is applied, so the binding would
      // skip the DOM write and leave the stale mid-drag transform stuck in place. Force
      // the DOM back in sync explicitly, regardless of what Angular's binding thinks changed.
      this.panelRef.nativeElement.style.transform = this.panelTransform();
    }
  }

  /**
   * @docs-private Handles `pointercancel`: the gesture was interrupted (most commonly a touch
   * drag that the browser took over for native scrolling, or another system-level gesture
   * takeover) rather than intentionally released. Unlike `_processDragEnd`, this does NOT
   * resolve via `resolveDragEnd()` - the pointer's last position/velocity at a cancel doesn't
   * represent a deliberate release, so instead it reverts the panel to the snap point the drag
   * started from (see the I5 finding).
   */
  _processDragCancel(): void {
    const drag = this._activeDrag;
    this._activeDrag = null;
    this._activePointerId = null;
    if (!drag) return;

    this.dragging.set(false);
    if (drag.claimed) {
      this._setBodyTouchActionForDrag(false);
      // The drag never committed a new snapIndex (only _processDragEnd does that), so
      // panelTransform() already reflects the snap point the drag started from - just force
      // the DOM back in sync with it, the same way _processDragEnd does for the "settled back
      // at the starting index" case.
      this.panelRef.nativeElement.style.transform = this.panelTransform();
    }
  }

  private _setBodyTouchActionForDrag(dragging: boolean): void {
    this.bodyRef.nativeElement.style.touchAction = dragging ? 'none' : '';
  }

  private _applyResistance(rawTranslateY: number): number {
    const min = 0;
    const max = this.panelHeightPx() + (this.snapPixels()[0] ?? 0);
    if (rawTranslateY < min) return min + (rawTranslateY - min) * 0.35;
    if (rawTranslateY > max) return max + (rawTranslateY - max) * 0.35;
    return rawTranslateY;
  }

  onPanelTransitionEnd(event: TransitionEvent): void {
    if (event.propertyName !== 'transform') return;
    // Transitions can bubble up from content rendered inside the panel (e.g. the opened
    // component animating something of its own); only react to the panel's own transform
    // transition ending, not a bubbled one from a descendant.
    if (event.target !== this.panelRef.nativeElement) return;
    this._ngZone.run(() => {
      if (this.visible()) {
        this._finishEnter();
      } else {
        this._finishExit();
      }
    });
  }

  /** Emits `_onEnter` (afterOpened()) exactly once, on the actual first entry, then completes
   *  the subject - matching how `_onExit` is a one-shot completion. Without this guard, every
   *  subsequent `transitionend` while visible (e.g. every snap settle from a drag or keyboard
   *  resize) would re-fire afterOpened() (see the I2 finding). */
  private _finishEnter(): void {
    if (this._hasEmittedEnter) return;
    this._hasEmittedEnter = true;
    this._onEnter.next();
    this._onEnter.complete();
  }

  private _finishExit(): void {
    if (this._hasEmittedExit) return;
    this._hasEmittedExit = true;
    this._clearExitFallbackTimer();
    this._onExit.next();
    this._onExit.complete();
  }

  private _clearExitFallbackTimer(): void {
    if (this._exitFallbackTimerId !== null) {
      clearTimeout(this._exitFallbackTimerId);
      this._exitFallbackTimerId = null;
    }
  }

  /** requestAnimationFrame isn't available in every environment this component may run in
   *  (e.g. this repo's jsdom-based unit test runner has no `window.requestAnimationFrame`), so
   *  fall back to a plain timeout at roughly one frame's worth of delay. */
  private _requestAnimationFrame(callback: () => void): void {
    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(callback);
    } else {
      setTimeout(callback, 16);
    }
  }

  private _clampIndex(index: number): number {
    const lastIndex = Math.max(0, this.config.snapPoints.length - 1);
    return Math.min(lastIndex, Math.max(0, index));
  }
}
