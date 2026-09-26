import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'doc-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<div><h1 class="text-2xl font-bold">Input & Form Field</h1></div>',
})
export class InputDocComponent {}
