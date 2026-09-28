import { signal } from '@angular/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { UiTableStore } from './table.store';
import {
  UiTableFilterFn,
  UiTableQueryParams,
  UiTableSelectionMode,
  UiTableSortFn,
  UiTableSortOrder,
} from './table.types';

interface Row {
  id: number;
  name: string | null;
  age: number;
  status: 'active' | 'inactive';
}

const ROWS: Row[] = [
  { id: 1, name: 'Carol', age: 30, status: 'active' },
  { id: 2, name: 'amy', age: 25, status: 'inactive' },
  { id: 3, name: 'Bob', age: 35, status: 'active' },
  { id: 4, name: null, age: 40, status: 'active' },
  { id: 5, name: 'Dave', age: 25, status: 'inactive' },
];

function setup(rows: Row[] = ROWS) {
  const sources = {
    data: signal<readonly Row[]>(rows),
    rowKey: signal<((row: Row) => number) | undefined>((row: Row) => row.id),
    frontPagination: signal(true),
    total: signal<number | undefined>(undefined),
    pageIndex: signal(1),
    pageSize: signal(2),
    selectionMode: signal<UiTableSelectionMode>('none'),
    selectedKeys: signal<ReadonlySet<number>>(new Set()),
  };
  const events: UiTableQueryParams[] = [];
  const store = new UiTableStore<Row, number>();
  store.connect({ ...sources, onQueryParams: (p) => events.push(p) });
  return { store, sources, events };
}

function addSort(
  store: UiTableStore<Row, number>,
  key: string,
  sortFn: UiTableSortFn<Row> | true | null,
  directions: UiTableSortOrder[] = ['ascend', 'descend', null]
) {
  const reg = {
    sortFn: signal(sortFn),
    sortDirections: signal<readonly UiTableSortOrder[]>(directions),
    sortOrder: signal<UiTableSortOrder>(null),
  };
  const unregister = store.registerSort(key, reg);
  return { reg, unregister };
}

function addFilter(store: UiTableStore<Row, number>, key: string, fn: UiTableFilterFn<Row> | null) {
  const reg = { filterFn: signal(fn), filterValue: signal<unknown>(null) };
  const unregister = store.registerFilter(key, reg);
  return { reg, unregister };
}

const statusIn: UiTableFilterFn<Row> = (value, row) => (value as string[]).includes(row.status);

describe('UiTableStore pipeline', () => {
  let ctx: ReturnType<typeof setup>;

  beforeEach(() => {
    ctx = setup();
  });

  it('pages data locally', () => {
    expect(ctx.store.viewData().map((r) => r.id)).toEqual([1, 2]);
    expect(ctx.store.total()).toBe(5);
    expect(ctx.store.lastPage()).toBe(3);
    ctx.sources.pageIndex.set(3);
    expect(ctx.store.viewData().map((r) => r.id)).toEqual([5]);
  });

  it('applies active filters with AND and ignores empty values', () => {
    const status = addFilter(ctx.store, 'status', statusIn);
    const age = addFilter(ctx.store, 'age', (value, row) => row.age === value);
    ctx.sources.pageSize.set(10);

    status.reg.filterValue.set([]);
    expect(ctx.store.total()).toBe(5);

    status.reg.filterValue.set(['inactive']);
    expect(ctx.store.viewData().map((r) => r.id)).toEqual([2, 5]);

    age.reg.filterValue.set(25);
    status.reg.filterValue.set(['active']);
    expect(ctx.store.viewData()).toEqual([]);
  });

  it('ignores filters without filterFn locally (server-side column)', () => {
    const remote = addFilter(ctx.store, 'status', null);
    remote.reg.filterValue.set(['active']);
    expect(ctx.store.total()).toBe(5);
  });

  it('sorts with the default comparator, nulls last, and keeps ties stable', () => {
    ctx.sources.pageSize.set(10);
    const name = addSort(ctx.store, 'name', true);
    name.reg.sortOrder.set('ascend');
    expect(ctx.store.viewData().map((r) => r.id)).toEqual([2, 3, 1, 5, 4]);

    name.reg.sortOrder.set('descend');
    expect(ctx.store.viewData().map((r) => r.id)).toEqual([5, 1, 3, 2, 4]);

    const age = addSort(ctx.store, 'age', (a, b) => a.age - b.age);
    name.reg.sortOrder.set(null);
    age.reg.sortOrder.set('ascend');
    expect(ctx.store.viewData().map((r) => r.id)).toEqual([2, 5, 1, 3, 4]);
  });

  it('negates a custom sortFn for descend', () => {
    ctx.sources.pageSize.set(10);
    const age = addSort(ctx.store, 'age', (a, b) => a.age - b.age);
    age.reg.sortOrder.set('descend');
    expect(ctx.store.viewData().map((r) => r.age)).toEqual([40, 35, 30, 25, 25]);
  });

  it('cycles sort directions, keeps one active column and resets to page 1', () => {
    const name = addSort(ctx.store, 'name', true);
    const age = addSort(ctx.store, 'age', true, ['descend', null]);
    ctx.sources.pageIndex.set(2);

    ctx.store.sort('name');
    expect(name.reg.sortOrder()).toBe('ascend');
    expect(ctx.sources.pageIndex()).toBe(1);

    ctx.store.sort('age');
    expect(age.reg.sortOrder()).toBe('descend');
    expect(name.reg.sortOrder()).toBeNull();

    ctx.store.sort('age');
    expect(age.reg.sortOrder()).toBeNull();
  });

  it('emits exactly one full snapshot per action', () => {
    addSort(ctx.store, 'name', true);
    const status = addFilter(ctx.store, 'status', statusIn);

    ctx.store.sort('name');
    ctx.store.setFilter('status', ['active']);
    ctx.store.setPage(2);
    ctx.store.setPageSize(1);

    expect(ctx.events).toHaveLength(4);
    expect(ctx.events[1]).toEqual({
      pageIndex: 1,
      pageSize: 2,
      sort: { key: 'name', order: 'ascend' },
      filters: [{ key: 'status', value: ['active'] }],
    });
    expect(ctx.events[2].pageIndex).toBe(2);
    expect(ctx.events[3]).toMatchObject({ pageIndex: 1, pageSize: 1 });
    expect(status.reg.filterValue()).toEqual(['active']);
  });

  it('does not emit when sources change programmatically', () => {
    addSort(ctx.store, 'name', true);
    ctx.sources.pageIndex.set(2);
    ctx.sources.data.set([...ROWS]);
    ctx.store.viewData();
    expect(ctx.events).toHaveLength(0);
  });

  it('clamps the current page locally without writing pageIndex', () => {
    const status = addFilter(ctx.store, 'status', statusIn);
    ctx.sources.pageIndex.set(3);
    status.reg.filterValue.set(['inactive']);
    expect(ctx.store.currentPage()).toBe(1);
    expect(ctx.sources.pageIndex()).toBe(3);
    expect(ctx.store.viewData().map((r) => r.id)).toEqual([2, 5]);
  });

  it('passes data through untouched in server mode', () => {
    ctx.sources.frontPagination.set(false);
    const name = addSort(ctx.store, 'name', true);
    const status = addFilter(ctx.store, 'status', statusIn);
    name.reg.sortOrder.set('ascend');
    status.reg.filterValue.set(['active']);
    ctx.sources.pageIndex.set(7);

    expect(ctx.store.viewData()).toBe(ctx.sources.data());
    expect(ctx.store.total()).toBe(5);
    expect(ctx.store.currentPage()).toBe(7);

    ctx.sources.total.set(95);
    expect(ctx.store.total()).toBe(95);
  });

  it('unregisters columns and ignores stale unregister calls', () => {
    const first = addSort(ctx.store, 'name', true);
    const second = addSort(ctx.store, 'name', true);
    first.unregister();
    second.reg.sortOrder.set('ascend');
    expect(ctx.store.activeSort()?.key).toBe('name');
    second.unregister();
    expect(ctx.store.activeSort()).toBeNull();
  });
});
