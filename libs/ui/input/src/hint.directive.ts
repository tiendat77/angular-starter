import { Directive } from '@angular/core';

let nextHintId = 0;

/**
 * Applies hint styling to a projected `<span uiHint>` and exposes a unique
 * `id`, which `UiFormFieldComponent` reads to link the hint into the
 * control's `aria-describedby`.
 */
@Directive({
  selector: 'span[uiHint]',
  host: {
    class: 'text-xs text-foreground/60',
    '[attr.id]': 'id',
  },
})
export class UiHintDirective {
  readonly id = `ui-hint-${nextHintId++}`;
}
