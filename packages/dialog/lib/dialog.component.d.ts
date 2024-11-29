import { AfterContentInit, AfterViewInit, ElementRef, OnDestroy } from '@angular/core';
import { BooleanInput } from '@angular/cdk/coercion';
import { DialogActionsDirective } from './dialog-actions.directive';
import { DialogBodyDirective } from './dialog-body.directive';
import { DialogTitleDirective } from './dialog-title.directive';
import * as i0 from "@angular/core";
import * as i1 from "@libs/scrollbar";
export declare class DialogLayoutComponent implements AfterViewInit, AfterContentInit, OnDestroy {
    private _element;
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
    private _destroyed$;
    constructor(_element: ElementRef);
    ngAfterViewInit(): void;
    ngAfterContentInit(): void;
    ngOnDestroy(): void;
    private _checkTitleTypes;
    private _onScroll;
    private _getScrollTop;
    static ɵfac: i0.ɵɵFactoryDeclaration<DialogLayoutComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<DialogLayoutComponent, "dialog-layout", never, { "alert": { "alias": "alert"; "required": false; }; "fullscreen": { "alias": "fullscreen"; "required": false; }; }, {}, ["_titleTemplate", "_actionTemplate", "_bodyTemplate"], never, true, [{ directive: typeof i1.ScrollbarDirective; inputs: {}; outputs: {}; }]>;
}
