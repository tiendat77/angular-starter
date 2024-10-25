import { ElementRef, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { BooleanInput } from '@angular/cdk/coercion';
import { Platform } from '@angular/cdk/platform';
import PerfectScrollbar from 'perfect-scrollbar';
import { ScrollbarGeometry, ScrollbarPosition } from './scrollbar.types';
import * as i0 from "@angular/core";
/**
 * Wrapper directive for the Perfect Scrollbar:
 * https://github.com/mdbootstrap/perfect-scrollbar
 */
export declare class ScrollbarDirective implements OnChanges, OnInit, OnDestroy {
    private _elementRef;
    private _platform;
    static ngAcceptInputType_scrollbar: BooleanInput;
    scrollbar: boolean;
    scrollbarOptions: PerfectScrollbar.Options;
    private _animation;
    private _options;
    private _ps;
    private _unsubscribeAll;
    /**
     * Constructor
     */
    constructor(_elementRef: ElementRef, _platform: Platform);
    get elementRef(): ElementRef;
    get ps(): PerfectScrollbar | null;
    ngOnChanges(changes: SimpleChanges): void;
    ngOnInit(): void;
    ngOnDestroy(): void;
    isEnabled(): boolean;
    update(): void;
    destroy(): void;
    geometry(prefix?: string): ScrollbarGeometry;
    position(absolute?: boolean): ScrollbarPosition;
    scrollTo(x: number, y?: number, speed?: number): void;
    scrollToX(x: number, speed?: number): void;
    scrollToY(y: number, speed?: number): void;
    scrollToTop(offset?: number, speed?: number): void;
    scrollToBottom(offset?: number, speed?: number): void;
    scrollToLeft(offset?: number, speed?: number): void;
    scrollToRight(offset?: number, speed?: number): void;
    scrollToElement(qs: string, offset?: number, ignoreVisible?: boolean, speed?: number): void;
    animateScrolling(target: string, value: number, speed?: number): void;
    private _init;
    private _destroy;
    static ɵfac: i0.ɵɵFactoryDeclaration<ScrollbarDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<ScrollbarDirective, "[scrollbar]", ["scrollbar"], { "scrollbar": { "alias": "scrollbar"; "required": false; }; "scrollbarOptions": { "alias": "scrollbarOptions"; "required": false; }; }, {}, never, never, true, never>;
}
