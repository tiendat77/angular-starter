import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { UiTableFilterOption, UiTableModule, UiTableQueryParams } from '@libs/ui/table';
import { DocUser, makeUsers } from './table-doc.data';

const DB = makeUsers(243);

/** Fake API: filters, sorts and pages on the "server" after a delay. */
function fetchUsers(query: UiTableQueryParams): Promise<{ rows: DocUser[]; total: number }> {
  let rows = [...DB];
  for (const filter of query.filters) {
    const values = filter.value as string[];
    rows = rows.filter((row) => values.includes(String(row[filter.key as keyof DocUser])));
  }
  if (query.sort) {
    const { key, order } = query.sort;
    const direction = order === 'ascend' ? 1 : -1;
    rows.sort(
      (a, b) =>
        String(a[key as keyof DocUser]).localeCompare(String(b[key as keyof DocUser]), undefined, {
          numeric: true,
        }) * direction
    );
  }
  const start = (query.pageIndex - 1) * query.pageSize;
  const page = rows.slice(start, start + query.pageSize);
  return new Promise((resolve) =>
    setTimeout(() => resolve({ rows: page, total: rows.length }), 600)
  );
}

@Component({
  selector: 'doc-table-server-example',
  imports: [UiTableModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ui-table
      #t="uiTable"
      [data]="rows()"
      [rowKey]="byId"
      [frontPagination]="false"
      [total]="total()"
      [loading]="loading()"
      [(pageIndex)]="pageIndex"
      [(pageSize)]="pageSize"
      (queryParamsChange)="load($event)"
    >
      <table uiTableElement>
        <thead>
          <tr>
            <th uiTableSort="name">Name</th>
            <th
              uiTableFilter="role"
              [filters]="roleOptions"
            >
              Role
            </th>
            <th uiTableSort="age">Age</th>
          </tr>
        </thead>
        <tbody>
          @for (u of t.viewData(); track u.id) {
            <tr
              uiTableRow
              [row]="u"
            >
              <td>{{ u.name }}</td>
              <td>{{ u.role }}</td>
              <td>{{ u.age }}</td>
            </tr>
          }
        </tbody>
      </table>
    </ui-table>
  `,
})
export class DocTableServerExampleComponent {
  readonly rows = signal<DocUser[]>([]);
  readonly total = signal(0);
  readonly loading = signal(false);
  readonly pageIndex = signal(1);
  readonly pageSize = signal(10);
  readonly byId = (user: DocUser) => user.id;
  readonly roleOptions: UiTableFilterOption[] = [
    { text: 'Admin', value: 'Admin' },
    { text: 'Editor', value: 'Editor' },
    { text: 'Viewer', value: 'Viewer' },
  ];

  private requestId = 0;
  private destroyed = false;

  constructor() {
    inject(DestroyRef).onDestroy(() => (this.destroyed = true));
    void this.load({ pageIndex: 1, pageSize: 10, sort: null, filters: [] });
  }

  async load(query: UiTableQueryParams): Promise<void> {
    const id = ++this.requestId;
    this.loading.set(true);
    const result = await fetchUsers(query);
    if (this.destroyed || id !== this.requestId) return; // a newer request won
    this.rows.set(result.rows);
    this.total.set(result.total);
    this.loading.set(false);
  }
}
