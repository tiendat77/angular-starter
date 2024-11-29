import { DialogRef } from '@angular/cdk/dialog';
import { Directive } from '@angular/core';

@Directive({
  standalone: true,
  selector: '[dialog-dismiss], [dialogDismiss]',
  host: {
    '(click)': '_onButtonClick()',
  },
})
export class DialogDismissDirective {
  constructor(private _dialogRef: DialogRef<any>) {}

  _onButtonClick() {
    this._dialogRef.close();
  }
}
