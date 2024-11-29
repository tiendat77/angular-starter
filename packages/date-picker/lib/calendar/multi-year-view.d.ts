import { Directionality } from '@angular/cdk/bidi';
import * as i0 from '@angular/core';
import { AfterContentInit, ChangeDetectorRef, EventEmitter, OnDestroy } from '@angular/core';
import { DateAdapter } from '../adapter';
import { DateRange } from '../date-picker/date-selection-model';
import {
  CalendarBody,
  CalendarCell,
  CalendarCellClassFunction,
  CalendarUserEvent,
} from './calendar-body';
export declare const yearsPerPage = 24;
export declare const yearsPerRow = 4;
/**
 * An internal component used to display a year selector in the datepicker.
 * @docs-private
 */
export declare class MultiYearView<D> implements AfterContentInit, OnDestroy {
  private _changeDetectorRef;
  _dateAdapter: DateAdapter<D>;
  private _dir?;
  private _rerenderSubscription;
  /** Flag used to filter out space/enter keyup events that originated outside of the view. */
  private _selectionKeyPressed;
  /** The date to display in this multi-year view (everything other than the year is ignored). */
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
  /** Emits when a new year is selected. */
  readonly selectedChange: EventEmitter<D>;
  /** Emits the selected year. This doesn't imply a change on the selected date */
  readonly yearSelected: EventEmitter<D>;
  /** Emits when any date is activated. */
  readonly activeDateChange: EventEmitter<D>;
  /** The body of calendar table */
  _calendarBody: CalendarBody;
  /** Grid of calendar cells representing the currently displayed years. */
  _years: CalendarCell[][];
  /** The year that today falls on. */
  _todayYear: number;
  /** The year of the selected date. Null if the selected date is null. */
  _selectedYear: number | null;
  constructor(
    _changeDetectorRef: ChangeDetectorRef,
    _dateAdapter: DateAdapter<D>,
    _dir?: Directionality | undefined
  );
  ngAfterContentInit(): void;
  ngOnDestroy(): void;
  /** Initializes this multi-year view. */
  _init(): void;
  /** Handles when a new year is selected. */
  _yearSelected(event: CalendarUserEvent<number>): void;
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
  /** Handles keydown events on the calendar body when calendar is in multi-year view. */
  _handleCalendarBodyKeydown(event: KeyboardEvent): void;
  /** Handles keyup events on the calendar body when calendar is in multi-year view. */
  _handleCalendarBodyKeyup(event: KeyboardEvent): void;
  _getActiveCell(): number;
  /** Focuses the active cell after the microtask queue is empty. */
  _focusActiveCell(): void;
  /** Focuses the active cell after change detection has run and the microtask queue is empty. */
  _focusActiveCellAfterViewChecked(): void;
  /**
   * Takes a year and returns a new date on the same day and month as the currently active date
   *  The returned date will have the same year as the argument date.
   */
  private _getDateFromYear;
  /** Creates an CalendarCell for the given year. */
  private _createCellForYear;
  /** Whether the given year is enabled. */
  private _shouldEnableYear;
  /** Determines whether the user has the RTL layout direction. */
  private _isRtl;
  /** Sets the currently-highlighted year based on a model value. */
  private _setSelectedYear;
  static ɵfac: i0.ɵɵFactoryDeclaration<
    MultiYearView<any>,
    [null, { optional: true }, { optional: true }]
  >;
  static ɵcmp: i0.ɵɵComponentDeclaration<
    MultiYearView<any>,
    'multi-year-view',
    ['multiYearView'],
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
      yearSelected: 'yearSelected';
      activeDateChange: 'activeDateChange';
    },
    never,
    never,
    true,
    never
  >;
}
export declare function isSameMultiYearView<D>(
  dateAdapter: DateAdapter<D>,
  date1: D,
  date2: D,
  minDate: D | null,
  maxDate: D | null
): boolean;
/**
 * When the multi-year view is first opened, the active year will be in view.
 * So we compute how many years are between the active year and the *slot* where our
 * "startingYear" will render when paged into view.
 */
export declare function getActiveOffset<D>(
  dateAdapter: DateAdapter<D>,
  activeDate: D,
  minDate: D | null,
  maxDate: D | null
): number;
