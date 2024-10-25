/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { DOWN_ARROW, END, ENTER, HOME, LEFT_ARROW, PAGE_DOWN, PAGE_UP, RIGHT_ARROW, UP_ARROW, SPACE, ESCAPE, hasModifierKey, } from '@angular/cdk/keycodes';
import { ChangeDetectionStrategy, Component, EventEmitter, Inject, Input, Optional, Output, ViewEncapsulation, ViewChild, } from '@angular/core';
import { Subscription } from 'rxjs';
import { startWith } from 'rxjs/operators';
import { CalendarBody, CalendarCell, } from './calendar-body';
import { DATE_FORMATS } from '../adapter';
import { DateRange } from '../date-picker/date-selection-model';
import { createMissingDateImplError } from '../utils/errors';
import * as i0 from "@angular/core";
import * as i1 from "../adapter";
import * as i2 from "@angular/cdk/bidi";
const DAYS_PER_WEEK = 7;
/**
 * An internal component used to display a single month in the datepicker.
 * @docs-private
 */
export class MonthView {
    _changeDetectorRef;
    _dateFormats;
    _dateAdapter;
    _dir;
    _rerenderSubscription = Subscription.EMPTY;
    /** Flag used to filter out space/enter keyup events that originated outside of the view. */
    _selectionKeyPressed;
    /**
     * The date to display in this month view (everything other than the month and year is ignored).
     */
    get activeDate() {
        return this._activeDate;
    }
    set activeDate(value) {
        const oldActiveDate = this._activeDate;
        const validDate = this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(value)) ||
            this._dateAdapter.today();
        this._activeDate = this._dateAdapter.clampDate(validDate, this.minDate, this.maxDate);
        if (!this._hasSameMonthAndYear(oldActiveDate, this._activeDate)) {
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
        this._setRanges(this._selected);
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
    /** Function used to filter which dates are selectable. */
    dateFilter;
    /** Function that can be used to add custom CSS classes to dates. */
    dateClass;
    /** Start of the comparison range. */
    comparisonStart;
    /** End of the comparison range. */
    comparisonEnd;
    /** ARIA Accessible name of the `<input startDate/>` */
    startDateAccessibleName;
    /** ARIA Accessible name of the `<input endDate/>` */
    endDateAccessibleName;
    /** Origin of active drag, or null when dragging is not active. */
    activeDrag = null;
    /** Emits when a new date is selected. */
    selectedChange = new EventEmitter();
    /** Emits when any date is selected. */
    _userSelection = new EventEmitter();
    /** Emits when the user initiates a date range drag via mouse or touch. */
    dragStarted = new EventEmitter();
    /**
     * Emits when the user completes or cancels a date range drag.
     * Emits null when the drag was canceled or the newly selected date range if completed.
     */
    dragEnded = new EventEmitter();
    /** Emits when any date is activated. */
    activeDateChange = new EventEmitter();
    /** The body of calendar table */
    _calendarBody;
    /** The label for this month (e.g. "January 2017"). */
    _monthLabel;
    /** Grid of calendar cells representing the dates of the month. */
    _weeks;
    /** The number of blank cells in the first row before the 1st of the month. */
    _firstWeekOffset;
    /** Start value of the currently-shown date range. */
    _rangeStart;
    /** End value of the currently-shown date range. */
    _rangeEnd;
    /** Start value of the currently-shown comparison date range. */
    _comparisonRangeStart;
    /** End value of the currently-shown comparison date range. */
    _comparisonRangeEnd;
    /** Start of the preview range. */
    _previewStart;
    /** End of the preview range. */
    _previewEnd;
    /** Whether the user is currently selecting a range of dates. */
    _isRange;
    /** The date of the month that today falls on. Null if today is in another month. */
    _todayDate;
    /** The names of the weekdays. */
    _weekdays;
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
    ngOnChanges(changes) {
        const comparisonChange = changes['comparisonStart'] || changes['comparisonEnd'];
        if (comparisonChange && !comparisonChange.firstChange) {
            this._setRanges(this.selected);
        }
        if (changes['activeDrag'] && !this.activeDrag) {
            this._clearPreview();
        }
    }
    ngOnDestroy() {
        this._rerenderSubscription.unsubscribe();
    }
    /** Handles when a new date is selected. */
    _dateSelected(event) {
        const date = event.value;
        const selectedDate = this._getDateFromDayOfMonth(date);
        let rangeStartDate;
        let rangeEndDate;
        if (this._selected instanceof DateRange) {
            rangeStartDate = this._getDateInCurrentMonth(this._selected.start);
            rangeEndDate = this._getDateInCurrentMonth(this._selected.end);
        }
        else {
            rangeStartDate = rangeEndDate = this._getDateInCurrentMonth(this._selected);
        }
        if (rangeStartDate !== date || rangeEndDate !== date) {
            this.selectedChange.emit(selectedDate);
        }
        this._userSelection.emit({ value: selectedDate, event: event.event });
        this._clearPreview();
        this._changeDetectorRef.markForCheck();
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
        this.activeDate = this._getDateFromDayOfMonth(month);
        if (this._dateAdapter.compareDate(oldActiveDate, this.activeDate)) {
            this.activeDateChange.emit(this._activeDate);
        }
    }
    /** Handles keydown events on the calendar body when calendar is in month view. */
    _handleCalendarBodyKeydown(event) {
        const oldActiveDate = this._activeDate;
        const isRtl = this._isRtl();
        switch (event.keyCode) {
            case LEFT_ARROW:
                this.activeDate = this._dateAdapter.addCalendarDays(this._activeDate, isRtl ? 1 : -1);
                break;
            case RIGHT_ARROW:
                this.activeDate = this._dateAdapter.addCalendarDays(this._activeDate, isRtl ? -1 : 1);
                break;
            case UP_ARROW:
                this.activeDate = this._dateAdapter.addCalendarDays(this._activeDate, -7);
                break;
            case DOWN_ARROW:
                this.activeDate = this._dateAdapter.addCalendarDays(this._activeDate, 7);
                break;
            case HOME:
                this.activeDate = this._dateAdapter.addCalendarDays(this._activeDate, 1 - this._dateAdapter.getDate(this._activeDate));
                break;
            case END:
                this.activeDate = this._dateAdapter.addCalendarDays(this._activeDate, this._dateAdapter.getNumDaysInMonth(this._activeDate) -
                    this._dateAdapter.getDate(this._activeDate));
                break;
            case PAGE_UP:
                this.activeDate = event.altKey
                    ? this._dateAdapter.addCalendarYears(this._activeDate, -1)
                    : this._dateAdapter.addCalendarMonths(this._activeDate, -1);
                break;
            case PAGE_DOWN:
                this.activeDate = event.altKey
                    ? this._dateAdapter.addCalendarYears(this._activeDate, 1)
                    : this._dateAdapter.addCalendarMonths(this._activeDate, 1);
                break;
            case ENTER:
            case SPACE:
                this._selectionKeyPressed = true;
                if (this._canSelect(this._activeDate)) {
                    // Prevent unexpected default actions such as form submission.
                    // Note that we only prevent the default action here while the selection happens in
                    // `keyup` below. We can't do the selection here, because it can cause the calendar to
                    // reopen if focus is restored immediately. We also can't call `preventDefault` on `keyup`
                    // because it's too late (see #23305).
                    event.preventDefault();
                }
                return;
            case ESCAPE:
                // Abort the current range selection if the user presses escape mid-selection.
                if (this._previewEnd != null && !hasModifierKey(event)) {
                    this._clearPreview();
                    // If a drag is in progress, cancel the drag without changing the
                    // current selection.
                    if (this.activeDrag) {
                        this.dragEnded.emit({ value: null, event });
                    }
                    else {
                        this.selectedChange.emit(null);
                        this._userSelection.emit({ value: null, event });
                    }
                    event.preventDefault();
                    event.stopPropagation(); // Prevents the overlay from closing.
                }
                return;
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
    /** Handles keyup events on the calendar body when calendar is in month view. */
    _handleCalendarBodyKeyup(event) {
        if (event.keyCode === SPACE || event.keyCode === ENTER) {
            if (this._selectionKeyPressed && this._canSelect(this._activeDate)) {
                this._dateSelected({ value: this._dateAdapter.getDate(this._activeDate), event });
            }
            this._selectionKeyPressed = false;
        }
    }
    /** Initializes this month view. */
    _init() {
        this._setRanges(this.selected);
        this._todayDate = this._getCellCompareValue(this._dateAdapter.today());
        this._monthLabel = this._dateFormats.display.monthLabel
            ? this._dateAdapter.format(this.activeDate, this._dateFormats.display.monthLabel)
            : this._dateAdapter
                .getMonthNames('short')[this._dateAdapter.getMonth(this.activeDate)].toLocaleUpperCase();
        const firstOfMonth = this._dateAdapter.createDate(this._dateAdapter.getYear(this.activeDate), this._dateAdapter.getMonth(this.activeDate), 1);
        this._firstWeekOffset =
            (DAYS_PER_WEEK +
                this._dateAdapter.getDayOfWeek(firstOfMonth) -
                this._dateAdapter.getFirstDayOfWeek()) %
                DAYS_PER_WEEK;
        this._initWeekdays();
        this._createWeekCells();
        this._changeDetectorRef.markForCheck();
    }
    /** Focuses the active cell after the microtask queue is empty. */
    _focusActiveCell(movePreview) {
        this._calendarBody._focusActiveCell(movePreview);
    }
    /** Focuses the active cell after change detection has run and the microtask queue is empty. */
    _focusActiveCellAfterViewChecked() {
        this._calendarBody._scheduleFocusActiveCellAfterViewChecked();
    }
    /** Called when the user has activated a new cell and the preview needs to be updated. */
    _previewChanged({ event, value: cell }) { }
    /**
     * Called when the user has ended a drag. If the drag/drop was successful,
     * computes and emits the new range selection.
     */
    _dragEnded(event) {
        if (!this.activeDrag)
            return;
        this.dragEnded.emit({ value: null, event: event.event });
    }
    /**
     * Takes a day of the month and returns a new date in the same month and year as the currently
     *  active date. The returned date will have the same day of the month as the argument date.
     */
    _getDateFromDayOfMonth(dayOfMonth) {
        return this._dateAdapter.createDate(this._dateAdapter.getYear(this.activeDate), this._dateAdapter.getMonth(this.activeDate), dayOfMonth);
    }
    /** Initializes the weekdays. */
    _initWeekdays() {
        const firstDayOfWeek = this._dateAdapter.getFirstDayOfWeek();
        const narrowWeekdays = this._dateAdapter.getDayOfWeekNames('narrow');
        const longWeekdays = this._dateAdapter.getDayOfWeekNames('long');
        // Rotate the labels for days of the week based on the configured first day of the week.
        const weekdays = longWeekdays.map((long, i) => {
            return { long, narrow: narrowWeekdays[i] };
        });
        this._weekdays = weekdays.slice(firstDayOfWeek).concat(weekdays.slice(0, firstDayOfWeek));
    }
    /** Creates CalendarCells for the dates in this month. */
    _createWeekCells() {
        const daysInMonth = this._dateAdapter.getNumDaysInMonth(this.activeDate);
        const dateNames = this._dateAdapter.getDateNames();
        this._weeks = [[]];
        for (let i = 0, cell = this._firstWeekOffset; i < daysInMonth; i++, cell++) {
            if (cell == DAYS_PER_WEEK) {
                this._weeks.push([]);
                cell = 0;
            }
            const date = this._dateAdapter.createDate(this._dateAdapter.getYear(this.activeDate), this._dateAdapter.getMonth(this.activeDate), i + 1);
            const enabled = this._shouldEnableDate(date);
            const ariaLabel = this._dateAdapter.format(date, this._dateFormats.display.dateA11yLabel);
            const cellClasses = this.dateClass ? this.dateClass(date, 'month') : undefined;
            this._weeks[this._weeks.length - 1].push(new CalendarCell(i + 1, dateNames[i], ariaLabel, enabled, cellClasses, this._getCellCompareValue(date), date));
        }
    }
    /** Date filter for the month */
    _shouldEnableDate(date) {
        return (!!date &&
            (!this.minDate || this._dateAdapter.compareDate(date, this.minDate) >= 0) &&
            (!this.maxDate || this._dateAdapter.compareDate(date, this.maxDate) <= 0) &&
            (!this.dateFilter || this.dateFilter(date)));
    }
    /**
     * Gets the date in this month that the given Date falls on.
     * Returns null if the given Date is in another month.
     */
    _getDateInCurrentMonth(date) {
        return date && this._hasSameMonthAndYear(date, this.activeDate)
            ? this._dateAdapter.getDate(date)
            : null;
    }
    /** Checks whether the 2 dates are non-null and fall within the same month of the same year. */
    _hasSameMonthAndYear(d1, d2) {
        return !!(d1 &&
            d2 &&
            this._dateAdapter.getMonth(d1) == this._dateAdapter.getMonth(d2) &&
            this._dateAdapter.getYear(d1) == this._dateAdapter.getYear(d2));
    }
    /** Gets the value that will be used to one cell to another. */
    _getCellCompareValue(date) {
        if (date) {
            // We use the time since the Unix epoch to compare dates in this view, rather than the
            // cell values, because we need to support ranges that span across multiple months/years.
            const year = this._dateAdapter.getYear(date);
            const month = this._dateAdapter.getMonth(date);
            const day = this._dateAdapter.getDate(date);
            return new Date(year, month, day).getTime();
        }
        return null;
    }
    /** Determines whether the user has the RTL layout direction. */
    _isRtl() {
        return this._dir && this._dir.value === 'rtl';
    }
    /** Sets the current range based on a model value. */
    _setRanges(selectedValue) {
        if (selectedValue instanceof DateRange) {
            this._rangeStart = this._getCellCompareValue(selectedValue.start);
            this._rangeEnd = this._getCellCompareValue(selectedValue.end);
            this._isRange = true;
        }
        else {
            this._rangeStart = this._rangeEnd = this._getCellCompareValue(selectedValue);
            this._isRange = false;
        }
        this._comparisonRangeStart = this._getCellCompareValue(this.comparisonStart);
        this._comparisonRangeEnd = this._getCellCompareValue(this.comparisonEnd);
    }
    /** Gets whether a date can be selected in the month view. */
    _canSelect(date) {
        return !this.dateFilter || this.dateFilter(date);
    }
    /** Clears out preview state. */
    _clearPreview() {
        this._previewStart = this._previewEnd = null;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: MonthView, deps: [{ token: i0.ChangeDetectorRef }, { token: DATE_FORMATS, optional: true }, { token: i1.DateAdapter, optional: true }, { token: i2.Directionality, optional: true }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "18.2.8", type: MonthView, isStandalone: true, selector: "month-view", inputs: { activeDate: "activeDate", selected: "selected", minDate: "minDate", maxDate: "maxDate", dateFilter: "dateFilter", dateClass: "dateClass", comparisonStart: "comparisonStart", comparisonEnd: "comparisonEnd", startDateAccessibleName: "startDateAccessibleName", endDateAccessibleName: "endDateAccessibleName", activeDrag: "activeDrag" }, outputs: { selectedChange: "selectedChange", _userSelection: "_userSelection", dragStarted: "dragStarted", dragEnded: "dragEnded", activeDateChange: "activeDateChange" }, viewQueries: [{ propertyName: "_calendarBody", first: true, predicate: CalendarBody, descendants: true }], exportAs: ["monthView"], usesOnChanges: true, ngImport: i0, template: "<!-- eslint-disable @angular-eslint/template/interactive-supports-focus -->\n<table\n  class=\"calendar-table\"\n  role=\"grid\"\n>\n  <thead class=\"calendar-table-header\">\n    <tr>\n      @for (day of _weekdays; track day) {\n        <th scope=\"col\">\n          <span class=\"cdk-visually-hidden hidden\">{{ day.long }}</span>\n          <span aria-hidden=\"true\">{{ day.narrow }}</span>\n        </th>\n      }\n    </tr>\n    <tr aria-hidden=\"true\">\n      <th\n        class=\"calendar-table-header-divider\"\n        colspan=\"7\"\n      ></th>\n    </tr>\n  </thead>\n  <tbody\n    calendar-body\n    [label]=\"_monthLabel\"\n    [rows]=\"_weeks\"\n    [todayValue]=\"_todayDate!\"\n    [startValue]=\"_rangeStart!\"\n    [endValue]=\"_rangeEnd!\"\n    [comparisonStart]=\"_comparisonRangeStart\"\n    [comparisonEnd]=\"_comparisonRangeEnd\"\n    [previewStart]=\"_previewStart\"\n    [previewEnd]=\"_previewEnd\"\n    [isRange]=\"_isRange\"\n    [labelMinRequiredCells]=\"3\"\n    [activeCell]=\"_dateAdapter.getDate(activeDate) - 1\"\n    [startDateAccessibleName]=\"startDateAccessibleName\"\n    [endDateAccessibleName]=\"endDateAccessibleName\"\n    (selectedValueChange)=\"_dateSelected($event)\"\n    (activeDateChange)=\"_updateActiveDate($event)\"\n    (previewChange)=\"_previewChanged($event)\"\n    (dragStarted)=\"dragStarted.emit($event)\"\n    (dragEnded)=\"_dragEnded($event)\"\n    (keyup)=\"_handleCalendarBodyKeyup($event)\"\n    (keydown)=\"_handleCalendarBodyKeydown($event)\"\n  ></tbody>\n</table>\n", dependencies: [{ kind: "component", type: CalendarBody, selector: "[calendar-body]", inputs: ["label", "rows", "todayValue", "startValue", "endValue", "labelMinRequiredCells", "numCols", "activeCell", "isRange", "cellAspectRatio", "comparisonStart", "comparisonEnd", "previewStart", "previewEnd", "startDateAccessibleName", "endDateAccessibleName"], outputs: ["selectedValueChange", "previewChange", "activeDateChange", "dragStarted", "dragEnded"], exportAs: ["calendarBody"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: MonthView, decorators: [{
            type: Component,
            args: [{ selector: 'month-view', exportAs: 'monthView', encapsulation: ViewEncapsulation.None, changeDetection: ChangeDetectionStrategy.OnPush, standalone: true, imports: [CalendarBody], template: "<!-- eslint-disable @angular-eslint/template/interactive-supports-focus -->\n<table\n  class=\"calendar-table\"\n  role=\"grid\"\n>\n  <thead class=\"calendar-table-header\">\n    <tr>\n      @for (day of _weekdays; track day) {\n        <th scope=\"col\">\n          <span class=\"cdk-visually-hidden hidden\">{{ day.long }}</span>\n          <span aria-hidden=\"true\">{{ day.narrow }}</span>\n        </th>\n      }\n    </tr>\n    <tr aria-hidden=\"true\">\n      <th\n        class=\"calendar-table-header-divider\"\n        colspan=\"7\"\n      ></th>\n    </tr>\n  </thead>\n  <tbody\n    calendar-body\n    [label]=\"_monthLabel\"\n    [rows]=\"_weeks\"\n    [todayValue]=\"_todayDate!\"\n    [startValue]=\"_rangeStart!\"\n    [endValue]=\"_rangeEnd!\"\n    [comparisonStart]=\"_comparisonRangeStart\"\n    [comparisonEnd]=\"_comparisonRangeEnd\"\n    [previewStart]=\"_previewStart\"\n    [previewEnd]=\"_previewEnd\"\n    [isRange]=\"_isRange\"\n    [labelMinRequiredCells]=\"3\"\n    [activeCell]=\"_dateAdapter.getDate(activeDate) - 1\"\n    [startDateAccessibleName]=\"startDateAccessibleName\"\n    [endDateAccessibleName]=\"endDateAccessibleName\"\n    (selectedValueChange)=\"_dateSelected($event)\"\n    (activeDateChange)=\"_updateActiveDate($event)\"\n    (previewChange)=\"_previewChanged($event)\"\n    (dragStarted)=\"dragStarted.emit($event)\"\n    (dragEnded)=\"_dragEnded($event)\"\n    (keyup)=\"_handleCalendarBodyKeyup($event)\"\n    (keydown)=\"_handleCalendarBodyKeydown($event)\"\n  ></tbody>\n</table>\n" }]
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
            }], comparisonStart: [{
                type: Input
            }], comparisonEnd: [{
                type: Input
            }], startDateAccessibleName: [{
                type: Input
            }], endDateAccessibleName: [{
                type: Input
            }], activeDrag: [{
                type: Input
            }], selectedChange: [{
                type: Output
            }], _userSelection: [{
                type: Output
            }], dragStarted: [{
                type: Output
            }], dragEnded: [{
                type: Output
            }], activeDateChange: [{
                type: Output
            }], _calendarBody: [{
                type: ViewChild,
                args: [CalendarBody]
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9udGgtdmlldy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9saWIvY2FsZW5kYXIvbW9udGgtdmlldy50cyIsIi4uLy4uLy4uLy4uL3NyYy9saWIvY2FsZW5kYXIvbW9udGgtdmlldy5odG1sIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFDTCxVQUFVLEVBQ1YsR0FBRyxFQUNILEtBQUssRUFDTCxJQUFJLEVBQ0osVUFBVSxFQUNWLFNBQVMsRUFDVCxPQUFPLEVBQ1AsV0FBVyxFQUNYLFFBQVEsRUFDUixLQUFLLEVBQ0wsTUFBTSxFQUNOLGNBQWMsR0FDZixNQUFNLHVCQUF1QixDQUFDO0FBRS9CLE9BQU8sRUFFTCx1QkFBdUIsRUFFdkIsU0FBUyxFQUNULFlBQVksRUFDWixNQUFNLEVBQ04sS0FBSyxFQUNMLFFBQVEsRUFDUixNQUFNLEVBQ04saUJBQWlCLEVBQ2pCLFNBQVMsR0FJVixNQUFNLGVBQWUsQ0FBQztBQUd2QixPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQ3BDLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUUzQyxPQUFPLEVBQ0wsWUFBWSxFQUNaLFlBQVksR0FHYixNQUFNLGlCQUFpQixDQUFDO0FBRXpCLE9BQU8sRUFBZSxZQUFZLEVBQWUsTUFBTSxZQUFZLENBQUM7QUFDcEUsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLHFDQUFxQyxDQUFDO0FBQ2hFLE9BQU8sRUFBRSwwQkFBMEIsRUFBRSxNQUFNLGlCQUFpQixDQUFDOzs7O0FBRTdELE1BQU0sYUFBYSxHQUFHLENBQUMsQ0FBQztBQUV4Qjs7O0dBR0c7QUFVSCxNQUFNLE9BQU8sU0FBUztJQThJVDtJQUNpQztJQUN2QjtJQUNDO0lBaEpkLHFCQUFxQixHQUFHLFlBQVksQ0FBQyxLQUFLLENBQUM7SUFFbkQsNEZBQTRGO0lBQ3BGLG9CQUFvQixDQUFVO0lB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KlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1xuICBET1dOX0FSUk9XLFxuICBFTkQsXG4gIEVOVEVSLFxuICBIT01FLFxuICBMRUZUX0FSUk9XLFxuICBQQUdFX0RPV04sXG4gIFBBR0VfVVAsXG4gIFJJR0hUX0FSUk9XLFxuICBVUF9BUlJPVyxcbiAgU1BBQ0UsXG4gIEVTQ0FQRSxcbiAgaGFzTW9kaWZpZXJLZXksXG59IGZyb20gJ0Bhbmd1bGFyL2Nkay9rZXljb2Rlcyc7XG5cbmltcG9ydCB7XG4gIEFmdGVyQ29udGVudEluaXQsXG4gIENoYW5nZURldGVjdGlvblN0cmF0ZWd5LFxuICBDaGFuZ2VEZXRlY3RvclJlZixcbiAgQ29tcG9uZW50LFxuICBFdmVudEVtaXR0ZXIsXG4gIEluamVjdCxcbiAgSW5wdXQsXG4gIE9wdGlvbmFsLFxuICBPdXRwdXQsXG4gIFZpZXdFbmNhcHN1bGF0aW9uLFxuICBWaWV3Q2hpbGQsXG4gIE9uRGVzdHJveSxcbiAgU2ltcGxlQ2hhbmdlcyxcbiAgT25DaGFuZ2VzLFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IERpcmVjdGlvbmFsaXR5IH0gZnJvbSAnQGFuZ3VsYXIvY2RrL2JpZGknO1xuXG5pbXBvcnQgeyBTdWJzY3JpcHRpb24gfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IHN0YXJ0V2l0aCB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcblxuaW1wb3J0IHtcbiAgQ2FsZW5kYXJCb2R5LFxuICBDYWxlbmRhckNlbGwsXG4gIENhbGVuZGFyVXNlckV2ZW50LFxuICBDYWxlbmRhckNlbGxDbGFzc0Z1bmN0aW9uLFxufSBmcm9tICcuL2NhbGVuZGFyLWJvZHknO1xuXG5pbXBvcnQgeyBEYXRlQWRhcHRlciwgREFURV9GT1JNQVRTLCBEYXRlRm9ybWF0cyB9IGZyb20gJy4uL2FkYXB0ZXInO1xuaW1wb3J0IHsgRGF0ZVJhbmdlIH0gZnJvbSAnLi4vZGF0ZS1waWNrZXIvZGF0ZS1zZWxlY3Rpb24tbW9kZWwnO1xuaW1wb3J0IHsgY3JlYXRlTWlzc2luZ0RhdGVJbXBsRXJyb3IgfSBmcm9tICcuLi91dGlscy9lcnJvcnMnO1xuXG5jb25zdCBEQVlTX1BFUl9XRUVLID0gNztcblxuLyoqXG4gKiBBbiBpbnRlcm5hbCBjb21wb25lbnQgdXNlZCB0byBkaXNwbGF5IGEgc2luZ2xlIG1vbnRoIGluIHRoZSBkYXRlcGlja2VyLlxuICogQGRvY3MtcHJpdmF0ZVxuICovXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdtb250aC12aWV3JyxcbiAgdGVtcGxhdGVVcmw6ICdtb250aC12aWV3Lmh0bWwnLFxuICBleHBvcnRBczogJ21vbnRoVmlldycsXG4gIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLk5vbmUsXG4gIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuT25QdXNoLFxuICBzdGFuZGFsb25lOiB0cnVlLFxuICBpbXBvcnRzOiBbQ2FsZW5kYXJCb2R5XSxcbn0pXG5leHBvcnQgY2xhc3MgTW9udGhWaWV3PEQ+IGltcGxlbWVudHMgQWZ0ZXJDb250ZW50SW5pdCwgT25DaGFuZ2VzLCBPbkRlc3Ryb3kge1xuICBwcml2YXRlIF9yZXJlbmRlclN1YnNjcmlwdGlvbiA9IFN1YnNjcmlwdGlvbi5FTVBUWTtcblxuICAvKiogRmxhZyB1c2VkIHRvIGZpbHRlciBvdXQgc3BhY2UvZW50ZXIga2V5dXAgZXZlbnRzIHRoYXQgb3JpZ2luYXRlZCBvdXRzaWRlIG9mIHRoZSB2aWV3LiAqL1xuICBwcml2YXRlIF9zZWxlY3Rpb25LZXlQcmVzc2VkOiBib29sZWFuO1xuXG4gIC8qKlxuICAgKiBUaGUgZGF0ZSB0byBkaXNwbGF5IGluIHRoaXMgbW9udGggdmlldyAoZXZlcnl0aGluZyBvdGhlciB0aGFuIHRoZSBtb250aCBhbmQgeWVhciBpcyBpZ25vcmVkKS5cbiAgICovXG4gIEBJbnB1dCgpXG4gIGdldCBhY3RpdmVEYXRlKCk6IEQge1xuICAgIHJldHVybiB0aGlzLl9hY3RpdmVEYXRlO1xuICB9XG4gIHNldCBhY3RpdmVEYXRlKHZhbHVlOiBEKSB7XG4gICAgY29uc3Qgb2xkQWN0aXZlRGF0ZSA9IHRoaXMuX2FjdGl2ZURhdGU7XG4gICAgY29uc3QgdmFsaWREYXRlID1cbiAgICAgIHRoaXMuX2RhdGVBZGFwdGVyLmdldFZhbGlkRGF0ZU9yTnVsbCh0aGlzLl9kYXRlQWRhcHRlci5kZXNlcmlhbGl6ZSh2YWx1ZSkpIHx8XG4gICAgICB0aGlzLl9kYXRlQWRhcHRlci50b2RheSgpO1xuICAgIHRoaXMuX2FjdGl2ZURhdGUgPSB0aGlzLl9kYXRlQWRhcHRlci5jbGFtcERhdGUodmFsaWREYXRlLCB0aGlzLm1pbkRhdGUsIHRoaXMubWF4RGF0ZSk7XG4gICAgaWYgKCF0aGlzLl9oYXNTYW1lTW9udGhBbmRZZWFyKG9sZEFjdGl2ZURhdGUsIHRoaXMuX2FjdGl2ZURhdGUpKSB7XG4gICAgICB0aGlzLl9pbml0KCk7XG4gICAgfVxuICB9XG4gIHByaXZhdGUgX2FjdGl2ZURhdGU6IEQ7XG5cbiAgLyoqIFRoZSBjdXJyZW50bHkgc2VsZWN0ZWQgZGF0ZS4gKi9cbiAgQElucHV0KClcbiAgZ2V0IHNlbGVjdGVkKCk6IERhdGVSYW5nZTxEPiB8IEQgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5fc2VsZWN0ZWQ7XG4gIH1cbiAgc2V0IHNlbGVjdGVkKHZhbHVlOiBEYXRlUmFuZ2U8RD4gfCBEIHwgbnVsbCkge1xuICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIERhdGVSYW5nZSkge1xuICAgICAgdGhpcy5fc2VsZWN0ZWQgPSB2YWx1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fc2VsZWN0ZWQgPSB0aGlzLl9kYXRlQWRhcHRlci5nZXRWYWxpZERhdGVPck51bGwodGhpcy5fZGF0ZUFkYXB0ZXIuZGVzZXJpYWxpemUodmFsdWUpKTtcbiAgICB9XG5cbiAgICB0aGlzLl9zZXRSYW5nZXModGhpcy5fc2VsZWN0ZWQpO1xuICB9XG4gIHByaXZhdGUgX3NlbGVjdGVkOiBEYXRlUmFuZ2U8RD4gfCBEIHwgbnVsbDtcblxuICAvKiogVGhlIG1pbmltdW0gc2VsZWN0YWJsZSBkYXRlLiAqL1xuICBASW5wdXQoKVxuICBnZXQgbWluRGF0ZSgpOiBEIHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuX21pbkRhdGU7XG4gIH1cbiAgc2V0IG1pbkRhdGUodmFsdWU6IEQgfCBudWxsKSB7XG4gICAgdGhpcy5fbWluRGF0ZSA9IHRoaXMuX2RhdGVBZGFwdGVyLmdldFZhbGlkRGF0ZU9yTnVsbCh0aGlzLl9kYXRlQWRhcHRlci5kZXNlcmlhbGl6ZSh2YWx1ZSkpO1xuICB9XG4gIHByaXZhdGUgX21pbkRhdGU6IEQgfCBudWxsO1xuXG4gIC8qKiBUaGUgbWF4aW11bSBzZWxlY3RhYmxlIGRhdGUuICovXG4gIEBJbnB1dCgpXG4gIGdldCBtYXhEYXRlKCk6IEQgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5fbWF4RGF0ZTtcbiAgfVxuICBzZXQgbWF4RGF0ZSh2YWx1ZTogRCB8IG51bGwpIHtcbiAgICB0aGlzLl9tYXhEYXRlID0gdGhpcy5fZGF0ZUFkYXB0ZXIuZ2V0VmFsaWREYXRlT3JOdWxsKHRoaXMuX2RhdGVBZGFwdGVyLmRlc2VyaWFsaXplKHZhbHVlKSk7XG4gIH1cbiAgcHJpdmF0ZSBfbWF4RGF0ZTogRCB8IG51bGw7XG5cbiAgLyoqIEZ1bmN0aW9uIHVzZWQgdG8gZmlsdGVyIHdoaWNoIGRhdGVzIGFyZSBzZWxlY3RhYmxlLiAqL1xuICBASW5wdXQoKSBkYXRlRmlsdGVyOiAoZGF0ZTogRCkgPT4gYm9vbGVhbjtcblxuICAvKiogRnVuY3Rpb24gdGhhdCBjYW4gYmUgdXNlZCB0byBhZGQgY3VzdG9tIENTUyBjbGFzc2VzIHRvIGRhdGVzLiAqL1xuICBASW5wdXQoKSBkYXRlQ2xhc3M6IENhbGVuZGFyQ2VsbENsYXNzRnVuY3Rpb248RD47XG5cbiAgLyoqIFN0YXJ0IG9mIHRoZSBjb21wYXJpc29uIHJhbmdlLiAqL1xuICBASW5wdXQoKSBjb21wYXJpc29uU3RhcnQ6IEQgfCBudWxsO1xuXG4gIC8qKiBFbmQgb2YgdGhlIGNvbXBhcmlzb24gcmFuZ2UuICovXG4gIEBJbnB1dCgpIGNvbXBhcmlzb25FbmQ6IEQgfCBudWxsO1xuXG4gIC8qKiBBUklBIEFjY2Vzc2libGUgbmFtZSBvZiB0aGUgYDxpbnB1dCBzdGFydERhdGUvPmAgKi9cbiAgQElucHV0KCkgc3RhcnREYXRlQWNjZXNzaWJsZU5hbWU6IHN0cmluZyB8IG51bGw7XG5cbiAgLyoqIEFSSUEgQWNjZXNzaWJsZSBuYW1lIG9mIHRoZSBgPGlucHV0IGVuZERhdGUvPmAgKi9cbiAgQElucHV0KCkgZW5kRGF0ZUFjY2Vzc2libGVOYW1lOiBzdHJpbmcgfCBudWxsO1xuXG4gIC8qKiBPcmlnaW4gb2YgYWN0aXZlIGRyYWcsIG9yIG51bGwgd2hlbiBkcmFnZ2luZyBpcyBub3QgYWN0aXZlLiAqL1xuICBASW5wdXQoKSBhY3RpdmVEcmFnOiBDYWxlbmRhclVzZXJFdmVudDxEPiB8IG51bGwgPSBudWxsO1xuXG4gIC8qKiBFbWl0cyB3aGVuIGEgbmV3IGRhdGUgaXMgc2VsZWN0ZWQuICovXG4gIEBPdXRwdXQoKSByZWFkb25seSBzZWxlY3RlZENoYW5nZTogRXZlbnRFbWl0dGVyPEQgfCBudWxsPiA9IG5ldyBFdmVudEVtaXR0ZXI8RCB8IG51bGw+KCk7XG5cbiAgLyoqIEVtaXRzIHdoZW4gYW55IGRhdGUgaXMgc2VsZWN0ZWQuICovXG4gIEBPdXRwdXQoKSByZWFkb25seSBfdXNlclNlbGVjdGlvbjogRXZlbnRFbWl0dGVyPENhbGVuZGFyVXNlckV2ZW50PEQgfCBudWxsPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFxuICAgIENhbGVuZGFyVXNlckV2ZW50PEQgfCBudWxsPlxuICA+KCk7XG5cbiAgLyoqIEVtaXRzIHdoZW4gdGhlIHVzZXIgaW5pdGlhdGVzIGEgZGF0ZSByYW5nZSBkcmFnIHZpYSBtb3VzZSBvciB0b3VjaC4gKi9cbiAgQE91dHB1dCgpIHJlYWRvbmx5IGRyYWdTdGFydGVkID0gbmV3IEV2ZW50RW1pdHRlcjxDYWxlbmRhclVzZXJFdmVudDxEPj4oKTtcblxuICAvKipcbiAgICogRW1pdHMgd2hlbiB0aGUgdXNlciBjb21wbGV0ZXMgb3IgY2FuY2VscyBhIGRhdGUgcmFuZ2UgZHJhZy5cbiAgICogRW1pdHMgbnVsbCB3aGVuIHRoZSBkcmFnIHdhcyBjYW5jZWxlZCBvciB0aGUgbmV3bHkgc2VsZWN0ZWQgZGF0ZSByYW5nZSBpZiBjb21wbGV0ZWQuXG4gICAqL1xuICBAT3V0cHV0KCkgcmVhZG9ubHkgZHJhZ0VuZGVkID0gbmV3IEV2ZW50RW1pdHRlcjxDYWxlbmRhclVzZXJFdmVudDxEYXRlUmFuZ2U8RD4gfCBudWxsPj4oKTtcblxuICAvKiogRW1pdHMgd2hlbiBhbnkgZGF0ZSBpcyBhY3RpdmF0ZWQuICovXG4gIEBPdXRwdXQoKSByZWFkb25seSBhY3RpdmVEYXRlQ2hhbmdlOiBFdmVudEVtaXR0ZXI8RD4gPSBuZXcgRXZlbnRFbWl0dGVyPEQ+KCk7XG5cbiAgLyoqIFRoZSBib2R5IG9mIGNhbGVuZGFyIHRhYmxlICovXG4gIEBWaWV3Q2hpbGQoQ2FsZW5kYXJCb2R5KSBfY2FsZW5kYXJCb2R5OiBDYWxlbmRhckJvZHk7XG5cbiAgLyoqIFRoZSBsYWJlbCBmb3IgdGhpcyBtb250aCAoZS5nLiBcIkphbnVhcnkgMjAxN1wiKS4gKi9cbiAgX21vbnRoTGFiZWw6IHN0cmluZztcblxuICAvKiogR3JpZCBvZiBjYWxlbmRhciBjZWxscyByZXByZXNlbnRpbmcgdGhlIGRhdGVzIG9mIHRoZSBtb250aC4gKi9cbiAgX3dlZWtzOiBDYWxlbmRhckNlbGxbXVtdO1xuXG4gIC8qKiBUaGUgbnVtYmVyIG9mIGJsYW5rIGNlbGxzIGluIHRoZSBmaXJzdCByb3cgYmVmb3JlIHRoZSAxc3Qgb2YgdGhlIG1vbnRoLiAqL1xuICBfZmlyc3RXZWVrT2Zmc2V0OiBudW1iZXI7XG5cbiAgLyoqIFN0YXJ0IHZhbHVlIG9mIHRoZSBjdXJyZW50bHktc2hvd24gZGF0ZSByYW5nZS4gKi9cbiAgX3JhbmdlU3RhcnQ6IG51bWJlciB8IG51bGw7XG5cbiAgLyoqIEVuZCB2YWx1ZSBvZiB0aGUgY3VycmVudGx5LXNob3duIGRhdGUgcmFuZ2UuICovXG4gIF9yYW5nZUVuZDogbnVtYmVyIHwgbnVsbDtcblxuICAvKiogU3RhcnQgdmFsdWUgb2YgdGhlIGN1cnJlbnRseS1zaG93biBjb21wYXJpc29uIGRhdGUgcmFuZ2UuICovXG4gIF9jb21wYXJpc29uUmFuZ2VTdGFydDogbnVtYmVyIHwgbnVsbDtcblxuICAvKiogRW5kIHZhbHVlIG9mIHRoZSBjdXJyZW50bHktc2hvd24gY29tcGFyaXNvbiBkYXRlIHJhbmdlLiAqL1xuICBfY29tcGFyaXNvblJhbmdlRW5kOiBudW1iZXIgfCBudWxsO1xuXG4gIC8qKiBTdGFydCBvZiB0aGUgcHJldmlldyByYW5nZS4gKi9cbiAgX3ByZXZpZXdTdGFydDogbnVtYmVyIHwgbnVsbDtcblxuICAvKiogRW5kIG9mIHRoZSBwcmV2aWV3IHJhbmdlLiAqL1xuICBfcHJldmlld0VuZDogbnVtYmVyIHwgbnVsbDtcblxuICAvKiogV2hldGhlciB0aGUgdXNlciBpcyBjdXJyZW50bHkgc2VsZWN0aW5nIGEgcmFuZ2Ugb2YgZGF0ZXMuICovXG4gIF9pc1JhbmdlOiBib29sZWFuO1xuXG4gIC8qKiBUaGUgZGF0ZSBvZiB0aGUgbW9udGggdGhhdCB0b2RheSBmYWxscyBvbi4gTnVsbCBpZiB0b2RheSBpcyBpbiBhbm90aGVyIG1vbnRoLiAqL1xuICBfdG9kYXlEYXRlOiBudW1iZXIgfCBudWxsO1xuXG4gIC8qKiBUaGUgbmFtZXMgb2YgdGhlIHdlZWtkYXlzLiAqL1xuICBfd2Vla2RheXM6IHsgbG9uZzogc3RyaW5nOyBuYXJyb3c6IHN0cmluZyB9W107XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcmVhZG9ubHkgX2NoYW5nZURldGVjdG9yUmVmOiBDaGFuZ2VEZXRlY3RvclJlZixcbiAgICBAT3B0aW9uYWwoKSBASW5qZWN0KERBVEVfRk9STUFUUykgcHJpdmF0ZSBfZGF0ZUZvcm1hdHM6IERhdGVGb3JtYXRzLFxuICAgIEBPcHRpb25hbCgpIHB1YmxpYyBfZGF0ZUFkYXB0ZXI6IERhdGVBZGFwdGVyPEQ+LFxuICAgIEBPcHRpb25hbCgpIHByaXZhdGUgX2Rpcj86IERpcmVjdGlvbmFsaXR5XG4gICkge1xuICAgIGlmICghdGhpcy5fZGF0ZUFkYXB0ZXIpIHtcbiAgICAgIHRocm93IGNyZWF0ZU1pc3NpbmdEYXRlSW1wbEVycm9yKCdEYXRlQWRhcHRlcicpO1xuICAgIH1cbiAgICBpZiAoIXRoaXMuX2RhdGVGb3JtYXRzKSB7XG4gICAgICB0aHJvdyBjcmVhdGVNaXNzaW5nRGF0ZUltcGxFcnJvcignREFURV9GT1JNQVRTJyk7XG4gICAgfVxuXG4gICAgdGhpcy5fYWN0aXZlRGF0ZSA9IHRoaXMuX2RhdGVBZGFwdGVyLnRvZGF5KCk7XG4gIH1cblxuICBuZ0FmdGVyQ29udGVudEluaXQoKSB7XG4gICAgdGhpcy5fcmVyZW5kZXJTdWJzY3JpcHRpb24gPSB0aGlzLl9kYXRlQWRhcHRlci5sb2NhbGVDaGFuZ2VzXG4gICAgICAucGlwZShzdGFydFdpdGgobnVsbCkpXG4gICAgICAuc3Vic2NyaWJlKCgpID0+IHRoaXMuX2luaXQoKSk7XG4gIH1cblxuICBuZ09uQ2hhbmdlcyhjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKSB7XG4gICAgY29uc3QgY29tcGFyaXNvbkNoYW5nZSA9IGNoYW5nZXNbJ2NvbXBhcmlzb25TdGFydCddIHx8IGNoYW5nZXNbJ2NvbXBhcmlzb25FbmQnXTtcblxuICAgIGlmIChjb21wYXJpc29uQ2hhbmdlICYmICFjb21wYXJpc29uQ2hhbmdlLmZpcnN0Q2hhbmdlKSB7XG4gICAgICB0aGlzLl9zZXRSYW5nZXModGhpcy5zZWxlY3RlZCk7XG4gICAgfVxuXG4gICAgaWYgKGNoYW5nZXNbJ2FjdGl2ZURyYWcnXSAmJiAhdGhpcy5hY3RpdmVEcmFnKSB7XG4gICAgICB0aGlzLl9jbGVhclByZXZpZXcoKTtcbiAgICB9XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICB0aGlzLl9yZXJlbmRlclN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xuICB9XG5cbiAgLyoqIEhhbmRsZXMgd2hlbiBhIG5ldyBkYXRlIGlzIHNlbGVjdGVkLiAqL1xuICBfZGF0ZVNlbGVjdGVkKGV2ZW50OiBDYWxlbmRhclVzZXJFdmVudDxudW1iZXI+KSB7XG4gICAgY29uc3QgZGF0ZSA9IGV2ZW50LnZhbHVlO1xuICAgIGNvbnN0IHNlbGVjdGVkRGF0ZSA9IHRoaXMuX2dldERhdGVGcm9tRGF5T2ZNb250aChkYXRlKTtcbiAgICBsZXQgcmFuZ2VTdGFydERhdGU6IG51bWJlciB8IG51bGw7XG4gICAgbGV0IHJhbmdlRW5kRGF0ZTogbnVtYmVyIHwgbnVsbDtcblxuICAgIGlmICh0aGlzLl9zZWxlY3RlZCBpbnN0YW5jZW9mIERhdGVSYW5nZSkge1xuICAgICAgcmFuZ2VTdGFydERhdGUgPSB0aGlzLl9nZXREYXRlSW5DdXJyZW50TW9udGgodGhpcy5fc2VsZWN0ZWQuc3RhcnQpO1xuICAgICAgcmFuZ2VFbmREYXRlID0gdGhpcy5fZ2V0RGF0ZUluQ3VycmVudE1vbnRoKHRoaXMuX3NlbGVjdGVkLmVuZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJhbmdlU3RhcnREYXRlID0gcmFuZ2VFbmREYXRlID0gdGhpcy5fZ2V0RGF0ZUluQ3VycmVudE1vbnRoKHRoaXMuX3NlbGVjdGVkKTtcbiAgICB9XG5cbiAgICBpZiAocmFuZ2VTdGFydERhdGUgIT09IGRhdGUgfHwgcmFuZ2VFbmREYXRlICE9PSBkYXRlKSB7XG4gICAgICB0aGlzLnNlbGVjdGVkQ2hhbmdlLmVtaXQoc2VsZWN0ZWREYXRlKTtcbiAgICB9XG5cbiAgICB0aGlzLl91c2VyU2VsZWN0aW9uLmVtaXQoeyB2YWx1ZTogc2VsZWN0ZWREYXRlLCBldmVudDogZXZlbnQuZXZlbnQgfSk7XG4gICAgdGhpcy5fY2xlYXJQcmV2aWV3KCk7XG4gICAgdGhpcy5fY2hhbmdlRGV0ZWN0b3JSZWYubWFya0ZvckNoZWNrKCk7XG4gIH1cblxuICAvKipcbiAgICogVGFrZXMgdGhlIGluZGV4IG9mIGEgY2FsZW5kYXIgYm9keSBjZWxsIHdyYXBwZWQgaW4gYW4gZXZlbnQgYXMgYXJndW1lbnQuIEZvciB0aGUgZGF0ZSB0aGF0XG4gICAqIGNvcnJlc3BvbmRzIHRvIHRoZSBnaXZlbiBjZWxsLCBzZXQgYGFjdGl2ZURhdGVgIHRvIHRoYXQgZGF0ZSBhbmQgZmlyZSBgYWN0aXZlRGF0ZUNoYW5nZWAgd2l0aFxuICAgKiB0aGF0IGRhdGUuXG4gICAqXG4gICAqIFRoaXMgZnVuY3Rpb24gaXMgdXNlZCB0byBtYXRjaCBlYWNoIGNvbXBvbmVudCdzIG1vZGVsIG9mIHRoZSBhY3RpdmUgZGF0ZSB3aXRoIHRoZSBjYWxlbmRhclxuICAgKiBib2R5IGNlbGwgdGhhdCB3YXMgZm9jdXNlZC4gSXQgdXBkYXRlcyBpdHMgdmFsdWUgb2YgYGFjdGl2ZURhdGVgIHN5bmNocm9ub3VzbHkgYW5kIHVwZGF0ZXMgdGhlXG4gICAqIHBhcmVudCdzIHZhbHVlIGFzeW5jaHJvbm91c2x5IHZpYSB0aGUgYGFjdGl2ZURhdGVDaGFuZ2VgIGV2ZW50LiBUaGUgY2hpbGQgY29tcG9uZW50IHJlY2VpdmVzIGFuXG4gICAqIHVwZGF0ZWQgdmFsdWUgYXN5bmNocm9ub3VzbHkgdmlhIHRoZSBgYWN0aXZlQ2VsbGAgSW5wdXQuXG4gICAqL1xuICBfdXBkYXRlQWN0aXZlRGF0ZShldmVudDogQ2FsZW5kYXJVc2VyRXZlbnQ8bnVtYmVyPikge1xuICAgIGNvbnN0IG1vbnRoID0gZXZlbnQudmFsdWU7XG4gICAgY29uc3Qgb2xkQWN0aXZlRGF0ZSA9IHRoaXMuX2FjdGl2ZURhdGU7XG4gICAgdGhpcy5hY3RpdmVEYXRlID0gdGhpcy5fZ2V0RGF0ZUZyb21EYXlPZk1vbnRoKG1vbnRoKTtcblxuICAgIGlmICh0aGlzLl9kYXRlQWRhcHRlci5jb21wYXJlRGF0ZShvbGRBY3RpdmVEYXRlLCB0aGlzLmFjdGl2ZURhdGUpKSB7XG4gICAgICB0aGlzLmFjdGl2ZURhdGVDaGFuZ2UuZW1pdCh0aGlzLl9hY3RpdmVEYXRlKTtcbiAgICB9XG4gIH1cblxuICAvKiogSGFuZGxlcyBrZXlkb3duIGV2ZW50cyBvbiB0aGUgY2FsZW5kYXIgYm9keSB3aGVuIGNhbGVuZGFyIGlzIGluIG1vbnRoIHZpZXcuICovXG4gIF9oYW5kbGVDYWxlbmRhckJvZHlLZXlkb3duKGV2ZW50OiBLZXlib2FyZEV2ZW50KTogdm9pZCB7XG4gICAgY29uc3Qgb2xkQWN0aXZlRGF0ZSA9IHRoaXMuX2FjdGl2ZURhdGU7XG4gICAgY29uc3QgaXNSdGwgPSB0aGlzLl9pc1J0bCgpO1xuXG4gICAgc3dpdGNoIChldmVudC5rZXlDb2RlKSB7XG4gICAgICBjYXNlIExFRlRfQVJST1c6XG4gICAgICAgIHRoaXMuYWN0aXZlRGF0ZSA9IHRoaXMuX2RhdGVBZGFwdGVyLmFkZENhbGVuZGFyRGF5cyh0aGlzLl9hY3RpdmVEYXRlLCBpc1J0bCA/IDEgOiAtMSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBSSUdIVF9BUlJPVzpcbiAgICAgICAgdGhpcy5hY3RpdmVEYXRlID0gdGhpcy5fZGF0ZUFkYXB0ZXIuYWRkQ2FsZW5kYXJEYXlzKHRoaXMuX2FjdGl2ZURhdGUsIGlzUnRsID8gLTEgOiAxKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFVQX0FSUk9XOlxuICAgICAgICB0aGlzLmFjdGl2ZURhdGUgPSB0aGlzLl9kYXRlQWRhcHRlci5hZGRDYWxlbmRhckRheXModGhpcy5fYWN0aXZlRGF0ZSwgLTcpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgRE9XTl9BUlJPVzpcbiAgICAgICAgdGhpcy5hY3RpdmVEYXRlID0gdGhpcy5fZGF0ZUFkYXB0ZXIuYWRkQ2FsZW5kYXJEYXlzKHRoaXMuX2FjdGl2ZURhdGUsIDcpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgSE9NRTpcbiAgICAgICAgdGhpcy5hY3RpdmVEYXRlID0gdGhpcy5fZGF0ZUFkYXB0ZXIuYWRkQ2FsZW5kYXJEYXlzKFxuICAgICAgICAgIHRoaXMuX2FjdGl2ZURhdGUsXG4gICAgICAgICAgMSAtIHRoaXMuX2RhdGVBZGFwdGVyLmdldERhdGUodGhpcy5fYWN0aXZlRGF0ZSlcbiAgICAgICAgKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEVORDpcbiAgICAgICAgdGhpcy5hY3RpdmVEYXRlID0gdGhpcy5fZGF0ZUFkYXB0ZXIuYWRkQ2FsZW5kYXJEYXlzKFxuICAgICAgICAgIHRoaXMuX2FjdGl2ZURhdGUsXG4gICAgICAgICAgdGhpcy5fZGF0ZUFkYXB0ZXIuZ2V0TnVtRGF5c0luTW9udGgodGhpcy5fYWN0aXZlRGF0ZSkgLVxuICAgICAgICAgICAgdGhpcy5fZGF0ZUFkYXB0ZXIuZ2V0RGF0ZSh0aGlzLl9hY3RpdmVEYXRlKVxuICAgICAgICApO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgUEFHRV9VUDpcbiAgICAgICAgdGhpcy5hY3RpdmVEYXRlID0gZXZlbnQuYWx0S2V5XG4gICAgICAgICAgPyB0aGlzLl9kYXRlQWRhcHRlci5hZGRDYWxlbmRhclllYXJzKHRoaXMuX2FjdGl2ZURhdGUsIC0xKVxuICAgICAgICAgIDogdGhpcy5fZGF0ZUFkYXB0ZXIuYWRkQ2FsZW5kYXJNb250aHModGhpcy5fYWN0aXZlRGF0ZSwgLTEpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgUEFHRV9ET1dOOlxuICAgICAgICB0aGlzLmFjdGl2ZURhdGUgPSBldmVudC5hbHRLZXlcbiAgICAgICAgICA/IHRoaXMuX2RhdGVBZGFwdGVyLmFkZENhbGVuZGFyWWVhcnModGhpcy5fYWN0aXZlRGF0ZSwgMSlcbiAgICAgICAgICA6IHRoaXMuX2RhdGVBZGFwdGVyLmFkZENhbGVuZGFyTW9udGhzKHRoaXMuX2FjdGl2ZURhdGUsIDEpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgRU5URVI6XG4gICAgICBjYXNlIFNQQUNFOlxuICAgICAgICB0aGlzLl9zZWxlY3Rpb25LZXlQcmVzc2VkID0gdHJ1ZTtcblxuICAgICAgICBpZiAodGhpcy5fY2FuU2VsZWN0KHRoaXMuX2FjdGl2ZURhdGUpKSB7XG4gICAgICAgICAgLy8gUHJldmVudCB1bmV4cGVjdGVkIGRlZmF1bHQgYWN0aW9ucyBzdWNoIGFzIGZvcm0gc3VibWlzc2lvbi5cbiAgICAgICAgICAvLyBOb3RlIHRoYXQgd2Ugb25seSBwcmV2ZW50IHRoZSBkZWZhdWx0IGFjdGlvbiBoZXJlIHdoaWxlIHRoZSBzZWxlY3Rpb24gaGFwcGVucyBpblxuICAgICAgICAgIC8vIGBrZXl1cGAgYmVsb3cuIFdlIGNhbid0IGRvIHRoZSBzZWxlY3Rpb24gaGVyZSwgYmVjYXVzZSBpdCBjYW4gY2F1c2UgdGhlIGNhbGVuZGFyIHRvXG4gICAgICAgICAgLy8gcmVvcGVuIGlmIGZvY3VzIGlzIHJlc3RvcmVkIGltbWVkaWF0ZWx5LiBXZSBhbHNvIGNhbid0IGNhbGwgYHByZXZlbnREZWZhdWx0YCBvbiBga2V5dXBgXG4gICAgICAgICAgLy8gYmVjYXVzZSBpdCdzIHRvbyBsYXRlIChzZWUgIzIzMzA1KS5cbiAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybjtcbiAgICAgIGNhc2UgRVNDQVBFOlxuICAgICAgICAvLyBBYm9ydCB0aGUgY3VycmVudCByYW5nZSBzZWxlY3Rpb24gaWYgdGhlIHVzZXIgcHJlc3NlcyBlc2NhcGUgbWlkLXNlbGVjdGlvbi5cbiAgICAgICAgaWYgKHRoaXMuX3ByZXZpZXdFbmQgIT0gbnVsbCAmJiAhaGFzTW9kaWZpZXJLZXkoZXZlbnQpKSB7XG4gICAgICAgICAgdGhpcy5fY2xlYXJQcmV2aWV3KCk7XG4gICAgICAgICAgLy8gSWYgYSBkcmFnIGlzIGluIHByb2dyZXNzLCBjYW5jZWwgdGhlIGRyYWcgd2l0aG91dCBjaGFuZ2luZyB0aGVcbiAgICAgICAgICAvLyBjdXJyZW50IHNlbGVjdGlvbi5cbiAgICAgICAgICBpZiAodGhpcy5hY3RpdmVEcmFnKSB7XG4gICAgICAgICAgICB0aGlzLmRyYWdFbmRlZC5lbWl0KHsgdmFsdWU6IG51bGwsIGV2ZW50IH0pO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkQ2hhbmdlLmVtaXQobnVsbCk7XG4gICAgICAgICAgICB0aGlzLl91c2VyU2VsZWN0aW9uLmVtaXQoeyB2YWx1ZTogbnVsbCwgZXZlbnQgfSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7IC8vIFByZXZlbnRzIHRoZSBvdmVybGF5IGZyb20gY2xvc2luZy5cbiAgICAgICAgfVxuICAgICAgICByZXR1cm47XG4gICAgICBkZWZhdWx0OlxuICAgICAgICAvLyBEb24ndCBwcmV2ZW50IGRlZmF1bHQgb3IgZm9jdXMgYWN0aXZlIGNlbGwgb24ga2V5cyB0aGF0IHdlIGRvbid0IGV4cGxpY2l0bHkgaGFuZGxlLlxuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX2RhdGVBZGFwdGVyLmNvbXBhcmVEYXRlKG9sZEFjdGl2ZURhdGUsIHRoaXMuYWN0aXZlRGF0ZSkpIHtcbiAgICAgIHRoaXMuYWN0aXZlRGF0ZUNoYW5nZS5lbWl0KHRoaXMuYWN0aXZlRGF0ZSk7XG5cbiAgICAgIHRoaXMuX2ZvY3VzQWN0aXZlQ2VsbEFmdGVyVmlld0NoZWNrZWQoKTtcbiAgICB9XG5cbiAgICAvLyBQcmV2ZW50IHVuZXhwZWN0ZWQgZGVmYXVsdCBhY3Rpb25zIHN1Y2ggYXMgZm9ybSBzdWJtaXNzaW9uLlxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gIH1cblxuICAvKiogSGFuZGxlcyBrZXl1cCBldmVudHMgb24gdGhlIGNhbGVuZGFyIGJvZHkgd2hlbiBjYWxlbmRhciBpcyBpbiBtb250aCB2aWV3LiAqL1xuICBfaGFuZGxlQ2FsZW5kYXJCb2R5S2V5dXAoZXZlbnQ6IEtleWJvYXJkRXZlbnQpOiB2b2lkIHtcbiAgICBpZiAoZXZlbnQua2V5Q29kZSA9PT0gU1BBQ0UgfHwgZXZlbnQua2V5Q29kZSA9PT0gRU5URVIpIHtcbiAgICAgIGlmICh0aGlzLl9zZWxlY3Rpb25LZXlQcmVzc2VkICYmIHRoaXMuX2NhblNlbGVjdCh0aGlzLl9hY3RpdmVEYXRlKSkge1xuICAgICAgICB0aGlzLl9kYXRlU2VsZWN0ZWQoeyB2YWx1ZTogdGhpcy5fZGF0ZUFkYXB0ZXIuZ2V0RGF0ZSh0aGlzLl9hY3RpdmVEYXRlKSwgZXZlbnQgfSk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX3NlbGVjdGlvbktleVByZXNzZWQgPSBmYWxzZTtcbiAgICB9XG4gIH1cblxuICAvKiogSW5pdGlhbGl6ZXMgdGhpcyBtb250aCB2aWV3LiAqL1xuICBfaW5pdCgpIHtcbiAgICB0aGlzLl9zZXRSYW5nZXModGhpcy5zZWxlY3RlZCk7XG4gICAgdGhpcy5fdG9kYXlEYXRlID0gdGhpcy5fZ2V0Q2VsbENvbXBhcmVWYWx1ZSh0aGlzLl9kYXRlQWRhcHRlci50b2RheSgpKTtcbiAgICB0aGlzLl9tb250aExhYmVsID0gdGhpcy5fZGF0ZUZvcm1hdHMuZGlzcGxheS5tb250aExhYmVsXG4gICAgICA/IHRoaXMuX2RhdGVBZGFwdGVyLmZvcm1hdCh0aGlzLmFjdGl2ZURhdGUsIHRoaXMuX2RhdGVGb3JtYXRzLmRpc3BsYXkubW9udGhMYWJlbClcbiAgICAgIDogdGhpcy5fZGF0ZUFkYXB0ZXJcbiAgICAgICAgICAuZ2V0TW9udGhOYW1lcygnc2hvcnQnKVxuICAgICAgICAgIFt0aGlzLl9kYXRlQWRhcHRlci5nZXRNb250aCh0aGlzLmFjdGl2ZURhdGUpXS50b0xvY2FsZVVwcGVyQ2FzZSgpO1xuXG4gICAgY29uc3QgZmlyc3RPZk1vbnRoID0gdGhpcy5fZGF0ZUFkYXB0ZXIuY3JlYXRlRGF0ZShcbiAgICAgIHRoaXMuX2RhdGVBZGFwdGVyLmdldFllYXIodGhpcy5hY3RpdmVEYXRlKSxcbiAgICAgIHRoaXMuX2RhdGVBZGFwdGVyLmdldE1vbnRoKHRoaXMuYWN0aXZlRGF0ZSksXG4gICAgICAxXG4gICAgKTtcbiAgICB0aGlzLl9maXJzdFdlZWtPZmZzZXQgPVxuICAgICAgKERBWVNfUEVSX1dFRUsgK1xuICAgICAgICB0aGlzLl9kYXRlQWRhcHRlci5nZXREYXlPZldlZWsoZmlyc3RPZk1vbnRoKSAtXG4gICAgICAgIHRoaXMuX2RhdGVBZGFwdGVyLmdldEZpcnN0RGF5T2ZXZWVrKCkpICVcbiAgICAgIERBWVNfUEVSX1dFRUs7XG5cbiAgICB0aGlzLl9pbml0V2Vla2RheXMoKTtcbiAgICB0aGlzLl9jcmVhdGVXZWVrQ2VsbHMoKTtcbiAgICB0aGlzLl9jaGFuZ2VEZXRlY3RvclJlZi5tYXJrRm9yQ2hlY2soKTtcbiAgfVxuXG4gIC8qKiBGb2N1c2VzIHRoZSBhY3RpdmUgY2VsbCBhZnRlciB0aGUgbWljcm90YXNrIHF1ZXVlIGlzIGVtcHR5LiAqL1xuICBfZm9jdXNBY3RpdmVDZWxsKG1vdmVQcmV2aWV3PzogYm9vbGVhbikge1xuICAgIHRoaXMuX2NhbGVuZGFyQm9keS5fZm9jdXNBY3RpdmVDZWxsKG1vdmVQcmV2aWV3KTtcbiAgfVxuXG4gIC8qKiBGb2N1c2VzIHRoZSBhY3RpdmUgY2VsbCBhZnRlciBjaGFuZ2UgZGV0ZWN0aW9uIGhhcyBydW4gYW5kIHRoZSBtaWNyb3Rhc2sgcXVldWUgaXMgZW1wdHkuICovXG4gIF9mb2N1c0FjdGl2ZUNlbGxBZnRlclZpZXdDaGVja2VkKCkge1xuICAgIHRoaXMuX2NhbGVuZGFyQm9keS5fc2NoZWR1bGVGb2N1c0FjdGl2ZUNlbGxBZnRlclZpZXdDaGVja2VkKCk7XG4gIH1cblxuICAvKiogQ2FsbGVkIHdoZW4gdGhlIHVzZXIgaGFzIGFjdGl2YXRlZCBhIG5ldyBjZWxsIGFuZCB0aGUgcHJldmlldyBuZWVkcyB0byBiZSB1cGRhdGVkLiAqL1xuICBfcHJldmlld0NoYW5nZWQoeyBldmVudCwgdmFsdWU6IGNlbGwgfTogQ2FsZW5kYXJVc2VyRXZlbnQ8Q2FsZW5kYXJDZWxsPEQ+IHwgbnVsbD4pIHt9XG5cbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIHRoZSB1c2VyIGhhcyBlbmRlZCBhIGRyYWcuIElmIHRoZSBkcmFnL2Ryb3Agd2FzIHN1Y2Nlc3NmdWwsXG4gICAqIGNvbXB1dGVzIGFuZCBlbWl0cyB0aGUgbmV3IHJhbmdlIHNlbGVjdGlvbi5cbiAgICovXG4gIHByb3RlY3RlZCBfZHJhZ0VuZGVkKGV2ZW50OiBDYWxlbmRhclVzZXJFdmVudDxEIHwgbnVsbD4pIHtcbiAgICBpZiAoIXRoaXMuYWN0aXZlRHJhZykgcmV0dXJuO1xuICAgIHRoaXMuZHJhZ0VuZGVkLmVtaXQoeyB2YWx1ZTogbnVsbCwgZXZlbnQ6IGV2ZW50LmV2ZW50IH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFRha2VzIGEgZGF5IG9mIHRoZSBtb250aCBhbmQgcmV0dXJucyBhIG5ldyBkYXRlIGluIHRoZSBzYW1lIG1vbnRoIGFuZCB5ZWFyIGFzIHRoZSBjdXJyZW50bHlcbiAgICogIGFjdGl2ZSBkYXRlLiBUaGUgcmV0dXJuZWQgZGF0ZSB3aWxsIGhhdmUgdGhlIHNhbWUgZGF5IG9mIHRoZSBtb250aCBhcyB0aGUgYXJndW1lbnQgZGF0ZS5cbiAgICovXG4gIHByaXZhdGUgX2dldERhdGVGcm9tRGF5T2ZNb250aChkYXlPZk1vbnRoOiBudW1iZXIpOiBEIHtcbiAgICByZXR1cm4gdGhpcy5fZGF0ZUFkYXB0ZXIuY3JlYXRlRGF0ZShcbiAgICAgIHRoaXMuX2RhdGVBZGFwdGVyLmdldFllYXIodGhpcy5hY3RpdmVEYXRlKSxcbiAgICAgIHRoaXMuX2RhdGVBZGFwdGVyLmdldE1vbnRoKHRoaXMuYWN0aXZlRGF0ZSksXG4gICAgICBkYXlPZk1vbnRoXG4gICAgKTtcbiAgfVxuXG4gIC8qKiBJbml0aWFsaXplcyB0aGUgd2Vla2RheXMuICovXG4gIHByaXZhdGUgX2luaXRXZWVrZGF5cygpIHtcbiAgICBjb25zdCBmaXJzdERheU9mV2VlayA9IHRoaXMuX2RhdGVBZGFwdGVyLmdldEZpcnN0RGF5T2ZXZWVrKCk7XG4gICAgY29uc3QgbmFycm93V2Vla2RheXMgPSB0aGlzLl9kYXRlQWRhcHRlci5nZXREYXlPZldlZWtOYW1lcygnbmFycm93Jyk7XG4gICAgY29uc3QgbG9uZ1dlZWtkYXlzID0gdGhpcy5fZGF0ZUFkYXB0ZXIuZ2V0RGF5T2ZXZWVrTmFtZXMoJ2xvbmcnKTtcblxuICAgIC8vIFJvdGF0ZSB0aGUgbGFiZWxzIGZvciBkYXlzIG9mIHRoZSB3ZWVrIGJhc2VkIG9uIHRoZSBjb25maWd1cmVkIGZpcnN0IGRheSBvZiB0aGUgd2Vlay5cbiAgICBjb25zdCB3ZWVrZGF5cyA9IGxvbmdXZWVrZGF5cy5tYXAoKGxvbmcsIGkpID0+IHtcbiAgICAgIHJldHVybiB7IGxvbmcsIG5hcnJvdzogbmFycm93V2Vla2RheXNbaV0gfTtcbiAgICB9KTtcbiAgICB0aGlzLl93ZWVrZGF5cyA9IHdlZWtkYXlzLnNsaWNlKGZpcnN0RGF5T2ZXZWVrKS5jb25jYXQod2Vla2RheXMuc2xpY2UoMCwgZmlyc3REYXlPZldlZWspKTtcbiAgfVxuXG4gIC8qKiBDcmVhdGVzIENhbGVuZGFyQ2VsbHMgZm9yIHRoZSBkYXRlcyBpbiB0aGlzIG1vbnRoLiAqL1xuICBwcml2YXRlIF9jcmVhdGVXZWVrQ2VsbHMoKSB7XG4gICAgY29uc3QgZGF5c0luTW9udGggPSB0aGlzLl9kYXRlQWRhcHRlci5nZXROdW1EYXlzSW5Nb250aCh0aGlzLmFjdGl2ZURhdGUpO1xuICAgIGNvbnN0IGRhdGVOYW1lcyA9IHRoaXMuX2RhdGVBZGFwdGVyLmdldERhdGVOYW1lcygpO1xuICAgIHRoaXMuX3dlZWtzID0gW1tdXTtcbiAgICBmb3IgKGxldCBpID0gMCwgY2VsbCA9IHRoaXMuX2ZpcnN0V2Vla09mZnNldDsgaSA8IGRheXNJbk1vbnRoOyBpKyssIGNlbGwrKykge1xuICAgICAgaWYgKGNlbGwgPT0gREFZU19QRVJfV0VFSykge1xuICAgICAgICB0aGlzLl93ZWVrcy5wdXNoKFtdKTtcbiAgICAgICAgY2VsbCA9IDA7XG4gICAgICB9XG4gICAgICBjb25zdCBkYXRlID0gdGhpcy5fZGF0ZUFkYXB0ZXIuY3JlYXRlRGF0ZShcbiAgICAgICAgdGhpcy5fZGF0ZUFkYXB0ZXIuZ2V0WWVhcih0aGlzLmFjdGl2ZURhdGUpLFxuICAgICAgICB0aGlzLl9kYXRlQWRhcHRlci5nZXRNb250aCh0aGlzLmFjdGl2ZURhdGUpLFxuICAgICAgICBpICsgMVxuICAgICAgKTtcbiAgICAgIGNvbnN0IGVuYWJsZWQgPSB0aGlzLl9zaG91bGRFbmFibGVEYXRlKGRhdGUpO1xuICAgICAgY29uc3QgYXJpYUxhYmVsID0gdGhpcy5fZGF0ZUFkYXB0ZXIuZm9ybWF0KGRhdGUsIHRoaXMuX2RhdGVGb3JtYXRzLmRpc3BsYXkuZGF0ZUExMXlMYWJlbCk7XG4gICAgICBjb25zdCBjZWxsQ2xhc3NlcyA9IHRoaXMuZGF0ZUNsYXNzID8gdGhpcy5kYXRlQ2xhc3MoZGF0ZSwgJ21vbnRoJykgOiB1bmRlZmluZWQ7XG5cbiAgICAgIHRoaXMuX3dlZWtzW3RoaXMuX3dlZWtzLmxlbmd0aCAtIDFdLnB1c2goXG4gICAgICAgIG5ldyBDYWxlbmRhckNlbGw8RD4oXG4gICAgICAgICAgaSArIDEsXG4gICAgICAgICAgZGF0ZU5hbWVzW2ldLFxuICAgICAgICAgIGFyaWFMYWJlbCxcbiAgICAgICAgICBlbmFibGVkLFxuICAgICAgICAgIGNlbGxDbGFzc2VzLFxuICAgICAgICAgIHRoaXMuX2dldENlbGxDb21wYXJlVmFsdWUoZGF0ZSkhLFxuICAgICAgICAgIGRhdGVcbiAgICAgICAgKVxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICAvKiogRGF0ZSBmaWx0ZXIgZm9yIHRoZSBtb250aCAqL1xuICBwcml2YXRlIF9zaG91bGRFbmFibGVEYXRlKGRhdGU6IEQpOiBib29sZWFuIHtcbiAgICByZXR1cm4gKFxuICAgICAgISFkYXRlICYmXG4gICAgICAoIXRoaXMubWluRGF0ZSB8fCB0aGlzLl9kYXRlQWRhcHRlci5jb21wYXJlRGF0ZShkYXRlLCB0aGlzLm1pbkRhdGUpID49IDApICYmXG4gICAgICAoIXRoaXMubWF4RGF0ZSB8fCB0aGlzLl9kYXRlQWRhcHRlci5jb21wYXJlRGF0ZShkYXRlLCB0aGlzLm1heERhdGUpIDw9IDApICYmXG4gICAgICAoIXRoaXMuZGF0ZUZpbHRlciB8fCB0aGlzLmRhdGVGaWx0ZXIoZGF0ZSkpXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBkYXRlIGluIHRoaXMgbW9udGggdGhhdCB0aGUgZ2l2ZW4gRGF0ZSBmYWxscyBvbi5cbiAgICogUmV0dXJucyBudWxsIGlmIHRoZSBnaXZlbiBEYXRlIGlzIGluIGFub3RoZXIgbW9udGguXG4gICAqL1xuICBwcml2YXRlIF9nZXREYXRlSW5DdXJyZW50TW9udGgoZGF0ZTogRCB8IG51bGwpOiBudW1iZXIgfCBudWxsIHtcbiAgICByZXR1cm4gZGF0ZSAmJiB0aGlzLl9oYXNTYW1lTW9udGhBbmRZZWFyKGRhdGUsIHRoaXMuYWN0aXZlRGF0ZSlcbiAgICAgID8gdGhpcy5fZGF0ZUFkYXB0ZXIuZ2V0RGF0ZShkYXRlKVxuICAgICAgOiBudWxsO1xuICB9XG5cbiAgLyoqIENoZWNrcyB3aGV0aGVyIHRoZSAyIGRhdGVzIGFyZSBub24tbnVsbCBhbmQgZmFsbCB3aXRoaW4gdGhlIHNhbWUgbW9udGggb2YgdGhlIHNhbWUgeWVhci4gKi9cbiAgcHJpdmF0ZSBfaGFzU2FtZU1vbnRoQW5kWWVhcihkMTogRCB8IG51bGwsIGQyOiBEIHwgbnVsbCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAhIShcbiAgICAgIGQxICYmXG4gICAgICBkMiAmJlxuICAgICAgdGhpcy5fZGF0ZUFkYXB0ZXIuZ2V0TW9udGgoZDEpID09IHRoaXMuX2RhdGVBZGFwdGVyLmdldE1vbnRoKGQyKSAmJlxuICAgICAgdGhpcy5fZGF0ZUFkYXB0ZXIuZ2V0WWVhcihkMSkgPT0gdGhpcy5fZGF0ZUFkYXB0ZXIuZ2V0WWVhcihkMilcbiAgICApO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIHZhbHVlIHRoYXQgd2lsbCBiZSB1c2VkIHRvIG9uZSBjZWxsIHRvIGFub3RoZXIuICovXG4gIHByaXZhdGUgX2dldENlbGxDb21wYXJlVmFsdWUoZGF0ZTogRCB8IG51bGwpOiBudW1iZXIgfCBudWxsIHtcbiAgICBpZiAoZGF0ZSkge1xuICAgICAgLy8gV2UgdXNlIHRoZSB0aW1lIHNpbmNlIHRoZSBVbml4IGVwb2NoIHRvIGNvbXBhcmUgZGF0ZXMgaW4gdGhpcyB2aWV3LCByYXRoZXIgdGhhbiB0aGVcbiAgICAgIC8vIGNlbGwgdmFsdWVzLCBiZWNhdXNlIHdlIG5lZWQgdG8gc3VwcG9ydCByYW5nZXMgdGhhdCBzcGFuIGFjcm9zcyBtdWx0aXBsZSBtb250aHMveWVhcnMuXG4gICAgICBjb25zdCB5ZWFyID0gdGhpcy5fZGF0ZUFkYXB0ZXIuZ2V0WWVhcihkYXRlKTtcbiAgICAgIGNvbnN0IG1vbnRoID0gdGhpcy5fZGF0ZUFkYXB0ZXIuZ2V0TW9udGgoZGF0ZSk7XG4gICAgICBjb25zdCBkYXkgPSB0aGlzLl9kYXRlQWRhcHRlci5nZXREYXRlKGRhdGUpO1xuICAgICAgcmV0dXJuIG5ldyBEYXRlKHllYXIsIG1vbnRoLCBkYXkpLmdldFRpbWUoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8qKiBEZXRlcm1pbmVzIHdoZXRoZXIgdGhlIHVzZXIgaGFzIHRoZSBSVEwgbGF5b3V0IGRpcmVjdGlvbi4gKi9cbiAgcHJpdmF0ZSBfaXNSdGwoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2RpciAmJiB0aGlzLl9kaXIudmFsdWUgPT09ICdydGwnO1xuICB9XG5cbiAgLyoqIFNldHMgdGhlIGN1cnJlbnQgcmFuZ2UgYmFzZWQgb24gYSBtb2RlbCB2YWx1ZS4gKi9cbiAgcHJpdmF0ZSBfc2V0UmFuZ2VzKHNlbGVjdGVkVmFsdWU6IERhdGVSYW5nZTxEPiB8IEQgfCBudWxsKSB7XG4gICAgaWYgKHNlbGVjdGVkVmFsdWUgaW5zdGFuY2VvZiBEYXRlUmFuZ2UpIHtcbiAgICAgIHRoaXMuX3JhbmdlU3RhcnQgPSB0aGlzLl9nZXRDZWxsQ29tcGFyZVZhbHVlKHNlbGVjdGVkVmFsdWUuc3RhcnQpO1xuICAgICAgdGhpcy5fcmFuZ2VFbmQgPSB0aGlzLl9nZXRDZWxsQ29tcGFyZVZhbHVlKHNlbGVjdGVkVmFsdWUuZW5kKTtcbiAgICAgIHRoaXMuX2lzUmFuZ2UgPSB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9yYW5nZVN0YXJ0ID0gdGhpcy5fcmFuZ2VFbmQgPSB0aGlzLl9nZXRDZWxsQ29tcGFyZVZhbHVlKHNlbGVjdGVkVmFsdWUpO1xuICAgICAgdGhpcy5faXNSYW5nZSA9IGZhbHNlO1xuICAgIH1cblxuICAgIHRoaXMuX2NvbXBhcmlzb25SYW5nZVN0YXJ0ID0gdGhpcy5fZ2V0Q2VsbENvbXBhcmVWYWx1ZSh0aGlzLmNvbXBhcmlzb25TdGFydCk7XG4gICAgdGhpcy5fY29tcGFyaXNvblJhbmdlRW5kID0gdGhpcy5fZ2V0Q2VsbENvbXBhcmVWYWx1ZSh0aGlzLmNvbXBhcmlzb25FbmQpO1xuICB9XG5cbiAgLyoqIEdldHMgd2hldGhlciBhIGRhdGUgY2FuIGJlIHNlbGVjdGVkIGluIHRoZSBtb250aCB2aWV3LiAqL1xuICBwcml2YXRlIF9jYW5TZWxlY3QoZGF0ZTogRCkge1xuICAgIHJldHVybiAhdGhpcy5kYXRlRmlsdGVyIHx8IHRoaXMuZGF0ZUZpbHRlcihkYXRlKTtcbiAgfVxuXG4gIC8qKiBDbGVhcnMgb3V0IHByZXZpZXcgc3RhdGUuICovXG4gIHByaXZhdGUgX2NsZWFyUHJldmlldygpIHtcbiAgICB0aGlzLl9wcmV2aWV3U3RhcnQgPSB0aGlzLl9wcmV2aWV3RW5kID0gbnVsbDtcbiAgfVxufVxuIiwiPCEtLSBlc2xpbnQtZGlzYWJsZSBAYW5ndWxhci1lc2xpbnQvdGVtcGxhdGUvaW50ZXJhY3RpdmUtc3VwcG9ydHMtZm9jdXMgLS0+XG48dGFibGVcbiAgY2xhc3M9XCJjYWxlbmRhci10YWJsZVwiXG4gIHJvbGU9XCJncmlkXCJcbj5cbiAgPHRoZWFkIGNsYXNzPVwiY2FsZW5kYXItdGFibGUtaGVhZGVyXCI+XG4gICAgPHRyPlxuICAgICAgQGZvciAoZGF5IG9mIF93ZWVrZGF5czsgdHJhY2sgZGF5KSB7XG4gICAgICAgIDx0aCBzY29wZT1cImNvbFwiPlxuICAgICAgICAgIDxzcGFuIGNsYXNzPVwiY2RrLXZpc3VhbGx5LWhpZGRlbiBoaWRkZW5cIj57eyBkYXkubG9uZyB9fTwvc3Bhbj5cbiAgICAgICAgICA8c3BhbiBhcmlhLWhpZGRlbj1cInRydWVcIj57eyBkYXkubmFycm93IH19PC9zcGFuPlxuICAgICAgICA8L3RoPlxuICAgICAgfVxuICAgIDwvdHI+XG4gICAgPHRyIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPlxuICAgICAgPHRoXG4gICAgICAgIGNsYXNzPVwiY2FsZW5kYXItdGFibGUtaGVhZGVyLWRpdmlkZXJcIlxuICAgICAgICBjb2xzcGFuPVwiN1wiXG4gICAgICA+PC90aD5cbiAgICA8L3RyPlxuICA8L3RoZWFkPlxuICA8dGJvZHlcbiAgICBjYWxlbmRhci1ib2R5XG4gICAgW2xhYmVsXT1cIl9tb250aExhYmVsXCJcbiAgICBbcm93c109XCJfd2Vla3NcIlxuICAgIFt0b2RheVZhbHVlXT1cIl90b2RheURhdGUhXCJcbiAgICBbc3RhcnRWYWx1ZV09XCJfcmFuZ2VTdGFydCFcIlxuICAgIFtlbmRWYWx1ZV09XCJfcmFuZ2VFbmQhXCJcbiAgICBbY29tcGFyaXNvblN0YXJ0XT1cIl9jb21wYXJpc29uUmFuZ2VTdGFydFwiXG4gICAgW2NvbXBhcmlzb25FbmRdPVwiX2NvbXBhcmlzb25SYW5nZUVuZFwiXG4gICAgW3ByZXZpZXdTdGFydF09XCJfcHJldmlld1N0YXJ0XCJcbiAgICBbcHJldmlld0VuZF09XCJfcHJldmlld0VuZFwiXG4gICAgW2lzUmFuZ2VdPVwiX2lzUmFuZ2VcIlxuICAgIFtsYWJlbE1pblJlcXVpcmVkQ2VsbHNdPVwiM1wiXG4gICAgW2FjdGl2ZUNlbGxdPVwiX2RhdGVBZGFwdGVyLmdldERhdGUoYWN0aXZlRGF0ZSkgLSAxXCJcbiAgICBbc3RhcnREYXRlQWNjZXNzaWJsZU5hbWVdPVwic3RhcnREYXRlQWNjZXNzaWJsZU5hbWVcIlxuICAgIFtlbmREYXRlQWNjZXNzaWJsZU5hbWVdPVwiZW5kRGF0ZUFjY2Vzc2libGVOYW1lXCJcbiAgICAoc2VsZWN0ZWRWYWx1ZUNoYW5nZSk9XCJfZGF0ZVNlbGVjdGVkKCRldmVudClcIlxuICAgIChhY3RpdmVEYXRlQ2hhbmdlKT1cIl91cGRhdGVBY3RpdmVEYXRlKCRldmVudClcIlxuICAgIChwcmV2aWV3Q2hhbmdlKT1cIl9wcmV2aWV3Q2hhbmdlZCgkZXZlbnQpXCJcbiAgICAoZHJhZ1N0YXJ0ZWQpPVwiZHJhZ1N0YXJ0ZWQuZW1pdCgkZXZlbnQpXCJcbiAgICAoZHJhZ0VuZGVkKT1cIl9kcmFnRW5kZWQoJGV2ZW50KVwiXG4gICAgKGtleXVwKT1cIl9oYW5kbGVDYWxlbmRhckJvZHlLZXl1cCgkZXZlbnQpXCJcbiAgICAoa2V5ZG93bik9XCJfaGFuZGxlQ2FsZW5kYXJCb2R5S2V5ZG93bigkZXZlbnQpXCJcbiAgPjwvdGJvZHk+XG48L3RhYmxlPlxuIl19