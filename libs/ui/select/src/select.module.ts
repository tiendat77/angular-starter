import { NgModule } from '@angular/core';

import { UiHighlightDirective } from './highlight.directive';
import { UiOptionComponent } from './option.component';
import { UiSelectEmptyDirective } from './select-empty.directive';
import { UiSelectComponent } from './select.component';

const SELECT_DECLARATIONS = [
  UiSelectComponent,
  UiOptionComponent,
  UiSelectEmptyDirective,
  UiHighlightDirective,
];

/**
 * Everything a template needs to build a select. Import this instead of the individual parts:
 * `imports: [UiSelectModule]`. The parts are standalone, so importing them one by one still works.
 */
@NgModule({
  imports: SELECT_DECLARATIONS,
  exports: SELECT_DECLARATIONS,
})
export class UiSelectModule {}
