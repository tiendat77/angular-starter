/* eslint-disable @angular-eslint/component-selector */
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  standalone: true,
  selector: 'not-found-placeholder',
  templateUrl: './not-found-placeholder.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFoundPlaceholderComponent {}
