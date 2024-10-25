import {
  Directive,
  ElementRef,
  HostListener,
  OnDestroy,
  TemplateRef,
  ViewContainerRef,
  inject,
  input,
} from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { Subject } from 'rxjs';

@Directive({
  standalone: true,
  selector: 'overlay-menu, [overlayMenu]',
})
export class OverlayMenuDirective implements OnDestroy {
  overlayContext = input<any>();
  overlayTemplate = input<TemplateRef<any>>();

  private _overlayRef: OverlayRef;
  private _overlay = inject(Overlay);

  private _element = inject(ElementRef<HTMLElement>);
  private _viewContainerRef = inject(ViewContainerRef);

  private _unsubscribe = new Subject<any>();

  @HostListener('click') onClick(): void {
    this.openPanel();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  ngOnDestroy(): void {
    this._unsubscribe.next(null);
    this._unsubscribe.complete();

    if (this._overlayRef) {
      this._overlayRef.dispose();
    }
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  openPanel(): void {
    // Return if the panel or its origin is not defined
    if (!this.overlayTemplate || !this._element?.nativeElement) {
      return;
    }

    // Create the overlay if it doesn't exist
    if (!this._overlayRef) {
      this._createOverlay();
    }

    // Attach the portal to the overlay
    this._overlayRef.attach(
      new TemplatePortal(this.overlayTemplate()!, this._viewContainerRef, {
        $implicit: this.overlayContext(),
        dismiss: this.closePanel.bind(this),
      })
    );
  }

  closePanel(): void {
    this._overlayRef.detach();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------

  private _createOverlay(): void {
    // Create the overlay
    this._overlayRef = this._overlay.create({
      hasBackdrop: true,
      backdropClass: 'backdrop-on-mobile',
      scrollStrategy: this._overlay.scrollStrategies.block(),
      positionStrategy: this._overlay
        .position()
        .flexibleConnectedTo(this._element.nativeElement)
        .withLockedPosition(true)
        .withPush(true)
        .withPositions([
          {
            originX: 'start',
            originY: 'bottom',
            overlayX: 'start',
            overlayY: 'top',
          },
          {
            originX: 'start',
            originY: 'top',
            overlayX: 'start',
            overlayY: 'bottom',
          },
          {
            originX: 'end',
            originY: 'bottom',
            overlayX: 'end',
            overlayY: 'top',
          },
          {
            originX: 'end',
            originY: 'top',
            overlayX: 'end',
            overlayY: 'bottom',
          },
        ]),
    });

    // Detach the overlay from the portal on backdrop click
    this._overlayRef.backdropClick().subscribe(() => {
      this._overlayRef.detach();
    });
  }
}
