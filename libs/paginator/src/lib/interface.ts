/**
 * Change event object that is emitted when the user selects a
 * different page size or navigates to another page.
 */
export class PageEvent {
  /** The current page index. */
  pageIndex: number;

  /**
   * Index of the page that was selected previously.
   * @breaking-change 8.0.0 To be made into a required property.
   */
  previousPageIndex?: number;

  /** The current page size. */
  pageSize: number;

  /** The current total number of items being paged. */
  length?: number;
}

export interface Pager {
  /** The current page index */
  number: number;

  /** The label for the page */
  text: string;
}

// Note that while `PaginatorDefaultOptions` and `PAGINATOR_DEFAULT_OPTIONS` are identical
// between the MDC and non-MDC versions, we have to duplicate them, because the type of
// `formFieldAppearance` is narrower in the MDC version.

/** Object that can be used to configure the default options for the paginator module. */
export interface PaginatorDefaultOptions {
  /** Number of items to display on a page. By default set to 50. */
  pageSize?: number;

  /** The set of provided page size options to display to the user. */
  pageSizeOptions?: number[];

  /** Whether to hide the page size selection UI from the user. */
  hidePageSize?: boolean;

  /** Whether to show the first/last buttons UI to the user. */
  showFirstLastButtons?: boolean;
}
