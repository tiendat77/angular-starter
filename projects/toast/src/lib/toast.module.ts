import { NgModule } from '@angular/core';
import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';

import { ToastComponent } from './toast.component';
import { ToastService } from './toast.service';
import { ToastContainerComponent } from './toast.container';

@NgModule({
  imports: [OverlayModule, PortalModule, ToastContainerComponent, ToastComponent],
  exports: [ToastContainerComponent, ToastComponent],
  providers: [ToastService],
})
export class ToastModule {}
