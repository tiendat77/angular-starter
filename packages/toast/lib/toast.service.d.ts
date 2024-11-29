import { Overlay } from '@angular/cdk/overlay';
import { InjectionToken, Injector, OnDestroy } from '@angular/core';
import { ToastComponent } from './toast.component';
import { ToastConfig, ToastType } from './toast.config';
import { ToastContainerComponent } from './toast.container';
import { ToastRef } from './toast.ref';
import * as i0 from "@angular/core";
export declare function TOAST_DEFAULT_OPTIONS_FACTORY(): ToastConfig;
export declare const TOAST_DEFAULT_OPTIONS: InjectionToken<ToastConfig<any>>;
export declare class ToastService implements OnDestroy {
    private _overlay;
    private _injector;
    private _parentToast;
    private _defaultConfig;
    private _toastRefAtThisLevel;
    toastComponent: typeof ToastComponent;
    toastContainerComponent: typeof ToastContainerComponent;
    get _openedToastRef(): ToastRef<any> | null;
    set _openedToastRef(value: ToastRef<any> | null);
    constructor(_overlay: Overlay, _injector: Injector, _parentToast: ToastService, _defaultConfig: ToastConfig);
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
    static ɵfac: i0.ɵɵFactoryDeclaration<ToastService, [null, null, { optional: true; skipSelf: true; }, null]>;
    static ɵprov: i0.ɵɵInjectableDeclaration<ToastService>;
}
