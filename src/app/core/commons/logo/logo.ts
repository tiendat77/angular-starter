import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'logo',
  templateUrl: './logo.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'inline-flex',
  },
})
export class LogoComponent {}
