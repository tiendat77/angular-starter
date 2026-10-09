import { NgModule } from '@angular/core';

import {
  UiAlertActionsDirective,
  UiAlertIconDirective,
  UiAlertTitleDirective,
} from './alert-parts.directive';
import { UiAlertComponent } from './alert.component';

const ALERT_DECLARATIONS = [
  UiAlertComponent,
  UiAlertTitleDirective,
  UiAlertIconDirective,
  UiAlertActionsDirective,
];

/**
 * Everything a template needs to build an alert. Import this instead of the individual parts:
 * `imports: [UiAlertModule]`. The parts are standalone, so importing them one by one still works.
 */
@NgModule({
  imports: ALERT_DECLARATIONS,
  exports: ALERT_DECLARATIONS,
})
export class UiAlertModule {}
