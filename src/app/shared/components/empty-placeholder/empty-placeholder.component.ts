import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'empty-placeholder',
  templateUrl: './empty-placeholder.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyPlaceholderComponent {}
