import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-welcome',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './welcome.html',
})
export class WelcomeComponent {}
