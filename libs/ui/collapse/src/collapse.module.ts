import { NgModule } from '@angular/core';

import { UiCollapsePanel } from './collapse-panel.component';
import { UiCollapse } from './collapse.component';
import {
  UiCollapseContentDirective,
  UiCollapseExtraDirective,
  UiCollapseHeaderDirective,
  UiCollapseIconDirective,
} from './collapse.directives';

const COLLAPSE_DECLARATIONS = [
  UiCollapse,
  UiCollapsePanel,
  UiCollapseHeaderDirective,
  UiCollapseExtraDirective,
  UiCollapseContentDirective,
  UiCollapseIconDirective,
];

/**
 * Everything a template needs to build a collapse (accordion). Import this instead of the individual parts:
 * `imports: [UiCollapseModule]`. The parts are standalone, so importing them one by one still works.
 */
@NgModule({
  imports: COLLAPSE_DECLARATIONS,
  exports: COLLAPSE_DECLARATIONS,
})
export class UiCollapseModule {}
