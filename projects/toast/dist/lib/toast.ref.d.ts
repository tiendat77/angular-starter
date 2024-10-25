import { OverlayRef } from '@angular/cdk/overlay';
import { Observable } from 'rxjs';
import { ToastContainerComponent } from './toast.container';
/** Event that is emitted when a toast is dismissed. */
export interface ToastDismiss {
    /** Whether the toast was dismissed using the action button. */
    dismissedByAction: boolean;
}
/**
 * Reference to a toast dispatched from the toast service.
 */
export declare class ToastRef<T> {
    private _overlayRef;
    /** The instance of the component making up the content of the toast. */
    instance: T;
    /**
     * The instance of the component making up the content of the toast.
     * @docs-private
     */
    containerInstance: ToastContainerComponent;
    /** Subject for notifying the user that the toast has been dismissed. */
    private readonly _afterDismissed;
    /** Subject for notifying the user that the toast has opened and appeared. */
    private readonly _afterOpened;
    /** Subject for notifying the user that the toast action was called. */
    private readonly _onAction;
    /**
     * Timeout ID for the duration setTimeout call. Used to clear the timeout if the toast is
     * dismissed before the duration passes.
     */
    private _durationTimeoutId;
    /** Whether the toast was dismissed using the action button. */
    private _dismissedByAction;
    constructor(containerInstance: ToastContainerComponent, _overlayRef: OverlayRef);
    /** Dismisses the toast. */
    dismiss(): void;
    /** Marks the toast action clicked. */
    dismissWithAction(): void;
    /**
     * Marks the toast action clicked.
     * @deprecated Use `dismissWithAction` instead.
     * @breaking-change 8.0.0
     */
    closeWithAction(): void;
    /** Dismisses the toast after some duration */
    _dismissAfter(duration: number): void;
    /** Marks the toast as opened */
    _open(): void;
    /** Cleans up the DOM after closing. */
    private _finishDismiss;
    /** Gets an observable that is notified when the toast is finished closing. */
    afterDismissed(): Observable<ToastDismiss>;
    /** Gets an observable that is notified when the toast has opened and appeared. */
    afterOpened(): Observable<void>;
    /** Gets an observable that is notified when the toast action is called. */
    onAction(): Observable<void>;
}
