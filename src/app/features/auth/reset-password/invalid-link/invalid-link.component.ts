import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-invalid-link',
  imports: [RouterLink],
  templateUrl: './invalid-link.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvalidLinkComponent {}
