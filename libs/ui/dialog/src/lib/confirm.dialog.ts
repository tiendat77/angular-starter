import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

export interface DialogConfirmConfig {
  type?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  message?: string;
}

@Component({
  selector: 'dialog-confirm',
  templateUrl: './confirm.dialog.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [NgClass],
})
export class DialogConfirmComponent {
  public data = inject<DialogConfirmConfig>(DIALOG_DATA);
  public dialogRef = inject(DialogRef<boolean>);
}
