import { Dialog, DialogConfig, DialogRef } from '@angular/cdk/dialog';
import { ComponentType, Overlay } from '@angular/cdk/overlay';
import { Injectable, OnDestroy, TemplateRef, inject } from '@angular/core';

import { merge } from 'es-toolkit';
import { DialogConfirmComponent, DialogConfirmConfig } from './confirm.dialog';

@Injectable({
  providedIn: 'root',
})
export class DialogService implements OnDestroy {
  protected _dialog: Dialog = inject(Dialog);
  protected _overlay: Overlay = inject(Overlay);

  open<T, D = any, R = any>(
    componentOrTemplateRef: ComponentType<T> | TemplateRef<T>,
    config?: DialogConfig<D, DialogRef<R, T>>
  ): DialogRef<R, T> {
    config = {
      ...new DialogConfig<D, DialogRef<R, T>>(),
      ...config,
    };

    const cdkRef = this._dialog.open<R, D, T>(componentOrTemplateRef, config);

    return cdkRef;
  }

  confirm(config: DialogConfirmConfig) {
    return this.open(DialogConfirmComponent, {
      minWidth: '400px',
      data: merge({ type: 'info' }, config),
    });
  }

  closeAll(): void {
    this._dialog.closeAll();
  }

  ngOnDestroy() {
    this.closeAll();
  }
}
