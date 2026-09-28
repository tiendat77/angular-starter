import { describe, expect, it } from 'vitest';
import { getMenuPositions } from './menu.positions';

describe('getMenuPositions', () => {
  it('returns bottom-start with top-start fallback', () => {
    const positions = getMenuPositions('bottom-start', 6);
    expect(positions).toHaveLength(2);
    expect(positions[0]).toEqual({
      originX: 'start',
      originY: 'bottom',
      overlayX: 'start',
      overlayY: 'top',
      offsetY: 6,
    });
    expect(positions[1]).toEqual({
      originX: 'start',
      originY: 'top',
      overlayX: 'start',
      overlayY: 'bottom',
      offsetY: -6,
    });
  });

  it('returns bottom-end with top-end fallback', () => {
    const positions = getMenuPositions('bottom-end', 4);
    expect(positions).toHaveLength(2);
    expect(positions[0].overlayX).toBe('end');
    expect(positions[0].originX).toBe('end');
    expect(positions[0].originY).toBe('bottom');
    expect(positions[1].originY).toBe('top');
  });

  it('returns top-start with bottom-start fallback', () => {
    const positions = getMenuPositions('top-start', 8);
    expect(positions).toHaveLength(2);
    expect(positions[0]).toEqual({
      originX: 'start',
      originY: 'top',
      overlayX: 'start',
      overlayY: 'bottom',
      offsetY: -8,
    });
    expect(positions[1]).toEqual({
      originX: 'start',
      originY: 'bottom',
      overlayX: 'start',
      overlayY: 'top',
      offsetY: 8,
    });
  });

  it('returns top-end with bottom-end fallback', () => {
    const positions = getMenuPositions('top-end', 5);
    expect(positions).toHaveLength(2);
    expect(positions[0].originX).toBe('end');
    expect(positions[0].originY).toBe('top');
    expect(positions[0].overlayY).toBe('bottom');
    expect(positions[1].originY).toBe('bottom');
    expect(positions[1].overlayY).toBe('top');
  });

  it('returns left-start with right-start fallback', () => {
    const positions = getMenuPositions('left-start', 4);
    expect(positions).toHaveLength(2);
    expect(positions[0]).toEqual({
      originX: 'start',
      originY: 'top',
      overlayX: 'end',
      overlayY: 'top',
      offsetX: -4,
    });
    expect(positions[1]).toEqual({
      originX: 'end',
      originY: 'top',
      overlayX: 'start',
      overlayY: 'top',
      offsetX: 4,
    });
  });

  it('returns right-start with left-start fallback', () => {
    const positions = getMenuPositions('right-start', 6);
    expect(positions).toHaveLength(2);
    expect(positions[0]).toEqual({
      originX: 'end',
      originY: 'top',
      overlayX: 'start',
      overlayY: 'top',
      offsetX: 6,
    });
    expect(positions[1]).toEqual({
      originX: 'start',
      originY: 'top',
      overlayX: 'end',
      overlayY: 'top',
      offsetX: -6,
    });
  });
});
