import * as i0 from '@angular/core';
import { Provider, EnvironmentProviders } from '@angular/core';
import * as i1 from '@angular/cdk/overlay';
import { OverlayRef } from '@angular/cdk/overlay';
import * as i2 from '@angular/cdk/portal';

declare class LoaderComponent {
    static ɵfac: i0.ɵɵFactoryDeclaration<LoaderComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<LoaderComponent, "loader", never, {}, {}, never, never, true, never>;
}

declare class ToastModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<ToastModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<ToastModule, never, [typeof i1.OverlayModule, typeof i2.PortalModule, typeof LoaderComponent], [typeof LoaderComponent]>;
    static ɵinj: i0.ɵɵInjectorDeclaration<ToastModule>;
}

declare const provideLoader: () => (Provider | EnvironmentProviders)[];

declare class LoaderOverlayRef {
    private _overlayRef;
    instance: any;
    constructor(_overlayRef: OverlayRef);
    close(): void;
}

declare class LoaderService {
    private _openedLoaderRef;
    private _overlay;
    show(): LoaderOverlayRef;
    hide(): void;
    private _attach;
    private _createOverlay;
    static ɵfac: i0.ɵɵFactoryDeclaration<LoaderService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<LoaderService>;
}

export { LoaderComponent, LoaderOverlayRef, LoaderService, ToastModule, provideLoader };
