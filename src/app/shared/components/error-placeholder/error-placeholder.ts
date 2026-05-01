import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'error-placeholder',
  templateUrl: './error-placeholder.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorPlaceholderComponent {}
