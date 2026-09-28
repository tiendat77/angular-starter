import { Directive, computed, inject, input } from '@angular/core';
import { UiTableStore } from './table.store';

@Directive({
  selector: 'tr[uiTableRow]',
  exportAs: 'uiTableRow',
  host: {
    class: 'data-table-row',
    '[attr.aria-selected]': 'selected() ? "true" : null',
    '[attr.data-selected]': 'selected() ? "" : null',
  },
})
export class UiTableRow<T = unknown> {
  private readonly store = inject<UiTableStore<T, unknown>>(UiTableStore);

  readonly row = input.required<T>();
  readonly selected = computed(() => this.store.isSelected(this.row()));
}
