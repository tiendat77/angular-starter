import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'empty-placeholder',
  templateUrl: './empty-placeholder.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyPlaceholderComponent {}
