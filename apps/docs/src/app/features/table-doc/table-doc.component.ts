import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UI_TABLE, UiTableDensity, UiTableQueryParams, UiTableSelectionMode } from '@libs/ui/table';
import { UiTagComponent } from '@libs/ui/tag';
import { ApiRow, ApiTableComponent } from '../../shared/api-table/api-table.component';
import { PlaygroundComponent } from '../../shared/playground/playground.component';
import { DocTableFullExampleComponent } from './table-doc-full.component';
import { DocTableServerExampleComponent } from './table-doc-server.component';
import { DocUser, makeUsers } from './table-doc.data';

@Component({
  selector: 'doc-table',
  imports: [
    DatePipe,
    FormsModule,
    UI_TABLE,
    UiTagComponent,
    PlaygroundComponent,
    ApiTableComponent,
    DocTableFullExampleComponent,
    DocTableServerExampleComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './table-doc.component.html',
})
export class TableDocComponent {
  private readonly allUsers = makeUsers(57);

  // Playground state
  readonly density = signal<UiTableDensity>('default');
  readonly bordered = signal(false);
  readonly striped = signal(false);
  readonly loading = signal(false);
  readonly empty = signal(false);
  readonly selectionMode = signal<UiTableSelectionMode>('multiple');
  readonly pageIndex = signal(1);
  readonly pageSize = signal(10);
  readonly selected = signal<ReadonlySet<number>>(new Set());
  readonly lastQuery = signal<UiTableQueryParams | null>(null);

  readonly users = computed(() => (this.empty() ? [] : this.allUsers));
  readonly byId = (user: DocUser) => user.id;
  readonly byAge = (a: DocUser, b: DocUser) => a.age - b.age;

  readonly statusColor = { active: 'success', invited: 'info', suspended: 'warning' } as const;

  readonly generatedCode = computed(() => {
    const attrs = [
      '#t="uiTable"',
      '[data]="users"',
      '[rowKey]="byId"',
      `selectionMode="${this.selectionMode()}"`,
      '[(selectedKeys)]="selected"',
      `density="${this.density()}"`,
    ];
    if (this.bordered()) attrs.push('bordered');
    if (this.striped()) attrs.push('striped');
    if (this.loading()) attrs.push('[loading]="true"');
    attrs.push('(queryParamsChange)="onQuery($event)"');
    return `<ui-table\n  ${attrs.join('\n  ')}\n>
  <table uiTableElement>
    <thead>
      <tr>
        <th uiTableSelectAll></th>
        <th uiTableSort="name" [sortFn]="true">Name</th>
        <th uiTableSort="age" [sortFn]="byAge">Age</th>
        <th>Role</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      @for (u of t.viewData(); track u.id) {
        <tr uiTableRow [row]="u">
          <td uiTableSelect [label]="'Select ' + u.name"></td>
          <td>{{ u.name }}</td>
          <td>{{ u.age }}</td>
          <td>{{ u.role }}</td>
          <td><ui-tag>{{ u.status }}</ui-tag></td>
        </tr>
      }
    </tbody>
  </table>
</ui-table>`;
  });

  readonly tableApi: ApiRow[] = [
    {
      name: 'data',
      type: 'readonly T[]',
      default: '[]',
      description: 'Rows. In server mode, the current page only.',
    },
    {
      name: 'rowKey',
      type: '(row: T) => K',
      description: 'Row identity. Required when selectionMode is not "none".',
    },
    {
      name: 'frontPagination',
      type: 'boolean',
      default: 'true',
      description: 'false = server mode: no local filter/sort/page; listen to queryParamsChange.',
    },
    {
      name: 'total',
      type: 'number',
      description: 'Total rows in server mode. Falls back to data.length.',
    },
    { name: '[(pageIndex)]', type: 'number', default: '1', description: 'Current page, 1-based.' },
    { name: '[(pageSize)]', type: 'number', default: '10', description: 'Rows per page.' },
    {
      name: 'pageSizeOptions',
      type: 'number[]',
      default: '[10, 20, 50, 100]',
      description: 'Page size choices.',
    },
    {
      name: 'showPagination',
      type: 'boolean',
      default: 'true',
      description: 'Show the paginator below the table.',
    },
    {
      name: 'loading',
      type: 'boolean',
      default: 'false',
      description: 'Spinner mask over rows; skeleton rows when data is empty.',
    },
    {
      name: 'selectionMode',
      type: "'none' | 'single' | 'multiple'",
      default: "'none'",
      description: 'Row selection with uiTableSelect / uiTableSelectAll cells.',
    },
    {
      name: '[(selectedKeys)]',
      type: 'ReadonlySet<K>',
      default: 'empty',
      description: 'Selected row keys, kept across pages.',
    },
    {
      name: 'density',
      type: "'compact' | 'middle' | 'default'",
      default: "'default'",
      description: 'Cell padding and font size.',
    },
    {
      name: 'bordered / striped',
      type: 'boolean',
      default: 'false',
      description: 'Vertical cell borders / zebra rows.',
    },
    { name: 'scrollY', type: 'string', description: 'Max body height; enables the sticky header.' },
    {
      name: 'scrollX',
      type: 'string',
      description: 'Min table width; enables horizontal scroll and fixed columns.',
    },
    {
      name: '(queryParamsChange)',
      type: 'UiTableQueryParams',
      description: '{ pageIndex, pageSize, sort, filters } after every user change, in both modes.',
    },
    {
      name: '#t="uiTable"',
      type: 'UiTable',
      description: 't.viewData() is the rows to render; t.store.selectedRows() for bulk actions.',
    },
  ];

  readonly columnApi: ApiRow[] = [
    {
      name: 'th[uiTableSort]',
      type: 'string (column key)',
      description:
        'Sortable header. Inputs: sortFn (fn | true | null), sortDirections, [(sortOrder)].',
    },
    {
      name: 'th[uiTableSelectAll]',
      type: 'component',
      description: 'Master checkbox (checked / indeterminate) for the rows on the page.',
    },
    {
      name: 'td[uiTableSelect]',
      type: 'component',
      description: 'Row checkbox or radio. Inputs: disabled, label (accessible name).',
    },
    {
      name: 'tr[uiTableRow]',
      type: 'directive',
      description: 'Required on body rows. Input: row. Sets aria-selected / data-selected.',
    },
    { name: 'ng-template[uiTableEmpty]', type: 'template', description: 'Custom empty state.' },
    {
      name: 'UI_TABLE_I18N',
      type: 'InjectionToken<UiTableI18n>',
      description: 'Labels and screen-reader announcements.',
    },
    {
      name: 'th[uiTableFilter]',
      type: 'string (column key)',
      description:
        'Filterable header. Inputs: filters, filterMultiple, filterFn (null = server), [(filterValue)]. Choices apply on OK. Hiding the column drops its filter unless [(filterValue)] is bound.',
    },
    {
      name: 'ng-template[uiTableFilterPanel]',
      type: 'template',
      description:
        'Custom filter UI. let-ctx: ctx.value(), ctx.setValue(v), ctx.confirm(), ctx.reset().',
    },
    {
      name: '[uiTableCell]',
      type: 'directive',
      description:
        'On any th/td. Inputs: left / right (fixed; declare widths with <col width>), align, ellipsis, width.',
    },
  ];

  onQuery(params: UiTableQueryParams): void {
    this.lastQuery.set(params);
  }
}
