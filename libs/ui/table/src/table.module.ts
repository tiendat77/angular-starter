import { NgModule } from '@angular/core';

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

const TABLE_DECLARATIONS = [
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
];

/** Everything a template needs to build a table. Import this instead of the individual pieces. */
@NgModule({
  imports: TABLE_DECLARATIONS,
  exports: TABLE_DECLARATIONS,
})
export class UiTableModule {}
