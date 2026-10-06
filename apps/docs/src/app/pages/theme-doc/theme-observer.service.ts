import { DOCUMENT } from '@angular/common';
import { DestroyRef, inject, Injectable, signal } from '@angular/core';

/**
 * Counts changes of the `data-theme` attribute on `<html>` (the docs header toggles it), so values
 * read from computed styles can refresh when the theme flips.
 */
@Injectable({ providedIn: 'root' })
export class ThemeObserver {
  /** Increments every time the theme attribute changes. */
  readonly version = signal(0);

  constructor() {
    const root = inject(DOCUMENT).documentElement;
    const observer = new MutationObserver(() => this.version.update((v) => v + 1));
    observer.observe(root, { attributes: true, attributeFilter: ['data-theme'] });
    inject(DestroyRef).onDestroy(() => observer.disconnect());
  }
}
