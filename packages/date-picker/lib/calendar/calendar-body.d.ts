import * as i0 from '@angular/core';
import {
  AfterViewChecked,
  ElementRef,
  EventEmitter,
  NgZone,
  OnChanges,
  OnDestroy,
  SimpleChanges,
} from '@angular/core';
/** Extra CSS classes that can be associated with a calendar cell. */
export type CalendarCellCssClasses = string | string[] | Set<string> | Record<string, any>;
/** Function that can generate the extra classes that should be added to a calendar cell. */
export type CalendarCellClassFunction<D> = (
  date: D,
  view: 'month' | 'year' | 'multi-year'
) => CalendarCellCssClasses;
/**
 * An internal class that represents the data corresponding to a single calendar cell.
 * @docs-private
 */
export declare class CalendarCell<D = any> {
  value: number;
  displayValue: string;
  ariaLabel: string;
  enabled: boolean;
  cssClasses: CalendarCellCssClasses;
  compareValue: number;
  rawValue?: D | undefined;
  constructor(
    value: number,
    displayValue: string,
    ariaLabel: string,
    enabled: boolean,
    cssClasses?: CalendarCellCssClasses,
    compareValue?: number,
    rawValue?: D | undefined
  );
}
/** Event emitted when a date inside the calendar is triggered as a result of a user action. */
export interface CalendarUserEvent<D> {
  value: D;
  event: Event;
}
/**
 * An internal component used to display calendar data in a table.
 * @docs-private
 */
export declare class CalendarBody<D = any> implements OnChanges, OnDestroy, AfterViewChecked {
  private _elementRef;
  private _ngZone;
  private _platform;
  /**
   * Used to skip the next focus event when rendering the preview range.
   * We need a flag like this, because some browsers fire focus events asynchronously.
   */
  private _skipNextFocus;
  /**
   * Used to focus the active cell after change detection has run.
   */
  private _focusActiveCellAfterViewChecked;
  /** The label for the table. (e.g. "Jan 2017"). */
  label: string;
  /** The cells to display in the table. */
  rows: CalendarCell[][];
  /** The value in the table that corresponds to today. */
  todayValue: number;
  /** Start value of the selected date range. */
  startValue: number;
  /** End value of the selected date range. */
  endValue: number;
  /** The minimum number of free cells needed to fit the label in the first row. */
  labelMinRequiredCells: number;
  /** The number of columns in the table. */
  numCols: number;
  /** The cell number of the active cell in the table. */
  activeCell: number;
  ngAfterViewChecked(): void;
  /** Whether a range is being selected. */
  isRange: boolean;
  /**
   * The aspect ratio (width / height) to use for the cells in the table. This aspect ratio will be
   * maintained even as the table resizes.
   */
  cellAspectRatio: number;
  /** Start of the comparison range. */
  comparisonStart: number | null;
  /** End of the comparison range. */
  comparisonEnd: number | null;
  /** Start of the preview range. */
  previewStart: number | null;
  /** End of the preview range. */
  previewEnd: number | null;
  /** ARIA Accessible name of the `<input startDate/>` */
  startDateAccessibleName: string | null;
  /** ARIA Accessible name of the `<input endDate/>` */
  endDateAccessibleName: string | null;
  /** Emits when a new value is selected. */
  readonly selectedValueChange: EventEmitter<CalendarUserEvent<number>>;
  /** Emits when the preview has changed as a result of a user action. */
  readonly previewChange: EventEmitter<CalendarUserEvent<CalendarCell<any> | null>>;
  readonly activeDateChange: EventEmitter<CalendarUserEvent<number>>;
  /** Emits the date at the possible start of a drag event. */
  readonly dragStarted: EventEmitter<CalendarUserEvent<D>>;
  /** Emits the date at the conclusion of a drag, or null if mouse was not released on a date. */
  readonly dragEnded: EventEmitter<CalendarUserEvent<D | null>>;
  /** The number of blank cells to put at the beginning for the first row. */
  _firstRowOffset: number;
  /** Padding for the individual date cells. */
  _cellPadding: string;
  /** Width of an individual cell. */
  _cellWidth: string;
  private _didDragSinceMouseDown;
  constructor(_elementRef: ElementRef<HTMLElement>, _ngZone: NgZone);
  /** Called when a cell is clicked. */
  _cellClicked(cell: CalendarCell, event: MouseEvent): void;
  _emitActiveDateChange(cell: CalendarCell, event: FocusEvent): void;
  /** Returns whether a cell should be marked as selected. */
  _isSelected(value: number): boolean;
  ngOnChanges(changes: SimpleChanges): void;
  ngOnDestroy(): void;
  /** Returns whether a cell is active. */
  _isActiveCell(rowIndex: number, colIndex: number): boolean;
  /**
   * Focuses the active cell after the microtask queue is empty.
   *
   * Adding a 0ms setTimeout seems to fix Voiceover losing focus when pressing PageUp/PageDown
   * (issue #24330).
   *
   * Determined a 0ms by gradually increasing duration from 0 and testing two use cases with screen
   * reader enabled:
   *
   * 1. Pressing PageUp/PageDown repeatedly with pausing between each key press.
   * 2. Pressing and holding the PageDown key with repeated keys enabled.
   *
   * Test 1 worked roughly 95-99% of the time with 0ms and got a little bit better as the duration
   * increased. Test 2 got slightly better until the duration was long enough to interfere with
   * repeated keys. If the repeated key speed was faster than the timeout duration, then pressing
   * and holding pagedown caused the entire page to scroll.
   *
   * Since repeated key speed can verify across machines, determined that any duration could
   * potentially interfere with repeated keys. 0ms would be best because it almost entirely
   * eliminates the focus being lost in Voiceover (#24330) without causing unintended side effects.
   * Adding delay also complicates writing tests.
   */
  _focusActiveCell(movePreview?: boolean): void;
  /** Focuses the active cell after change detection has run and the microtask queue is empty. */
  _scheduleFocusActiveCellAfterViewChecked(): void;
  /** Gets whether a value is the start of the main range. */
  _isRangeStart(value: number): boolean;
  /** Gets whether a value is the end of the main range. */
  _isRangeEnd(value: number): boolean;
  /** Gets whether a value is within the currently-selected range. */
  _isInRange(value: number): boolean;
  /** Gets whether a value is the start of the comparison range. */
  _isComparisonStart(value: number): boolean;
  /** Whether the cell is a start bridge cell between the main and comparison ranges. */
  _isComparisonBridgeStart(value: number, rowIndex: number, colIndex: number): boolean;
  /** Whether the cell is an end bridge cell between the main and comparison ranges. */
  _isComparisonBridgeEnd(value: number, rowIndex: number, colIndex: number): boolean;
  /** Gets whether a value is the end of the comparison range. */
  _isComparisonEnd(value: number): boolean;
  /** Gets whether a value is within the current comparison range. */
  _isInComparisonRange(value: number): boolean;
  /**
   * Gets whether a value is the same as the start and end of the comparison range.
   * For context, the functions that we use to determine whether something is the start/end of
   * a range don't allow for the start and end to be on the same day, because we'd have to use
   * much more specific CSS selectors to style them correctly in all scenarios. This is fine for
   * the regular range, because when it happens, the selected styles take over and still show where
   * the range would've been, however we don't have these selected styles for a comparison range.
   * This function is used to apply a class that serves the same purpose as the one for selected
   * dates, but it only applies in the context of a comparison range.
   */
  _isComparisonIdentical(value: number): boolean;
  /** Gets whether a value is the start of the preview range. */
  _isPreviewStart(value: number): boolean;
  /** Gets whether a value is the end of the preview range. */
  _isPreviewEnd(value: number): boolean;
  /** Gets whether a value is inside the preview range. */
  _isInPreview(value: number): boolean;
  /** Gets ids of aria descriptions for the start and end of a date range. */
  _getDescribedby(value: number): string | null;
  /**
   * Event handler for when the user enters an element
   * inside the calendar body (e.g. by hovering in or focus).
   */
  private _enterHandler;
  private _touchmoveHandler;
  /**
   * Event handler for when the user's pointer leaves an element
   * inside the calendar body (e.g. by hovering out or blurring).
   */
  private _leaveHandler;
  /**
   * Triggered on mousedown or touchstart on a date cell.
   * Respsonsible for starting a drag sequence.
   */
  private _mousedownHandler;
  /** Triggered on mouseup anywhere. Respsonsible for ending a drag sequence. */
  private _mouseupHandler;
  /** Triggered on touchend anywhere. Respsonsible for ending a drag sequence. */
  private _touchendHandler;
  /** Finds the MatCalendarCell that corresponds to a DOM node. */
  private _getCellFromElement;
  private _id;
  _startDateLabelId: string;
  _endDateLabelId: string;
  static ɵfac: i0.ɵɵFactoryDeclaration<CalendarBody<any>, never>;
  static ɵcmp: i0.ɵɵComponentDeclaration<
    CalendarBody<any>,
    '[calendar-body]',
    ['calendarBody'],
    {
      label: { alias: 'label'; required: false };
      rows: { alias: 'rows'; required: false };
      todayValue: { alias: 'todayValue'; required: false };
      startValue: { alias: 'startValue'; required: false };
      endValue: { alias: 'endValue'; required: false };
      labelMinRequiredCells: { alias: 'labelMinRequiredCells'; required: false };
      numCols: { alias: 'numCols'; required: false };
      activeCell: { alias: 'activeCell'; required: false };
      isRange: { alias: 'isRange'; required: false };
      cellAspectRatio: { alias: 'cellAspectRatio'; required: false };
      comparisonStart: { alias: 'comparisonStart'; required: false };
      comparisonEnd: { alias: 'comparisonEnd'; required: false };
      previewStart: { alias: 'previewStart'; required: false };
      previewEnd: { alias: 'previewEnd'; required: false };
      startDateAccessibleName: { alias: 'startDateAccessibleName'; required: false };
      endDateAccessibleName: { alias: 'endDateAccessibleName'; required: false };
    },
    {
      selectedValueChange: 'selectedValueChange';
      previewChange: 'previewChange';
      activeDateChange: 'activeDateChange';
      dragStarted: 'dragStarted';
      dragEnded: 'dragEnded';
    },
    never,
    never,
    true,
    never
  >;
}
