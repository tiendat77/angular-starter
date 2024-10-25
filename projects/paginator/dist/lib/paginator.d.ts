/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ChangeDetectorRef, EventEmitter, InjectionToken, OnDestroy, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { PageEvent, Pager, PaginatorDefaultOptions } from './interface';
import * as i0 from "@angular/core";
/** Injection token that can be used to provide the default options for the paginator module. */
export declare const PAGINATOR_DEFAULT_OPTIONS: InjectionToken<PaginatorDefaultOptions>;
/**
 * Component to provide navigation between paged information. Displays the size of the current
 * page, user-selectable options to change that size, what items are being shown, and
 * navigational button to go to the previous or next page.
 */
export declare class Paginator implements OnInit, OnDestroy {
    private _changeDetectorRef;
    /** ID for the DOM node containing the paginator's items per page label. */
    readonly _pageSizeLabelId: string;
    private _isInitialized;
    private _initializedStream;
    /** The zero-based page index of the displayed list of items. Defaulted to 0. */
    get pageIndex(): number;
    set pageIndex(value: number);
    private _pageIndex;
    /** The length of the total number of items that are being paginated. Defaulted to 0. */
    get length(): number;
    set length(value: number);
    private _length;
    /** Number of items to display on a page. By default set to 50. */
    get pageSize(): number;
    set pageSize(value: number);
    private _pageSize;
    /** The set of provided page size options to display to the user. */
    get pageSizeOptions(): number[];
    set pageSizeOptions(value: number[] | readonly number[]);
    private _pageSizeOptions;
    /** Hide the paginator if page size <= 1 */
    autoHide: boolean;
    /** Whether to hide the total data record UI from the user. */
    hideTotal: boolean;
    /** Whether to hide the page size selection UI from the user. */
    hidePageSize: boolean;
    /** Whether to show the first/last buttons UI to the user. */
    showFirstLastButtons: boolean;
    /** Whether the paginator is disabled. */
    disabled: boolean;
    /** Event emitted when the paginator changes the page size or page index. */
    readonly page: EventEmitter<PageEvent>;
    /** Array of Page objects to use in the paginator controls. */
    _pages: Pager[];
    /** Displayed set of page size options. Will be sorted and include current page size. */
    _displayedPageSizeOptions: number[];
    /** Emits when the paginator is initialized. */
    initialized: Observable<void>;
    constructor(_changeDetectorRef: ChangeDetectorRef, defaults?: PaginatorDefaultOptions);
    ngOnInit(): void;
    ngOnDestroy(): void;
    /** Jump to a specific page index. */
    selectPage(pageIndex: number): void;
    /** Advances to the next page if it exists. */
    nextPage(): void;
    /** Move back to the previous page if it exists. */
    previousPage(): void;
    /** Move to the first page if not already there. */
    firstPage(): void;
    /** Move to the last page if not already there. */
    lastPage(): void;
    /** Whether there is a previous page. */
    hasPreviousPage(): boolean;
    /** Whether there is a next page. */
    hasNextPage(): boolean;
    /** Calculate the number of pages */
    getNumberOfPages(): number;
    /**
     * Changes the page size so that the first item displayed on the page will still be
     * displayed using the new page size.
     *
     * For example, if the page size is 10 and on the second page (items indexed 10-19) then
     * switching so that the page size is 5 will set the third page as the current page so
     * that the 10th item will still be displayed.
     */
    _changePageSize(pageSize: number): void;
    /** Checks whether the buttons for going forwards should be disabled. */
    _nextButtonsDisabled(): boolean;
    /** Checks whether the buttons for going backwards should be disabled. */
    _previousButtonsDisabled(): boolean;
    /**
     * Updates the list of page size options to display to the user. Includes making sure that
     * the page size is an option and that the list is sorted.
     */
    private _updateDisplayedPageSizeOptions;
    /** Emits an event notifying that a change of the paginator's properties has been triggered. */
    private _emitPageEvent;
    private _calcPages;
    static ɵfac: i0.ɵɵFactoryDeclaration<Paginator, [null, { optional: true; }]>;
    static ɵcmp: i0.ɵɵComponentDeclaration<Paginator, "paginator", ["paginator"], { "pageIndex": { "alias": "pageIndex"; "required": false; }; "length": { "alias": "length"; "required": false; }; "pageSize": { "alias": "pageSize"; "required": false; }; "pageSizeOptions": { "alias": "pageSizeOptions"; "required": false; }; "autoHide": { "alias": "autoHide"; "required": false; }; "hideTotal": { "alias": "hideTotal"; "required": false; }; "hidePageSize": { "alias": "hidePageSize"; "required": false; }; "showFirstLastButtons": { "alias": "showFirstLastButtons"; "required": false; }; "disabled": { "alias": "disabled"; "required": false; }; }, { "page": "page"; }, never, never, true, never>;
    static ngAcceptInputType_pageIndex: unknown;
    static ngAcceptInputType_length: unknown;
    static ngAcceptInputType_pageSize: unknown;
    static ngAcceptInputType_autoHide: unknown;
    static ngAcceptInputType_hideTotal: unknown;
    static ngAcceptInputType_hidePageSize: unknown;
    static ngAcceptInputType_showFirstLastButtons: unknown;
    static ngAcceptInputType_disabled: unknown;
}
