import { numberAttribute } from '@angular/core';

/** Percentage of `value` over `max`, clamped to [0, 100]. Invalid input (NaN, `max <= 0`) gives 0. */
export function clampProgress(value: number, max = 100): number {
  if (!Number.isFinite(value) || !Number.isFinite(max) || max <= 0) return 0;
  return Math.min(100, Math.max(0, (value / max) * 100));
}

/** `value` clamped to [0, max], for `aria-valuenow`. Invalid input gives 0. */
export function clampValue(value: number, max = 100): number {
  if (!Number.isFinite(value) || !Number.isFinite(max) || max <= 0) return 0;
  return Math.min(max, Math.max(0, value));
}

/** Input transform: `null`, `undefined` and `''` stay `null` (indeterminate); anything else becomes a number. */
export function progressValueAttribute(value: unknown): number | null {
  return value === null || value === undefined || value === '' ? null : numberAttribute(value, NaN);
}
