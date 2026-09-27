import { describe, expect, it } from 'vitest';
import { clampProgress, clampValue, progressValueAttribute } from './progress.utils';

describe('clampProgress', () => {
  it('returns the percentage of value over max', () => {
    expect(clampProgress(50)).toBe(50);
    expect(clampProgress(5, 10)).toBe(50);
  });

  it('clamps to [0, 100]', () => {
    expect(clampProgress(150)).toBe(100);
    expect(clampProgress(-5)).toBe(0);
  });

  it('returns 0 for invalid input', () => {
    expect(clampProgress(5, 0)).toBe(0);
    expect(clampProgress(5, -1)).toBe(0);
    expect(clampProgress(Number.NaN)).toBe(0);
    expect(clampProgress(5, Number.NaN)).toBe(0);
  });
});

describe('clampValue', () => {
  it('clamps to [0, max]', () => {
    expect(clampValue(42)).toBe(42);
    expect(clampValue(150)).toBe(100);
    expect(clampValue(-3)).toBe(0);
    expect(clampValue(12, 10)).toBe(10);
  });

  it('returns 0 for invalid input', () => {
    expect(clampValue(Number.NaN)).toBe(0);
    expect(clampValue(5, 0)).toBe(0);
  });
});

describe('progressValueAttribute', () => {
  it('keeps null, undefined and empty string as null (indeterminate)', () => {
    expect(progressValueAttribute(null)).toBeNull();
    expect(progressValueAttribute(undefined)).toBeNull();
    expect(progressValueAttribute('')).toBeNull();
  });

  it('converts numbers and numeric strings', () => {
    expect(progressValueAttribute(7)).toBe(7);
    expect(progressValueAttribute('42')).toBe(42);
    expect(progressValueAttribute('abc')).toBeNaN();
  });
});
