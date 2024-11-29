import { NgClass } from '@angular/common';
import { Component, inject } from '@angular/core';

import { TOAST_DATA, ToastType } from './toast.config';
import { ToastRef } from './toast.ref';

@Component({
  selector: 'toast',
  standalone: true,
  imports: [NgClass],
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
