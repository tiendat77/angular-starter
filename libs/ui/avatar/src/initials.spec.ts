import { describe, expect, it } from 'vitest';
import { getInitials } from './initials';

describe('getInitials', () => {
  it('takes the first letter of the first and last words', () => {
    expect(getInitials('Nguyễn Văn An')).toBe('NA');
    expect(getInitials('Linh Tran')).toBe('LT');
  });

  it('uses one letter for a single word and upper-cases it', () => {
    expect(getInitials('linh')).toBe('L');
  });

  it('ignores extra whitespace', () => {
    expect(getInitials('  Linh   Tran  ')).toBe('LT');
  });

  it('keeps Vietnamese letters and combining marks whole', () => {
    expect(getInitials('đặng thị ễ')).toBe('ĐỄ');
    // "Ễ" written as E + combining circumflex + combining tilde (NFD)
    expect(getInitials('An Ễm')).toBe('AỄ');
  });

  it('returns empty for empty, blank and nullish names', () => {
    expect(getInitials('')).toBe('');
    expect(getInitials('   ')).toBe('');
    expect(getInitials(null)).toBe('');
    expect(getInitials(undefined)).toBe('');
  });
});
