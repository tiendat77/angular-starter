import * as i0 from '@angular/core';
import { InjectionToken, numberAttribute, EventEmitter, booleanAttribute, Component, ViewEncapsulation, ChangeDetectionStrategy, Optional, Inject, Input, Output, NgModule } from '@angular/core';
import { NgClass } from '@angular/common';
import * as i1 from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ReplaySubject } from 'rxjs';

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/** The default page size if there is no page size and there are no provided page size options. */
const DEFAULT_PAGE_SIZE = 10;
/** The default page size options if there are no provided page size options */
const DEFAULT_PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
/** Injection token that can be used to provide the default options for the paginator module. */
const PAGINATOR_DEFAULT_OPTIONS = new InjectionToken('PAGINATOR_DEFAULT_OPTIONS');
let nextUniqueId = 0;
/**
 * Component to provide navigation between paged information. Displays the size of the current
 * page, user-selectable options to change that size, what items are being shown, and
 * navigational button to go to the previous or next page.
 */
class Paginator {
    _changeDetectorRef;
    /** ID for the DOM node containing the paginator's items per page label. */
    _pageSizeLabelId = `paginator-page-size-label-${nextUniqueId++}`;
    _isInitialized = false;
    _initializedStream = new ReplaySubject(1);
    /** The zero-based page index of the displayed list of items. Defaulted to 0. */
    get pageIndex() {
        return this._pageIndex;
    }
    set pageIndex(value) {
        this._pageIndex = Math.max(value || 1, 1);
        this._pages = this._calcPages();
        this._changeDetectorRef.markForCheck();
    }
    _pageIndex = 1;
    /** The length of the total number of items that are being paginated. Defaulted to 0. */
    get length() {
        return this._length;
    }
    set length(value) {
        this._length = value || 0;
        this._pages = this._calcPages();
        this._changeDetectorRef.markForCheck();
    }
    _length = 0;
    /** Number of items to display on a page. By default set to 50. */
    get pageSize() {
        return this._pageSize;
    }
    set pageSize(value) {
        this._pageSize = Math.max(value || 0, 0);
        this._pages = this._calcPages();
        this._updateDisplayedPageSizeOptions();
    }
    _pageSize;
    /** The set of provided page size options to display to the user. */
    get pageSizeOptions() {
        return this._pageSizeOptions;
    }
    set pageSizeOptions(value) {
        this._pageSizeOptions = (value || []).map((p) => numberAttribute(p, 0));
        this._pages = this._calcPages();
        this._updateDisplayedPageSizeOptions();
    }
    _pageSizeOptions = [];
    /** Hide the paginator if page size <= 1 */
    autoHide = true;
    /** Whether to hide the total data record UI from the user. */
    hideTotal = true;
    /** Whether to hide the page size selection UI from the user. */
    hidePageSize = false;
    /** Whether to show the first/last buttons UI to the user. */
    showFirstLastButtons = false;
    /** Whether the paginator is disabled. */
    disabled = false;
    /** Event emitted when the paginator changes the page size or page index. */
    page = new EventEmitter();
    /** Array of Page objects to use in the paginator controls. */
    _pages = [];
    /** Displayed set of page size options. Will be sorted and include current page size. */
    _displayedPageSizeOptions;
    /** Emits when the paginator is initialized. */
    initialized = this._initializedStream;
    constructor(_changeDetectorRef, defaults) {
        this._changeDetectorRef = _changeDetectorRef;
        if (defaults) {
            const { pageSize, pageSizeOptions, hidePageSize, showFirstLastButtons } = defaults;
            if (pageSize != null) {
                this._pageSize = pageSize;
            }
            if (pageSizeOptions != null) {
                this._pageSizeOptions = pageSizeOptions;
            }
            if (hidePageSize != null) {
                this.hidePageSize = hidePageSize;
            }
            if (showFirstLastButtons != null) {
                this.showFirstLastButtons = showFirstLastButtons;
            }
        }
        else {
            this._pageSize = DEFAULT_PAGE_SIZE;
            this._pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS;
        }
    }
    ngOnInit() {
        this._isInitialized = true;
        this._updateDisplayedPageSizeOptions();
        this._initializedStream.next();
    }
    ngOnDestroy() {
        this._initializedStream.complete();
    }
    /** Jump to a specific page index. */
    selectPage(pageIndex) {
        if (pageIndex >= 0 && pageIndex <= this.getNumberOfPages() && pageIndex !== this.pageIndex) {
            const previousPageIndex = this.pageIndex;
            this.pageIndex = pageIndex;
            this._emitPageEvent(previousPageIndex);
        }
    }
    /** Advances to the next page if it exists. */
    nextPage() {
        if (!this.hasNextPage()) {
            return;
        }
        const previousPageIndex = this.pageIndex;
        this.pageIndex = this.pageIndex + 1;
        this._emitPageEvent(previousPageIndex);
    }
    /** Move back to the previous page if it exists. */
    previousPage() {
        if (!this.hasPreviousPage()) {
            return;
        }
        const previousPageIndex = this.pageIndex;
        this.pageIndex = this.pageIndex - 1;
        this._emitPageEvent(previousPageIndex);
    }
    /** Move to the first page if not already there. */
    firstPage() {
        // hasPreviousPage being false implies at the start
        if (!this.hasPreviousPage()) {
            return;
        }
        const previousPageIndex = this.pageIndex;
        this.pageIndex = 1;
        this._emitPageEvent(previousPageIndex);
    }
    /** Move to the last page if not already there. */
    lastPage() {
        // hasNextPage being false implies at the end
        if (!this.hasNextPage()) {
            return;
        }
        const previousPageIndex = this.pageIndex;
        this.pageIndex = this.getNumberOfPages();
        this._emitPageEvent(previousPageIndex);
    }
    /** Whether there is a previous page. */
    hasPreviousPage() {
        return this.pageIndex >= 2 && this.pageSize != 0;
    }
    /** Whether there is a next page. */
    hasNextPage() {
        const maxPageIndex = this.getNumberOfPages();
        return this.pageIndex < maxPageIndex && this.pageSize != 0;
    }
    /** Calculate the number of pages */
    getNumberOfPages() {
        if (!this.pageSize) {
            return 0;
        }
        return Math.ceil(this.length / this.pageSize);
    }
    /**
     * Changes the page size so that the first item displayed on the page will still be
     * displayed using the new page size.
     *
     * For example, if the page size is 10 and on the second page (items indexed 10-19) then
     * switching so that the page size is 5 will set the third page as the current page so
     * that the 10th item will still be displayed.
     */
    _changePageSize(pageSize) {
        const previousPageIndex = this.pageIndex;
        this.pageIndex = 1;
        this.pageSize = pageSize;
        this._emitPageEvent(previousPageIndex);
    }
    /** Checks whether the buttons for going forwards should be disabled. */
    _nextButtonsDisabled() {
        return this.disabled || !this.hasNextPage();
    }
    /** Checks whether the buttons for going backwards should be disabled. */
    _previousButtonsDisabled() {
        return this.disabled || !this.hasPreviousPage();
    }
    /**
     * Updates the list of page size options to display to the user. Includes making sure that
     * the page size is an option and that the list is sorted.
     */
    _updateDisplayedPageSizeOptions() {
        if (!this._isInitialized) {
            return;
        }
        // If no page size is provided, use the first page size option or the default page size.
        if (!this.pageSize) {
            this._pageSize =
                this.pageSizeOptions.length != 0 ? this.pageSizeOptions[0] : DEFAULT_PAGE_SIZE;
        }
        this._displayedPageSizeOptions = this.pageSizeOptions.slice();
        if (this._displayedPageSizeOptions.indexOf(this.pageSize) === -1) {
            this._displayedPageSizeOptions.push(this.pageSize);
        }
        // Sort the numbers using a number-specific sort function.
        this._displayedPageSizeOptions.sort((a, b) => a - b);
        this._changeDetectorRef.markForCheck();
    }
    /** Emits an event notifying that a change of the paginator's properties has been triggered. */
    _emitPageEvent(previousPageIndex) {
        this.page.emit({
            previousPageIndex: previousPageIndex + 1,
            pageIndex: this.pageIndex,
            pageSize: this.pageSize,
        });
    }
    _calcPages(pageIndex) {
        const pages = [];
        const totalPages = this.getNumberOfPages();
        let startPage = 1;
        let endPage = totalPages;
        const maxSize = 5;
        const isMaxSized = maxSize < totalPages;
        pageIndex = pageIndex || this.pageIndex;
        if (isMaxSized) {
            startPage = pageIndex - Math.floor(maxSize / 2);
            endPage = pageIndex + Math.floor(maxSize / 2);
            if (startPage < 1) {
                startPage = 1;
                endPage = Math.min(startPage + maxSize - 1, totalPages);
            }
            else if (endPage > totalPages) {
                startPage = Math.max(totalPages - maxSize + 1, 1);
                endPage = totalPages;
            }
        }
        for (let num = startPage; num <= endPage; num++) {
            pages.push({
                number: num,
                text: '' + num,
            });
        }
        return pages;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.13", ngImport: i0, type: Paginator, deps: [{ token: i0.ChangeDetectorRef }, { token: PAGINATOR_DEFAULT_OPTIONS, optional: true }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "18.2.13", type: Paginator, isStandalone: true, selector: "paginator", inputs: { pageIndex: ["pageIndex", "pageIndex", numberAttribute], length: ["length", "length", numberAttribute], pageSize: ["pageSize", "pageSize", numberAttribute], pageSizeOptions: "pageSizeOptions", autoHide: ["autoHide", "autoHide", booleanAttribute], hideTotal: ["hideTotal", "hideTotal", booleanAttribute], hidePageSize: ["hidePageSize", "hidePageSize", booleanAttribute], showFirstLastButtons: ["showFirstLastButtons", "showFirstLastButtons", booleanAttribute], disabled: ["disabled", "disabled", booleanAttribute] }, outputs: { page: "page" }, host: { attributes: { "role": "group" }, properties: { "class.hidden": "autoHide && _pages.length < 1" }, classAttribute: "pl-4 pr-4 pt-3 pb-3 flex items-center justify-end border-t" }, exportAs: ["paginator"], ngImport: i0, template: "<div class=\"flex gap-3\">\n  @if (!hidePageSize) {\n    <div class=\"flex gap-2\">\n      <div class=\"label\">\n        <span class=\"whitespace-nowrap text-base\">Page size: </span>\n      </div>\n\n      @if (_displayedPageSizeOptions.length > 1) {\n        <select\n          class=\"min-w-22 select select-bordered w-full max-w-xs\"\n          [disabled]=\"disabled\"\n          [ngModel]=\"pageSize\"\n          (ngModelChange)=\"_changePageSize($event)\"\n        >\n          @for (pageSizeOption of _displayedPageSizeOptions; track pageSizeOption) {\n            <option [value]=\"pageSizeOption\">\n              {{ pageSizeOption }}\n            </option>\n          }\n        </select>\n      }\n    </div>\n\n    @if (_displayedPageSizeOptions.length <= 1) {\n      <div class=\"label\">\n        <span class=\"whitespace-nowrap text-base\">\n          {{ pageSize }}\n        </span>\n      </div>\n    }\n  }\n\n  <div class=\"join\">\n    <!-- Previous Page Button -->\n    @if (showFirstLastButtons) {\n      <button\n        class=\"btn btn-circle join-item\"\n        [disabled]=\"_previousButtonsDisabled()\"\n        (click)=\"firstPage()\"\n      >\n        <svg\n          xmlns=\"http://www.w3.org/2000/svg\"\n          fill=\"none\"\n          viewBox=\"0 0 24 24\"\n          stroke-width=\"2\"\n          stroke=\"currentColor\"\n          class=\"h-6 w-6\"\n        >\n          <path\n            stroke-linecap=\"round\"\n            stroke-linejoin=\"round\"\n            d=\"m18.75 4.5-7.5 7.5 7.5 7.5m-6-15L5.25 12l7.5 7.5\"\n          />\n        </svg>\n      </button>\n    }\n    <button\n      class=\"btn btn-circle join-item\"\n      [disabled]=\"_previousButtonsDisabled()\"\n      (click)=\"previousPage()\"\n    >\n      <svg\n        xmlns=\"http://www.w3.org/2000/svg\"\n        viewBox=\"0 0 24 24\"\n        fill=\"currentColor\"\n        class=\"h-6 w-6\"\n      >\n        <path\n          fill-rule=\"evenodd\"\n          d=\"M7.72 12.53a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 1 1 1.06 1.06L9.31 12l6.97 6.97a.75.75 0 1 1-1.06 1.06l-7.5-7.5Z\"\n          clip-rule=\"evenodd\"\n        />\n      </svg>\n    </button>\n\n    <!-- Page Buttons -->\n    @for (page of _pages; track page.number) {\n      <button\n        class=\"btn join-item\"\n        [ngClass]=\"{ 'btn-primary': page.number === pageIndex }\"\n        (click)=\"selectPage(page.number)\"\n      >\n        {{ page.text }}\n      </button>\n    }\n\n    <!-- Next Page Button -->\n    <button\n      class=\"btn btn-circle join-item\"\n      [disabled]=\"_nextButtonsDisabled()\"\n      (click)=\"nextPage()\"\n    >\n      <svg\n        xmlns=\"http://www.w3.org/2000/svg\"\n        viewBox=\"0 0 24 24\"\n        fill=\"currentColor\"\n        class=\"h-6 w-6\"\n      >\n        <path\n          fill-rule=\"evenodd\"\n          d=\"M16.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 0 1 1.06-1.06l7.5 7.5Z\"\n          clip-rule=\"evenodd\"\n        />\n      </svg>\n    </button>\n\n    @if (showFirstLastButtons) {\n      <button\n        class=\"btn btn-circle join-item\"\n        [disabled]=\"_nextButtonsDisabled()\"\n        (click)=\"nextPage()\"\n      >\n        <svg\n          xmlns=\"http://www.w3.org/2000/svg\"\n          viewBox=\"0 0 24 24\"\n          fill=\"currentColor\"\n          class=\"h-6 w-6\"\n        >\n          <path\n            fill-rule=\"evenodd\"\n            d=\"M13.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06-1.06L11.69 12 4.72 5.03a.75.75 0 0 1 1.06-1.06l7.5 7.5Z\"\n            clip-rule=\"evenodd\"\n          />\n          <path\n            fill-rule=\"evenodd\"\n            d=\"M19.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 1 1-1.06-1.06L17.69 12l-6.97-6.97a.75.75 0 0 1 1.06-1.06l7.5 7.5Z\"\n            clip-rule=\"evenodd\"\n          />\n        </svg>\n      </button>\n    }\n  </div>\n</div>\n", dependencies: [{ kind: "directive", type: NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }, { kind: "ngmodule", type: FormsModule }, { kind: "directive", type: i1.NgSelectOption, selector: "option", inputs: ["ngValue", "value"] }, { kind: "directive", type: i1.ɵNgSelectMultipleOption, selector: "option", inputs: ["ngValue", "value"] }, { kind: "directive", type: i1.SelectControlValueAccessor, selector: "select:not([multiple])[formControlName],select:not([multiple])[formControl],select:not([multiple])[ngModel]", inputs: ["compareWith"] }, { kind: "directive", type: i1.NgControlStatus, selector: "[formControlName],[ngModel],[formControl]" }, { kind: "directive", type: i1.NgModel, selector: "[ngModel]:not([formControlName]):not([formControl])", inputs: ["name", "disabled", "ngModel", "ngModelOptions"], outputs: ["ngModelChange"], exportAs: ["ngModel"] }, { kind: "ngmodule", type: ReactiveFormsModule }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.13", ngImport: i0, type: Paginator, decorators: [{
            type: Component,
            args: [{ standalone: true, selector: 'paginator', exportAs: 'paginator', host: {
                        role: 'group',
                        '[class.hidden]': 'autoHide && _pages.length < 1',
                        class: 'pl-4 pr-4 pt-3 pb-3 flex items-center justify-end border-t',
                    }, encapsulation: ViewEncapsulation.None, changeDetection: ChangeDetectionStrategy.OnPush, imports: [NgClass, FormsModule, ReactiveFormsModule], template: "<div class=\"flex gap-3\">\n  @if (!hidePageSize) {\n    <div class=\"flex gap-2\">\n      <div class=\"label\">\n        <span class=\"whitespace-nowrap text-base\">Page size: </span>\n      </div>\n\n      @if (_displayedPageSizeOptions.length > 1) {\n        <select\n          class=\"min-w-22 select select-bordered w-full max-w-xs\"\n          [disabled]=\"disabled\"\n          [ngModel]=\"pageSize\"\n          (ngModelChange)=\"_changePageSize($event)\"\n        >\n          @for (pageSizeOption of _displayedPageSizeOptions; track pageSizeOption) {\n            <option [value]=\"pageSizeOption\">\n              {{ pageSizeOption }}\n            </option>\n          }\n        </select>\n      }\n    </div>\n\n    @if (_displayedPageSizeOptions.length <= 1) {\n      <div class=\"label\">\n        <span class=\"whitespace-nowrap text-base\">\n          {{ pageSize }}\n        </span>\n      </div>\n    }\n  }\n\n  <div class=\"join\">\n    <!-- Previous Page Button -->\n    @if (showFirstLastButtons) {\n      <button\n        class=\"btn btn-circle join-item\"\n        [disabled]=\"_previousButtonsDisabled()\"\n        (click)=\"firstPage()\"\n      >\n        <svg\n          xmlns=\"http://www.w3.org/2000/svg\"\n          fill=\"none\"\n          viewBox=\"0 0 24 24\"\n          stroke-width=\"2\"\n          stroke=\"currentColor\"\n          class=\"h-6 w-6\"\n        >\n          <path\n            stroke-linecap=\"round\"\n            stroke-linejoin=\"round\"\n            d=\"m18.75 4.5-7.5 7.5 7.5 7.5m-6-15L5.25 12l7.5 7.5\"\n          />\n        </svg>\n      </button>\n    }\n    <button\n      class=\"btn btn-circle join-item\"\n      [disabled]=\"_previousButtonsDisabled()\"\n      (click)=\"previousPage()\"\n    >\n      <svg\n        xmlns=\"http://www.w3.org/2000/svg\"\n        viewBox=\"0 0 24 24\"\n        fill=\"currentColor\"\n        class=\"h-6 w-6\"\n      >\n        <path\n          fill-rule=\"evenodd\"\n          d=\"M7.72 12.53a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 1 1 1.06 1.06L9.31 12l6.97 6.97a.75.75 0 1 1-1.06 1.06l-7.5-7.5Z\"\n          clip-rule=\"evenodd\"\n        />\n      </svg>\n    </button>\n\n    <!-- Page Buttons -->\n    @for (page of _pages; track page.number) {\n      <button\n        class=\"btn join-item\"\n        [ngClass]=\"{ 'btn-primary': page.number === pageIndex }\"\n        (click)=\"selectPage(page.number)\"\n      >\n        {{ page.text }}\n      </button>\n    }\n\n    <!-- Next Page Button -->\n    <button\n      class=\"btn btn-circle join-item\"\n      [disabled]=\"_nextButtonsDisabled()\"\n      (click)=\"nextPage()\"\n    >\n      <svg\n        xmlns=\"http://www.w3.org/2000/svg\"\n        viewBox=\"0 0 24 24\"\n        fill=\"currentColor\"\n        class=\"h-6 w-6\"\n      >\n        <path\n          fill-rule=\"evenodd\"\n          d=\"M16.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 0 1 1.06-1.06l7.5 7.5Z\"\n          clip-rule=\"evenodd\"\n        />\n      </svg>\n    </button>\n\n    @if (showFirstLastButtons) {\n      <button\n        class=\"btn btn-circle join-item\"\n        [disabled]=\"_nextButtonsDisabled()\"\n        (click)=\"nextPage()\"\n      >\n        <svg\n          xmlns=\"http://www.w3.org/2000/svg\"\n          viewBox=\"0 0 24 24\"\n          fill=\"currentColor\"\n          class=\"h-6 w-6\"\n        >\n          <path\n            fill-rule=\"evenodd\"\n            d=\"M13.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06-1.06L11.69 12 4.72 5.03a.75.75 0 0 1 1.06-1.06l7.5 7.5Z\"\n            clip-rule=\"evenodd\"\n          />\n          <path\n            fill-rule=\"evenodd\"\n            d=\"M19.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 1 1-1.06-1.06L17.69 12l-6.97-6.97a.75.75 0 0 1 1.06-1.06l7.5 7.5Z\"\n            clip-rule=\"evenodd\"\n          />\n        </svg>\n      </button>\n    }\n  </div>\n</div>\n" }]
        }], ctorParameters: () => [{ type: i0.ChangeDetectorRef }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [PAGINATOR_DEFAULT_OPTIONS]
                }] }], propDecorators: { pageIndex: [{
                type: Input,
                args: [{ transform: numberAttribute }]
            }], length: [{
                type: Input,
                args: [{ transform: numberAttribute }]
            }], pageSize: [{
                type: Input,
                args: [{ transform: numberAttribute }]
            }], pageSizeOptions: [{
                type: Input
            }], autoHide: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], hideTotal: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], hidePageSize: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], showFirstLastButtons: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], disabled: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], page: [{
                type: Output
            }] } });

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
class PaginatorModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.13", ngImport: i0, type: PaginatorModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "18.2.13", ngImport: i0, type: PaginatorModule, imports: [Paginator], exports: [Paginator] });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "18.2.13", ngImport: i0, type: PaginatorModule, imports: [Paginator] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.13", ngImport: i0, type: PaginatorModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [Paginator],
                    exports: [Paginator],
                }]
        }] });

/*
 * Public API Surface of paginator
 */

/**
 * Generated bundle index. Do not edit.
 */

export { PAGINATOR_DEFAULT_OPTIONS, Paginator, PaginatorModule };
//# sourceMappingURL=libs-paginator.mjs.map
