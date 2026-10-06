import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { TOAST_DATA, ToastType } from './toast.config';
import { ToastRef } from './toast.ref';
import { toastVariants } from './toast.variants';

@Component({
  selector: 'toast',
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

  /** Soft tint of the toast's status color (the type never changes while a toast is shown). */
  protected readonly panelClass = toastVariants({ type: this.data.type });

  action(): void {
    this.toastRef.dismissWithAction();
  }

  dismiss(): void {
    this.toastRef.dismiss();
  }
}
