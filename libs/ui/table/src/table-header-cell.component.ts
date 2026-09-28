import { A11yModule, LiveAnnouncer } from '@angular/cdk/a11y';
import { ConnectedPosition, OverlayModule } from '@angular/cdk/overlay';
import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { UiButtonComponent } from '@libs/ui/button';
import { UiCheckboxComponent } from '@libs/ui/checkbox';
import { getMenuPositions } from '@libs/ui/menu';
import { UiTableFilter } from './table-filter.directive';
import { UiTableSort } from './table-sort.directive';
import { UI_TABLE_I18N } from './table.i18n';

let nextHeaderCellId = 0;

/**
 * Renders sortable/filterable header content. Sort and filter are directives so both can sit on
 * one `th`; Angular allows only one component per element, so this is the single renderer.
 */
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'th[uiTableSort], th[uiTableFilter]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet, OverlayModule, A11yModule, UiCheckboxComponent, UiButtonComponent],
  template: `
    <ng-template #label><ng-content /></ng-template>
    <div class="data-table-header-cell">
      @if (sort) {
        <button
          type="button"
          class="data-table-sort"
          [attr.data-order]="sort.sortOrder()"
          (click)="onSortClick()"
        >
          <span
            #labelEl
            class="data-table-header-label"
            ><ng-container [ngTemplateOutlet]="label"
          /></span>
          <svg
            class="data-table-sort-icon"
            viewBox="0 0 8 12"
            width="8"
            height="12"
            aria-hidden="true"
          >
            <path
              class="data-table-sort-up"
              d="M4 0 8 5H0z"
            />
            <path
              class="data-table-sort-down"
              d="M4 12 0 7h8z"
            />
          </svg>
        </button>
      } @else {
        <span
          #labelEl
          class="data-table-header-label"
          ><ng-container [ngTemplateOutlet]="label"
        /></span>
      }

      @if (filter) {
        <button
          #origin="cdkOverlayOrigin"
          type="button"
          class="data-table-filter-trigger"
          cdkOverlayOrigin
          aria-haspopup="dialog"
          [attr.aria-expanded]="filter.isOpen()"
          [attr.aria-label]="i18n.filter(headerText())"
          [attr.data-active]="filter.active() ? '' : null"
          (click)="filter.toggleOpen()"
        >
          <svg
            viewBox="0 0 16 16"
            width="12"
            height="12"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M1 2h14l-5.5 6.5V14l-3-1.5V8.5z" />
          </svg>
        </button>

        <ng-template
          cdkConnectedOverlay
          cdkConnectedOverlayBackdropClass="cdk-overlay-transparent-backdrop"
          [cdkConnectedOverlayOrigin]="origin"
          [cdkConnectedOverlayOpen]="filter.isOpen()"
          [cdkConnectedOverlayPositions]="positions"
          [cdkConnectedOverlayHasBackdrop]="true"
          (backdropClick)="filter.close()"
          (overlayKeydown)="onOverlayKeydown($event)"
          (detach)="filter.close()"
        >
          <div
            class="data-table-filter-panel"
            role="dialog"
            cdkTrapFocus
            [cdkTrapFocusAutoCapture]="true"
            [attr.aria-label]="i18n.filter(headerText())"
          >
            @if (filter.panelTemplate(); as panel) {
              <div class="p-2">
                <ng-container
                  [ngTemplateOutlet]="panel.templateRef"
                  [ngTemplateOutletContext]="filter.panelContext"
                />
              </div>
            } @else {
              <ul class="data-table-filter-list">
                @for (option of filter.filters(); track $index) {
                  <li>
                    @if (filter.filterMultiple()) {
                      <ui-checkbox
                        size="sm"
                        [label]="option.text"
                        [checked]="filter.isStaged(option.value)"
                        (checkedChange)="filter.stage(option.value, $event)"
                      />
                    } @else {
                      <label class="data-table-filter-option">
                        <input
                          type="radio"
                          class="radio radio-sm"
                          [name]="radioName"
                          [checked]="filter.isStaged(option.value)"
                          (change)="filter.stage(option.value)"
                        />
                        <span>{{ option.text }}</span>
                      </label>
                    }
                  </li>
                }
              </ul>
              <div class="data-table-filter-actions">
                <button
                  uiButton
                  type="button"
                  variant="ghost"
                  size="sm"
                  (click)="filter.reset()"
                >
                  {{ i18n.filterReset }}
                </button>
                <button
                  uiButton
                  type="button"
                  size="sm"
                  (click)="filter.confirm()"
                >
                  {{ i18n.filterConfirm }}
                </button>
              </div>
            }
          </div>
        </ng-template>
      }
    </div>
  `,
})
export class UiTableHeaderCell {
  protected readonly sort = inject(UiTableSort, { self: true, optional: true });
  protected readonly filter = inject(UiTableFilter, { self: true, optional: true });
  protected readonly i18n = inject(UI_TABLE_I18N);
  private readonly announcer = inject(LiveAnnouncer);
  private readonly labelEl = viewChild<ElementRef<HTMLElement>>('labelEl');

  protected readonly positions: ConnectedPosition[] = getMenuPositions('bottom-end');
  protected readonly radioName = `ui-table-filter-${nextHeaderCellId++}`;

  /** Plain header text, used for announcements and the filter's accessible name. */
  protected readonly headerText = signal('');

  constructor() {
    afterNextRender({
      read: () => this.headerText.set(this.labelEl()?.nativeElement.textContent?.trim() ?? ''),
    });
  }

  protected onSortClick(): void {
    if (!this.sort) return;
    this.sort.toggle();
    const column = this.headerText();
    const order = this.sort.sortOrder();
    const message =
      order === 'ascend'
        ? this.i18n.sortedAscending(column)
        : order === 'descend'
          ? this.i18n.sortedDescending(column)
          : this.i18n.sortCleared(column);
    void this.announcer.announce(message);
  }

  protected onOverlayKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.filter?.close();
    }
  }
}
