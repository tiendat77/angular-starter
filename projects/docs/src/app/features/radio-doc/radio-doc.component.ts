import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'doc-radio',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<div><h1 class="text-2xl font-bold">Radio Group</h1></div>',
})
export class RadioDocComponent {}
