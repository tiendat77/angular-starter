import { NgTemplateOutlet } from '@angular/common';
import {
  afterNextRender,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  contentChildren,
  DestroyRef,
  effect,
  ElementRef,
  forwardRef,
  inject,
  input,
  model,
  numberAttribute,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { translate, UiCarouselSlide } from './carousel-slide.component';
import {
  UiCarouselDot,
  UiCarouselNextIcon,
  UiCarouselPrevIcon,
} from './carousel-templates.directive';
import { UiCarouselContext } from './carousel.context';
import {
  UI_CAROUSEL_DEFAULT_LABELS,
  UiCarouselChange,
  UiCarouselDotPosition,
  UiCarouselEffect,
  UiCarouselLabels,
} from './carousel.types';
import {
  DRAG_START_DISTANCE,
  neighbourIndex,
  normalizeIndex,
  swipeChangesSlide,
} from './carousel.utils';

interface Drag {
  pointerId: number;
  start: number;
  last: number;
  lastTime: number;
  velocity: number;
  delta: number;
  moved: boolean;
  /** The slide the drag moves towards, and the side it comes from. */
  neighbour: number | null;
  side: 1 | -1;
}

/**
 * A carousel (slide show): put `ui-carousel-slide`s inside it. Slide with the arrows, the dots, the
 * keyboard (arrow keys) or a swipe; `activeIndex` is two-way bindable.
 *
 * Follows the WAI-ARIA carousel pattern: a labelled region of slides that name themselves ("2 of
 * 5"), an automatic slide show that can be stopped (and pauses on hover and focus), and slides that
 * are not on show are hidden from assistive technology and cannot take focus.
 */
@Component({
  selector: 'ui-carousel',
  exportAs: 'uiCarousel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet],
  providers: [{ provide: UiCarouselContext, useExisting: forwardRef(() => UiCarousel) }],
  host: {
    class: 'carousel-root',
    role: 'region',
    'aria-roledescription': 'carousel',
    '[attr.aria-label]': 'ariaLabel() ?? $labels().carousel',
    '[attr.data-dots]': 'dotPosition()',
    '[attr.data-effect]': 'effect()',
    '[attr.data-vertical]': 'vertical() ? "" : null',
    '[attr.data-swipe]': 'enableSwipe() ? "" : null',
    '[attr.data-dragging]': '_dragging() ? "" : null',
    '(keydown)': 'onKeydown($event)',
    '(mouseenter)': '_hovered.set(true)',
    '(mouseleave)': '_hovered.set(false)',
    '(focusin)': '_focusWithin.set(true)',
    '(focusout)': 'onFocusOut($event)',
  },
  templateUrl: './carousel.component.html',
})
export class UiCarousel extends UiCarouselContext {
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _host = inject<ElementRef<HTMLElement>>(ElementRef);

  /** The slide on show, 0-based; two-way (`[(activeIndex)]`). An index out of range is shown kept in range. */
  readonly activeIndex = model(0);
  /** `scrollx`: slides move; `fade`: slides cross-fade. */
  readonly effect = input<UiCarouselEffect>('scrollx');
  /** Changes the slide by itself every `autoPlaySpeed`. */
  readonly autoPlay = input(false, { transform: booleanAttribute });
  /** Milliseconds a slide stays on show while `autoPlay` runs. */
  readonly autoPlaySpeed = input(3000, { transform: (v: unknown) => numberAttribute(v, 3000) });
  /** Pauses `autoPlay` while the pointer is over the carousel or focus is inside it. */
  readonly pauseOnHover = input(true, { transform: booleanAttribute });
  readonly dots = input(true, { transform: booleanAttribute });
  /** Where the dots sit; `left` and `right` make the slides move vertically. */
  readonly dotPosition = input<UiCarouselDotPosition>('bottom');
  /** Previous / next buttons. */
  readonly arrows = input(true, { transform: booleanAttribute });
  /** The last slide is followed by the first one (and the reverse). */
  readonly loop = input(true, { transform: booleanAttribute });
  /** Drag (touch, mouse, pen) to change the slide. */
  readonly enableSwipe = input(true, { transform: booleanAttribute });
  /** Milliseconds a change of slide takes. */
  readonly speed = input(500, { transform: (v: unknown) => numberAttribute(v, 500) });
  /** Name of the carousel. */
  readonly ariaLabel = input<string>();
  /** Overrides for the built-in English texts. */
  readonly labels = input<Partial<UiCarouselLabels>>({});

  /** A change of slide starts. */
  readonly beforeChange = output<UiCarouselChange>();
  /** A change of slide is over (its animation ran to the end). */
  readonly afterChange = output<UiCarouselChange>();

  private readonly _slides = contentChildren(UiCarouselSlide, { descendants: true });
  private readonly _dotTemplate = contentChild(UiCarouselDot);
  private readonly _prevIcon = contentChild(UiCarouselPrevIcon);
  private readonly _nextIcon = contentChild(UiCarouselNextIcon);
  private readonly _viewport = viewChild.required<ElementRef<HTMLElement>>('viewport');

  protected readonly _hovered = signal(false);
  protected readonly _focusWithin = signal(false);
  protected readonly _dragging = signal(false);
  private readonly _transiting = signal(false);
  /** `null`: no choice made, the slide show follows the user's reduced-motion setting. */
  private readonly _userPaused = signal<boolean | null>(null);
  private readonly _reducedMotion = signal(false);

  private _shown: number | null = null;
  private _pendingDirection: 1 | -1 | null = null;
  private _pendingOffset = 0;
  private _token = 0;
  private _drag: Drag | null = null;
  private _suppressClick = false;

  // UiCarouselContext ---------------------------------------------------------------------------

  override readonly slides = this._slides;
  override readonly count = computed(() => this._slides().length);
  override readonly current = computed(() => normalizeIndex(this.activeIndex(), this.count()));
  override readonly vertical = computed(
    () => this.dotPosition() === 'left' || this.dotPosition() === 'right'
  );
  override readonly resolvedLabels = computed<UiCarouselLabels>(() => ({
    ...UI_CAROUSEL_DEFAULT_LABELS,
    ...this.labels(),
  }));
  protected readonly $labels = this.resolvedLabels;

  protected readonly _manuallyPaused = computed(() => this._userPaused() ?? this._reducedMotion());
  private readonly _paused = computed(
    () =>
      this._manuallyPaused() ||
      (this.pauseOnHover() && (this._hovered() || this._focusWithin())) ||
      this._dragging()
  );
  /** The slide show is changing slides by itself right now. */
  protected readonly _rotating = computed(
    () => this.autoPlay() && this.count() > 1 && !this._paused()
  );
  protected readonly _showRotateControl = computed(() => this.autoPlay() && this.count() > 1);

  protected readonly _dotIndexes = computed(() =>
    Array.from({ length: this.count() }, (_, index) => index)
  );
  protected readonly _atStart = computed(() => !this.loop() && this.current() === 0);
  protected readonly _atEnd = computed(() => !this.loop() && this.current() >= this.count() - 1);
  protected readonly _customDot = computed(() => this._dotTemplate()?.template ?? null);
  protected readonly _customPrev = computed(() => this._prevIcon()?.template ?? null);
  protected readonly _customNext = computed(() => this._nextIcon()?.template ?? null);

  constructor() {
    super();

    // A change of `activeIndex` (an arrow, a dot, a swipe, or the app) is a change of slide
    effect(() => {
      const to = this.current();
      const count = this.count();
      untracked(() => this._sync(to, count));
    });

    // The automatic slide show: one timer for the slide on show, restarted by every change
    effect((onCleanup) => {
      this.current();
      if (!this._rotating()) {
        return;
      }
      const speed = Math.max(0, this.autoPlaySpeed());
      let timer: ReturnType<typeof setTimeout>;
      const tick = (): void => {
        if (this._transiting()) {
          timer = setTimeout(tick, 100);
          return;
        }
        this.next();
      };
      timer = setTimeout(tick, speed);
      onCleanup(() => clearTimeout(timer));
    });

    afterNextRender(() => {
      const query =
        typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : null;
      if (query) {
        this._reducedMotion.set(query.matches);
        const onChange = (event: MediaQueryListEvent): void =>
          this._reducedMotion.set(event.matches);
        query.addEventListener('change', onChange);
        this._destroyRef.onDestroy(() => query.removeEventListener('change', onChange));
      }

      // A click that ends a drag must not reach the content of the slide (a link, a button)
      const viewport = this._viewport().nativeElement;
      const stopClick = (event: Event): void => {
        if (this._suppressClick) {
          event.stopPropagation();
          event.preventDefault();
        }
      };
      viewport.addEventListener('click', stopClick, true);
      this._destroyRef.onDestroy(() => viewport.removeEventListener('click', stopClick, true));
    });
  }

  // Navigation ----------------------------------------------------------------------------------

  /** Shows the next slide (the first one after the last, with a loop). */
  next(): void {
    this._step(1);
  }

  /** Shows the previous slide (the last one before the first, with a loop). */
  prev(): void {
    this._step(-1);
  }

  /** Shows a slide by its index (0-based). */
  goTo(index: number): void {
    if (this.count() < 2 || this._transiting()) {
      return;
    }
    const target = normalizeIndex(index, this.count());
    if (target === this.current()) {
      return;
    }
    this._pendingDirection = target > this.current() ? 1 : -1;
    this.activeIndex.set(target);
  }

  private _step(direction: 1 | -1): void {
    if (this._transiting()) {
      return;
    }
    const target = neighbourIndex(this.current(), direction, this.count(), this.loop());
    if (target === null) {
      return;
    }
    this._pendingDirection = direction;
    this.activeIndex.set(target);
  }

  protected toggleRotation(): void {
    this._userPaused.set(!this._manuallyPaused());
  }

  // Keyboard and focus --------------------------------------------------------------------------

  protected onKeydown(event: KeyboardEvent): void {
    if (event.altKey || event.ctrlKey || event.metaKey || event.defaultPrevented) {
      return;
    }
    if (
      (event.target as HTMLElement).closest('input, textarea, select, [contenteditable="true"]')
    ) {
      return;
    }
    switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowUp':
        this.prev();
        break;
      case 'ArrowRight':
      case 'ArrowDown':
        this.next();
        break;
      case 'Home':
        this.goTo(0);
        break;
      case 'End':
        this.goTo(this.count() - 1);
        break;
      default:
        return;
    }
    event.preventDefault();
  }

  protected onFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget as Node | null;
    if (!next || !this._host.nativeElement.contains(next)) {
      this._focusWithin.set(false);
    }
  }

  // A change of slide ---------------------------------------------------------------------------

  private _sync(to: number, count: number): void {
    if (this._shown === null) {
      this._shown = to;
      return;
    }
    const from = this._shown;
    if (from === to || count < 2) {
      this._shown = to;
      return;
    }
    this._shown = to;

    const direction = this._pendingDirection ?? (to > from ? 1 : -1);
    const offset = this._pendingOffset;
    this._pendingDirection = null;
    this._pendingOffset = 0;

    this.beforeChange.emit({ from, to });
    const slides = this._slides();
    const outgoing = slides[from];
    const incoming = slides[to];
    if (!outgoing || !incoming) {
      this.afterChange.emit({ from, to });
      return;
    }
    this._transition(outgoing, incoming, direction, offset, () =>
      this.afterChange.emit({ from, to })
    );
  }

  /** Slides the two slides of a change (or cross-fades them); `done` runs when they arrive. */
  private _transition(
    outgoing: UiCarouselSlide,
    incoming: UiCarouselSlide,
    direction: 1 | -1,
    offset: number,
    done: () => void
  ): void {
    const token = ++this._token;
    this._transiting.set(true);
    for (const slide of this._slides()) {
      slide.cancelAnimation();
    }

    const duration = this._reducedMotion() ? 0 : Math.max(0, this.speed());
    const vertical = this.vertical();
    const frames =
      this.effect() === 'fade'
        ? {
            out: [{ opacity: 1 }, { opacity: 0 }],
            in: [{ opacity: 0 }, { opacity: 1 }],
          }
        : {
            out: [
              { transform: translate(vertical, `${offset}px`) },
              { transform: translate(vertical, `${-direction * 100}%`) },
            ],
            in: [
              { transform: translate(vertical, `calc(${direction * 100}% + ${offset}px)`) },
              { transform: translate(vertical, '0px') },
            ],
          };

    Promise.all([
      outgoing.animate(frames.out, duration),
      incoming.animate(frames.in, duration),
    ]).then(() => {
      // A newer change took over: it reports for itself
      if (token !== this._token) {
        return;
      }
      this._transiting.set(false);
      done();
    });
  }

  // Swipe ---------------------------------------------------------------------------------------

  protected onPointerDown(event: PointerEvent): void {
    if (
      !this.enableSwipe() ||
      this.count() < 2 ||
      this._transiting() ||
      event.button !== 0 ||
      event.isPrimary === false ||
      (event.target as HTMLElement).closest('input, textarea, select, [contenteditable="true"]')
    ) {
      return;
    }
    const position = this._coordinate(event);
    this._drag = {
      pointerId: event.pointerId,
      start: position,
      last: position,
      lastTime: event.timeStamp,
      velocity: 0,
      delta: 0,
      moved: false,
      neighbour: null,
      side: 1,
    };
  }

  protected onPointerMove(event: PointerEvent): void {
    const drag = this._drag;
    if (!drag || drag.pointerId !== event.pointerId) {
      return;
    }
    const position = this._coordinate(event);
    const delta = position - drag.start;
    if (!drag.moved) {
      if (Math.abs(delta) < DRAG_START_DISTANCE) {
        return;
      }
      drag.moved = true;
      this._dragging.set(true);
      // Only now: capturing at the press would send the click of a link or a button to the viewport
      this._viewport().nativeElement.setPointerCapture?.(event.pointerId);
    }

    const elapsed = event.timeStamp - drag.lastTime;
    if (elapsed > 0) {
      drag.velocity = (position - drag.last) / elapsed;
    }
    drag.last = position;
    drag.lastTime = event.timeStamp;
    drag.delta = delta;

    const side: 1 | -1 = delta < 0 ? 1 : -1;
    if (side !== drag.side || drag.neighbour === null) {
      this._clearDragStyles(drag);
      drag.side = side;
      drag.neighbour = neighbourIndex(this.current(), side, this.count(), this.loop());
    }
    if (this.effect() === 'fade') {
      return;
    }
    // Past the first or last slide of a carousel without a loop the slide gives way grudgingly
    const shown = drag.neighbour === null ? delta * 0.3 : delta;
    this._slides()[this.current()]?.dragOffset.set(shown);
    const neighbour = drag.neighbour === null ? undefined : this._slides()[drag.neighbour];
    neighbour?.dragSide.set(side);
    neighbour?.dragOffset.set(shown);
  }

  protected onPointerEnd(event: PointerEvent): void {
    const drag = this._drag;
    if (!drag || drag.pointerId !== event.pointerId) {
      return;
    }
    this._drag = null;
    if (!drag.moved) {
      return;
    }
    this._viewport().nativeElement.releasePointerCapture?.(event.pointerId);
    this._dragging.set(false);
    // The click that follows a drag is not a click on the content
    this._suppressClick = true;
    setTimeout(() => (this._suppressClick = false));

    const viewport = this._viewport().nativeElement;
    const size = this.vertical() ? viewport.clientHeight : viewport.clientWidth;
    const sameWay = Math.sign(drag.velocity) === Math.sign(drag.delta) || drag.velocity === 0;
    const commit =
      event.type !== 'pointercancel' &&
      drag.neighbour !== null &&
      swipeChangesSlide(drag.delta, size, sameWay ? drag.velocity : 0);

    if (commit && drag.neighbour !== null) {
      const offset = this.effect() === 'fade' ? 0 : drag.delta;
      this._clearDragStyles(drag);
      this._pendingDirection = drag.side;
      this._pendingOffset = offset;
      this.activeIndex.set(drag.neighbour);
    } else {
      this._snapBack(drag);
    }
  }

  /** The drag did not go far enough: both slides glide back to where they were. */
  private _snapBack(drag: Drag): void {
    const current = this._slides()[this.current()];
    const neighbour = drag.neighbour === null ? undefined : this._slides()[drag.neighbour];
    this._clearDragStyles(drag);
    if (this.effect() === 'fade' || !current) {
      return;
    }
    const shown = drag.neighbour === null ? drag.delta * 0.3 : drag.delta;
    const vertical = this.vertical();
    const duration = this._reducedMotion() ? 0 : Math.max(0, this.speed());
    const token = ++this._token;
    this._transiting.set(true);
    const animations = [
      current.animate(
        [
          { transform: translate(vertical, `${shown}px`) },
          { transform: translate(vertical, '0px') },
        ],
        duration
      ),
    ];
    if (neighbour) {
      animations.push(
        neighbour.animate(
          [
            { transform: translate(vertical, `calc(${drag.side * 100}% + ${shown}px)`) },
            { transform: translate(vertical, `${drag.side * 100}%`) },
          ],
          duration
        )
      );
    }
    Promise.all(animations).then(() => {
      if (token === this._token) {
        this._transiting.set(false);
      }
    });
  }

  private _clearDragStyles(drag: Drag): void {
    this._slides()[this.current()]?.dragOffset.set(null);
    if (drag.neighbour !== null) {
      const neighbour = this._slides()[drag.neighbour];
      neighbour?.dragOffset.set(null);
      neighbour?.dragSide.set(null);
    }
  }

  private _coordinate(event: PointerEvent): number {
    return this.vertical() ? event.clientY : event.clientX;
  }
}
