import { OverlayRef } from '@angular/cdk/overlay';
import { Signal } from '@angular/core';
import { Observable, Subject } from 'rxjs';

/**
 * Structural shape the bottom-sheet container must satisfy. Declared separately from the
 * concrete container component so UiBottomSheetRef has no forward dependency on it.
 */
export interface BottomSheetContainerRef {
  readonly snapIndex: Signal<number>;
  readonly _onEnter: Observable<void>;
  readonly _onExit: Observable<void>;
  exit(): void;
  snapTo(index: number): void;
}

export class UiBottomSheetRef<T, R = unknown> {
  /** The instance of the opened component. Unset for template portals. */
  instance!: T;

  containerInstance: BottomSheetContainerRef;

  private readonly _afterDismissed = new Subject<R | undefined>();
  private _result: R | undefined;
  private _dismissed = false;

  constructor(
    containerInstance: BottomSheetContainerRef,
    private _overlayRef: OverlayRef
  ) {
    this.containerInstance = containerInstance;
    containerInstance._onExit.subscribe(() => this._finishDismiss());
  }

  /** Dismisses the sheet. `result` resolves afterDismissed(); omit it for a "cancelled" dismissal. */
  dismiss(result?: R): void {
    if (!this._dismissed) {
      this._dismissed = true;
      this._result = result;
      this.containerInstance.exit();
    }
  }

  /** Programmatically animates to a snap index; delegates clamping to the container. */
  snapTo(index: number): void {
    this.containerInstance.snapTo(index);
  }

  get snapIndex(): Signal<number> {
    return this.containerInstance.snapIndex;
  }

  afterDismissed(): Observable<R | undefined> {
    return this._afterDismissed;
  }

  afterOpened(): Observable<void> {
    return this.containerInstance._onEnter;
  }

  backdropClick(): Observable<MouseEvent> {
    return this._overlayRef.backdropClick();
  }

  keydownEvents(): Observable<KeyboardEvent> {
    return this._overlayRef.keydownEvents();
  }

  private _finishDismiss(): void {
    this._overlayRef.dispose();
    this._afterDismissed.next(this._result);
    this._afterDismissed.complete();
  }
}
