export type UiSliderSize = 'xs' | 'sm' | 'md' | 'lg';

/** The library's semantic colours (`UiColor` has no `secondary`, the sliders do, like checkbox). */
export type UiSliderColor =
  | 'neutral'
  | 'primary'
  | 'secondary'
  | 'info'
  | 'success'
  | 'warning'
  | 'error';

/** Text of a value: the bubble over a thumb and `aria-valuetext`. */
export type UiSliderValueText = (value: number) => string;

/** Value of a range slider: `[low, high]`. */
export type UiRangeSliderValue = readonly [number, number];
