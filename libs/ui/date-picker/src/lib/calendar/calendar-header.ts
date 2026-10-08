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
import { isSameMultiYearView, yearsPerPage } from './multi-year-view';

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

  /** The month name of the active date, kept in its natural case; the template capitalizes it. */
  get monthText(): string {
    const date = this.calendar.activeDate;
    return this._dateAdapter.getMonthNames('long')[this._dateAdapter.getMonth(date)];
  }

  get yearText(): string {
    return this._dateAdapter.getYearName(this.calendar.activeDate);
  }

  /** Locales that write the year before the month ("2026年9月"): put its button first. */
  get yearFirst(): boolean {
    const format = this._intl.monthYearFormat;
    return format.indexOf('{year}') < format.indexOf('{month}');
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

  /** Handles user clicks on the month: opens the month grid, or goes back to the days. */
  monthLabelClicked(): void {
    this.calendar._toggleGrid('year');
  }

  /** Handles user clicks on the year: opens the year grid, or goes back to the days. */
  yearLabelClicked(): void {
    this.calendar._toggleGrid('multi-year');
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
}
