import { NgModule } from '@angular/core';
import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';

import { LoaderComponent } from './loader.component';
import { LoaderService } from './loader.service';

@NgModule({
  imports: [OverlayModule, PortalModule, LoaderComponent],
  exports: [LoaderComponent],
  providers: [LoaderService],
})
export class ToastModule {}
