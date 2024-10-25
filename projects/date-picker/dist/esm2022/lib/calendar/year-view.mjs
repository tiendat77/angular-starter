/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { DOWN_ARROW, END, ENTER, HOME, LEFT_ARROW, PAGE_DOWN, PAGE_UP, RIGHT_ARROW, UP_ARROW, SPACE, } from '@angular/cdk/keycodes';
import { ChangeDetectionStrategy, Component, EventEmitter, Inject, Input, Optional, Output, ViewChild, ViewEncapsulation, } from '@angular/core';
import { Subscription } from 'rxjs';
import { startWith } from 'rxjs/operators';
import { DATE_FORMATS } from '../adapter';
import { CalendarBody, CalendarCell, } from './calendar-body';
import { createMissingDateImplError } from '../utils/errors';
import { DateRange } from '../date-picker/date-selection-model';
import * as i0 from "@angular/core";
import * as i1 from "../adapter";
import * as i2 from "@angular/cdk/bidi";
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
        const validDate = this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(value)) ||
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
        }
        else {
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
        const selectedMonth = this._dateAdapter.createDate(this._dateAdapter.getYear(this.activeDate), month, 1);
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
                this.activeDate = this._dateAdapter.addCalendarMonths(this._activeDate, -this._dateAdapter.getMonth(this._activeDate));
                break;
            case END:
                this.activeDate = this._dateAdapter.addCalendarMonths(this._activeDate, 11 - this._dateAdapter.getMonth(this._activeDate));
                break;
            case PAGE_UP:
                this.activeDate = this._dateAdapter.addCalendarYears(this._activeDate, event.altKey ? -10 : -1);
                break;
            case PAGE_DOWN:
                this.activeDate = this._dateAdapter.addCalendarYears(this._activeDate, event.altKey ? 10 : 1);
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
        const normalizedDate = this._dateAdapter.createDate(this._dateAdapter.getYear(this.activeDate), month, 1);
        const daysInMonth = this._dateAdapter.getNumDaysInMonth(normalizedDate);
        return this._dateAdapter.createDate(this._dateAdapter.getYear(this.activeDate), month, Math.min(this._dateAdapter.getDate(this.activeDate), daysInMonth));
    }
    /** Creates an CalendarCell for the given month. */
    _createCellForMonth(month, monthName) {
        const date = this._dateAdapter.createDate(this._dateAdapter.getYear(this.activeDate), month, 1);
        const ariaLabel = this._dateAdapter.format(date, this._dateFormats.display.monthYearA11yLabel);
        const cellClasses = this.dateClass ? this.dateClass(date, 'year') : undefined;
        return new CalendarCell(month, monthName.toLocaleUpperCase(), ariaLabel, this._shouldEnableMonth(month), cellClasses);
    }
    /** Whether the given month is enabled. */
    _shouldEnableMonth(month) {
        const activeYear = this._dateAdapter.getYear(this.activeDate);
        if (month === undefined ||
            month === null ||
            this._isYearAndMonthAfterMaxDate(activeYear, month) ||
            this._isYearAndMonthBeforeMinDate(activeYear, month)) {
            return false;
        }
        if (!this.dateFilter) {
            return true;
        }
        const firstOfMonth = this._dateAdapter.createDate(activeYear, month, 1);
        // If any date in the month is enabled count the month as enabled.
        for (let date = firstOfMonth; this._dateAdapter.getMonth(date) == month; date = this._dateAdapter.addCalendarDays(date, 1)) {
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
        }
        else {
            this._selectedMonth = this._getMonthInCurrentYear(value);
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: YearView, deps: [{ token: i0.ChangeDetectorRef }, { token: DATE_FORMATS, optional: true }, { token: i1.DateAdapter, optional: true }, { token: i2.Directionality, optional: true }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "18.2.8", type: YearView, isStandalone: true, selector: "year-view", inputs: { activeDate: "activeDate", selected: "selected", minDate: "minDate", maxDate: "maxDate", dateFilter: "dateFilter", dateClass: "dateClass" }, outputs: { selectedChange: "selectedChange", monthSelected: "monthSelected", activeDateChange: "activeDateChange" }, viewQueries: [{ propertyName: "_calendarBody", first: true, predicate: CalendarBody, descendants: true }], exportAs: ["yearView"], ngImport: i0, template: "<!-- eslint-disable @angular-eslint/template/interactive-supports-focus -->\n<table\n  class=\"calendar-table\"\n  role=\"grid\"\n>\n  <thead\n    aria-hidden=\"true\"\n    class=\"calendar-table-header\"\n  >\n    <tr>\n      <th\n        class=\"calendar-table-header-divider\"\n        colspan=\"4\"\n      ></th>\n    </tr>\n  </thead>\n  <tbody\n    calendar-body\n    [label]=\"_yearLabel\"\n    [rows]=\"_months\"\n    [todayValue]=\"_todayMonth!\"\n    [startValue]=\"_selectedMonth!\"\n    [endValue]=\"_selectedMonth!\"\n    [labelMinRequiredCells]=\"2\"\n    [numCols]=\"4\"\n    [cellAspectRatio]=\"4 / 7\"\n    [activeCell]=\"_dateAdapter.getMonth(activeDate)\"\n    (selectedValueChange)=\"_monthSelected($event)\"\n    (activeDateChange)=\"_updateActiveDate($event)\"\n    (keyup)=\"_handleCalendarBodyKeyup($event)\"\n    (keydown)=\"_handleCalendarBodyKeydown($event)\"\n  ></tbody>\n</table>\n", dependencies: [{ kind: "component", type: CalendarBody, selector: "[calendar-body]", inputs: ["label", "rows", "todayValue", "startValue", "endValue", "labelMinRequiredCells", "numCols", "activeCell", "isRange", "cellAspectRatio", "comparisonStart", "comparisonEnd", "previewStart", "previewEnd", "startDateAccessibleName", "endDateAccessibleName"], outputs: ["selectedValueChange", "previewChange", "activeDateChange", "dragStarted", "dragEnded"], exportAs: ["calendarBody"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: YearView, decorators: [{
            type: Component,
            args: [{ selector: 'year-view', exportAs: 'yearView', encapsulation: ViewEncapsulation.None, changeDetection: ChangeDetectionStrategy.OnPush, standalone: true, imports: [CalendarBody], template: "<!-- eslint-disable @angular-eslint/template/interactive-supports-focus -->\n<table\n  class=\"calendar-table\"\n  role=\"grid\"\n>\n  <thead\n    aria-hidden=\"true\"\n    class=\"calendar-table-header\"\n  >\n    <tr>\n      <th\n        class=\"calendar-table-header-divider\"\n        colspan=\"4\"\n      ></th>\n    </tr>\n  </thead>\n  <tbody\n    calendar-body\n    [label]=\"_yearLabel\"\n    [rows]=\"_months\"\n    [todayValue]=\"_todayMonth!\"\n    [startValue]=\"_selectedMonth!\"\n    [endValue]=\"_selectedMonth!\"\n    [labelMinRequiredCells]=\"2\"\n    [numCols]=\"4\"\n    [cellAspectRatio]=\"4 / 7\"\n    [activeCell]=\"_dateAdapter.getMonth(activeDate)\"\n    (selectedValueChange)=\"_monthSelected($event)\"\n    (activeDateChange)=\"_updateActiveDate($event)\"\n    (keyup)=\"_handleCalendarBodyKeyup($event)\"\n    (keydown)=\"_handleCalendarBodyKeydown($event)\"\n  ></tbody>\n</table>\n" }]
        }], ctorParameters: () => [{ type: i0.ChangeDetectorRef }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [DATE_FORMATS]
                }] }, { type: i1.DateAdapter, decorators: [{
                    type: Optional
                }] }, { type: i2.Directionality, decorators: [{
                    type: Optional
                }] }], propDecorators: { activeDate: [{
                type: Input
            }], selected: [{
                type: Input
            }], minDate: [{
                type: Input
            }], maxDate: [{
                type: Input
            }], dateFilter: [{
                type: Input
            }], dateClass: [{
                type: Input
            }], selectedChange: [{
                type: Output
            }], monthSelected: [{
                type: Output
            }], activeDateChange: [{
                type: Output
            }], _calendarBody: [{
                type: ViewChild,
                args: [CalendarBody]
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieWVhci12aWV3LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2xpYi9jYWxlbmRhci95ZWFyLXZpZXcudHMiLCIuLi8uLi8uLi8uLi9zcmMvbGliL2NhbGVuZGFyL3llYXItdmlldy5odG1sIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFDTCxVQUFVLEVBQ1YsR0FBRyxFQUNILEtBQUssRUFDTCxJQUFJLEVBQ0osVUFBVSxFQUNWLFNBQVMsRUFDVCxPQUFPLEVBQ1AsV0FBVyxFQUNYLFFBQVEsRUFDUixLQUFLLEdBQ04sTUFBTSx1QkFBdUIsQ0FBQztBQUcvQixPQUFPLEVBRUwsdUJBQXVCLEVBRXZCLFNBQVMsRUFDVCxZQUFZLEVBQ1osTUFBTSxFQUNOLEtBQUssRUFDTCxRQUFRLEVBQ1IsTUFBTSxFQUNOLFNBQVMsRUFDVCxpQkFBaUIsR0FFbEIsTUFBTSxlQUFlLENBQUM7QUFFdkIsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUNwQyxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFFM0MsT0FBTyxFQUFlLFlBQVksRUFBZSxNQUFNLFlBQVksQ0FBQztBQUNwRSxPQUFPLEVBQ0wsWUFBWSxFQUNaLFlBQVksR0FHYixNQUFNLGlCQUFpQixDQUFDO0FBQ3pCLE9BQU8sRUFBRSwwQkFBMEIsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQzdELE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxxQ0FBcUMsQ0FBQzs7OztBQUVoRTs7O0dBR0c7QUFVSCxNQUFNLE9BQU8sUUFBUTtJQTZGUjtJQUNpQztJQUN2QjtJQUNDO0lBL0ZkLHFCQUFxQixHQUFHLFlBQVksQ0FBQyxLQUFLLENBQUM7SUFFbkQsNEZBQTRGO0lBQ3BGLG9CQUFvQixDQUFVO0lBRXRDLHlGQUF5RjtJQUN6RixJQUNJLFVBQVU7UUFDWixPQUFPLElBQUksQ0FBQyxXQUFXLENB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QUN4RCxpQkFBaUIsQ0FBQyxLQUE4QjtRQUN0RCxJQUFJLEtBQUssWUFBWSxTQUFTLEVBQUUsQ0FBQztZQUMvQixJQUFJLENBQUMsY0FBYztnQkFDakIsSUFBSSxDQUFDLHNCQUFzQixDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUMsc0JBQXNCLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3ZGLENBQUM7YUFBTSxDQUFDO1lBQ04sSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUMsc0JBQXNCLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDM0QsQ0FBQztJQUNILENBQUM7dUdBNVhVLFFBQVEsbURBOEZHLFlBQVk7MkZBOUZ2QixRQUFRLCtYQTJFUixZQUFZLHdFQzFJekIsaTVCQWlDQSw0Q0Q0QlksWUFBWTs7MkZBRVgsUUFBUTtrQkFUcEIsU0FBUzsrQkFDRSxXQUFXLFlBRVgsVUFBVSxpQkFDTCxpQkFBaUIsQ0FBQyxJQUFJLG1CQUNwQix1QkFBdUIsQ0FBQyxNQUFNLGNBQ25DLElBQUksV0FDUCxDQUFDLFlBQVksQ0FBQzs7MEJBZ0dwQixRQUFROzswQkFBSSxNQUFNOzJCQUFDLFlBQVk7OzBCQUMvQixRQUFROzswQkFDUixRQUFRO3lDQXhGUCxVQUFVO3NCQURiLEtBQUs7Z0JBa0JGLFFBQVE7c0JBRFgsS0FBSztnQkFpQkYsT0FBTztzQkFEVixLQUFLO2dCQVdGLE9BQU87c0JBRFYsS0FBSztnQkFVRyxVQUFVO3NCQUFsQixLQUFLO2dCQUdHLFNBQVM7c0JBQWpCLEtBQUs7Z0JBR2EsY0FBYztzQkFBaEMsTUFBTTtnQkFHWSxhQUFhO3NCQUEvQixNQUFNO2dCQUdZLGdCQUFnQjtzQkFBbEMsTUFBTTtnQkFHa0IsYUFBYTtzQkFBckMsU0FBUzt1QkFBQyxZQUFZIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7XG4gIERPV05fQVJST1csXG4gIEVORCxcbiAgRU5URVIsXG4gIEhPTUUsXG4gIExFRlRfQVJST1csXG4gIFBBR0VfRE9XTixcbiAgUEFHRV9VUCxcbiAgUklHSFRfQVJST1csXG4gIFVQX0FSUk9XLFxuICBTUEFDRSxcbn0gZnJvbSAnQGFuZ3VsYXIvY2RrL2tleWNvZGVzJztcbmltcG9ydCB7IERpcmVjdGlvbmFsaXR5IH0gZnJvbSAnQGFuZ3VsYXIvY2RrL2JpZGknO1xuXG5pbXBvcnQge1xuICBBZnRlckNvbnRlbnRJbml0LFxuICBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSxcbiAgQ2hhbmdlRGV0ZWN0b3JSZWYsXG4gIENvbXBvbmVudCxcbiAgRXZlbnRFbWl0dGVyLFxuICBJbmplY3QsXG4gIElucHV0LFxuICBPcHRpb25hbCxcbiAgT3V0cHV0LFxuICBWaWV3Q2hpbGQsXG4gIFZpZXdFbmNhcHN1bGF0aW9uLFxuICBPbkRlc3Ryb3ksXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyBTdWJzY3JpcHRpb24gfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IHN0YXJ0V2l0aCB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcblxuaW1wb3J0IHsgRGF0ZUFkYXB0ZXIsIERBVEVfRk9STUFUUywgRGF0ZUZvcm1hdHMgfSBmcm9tICcuLi9hZGFwdGVyJztcbmltcG9ydCB7XG4gIENhbGVuZGFyQm9keSxcbiAgQ2FsZW5kYXJDZWxsLFxuICBDYWxlbmRhclVzZXJFdmVudCxcbiAgQ2FsZW5kYXJDZWxsQ2xhc3NGdW5jdGlvbixcbn0gZnJvbSAnLi9jYWxlbmRhci1ib2R5JztcbmltcG9ydCB7IGNyZWF0ZU1pc3NpbmdEYXRlSW1wbEVycm9yIH0gZnJvbSAnLi4vdXRpbHMvZXJyb3JzJztcbmltcG9ydCB7IERhdGVSYW5nZSB9IGZyb20gJy4uL2RhdGUtcGlja2VyL2RhdGUtc2VsZWN0aW9uLW1vZGVsJztcblxuLyoqXG4gKiBBbiBpbnRlcm5hbCBjb21wb25lbnQgdXNlZCB0byBkaXNwbGF5IGEgc2luZ2xlIHllYXIgaW4gdGhlIGRhdGVwaWNrZXIuXG4gKiBAZG9jcy1wcml2YXRlXG4gKi9cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ3llYXItdmlldycsXG4gIHRlbXBsYXRlVXJsOiAneWVhci12aWV3Lmh0bWwnLFxuICBleHBvcnRBczogJ3llYXJWaWV3JyxcbiAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24uTm9uZSxcbiAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5PblB1c2gsXG4gIHN0YW5kYWxvbmU6IHRydWUsXG4gIGltcG9ydHM6IFtDYWxlbmRhckJvZHldLFxufSlcbmV4cG9ydCBjbGFzcyBZZWFyVmlldzxEPiBpbXBsZW1lbnRzIEFmdGVyQ29udGVudEluaXQsIE9uRGVzdHJveSB7XG4gIHByaXZhdGUgX3JlcmVuZGVyU3Vic2NyaXB0aW9uID0gU3Vic2NyaXB0aW9uLkVNUFRZO1xuXG4gIC8qKiBGbGFnIHVzZWQgdG8gZmlsdGVyIG91dCBzcGFjZS9lbnRlciBrZXl1cCBldmVudHMgdGhhdCBvcmlnaW5hdGVkIG91dHNpZGUgb2YgdGhlIHZpZXcuICovXG4gIHByaXZhdGUgX3NlbGVjdGlvbktleVByZXNzZWQ6IGJvb2xlYW47XG5cbiAgLyoqIFRoZSBkYXRlIHRvIGRpc3BsYXkgaW4gdGhpcyB5ZWFyIHZpZXcgKGV2ZXJ5dGhpbmcgb3RoZXIgdGhhbiB0aGUgeWVhciBpcyBpZ25vcmVkKS4gKi9cbiAgQElucHV0KClcbiAgZ2V0IGFjdGl2ZURhdGUoKTogRCB7XG4gICAgcmV0dXJuIHRoaXMuX2FjdGl2ZURhdGU7XG4gIH1cbiAgc2V0IGFjdGl2ZURhdGUodmFsdWU6IEQpIHtcbiAgICBjb25zdCBvbGRBY3RpdmVEYXRlID0gdGhpcy5fYWN0aXZlRGF0ZTtcbiAgICBjb25zdCB2YWxpZERhdGUgPVxuICAgICAgdGhpcy5fZGF0ZUFkYXB0ZXIuZ2V0VmFsaWREYXRlT3JOdWxsKHRoaXMuX2RhdGVBZGFwdGVyLmRlc2VyaWFsaXplKHZhbHVlKSkgfHxcbiAgICAgIHRoaXMuX2RhdGVBZGFwdGVyLnRvZGF5KCk7XG4gICAgdGhpcy5fYWN0aXZlRGF0ZSA9IHRoaXMuX2RhdGVBZGFwdGVyLmNsYW1wRGF0ZSh2YWxpZERhdGUsIHRoaXMubWluRGF0ZSwgdGhpcy5tYXhEYXRlKTtcbiAgICBpZiAodGhpcy5fZGF0ZUFkYXB0ZXIuZ2V0WWVhcihvbGRBY3RpdmVEYXRlKSAhPT0gdGhpcy5fZGF0ZUFkYXB0ZXIuZ2V0WWVhcih0aGlzLl9hY3RpdmVEYXRlKSkge1xuICAgICAgdGhpcy5faW5pdCgpO1xuICAgIH1cbiAgfVxuICBwcml2YXRlIF9hY3RpdmVEYXRlOiBEO1xuXG4gIC8qKiBUaGUgY3VycmVudGx5IHNlbGVjdGVkIGRhdGUuICovXG4gIEBJbnB1dCgpXG4gIGdldCBzZWxlY3RlZCgpOiBEYXRlUmFuZ2U8RD4gfCBEIHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuX3NlbGVjdGVkO1xuICB9XG4gIHNldCBzZWxlY3RlZCh2YWx1ZTogRGF0ZVJhbmdlPEQ+IHwgRCB8IG51bGwpIHtcbiAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBEYXRlUmFuZ2UpIHtcbiAgICAgIHRoaXMuX3NlbGVjdGVkID0gdmFsdWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX3NlbGVjdGVkID0gdGhpcy5fZGF0ZUFkYXB0ZXIuZ2V0VmFsaWREYXRlT3JOdWxsKHRoaXMuX2RhdGVBZGFwdGVyLmRlc2VyaWFsaXplKHZhbHVlKSk7XG4gICAgfVxuXG4gICAgdGhpcy5fc2V0U2VsZWN0ZWRNb250aCh2YWx1ZSk7XG4gIH1cbiAgcHJpdmF0ZSBfc2VsZWN0ZWQ6IERhdGVSYW5nZTxEPiB8IEQgfCBudWxsO1xuXG4gIC8qKiBUaGUgbWluaW11bSBzZWxlY3RhYmxlIGRhdGUuICovXG4gIEBJbnB1dCgpXG4gIGdldCBtaW5EYXRlKCk6IEQgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5fbWluRGF0ZTtcbiAgfVxuICBzZXQgbWluRGF0ZSh2YWx1ZTogRCB8IG51bGwpIHtcbiAgICB0aGlzLl9taW5EYXRlID0gdGhpcy5fZGF0ZUFkYXB0ZXIuZ2V0VmFsaWREYXRlT3JOdWxsKHRoaXMuX2RhdGVBZGFwdGVyLmRlc2VyaWFsaXplKHZhbHVlKSk7XG4gIH1cbiAgcHJpdmF0ZSBfbWluRGF0ZTogRCB8IG51bGw7XG5cbiAgLyoqIFRoZSBtYXhpbXVtIHNlbGVjdGFibGUgZGF0ZS4gKi9cbiAgQElucHV0KClcbiAgZ2V0IG1heERhdGUoKTogRCB8IG51bGwge1xuICAgIHJldHVybiB0aGlzLl9tYXhEYXRlO1xuICB9XG4gIHNldCBtYXhEYXRlKHZhbHVlOiBEIHwgbnVsbCkge1xuICAgIHRoaXMuX21heERhdGUgPSB0aGlzLl9kYXRlQWRhcHRlci5nZXRWYWxpZERhdGVPck51bGwodGhpcy5fZGF0ZUFkYXB0ZXIuZGVzZXJpYWxpemUodmFsdWUpKTtcbiAgfVxuICBwcml2YXRlIF9tYXhEYXRlOiBEIHwgbnVsbDtcblxuICAvKiogQSBmdW5jdGlvbiB1c2VkIHRvIGZpbHRlciB3aGljaCBkYXRlcyBhcmUgc2VsZWN0YWJsZS4gKi9cbiAgQElucHV0KCkgZGF0ZUZpbHRlcjogKGRhdGU6IEQpID0+IGJvb2xlYW47XG5cbiAgLyoqIEZ1bmN0aW9uIHRoYXQgY2FuIGJlIHVzZWQgdG8gYWRkIGN1c3RvbSBDU1MgY2xhc3NlcyB0byBkYXRlIGNlbGxzLiAqL1xuICBASW5wdXQoKSBkYXRlQ2xhc3M6IENhbGVuZGFyQ2VsbENsYXNzRnVuY3Rpb248RD47XG5cbiAgLyoqIEVtaXRzIHdoZW4gYSBuZXcgbW9udGggaXMgc2VsZWN0ZWQuICovXG4gIEBPdXRwdXQoKSByZWFkb25seSBzZWxlY3RlZENoYW5nZTogRXZlbnRFbWl0dGVyPEQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxEPigpO1xuXG4gIC8qKiBFbWl0cyB0aGUgc2VsZWN0ZWQgbW9udGguIFRoaXMgZG9lc24ndCBpbXBseSBhIGNoYW5nZSBvbiB0aGUgc2VsZWN0ZWQgZGF0ZSAqL1xuICBAT3V0cHV0KCkgcmVhZG9ubHkgbW9udGhTZWxlY3RlZDogRXZlbnRFbWl0dGVyPEQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxEPigpO1xuXG4gIC8qKiBFbWl0cyB3aGVuIGFueSBkYXRlIGlzIGFjdGl2YXRlZC4gKi9cbiAgQE91dHB1dCgpIHJlYWRvbmx5IGFjdGl2ZURhdGVDaGFuZ2U6IEV2ZW50RW1pdHRlcjxEPiA9IG5ldyBFdmVudEVtaXR0ZXI8RD4oKTtcblxuICAvKiogVGhlIGJvZHkgb2YgY2FsZW5kYXIgdGFibGUgKi9cbiAgQFZpZXdDaGlsZChDYWxlbmRhckJvZHkpIF9jYWxlbmRhckJvZHk6IENhbGVuZGFyQm9keTtcblxuICAvKiogR3JpZCBvZiBjYWxlbmRhciBjZWxscyByZXByZXNlbnRpbmcgdGhlIG1vbnRocyBvZiB0aGUgeWVhci4gKi9cbiAgX21vbnRoczogQ2FsZW5kYXJDZWxsW11bXTtcblxuICAvKiogVGhlIGxhYmVsIGZvciB0aGlzIHllYXIgKGUuZy4gXCIyMDE3XCIpLiAqL1xuICBfeWVhckxhYmVsOiBzdHJpbmc7XG5cbiAgLyoqIFRoZSBtb250aCBpbiB0aGlzIHllYXIgdGhhdCB0b2RheSBmYWxscyBvbi4gTnVsbCBpZiB0b2RheSBpcyBpbiBhIGRpZmZlcmVudCB5ZWFyLiAqL1xuICBfdG9kYXlNb250aDogbnVtYmVyIHwgbnVsbDtcblxuICAvKipcbiAgICogVGhlIG1vbnRoIGluIHRoaXMgeWVhciB0aGF0IHRoZSBzZWxlY3RlZCBEYXRlIGZhbGxzIG9uLlxuICAgKiBOdWxsIGlmIHRoZSBzZWxlY3RlZCBEYXRlIGlzIGluIGEgZGlmZmVyZW50IHllYXIuXG4gICAqL1xuICBfc2VsZWN0ZWRNb250aDogbnVtYmVyIHwgbnVsbDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICByZWFkb25seSBfY2hhbmdlRGV0ZWN0b3JSZWY6IENoYW5nZURldGVjdG9yUmVmLFxuICAgIEBPcHRpb25hbCgpIEBJbmplY3QoREFURV9GT1JNQVRTKSBwcml2YXRlIF9kYXRlRm9ybWF0czogRGF0ZUZvcm1hdHMsXG4gICAgQE9wdGlvbmFsKCkgcHVibGljIF9kYXRlQWRhcHRlcjogRGF0ZUFkYXB0ZXI8RD4sXG4gICAgQE9wdGlvbmFsKCkgcHJpdmF0ZSBfZGlyPzogRGlyZWN0aW9uYWxpdHlcbiAgKSB7XG4gICAgaWYgKCF0aGlzLl9kYXRlQWRhcHRlcikge1xuICAgICAgdGhyb3cgY3JlYXRlTWlzc2luZ0RhdGVJbXBsRXJyb3IoJ0RhdGVBZGFwdGVyJyk7XG4gICAgfVxuICAgIGlmICghdGhpcy5fZGF0ZUZvcm1hdHMpIHtcbiAgICAgIHRocm93IGNyZWF0ZU1pc3NpbmdEYXRlSW1wbEVycm9yKCdEQVRFX0ZPUk1BVFMnKTtcbiAgICB9XG5cbiAgICB0aGlzLl9hY3RpdmVEYXRlID0gdGhpcy5fZGF0ZUFkYXB0ZXIudG9kYXkoKTtcbiAgfVxuXG4gIG5nQWZ0ZXJDb250ZW50SW5pdCgpIHtcbiAgICB0aGlzLl9yZXJlbmRlclN1YnNjcmlwdGlvbiA9IHRoaXMuX2RhdGVBZGFwdGVyLmxvY2FsZUNoYW5nZXNcbiAgICAgIC5waXBlKHN0YXJ0V2l0aChudWxsKSlcbiAgICAgIC5zdWJzY3JpYmUoKCkgPT4gdGhpcy5faW5pdCgpKTtcbiAgfVxuXG4gIG5nT25EZXN0cm95KCkge1xuICAgIHRoaXMuX3JlcmVuZGVyU3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XG4gIH1cblxuICAvKiogSGFuZGxlcyB3aGVuIGEgbmV3IG1vbnRoIGlzIHNlbGVjdGVkLiAqL1xuICBfbW9udGhTZWxlY3RlZChldmVudDogQ2FsZW5kYXJVc2VyRXZlbnQ8bnVtYmVyPikge1xuICAgIGNvbnN0IG1vbnRoID0gZXZlbnQudmFsdWU7XG5cbiAgICBjb25zdCBzZWxlY3RlZE1vbnRoID0gdGhpcy5fZGF0ZUFkYXB0ZXIuY3JlYXRlRGF0ZShcbiAgICAgIHRoaXMuX2RhdGVBZGFwdGVyLmdldFllYXIodGhpcy5hY3RpdmVEYXRlKSxcbiAgICAgIG1vbnRoLFxuICAgICAgMVxuICAgICk7XG4gICAgdGhpcy5tb250aFNlbGVjdGVkLmVtaXQoc2VsZWN0ZWRNb250aCk7XG5cbiAgICBjb25zdCBzZWxlY3RlZERhdGUgPSB0aGlzLl9nZXREYXRlRnJvbU1vbnRoKG1vbnRoKTtcbiAgICB0aGlzLnNlbGVjdGVkQ2hhbmdlLmVtaXQoc2VsZWN0ZWREYXRlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUYWtlcyB0aGUgaW5kZXggb2YgYSBjYWxlbmRhciBib2R5IGNlbGwgd3JhcHBlZCBpbiBhbiBldmVudCBhcyBhcmd1bWVudC4gRm9yIHRoZSBkYXRlIHRoYXRcbiAgICogY29ycmVzcG9uZHMgdG8gdGhlIGdpdmVuIGNlbGwsIHNldCBgYWN0aXZlRGF0ZWAgdG8gdGhhdCBkYXRlIGFuZCBmaXJlIGBhY3RpdmVEYXRlQ2hhbmdlYCB3aXRoXG4gICAqIHRoYXQgZGF0ZS5cbiAgICpcbiAgICogVGhpcyBmdW5jdGlvbiBpcyB1c2VkIHRvIG1hdGNoIGVhY2ggY29tcG9uZW50J3MgbW9kZWwgb2YgdGhlIGFjdGl2ZSBkYXRlIHdpdGggdGhlIGNhbGVuZGFyXG4gICAqIGJvZHkgY2VsbCB0aGF0IHdhcyBmb2N1c2VkLiBJdCB1cGRhdGVzIGl0cyB2YWx1ZSBvZiBgYWN0aXZlRGF0ZWAgc3luY2hyb25vdXNseSBhbmQgdXBkYXRlcyB0aGVcbiAgICogcGFyZW50J3MgdmFsdWUgYXN5bmNocm9ub3VzbHkgdmlhIHRoZSBgYWN0aXZlRGF0ZUNoYW5nZWAgZXZlbnQuIFRoZSBjaGlsZCBjb21wb25lbnQgcmVjZWl2ZXMgYW5cbiAgICogdXBkYXRlZCB2YWx1ZSBhc3luY2hyb25vdXNseSB2aWEgdGhlIGBhY3RpdmVDZWxsYCBJbnB1dC5cbiAgICovXG4gIF91cGRhdGVBY3RpdmVEYXRlKGV2ZW50OiBDYWxlbmRhclVzZXJFdmVudDxudW1iZXI+KSB7XG4gICAgY29uc3QgbW9udGggPSBldmVudC52YWx1ZTtcbiAgICBjb25zdCBvbGRBY3RpdmVEYXRlID0gdGhpcy5fYWN0aXZlRGF0ZTtcblxuICAgIHRoaXMuYWN0aXZlRGF0ZSA9IHRoaXMuX2dldERhdGVGcm9tTW9udGgobW9udGgpO1xuXG4gICAgaWYgKHRoaXMuX2RhdGVBZGFwdGVyLmNvbXBhcmVEYXRlKG9sZEFjdGl2ZURhdGUsIHRoaXMuYWN0aXZlRGF0ZSkpIHtcbiAgICAgIHRoaXMuYWN0aXZlRGF0ZUNoYW5nZS5lbWl0KHRoaXMuYWN0aXZlRGF0ZSk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEhhbmRsZXMga2V5ZG93biBldmVudHMgb24gdGhlIGNhbGVuZGFyIGJvZHkgd2hlbiBjYWxlbmRhciBpcyBpbiB5ZWFyIHZpZXcuICovXG4gIF9oYW5kbGVDYWxlbmRhckJvZHlLZXlkb3duKGV2ZW50OiBLZXlib2FyZEV2ZW50KTogdm9pZCB7XG4gICAgLy8gVE9ETyhtbWFsZXJiYSk6IFdlIGN1cnJlbnRseSBhbGxvdyBrZXlib2FyZCBuYXZpZ2F0aW9uIHRvIGRpc2FibGVkIGRhdGVzLCBidXQganVzdCBwcmV2ZW50XG4gICAgLy8gZGlzYWJsZWQgb25lcyBmcm9tIGJlaW5nIHNlbGVjdGVkLiBUaGlzIG1heSBub3QgYmUgaWRlYWwsIHdlIHNob3VsZCBsb29rIGludG8gd2hldGhlclxuICAgIC8vIG5hdmlnYXRpb24gc2hvdWxkIHNraXAgb3ZlciBkaXNhYmxlZCBkYXRlcywgYW5kIGlmIHNvLCBob3cgdG8gaW1wbGVtZW50IHRoYXQgZWZmaWNpZW50bHkuXG5cbiAgICBjb25zdCBvbGRBY3RpdmVEYXRlID0gdGhpcy5fYWN0aXZlRGF0ZTtcbiAgICBjb25zdCBpc1J0bCA9IHRoaXMuX2lzUnRsKCk7XG5cbiAgICBzd2l0Y2ggKGV2ZW50LmtleUNvZGUpIHtcbiAgICAgIGNhc2UgTEVGVF9BUlJPVzpcbiAgICAgICAgdGhpcy5hY3RpdmVEYXRlID0gdGhpcy5fZGF0ZUFkYXB0ZXIuYWRkQ2FsZW5kYXJNb250aHModGhpcy5fYWN0aXZlRGF0ZSwgaXNSdGwgPyAxIDogLTEpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgUklHSFRfQVJST1c6XG4gICAgICAgIHRoaXMuYWN0aXZlRGF0ZSA9IHRoaXMuX2RhdGVBZGFwdGVyLmFkZENhbGVuZGFyTW9udGhzKHRoaXMuX2FjdGl2ZURhdGUsIGlzUnRsID8gLTEgOiAxKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFVQX0FSUk9XOlxuICAgICAgICB0aGlzLmFjdGl2ZURhdGUgPSB0aGlzLl9kYXRlQWRhcHRlci5hZGRDYWxlbmRhck1vbnRocyh0aGlzLl9hY3RpdmVEYXRlLCAtNCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBET1dOX0FSUk9XOlxuICAgICAgICB0aGlzLmFjdGl2ZURhdGUgPSB0aGlzLl9kYXRlQWRhcHRlci5hZGRDYWxlbmRhck1vbnRocyh0aGlzLl9hY3RpdmVEYXRlLCA0KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEhPTUU6XG4gICAgICAgIHRoaXMuYWN0aXZlRGF0ZSA9IHRoaXMuX2RhdGVBZGFwdGVyLmFkZENhbGVuZGFyTW9udGhzKFxuICAgICAgICAgIHRoaXMuX2FjdGl2ZURhdGUsXG4gICAgICAgICAgLXRoaXMuX2RhdGVBZGFwdGVyLmdldE1vbnRoKHRoaXMuX2FjdGl2ZURhdGUpXG4gICAgICAgICk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBFTkQ6XG4gICAgICAgIHRoaXMuYWN0aXZlRGF0ZSA9IHRoaXMuX2RhdGVBZGFwdGVyLmFkZENhbGVuZGFyTW9udGhzKFxuICAgICAgICAgIHRoaXMuX2FjdGl2ZURhdGUsXG4gICAgICAgICAgMTEgLSB0aGlzLl9kYXRlQWRhcHRlci5nZXRNb250aCh0aGlzLl9hY3RpdmVEYXRlKVxuICAgICAgICApO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgUEFHRV9VUDpcbiAgICAgICAgdGhpcy5hY3RpdmVEYXRlID0gdGhpcy5fZGF0ZUFkYXB0ZXIuYWRkQ2FsZW5kYXJZZWFycyhcbiAgICAgICAgICB0aGlzLl9hY3RpdmVEYXRlLFxuICAgICAgICAgIGV2ZW50LmFsdEtleSA/IC0xMCA6IC0xXG4gICAgICAgICk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBQQUdFX0RPV046XG4gICAgICAgIHRoaXMuYWN0aXZlRGF0ZSA9IHRoaXMuX2RhdGVBZGFwdGVyLmFkZENhbGVuZGFyWWVhcnMoXG4gICAgICAgICAgdGhpcy5fYWN0aXZlRGF0ZSxcbiAgICAgICAgICBldmVudC5hbHRLZXkgPyAxMCA6IDFcbiAgICAgICAgKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEVOVEVSOlxuICAgICAgY2FzZSBTUEFDRTpcbiAgICAgICAgLy8gTm90ZSB0aGF0IHdlIG9ubHkgcHJldmVudCB0aGUgZGVmYXVsdCBhY3Rpb24gaGVyZSB3aGlsZSB0aGUgc2VsZWN0aW9uIGhhcHBlbnMgaW5cbiAgICAgICAgLy8gYGtleXVwYCBiZWxvdy4gV2UgY2FuJ3QgZG8gdGhlIHNlbGVjdGlvbiBoZXJlLCBiZWNhdXNlIGl0IGNhbiBjYXVzZSB0aGUgY2FsZW5kYXIgdG9cbiAgICAgICAgLy8gcmVvcGVuIGlmIGZvY3VzIGlzIHJlc3RvcmVkIGltbWVkaWF0ZWx5LiBXZSBhbHNvIGNhbid0IGNhbGwgYHByZXZlbnREZWZhdWx0YCBvbiBga2V5dXBgXG4gICAgICAgIC8vIGJlY2F1c2UgaXQncyB0b28gbGF0ZSAoc2VlICMyMzMwNSkuXG4gICAgICAgIHRoaXMuX3NlbGVjdGlvbktleVByZXNzZWQgPSB0cnVlO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIC8vIERvbid0IHByZXZlbnQgZGVmYXVsdCBvciBmb2N1cyBhY3RpdmUgY2VsbCBvbiBrZXlzIHRoYXQgd2UgZG9uJ3QgZXhwbGljaXRseSBoYW5kbGUuXG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fZGF0ZUFkYXB0ZXIuY29tcGFyZURhdGUob2xkQWN0aXZlRGF0ZSwgdGhpcy5hY3RpdmVEYXRlKSkge1xuICAgICAgdGhpcy5hY3RpdmVEYXRlQ2hhbmdlLmVtaXQodGhpcy5hY3RpdmVEYXRlKTtcbiAgICAgIHRoaXMuX2ZvY3VzQWN0aXZlQ2VsbEFmdGVyVmlld0NoZWNrZWQoKTtcbiAgICB9XG5cbiAgICAvLyBQcmV2ZW50IHVuZXhwZWN0ZWQgZGVmYXVsdCBhY3Rpb25zIHN1Y2ggYXMgZm9ybSBzdWJtaXNzaW9uLlxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gIH1cblxuICAvKiogSGFuZGxlcyBrZXl1cCBldmVudHMgb24gdGhlIGNhbGVuZGFyIGJvZHkgd2hlbiBjYWxlbmRhciBpcyBpbiB5ZWFyIHZpZXcuICovXG4gIF9oYW5kbGVDYWxlbmRhckJvZHlLZXl1cChldmVudDogS2V5Ym9hcmRFdmVudCk6IHZvaWQge1xuICAgIGlmIChldmVudC5rZXlDb2RlID09PSBTUEFDRSB8fCBldmVudC5rZXlDb2RlID09PSBFTlRFUikge1xuICAgICAgaWYgKHRoaXMuX3NlbGVjdGlvbktleVByZXNzZWQpIHtcbiAgICAgICAgdGhpcy5fbW9udGhTZWxlY3RlZCh7IHZhbHVlOiB0aGlzLl9kYXRlQWRhcHRlci5nZXRNb250aCh0aGlzLl9hY3RpdmVEYXRlKSwgZXZlbnQgfSk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX3NlbGVjdGlvbktleVByZXNzZWQgPSBmYWxzZTtcbiAgICB9XG4gIH1cblxuICAvKiogSW5pdGlhbGl6ZXMgdGhpcyB5ZWFyIHZpZXcuICovXG4gIF9pbml0KCkge1xuICAgIHRoaXMuX3NldFNlbGVjdGVkTW9udGgodGhpcy5zZWxlY3RlZCk7XG4gICAgdGhpcy5fdG9kYXlNb250aCA9IHRoaXMuX2dldE1vbnRoSW5DdXJyZW50WWVhcih0aGlzLl9kYXRlQWRhcHRlci50b2RheSgpKTtcbiAgICB0aGlzLl95ZWFyTGFiZWwgPSB0aGlzLl9kYXRlQWRhcHRlci5nZXRZZWFyTmFtZSh0aGlzLmFjdGl2ZURhdGUpO1xuXG4gICAgY29uc3QgbW9udGhOYW1lcyA9IHRoaXMuX2RhdGVBZGFwdGVyLmdldE1vbnRoTmFtZXMoJ3Nob3J0Jyk7XG4gICAgLy8gRmlyc3Qgcm93IG9mIG1vbnRocyBvbmx5IGNvbnRhaW5zIDUgZWxlbWVudHMgc28gd2UgY2FuIGZpdCB0aGUgeWVhciBsYWJlbCBvbiB0aGUgc2FtZSByb3cuXG4gICAgdGhpcy5fbW9udGhzID0gW1xuICAgICAgWzAsIDEsIDIsIDNdLFxuICAgICAgWzQsIDUsIDYsIDddLFxuICAgICAgWzgsIDksIDEwLCAxMV0sXG4gICAgXS5tYXAoKHJvdykgPT4gcm93Lm1hcCgobW9udGgpID0+IHRoaXMuX2NyZWF0ZUNlbGxGb3JNb250aChtb250aCwgbW9udGhOYW1lc1ttb250aF0pKSk7XG4gICAgdGhpcy5fY2hhbmdlRGV0ZWN0b3JSZWYubWFya0ZvckNoZWNrKCk7XG4gIH1cblxuICAvKiogRm9jdXNlcyB0aGUgYWN0aXZlIGNlbGwgYWZ0ZXIgdGhlIG1pY3JvdGFzayBxdWV1ZSBpcyBlbXB0eS4gKi9cbiAgX2ZvY3VzQWN0aXZlQ2VsbCgpIHtcbiAgICB0aGlzLl9jYWxlbmRhckJvZHkuX2ZvY3VzQWN0aXZlQ2VsbCgpO1xuICB9XG5cbiAgLyoqIFNjaGVkdWxlcyB0aGUgbWF0Q2FsZW5kYXJCb2R5IHRvIGZvY3VzIHRoZSBhY3RpdmUgY2VsbCBhZnRlciBjaGFuZ2UgZGV0ZWN0aW9uIGhhcyBydW4gKi9cbiAgX2ZvY3VzQWN0aXZlQ2VsbEFmdGVyVmlld0NoZWNrZWQoKSB7XG4gICAgdGhpcy5fY2FsZW5kYXJCb2R5Ll9zY2hlZHVsZUZvY3VzQWN0aXZlQ2VsbEFmdGVyVmlld0NoZWNrZWQoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBtb250aCBpbiB0aGlzIHllYXIgdGhhdCB0aGUgZ2l2ZW4gRGF0ZSBmYWxscyBvbi5cbiAgICogUmV0dXJucyBudWxsIGlmIHRoZSBnaXZlbiBEYXRlIGlzIGluIGFub3RoZXIgeWVhci5cbiAgICovXG4gIHByaXZhdGUgX2dldE1vbnRoSW5DdXJyZW50WWVhcihkYXRlOiBEIHwgbnVsbCkge1xuICAgIHJldHVybiBkYXRlICYmIHRoaXMuX2RhdGVBZGFwdGVyLmdldFllYXIoZGF0ZSkgPT0gdGhpcy5fZGF0ZUFkYXB0ZXIuZ2V0WWVhcih0aGlzLmFjdGl2ZURhdGUpXG4gICAgICA/IHRoaXMuX2RhdGVBZGFwdGVyLmdldE1vbnRoKGRhdGUpXG4gICAgICA6IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogVGFrZXMgYSBtb250aCBhbmQgcmV0dXJucyBhIG5ldyBkYXRlIGluIHRoZSBzYW1lIGRheSBhbmQgeWVhciBhcyB0aGUgY3VycmVudGx5IGFjdGl2ZSBkYXRlLlxuICAgKiAgVGhlIHJldHVybmVkIGRhdGUgd2lsbCBoYXZlIHRoZSBzYW1lIG1vbnRoIGFzIHRoZSBhcmd1bWVudCBkYXRlLlxuICAgKi9cbiAgcHJpdmF0ZSBfZ2V0RGF0ZUZyb21Nb250aChtb250aDogbnVtYmVyKSB7XG4gICAgY29uc3Qgbm9ybWFsaXplZERhdGUgPSB0aGlzLl9kYXRlQWRhcHRlci5jcmVhdGVEYXRlKFxuICAgICAgdGhpcy5fZGF0ZUFkYXB0ZXIuZ2V0WWVhcih0aGlzLmFjdGl2ZURhdGUpLFxuICAgICAgbW9udGgsXG4gICAgICAxXG4gICAgKTtcblxuICAgIGNvbnN0IGRheXNJbk1vbnRoID0gdGhpcy5fZGF0ZUFkYXB0ZXIuZ2V0TnVtRGF5c0luTW9udGgobm9ybWFsaXplZERhdGUpO1xuXG4gICAgcmV0dXJuIHRoaXMuX2RhdGVBZGFwdGVyLmNyZWF0ZURhdGUoXG4gICAgICB0aGlzLl9kYXRlQWRhcHRlci5nZXRZZWFyKHRoaXMuYWN0aXZlRGF0ZSksXG4gICAgICBtb250aCxcbiAgICAgIE1hdGgubWluKHRoaXMuX2RhdGVBZGFwdGVyLmdldERhdGUodGhpcy5hY3RpdmVEYXRlKSwgZGF5c0luTW9udGgpXG4gICAgKTtcbiAgfVxuXG4gIC8qKiBDcmVhdGVzIGFuIENhbGVuZGFyQ2VsbCBmb3IgdGhlIGdpdmVuIG1vbnRoLiAqL1xuICBwcml2YXRlIF9jcmVhdGVDZWxsRm9yTW9udGgobW9udGg6IG51bWJlciwgbW9udGhOYW1lOiBzdHJpbmcpIHtcbiAgICBjb25zdCBkYXRlID0gdGhpcy5fZGF0ZUFkYXB0ZXIuY3JlYXRlRGF0ZSh0aGlzLl9kYXRlQWRhcHRlci5nZXRZZWFyKHRoaXMuYWN0aXZlRGF0ZSksIG1vbnRoLCAxKTtcbiAgICBjb25zdCBhcmlhTGFiZWwgPSB0aGlzLl9kYXRlQWRhcHRlci5mb3JtYXQoZGF0ZSwgdGhpcy5fZGF0ZUZvcm1hdHMuZGlzcGxheS5tb250aFllYXJBMTF5TGFiZWwpO1xuICAgIGNvbnN0IGNlbGxDbGFzc2VzID0gdGhpcy5kYXRlQ2xhc3MgPyB0aGlzLmRhdGVDbGFzcyhkYXRlLCAneWVhcicpIDogdW5kZWZpbmVkO1xuXG4gICAgcmV0dXJuIG5ldyBDYWxlbmRhckNlbGwoXG4gICAgICBtb250aCxcbiAgICAgIG1vbnRoTmFtZS50b0xvY2FsZVVwcGVyQ2FzZSgpLFxuICAgICAgYXJpYUxhYmVsLFxuICAgICAgdGhpcy5fc2hvdWxkRW5hYmxlTW9udGgobW9udGgpLFxuICAgICAgY2VsbENsYXNzZXNcbiAgICApO1xuICB9XG5cbiAgLyoqIFdoZXRoZXIgdGhlIGdpdmVuIG1vbnRoIGlzIGVuYWJsZWQuICovXG4gIHByaXZhdGUgX3Nob3VsZEVuYWJsZU1vbnRoKG1vbnRoOiBudW1iZXIpIHtcbiAgICBjb25zdCBhY3RpdmVZZWFyID0gdGhpcy5fZGF0ZUFkYXB0ZXIuZ2V0WWVhcih0aGlzLmFjdGl2ZURhdGUpO1xuXG4gICAgaWYgKFxuICAgICAgbW9udGggPT09IHVuZGVmaW5lZCB8fFxuICAgICAgbW9udGggPT09IG51bGwgfHxcbiAgICAgIHRoaXMuX2lzWWVhckFuZE1vbnRoQWZ0ZXJNYXhEYXRlKGFjdGl2ZVllYXIsIG1vbnRoKSB8fFxuICAgICAgdGhpcy5faXNZZWFyQW5kTW9udGhCZWZvcmVNaW5EYXRlKGFjdGl2ZVllYXIsIG1vbnRoKVxuICAgICkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGlmICghdGhpcy5kYXRlRmlsdGVyKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBjb25zdCBmaXJzdE9mTW9udGggPSB0aGlzLl9kYXRlQWRhcHRlci5jcmVhdGVEYXRlKGFjdGl2ZVllYXIsIG1vbnRoLCAxKTtcblxuICAgIC8vIElmIGFueSBkYXRlIGluIHRoZSBtb250aCBpcyBlbmFibGVkIGNvdW50IHRoZSBtb250aCBhcyBlbmFibGVkLlxuICAgIGZvciAoXG4gICAgICBsZXQgZGF0ZSA9IGZpcnN0T2ZNb250aDtcbiAgICAgIHRoaXMuX2RhdGVBZGFwdGVyLmdldE1vbnRoKGRhdGUpID09IG1vbnRoO1xuICAgICAgZGF0ZSA9IHRoaXMuX2RhdGVBZGFwdGVyLmFkZENhbGVuZGFyRGF5cyhkYXRlLCAxKVxuICAgICkge1xuICAgICAgaWYgKHRoaXMuZGF0ZUZpbHRlcihkYXRlKSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogVGVzdHMgd2hldGhlciB0aGUgY29tYmluYXRpb24gbW9udGgveWVhciBpcyBhZnRlciB0aGlzLm1heERhdGUsIGNvbnNpZGVyaW5nXG4gICAqIGp1c3QgdGhlIG1vbnRoIGFuZCB5ZWFyIG9mIHRoaXMubWF4RGF0ZVxuICAgKi9cbiAgcHJpdmF0ZSBfaXNZZWFyQW5kTW9udGhBZnRlck1heERhdGUoeWVhcjogbnVtYmVyLCBtb250aDogbnVtYmVyKSB7XG4gICAgaWYgKHRoaXMubWF4RGF0ZSkge1xuICAgICAgY29uc3QgbWF4WWVhciA9IHRoaXMuX2RhdGVBZGFwdGVyLmdldFllYXIodGhpcy5tYXhEYXRlKTtcbiAgICAgIGNvbnN0IG1heE1vbnRoID0gdGhpcy5fZGF0ZUFkYXB0ZXIuZ2V0TW9udGgodGhpcy5tYXhEYXRlKTtcblxuICAgICAgcmV0dXJuIHllYXIgPiBtYXhZZWFyIHx8ICh5ZWFyID09PSBtYXhZZWFyICYmIG1vbnRoID4gbWF4TW9udGgpO1xuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUZXN0cyB3aGV0aGVyIHRoZSBjb21iaW5hdGlvbiBtb250aC95ZWFyIGlzIGJlZm9yZSB0aGlzLm1pbkRhdGUsIGNvbnNpZGVyaW5nXG4gICAqIGp1c3QgdGhlIG1vbnRoIGFuZCB5ZWFyIG9mIHRoaXMubWluRGF0ZVxuICAgKi9cbiAgcHJpdmF0ZSBfaXNZZWFyQW5kTW9udGhCZWZvcmVNaW5EYXRlKHllYXI6IG51bWJlciwgbW9udGg6IG51bWJlcikge1xuICAgIGlmICh0aGlzLm1pbkRhdGUpIHtcbiAgICAgIGNvbnN0IG1pblllYXIgPSB0aGlzLl9kYXRlQWRhcHRlci5nZXRZZWFyKHRoaXMubWluRGF0ZSk7XG4gICAgICBjb25zdCBtaW5Nb250aCA9IHRoaXMuX2RhdGVBZGFwdGVyLmdldE1vbnRoKHRoaXMubWluRGF0ZSk7XG5cbiAgICAgIHJldHVybiB5ZWFyIDwgbWluWWVhciB8fCAoeWVhciA9PT0gbWluWWVhciAmJiBtb250aCA8IG1pbk1vbnRoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvKiogRGV0ZXJtaW5lcyB3aGV0aGVyIHRoZSB1c2VyIGhhcyB0aGUgUlRMIGxheW91dCBkaXJlY3Rpb24uICovXG4gIHByaXZhdGUgX2lzUnRsKCkge1xuICAgIHJldHVybiB0aGlzLl9kaXIgJiYgdGhpcy5fZGlyLnZhbHVlID09PSAncnRsJztcbiAgfVxuXG4gIC8qKiBTZXRzIHRoZSBjdXJyZW50bHktc2VsZWN0ZWQgbW9udGggYmFzZWQgb24gYSBtb2RlbCB2YWx1ZS4gKi9cbiAgcHJpdmF0ZSBfc2V0U2VsZWN0ZWRNb250aCh2YWx1ZTogRGF0ZVJhbmdlPEQ+IHwgRCB8IG51bGwpIHtcbiAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBEYXRlUmFuZ2UpIHtcbiAgICAgIHRoaXMuX3NlbGVjdGVkTW9udGggPVxuICAgICAgICB0aGlzLl9nZXRNb250aEluQ3VycmVudFllYXIodmFsdWUuc3RhcnQpIHx8IHRoaXMuX2dldE1vbnRoSW5DdXJyZW50WWVhcih2YWx1ZS5lbmQpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9zZWxlY3RlZE1vbnRoID0gdGhpcy5fZ2V0TW9udGhJbkN1cnJlbnRZZWFyKHZhbHVlKTtcbiAgICB9XG4gIH1cbn1cbiIsIjwhLS0gZXNsaW50LWRpc2FibGUgQGFuZ3VsYXItZXNsaW50L3RlbXBsYXRlL2ludGVyYWN0aXZlLXN1cHBvcnRzLWZvY3VzIC0tPlxuPHRhYmxlXG4gIGNsYXNzPVwiY2FsZW5kYXItdGFibGVcIlxuICByb2xlPVwiZ3JpZFwiXG4+XG4gIDx0aGVhZFxuICAgIGFyaWEtaGlkZGVuPVwidHJ1ZVwiXG4gICAgY2xhc3M9XCJjYWxlbmRhci10YWJsZS1oZWFkZXJcIlxuICA+XG4gICAgPHRyPlxuICAgICAgPHRoXG4gICAgICAgIGNsYXNzPVwiY2FsZW5kYXItdGFibGUtaGVhZGVyLWRpdmlkZXJcIlxuICAgICAgICBjb2xzcGFuPVwiNFwiXG4gICAgICA+PC90aD5cbiAgICA8L3RyPlxuICA8L3RoZWFkPlxuICA8dGJvZHlcbiAgICBjYWxlbmRhci1ib2R5XG4gICAgW2xhYmVsXT1cIl95ZWFyTGFiZWxcIlxuICAgIFtyb3dzXT1cIl9tb250aHNcIlxuICAgIFt0b2RheVZhbHVlXT1cIl90b2RheU1vbnRoIVwiXG4gICAgW3N0YXJ0VmFsdWVdPVwiX3NlbGVjdGVkTW9udGghXCJcbiAgICBbZW5kVmFsdWVdPVwiX3NlbGVjdGVkTW9udGghXCJcbiAgICBbbGFiZWxNaW5SZXF1aXJlZENlbGxzXT1cIjJcIlxuICAgIFtudW1Db2xzXT1cIjRcIlxuICAgIFtjZWxsQXNwZWN0UmF0aW9dPVwiNCAvIDdcIlxuICAgIFthY3RpdmVDZWxsXT1cIl9kYXRlQWRhcHRlci5nZXRNb250aChhY3RpdmVEYXRlKVwiXG4gICAgKHNlbGVjdGVkVmFsdWVDaGFuZ2UpPVwiX21vbnRoU2VsZWN0ZWQoJGV2ZW50KVwiXG4gICAgKGFjdGl2ZURhdGVDaGFuZ2UpPVwiX3VwZGF0ZUFjdGl2ZURhdGUoJGV2ZW50KVwiXG4gICAgKGtleXVwKT1cIl9oYW5kbGVDYWxlbmRhckJvZHlLZXl1cCgkZXZlbnQpXCJcbiAgICAoa2V5ZG93bik9XCJfaGFuZGxlQ2FsZW5kYXJCb2R5S2V5ZG93bigkZXZlbnQpXCJcbiAgPjwvdGJvZHk+XG48L3RhYmxlPlxuIl19