import { Combobox, ComboboxPopup, ComboboxWidget } from '@angular/aria/combobox';
import { Listbox, Option } from '@angular/aria/listbox';
import { CdkConnectedOverlay, CdkOverlayOrigin, ConnectedPosition } from '@angular/cdk/overlay';
import { NgTemplateOutlet } from '@angular/common';
import {
  afterRenderEffect,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  contentChildren,
  effect,
  ElementRef,
  forwardRef,
  inject,
  input,
  model,
  numberAttribute,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { cn, UI_CONFIG, UiSize } from '@libs/ui/core';
import { inputVariants, UiFormFieldAppearance } from '@libs/ui/input';
import { debounce, distinctUntilChanged, filter, skip, timer } from 'rxjs';
import { UiHighlightDirective } from './highlight.directive';
import { UiOptionComponent } from './option.component';
import { UiSelectEmptyDirective } from './select-empty.directive';
import { uiDefaultFilter, UiSelectFilterFn, UiSelectOptionRef } from './select-filter';
import { SelectLabelCache } from './select-label-cache';
import { UI_SELECT, UiSelectContext } from './select.tokens';

let nextSelectId = 0;

const PANEL_POSITIONS: ConnectedPosition[] = [
  { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 4 },
  { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -4 },
];

function toOptionRef<T>(option: UiOptionComponent<T>): UiSelectOptionRef<T> {
  return { value: option.value(), label: option.label(), disabled: option.disabled() };
}

/**
 * Select built on `@angular/aria` (combobox + listbox) with a CDK connected overlay.
 * `<ui-option>` children are declarations; this component renders the actual `ngOption`
 * rows inside its listbox.
 */
@Component({
  selector: 'ui-select',
  imports: [
    Combobox,
    ComboboxPopup,
    ComboboxWidget,
    Listbox,
    Option,
    CdkOverlayOrigin,
    CdkConnectedOverlay,
    NgTemplateOutlet,
    UiHighlightDirective,
  ],
  templateUrl: './select.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: UI_SELECT, useExisting: forwardRef(() => UiSelectComponent) }],
  host: {
    class: 'block',
  },
})
export class UiSelectComponent<T = unknown> implements UiSelectContext {
  private readonly _uiConfig = inject(UI_CONFIG, { optional: true });

  readonly id = `ui-select-${nextSelectId++}`;

  // -----------------------------------------------------------------------------------------------------
  // @ Inputs
  // -----------------------------------------------------------------------------------------------------
  readonly value = model<T | T[] | null>(null);
  readonly placeholder = input('');
  readonly size = input<UiSize>((this._uiConfig?.defaultSize as UiSize | undefined) ?? 'md');
  readonly appearance = input<UiFormFieldAppearance>(
    this._uiConfig?.formField?.appearance ?? 'outline'
  );
  readonly searchable = input(false, { transform: booleanAttribute });
  /** Custom client-side matcher; `null`/`undefined` fall back to `uiDefaultFilter`. */
  readonly filterFn = input<UiSelectFilterFn<T> | null | undefined>(uiDefaultFilter);
  readonly searchDebounce = input(300, { transform: numberAttribute });

  /** Debounced search term, emitted whenever `searchable` is on. */
  readonly search = output<string>();

  // -----------------------------------------------------------------------------------------------------
  // @ Content / view
  // -----------------------------------------------------------------------------------------------------
  protected readonly options = contentChildren<UiOptionComponent<T>>(UiOptionComponent);
  protected readonly emptyTemplate = contentChild(UiSelectEmptyDirective);
  private readonly _input = viewChild<ElementRef<HTMLInputElement>>('trigger');

  // -----------------------------------------------------------------------------------------------------
  // @ State
  // -----------------------------------------------------------------------------------------------------
  protected readonly positions = PANEL_POSITIONS;
  protected readonly open = signal(false);
  readonly searchTerm = signal('');
  private readonly _labels = new SelectLabelCache<T>(() => (a: T, b: T) => a === b);

  protected readonly selectedValues = computed<T[]>(() => {
    const value = this.value();
    return value == null ? [] : [value as T];
  });

  protected readonly visibleOptions = computed(() => {
    const all = this.options();
    const term = this.searchTerm();
    if (!this.searchable() || !term.trim()) return all;
    const matches = this.filterFn() ?? uiDefaultFilter;
    return all.filter((o) => matches(term, toOptionRef(o)));
  });

  /** Selected values mapped onto the rendered option values, so aria sees the same references. */
  protected readonly listboxValue = computed<T[]>(() => {
    const options = this.options();
    return this.selectedValues().map((v) => options.find((o) => o.value() === v)?.value() ?? v);
  });

  protected readonly hasValue = computed(() => this.selectedValues().length > 0);

  protected readonly selectedLabel = computed(() => {
    const value = this.selectedValues()[0];
    return value === undefined ? '' : (this._labels.get(value) ?? '');
  });

  protected readonly showPlaceholder = computed(() => !this.hasValue() && !this.searchTerm());

  protected readonly emptyText = computed(() => {
    const term = this.searchTerm().trim();
    return term ? `No results for "${term}"` : 'No options';
  });

  protected readonly triggerClass = computed(() =>
    cn(inputVariants({ appearance: this.appearance(), size: this.size() }), 'select-trigger')
  );

  constructor() {
    // aria's `value` input owns [value] on the trigger, so the DOM text is written here
    effect(() => {
      const term = this.searchTerm();
      const el = this._input()?.nativeElement;
      if (el && el.value !== term) el.value = term;
    });

    // Closing the panel discards an unfinished search
    effect(() => {
      if (!this.open()) untracked(() => this._resetSearch());
    });

    // Labels of the current value, whenever a matching option is declared. After render, because
    // options created in the consumer's @for only have their required inputs bound by then
    afterRenderEffect(() => {
      const selected = this.selectedValues();
      for (const option of this.options()) {
        const value = option.value();
        if (selected.includes(value)) this._labels.set(value, option.label());
      }
    });

    toObservable(this.searchTerm)
      .pipe(
        skip(1),
        filter(() => this.searchable()),
        debounce(() => timer(this.searchDebounce())),
        distinctUntilChanged(),
        takeUntilDestroyed()
      )
      .subscribe((term) => this.search.emit(term));
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------
  setOpen(open: boolean): void {
    this.open.set(open);
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Template handlers
  // -----------------------------------------------------------------------------------------------------
  /** Keeps focus in the input when the non-input parts of the trigger are pressed. */
  protected onTriggerMousedown(event: MouseEvent): void {
    if (event.target !== this._input()?.nativeElement) {
      event.preventDefault();
    }
  }

  protected onTriggerClick(): void {
    this._input()?.nativeElement.focus();
    this.setOpen(this.searchable() ? true : !this.open());
  }

  protected onTriggerKeydown(event: KeyboardEvent): void {
    // aria only opens an editable (input) combobox with ArrowDown; a plain select also opens on Enter/Space
    if (!this.searchable() && !this.open() && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      this.setOpen(true);
    }
  }

  protected onListboxChange(next: T[]): void {
    const current = this.selectedValues();
    const picked = next.find((n) => !current.includes(n));
    // Re-picking the selected option makes aria deselect it (explicit + single): keep the value
    if (picked !== undefined) {
      this._remember([picked]);
      this.value.set(picked);
    }
    this.setOpen(false);
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------
  private _remember(values: T[]): void {
    for (const value of values) {
      const option = this.options().find((o) => o.value() === value);
      if (option) this._labels.set(value, option.label());
    }
  }

  private _resetSearch(): void {
    this.searchTerm.set('');
  }
}
