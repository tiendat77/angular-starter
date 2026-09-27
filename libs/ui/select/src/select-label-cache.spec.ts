import { computed } from '@angular/core';
import { describe, expect, it } from 'vitest';
import { SelectLabelCache } from './select-label-cache';

interface User {
  id: number;
}

describe('SelectLabelCache', () => {
  const byId = () => (a: User, b: User) => a.id === b.id;

  it('stores and reads labels through compareWith', () => {
    const cache = new SelectLabelCache<User>(byId);
    cache.set({ id: 1 }, 'Alice');

    expect(cache.get({ id: 1 })).toBe('Alice');
    expect(cache.get({ id: 2 })).toBeUndefined();
  });

  it('overwrites the label of an equal value', () => {
    const cache = new SelectLabelCache<User>(byId);
    cache.set({ id: 1 }, 'Alice');
    cache.set({ id: 1 }, 'Alice Smith');

    expect(cache.get({ id: 1 })).toBe('Alice Smith');
  });

  it('is reactive for computed readers', () => {
    const cache = new SelectLabelCache<User>(byId);
    const label = computed(() => cache.get({ id: 1 }) ?? '');
    expect(label()).toBe('');

    cache.set({ id: 1 }, 'Alice');
    expect(label()).toBe('Alice');
  });
});
