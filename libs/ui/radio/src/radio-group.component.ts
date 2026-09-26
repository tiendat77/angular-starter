import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  forwardRef,
  inject,
  input,
  model,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { cn, UI_CONFIG, UiSize } from '@libs/ui/core';
import { UiRadioComponent } from './radio.component';

let nextRadioGroupId = 0;

@Component({
  selector: 'ui-radio-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UiRadioGroupComponent),
      multi: true,
    },
  ],
  host: {
    role: 'radiogroup',
    '[class]': 'hostClass()',
    '[attr.aria-disabled]': 'effectiveDisabled() ? "true" : null',
  },
  template: '<ng-content />',
})
export class UiRadioGroupComponent implements ControlValueAccessor {
  // -----------------------------------------------------------------------------------------------------
  // @ Public properties
  // -----------------------------------------------------------------------------------------------------
  readonly value = model<any>(null);
  readonly name = input<string>(`ui-radio-group-${++nextRadioGroupId}`);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly size = input<UiSize>('md');

  // -----------------------------------------------------------------------------------------------------
  // @ Private / Protected properties
  // -----------------------------------------------------------------------------------------------------
  private readonly _cvaDisabled$ = signal(false);
  private readonly _uiConfig = inject(UI_CONFIG, { optional: true });
  protected readonly radios = contentChildren(
    forwardRef(() => UiRadioComponent),
    {
      descendants: true,
    }
  );

  private _onChange: (value: any) => void = () => undefined;
  private _onTouched: () => void = () => undefined;

  readonly effectiveDisabled = computed(() => this.disabled() || this._cvaDisabled$());
  readonly effectiveSize = computed(() => this.size() ?? this._uiConfig?.defaultSize ?? 'md');

  protected readonly hostClass = computed(() =>
    cn('inline-flex flex-col gap-2', this.effectiveDisabled() && 'opacity-50 pointer-events-none')
  );

  // -----------------------------------------------------------------------------------------------------
  // @ ControlValueAccessor
  // -----------------------------------------------------------------------------------------------------
  writeValue(value: any): void {
    this.value.set(value);
  }

  registerOnChange(fn: (value: any) => void): void {
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
  selectValue(val: any): void {
    if (this.effectiveDisabled()) {
      return;
    }
    this.value.set(val);
    this._onChange(val);
    this._onTouched();
  }

  selectNext(current: UiRadioComponent): void {
    const list = this.radios().filter((r) => !r.isDisabled());
    if (list.length === 0) return;
    const currentIndex = list.indexOf(current);
    const nextIndex = currentIndex < list.length - 1 ? currentIndex + 1 : 0;
    const nextRadio = list[nextIndex];
    this.selectValue(nextRadio.value());
    nextRadio.focus();
  }

  selectPrevious(current: UiRadioComponent): void {
    const list = this.radios().filter((r) => !r.isDisabled());
    if (list.length === 0) return;
    const currentIndex = list.indexOf(current);
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : list.length - 1;
    const prevRadio = list[prevIndex];
    this.selectValue(prevRadio.value());
    prevRadio.focus();
  }

  isFirstEnabledRadio(radio: UiRadioComponent): boolean {
    const firstEnabled = this.radios().find((r) => !r.isDisabled());
    return firstEnabled === radio;
  }

  hasCheckedRadio(): boolean {
    return this.radios().some((r) => r.isChecked());
  }
}
