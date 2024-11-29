import { ElementRef, OnInit } from '@angular/core';
import * as i0 from "@angular/core";
export declare class DialogHeaderDirective implements OnInit {
    private _element;
    get element(): HTMLElement;
    constructor(_element: ElementRef);
    ngOnInit(): void;
    visibility(enable: boolean): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<DialogHeaderDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<DialogHeaderDirective, "[dialog-header], [dialogHeader]", never, {}, {}, never, never, true, never>;
}
