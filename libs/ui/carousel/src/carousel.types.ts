/** `scrollx`: slides move in; `fade`: slides cross-fade. */
export type UiCarouselEffect = 'scrollx' | 'fade';

/** Where the dots sit. `left` and `right` make the slides move vertically. */
export type UiCarouselDotPosition = 'bottom' | 'top' | 'left' | 'right';

export interface UiCarouselChange {
  /** The slide that was shown. */
  from: number;
  /** The slide that is shown now. */
  to: number;
}

/** Context of a `uiCarouselDot` template. */
export interface UiCarouselDotContext {
  /** The index of the slide this dot goes to. */
  $implicit: number;
  index: number;
  /** Whether it is the slide on show. */
  active: boolean;
  /** How many slides there are. */
  count: number;
}

/** Every text the carousel adds (names of controls and slides). Override with `labels`. */
export interface UiCarouselLabels {
  /** Name of the carousel, when `ariaLabel` is not set. */
  carousel: string;
  previous: string;
  next: string;
  /** Rotation control while the slide show is stopped. */
  play: string;
  /** Rotation control while the slide show runs. */
  pause: string;
  /** Name of the group of dots. */
  dots: string;
  /** Name of a slide (`index` is 0-based). */
  slide: (index: number, count: number) => string;
  /** Name of a dot (`index` is 0-based). */
  goTo: (index: number, count: number) => string;
}

export const UI_CAROUSEL_DEFAULT_LABELS: Readonly<UiCarouselLabels> = {
  carousel: 'Carousel',
  previous: 'Previous slide',
  next: 'Next slide',
  play: 'Start automatic slide show',
  pause: 'Stop automatic slide show',
  dots: 'Choose a slide',
  slide: (index, count) => `${index + 1} of ${count}`,
  goTo: (index) => `Go to slide ${index + 1}`,
};
