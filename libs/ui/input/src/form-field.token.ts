import { InjectionToken, Signal } from '@angular/core';

/**
 * Lets a projected control read state from its wrapping `UiFormFieldComponent`
 * without importing the component (which already imports the control).
 */
export interface UiFormFieldContext {
  /** True when a `uiPrefix` or `uiSuffix` is projected next to the control. */
  readonly $hasAffix: Signal<boolean>;
}

export const UI_FORM_FIELD = new InjectionToken<UiFormFieldContext>('UI_FORM_FIELD');
