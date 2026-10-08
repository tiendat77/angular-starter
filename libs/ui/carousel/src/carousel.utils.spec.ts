import { describe, expect, it } from 'vitest';
import { neighbourIndex, normalizeIndex, parkSide, swipeChangesSlide } from './carousel.utils';

describe('carousel utils', () => {
  describe('normalizeIndex', () => {
    it('keeps an index inside the slides', () => {
      expect(normalizeIndex(2, 5)).toBe(2);
      expect(normalizeIndex(-3, 5)).toBe(0);
      expect(normalizeIndex(9, 5)).toBe(4);
      expect(normalizeIndex(1.7, 5)).toBe(1);
    });

    it('is 0 without slides or for a value that is not a number', () => {
      expect(normalizeIndex(3, 0)).toBe(0);
      expect(normalizeIndex(Number.NaN, 5)).toBe(0);
    });
  });

  describe('neighbourIndex', () => {
    it('moves to the next and the previous slide', () => {
      expect(neighbourIndex(1, 1, 4, false)).toBe(2);
      expect(neighbourIndex(1, -1, 4, false)).toBe(0);
    });

    it('stops at the ends without a loop', () => {
      expect(neighbourIndex(3, 1, 4, false)).toBeNull();
      expect(neighbourIndex(0, -1, 4, false)).toBeNull();
    });

    it('wraps around with a loop', () => {
      expect(neighbourIndex(3, 1, 4, true)).toBe(0);
      expect(neighbourIndex(0, -1, 4, true)).toBe(3);
    });

    it('has no neighbour with fewer than two slides', () => {
      expect(neighbourIndex(0, 1, 1, true)).toBeNull();
      expect(neighbourIndex(0, 1, 0, true)).toBeNull();
    });
  });

  describe('parkSide', () => {
    it('follows the order of the slides without a loop', () => {
      expect([0, 1, 2, 3].map((i) => parkSide(i, 1, 4, false))).toEqual([-1, 1, 1, 1]);
    });

    it('lets the nearer side win with a loop', () => {
      // 5 slides, 0 on show: 1 and 2 wait after, 3 and 4 wait before
      expect([1, 2, 3, 4].map((i) => parkSide(i, 0, 5, true))).toEqual([1, 1, -1, -1]);
      // the first slide waits after the last one
      expect(parkSide(0, 4, 5, true)).toBe(1);
      expect(parkSide(3, 4, 5, true)).toBe(-1);
    });

    it('puts the other of two slides after the active one', () => {
      expect(parkSide(1, 0, 2, true)).toBe(1);
      expect(parkSide(0, 1, 2, true)).toBe(1);
    });
  });

  describe('swipeChangesSlide', () => {
    it('changes after a third of the size', () => {
      expect(swipeChangesSlide(-100, 300, 0)).toBe(false);
      expect(swipeChangesSlide(-101, 300, 0)).toBe(true);
      expect(swipeChangesSlide(120, 300, 0)).toBe(true);
    });

    it('changes on a quick flick, if it went a little way', () => {
      expect(swipeChangesSlide(-40, 300, -0.8)).toBe(true);
      expect(swipeChangesSlide(-10, 300, -0.8)).toBe(false);
      expect(swipeChangesSlide(-40, 300, -0.2)).toBe(false);
    });
  });
});
