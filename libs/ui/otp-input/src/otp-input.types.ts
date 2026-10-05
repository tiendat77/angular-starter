export type UiOtpInputSize = 'sm' | 'md' | 'lg';

export type UiOtpFormatterPreset = 'numeric' | 'alphanumeric';

/** Returns the replacement for `char`, or `''` to reject it. Only its first code point is used. */
export type UiOtpFormatterFn = (char: string) => string;

/**
 * Filters every incoming character: a preset or `RegExp` keeps matching characters, a function
 * can also transform them (e.g. upper-casing).
 */
export type UiOtpFormatter = UiOtpFormatterPreset | RegExp | UiOtpFormatterFn;

/** Builds the accessible name of a slot; `index` is 1-based. */
export type UiOtpSlotLabelFn = (index: number, length: number) => string;
