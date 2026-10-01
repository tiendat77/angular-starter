import { InjectionToken, Signal, WritableSignal } from '@angular/core';
import type { UiOptionComponent } from './option.component';
import type { UiSelectEmptyDirective } from './select-empty.directive';

/** What `[uiHighlight]` (and future option-level helpers) read from the surrounding select. */
export interface UiSelectContext {
  readonly searchTerm: Signal<string>;
}

export const UI_SELECT = new InjectionToken<UiSelectContext>('UI_SELECT');

/** What `ui-select` hands to its mobile bottom sheet (through `BOTTOM_SHEET_DATA`). */
export interface UiSelectSheetData<T> {
  title: string;
  multiple: boolean;
  searchable: boolean;
  /** Shared with the select, so debounced `(search)` events and server search keep working. */
  searchTerm: WritableSignal<string>;
  /** The options to render (already filtered by the search term). */
  options: Signal<readonly UiOptionComponent<T>[]>;
  loading: Signal<boolean>;
  emptyText: Signal<string>;
  emptyTemplate: Signal<UiSelectEmptyDirective | undefined>;
  /** Values selected when the sheet opened. */
  selected: T[];
  compareWith: (a: T, b: T) => boolean;
}
