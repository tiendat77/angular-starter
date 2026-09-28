import { Injectable, computed, signal } from '@angular/core';
import { compareValues, isEmptyFilterValue } from './table.comparator';
import {
  UiTableFilterRegistration,
  UiTableLayout,
  UiTableQueryParams,
  UiTableSelectableRegistration,
  UiTableSortFn,
  UiTableSortOrder,
  UiTableSortRegistration,
  UiTableStoreSources,
} from './table.types';

function readField(row: unknown, key: string): unknown {
  return row === null || row === undefined ? undefined : (row as Record<string, unknown>)[key];
}

function withEntry<V>(map: ReadonlyMap<string, V>, key: string, value: V): Map<string, V> {
  return new Map(map).set(key, value);
}

function withoutEntry<V>(
  map: ReadonlyMap<string, V>,
  key: string,
  value: V
): ReadonlyMap<string, V> {
  if (map.get(key) !== value) return map;
  const next = new Map(map);
  next.delete(key);
  return next;
}

const ROW_KEY_ERROR = '[ui-table] rowKey is required when selectionMode is not "none"';
const EMPTY_LAYOUT: UiTableLayout = { columnCount: 1, widths: [], leftEdge: -1, rightEdge: -1 };
let nextStoreId = 0;

function sumWidths(widths: readonly (string | null)[]): string {
  const defined = widths.filter((width): width is string => !!width);
  if (defined.length === 0) return '0px';
  return defined.length === 1 ? defined[0] : `calc(${defined.join(' + ')})`;
}

function sameLayout(a: UiTableLayout, b: UiTableLayout): boolean {
  return (
    a.columnCount === b.columnCount &&
    a.leftEdge === b.leftEdge &&
    a.rightEdge === b.rightEdge &&
    a.widths.length === b.widths.length &&
    a.widths.every((width, i) => width === b.widths[i])
  );
}

/**
 * Headless state for `ui-table`: data → filtered → sorted → paged → viewData.
 * `ui-table` provides it and connects its inputs; every table directive injects it.
 */
// Provided by `ui-table` per instance, never in root.
// eslint-disable-next-line @angular-eslint/use-injectable-provided-in
@Injectable()
export class UiTableStore<T = unknown, K = unknown> {
  private _sources?: UiTableStoreSources<T, K>;
  private readonly _sorts = signal<ReadonlyMap<string, UiTableSortRegistration<T>>>(new Map());
  private readonly _filters = signal<ReadonlyMap<string, UiTableFilterRegistration<T>>>(new Map());
  private readonly _selectables = signal<ReadonlySet<UiTableSelectableRegistration<T>>>(new Set());
  private readonly _layout = signal<UiTableLayout>(EMPTY_LAYOUT);

  /** Shared `name` for single-selection radios. */
  readonly radioName = `ui-table-radio-${nextStoreId++}`;
  readonly layout = this._layout.asReadonly();

  // -----------------------------------------------------------------------------------------------------
  // @ Setup
  // -----------------------------------------------------------------------------------------------------
  connect(sources: UiTableStoreSources<T, K>): void {
    this._sources = sources;
  }

  protected get src(): UiTableStoreSources<T, K> {
    if (!this._sources) throw new Error('[ui-table] UiTableStore used before connect()');
    return this._sources;
  }

  registerSort(key: string, registration: UiTableSortRegistration<T>): () => void {
    this._sorts.update((map) => withEntry(map, key, registration));
    return () => this._sorts.update((map) => withoutEntry(map, key, registration));
  }

  registerFilter(key: string, registration: UiTableFilterRegistration<T>): () => void {
    this._filters.update((map) => withEntry(map, key, registration));
    return () => this._filters.update((map) => withoutEntry(map, key, registration));
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Pipeline
  // -----------------------------------------------------------------------------------------------------
  readonly activeSort = computed(() => {
    for (const [key, registration] of this._sorts()) {
      const order = registration.sortOrder();
      if (order) return { key, order, registration };
    }
    return null;
  });

  readonly filtered = computed<readonly T[]>(() => {
    const data = this.src.data();
    if (!this.src.frontPagination()) return data;

    const active = [...this._filters().values()].filter(
      (filter) => filter.filterFn() && !isEmptyFilterValue(filter.filterValue())
    );
    if (active.length === 0) return data;

    return data.filter((row) =>
      active.every((filter) => filter.filterFn()!(filter.filterValue(), row))
    );
  });

  readonly sorted = computed<readonly T[]>(() => {
    const rows = this.filtered();
    const active = this.activeSort();
    if (!this.src.frontPagination() || !active) return rows;

    const sortFn = active.registration.sortFn();
    if (!sortFn) return rows;

    const { key, order } = active;
    const compare: UiTableSortFn<T> =
      sortFn === true
        ? (a, b) => compareValues(readField(a, key), readField(b, key), order)
        : order === 'descend'
          ? (a, b) => -sortFn(a, b) || 0
          : sortFn;

    return [...rows].sort(compare);
  });

  readonly total = computed(() =>
    this.src.frontPagination()
      ? this.filtered().length
      : (this.src.total() ?? this.src.data().length)
  );

  readonly lastPage = computed(() =>
    Math.max(1, Math.ceil(this.total() / Math.max(1, this.src.pageSize())))
  );

  /** The page actually shown. Clamped locally; the `pageIndex` model itself is never rewritten here. */
  readonly currentPage = computed(() => {
    const requested = Math.max(1, this.src.pageIndex());
    return this.src.frontPagination() ? Math.min(requested, this.lastPage()) : requested;
  });

  readonly viewData = computed<readonly T[]>(() => {
    if (!this.src.frontPagination()) return this.src.data();
    const size = this.src.pageSize();
    const start = (this.currentPage() - 1) * size;
    return this.sorted().slice(start, start + size);
  });

  // -----------------------------------------------------------------------------------------------------
  // @ Actions (each emits exactly one queryParamsChange)
  // -----------------------------------------------------------------------------------------------------
  sort(key: string): void {
    const registration = this._sorts().get(key);
    if (!registration) return;
    const directions = registration.sortDirections();
    if (directions.length === 0) return;
    const next = directions[(directions.indexOf(registration.sortOrder()) + 1) % directions.length];
    this.setSort(key, next);
  }

  setSort(key: string, order: UiTableSortOrder): void {
    for (const [otherKey, registration] of this._sorts()) {
      if (otherKey !== key && registration.sortOrder() !== null) registration.sortOrder.set(null);
    }
    this._sorts().get(key)?.sortOrder.set(order);
    this.src.pageIndex.set(1);
    this.emit();
  }

  setFilter(key: string, value: unknown): void {
    this._filters().get(key)?.filterValue.set(value);
    this.src.pageIndex.set(1);
    this.emit();
  }

  setPage(pageIndex: number): void {
    this.src.pageIndex.set(pageIndex);
    this.emit();
  }

  setPageSize(pageSize: number): void {
    this.src.pageSize.set(pageSize);
    this.src.pageIndex.set(1);
    this.emit();
  }

  queryParams(): UiTableQueryParams {
    const active = this.activeSort();
    return {
      pageIndex: this.currentPage(),
      pageSize: this.src.pageSize(),
      sort: active ? { key: active.key, order: active.order } : null,
      filters: [...this._filters()]
        .filter(([, filter]) => !isEmptyFilterValue(filter.filterValue()))
        .map(([key, filter]) => ({ key, value: filter.filterValue() })),
    };
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Selection
  // -----------------------------------------------------------------------------------------------------
  readonly selectionMode = computed(() => this.src.selectionMode());
  readonly selectionEnabled = computed(() => this.selectionMode() !== 'none');

  keyOf(row: T): K {
    const rowKey = this.src.rowKey();
    if (!rowKey) throw new Error(ROW_KEY_ERROR);
    return rowKey(row);
  }

  isSelected(row: T): boolean {
    return this.selectionEnabled() && this.src.selectedKeys().has(this.keyOf(row));
  }

  registerSelectable(registration: UiTableSelectableRegistration<T>): () => void {
    this._selectables.update((set) => new Set(set).add(registration));
    return () =>
      this._selectables.update((set) => {
        const next = new Set(set);
        next.delete(registration);
        return next;
      });
  }

  readonly selectableKeysOnPage = computed<readonly K[]>(() => {
    if (!this.selectionEnabled()) return [];
    const disabled = new Set<K>();
    for (const registration of this._selectables()) {
      if (registration.disabled()) disabled.add(this.keyOf(registration.row()));
    }
    return this.viewData()
      .map((row) => this.keyOf(row))
      .filter((key) => !disabled.has(key));
  });

  readonly allChecked = computed(() => {
    const keys = this.selectableKeysOnPage();
    const selected = this.src.selectedKeys();
    return keys.length > 0 && keys.every((key) => selected.has(key));
  });

  readonly indeterminate = computed(() => {
    const selected = this.src.selectedKeys();
    return !this.allChecked() && this.selectableKeysOnPage().some((key) => selected.has(key));
  });

  /** Selected rows found in the current `data` (other pages in server mode are unknown). */
  readonly selectedRows = computed<readonly T[]>(() => {
    if (!this.selectionEnabled()) return [];
    const selected = this.src.selectedKeys();
    return this.src.data().filter((row) => selected.has(this.keyOf(row)));
  });

  toggleRow(row: T, checked: boolean): void {
    const key = this.keyOf(row);
    if (this.selectionMode() === 'single') {
      this.src.selectedKeys.set(checked ? new Set([key]) : new Set());
      return;
    }
    const next = new Set(this.src.selectedKeys());
    if (checked) next.add(key);
    else next.delete(key);
    this.src.selectedKeys.set(next);
  }

  toggleAll(): void {
    const keys = this.selectableKeysOnPage();
    const next = new Set(this.src.selectedKeys());
    if (this.allChecked()) keys.forEach((key) => next.delete(key));
    else keys.forEach((key) => next.add(key));
    this.src.selectedKeys.set(next);
  }

  assertSelectionConfig(): void {
    if (this.selectionEnabled() && !this.src.rowKey()) throw new Error(ROW_KEY_ERROR);
  }

  findDuplicateKeys(): K[] {
    const rowKey = this.src.rowKey();
    if (!rowKey) return [];
    const seen = new Set<K>();
    const duplicates = new Set<K>();
    for (const row of this.src.data()) {
      const key = rowKey(row);
      if (seen.has(key)) duplicates.add(key);
      else seen.add(key);
    }
    return [...duplicates];
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Layout (fixed columns, column count)
  // -----------------------------------------------------------------------------------------------------
  setLayout(layout: UiTableLayout): void {
    if (!sameLayout(this._layout(), layout)) this._layout.set(layout);
  }

  /** CSS `left` for a left-fixed cell: the widths of every column before it. */
  leftOffset(index: number): string {
    return sumWidths(this._layout().widths.slice(0, Math.max(0, index)));
  }

  /** CSS `right` for a right-fixed cell: the widths of every column after it. */
  rightOffset(index: number): string {
    return sumWidths(this._layout().widths.slice(index + 1));
  }

  private emit(): void {
    this.src.onQueryParams?.(this.queryParams());
  }
}
