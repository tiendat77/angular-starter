import { describe, expect, it } from 'vitest';
import { resolveDragEnd, snapPointsToPixels } from './bottom-sheet-snap';

describe('snapPointsToPixels', () => {
  it('converts ascending fractions to pixel heights', () => {
    expect(snapPointsToPixels([0.25, 0.5, 0.9], 1000)).toEqual([250, 500, 900]);
  });

  it('returns an empty array for an empty snapPoints input', () => {
    expect(snapPointsToPixels([], 1000)).toEqual([]);
  });

  it('handles a single snap point', () => {
    expect(snapPointsToPixels([0.5], 800)).toEqual([400]);
  });
});

describe('resolveDragEnd', () => {
  // panelHeightPx = max(snapPixels) = 900 throughout these cases.
  const snapPixels = [250, 500, 900]; // translateY per index: [650, 400, 0]
  const panelHeightPx = 900;

  it('snaps to the nearest point when released with no fling and no dismiss overshoot', () => {
    const result = resolveDragEnd({
      currentTranslateY: 380, // closest to index 1's translateY of 400
      velocityPxPerMs: 0,
      snapPixels,
      panelHeightPx,
      disableClose: false,
    });
    expect(result).toEqual({ index: 1 });
  });

  it('steps down one snap on a downward fling', () => {
    const result = resolveDragEnd({
      currentTranslateY: 400, // nearest index 1
      velocityPxPerMs: 0.6, // >= 0.5 px/ms fling threshold, downward
      snapPixels,
      panelHeightPx,
      disableClose: false,
    });
    expect(result).toEqual({ index: 0 });
  });

  it('steps up one snap on an upward fling, clamped to the largest index', () => {
    const result = resolveDragEnd({
      currentTranslateY: 400, // nearest index 1
      velocityPxPerMs: -0.6,
      snapPixels,
      panelHeightPx,
      disableClose: false,
    });
    expect(result).toEqual({ index: 2 });
  });

  it('dismisses on a downward fling past the smallest snap dismiss threshold', () => {
    // dismiss threshold = translateY(index 0) + snapPixels[0] * 0.5 = 650 + 125 = 775
    const result = resolveDragEnd({
      currentTranslateY: 800,
      velocityPxPerMs: 0.6,
      snapPixels,
      panelHeightPx,
      disableClose: false,
    });
    expect(result).toEqual({ dismiss: true });
  });

  it('dismisses on a slow drag released past the dismiss threshold (no fling needed)', () => {
    const result = resolveDragEnd({
      currentTranslateY: 800,
      velocityPxPerMs: 0,
      snapPixels,
      panelHeightPx,
      disableClose: false,
    });
    expect(result).toEqual({ dismiss: true });
  });

  it('clamps to the smallest snap instead of dismissing when disableClose is true', () => {
    const result = resolveDragEnd({
      currentTranslateY: 800,
      velocityPxPerMs: 0.6,
      snapPixels,
      panelHeightPx,
      disableClose: true,
    });
    expect(result).toEqual({ index: 0 });
  });

  it('never returns an out-of-range index for a single snap point', () => {
    const single = [500];
    const singlePanelHeight = 500;
    const result = resolveDragEnd({
      currentTranslateY: 0,
      velocityPxPerMs: -0.6, // fling up with nothing above index 0
      snapPixels: single,
      panelHeightPx: singlePanelHeight,
      disableClose: false,
    });
    expect(result).toEqual({ index: 0 });
  });
});
