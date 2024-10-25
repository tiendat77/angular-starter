/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  forwardRef,
  Inject,
  Optional,
  ViewEncapsulation,
} from '@angular/core';

import { DateAdapter, DATE_FORMATS, DateFormats } from '../adapter';
import { getActiveOffset, isSameMultiYearView, yearsPerPage } from './multi-year-view';
import { Calendar } from './calendar';

let calendarHeaderId = 1;

/** Default header for MatCalendar */
@Component({
  standalone: true,
  selector: 'calendar-header',
  templateUrl: 'calendar-header.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  exportAs: 'calendarHeader',
})
export class CalendarHeader<D> {
  constructor(
    @Inject(forwardRef(() => Calendar)) public calendar: Calendar<D>,
    @Optional() private _dateAdapter: DateAdapter<D>,
    @Optional() @Inject(DATE_FORMATS) private _dateFormats: DateFormats,
    changeDetectorRef: ChangeDetectorRef
  ) {
    this.calendar.stateChanges.subscribe(() => changeDetectorRef.markForCheck());
  }

  /** The display text for the current calendar view. */
  get periodButtonText(): string {
    if (this.calendar.currentView == 'month') {
      return this._dateAdapter
        .format(this.calendar.activeDate, this._dateFormats.display.monthYearLabel)
        .toLocaleUpperCase();
    }
    if (this.calendar.currentView == 'year') {
      return this._dateAdapter.getYearName(this.calendar.activeDate);
    }

    const [start, end] = this._formatMinAndMaxYearLabels();
    return `${start} \u2013 ${end}`;
  }

  /** The aria description for the current calendar view. */
  get periodButtonDescription(): string {
    if (this.calendar.currentView == 'month') {
      return this._dateAdapter
        .format(this.calendar.activeDate, this._dateFormats.display.monthYearLabel)
        .toLocaleUpperCase();
    }
    if (this.calendar.currentView == 'year') {
      return this._dateAdapter.getYearName(this.calendar.activeDate);
    }

    // Format a label for the window of years displayed in the multi-year calendar view. Use
    // `formatYearRangeLabel` because it is TTS friendly.
    const [start, end] = this._formatMinAndMaxYearLabels();
    return `${start} \u2013 ${end}`;
  }

  /** The `aria-label` for changing the calendar view. */
  get periodButtonLabel(): string {
    // TODO: translate
    return this.calendar.currentView == 'month' ? 'Choose month and year' : 'Choose date';
  }

  /** The label for the previous button. */
  get prevButtonLabel(): string {
    // TODO: translate
    return {
      month: 'Previous month',
      year: 'Previous year',
      'multi-year': 'Previous 24 years',
    }[this.calendar.currentView];
  }

  /** The label for the next button. */
  get nextButtonLabel(): string {
    // TODO: translate
    return {
      month: 'Next month',
      year: 'Next year',
      'multi-year': 'Next 24 years',
    }[this.calendar.currentView];
  }

  /** Handles user clicks on the period label. */
  currentPeriodClicked(): void {
    this.calendar.currentView = this.calendar.currentView == 'month' ? 'multi-year' : 'month';
  }

  /** Handles user clicks on the previous button. */
  previousClicked(): void {
    this.calendar.activeDate =
      this.calendar.currentView == 'month'
        ? this._dateAdapter.addCalendarMonths(this.calendar.activeDate, -1)
        : this._dateAdapter.addCalendarYears(
            this.calendar.activeDate,
            this.calendar.currentView == 'year' ? -1 : -yearsPerPage
          );
  }

  /** Handles user clicks on the next button. */
  nextClicked(): void {
    this.calendar.activeDate =
      this.calendar.currentView == 'month'
        ? this._dateAdapter.addCalendarMonths(this.calendar.activeDate, 1)
        : this._dateAdapter.addCalendarYears(
            this.calendar.activeDate,
            this.calendar.currentView == 'year' ? 1 : yearsPerPage
          );
  }

  /** Whether the previous period button is enabled. */
  previousEnabled(): boolean {
    if (!this.calendar.minDate) {
      return true;
    }
    return (
      !this.calendar.minDate || !this._isSameView(this.calendar.activeDate, this.calendar.minDate)
    );
  }

  /** Whether the next period button is enabled. */
  nextEnabled(): boolean {
    return (
      !this.calendar.maxDate || !this._isSameView(this.calendar.activeDate, this.calendar.maxDate)
    );
  }

  /** Whether the two dates represent the same view in the current view mode (month or year). */
  private _isSameView(date1: D, date2: D): boolean {
    if (this.calendar.currentView == 'month') {
      return (
        this._dateAdapter.getYear(date1) == this._dateAdapter.getYear(date2) &&
        this._dateAdapter.getMonth(date1) == this._dateAdapter.getMonth(date2)
      );
    }
    if (this.calendar.currentView == 'year') {
      return this._dateAdapter.getYear(date1) == this._dateAdapter.getYear(date2);
    }
    // Otherwise we are in 'multi-year' view.
    return isSameMultiYearView(
      this._dateAdapter,
      date1,
      date2,
      this.calendar.minDate,
      this.calendar.maxDate
    );
  }

  /**
   * Format two individual labels for the minimum year and maximum year available in the multi-year
   * calendar view. Returns an array of two strings where the first string is the formatted label
   * for the minimum year, and the second string is the formatted label for the maximum year.
   */
  private _formatMinAndMaxYearLabels(): [minYearLabel: string, maxYearLabel: string] {
    // The offset from the active year to the "slot" for the starting year is the
    // *actual* first rendered year in the multi-year view, and the last year is
    // just yearsPerPage - 1 away.
    const activeYear = this._dateAdapter.getYear(this.calendar.activeDate);
    const minYearOfPage =
      activeYear -
      getActiveOffset(
        this._dateAdapter,
        this.calendar.activeDate,
        this.calendar.minDate,
        this.calendar.maxDate
      );
    const maxYearOfPage = minYearOfPage + yearsPerPage - 1;
    const minYearLabel = this._dateAdapter.getYearName(
      this._dateAdapter.createDate(minYearOfPage, 0, 1)
    );
    const maxYearLabel = this._dateAdapter.getYearName(
      this._dateAdapter.createDate(maxYearOfPage, 0, 1)
    );

    return [minYearLabel, maxYearLabel];
  }

  private _id = `calendar-header-${calendarHeaderId++}`;

  _periodButtonLabelId = `${this._id}-period-label`;
}
