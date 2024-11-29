import { Overlay, OverlayConfig } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Injectable, inject } from '@angular/core';

import { LoaderComponent } from './loader.component';
import { LoaderOverlayRef } from './loader.ref';

@Injectable({
  providedIn: 'root',
})
export class LoaderService {
  private _openedLoaderRef: LoaderOverlayRef | null = null;
  private _overlay = inject(Overlay);

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  show() {
    if (this._openedLoaderRef) {
      return this._openedLoaderRef;
    }

    return this._attach();
  }

  hide(): void {
    if (this._openedLoaderRef) {
      this._openedLoaderRef.close();
    }
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------

  private _attach() {
    const overlayRef = this._createOverlay();
    const loaderRef = new LoaderOverlayRef(overlayRef);

    const portal = new ComponentPortal(LoaderComponent);
    const contentRef = overlayRef.attach(portal);

    loaderRef.instance = contentRef.instance;
    this._openedLoaderRef = loaderRef;

    return this._openedLoaderRef;
  }

  private _createOverlay() {
    const positionStrategy = this._overlay
      .position()
      .global()
      .centerHorizontally()
      .centerVertically();

    const scrollStrategy = this._overlay.scrollStrategies.block();

    const overlayConfig = new OverlayConfig({
      hasBackdrop: true,
      scrollStrategy,
      positionStrategy,
    });

    return this._overlay.create(overlayConfig);
  }
}
