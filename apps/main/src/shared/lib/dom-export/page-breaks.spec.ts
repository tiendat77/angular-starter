import { describe, expect, it } from 'vitest';
import { computePageBreaks } from './page-breaks';

describe('computePageBreaks', () => {
  it('uses one page when the content fits', () => {
    expect(computePageBreaks(100, 100, [[10, 90]])).toEqual([0]);
  });

  it('cuts where the page is full when nothing is in the way', () => {
    expect(computePageBreaks(250, 100, [])).toEqual([0, 100, 200]);
  });

  it('moves a cut that crosses a line above that line', () => {
    // a line spans 95..115, so the first page ends just above it
    expect(computePageBreaks(250, 100, [[95, 115]])).toEqual([0, 95, 195]);
  });

  it('keeps moving while the new cut crosses another line', () => {
    expect(
      computePageBreaks(250, 100, [
        [80, 96],
        [95, 115],
      ])
    ).toEqual([0, 80, 180]);
  });

  it('does not cascade up through blocks that only touch each other (table rows)', () => {
    const rows = Array.from({ length: 12 }, (_, i): [number, number] => [i * 40, i * 40 + 40]);

    // the page ends at 100, inside the row 80..120: only that row moves to the next page
    expect(computePageBreaks(300, 100, rows)).toEqual([0, 80, 160, 240]);
  });

  it('does not move a cut for a block taller than most of a page', () => {
    expect(computePageBreaks(250, 100, [[10, 180]])).toEqual([0, 100, 200]);
  });

  it('starts a new page at a forced position', () => {
    expect(computePageBreaks(250, 100, [], [40])).toEqual([0, 40, 140, 240]);
  });
});
