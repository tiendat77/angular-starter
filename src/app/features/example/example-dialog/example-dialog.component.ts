import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DIALOG_DATA } from '@angular/cdk/dialog';
import { DialogModule } from '@libs/dialog';

@Component({
  selector: 'app-example-dialog',
  standalone: true,
  imports: [DialogModule],
  templateUrl: './example-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExampleDialogComponent {
  public data = inject<{ message: string }>(DIALOG_DATA);
}
