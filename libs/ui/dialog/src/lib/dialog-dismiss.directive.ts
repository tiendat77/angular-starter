import { DialogRef } from '@angular/cdk/dialog';
import { Directive, inject } from '@angular/core';

@Directive({
  selector: '[dialog-dismiss], [dialogDismiss]',
  host: {
    '(click)': '_onButtonClick()',
  },
})
export class DialogDismissDirective {
  private _dialogRef = inject<DialogRef<any>>(DialogRef);

  _onButtonClick() {
    this._dialogRef.close();
  }
}
