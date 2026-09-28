import { InjectionToken } from '@angular/core';

export interface UiTableI18n {
  selectAll: string;
  selectRow: string;
  filter: (column: string) => string;
  filterReset: string;
  filterConfirm: string;
  empty: string;
  sortedAscending: (column: string) => string;
  sortedDescending: (column: string) => string;
  sortCleared: (column: string) => string;
}

export const UI_TABLE_I18N_EN: UiTableI18n = {
  selectAll: 'Select all rows on this page',
  selectRow: 'Select row',
  filter: (column) => (column ? `Filter ${column}` : 'Filter'),
  filterReset: 'Reset',
  filterConfirm: 'OK',
  empty: 'No data',
  sortedAscending: (column) => `Sorted by ${column}, ascending`,
  sortedDescending: (column) => `Sorted by ${column}, descending`,
  sortCleared: (column) => `Sorting by ${column} cleared`,
};

export const UI_TABLE_I18N = new InjectionToken<UiTableI18n>('UI_TABLE_I18N', {
  providedIn: 'root',
  factory: () => UI_TABLE_I18N_EN,
});
