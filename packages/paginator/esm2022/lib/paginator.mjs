/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Inject, InjectionToken, Input, Optional, Output, ViewEncapsulation, booleanAttribute, numberAttribute, } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ReplaySubject } from 'rxjs';
import * as i0 from "@angular/core";
import * as i1 from "@angular/forms";
/** The default page size if there is no page size and there are no provided page size options. */
const DEFAULT_PAGE_SIZE = 10;
/** The default page size options if there are no provided page size options */
const DEFAULT_PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
/** Injection token that can be used to provide the default options for the paginator module. */
export const PAGINATOR_DEFAULT_OPTIONS = new InjectionToken('PAGINATOR_DEFAULT_OPTIONS');
let nextUniqueId = 0;
/**
 * Component to provide navigation between paged information. Displays the size of the current
 * page, user-selectable options to change that size, what items are being shown, and
 * navigational button to go to the previous or next page.
 */
export class Paginator {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFnaW5hdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vbGlicy9wYWdpbmF0b3Ivc3JjL2xpYi9wYWdpbmF0b3IudHMiLCIuLi8uLi8uLi8uLi9saWJzL3BhZ2luYXRvci9zcmMvbGliL3BhZ2luYXRvci5odG1sIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUMxQyxPQUFPLEVBQ0wsdUJBQXVCLEVBRXZCLFNBQVMsRUFDVCxZQUFZLEVBQ1osTUFBTSxFQUNOLGNBQWMsRUFDZCxLQUFLLEVBR0wsUUFBUSxFQUNSLE1BQU0sRUFDTixpQkFBaUIsRUFDakIsZ0JBQWdCLEVBQ2hCLGVBQWUsR0FDaEIsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFFLFdBQVcsRUFBRSxtQkFBbUIsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBRWxFLE9BQU8sRUFBYyxhQUFhLEVBQUUsTUFBTSxNQUFNLENBQUM7OztBQUdqRCxrR0FBa0c7QUFDbEcsTUFBTSxpQkFBaUIsR0FBRyxFQUFFLENBQUM7QUFFN0IsK0VBQStFO0FBQy9FLE1BQU0seUJBQXlCLEdBQUcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQztBQUVwRCxnR0FBZ0c7QUFDaEcsTUFBTSxDQUFDLE1BQU0seUJBQXlCLEdBQUcsSUFBSSxjQUFjLENBQ3pELDJCQUEyQixDQUM1QixDQUFDO0FBRUYsSUFBSSxZQUFZLEdBQUcsQ0FBQyxDQUFDO0FBRXJCOzs7O0dBSUc7QUFlSCxNQUFNLE9BQU8sU0FBUztJQW1GVjtJQWxGViwyRUFBMkU7SUFDbEUsZ0JBQWdCLEdBQUcsNkJBQTZCLFlBQVksRUFBRSxFQUFFLENBQUM7SUFFbEUsY0FBYyxHQUFHLEtBQUssQ0FBQztJQUN2QixrQkFBa0IsR0FBRyxJQUFJLGFBQWEsQ0FBTyxDQUFDLENB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QixFQUFFO2dCQUdFLFFBQVE7c0JBQS9DLEtBQUs7dUJBQUMsRUFBRSxTQUFTLEVBQUUsZ0JBQWdCLEVBQUU7Z0JBR25CLElBQUk7c0JBQXRCLE1BQU0iLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHsgTmdDbGFzcyB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQge1xuICBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSxcbiAgQ2hhbmdlRGV0ZWN0b3JSZWYsXG4gIENvbXBvbmVudCxcbiAgRXZlbnRFbWl0dGVyLFxuICBJbmplY3QsXG4gIEluamVjdGlvblRva2VuLFxuICBJbnB1dCxcbiAgT25EZXN0cm95LFxuICBPbkluaXQsXG4gIE9wdGlvbmFsLFxuICBPdXRwdXQsXG4gIFZpZXdFbmNhcHN1bGF0aW9uLFxuICBib29sZWFuQXR0cmlidXRlLFxuICBudW1iZXJBdHRyaWJ1dGUsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgRm9ybXNNb2R1bGUsIFJlYWN0aXZlRm9ybXNNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9mb3Jtcyc7XG5cbmltcG9ydCB7IE9ic2VydmFibGUsIFJlcGxheVN1YmplY3QgfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IFBhZ2VFdmVudCwgUGFnZXIsIFBhZ2luYXRvckRlZmF1bHRPcHRpb25zIH0gZnJvbSAnLi9pbnRlcmZhY2UnO1xuXG4vKiogVGhlIGRlZmF1bHQgcGFnZSBzaXplIGlmIHRoZXJlIGlzIG5vIHBhZ2Ugc2l6ZSBhbmQgdGhlcmUgYXJlIG5vIHByb3ZpZGVkIHBhZ2Ugc2l6ZSBvcHRpb25zLiAqL1xuY29uc3QgREVGQVVMVF9QQUdFX1NJWkUgPSAxMDtcblxuLyoqIFRoZSBkZWZhdWx0IHBhZ2Ugc2l6ZSBvcHRpb25zIGlmIHRoZXJlIGFyZSBubyBwcm92aWRlZCBwYWdlIHNpemUgb3B0aW9ucyAqL1xuY29uc3QgREVGQVVMVF9QQUdFX1NJWkVfT1BUSU9OUyA9IFsxMCwgMjUsIDUwLCAxMDBdO1xuXG4vKiogSW5qZWN0aW9uIHRva2VuIHRoYXQgY2FuIGJlIHVzZWQgdG8gcHJvdmlkZSB0aGUgZGVmYXVsdCBvcHRpb25zIGZvciB0aGUgcGFnaW5hdG9yIG1vZHVsZS4gKi9cbmV4cG9ydCBjb25zdCBQQUdJTkFUT1JfREVGQVVMVF9PUFRJT05TID0gbmV3IEluamVjdGlvblRva2VuPFBhZ2luYXRvckRlZmF1bHRPcHRpb25zPihcbiAgJ1BBR0lOQVRPUl9ERUZBVUxUX09QVElPTlMnXG4pO1xuXG5sZXQgbmV4dFVuaXF1ZUlkID0gMDtcblxuLyoqXG4gKiBDb21wb25lbnQgdG8gcHJvdmlkZSBuYXZpZ2F0aW9uIGJldHdlZW4gcGFnZWQgaW5mb3JtYXRpb24uIERpc3BsYXlzIHRoZSBzaXplIG9mIHRoZSBjdXJyZW50XG4gKiBwYWdlLCB1c2VyLXNlbGVjdGFibGUgb3B0aW9ucyB0byBjaGFuZ2UgdGhhdCBzaXplLCB3aGF0IGl0ZW1zIGFyZSBiZWluZyBzaG93biwgYW5kXG4gKiBuYXZpZ2F0aW9uYWwgYnV0dG9uIHRvIGdvIHRvIHRoZSBwcmV2aW91cyBvciBuZXh0IHBhZ2UuXG4gKi9cbkBDb21wb25lbnQoe1xuICBzdGFuZGFsb25lOiB0cnVlLFxuICBzZWxlY3RvcjogJ3BhZ2luYXRvcicsXG4gIGV4cG9ydEFzOiAncGFnaW5hdG9yJyxcbiAgdGVtcGxhdGVVcmw6ICdwYWdpbmF0b3IuaHRtbCcsXG4gIGhvc3Q6IHtcbiAgICByb2xlOiAnZ3JvdXAnLFxuICAgICdbY2xhc3MuaGlkZGVuXSc6ICdhdXRvSGlkZSAmJiBfcGFnZXMubGVuZ3RoIDwgMScsXG4gICAgY2xhc3M6ICdwbC00IHByLTQgcHQtMyBwYi0zIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktZW5kIGJvcmRlci10JyxcbiAgfSxcbiAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24uTm9uZSxcbiAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5PblB1c2gsXG4gIGltcG9ydHM6IFtOZ0NsYXNzLCBGb3Jtc01vZHVsZSwgUmVhY3RpdmVGb3Jtc01vZHVsZV0sXG59KVxuZXhwb3J0IGNsYXNzIFBhZ2luYXRvciBpbXBsZW1lbnRzIE9uSW5pdCwgT25EZXN0cm95IHtcbiAgLyoqIElEIGZvciB0aGUgRE9NIG5vZGUgY29udGFpbmluZyB0aGUgcGFnaW5hdG9yJ3MgaXRlbXMgcGVyIHBhZ2UgbGFiZWwuICovXG4gIHJlYWRvbmx5IF9wYWdlU2l6ZUxhYmVsSWQgPSBgcGFnaW5hdG9yLXBhZ2Utc2l6ZS1sYWJlbC0ke25leHRVbmlxdWVJZCsrfWA7XG5cbiAgcHJpdmF0ZSBfaXNJbml0aWFsaXplZCA9IGZhbHNlO1xuICBwcml2YXRlIF9pbml0aWFsaXplZFN0cmVhbSA9IG5ldyBSZXBsYXlTdWJqZWN0PHZvaWQ+KDEpO1xuXG4gIC8qKiBUaGUgemVyby1iYXNlZCBwYWdlIGluZGV4IG9mIHRoZSBkaXNwbGF5ZWQgbGlzdCBvZiBpdGVtcy4gRGVmYXVsdGVkIHRvIDAuICovXG4gIEBJbnB1dCh7IHRyYW5zZm9ybTogbnVtYmVyQXR0cmlidXRlIH0pXG4gIGdldCBwYWdlSW5kZXgoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fcGFnZUluZGV4O1xuICB9XG4gIHNldCBwYWdlSW5kZXgodmFsdWU6IG51bWJlcikge1xuICAgIHRoaXMuX3BhZ2VJbmRleCA9IE1hdGgubWF4KHZhbHVlIHx8IDEsIDEpO1xuICAgIHRoaXMuX3BhZ2VzID0gdGhpcy5fY2FsY1BhZ2VzKCk7XG4gICAgdGhpcy5fY2hhbmdlRGV0ZWN0b3JSZWYubWFya0ZvckNoZWNrKCk7XG4gIH1cbiAgcHJpdmF0ZSBfcGFnZUluZGV4ID0gMTtcblxuICAvKiogVGhlIGxlbmd0aCBvZiB0aGUgdG90YWwgbnVtYmVyIG9mIGl0ZW1zIHRoYXQgYXJlIGJlaW5nIHBhZ2luYXRlZC4gRGVmYXVsdGVkIHRvIDAuICovXG4gIEBJbnB1dCh7IHRyYW5zZm9ybTogbnVtYmVyQXR0cmlidXRlIH0pXG4gIGdldCBsZW5ndGgoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fbGVuZ3RoO1xuICB9XG4gIHNldCBsZW5ndGgodmFsdWU6IG51bWJlcikge1xuICAgIHRoaXMuX2xlbmd0aCA9IHZhbHVlIHx8IDA7XG4gICAgdGhpcy5fcGFnZXMgPSB0aGlzLl9jYWxjUGFnZXMoKTtcbiAgICB0aGlzLl9jaGFuZ2VEZXRlY3RvclJlZi5tYXJrRm9yQ2hlY2soKTtcbiAgfVxuICBwcml2YXRlIF9sZW5ndGggPSAwO1xuXG4gIC8qKiBOdW1iZXIgb2YgaXRlbXMgdG8gZGlzcGxheSBvbiBhIHBhZ2UuIEJ5IGRlZmF1bHQgc2V0IHRvIDUwLiAqL1xuICBASW5wdXQoeyB0cmFuc2Zvcm06IG51bWJlckF0dHJpYnV0ZSB9KVxuICBnZXQgcGFnZVNpemUoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fcGFnZVNpemU7XG4gIH1cbiAgc2V0IHBhZ2VTaXplKHZhbHVlOiBudW1iZXIpIHtcbiAgICB0aGlzLl9wYWdlU2l6ZSA9IE1hdGgubWF4KHZhbHVlIHx8IDAsIDApO1xuICAgIHRoaXMuX3BhZ2VzID0gdGhpcy5fY2FsY1BhZ2VzKCk7XG4gICAgdGhpcy5fdXBkYXRlRGlzcGxheWVkUGFnZVNpemVPcHRpb25zKCk7XG4gIH1cbiAgcHJpdmF0ZSBfcGFnZVNpemU6IG51bWJlcjtcblxuICAvKiogVGhlIHNldCBvZiBwcm92aWRlZCBwYWdlIHNpemUgb3B0aW9ucyB0byBkaXNwbGF5IHRvIHRoZSB1c2VyLiAqL1xuICBASW5wdXQoKVxuICBnZXQgcGFnZVNpemVPcHRpb25zKCk6IG51bWJlcltdIHtcbiAgICByZXR1cm4gdGhpcy5fcGFnZVNpemVPcHRpb25zO1xuICB9XG4gIHNldCBwYWdlU2l6ZU9wdGlvbnModmFsdWU6IG51bWJlcltdIHwgcmVhZG9ubHkgbnVtYmVyW10pIHtcbiAgICB0aGlzLl9wYWdlU2l6ZU9wdGlvbnMgPSAodmFsdWUgfHwgKFtdIGFzIG51bWJlcltdKSkubWFwKChwKSA9PiBudW1iZXJBdHRyaWJ1dGUocCwgMCkpO1xuICAgIHRoaXMuX3BhZ2VzID0gdGhpcy5fY2FsY1BhZ2VzKCk7XG4gICAgdGhpcy5fdXBkYXRlRGlzcGxheWVkUGFnZVNpemVPcHRpb25zKCk7XG4gIH1cbiAgcHJpdmF0ZSBfcGFnZVNpemVPcHRpb25zOiBudW1iZXJbXSA9IFtdO1xuXG4gIC8qKiBIaWRlIHRoZSBwYWdpbmF0b3IgaWYgcGFnZSBzaXplIDw9IDEgKi9cbiAgQElucHV0KHsgdHJhbnNmb3JtOiBib29sZWFuQXR0cmlidXRlIH0pIGF1dG9IaWRlID0gdHJ1ZTtcblxuICAvKiogV2hldGhlciB0byBoaWRlIHRoZSB0b3RhbCBkYXRhIHJlY29yZCBVSSBmcm9tIHRoZSB1c2VyLiAqL1xuICBASW5wdXQoeyB0cmFuc2Zvcm06IGJvb2xlYW5BdHRyaWJ1dGUgfSkgaGlkZVRvdGFsID0gdHJ1ZTtcblxuICAvKiogV2hldGhlciB0byBoaWRlIHRoZSBwYWdlIHNpemUgc2VsZWN0aW9uIFVJIGZyb20gdGhlIHVzZXIuICovXG4gIEBJbnB1dCh7IHRyYW5zZm9ybTogYm9vbGVhbkF0dHJpYnV0ZSB9KSBoaWRlUGFnZVNpemUgPSBmYWxzZTtcblxuICAvKiogV2hldGhlciB0byBzaG93IHRoZSBmaXJzdC9sYXN0IGJ1dHRvbnMgVUkgdG8gdGhlIHVzZXIuICovXG4gIEBJbnB1dCh7IHRyYW5zZm9ybTogYm9vbGVhbkF0dHJpYnV0ZSB9KSBzaG93Rmlyc3RMYXN0QnV0dG9ucyA9IGZhbHNlO1xuXG4gIC8qKiBXaGV0aGVyIHRoZSBwYWdpbmF0b3IgaXMgZGlzYWJsZWQuICovXG4gIEBJbnB1dCh7IHRyYW5zZm9ybTogYm9vbGVhbkF0dHJpYnV0ZSB9KSBkaXNhYmxlZCA9IGZhbHNlO1xuXG4gIC8qKiBFdmVudCBlbWl0dGVkIHdoZW4gdGhlIHBhZ2luYXRvciBjaGFuZ2VzIHRoZSBwYWdlIHNpemUgb3IgcGFnZSBpbmRleC4gKi9cbiAgQE91dHB1dCgpIHJlYWRvbmx5IHBhZ2UgPSBuZXcgRXZlbnRFbWl0dGVyPFBhZ2VFdmVudD4oKTtcblxuICAvKiogQXJyYXkgb2YgUGFnZSBvYmplY3RzIHRvIHVzZSBpbiB0aGUgcGFnaW5hdG9yIGNvbnRyb2xzLiAqL1xuICBfcGFnZXM6IFBhZ2VyW10gPSBbXTtcblxuICAvKiogRGlzcGxheWVkIHNldCBvZiBwYWdlIHNpemUgb3B0aW9ucy4gV2lsbCBiZSBzb3J0ZWQgYW5kIGluY2x1ZGUgY3VycmVudCBwYWdlIHNpemUuICovXG4gIF9kaXNwbGF5ZWRQYWdlU2l6ZU9wdGlvbnM6IG51bWJlcltdO1xuXG4gIC8qKiBFbWl0cyB3aGVuIHRoZSBwYWdpbmF0b3IgaXMgaW5pdGlhbGl6ZWQuICovXG4gIGluaXRpYWxpemVkOiBPYnNlcnZhYmxlPHZvaWQ+ID0gdGhpcy5faW5pdGlhbGl6ZWRTdHJlYW07XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBfY2hhbmdlRGV0ZWN0b3JSZWY6IENoYW5nZURldGVjdG9yUmVmLFxuICAgIEBPcHRpb25hbCgpXG4gICAgQEluamVjdChQQUdJTkFUT1JfREVGQVVMVF9PUFRJT05TKVxuICAgIGRlZmF1bHRzPzogUGFnaW5hdG9yRGVmYXVsdE9wdGlvbnNcbiAgKSB7XG4gICAgaWYgKGRlZmF1bHRzKSB7XG4gICAgICBjb25zdCB7IHBhZ2VTaXplLCBwYWdlU2l6ZU9wdGlvbnMsIGhpZGVQYWdlU2l6ZSwgc2hvd0ZpcnN0TGFzdEJ1dHRvbnMgfSA9IGRlZmF1bHRzO1xuXG4gICAgICBpZiAocGFnZVNpemUgIT0gbnVsbCkge1xuICAgICAgICB0aGlzLl9wYWdlU2l6ZSA9IHBhZ2VTaXplO1xuICAgICAgfVxuXG4gICAgICBpZiAocGFnZVNpemVPcHRpb25zICE9IG51bGwpIHtcbiAgICAgICAgdGhpcy5fcGFnZVNpemVPcHRpb25zID0gcGFnZVNpemVPcHRpb25zO1xuICAgICAgfVxuXG4gICAgICBpZiAoaGlkZVBhZ2VTaXplICE9IG51bGwpIHtcbiAgICAgICAgdGhpcy5oaWRlUGFnZVNpemUgPSBoaWRlUGFnZVNpemU7XG4gICAgICB9XG5cbiAgICAgIGlmIChzaG93Rmlyc3RMYXN0QnV0dG9ucyAhPSBudWxsKSB7XG4gICAgICAgIHRoaXMuc2hvd0ZpcnN0TGFzdEJ1dHRvbnMgPSBzaG93Rmlyc3RMYXN0QnV0dG9ucztcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fcGFnZVNpemUgPSBERUZBVUxUX1BBR0VfU0laRTtcbiAgICAgIHRoaXMuX3BhZ2VTaXplT3B0aW9ucyA9IERFRkFVTFRfUEFHRV9TSVpFX09QVElPTlM7XG4gICAgfVxuICB9XG5cbiAgbmdPbkluaXQoKSB7XG4gICAgdGhpcy5faXNJbml0aWFsaXplZCA9IHRydWU7XG4gICAgdGhpcy5fdXBkYXRlRGlzcGxheWVkUGFnZVNpemVPcHRpb25zKCk7XG4gICAgdGhpcy5faW5pdGlhbGl6ZWRTdHJlYW0ubmV4dCgpO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgdGhpcy5faW5pdGlhbGl6ZWRTdHJlYW0uY29tcGxldGUoKTtcbiAgfVxuXG4gIC8qKiBKdW1wIHRvIGEgc3BlY2lmaWMgcGFnZSBpbmRleC4gKi9cbiAgc2VsZWN0UGFnZShwYWdlSW5kZXg6IG51bWJlcik6IHZvaWQge1xuICAgIGlmIChwYWdlSW5kZXggPj0gMCAmJiBwYWdlSW5kZXggPD0gdGhpcy5nZXROdW1iZXJPZlBhZ2VzKCkgJiYgcGFnZUluZGV4ICE9PSB0aGlzLnBhZ2VJbmRleCkge1xuICAgICAgY29uc3QgcHJldmlvdXNQYWdlSW5kZXggPSB0aGlzLnBhZ2VJbmRleDtcbiAgICAgIHRoaXMucGFnZUluZGV4ID0gcGFnZUluZGV4O1xuXG4gICAgICB0aGlzLl9lbWl0UGFnZUV2ZW50KHByZXZpb3VzUGFnZUluZGV4KTtcbiAgICB9XG4gIH1cblxuICAvKiogQWR2YW5jZXMgdG8gdGhlIG5leHQgcGFnZSBpZiBpdCBleGlzdHMuICovXG4gIG5leHRQYWdlKCk6IHZvaWQge1xuICAgIGlmICghdGhpcy5oYXNOZXh0UGFnZSgpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgcHJldmlvdXNQYWdlSW5kZXggPSB0aGlzLnBhZ2VJbmRleDtcbiAgICB0aGlzLnBhZ2VJbmRleCA9IHRoaXMucGFnZUluZGV4ICsgMTtcbiAgICB0aGlzLl9lbWl0UGFnZUV2ZW50KHByZXZpb3VzUGFnZUluZGV4KTtcbiAgfVxuXG4gIC8qKiBNb3ZlIGJhY2sgdG8gdGhlIHByZXZpb3VzIHBhZ2UgaWYgaXQgZXhpc3RzLiAqL1xuICBwcmV2aW91c1BhZ2UoKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLmhhc1ByZXZpb3VzUGFnZSgpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgcHJldmlvdXNQYWdlSW5kZXggPSB0aGlzLnBhZ2VJbmRleDtcbiAgICB0aGlzLnBhZ2VJbmRleCA9IHRoaXMucGFnZUluZGV4IC0gMTtcbiAgICB0aGlzLl9lbWl0UGFnZUV2ZW50KHByZXZpb3VzUGFnZUluZGV4KTtcbiAgfVxuXG4gIC8qKiBNb3ZlIHRvIHRoZSBmaXJzdCBwYWdlIGlmIG5vdCBhbHJlYWR5IHRoZXJlLiAqL1xuICBmaXJzdFBhZ2UoKTogdm9pZCB7XG4gICAgLy8gaGFzUHJldmlvdXNQYWdlIGJlaW5nIGZhbHNlIGltcGxpZXMgYXQgdGhlIHN0YXJ0XG4gICAgaWYgKCF0aGlzLmhhc1ByZXZpb3VzUGFnZSgpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgcHJldmlvdXNQYWdlSW5kZXggPSB0aGlzLnBhZ2VJbmRleDtcbiAgICB0aGlzLnBhZ2VJbmRleCA9IDE7XG4gICAgdGhpcy5fZW1pdFBhZ2VFdmVudChwcmV2aW91c1BhZ2VJbmRleCk7XG4gIH1cblxuICAvKiogTW92ZSB0byB0aGUgbGFzdCBwYWdlIGlmIG5vdCBhbHJlYWR5IHRoZXJlLiAqL1xuICBsYXN0UGFnZSgpOiB2b2lkIHtcbiAgICAvLyBoYXNOZXh0UGFnZSBiZWluZyBmYWxzZSBpbXBsaWVzIGF0IHRoZSBlbmRcbiAgICBpZiAoIXRoaXMuaGFzTmV4dFBhZ2UoKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHByZXZpb3VzUGFnZUluZGV4ID0gdGhpcy5wYWdlSW5kZXg7XG4gICAgdGhpcy5wYWdlSW5kZXggPSB0aGlzLmdldE51bWJlck9mUGFnZXMoKTtcbiAgICB0aGlzLl9lbWl0UGFnZUV2ZW50KHByZXZpb3VzUGFnZUluZGV4KTtcbiAgfVxuXG4gIC8qKiBXaGV0aGVyIHRoZXJlIGlzIGEgcHJldmlvdXMgcGFnZS4gKi9cbiAgaGFzUHJldmlvdXNQYWdlKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnBhZ2VJbmRleCA+PSAyICYmIHRoaXMucGFnZVNpemUgIT0gMDtcbiAgfVxuXG4gIC8qKiBXaGV0aGVyIHRoZXJlIGlzIGEgbmV4dCBwYWdlLiAqL1xuICBoYXNOZXh0UGFnZSgpOiBib29sZWFuIHtcbiAgICBjb25zdCBtYXhQYWdlSW5kZXggPSB0aGlzLmdldE51bWJlck9mUGFnZXMoKTtcbiAgICByZXR1cm4gdGhpcy5wYWdlSW5kZXggPCBtYXhQYWdlSW5kZXggJiYgdGhpcy5wYWdlU2l6ZSAhPSAwO1xuICB9XG5cbiAgLyoqIENhbGN1bGF0ZSB0aGUgbnVtYmVyIG9mIHBhZ2VzICovXG4gIGdldE51bWJlck9mUGFnZXMoKTogbnVtYmVyIHtcbiAgICBpZiAoIXRoaXMucGFnZVNpemUpIHtcbiAgICAgIHJldHVybiAwO1xuICAgIH1cblxuICAgIHJldHVybiBNYXRoLmNlaWwodGhpcy5sZW5ndGggLyB0aGlzLnBhZ2VTaXplKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGFuZ2VzIHRoZSBwYWdlIHNpemUgc28gdGhhdCB0aGUgZmlyc3QgaXRlbSBkaXNwbGF5ZWQgb24gdGhlIHBhZ2Ugd2lsbCBzdGlsbCBiZVxuICAgKiBkaXNwbGF5ZWQgdXNpbmcgdGhlIG5ldyBwYWdlIHNpemUuXG4gICAqXG4gICAqIEZvciBleGFtcGxlLCBpZiB0aGUgcGFnZSBzaXplIGlzIDEwIGFuZCBvbiB0aGUgc2Vjb25kIHBhZ2UgKGl0ZW1zIGluZGV4ZWQgMTAtMTkpIHRoZW5cbiAgICogc3dpdGNoaW5nIHNvIHRoYXQgdGhlIHBhZ2Ugc2l6ZSBpcyA1IHdpbGwgc2V0IHRoZSB0aGlyZCBwYWdlIGFzIHRoZSBjdXJyZW50IHBhZ2Ugc29cbiAgICogdGhhdCB0aGUgMTB0aCBpdGVtIHdpbGwgc3RpbGwgYmUgZGlzcGxheWVkLlxuICAgKi9cbiAgX2NoYW5nZVBhZ2VTaXplKHBhZ2VTaXplOiBudW1iZXIpIHtcbiAgICBjb25zdCBwcmV2aW91c1BhZ2VJbmRleCA9IHRoaXMucGFnZUluZGV4O1xuXG4gICAgdGhpcy5wYWdlSW5kZXggPSAxO1xuICAgIHRoaXMucGFnZVNpemUgPSBwYWdlU2l6ZTtcbiAgICB0aGlzLl9lbWl0UGFnZUV2ZW50KHByZXZpb3VzUGFnZUluZGV4KTtcbiAgfVxuXG4gIC8qKiBDaGVja3Mgd2hldGhlciB0aGUgYnV0dG9ucyBmb3IgZ29pbmcgZm9yd2FyZHMgc2hvdWxkIGJlIGRpc2FibGVkLiAqL1xuICBfbmV4dEJ1dHRvbnNEaXNhYmxlZCgpIHtcbiAgICByZXR1cm4gdGhpcy5kaXNhYmxlZCB8fCAhdGhpcy5oYXNOZXh0UGFnZSgpO1xuICB9XG5cbiAgLyoqIENoZWNrcyB3aGV0aGVyIHRoZSBidXR0b25zIGZvciBnb2luZyBiYWNrd2FyZHMgc2hvdWxkIGJlIGRpc2FibGVkLiAqL1xuICBfcHJldmlvdXNCdXR0b25zRGlzYWJsZWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuZGlzYWJsZWQgfHwgIXRoaXMuaGFzUHJldmlvdXNQYWdlKCk7XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlcyB0aGUgbGlzdCBvZiBwYWdlIHNpemUgb3B0aW9ucyB0byBkaXNwbGF5IHRvIHRoZSB1c2VyLiBJbmNsdWRlcyBtYWtpbmcgc3VyZSB0aGF0XG4gICAqIHRoZSBwYWdlIHNpemUgaXMgYW4gb3B0aW9uIGFuZCB0aGF0IHRoZSBsaXN0IGlzIHNvcnRlZC5cbiAgICovXG4gIHByaXZhdGUgX3VwZGF0ZURpc3BsYXllZFBhZ2VTaXplT3B0aW9ucygpIHtcbiAgICBpZiAoIXRoaXMuX2lzSW5pdGlhbGl6ZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBJZiBubyBwYWdlIHNpemUgaXMgcHJvdmlkZWQsIHVzZSB0aGUgZmlyc3QgcGFnZSBzaXplIG9wdGlvbiBvciB0aGUgZGVmYXVsdCBwYWdlIHNpemUuXG4gICAgaWYgKCF0aGlzLnBhZ2VTaXplKSB7XG4gICAgICB0aGlzLl9wYWdlU2l6ZSA9XG4gICAgICAgIHRoaXMucGFnZVNpemVPcHRpb25zLmxlbmd0aCAhPSAwID8gdGhpcy5wYWdlU2l6ZU9wdGlvbnNbMF0gOiBERUZBVUxUX1BBR0VfU0laRTtcbiAgICB9XG5cbiAgICB0aGlzLl9kaXNwbGF5ZWRQYWdlU2l6ZU9wdGlvbnMgPSB0aGlzLnBhZ2VTaXplT3B0aW9ucy5zbGljZSgpO1xuXG4gICAgaWYgKHRoaXMuX2Rpc3BsYXllZFBhZ2VTaXplT3B0aW9ucy5pbmRleE9mKHRoaXMucGFnZVNpemUpID09PSAtMSkge1xuICAgICAgdGhpcy5fZGlzcGxheWVkUGFnZVNpemVPcHRpb25zLnB1c2godGhpcy5wYWdlU2l6ZSk7XG4gICAgfVxuXG4gICAgLy8gU29ydCB0aGUgbnVtYmVycyB1c2luZyBhIG51bWJlci1zcGVjaWZpYyBzb3J0IGZ1bmN0aW9uLlxuICAgIHRoaXMuX2Rpc3BsYXllZFBhZ2VTaXplT3B0aW9ucy5zb3J0KChhLCBiKSA9PiBhIC0gYik7XG4gICAgdGhpcy5fY2hhbmdlRGV0ZWN0b3JSZWYubWFya0ZvckNoZWNrKCk7XG4gIH1cblxuICAvKiogRW1pdHMgYW4gZXZlbnQgbm90aWZ5aW5nIHRoYXQgYSBjaGFuZ2Ugb2YgdGhlIHBhZ2luYXRvcidzIHByb3BlcnRpZXMgaGFzIGJlZW4gdHJpZ2dlcmVkLiAqL1xuICBwcml2YXRlIF9lbWl0UGFnZUV2ZW50KHByZXZpb3VzUGFnZUluZGV4OiBudW1iZXIpIHtcbiAgICB0aGlzLnBhZ2UuZW1pdCh7XG4gICAgICBwcmV2aW91c1BhZ2VJbmRleDogcHJldmlvdXNQYWdlSW5kZXggKyAxLFxuICAgICAgcGFnZUluZGV4OiB0aGlzLnBhZ2VJbmRleCxcbiAgICAgIHBhZ2VTaXplOiB0aGlzLnBhZ2VTaXplLFxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfY2FsY1BhZ2VzKHBhZ2VJbmRleD86IG51bWJlcik6IFBhZ2VyW10ge1xuICAgIGNvbnN0IHBhZ2VzOiBQYWdlcltdID0gW107XG4gICAgY29uc3QgdG90YWxQYWdlcyA9IHRoaXMuZ2V0TnVtYmVyT2ZQYWdlcygpO1xuXG4gICAgbGV0IHN0YXJ0UGFnZSA9IDE7XG4gICAgbGV0IGVuZFBhZ2UgPSB0b3RhbFBhZ2VzO1xuXG4gICAgY29uc3QgbWF4U2l6ZSA9IDU7XG4gICAgY29uc3QgaXNNYXhTaXplZCA9IG1heFNpemUgPCB0b3RhbFBhZ2VzO1xuXG4gICAgcGFnZUluZGV4ID0gcGFnZUluZGV4IHx8IHRoaXMucGFnZUluZGV4O1xuXG4gICAgaWYgKGlzTWF4U2l6ZWQpIHtcbiAgICAgIHN0YXJ0UGFnZSA9IHBhZ2VJbmRleCAtIE1hdGguZmxvb3IobWF4U2l6ZSAvIDIpO1xuICAgICAgZW5kUGFnZSA9IHBhZ2VJbmRleCArIE1hdGguZmxvb3IobWF4U2l6ZSAvIDIpO1xuXG4gICAgICBpZiAoc3RhcnRQYWdlIDwgMSkge1xuICAgICAgICBzdGFydFBhZ2UgPSAxO1xuICAgICAgICBlbmRQYWdlID0gTWF0aC5taW4oc3RhcnRQYWdlICsgbWF4U2l6ZSAtIDEsIHRvdGFsUGFnZXMpO1xuICAgICAgfSBlbHNlIGlmIChlbmRQYWdlID4gdG90YWxQYWdlcykge1xuICAgICAgICBzdGFydFBhZ2UgPSBNYXRoLm1heCh0b3RhbFBhZ2VzIC0gbWF4U2l6ZSArIDEsIDEpO1xuICAgICAgICBlbmRQYWdlID0gdG90YWxQYWdlcztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IgKGxldCBudW0gPSBzdGFydFBhZ2U7IG51bSA8PSBlbmRQYWdlOyBudW0rKykge1xuICAgICAgcGFnZXMucHVzaCh7XG4gICAgICAgIG51bWJlcjogbnVtLFxuICAgICAgICB0ZXh0OiAnJyArIG51bSxcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBwYWdlcztcbiAgfVxufVxuIiwiPGRpdiBjbGFzcz1cImZsZXggZ2FwLTNcIj5cbiAgQGlmICghaGlkZVBhZ2VTaXplKSB7XG4gICAgPGRpdiBjbGFzcz1cImZsZXggZ2FwLTJcIj5cbiAgICAgIDxkaXYgY2xhc3M9XCJsYWJlbFwiPlxuICAgICAgICA8c3BhbiBjbGFzcz1cIndoaXRlc3BhY2Utbm93cmFwIHRleHQtYmFzZVwiPlBhZ2Ugc2l6ZTogPC9zcGFuPlxuICAgICAgPC9kaXY+XG5cbiAgICAgIEBpZiAoX2Rpc3BsYXllZFBhZ2VTaXplT3B0aW9ucy5sZW5ndGggPiAxKSB7XG4gICAgICAgIDxzZWxlY3RcbiAgICAgICAgICBjbGFzcz1cIm1pbi13LTIyIHNlbGVjdCBzZWxlY3QtYm9yZGVyZWQgdy1mdWxsIG1heC13LXhzXCJcbiAgICAgICAgICBbZGlzYWJsZWRdPVwiZGlzYWJsZWRcIlxuICAgICAgICAgIFtuZ01vZGVsXT1cInBhZ2VTaXplXCJcbiAgICAgICAgICAobmdNb2RlbENoYW5nZSk9XCJfY2hhbmdlUGFnZVNpemUoJGV2ZW50KVwiXG4gICAgICAgID5cbiAgICAgICAgICBAZm9yIChwYWdlU2l6ZU9wdGlvbiBvZiBfZGlzcGxheWVkUGFnZVNpemVPcHRpb25zOyB0cmFjayBwYWdlU2l6ZU9wdGlvbikge1xuICAgICAgICAgICAgPG9wdGlvbiBbdmFsdWVdPVwicGFnZVNpemVPcHRpb25cIj5cbiAgICAgICAgICAgICAge3sgcGFnZVNpemVPcHRpb24gfX1cbiAgICAgICAgICAgIDwvb3B0aW9uPlxuICAgICAgICAgIH1cbiAgICAgICAgPC9zZWxlY3Q+XG4gICAgICB9XG4gICAgPC9kaXY+XG5cbiAgICBAaWYgKF9kaXNwbGF5ZWRQYWdlU2l6ZU9wdGlvbnMubGVuZ3RoIDw9IDEpIHtcbiAgICAgIDxkaXYgY2xhc3M9XCJsYWJlbFwiPlxuICAgICAgICA8c3BhbiBjbGFzcz1cIndoaXRlc3BhY2Utbm93cmFwIHRleHQtYmFzZVwiPlxuICAgICAgICAgIHt7IHBhZ2VTaXplIH19XG4gICAgICAgIDwvc3Bhbj5cbiAgICAgIDwvZGl2PlxuICAgIH1cbiAgfVxuXG4gIDxkaXYgY2xhc3M9XCJqb2luXCI+XG4gICAgPCEtLSBQcmV2aW91cyBQYWdlIEJ1dHRvbiAtLT5cbiAgICBAaWYgKHNob3dGaXJzdExhc3RCdXR0b25zKSB7XG4gICAgICA8YnV0dG9uXG4gICAgICAgIGNsYXNzPVwiYnRuIGJ0bi1jaXJjbGUgam9pbi1pdGVtXCJcbiAgICAgICAgW2Rpc2FibGVkXT1cIl9wcmV2aW91c0J1dHRvbnNEaXNhYmxlZCgpXCJcbiAgICAgICAgKGNsaWNrKT1cImZpcnN0UGFnZSgpXCJcbiAgICAgID5cbiAgICAgICAgPHN2Z1xuICAgICAgICAgIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIlxuICAgICAgICAgIGZpbGw9XCJub25lXCJcbiAgICAgICAgICB2aWV3Qm94PVwiMCAwIDI0IDI0XCJcbiAgICAgICAgICBzdHJva2Utd2lkdGg9XCIyXCJcbiAgICAgICAgICBzdHJva2U9XCJjdXJyZW50Q29sb3JcIlxuICAgICAgICAgIGNsYXNzPVwiaC02IHctNlwiXG4gICAgICAgID5cbiAgICAgICAgICA8cGF0aFxuICAgICAgICAgICAgc3Ryb2tlLWxpbmVjYXA9XCJyb3VuZFwiXG4gICAgICAgICAgICBzdHJva2UtbGluZWpvaW49XCJyb3VuZFwiXG4gICAgICAgICAgICBkPVwibTE4Ljc1IDQuNS03LjUgNy41IDcuNSA3LjVtLTYtMTVMNS4yNSAxMmw3LjUgNy41XCJcbiAgICAgICAgICAvPlxuICAgICAgICA8L3N2Zz5cbiAgICAgIDwvYnV0dG9uPlxuICAgIH1cbiAgICA8YnV0dG9uXG4gICAgICBjbGFzcz1cImJ0biBidG4tY2lyY2xlIGpvaW4taXRlbVwiXG4gICAgICBbZGlzYWJsZWRdPVwiX3ByZXZpb3VzQnV0dG9uc0Rpc2FibGVkKClcIlxuICAgICAgKGNsaWNrKT1cInByZXZpb3VzUGFnZSgpXCJcbiAgICA+XG4gICAgICA8c3ZnXG4gICAgICAgIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIlxuICAgICAgICB2aWV3Qm94PVwiMCAwIDI0IDI0XCJcbiAgICAgICAgZmlsbD1cImN1cnJlbnRDb2xvclwiXG4gICAgICAgIGNsYXNzPVwiaC02IHctNlwiXG4gICAgICA+XG4gICAgICAgIDxwYXRoXG4gICAgICAgICAgZmlsbC1ydWxlPVwiZXZlbm9kZFwiXG4gICAgICAgICAgZD1cIk03LjcyIDEyLjUzYS43NS43NSAwIDAgMSAwLTEuMDZsNy41LTcuNWEuNzUuNzUgMCAxIDEgMS4wNiAxLjA2TDkuMzEgMTJsNi45NyA2Ljk3YS43NS43NSAwIDEgMS0xLjA2IDEuMDZsLTcuNS03LjVaXCJcbiAgICAgICAgICBjbGlwLXJ1bGU9XCJldmVub2RkXCJcbiAgICAgICAgLz5cbiAgICAgIDwvc3ZnPlxuICAgIDwvYnV0dG9uPlxuXG4gICAgPCEtLSBQYWdlIEJ1dHRvbnMgLS0+XG4gICAgQGZvciAocGFnZSBvZiBfcGFnZXM7IHRyYWNrIHBhZ2UubnVtYmVyKSB7XG4gICAgICA8YnV0dG9uXG4gICAgICAgIGNsYXNzPVwiYnRuIGpvaW4taXRlbVwiXG4gICAgICAgIFtuZ0NsYXNzXT1cInsgJ2J0bi1wcmltYXJ5JzogcGFnZS5udW1iZXIgPT09IHBhZ2VJbmRleCB9XCJcbiAgICAgICAgKGNsaWNrKT1cInNlbGVjdFBhZ2UocGFnZS5udW1iZXIpXCJcbiAgICAgID5cbiAgICAgICAge3sgcGFnZS50ZXh0IH19XG4gICAgICA8L2J1dHRvbj5cbiAgICB9XG5cbiAgICA8IS0tIE5leHQgUGFnZSBCdXR0b24gLS0+XG4gICAgPGJ1dHRvblxuICAgICAgY2xhc3M9XCJidG4gYnRuLWNpcmNsZSBqb2luLWl0ZW1cIlxuICAgICAgW2Rpc2FibGVkXT1cIl9uZXh0QnV0dG9uc0Rpc2FibGVkKClcIlxuICAgICAgKGNsaWNrKT1cIm5leHRQYWdlKClcIlxuICAgID5cbiAgICAgIDxzdmdcbiAgICAgICAgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiXG4gICAgICAgIHZpZXdCb3g9XCIwIDAgMjQgMjRcIlxuICAgICAgICBmaWxsPVwiY3VycmVudENvbG9yXCJcbiAgICAgICAgY2xhc3M9XCJoLTYgdy02XCJcbiAgICAgID5cbiAgICAgICAgPHBhdGhcbiAgICAgICAgICBmaWxsLXJ1bGU9XCJldmVub2RkXCJcbiAgICAgICAgICBkPVwiTTE2LjI4IDExLjQ3YS43NS43NSAwIDAgMSAwIDEuMDZsLTcuNSA3LjVhLjc1Ljc1IDAgMCAxLTEuMDYtMS4wNkwxNC42OSAxMiA3LjcyIDUuMDNhLjc1Ljc1IDAgMCAxIDEuMDYtMS4wNmw3LjUgNy41WlwiXG4gICAgICAgICAgY2xpcC1ydWxlPVwiZXZlbm9kZFwiXG4gICAgICAgIC8+XG4gICAgICA8L3N2Zz5cbiAgICA8L2J1dHRvbj5cblxuICAgIEBpZiAoc2hvd0ZpcnN0TGFzdEJ1dHRvbnMpIHtcbiAgICAgIDxidXR0b25cbiAgICAgICAgY2xhc3M9XCJidG4gYnRuLWNpcmNsZSBqb2luLWl0ZW1cIlxuICAgICAgICBbZGlzYWJsZWRdPVwiX25leHRCdXR0b25zRGlzYWJsZWQoKVwiXG4gICAgICAgIChjbGljayk9XCJuZXh0UGFnZSgpXCJcbiAgICAgID5cbiAgICAgICAgPHN2Z1xuICAgICAgICAgIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIlxuICAgICAgICAgIHZpZXdCb3g9XCIwIDAgMjQgMjRcIlxuICAgICAgICAgIGZpbGw9XCJjdXJyZW50Q29sb3JcIlxuICAgICAgICAgIGNsYXNzPVwiaC02IHctNlwiXG4gICAgICAgID5cbiAgICAgICAgICA8cGF0aFxuICAgICAgICAgICAgZmlsbC1ydWxlPVwiZXZlbm9kZFwiXG4gICAgICAgICAgICBkPVwiTTEzLjI4IDExLjQ3YS43NS43NSAwIDAgMSAwIDEuMDZsLTcuNSA3LjVhLjc1Ljc1IDAgMCAxLTEuMDYtMS4wNkwxMS42OSAxMiA0LjcyIDUuMDNhLjc1Ljc1IDAgMCAxIDEuMDYtMS4wNmw3LjUgNy41WlwiXG4gICAgICAgICAgICBjbGlwLXJ1bGU9XCJldmVub2RkXCJcbiAgICAgICAgICAvPlxuICAgICAgICAgIDxwYXRoXG4gICAgICAgICAgICBmaWxsLXJ1bGU9XCJldmVub2RkXCJcbiAgICAgICAgICAgIGQ9XCJNMTkuMjggMTEuNDdhLjc1Ljc1IDAgMCAxIDAgMS4wNmwtNy41IDcuNWEuNzUuNzUgMCAxIDEtMS4wNi0xLjA2TDE3LjY5IDEybC02Ljk3LTYuOTdhLjc1Ljc1IDAgMCAxIDEuMDYtMS4wNmw3LjUgNy41WlwiXG4gICAgICAgICAgICBjbGlwLXJ1bGU9XCJldmVub2RkXCJcbiAgICAgICAgICAvPlxuICAgICAgICA8L3N2Zz5cbiAgICAgIDwvYnV0dG9uPlxuICAgIH1cbiAgPC9kaXY+XG48L2Rpdj5cbiJdfQ==