import { booleanAttribute, computed, Directive, inject, input, model, signal } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { UI_CONFIG, UiSize } from '@libs/ui/core';
import { checkboxVariants, switchTrackVariants } from './checkbox.variants';

let nextSwitchId = 0;

/**
 * State, `ControlValueAccessor` and class computation shared by the switch variants
 * (`ui-switch`, `ui-switch-labeled`). Subclasses only provide the template and
 * `NG_VALUE_ACCESSOR`.
 */
@Directive()
export abstract class UiSwitchBase implements ControlValueAccessor {
  // -----------------------------------------------------------------------------------------------------
  // @ Public properties
  // -----------------------------------------------------------------------------------------------------
  readonly checked = model<boolean>(false);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly size = input<UiSize>('md');
  readonly label = input<string>();
  readonly id = input<string>();

  // -----------------------------------------------------------------------------------------------------
  // @ Private / Protected properties
  // -----------------------------------------------------------------------------------------------------
  private readonly _autoId = `ui-switch-${++nextSwitchId}`;
  private readonly _cvaDisabled$ = signal(false);
  private readonly _uiConfig = inject(UI_CONFIG, { optional: true });

  private _onChange: (value: boolean) => void = () => undefined;
  private _onTouched: () => void = () => undefined;

  protected readonly $effectiveDisabled = computed(() => this.disabled() || this._cvaDisabled$());
  protected readonly $effectiveId = computed(() => this.id() || this._autoId);
  protected readonly $effectiveSize = computed(
    () => this.size() ?? this._uiConfig?.defaultSize ?? 'md'
  );

  protected readonly $rootClass = computed(() =>
    checkboxVariants({
      size: this.$effectiveSize(),
      disabled: this.$effectiveDisabled() ? 'true' : 'false',
    })
  );

  protected readonly $trackClass = computed(() =>
    switchTrackVariants({ size: this.$effectiveSize() })
  );

  // -----------------------------------------------------------------------------------------------------
  // @ ControlValueAccessor
  // -----------------------------------------------------------------------------------------------------
  writeValue(value: boolean): void {
    this.checked.set(Boolean(value));
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this._cvaDisabled$.set(isDisabled);
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------
  toggle(): void {
    if (this.$effectiveDisabled()) {
      return;
    }
    const next = !this.checked();
    this.checked.set(next);
    this._onChange(next);
    this._onTouched();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Protected methods
  // -----------------------------------------------------------------------------------------------------
  protected onInputChange(event: Event): void {
    if (this.$effectiveDisabled()) {
      return;
    }
    const isChecked = (event.target as HTMLInputElement).checked;
    this.checked.set(isChecked);
    this._onChange(isChecked);
    this._onTouched();
  }

  protected onBlur(): void {
    this._onTouched();
  }
}
