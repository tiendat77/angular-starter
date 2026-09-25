import { Signal } from '@angular/core';

export abstract class UiFormFieldControl<T> {
  abstract readonly $value: Signal<T | null>;
  abstract readonly $disabled: Signal<boolean>;
  abstract readonly $focused: Signal<boolean>;
  abstract readonly $invalid: Signal<boolean>;
  abstract readonly id: string;
}
