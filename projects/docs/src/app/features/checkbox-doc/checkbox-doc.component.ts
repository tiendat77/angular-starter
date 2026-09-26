import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'doc-checkbox',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<div><h1 class="text-2xl font-bold">Checkbox & Switch</h1></div>',
})
export class CheckboxDocComponent {}
