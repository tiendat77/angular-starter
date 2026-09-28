import { UiTableCell } from './table-cell.directive';
import { UiTableElement } from './table-element.directive';
import { UiTableEmpty } from './table-empty.directive';
import { UiTableFilterPanel } from './table-filter-panel.directive';
import { UiTableFilter } from './table-filter.directive';
import { UiTableHeaderCell } from './table-header-cell.component';
import { UiTableRow } from './table-row.directive';
import { UiTableSelect, UiTableSelectAll } from './table-selection.component';
import { UiTableSort } from './table-sort.directive';
import { UiTable } from './table.component';

/** Everything a template needs to build a table. Import this instead of individual pieces. */
export const UI_TABLE = [
  UiTable,
  UiTableElement,
  UiTableRow,
  UiTableCell,
  UiTableEmpty,
  UiTableSelectAll,
  UiTableSelect,
  UiTableSort,
  UiTableFilter,
  UiTableFilterPanel,
  UiTableHeaderCell,
] as const;
