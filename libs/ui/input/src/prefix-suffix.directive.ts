import { Directive } from '@angular/core';

/**
 * Marks projected content (an icon, a unit label, an action button, etc.)
 * to render before the control inside a `UiFormFieldComponent`'s control
 * row.
 */
@Directive({
  selector: '[uiPrefix]',
  host: {
    class: 'flex shrink-0 items-center text-foreground/60',
  },
})
export class UiPrefixDirective {}

/**
 * Marks projected content to render after the control inside a
 * `UiFormFieldComponent`'s control row.
 */
@Directive({
  selector: '[uiSuffix]',
  host: {
    class: 'flex shrink-0 items-center text-foreground/60',
  },
})
export class UiSuffixDirective {}
