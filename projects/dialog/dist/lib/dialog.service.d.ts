import { OnDestroy, TemplateRef } from '@angular/core';
import { ComponentType, Overlay } from '@angular/cdk/overlay';
import { Dialog, DialogConfig, DialogRef } from '@angular/cdk/dialog';
import { DialogConfirmComponent, DialogConfirmConfig } from './confirm.dialog';
import * as i0 from "@angular/core";
export declare class DialogService implements OnDestroy {
    protected _dialog: Dialog;
    protected _overlay: Overlay;
    open<T, D = any, R = any>(componentOrTemplateRef: ComponentType<T> | TemplateRef<T>, config?: DialogConfig<D, DialogRef<R, T>>): DialogRef<R, T>;
    confirm(config: DialogConfirmConfig): DialogRef<any, DialogConfirmComponent>;
    closeAll(): void;
    ngOnDestroy(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<DialogService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<DialogService>;
}
