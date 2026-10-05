import { UiOtpFormatter } from './otp-input.types';

const PRESETS = {
  numeric: /^\d$/,
  alphanumeric: /^[a-z0-9]$/i,
} as const;

/** Turns a formatter into a function that maps one character to its accepted form, or `''`. */
export function createCharFilter(formatter: UiOtpFormatter): (char: string) => string {
  if (typeof formatter === 'function') {
    return (char) => Array.from(formatter(char) ?? '')[0] ?? '';
  }

  // `g`/`y` make `test()` stateful, which would make acceptance depend on the previous character.
  const pattern =
    typeof formatter === 'string'
      ? PRESETS[formatter]
      : new RegExp(formatter.source, formatter.flags.replace(/[gy]/g, ''));
  return (char) => (pattern.test(char) ? char : '');
}

/** Splits `text` into code points and keeps only the ones the filter accepts. */
export function parseChars(text: string | null | undefined, filter: (char: string) => string) {
  return Array.from(text ?? '')
    .map(filter)
    .filter((char) => char !== '');
}

/** Overwrites `current` from `index` onward with `inserted`, never exceeding `length`. */
export function overwriteAt(
  current: readonly string[],
  index: number,
  inserted: readonly string[],
  length: number
): string[] {
  const start = Math.min(index, current.length);
  return [...current.slice(0, start), ...inserted, ...current.slice(start + inserted.length)].slice(
    0,
    length
  );
}

/** Removes the character at `index`; later characters shift left. */
export function removeAt(current: readonly string[], index: number): string[] {
  return current.filter((_, i) => i !== index);
}
