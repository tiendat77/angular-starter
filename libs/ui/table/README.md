# Table

A data table that keeps your markup: you write the `<table>`, the table adds sorting, filtering, pagination, row selection, fixed columns, density and loading / empty states. Sorting, filtering and paging run in the browser (`frontPagination`), or on your server: then the table only reports the query.

```ts
import { UiTableModule } from '@libs/ui/table';   // all the directives below
```

## Usage

```html
<ui-table
  #t="uiTable"
  [data]="users()"
  [rowKey]="byId"
  [loading]="loading()"
  selectionMode="multiple"
  density="middle"
  striped
  [(selectedKeys)]="selected"
  [(pageIndex)]="pageIndex"
  [(pageSize)]="pageSize"
>
  <table uiTableElement>
    <thead>
      <tr>
        <th uiTableSelectAll></th>
        <th uiTableSort="name" [sortFn]="true">Name</th>
        <th uiTableSort="age" [sortFn]="byAge">Age</th>
        <th uiTableFilter="role" [filters]="roles" [filterFn]="byRole">Role</th>
        <th uiTableCell align="end" right>Status</th>
      </tr>
    </thead>
    <tbody>
      @for (user of t.viewData(); track user.id) {
        <tr uiTableRow [row]="user">
          <td uiTableSelect [label]="'Select ' + user.name"></td>
          <td>{{ user.name }}</td>
          <td>{{ user.age }}</td>
          <td>{{ user.role }}</td>
          <td uiTableCell align="end" right>{{ user.status }}</td>
        </tr>
      }
    </tbody>
  </table>

  <ng-template uiTableEmpty>Nothing here yet.</ng-template>
</ui-table>
```

```ts
byId = (user: User) => user.id;                 // a stable key per row
byAge = (a: User, b: User) => a.age - b.age;     // sortFn: true sorts by row[key]
roles = [{ text: 'Admin', value: 'admin' }, { text: 'Member', value: 'member' }];
byRole = (value: unknown, row: User) => row.role === value;
```

Rows to render come from `t.viewData()`: the data after filtering, sorting and paging.

**Server side:** set `[frontPagination]="false"` and `[total]="total()"`, give the columns `uiTableSort` / `uiTableFilter` without a `sortFn` / `filterFn`, and load the data on `(queryParamsChange)`:

```ts
onQuery(q: UiTableQueryParams): void {
  // { pageIndex, pageSize, sort: { key, order } | null, filters: [{ key, value }] }
  this.load(q);
}
```

Texts (sort and filter announcements, "no data", the select labels) can be translated through the `UI_TABLE_I18N` token.

## API

### `ui-table`

| Input             | Type                                 | Default             | Description                                               |
| ----------------- | ------------------------------------ | ------------------- | --------------------------------------------------------- |
| `data`            | `readonly T[]`                       | `[]`                | The rows.                                                 |
| `rowKey`          | `(row: T) => K`                      | –                   | A stable key per row. Required for selection.             |
| `loading`         | `boolean`                            | `false`             | Skeleton rows.                                            |
| `frontPagination` | `boolean`                            | `true`              | The table pages (and sorts and filters) by itself.        |
| `total`           | `number`                             | –                   | Total rows when the server pages (`frontPagination` off). |
| `pageIndex`       | `number` (`model`)                   | `1`                 | Current page, from 1. Two-way.                            |
| `pageSize`        | `number` (`model`)                   | `10`                | Rows per page. Two-way.                                   |
| `pageSizeOptions` | `number[]`                           | `[10, 20, 50, 100]` | Sizes the user can choose.                                |
| `selectionMode`   | `'none' \| 'single' \| 'multiple'`   | `'none'`            | Row selection (checkbox or radio cells).                  |
| `selectedKeys`    | `ReadonlySet<K>` (`model`)           | `new Set()`         | The keys of the selected rows. Two-way.                   |
| `density`         | `'compact' \| 'middle' \| 'default'` | `'default'`         | Row height.                                               |
| `bordered`        | `boolean`                            | `false`             | Cell borders.                                             |
| `striped`         | `boolean`                            | `false`             | Zebra rows.                                               |
| `scrollY`         | `string \| null`                     | `null`              | Max body height (`'400px'`); makes the header sticky.     |
| `scrollX`         | `string \| null`                     | `null`              | Min table width (`'1000px'`); scrolls horizontally.       |

| Output              | Type                 | Description                                                     |
| ------------------- | -------------------- | --------------------------------------------------------------- |
| `queryParamsChange` | `UiTableQueryParams` | The page, sort or filter changed. Use it to load from a server. |

`t.viewData()` (with `#t="uiTable"`) is the rows of the current page.

### Columns and cells

| Directive                         | Inputs                                                                                                                                                                | Use                                                                    |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `table[uiTableElement]`           | –                                                                                                                                                                     | Marks your `<table>`.                                                  |
| `th[uiTableSort]`                 | `uiTableSort` (key), `sortFn` (`true` \| `(a, b) => number` \| `null` = server), `sortDirections` (`['ascend', 'descend', null]`), `sortOrder` (`model`)              | A sortable column.                                                     |
| `th[uiTableFilter]`               | `uiTableFilter` (key), `filters` (`{ text, value }[]`), `filterMultiple` (`true`), `filterFn` (`(value, row) => boolean` \| `null` = server), `filterValue` (`model`) | A filterable column.                                                   |
| `th[uiTableSelectAll]`            | –                                                                                                                                                                     | The header checkbox (`selectionMode="multiple"`).                      |
| `tr[uiTableRow]`                  | `row` (required)                                                                                                                                                      | A row.                                                                 |
| `td[uiTableSelect]`               | `label`, `disabled`                                                                                                                                                   | The row checkbox or radio (inside `uiTableRow`).                       |
| `th/td[uiTableCell]`              | `left`, `right` (fixed columns), `align` (`'start' \| 'center' \| 'end'`), `ellipsis`, `width`                                                                        | Cell options; the other column directives accept `left` / `right` too. |
| `ng-template[uiTableEmpty]`       | –                                                                                                                                                                     | Custom empty state.                                                    |
| `ng-template[uiTableFilterPanel]` | –                                                                                                                                                                     | Custom filter UI inside `th[uiTableFilter]` (`let-ctx`).               |

A sort or filter column can also be driven from code: `toggle()` on the sort directive; `open()`, `close()`, `confirm()`, `reset()` on the filter (`#f="uiTableFilter"`).
