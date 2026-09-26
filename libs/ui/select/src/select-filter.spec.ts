import { describe, expect, it } from 'vitest';
import { normalizeForSearch, uiDefaultFilter } from './select-filter';

const opt = (label: string) => ({ value: label, label, disabled: false });

describe('normalizeForSearch', () => {
  it('lower-cases and strips accents, including đ', () => {
    expect(normalizeForSearch('Nguyễn Đức ÁNH')).toBe('nguyen duc anh');
  });
});

describe('uiDefaultFilter', () => {
  it('matches case- and accent-insensitively', () => {
    expect(uiDefaultFilter('nguyen', opt('Nguyễn Văn A'))).toBe(true);
    expect(uiDefaultFilter('DUC', opt('Trần Đức'))).toBe(true);
  });

  it('matches everything for an empty or blank term', () => {
    expect(uiDefaultFilter('', opt('Apple'))).toBe(true);
    expect(uiDefaultFilter('   ', opt('Apple'))).toBe(true);
  });

  it('trims the term and rejects labels without the term', () => {
    expect(uiDefaultFilter('  app ', opt('Apple'))).toBe(true);
    expect(uiDefaultFilter('pear', opt('Apple'))).toBe(false);
  });
});
