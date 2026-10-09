# Paginator

Navigation between pages of data: numbered pages (with ellipses for long lists), previous / next, optional first / last, and a page-size selector. It holds no data: you give it `length`, `pageSize` and `pageIndex`, and load the page when it emits `(page)`.

```ts
import { Paginator, PageEvent } from '@libs/ui/paginator';
```

## Usage

```ts
@Component({
  imports: [Paginator],
  template: `
    <paginator
      [length]="total()"
      [pageSize]="pageSize()"
      [pageIndex]="pageIndex()"
      [showFirstLastButtons]="true"
      (page)="onPage($event)"
    />
  `,
})
export class Users {
  readonly total = signal(95);
  readonly pageSize = signal(10);
  readonly pageIndex = signal(0);

  onPage(event: PageEvent): void {
    this.pageSize.set(event.pageSize);
    this.pageIndex.set(event.pageIndex);
    this.load(event.pageIndex, event.pageSize);
  }
}
```

App-wide defaults: `{ provide: PAGINATOR_DEFAULT_OPTIONS, useValue: { pageSize: 25, pageSizeOptions: [25, 50, 100] } }`.

## API

### `paginator`

| Input                  | Type       | Default             | Description                                                  |
| ---------------------- | ---------- | ------------------- | ------------------------------------------------------------ |
| `length`               | `number`   | `0`                 | Total number of items.                                       |
| `pageIndex`            | `number`   | `0`                 | Zero-based index of the page shown.                          |
| `pageSize`             | `number`   | `50`                | Items per page.                                              |
| `pageSizeOptions`      | `number[]` | `[10, 25, 50, 100]` | Sizes the user can choose from.                              |
| `hidePageSize`         | `boolean`  | `false`             | Hides the page-size selector.                                |
| `pageSizeLabel`        | `string`   | `'Page size:'`      | Label of the page-size selector.                             |
| `hideTotal`            | `boolean`  | `true`              | Hides the total count.                                       |
| `showFirstLastButtons` | `boolean`  | `false`             | Adds first / last page buttons.                              |
| `autoHide`             | `boolean`  | `true`              | Hides the paginator when there are no pages (`length` is 0). |
| `disabled`             | `boolean`  | `false`             | Disables every control.                                      |

| Output | Type        | Description                        |
| ------ | ----------- | ---------------------------------- |
| `page` | `PageEvent` | The page or the page size changed. |

`PageEvent`: `{ pageIndex, previousPageIndex?, pageSize, length? }`.

Methods (use a template reference or `viewChild`): `nextPage()`, `previousPage()`, `firstPage()`, `lastPage()`, `selectPage(index)`, `hasNextPage()`, `hasPreviousPage()`, `getNumberOfPages()`.
