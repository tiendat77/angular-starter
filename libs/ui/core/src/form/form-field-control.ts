import { Signal } from '@angular/core';

export abstract class UiFormFieldControl<T> {
  abstract readonly $value: Signal<T | null>;
  abstract readonly $disabled: Signal<boolean>;
  abstract readonly $focused: Signal<boolean>;
  abstract readonly $invalid: Signal<boolean>;
  abstract readonly id: string;

  /**
   * Element that receives `aria-describedby` / `aria-invalid` from `ui-form-field`.
   * Omit it when that element is the control's host (e.g. `input[uiInput]`).
   */
  readonly ariaTarget?: Signal<HTMLElement | undefined>;
}
