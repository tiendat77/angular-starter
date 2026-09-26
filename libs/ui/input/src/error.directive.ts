import { Directive } from '@angular/core';

let nextErrorId = 0;

/**
 * Applies error styling to a projected `<span uiError>` and exposes a
 * unique `id`, which `UiFormFieldComponent` reads to link the error into
 * the control's `aria-describedby`.
 */
@Directive({
  selector: 'span[uiError]',
  host: {
    class: 'text-xs text-error',
    role: 'alert',
    '[attr.id]': 'id',
  },
})
export class UiErrorDirective {
  readonly id = `ui-error-${nextErrorId++}`;
}
