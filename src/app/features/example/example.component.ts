import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { WelcomeComponent } from './welcome/welcome.component';
import { DialogService } from '@libs/dialog';

import { ExampleDialogComponent } from './example-dialog/example-dialog.component';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [WelcomeComponent],
  templateUrl: './example.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExampleComponent {
  protected _dialog = inject(DialogService);

  openDialog() {
    this._dialog.open(ExampleDialogComponent, {
      width: '600px',
      data: {
        message: 'Hello World',
      },
    });
  }
}
