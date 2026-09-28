import { describe, expect, it } from 'vitest';
import { TOOLTIP_POSITIONS, mapConnectedPositionToPlacement } from './tooltip.positions';

describe('tooltip positions', () => {
  it('defines 8px offset for all primary placements', () => {
    expect(TOOLTIP_POSITIONS.top[0].offsetY).toBe(-8);
    expect(TOOLTIP_POSITIONS.bottom[0].offsetY).toBe(8);
    expect(TOOLTIP_POSITIONS.left[0].offsetX).toBe(-8);
    expect(TOOLTIP_POSITIONS.right[0].offsetX).toBe(8);
  });

  it('maps flipped positions back to placement direction', () => {
    expect(mapConnectedPositionToPlacement(TOOLTIP_POSITIONS.top[0])).toBe('top');
    expect(mapConnectedPositionToPlacement(TOOLTIP_POSITIONS.bottom[0])).toBe('bottom');
    expect(mapConnectedPositionToPlacement(TOOLTIP_POSITIONS.left[0])).toBe('left');
    expect(mapConnectedPositionToPlacement(TOOLTIP_POSITIONS.right[0])).toBe('right');
  });
});
