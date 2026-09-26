import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'doc-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<div><h1 class="text-2xl font-bold">Button</h1></div>',
})
export class ButtonDocComponent {}
