import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import { NgModule } from '@angular/core';

import { ToastComponent } from './toast.component';
import { ToastContainerComponent } from './toast.container';
import { ToastService } from './toast.service';

@NgModule({
  imports: [OverlayModule, PortalModule, ToastContainerComponent, ToastComponent],
  exports: [ToastContainerComponent, ToastComponent],
  providers: [ToastService],
})
export class ToastModule {}
