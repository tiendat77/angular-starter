/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as i2 from '@angular/cdk/bidi';
import {
  DOWN_ARROW,
  END,
  ENTER,
  HOME,
  LEFT_ARROW,
  PAGE_DOWN,
  PAGE_UP,
  RIGHT_ARROW,
  SPACE,
  UP_ARROW,
} from '@angular/cdk/keycodes';
import * as i0 from '@angular/core';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Inject,
  Input,
  Optional,
  Output,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { startWith } from 'rxjs/operators';
import * as i1 from '../adapter';
import { DATE_FORMATS } from '../adapter';
import { DateRange } from '../date-picker/date-selection-model';
import { createMissingDateImplError } from '../utils/errors';
import { CalendarBody, CalendarCell } from './calendar-body';
/**
 * An internal component used to display a single year in the datepicker.
 * @docs-private
 */
export class YearView {
  _changeDetectorRef;
  _dateFormats;
  _dateAdapter;
  _dir;
  _rerenderSubscription = Subscription.EMPTY;
  /** Flag used to filter out space/enter keyup events that originated outside of the view. */
  _selectionKeyPressed;
  /** The date to display in this year view (everything other than the year is ignored). */
  get activeDate() {
    return this._activeDate;
  }
  set activeDate(value) {
    const oldActiveDate = this._activeDate;
    const validDate =
      this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(value)) ||
      this._dateAdapter.today();
    this._activeDate = this._dateAdapter.clampDate(validDate, this.minDate, this.maxDate);
    if (this._dateAdapter.getYear(oldActiveDate) !== this._dateAdapter.getYear(this._activeDate)) {
      this._init();
    }
  }
  _activeDate;
  /** The currently selected date. */
  get selected() {
    return this._selected;
  }
  set selected(value) {
    if (value instanceof DateRange) {
      this._selected = value;
    } else {
      this._selected = this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(value));
    }
    this._setSelectedMonth(value);
  }
  _selected;
  /** The minimum selectable date. */
  get minDate() {
    return this._minDate;
  }
  set minDate(value) {
    this._minDate = this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(value));
  }
  _minDate;
  /** The maximum selectable date. */
  get maxDate() {
    return this._maxDate;
  }
  set maxDate(value) {
    this._maxDate = this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(value));
  }
  _maxDate;
  /** A function used to filter which dates are selectable. */
  dateFilter;
  /** Function that can be used to add custom CSS classes to date cells. */
  dateClass;
  /** Emits when a new month is selected. */
  selectedChange = new EventEmitter();
  /** Emits the selected month. This doesn't imply a change on the selected date */
  monthSelected = new EventEmitter();
  /** Emits when any date is activated. */
  activeDateChange = new EventEmitter();
  /** The body of calendar table */
  _calendarBody;
  /** Grid of calendar cells representing the months of the year. */
  _months;
  /** The label for this year (e.g. "2017"). */
  _yearLabel;
  /** The month in this year that today falls on. Null if today is in a different year. */
  _todayMonth;
  /**
   * The month in this year that the selected Date falls on.
   * Null if the selected Date is in a different year.
   */
  _selectedMonth;
  constructor(_changeDetectorRef, _dateFormats, _dateAdapter, _dir) {
    this._changeDetectorRef = _changeDetectorRef;
    this._dateFormats = _dateFormats;
    this._dateAdapter = _dateAdapter;
    this._dir = _dir;
    if (!this._dateAdapter) {
      throw createMissingDateImplError('DateAdapter');
    }
    if (!this._dateFormats) {
      throw createMissingDateImplError('DATE_FORMATS');
    }
    this._activeDate = this._dateAdapter.today();
  }
  ngAfterContentInit() {
    this._rerenderSubscription = this._dateAdapter.localeChanges
      .pipe(startWith(null))
      .subscribe(() => this._init());
  }
  ngOnDestroy() {
    this._rerenderSubscription.unsubscribe();
  }
  /** Handles when a new month is selected. */
  _monthSelected(event) {
    const month = event.value;
    const selectedMonth = this._dateAdapter.createDate(
      this._dateAdapter.getYear(this.activeDate),
      month,
      1
    );
    this.monthSelected.emit(selectedMonth);
    const selectedDate = this._getDateFromMonth(month);
    this.selectedChange.emit(selectedDate);
  }
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
  _updateActiveDate(event) {
    const month = event.value;
    const oldActiveDate = this._activeDate;
    this.activeDate = this._getDateFromMonth(month);
    if (this._dateAdapter.compareDate(oldActiveDate, this.activeDate)) {
      this.activeDateChange.emit(this.activeDate);
    }
  }
  /** Handles keydown events on the calendar body when calendar is in year view. */
  _handleCalendarBodyKeydown(event) {
    // TODO(mmalerba): We currently allow keyboard navigation to disabled dates, but just prevent
    // disabled ones from being selected. This may not be ideal, we should look into whether
    // navigation should skip over disabled dates, and if so, how to implement that efficiently.
    const oldActiveDate = this._activeDate;
    const isRtl = this._isRtl();
    switch (event.keyCode) {
      case LEFT_ARROW:
        this.activeDate = this._dateAdapter.addCalendarMonths(this._activeDate, isRtl ? 1 : -1);
        break;
      case RIGHT_ARROW:
        this.activeDate = this._dateAdapter.addCalendarMonths(this._activeDate, isRtl ? -1 : 1);
        break;
      case UP_ARROW:
        this.activeDate = this._dateAdapter.addCalendarMonths(this._activeDate, -4);
        break;
      case DOWN_ARROW:
        this.activeDate = this._dateAdapter.addCalendarMonths(this._activeDate, 4);
        break;
      case HOME:
        this.activeDate = this._dateAdapter.addCalendarMonths(
          this._activeDate,
          -this._dateAdapter.getMonth(this._activeDate)
        );
        break;
      case END:
        this.activeDate = this._dateAdapter.addCalendarMonths(
          this._activeDate,
          11 - this._dateAdapter.getMonth(this._activeDate)
        );
        break;
      case PAGE_UP:
        this.activeDate = this._dateAdapter.addCalendarYears(
          this._activeDate,
          event.altKey ? -10 : -1
        );
        break;
      case PAGE_DOWN:
        this.activeDate = this._dateAdapter.addCalendarYears(
          this._activeDate,
          event.altKey ? 10 : 1
        );
        break;
      case ENTER:
      case SPACE:
        // Note that we only prevent the default action here while the selection happens in
        // `keyup` below. We can't do the selection here, because it can cause the calendar to
        // reopen if focus is restored immediately. We also can't call `preventDefault` on `keyup`
        // because it's too late (see #23305).
        this._selectionKeyPressed = true;
        break;
      default:
        // Don't prevent default or focus active cell on keys that we don't explicitly handle.
        return;
    }
    if (this._dateAdapter.compareDate(oldActiveDate, this.activeDate)) {
      this.activeDateChange.emit(this.activeDate);
      this._focusActiveCellAfterViewChecked();
    }
    // Prevent unexpected default actions such as form submission.
    event.preventDefault();
  }
  /** Handles keyup events on the calendar body when calendar is in year view. */
  _handleCalendarBodyKeyup(event) {
    if (event.keyCode === SPACE || event.keyCode === ENTER) {
      if (this._selectionKeyPressed) {
        this._monthSelected({ value: this._dateAdapter.getMonth(this._activeDate), event });
      }
      this._selectionKeyPressed = false;
    }
  }
  /** Initializes this year view. */
  _init() {
    this._setSelectedMonth(this.selected);
    this._todayMonth = this._getMonthInCurrentYear(this._dateAdapter.today());
    this._yearLabel = this._dateAdapter.getYearName(this.activeDate);
    const monthNames = this._dateAdapter.getMonthNames('short');
    // First row of months only contains 5 elements so we can fit the year label on the same row.
    this._months = [
      [0, 1, 2, 3],
      [4, 5, 6, 7],
      [8, 9, 10, 11],
    ].map((row) => row.map((month) => this._createCellForMonth(month, monthNames[month])));
    this._changeDetectorRef.markForCheck();
  }
  /** Focuses the active cell after the microtask queue is empty. */
  _focusActiveCell() {
    this._calendarBody._focusActiveCell();
  }
  /** Schedules the matCalendarBody to focus the active cell after change detection has run */
  _focusActiveCellAfterViewChecked() {
    this._calendarBody._scheduleFocusActiveCellAfterViewChecked();
  }
  /**
   * Gets the month in this year that the given Date falls on.
   * Returns null if the given Date is in another year.
   */
  _getMonthInCurrentYear(date) {
    return date && this._dateAdapter.getYear(date) == this._dateAdapter.getYear(this.activeDate)
      ? this._dateAdapter.getMonth(date)
      : null;
  }
  /**
   * Takes a month and returns a new date in the same day and year as the currently active date.
   *  The returned date will have the same month as the argument date.
   */
  _getDateFromMonth(month) {
    const normalizedDate = this._dateAdapter.createDate(
      this._dateAdapter.getYear(this.activeDate),
      month,
      1
    );
    const daysInMonth = this._dateAdapter.getNumDaysInMonth(normalizedDate);
    return this._dateAdapter.createDate(
      this._dateAdapter.getYear(this.activeDate),
      month,
      Math.min(this._dateAdapter.getDate(this.activeDate), daysInMonth)
    );
  }
  /** Creates an CalendarCell for the given month. */
  _createCellForMonth(month, monthName) {
    const date = this._dateAdapter.createDate(this._dateAdapter.getYear(this.activeDate), month, 1);
    const ariaLabel = this._dateAdapter.format(date, this._dateFormats.display.monthYearA11yLabel);
    const cellClasses = this.dateClass ? this.dateClass(date, 'year') : undefined;
    return new CalendarCell(
      month,
      monthName.toLocaleUpperCase(),
      ariaLabel,
      this._shouldEnableMonth(month),
      cellClasses
    );
  }
  /** Whether the given month is enabled. */
  _shouldEnableMonth(month) {
    const activeYear = this._dateAdapter.getYear(this.activeDate);
    if (
      month === undefined ||
      month === null ||
      this._isYearAndMonthAfterMaxDate(activeYear, month) ||
      this._isYearAndMonthBeforeMinDate(activeYear, month)
    ) {
      return false;
    }
    if (!this.dateFilter) {
      return true;
    }
    const firstOfMonth = this._dateAdapter.createDate(activeYear, month, 1);
    // If any date in the month is enabled count the month as enabled.
    for (
      let date = firstOfMonth;
      this._dateAdapter.getMonth(date) == month;
      date = this._dateAdapter.addCalendarDays(date, 1)
    ) {
      if (this.dateFilter(date)) {
        return true;
      }
    }
    return false;
  }
  /**
   * Tests whether the combination month/year is after this.maxDate, considering
   * just the month and year of this.maxDate
   */
  _isYearAndMonthAfterMaxDate(year, month) {
    if (this.maxDate) {
      const maxYear = this._dateAdapter.getYear(this.maxDate);
      const maxMonth = this._dateAdapter.getMonth(this.maxDate);
      return year > maxYear || (year === maxYear && month > maxMonth);
    }
    return false;
  }
  /**
   * Tests whether the combination month/year is before this.minDate, considering
   * just the month and year of this.minDate
   */
  _isYearAndMonthBeforeMinDate(year, month) {
    if (this.minDate) {
      const minYear = this._dateAdapter.getYear(this.minDate);
      const minMonth = this._dateAdapter.getMonth(this.minDate);
      return year < minYear || (year === minYear && month < minMonth);
    }
    return false;
  }
  /** Determines whether the user has the RTL layout direction. */
  _isRtl() {
    return this._dir && this._dir.value === 'rtl';
  }
  /** Sets the currently-selected month based on a model value. */
  _setSelectedMonth(value) {
    if (value instanceof DateRange) {
      this._selectedMonth =
        this._getMonthInCurrentYear(value.start) || this._getMonthInCurrentYear(value.end);
    } else {
      this._selectedMonth = this._getMonthInCurrentYear(value);
    }
  }
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: '12.0.0',
    version: '18.2.13',
    ngImport: i0,
    type: YearView,
    deps: [
      { token: i0.ChangeDetectorRef },
      { token: DATE_FORMATS, optional: true },
      { token: i1.DateAdapter, optional: true },
      { token: i2.Directionality, optional: true },
    ],
    target: i0.ɵɵFactoryTarget.Component,
  });
  static ɵcmp = i0.ɵɵngDeclareComponent({
    minVersion: '14.0.0',
    version: '18.2.13',
    type: YearView,
    isStandalone: true,
    selector: 'year-view',
    inputs: {
      activeDate: 'activeDate',
      selected: 'selected',
      minDate: 'minDate',
      maxDate: 'maxDate',
      dateFilter: 'dateFilter',
      dateClass: 'dateClass',
    },
    outputs: {
      selectedChange: 'selectedChange',
      monthSelected: 'monthSelected',
      activeDateChange: 'activeDateChange',
    },
    viewQueries: [
      { propertyName: '_calendarBody', first: true, predicate: CalendarBody, descendants: true },
    ],
    exportAs: ['yearView'],
    ngImport: i0,
    template:
      '<!-- eslint-disable @angular-eslint/template/interactive-supports-focus -->\n<table\n  class="calendar-table"\n  role="grid"\n>\n  <thead\n    aria-hidden="true"\n    class="calendar-table-header"\n  >\n    <tr>\n      <th\n        class="calendar-table-header-divider"\n        colspan="4"\n      ></th>\n    </tr>\n  </thead>\n  <tbody\n    calendar-body\n    [label]="_yearLabel"\n    [rows]="_months"\n    [todayValue]="_todayMonth!"\n    [startValue]="_selectedMonth!"\n    [endValue]="_selectedMonth!"\n    [labelMinRequiredCells]="2"\n    [numCols]="4"\n    [cellAspectRatio]="4 / 7"\n    [activeCell]="_dateAdapter.getMonth(activeDate)"\n    (selectedValueChange)="_monthSelected($event)"\n    (activeDateChange)="_updateActiveDate($event)"\n    (keyup)="_handleCalendarBodyKeyup($event)"\n    (keydown)="_handleCalendarBodyKeydown($event)"\n  ></tbody>\n</table>\n',
    dependencies: [
      {
        kind: 'component',
        type: CalendarBody,
        selector: '[calendar-body]',
        inputs: [
          'label',
          'rows',
          'todayValue',
          'startValue',
          'endValue',
          'labelMinRequiredCells',
          'numCols',
          'activeCell',
          'isRange',
          'cellAspectRatio',
          'comparisonStart',
          'comparisonEnd',
          'previewStart',
          'previewEnd',
          'startDateAccessibleName',
          'endDateAccessibleName',
        ],
        outputs: [
          'selectedValueChange',
          'previewChange',
          'activeDateChange',
          'dragStarted',
          'dragEnded',
        ],
        exportAs: ['calendarBody'],
      },
    ],
    changeDetection: i0.ChangeDetectionStrategy.OnPush,
    encapsulation: i0.ViewEncapsulation.None,
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: '12.0.0',
  version: '18.2.13',
  ngImport: i0,
  type: YearView,
  decorators: [
    {
      type: Component,
      args: [
        {
          selector: 'year-view',
          exportAs: 'yearView',
          encapsulation: ViewEncapsulation.None,
          changeDetection: ChangeDetectionStrategy.OnPush,
          standalone: true,
          imports: [CalendarBody],
          template:
            '<!-- eslint-disable @angular-eslint/template/interactive-supports-focus -->\n<table\n  class="calendar-table"\n  role="grid"\n>\n  <thead\n    aria-hidden="true"\n    class="calendar-table-header"\n  >\n    <tr>\n      <th\n        class="calendar-table-header-divider"\n        colspan="4"\n      ></th>\n    </tr>\n  </thead>\n  <tbody\n    calendar-body\n    [label]="_yearLabel"\n    [rows]="_months"\n    [todayValue]="_todayMonth!"\n    [startValue]="_selectedMonth!"\n    [endValue]="_selectedMonth!"\n    [labelMinRequiredCells]="2"\n    [numCols]="4"\n    [cellAspectRatio]="4 / 7"\n    [activeCell]="_dateAdapter.getMonth(activeDate)"\n    (selectedValueChange)="_monthSelected($event)"\n    (activeDateChange)="_updateActiveDate($event)"\n    (keyup)="_handleCalendarBodyKeyup($event)"\n    (keydown)="_handleCalendarBodyKeydown($event)"\n  ></tbody>\n</table>\n',
        },
      ],
    },
  ],
  ctorParameters: () => [
    { type: i0.ChangeDetectorRef },
    {
      type: undefined,
      decorators: [
        {
          type: Optional,
        },
        {
          type: Inject,
          args: [DATE_FORMATS],
        },
      ],
    },
    {
      type: i1.DateAdapter,
      decorators: [
        {
          type: Optional,
        },
      ],
    },
    {
      type: i2.Directionality,
      decorators: [
        {
          type: Optional,
        },
      ],
    },
  ],
  propDecorators: {
    activeDate: [
      {
        type: Input,
      },
    ],
    selected: [
      {
        type: Input,
      },
    ],
    minDate: [
      {
        type: Input,
      },
    ],
    maxDate: [
      {
        type: Input,
      },
    ],
    dateFilter: [
      {
        type: Input,
      },
    ],
    dateClass: [
      {
        type: Input,
      },
    ],
    selectedChange: [
      {
        type: Output,
      },
    ],
    monthSelected: [
      {
        type: Output,
      },
    ],
    activeDateChange: [
      {
        type: Output,
      },
    ],
    _calendarBody: [
      {
        type: ViewChild,
        args: [CalendarBody],
      },
    ],
  },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieWVhci12aWV3LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vbGlicy9kYXRlLXBpY2tlci9zcmMvbGliL2NhbGVuZGFyL3llYXItdmlldy50cyIsIi4uLy4uLy4uLy4uLy4uL2xpYnMvZGF0ZS1waWNrZXIvc3JjL2xpYi9jYWxlbmRhci95ZWFyLXZpZXcuaHRtbCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQ0wsVUFBVSxFQUNWLEdBQUcsRUFDSCxLQUFLLEVBQ0wsSUFBSSxFQUNKLFVBQVUsRUFDVixTQUFTLEVBQ1QsT0FBTyxFQUNQLFdBQVcsRUFDWCxRQUFRLEVBQ1IsS0FBSyxHQUNOLE1BQU0sdUJBQXVCLENBQUM7QUFHL0IsT0FBTyxFQUVMLHVCQUF1QixFQUV2QixTQUFTLEVBQ1QsWUFBWSxFQUNaLE1BQU0sRUFDTixLQUFLLEVBQ0wsUUFBUSxFQUNSLE1BQU0sRUFDTixTQUFTLEVBQ1QsaUJBQWlCLEdBRWxCLE1BQU0sZUFBZSxDQUFDO0FBRXZCLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDcEMsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBRTNDLE9BQU8sRUFBZSxZQUFZLEVBQWUsTUFBTSxZQUFZLENBQUM7QUFDcEUsT0FBTyxFQUNMLFlBQVksRUFDWixZQUFZLEdBR2IsTUFBTSxpQkFBaUIsQ0FBQztBQUN6QixPQUFPLEVBQUUsMEJBQTBCLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUM3RCxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0scUNBQXFDLENBQUM7Ozs7QUFFaEU7OztHQUdHO0FBVUgsTUFBTSxPQUFPLFFBQVE7SUE2RlI7SUFDaUM7SUFDdkI7SUFDQztJQS9GZCxxQkFBcUIsR0FBRyxZQUFZLENBQUMsS0FBSyxDQUFDO0lBRW5ELDRGQUE0RjtJQUNwRixvQkFBb0IsQ0FBVTtJQUV0Qyx5RkFBeUY7SUFD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dHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1xuICBET1dOX0FSUk9XLFxuICBFTkQsXG4gIEVOVEVSLFxuICBIT01FLFxuICBMRUZUX0FSUk9XLFxuICBQQUdFX0RPV04sXG4gIFBBR0VfVVAsXG4gIFJJR0hUX0FSUk9XLFxuICBVUF9BUlJPVyxcbiAgU1BBQ0UsXG59IGZyb20gJ0Bhbmd1bGFyL2Nkay9rZXljb2Rlcyc7XG5pbXBvcnQgeyBEaXJlY3Rpb25hbGl0eSB9IGZyb20gJ0Bhbmd1bGFyL2Nkay9iaWRpJztcblxuaW1wb3J0IHtcbiAgQWZ0ZXJDb250ZW50SW5pdCxcbiAgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksXG4gIENoYW5nZURldGVjdG9yUmVmLFxuICBDb21wb25lbnQsXG4gIEV2ZW50RW1pdHRlcixcbiAgSW5qZWN0LFxuICBJbnB1dCxcbiAgT3B0aW9uYWwsXG4gIE91dHB1dCxcbiAgVmlld0NoaWxkLFxuICBWaWV3RW5jYXBzdWxhdGlvbixcbiAgT25EZXN0cm95LFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgU3Vic2NyaXB0aW9uIH0gZnJvbSAncnhqcyc7XG5pbXBvcnQgeyBzdGFydFdpdGggfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5cbmltcG9ydCB7IERhdGVBZGFwdGVyLCBEQVRFX0ZPUk1BVFMsIERhdGVGb3JtYXRzIH0gZnJvbSAnLi4vYWRhcHRlcic7XG5pbXBvcnQge1xuICBDYWxlbmRhckJvZHksXG4gIENhbGVuZGFyQ2VsbCxcbiAgQ2FsZW5kYXJVc2VyRXZlbnQsXG4gIENhbGVuZGFyQ2VsbENsYXNzRnVuY3Rpb24sXG59IGZyb20gJy4vY2FsZW5kYXItYm9keSc7XG5pbXBvcnQgeyBjcmVhdGVNaXNzaW5nRGF0ZUltcGxFcnJvciB9IGZyb20gJy4uL3V0aWxzL2Vycm9ycyc7XG5pbXBvcnQgeyBEYXRlUmFuZ2UgfSBmcm9tICcuLi9kYXRlLXBpY2tlci9kYXRlLXNlbGVjdGlvbi1tb2RlbCc7XG5cbi8qKlxuICogQW4gaW50ZXJuYWwgY29tcG9uZW50IHVzZWQgdG8gZGlzcGxheSBhIHNpbmdsZSB5ZWFyIGluIHRoZSBkYXRlcGlja2VyLlxuICogQGRvY3MtcHJpdmF0ZVxuICovXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICd5ZWFyLXZpZXcnLFxuICB0ZW1wbGF0ZVVybDogJ3llYXItdmlldy5odG1sJyxcbiAgZXhwb3J0QXM6ICd5ZWFyVmlldycsXG4gIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLk5vbmUsXG4gIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuT25QdXNoLFxuICBzdGFuZGFsb25lOiB0cnVlLFxuICBpbXBvcnRzOiBbQ2FsZW5kYXJCb2R5XSxcbn0pXG5leHBvcnQgY2xhc3MgWWVhclZpZXc8RD4gaW1wbGVtZW50cyBBZnRlckNvbnRlbnRJbml0LCBPbkRlc3Ryb3kge1xuICBwcml2YXRlIF9yZXJlbmRlclN1YnNjcmlwdGlvbiA9IFN1YnNjcmlwdGlvbi5FTVBUWTtcblxuICAvKiogRmxhZyB1c2VkIHRvIGZpbHRlciBvdXQgc3BhY2UvZW50ZXIga2V5dXAgZXZlbnRzIHRoYXQgb3JpZ2luYXRlZCBvdXRzaWRlIG9mIHRoZSB2aWV3LiAqL1xuICBwcml2YXRlIF9zZWxlY3Rpb25LZXlQcmVzc2VkOiBib29sZWFuO1xuXG4gIC8qKiBUaGUgZGF0ZSB0byBkaXNwbGF5IGluIHRoaXMgeWVhciB2aWV3IChldmVyeXRoaW5nIG90aGVyIHRoYW4gdGhlIHllYXIgaXMgaWdub3JlZCkuICovXG4gIEBJbnB1dCgpXG4gIGdldCBhY3RpdmVEYXRlKCk6IEQge1xuICAgIHJldHVybiB0aGlzLl9hY3RpdmVEYXRlO1xuICB9XG4gIHNldCBhY3RpdmVEYXRlKHZhbHVlOiBEKSB7XG4gICAgY29uc3Qgb2xkQWN0aXZlRGF0ZSA9IHRoaXMuX2FjdGl2ZURhdGU7XG4gICAgY29uc3QgdmFsaWREYXRlID1cbiAgICAgIHRoaXMuX2RhdGVBZGFwdGVyLmdldFZhbGlkRGF0ZU9yTnVsbCh0aGlzLl9kYXRlQWRhcHRlci5kZXNlcmlhbGl6ZSh2YWx1ZSkpIHx8XG4gICAgICB0aGlzLl9kYXRlQWRhcHRlci50b2RheSgpO1xuICAgIHRoaXMuX2FjdGl2ZURhdGUgPSB0aGlzLl9kYXRlQWRhcHRlci5jbGFtcERhdGUodmFsaWREYXRlLCB0aGlzLm1pbkRhdGUsIHRoaXMubWF4RGF0ZSk7XG4gICAgaWYgKHRoaXMuX2RhdGVBZGFwdGVyLmdldFllYXIob2xkQWN0aXZlRGF0ZSkgIT09IHRoaXMuX2RhdGVBZGFwdGVyLmdldFllYXIodGhpcy5fYWN0aXZlRGF0ZSkpIHtcbiAgICAgIHRoaXMuX2luaXQoKTtcbiAgICB9XG4gIH1cbiAgcHJpdmF0ZSBfYWN0aXZlRGF0ZTogRDtcblxuICAvKiogVGhlIGN1cnJlbnRseSBzZWxlY3RlZCBkYXRlLiAqL1xuICBASW5wdXQoKVxuICBnZXQgc2VsZWN0ZWQoKTogRGF0ZVJhbmdlPEQ+IHwgRCB8IG51bGwge1xuICAgIHJldHVybiB0aGlzLl9zZWxlY3RlZDtcbiAgfVxuICBzZXQgc2VsZWN0ZWQodmFsdWU6IERhdGVSYW5nZTxEPiB8IEQgfCBudWxsKSB7XG4gICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgRGF0ZVJhbmdlKSB7XG4gICAgICB0aGlzLl9zZWxlY3RlZCA9IHZhbHVlO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9zZWxlY3RlZCA9IHRoaXMuX2RhdGVBZGFwdGVyLmdldFZhbGlkRGF0ZU9yTnVsbCh0aGlzLl9kYXRlQWRhcHRlci5kZXNlcmlhbGl6ZSh2YWx1ZSkpO1xuICAgIH1cblxuICAgIHRoaXMuX3NldFNlbGVjdGVkTW9udGgodmFsdWUpO1xuICB9XG4gIHByaXZhdGUgX3NlbGVjdGVkOiBEYXRlUmFuZ2U8RD4gfCBEIHwgbnVsbDtcblxuICAvKiogVGhlIG1pbmltdW0gc2VsZWN0YWJsZSBkYXRlLiAqL1xuICBASW5wdXQoKVxuICBnZXQgbWluRGF0ZSgpOiBEIHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuX21pbkRhdGU7XG4gIH1cbiAgc2V0IG1pbkRhdGUodmFsdWU6IEQgfCBudWxsKSB7XG4gICAgdGhpcy5fbWluRGF0ZSA9IHRoaXMuX2RhdGVBZGFwdGVyLmdldFZhbGlkRGF0ZU9yTnVsbCh0aGlzLl9kYXRlQWRhcHRlci5kZXNlcmlhbGl6ZSh2YWx1ZSkpO1xuICB9XG4gIHByaXZhdGUgX21pbkRhdGU6IEQgfCBudWxsO1xuXG4gIC8qKiBUaGUgbWF4aW11bSBzZWxlY3RhYmxlIGRhdGUuICovXG4gIEBJbnB1dCgpXG4gIGdldCBtYXhEYXRlKCk6IEQgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5fbWF4RGF0ZTtcbiAgfVxuICBzZXQgbWF4RGF0ZSh2YWx1ZTogRCB8IG51bGwpIHtcbiAgICB0aGlzLl9tYXhEYXRlID0gdGhpcy5fZGF0ZUFkYXB0ZXIuZ2V0VmFsaWREYXRlT3JOdWxsKHRoaXMuX2RhdGVBZGFwdGVyLmRlc2VyaWFsaXplKHZhbHVlKSk7XG4gIH1cbiAgcHJpdmF0ZSBfbWF4RGF0ZTogRCB8IG51bGw7XG5cbiAgLyoqIEEgZnVuY3Rpb24gdXNlZCB0byBmaWx0ZXIgd2hpY2ggZGF0ZXMgYXJlIHNlbGVjdGFibGUuICovXG4gIEBJbnB1dCgpIGRhdGVGaWx0ZXI6IChkYXRlOiBEKSA9PiBib29sZWFuO1xuXG4gIC8qKiBGdW5jdGlvbiB0aGF0IGNhbiBiZSB1c2VkIHRvIGFkZCBjdXN0b20gQ1NTIGNsYXNzZXMgdG8gZGF0ZSBjZWxscy4gKi9cbiAgQElucHV0KCkgZGF0ZUNsYXNzOiBDYWxlbmRhckNlbGxDbGFzc0Z1bmN0aW9uPEQ+O1xuXG4gIC8qKiBFbWl0cyB3aGVuIGEgbmV3IG1vbnRoIGlzIHNlbGVjdGVkLiAqL1xuICBAT3V0cHV0KCkgcmVhZG9ubHkgc2VsZWN0ZWRDaGFuZ2U6IEV2ZW50RW1pdHRlcjxEPiA9IG5ldyBFdmVudEVtaXR0ZXI8RD4oKTtcblxuICAvKiogRW1pdHMgdGhlIHNlbGVjdGVkIG1vbnRoLiBUaGlzIGRvZXNuJ3QgaW1wbHkgYSBjaGFuZ2Ugb24gdGhlIHNlbGVjdGVkIGRhdGUgKi9cbiAgQE91dHB1dCgpIHJlYWRvbmx5IG1vbnRoU2VsZWN0ZWQ6IEV2ZW50RW1pdHRlcjxEPiA9IG5ldyBFdmVudEVtaXR0ZXI8RD4oKTtcblxuICAvKiogRW1pdHMgd2hlbiBhbnkgZGF0ZSBpcyBhY3RpdmF0ZWQuICovXG4gIEBPdXRwdXQoKSByZWFkb25seSBhY3RpdmVEYXRlQ2hhbmdlOiBFdmVudEVtaXR0ZXI8RD4gPSBuZXcgRXZlbnRFbWl0dGVyPEQ+KCk7XG5cbiAgLyoqIFRoZSBib2R5IG9mIGNhbGVuZGFyIHRhYmxlICovXG4gIEBWaWV3Q2hpbGQoQ2FsZW5kYXJCb2R5KSBfY2FsZW5kYXJCb2R5OiBDYWxlbmRhckJvZHk7XG5cbiAgLyoqIEdyaWQgb2YgY2FsZW5kYXIgY2VsbHMgcmVwcmVzZW50aW5nIHRoZSBtb250aHMgb2YgdGhlIHllYXIuICovXG4gIF9tb250aHM6IENhbGVuZGFyQ2VsbFtdW107XG5cbiAgLyoqIFRoZSBsYWJlbCBmb3IgdGhpcyB5ZWFyIChlLmcuIFwiMjAxN1wiKS4gKi9cbiAgX3llYXJMYWJlbDogc3RyaW5nO1xuXG4gIC8qKiBUaGUgbW9udGggaW4gdGhpcyB5ZWFyIHRoYXQgdG9kYXkgZmFsbHMgb24uIE51bGwgaWYgdG9kYXkgaXMgaW4gYSBkaWZmZXJlbnQgeWVhci4gKi9cbiAgX3RvZGF5TW9udGg6IG51bWJlciB8IG51bGw7XG5cbiAgLyoqXG4gICAqIFRoZSBtb250aCBpbiB0aGlzIHllYXIgdGhhdCB0aGUgc2VsZWN0ZWQgRGF0ZSBmYWxscyBvbi5cbiAgICogTnVsbCBpZiB0aGUgc2VsZWN0ZWQgRGF0ZSBpcyBpbiBhIGRpZmZlcmVudCB5ZWFyLlxuICAgKi9cbiAgX3NlbGVjdGVkTW9udGg6IG51bWJlciB8IG51bGw7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcmVhZG9ubHkgX2NoYW5nZURldGVjdG9yUmVmOiBDaGFuZ2VEZXRlY3RvclJlZixcbiAgICBAT3B0aW9uYWwoKSBASW5qZWN0KERBVEVfRk9STUFUUykgcHJpdmF0ZSBfZGF0ZUZvcm1hdHM6IERhdGVGb3JtYXRzLFxuICAgIEBPcHRpb25hbCgpIHB1YmxpYyBfZGF0ZUFkYXB0ZXI6IERhdGVBZGFwdGVyPEQ+LFxuICAgIEBPcHRpb25hbCgpIHByaXZhdGUgX2Rpcj86IERpcmVjdGlvbmFsaXR5XG4gICkge1xuICAgIGlmICghdGhpcy5fZGF0ZUFkYXB0ZXIpIHtcbiAgICAgIHRocm93IGNyZWF0ZU1pc3NpbmdEYXRlSW1wbEVycm9yKCdEYXRlQWRhcHRlcicpO1xuICAgIH1cbiAgICBpZiAoIXRoaXMuX2RhdGVGb3JtYXRzKSB7XG4gICAgICB0aHJvdyBjcmVhdGVNaXNzaW5nRGF0ZUltcGxFcnJvcignREFURV9GT1JNQVRTJyk7XG4gICAgfVxuXG4gICAgdGhpcy5fYWN0aXZlRGF0ZSA9IHRoaXMuX2RhdGVBZGFwdGVyLnRvZGF5KCk7XG4gIH1cblxuICBuZ0FmdGVyQ29udGVudEluaXQoKSB7XG4gICAgdGhpcy5fcmVyZW5kZXJTdWJzY3JpcHRpb24gPSB0aGlzLl9kYXRlQWRhcHRlci5sb2NhbGVDaGFuZ2VzXG4gICAgICAucGlwZShzdGFydFdpdGgobnVsbCkpXG4gICAgICAuc3Vic2NyaWJlKCgpID0+IHRoaXMuX2luaXQoKSk7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICB0aGlzLl9yZXJlbmRlclN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xuICB9XG5cbiAgLyoqIEhhbmRsZXMgd2hlbiBhIG5ldyBtb250aCBpcyBzZWxlY3RlZC4gKi9cbiAgX21vbnRoU2VsZWN0ZWQoZXZlbnQ6IENhbGVuZGFyVXNlckV2ZW50PG51bWJlcj4pIHtcbiAgICBjb25zdCBtb250aCA9IGV2ZW50LnZhbHVlO1xuXG4gICAgY29uc3Qgc2VsZWN0ZWRNb250aCA9IHRoaXMuX2RhdGVBZGFwdGVyLmNyZWF0ZURhdGUoXG4gICAgICB0aGlzLl9kYXRlQWRhcHRlci5nZXRZZWFyKHRoaXMuYWN0aXZlRGF0ZSksXG4gICAgICBtb250aCxcbiAgICAgIDFcbiAgICApO1xuICAgIHRoaXMubW9udGhTZWxlY3RlZC5lbWl0KHNlbGVjdGVkTW9udGgpO1xuXG4gICAgY29uc3Qgc2VsZWN0ZWREYXRlID0gdGhpcy5fZ2V0RGF0ZUZyb21Nb250aChtb250aCk7XG4gICAgdGhpcy5zZWxlY3RlZENoYW5nZS5lbWl0KHNlbGVjdGVkRGF0ZSk7XG4gIH1cblxuICAvKipcbiAgICogVGFrZXMgdGhlIGluZGV4IG9mIGEgY2FsZW5kYXIgYm9keSBjZWxsIHdyYXBwZWQgaW4gYW4gZXZlbnQgYXMgYXJndW1lbnQuIEZvciB0aGUgZGF0ZSB0aGF0XG4gICAqIGNvcnJlc3BvbmRzIHRvIHRoZSBnaXZlbiBjZWxsLCBzZXQgYGFjdGl2ZURhdGVgIHRvIHRoYXQgZGF0ZSBhbmQgZmlyZSBgYWN0aXZlRGF0ZUNoYW5nZWAgd2l0aFxuICAgKiB0aGF0IGRhdGUuXG4gICAqXG4gICAqIFRoaXMgZnVuY3Rpb24gaXMgdXNlZCB0byBtYXRjaCBlYWNoIGNvbXBvbmVudCdzIG1vZGVsIG9mIHRoZSBhY3RpdmUgZGF0ZSB3aXRoIHRoZSBjYWxlbmRhclxuICAgKiBib2R5IGNlbGwgdGhhdCB3YXMgZm9jdXNlZC4gSXQgdXBkYXRlcyBpdHMgdmFsdWUgb2YgYGFjdGl2ZURhdGVgIHN5bmNocm9ub3VzbHkgYW5kIHVwZGF0ZXMgdGhlXG4gICAqIHBhcmVudCdzIHZhbHVlIGFzeW5jaHJvbm91c2x5IHZpYSB0aGUgYGFjdGl2ZURhdGVDaGFuZ2VgIGV2ZW50LiBUaGUgY2hpbGQgY29tcG9uZW50IHJlY2VpdmVzIGFuXG4gICAqIHVwZGF0ZWQgdmFsdWUgYXN5bmNocm9ub3VzbHkgdmlhIHRoZSBgYWN0aXZlQ2VsbGAgSW5wdXQuXG4gICAqL1xuICBfdXBkYXRlQWN0aXZlRGF0ZShldmVudDogQ2FsZW5kYXJVc2VyRXZlbnQ8bnVtYmVyPikge1xuICAgIGNvbnN0IG1vbnRoID0gZXZlbnQudmFsdWU7XG4gICAgY29uc3Qgb2xkQWN0aXZlRGF0ZSA9IHRoaXMuX2FjdGl2ZURhdGU7XG5cbiAgICB0aGlzLmFjdGl2ZURhdGUgPSB0aGlzLl9nZXREYXRlRnJvbU1vbnRoKG1vbnRoKTtcblxuICAgIGlmICh0aGlzLl9kYXRlQWRhcHRlci5jb21wYXJlRGF0ZShvbGRBY3RpdmVEYXRlLCB0aGlzLmFjdGl2ZURhdGUpKSB7XG4gICAgICB0aGlzLmFjdGl2ZURhdGVDaGFuZ2UuZW1pdCh0aGlzLmFjdGl2ZURhdGUpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBIYW5kbGVzIGtleWRvd24gZXZlbnRzIG9uIHRoZSBjYWxlbmRhciBib2R5IHdoZW4gY2FsZW5kYXIgaXMgaW4geWVhciB2aWV3LiAqL1xuICBfaGFuZGxlQ2FsZW5kYXJCb2R5S2V5ZG93bihldmVudDogS2V5Ym9hcmRFdmVudCk6IHZvaWQge1xuICAgIC8vIFRPRE8obW1hbGVyYmEpOiBXZSBjdXJyZW50bHkgYWxsb3cga2V5Ym9hcmQgbmF2aWdhdGlvbiB0byBkaXNhYmxlZCBkYXRlcywgYnV0IGp1c3QgcHJldmVudFxuICAgIC8vIGRpc2FibGVkIG9uZXMgZnJvbSBiZWluZyBzZWxlY3RlZC4gVGhpcyBtYXkgbm90IGJlIGlkZWFsLCB3ZSBzaG91bGQgbG9vayBpbnRvIHdoZXRoZXJcbiAgICAvLyBuYXZpZ2F0aW9uIHNob3VsZCBza2lwIG92ZXIgZGlzYWJsZWQgZGF0ZXMsIGFuZCBpZiBzbywgaG93IHRvIGltcGxlbWVudCB0aGF0IGVmZmljaWVudGx5LlxuXG4gICAgY29uc3Qgb2xkQWN0aXZlRGF0ZSA9IHRoaXMuX2FjdGl2ZURhdGU7XG4gICAgY29uc3QgaXNSdGwgPSB0aGlzLl9pc1J0bCgpO1xuXG4gICAgc3dpdGNoIChldmVudC5rZXlDb2RlKSB7XG4gICAgICBjYXNlIExFRlRfQVJST1c6XG4gICAgICAgIHRoaXMuYWN0aXZlRGF0ZSA9IHRoaXMuX2RhdGVBZGFwdGVyLmFkZENhbGVuZGFyTW9udGhzKHRoaXMuX2FjdGl2ZURhdGUsIGlzUnRsID8gMSA6IC0xKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFJJR0hUX0FSUk9XOlxuICAgICAgICB0aGlzLmFjdGl2ZURhdGUgPSB0aGlzLl9kYXRlQWRhcHRlci5hZGRDYWxlbmRhck1vbnRocyh0aGlzLl9hY3RpdmVEYXRlLCBpc1J0bCA/IC0xIDogMSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBVUF9BUlJPVzpcbiAgICAgICAgdGhpcy5hY3RpdmVEYXRlID0gdGhpcy5fZGF0ZUFkYXB0ZXIuYWRkQ2FsZW5kYXJNb250aHModGhpcy5fYWN0aXZlRGF0ZSwgLTQpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgRE9XTl9BUlJPVzpcbiAgICAgICAgdGhpcy5hY3RpdmVEYXRlID0gdGhpcy5fZGF0ZUFkYXB0ZXIuYWRkQ2FsZW5kYXJNb250aHModGhpcy5fYWN0aXZlRGF0ZSwgNCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBIT01FOlxuICAgICAgICB0aGlzLmFjdGl2ZURhdGUgPSB0aGlzLl9kYXRlQWRhcHRlci5hZGRDYWxlbmRhck1vbnRocyhcbiAgICAgICAgICB0aGlzLl9hY3RpdmVEYXRlLFxuICAgICAgICAgIC10aGlzLl9kYXRlQWRhcHRlci5nZXRNb250aCh0aGlzLl9hY3RpdmVEYXRlKVxuICAgICAgICApO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgRU5EOlxuICAgICAgICB0aGlzLmFjdGl2ZURhdGUgPSB0aGlzLl9kYXRlQWRhcHRlci5hZGRDYWxlbmRhck1vbnRocyhcbiAgICAgICAgICB0aGlzLl9hY3RpdmVEYXRlLFxuICAgICAgICAgIDExIC0gdGhpcy5fZGF0ZUFkYXB0ZXIuZ2V0TW9udGgodGhpcy5fYWN0aXZlRGF0ZSlcbiAgICAgICAgKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFBBR0VfVVA6XG4gICAgICAgIHRoaXMuYWN0aXZlRGF0ZSA9IHRoaXMuX2RhdGVBZGFwdGVyLmFkZENhbGVuZGFyWWVhcnMoXG4gICAgICAgICAgdGhpcy5fYWN0aXZlRGF0ZSxcbiAgICAgICAgICBldmVudC5hbHRLZXkgPyAtMTAgOiAtMVxuICAgICAgICApO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgUEFHRV9ET1dOOlxuICAgICAgICB0aGlzLmFjdGl2ZURhdGUgPSB0aGlzLl9kYXRlQWRhcHRlci5hZGRDYWxlbmRhclllYXJzKFxuICAgICAgICAgIHRoaXMuX2FjdGl2ZURhdGUsXG4gICAgICAgICAgZXZlbnQuYWx0S2V5ID8gMTAgOiAxXG4gICAgICAgICk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBFTlRFUjpcbiAgICAgIGNhc2UgU1BBQ0U6XG4gICAgICAgIC8vIE5vdGUgdGhhdCB3ZSBvbmx5IHByZXZlbnQgdGhlIGRlZmF1bHQgYWN0aW9uIGhlcmUgd2hpbGUgdGhlIHNlbGVjdGlvbiBoYXBwZW5zIGluXG4gICAgICAgIC8vIGBrZXl1cGAgYmVsb3cuIFdlIGNhbid0IGRvIHRoZSBzZWxlY3Rpb24gaGVyZSwgYmVjYXVzZSBpdCBjYW4gY2F1c2UgdGhlIGNhbGVuZGFyIHRvXG4gICAgICAgIC8vIHJlb3BlbiBpZiBmb2N1cyBpcyByZXN0b3JlZCBpbW1lZGlhdGVseS4gV2UgYWxzbyBjYW4ndCBjYWxsIGBwcmV2ZW50RGVmYXVsdGAgb24gYGtleXVwYFxuICAgICAgICAvLyBiZWNhdXNlIGl0J3MgdG9vIGxhdGUgKHNlZSAjMjMzMDUpLlxuICAgICAgICB0aGlzLl9zZWxlY3Rpb25LZXlQcmVzc2VkID0gdHJ1ZTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICAvLyBEb24ndCBwcmV2ZW50IGRlZmF1bHQgb3IgZm9jdXMgYWN0aXZlIGNlbGwgb24ga2V5cyB0aGF0IHdlIGRvbid0IGV4cGxpY2l0bHkgaGFuZGxlLlxuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX2RhdGVBZGFwdGVyLmNvbXBhcmVEYXRlKG9sZEFjdGl2ZURhdGUsIHRoaXMuYWN0aXZlRGF0ZSkpIHtcbiAgICAgIHRoaXMuYWN0aXZlRGF0ZUNoYW5nZS5lbWl0KHRoaXMuYWN0aXZlRGF0ZSk7XG4gICAgICB0aGlzLl9mb2N1c0FjdGl2ZUNlbGxBZnRlclZpZXdDaGVja2VkKCk7XG4gICAgfVxuXG4gICAgLy8gUHJldmVudCB1bmV4cGVjdGVkIGRlZmF1bHQgYWN0aW9ucyBzdWNoIGFzIGZvcm0gc3VibWlzc2lvbi5cbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICB9XG5cbiAgLyoqIEhhbmRsZXMga2V5dXAgZXZlbnRzIG9uIHRoZSBjYWxlbmRhciBib2R5IHdoZW4gY2FsZW5kYXIgaXMgaW4geWVhciB2aWV3LiAqL1xuICBfaGFuZGxlQ2FsZW5kYXJCb2R5S2V5dXAoZXZlbnQ6IEtleWJvYXJkRXZlbnQpOiB2b2lkIHtcbiAgICBpZiAoZXZlbnQua2V5Q29kZSA9PT0gU1BBQ0UgfHwgZXZlbnQua2V5Q29kZSA9PT0gRU5URVIpIHtcbiAgICAgIGlmICh0aGlzLl9zZWxlY3Rpb25LZXlQcmVzc2VkKSB7XG4gICAgICAgIHRoaXMuX21vbnRoU2VsZWN0ZWQoeyB2YWx1ZTogdGhpcy5fZGF0ZUFkYXB0ZXIuZ2V0TW9udGgodGhpcy5fYWN0aXZlRGF0ZSksIGV2ZW50IH0pO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl9zZWxlY3Rpb25LZXlQcmVzc2VkID0gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgLyoqIEluaXRpYWxpemVzIHRoaXMgeWVhciB2aWV3LiAqL1xuICBfaW5pdCgpIHtcbiAgICB0aGlzLl9zZXRTZWxlY3RlZE1vbnRoKHRoaXMuc2VsZWN0ZWQpO1xuICAgIHRoaXMuX3RvZGF5TW9udGggPSB0aGlzLl9nZXRNb250aEluQ3VycmVudFllYXIodGhpcy5fZGF0ZUFkYXB0ZXIudG9kYXkoKSk7XG4gICAgdGhpcy5feWVhckxhYmVsID0gdGhpcy5fZGF0ZUFkYXB0ZXIuZ2V0WWVhck5hbWUodGhpcy5hY3RpdmVEYXRlKTtcblxuICAgIGNvbnN0IG1vbnRoTmFtZXMgPSB0aGlzLl9kYXRlQWRhcHRlci5nZXRNb250aE5hbWVzKCdzaG9ydCcpO1xuICAgIC8vIEZpcnN0IHJvdyBvZiBtb250aHMgb25seSBjb250YWlucyA1IGVsZW1lbnRzIHNvIHdlIGNhbiBmaXQgdGhlIHllYXIgbGFiZWwgb24gdGhlIHNhbWUgcm93LlxuICAgIHRoaXMuX21vbnRocyA9IFtcbiAgICAgIFswLCAxLCAyLCAzXSxcbiAgICAgIFs0LCA1LCA2LCA3XSxcbiAgICAgIFs4LCA5LCAxMCwgMTFdLFxuICAgIF0ubWFwKChyb3cpID0+IHJvdy5tYXAoKG1vbnRoKSA9PiB0aGlzLl9jcmVhdGVDZWxsRm9yTW9udGgobW9udGgsIG1vbnRoTmFtZXNbbW9udGhdKSkpO1xuICAgIHRoaXMuX2NoYW5nZURldGVjdG9yUmVmLm1hcmtGb3JDaGVjaygpO1xuICB9XG5cbiAgLyoqIEZvY3VzZXMgdGhlIGFjdGl2ZSBjZWxsIGFmdGVyIHRoZSBtaWNyb3Rhc2sgcXVldWUgaXMgZW1wdHkuICovXG4gIF9mb2N1c0FjdGl2ZUNlbGwoKSB7XG4gICAgdGhpcy5fY2FsZW5kYXJCb2R5Ll9mb2N1c0FjdGl2ZUNlbGwoKTtcbiAgfVxuXG4gIC8qKiBTY2hlZHVsZXMgdGhlIG1hdENhbGVuZGFyQm9keSB0byBmb2N1cyB0aGUgYWN0aXZlIGNlbGwgYWZ0ZXIgY2hhbmdlIGRldGVjdGlvbiBoYXMgcnVuICovXG4gIF9mb2N1c0FjdGl2ZUNlbGxBZnRlclZpZXdDaGVja2VkKCkge1xuICAgIHRoaXMuX2NhbGVuZGFyQm9keS5fc2NoZWR1bGVGb2N1c0FjdGl2ZUNlbGxBZnRlclZpZXdDaGVja2VkKCk7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyB0aGUgbW9udGggaW4gdGhpcyB5ZWFyIHRoYXQgdGhlIGdpdmVuIERhdGUgZmFsbHMgb24uXG4gICAqIFJldHVybnMgbnVsbCBpZiB0aGUgZ2l2ZW4gRGF0ZSBpcyBpbiBhbm90aGVyIHllYXIuXG4gICAqL1xuICBwcml2YXRlIF9nZXRNb250aEluQ3VycmVudFllYXIoZGF0ZTogRCB8IG51bGwpIHtcbiAgICByZXR1cm4gZGF0ZSAmJiB0aGlzLl9kYXRlQWRhcHRlci5nZXRZZWFyKGRhdGUpID09IHRoaXMuX2RhdGVBZGFwdGVyLmdldFllYXIodGhpcy5hY3RpdmVEYXRlKVxuICAgICAgPyB0aGlzLl9kYXRlQWRhcHRlci5nZXRNb250aChkYXRlKVxuICAgICAgOiBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIFRha2VzIGEgbW9udGggYW5kIHJldHVybnMgYSBuZXcgZGF0ZSBpbiB0aGUgc2FtZSBkYXkgYW5kIHllYXIgYXMgdGhlIGN1cnJlbnRseSBhY3RpdmUgZGF0ZS5cbiAgICogIFRoZSByZXR1cm5lZCBkYXRlIHdpbGwgaGF2ZSB0aGUgc2FtZSBtb250aCBhcyB0aGUgYXJndW1lbnQgZGF0ZS5cbiAgICovXG4gIHByaXZhdGUgX2dldERhdGVGcm9tTW9udGgobW9udGg6IG51bWJlcikge1xuICAgIGNvbnN0IG5vcm1hbGl6ZWREYXRlID0gdGhpcy5fZGF0ZUFkYXB0ZXIuY3JlYXRlRGF0ZShcbiAgICAgIHRoaXMuX2RhdGVBZGFwdGVyLmdldFllYXIodGhpcy5hY3RpdmVEYXRlKSxcbiAgICAgIG1vbnRoLFxuICAgICAgMVxuICAgICk7XG5cbiAgICBjb25zdCBkYXlzSW5Nb250aCA9IHRoaXMuX2RhdGVBZGFwdGVyLmdldE51bURheXNJbk1vbnRoKG5vcm1hbGl6ZWREYXRlKTtcblxuICAgIHJldHVybiB0aGlzLl9kYXRlQWRhcHRlci5jcmVhdGVEYXRlKFxuICAgICAgdGhpcy5fZGF0ZUFkYXB0ZXIuZ2V0WWVhcih0aGlzLmFjdGl2ZURhdGUpLFxuICAgICAgbW9udGgsXG4gICAgICBNYXRoLm1pbih0aGlzLl9kYXRlQWRhcHRlci5nZXREYXRlKHRoaXMuYWN0aXZlRGF0ZSksIGRheXNJbk1vbnRoKVxuICAgICk7XG4gIH1cblxuICAvKiogQ3JlYXRlcyBhbiBDYWxlbmRhckNlbGwgZm9yIHRoZSBnaXZlbiBtb250aC4gKi9cbiAgcHJpdmF0ZSBfY3JlYXRlQ2VsbEZvck1vbnRoKG1vbnRoOiBudW1iZXIsIG1vbnRoTmFtZTogc3RyaW5nKSB7XG4gICAgY29uc3QgZGF0ZSA9IHRoaXMuX2RhdGVBZGFwdGVyLmNyZWF0ZURhdGUodGhpcy5fZGF0ZUFkYXB0ZXIuZ2V0WWVhcih0aGlzLmFjdGl2ZURhdGUpLCBtb250aCwgMSk7XG4gICAgY29uc3QgYXJpYUxhYmVsID0gdGhpcy5fZGF0ZUFkYXB0ZXIuZm9ybWF0KGRhdGUsIHRoaXMuX2RhdGVGb3JtYXRzLmRpc3BsYXkubW9udGhZZWFyQTExeUxhYmVsKTtcbiAgICBjb25zdCBjZWxsQ2xhc3NlcyA9IHRoaXMuZGF0ZUNsYXNzID8gdGhpcy5kYXRlQ2xhc3MoZGF0ZSwgJ3llYXInKSA6IHVuZGVmaW5lZDtcblxuICAgIHJldHVybiBuZXcgQ2FsZW5kYXJDZWxsKFxuICAgICAgbW9udGgsXG4gICAgICBtb250aE5hbWUudG9Mb2NhbGVVcHBlckNhc2UoKSxcbiAgICAgIGFyaWFMYWJlbCxcbiAgICAgIHRoaXMuX3Nob3VsZEVuYWJsZU1vbnRoKG1vbnRoKSxcbiAgICAgIGNlbGxDbGFzc2VzXG4gICAgKTtcbiAgfVxuXG4gIC8qKiBXaGV0aGVyIHRoZSBnaXZlbiBtb250aCBpcyBlbmFibGVkLiAqL1xuICBwcml2YXRlIF9zaG91bGRFbmFibGVNb250aChtb250aDogbnVtYmVyKSB7XG4gICAgY29uc3QgYWN0aXZlWWVhciA9IHRoaXMuX2RhdGVBZGFwdGVyLmdldFllYXIodGhpcy5hY3RpdmVEYXRlKTtcblxuICAgIGlmIChcbiAgICAgIG1vbnRoID09PSB1bmRlZmluZWQgfHxcbiAgICAgIG1vbnRoID09PSBudWxsIHx8XG4gICAgICB0aGlzLl9pc1llYXJBbmRNb250aEFmdGVyTWF4RGF0ZShhY3RpdmVZZWFyLCBtb250aCkgfHxcbiAgICAgIHRoaXMuX2lzWWVhckFuZE1vbnRoQmVmb3JlTWluRGF0ZShhY3RpdmVZZWFyLCBtb250aClcbiAgICApIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMuZGF0ZUZpbHRlcikge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgY29uc3QgZmlyc3RPZk1vbnRoID0gdGhpcy5fZGF0ZUFkYXB0ZXIuY3JlYXRlRGF0ZShhY3RpdmVZZWFyLCBtb250aCwgMSk7XG5cbiAgICAvLyBJZiBhbnkgZGF0ZSBpbiB0aGUgbW9udGggaXMgZW5hYmxlZCBjb3VudCB0aGUgbW9udGggYXMgZW5hYmxlZC5cbiAgICBmb3IgKFxuICAgICAgbGV0IGRhdGUgPSBmaXJzdE9mTW9udGg7XG4gICAgICB0aGlzLl9kYXRlQWRhcHRlci5nZXRNb250aChkYXRlKSA9PSBtb250aDtcbiAgICAgIGRhdGUgPSB0aGlzLl9kYXRlQWRhcHRlci5hZGRDYWxlbmRhckRheXMoZGF0ZSwgMSlcbiAgICApIHtcbiAgICAgIGlmICh0aGlzLmRhdGVGaWx0ZXIoZGF0ZSkpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIFRlc3RzIHdoZXRoZXIgdGhlIGNvbWJpbmF0aW9uIG1vbnRoL3llYXIgaXMgYWZ0ZXIgdGhpcy5tYXhEYXRlLCBjb25zaWRlcmluZ1xuICAgKiBqdXN0IHRoZSBtb250aCBhbmQgeWVhciBvZiB0aGlzLm1heERhdGVcbiAgICovXG4gIHByaXZhdGUgX2lzWWVhckFuZE1vbnRoQWZ0ZXJNYXhEYXRlKHllYXI6IG51bWJlciwgbW9udGg6IG51bWJlcikge1xuICAgIGlmICh0aGlzLm1heERhdGUpIHtcbiAgICAgIGNvbnN0IG1heFllYXIgPSB0aGlzLl9kYXRlQWRhcHRlci5nZXRZZWFyKHRoaXMubWF4RGF0ZSk7XG4gICAgICBjb25zdCBtYXhNb250aCA9IHRoaXMuX2RhdGVBZGFwdGVyLmdldE1vbnRoKHRoaXMubWF4RGF0ZSk7XG5cbiAgICAgIHJldHVybiB5ZWFyID4gbWF4WWVhciB8fCAoeWVhciA9PT0gbWF4WWVhciAmJiBtb250aCA+IG1heE1vbnRoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogVGVzdHMgd2hldGhlciB0aGUgY29tYmluYXRpb24gbW9udGgveWVhciBpcyBiZWZvcmUgdGhpcy5taW5EYXRlLCBjb25zaWRlcmluZ1xuICAgKiBqdXN0IHRoZSBtb250aCBhbmQgeWVhciBvZiB0aGlzLm1pbkRhdGVcbiAgICovXG4gIHByaXZhdGUgX2lzWWVhckFuZE1vbnRoQmVmb3JlTWluRGF0ZSh5ZWFyOiBudW1iZXIsIG1vbnRoOiBudW1iZXIpIHtcbiAgICBpZiAodGhpcy5taW5EYXRlKSB7XG4gICAgICBjb25zdCBtaW5ZZWFyID0gdGhpcy5fZGF0ZUFkYXB0ZXIuZ2V0WWVhcih0aGlzLm1pbkRhdGUpO1xuICAgICAgY29uc3QgbWluTW9udGggPSB0aGlzLl9kYXRlQWRhcHRlci5nZXRNb250aCh0aGlzLm1pbkRhdGUpO1xuXG4gICAgICByZXR1cm4geWVhciA8IG1pblllYXIgfHwgKHllYXIgPT09IG1pblllYXIgJiYgbW9udGggPCBtaW5Nb250aCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLyoqIERldGVybWluZXMgd2hldGhlciB0aGUgdXNlciBoYXMgdGhlIFJUTCBsYXlvdXQgZGlyZWN0aW9uLiAqL1xuICBwcml2YXRlIF9pc1J0bCgpIHtcbiAgICByZXR1cm4gdGhpcy5fZGlyICYmIHRoaXMuX2Rpci52YWx1ZSA9PT0gJ3J0bCc7XG4gIH1cblxuICAvKiogU2V0cyB0aGUgY3VycmVudGx5LXNlbGVjdGVkIG1vbnRoIGJhc2VkIG9uIGEgbW9kZWwgdmFsdWUuICovXG4gIHByaXZhdGUgX3NldFNlbGVjdGVkTW9udGgodmFsdWU6IERhdGVSYW5nZTxEPiB8IEQgfCBudWxsKSB7XG4gICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgRGF0ZVJhbmdlKSB7XG4gICAgICB0aGlzLl9zZWxlY3RlZE1vbnRoID1cbiAgICAgICAgdGhpcy5fZ2V0TW9udGhJbkN1cnJlbnRZZWFyKHZhbHVlLnN0YXJ0KSB8fCB0aGlzLl9nZXRNb250aEluQ3VycmVudFllYXIodmFsdWUuZW5kKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fc2VsZWN0ZWRNb250aCA9IHRoaXMuX2dldE1vbnRoSW5DdXJyZW50WWVhcih2YWx1ZSk7XG4gICAgfVxuICB9XG59XG4iLCI8IS0tIGVzbGludC1kaXNhYmxlIEBhbmd1bGFyLWVzbGludC90ZW1wbGF0ZS9pbnRlcmFjdGl2ZS1zdXBwb3J0cy1mb2N1cyAtLT5cbjx0YWJsZVxuICBjbGFzcz1cImNhbGVuZGFyLXRhYmxlXCJcbiAgcm9sZT1cImdyaWRcIlxuPlxuICA8dGhlYWRcbiAgICBhcmlhLWhpZGRlbj1cInRydWVcIlxuICAgIGNsYXNzPVwiY2FsZW5kYXItdGFibGUtaGVhZGVyXCJcbiAgPlxuICAgIDx0cj5cbiAgICAgIDx0aFxuICAgICAgICBjbGFzcz1cImNhbGVuZGFyLXRhYmxlLWhlYWRlci1kaXZpZGVyXCJcbiAgICAgICAgY29sc3Bhbj1cIjRcIlxuICAgICAgPjwvdGg+XG4gICAgPC90cj5cbiAgPC90aGVhZD5cbiAgPHRib2R5XG4gICAgY2FsZW5kYXItYm9keVxuICAgIFtsYWJlbF09XCJfeWVhckxhYmVsXCJcbiAgICBbcm93c109XCJfbW9udGhzXCJcbiAgICBbdG9kYXlWYWx1ZV09XCJfdG9kYXlNb250aCFcIlxuICAgIFtzdGFydFZhbHVlXT1cIl9zZWxlY3RlZE1vbnRoIVwiXG4gICAgW2VuZFZhbHVlXT1cIl9zZWxlY3RlZE1vbnRoIVwiXG4gICAgW2xhYmVsTWluUmVxdWlyZWRDZWxsc109XCIyXCJcbiAgICBbbnVtQ29sc109XCI0XCJcbiAgICBbY2VsbEFzcGVjdFJhdGlvXT1cIjQgLyA3XCJcbiAgICBbYWN0aXZlQ2VsbF09XCJfZGF0ZUFkYXB0ZXIuZ2V0TW9udGgoYWN0aXZlRGF0ZSlcIlxuICAgIChzZWxlY3RlZFZhbHVlQ2hhbmdlKT1cIl9tb250aFNlbGVjdGVkKCRldmVudClcIlxuICAgIChhY3RpdmVEYXRlQ2hhbmdlKT1cIl91cGRhdGVBY3RpdmVEYXRlKCRldmVudClcIlxuICAgIChrZXl1cCk9XCJfaGFuZGxlQ2FsZW5kYXJCb2R5S2V5dXAoJGV2ZW50KVwiXG4gICAgKGtleWRvd24pPVwiX2hhbmRsZUNhbGVuZGFyQm9keUtleWRvd24oJGV2ZW50KVwiXG4gID48L3Rib2R5PlxuPC90YWJsZT5cbiJdfQ==
