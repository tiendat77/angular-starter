import * as i2 from '@angular/cdk/portal';
import { CdkPortal, PortalModule } from '@angular/cdk/portal';
import * as i0 from '@angular/core';
import { Directive, Component, ViewEncapsulation, Input, ContentChild, ViewChild, inject, Injectable, NgModule } from '@angular/core';
import * as i1 from '@angular/cdk/dialog';
import { DIALOG_DATA, DialogRef, Dialog, DialogConfig, DialogModule as DialogModule$1 } from '@angular/cdk/dialog';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { Subject, fromEvent, takeUntil } from 'rxjs';
import * as i1$1 from '@libs/scrollbar';
import { ScrollbarDirective } from '@libs/scrollbar';
import { Overlay } from '@angular/cdk/overlay';
import { merge } from 'es-toolkit';
import { NgClass } from '@angular/common';

class DialogActionsDirective extends CdkPortal {
    constructor(templateRef, viewContainerRef) {
        super(templateRef, viewContainerRef);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.13", ngImport: i0, type: DialogActionsDirective, deps: [{ token: i0.TemplateRef }, { token: i0.ViewContainerRef }], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.13", type: DialogActionsDirective, isStandalone: true, selector: "[dialog-actions], [dialogActions]", usesInheritance: true, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.13", ngImport: i0, type: DialogActionsDirective, decorators: [{
            type: Directive,
            args: [{
                    standalone: true,
                    selector: '[dialog-actions], [dialogActions]',
                }]
        }], ctorParameters: () => [{ type: i0.TemplateRef }, { type: i0.ViewContainerRef }] });

class DialogBodyDirective extends CdkPortal {
    constructor(templateRef, viewContainerRef) {
        super(templateRef, viewContainerRef);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.13", ngImport: i0, type: DialogBodyDirective, deps: [{ token: i0.TemplateRef }, { token: i0.ViewContainerRef }], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.13", type: DialogBodyDirective, isStandalone: true, selector: "[dialog-body], [dialogBody]", usesInheritance: true, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.13", ngImport: i0, type: DialogBodyDirective, decorators: [{
            type: Directive,
            args: [{
                    standalone: true,
                    selector: '[dialog-body], [dialogBody]',
                }]
        }], ctorParameters: () => [{ type: i0.TemplateRef }, { type: i0.ViewContainerRef }] });

class DialogDismissDirective {
    _dialogRef;
    constructor(_dialogRef) {
        this._dialogRef = _dialogRef;
    }
    _onButtonClick() {
        this._dialogRef.close();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.13", ngImport: i0, type: DialogDismissDirective, deps: [{ token: i1.DialogRef }], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.13", type: DialogDismissDirective, isStandalone: true, selector: "[dialog-dismiss], [dialogDismiss]", host: { listeners: { "click": "_onButtonClick()" } }, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.13", ngImport: i0, type: DialogDismissDirective, decorators: [{
            type: Directive,
            args: [{
                    standalone: true,
                    selector: '[dialog-dismiss], [dialogDismiss]',
                    host: {
                        '(click)': '_onButtonClick()',
                    },
                }]
        }], ctorParameters: () => [{ type: i1.DialogRef }] });

class DialogHeaderDirective {
    _element;
    get element() {
        return this._element.nativeElement;
    }
    constructor(_element) {
        this._element = _element;
    }
    ngOnInit() {
        this.element.classList.add('hidden');
    }
    visibility(enable) {
        if (enable) {
            this.element.classList.remove('hidden');
        }
        else {
            this.element.classList.add('hidden');
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.13", ngImport: i0, type: DialogHeaderDirective, deps: [{ token: i0.ElementRef }], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.13", type: DialogHeaderDirective, isStandalone: true, selector: "[dialog-header], [dialogHeader]", ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.13", ngImport: i0, type: DialogHeaderDirective, decorators: [{
            type: Directive,
            args: [{
                    standalone: true,
                    selector: '[dialog-header], [dialogHeader]',
                }]
        }], ctorParameters: () => [{ type: i0.ElementRef }] });

class DialogTitleDirective extends CdkPortal {
    constructor(templateRef, viewContainerRef) {
        super(templateRef, viewContainerRef);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.13", ngImport: i0, type: DialogTitleDirective, deps: [{ token: i0.TemplateRef }, { token: i0.ViewContainerRef }], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.13", type: DialogTitleDirective, isStandalone: true, selector: "[dialog-title], [dialogTitle]", usesInheritance: true, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.13", ngImport: i0, type: DialogTitleDirective, decorators: [{
            type: Directive,
            args: [{
                    standalone: true,
                    selector: '[dialog-title], [dialogTitle]',
                }]
        }], ctorParameters: () => [{ type: i0.TemplateRef }, { type: i0.ViewContainerRef }] });

class DialogLayoutComponent {
    _element;
    /**
     * Input
     */
    get alert() {
        return this._alert;
    }
    set alert(value) {
        this._alert = coerceBooleanProperty(value);
    }
    _alert = false;
    get fullscreen() {
        return this._fullscreen;
    }
    set fullscreen(value) {
        this._fullscreen = coerceBooleanProperty(value);
    }
    _fullscreen = false;
    /**
     * Content children
     */
    /** Content for the dialog title given by `<ng-template dialog-title>`. */
    _titleTemplate;
    /** Content for the dialog title given by `<ng-template dialog-actions>`. */
    _actionTemplate;
    /** Content for the dialog title given by `<ng-template dialog-body>`. */
    _bodyTemplate;
    _headerRef;
    _hasTitle = false;
    /**
     * Private properties
     */
    _destroyed$ = new Subject();
    constructor(_element) {
        this._element = _element;
    }
    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------
    ngAfterViewInit() {
        /**
         * Watch scroll event to slide the header up
         */
        fromEvent(this._element?.nativeElement, 'scroll')
            .pipe(takeUntil(this._destroyed$))
            .subscribe((event) => {
            this._onScroll(event);
        });
    }
    ngAfterContentInit() {
        this._checkTitleTypes();
    }
    ngOnDestroy() {
        this._destroyed$.next();
        this._destroyed$.complete();
    }
    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------
    _checkTitleTypes() {
        this._hasTitle = !!this._titleTemplate;
    }
    _onScroll(event) {
        if (this._getScrollTop(event) > 35) {
            this._headerRef?.visibility(true);
        }
        else {
            this._headerRef?.visibility(false);
        }
    }
    _getScrollTop(event) {
        return event?.target.scrollTop || event?.target?.documentElement?.scrollTop || 0;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.13", ngImport: i0, type: DialogLayoutComponent, deps: [{ token: i0.ElementRef }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "18.2.13", type: DialogLayoutComponent, isStandalone: true, selector: "dialog-layout", inputs: { alert: "alert", fullscreen: "fullscreen" }, host: { properties: { "class.just-dialog": "!alert", "class.alert-dialog": "alert", "class.full-screen-dialog": "fullscreen" }, classAttribute: "animate__fadeInUp animate__animated animate__faster" }, queries: [{ propertyName: "_titleTemplate", first: true, predicate: DialogTitleDirective, descendants: true }, { propertyName: "_actionTemplate", first: true, predicate: DialogActionsDirective, descendants: true }, { propertyName: "_bodyTemplate", first: true, predicate: DialogBodyDirective, descendants: true }], viewQueries: [{ propertyName: "_headerRef", first: true, predicate: DialogHeaderDirective, descendants: true }], hostDirectives: [{ directive: i1$1.ScrollbarDirective }], ngImport: i0, template: "<!-- Header -->\n<div\n  class=\"min-h-18 sticky top-0 z-10 flex w-full items-center justify-center bg-base-100 p-3 transition duration-300 lg:px-4\"\n>\n  <div class=\"flex-auto overflow-hidden\">\n    @if (_hasTitle) {\n      <h2\n        dialogHeader\n        class=\"animate__animated animate__faster animate__slideInUp truncate text-lg font-semibold sm:text-xl\"\n      >\n        <ng-template [cdkPortalOutlet]=\"_titleTemplate\" />\n      </h2>\n    }\n  </div>\n\n  <div class=\"relative flex-shrink-0\">\n    <button\n      dialogDismiss\n      class=\"group btn btn-circle btn-ghost btn-sm\"\n    >\n      <svg\n        fill=\"currentColor\"\n        viewBox=\"0 0 20 20\"\n        xmlns=\"http://www.w3.org/2000/svg\"\n        class=\"h-6 w-6 transition duration-500 group-hover:rotate-90\"\n      >\n        <path\n          d=\"M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z\"\n        />\n      </svg>\n    </button>\n  </div>\n</div>\n\n<div class=\"mb-3 w-full px-3 lg:px-4\">\n  @if (_hasTitle) {\n    <h2 class=\"truncate text-2xl font-semibold\">\n      <ng-template [cdkPortalOutlet]=\"_titleTemplate\" />\n    </h2>\n  }\n</div>\n\n<!-- Body -->\n<div class=\"flex w-full flex-auto flex-col px-3 py-4 lg:px-4\">\n  <ng-template [cdkPortalOutlet]=\"_bodyTemplate\" />\n</div>\n\n<!-- Footer -->\n<div class=\"dialog-actions sticky bottom-0 z-10 flex w-full items-center gap-4 bg-base-100 p-3 sm:justify-end lg:px-4\">\n  <ng-template [cdkPortalOutlet]=\"_actionTemplate\" />\n</div>\n", styles: ["dialog-layout{position:relative;z-index:0;display:flex;flex-direction:column;overflow-x:hidden;overflow-y:auto;transition:.2s}dialog-layout.just-dialog{width:100vw;height:100vh}@media screen and (min-width: 640px){dialog-layout.just-dialog{border-radius:.375rem;width:100%;height:100%;max-width:95vw;max-height:95vh}}dialog-layout.alert-dialog{border-radius:.375rem;width:auto;height:auto;max-width:90vw;max-height:90vh}@media screen and (min-width: 640px){dialog-layout.alert-dialog{max-width:40rem}}dialog-layout.full-screen-dialog{width:100vw;height:100vh}\n"], dependencies: [{ kind: "ngmodule", type: PortalModule }, { kind: "directive", type: i2.CdkPortalOutlet, selector: "[cdkPortalOutlet]", inputs: ["cdkPortalOutlet"], outputs: ["attached"], exportAs: ["cdkPortalOutlet"] }, { kind: "directive", type: DialogDismissDirective, selector: "[dialog-dismiss], [dialogDismiss]" }, { kind: "directive", type: DialogHeaderDirective, selector: "[dialog-header], [dialogHeader]" }], encapsulation: i0.ViewEncapsulation.None });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.13", ngImport: i0, type: DialogLayoutComponent, decorators: [{
            type: Component,
            args: [{ standalone: true, selector: 'dialog-layout', encapsulation: ViewEncapsulation.None, imports: [
                        PortalModule,
                        ScrollbarDirective,
                        DialogActionsDirective,
                        DialogBodyDirective,
                        DialogDismissDirective,
                        DialogHeaderDirective,
                        DialogTitleDirective,
                    ], hostDirectives: [ScrollbarDirective], host: {
                        '[class.just-dialog]': '!alert',
                        '[class.alert-dialog]': 'alert',
                        '[class.full-screen-dialog]': 'fullscreen',
                        class: 'animate__fadeInUp animate__animated animate__faster',
                    }, template: "<!-- Header -->\n<div\n  class=\"min-h-18 sticky top-0 z-10 flex w-full items-center justify-center bg-base-100 p-3 transition duration-300 lg:px-4\"\n>\n  <div class=\"flex-auto overflow-hidden\">\n    @if (_hasTitle) {\n      <h2\n        dialogHeader\n        class=\"animate__animated animate__faster animate__slideInUp truncate text-lg font-semibold sm:text-xl\"\n      >\n        <ng-template [cdkPortalOutlet]=\"_titleTemplate\" />\n      </h2>\n    }\n  </div>\n\n  <div class=\"relative flex-shrink-0\">\n    <button\n      dialogDismiss\n      class=\"group btn btn-circle btn-ghost btn-sm\"\n    >\n      <svg\n        fill=\"currentColor\"\n        viewBox=\"0 0 20 20\"\n        xmlns=\"http://www.w3.org/2000/svg\"\n        class=\"h-6 w-6 transition duration-500 group-hover:rotate-90\"\n      >\n        <path\n          d=\"M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z\"\n        />\n      </svg>\n    </button>\n  </div>\n</div>\n\n<div class=\"mb-3 w-full px-3 lg:px-4\">\n  @if (_hasTitle) {\n    <h2 class=\"truncate text-2xl font-semibold\">\n      <ng-template [cdkPortalOutlet]=\"_titleTemplate\" />\n    </h2>\n  }\n</div>\n\n<!-- Body -->\n<div class=\"flex w-full flex-auto flex-col px-3 py-4 lg:px-4\">\n  <ng-template [cdkPortalOutlet]=\"_bodyTemplate\" />\n</div>\n\n<!-- Footer -->\n<div class=\"dialog-actions sticky bottom-0 z-10 flex w-full items-center gap-4 bg-base-100 p-3 sm:justify-end lg:px-4\">\n  <ng-template [cdkPortalOutlet]=\"_actionTemplate\" />\n</div>\n", styles: ["dialog-layout{position:relative;z-index:0;display:flex;flex-direction:column;overflow-x:hidden;overflow-y:auto;transition:.2s}dialog-layout.just-dialog{width:100vw;height:100vh}@media screen and (min-width: 640px){dialog-layout.just-dialog{border-radius:.375rem;width:100%;height:100%;max-width:95vw;max-height:95vh}}dialog-layout.alert-dialog{border-radius:.375rem;width:auto;height:auto;max-width:90vw;max-height:90vh}@media screen and (min-width: 640px){dialog-layout.alert-dialog{max-width:40rem}}dialog-layout.full-screen-dialog{width:100vw;height:100vh}\n"] }]
        }], ctorParameters: () => [{ type: i0.ElementRef }], propDecorators: { alert: [{
                type: Input
            }], fullscreen: [{
                type: Input
            }], _titleTemplate: [{
                type: ContentChild,
                args: [DialogTitleDirective]
            }], _actionTemplate: [{
                type: ContentChild,
                args: [DialogActionsDirective]
            }], _bodyTemplate: [{
                type: ContentChild,
                args: [DialogBodyDirective]
            }], _headerRef: [{
                type: ViewChild,
                args: [DialogHeaderDirective]
            }] } });

class DialogConfirmComponent {
    data = inject(DIALOG_DATA);
    dialogRef = inject((DialogRef));
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.13", ngImport: i0, type: DialogConfirmComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "18.2.13", type: DialogConfirmComponent, isStandalone: true, selector: "dialog-confirm", ngImport: i0, template: "<div\n  class=\"relative z-0 flex h-auto max-h-[90vh] w-auto max-w-[90vw] flex-col overflow-y-auto overflow-x-hidden rounded-md bg-base-100 transition duration-200 md:max-w-[700px]\"\n>\n  <!-- Indicator -->\n  <div\n    class=\"bg-red absolute top-0 z-[11] h-1 w-full\"\n    [ngClass]=\"{\n      'bg-info': data.type === 'info',\n      'bg-success': data.type === 'success',\n      'bg-warning': data.type === 'warning',\n      'bg-error': data.type === 'error',\n    }\"\n  ></div>\n\n  <!-- Body -->\n  <div class=\"flex w-full flex-auto flex-col space-y-3 px-3 py-6 lg:px-4\">\n    <h2\n      class=\"truncate text-lg font-semibold sm:text-xl\"\n      [innerHTML]=\"data.title\"\n    ></h2>\n\n    <p\n      class=\"text-base-content text-opacity-80\"\n      [innerHTML]=\"data.message\"\n    ></p>\n  </div>\n\n  <!-- Footer -->\n  <div\n    class=\"dialog-actions sticky bottom-0 z-10 flex w-full items-center gap-4 bg-base-100 p-3 sm:justify-end lg:px-4\"\n  >\n    <button\n      class=\"btn btn-outline\"\n      (click)=\"dialogRef.close()\"\n    >\n      Close\n    </button>\n\n    <button\n      class=\"btn btn-primary\"\n      [ngClass]=\"{\n        'btn-info': data.type === 'info',\n        'btn-success': data.type === 'success',\n        'btn-warning': data.type === 'warning',\n        'btn-error': data.type === 'error',\n      }\"\n      (click)=\"dialogRef.close(true)\"\n    >\n      Confirm\n    </button>\n  </div>\n</div>\n", dependencies: [{ kind: "directive", type: NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.13", ngImport: i0, type: DialogConfirmComponent, decorators: [{
            type: Component,
            args: [{ selector: 'dialog-confirm', standalone: true, imports: [NgClass], template: "<div\n  class=\"relative z-0 flex h-auto max-h-[90vh] w-auto max-w-[90vw] flex-col overflow-y-auto overflow-x-hidden rounded-md bg-base-100 transition duration-200 md:max-w-[700px]\"\n>\n  <!-- Indicator -->\n  <div\n    class=\"bg-red absolute top-0 z-[11] h-1 w-full\"\n    [ngClass]=\"{\n      'bg-info': data.type === 'info',\n      'bg-success': data.type === 'success',\n      'bg-warning': data.type === 'warning',\n      'bg-error': data.type === 'error',\n    }\"\n  ></div>\n\n  <!-- Body -->\n  <div class=\"flex w-full flex-auto flex-col space-y-3 px-3 py-6 lg:px-4\">\n    <h2\n      class=\"truncate text-lg font-semibold sm:text-xl\"\n      [innerHTML]=\"data.title\"\n    ></h2>\n\n    <p\n      class=\"text-base-content text-opacity-80\"\n      [innerHTML]=\"data.message\"\n    ></p>\n  </div>\n\n  <!-- Footer -->\n  <div\n    class=\"dialog-actions sticky bottom-0 z-10 flex w-full items-center gap-4 bg-base-100 p-3 sm:justify-end lg:px-4\"\n  >\n    <button\n      class=\"btn btn-outline\"\n      (click)=\"dialogRef.close()\"\n    >\n      Close\n    </button>\n\n    <button\n      class=\"btn btn-primary\"\n      [ngClass]=\"{\n        'btn-info': data.type === 'info',\n        'btn-success': data.type === 'success',\n        'btn-warning': data.type === 'warning',\n        'btn-error': data.type === 'error',\n      }\"\n      (click)=\"dialogRef.close(true)\"\n    >\n      Confirm\n    </button>\n  </div>\n</div>\n" }]
        }] });

class DialogService {
    _dialog = inject(Dialog);
    _overlay = inject(Overlay);
    open(componentOrTemplateRef, config) {
        config = {
            ...new DialogConfig(),
            ...config,
        };
        const cdkRef = this._dialog.open(componentOrTemplateRef, config);
        return cdkRef;
    }
    confirm(config) {
        return this.open(DialogConfirmComponent, {
            minWidth: '400px',
            data: merge({ type: 'info' }, config),
        });
    }
    closeAll() {
        this._dialog.closeAll();
    }
    ngOnDestroy() {
        this.closeAll();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.13", ngImport: i0, type: DialogService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.2.13", ngImport: i0, type: DialogService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.13", ngImport: i0, type: DialogService, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root',
                }]
        }] });

const DIRECTIVES = [
    DialogActionsDirective,
    DialogBodyDirective,
    DialogDismissDirective,
    DialogHeaderDirective,
    DialogTitleDirective,
];
class DialogModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.13", ngImport: i0, type: DialogModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "18.2.13", ngImport: i0, type: DialogModule, imports: [DialogModule$1, DialogLayoutComponent, DialogActionsDirective,
            DialogBodyDirective,
            DialogDismissDirective,
            DialogHeaderDirective,
            DialogTitleDirective], exports: [DialogLayoutComponent, DialogActionsDirective,
            DialogBodyDirective,
            DialogDismissDirective,
            DialogHeaderDirective,
            DialogTitleDirective] });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "18.2.13", ngImport: i0, type: DialogModule, providers: [DialogService], imports: [DialogModule$1, DialogLayoutComponent] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.13", ngImport: i0, type: DialogModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [DialogModule$1, DialogLayoutComponent, ...DIRECTIVES],
                    exports: [DialogLayoutComponent, ...DIRECTIVES],
                    providers: [DialogService],
                }]
        }] });

/*
 * Public API Surface of dialog
 */

/**
 * Generated bundle index. Do not edit.
 */

export { DialogActionsDirective, DialogBodyDirective, DialogDismissDirective, DialogHeaderDirective, DialogLayoutComponent, DialogModule, DialogService, DialogTitleDirective };
//# sourceMappingURL=libs-dialog.mjs.map
