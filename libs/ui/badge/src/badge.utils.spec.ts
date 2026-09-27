import { describe, expect, it } from 'vitest';
import { formatBadgeCount } from './badge.utils';

describe('formatBadgeCount', () => {
  it('formats numbers up to max', () => {
    expect(formatBadgeCount(5)).toBe('5');
    expect(formatBadgeCount(99)).toBe('99');
    expect(formatBadgeCount(100)).toBe('99+');
    expect(formatBadgeCount(10, 9)).toBe('9+');
  });

  it('hides zero unless showZero', () => {
    expect(formatBadgeCount(0)).toBe('');
    expect(formatBadgeCount(0, 99, true)).toBe('0');
  });

  it('passes strings through', () => {
    expect(formatBadgeCount('new')).toBe('new');
    expect(formatBadgeCount('0')).toBe('0');
  });

  it('returns empty for null, empty, negative and non-finite values', () => {
    expect(formatBadgeCount(null)).toBe('');
    expect(formatBadgeCount(undefined)).toBe('');
    expect(formatBadgeCount('')).toBe('');
    expect(formatBadgeCount(-1)).toBe('');
    expect(formatBadgeCount(Number.NaN)).toBe('');
  });

  it('drops fractions', () => {
    expect(formatBadgeCount(4.7)).toBe('4');
  });
});
