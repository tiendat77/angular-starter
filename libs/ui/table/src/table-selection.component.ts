import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  booleanAttribute,
  computed,
  inject,
  input,
} from '@angular/core';
import { UiCheckboxComponent } from '@libs/ui/checkbox';
import { UiTableRow } from './table-row.directive';
import { UI_TABLE_I18N } from './table.i18n';
import { UiTableStore } from './table.store';

/** Header checkbox for `selectionMode="multiple"`: checked / indeterminate over the current page. */
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'th[uiTableSelectAll]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UiCheckboxComponent],
  host: { class: 'data-table-selection-cell' },
  template: `
    @if (store.selectionMode() === 'multiple') {
      <ui-checkbox
        size="sm"
        [checked]="store.allChecked()"
        [indeterminate]="store.indeterminate()"
        [disabled]="store.selectableKeysOnPage().length === 0"
        [ariaLabel]="i18n.selectAll"
        (checkedChange)="store.toggleAll()"
      />
    }
  `,
})
export class UiTableSelectAll {
  protected readonly store = inject(UiTableStore);
  protected readonly i18n = inject(UI_TABLE_I18N);
}

/** Row checkbox (`multiple`) or radio (`single`). Must sit inside `tr[uiTableRow]`. */
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'td[uiTableSelect]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UiCheckboxComponent],
  host: { class: 'data-table-selection-cell' },
  template: `
    @switch (store.selectionMode()) {
      @case ('multiple') {
        <ui-checkbox
          size="sm"
          [checked]="rowRef.selected()"
          [disabled]="disabled()"
          [ariaLabel]="ariaLabel()"
          (checkedChange)="store.toggleRow(rowRef.row(), $event)"
        />
      }
      @case ('single') {
        <input
          type="radio"
          class="radio radio-sm"
          [name]="store.radioName"
          [checked]="rowRef.selected()"
          [disabled]="disabled()"
          [attr.aria-label]="ariaLabel()"
          (change)="store.toggleRow(rowRef.row(), true)"
        />
      }
    }
  `,
})
export class UiTableSelect<T = unknown> {
  protected readonly store = inject<UiTableStore<T, unknown>>(UiTableStore);
  protected readonly rowRef = inject<UiTableRow<T>>(UiTableRow);
  private readonly i18n = inject(UI_TABLE_I18N);

  readonly disabled = input(false, { transform: booleanAttribute });
  readonly label = input<string>();

  protected readonly ariaLabel = computed(() => this.label() ?? this.i18n.selectRow);

  constructor() {
    const unregister = this.store.registerSelectable({
      row: this.rowRef.row,
      disabled: this.disabled,
    });
    inject(DestroyRef).onDestroy(unregister);
  }
}
