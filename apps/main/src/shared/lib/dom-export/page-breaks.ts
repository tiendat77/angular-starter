/** A vertical span `[top, bottom]` of content that must not be cut, in CSS px from the element's top. */
export type BreakSpan = readonly [top: number, bottom: number];

/** Cuts closer than this to the top of a page are not moved, so a tall block cannot leave a page empty. */
const MIN_FILL = 0.25;
const EPSILON = 0.5;

/**
 * Where every page starts (CSS px, the first one is `0`) when `totalHeight` of content is split into
 * pages of `pageHeight`.
 *
 * A page ends where it is full, unless that would cut through one of the `keep` spans (a line of text,
 * a table row, an image...): then it ends just above that span. A span taller than most of a page
 * cannot be kept whole and is cut where the page is full. A `forced` position always starts a page.
 */
export function computePageBreaks(
  totalHeight: number,
  pageHeight: number,
  keep: readonly BreakSpan[],
  forced: readonly number[] = []
): number[] {
  const starts = [0];
  const sortedForced = [...forced].sort((a, b) => a - b);

  let start = 0;
  while (totalHeight - start > pageHeight + EPSILON) {
    let end = start + pageHeight;
    const forcedBreak = sortedForced.find((y) => y > start + EPSILON && y < end - EPSILON);

    if (forcedBreak !== undefined) {
      end = forcedBreak;
    } else {
      const limit = start + pageHeight * MIN_FILL;

      for (let moved = true; moved; ) {
        moved = false;

        for (const [top, bottom] of keep) {
          if (top < end - EPSILON && bottom > end + EPSILON && top > limit) {
            end = top;
            moved = true;
          }
        }
      }
    }

    starts.push(end);
    start = end;
  }

  return starts;
}
