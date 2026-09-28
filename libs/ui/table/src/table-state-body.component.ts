import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { UiTable } from './table.component';
import { UI_TABLE_I18N } from './table.i18n';
import { UiTableStore } from './table.store';

/**
 * Skeleton and empty-state rows. Created by `UiTableElement` and moved inside the consumer's
 * `<table>` so the rows share its columns.
 */
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'tbody[uiTableStateBody]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet],
  host: { class: 'data-table-state-body' },
  template: `
    @switch (mode()) {
      @case ('skeleton') {
        @for (row of skeletonRows(); track $index) {
          <tr aria-hidden="true">
            @for (cell of skeletonCells(); track $index) {
              <td><span class="data-table-skeleton"></span></td>
            }
          </tr>
        }
      }
      @case ('empty') {
        <tr>
          <td
            class="data-table-empty"
            [attr.colspan]="store.layout().columnCount"
          >
            @if (table.emptyTemplate(); as empty) {
              <ng-container [ngTemplateOutlet]="empty.templateRef" />
            } @else {
              <div class="data-table-empty-default">
                <svg
                  viewBox="0 0 24 24"
                  width="32"
                  height="32"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                  aria-hidden="true"
                >
                  <path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5z" />
                  <path d="M3 7.5 12 12l9-4.5M12 12v9" />
                </svg>
                <span>{{ i18n.empty }}</span>
              </div>
            }
          </td>
        </tr>
      }
    }
  `,
})
export class UiTableStateBody {
  protected readonly table = inject(UiTable);
  protected readonly store = inject(UiTableStore);
  protected readonly i18n = inject(UI_TABLE_I18N);

  protected readonly mode = computed<'skeleton' | 'empty' | 'none'>(() => {
    if (this.table.loading()) return this.table.data().length === 0 ? 'skeleton' : 'none';
    return this.store.viewData().length === 0 ? 'empty' : 'none';
  });

  protected readonly skeletonRows = computed(() =>
    Array.from({ length: Math.min(this.table.pageSize(), 10) })
  );

  protected readonly skeletonCells = computed(() =>
    Array.from({ length: this.store.layout().columnCount })
  );
}
