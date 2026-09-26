import { Combobox, ComboboxPopup, ComboboxWidget } from '@angular/aria/combobox';
import { Listbox, Option } from '@angular/aria/listbox';
import { CdkConnectedOverlay, CdkOverlayOrigin, ConnectedPosition } from '@angular/cdk/overlay';
import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  ElementRef,
  inject,
  input,
  model,
  signal,
  viewChild,
} from '@angular/core';
import { cn, UI_CONFIG, UiSize } from '@libs/ui/core';
import { inputVariants, UiFormFieldAppearance } from '@libs/ui/input';
import { UiOptionComponent } from './option.component';

let nextSelectId = 0;

const PANEL_POSITIONS: ConnectedPosition[] = [
  { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 4 },
  { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -4 },
];

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
  ],
  templateUrl: './select.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block',
  },
})
export class UiSelectComponent<T = unknown> {
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

  // -----------------------------------------------------------------------------------------------------
  // @ Content / view
  // -----------------------------------------------------------------------------------------------------
  protected readonly options = contentChildren<UiOptionComponent<T>>(UiOptionComponent);
  private readonly _input = viewChild<ElementRef<HTMLInputElement>>('trigger');

  // -----------------------------------------------------------------------------------------------------
  // @ State
  // -----------------------------------------------------------------------------------------------------
  protected readonly positions = PANEL_POSITIONS;
  protected readonly open = signal(false);
  protected readonly searchable = signal(false);

  protected readonly selectedValues = computed<T[]>(() => {
    const value = this.value();
    return value == null ? [] : [value as T];
  });

  protected readonly visibleOptions = computed(() => this.options());

  /** Selected values mapped onto the rendered option values, so aria sees the same references. */
  protected readonly listboxValue = computed<T[]>(() => {
    const options = this.options();
    return this.selectedValues().map((v) => options.find((o) => o.value() === v)?.value() ?? v);
  });

  protected readonly hasValue = computed(() => this.selectedValues().length > 0);

  protected readonly selectedLabel = computed(() => {
    const value = this.selectedValues()[0];
    return (
      this.options()
        .find((o) => o.value() === value)
        ?.label() ?? ''
    );
  });

  protected readonly showPlaceholder = computed(() => !this.hasValue());

  protected readonly triggerClass = computed(() =>
    cn(inputVariants({ appearance: this.appearance(), size: this.size() }), 'select-trigger')
  );

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
      this.value.set(picked);
    }
    this.setOpen(false);
  }
}
