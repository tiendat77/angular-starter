import { DestroyRef, Directive, OnInit, computed, inject, input, model } from '@angular/core';
import { UiTableStore } from './table.store';
import { UiTableSortFn, UiTableSortOrder } from './table.types';

/**
 * Sortable column. `sortFn: true` uses the default comparator on `row[key]`;
 * `null` (default) means the server sorts: the table only emits `queryParamsChange`.
 */
@Directive({
  selector: 'th[uiTableSort]',
  exportAs: 'uiTableSort',
  host: {
    '[attr.aria-sort]': 'ariaSort()',
  },
})
export class UiTableSort<T = unknown> implements OnInit {
  private readonly store = inject<UiTableStore<T, unknown>>(UiTableStore);
  private readonly destroyRef = inject(DestroyRef);

  readonly uiTableSort = input.required<string>();
  readonly sortFn = input<UiTableSortFn<T> | true | null>(null);
  readonly sortDirections = input<readonly UiTableSortOrder[]>(['ascend', 'descend', null]);
  readonly sortOrder = model<UiTableSortOrder>(null);

  readonly ariaSort = computed(() => {
    const order = this.sortOrder();
    return order === 'ascend' ? 'ascending' : order === 'descend' ? 'descending' : 'none';
  });

  ngOnInit(): void {
    const unregister = this.store.registerSort(this.uiTableSort(), {
      sortFn: this.sortFn,
      sortDirections: this.sortDirections,
      sortOrder: this.sortOrder,
    });
    this.destroyRef.onDestroy(unregister);
  }

  toggle(): void {
    this.store.sort(this.uiTableSort());
  }
}
