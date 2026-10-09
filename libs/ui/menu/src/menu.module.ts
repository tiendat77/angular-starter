import { NgModule } from '@angular/core';

import { UiMenuDividerDirective } from './menu-divider.directive';
import { UiMenuItemDirective } from './menu-item.directive';
import { UiMenuLabelDirective } from './menu-label.directive';
import { UiMenuTriggerDirective } from './menu-trigger.directive';
import { UiMenuDirective } from './menu.directive';

const MENU_DECLARATIONS = [
  UiMenuTriggerDirective,
  UiMenuDirective,
  UiMenuItemDirective,
  UiMenuLabelDirective,
  UiMenuDividerDirective,
];

/**
 * Everything a template needs to build a menu. Import this instead of the individual parts:
 * `imports: [UiMenuModule]`. The parts are standalone, so importing them one by one still works.
 */
@NgModule({
  imports: MENU_DECLARATIONS,
  exports: MENU_DECLARATIONS,
})
export class UiMenuModule {}
