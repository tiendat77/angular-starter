import { Directionality } from '@angular/cdk/bidi';
import * as i0 from '@angular/core';
import { AfterContentInit, ChangeDetectorRef, EventEmitter, OnDestroy } from '@angular/core';
import { DateAdapter, DateFormats } from '../adapter';
import { DateRange } from '../date-picker/date-selection-model';
import {
  CalendarBody,
  CalendarCell,
  CalendarCellClassFunction,
  CalendarUserEvent,
} from './calendar-body';
/**
 * An internal component used to display a single year in the datepicker.
 * @docs-private
 */
export declare class YearView<D> implements AfterContentInit, OnDestroy {
  readonly _changeDetectorRef: ChangeDetectorRef;
  private _dateFormats;
  _dateAdapter: DateAdapter<D>;
  private _dir?;
  private _rerenderSubscription;
  /** Flag used to filter out space/enter keyup events that originated outside of the view. */
  private _selectionKeyPressed;
  /** The date to display in this year view (everything other than the year is ignored). */
  get activeDate(): D;
  set activeDate(value: D);
  private _activeDate;
  /** The currently selected date. */
  get selected(): DateRange<D> | D | null;
  set selected(value: DateRange<D> | D | null);
  private _selected;
  /** The minimum selectable date. */
  get minDate(): D | null;
  set minDate(value: D | null);
  private _minDate;
  /** The maximum selectable date. */
  get maxDate(): D | null;
  set maxDate(value: D | null);
  private _maxDate;
  /** A function used to filter which dates are selectable. */
  dateFilter: (date: D) => boolean;
  /** Function that can be used to add custom CSS classes to date cells. */
  dateClass: CalendarCellClassFunction<D>;
  /** Emits when a new month is selected. */
  readonly selectedChange: EventEmitter<D>;
  /** Emits the selected month. This doesn't imply a change on the selected date */
  readonly monthSelected: EventEmitter<D>;
  /** Emits when any date is activated. */
  readonly activeDateChange: EventEmitter<D>;
  /** The body of calendar table */
  _calendarBody: CalendarBody;
  /** Grid of calendar cells representing the months of the year. */
  _months: CalendarCell[][];
  /** The label for this year (e.g. "2017"). */
  _yearLabel: string;
  /** The month in this year that today falls on. Null if today is in a different year. */
  _todayMonth: number | null;
  /**
   * The month in this year that the selected Date falls on.
   * Null if the selected Date is in a different year.
   */
  _selectedMonth: number | null;
  constructor(
    _changeDetectorRef: ChangeDetectorRef,
    _dateFormats: DateFormats,
    _dateAdapter: DateAdapter<D>,
    _dir?: Directionality | undefined
  );
  ngAfterContentInit(): void;
  ngOnDestroy(): void;
  /** Handles when a new month is selected. */
  _monthSelected(event: CalendarUserEvent<number>): void;
  /**
   * Takes the index of a calendar body cell wrapped in an event as argument. For the date that
   * corresponds to the given cell, set `activeDate` to that date and fire `activeDateChange` with
   * that date.
   *
   * This function is used to match each component's model of the active date with the calendar
   * body cell that was focused. It updates its value of `activeDate` synchronously and updates the
   * parent's value asynchronously via the `activeDateChange` event. The child component receives an
   * updated value asynchronously via the `activeCell` Input.
   */
  _updateActiveDate(event: CalendarUserEvent<number>): void;
  /** Handles keydown events on the calendar body when calendar is in year view. */
  _handleCalendarBodyKeydown(event: KeyboardEvent): void;
  /** Handles keyup events on the calendar body when calendar is in year view. */
  _handleCalendarBodyKeyup(event: KeyboardEvent): void;
  /** Initializes this year view. */
  _init(): void;
  /** Focuses the active cell after the microtask queue is empty. */
  _focusActiveCell(): void;
  /** Schedules the matCalendarBody to focus the active cell after change detection has run */
  _focusActiveCellAfterViewChecked(): void;
  /**
   * Gets the month in this year that the given Date falls on.
   * Returns null if the given Date is in another year.
   */
  private _getMonthInCurrentYear;
  /**
   * Takes a month and returns a new date in the same day and year as the currently active date.
   *  The returned date will have the same month as the argument date.
   */
  private _getDateFromMonth;
  /** Creates an CalendarCell for the given month. */
  private _createCellForMonth;
  /** Whether the given month is enabled. */
  private _shouldEnableMonth;
  /**
   * Tests whether the combination month/year is after this.maxDate, considering
   * just the month and year of this.maxDate
   */
  private _isYearAndMonthAfterMaxDate;
  /**
   * Tests whether the combination month/year is before this.minDate, considering
   * just the month and year of this.minDate
   */
  private _isYearAndMonthBeforeMinDate;
  /** Determines whether the user has the RTL layout direction. */
  private _isRtl;
  /** Sets the currently-selected month based on a model value. */
  private _setSelectedMonth;
  static ɵfac: i0.ɵɵFactoryDeclaration<
    YearView<any>,
    [null, { optional: true }, { optional: true }, { optional: true }]
  >;
  static ɵcmp: i0.ɵɵComponentDeclaration<
    YearView<any>,
    'year-view',
    ['yearView'],
    {
      activeDate: { alias: 'activeDate'; required: false };
      selected: { alias: 'selected'; required: false };
      minDate: { alias: 'minDate'; required: false };
      maxDate: { alias: 'maxDate'; required: false };
      dateFilter: { alias: 'dateFilter'; required: false };
      dateClass: { alias: 'dateClass'; required: false };
    },
    {
      selectedChange: 'selectedChange';
      monthSelected: 'monthSelected';
      activeDateChange: 'activeDateChange';
    },
    never,
    never,
    true,
    never
  >;
}
