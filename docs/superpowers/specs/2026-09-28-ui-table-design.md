# Design Specification: `@libs/ui/table` (Data Table)

## 1. Overview

The `@libs/ui/table` secondary entry point provides an enterprise data table modeled on NG-ZORRO's `nz-table`: a composition-based API over native `<table>` markup, driven by a headless signal store. It supports client-side and server-side data through a single `frontPagination` switch.

### Goals
- **Composable API:** consumers write `<thead>/<tr>/<th>/<td>` markup; features attach through directives. No `[columns]` config array.
- **Dual data mode:** local filter → sort → page by default; `frontPagination=false` delegates everything to the server through one `queryParamsChange` event.
- **Features:** single-column sorting, header filters (built-in list + custom template), key-based row selection that persists across pages, pagination, sticky header, sticky left/right fixed columns, density variants, loading (overlay + first-load skeleton), and empty state.
- **Accessibility:** native table semantics (`role="table"` via `<table>`). Keyboard users Tab between interactive controls (sort buttons, filter triggers, checkboxes, cell content). No `role="grid"` arrow-key navigation (out of scope, not planned).
- **Performance:** standalone, OnPush, Signals only (`input()`, `model()`, `output()`, `computed()`), zoneless compatible, no RxJS in the table itself.

### Non-goals
- Multi-column sort, column resizing/reordering, virtual scrolling, row expansion, tree data, cell editing, `role="grid"` navigation.

### Decisions recorded during brainstorming
| Topic | Decision |
|---|---|
| Data mode | Both local and server, switched by `frontPagination` (like `nzFrontPagination`) |
| Keyboard a11y | Native table semantics only |
| Selection identity | By `rowKey`, persisted across pages, two-way `[(selectedKeys)]` |
| Filter UI | Built-in list (single/multiple) + `uiTableFilterPanel` template slot |
| Foundation | Native `<table>` + directives + exported headless `UiTableStore` (not CDK Table) |
| Sort | Single column, cycling `sortDirections` (default `ascend → descend → null`) |

---

## 2. Architecture & Public API

### 2.1 Package Location
- Source: `libs/ui/table/`
- Entry point: `libs/ui/table/src/public-api.ts`
- Package config: `libs/ui/table/ng-package.json`
- Re-exported from: `libs/ui/src/public-api.ts`
- Distribution: `packages/ui/table/`
- Styles: `libs/ui/styles/components/table.css`, imported by `libs/ui/styles/index.css`

### 2.2 Files

| File | Responsibility |
|---|---|
| `table.types.ts` | `UiTableSortOrder`, `UiTableDensity`, `UiTableSelectionMode`, `UiTableFilterOption`, `UiTableQueryParams`, `UiTableColumnState`, fn types |
| `table.store.ts` | `UiTableStore`: pipeline, column registry, selection, fixed-column offsets |
| `table.component.ts` | `UiTable` shell (`ui-table`) |
| `table-element.directive.ts` | `UiTableElement` (`table[uiTableElement]`): classes, `aria-busy`, `min-width`, state `tbody` |
| `table-row.directive.ts` | `UiTableRow` |
| `table-cell.directive.ts` | `UiTableCell` (fixed columns, align, ellipsis) |
| `table-sort.component.ts` | `UiTableSort` |
| `table-filter.component.ts` | `UiTableFilter` + built-in list panel |
| `table-filter-panel.directive.ts` | `UiTableFilterPanel` template slot |
| `table-selection.component.ts` | `UiTableSelectAll`, `UiTableSelect` |
| `table-empty.directive.ts` | `UiTableEmpty` template slot |
| `table.i18n.ts` | `UI_TABLE_I18N` token + English defaults |
| `table.comparator.ts` | Default comparator |
| `table.variants.ts` | `cva()` variants |
| `public-api.ts` | Exports all of the above + `UI_TABLE` convenience array |

### 2.3 Building blocks

```
<ui-table #t="uiTable">                       UiTable (provides UiTableStore)
  <table uiTableElement>                        UiTableElement
    <colgroup><col [width]> …</colgroup>        (widths feed fixed-column offsets)
    <thead><tr>
      <th uiTableSelectAll [left]="true">       UiTableSelectAll (+ UiTableCell)
      <th uiTableSort="name">                   UiTableSort
      <th uiTableFilter="status">               UiTableFilter
        <ng-template uiTableFilterPanel let-ctx>  UiTableFilterPanel (optional)
    <tbody>
      @for (row of t.viewData(); track …)
        <tr uiTableRow [row]="row">             UiTableRow
          <td uiTableSelect>                    UiTableSelect
          <td uiTableCell [right]="true">       UiTableCell
  <ng-template uiTableEmpty>                    UiTableEmpty (optional)
  <paginator>                                   reused from @libs/ui/paginator
```

#### `UiTable<T, K = unknown>`
- **Selector:** `ui-table` · **exportAs:** `uiTable`
- **Content projection:** the consumer's `<table uiTableElement>` is projected into the scroll container; the `UiTableElement` directive (`table[uiTableElement]`) applies table classes and state to it (see 2.4).
- **Inputs:**
  - `data: readonly T[]` (default `[]`)
  - `rowKey: (row: T) => K` (required when `selectionMode !== 'none'`)
  - `loading: boolean` (default `false`)
  - `frontPagination: boolean` (default `true`)
  - `total: number` (server mode; ignored when `frontPagination`)
  - `pageIndex: model<number>` (1-based, default `1`)
  - `pageSize: model<number>` (default `10`)
  - `pageSizeOptions: number[]` (default `[10, 20, 50, 100]`)
  - `showPagination: boolean` (default `true`)
  - `selectionMode: 'none' | 'single' | 'multiple'` (default `'none'`)
  - `selectedKeys: model<ReadonlySet<K>>` (default empty set)
  - `density: 'compact' | 'middle' | 'default'` (default `'default'`)
  - `bordered: boolean`, `striped: boolean` (default `false`)
  - `scrollY: string | null`: max height of the body; enables sticky header
  - `scrollX: string | null`: min width of `<table>`; enables horizontal scroll
  - `class: string`: merged via `cn()`
- **Outputs:**
  - `queryParamsChange: UiTableQueryParams`: emitted on every user-initiated sort / filter / page / page-size change, in both modes
  - `pageIndexChange`, `pageSizeChange`, `selectedKeysChange` (from `model()`)
- **Public API:** `viewData: Signal<readonly T[]>`, `store: UiTableStore<T, K>`.

```ts
interface UiTableQueryParams {
  pageIndex: number;
  pageSize: number;
  sort: { key: string; order: 'ascend' | 'descend' } | null;
  filters: { key: string; value: unknown }[]; // only columns with a non-empty value
}
```

#### `UiTableRow<T>`
- **Selector:** `tr[uiTableRow]`
- **Inputs:** `row: T` (required)
- **Host:** class `table-row`; `[attr.aria-selected]` and `[attr.data-selected]` when selection is on and the row's key is selected.

#### `UiTableCell`
- **Selector:** `th[uiTableCell], td[uiTableCell], th[uiTableSort], th[uiTableFilter], th[uiTableSelectAll], td[uiTableSelect]`. The widened selector (rather than `hostDirectives`) lets feature cells accept the same inputs and lets `uiTableSort` + `uiTableFilter` share one `th` without the directive matching twice.
- **Inputs:** `left: boolean`, `right: boolean`, `align: 'start' | 'center' | 'end'`, `ellipsis: boolean`, `width: string | null`
- **Host:** `table-cell-fix-left|right` classes, `style.left|right` from the store's offsets, `text-align`, truncation.

#### `UiTableSort<T>`
- **Selector:** `th[uiTableSort]`
- **Inputs:** `uiTableSort: string` (column key, required), `sortFn: ((a: T, b: T) => number) | true | null` (`true` = default comparator; `null` = server-only), `sortDirections: UiTableSortOrder[]` (default `['ascend','descend',null]`), `sortOrder: model<UiTableSortOrder>` (default `null`)
- **Renders:** projected header content inside `<button type="button" class="table-sort">` with a stacked caret icon.
- **Host:** `[attr.aria-sort]`: `ascending | descending | none`.

#### `UiTableFilter<T>`
- **Selector:** `th[uiTableFilter]`
- **Inputs:** `uiTableFilter: string` (column key), `filters: UiTableFilterOption[]` (`{ text: string; value: unknown }`), `filterMultiple: boolean` (default `true`), `filterFn: ((value: unknown, row: T) => boolean) | null`, `filterValue: model<unknown>` (default `null`; array in multiple mode)
- **Renders:** projected header content + trigger `<button class="table-filter-trigger" aria-haspopup="dialog" [attr.aria-expanded]>`; overlay panel (built-in list or `UiTableFilterPanel` content).
- Can be combined with `uiTableSort` on the same `th`; the two share one column registration by key.

#### `UiTableFilterPanel`
- **Selector:** `ng-template[uiTableFilterPanel]` (content child of `UiTableFilter`)
- **Context:** `{ $implicit: value, value: Signal<unknown>, setValue(v): void, confirm(): void, reset(): void }`

#### `UiTableSelectAll` / `UiTableSelect<T>`
- **Selectors:** `th[uiTableSelectAll]`, `td[uiTableSelect]`
- `UiTableSelectAll` renders `ui-checkbox` bound to `store.allChecked()` / `store.indeterminate()`; renders nothing in `single` mode. `aria-label` from i18n ("Select all rows on this page").
- `UiTableSelect` inputs: `disabled: boolean`, `label: string` (row accessible name; default i18n "Select row"). Reads the row from the parent `UiTableRow`. Renders `ui-checkbox` (`multiple`) or a native `radio` with the `radio` utility (`single`).

#### `UiTableEmpty`
- **Selector:** `ng-template[uiTableEmpty]` (content child of `UiTable`)

### 2.4 Projection model
`ui-table` template:
```html
<div class="table-container" [attr.data-scroll-left] [attr.data-scroll-right] [style.max-height]="scrollY()">
  <ng-content select="table" />
  <!-- loading mask positioned over the container -->
</div>
<div class="table-footer"><paginator … /></div>
```
The consumer writes `<table uiTableElement>`; `UiTableElement` applies `table` + variant classes, `aria-busy`, `min-width` from `scrollX`, and renders the empty-state and skeleton rows into its own `<tbody>` inside the table (see 3.6).

### 2.5 Reused entries
- `ui-checkbox` (`@libs/ui/checkbox`): selection cells, built-in multi filter list
- `paginator` (`@libs/ui/paginator`): footer, with `hideTotal=false`, `pageSizeOptions`, 1-based `pageIndex`
- Menu positions (`@libs/ui/menu` `menu.positions.ts`): filter overlay placement
- `ui-spinner` (`@libs/ui/progress`): loading mask
- `btn` utilities: filter Reset/OK

### 2.6 Amendments made during planning
- `UiTableSort` and `UiTableFilter` are directives holding inputs and store registration. Rendering (sort button, filter trigger, overlay panel) lives in one internal component, `UiTableHeaderCell` (`th[uiTableSort], th[uiTableFilter]`), because Angular forbids two components on one element and a `th` may carry both. Consumers import `UI_TABLE`, which includes it.
- CSS utilities are prefixed `data-table` (`data-table`, `data-table-compact`, `data-table-row`, …). Tailwind's built-in `table`, `table-row`, `table-cell` display utilities would collide with `table*` names. Section 4 names map one-to-one by replacing `table` with `data-table`.
- `ui-checkbox` gains an `ariaLabel` input used by the selection cells.
- `UiTableFilterPanelContext.$implicit` is the context object itself: `let-ctx` gives `{ value, setValue, confirm, reset }`.
- Column sort/filter state lives in each directive's `sortOrder` / `filterValue` model and registers per directive (`registerSort` / `registerFilter`), not in a store-owned `UiTableColumnState` (this replaces the "returns (or reuses)" wording in 3.1). A column removed with `@if` drops its uncontrolled state and leaves the query; bind `[(sortOrder)]` / `[(filterValue)]` to keep it across hide/show.

---

## 3. Behavior

### 3.1 Store and column registry
`UiTableStore<T, K>` is provided by `UiTable` and injected by every directive. `UiTableSort`/`UiTableFilter` call `store.registerColumn(key)` on init, which returns (or reuses) a `UiTableColumnState` holding `sortFn`, `sortOrder`, `sortDirections`, `filterFn`, `filterValue` signals; `unregister` runs on destroy. Columns toggled via `@if` work without extra wiring. Column `sortOrder`/`filterValue` models stay in sync with store state in both directions.

### 3.2 Pipeline
Each stage is a `computed()`:
```
data ─► filtered ─► sorted ─► paged ─► viewData
```
- **filtered:** AND of all columns with a non-empty `filterValue` **and** a `filterFn`. Empty = `null`, `undefined`, `''`, or `[]`. Columns without `filterFn` are server-side and do not affect local data.
- **sorted:** the single column with non-null `sortOrder` and a non-null `sortFn`. Copies the array; relies on stable `Array.prototype.sort`. `descend` negates the comparator.
- **paged:** `slice((currentPage-1)*pageSize, currentPage*pageSize)` (see clamping in 3.4).
- **total:** `filtered().length` in local mode; `total` input in server mode.
- **Server mode (`frontPagination=false`):** filtered, sorted, and paged all pass `data` through unchanged.

### 3.3 Default comparator (`table.comparator.ts`)
Nulls/undefined last regardless of direction; numbers numerically; `Date` by `getTime()`; booleans false < true; strings via `localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })`. `sortFn: true` compares `row[key]`.

### 3.4 Interaction rules
- **Sort exclusivity:** activating a column's sort sets all other columns' `sortOrder` to `null`.
- **Sort cycle:** clicking advances through `sortDirections`, wrapping around.
- **Reset to page 1:** any sort or filter change sets `pageIndex` to 1.
- **Clamping:** the store exposes `currentPage = computed(() => clamp(pageIndex(), 1, lastPage()))` where `lastPage = max(1, ceil(total/pageSize))`. Slicing and the paginator use `currentPage`; the `pageIndex` model is not written, so no write-in-computed or `effect()` is needed. The next user action emits and writes the clamped value.
- **Page size change:** resets `pageIndex` to 1.
- **Events:** each user action updates state, then emits exactly one `queryParamsChange` with a full snapshot. Emitted from action handlers, never from `effect()`, so programmatic input changes do not emit.
- **Data change:** sort/filter/selection state is preserved.

### 3.5 Selection
- `selectedKeys: model<ReadonlySet<K>>`; every change replaces the set (never mutates).
- **Selectable rows on page:** `viewData()` rows whose `UiTableSelect` is not `disabled`. Disabled state is registered by `UiTableSelect` into the store keyed by row key.
- `allChecked` = page has ≥1 selectable row and all are selected. `indeterminate` = some but not all selected.
- **Master toggle:** if `allChecked`, removes page-selectable keys; else adds them. Keys from other pages are untouched.
- **Single mode:** selecting a row sets `{key}`; no master checkbox.
- `store.selectedRows()`: rows in current `data` whose key is selected.
- **Dev-mode checks:** selection on without `rowKey` → throws `Error('[ui-table] rowKey is required when selectionMode is not "none"')`. Duplicate keys in `data` → `console.warn` once per data change.

### 3.6 Loading and empty
- `loading && data.length > 0`: `table-loading-mask` overlay (60% background) with centered `ui-spinner`; rows remain; `aria-busy="true"` on `<table>`.
- `loading && data.length === 0`: skeleton `<tbody>` with `min(pageSize, 10)` rows × header cell count of `table-skeleton` bars; `aria-busy="true"`.
- `!loading && viewData().length === 0`: a `<tbody>` with one row, one `td` with `colspan` = registered header cell count (counted by `UiTableCell` instances inside `thead`, falling back to `<th>` count read after render), containing `UiTableEmpty` template or default (icon + i18n "No data").
- **Column count** (for `colspan` and skeleton cells): `UiTableElement` reads the first `thead tr`, sums each cell's `colSpan`, in `afterRenderEffect` and stores it in a signal (defaults to 1 before first render).
- **State body placement:** `UiTableElement` appends its own `<tbody class="table-state-body">` to the `<table>` via `Renderer2`, creates the skeleton/empty embedded views through `ViewContainerRef.createEmbeddedView`, and moves their root nodes into that `tbody` (views stay attached for change detection and are destroyed when the state ends).

### 3.7 Filter panel
- CDK Connected Overlay, positions from the menu presets (`bottom-end` preferred, auto-flip), backdrop transparent.
- Panel `role="dialog"`, `aria-label` = i18n "Filter {header text}", `cdkTrapFocus` + `cdkTrapFocusAutoCapture`.
- Escape or outside click closes without applying and restores focus to the trigger.
- **Built-in list:** checkboxes (`filterMultiple`) or radios. Selections are staged in a local signal; **OK** commits to `filterValue`, **Reset** commits the empty value; both close the panel and trigger 3.4 rules.
- **Template panel:** `setValue` stages; `confirm()` commits and closes; `reset()` commits empty and closes.
- Trigger shows active state (`data-active`) when `filterValue` is non-empty.

### 3.8 Sticky header and fixed columns
- `scrollY` set → container `overflow: auto; max-height: scrollY`; `thead th` get `position: sticky; top: 0; z-index: 2`.
- `scrollX` set → container `overflow-x: auto`; `<table>` `min-width: scrollX`.
- **Offsets:** column widths are read from `<col [width]>` (preferred) or `UiTableCell.width`. The store computes cumulative left offsets over leading `left` columns and cumulative right offsets over trailing `right` columns by column index. A fixed cell whose width cannot be resolved triggers a dev-mode `console.warn` and falls back to offset `0`.
- Fixed cells: `position: sticky; z-index: 1`; fixed header cells `z-index: 3`.
- **Edge shadows:** a passive `scroll` listener (registered outside any change-detection path, written directly to DOM attributes) sets `data-scroll-left` when `scrollLeft > 0` and `data-scroll-right` when not scrolled to the end. CSS shows the shadow `::after` on the last left-fixed / first right-fixed cell (`data-fix-edge` set by the store) only when the matching attribute is present. Recomputed on `ResizeObserver` of the container.

### 3.9 Accessibility summary
| Element | Semantics |
|---|---|
| `<table>` | native table; `aria-busy` while loading |
| Sortable `th` | `aria-sort`; content in `<button>`; sort change announced via `LiveAnnouncer` ("Sorted by {col}, ascending") |
| Filter trigger | `<button aria-haspopup="dialog" aria-expanded aria-label="Filter {col}">` |
| Filter panel | `role="dialog"`, focus trapped, Escape closes, focus restored |
| Selected row | `aria-selected="true"` |
| Checkboxes | labeled via i18n / `label` input |
| Focus | `focus-visible` ring on all controls, inset so sticky neighbors don't clip it |

### 3.10 i18n
`UI_TABLE_I18N` (`InjectionToken<UiTableI18n>`, provided in root with English defaults): `selectAll`, `selectRow`, `filter(col)`, `filterReset`, `filterConfirm`, `empty`, `sortedAscending(col)`, `sortedDescending(col)`, `sortCleared(col)`.

---

## 4. Styling

### 4.1 `table.css` utilities
All colors come from semantic tokens; dark mode needs no extra rules.

| Utility | Purpose |
|---|---|
| `table-container` | relative, `overflow: auto`, rounded, `border` on `--color-border` |
| `table` | `width: 100%`, `border-collapse: separate`, `border-spacing: 0`, text on `--color-foreground` |
| cell base (`table th, table td`) | `padding: var(--table-cell-py) var(--table-cell-px)`, `font-size: var(--table-fs)`, bottom border, background `--color-background` |
| header cells | background `--color-muted`, color `--color-muted-foreground`, weight 500 |
| `table-compact` / `table-middle` / `table-default` | set `--table-cell-py/px` to 8/8, 12/8, 16/16 px and `--table-fs` |
| `table-bordered` | vertical cell borders + outer border |
| `table-striped` | even rows `color-mix(in oklab, var(--color-muted) 40%, var(--color-background))` |
| `table-row` | hover: `color-mix(… --color-muted 50% …)`; `[data-selected]`: `color-mix(in oklab, var(--color-primary) 8%, var(--color-background))`, 12% on hover; applied to cells so fixed cells match |
| `table-sort` | full-width reset button, `justify-content: space-between`; caret `--color-muted-foreground`, active direction `--color-primary` |
| `table-filter-trigger` | icon button; `[data-active]` → `--color-primary` |
| `table-filter-panel` | background `--color-background`, border, shadow, radius, min-width 10rem, footer with `btn btn-xs` Reset/OK |
| `table-cell-fix-left` / `-right` | `position: sticky`, `z-index: 1`; edge shadow `::after` gated by container `[data-scroll-*]` + cell `[data-fix-edge]` |
| `table-loading-mask` | absolute inset, `color-mix(… --color-background 60%, transparent)`, centered spinner |
| `table-skeleton` | shimmer bar; animation disabled under `prefers-reduced-motion` |
| `table-empty` | centered muted content, vertical padding |
| focus | `:focus-visible` → `outline: 2px solid var(--color-primary); outline-offset: -2px` |

### 4.2 `table.variants.ts`
```ts
export const tableVariants = cva('table', {
  variants: {
    density: { compact: 'table-compact', middle: 'table-middle', default: 'table-default' },
    bordered: { true: 'table-bordered' },
    striped: { true: 'table-striped' },
  },
  defaultVariants: { density: 'default' },
});
```

---

## 5. Usage example (target for docs)

```html
<ui-table
  #t="uiTable"
  [data]="users()"
  [rowKey]="byId"
  [loading]="loading()"
  selectionMode="multiple"
  [(selectedKeys)]="selected"
  [(pageIndex)]="page"
  [(pageSize)]="size"
  density="middle"
  scrollY="480px"
  scrollX="1000px"
>
  <table uiTableElement>
    <colgroup>
      <col width="48px" /><col width="220px" /><col /><col width="160px" /><col width="120px" />
    </colgroup>
    <thead>
      <tr>
        <th uiTableSelectAll [left]="true"></th>
        <th uiTableSort="name" [sortFn]="true" [left]="true">
          Name
          <!-- same th can also filter -->
        </th>
        <th uiTableSort="email" [sortFn]="true" uiTableFilter="email" [filterFn]="emailContains">
          Email
          <ng-template uiTableFilterPanel let-ctx>
            <input class="input input-sm" [value]="ctx.value() ?? ''" (input)="ctx.setValue($any($event.target).value)" />
            <button uiButton size="sm" (click)="ctx.confirm()">Search</button>
          </ng-template>
        </th>
        <th uiTableFilter="status" [filters]="statusOptions" [filterFn]="statusIn">Status</th>
        <th uiTableCell [right]="true">Actions</th>
      </tr>
    </thead>
    <tbody>
      @for (u of t.viewData(); track u.id) {
        <tr uiTableRow [row]="u">
          <td uiTableSelect [left]="true" [label]="'Select ' + u.name"></td>
          <td uiTableCell [left]="true">{{ u.name }}</td>
          <td uiTableCell [ellipsis]="true">{{ u.email }}</td>
          <td><ui-tag [color]="u.status === 'active' ? 'success' : 'warning'">{{ u.status }}</ui-tag></td>
          <td uiTableCell [right]="true"><button uiButton variant="ghost" size="sm">Edit</button></td>
        </tr>
      }
    </tbody>
  </table>

  <ng-template uiTableEmpty>No users match these filters.</ng-template>
</ui-table>
```

Server mode: add `[frontPagination]="false" [total]="total()" (queryParamsChange)="load($event)"`, and omit `filterFn`/`sortFn` (or leave them; they are ignored in server mode).

---

## 6. Testing

Vitest, test-first, host-component pattern as in `paginator.spec.ts`.

| Spec | Covers |
|---|---|
| `table.comparator.spec.ts` | numbers, strings (numeric collation), dates, booleans, nulls last in both directions |
| `table.store.spec.ts` | filter AND, server-side columns ignored locally, stable sort, sort exclusivity, cycle, page slicing, reset-to-1, clamping, server passthrough, `total`, selection across pages, `allChecked`/`indeterminate`, disabled rows, single mode, `selectedRows`, dev-mode errors/warnings |
| `table.component.spec.ts` | `viewData` rendering, `queryParamsChange` payload and single emission per action, no emission on programmatic input changes, `[(pageIndex)]`/`[(selectedKeys)]` round-trip, paginator wiring |
| `table-sort.spec.ts` | click cycles `aria-sort`, LiveAnnouncer message, custom `sortDirections` |
| `table-filter.spec.ts` | trigger ARIA, panel opens/closes, staging until OK, Reset, Escape restores focus, template panel `confirm`/`reset`, active indicator |
| `table-selection.spec.ts` | master checked/indeterminate, toggle scope, row `aria-selected`, single-mode radios |
| `table-states.spec.ts` | loading mask + `aria-busy`, skeleton on first load, empty template + `colspan` |
| `table-fixed.spec.ts` | left/right offsets from `<col>` widths, missing-width warning, `data-fix-edge`, scroll attributes |
| `table.variants.spec.ts` | density / bordered / striped classes |

---

## 7. Docs

A "Table" page in the docs app's **Data & Media** group:
- **Playground:** toggles for density, bordered, striped, loading, empty, scrollY, fixed columns, selection mode.
- **Full example:** section 5 with a bulk-action bar ("3 selected · Delete") driven by `selectedKeys`.
- **Server mode example:** mock API with artificial latency using `queryParamsChange`.
- **API tables** for every public component/directive.
- Update `docs/ui-roadmap-status.md` entry list, styling table, and scorecard.

---

## 8. Delivery

One implementation plan with two phases and a review checkpoint after each:

1. **Phase 1:** types, comparator, store (pipeline, sort, selection, paging), `UiTable`, `UiTableElement`, `UiTableRow`, `UiTableCell` (align/ellipsis), `UiTableSort`, `UiTableSelectAll`/`UiTableSelect`, `UiTableEmpty`, loading/skeleton, paginator footer, density/bordered/striped styles, i18n, their specs, docs page with playground.
2. **Phase 2:** `UiTableFilter` + built-in list + `UiTableFilterPanel`, sticky header, fixed columns with offsets and edge shadows, their specs, full and server-mode docs examples, roadmap update.
