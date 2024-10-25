import { Directive } from '@angular/core';
import { DialogRef } from '@angular/cdk/dialog';

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
