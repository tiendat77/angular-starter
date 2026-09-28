import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-reset-success',
  imports: [RouterLink],
  templateUrl: './reset-success.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResetSuccessComponent {}
