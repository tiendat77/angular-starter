import { NgModule } from '@angular/core';

import { UiRadioGroupComponent } from './radio-group.component';
import { UiRadioComponent } from './radio.component';

const RADIO_DECLARATIONS = [UiRadioGroupComponent, UiRadioComponent];

/**
 * Everything a template needs to build a radio group. Import this instead of the individual parts:
 * `imports: [UiRadioModule]`. The parts are standalone, so importing them one by one still works.
 */
@NgModule({
  imports: RADIO_DECLARATIONS,
  exports: RADIO_DECLARATIONS,
})
export class UiRadioModule {}
