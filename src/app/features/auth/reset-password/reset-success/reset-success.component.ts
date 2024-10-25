import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-reset-success',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './reset-success.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResetSuccessComponent {}
