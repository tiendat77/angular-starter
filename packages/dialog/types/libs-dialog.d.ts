import { CdkPortal } from '@angular/cdk/portal';
import * as i0 from '@angular/core';
import { OnInit, AfterViewInit, AfterContentInit, OnDestroy, TemplateRef } from '@angular/core';
import { BooleanInput } from '@angular/cdk/coercion';
import * as i1 from '@angular/cdk/dialog';
import { DialogRef, Dialog, DialogConfig } from '@angular/cdk/dialog';
import { Overlay, ComponentType } from '@angular/cdk/overlay';

declare class DialogActionsDirective extends CdkPortal {
    constructor();
    static ɵfac: i0.ɵɵFactoryDeclaration<DialogActionsDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<DialogActionsDirective, "[dialog-actions], [dialogActions]", never, {}, {}, never, never, true, never>;
}

declare class DialogBodyDirective extends CdkPortal {
    constructor();
    static ɵfac: i0.ɵɵFactoryDeclaration<DialogBodyDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<DialogBodyDirective, "[dialog-body], [dialogBody]", never, {}, {}, never, never, true, never>;
}

declare class DialogDismissDirective {
    private _dialogRef;
    _onButtonClick(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<DialogDismissDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<DialogDismissDirective, "[dialog-dismiss], [dialogDismiss]", never, {}, {}, never, never, true, never>;
}

declare class DialogHeaderDirective implements OnInit {
    private _element;
    get element(): HTMLElement;
    ngOnInit(): void;
    visibility(enable: boolean): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<DialogHeaderDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<DialogHeaderDirective, "[dialog-header], [dialogHeader]", never, {}, {}, never, never, true, never>;
}

declare class DialogTitleDirective extends CdkPortal {
    constructor();
    static ɵfac: i0.ɵɵFactoryDeclaration<DialogTitleDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<DialogTitleDirective, "[dialog-title], [dialogTitle]", never, {}, {}, never, never, true, never>;
}

declare class DialogLayoutComponent implements AfterViewInit, AfterContentInit {
    /**
     * Input
     */
    get alert(): BooleanInput;
    set alert(value: BooleanInput);
    private _alert;
    get fullscreen(): BooleanInput;
    set fullscreen(value: BooleanInput);
    private _fullscreen;
    /**
     * Content children
     */
    /** Content for the dialog title given by `<ng-template dialog-title>`. */
    protected _titleTemplate: DialogTitleDirective | undefined;
    /** Content for the dialog title given by `<ng-template dialog-actions>`. */
    protected _actionTemplate: DialogActionsDirective | undefined;
    /** Content for the dialog title given by `<ng-template dialog-body>`. */
    protected _bodyTemplate: DialogBodyDirective | undefined;
    private _headerRef;
    _hasTitle: boolean;
    /**
     * Private properties
     */
    private _element;
    private _destroyRef;
    ngAfterContentInit(): void;
    ngAfterViewInit(): void;
    private _checkTitleTypes;
    private _onScroll;
    private _getScrollTop;
    static ɵfac: i0.ɵɵFactoryDeclaration<DialogLayoutComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<DialogLayoutComponent, "dialog-layout", never, { "alert": { "alias": "alert"; "required": false; }; "fullscreen": { "alias": "fullscreen"; "required": false; }; }, {}, ["_titleTemplate", "_actionTemplate", "_bodyTemplate"], never, true, never>;
}

declare class DialogModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<DialogModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<DialogModule, never, [typeof i1.DialogModule, typeof DialogLayoutComponent, typeof DialogActionsDirective, typeof DialogBodyDirective, typeof DialogDismissDirective, typeof DialogHeaderDirective, typeof DialogTitleDirective], [typeof DialogLayoutComponent, typeof DialogActionsDirective, typeof DialogBodyDirective, typeof DialogDismissDirective, typeof DialogHeaderDirective, typeof DialogTitleDirective]>;
    static ɵinj: i0.ɵɵInjectorDeclaration<DialogModule>;
}

interface DialogConfirmConfig {
    type?: 'info' | 'success' | 'warning' | 'error';
    title?: string;
    message?: string;
}
declare class DialogConfirmComponent {
    data: DialogConfirmConfig;
    dialogRef: DialogRef<boolean, unknown>;
    static ɵfac: i0.ɵɵFactoryDeclaration<DialogConfirmComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<DialogConfirmComponent, "dialog-confirm", never, {}, {}, never, never, true, never>;
}

declare class DialogService implements OnDestroy {
    protected _dialog: Dialog;
    protected _overlay: Overlay;
    open<T, D = any, R = any>(componentOrTemplateRef: ComponentType<T> | TemplateRef<T>, config?: DialogConfig<D, DialogRef<R, T>>): DialogRef<R, T>;
    confirm(config: DialogConfirmConfig): DialogRef<any, DialogConfirmComponent>;
    closeAll(): void;
    ngOnDestroy(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<DialogService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<DialogService>;
}

export { DialogActionsDirective, DialogBodyDirective, DialogDismissDirective, DialogHeaderDirective, DialogLayoutComponent, DialogModule, DialogService, DialogTitleDirective };
