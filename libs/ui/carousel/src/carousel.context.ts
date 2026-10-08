import { Signal } from '@angular/core';
import { UiCarouselEffect, UiCarouselLabels } from './carousel.types';

/**
 * What a slide needs from the carousel it sits in. A token of its own, so the slide does not import
 * the carousel (which queries the slides).
 */
export abstract class UiCarouselContext {
  /** The slide on show (the `activeIndex`, kept inside the slides). */
  abstract readonly current: Signal<number>;
  abstract readonly count: Signal<number>;
  abstract readonly effect: Signal<UiCarouselEffect>;
  abstract readonly vertical: Signal<boolean>;
  abstract readonly loop: Signal<boolean>;
  /** The texts: the defaults with the app's overrides. */
  abstract readonly resolvedLabels: Signal<UiCarouselLabels>;
  /** Every slide, in order. */
  abstract readonly slides: Signal<readonly unknown[]>;
}
