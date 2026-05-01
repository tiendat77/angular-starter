import { Tab, TabContent, TabList, TabPanel, Tabs } from '@angular/aria/tabs';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'tabs-example',
  templateUrl: './tabs-example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Tabs, TabList, Tab, TabPanel, TabContent],
})
export class TabsExampleComponent {}
