import { UiColor, UiSize } from '@libs/ui/core';

/** `inherit` sizes the spinner to `1em`, so it scales with the surrounding text. */
export type UiSpinnerSize = UiSize | 'inherit';

/** `current` uses `currentColor`. */
export type UiSpinnerColor = UiColor | 'current';

export type UiProgressBarSize = 'sm' | 'md' | 'lg';
