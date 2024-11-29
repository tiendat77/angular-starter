import { OverlayRef } from '@angular/cdk/overlay';
export declare class LoaderOverlayRef {
    private _overlayRef;
    instance: any;
    constructor(_overlayRef: OverlayRef);
    close(): void;
}
