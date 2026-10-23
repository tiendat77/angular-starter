import { afterEach, describe, expect, it, vi } from 'vitest';
import { prefersReducedMotion } from './motion';

describe('prefersReducedMotion', () => {
  afterEach(() => vi.unstubAllGlobals());

  it.each([true, false])('follows the media query (matches: %s)', (matches) => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn((query: string) => ({ matches: matches && query.includes('reduce') }))
    );

    expect(prefersReducedMotion()).toBe(matches);
  });

  it('is false where matchMedia is missing', () => {
    vi.stubGlobal('matchMedia', undefined);

    expect(prefersReducedMotion()).toBe(false);
  });
});
