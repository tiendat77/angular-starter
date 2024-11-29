import { LoaderOverlayRef } from './loader.ref';
import * as i0 from "@angular/core";
export declare class LoaderService {
    private _openedLoaderRef;
    private _overlay;
    show(): LoaderOverlayRef;
    hide(): void;
    private _attach;
    private _createOverlay;
    static ɵfac: i0.ɵɵFactoryDeclaration<LoaderService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<LoaderService>;
}
