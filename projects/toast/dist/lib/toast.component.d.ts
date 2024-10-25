import { ToastRef } from './toast.ref';
import { ToastType } from './toast.config';
import * as i0 from "@angular/core";
export declare class ToastComponent {
    data: {
        title: string;
        message: string;
        type: ToastType;
    };
    toastRef: ToastRef<any>;
    action(): void;
    dismiss(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<ToastComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<ToastComponent, "toast", never, {}, {}, never, never, true, never>;
}
