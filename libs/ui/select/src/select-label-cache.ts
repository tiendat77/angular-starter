import { signal, untracked } from '@angular/core';

interface Entry<T> {
  value: T;
  label: string;
}

/**
 * Remembers the label of every selected value, so tags and the single display keep their text
 * when the matching `<ui-option>` is no longer rendered (e.g. server search swapped the options).
 * Reads are reactive; writes are safe inside effects.
 */
export class SelectLabelCache<T> {
  private readonly _entries = signal<Entry<T>[]>([]);

  constructor(private readonly _compareWith: () => (a: T, b: T) => boolean) {}

  set(value: T, label: string): void {
    untracked(() => {
      const eq = this._compareWith();
      const entries = this._entries();
      const index = entries.findIndex((e) => eq(e.value, value));
      if (index === -1) {
        this._entries.set([...entries, { value, label }]);
      } else if (entries[index].label !== label) {
        const next = [...entries];
        next[index] = { value, label };
        this._entries.set(next);
      }
    });
  }

  get(value: T): string | undefined {
    const eq = this._compareWith();
    return this._entries().find((e) => eq(e.value, value))?.label;
  }
}
