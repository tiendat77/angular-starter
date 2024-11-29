import { trigger, state, style, transition, animate } from '@angular/animations';
import { NgClass } from '@angular/common';
import * as i0 from '@angular/core';
import { InjectionToken, inject, Component, ViewChild, Injector, TemplateRef, Injectable, Optional, SkipSelf, Inject, NgModule, ENVIRONMENT_INITIALIZER } from '@angular/core';
import { Subject } from 'rxjs';
import { BasePortalOutlet, CdkPortalOutlet, ComponentPortal, TemplatePortal, PortalModule } from '@angular/cdk/portal';
import * as i1 from '@angular/cdk/overlay';
import { OverlayConfig, OverlayModule } from '@angular/cdk/overlay';

const toastAnimations = {
    toastState: trigger('state', [
        state('void, hidden', style({
            transform: 'scale(0.8)',
            opacity: 0,
        })),
        state('visible', style({
            transform: 'scale(1)',
            opacity: 1,
        })),
        transition('* => visible', animate('150ms cubic-bezier(0, 0, 0.2, 1)')),
        transition('* => void, * => hidden', animate('75ms cubic-bezier(0.4, 0.0, 1, 1)', style({
            opacity: 0,
        }))),
    ]),
};

const TOAST_DATA = new InjectionToken('ToastData');
class ToastConfig {
    /**
     * The view container that serves as the parent for the toast for the purposes of dependency
     * injection. Note: this does not affect where the toast is inserted in the DOM.
     */
    viewContainerRef;
    /** The length of time in milliseconds to wait before automatically dismissing the toast. */
    duration = 5000;
    /** Text layout direction for the toast. */
    direction;
    /** Data being injected into the child component. */
    data = null;
    /** The horizontal position to place the toast. */
    horizontalPosition = 'center';
    /** The vertical position to place the toast. */
    verticalPosition = 'top';
}

/** Maximum amount of milliseconds that can be passed into setTimeout. */
const MAX_TIMEOUT = Math.pow(2, 31) - 1;
/**
 * Reference to a toast dispatched from the toast service.
 */
class ToastRef {
    _overlayRef;
    /** The instance of the component making up the content of the toast. */
    instance;
    /**
     * The instance of the component making up the content of the toast.
     * @docs-private
     */
    containerInstance;
    /** Subject for notifying the user that the toast has been dismissed. */
    _afterDismissed = new Subject();
    /** Subject for notifying the user that the toast has opened and appeared. */
    _afterOpened = new Subject();
    /** Subject for notifying the user that the toast action was called. */
    _onAction = new Subject();
    /**
     * Timeout ID for the duration setTimeout call. Used to clear the timeout if the toast is
     * dismissed before the duration passes.
     */
    _durationTimeoutId;
    /** Whether the toast was dismissed using the action button. */
    _dismissedByAction = false;
    constructor(containerInstance, _overlayRef) {
        this._overlayRef = _overlayRef;
        this.containerInstance = containerInstance;
        containerInstance._onExit.subscribe(() => this._finishDismiss());
    }
    /** Dismisses the toast. */
    dismiss() {
        if (!this._afterDismissed.closed) {
            this.containerInstance.exit();
        }
        clearTimeout(this._durationTimeoutId);
    }
    /** Marks the toast action clicked. */
    dismissWithAction() {
        if (!this._onAction.closed) {
            this._dismissedByAction = true;
            this._onAction.next();
            this._onAction.complete();
            this.dismiss();
        }
        clearTimeout(this._durationTimeoutId);
    }
    /**
     * Marks the toast action clicked.
     * @deprecated Use `dismissWithAction` instead.
     * @breaking-change 8.0.0
     */
    closeWithAction() {
        this.dismissWithAction();
    }
    /** Dismisses the toast after some duration */
    _dismissAfter(duration) {
        // Note that we need to cap the duration to the maximum value for setTimeout, because
        // it'll revert to 1 if somebody passes in something greater (e.g. `Infinity`). See #17234.
        this._durationTimeoutId = setTimeout(() => this.dismiss(), Math.min(duration, MAX_TIMEOUT));
    }
    /** Marks the toast as opened */
    _open() {
        if (!this._afterOpened.closed) {
            this._afterOpened.next();
            this._afterOpened.complete();
        }
    }
    /** Cleans up the DOM after closing. */
    _finishDismiss() {
        this._overlayRef.dispose();
        if (!this._onAction.closed) {
            this._onAction.complete();
        }
        this._afterDismissed.next({ dismissedByAction: this._dismissedByAction });
        this._afterDismissed.complete();
        this._dismissedByAction = false;
    }
    /** Gets an observable that is notified when the toast is finished closing. */
    afterDismissed() {
        return this._afterDismissed;
    }
    /** Gets an observable that is notified when the toast has opened and appeared. */
    afterOpened() {
        return this.containerInstance._onEnter;
    }
    /** Gets an observable that is notified when the toast action is called. */
    onAction() {
        return this._onAction;
    }
}

class ToastComponent {
    data = inject(TOAST_DATA);
    toastRef = inject((ToastRef));
    action() {
        this.toastRef.dismissWithAction();
    }
    dismiss() {
        this.toastRef.dismiss();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.13", ngImport: i0, type: ToastComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "18.2.13", type: ToastComponent, isStandalone: true, selector: "toast", ngImport: i0, template: "<div\n  role=\"alert\"\n  class=\"alert relative min-w-60 border-0 border-l-4 bg-base-100 px-4 py-3 shadow-lg\"\n  [ngClass]=\"{\n    'border-info': data.type === 'info',\n    'border-success': data.type === 'success',\n    'border-warning': data.type === 'warning',\n    'border-error': data.type === 'error',\n  }\"\n>\n  <div class=\"mr-6 flex items-start gap-4\">\n    <!-- Icon -->\n    @switch (data.type) {\n      @case ('info') {\n        <span class=\"text-info\">\n          <svg\n            xmlns=\"http://www.w3.org/2000/svg\"\n            fill=\"none\"\n            viewBox=\"0 0 24 24\"\n            class=\"h-7 w-7 shrink-0 stroke-current\"\n          >\n            <path\n              stroke-linecap=\"round\"\n              stroke-linejoin=\"round\"\n              stroke-width=\"2\"\n              d=\"M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z\"\n            />\n          </svg>\n        </span>\n      }\n      @case ('success') {\n        <span class=\"text-success\">\n          <svg\n            xmlns=\"http://www.w3.org/2000/svg\"\n            class=\"h-7 w-7 shrink-0 stroke-current\"\n            fill=\"none\"\n            viewBox=\"0 0 24 24\"\n          >\n            <path\n              stroke-linecap=\"round\"\n              stroke-linejoin=\"round\"\n              stroke-width=\"2\"\n              d=\"M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z\"\n            />\n          </svg>\n        </span>\n      }\n      @case ('warning') {\n        <span class=\"text-warning\">\n          <svg\n            xmlns=\"http://www.w3.org/2000/svg\"\n            class=\"h-7 w-7 shrink-0 stroke-current\"\n            fill=\"none\"\n            viewBox=\"0 0 24 24\"\n          >\n            <path\n              stroke-linecap=\"round\"\n              stroke-linejoin=\"round\"\n              stroke-width=\"2\"\n              d=\"M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z\"\n            />\n          </svg>\n        </span>\n      }\n      @case ('error') {\n        <span class=\"text-error\">\n          <svg\n            xmlns=\"http://www.w3.org/2000/svg\"\n            class=\"h-7 w-7 shrink-0 stroke-current\"\n            fill=\"none\"\n            viewBox=\"0 0 24 24\"\n          >\n            <path\n              stroke-linecap=\"round\"\n              stroke-linejoin=\"round\"\n              stroke-width=\"2\"\n              d=\"M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z\"\n            />\n          </svg>\n        </span>\n      }\n    }\n\n    <!-- Message -->\n    <div class=\"flex-1\">\n      <strong\n        class=\"block font-medium\"\n        [innerHTML]=\"data.title\"\n      ></strong>\n      <p\n        class=\"mt-1\"\n        [innerHTML]=\"data.message\"\n      ></p>\n    </div>\n\n    <!-- Dismiss -->\n    <button\n      class=\"btn btn-circle btn-ghost btn-sm absolute right-1 top-1 transition\"\n      (click)=\"dismiss()\"\n    >\n      <svg\n        xmlns=\"http://www.w3.org/2000/svg\"\n        fill=\"none\"\n        viewBox=\"0 0 24 24\"\n        stroke-width=\"1.5\"\n        stroke=\"currentColor\"\n        class=\"text-hint h-5 w-5\"\n      >\n        <path\n          stroke-linecap=\"round\"\n          stroke-linejoin=\"round\"\n          d=\"M6 18L18 6M6 6l12 12\"\n        />\n      </svg>\n    </button>\n  </div>\n</div>\n", dependencies: [{ kind: "directive", type: NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.13", ngImport: i0, type: ToastComponent, decorators: [{
            type: Component,
            args: [{ selector: 'toast', standalone: true, imports: [NgClass], template: "<div\n  role=\"alert\"\n  class=\"alert relative min-w-60 border-0 border-l-4 bg-base-100 px-4 py-3 shadow-lg\"\n  [ngClass]=\"{\n    'border-info': data.type === 'info',\n    'border-success': data.type === 'success',\n    'border-warning': data.type === 'warning',\n    'border-error': data.type === 'error',\n  }\"\n>\n  <div class=\"mr-6 flex items-start gap-4\">\n    <!-- Icon -->\n    @switch (data.type) {\n      @case ('info') {\n        <span class=\"text-info\">\n          <svg\n            xmlns=\"http://www.w3.org/2000/svg\"\n            fill=\"none\"\n            viewBox=\"0 0 24 24\"\n            class=\"h-7 w-7 shrink-0 stroke-current\"\n          >\n            <path\n              stroke-linecap=\"round\"\n              stroke-linejoin=\"round\"\n              stroke-width=\"2\"\n              d=\"M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z\"\n            />\n          </svg>\n        </span>\n      }\n      @case ('success') {\n        <span class=\"text-success\">\n          <svg\n            xmlns=\"http://www.w3.org/2000/svg\"\n            class=\"h-7 w-7 shrink-0 stroke-current\"\n            fill=\"none\"\n            viewBox=\"0 0 24 24\"\n          >\n            <path\n              stroke-linecap=\"round\"\n              stroke-linejoin=\"round\"\n              stroke-width=\"2\"\n              d=\"M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z\"\n            />\n          </svg>\n        </span>\n      }\n      @case ('warning') {\n        <span class=\"text-warning\">\n          <svg\n            xmlns=\"http://www.w3.org/2000/svg\"\n            class=\"h-7 w-7 shrink-0 stroke-current\"\n            fill=\"none\"\n            viewBox=\"0 0 24 24\"\n          >\n            <path\n              stroke-linecap=\"round\"\n              stroke-linejoin=\"round\"\n              stroke-width=\"2\"\n              d=\"M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z\"\n            />\n          </svg>\n        </span>\n      }\n      @case ('error') {\n        <span class=\"text-error\">\n          <svg\n            xmlns=\"http://www.w3.org/2000/svg\"\n            class=\"h-7 w-7 shrink-0 stroke-current\"\n            fill=\"none\"\n            viewBox=\"0 0 24 24\"\n          >\n            <path\n              stroke-linecap=\"round\"\n              stroke-linejoin=\"round\"\n              stroke-width=\"2\"\n              d=\"M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z\"\n            />\n          </svg>\n        </span>\n      }\n    }\n\n    <!-- Message -->\n    <div class=\"flex-1\">\n      <strong\n        class=\"block font-medium\"\n        [innerHTML]=\"data.title\"\n      ></strong>\n      <p\n        class=\"mt-1\"\n        [innerHTML]=\"data.message\"\n      ></p>\n    </div>\n\n    <!-- Dismiss -->\n    <button\n      class=\"btn btn-circle btn-ghost btn-sm absolute right-1 top-1 transition\"\n      (click)=\"dismiss()\"\n    >\n      <svg\n        xmlns=\"http://www.w3.org/2000/svg\"\n        fill=\"none\"\n        viewBox=\"0 0 24 24\"\n        stroke-width=\"1.5\"\n        stroke=\"currentColor\"\n        class=\"text-hint h-5 w-5\"\n      >\n        <path\n          stroke-linecap=\"round\"\n          stroke-linejoin=\"round\"\n          d=\"M6 18L18 6M6 6l12 12\"\n        />\n      </svg>\n    </button>\n  </div>\n</div>\n" }]
        }] });

class ToastContainerComponent extends BasePortalOutlet {
    _ngZone;
    _changeDetectorRef;
    /** Whether the component has been destroyed. */
    _destroyed = false;
    /** The portal outlet inside of this container into which the toast content will be loaded. */
    _portalOutlet;
    /** Subject for notifying that the toast has exited from view. */
    _onExit = new Subject();
    /** Subject for notifying that the toast has finished entering the view. */
    _onEnter = new Subject();
    /** The state of the toast animations. */
    _animationState = 'void';
    constructor(_ngZone, _changeDetectorRef) {
        super();
        this._ngZone = _ngZone;
        this._changeDetectorRef = _changeDetectorRef;
    }
    attachComponentPortal(portal) {
        const result = this._portalOutlet.attachComponentPortal(portal);
        return result;
    }
    attachTemplatePortal(portal) {
        const result = this._portalOutlet.attachTemplatePortal(portal);
        return result;
    }
    attachDomPortal = (portal) => {
        const result = this._portalOutlet.attachDomPortal(portal);
        return result;
    };
    onAnimationEnd(event) {
        const { fromState, toState } = event;
        if ((toState === 'void' && fromState !== 'void') || toState === 'hidden') {
            this._completeExit();
        }
        if (toState === 'visible') {
            const onEnter = this._onEnter;
            this._ngZone.run(() => {
                onEnter.next();
                onEnter.complete();
            });
        }
    }
    enter() {
        if (!this._destroyed) {
            this._animationState = 'visible';
            this._changeDetectorRef.markForCheck();
            this._changeDetectorRef.detectChanges();
        }
    }
    exit() {
        this._ngZone.run(() => {
            this._animationState = 'hidden';
            this._changeDetectorRef.markForCheck();
        });
        return this._onExit;
    }
    ngOnDestroy() {
        this._destroyed = true;
        this._completeExit();
    }
    _completeExit() {
        queueMicrotask(() => {
            this._onExit.next();
            this._onExit.complete();
        });
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.13", ngImport: i0, type: ToastContainerComponent, deps: [{ token: i0.NgZone }, { token: i0.ChangeDetectorRef }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "18.2.13", type: ToastContainerComponent, isStandalone: true, selector: "toast-container", host: { listeners: { "@state.done": "onAnimationEnd($event)" }, properties: { "@state": "_animationState" }, classAttribute: "m-4 flex flex-col" }, viewQueries: [{ propertyName: "_portalOutlet", first: true, predicate: CdkPortalOutlet, descendants: true, static: true }], usesInheritance: true, ngImport: i0, template: '<ng-template cdkPortalOutlet />', isInline: true, dependencies: [{ kind: "directive", type: CdkPortalOutlet, selector: "[cdkPortalOutlet]", inputs: ["cdkPortalOutlet"], outputs: ["attached"], exportAs: ["cdkPortalOutlet"] }], animations: [toastAnimations.toastState] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.13", ngImport: i0, type: ToastContainerComponent, decorators: [{
            type: Component,
            args: [{
                    standalone: true,
                    selector: 'toast-container',
                    template: '<ng-template cdkPortalOutlet />',
                    animations: [toastAnimations.toastState],
                    imports: [CdkPortalOutlet],
                    host: {
                        class: 'm-4 flex flex-col',
                        '[@state]': '_animationState',
                        '(@state.done)': 'onAnimationEnd($event)',
                    },
                }]
        }], ctorParameters: () => [{ type: i0.NgZone }, { type: i0.ChangeDetectorRef }], propDecorators: { _portalOutlet: [{
                type: ViewChild,
                args: [CdkPortalOutlet, { static: true }]
            }] } });

function TOAST_DEFAULT_OPTIONS_FACTORY() {
    return new ToastConfig();
}
const TOAST_DEFAULT_OPTIONS = new InjectionToken('toast-default-options', {
    providedIn: 'root',
    factory: TOAST_DEFAULT_OPTIONS_FACTORY,
});
class ToastService {
    _overlay;
    _injector;
    _parentToast;
    _defaultConfig;
    _toastRefAtThisLevel = null;
    toastComponent = ToastComponent;
    toastContainerComponent = ToastContainerComponent;
    get _openedToastRef() {
        const parent = this._parentToast;
        return parent ? parent._openedToastRef : this._toastRefAtThisLevel;
    }
    set _openedToastRef(value) {
        if (this._parentToast) {
            this._parentToast._openedToastRef = value;
        }
        else {
            this._toastRefAtThisLevel = value;
        }
    }
    constructor(_overlay, _injector, _parentToast, _defaultConfig) {
        this._overlay = _overlay;
        this._injector = _injector;
        this._parentToast = _parentToast;
        this._defaultConfig = _defaultConfig;
    }
    open(type, title, message, config) {
        const _config = {
            ...this._defaultConfig,
            ...config,
            data: { title, message, type },
        };
        return this._attach(this.toastComponent, _config);
    }
    info(message, title = '') {
        return this.open('info', title, message);
    }
    success(message, title = '') {
        return this.open('success', title, message);
    }
    warning(message, title = '') {
        return this.open('warning', title, message);
    }
    error(message, title = '') {
        return this.open('error', title, message);
    }
    dismiss() {
        if (this._openedToastRef) {
            this._openedToastRef.dismiss();
        }
    }
    ngOnDestroy() {
        if (this._toastRefAtThisLevel) {
            this._toastRefAtThisLevel.dismiss();
        }
    }
    _attachToastContainer(overlayRef, config) {
        const userInjector = config && config.viewContainerRef && config.viewContainerRef.injector;
        const injector = Injector.create({
            parent: userInjector || this._injector,
            providers: [{ provide: ToastConfig, useValue: config }],
        });
        const containerPortal = new ComponentPortal(this.toastContainerComponent, config.viewContainerRef, injector);
        const containerRef = overlayRef.attach(containerPortal);
        return containerRef.instance;
    }
    _attach(content, userConfig) {
        const config = { ...new ToastConfig(), ...this._defaultConfig, ...userConfig };
        const overlayRef = this._createOverlay(config);
        const container = this._attachToastContainer(overlayRef, config);
        const toastRef = new ToastRef(container, overlayRef);
        if (content instanceof TemplateRef) {
            const portal = new TemplatePortal(content, null, {
                $implicit: config.data,
                toastRef,
            });
            toastRef.instance = container.attachTemplatePortal(portal);
        }
        else {
            const injector = this._createInjector(config, toastRef);
            const portal = new ComponentPortal(content, undefined, injector);
            const contentRef = container.attachComponentPortal(portal);
            // We can't pass this via the injector, because the injector is created earlier.
            toastRef.instance = contentRef.instance;
        }
        this._animateToast(toastRef, config);
        this._openedToastRef = toastRef;
        return this._openedToastRef;
    }
    _animateToast(toastRef, config) {
        // When the toast is dismissed, clear the reference to it.
        toastRef.afterDismissed().subscribe(() => {
            // Clear the toast ref if it hasn't already been replaced by a newer toast.
            if (this._openedToastRef == toastRef) {
                this._openedToastRef = null;
            }
        });
        if (this._openedToastRef) {
            // If a toast is already in view, dismiss it and enter the
            // new toast after exit animation is complete.
            this._openedToastRef.afterDismissed().subscribe(() => {
                toastRef.containerInstance.enter();
            });
            this._openedToastRef.dismiss();
        }
        else {
            // If no toast is in view, enter the new toast.
            toastRef.containerInstance.enter();
        }
        // If a dismiss timeout is provided, set up dismiss based on after the toast is opened.
        if (config.duration && config.duration > 0) {
            toastRef.afterOpened().subscribe(() => toastRef._dismissAfter(config.duration));
        }
    }
    /**
     * Creates a new overlay and places it in the correct location.
     * @param config The user-specified toast config.
     */
    _createOverlay(config) {
        const overlayConfig = new OverlayConfig();
        overlayConfig.direction = config.direction;
        const positionStrategy = this._overlay.position().global();
        // Set horizontal position.
        const isRtl = config.direction === 'rtl';
        const isLeft = config.horizontalPosition === 'left' ||
            (config.horizontalPosition === 'start' && !isRtl) ||
            (config.horizontalPosition === 'end' && isRtl);
        const isRight = !isLeft && config.horizontalPosition !== 'center';
        if (isLeft) {
            positionStrategy.left('0');
        }
        else if (isRight) {
            positionStrategy.right('0');
        }
        else {
            positionStrategy.centerHorizontally();
        }
        // Set horizontal position.
        if (config.verticalPosition === 'top') {
            positionStrategy.top('0');
        }
        else {
            positionStrategy.bottom('0');
        }
        overlayConfig.positionStrategy = positionStrategy;
        return this._overlay.create(overlayConfig);
    }
    _createInjector(config, toastRef) {
        const userInjector = config && config.viewContainerRef && config.viewContainerRef.injector;
        return Injector.create({
            parent: userInjector || this._injector,
            providers: [
                { provide: ToastRef, useValue: toastRef },
                { provide: TOAST_DATA, useValue: config.data },
            ],
        });
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.13", ngImport: i0, type: ToastService, deps: [{ token: i1.Overlay }, { token: i0.Injector }, { token: ToastService, optional: true, skipSelf: true }, { token: TOAST_DEFAULT_OPTIONS }], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.2.13", ngImport: i0, type: ToastService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.13", ngImport: i0, type: ToastService, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: () => [{ type: i1.Overlay }, { type: i0.Injector }, { type: ToastService, decorators: [{
                    type: Optional
                }, {
                    type: SkipSelf
                }] }, { type: ToastConfig, decorators: [{
                    type: Inject,
                    args: [TOAST_DEFAULT_OPTIONS]
                }] }] });

class ToastModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.13", ngImport: i0, type: ToastModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "18.2.13", ngImport: i0, type: ToastModule, imports: [OverlayModule, PortalModule, ToastContainerComponent, ToastComponent], exports: [ToastContainerComponent, ToastComponent] });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "18.2.13", ngImport: i0, type: ToastModule, providers: [ToastService], imports: [OverlayModule, PortalModule] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.13", ngImport: i0, type: ToastModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [OverlayModule, PortalModule, ToastContainerComponent, ToastComponent],
                    exports: [ToastContainerComponent, ToastComponent],
                    providers: [ToastService],
                }]
        }] });

const provideToast = () => {
    return [
        {
            provide: ENVIRONMENT_INITIALIZER,
            useValue: () => inject(ToastService),
            multi: true,
        },
    ];
};

/*
 * Public API Surface of toast
 */

/**
 * Generated bundle index. Do not edit.
 */

export { TOAST_DATA, TOAST_DEFAULT_OPTIONS, TOAST_DEFAULT_OPTIONS_FACTORY, ToastComponent, ToastConfig, ToastContainerComponent, ToastModule, ToastRef, ToastService, provideToast, toastAnimations };
//# sourceMappingURL=libs-toast.mjs.map
