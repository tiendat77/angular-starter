/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  InjectionToken,
  Input,
  OnDestroy,
  OnInit,
  Optional,
  Output,
  ViewEncapsulation,
  booleanAttribute,
  numberAttribute,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { Observable, ReplaySubject } from 'rxjs';
import { PageEvent, Pager, PaginatorDefaultOptions } from './interface';

/** The default page size if there is no page size and there are no provided page size options. */
const DEFAULT_PAGE_SIZE = 10;

/** The default page size options if there are no provided page size options */
const DEFAULT_PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

/** Injection token that can be used to provide the default options for the paginator module. */
export const PAGINATOR_DEFAULT_OPTIONS = new InjectionToken<PaginatorDefaultOptions>(
  'PAGINATOR_DEFAULT_OPTIONS'
);

let nextUniqueId = 0;

/**
 * Component to provide navigation between paged information. Displays the size of the current
 * page, user-selectable options to change that size, what items are being shown, and
 * navigational button to go to the previous or next page.
 */
@Component({
  standalone: true,
  selector: 'paginator',
  exportAs: 'paginator',
  templateUrl: 'paginator.html',
  host: {
    role: 'group',
    '[class.hidden]': 'autoHide && _pages.length < 1',
    class: 'pl-4 pr-4 pt-3 pb-3 flex items-center justify-end border-t',
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass, FormsModule, ReactiveFormsModule],
})
export class Paginator implements OnInit, OnDestroy {
  /** ID for the DOM node containing the paginator's items per page label. */
  readonly _pageSizeLabelId = `paginator-page-size-label-${nextUniqueId++}`;

  private _isInitialized = false;
  private _initializedStream = new ReplaySubject<void>(1);

  /** The zero-based page index of the displayed list of items. Defaulted to 0. */
  @Input({ transform: numberAttribute })
  get pageIndex(): number {
    return this._pageIndex;
  }
  set pageIndex(value: number) {
    this._pageIndex = Math.max(value || 1, 1);
    this._pages = this._calcPages();
    this._changeDetectorRef.markForCheck();
  }
  private _pageIndex = 1;

  /** The length of the total number of items that are being paginated. Defaulted to 0. */
  @Input({ transform: numberAttribute })
  get length(): number {
    return this._length;
  }
  set length(value: number) {
    this._length = value || 0;
    this._pages = this._calcPages();
    this._changeDetectorRef.markForCheck();
  }
  private _length = 0;

  /** Number of items to display on a page. By default set to 50. */
  @Input({ transform: numberAttribute })
  get pageSize(): number {
    return this._pageSize;
  }
  set pageSize(value: number) {
    this._pageSize = Math.max(value || 0, 0);
    this._pages = this._calcPages();
    this._updateDisplayedPageSizeOptions();
  }
  private _pageSize: number;

  /** The set of provided page size options to display to the user. */
  @Input()
  get pageSizeOptions(): number[] {
    return this._pageSizeOptions;
  }
  set pageSizeOptions(value: number[] | readonly number[]) {
    this._pageSizeOptions = (value || ([] as number[])).map((p) => numberAttribute(p, 0));
    this._pages = this._calcPages();
    this._updateDisplayedPageSizeOptions();
  }
  private _pageSizeOptions: number[] = [];

  /** Hide the paginator if page size <= 1 */
  @Input({ transform: booleanAttribute }) autoHide = true;

  /** Whether to hide the total data record UI from the user. */
  @Input({ transform: booleanAttribute }) hideTotal = true;

  /** Whether to hide the page size selection UI from the user. */
  @Input({ transform: booleanAttribute }) hidePageSize = false;

  /** Whether to show the first/last buttons UI to the user. */
  @Input({ transform: booleanAttribute }) showFirstLastButtons = false;

  /** Whether the paginator is disabled. */
  @Input({ transform: booleanAttribute }) disabled = false;

  /** Event emitted when the paginator changes the page size or page index. */
  @Output() readonly page = new EventEmitter<PageEvent>();

  /** Array of Page objects to use in the paginator controls. */
  _pages: Pager[] = [];

  /** Displayed set of page size options. Will be sorted and include current page size. */
  _displayedPageSizeOptions: number[];

  /** Emits when the paginator is initialized. */
  initialized: Observable<void> = this._initializedStream;

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    @Optional()
    @Inject(PAGINATOR_DEFAULT_OPTIONS)
    defaults?: PaginatorDefaultOptions
  ) {
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
    } else {
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
  selectPage(pageIndex: number): void {
    if (pageIndex >= 0 && pageIndex <= this.getNumberOfPages() && pageIndex !== this.pageIndex) {
      const previousPageIndex = this.pageIndex;
      this.pageIndex = pageIndex;

      this._emitPageEvent(previousPageIndex);
    }
  }

  /** Advances to the next page if it exists. */
  nextPage(): void {
    if (!this.hasNextPage()) {
      return;
    }

    const previousPageIndex = this.pageIndex;
    this.pageIndex = this.pageIndex + 1;
    this._emitPageEvent(previousPageIndex);
  }

  /** Move back to the previous page if it exists. */
  previousPage(): void {
    if (!this.hasPreviousPage()) {
      return;
    }

    const previousPageIndex = this.pageIndex;
    this.pageIndex = this.pageIndex - 1;
    this._emitPageEvent(previousPageIndex);
  }

  /** Move to the first page if not already there. */
  firstPage(): void {
    // hasPreviousPage being false implies at the start
    if (!this.hasPreviousPage()) {
      return;
    }

    const previousPageIndex = this.pageIndex;
    this.pageIndex = 1;
    this._emitPageEvent(previousPageIndex);
  }

  /** Move to the last page if not already there. */
  lastPage(): void {
    // hasNextPage being false implies at the end
    if (!this.hasNextPage()) {
      return;
    }

    const previousPageIndex = this.pageIndex;
    this.pageIndex = this.getNumberOfPages();
    this._emitPageEvent(previousPageIndex);
  }

  /** Whether there is a previous page. */
  hasPreviousPage(): boolean {
    return this.pageIndex >= 2 && this.pageSize != 0;
  }

  /** Whether there is a next page. */
  hasNextPage(): boolean {
    const maxPageIndex = this.getNumberOfPages();
    return this.pageIndex < maxPageIndex && this.pageSize != 0;
  }

  /** Calculate the number of pages */
  getNumberOfPages(): number {
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
  _changePageSize(pageSize: number) {
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
  private _updateDisplayedPageSizeOptions() {
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
  private _emitPageEvent(previousPageIndex: number) {
    this.page.emit({
      previousPageIndex: previousPageIndex + 1,
      pageIndex: this.pageIndex,
      pageSize: this.pageSize,
    });
  }

  private _calcPages(pageIndex?: number): Pager[] {
    const pages: Pager[] = [];
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
      } else if (endPage > totalPages) {
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
}
