import { describe, expect, it } from 'vitest';
import { __Pascal__Schema } from './__kebab__.model';

describe('__Pascal__Schema', () => {
  it('accepts a valid __Title__', () => {
    expect(__Pascal__Schema.parse({ id: 1, name: 'Example' }).id).toBe(1);
  });

  it('rejects an invalid __Title__', () => {
    expect(() => __Pascal__Schema.parse({ id: 1, name: '' })).toThrow();
  });
});
