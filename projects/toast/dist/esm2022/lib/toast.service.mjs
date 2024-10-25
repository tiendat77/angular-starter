import { OverlayConfig } from '@angular/cdk/overlay';
import { ComponentPortal, TemplatePortal } from '@angular/cdk/portal';
import { Inject, Injectable, InjectionToken, Injector, Optional, SkipSelf, TemplateRef, } from '@angular/core';
import { TOAST_DATA, ToastConfig } from './toast.config';
import { ToastContainerComponent } from './toast.container';
import { ToastComponent } from './toast.component';
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
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: ToastService, deps: [{ token: i1.Overlay }, { token: i0.Injector }, { token: ToastService, optional: true, skipSelf: true }, { token: TOAST_DEFAULT_OPTIONS }], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: ToastService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: ToastService, decorators: [{
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9hc3Quc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9saWIvdG9hc3Quc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQTBCLGFBQWEsRUFBYyxNQUFNLHNCQUFzQixDQUFDO0FBQ3pGLE9BQU8sRUFBRSxlQUFlLEVBQUUsY0FBYyxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFFdEUsT0FBTyxFQUdMLE1BQU0sRUFDTixVQUFVLEVBQ1YsY0FBYyxFQUNkLFFBQVEsRUFFUixRQUFRLEVBQ1IsUUFBUSxFQUNSLFdBQVcsR0FDWixNQUFNLGVBQWUsQ0FBQztBQUV2QixPQUFPLEVBQUUsVUFBVSxFQUFFLFdBQVcsRUFBYSxNQUFNLGdCQUFnQixDQUFDO0FBQ3BFLE9BQU8sRUFBRSx1QkFBdUIsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBQzVELE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUNuRCxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sYUFBYSxDQUFDOzs7O0FBRXZDLE1BQU0sVUFBVSw2QkFBNkI7SUFDM0MsT0FBTyxJQUFJLFdBQVcsRUFBRSxDQUFDO0FBQzNCLENBQUM7QUFFRCxNQUFNLENBQUMsTUFBTSxxQkFBcUIsR0FBRyxJQUFJLGNBQWMsQ0FBYyx1QkFBdUIsRUFBRTtJQUM1RixVQUFVLEVBQUUsTUFBTTtJQUNsQixPQUFPLEVBQUUsNkJBQTZCO0NBQ3ZDLENBQUMsQ0FBQztBQUdILE1BQU0sT0FBTyxZQUFZO0lBb0JiO0lBQ0E7SUFDd0I7SUFDTztJQXRCakMsb0JBQW9CLEdBQXlCLElBQUksQ0FBQztJQUUxRCxjQUFjLEdBQUcsY0FBYyxDQUFDO0lBQ2hDLHVCQUF1QixHQUFHLHVCQUF1QixDQUFDO0lBRWxELElBQUksZUFBZTtRQUNqQixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDO1FBQ2pDLE9BQU8sTUFBTSxDQUFDLENB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QUFDO0lBQzdDLENBQUM7SUFFTyxlQUFlLENBQUksTUFBbUIsRUFBRSxRQUFxQjtRQUNuRSxNQUFNLFlBQVksR0FBRyxNQUFNLElBQUksTUFBTSxDQUFDLGdCQUFnQixJQUFJLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUM7UUFFM0YsT0FBTyxRQUFRLENBQUMsTUFBTSxDQUFDO1lBQ3JCLE1BQU0sRUFBRSxZQUFZLElBQUksSUFBSSxDQUFDLFNBQVM7WUFDdEMsU0FBUyxFQUFFO2dCQUNULEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFO2dCQUN6QyxFQUFFLE9BQU8sRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLE1BQU0sQ0FBQyxJQUFJLEVBQUU7YUFDL0M7U0FDRixDQUFDLENBQUM7SUFDTCxDQUFDO3VHQTdMVSxZQUFZLDBIQXVCYixxQkFBcUI7MkdBdkJwQixZQUFZLGNBREMsTUFBTTs7MkZBQ25CLFlBQVk7a0JBRHhCLFVBQVU7bUJBQUMsRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFOzswQkF1QjdCLFFBQVE7OzBCQUFJLFFBQVE7OzBCQUNwQixNQUFNOzJCQUFDLHFCQUFxQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudFR5cGUsIE92ZXJsYXksIE92ZXJsYXlDb25maWcsIE92ZXJsYXlSZWYgfSBmcm9tICdAYW5ndWxhci9jZGsvb3ZlcmxheSc7XG5pbXBvcnQgeyBDb21wb25lbnRQb3J0YWwsIFRlbXBsYXRlUG9ydGFsIH0gZnJvbSAnQGFuZ3VsYXIvY2RrL3BvcnRhbCc7XG5cbmltcG9ydCB7XG4gIENvbXBvbmVudFJlZixcbiAgRW1iZWRkZWRWaWV3UmVmLFxuICBJbmplY3QsXG4gIEluamVjdGFibGUsXG4gIEluamVjdGlvblRva2VuLFxuICBJbmplY3RvcixcbiAgT25EZXN0cm95LFxuICBPcHRpb25hbCxcbiAgU2tpcFNlbGYsXG4gIFRlbXBsYXRlUmVmLFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgVE9BU1RfREFUQSwgVG9hc3RDb25maWcsIFRvYXN0VHlwZSB9IGZyb20gJy4vdG9hc3QuY29uZmlnJztcbmltcG9ydCB7IFRvYXN0Q29udGFpbmVyQ29tcG9uZW50IH0gZnJvbSAnLi90b2FzdC5jb250YWluZXInO1xuaW1wb3J0IHsgVG9hc3RDb21wb25lbnQgfSBmcm9tICcuL3RvYXN0LmNvbXBvbmVudCc7XG5pbXBvcnQgeyBUb2FzdFJlZiB9IGZyb20gJy4vdG9hc3QucmVmJztcblxuZXhwb3J0IGZ1bmN0aW9uIFRPQVNUX0RFRkFVTFRfT1BUSU9OU19GQUNUT1JZKCk6IFRvYXN0Q29uZmlnIHtcbiAgcmV0dXJuIG5ldyBUb2FzdENvbmZpZygpO1xufVxuXG5leHBvcnQgY29uc3QgVE9BU1RfREVGQVVMVF9PUFRJT05TID0gbmV3IEluamVjdGlvblRva2VuPFRvYXN0Q29uZmlnPigndG9hc3QtZGVmYXVsdC1vcHRpb25zJywge1xuICBwcm92aWRlZEluOiAncm9vdCcsXG4gIGZhY3Rvcnk6IFRPQVNUX0RFRkFVTFRfT1BUSU9OU19GQUNUT1JZLFxufSk7XG5cbkBJbmplY3RhYmxlKHsgcHJvdmlkZWRJbjogJ3Jvb3QnIH0pXG5leHBvcnQgY2xhc3MgVG9hc3RTZXJ2aWNlIGltcGxlbWVudHMgT25EZXN0cm95IHtcbiAgcHJpdmF0ZSBfdG9hc3RSZWZBdFRoaXNMZXZlbDogVG9hc3RSZWY8YW55PiB8IG51bGwgPSBudWxsO1xuXG4gIHRvYXN0Q29tcG9uZW50ID0gVG9hc3RDb21wb25lbnQ7XG4gIHRvYXN0Q29udGFpbmVyQ29tcG9uZW50ID0gVG9hc3RDb250YWluZXJDb21wb25lbnQ7XG5cbiAgZ2V0IF9vcGVuZWRUb2FzdFJlZigpOiBUb2FzdFJlZjxhbnk+IHwgbnVsbCB7XG4gICAgY29uc3QgcGFyZW50ID0gdGhpcy5fcGFyZW50VG9hc3Q7XG4gICAgcmV0dXJuIHBhcmVudCA/IHBhcmVudC5fb3BlbmVkVG9hc3RSZWYgOiB0aGlzLl90b2FzdFJlZkF0VGhpc0xldmVsO1xuICB9XG5cbiAgc2V0IF9vcGVuZWRUb2FzdFJlZih2YWx1ZTogVG9hc3RSZWY8YW55PiB8IG51bGwpIHtcbiAgICBpZiAodGhpcy5fcGFyZW50VG9hc3QpIHtcbiAgICAgIHRoaXMuX3BhcmVudFRvYXN0Ll9vcGVuZWRUb2FzdFJlZiA9IHZhbHVlO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl90b2FzdFJlZkF0VGhpc0xldmVsID0gdmFsdWU7XG4gICAgfVxuICB9XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBfb3ZlcmxheTogT3ZlcmxheSxcbiAgICBwcml2YXRlIF9pbmplY3RvcjogSW5qZWN0b3IsXG4gICAgQE9wdGlvbmFsKCkgQFNraXBTZWxmKCkgcHJpdmF0ZSBfcGFyZW50VG9hc3Q6IFRvYXN0U2VydmljZSxcbiAgICBASW5qZWN0KFRPQVNUX0RFRkFVTFRfT1BUSU9OUykgcHJpdmF0ZSBfZGVmYXVsdENvbmZpZzogVG9hc3RDb25maWdcbiAgKSB7fVxuXG4gIG9wZW4oXG4gICAgdHlwZTogVG9hc3RUeXBlLFxuICAgIHRpdGxlOiBzdHJpbmcsXG4gICAgbWVzc2FnZTogc3RyaW5nLFxuICAgIGNvbmZpZz86IFRvYXN0Q29uZmlnXG4gICk6IFRvYXN0UmVmPFRvYXN0Q29tcG9uZW50PiB7XG4gICAgY29uc3QgX2NvbmZpZyA9IHtcbiAgICAgIC4uLnRoaXMuX2RlZmF1bHRDb25maWcsXG4gICAgICAuLi5jb25maWcsXG4gICAgICBkYXRhOiB7IHRpdGxlLCBtZXNzYWdlLCB0eXBlIH0sXG4gICAgfTtcblxuICAgIHJldHVybiB0aGlzLl9hdHRhY2godGhpcy50b2FzdENvbXBvbmVudCwgX2NvbmZpZykgYXMgVG9hc3RSZWY8VG9hc3RDb21wb25lbnQ+O1xuICB9XG5cbiAgaW5mbyhtZXNzYWdlOiBzdHJpbmcsIHRpdGxlID0gJycpOiBUb2FzdFJlZjxUb2FzdENvbXBvbmVudD4ge1xuICAgIHJldHVybiB0aGlzLm9wZW4oJ2luZm8nLCB0aXRsZSwgbWVzc2FnZSk7XG4gIH1cblxuICBzdWNjZXNzKG1lc3NhZ2U6IHN0cmluZywgdGl0bGUgPSAnJyk6IFRvYXN0UmVmPFRvYXN0Q29tcG9uZW50PiB7XG4gICAgcmV0dXJuIHRoaXMub3Blbignc3VjY2VzcycsIHRpdGxlLCBtZXNzYWdlKTtcbiAgfVxuXG4gIHdhcm5pbmcobWVzc2FnZTogc3RyaW5nLCB0aXRsZSA9ICcnKTogVG9hc3RSZWY8VG9hc3RDb21wb25lbnQ+IHtcbiAgICByZXR1cm4gdGhpcy5vcGVuKCd3YXJuaW5nJywgdGl0bGUsIG1lc3NhZ2UpO1xuICB9XG5cbiAgZXJyb3IobWVzc2FnZTogc3RyaW5nLCB0aXRsZSA9ICcnKTogVG9hc3RSZWY8VG9hc3RDb21wb25lbnQ+IHtcbiAgICByZXR1cm4gdGhpcy5vcGVuKCdlcnJvcicsIHRpdGxlLCBtZXNzYWdlKTtcbiAgfVxuXG4gIGRpc21pc3MoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX29wZW5lZFRvYXN0UmVmKSB7XG4gICAgICB0aGlzLl9vcGVuZWRUb2FzdFJlZi5kaXNtaXNzKCk7XG4gICAgfVxuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgaWYgKHRoaXMuX3RvYXN0UmVmQXRUaGlzTGV2ZWwpIHtcbiAgICAgIHRoaXMuX3RvYXN0UmVmQXRUaGlzTGV2ZWwuZGlzbWlzcygpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2F0dGFjaFRvYXN0Q29udGFpbmVyKFxuICAgIG92ZXJsYXlSZWY6IE92ZXJsYXlSZWYsXG4gICAgY29uZmlnOiBUb2FzdENvbmZpZ1xuICApOiBUb2FzdENvbnRhaW5lckNvbXBvbmVudCB7XG4gICAgY29uc3QgdXNlckluamVjdG9yID0gY29uZmlnICYmIGNvbmZpZy52aWV3Q29udGFpbmVyUmVmICYmIGNvbmZpZy52aWV3Q29udGFpbmVyUmVmLmluamVjdG9yO1xuICAgIGNvbnN0IGluamVjdG9yID0gSW5qZWN0b3IuY3JlYXRlKHtcbiAgICAgIHBhcmVudDogdXNlckluamVjdG9yIHx8IHRoaXMuX2luamVjdG9yLFxuICAgICAgcHJvdmlkZXJzOiBbeyBwcm92aWRlOiBUb2FzdENvbmZpZywgdXNlVmFsdWU6IGNvbmZpZyB9XSxcbiAgICB9KTtcblxuICAgIGNvbnN0IGNvbnRhaW5lclBvcnRhbCA9IG5ldyBDb21wb25lbnRQb3J0YWwoXG4gICAgICB0aGlzLnRvYXN0Q29udGFpbmVyQ29tcG9uZW50LFxuICAgICAgY29uZmlnLnZpZXdDb250YWluZXJSZWYsXG4gICAgICBpbmplY3RvclxuICAgICk7XG4gICAgY29uc3QgY29udGFpbmVyUmVmOiBDb21wb25lbnRSZWY8VG9hc3RDb250YWluZXJDb21wb25lbnQ+ID0gb3ZlcmxheVJlZi5hdHRhY2goY29udGFpbmVyUG9ydGFsKTtcbiAgICByZXR1cm4gY29udGFpbmVyUmVmLmluc3RhbmNlO1xuICB9XG5cbiAgcHJpdmF0ZSBfYXR0YWNoPFQ+KFxuICAgIGNvbnRlbnQ6IENvbXBvbmVudFR5cGU8VD4gfCBUZW1wbGF0ZVJlZjxUPixcbiAgICB1c2VyQ29uZmlnPzogVG9hc3RDb25maWdcbiAgKTogVG9hc3RSZWY8VCB8IEVtYmVkZGVkVmlld1JlZjxhbnk+PiB7XG4gICAgY29uc3QgY29uZmlnID0geyAuLi5uZXcgVG9hc3RDb25maWcoKSwgLi4udGhpcy5fZGVmYXVsdENvbmZpZywgLi4udXNlckNvbmZpZyB9O1xuICAgIGNvbnN0IG92ZXJsYXlSZWYgPSB0aGlzLl9jcmVhdGVPdmVybGF5KGNvbmZpZyk7XG4gICAgY29uc3QgY29udGFpbmVyID0gdGhpcy5fYXR0YWNoVG9hc3RDb250YWluZXIob3ZlcmxheVJlZiwgY29uZmlnKTtcbiAgICBjb25zdCB0b2FzdFJlZiA9IG5ldyBUb2FzdFJlZjxUIHwgRW1iZWRkZWRWaWV3UmVmPGFueT4+KGNvbnRhaW5lciwgb3ZlcmxheVJlZik7XG5cbiAgICBpZiAoY29udGVudCBpbnN0YW5jZW9mIFRlbXBsYXRlUmVmKSB7XG4gICAgICBjb25zdCBwb3J0YWwgPSBuZXcgVGVtcGxhdGVQb3J0YWwoY29udGVudCwgbnVsbCEsIHtcbiAgICAgICAgJGltcGxpY2l0OiBjb25maWcuZGF0YSxcbiAgICAgICAgdG9hc3RSZWYsXG4gICAgICB9IGFzIGFueSk7XG5cbiAgICAgIHRvYXN0UmVmLmluc3RhbmNlID0gY29udGFpbmVyLmF0dGFjaFRlbXBsYXRlUG9ydGFsKHBvcnRhbCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGluamVjdG9yID0gdGhpcy5fY3JlYXRlSW5qZWN0b3IoY29uZmlnLCB0b2FzdFJlZik7XG4gICAgICBjb25zdCBwb3J0YWwgPSBuZXcgQ29tcG9uZW50UG9ydGFsKGNvbnRlbnQsIHVuZGVmaW5lZCwgaW5qZWN0b3IpO1xuICAgICAgY29uc3QgY29udGVudFJlZiA9IGNvbnRhaW5lci5hdHRhY2hDb21wb25lbnRQb3J0YWw8VD4ocG9ydGFsKTtcblxuICAgICAgLy8gV2UgY2FuJ3QgcGFzcyB0aGlzIHZpYSB0aGUgaW5qZWN0b3IsIGJlY2F1c2UgdGhlIGluamVjdG9yIGlzIGNyZWF0ZWQgZWFybGllci5cbiAgICAgIHRvYXN0UmVmLmluc3RhbmNlID0gY29udGVudFJlZi5pbnN0YW5jZTtcbiAgICB9XG5cbiAgICB0aGlzLl9hbmltYXRlVG9hc3QodG9hc3RSZWYsIGNvbmZpZyk7XG4gICAgdGhpcy5fb3BlbmVkVG9hc3RSZWYgPSB0b2FzdFJlZjtcbiAgICByZXR1cm4gdGhpcy5fb3BlbmVkVG9hc3RSZWY7XG4gIH1cblxuICBwcml2YXRlIF9hbmltYXRlVG9hc3QodG9hc3RSZWY6IFRvYXN0UmVmPGFueT4sIGNvbmZpZzogVG9hc3RDb25maWcpIHtcbiAgICAvLyBXaGVuIHRoZSB0b2FzdCBpcyBkaXNtaXNzZWQsIGNsZWFyIHRoZSByZWZlcmVuY2UgdG8gaXQuXG4gICAgdG9hc3RSZWYuYWZ0ZXJEaXNtaXNzZWQoKS5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgLy8gQ2xlYXIgdGhlIHRvYXN0IHJlZiBpZiBpdCBoYXNuJ3QgYWxyZWFkeSBiZWVuIHJlcGxhY2VkIGJ5IGEgbmV3ZXIgdG9hc3QuXG4gICAgICBpZiAodGhpcy5fb3BlbmVkVG9hc3RSZWYgPT0gdG9hc3RSZWYpIHtcbiAgICAgICAgdGhpcy5fb3BlbmVkVG9hc3RSZWYgPSBudWxsO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgaWYgKHRoaXMuX29wZW5lZFRvYXN0UmVmKSB7XG4gICAgICAvLyBJZiBhIHRvYXN0IGlzIGFscmVhZHkgaW4gdmlldywgZGlzbWlzcyBpdCBhbmQgZW50ZXIgdGhlXG4gICAgICAvLyBuZXcgdG9hc3QgYWZ0ZXIgZXhpdCBhbmltYXRpb24gaXMgY29tcGxldGUuXG4gICAgICB0aGlzLl9vcGVuZWRUb2FzdFJlZi5hZnRlckRpc21pc3NlZCgpLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICAgIHRvYXN0UmVmLmNvbnRhaW5lckluc3RhbmNlLmVudGVyKCk7XG4gICAgICB9KTtcbiAgICAgIHRoaXMuX29wZW5lZFRvYXN0UmVmLmRpc21pc3MoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gSWYgbm8gdG9hc3QgaXMgaW4gdmlldywgZW50ZXIgdGhlIG5ldyB0b2FzdC5cbiAgICAgIHRvYXN0UmVmLmNvbnRhaW5lckluc3RhbmNlLmVudGVyKCk7XG4gICAgfVxuXG4gICAgLy8gSWYgYSBkaXNtaXNzIHRpbWVvdXQgaXMgcHJvdmlkZWQsIHNldCB1cCBkaXNtaXNzIGJhc2VkIG9uIGFmdGVyIHRoZSB0b2FzdCBpcyBvcGVuZWQuXG4gICAgaWYgKGNvbmZpZy5kdXJhdGlvbiAmJiBjb25maWcuZHVyYXRpb24gPiAwKSB7XG4gICAgICB0b2FzdFJlZi5hZnRlck9wZW5lZCgpLnN1YnNjcmliZSgoKSA9PiB0b2FzdFJlZi5fZGlzbWlzc0FmdGVyKGNvbmZpZy5kdXJhdGlvbiEpKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyBvdmVybGF5IGFuZCBwbGFjZXMgaXQgaW4gdGhlIGNvcnJlY3QgbG9jYXRpb24uXG4gICAqIEBwYXJhbSBjb25maWcgVGhlIHVzZXItc3BlY2lmaWVkIHRvYXN0IGNvbmZpZy5cbiAgICovXG4gIHByaXZhdGUgX2NyZWF0ZU92ZXJsYXkoY29uZmlnOiBUb2FzdENvbmZpZyk6IE92ZXJsYXlSZWYge1xuICAgIGNvbnN0IG92ZXJsYXlDb25maWcgPSBuZXcgT3ZlcmxheUNvbmZpZygpO1xuICAgIG92ZXJsYXlDb25maWcuZGlyZWN0aW9uID0gY29uZmlnLmRpcmVjdGlvbjtcblxuICAgIGNvbnN0IHBvc2l0aW9uU3RyYXRlZ3kgPSB0aGlzLl9vdmVybGF5LnBvc2l0aW9uKCkuZ2xvYmFsKCk7XG4gICAgLy8gU2V0IGhvcml6b250YWwgcG9zaXRpb24uXG4gICAgY29uc3QgaXNSdGwgPSBjb25maWcuZGlyZWN0aW9uID09PSAncnRsJztcbiAgICBjb25zdCBpc0xlZnQgPVxuICAgICAgY29uZmlnLmhvcml6b250YWxQb3NpdGlvbiA9PT0gJ2xlZnQnIHx8XG4gICAgICAoY29uZmlnLmhvcml6b250YWxQb3NpdGlvbiA9PT0gJ3N0YXJ0JyAmJiAhaXNSdGwpIHx8XG4gICAgICAoY29uZmlnLmhvcml6b250YWxQb3NpdGlvbiA9PT0gJ2VuZCcgJiYgaXNSdGwpO1xuICAgIGNvbnN0IGlzUmlnaHQgPSAhaXNMZWZ0ICYmIGNvbmZpZy5ob3Jpem9udGFsUG9zaXRpb24gIT09ICdjZW50ZXInO1xuICAgIGlmIChpc0xlZnQpIHtcbiAgICAgIHBvc2l0aW9uU3RyYXRlZ3kubGVmdCgnMCcpO1xuICAgIH0gZWxzZSBpZiAoaXNSaWdodCkge1xuICAgICAgcG9zaXRpb25TdHJhdGVneS5yaWdodCgnMCcpO1xuICAgIH0gZWxzZSB7XG4gICAgICBwb3NpdGlvblN0cmF0ZWd5LmNlbnRlckhvcml6b250YWxseSgpO1xuICAgIH1cbiAgICAvLyBTZXQgaG9yaXpvbnRhbCBwb3NpdGlvbi5cbiAgICBpZiAoY29uZmlnLnZlcnRpY2FsUG9zaXRpb24gPT09ICd0b3AnKSB7XG4gICAgICBwb3NpdGlvblN0cmF0ZWd5LnRvcCgnMCcpO1xuICAgIH0gZWxzZSB7XG4gICAgICBwb3NpdGlvblN0cmF0ZWd5LmJvdHRvbSgnMCcpO1xuICAgIH1cblxuICAgIG92ZXJsYXlDb25maWcucG9zaXRpb25TdHJhdGVneSA9IHBvc2l0aW9uU3RyYXRlZ3k7XG4gICAgcmV0dXJuIHRoaXMuX292ZXJsYXkuY3JlYXRlKG92ZXJsYXlDb25maWcpO1xuICB9XG5cbiAgcHJpdmF0ZSBfY3JlYXRlSW5qZWN0b3I8VD4oY29uZmlnOiBUb2FzdENvbmZpZywgdG9hc3RSZWY6IFRvYXN0UmVmPFQ+KTogSW5qZWN0b3Ige1xuICAgIGNvbnN0IHVzZXJJbmplY3RvciA9IGNvbmZpZyAmJiBjb25maWcudmlld0NvbnRhaW5lclJlZiAmJiBjb25maWcudmlld0NvbnRhaW5lclJlZi5pbmplY3RvcjtcblxuICAgIHJldHVybiBJbmplY3Rvci5jcmVhdGUoe1xuICAgICAgcGFyZW50OiB1c2VySW5qZWN0b3IgfHwgdGhpcy5faW5qZWN0b3IsXG4gICAgICBwcm92aWRlcnM6IFtcbiAgICAgICAgeyBwcm92aWRlOiBUb2FzdFJlZiwgdXNlVmFsdWU6IHRvYXN0UmVmIH0sXG4gICAgICAgIHsgcHJvdmlkZTogVE9BU1RfREFUQSwgdXNlVmFsdWU6IGNvbmZpZy5kYXRhIH0sXG4gICAgICBdLFxuICAgIH0pO1xuICB9XG59XG4iXX0=