import { InjectionToken, Signal } from '@angular/core';

/** What `[uiHighlight]` (and future option-level helpers) read from the surrounding select. */
export interface UiSelectContext {
  readonly searchTerm: Signal<string>;
}

export const UI_SELECT = new InjectionToken<UiSelectContext>('UI_SELECT');
