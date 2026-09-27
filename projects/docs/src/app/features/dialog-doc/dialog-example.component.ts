import { DIALOG_DATA } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { UiButtonComponent } from '@libs/ui/button';
import { DialogModule } from '@libs/ui/dialog';

export interface DialogExampleData {
  alert: boolean;
  fullscreen: boolean;
}

/** Custom dialog opened from the Dialog docs page. */
@Component({
  selector: 'doc-dialog-example',
  imports: [DialogModule, UiButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dialog-example.component.html',
})
export class DialogExampleComponent {
  readonly data = inject<DialogExampleData>(DIALOG_DATA);
}
