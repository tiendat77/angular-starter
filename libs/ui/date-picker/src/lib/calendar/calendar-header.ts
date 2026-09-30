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
  ViewEncapsulation,
  inject,
} from '@angular/core';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DateAdapter } from '../adapter';
import { DatepickerIntl } from '../date-picker/datepicker-intl';
import { Calendar } from './calendar';
import { getActiveOffset, isSameMultiYearView, yearsPerPage } from './multi-year-view';

let calendarHeaderId = 1;

/** Default header for MatCalendar */
@Component({
  selector: 'calendar-header',
  templateUrl: './calendar-header.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  exportAs: 'calendarHeader',
})
export class CalendarHeader<D> {
  calendar = inject<Calendar<D>>(Calendar);
  private _dateAdapter = inject<DateAdapter<D>>(DateAdapter, { optional: true }) as DateAdapter<D>;
  private _intl = inject(DatepickerIntl);

  constructor() {
    const changeDetectorRef = inject(ChangeDetectorRef);

    this.calendar.stateChanges.subscribe(() => changeDetectorRef.markForCheck());
    this._intl.changes.pipe(takeUntilDestroyed()).subscribe(() => changeDetectorRef.markForCheck());
  }

  /** "September 2026", laid out by `DatepickerIntl.monthYearFormat` (e.g. "tháng 9, 2026"). */
  private _formatMonthYear(): string {
    const date = this.calendar.activeDate;
    const month = this._dateAdapter.getMonthNames('long')[this._dateAdapter.getMonth(date)];
    return this._intl.monthYearFormat
      .replace('{month}', month)
      .replace('{year}', this._dateAdapter.getYearName(date));
  }

  /** The display text for the current calendar view. */
  get periodButtonText(): string {
    if (this.calendar.currentView == 'month') {
      // Kept in its natural case; the template capitalizes the first letter
      return this._formatMonthYear();
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
      return this._formatMonthYear();
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
    return this.calendar.currentView == 'month'
      ? this._intl.switchToMultiYearViewLabel
      : this._intl.switchToMonthViewLabel;
  }

  /** The label for the previous button. */
  get prevButtonLabel(): string {
    return {
      month: this._intl.prevMonthLabel,
      year: this._intl.prevYearLabel,
      'multi-year': this._intl.prevMultiYearLabel,
    }[this.calendar.currentView];
  }

  /** The label for the next button. */
  get nextButtonLabel(): string {
    return {
      month: this._intl.nextMonthLabel,
      year: this._intl.nextYearLabel,
      'multi-year': this._intl.nextMultiYearLabel,
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
