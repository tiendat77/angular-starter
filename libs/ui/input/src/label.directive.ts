import { Directive } from '@angular/core';

/**
 * Applies the design system's label styling to a native `<label>` projected
 * into a `UiFormFieldComponent`.
 *
 * `UiFormFieldComponent` links this label to its control by writing the
 * control's generated `id` onto this element's `for` attribute, so no input
 * is needed here to configure that relationship manually.
 */
@Directive({
  selector: 'label[uiLabel]',
  host: {
    class: 'block text-sm font-medium text-foreground',
  },
})
export class UiLabelDirective {}
