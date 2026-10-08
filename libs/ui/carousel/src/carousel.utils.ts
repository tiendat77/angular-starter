/** A slide past this fraction of the size of the carousel, dragged, changes the slide. */
export const SWIPE_DISTANCE_RATIO = 1 / 3;
/** A quicker flick (px/ms) changes the slide when it also went at least `SWIPE_FLICK_MIN` px. */
export const SWIPE_FLICK_VELOCITY = 0.5;
export const SWIPE_FLICK_MIN = 24;
/** A pointer must move this far (px) before it counts as a drag rather than a click. */
export const DRAG_START_DISTANCE = 6;

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** The slide to show for an index that may be out of range (or not a number). */
export function normalizeIndex(index: number, count: number): number {
  if (count <= 0) {
    return 0;
  }
  return clamp(Number.isFinite(index) ? Math.trunc(index) : 0, 0, count - 1);
}

/**
 * The slide next to `index` in a direction (`1` next, `-1` previous), or `null` at an end of a
 * carousel that does not loop (or when there is nothing to move to).
 */
export function neighbourIndex(
  index: number,
  direction: 1 | -1,
  count: number,
  loop: boolean
): number | null {
  if (count < 2) {
    return null;
  }
  const target = index + direction;
  if (target >= 0 && target < count) {
    return target;
  }
  return loop ? (target + count) % count : null;
}

/**
 * Which side a slide that is not on show waits on: `1` after the active one (the next slides come
 * from there) or `-1` before it. Without a loop that is the order of the slides. With a loop the
 * nearer side wins, so the first slide waits after the last one; with exactly two slides the other
 * one waits after.
 */
export function parkSide(index: number, active: number, count: number, loop: boolean): 1 | -1 {
  if (!loop) {
    return index < active ? -1 : 1;
  }
  const ahead = (((index - active) % count) + count) % count;
  return ahead <= count / 2 ? 1 : -1;
}

/** Whether a drag that moved `distance` px at `velocity` px/ms (towards the same side) changes the slide. */
export function swipeChangesSlide(distance: number, size: number, velocity: number): boolean {
  const far = Math.abs(distance) > size * SWIPE_DISTANCE_RATIO;
  const flick = Math.abs(velocity) > SWIPE_FLICK_VELOCITY && Math.abs(distance) > SWIPE_FLICK_MIN;
  return far || flick;
}
