/** What a filter function receives for each option. */
export interface UiSelectOptionRef<T> {
  readonly value: T;
  readonly label: string;
  readonly disabled: boolean;
}

export type UiSelectFilterFn<T> = (term: string, option: UiSelectOptionRef<T>) => boolean;

/** Lower-cases and removes diacritics (NFD + combining marks), folding Vietnamese đ/Đ to d. */
export function normalizeForSearch(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
}

/** Default filter: case- and accent-insensitive "label contains the trimmed term". */

export const uiDefaultFilter: UiSelectFilterFn<any> = (term, option) => {
  const needle = normalizeForSearch(term.trim());
  return needle === '' || normalizeForSearch(option.label).includes(needle);
};
