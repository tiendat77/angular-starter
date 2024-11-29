import { OverlayConfig } from '@angular/cdk/overlay';
import { ComponentPortal, TemplatePortal } from '@angular/cdk/portal';
import { Inject, Injectable, InjectionToken, Injector, Optional, SkipSelf, TemplateRef, } from '@angular/core';
import { ToastComponent } from './toast.component';
import { TOAST_DATA, ToastConfig } from './toast.config';
import { ToastContainerComponent } from './toast.container';
import { ToastRef } from './toast.ref';
import * as i0 from "@angular/core";
import * as i1 from "@angular/cdk/overlay";
import * as i2 from "./toast.config";
export function TOAST_DEFAULT_OPTIONS_FACTORY() {
    return new ToastConfig();
}
export const TOAST_DEFAULT_OPTIONS = new InjectionToken('toast-default-options', {
    providedIn: 'root',
    factory: TOAST_DEFAULT_OPTIONS_FACTORY,
});
export class ToastService {
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
                }] }, { type: i2.ToastConfig, decorators: [{
                    type: Inject,
                    args: [TOAST_DEFAULT_OPTIONS]
                }] }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9hc3Quc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL2xpYnMvdG9hc3Qvc3JjL2xpYi90b2FzdC5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBMEIsYUFBYSxFQUFjLE1BQU0sc0JBQXNCLENBQUM7QUFDekYsT0FBTyxFQUFFLGVBQWUsRUFBRSxjQUFjLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUV0RSxPQUFPLEVBR0wsTUFBTSxFQUNOLFVBQVUsRUFDVixjQUFjLEVBQ2QsUUFBUSxFQUVSLFFBQVEsRUFDUixRQUFRLEVBQ1IsV0FBVyxHQUNaLE1BQU0sZUFBZSxDQUFDO0FBRXZCLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUNuRCxPQUFPLEVBQUUsVUFBVSxFQUFFLFdBQVcsRUFBYSxNQUFNLGdCQUFnQixDQUFDO0FBQ3BFLE9BQU8sRUFBRSx1QkFBdUIsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBQzVELE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxhQUFhLENBQUM7Ozs7QUFFdkMsTUFBTSxVQUFVLDZCQUE2QjtJQUMzQyxPQUFPLElBQUksV0FBVyxFQUFFLENBQUM7QUFDM0IsQ0FBQztBQUVELE1BQU0sQ0FBQyxNQUFNLHFCQUFxQixHQUFHLElBQUksY0FBYyxDQUFjLHVCQUF1QixFQUFFO0lBQzVGLFVBQVUsRUFBRSxNQUFNO0lBQ2xCLE9BQU8sRUFBRSw2QkFBNkI7Q0FDdkMsQ0FBQyxDQUFDO0FBR0gsTUFBTSxPQUFPLFlBQVk7SUFvQmI7SUFDQTtJQUN3QjtJQUNPO0lBdEJqQyxvQkFBb0IsR0FBeUIsSUFBSSxDQUFDO0lBRTFELGNBQWMsR0FBRyxjQUFjLENBQUM7SUFDaEMsdUJBQXVCLEdBQUcsdUJBQXVCLENBQUM7SUFFbEQsSUFBSSxlQUFlO1FBQ2pCLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUM7UUFDakMsT0FB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QUMsYUFBYSxDQUFDLENBQUM7SUFDN0MsQ0FBQztJQUVPLGVBQWUsQ0FBSSxNQUFtQixFQUFFLFFBQXFCO1FBQ25FLE1BQU0sWUFBWSxHQUFHLE1BQU0sSUFBSSxNQUFNLENBQUMsZ0JBQWdCLElBQUksTUFBTSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsQ0FBQztRQUUzRixPQUFPLFFBQVEsQ0FBQyxNQUFNLENBQUM7WUFDckIsTUFBTSxFQUFFLFlBQVksSUFBSSxJQUFJLENBQUMsU0FBUztZQUN0QyxTQUFTLEVBQUU7Z0JBQ1QsRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUU7Z0JBQ3pDLEVBQUUsT0FBTyxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsTUFBTSxDQUFDLElBQUksRUFBRTthQUMvQztTQUNGLENBQUMsQ0FBQztJQUNMLENBQUM7d0dBN0xVLFlBQVksMEhBdUJiLHFCQUFxQjs0R0F2QnBCLFlBQVksY0FEQyxNQUFNOzs0RkFDbkIsWUFBWTtrQkFEeEIsVUFBVTttQkFBQyxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUU7OzBCQXVCN0IsUUFBUTs7MEJBQUksUUFBUTs7MEJBQ3BCLE1BQU07MkJBQUMscUJBQXFCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50VHlwZSwgT3ZlcmxheSwgT3ZlcmxheUNvbmZpZywgT3ZlcmxheVJlZiB9IGZyb20gJ0Bhbmd1bGFyL2Nkay9vdmVybGF5JztcbmltcG9ydCB7IENvbXBvbmVudFBvcnRhbCwgVGVtcGxhdGVQb3J0YWwgfSBmcm9tICdAYW5ndWxhci9jZGsvcG9ydGFsJztcblxuaW1wb3J0IHtcbiAgQ29tcG9uZW50UmVmLFxuICBFbWJlZGRlZFZpZXdSZWYsXG4gIEluamVjdCxcbiAgSW5qZWN0YWJsZSxcbiAgSW5qZWN0aW9uVG9rZW4sXG4gIEluamVjdG9yLFxuICBPbkRlc3Ryb3ksXG4gIE9wdGlvbmFsLFxuICBTa2lwU2VsZixcbiAgVGVtcGxhdGVSZWYsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyBUb2FzdENvbXBvbmVudCB9IGZyb20gJy4vdG9hc3QuY29tcG9uZW50JztcbmltcG9ydCB7IFRPQVNUX0RBVEEsIFRvYXN0Q29uZmlnLCBUb2FzdFR5cGUgfSBmcm9tICcuL3RvYXN0LmNvbmZpZyc7XG5pbXBvcnQgeyBUb2FzdENvbnRhaW5lckNvbXBvbmVudCB9IGZyb20gJy4vdG9hc3QuY29udGFpbmVyJztcbmltcG9ydCB7IFRvYXN0UmVmIH0gZnJvbSAnLi90b2FzdC5yZWYnO1xuXG5leHBvcnQgZnVuY3Rpb24gVE9BU1RfREVGQVVMVF9PUFRJT05TX0ZBQ1RPUlkoKTogVG9hc3RDb25maWcge1xuICByZXR1cm4gbmV3IFRvYXN0Q29uZmlnKCk7XG59XG5cbmV4cG9ydCBjb25zdCBUT0FTVF9ERUZBVUxUX09QVElPTlMgPSBuZXcgSW5qZWN0aW9uVG9rZW48VG9hc3RDb25maWc+KCd0b2FzdC1kZWZhdWx0LW9wdGlvbnMnLCB7XG4gIHByb3ZpZGVkSW46ICdyb290JyxcbiAgZmFjdG9yeTogVE9BU1RfREVGQVVMVF9PUFRJT05TX0ZBQ1RPUlksXG59KTtcblxuQEluamVjdGFibGUoeyBwcm92aWRlZEluOiAncm9vdCcgfSlcbmV4cG9ydCBjbGFzcyBUb2FzdFNlcnZpY2UgaW1wbGVtZW50cyBPbkRlc3Ryb3kge1xuICBwcml2YXRlIF90b2FzdFJlZkF0VGhpc0xldmVsOiBUb2FzdFJlZjxhbnk+IHwgbnVsbCA9IG51bGw7XG5cbiAgdG9hc3RDb21wb25lbnQgPSBUb2FzdENvbXBvbmVudDtcbiAgdG9hc3RDb250YWluZXJDb21wb25lbnQgPSBUb2FzdENvbnRhaW5lckNvbXBvbmVudDtcblxuICBnZXQgX29wZW5lZFRvYXN0UmVmKCk6IFRvYXN0UmVmPGFueT4gfCBudWxsIHtcbiAgICBjb25zdCBwYXJlbnQgPSB0aGlzLl9wYXJlbnRUb2FzdDtcbiAgICByZXR1cm4gcGFyZW50ID8gcGFyZW50Ll9vcGVuZWRUb2FzdFJlZiA6IHRoaXMuX3RvYXN0UmVmQXRUaGlzTGV2ZWw7XG4gIH1cblxuICBzZXQgX29wZW5lZFRvYXN0UmVmKHZhbHVlOiBUb2FzdFJlZjxhbnk+IHwgbnVsbCkge1xuICAgIGlmICh0aGlzLl9wYXJlbnRUb2FzdCkge1xuICAgICAgdGhpcy5fcGFyZW50VG9hc3QuX29wZW5lZFRvYXN0UmVmID0gdmFsdWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX3RvYXN0UmVmQXRUaGlzTGV2ZWwgPSB2YWx1ZTtcbiAgICB9XG4gIH1cblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIF9vdmVybGF5OiBPdmVybGF5LFxuICAgIHByaXZhdGUgX2luamVjdG9yOiBJbmplY3RvcixcbiAgICBAT3B0aW9uYWwoKSBAU2tpcFNlbGYoKSBwcml2YXRlIF9wYXJlbnRUb2FzdDogVG9hc3RTZXJ2aWNlLFxuICAgIEBJbmplY3QoVE9BU1RfREVGQVVMVF9PUFRJT05TKSBwcml2YXRlIF9kZWZhdWx0Q29uZmlnOiBUb2FzdENvbmZpZ1xuICApIHt9XG5cbiAgb3BlbihcbiAgICB0eXBlOiBUb2FzdFR5cGUsXG4gICAgdGl0bGU6IHN0cmluZyxcbiAgICBtZXNzYWdlOiBzdHJpbmcsXG4gICAgY29uZmlnPzogVG9hc3RDb25maWdcbiAgKTogVG9hc3RSZWY8VG9hc3RDb21wb25lbnQ+IHtcbiAgICBjb25zdCBfY29uZmlnID0ge1xuICAgICAgLi4udGhpcy5fZGVmYXVsdENvbmZpZyxcbiAgICAgIC4uLmNvbmZpZyxcbiAgICAgIGRhdGE6IHsgdGl0bGUsIG1lc3NhZ2UsIHR5cGUgfSxcbiAgICB9O1xuXG4gICAgcmV0dXJuIHRoaXMuX2F0dGFjaCh0aGlzLnRvYXN0Q29tcG9uZW50LCBfY29uZmlnKSBhcyBUb2FzdFJlZjxUb2FzdENvbXBvbmVudD47XG4gIH1cblxuICBpbmZvKG1lc3NhZ2U6IHN0cmluZywgdGl0bGUgPSAnJyk6IFRvYXN0UmVmPFRvYXN0Q29tcG9uZW50PiB7XG4gICAgcmV0dXJuIHRoaXMub3BlbignaW5mbycsIHRpdGxlLCBtZXNzYWdlKTtcbiAgfVxuXG4gIHN1Y2Nlc3MobWVzc2FnZTogc3RyaW5nLCB0aXRsZSA9ICcnKTogVG9hc3RSZWY8VG9hc3RDb21wb25lbnQ+IHtcbiAgICByZXR1cm4gdGhpcy5vcGVuKCdzdWNjZXNzJywgdGl0bGUsIG1lc3NhZ2UpO1xuICB9XG5cbiAgd2FybmluZyhtZXNzYWdlOiBzdHJpbmcsIHRpdGxlID0gJycpOiBUb2FzdFJlZjxUb2FzdENvbXBvbmVudD4ge1xuICAgIHJldHVybiB0aGlzLm9wZW4oJ3dhcm5pbmcnLCB0aXRsZSwgbWVzc2FnZSk7XG4gIH1cblxuICBlcnJvcihtZXNzYWdlOiBzdHJpbmcsIHRpdGxlID0gJycpOiBUb2FzdFJlZjxUb2FzdENvbXBvbmVudD4ge1xuICAgIHJldHVybiB0aGlzLm9wZW4oJ2Vycm9yJywgdGl0bGUsIG1lc3NhZ2UpO1xuICB9XG5cbiAgZGlzbWlzcygpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fb3BlbmVkVG9hc3RSZWYpIHtcbiAgICAgIHRoaXMuX29wZW5lZFRvYXN0UmVmLmRpc21pc3MoKTtcbiAgICB9XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICBpZiAodGhpcy5fdG9hc3RSZWZBdFRoaXNMZXZlbCkge1xuICAgICAgdGhpcy5fdG9hc3RSZWZBdFRoaXNMZXZlbC5kaXNtaXNzKCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfYXR0YWNoVG9hc3RDb250YWluZXIoXG4gICAgb3ZlcmxheVJlZjogT3ZlcmxheVJlZixcbiAgICBjb25maWc6IFRvYXN0Q29uZmlnXG4gICk6IFRvYXN0Q29udGFpbmVyQ29tcG9uZW50IHtcbiAgICBjb25zdCB1c2VySW5qZWN0b3IgPSBjb25maWcgJiYgY29uZmlnLnZpZXdDb250YWluZXJSZWYgJiYgY29uZmlnLnZpZXdDb250YWluZXJSZWYuaW5qZWN0b3I7XG4gICAgY29uc3QgaW5qZWN0b3IgPSBJbmplY3Rvci5jcmVhdGUoe1xuICAgICAgcGFyZW50OiB1c2VySW5qZWN0b3IgfHwgdGhpcy5faW5qZWN0b3IsXG4gICAgICBwcm92aWRlcnM6IFt7IHByb3ZpZGU6IFRvYXN0Q29uZmlnLCB1c2VWYWx1ZTogY29uZmlnIH1dLFxuICAgIH0pO1xuXG4gICAgY29uc3QgY29udGFpbmVyUG9ydGFsID0gbmV3IENvbXBvbmVudFBvcnRhbChcbiAgICAgIHRoaXMudG9hc3RDb250YWluZXJDb21wb25lbnQsXG4gICAgICBjb25maWcudmlld0NvbnRhaW5lclJlZixcbiAgICAgIGluamVjdG9yXG4gICAgKTtcbiAgICBjb25zdCBjb250YWluZXJSZWY6IENvbXBvbmVudFJlZjxUb2FzdENvbnRhaW5lckNvbXBvbmVudD4gPSBvdmVybGF5UmVmLmF0dGFjaChjb250YWluZXJQb3J0YWwpO1xuICAgIHJldHVybiBjb250YWluZXJSZWYuaW5zdGFuY2U7XG4gIH1cblxuICBwcml2YXRlIF9hdHRhY2g8VD4oXG4gICAgY29udGVudDogQ29tcG9uZW50VHlwZTxUPiB8IFRlbXBsYXRlUmVmPFQ+LFxuICAgIHVzZXJDb25maWc/OiBUb2FzdENvbmZpZ1xuICApOiBUb2FzdFJlZjxUIHwgRW1iZWRkZWRWaWV3UmVmPGFueT4+IHtcbiAgICBjb25zdCBjb25maWcgPSB7IC4uLm5ldyBUb2FzdENvbmZpZygpLCAuLi50aGlzLl9kZWZhdWx0Q29uZmlnLCAuLi51c2VyQ29uZmlnIH07XG4gICAgY29uc3Qgb3ZlcmxheVJlZiA9IHRoaXMuX2NyZWF0ZU92ZXJsYXkoY29uZmlnKTtcbiAgICBjb25zdCBjb250YWluZXIgPSB0aGlzLl9hdHRhY2hUb2FzdENvbnRhaW5lcihvdmVybGF5UmVmLCBjb25maWcpO1xuICAgIGNvbnN0IHRvYXN0UmVmID0gbmV3IFRvYXN0UmVmPFQgfCBFbWJlZGRlZFZpZXdSZWY8YW55Pj4oY29udGFpbmVyLCBvdmVybGF5UmVmKTtcblxuICAgIGlmIChjb250ZW50IGluc3RhbmNlb2YgVGVtcGxhdGVSZWYpIHtcbiAgICAgIGNvbnN0IHBvcnRhbCA9IG5ldyBUZW1wbGF0ZVBvcnRhbChjb250ZW50LCBudWxsISwge1xuICAgICAgICAkaW1wbGljaXQ6IGNvbmZpZy5kYXRhLFxuICAgICAgICB0b2FzdFJlZixcbiAgICAgIH0gYXMgYW55KTtcblxuICAgICAgdG9hc3RSZWYuaW5zdGFuY2UgPSBjb250YWluZXIuYXR0YWNoVGVtcGxhdGVQb3J0YWwocG9ydGFsKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgaW5qZWN0b3IgPSB0aGlzLl9jcmVhdGVJbmplY3Rvcihjb25maWcsIHRvYXN0UmVmKTtcbiAgICAgIGNvbnN0IHBvcnRhbCA9IG5ldyBDb21wb25lbnRQb3J0YWwoY29udGVudCwgdW5kZWZpbmVkLCBpbmplY3Rvcik7XG4gICAgICBjb25zdCBjb250ZW50UmVmID0gY29udGFpbmVyLmF0dGFjaENvbXBvbmVudFBvcnRhbDxUPihwb3J0YWwpO1xuXG4gICAgICAvLyBXZSBjYW4ndCBwYXNzIHRoaXMgdmlhIHRoZSBpbmplY3RvciwgYmVjYXVzZSB0aGUgaW5qZWN0b3IgaXMgY3JlYXRlZCBlYXJsaWVyLlxuICAgICAgdG9hc3RSZWYuaW5zdGFuY2UgPSBjb250ZW50UmVmLmluc3RhbmNlO1xuICAgIH1cblxuICAgIHRoaXMuX2FuaW1hdGVUb2FzdCh0b2FzdFJlZiwgY29uZmlnKTtcbiAgICB0aGlzLl9vcGVuZWRUb2FzdFJlZiA9IHRvYXN0UmVmO1xuICAgIHJldHVybiB0aGlzLl9vcGVuZWRUb2FzdFJlZjtcbiAgfVxuXG4gIHByaXZhdGUgX2FuaW1hdGVUb2FzdCh0b2FzdFJlZjogVG9hc3RSZWY8YW55PiwgY29uZmlnOiBUb2FzdENvbmZpZykge1xuICAgIC8vIFdoZW4gdGhlIHRvYXN0IGlzIGRpc21pc3NlZCwgY2xlYXIgdGhlIHJlZmVyZW5jZSB0byBpdC5cbiAgICB0b2FzdFJlZi5hZnRlckRpc21pc3NlZCgpLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICAvLyBDbGVhciB0aGUgdG9hc3QgcmVmIGlmIGl0IGhhc24ndCBhbHJlYWR5IGJlZW4gcmVwbGFjZWQgYnkgYSBuZXdlciB0b2FzdC5cbiAgICAgIGlmICh0aGlzLl9vcGVuZWRUb2FzdFJlZiA9PSB0b2FzdFJlZikge1xuICAgICAgICB0aGlzLl9vcGVuZWRUb2FzdFJlZiA9IG51bGw7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBpZiAodGhpcy5fb3BlbmVkVG9hc3RSZWYpIHtcbiAgICAgIC8vIElmIGEgdG9hc3QgaXMgYWxyZWFkeSBpbiB2aWV3LCBkaXNtaXNzIGl0IGFuZCBlbnRlciB0aGVcbiAgICAgIC8vIG5ldyB0b2FzdCBhZnRlciBleGl0IGFuaW1hdGlvbiBpcyBjb21wbGV0ZS5cbiAgICAgIHRoaXMuX29wZW5lZFRvYXN0UmVmLmFmdGVyRGlzbWlzc2VkKCkuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgICAgdG9hc3RSZWYuY29udGFpbmVySW5zdGFuY2UuZW50ZXIoKTtcbiAgICAgIH0pO1xuICAgICAgdGhpcy5fb3BlbmVkVG9hc3RSZWYuZGlzbWlzcygpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBJZiBubyB0b2FzdCBpcyBpbiB2aWV3LCBlbnRlciB0aGUgbmV3IHRvYXN0LlxuICAgICAgdG9hc3RSZWYuY29udGFpbmVySW5zdGFuY2UuZW50ZXIoKTtcbiAgICB9XG5cbiAgICAvLyBJZiBhIGRpc21pc3MgdGltZW91dCBpcyBwcm92aWRlZCwgc2V0IHVwIGRpc21pc3MgYmFzZWQgb24gYWZ0ZXIgdGhlIHRvYXN0IGlzIG9wZW5lZC5cbiAgICBpZiAoY29uZmlnLmR1cmF0aW9uICYmIGNvbmZpZy5kdXJhdGlvbiA+IDApIHtcbiAgICAgIHRvYXN0UmVmLmFmdGVyT3BlbmVkKCkuc3Vic2NyaWJlKCgpID0+IHRvYXN0UmVmLl9kaXNtaXNzQWZ0ZXIoY29uZmlnLmR1cmF0aW9uISkpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IG92ZXJsYXkgYW5kIHBsYWNlcyBpdCBpbiB0aGUgY29ycmVjdCBsb2NhdGlvbi5cbiAgICogQHBhcmFtIGNvbmZpZyBUaGUgdXNlci1zcGVjaWZpZWQgdG9hc3QgY29uZmlnLlxuICAgKi9cbiAgcHJpdmF0ZSBfY3JlYXRlT3ZlcmxheShjb25maWc6IFRvYXN0Q29uZmlnKTogT3ZlcmxheVJlZiB7XG4gICAgY29uc3Qgb3ZlcmxheUNvbmZpZyA9IG5ldyBPdmVybGF5Q29uZmlnKCk7XG4gICAgb3ZlcmxheUNvbmZpZy5kaXJlY3Rpb24gPSBjb25maWcuZGlyZWN0aW9uO1xuXG4gICAgY29uc3QgcG9zaXRpb25TdHJhdGVneSA9IHRoaXMuX292ZXJsYXkucG9zaXRpb24oKS5nbG9iYWwoKTtcbiAgICAvLyBTZXQgaG9yaXpvbnRhbCBwb3NpdGlvbi5cbiAgICBjb25zdCBpc1J0bCA9IGNvbmZpZy5kaXJlY3Rpb24gPT09ICdydGwnO1xuICAgIGNvbnN0IGlzTGVmdCA9XG4gICAgICBjb25maWcuaG9yaXpvbnRhbFBvc2l0aW9uID09PSAnbGVmdCcgfHxcbiAgICAgIChjb25maWcuaG9yaXpvbnRhbFBvc2l0aW9uID09PSAnc3RhcnQnICYmICFpc1J0bCkgfHxcbiAgICAgIChjb25maWcuaG9yaXpvbnRhbFBvc2l0aW9uID09PSAnZW5kJyAmJiBpc1J0bCk7XG4gICAgY29uc3QgaXNSaWdodCA9ICFpc0xlZnQgJiYgY29uZmlnLmhvcml6b250YWxQb3NpdGlvbiAhPT0gJ2NlbnRlcic7XG4gICAgaWYgKGlzTGVmdCkge1xuICAgICAgcG9zaXRpb25TdHJhdGVneS5sZWZ0KCcwJyk7XG4gICAgfSBlbHNlIGlmIChpc1JpZ2h0KSB7XG4gICAgICBwb3NpdGlvblN0cmF0ZWd5LnJpZ2h0KCcwJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHBvc2l0aW9uU3RyYXRlZ3kuY2VudGVySG9yaXpvbnRhbGx5KCk7XG4gICAgfVxuICAgIC8vIFNldCBob3Jpem9udGFsIHBvc2l0aW9uLlxuICAgIGlmIChjb25maWcudmVydGljYWxQb3NpdGlvbiA9PT0gJ3RvcCcpIHtcbiAgICAgIHBvc2l0aW9uU3RyYXRlZ3kudG9wKCcwJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHBvc2l0aW9uU3RyYXRlZ3kuYm90dG9tKCcwJyk7XG4gICAgfVxuXG4gICAgb3ZlcmxheUNvbmZpZy5wb3NpdGlvblN0cmF0ZWd5ID0gcG9zaXRpb25TdHJhdGVneTtcbiAgICByZXR1cm4gdGhpcy5fb3ZlcmxheS5jcmVhdGUob3ZlcmxheUNvbmZpZyk7XG4gIH1cblxuICBwcml2YXRlIF9jcmVhdGVJbmplY3RvcjxUPihjb25maWc6IFRvYXN0Q29uZmlnLCB0b2FzdFJlZjogVG9hc3RSZWY8VD4pOiBJbmplY3RvciB7XG4gICAgY29uc3QgdXNlckluamVjdG9yID0gY29uZmlnICYmIGNvbmZpZy52aWV3Q29udGFpbmVyUmVmICYmIGNvbmZpZy52aWV3Q29udGFpbmVyUmVmLmluamVjdG9yO1xuXG4gICAgcmV0dXJuIEluamVjdG9yLmNyZWF0ZSh7XG4gICAgICBwYXJlbnQ6IHVzZXJJbmplY3RvciB8fCB0aGlzLl9pbmplY3RvcixcbiAgICAgIHByb3ZpZGVyczogW1xuICAgICAgICB7IHByb3ZpZGU6IFRvYXN0UmVmLCB1c2VWYWx1ZTogdG9hc3RSZWYgfSxcbiAgICAgICAgeyBwcm92aWRlOiBUT0FTVF9EQVRBLCB1c2VWYWx1ZTogY29uZmlnLmRhdGEgfSxcbiAgICAgIF0sXG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==