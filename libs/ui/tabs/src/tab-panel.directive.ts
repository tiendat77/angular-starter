import { TabPanel } from '@angular/aria/tabs';
import { Directive, inject } from '@angular/core';

@Directive({
  selector: '[uiTabPanel]',
  exportAs: 'uiTabPanel',
  standalone: true,
  hostDirectives: [
    {
      directive: TabPanel,
      inputs: ['value', 'id'],
    },
  ],
  host: {
    class: 'tab-panel',
    '[hidden]': '!visible()',
  },
})
export class UiTabPanelDirective {
  private readonly tabPanel = inject(TabPanel);
  readonly visible = this.tabPanel.visible;
}
