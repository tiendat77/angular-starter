import { NgModule } from '@angular/core';

import { UiTabContentDirective } from './tab-content.directive';
import { UiTabListDirective } from './tab-list.directive';
import { UiTabPanelDirective } from './tab-panel.directive';
import { UiTabDirective } from './tab.directive';
import { UiTabsDirective } from './tabs.directive';

const TABS_DECLARATIONS = [
  UiTabsDirective,
  UiTabListDirective,
  UiTabDirective,
  UiTabPanelDirective,
  UiTabContentDirective,
];

/** Everything a template needs to build tabs. Import this instead of the individual directives. */
@NgModule({
  imports: TABS_DECLARATIONS,
  exports: TABS_DECLARATIONS,
})
export class UiTabsModule {}
