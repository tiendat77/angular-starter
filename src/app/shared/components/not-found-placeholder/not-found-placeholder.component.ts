import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'not-found-placeholder',
  templateUrl: './not-found-placeholder.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFoundPlaceholderComponent {}
