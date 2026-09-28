import { signal } from '@angular/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { UiTableStore } from './table.store';
import { UiTableSelectionMode } from './table.types';

interface Row {
  id: number;
}

const rows = (count: number): Row[] => Array.from({ length: count }, (_, i) => ({ id: i + 1 }));

function setup(mode: UiTableSelectionMode = 'multiple') {
  const sources = {
    data: signal<readonly Row[]>(rows(5)),
    rowKey: signal<((row: Row) => number) | undefined>((row: Row) => row.id),
    frontPagination: signal(true),
    total: signal<number | undefined>(undefined),
    pageIndex: signal(1),
    pageSize: signal(2),
    selectionMode: signal<UiTableSelectionMode>(mode),
    selectedKeys: signal<ReadonlySet<number>>(new Set()),
  };
  const store = new UiTableStore<Row, number>();
  store.connect(sources);
  return { store, sources };
}

describe('UiTableStore selection', () => {
  let ctx: ReturnType<typeof setup>;

  beforeEach(() => {
    ctx = setup();
  });

  it('toggles rows by key and replaces the set each time', () => {
    const before = ctx.sources.selectedKeys();
    ctx.store.toggleRow({ id: 1 }, true);
    expect(ctx.sources.selectedKeys()).not.toBe(before);
    expect([...ctx.sources.selectedKeys()]).toEqual([1]);
    expect(ctx.store.isSelected({ id: 1 })).toBe(true);
    ctx.store.toggleRow({ id: 1 }, false);
    expect(ctx.sources.selectedKeys().size).toBe(0);
  });

  it('computes allChecked and indeterminate over the current page only', () => {
    expect(ctx.store.allChecked()).toBe(false);
    ctx.store.toggleRow({ id: 1 }, true);
    expect(ctx.store.indeterminate()).toBe(true);
    ctx.store.toggleRow({ id: 2 }, true);
    expect(ctx.store.allChecked()).toBe(true);
    expect(ctx.store.indeterminate()).toBe(false);

    ctx.sources.pageIndex.set(2);
    expect(ctx.store.allChecked()).toBe(false);
    expect(ctx.store.indeterminate()).toBe(false);
  });

  it('master toggle adds or removes only the current page keys', () => {
    ctx.store.toggleRow({ id: 5 }, true);
    ctx.store.toggleAll();
    expect([...ctx.sources.selectedKeys()].sort()).toEqual([1, 2, 5]);
    ctx.store.toggleAll();
    expect([...ctx.sources.selectedKeys()]).toEqual([5]);
  });

  it('skips disabled rows in the master toggle and state', () => {
    ctx.store.registerSelectable({ row: signal({ id: 2 }), disabled: signal(true) });
    expect(ctx.store.selectableKeysOnPage()).toEqual([1]);
    ctx.store.toggleAll();
    expect([...ctx.sources.selectedKeys()]).toEqual([1]);
    expect(ctx.store.allChecked()).toBe(true);
  });

  it('keeps selection when data is replaced with new objects that have the same keys', () => {
    ctx.store.toggleRow({ id: 1 }, true);
    ctx.sources.data.set(rows(5).map((row) => ({ ...row })));
    expect(ctx.store.isSelected(ctx.store.viewData()[0])).toBe(true);
    expect(ctx.store.selectedRows()).toEqual([{ id: 1 }]);
  });

  it('single mode keeps at most one key', () => {
    const single = setup('single');
    single.store.toggleRow({ id: 1 }, true);
    single.store.toggleRow({ id: 3 }, true);
    expect([...single.sources.selectedKeys()]).toEqual([3]);
  });

  it('reports nothing selected when selection is off', () => {
    const none = setup('none');
    none.sources.selectedKeys.set(new Set([1]));
    expect(none.store.isSelected({ id: 1 })).toBe(false);
    expect(none.store.selectableKeysOnPage()).toEqual([]);
  });

  it('requires rowKey when selection is on', () => {
    ctx.sources.rowKey.set(undefined);
    expect(() => ctx.store.assertSelectionConfig()).toThrow(
      '[ui-table] rowKey is required when selectionMode is not "none"'
    );
    const none = setup('none');
    none.sources.rowKey.set(undefined);
    expect(() => none.store.assertSelectionConfig()).not.toThrow();
  });

  it('finds duplicate keys', () => {
    ctx.sources.data.set([{ id: 1 }, { id: 2 }, { id: 1 }, { id: 1 }]);
    expect(ctx.store.findDuplicateKeys()).toEqual([1]);
  });
});

describe('UiTableStore layout', () => {
  it('sums declared widths for left and right offsets', () => {
    const { store } = setup();
    store.setLayout({
      columnCount: 4,
      widths: ['48px', '200px', null, '120px'],
      leftEdge: 1,
      rightEdge: 3,
    });
    expect(store.leftOffset(0)).toBe('0px');
    expect(store.leftOffset(1)).toBe('48px');
    expect(store.leftOffset(2)).toBe('calc(48px + 200px)');
    expect(store.rightOffset(3)).toBe('0px');
    expect(store.rightOffset(1)).toBe('120px');
  });

  it('ignores layout updates that did not change', () => {
    const { store } = setup();
    const layout = { columnCount: 2, widths: ['10px', null], leftEdge: -1, rightEdge: -1 };
    store.setLayout(layout);
    const first = store.layout();
    store.setLayout({ ...layout, widths: ['10px', null] });
    expect(store.layout()).toBe(first);
  });
});
