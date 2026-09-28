import {
  DestroyRef,
  Directive,
  OnInit,
  booleanAttribute,
  computed,
  contentChild,
  inject,
  input,
  model,
  signal,
} from '@angular/core';
import { UiTableFilterPanel, UiTableFilterPanelContext } from './table-filter-panel.directive';
import { isEmptyFilterValue } from './table.comparator';
import { UiTableStore } from './table.store';
import { UiTableFilterFn, UiTableFilterOption } from './table.types';

/**
 * Filterable column. Choices are staged in the panel and applied on OK / `confirm()`.
 * Without `filterFn` the column is filtered by the server: the table only emits `queryParamsChange`.
 */
@Directive({
  selector: 'th[uiTableFilter]',
  exportAs: 'uiTableFilter',
})
export class UiTableFilter<T = unknown> implements OnInit {
  private readonly store = inject<UiTableStore<T, unknown>>(UiTableStore);
  private readonly destroyRef = inject(DestroyRef);

  readonly uiTableFilter = input.required<string>();
  readonly filters = input<readonly UiTableFilterOption[]>([]);
  readonly filterMultiple = input(true, { transform: booleanAttribute });
  readonly filterFn = input<UiTableFilterFn<T> | null>(null);
  readonly filterValue = model<unknown>(null);

  readonly panelTemplate = contentChild(UiTableFilterPanel);
  readonly isOpen = signal(false);
  readonly staged = signal<unknown>(null);
  readonly active = computed(() => !isEmptyFilterValue(this.filterValue()));

  readonly panelContext: UiTableFilterPanelContext = this.createPanelContext();

  ngOnInit(): void {
    const unregister = this.store.registerFilter(this.uiTableFilter(), {
      filterFn: this.filterFn,
      filterValue: this.filterValue,
    });
    this.destroyRef.onDestroy(unregister);
  }

  open(): void {
    const value = this.filterValue();
    this.staged.set(Array.isArray(value) ? [...value] : value);
    this.isOpen.set(true);
  }

  /** Closes without applying staged changes. */
  close(): void {
    this.isOpen.set(false);
  }

  toggleOpen(): void {
    if (this.isOpen()) this.close();
    else this.open();
  }

  isStaged(value: unknown): boolean {
    const staged = this.staged();
    return this.filterMultiple()
      ? Array.isArray(staged) && staged.includes(value)
      : staged === value;
  }

  stage(value: unknown, checked = true): void {
    if (!this.filterMultiple()) {
      this.staged.set(checked ? value : null);
      return;
    }
    const current = Array.isArray(this.staged()) ? (this.staged() as unknown[]) : [];
    const without = current.filter((item) => item !== value);
    this.staged.set(checked ? [...without, value] : without);
  }

  confirm(): void {
    this.store.setFilter(this.uiTableFilter(), this.staged());
    this.close();
  }

  reset(): void {
    this.staged.set(null);
    this.store.setFilter(this.uiTableFilter(), null);
    this.close();
  }

  private createPanelContext(): UiTableFilterPanelContext {
    const context = {
      value: this.staged.asReadonly(),
      setValue: (value: unknown) => this.staged.set(value),
      confirm: () => this.confirm(),
      reset: () => this.reset(),
    } as UiTableFilterPanelContext;
    context.$implicit = context;
    return context;
  }
}
