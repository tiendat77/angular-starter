import { Toolbar, ToolbarWidget, ToolbarWidgetGroup } from '@angular/aria/toolbar';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SvgIcon } from '@libs/svg-icon';

@Component({
  selector: 'toolbar-example',
  templateUrl: './toolbar-example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Toolbar, ToolbarWidget, ToolbarWidgetGroup, SvgIcon],
})
export class ToolbarExampleComponent {}
