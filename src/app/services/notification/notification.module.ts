import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@libs/icons';

import { NotificationService } from './notification.service';
import { NotificationPanelComponent } from './notification-panel/notification-panel.component';

@NgModule({
  declarations: [
    NotificationPanelComponent,
  ],
  imports: [
    CommonModule,
    IconsModule,
  ],
  providers: [
    NotificationService
  ]
})
export class NotificationModule {
  constructor(
    private _notification: NotificationService
  ) {}
}
