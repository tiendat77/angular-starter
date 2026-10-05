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
  DestroyRef,
  effect,
  ElementRef,
  forwardRef,
  inject,
  Injector,
  input,
  model,
  numberAttribute,
  OnInit,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NgControl } from '@angular/forms';
import { UiBottomSheet, UiBottomSheetRef } from '@libs/ui/bottom-sheet';
import { cn, UI_CONFIG, UiFormFieldControl, UiSize } from '@libs/ui/core';
import { inputVariants, UiFormFieldAppearance } from '@libs/ui/input';
import { debounce, distinctUntilChanged, filter, skip, timer } from 'rxjs';
import { UiHighlightDirective } from './highlight.directive';
import { UiOptionComponent } from './option.component';
import { UiSelectEmptyDirective } from './select-empty.directive';
import { uiDefaultFilter, UiSelectFilterFn, UiSelectOptionRef } from './select-filter';
import { SelectLabelCache } from './select-label-cache';
import { UiSelectSheetComponent } from './select-sheet.component';
import { UI_SELECT, UiSelectContext, UiSelectSheetData } from './select.tokens';

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
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => UiSelectComponent), multi: true },
    { provide: UiFormFieldControl, useExisting: forwardRef(() => UiSelectComponent) },
    { provide: UI_SELECT, useExisting: forwardRef(() => UiSelectComponent) },
  ],
  host: {
    class: 'block w-full min-w-0',
    '(focusin)': 'onFocusIn()',
    '(focusout)': 'onFocusOut($event)',
  },
})
export class UiSelectComponent<T = unknown>
  extends UiFormFieldControl<T | T[]>
  implements ControlValueAccessor, UiSelectContext, OnInit
{
  private readonly _uiConfig = inject(UI_CONFIG, { optional: true });
  private readonly _injector = inject(Injector);
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly _bottomSheet = inject(UiBottomSheet);

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

  /** The consumer filters (usually remotely, via `(searchChange)`); the select renders options as given. */
  readonly serverSearch = input(false, { transform: booleanAttribute });
  readonly loading = input(false, { transform: booleanAttribute });
  readonly multiple = input(false, { transform: booleanAttribute });
  readonly compareWith = input<(a: T, b: T) => boolean>((a, b) => a === b);
  readonly maxTagCount = input<number | null>(null);

  /**
   * Media query below which the options open in a bottom sheet (with Cancel / Apply) instead of a
   * popup. Set to `false` to always use the popup.
   */
  readonly mobileBreakpoint = input<string | false>('(max-width: 640px)');

  readonly allowClear = input(false, { transform: booleanAttribute });
  /** Accessible name when the select isn't labelled by a `ui-form-field` label. */
  readonly ariaLabel = input<string | null>(null);
  readonly ariaLabelledby = input<string | null>(null);
  readonly disabled = input(false, { transform: booleanAttribute });

  /** Debounced search term, emitted whenever `searchable` is on. */
  readonly searchChange = output<string>();
  readonly openedChange = output<boolean>();

  // -----------------------------------------------------------------------------------------------------
  // @ Content / view
  // -----------------------------------------------------------------------------------------------------
  protected readonly options = contentChildren<UiOptionComponent<T>>(UiOptionComponent);
  protected readonly emptyTemplate = contentChild(UiSelectEmptyDirective);
  private readonly _input = viewChild<ElementRef<HTMLInputElement>>('trigger');
  private readonly _panel = viewChild<ElementRef<HTMLElement>>('panel');

  // -----------------------------------------------------------------------------------------------------
  // @ State
  // -----------------------------------------------------------------------------------------------------
  protected readonly positions = PANEL_POSITIONS;
  protected readonly open = signal(false);
  /** Whether the viewport currently matches `mobileBreakpoint`. */
  protected readonly mobile = signal(false);
  /** The input never takes typing when it's not searchable, or when search lives in the sheet. */
  protected readonly readonlyInput = computed(() => !this.searchable() || this.mobile());
  private _sheetRef: UiBottomSheetRef<UiSelectSheetComponent<T>, T[]> | null = null;
  readonly searchTerm = signal('');
  protected readonly valueId = `${this.id}-value`;
  private readonly _externalDescribedBy = signal<string[]>([]);
  private readonly _cvaDisabled = signal(false);
  private readonly _focused = signal(false);
  private readonly _invalid = signal(false);
  private _wasOpen = false;
  private _ngControl: NgControl | null = null;
  private _onChange: (value: T | T[] | null) => void = () => undefined;
  private _onTouched: () => void = () => undefined;

  // UiFormFieldControl
  readonly $value = this.value.asReadonly();
  readonly $disabled = computed(() => this.disabled() || this._cvaDisabled());
  readonly $focused = this._focused.asReadonly();
  readonly $invalid = this._invalid.asReadonly();
  override readonly ariaTarget = computed(() => this._input()?.nativeElement);
  private readonly _labels = new SelectLabelCache<T>(() => this.compareWith());

  protected readonly selectedValues = computed<T[]>(() => {
    const value = this.value();
    if (value == null) return [];
    if (!this.multiple()) return [value as T];
    // Tolerate a single value written into a multiple select (misconfigured form / runtime toggle)
    return Array.isArray(value) ? (value as T[]) : [value as T];
  });

  protected readonly visibleOptions = computed(() => {
    const all = this.options();
    const term = this.searchTerm();
    if (!this.searchable() || this.serverSearch() || !term.trim()) return all;
    const matches = this.filterFn() ?? uiDefaultFilter;
    return all.filter((o) => matches(term, toOptionRef(o)));
  });

  /**
   * The selected values that are rendered, as the rendered option references. Only rendered values
   * are given to aria (it would prune the rest), and the array is rebuilt whenever the rendered set
   * changes, so aria's selection re-syncs after a search is cleared. Hidden selected values are
   * kept by `onListboxChange`.
   */
  protected readonly listboxValue = computed<T[]>(() => {
    const rendered = this.visibleOptions();
    return this.selectedValues().flatMap((v) => {
      const option = rendered.find((o) => this._eq(o.value(), v));
      return option ? [option.value()] : [];
    });
  });

  protected readonly tags = computed(() =>
    this.selectedValues().map((value) => ({ value, label: this._labels.get(value) ?? '' }))
  );

  protected readonly visibleTags = computed(() => {
    const max = this.maxTagCount();
    const tags = this.tags();
    return max == null ? tags : tags.slice(0, max);
  });

  protected readonly hiddenTagCount = computed(
    () => this.tags().length - this.visibleTags().length
  );

  protected readonly hasValue = computed(() => this.selectedValues().length > 0);

  /** Selected label(s) for assistive tech: the input itself never holds the selection. */
  protected readonly valueText = computed(() =>
    this.selectedValues()
      .map((v) => this._labels.get(v) ?? '')
      .filter(Boolean)
      .join(', ')
  );

  protected readonly describedBy = computed(() => {
    const ids = [...this._externalDescribedBy(), ...(this.valueText() ? [this.valueId] : [])];
    return ids.length ? ids.join(' ') : null;
  });

  protected readonly showClear = computed(
    () => this.allowClear() && this.hasValue() && !this.$disabled()
  );

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
    cn(
      inputVariants({ appearance: this.appearance(), size: this.size() }),
      'select-trigger',
      this.multiple() && 'select-multiple'
    )
  );

  constructor() {
    super();

    // aria's `value` input owns [value] on the trigger, so the DOM text is written here
    effect(() => {
      const term = this.searchTerm();
      const el = this._input()?.nativeElement;
      if (el && el.value !== term) el.value = term;
    });

    // Emit openedChange on real transitions; closing discards an unfinished search
    effect(() => {
      const isOpen = this.open();
      untracked(() => {
        if (isOpen === this._wasOpen) return;
        this._wasOpen = isOpen;
        if (!isOpen) this._resetSearch();
        this.openedChange.emit(isOpen);
      });
    });

    // A non-searchable input may still receive text (IME composition can't be cancelled): drop it
    effect(() => {
      if (!this.searchable() && this.searchTerm()) untracked(() => this._resetSearch());
    });

    // Disabling while open closes the panel
    effect(() => {
      if (this.$disabled()) {
        untracked(() => {
          this.open.set(false);
          this._sheetRef?.dismiss();
        });
      }
    });

    // Track the mobile breakpoint
    effect((onCleanup) => {
      const query = this.mobileBreakpoint();
      if (!query || typeof matchMedia !== 'function') {
        this.mobile.set(false);
        return;
      }
      const mql = matchMedia(query);
      const update = () => this.mobile.set(mql.matches);
      update();
      mql.addEventListener('change', update);
      onCleanup(() => mql.removeEventListener('change', update));
    });

    // The combobox can open itself (e.g. ArrowDown); on mobile that opens the sheet instead
    effect(() => {
      if (this.open() && this.mobile()) {
        untracked(() => {
          this.open.set(false);
          this._openSheet();
        });
      }
    });

    // Labels of the current value, whenever a matching option is declared. After render, because
    // options created in the consumer's @for only have their required inputs bound by then
    afterRenderEffect(() => {
      const selected = this.selectedValues();
      for (const option of this.options()) {
        const value = option.value();
        if (selected.some((s) => this._eq(s, value))) this._labels.set(value, option.label());
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
      .subscribe((term) => this.searchChange.emit(term));
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle / ControlValueAccessor
  // -----------------------------------------------------------------------------------------------------
  ngOnInit(): void {
    // Resolved lazily: this component is its own NG_VALUE_ACCESSOR, so injecting NgControl in
    // the constructor would be circular (NG0200)
    this._ngControl = this._injector.get(NgControl, null, { optional: true, self: true });
    const control = this._ngControl?.control;
    if (!control) return;

    this._updateInvalid();
    control.events
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(() => this._updateInvalid());
  }

  writeValue(value: T | T[] | null): void {
    this.value.set(value);
  }

  registerOnChange(fn: (value: T | T[] | null) => void): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this._cvaDisabled.set(isDisabled);
  }

  override setDescribedByIds(ids: string[]): void {
    this._externalDescribedBy.set(ids);
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------
  setOpen(open: boolean): void {
    if (open && this.$disabled()) return;
    if (open && this.mobile()) {
      this._openSheet();
      return;
    }
    this.open.set(open);
  }

  clear(): void {
    this._commit(this.multiple() ? [] : null);
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Template handlers
  // -----------------------------------------------------------------------------------------------------
  protected onFocusIn(): void {
    this._focused.set(true);
  }

  protected onFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget as Node | null;
    const inside =
      !!next &&
      (this._host.nativeElement.contains(next) || !!this._panel()?.nativeElement.contains(next));
    if (inside) return;
    this._focused.set(false);
    this._onTouched();
  }

  /** Keeps focus in the input when the non-input parts of the trigger are pressed. */
  protected onTriggerMousedown(event: MouseEvent): void {
    if (event.target !== this._input()?.nativeElement) {
      event.preventDefault();
    }
  }

  protected onTriggerClick(): void {
    if (this.$disabled()) return;
    if (this.mobile()) {
      this._openSheet();
      return;
    }
    this._input()?.nativeElement.focus();
    this.setOpen(this.searchable() ? true : !this.open());
  }

  /**
   * A non-searchable select keeps its input empty. (A method, not an inline `cond && preventDefault()`
   * expression: Angular calls preventDefault() on any listener that returns `false`.)
   */
  protected onTriggerBeforeInput(event: Event): void {
    if (this.readonlyInput()) event.preventDefault();
  }

  protected onTriggerKeydown(event: KeyboardEvent): void {
    // aria only opens an editable (input) combobox with ArrowDown; a plain select also opens on Enter/Space
    if (!this.searchable() && !this.open() && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      this.setOpen(true);
      return;
    }
    if (event.key === 'Backspace' && this.multiple() && !this.searchTerm() && this.hasValue()) {
      this.removeValue(this.selectedValues()[this.selectedValues().length - 1]);
    }
  }

  protected onListboxChange(next: T[]): void {
    const current = this.selectedValues();

    // aria only knows the rendered rows and drops selected values that aren't among them
    // (filtered out by the term, or swapped away by server search)
    const isRendered = (v: T) => this.visibleOptions().some((o) => this._eq(o.value(), v));

    if (this.multiple()) {
      const added = next.filter((n) => !current.some((v) => this._eq(v, n)));
      const removedByUser = current.some((v) => isRendered(v) && !next.some((n) => this._eq(n, v)));
      // Pure pruning (nothing added, nothing rendered removed) is not a user change
      if (!added.length && !removedByUser) return;

      const kept = current.filter((v) => next.some((n) => this._eq(n, v)) || !isRendered(v));
      this._remember(added);
      this._commit([...kept, ...added]);
      this._resetSearch();
      return;
    }

    const picked = next.find((n) => !current.some((v) => this._eq(v, n)));
    if (picked !== undefined) {
      this._remember([picked]);
      this._commit(picked);
      this.setOpen(false);
      return;
    }
    // Empty result: either the user re-picked the selected (rendered) option, which aria toggles
    // off in explicit single mode, or aria pruned a value that isn't rendered. Keep the value;
    // only a real re-pick closes the panel.
    if (current.some(isRendered)) this.setOpen(false);
  }

  protected removeValue(value: T): void {
    this._commit(this.selectedValues().filter((v) => !this._eq(v, value)));
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------
  /** Opens the options in a bottom sheet; the selection is only committed when applied. */
  private _openSheet(): void {
    if (this._sheetRef || this.$disabled()) return;

    const data: UiSelectSheetData<T> = {
      title: this._sheetTitle(),
      multiple: this.multiple(),
      searchable: this.searchable(),
      searchTerm: this.searchTerm,
      options: this.visibleOptions,
      loading: this.loading,
      emptyText: this.emptyText,
      emptyTemplate: this.emptyTemplate,
      selected: [...this.selectedValues()],
      compareWith: (a, b) => this._eq(a, b),
    };
    const ref = this._bottomSheet.open<UiSelectSheetComponent<T>, UiSelectSheetData<T>, T[]>(
      UiSelectSheetComponent,
      { data, snapPoints: [0.85], ariaLabel: data.title }
    );
    this._sheetRef = ref;
    this.openedChange.emit(true);

    ref.afterDismissed().subscribe((result) => {
      this._sheetRef = null;
      this._resetSearch();
      this._onTouched();
      this.openedChange.emit(false);
      if (!result) return;

      this._remember(result);
      this._commit(this.multiple() ? result : (result[0] ?? null));
    });
  }

  /** The surrounding form-field label, else the aria label, else the placeholder. */
  private _sheetTitle(): string {
    const doc = this._host.nativeElement.ownerDocument;
    const fieldLabel = doc.querySelector(`label[for="${this.id}"]`)?.textContent?.trim();
    if (fieldLabel) return fieldLabel;

    const ariaLabel = this.ariaLabel()?.trim();
    if (ariaLabel) return ariaLabel;

    const labelledBy = this.ariaLabelledby()
      ?.split(/\s+/)
      .map((id) => doc.getElementById(id)?.textContent?.trim())
      .filter(Boolean)
      .join(' ');
    return labelledBy || this.placeholder();
  }

  private _remember(values: T[]): void {
    for (const value of values) {
      const option = this.options().find((o) => this._eq(o.value(), value));
      if (option) this._labels.set(value, option.label());
    }
  }

  private _commit(value: T | T[] | null): void {
    this.value.set(value);
    this._onChange(value);
  }

  private _updateInvalid(): void {
    const ngControl = this._ngControl;
    this._invalid.set(!!ngControl?.invalid && !!(ngControl.touched || ngControl.dirty));
  }

  private _eq(a: T, b: T): boolean {
    return this.compareWith()(a, b);
  }

  private _resetSearch(): void {
    this.searchTerm.set('');
  }
}
