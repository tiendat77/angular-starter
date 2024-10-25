import * as i0 from '@angular/core';
import { Component, inject, Injectable, NgModule, ENVIRONMENT_INITIALIZER } from '@angular/core';
import { Overlay, OverlayConfig, OverlayModule } from '@angular/cdk/overlay';
import { ComponentPortal, PortalModule } from '@angular/cdk/portal';

class LoaderComponent {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: LoaderComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "18.2.8", type: LoaderComponent, isStandalone: true, selector: "loader", ngImport: i0, template: "<div class=\"w-2.5 h-2.5 relative\">\n  <div class=\"absolute w-full h-full rounded-full\"></div>\n  <div class=\"absolute w-full h-full rounded-full\"></div>\n  <div class=\"absolute w-full h-full rounded-full\"></div>\n  <div class=\"absolute w-full h-full rounded-full\"></div>\n</div>\n", styles: [":host>div{animation:spin 1s linear infinite}:host>div div{animation:meetup 1.25s infinite ease;background-color:var(--loader_dot_color, var(--fallback-p, oklch(var(--p))))}:host>div div:nth-child(1){--rotation: 90}:host>div div:nth-child(2){--rotation: 180}:host>div div:nth-child(3){--rotation: 270}:host>div div:nth-child(4){--rotation: 360}@keyframes spin{to{transform:rotate(360deg)}}@keyframes meetup{0%,to{transform:rotate(calc(var(--rotation) * 1deg)) translateY(0)}50%{transform:rotate(calc(var(--rotation) * 1deg)) translateY(200%)}}\n"] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: LoaderComponent, decorators: [{
            type: Component,
            args: [{ standalone: true, selector: 'loader', template: "<div class=\"w-2.5 h-2.5 relative\">\n  <div class=\"absolute w-full h-full rounded-full\"></div>\n  <div class=\"absolute w-full h-full rounded-full\"></div>\n  <div class=\"absolute w-full h-full rounded-full\"></div>\n  <div class=\"absolute w-full h-full rounded-full\"></div>\n</div>\n", styles: [":host>div{animation:spin 1s linear infinite}:host>div div{animation:meetup 1.25s infinite ease;background-color:var(--loader_dot_color, var(--fallback-p, oklch(var(--p))))}:host>div div:nth-child(1){--rotation: 90}:host>div div:nth-child(2){--rotation: 180}:host>div div:nth-child(3){--rotation: 270}:host>div div:nth-child(4){--rotation: 360}@keyframes spin{to{transform:rotate(360deg)}}@keyframes meetup{0%,to{transform:rotate(calc(var(--rotation) * 1deg)) translateY(0)}50%{transform:rotate(calc(var(--rotation) * 1deg)) translateY(200%)}}\n"] }]
        }] });

class LoaderOverlayRef {
    _overlayRef;
    instance;
    constructor(_overlayRef) {
        this._overlayRef = _overlayRef;
    }
    close() {
        this._overlayRef.dispose();
    }
}

class LoaderService {
    _openedLoaderRef = null;
    _overlay = inject(Overlay);
    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------
    show() {
        if (this._openedLoaderRef) {
            return this._openedLoaderRef;
        }
        return this._attach();
    }
    hide() {
        if (this._openedLoaderRef) {
            this._openedLoaderRef.close();
        }
    }
    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------
    _attach() {
        const overlayRef = this._createOverlay();
        const loaderRef = new LoaderOverlayRef(overlayRef);
        const portal = new ComponentPortal(LoaderComponent);
        const contentRef = overlayRef.attach(portal);
        loaderRef.instance = contentRef.instance;
        this._openedLoaderRef = loaderRef;
        return this._openedLoaderRef;
    }
    _createOverlay() {
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
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: LoaderService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: LoaderService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: LoaderService, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root',
                }]
        }] });

class ToastModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: ToastModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "18.2.8", ngImport: i0, type: ToastModule, imports: [OverlayModule, PortalModule, LoaderComponent], exports: [LoaderComponent] });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: ToastModule, providers: [LoaderService], imports: [OverlayModule, PortalModule] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: ToastModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [OverlayModule, PortalModule, LoaderComponent],
                    exports: [LoaderComponent],
                    providers: [LoaderService],
                }]
        }] });

const provideLoader = () => {
    return [
        {
            provide: ENVIRONMENT_INITIALIZER,
            useValue: () => inject(LoaderService),
            multi: true,
        },
    ];
};

/*
 * Public API Surface of loader
 */

/**
 * Generated bundle index. Do not edit.
 */

export { LoaderComponent, LoaderOverlayRef, LoaderService, ToastModule, provideLoader };
//# sourceMappingURL=libs-loader.mjs.map
