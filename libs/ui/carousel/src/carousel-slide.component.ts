import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  signal,
} from '@angular/core';
import { UiCarouselContext } from './carousel.context';
import { parkSide } from './carousel.utils';

/** How a slide moves: the easing of a change (a gentle stop). */
const EASING = 'cubic-bezier(0.22, 1, 0.36, 1)';

/**
 * One slide of a `ui-carousel`: it holds any content (an image, a card, a template).
 *
 * The slides of a carousel are stacked in one grid cell, so the carousel is as tall as its tallest
 * slide. A slide that is not on show waits just outside the carousel (scrollx) or is transparent
 * (fade), and is `inert`: it cannot take focus and is hidden from assistive technology.
 */
@Component({
  selector: 'ui-carousel-slide',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'carousel-slide',
    role: 'group',
    'aria-roledescription': 'slide',
    '[attr.aria-label]': 'label()',
    '[attr.aria-hidden]': 'active() ? null : "true"',
    '[attr.inert]': 'active() ? null : ""',
    '[style.transform]': 'transform()',
    '[style.opacity]': 'opacity()',
    '[style.z-index]': 'active() ? 1 : 0',
  },
  template: '<ng-content />',
})
export class UiCarouselSlide {
  private readonly _carousel = inject(UiCarouselContext);
  readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  /** Name of the slide; by default "2 of 5". */
  readonly ariaLabel = input<string>();

  /** Position among the slides of the carousel (`-1` while it is not known yet). */
  readonly index = computed(() => this._carousel.slides().indexOf(this));
  readonly active = computed(() => this._carousel.current() === this.index());

  /** While a drag moves the slide: the distance (px) along the axis, and the side it waits on. */
  readonly dragOffset = signal<number | null>(null);
  readonly dragSide = signal<1 | -1 | null>(null);

  protected readonly label = computed(
    () =>
      this.ariaLabel() ??
      this._carousel.resolvedLabels().slide(this.index(), this._carousel.count())
  );

  /** Where the slide rests: on show (0), or waiting on one side (±100%), plus any drag. */
  protected readonly transform = computed(() => {
    if (this._carousel.effect() === 'fade') {
      return null;
    }
    const side = this.active()
      ? 0
      : (this.dragSide() ??
        parkSide(
          this.index(),
          this._carousel.current(),
          this._carousel.count(),
          this._carousel.loop()
        ));
    return translate(this._carousel.vertical(), restingOffset(side, this.dragOffset()));
  });

  protected readonly opacity = computed(() =>
    this._carousel.effect() === 'fade' ? (this.active() ? '1' : '0') : null
  );

  private _animation: Animation | null = null;

  /**
   * Plays an animation over the resting state of the slide. Resolves `true` when it ran to the end,
   * `false` when it was cancelled. Where animations are not available (or `duration` is 0) it
   * resolves at once and the slide is simply in its new resting place.
   */
  animate(keyframes: Keyframe[], duration: number): Promise<boolean> {
    this.cancelAnimation();
    if (duration <= 0 || typeof this.element.animate !== 'function') {
      return Promise.resolve(true);
    }
    const animation = this.element.animate(keyframes, { duration, easing: EASING, fill: 'none' });
    this._animation = animation;
    return animation.finished.then(
      () => {
        if (this._animation === animation) {
          this._animation = null;
        }
        return true;
      },
      () => false
    );
  }

  cancelAnimation(): void {
    this._animation?.cancel();
    this._animation = null;
  }
}

/** `side` is -1, 0 or 1 (a whole slide to one side); `drag` is a distance in px, or null. */
function restingOffset(side: number, drag: number | null): string {
  const base = `${side * 100}%`;
  return drag === null ? base : `calc(${base} + ${drag}px)`;
}

export function translate(vertical: boolean, offset: string): string {
  return vertical ? `translate3d(0, ${offset}, 0)` : `translate3d(${offset}, 0, 0)`;
}
