import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { TOAST_DATA, ToastType } from './toast.config';
import { ToastRef } from './toast.ref';

@Component({
  selector: 'toast',
  imports: [NgClass],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './toast.component.html',
})
export class ToastComponent {
  public data = inject<{
    title: string;
    message: string;
    type: ToastType;
  }>(TOAST_DATA);

  public toastRef = inject(ToastRef<ToastComponent>);

  action(): void {
    this.toastRef.dismissWithAction();
  }

  dismiss(): void {
    this.toastRef.dismiss();
  }
}
