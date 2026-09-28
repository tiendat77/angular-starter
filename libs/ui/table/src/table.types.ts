import { Signal, WritableSignal } from '@angular/core';

export type UiTableSortOrder = 'ascend' | 'descend' | null;
export type UiTableDensity = 'compact' | 'middle' | 'default';
export type UiTableSelectionMode = 'none' | 'single' | 'multiple';
export type UiTableAlign = 'start' | 'center' | 'end';

export type UiTableSortFn<T> = (a: T, b: T) => number;
export type UiTableFilterFn<T> = (value: unknown, row: T) => boolean;

export interface UiTableFilterOption {
  text: string;
  value: unknown;
}

export interface UiTableQueryParams {
  pageIndex: number;
  pageSize: number;
  sort: { key: string; order: 'ascend' | 'descend' } | null;
  /** Only columns with a non-empty value. */
  filters: { key: string; value: unknown }[];
}

export interface UiTableSortRegistration<T> {
  sortFn: Signal<UiTableSortFn<T> | true | null>;
  sortDirections: Signal<readonly UiTableSortOrder[]>;
  sortOrder: WritableSignal<UiTableSortOrder>;
}

export interface UiTableFilterRegistration<T> {
  filterFn: Signal<UiTableFilterFn<T> | null>;
  filterValue: WritableSignal<unknown>;
}

export interface UiTableSelectableRegistration<T> {
  row: Signal<T>;
  disabled: Signal<boolean>;
}

export interface UiTableLayout {
  /** Sum of `colSpan` over the first header row; used for empty/skeleton rows. */
  columnCount: number;
  /** Declared CSS width per column index, `null` when unknown. */
  widths: readonly (string | null)[];
  /** Column index of the last left-fixed header cell, or -1. */
  leftEdge: number;
  /** Column index of the first right-fixed header cell, or -1. */
  rightEdge: number;
}

export interface UiTableStoreSources<T, K> {
  data: Signal<readonly T[]>;
  rowKey: Signal<((row: T) => K) | undefined>;
  frontPagination: Signal<boolean>;
  total: Signal<number | undefined>;
  pageIndex: WritableSignal<number>;
  pageSize: WritableSignal<number>;
  selectionMode: Signal<UiTableSelectionMode>;
  selectedKeys: WritableSignal<ReadonlySet<K>>;
  onQueryParams?: (params: UiTableQueryParams) => void;
}
