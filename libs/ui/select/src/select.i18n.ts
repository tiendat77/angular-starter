import { InjectionToken, Provider } from '@angular/core';

/** Strings of the mobile bottom sheet of `ui-select`. */
export interface UiSelectI18n {
  /** Dismisses the sheet and discards the pending selection. */
  cancel: string;
  /** Commits the pending selection and closes the sheet. */
  apply: string;
  /** Placeholder of the search box inside the sheet (searchable selects). */
  searchPlaceholder: string;
}

export const UI_SELECT_I18N_EN: UiSelectI18n = {
  cancel: 'Cancel',
  apply: 'Apply',
  searchPlaceholder: 'Search',
};

export const UI_SELECT_I18N = new InjectionToken<UiSelectI18n>('UI_SELECT_I18N', {
  providedIn: 'root',
  factory: () => UI_SELECT_I18N_EN,
});

/** Overrides some of the strings, e.g. `provideUiSelectI18n({ cancel: 'Hủy', apply: 'Áp dụng' })`. */
export function provideUiSelectI18n(overrides: Partial<UiSelectI18n>): Provider {
  return { provide: UI_SELECT_I18N, useValue: { ...UI_SELECT_I18N_EN, ...overrides } };
}
