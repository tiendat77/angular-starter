/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as i0 from '@angular/core';
import {
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  Inject,
  Optional,
  ViewEncapsulation,
} from '@angular/core';
import * as i1 from '../adapter';
import { DATE_FORMATS } from '../adapter';
import * as i2 from './calendar';
import { Calendar } from './calendar';
import { getActiveOffset, isSameMultiYearView, yearsPerPage } from './multi-year-view';
let calendarHeaderId = 1;
/** Default header for MatCalendar */
export class CalendarHeader {
  calendar;
  _dateAdapter;
  _dateFormats;
  constructor(calendar, _dateAdapter, _dateFormats, changeDetectorRef) {
    this.calendar = calendar;
    this._dateAdapter = _dateAdapter;
    this._dateFormats = _dateFormats;
    this.calendar.stateChanges.subscribe(() => changeDetectorRef.markForCheck());
  }
  /** The display text for the current calendar view. */
  get periodButtonText() {
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
  get periodButtonDescription() {
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
  get periodButtonLabel() {
    // TODO: translate
    return this.calendar.currentView == 'month' ? 'Choose month and year' : 'Choose date';
  }
  /** The label for the previous button. */
  get prevButtonLabel() {
    // TODO: translate
    return {
      month: 'Previous month',
      year: 'Previous year',
      'multi-year': 'Previous 24 years',
    }[this.calendar.currentView];
  }
  /** The label for the next button. */
  get nextButtonLabel() {
    // TODO: translate
    return {
      month: 'Next month',
      year: 'Next year',
      'multi-year': 'Next 24 years',
    }[this.calendar.currentView];
  }
  /** Handles user clicks on the period label. */
  currentPeriodClicked() {
    this.calendar.currentView = this.calendar.currentView == 'month' ? 'multi-year' : 'month';
  }
  /** Handles user clicks on the previous button. */
  previousClicked() {
    this.calendar.activeDate =
      this.calendar.currentView == 'month'
        ? this._dateAdapter.addCalendarMonths(this.calendar.activeDate, -1)
        : this._dateAdapter.addCalendarYears(
            this.calendar.activeDate,
            this.calendar.currentView == 'year' ? -1 : -yearsPerPage
          );
  }
  /** Handles user clicks on the next button. */
  nextClicked() {
    this.calendar.activeDate =
      this.calendar.currentView == 'month'
        ? this._dateAdapter.addCalendarMonths(this.calendar.activeDate, 1)
        : this._dateAdapter.addCalendarYears(
            this.calendar.activeDate,
            this.calendar.currentView == 'year' ? 1 : yearsPerPage
          );
  }
  /** Whether the previous period button is enabled. */
  previousEnabled() {
    if (!this.calendar.minDate) {
      return true;
    }
    return (
      !this.calendar.minDate || !this._isSameView(this.calendar.activeDate, this.calendar.minDate)
    );
  }
  /** Whether the next period button is enabled. */
  nextEnabled() {
    return (
      !this.calendar.maxDate || !this._isSameView(this.calendar.activeDate, this.calendar.maxDate)
    );
  }
  /** Whether the two dates represent the same view in the current view mode (month or year). */
  _isSameView(date1, date2) {
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
  _formatMinAndMaxYearLabels() {
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
  _id = `calendar-header-${calendarHeaderId++}`;
  _periodButtonLabelId = `${this._id}-period-label`;
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: '12.0.0',
    version: '18.2.13',
    ngImport: i0,
    type: CalendarHeader,
    deps: [
      { token: forwardRef(() => Calendar) },
      { token: i1.DateAdapter, optional: true },
      { token: DATE_FORMATS, optional: true },
      { token: i0.ChangeDetectorRef },
    ],
    target: i0.ɵɵFactoryTarget.Component,
  });
  static ɵcmp = i0.ɵɵngDeclareComponent({
    minVersion: '14.0.0',
    version: '18.2.13',
    type: CalendarHeader,
    isStandalone: true,
    selector: 'calendar-header',
    exportAs: ['calendarHeader'],
    ngImport: i0,
    template:
      '<div class="px-3 pt-2.5 pb-0 flex items-center justify-between">\n  <!-- [Firefox Issue: https://bugzilla.mozilla.org/show_bug.cgi?id=1880533]\n    Relocated label next to related button and made visually hidden via cdk-visually-hidden\n    to enable label to appear in a11y tree for SR when using Firefox -->\n  <label\n    class="hidden cdk-visually-hidden"\n    for=""\n    [id]="_periodButtonLabelId"\n  >\n    {{ periodButtonDescription }}\n  </label>\n\n  <button\n    class="btn btn-ghost"\n    aria-live="polite"\n    [attr.aria-label]="periodButtonLabel"\n    [attr.aria-describedby]="_periodButtonLabelId"\n    (click)="currentPeriodClicked()"\n  >\n    <span aria-hidden="true">{{ periodButtonText }}</span>\n\n    <svg\n      class="w-3 h-3"\n      fill="none"\n      viewBox="0 0 24 24"\n      stroke-width="3"\n      stroke="currentColor"\n    >\n      <path\n        stroke-linecap="round"\n        stroke-linejoin="round"\n        d="m19.5 8.25-7.5 7.5-7.5-7.5"\n      />\n    </svg>\n  </button>\n\n  <div class="flex-auto"></div>\n\n  <ng-content />\n\n  <button\n    type="button"\n    class="btn btn-ghost btn-circle btn-sm"\n    [disabled]="!previousEnabled()"\n    [attr.aria-label]="prevButtonLabel"\n    (click)="previousClicked()"\n  >\n    <svg\n      class="w-6 h-6"\n      fill="none"\n      viewBox="0 0 24 24"\n      stroke-width="2"\n      stroke="currentColor"\n    >\n      <path\n        stroke-linecap="round"\n        stroke-linejoin="round"\n        d="M15.75 19.5 8.25 12l7.5-7.5"\n      />\n    </svg>\n  </button>\n\n  <button\n    type="button"\n    class="btn btn-ghost btn-circle btn-sm"\n    [disabled]="!nextEnabled()"\n    [attr.aria-label]="nextButtonLabel"\n    (click)="nextClicked()"\n  >\n    <svg\n      class="w-6 h-6"\n      fill="none"\n      viewBox="0 0 24 24"\n      stroke-width="2"\n      stroke="currentColor"\n    >\n      <path\n        stroke-linecap="round"\n        stroke-linejoin="round"\n        d="m8.25 4.5 7.5 7.5-7.5 7.5"\n      />\n    </svg>\n  </button>\n</div>\n',
    changeDetection: i0.ChangeDetectionStrategy.OnPush,
    encapsulation: i0.ViewEncapsulation.None,
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: '12.0.0',
  version: '18.2.13',
  ngImport: i0,
  type: CalendarHeader,
  decorators: [
    {
      type: Component,
      args: [
        {
          standalone: true,
          selector: 'calendar-header',
          encapsulation: ViewEncapsulation.None,
          changeDetection: ChangeDetectionStrategy.OnPush,
          exportAs: 'calendarHeader',
          template:
            '<div class="px-3 pt-2.5 pb-0 flex items-center justify-between">\n  <!-- [Firefox Issue: https://bugzilla.mozilla.org/show_bug.cgi?id=1880533]\n    Relocated label next to related button and made visually hidden via cdk-visually-hidden\n    to enable label to appear in a11y tree for SR when using Firefox -->\n  <label\n    class="hidden cdk-visually-hidden"\n    for=""\n    [id]="_periodButtonLabelId"\n  >\n    {{ periodButtonDescription }}\n  </label>\n\n  <button\n    class="btn btn-ghost"\n    aria-live="polite"\n    [attr.aria-label]="periodButtonLabel"\n    [attr.aria-describedby]="_periodButtonLabelId"\n    (click)="currentPeriodClicked()"\n  >\n    <span aria-hidden="true">{{ periodButtonText }}</span>\n\n    <svg\n      class="w-3 h-3"\n      fill="none"\n      viewBox="0 0 24 24"\n      stroke-width="3"\n      stroke="currentColor"\n    >\n      <path\n        stroke-linecap="round"\n        stroke-linejoin="round"\n        d="m19.5 8.25-7.5 7.5-7.5-7.5"\n      />\n    </svg>\n  </button>\n\n  <div class="flex-auto"></div>\n\n  <ng-content />\n\n  <button\n    type="button"\n    class="btn btn-ghost btn-circle btn-sm"\n    [disabled]="!previousEnabled()"\n    [attr.aria-label]="prevButtonLabel"\n    (click)="previousClicked()"\n  >\n    <svg\n      class="w-6 h-6"\n      fill="none"\n      viewBox="0 0 24 24"\n      stroke-width="2"\n      stroke="currentColor"\n    >\n      <path\n        stroke-linecap="round"\n        stroke-linejoin="round"\n        d="M15.75 19.5 8.25 12l7.5-7.5"\n      />\n    </svg>\n  </button>\n\n  <button\n    type="button"\n    class="btn btn-ghost btn-circle btn-sm"\n    [disabled]="!nextEnabled()"\n    [attr.aria-label]="nextButtonLabel"\n    (click)="nextClicked()"\n  >\n    <svg\n      class="w-6 h-6"\n      fill="none"\n      viewBox="0 0 24 24"\n      stroke-width="2"\n      stroke="currentColor"\n    >\n      <path\n        stroke-linecap="round"\n        stroke-linejoin="round"\n        d="m8.25 4.5 7.5 7.5-7.5 7.5"\n      />\n    </svg>\n  </button>\n</div>\n',
        },
      ],
    },
  ],
  ctorParameters: () => [
    {
      type: i2.Calendar,
      decorators: [
        {
          type: Inject,
          args: [forwardRef(() => Calendar)],
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
    { type: i0.ChangeDetectorRef },
  ],
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FsZW5kYXItaGVhZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vbGlicy9kYXRlLXBpY2tlci9zcmMvbGliL2NhbGVuZGFyL2NhbGVuZGFyLWhlYWRlci50cyIsIi4uLy4uLy4uLy4uLy4uL2xpYnMvZGF0ZS1waWNrZXIvc3JjL2xpYi9jYWxlbmRhci9jYWxlbmRhci1oZWFkZXIuaHRtbCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQ0wsdUJBQXVCLEVBRXZCLFNBQVMsRUFDVCxVQUFVLEVBQ1YsTUFBTSxFQUNOLFFBQVEsRUFDUixpQkFBaUIsR0FDbEIsTUFBTSxlQUFlLENBQUM7QUFFdkIsT0FBTyxFQUFlLFlBQVksRUFBZSxNQUFNLFlBQVksQ0FBQztBQUNwRSxPQUFPLEVBQUUsZUFBZSxFQUFFLG1CQUFtQixFQUFFLFlBQVksRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBQ3ZGLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxZQUFZLENBQUM7Ozs7QUFFdEMsSUFBSSxnQkFBZ0IsR0FBRyxDQUFDLENBQUM7QUFFekIscUNBQXFDO0FBU3JDLE1BQU0sT0FBTyxjQUFjO0lBRW9CO0lBQ3ZCO0lBQ3NCO0lBSDVDLFlBQzZDLFFBQXFCLEVBQzVDLFlBQTRCLEVBQ04sWUFBeUIsRUFDbkUsaUJBQW9DO1FBSE8sYUFBUSxHQUFSLFFBQVEsQ0FBYTtRQUM1QyxpQkFBWSxHQUFaLFlBQVksQ0FBZ0I7UUFDTixpQkFBWSxHQUFaLFlBQVksQ0FBYTtRQUduRSxJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLENBQUMsaUJBQWlCLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQztJQUMvRSxDQUFDO0lBRUQsc0RBQXNEO0lBQ3RELElBQUksZ0JBQWdCO1FBQ2xCLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLElBQUksT0FBTyxFQUFFLENB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QWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7XG4gIENoYW5nZURldGVjdGlvblN0cmF0ZWd5LFxuICBDaGFuZ2VEZXRlY3RvclJlZixcbiAgQ29tcG9uZW50LFxuICBmb3J3YXJkUmVmLFxuICBJbmplY3QsXG4gIE9wdGlvbmFsLFxuICBWaWV3RW5jYXBzdWxhdGlvbixcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7IERhdGVBZGFwdGVyLCBEQVRFX0ZPUk1BVFMsIERhdGVGb3JtYXRzIH0gZnJvbSAnLi4vYWRhcHRlcic7XG5pbXBvcnQgeyBnZXRBY3RpdmVPZmZzZXQsIGlzU2FtZU11bHRpWWVhclZpZXcsIHllYXJzUGVyUGFnZSB9IGZyb20gJy4vbXVsdGkteWVhci12aWV3JztcbmltcG9ydCB7IENhbGVuZGFyIH0gZnJvbSAnLi9jYWxlbmRhcic7XG5cbmxldCBjYWxlbmRhckhlYWRlcklkID0gMTtcblxuLyoqIERlZmF1bHQgaGVhZGVyIGZvciBNYXRDYWxlbmRhciAqL1xuQENvbXBvbmVudCh7XG4gIHN0YW5kYWxvbmU6IHRydWUsXG4gIHNlbGVjdG9yOiAnY2FsZW5kYXItaGVhZGVyJyxcbiAgdGVtcGxhdGVVcmw6ICdjYWxlbmRhci1oZWFkZXIuaHRtbCcsXG4gIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLk5vbmUsXG4gIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuT25QdXNoLFxuICBleHBvcnRBczogJ2NhbGVuZGFySGVhZGVyJyxcbn0pXG5leHBvcnQgY2xhc3MgQ2FsZW5kYXJIZWFkZXI8RD4ge1xuICBjb25zdHJ1Y3RvcihcbiAgICBASW5qZWN0KGZvcndhcmRSZWYoKCkgPT4gQ2FsZW5kYXIpKSBwdWJsaWMgY2FsZW5kYXI6IENhbGVuZGFyPEQ+LFxuICAgIEBPcHRpb25hbCgpIHByaXZhdGUgX2RhdGVBZGFwdGVyOiBEYXRlQWRhcHRlcjxEPixcbiAgICBAT3B0aW9uYWwoKSBASW5qZWN0KERBVEVfRk9STUFUUykgcHJpdmF0ZSBfZGF0ZUZvcm1hdHM6IERhdGVGb3JtYXRzLFxuICAgIGNoYW5nZURldGVjdG9yUmVmOiBDaGFuZ2VEZXRlY3RvclJlZlxuICApIHtcbiAgICB0aGlzLmNhbGVuZGFyLnN0YXRlQ2hhbmdlcy5zdWJzY3JpYmUoKCkgPT4gY2hhbmdlRGV0ZWN0b3JSZWYubWFya0ZvckNoZWNrKCkpO1xuICB9XG5cbiAgLyoqIFRoZSBkaXNwbGF5IHRleHQgZm9yIHRoZSBjdXJyZW50IGNhbGVuZGFyIHZpZXcuICovXG4gIGdldCBwZXJpb2RCdXR0b25UZXh0KCk6IHN0cmluZyB7XG4gICAgaWYgKHRoaXMuY2FsZW5kYXIuY3VycmVudFZpZXcgPT0gJ21vbnRoJykge1xuICAgICAgcmV0dXJuIHRoaXMuX2RhdGVBZGFwdGVyXG4gICAgICAgIC5mb3JtYXQodGhpcy5jYWxlbmRhci5hY3RpdmVEYXRlLCB0aGlzLl9kYXRlRm9ybWF0cy5kaXNwbGF5Lm1vbnRoWWVhckxhYmVsKVxuICAgICAgICAudG9Mb2NhbGVVcHBlckNhc2UoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuY2FsZW5kYXIuY3VycmVudFZpZXcgPT0gJ3llYXInKSB7XG4gICAgICByZXR1cm4gdGhpcy5fZGF0ZUFkYXB0ZXIuZ2V0WWVhck5hbWUodGhpcy5jYWxlbmRhci5hY3RpdmVEYXRlKTtcbiAgICB9XG5cbiAgICBjb25zdCBbc3RhcnQsIGVuZF0gPSB0aGlzLl9mb3JtYXRNaW5BbmRNYXhZZWFyTGFiZWxzKCk7XG4gICAgcmV0dXJuIGAke3N0YXJ0fSBcXHUyMDEzICR7ZW5kfWA7XG4gIH1cblxuICAvKiogVGhlIGFyaWEgZGVzY3JpcHRpb24gZm9yIHRoZSBjdXJyZW50IGNhbGVuZGFyIHZpZXcuICovXG4gIGdldCBwZXJpb2RCdXR0b25EZXNjcmlwdGlvbigpOiBzdHJpbmcge1xuICAgIGlmICh0aGlzLmNhbGVuZGFyLmN1cnJlbnRWaWV3ID09ICdtb250aCcpIHtcbiAgICAgIHJldHVybiB0aGlzLl9kYXRlQWRhcHRlclxuICAgICAgICAuZm9ybWF0KHRoaXMuY2FsZW5kYXIuYWN0aXZlRGF0ZSwgdGhpcy5fZGF0ZUZvcm1hdHMuZGlzcGxheS5tb250aFllYXJMYWJlbClcbiAgICAgICAgLnRvTG9jYWxlVXBwZXJDYXNlKCk7XG4gICAgfVxuICAgIGlmICh0aGlzLmNhbGVuZGFyLmN1cnJlbnRWaWV3ID09ICd5ZWFyJykge1xuICAgICAgcmV0dXJuIHRoaXMuX2RhdGVBZGFwdGVyLmdldFllYXJOYW1lKHRoaXMuY2FsZW5kYXIuYWN0aXZlRGF0ZSk7XG4gICAgfVxuXG4gICAgLy8gRm9ybWF0IGEgbGFiZWwgZm9yIHRoZSB3aW5kb3cgb2YgeWVhcnMgZGlzcGxheWVkIGluIHRoZSBtdWx0aS15ZWFyIGNhbGVuZGFyIHZpZXcuIFVzZVxuICAgIC8vIGBmb3JtYXRZZWFyUmFuZ2VMYWJlbGAgYmVjYXVzZSBpdCBpcyBUVFMgZnJpZW5kbHkuXG4gICAgY29uc3QgW3N0YXJ0LCBlbmRdID0gdGhpcy5fZm9ybWF0TWluQW5kTWF4WWVhckxhYmVscygpO1xuICAgIHJldHVybiBgJHtzdGFydH0gXFx1MjAxMyAke2VuZH1gO1xuICB9XG5cbiAgLyoqIFRoZSBgYXJpYS1sYWJlbGAgZm9yIGNoYW5naW5nIHRoZSBjYWxlbmRhciB2aWV3LiAqL1xuICBnZXQgcGVyaW9kQnV0dG9uTGFiZWwoKTogc3RyaW5nIHtcbiAgICAvLyBUT0RPOiB0cmFuc2xhdGVcbiAgICByZXR1cm4gdGhpcy5jYWxlbmRhci5jdXJyZW50VmlldyA9PSAnbW9udGgnID8gJ0Nob29zZSBtb250aCBhbmQgeWVhcicgOiAnQ2hvb3NlIGRhdGUnO1xuICB9XG5cbiAgLyoqIFRoZSBsYWJlbCBmb3IgdGhlIHByZXZpb3VzIGJ1dHRvbi4gKi9cbiAgZ2V0IHByZXZCdXR0b25MYWJlbCgpOiBzdHJpbmcge1xuICAgIC8vIFRPRE86IHRyYW5zbGF0ZVxuICAgIHJldHVybiB7XG4gICAgICBtb250aDogJ1ByZXZpb3VzIG1vbnRoJyxcbiAgICAgIHllYXI6ICdQcmV2aW91cyB5ZWFyJyxcbiAgICAgICdtdWx0aS15ZWFyJzogJ1ByZXZpb3VzIDI0IHllYXJzJyxcbiAgICB9W3RoaXMuY2FsZW5kYXIuY3VycmVudFZpZXddO1xuICB9XG5cbiAgLyoqIFRoZSBsYWJlbCBmb3IgdGhlIG5leHQgYnV0dG9uLiAqL1xuICBnZXQgbmV4dEJ1dHRvbkxhYmVsKCk6IHN0cmluZyB7XG4gICAgLy8gVE9ETzogdHJhbnNsYXRlXG4gICAgcmV0dXJuIHtcbiAgICAgIG1vbnRoOiAnTmV4dCBtb250aCcsXG4gICAgICB5ZWFyOiAnTmV4dCB5ZWFyJyxcbiAgICAgICdtdWx0aS15ZWFyJzogJ05leHQgMjQgeWVhcnMnLFxuICAgIH1bdGhpcy5jYWxlbmRhci5jdXJyZW50Vmlld107XG4gIH1cblxuICAvKiogSGFuZGxlcyB1c2VyIGNsaWNrcyBvbiB0aGUgcGVyaW9kIGxhYmVsLiAqL1xuICBjdXJyZW50UGVyaW9kQ2xpY2tlZCgpOiB2b2lkIHtcbiAgICB0aGlzLmNhbGVuZGFyLmN1cnJlbnRWaWV3ID0gdGhpcy5jYWxlbmRhci5jdXJyZW50VmlldyA9PSAnbW9udGgnID8gJ211bHRpLXllYXInIDogJ21vbnRoJztcbiAgfVxuXG4gIC8qKiBIYW5kbGVzIHVzZXIgY2xpY2tzIG9uIHRoZSBwcmV2aW91cyBidXR0b24uICovXG4gIHByZXZpb3VzQ2xpY2tlZCgpOiB2b2lkIHtcbiAgICB0aGlzLmNhbGVuZGFyLmFjdGl2ZURhdGUgPVxuICAgICAgdGhpcy5jYWxlbmRhci5jdXJyZW50VmlldyA9PSAnbW9udGgnXG4gICAgICAgID8gdGhpcy5fZGF0ZUFkYXB0ZXIuYWRkQ2FsZW5kYXJNb250aHModGhpcy5jYWxlbmRhci5hY3RpdmVEYXRlLCAtMSlcbiAgICAgICAgOiB0aGlzLl9kYXRlQWRhcHRlci5hZGRDYWxlbmRhclllYXJzKFxuICAgICAgICAgICAgdGhpcy5jYWxlbmRhci5hY3RpdmVEYXRlLFxuICAgICAgICAgICAgdGhpcy5jYWxlbmRhci5jdXJyZW50VmlldyA9PSAneWVhcicgPyAtMSA6IC15ZWFyc1BlclBhZ2VcbiAgICAgICAgICApO1xuICB9XG5cbiAgLyoqIEhhbmRsZXMgdXNlciBjbGlja3Mgb24gdGhlIG5leHQgYnV0dG9uLiAqL1xuICBuZXh0Q2xpY2tlZCgpOiB2b2lkIHtcbiAgICB0aGlzLmNhbGVuZGFyLmFjdGl2ZURhdGUgPVxuICAgICAgdGhpcy5jYWxlbmRhci5jdXJyZW50VmlldyA9PSAnbW9udGgnXG4gICAgICAgID8gdGhpcy5fZGF0ZUFkYXB0ZXIuYWRkQ2FsZW5kYXJNb250aHModGhpcy5jYWxlbmRhci5hY3RpdmVEYXRlLCAxKVxuICAgICAgICA6IHRoaXMuX2RhdGVBZGFwdGVyLmFkZENhbGVuZGFyWWVhcnMoXG4gICAgICAgICAgICB0aGlzLmNhbGVuZGFyLmFjdGl2ZURhdGUsXG4gICAgICAgICAgICB0aGlzLmNhbGVuZGFyLmN1cnJlbnRWaWV3ID09ICd5ZWFyJyA/IDEgOiB5ZWFyc1BlclBhZ2VcbiAgICAgICAgICApO1xuICB9XG5cbiAgLyoqIFdoZXRoZXIgdGhlIHByZXZpb3VzIHBlcmlvZCBidXR0b24gaXMgZW5hYmxlZC4gKi9cbiAgcHJldmlvdXNFbmFibGVkKCk6IGJvb2xlYW4ge1xuICAgIGlmICghdGhpcy5jYWxlbmRhci5taW5EYXRlKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIChcbiAgICAgICF0aGlzLmNhbGVuZGFyLm1pbkRhdGUgfHwgIXRoaXMuX2lzU2FtZVZpZXcodGhpcy5jYWxlbmRhci5hY3RpdmVEYXRlLCB0aGlzLmNhbGVuZGFyLm1pbkRhdGUpXG4gICAgKTtcbiAgfVxuXG4gIC8qKiBXaGV0aGVyIHRoZSBuZXh0IHBlcmlvZCBidXR0b24gaXMgZW5hYmxlZC4gKi9cbiAgbmV4dEVuYWJsZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIChcbiAgICAgICF0aGlzLmNhbGVuZGFyLm1heERhdGUgfHwgIXRoaXMuX2lzU2FtZVZpZXcodGhpcy5jYWxlbmRhci5hY3RpdmVEYXRlLCB0aGlzLmNhbGVuZGFyLm1heERhdGUpXG4gICAgKTtcbiAgfVxuXG4gIC8qKiBXaGV0aGVyIHRoZSB0d28gZGF0ZXMgcmVwcmVzZW50IHRoZSBzYW1lIHZpZXcgaW4gdGhlIGN1cnJlbnQgdmlldyBtb2RlIChtb250aCBvciB5ZWFyKS4gKi9cbiAgcHJpdmF0ZSBfaXNTYW1lVmlldyhkYXRlMTogRCwgZGF0ZTI6IEQpOiBib29sZWFuIHtcbiAgICBpZiAodGhpcy5jYWxlbmRhci5jdXJyZW50VmlldyA9PSAnbW9udGgnKSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICB0aGlzLl9kYXRlQWRhcHRlci5nZXRZZWFyKGRhdGUxKSA9PSB0aGlzLl9kYXRlQWRhcHRlci5nZXRZZWFyKGRhdGUyKSAmJlxuICAgICAgICB0aGlzLl9kYXRlQWRhcHRlci5nZXRNb250aChkYXRlMSkgPT0gdGhpcy5fZGF0ZUFkYXB0ZXIuZ2V0TW9udGgoZGF0ZTIpXG4gICAgICApO1xuICAgIH1cbiAgICBpZiAodGhpcy5jYWxlbmRhci5jdXJyZW50VmlldyA9PSAneWVhcicpIHtcbiAgICAgIHJldHVybiB0aGlzLl9kYXRlQWRhcHRlci5nZXRZZWFyKGRhdGUxKSA9PSB0aGlzLl9kYXRlQWRhcHRlci5nZXRZZWFyKGRhdGUyKTtcbiAgICB9XG4gICAgLy8gT3RoZXJ3aXNlIHdlIGFyZSBpbiAnbXVsdGkteWVhcicgdmlldy5cbiAgICByZXR1cm4gaXNTYW1lTXVsdGlZZWFyVmlldyhcbiAgICAgIHRoaXMuX2RhdGVBZGFwdGVyLFxuICAgICAgZGF0ZTEsXG4gICAgICBkYXRlMixcbiAgICAgIHRoaXMuY2FsZW5kYXIubWluRGF0ZSxcbiAgICAgIHRoaXMuY2FsZW5kYXIubWF4RGF0ZVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogRm9ybWF0IHR3byBpbmRpdmlkdWFsIGxhYmVscyBmb3IgdGhlIG1pbmltdW0geWVhciBhbmQgbWF4aW11bSB5ZWFyIGF2YWlsYWJsZSBpbiB0aGUgbXVsdGkteWVhclxuICAgKiBjYWxlbmRhciB2aWV3LiBSZXR1cm5zIGFuIGFycmF5IG9mIHR3byBzdHJpbmdzIHdoZXJlIHRoZSBmaXJzdCBzdHJpbmcgaXMgdGhlIGZvcm1hdHRlZCBsYWJlbFxuICAgKiBmb3IgdGhlIG1pbmltdW0geWVhciwgYW5kIHRoZSBzZWNvbmQgc3RyaW5nIGlzIHRoZSBmb3JtYXR0ZWQgbGFiZWwgZm9yIHRoZSBtYXhpbXVtIHllYXIuXG4gICAqL1xuICBwcml2YXRlIF9mb3JtYXRNaW5BbmRNYXhZZWFyTGFiZWxzKCk6IFttaW5ZZWFyTGFiZWw6IHN0cmluZywgbWF4WWVhckxhYmVsOiBzdHJpbmddIHtcbiAgICAvLyBUaGUgb2Zmc2V0IGZyb20gdGhlIGFjdGl2ZSB5ZWFyIHRvIHRoZSBcInNsb3RcIiBmb3IgdGhlIHN0YXJ0aW5nIHllYXIgaXMgdGhlXG4gICAgLy8gKmFjdHVhbCogZmlyc3QgcmVuZGVyZWQgeWVhciBpbiB0aGUgbXVsdGkteWVhciB2aWV3LCBhbmQgdGhlIGxhc3QgeWVhciBpc1xuICAgIC8vIGp1c3QgeWVhcnNQZXJQYWdlIC0gMSBhd2F5LlxuICAgIGNvbnN0IGFjdGl2ZVllYXIgPSB0aGlzLl9kYXRlQWRhcHRlci5nZXRZZWFyKHRoaXMuY2FsZW5kYXIuYWN0aXZlRGF0ZSk7XG4gICAgY29uc3QgbWluWWVhck9mUGFnZSA9XG4gICAgICBhY3RpdmVZZWFyIC1cbiAgICAgIGdldEFjdGl2ZU9mZnNldChcbiAgICAgICAgdGhpcy5fZGF0ZUFkYXB0ZXIsXG4gICAgICAgIHRoaXMuY2FsZW5kYXIuYWN0aXZlRGF0ZSxcbiAgICAgICAgdGhpcy5jYWxlbmRhci5taW5EYXRlLFxuICAgICAgICB0aGlzLmNhbGVuZGFyLm1heERhdGVcbiAgICAgICk7XG4gICAgY29uc3QgbWF4WWVhck9mUGFnZSA9IG1pblllYXJPZlBhZ2UgKyB5ZWFyc1BlclBhZ2UgLSAxO1xuICAgIGNvbnN0IG1pblllYXJMYWJlbCA9IHRoaXMuX2RhdGVBZGFwdGVyLmdldFllYXJOYW1lKFxuICAgICAgdGhpcy5fZGF0ZUFkYXB0ZXIuY3JlYXRlRGF0ZShtaW5ZZWFyT2ZQYWdlLCAwLCAxKVxuICAgICk7XG4gICAgY29uc3QgbWF4WWVhckxhYmVsID0gdGhpcy5fZGF0ZUFkYXB0ZXIuZ2V0WWVhck5hbWUoXG4gICAgICB0aGlzLl9kYXRlQWRhcHRlci5jcmVhdGVEYXRlKG1heFllYXJPZlBhZ2UsIDAsIDEpXG4gICAgKTtcblxuICAgIHJldHVybiBbbWluWWVhckxhYmVsLCBtYXhZZWFyTGFiZWxdO1xuICB9XG5cbiAgcHJpdmF0ZSBfaWQgPSBgY2FsZW5kYXItaGVhZGVyLSR7Y2FsZW5kYXJIZWFkZXJJZCsrfWA7XG5cbiAgX3BlcmlvZEJ1dHRvbkxhYmVsSWQgPSBgJHt0aGlzLl9pZH0tcGVyaW9kLWxhYmVsYDtcbn1cbiIsIjxkaXYgY2xhc3M9XCJweC0zIHB0LTIuNSBwYi0wIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlblwiPlxuICA8IS0tIFtGaXJlZm94IElzc3VlOiBodHRwczovL2J1Z3ppbGxhLm1vemlsbGEub3JnL3Nob3dfYnVnLmNnaT9pZD0xODgwNTMzXVxuICAgIFJlbG9jYXRlZCBsYWJlbCBuZXh0IHRvIHJlbGF0ZWQgYnV0dG9uIGFuZCBtYWRlIHZpc3VhbGx5IGhpZGRlbiB2aWEgY2RrLXZpc3VhbGx5LWhpZGRlblxuICAgIHRvIGVuYWJsZSBsYWJlbCB0byBhcHBlYXIgaW4gYTExeSB0cmVlIGZvciBTUiB3aGVuIHVzaW5nIEZpcmVmb3ggLS0+XG4gIDxsYWJlbFxuICAgIGNsYXNzPVwiaGlkZGVuIGNkay12aXN1YWxseS1oaWRkZW5cIlxuICAgIGZvcj1cIlwiXG4gICAgW2lkXT1cIl9wZXJpb2RCdXR0b25MYWJlbElkXCJcbiAgPlxuICAgIHt7IHBlcmlvZEJ1dHRvbkRlc2NyaXB0aW9uIH19XG4gIDwvbGFiZWw+XG5cbiAgPGJ1dHRvblxuICAgIGNsYXNzPVwiYnRuIGJ0bi1naG9zdFwiXG4gICAgYXJpYS1saXZlPVwicG9saXRlXCJcbiAgICBbYXR0ci5hcmlhLWxhYmVsXT1cInBlcmlvZEJ1dHRvbkxhYmVsXCJcbiAgICBbYXR0ci5hcmlhLWRlc2NyaWJlZGJ5XT1cIl9wZXJpb2RCdXR0b25MYWJlbElkXCJcbiAgICAoY2xpY2spPVwiY3VycmVudFBlcmlvZENsaWNrZWQoKVwiXG4gID5cbiAgICA8c3BhbiBhcmlhLWhpZGRlbj1cInRydWVcIj57eyBwZXJpb2RCdXR0b25UZXh0IH19PC9zcGFuPlxuXG4gICAgPHN2Z1xuICAgICAgY2xhc3M9XCJ3LTMgaC0zXCJcbiAgICAgIGZpbGw9XCJub25lXCJcbiAgICAgIHZpZXdCb3g9XCIwIDAgMjQgMjRcIlxuICAgICAgc3Ryb2tlLXdpZHRoPVwiM1wiXG4gICAgICBzdHJva2U9XCJjdXJyZW50Q29sb3JcIlxuICAgID5cbiAgICAgIDxwYXRoXG4gICAgICAgIHN0cm9rZS1saW5lY2FwPVwicm91bmRcIlxuICAgICAgICBzdHJva2UtbGluZWpvaW49XCJyb3VuZFwiXG4gICAgICAgIGQ9XCJtMTkuNSA4LjI1LTcuNSA3LjUtNy41LTcuNVwiXG4gICAgICAvPlxuICAgIDwvc3ZnPlxuICA8L2J1dHRvbj5cblxuICA8ZGl2IGNsYXNzPVwiZmxleC1hdXRvXCI+PC9kaXY+XG5cbiAgPG5nLWNvbnRlbnQgLz5cblxuICA8YnV0dG9uXG4gICAgdHlwZT1cImJ1dHRvblwiXG4gICAgY2xhc3M9XCJidG4gYnRuLWdob3N0IGJ0bi1jaXJjbGUgYnRuLXNtXCJcbiAgICBbZGlzYWJsZWRdPVwiIXByZXZpb3VzRW5hYmxlZCgpXCJcbiAgICBbYXR0ci5hcmlhLWxhYmVsXT1cInByZXZCdXR0b25MYWJlbFwiXG4gICAgKGNsaWNrKT1cInByZXZpb3VzQ2xpY2tlZCgpXCJcbiAgPlxuICAgIDxzdmdcbiAgICAgIGNsYXNzPVwidy02IGgtNlwiXG4gICAgICBmaWxsPVwibm9uZVwiXG4gICAgICB2aWV3Qm94PVwiMCAwIDI0IDI0XCJcbiAgICAgIHN0cm9rZS13aWR0aD1cIjJcIlxuICAgICAgc3Ryb2tlPVwiY3VycmVudENvbG9yXCJcbiAgICA+XG4gICAgICA8cGF0aFxuICAgICAgICBzdHJva2UtbGluZWNhcD1cInJvdW5kXCJcbiAgICAgICAgc3Ryb2tlLWxpbmVqb2luPVwicm91bmRcIlxuICAgICAgICBkPVwiTTE1Ljc1IDE5LjUgOC4yNSAxMmw3LjUtNy41XCJcbiAgICAgIC8+XG4gICAgPC9zdmc+XG4gIDwvYnV0dG9uPlxuXG4gIDxidXR0b25cbiAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICBjbGFzcz1cImJ0biBidG4tZ2hvc3QgYnRuLWNpcmNsZSBidG4tc21cIlxuICAgIFtkaXNhYmxlZF09XCIhbmV4dEVuYWJsZWQoKVwiXG4gICAgW2F0dHIuYXJpYS1sYWJlbF09XCJuZXh0QnV0dG9uTGFiZWxcIlxuICAgIChjbGljayk9XCJuZXh0Q2xpY2tlZCgpXCJcbiAgPlxuICAgIDxzdmdcbiAgICAgIGNsYXNzPVwidy02IGgtNlwiXG4gICAgICBmaWxsPVwibm9uZVwiXG4gICAgICB2aWV3Qm94PVwiMCAwIDI0IDI0XCJcbiAgICAgIHN0cm9rZS13aWR0aD1cIjJcIlxuICAgICAgc3Ryb2tlPVwiY3VycmVudENvbG9yXCJcbiAgICA+XG4gICAgICA8cGF0aFxuICAgICAgICBzdHJva2UtbGluZWNhcD1cInJvdW5kXCJcbiAgICAgICAgc3Ryb2tlLWxpbmVqb2luPVwicm91bmRcIlxuICAgICAgICBkPVwibTguMjUgNC41IDcuNSA3LjUtNy41IDcuNVwiXG4gICAgICAvPlxuICAgIDwvc3ZnPlxuICA8L2J1dHRvbj5cbjwvZGl2PlxuIl19
