import { AnimationTriggerMetadata, AnimationEvent } from '@angular/animations';
import { Direction } from '@angular/cdk/bidi';
import * as i0 from '@angular/core';
import { InjectionToken, ViewContainerRef, OnDestroy, ComponentRef, EmbeddedViewRef, TemplateRef, Provider, EnvironmentProviders } from '@angular/core';
import * as i1 from '@angular/cdk/overlay';
import { OverlayRef } from '@angular/cdk/overlay';
import { Subject, Observable } from 'rxjs';
import * as i2 from '@angular/cdk/portal';
import { BasePortalOutlet, CdkPortalOutlet, ComponentPortal, TemplatePortal, DomPortal } from '@angular/cdk/portal';

declare const toastAnimations: {
    readonly toastState: AnimationTriggerMetadata;
};
type ToastAnimationState = 'default' | 'closing';

declare const TOAST_DATA: InjectionToken<any>;
type ToastType = 'success' | 'error' | 'info' | 'warning';
type ToastHorizontalPosition = 'start' | 'center' | 'end' | 'left' | 'right';
type ToastVerticalPosition = 'top' | 'bottom';
declare class ToastConfig<D = any> {
    /**
     * The view container that serves as the parent for the toast for the purposes of dependency
     * injection. Note: this does not affect where the toast is inserted in the DOM.
     */
    viewContainerRef?: ViewContainerRef;
    /** The length of time in milliseconds to wait before automatically dismissing the toast. */
    duration?: number;
    /** Text layout direction for the toast. */
    direction?: Direction;
    /** Data being injected into the child component. */
    data?: D | null;
    /** The horizontal position to place the toast. */
    horizontalPosition?: ToastHorizontalPosition;
    /** The vertical position to place the toast. */
    verticalPosition?: ToastVerticalPosition;
}

declare class ToastContainerComponent extends BasePortalOutlet implements OnDestroy {
    private _ngZone;
    private _changeDetectorRef;
    /** Whether the component has been destroyed. */
    private _destroyed;
    /** The portal outlet inside of this container into which the toast content will be loaded. */
    _portalOutlet: CdkPortalOutlet;
    /** Subject for notifying that the toast has exited from view. */
    readonly _onExit: Subject<void>;
    /** Subject for notifying that the toast has finished entering the view. */
    readonly _onEnter: Subject<void>;
    /** The state of the toast animations. */
    _animationState: string;
    attachComponentPortal<T>(portal: ComponentPortal<T>): ComponentRef<T>;
    attachTemplatePortal<C>(portal: TemplatePortal<C>): EmbeddedViewRef<C>;
    attachDomPortal: (portal: DomPortal) => void;
    onAnimationEnd(event: AnimationEvent): void;
    enter(): void;
    exit(): Observable<void>;
    ngOnDestroy(): void;
    private _completeExit;
    static ɵfac: i0.ɵɵFactoryDeclaration<ToastContainerComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<ToastContainerComponent, "toast-container", never, {}, {}, never, never, true, never>;
}

/** Event that is emitted when a toast is dismissed. */
interface ToastDismiss {
    /** Whether the toast was dismissed using the action button. */
    dismissedByAction: boolean;
}
/**
 * Reference to a toast dispatched from the toast service.
 */
declare class ToastRef<T> {
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

declare class ToastComponent {
    data: {
        title: string;
        message: string;
        type: ToastType;
    };
    toastRef: ToastRef<any>;
    action(): void;
    dismiss(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<ToastComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<ToastComponent, "toast", never, {}, {}, never, never, true, never>;
}

/**
 * Defines valid templates in Toast.
 * @group Templates
 */
interface ToastTemplates {
    /**
     * Custom template of message.
     */
    message(context: {
        /**
         * Data of the message.
         */
        $implicit: any;
    }): TemplateRef<{
        $implicit: any;
    }>;
    /**
     * Headless template.
     */
    headless(context: {
        /**
         * Data of the message.
         */
        $implicit: any;
    }): TemplateRef<{
        $implicit: any;
    }>;
}
/**
 * Custom close event.
 * @see {@link Toast.onClose}
 * @group Events
 */
interface ToastCloseEvent {
    /**
     * Message of the closed element.
     */
    message: any;
}
/**
 * Custom close event.
 * @see {@link ToastItem.onClose}
 */
interface ToastItemCloseEvent extends ToastCloseEvent {
    /**
     * Index of the closed element.
     */
    index: number;
}
type ToastPositionType = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right' | 'center';

declare class ToastModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<ToastModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<ToastModule, never, [typeof i1.OverlayModule, typeof i2.PortalModule, typeof ToastContainerComponent, typeof ToastComponent], [typeof ToastContainerComponent, typeof ToastComponent]>;
    static ɵinj: i0.ɵɵInjectorDeclaration<ToastModule>;
}

declare const provideToast: () => (Provider | EnvironmentProviders)[];

declare function TOAST_DEFAULT_OPTIONS_FACTORY(): ToastConfig;
declare const TOAST_DEFAULT_OPTIONS: InjectionToken<ToastConfig<any>>;
declare class ToastService implements OnDestroy {
    private _overlay;
    private _injector;
    private _parentToast;
    private _defaultConfig;
    private _toastRefAtThisLevel;
    toastComponent: typeof ToastComponent;
    toastContainerComponent: typeof ToastContainerComponent;
    get _openedToastRef(): ToastRef<any> | null;
    set _openedToastRef(value: ToastRef<any> | null);
    open(type: ToastType, title: string, message: string, config?: ToastConfig): ToastRef<ToastComponent>;
    info(message: string, title?: string): ToastRef<ToastComponent>;
    success(message: string, title?: string): ToastRef<ToastComponent>;
    warning(message: string, title?: string): ToastRef<ToastComponent>;
    error(message: string, title?: string): ToastRef<ToastComponent>;
    dismiss(): void;
    ngOnDestroy(): void;
    private _attachToastContainer;
    private _attach;
    private _animateToast;
    /**
     * Creates a new overlay and places it in the correct location.
     * @param config The user-specified toast config.
     */
    private _createOverlay;
    private _createInjector;
    static ɵfac: i0.ɵɵFactoryDeclaration<ToastService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<ToastService>;
}

export { TOAST_DATA, TOAST_DEFAULT_OPTIONS, TOAST_DEFAULT_OPTIONS_FACTORY, ToastComponent, ToastConfig, ToastContainerComponent, ToastModule, ToastRef, ToastService, provideToast, toastAnimations };
export type { ToastAnimationState, ToastCloseEvent, ToastDismiss, ToastHorizontalPosition, ToastItemCloseEvent, ToastPositionType, ToastTemplates, ToastType, ToastVerticalPosition };
