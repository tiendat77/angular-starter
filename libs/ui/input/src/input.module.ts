import { NgModule } from '@angular/core';

import { UiErrorDirective } from './error.directive';
import { UiFormFieldComponent } from './form-field.component';
import { UiHintDirective } from './hint.directive';
import { UiInputDirective } from './input.directive';
import { UiLabelDirective } from './label.directive';
import { UiPrefixDirective, UiSuffixDirective } from './prefix-suffix.directive';
import { UiTextareaDirective } from './textarea.directive';

const INPUT_DECLARATIONS = [
  UiFormFieldComponent,
  UiInputDirective,
  UiTextareaDirective,
  UiLabelDirective,
  UiHintDirective,
  UiErrorDirective,
  UiPrefixDirective,
  UiSuffixDirective,
];

/**
 * Everything a template needs to build a form field with an input or a textarea. Import this instead of the individual parts:
 * `imports: [UiInputModule]`. The parts are standalone, so importing them one by one still works.
 */
@NgModule({
  imports: INPUT_DECLARATIONS,
  exports: INPUT_DECLARATIONS,
})
export class UiInputModule {}
