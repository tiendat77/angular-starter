import { NgModule } from '@angular/core';

import {
  UiCardActionDirective,
  UiCardContentDirective,
  UiCardDescriptionDirective,
  UiCardFooterDirective,
  UiCardHeaderDirective,
  UiCardMediaDirective,
  UiCardTitleDirective,
} from './card-parts.directive';
import { UiCardComponent } from './card.component';

const CARD_DECLARATIONS = [
  UiCardComponent,
  UiCardHeaderDirective,
  UiCardTitleDirective,
  UiCardDescriptionDirective,
  UiCardActionDirective,
  UiCardContentDirective,
  UiCardFooterDirective,
  UiCardMediaDirective,
];

/**
 * Everything a template needs to build a card. Import this instead of the individual parts:
 * `imports: [UiCardModule]`. The parts are standalone, so importing them one by one still works.
 */
@NgModule({
  imports: CARD_DECLARATIONS,
  exports: CARD_DECLARATIONS,
})
export class UiCardModule {}
