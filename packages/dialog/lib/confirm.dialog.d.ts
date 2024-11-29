import { DialogRef } from '@angular/cdk/dialog';
import * as i0 from "@angular/core";
export interface DialogConfirmConfig {
    type?: 'info' | 'success' | 'warning' | 'error';
    title?: string;
    message?: string;
}
export declare class DialogConfirmComponent {
    data: DialogConfirmConfig;
    dialogRef: DialogRef<boolean, unknown>;
    static ɵfac: i0.ɵɵFactoryDeclaration<DialogConfirmComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<DialogConfirmComponent, "dialog-confirm", never, {}, {}, never, never, true, never>;
}
