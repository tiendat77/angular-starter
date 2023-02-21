import { Component, ChangeDetectionStrategy, Inject, Optional } from '@angular/core';
import { HotToastRef } from '@ngneat/hot-toast';

export interface NotificationDataModel {
  title?: string;
  message?: string;
  type?: 'basic' | 'info' | 'success' | 'error' | 'warning';
}

@Component({
  selector: 'bls-notification-panel',
  templateUrl: './notification-panel.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationPanelComponent {

  constructor(
    @Optional()
    @Inject(HotToastRef)
    public toastRef: HotToastRef<NotificationDataModel>
  ) {}

  close() {
    this.toastRef?.close({ dismissedByAction: true });
  }

}
