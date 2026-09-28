import { ChangeDetectionStrategy, Component } from '@angular/core';

import { TabsExampleComponent } from './components/tabs-example';
import { ToolbarExampleComponent } from './components/toolbar-example';

@Component({
  selector: 'aria-example',
  templateUrl: './aria-example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ToolbarExampleComponent, TabsExampleComponent],
})
export class AriaExampleComponent {}
