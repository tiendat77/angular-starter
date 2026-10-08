/** Most ticks drawn under a track; a finer `tickStep` is thinned to stay under it. */
export const MAX_TICKS = 200;

/** Number of decimals of a number (`0.25` → 2, `1e-7` → 7). */
export function decimalPlaces(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  const [mantissa, exponent] = String(value).split('e-');
  const fraction = mantissa.split('.')[1]?.length ?? 0;
  return fraction + (exponent ? parseInt(exponent, 10) : 0);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * The nearest value on the grid `min + n * step`, within `[min, max]`. The rounding is done on the
 * decimals of `step` and `min`, so `0.1 + 0.2` style errors never leak into the value.
 */
export function snapToStep(value: number, min: number, max: number, step: number): number {
  const bounded = clamp(value, min, max);
  if (!(step > 0)) {
    return bounded;
  }
  const decimals = Math.min(20, Math.max(decimalPlaces(step), decimalPlaces(min)));
  const snapped = min + Math.round((bounded - min) / step) * step;
  return clamp(Number(snapped.toFixed(decimals)), min, max);
}

/** Position of a value on the track, 0–100. */
export function toPercent(value: number, min: number, max: number): number {
  return max > min ? clamp(((value - min) / (max - min)) * 100, 0, 100) : 0;
}

/** The value at a position of the track (`ratio` 0–1). */
export function fromRatio(ratio: number, min: number, max: number): number {
  return min + clamp(ratio, 0, 1) * (max - min);
}

/** What PageUp / PageDown move by: 10% of the range, a whole number of steps, at least one. */
export function pageStepOf(min: number, max: number, step: number): number {
  const tenth = (max - min) / 10;
  if (!(step > 0)) {
    return tenth;
  }
  const decimals = Math.min(20, decimalPlaces(step));
  return Number(Math.max(step, Math.round(tenth / step) * step).toFixed(decimals));
}

export interface KeyOptions {
  min: number;
  max: number;
  step: number;
  page: number;
  /** Horizontal arrows swap in a right-to-left layout. */
  rtl: boolean;
}

/**
 * The value a key asks for (not yet snapped or clamped), or `null` when the key is not one of the
 * slider keys. Home / End go to `min` / `max`: pass a thumb's own bounds there.
 */
export function valueForKey(key: string, value: number, options: KeyOptions): number | null {
  const increase = options.rtl ? 'ArrowLeft' : 'ArrowRight';
  const decrease = options.rtl ? 'ArrowRight' : 'ArrowLeft';
  switch (key) {
    case 'ArrowUp':
    case increase:
      return value + options.step;
    case 'ArrowDown':
    case decrease:
      return value - options.step;
    case 'PageUp':
      return value + options.page;
    case 'PageDown':
      return value - options.page;
    case 'Home':
      return options.min;
    case 'End':
      return options.max;
    default:
      return null;
  }
}

/** The values to draw a tick at: `min`, `min + tickStep`, … up to `max` (thinned over `MAX_TICKS`). */
export function tickValues(min: number, max: number, tickStep: number): number[] {
  if (!(tickStep > 0) || !(max > min)) {
    return [];
  }
  const count = Math.floor((max - min) / tickStep + 1e-9) + 1;
  const stride = Math.max(1, Math.ceil(count / MAX_TICKS));
  const decimals = Math.min(20, Math.max(decimalPlaces(tickStep), decimalPlaces(min)));
  const ticks: number[] = [];
  for (let i = 0; i < count; i += stride) {
    ticks.push(Number((min + i * tickStep).toFixed(decimals)));
  }
  return ticks;
}
