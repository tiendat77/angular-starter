import { describe, expect, it } from 'vitest';
import { compareValues, isEmptyFilterValue } from './table.comparator';

const sortAsc = (values: unknown[]) => [...values].sort((a, b) => compareValues(a, b, 'ascend'));
const sortDesc = (values: unknown[]) => [...values].sort((a, b) => compareValues(a, b, 'descend'));

describe('compareValues', () => {
  it('compares numbers numerically', () => {
    expect(sortAsc([10, 2, 33])).toEqual([2, 10, 33]);
    expect(sortDesc([10, 2, 33])).toEqual([33, 10, 2]);
  });

  it('compares strings case-insensitively with numeric collation', () => {
    expect(sortAsc(['item10', 'Item2', 'item1'])).toEqual(['item1', 'Item2', 'item10']);
    expect(compareValues('abc', 'ABC', 'ascend')).toBe(0);
  });

  it('compares dates by time', () => {
    const a = new Date('2024-01-02');
    const b = new Date('2023-05-01');
    expect(sortAsc([a, b])).toEqual([b, a]);
  });

  it('orders booleans false before true', () => {
    expect(sortAsc([true, false])).toEqual([false, true]);
  });

  it('puts null and undefined last in both directions', () => {
    expect(sortAsc([null, 2, undefined, 1])).toEqual([1, 2, null, undefined]);
    expect(sortDesc([null, 2, undefined, 1])).toEqual([2, 1, null, undefined]);
  });

  it('never returns negative zero for equal values in descend', () => {
    expect(Object.is(compareValues(1, 1, 'descend'), 0)).toBe(true);
  });
});

describe('isEmptyFilterValue', () => {
  it('treats null, undefined, empty string and empty array as empty', () => {
    expect([null, undefined, '', []].every(isEmptyFilterValue)).toBe(true);
  });

  it('treats 0, false and non-empty values as set', () => {
    expect([0, false, 'a', ['x']].some(isEmptyFilterValue)).toBe(false);
  });
});
