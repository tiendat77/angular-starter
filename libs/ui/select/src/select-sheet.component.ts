import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { BOTTOM_SHEET_DATA, UiBottomSheetRef } from '@libs/ui/bottom-sheet';
import { UiHighlightDirective } from './highlight.directive';
import { UiOptionComponent } from './option.component';
import { UI_SELECT_I18N } from './select.i18n';
import { UI_SELECT, UiSelectSheetData } from './select.tokens';

let nextSheetId = 0;

/**
 * Content of the bottom sheet `ui-select` opens on small screens: a title, an optional search box,
 * the options, and Cancel / Apply. The selection is edited on a copy and only handed back (as the
 * sheet's result) when the user applies it; any other dismissal discards it.
 */
@Component({
  selector: 'ui-select-sheet',
  imports: [NgTemplateOutlet, UiHighlightDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    // Lets `[uiHighlight]` inside the options read the search term, like it does in the popup
    {
      provide: UI_SELECT,
      useFactory: () => ({
        searchTerm: inject<UiSelectSheetData<unknown>>(BOTTOM_SHEET_DATA).searchTerm,
      }),
    },
  ],
  host: { class: 'flex h-full min-h-0 flex-col' },
  template: `
    <!-- Initial focus on the title, so a searchable sheet doesn't pop the soft keyboard up on open -->
    <h2
      cdkFocusInitial
      tabindex="-1"
      class="select-sheet-title outline-none"
      [id]="titleId"
    >
      {{ data.title }}
    </h2>

    @if (data.searchable) {
      <div class="px-4 pb-2">
        <input
          type="search"
          class="input w-full"
          autocomplete="off"
          [placeholder]="i18n.searchPlaceholder"
          [attr.aria-label]="i18n.searchPlaceholder"
          [value]="data.searchTerm()"
          (input)="onSearch($event)"
        />
      </div>
    }

    <div
      class="select-sheet-list"
      role="listbox"
      [attr.aria-labelledby]="titleId"
      [attr.aria-multiselectable]="data.multiple || null"
    >
      @if (data.loading()) {
        <div
          class="select-loading"
          role="status"
        >
          Loading…
        </div>
      } @else {
        @for (opt of data.options(); track opt) {
          <div
            class="select-option !min-h-11"
            role="option"
            [attr.tabindex]="opt.disabled() ? null : 0"
            [attr.aria-selected]="isSelected(opt.value())"
            [attr.aria-disabled]="opt.disabled() || null"
            (click)="toggle(opt)"
            (keydown.enter)="toggle(opt)"
            (keydown.space)="$event.preventDefault(); toggle(opt)"
          >
            @if (opt.hasContent()) {
              <ng-container [ngTemplateOutlet]="opt.content()" />
            } @else {
              <span [uiHighlight]="opt.label()"></span>
            }
          </div>
        } @empty {
          <div class="select-empty">
            @if (data.emptyTemplate(); as empty) {
              <ng-container
                [ngTemplateOutlet]="empty.template"
                [ngTemplateOutletContext]="{ $implicit: data.searchTerm() }"
              />
            } @else {
              {{ data.emptyText() }}
            }
          </div>
        }
      }
    </div>

    <div class="select-sheet-actions">
      <button
        type="button"
        class="btn flex-1"
        (click)="cancel()"
      >
        {{ i18n.cancel }}
      </button>
      <button
        type="button"
        class="btn btn-primary flex-1"
        (click)="apply()"
      >
        {{ i18n.apply }}
      </button>
    </div>
  `,
})
export class UiSelectSheetComponent<T = unknown> {
  protected readonly data = inject<UiSelectSheetData<T>>(BOTTOM_SHEET_DATA);
  protected readonly i18n = inject(UI_SELECT_I18N);
  private readonly _ref = inject<UiBottomSheetRef<unknown, T[]>>(UiBottomSheetRef);

  protected readonly titleId = `ui-select-sheet-title-${nextSheetId++}`;
  private readonly _pending = signal<T[]>([...this.data.selected]);
  protected readonly isSelectedFn = computed(() => {
    const pending = this._pending();
    return (value: T) => pending.some((p) => this.data.compareWith(p, value));
  });

  protected isSelected(value: T): boolean {
    return this.isSelectedFn()(value);
  }

  protected toggle(option: UiOptionComponent<T>): void {
    if (option.disabled()) return;
    const value = option.value();

    if (!this.data.multiple) {
      this._pending.set([value]);
      return;
    }
    this._pending.update((pending) =>
      pending.some((p) => this.data.compareWith(p, value))
        ? pending.filter((p) => !this.data.compareWith(p, value))
        : [...pending, value]
    );
  }

  protected onSearch(event: Event): void {
    this.data.searchTerm.set((event.target as HTMLInputElement).value);
  }

  protected apply(): void {
    this._ref.dismiss(this._pending());
  }

  protected cancel(): void {
    this._ref.dismiss();
  }
}
