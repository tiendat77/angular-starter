import { OverlayRef } from '@angular/cdk/overlay';

export class LoaderOverlayRef {
  instance: any;

  constructor(private _overlayRef: OverlayRef) {}

  close(): void {
    this._overlayRef.dispose();
  }
}
