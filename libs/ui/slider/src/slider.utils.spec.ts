import { describe, expect, it } from 'vitest';
import {
  clamp,
  decimalPlaces,
  fromRatio,
  MAX_TICKS,
  pageStepOf,
  snapToStep,
  tickValues,
  toPercent,
  valueForKey,
} from './slider.utils';

describe('slider utils', () => {
  it('counts decimals', () => {
    expect(decimalPlaces(1)).toBe(0);
    expect(decimalPlaces(0.25)).toBe(2);
    expect(decimalPlaces(1e-7)).toBe(7);
    expect(decimalPlaces(Number.NaN)).toBe(0);
  });

  it('clamps', () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-1, 0, 10)).toBe(0);
    expect(clamp(11, 0, 10)).toBe(10);
  });

  describe('snapToStep', () => {
    it('snaps to the grid anchored at min', () => {
      expect(snapToStep(13, 0, 100, 5)).toBe(15);
      expect(snapToStep(12, 0, 100, 5)).toBe(10);
      expect(snapToStep(13, 3, 100, 5)).toBe(13);
      expect(snapToStep(15, 3, 100, 5)).toBe(13);
      expect(snapToStep(16, 3, 100, 5)).toBe(18);
    });

    it('has no float noise', () => {
      expect(snapToStep(0.3, 0, 1, 0.1)).toBe(0.3);
      expect(snapToStep(0.1 + 0.2, 0, 1, 0.1)).toBe(0.3);
      expect(snapToStep(0.7, 0, 1, 0.01)).toBe(0.7);
    });

    it('stays within min and max, and max is reachable off the grid', () => {
      expect(snapToStep(-5, 0, 100, 10)).toBe(0);
      expect(snapToStep(500, 0, 100, 10)).toBe(100);
      expect(snapToStep(100, 0, 95, 10)).toBe(95);
    });

    it('only clamps without a usable step', () => {
      expect(snapToStep(12.34, 0, 100, 0)).toBe(12.34);
      expect(snapToStep(12.34, 0, 100, -1)).toBe(12.34);
    });
  });

  it('converts to a percent and back', () => {
    expect(toPercent(50, 0, 100)).toBe(50);
    expect(toPercent(5, 0, 20)).toBe(25);
    expect(toPercent(-5, 0, 20)).toBe(0);
    expect(toPercent(50, 10, 10)).toBe(0);
    expect(fromRatio(0.25, 0, 200)).toBe(50);
    expect(fromRatio(2, 0, 10)).toBe(10);
  });

  describe('pageStepOf', () => {
    it('is 10% of the range, in whole steps', () => {
      expect(pageStepOf(0, 100, 1)).toBe(10);
      expect(pageStepOf(0, 1000, 5)).toBe(100);
      expect(pageStepOf(0, 100, 15)).toBe(15);
      expect(pageStepOf(0, 1, 0.01)).toBe(0.1);
    });

    it('is at least one step', () => {
      expect(pageStepOf(0, 5, 1)).toBe(1);
      expect(pageStepOf(0, 100, 50)).toBe(50);
    });
  });

  describe('valueForKey', () => {
    const o = { min: 0, max: 100, step: 2, page: 10, rtl: false };
    it('steps with the arrows', () => {
      expect(valueForKey('ArrowRight', 10, o)).toBe(12);
      expect(valueForKey('ArrowUp', 10, o)).toBe(12);
      expect(valueForKey('ArrowLeft', 10, o)).toBe(8);
      expect(valueForKey('ArrowDown', 10, o)).toBe(8);
    });

    it('swaps the horizontal arrows in rtl, not the vertical ones', () => {
      const rtl = { ...o, rtl: true };
      expect(valueForKey('ArrowRight', 10, rtl)).toBe(8);
      expect(valueForKey('ArrowLeft', 10, rtl)).toBe(12);
      expect(valueForKey('ArrowUp', 10, rtl)).toBe(12);
    });

    it('pages and jumps', () => {
      expect(valueForKey('PageUp', 10, o)).toBe(20);
      expect(valueForKey('PageDown', 10, o)).toBe(0);
      expect(valueForKey('Home', 10, o)).toBe(0);
      expect(valueForKey('End', 10, o)).toBe(100);
    });

    it('ignores other keys', () => {
      expect(valueForKey('a', 10, o)).toBeNull();
      expect(valueForKey('Tab', 10, o)).toBeNull();
    });
  });

  describe('tickValues', () => {
    it('has a tick per step, min and max included', () => {
      expect(tickValues(0, 10, 2)).toEqual([0, 2, 4, 6, 8, 10]);
      expect(tickValues(0, 1, 0.25)).toEqual([0, 0.25, 0.5, 0.75, 1]);
    });

    it('stops at the last full step', () => {
      expect(tickValues(0, 10, 4)).toEqual([0, 4, 8]);
    });

    it('is empty for nothing to draw', () => {
      expect(tickValues(0, 10, 0)).toEqual([]);
      expect(tickValues(5, 5, 1)).toEqual([]);
    });

    it('thins a fine grid to the cap, keeping min', () => {
      const ticks = tickValues(0, 10000, 1);
      expect(ticks.length).toBeLessThanOrEqual(MAX_TICKS);
      expect(ticks[0]).toBe(0);
    });
  });
});
