import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-example-dialog',
  standalone: true,
  imports: [],
  templateUrl: './example-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExampleDialogComponent {}
