import * as i0 from '@angular/core';
import { InjectionToken, Provider, OnDestroy, FactoryProvider, OnChanges, AfterViewChecked, EventEmitter, SimpleChanges, AfterContentInit, ChangeDetectorRef, OnInit, AfterViewInit, ElementRef } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import * as i1 from '@angular/common';
import * as i2 from '@angular/cdk/overlay';
import { ScrollStrategy, Overlay } from '@angular/cdk/overlay';
import * as i3 from '@angular/cdk/a11y';
import * as i4 from '@angular/cdk/portal';
import { ComponentType, Portal } from '@angular/cdk/portal';
import * as i11 from '@angular/cdk/scrolling';
import { AnimationEvent } from '@angular/animations';
import { ControlValueAccessor, Validator, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/** InjectionToken for datepicker that can be used to override default locale code. */
declare const DATE_LOCALE: InjectionToken<any>;
/** @docs-private */
declare function DATE_LOCALE_FACTORY(): any;
/** Adapts type `D` to be usable as a date by cdk-based components that work with dates. */
declare abstract class DateAdapter<D, L = any> {
    /** The locale to use for all dates. */
    protected locale: L;
    protected readonly _localeChanges: Subject<void>;
    /** A stream that emits when the locale changes. */
    readonly localeChanges: Observable<void>;
    /**
     * Gets the year component of the given date.
     * @param date The date to extract the year from.
     * @returns The year component.
     */
    abstract getYear(date: D): number;
    /**
     * Gets the month component of the given date.
     * @param date The date to extract the month from.
     * @returns The month component (0-indexed, 0 = January).
     */
    abstract getMonth(date: D): number;
    /**
     * Gets the date of the month component of the given date.
     * @param date The date to extract the date of the month from.
     * @returns The month component (1-indexed, 1 = first of month).
     */
    abstract getDate(date: D): number;
    /**
     * Gets the day of the week component of the given date.
     * @param date The date to extract the day of the week from.
     * @returns The month component (0-indexed, 0 = Sunday).
     */
    abstract getDayOfWeek(date: D): number;
    /**
     * Gets a list of names for the months.
     * @param style The naming style (e.g. long = 'January', short = 'Jan', narrow = 'J').
     * @returns An ordered list of all month names, starting with January.
     */
    abstract getMonthNames(style: 'long' | 'short' | 'narrow'): string[];
    /**
     * Gets a list of names for the dates of the month.
     * @returns An ordered list of all date of the month names, starting with '1'.
     */
    abstract getDateNames(): string[];
    /**
     * Gets a list of names for the days of the week.
     * @param style The naming style (e.g. long = 'Sunday', short = 'Sun', narrow = 'S').
     * @returns An ordered list of all weekday names, starting with Sunday.
     */
    abstract getDayOfWeekNames(style: 'long' | 'short' | 'narrow'): string[];
    /**
     * Gets the name for the year of the given date.
     * @param date The date to get the year name for.
     * @returns The name of the given year (e.g. '2017').
     */
    abstract getYearName(date: D): string;
    /**
     * Gets the first day of the week.
     * @returns The first day of the week (0-indexed, 0 = Sunday).
     */
    abstract getFirstDayOfWeek(): number;
    /**
     * Gets the number of days in the month of the given date.
     * @param date The date whose month should be checked.
     * @returns The number of days in the month of the given date.
     */
    abstract getNumDaysInMonth(date: D): number;
    /**
     * Clones the given date.
     * @param date The date to clone
     * @returns A new date equal to the given date.
     */
    abstract clone(date: D): D;
    /**
     * Creates a date with the given year, month, and date. Does not allow over/under-flow of the
     * month and date.
     * @param year The full year of the date. (e.g. 89 means the year 89, not the year 1989).
     * @param month The month of the date (0-indexed, 0 = January). Must be an integer 0 - 11.
     * @param date The date of month of the date. Must be an integer 1 - length of the given month.
     * @returns The new date, or null if invalid.
     */
    abstract createDate(year: number, month: number, date: number): D;
    /**
     * Gets today's date.
     * @returns Today's date.
     */
    abstract today(): D;
    /**
     * Parses a date from a user-provided value.
     * @param value The value to parse.
     * @param parseFormat The expected format of the value being parsed
     *     (type is implementation-dependent).
     * @returns The parsed date.
     */
    abstract parse(value: any, parseFormat: any): D | null;
    /**
     * Formats a date as a string according to the given format.
     * @param date The value to format.
     * @param displayFormat The format to use to display the date as a string.
     * @returns The formatted date string.
     */
    abstract format(date: D, displayFormat: any): string;
    /**
     * Adds the given number of years to the date. Years are counted as if flipping 12 pages on the
     * calendar for each year and then finding the closest date in the new month. For example when
     * adding 1 year to Feb 29, 2016, the resulting date will be Feb 28, 2017.
     * @param date The date to add years to.
     * @param years The number of years to add (may be negative).
     * @returns A new date equal to the given one with the specified number of years added.
     */
    abstract addCalendarYears(date: D, years: number): D;
    /**
     * Adds the given number of months to the date. Months are counted as if flipping a page on the
     * calendar for each month and then finding the closest date in the new month. For example when
     * adding 1 month to Jan 31, 2017, the resulting date will be Feb 28, 2017.
     * @param date The date to add months to.
     * @param months The number of months to add (may be negative).
     * @returns A new date equal to the given one with the specified number of months added.
     */
    abstract addCalendarMonths(date: D, months: number): D;
    /**
     * Adds the given number of days to the date. Days are counted as if moving one cell on the
     * calendar for each day.
     * @param date The date to add days to.
     * @param days The number of days to add (may be negative).
     * @returns A new date equal to the given one with the specified number of days added.
     */
    abstract addCalendarDays(date: D, days: number): D;
    /**
     * Gets the RFC 3339 compatible string (https://tools.ietf.org/html/rfc3339) for the given date.
     * This method is used to generate date strings that are compatible with native HTML attributes
     * such as the `min` or `max` attribute of an `<input>`.
     * @param date The date to get the ISO date string for.
     * @returns The ISO date string date string.
     */
    abstract toIso8601(date: D): string;
    /**
     * Checks whether the given object is considered a date instance by this DateAdapter.
     * @param obj The object to check
     * @returns Whether the object is a date instance.
     */
    abstract isDateInstance(obj: any): boolean;
    /**
     * Checks whether the given date is valid.
     * @param date The date to check.
     * @returns Whether the date is valid.
     */
    abstract isValid(date: D): boolean;
    /**
     * Gets date instance that is not valid.
     * @returns An invalid date.
     */
    abstract invalid(): D;
    /**
     * Given a potential date object, returns that same date object if it is
     * a valid date, or `null` if it's not a valid date.
     * @param obj The object to check.
     * @returns A date or `null`.
     */
    getValidDateOrNull(obj: unknown): D | null;
    /**
     * Attempts to deserialize a value to a valid date object. This is different from parsing in that
     * deserialize should only accept non-ambiguous, locale-independent formats (e.g. a ISO 8601
     * string). The default implementation does not allow any deserialization, it simply checks that
     * the given value is already a valid date object or null. The `<datepicker>` will call this
     * method on all of its `@Input()` properties that accept dates. It is therefore possible to
     * support passing values from your backend directly to these properties by overriding this method
     * to also deserialize the format used by your backend.
     * @param value The value to be deserialized into a date object.
     * @returns The deserialized date object, either a valid date, null if the value can be
     *     deserialized into a null date (e.g. the empty string), or an invalid date.
     */
    deserialize(value: any): D | null;
    /**
     * Sets the locale used for all dates.
     * @param locale The new locale.
     */
    setLocale(locale: L): void;
    /**
     * Compares two dates.
     * @param first The first date to compare.
     * @param second The second date to compare.
     * @returns 0 if the dates are equal, a number less than 0 if the first date is earlier,
     *     a number greater than 0 if the first date is later.
     */
    compareDate(first: D, second: D): number;
    /**
     * Checks if two dates are equal.
     * @param first The first date to check.
     * @param second The second date to check.
     * @returns Whether the two dates are equal.
     *     Null dates are considered equal to other null dates.
     */
    sameDate(first: D | null, second: D | null): boolean;
    /**
     * Clamp the given date between min and max dates.
     * @param date The date to clamp.
     * @param min The minimum value to allow. If null or omitted no min is enforced.
     * @param max The maximum value to allow. If null or omitted no max is enforced.
     * @returns `min` if `date` is less than `min`, `max` if date is greater than `max`,
     *     otherwise `date`.
     */
    clampDate(date: D, min?: D | null, max?: D | null): D;
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

interface DateFormats {
    parse: {
        dateInput: any;
    };
    display: {
        dateInput: any;
        monthLabel?: any;
        monthYearLabel: any;
        dateA11yLabel: any;
        monthYearA11yLabel: any;
        dayMonthDateLabel: any;
    };
}
declare const DATE_FORMATS: InjectionToken<DateFormats>;

/** Adapts the native JS Date for use with cdk-based components that work with dates. */
declare class NativeDateAdapter extends DateAdapter<Date> {
    /**
     * @deprecated No longer being used. To be removed.
     * @breaking-change 14.0.0
     */
    useUtcForDisplay: boolean;
    /** The injected locale. */
    private readonly _dateLocale;
    constructor();
    getYear(date: Date): number;
    getMonth(date: Date): number;
    getDate(date: Date): number;
    getDayOfWeek(date: Date): number;
    getMonthNames(style: 'long' | 'short' | 'narrow'): string[];
    getDateNames(): string[];
    getDayOfWeekNames(style: 'long' | 'short' | 'narrow'): string[];
    getYearName(date: Date): string;
    getFirstDayOfWeek(): number;
    getNumDaysInMonth(date: Date): number;
    clone(date: Date): Date;
    createDate(year: number, month: number, date: number): Date;
    today(): Date;
    parse(value: any, parseFormat?: any): Date | null;
    format(date: Date, displayFormat: object): string;
    addCalendarYears(date: Date, years: number): Date;
    addCalendarMonths(date: Date, months: number): Date;
    addCalendarDays(date: Date, days: number): Date;
    toIso8601(date: Date): string;
    /**
     * Returns the given value if given a valid Date or null. Deserializes valid ISO 8601 strings
     * (https://www.ietf.org/rfc/rfc3339.txt) into valid Dates and empty string into null. Returns an
     * invalid date for all other values.
     */
    deserialize(value: any): Date | null;
    isDateInstance(obj: any): obj is Date;
    isValid(date: Date): boolean;
    invalid(): Date;
    /** Creates a date but allows the month and date to overflow. */
    private _createDateWithOverflow;
    /**
     * Pads a number to make it two digits.
     * @param n The number to pad.
     * @returns The padded number.
     */
    private _2digit;
    /**
     * When converting Date object to string, javascript built-in functions may return wrong
     * results because it applies its internal DST rules. The DST rules around the world change
     * very frequently, and the current valid rule is not always valid in previous years though.
     * We work around this problem building a new Date object which has its internal UTC
     * representation with the local date and time.
     * @param dtf Intl.DateTimeFormat object, containing the desired string format. It must have
     *    timeZone set to 'utc' to work fine.
     * @param date Date from which we want to get the string representation according to dtf
     * @returns A Date object with its UTC representation based on the passed in date info
     */
    private _format;
    static ɵfac: i0.ɵɵFactoryDeclaration<NativeDateAdapter, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<NativeDateAdapter>;
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

declare const NATIVE_DATE_FORMATS: DateFormats;

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

declare class NativeDateModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<NativeDateModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<NativeDateModule, never, never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<NativeDateModule>;
}
declare function provideNativeDateAdapter(formats?: DateFormats): Provider[];

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/** A class representing a range of dates. */
declare class DateRange<D> {
    /** The start date of the range. */
    readonly start: D | null;
    /** The end date of the range. */
    readonly end: D | null;
    /**
     * Ensures that objects with a `start` and `end` property can't be assigned to a variable that
     * expects a `DateRange`
     */
    private _disableStructuralEquivalency;
    constructor(
    /** The start date of the range. */
    start: D | null, 
    /** The end date of the range. */
    end: D | null);
}
/**
 * Conditionally picks the date type, if a DateRange is passed in.
 * @docs-private
 */
type ExtractDateTypeFromSelection<T> = T extends DateRange<infer D> ? D : NonNullable<T>;
/**
 * Event emitted by the date selection model when its selection changes.
 * @docs-private
 */
interface DateSelectionModelChange<S> {
    /** New value for the selection. */
    selection: S;
    /** Object that triggered the change. */
    source: unknown;
    /** Previous value */
    oldValue?: S;
}
/**
 * A selection model containing a date selection.
 * @docs-private
 */
declare abstract class DateSelectionModel<S, D = ExtractDateTypeFromSelection<S>> implements OnDestroy {
    readonly selection: S;
    protected _adapter: DateAdapter<D>;
    private readonly _selectionChanged;
    /** Emits when the selection has changed. */
    selectionChanged: Observable<DateSelectionModelChange<S>>;
    protected constructor(selection: S, adapter: DateAdapter<D>);
    /**
     * Updates the current selection in the model.
     * @param value New selection that should be assigned.
     * @param source Object that triggered the selection change.
     */
    updateSelection(value: S, source: unknown): void;
    ngOnDestroy(): void;
    protected _isValidDateInstance(date: D): boolean;
    /** Adds a date to the current selection. */
    abstract add(date: D | null): void;
    /** Checks whether the current selection is valid. */
    abstract isValid(): boolean;
    /** Checks whether the current selection is complete. */
    abstract isComplete(): boolean;
    /** Clones the selection model. */
    abstract clone(): DateSelectionModel<S, D>;
    static ɵfac: i0.ɵɵFactoryDeclaration<DateSelectionModel<any, any>, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<DateSelectionModel<any, any>>;
}
/**
 * A selection model that contains a single date.
 * @docs-private
 */
declare class SingleDateSelectionModel<D> extends DateSelectionModel<D | null, D> {
    constructor(adapter?: DateAdapter<D>);
    /**
     * Adds a date to the current selection. In the case of a single date selection, the added date
     * simply overwrites the previous selection
     */
    add(date: D | null): void;
    /** Checks whether the current selection is valid. */
    isValid(): boolean;
    /**
     * Checks whether the current selection is complete. In the case of a single date selection, this
     * is true if the current selection is not null.
     */
    isComplete(): boolean;
    /** Clones the selection model. */
    clone(): SingleDateSelectionModel<D>;
    static ɵfac: i0.ɵɵFactoryDeclaration<SingleDateSelectionModel<any>, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<SingleDateSelectionModel<any>>;
}
/** @docs-private */
declare function SINGLE_DATE_SELECTION_MODEL_FACTORY(parent: SingleDateSelectionModel<unknown>, adapter: DateAdapter<unknown>): SingleDateSelectionModel<unknown>;
/**
 * Used to provide a single selection model to a component.
 * @docs-private
 */
declare const SINGLE_DATE_SELECTION_MODEL_PROVIDER: FactoryProvider;

/** Extra CSS classes that can be associated with a calendar cell. */
type CalendarCellCssClasses = string | string[] | Set<string> | Record<string, any>;
/** Function that can generate the extra classes that should be added to a calendar cell. */
type CalendarCellClassFunction<D> = (date: D, view: 'month' | 'year' | 'multi-year') => CalendarCellCssClasses;
/**
 * An internal class that represents the data corresponding to a single calendar cell.
 * @docs-private
 */
declare class CalendarCell<D = any> {
    value: number;
    displayValue: string;
    ariaLabel: string;
    enabled: boolean;
    cssClasses: CalendarCellCssClasses;
    compareValue: number;
    rawValue?: D | undefined;
    constructor(value: number, displayValue: string, ariaLabel: string, enabled: boolean, cssClasses?: CalendarCellCssClasses, compareValue?: number, rawValue?: D | undefined);
}
/** Event emitted when a date inside the calendar is triggered as a result of a user action. */
interface CalendarUserEvent<D> {
    value: D;
    event: Event;
}
/**
 * An internal component used to display calendar data in a table.
 * @docs-private
 */
declare class CalendarBody<D = any> implements OnChanges, OnDestroy, AfterViewChecked {
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
    constructor();
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
    static ɵcmp: i0.ɵɵComponentDeclaration<CalendarBody<any>, "[calendar-body]", ["calendarBody"], { "label": { "alias": "label"; "required": false; }; "rows": { "alias": "rows"; "required": false; }; "todayValue": { "alias": "todayValue"; "required": false; }; "startValue": { "alias": "startValue"; "required": false; }; "endValue": { "alias": "endValue"; "required": false; }; "labelMinRequiredCells": { "alias": "labelMinRequiredCells"; "required": false; }; "numCols": { "alias": "numCols"; "required": false; }; "activeCell": { "alias": "activeCell"; "required": false; }; "isRange": { "alias": "isRange"; "required": false; }; "cellAspectRatio": { "alias": "cellAspectRatio"; "required": false; }; "comparisonStart": { "alias": "comparisonStart"; "required": false; }; "comparisonEnd": { "alias": "comparisonEnd"; "required": false; }; "previewStart": { "alias": "previewStart"; "required": false; }; "previewEnd": { "alias": "previewEnd"; "required": false; }; "startDateAccessibleName": { "alias": "startDateAccessibleName"; "required": false; }; "endDateAccessibleName": { "alias": "endDateAccessibleName"; "required": false; }; }, { "selectedValueChange": "selectedValueChange"; "previewChange": "previewChange"; "activeDateChange": "activeDateChange"; "dragStarted": "dragStarted"; "dragEnded": "dragEnded"; }, never, never, true, never>;
}

/**
 * An internal component used to display a single month in the datepicker.
 * @docs-private
 */
declare class MonthView<D> implements AfterContentInit, OnChanges, OnDestroy {
    readonly _changeDetectorRef: ChangeDetectorRef;
    private _dateFormats;
    _dateAdapter: DateAdapter<D>;
    private _dir;
    private _rerenderSubscription;
    /** Flag used to filter out space/enter keyup events that originated outside of the view. */
    private _selectionKeyPressed;
    /**
     * The date to display in this month view (everything other than the month and year is ignored).
     */
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
    /** Function used to filter which dates are selectable. */
    dateFilter: (date: D) => boolean;
    /** Function that can be used to add custom CSS classes to dates. */
    dateClass: CalendarCellClassFunction<D>;
    /** Start of the comparison range. */
    comparisonStart: D | null;
    /** End of the comparison range. */
    comparisonEnd: D | null;
    /** ARIA Accessible name of the `<input startDate/>` */
    startDateAccessibleName: string | null;
    /** ARIA Accessible name of the `<input endDate/>` */
    endDateAccessibleName: string | null;
    /** Origin of active drag, or null when dragging is not active. */
    activeDrag: CalendarUserEvent<D> | null;
    /** Emits when a new date is selected. */
    readonly selectedChange: EventEmitter<D | null>;
    /** Emits when any date is selected. */
    readonly _userSelection: EventEmitter<CalendarUserEvent<D | null>>;
    /** Emits when the user initiates a date range drag via mouse or touch. */
    readonly dragStarted: EventEmitter<CalendarUserEvent<D>>;
    /**
     * Emits when the user completes or cancels a date range drag.
     * Emits null when the drag was canceled or the newly selected date range if completed.
     */
    readonly dragEnded: EventEmitter<CalendarUserEvent<DateRange<D> | null>>;
    /** Emits when any date is activated. */
    readonly activeDateChange: EventEmitter<D>;
    /** The body of calendar table */
    _calendarBody: CalendarBody;
    /** The label for this month (e.g. "January 2017"). */
    _monthLabel: string;
    /** Grid of calendar cells representing the dates of the month. */
    _weeks: CalendarCell[][];
    /** The number of blank cells in the first row before the 1st of the month. */
    _firstWeekOffset: number;
    /** Start value of the currently-shown date range. */
    _rangeStart: number | null;
    /** End value of the currently-shown date range. */
    _rangeEnd: number | null;
    /** Start value of the currently-shown comparison date range. */
    _comparisonRangeStart: number | null;
    /** End value of the currently-shown comparison date range. */
    _comparisonRangeEnd: number | null;
    /** Start of the preview range. */
    _previewStart: number | null;
    /** End of the preview range. */
    _previewEnd: number | null;
    /** Whether the user is currently selecting a range of dates. */
    _isRange: boolean;
    /** The date of the month that today falls on. Null if today is in another month. */
    _todayDate: number | null;
    /** The names of the weekdays. */
    _weekdays: {
        long: string;
        narrow: string;
    }[];
    constructor();
    ngAfterContentInit(): void;
    ngOnChanges(changes: SimpleChanges): void;
    ngOnDestroy(): void;
    /** Handles when a new date is selected. */
    _dateSelected(event: CalendarUserEvent<number>): void;
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
    /** Handles keydown events on the calendar body when calendar is in month view. */
    _handleCalendarBodyKeydown(event: KeyboardEvent): void;
    /** Handles keyup events on the calendar body when calendar is in month view. */
    _handleCalendarBodyKeyup(event: KeyboardEvent): void;
    /** Initializes this month view. */
    _init(): void;
    /** Focuses the active cell after the microtask queue is empty. */
    _focusActiveCell(movePreview?: boolean): void;
    /** Focuses the active cell after change detection has run and the microtask queue is empty. */
    _focusActiveCellAfterViewChecked(): void;
    /** Called when the user has activated a new cell and the preview needs to be updated. */
    _previewChanged({ event, value: cell }: CalendarUserEvent<CalendarCell<D> | null>): void;
    /**
     * Called when the user has ended a drag. If the drag/drop was successful,
     * computes and emits the new range selection.
     */
    protected _dragEnded(event: CalendarUserEvent<D | null>): void;
    /**
     * Takes a day of the month and returns a new date in the same month and year as the currently
     *  active date. The returned date will have the same day of the month as the argument date.
     */
    private _getDateFromDayOfMonth;
    /** Initializes the weekdays. */
    private _initWeekdays;
    /** Creates CalendarCells for the dates in this month. */
    private _createWeekCells;
    /** Date filter for the month */
    private _shouldEnableDate;
    /**
     * Gets the date in this month that the given Date falls on.
     * Returns null if the given Date is in another month.
     */
    private _getDateInCurrentMonth;
    /** Checks whether the 2 dates are non-null and fall within the same month of the same year. */
    private _hasSameMonthAndYear;
    /** Gets the value that will be used to one cell to another. */
    private _getCellCompareValue;
    /** Determines whether the user has the RTL layout direction. */
    private _isRtl;
    /** Sets the current range based on a model value. */
    private _setRanges;
    /** Gets whether a date can be selected in the month view. */
    private _canSelect;
    /** Clears out preview state. */
    private _clearPreview;
    static ɵfac: i0.ɵɵFactoryDeclaration<MonthView<any>, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MonthView<any>, "month-view", ["monthView"], { "activeDate": { "alias": "activeDate"; "required": false; }; "selected": { "alias": "selected"; "required": false; }; "minDate": { "alias": "minDate"; "required": false; }; "maxDate": { "alias": "maxDate"; "required": false; }; "dateFilter": { "alias": "dateFilter"; "required": false; }; "dateClass": { "alias": "dateClass"; "required": false; }; "comparisonStart": { "alias": "comparisonStart"; "required": false; }; "comparisonEnd": { "alias": "comparisonEnd"; "required": false; }; "startDateAccessibleName": { "alias": "startDateAccessibleName"; "required": false; }; "endDateAccessibleName": { "alias": "endDateAccessibleName"; "required": false; }; "activeDrag": { "alias": "activeDrag"; "required": false; }; }, { "selectedChange": "selectedChange"; "_userSelection": "_userSelection"; "dragStarted": "dragStarted"; "dragEnded": "dragEnded"; "activeDateChange": "activeDateChange"; }, never, never, true, never>;
}

declare const yearsPerPage = 24;
declare const yearsPerRow = 4;
/**
 * An internal component used to display a year selector in the datepicker.
 * @docs-private
 */
declare class MultiYearView<D> implements AfterContentInit, OnDestroy {
    private _changeDetectorRef;
    _dateAdapter: DateAdapter<D>;
    private _dir;
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
    constructor();
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
    static ɵfac: i0.ɵɵFactoryDeclaration<MultiYearView<any>, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MultiYearView<any>, "multi-year-view", ["multiYearView"], { "activeDate": { "alias": "activeDate"; "required": false; }; "selected": { "alias": "selected"; "required": false; }; "minDate": { "alias": "minDate"; "required": false; }; "maxDate": { "alias": "maxDate"; "required": false; }; "dateFilter": { "alias": "dateFilter"; "required": false; }; "dateClass": { "alias": "dateClass"; "required": false; }; }, { "selectedChange": "selectedChange"; "yearSelected": "yearSelected"; "activeDateChange": "activeDateChange"; }, never, never, true, never>;
}

/**
 * An internal component used to display a single year in the datepicker.
 * @docs-private
 */
declare class YearView<D> implements AfterContentInit, OnDestroy {
    readonly _changeDetectorRef: ChangeDetectorRef;
    private _dateFormats;
    _dateAdapter: DateAdapter<D>;
    private _dir;
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
    constructor();
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
    static ɵfac: i0.ɵɵFactoryDeclaration<YearView<any>, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<YearView<any>, "year-view", ["yearView"], { "activeDate": { "alias": "activeDate"; "required": false; }; "selected": { "alias": "selected"; "required": false; }; "minDate": { "alias": "minDate"; "required": false; }; "maxDate": { "alias": "maxDate"; "required": false; }; "dateFilter": { "alias": "dateFilter"; "required": false; }; "dateClass": { "alias": "dateClass"; "required": false; }; }, { "selectedChange": "selectedChange"; "monthSelected": "monthSelected"; "activeDateChange": "activeDateChange"; }, never, never, true, never>;
}

/**
 * Possible views for the calendar.
 * @docs-private
 */
type CalendarView = 'month' | 'year' | 'multi-year';
/** A calendar that is used as part of the datepicker. */
declare class Calendar<D> implements AfterContentInit, AfterViewChecked, OnDestroy, OnChanges {
    private _dateAdapter;
    private _dateFormats;
    private _changeDetectorRef;
    /** An input indicating the type of the header component, if set. */
    headerComponent: ComponentType<any>;
    /** A portal containing the header component type for this calendar. */
    _calendarHeaderPortal: Portal<any>;
    /**
     * Used for scheduling that focus should be moved to the active cell on the next tick.
     * We need to schedule it, rather than do it immediately, because we have to wait
     * for Angular to re-evaluate the view children.
     */
    private _moveFocusOnNextTick;
    /** A date representing the period (month or year) to start the calendar in. */
    get startAt(): D | null;
    set startAt(value: D | null);
    private _startAt;
    /** Whether the calendar should be started in month or year view. */
    startView: CalendarView;
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
    /** Function used to filter which dates are selectable. */
    dateFilter: (date: D) => boolean;
    /** Function that can be used to add custom CSS classes to dates. */
    dateClass: CalendarCellClassFunction<D>;
    /** Start of the comparison range. */
    comparisonStart: D | null;
    /** End of the comparison range. */
    comparisonEnd: D | null;
    /** ARIA Accessible name of the `<input startDate/>` */
    startDateAccessibleName: string | null;
    /** ARIA Accessible name of the `<input endDate/>` */
    endDateAccessibleName: string | null;
    /** Emits when the currently selected date changes. */
    readonly selectedChange: EventEmitter<D | null>;
    /**
     * Emits the year chosen in multiyear view.
     * This doesn't imply a change on the selected date.
     */
    readonly yearSelected: EventEmitter<D>;
    /**
     * Emits the month chosen in year view.
     * This doesn't imply a change on the selected date.
     */
    readonly monthSelected: EventEmitter<D>;
    /**
     * Emits when the current view changes.
     */
    readonly viewChanged: EventEmitter<CalendarView>;
    /** Emits when any date is selected. */
    readonly _userSelection: EventEmitter<CalendarUserEvent<D | null>>;
    /** Emits a new date range value when the user completes a drag drop operation. */
    readonly _userDragDrop: EventEmitter<CalendarUserEvent<DateRange<D>>>;
    /** Reference to the current month view component. */
    monthView: MonthView<D>;
    /** Reference to the current year view component. */
    yearView: YearView<D>;
    /** Reference to the current multi-year view component. */
    multiYearView: MultiYearView<D>;
    /**
     * The current active date. This determines which time period is shown and which date is
     * highlighted when using keyboard navigation.
     */
    get activeDate(): D;
    set activeDate(value: D);
    private _clampedActiveDate;
    /** Whether the calendar is in month view. */
    get currentView(): CalendarView;
    set currentView(value: CalendarView);
    private _currentView;
    /** Origin of active drag, or null when dragging is not active. */
    protected _activeDrag: CalendarUserEvent<D> | null;
    /**
     * Emits whenever there is a state change that the header may need to respond to.
     */
    readonly stateChanges: Subject<void>;
    constructor();
    ngAfterContentInit(): void;
    ngAfterViewChecked(): void;
    ngOnDestroy(): void;
    ngOnChanges(changes: SimpleChanges): void;
    /** Focuses the active date. */
    focusActiveCell(): void;
    /** Updates today's date after an update of the active date */
    updateTodaysDate(): void;
    /** Handles date selection in the month view. */
    _dateSelected(event: CalendarUserEvent<D | null>): void;
    /** Handles year selection in the multiyear view. */
    _yearSelectedInMultiYearView(normalizedYear: D): void;
    /** Handles month selection in the year view. */
    _monthSelectedInYearView(normalizedMonth: D): void;
    /** Handles year/month selection in the multi-year/year views. */
    _goToDateInView(date: D, view: 'month' | 'year' | 'multi-year'): void;
    /** Called when the user starts dragging to change a date range. */
    _dragStarted(event: CalendarUserEvent<D>): void;
    /**
     * Called when a drag completes. It may end in cancelation or in the selection
     * of a new range.
     */
    _dragEnded(event: CalendarUserEvent<DateRange<D> | null>): void;
    /** Returns the component instance that corresponds to the current calendar view. */
    private _getCurrentViewComponent;
    static ɵfac: i0.ɵɵFactoryDeclaration<Calendar<any>, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<Calendar<any>, "calendar", ["calendar"], { "headerComponent": { "alias": "headerComponent"; "required": false; }; "startAt": { "alias": "startAt"; "required": false; }; "startView": { "alias": "startView"; "required": false; }; "selected": { "alias": "selected"; "required": false; }; "minDate": { "alias": "minDate"; "required": false; }; "maxDate": { "alias": "maxDate"; "required": false; }; "dateFilter": { "alias": "dateFilter"; "required": false; }; "dateClass": { "alias": "dateClass"; "required": false; }; "comparisonStart": { "alias": "comparisonStart"; "required": false; }; "comparisonEnd": { "alias": "comparisonEnd"; "required": false; }; "startDateAccessibleName": { "alias": "startDateAccessibleName"; "required": false; }; "endDateAccessibleName": { "alias": "endDateAccessibleName"; "required": false; }; }, { "selectedChange": "selectedChange"; "yearSelected": "yearSelected"; "monthSelected": "monthSelected"; "viewChanged": "viewChanged"; "_userSelection": "_userSelection"; "_userDragDrop": "_userDragDrop"; }, never, never, true, never>;
}

/** Default header for MatCalendar */
declare class CalendarHeader<D> {
    calendar: Calendar<D>;
    private _dateAdapter;
    private _dateFormats;
    constructor();
    /** The display text for the current calendar view. */
    get periodButtonText(): string;
    /** The aria description for the current calendar view. */
    get periodButtonDescription(): string;
    /** The `aria-label` for changing the calendar view. */
    get periodButtonLabel(): string;
    /** The label for the previous button. */
    get prevButtonLabel(): string;
    /** The label for the next button. */
    get nextButtonLabel(): string;
    /** Handles user clicks on the period label. */
    currentPeriodClicked(): void;
    /** Handles user clicks on the previous button. */
    previousClicked(): void;
    /** Handles user clicks on the next button. */
    nextClicked(): void;
    /** Whether the previous period button is enabled. */
    previousEnabled(): boolean;
    /** Whether the next period button is enabled. */
    nextEnabled(): boolean;
    /** Whether the two dates represent the same view in the current view mode (month or year). */
    private _isSameView;
    /**
     * Format two individual labels for the minimum year and maximum year available in the multi-year
     * calendar view. Returns an array of two strings where the first string is the formatted label
     * for the minimum year, and the second string is the formatted label for the maximum year.
     */
    private _formatMinAndMaxYearLabels;
    private _id;
    _periodButtonLabelId: string;
    static ɵfac: i0.ɵɵFactoryDeclaration<CalendarHeader<any>, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<CalendarHeader<any>, "calendar-header", ["calendarHeader"], {}, {}, never, ["*"], true, never>;
}

declare class CalendarModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<CalendarModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<CalendarModule, never, [typeof i1.CommonModule, typeof i2.OverlayModule, typeof i3.A11yModule, typeof i4.PortalModule, typeof Calendar, typeof CalendarBody, typeof MonthView, typeof YearView, typeof MultiYearView, typeof CalendarHeader], [typeof i11.CdkScrollableModule, typeof Calendar, typeof CalendarBody, typeof MonthView, typeof YearView, typeof MultiYearView, typeof CalendarHeader]>;
    static ɵinj: i0.ɵɵInjectorDeclaration<CalendarModule>;
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Component used as the content for the datepicker overlay. We use this instead of using
 * Calendar directly as the content so we can control the initial focus. This also gives us a
 * place to put additional features of the overlay that are not part of the calendar itself in the
 * future. (e.g. confirmation buttons).
 * @docs-private
 */
declare class DatepickerContent<S, D = ExtractDateTypeFromSelection<S>> implements OnInit, AfterViewInit, OnDestroy {
    protected _elementRef: ElementRef<any>;
    private _changeDetectorRef;
    private _globalModel;
    private _dateAdapter;
    private _dateFormats;
    private _subscriptions;
    private _model;
    /** Reference to the internal calendar component. */
    _calendar: Calendar<D>;
    /** Reference to the datepicker that created the overlay. */
    datepicker: DatepickerBase<any, S, D>;
    /** Start of the comparison range. */
    comparisonStart: D | null;
    /** End of the comparison range. */
    comparisonEnd: D | null;
    /** ARIA Accessible name of the `<input startDate/>` */
    startDateAccessibleName: string | null;
    /** ARIA Accessible name of the `<input endDate/>` */
    endDateAccessibleName: string | null;
    /** Whether the datepicker is above or below the input. */
    _isAbove: boolean;
    /** Current state of the animation. */
    _animationState: 'enter-dropdown' | 'enter-dialog' | 'void';
    /** Emits when an animation has finished. */
    readonly _animationDone: Subject<void>;
    /** Whether there is an in-progress animation. */
    _isAnimating: boolean;
    /** Whether the close button currently has focus. */
    _closeButtonFocused: boolean;
    /** Id of the label for the `role="dialog"` element. */
    _dialogLabelId: string | null;
    ngOnInit(): void;
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
    _handleUserSelection(event: CalendarUserEvent<D | null>): void;
    _handleUserDragDrop(event: CalendarUserEvent<DateRange<D>>): void;
    _startExitAnimation(): void;
    _handleAnimationEvent(event: AnimationEvent): void;
    _getSelected(): D | DateRange<D> | null;
    _getSelectedDisplay(): string;
    /** Applies the current pending selection to the global model. */
    _applyPendingSelection(): void;
    /**
     * @param forceRerender
     */
    _assignModel(forceRerender: boolean): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<DatepickerContent<any, any>, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<DatepickerContent<any, any>, "datepicker-content", ["datepickerContent"], {}, {}, never, never, true, never>;
}

/**
 * An event used for datepicker input and change events. We don't always have access to a native
 * input or change event because the event may have been triggered by the user clicking on the
 * calendar popup. For consistency, we always use datepickerInputEvent instead.
 */
declare class DatepickerInputEvent<D, S = unknown> {
    /** Reference to the datepicker input component that emitted the event. */
    target: DatepickerInputBase<S, D>;
    /** Reference to the native input element associated with the datepicker input. */
    targetElement: HTMLElement;
    /** The new value for the target datepicker input. */
    value: D | null;
    constructor(
    /** Reference to the datepicker input component that emitted the event. */
    target: DatepickerInputBase<S, D>, 
    /** Reference to the native input element associated with the datepicker input. */
    targetElement: HTMLElement);
}
/** Function that can be used to filter out dates from a calendar. */
type DateFilterFn<D> = (date: D | null) => boolean;
/** Base class for datepicker inputs. */
declare abstract class DatepickerInputBase<S, D = ExtractDateTypeFromSelection<S>> implements ControlValueAccessor, AfterViewInit, OnChanges, OnDestroy, Validator {
    protected _elementRef: ElementRef<HTMLInputElement>;
    _dateAdapter: DateAdapter<D>;
    private _dateFormats;
    /** Whether the component has been initialized. */
    private _isInitialized;
    /** The value of the input. */
    get value(): D | null;
    set value(value: any);
    protected _model: DateSelectionModel<S, D> | undefined;
    /** Whether the datepicker-input is disabled. */
    get disabled(): boolean;
    set disabled(value: boolean);
    private _disabled;
    /** Emits when a `change` event is fired on this `<input>`. */
    readonly dateChange: EventEmitter<DatepickerInputEvent<D, S>>;
    /** Emits when an `input` event is fired on this `<input>`. */
    readonly dateInput: EventEmitter<DatepickerInputEvent<D, S>>;
    /** Emits when the internal state has changed */
    readonly stateChanges: Subject<void>;
    _onTouched: () => void;
    _validatorOnChange: () => void;
    private _cvaOnChange;
    private _valueChangesSubscription;
    private _localeSubscription;
    private _translocoSubscription;
    /**
     * Since the value is kept on the model which is assigned in an Input,
     * we might get a value before we have a model. This property keeps track
     * of the value until we have somewhere to assign it.
     */
    private _pendingValue;
    /** The form control validator for whether the input parses. */
    private _parseValidator;
    /** The form control validator for the date filter. */
    private _filterValidator;
    /** The form control validator for the min date. */
    private _minValidator;
    /** The form control validator for the max date. */
    private _maxValidator;
    /** Gets the base validator functions. */
    protected _getValidators(): ValidatorFn[];
    /** Gets the minimum date for the input. Used for validation. */
    abstract _getMinDate(): D | null;
    /** Gets the maximum date for the input. Used for validation. */
    abstract _getMaxDate(): D | null;
    /** Gets the date filter function. Used for validation. */
    protected abstract _getDateFilter(): DateFilterFn<D> | undefined;
    /** Registers a date selection model with the input. */
    _registerModel(model: DateSelectionModel<S, D>): void;
    /** Opens the popup associated with the input. */
    protected abstract _openPopup(): void;
    /** Assigns a value to the input's model. */
    protected abstract _assignValueToModel(model: D | null): void;
    /** Converts a value from the model into a native value for the input. */
    protected abstract _getValueFromModel(modelValue: S): D | null;
    /** Combined form control validator for this input. */
    protected abstract _validator: ValidatorFn | null;
    /** Predicate that determines whether the input should handle a particular change event. */
    protected abstract _shouldHandleChangeEvent(event: DateSelectionModelChange<S>): boolean;
    /** Whether the last value set on the input was valid. */
    protected _lastValueValid: boolean;
    constructor();
    ngAfterViewInit(): void;
    ngOnChanges(changes: SimpleChanges): void;
    ngOnDestroy(): void;
    /** @docs-private */
    registerOnValidatorChange(fn: () => void): void;
    /** @docs-private */
    validate(c: AbstractControl): ValidationErrors | null;
    writeValue(value: D): void;
    registerOnChange(fn: (value: any) => void): void;
    registerOnTouched(fn: () => void): void;
    setDisabledState(isDisabled: boolean): void;
    _onKeydown(event: KeyboardEvent): void;
    _onInput(value: string): void;
    _onChange(): void;
    /** Handles blur events on the input. */
    _onBlur(): void;
    /** Formats a value and sets it on the input element. */
    protected _formatValue(value: D | null): void;
    /** Assigns a value to the model. */
    private _assignValue;
    /** Whether a value is considered valid. */
    private _isValidValue;
    /**
     * Checks whether a parent control is disabled. This is in place so that it can be overridden
     * by inputs extending this one which can be placed inside of a group that can be disabled.
     */
    protected _parentDisabled(): boolean;
    /** Programmatically assigns a value to the input. */
    protected _assignValueProgrammatically(value: D | null): void;
    /** Gets whether a value matches the current date filter. */
    _matchesFilter(value: D | null): boolean;
    static ɵfac: i0.ɵɵFactoryDeclaration<DatepickerInputBase<any, any>, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<DatepickerInputBase<any, any>, never, never, { "value": { "alias": "value"; "required": false; }; "disabled": { "alias": "disabled"; "required": false; }; }, { "dateChange": "dateChange"; "dateInput": "dateInput"; }, never, never, true, never>;
    static ngAcceptInputType_disabled: unknown;
}

/** Injection token that determines the scroll handling while the calendar is open. */
declare const DATEPICKER_SCROLL_STRATEGY: InjectionToken<() => ScrollStrategy>;
/** @docs-private */
declare function DATEPICKER_SCROLL_STRATEGY_FACTORY(overlay: Overlay): () => ScrollStrategy;
/** Possible positions for the datepicker dropdown along the X axis. */
type DatepickerDropdownPositionX = 'start' | 'end';
/** Possible positions for the datepicker dropdown along the Y axis. */
type DatepickerDropdownPositionY = 'above' | 'below';
/** @docs-private */
declare const DATEPICKER_SCROLL_STRATEGY_FACTORY_PROVIDER: {
    provide: InjectionToken<() => ScrollStrategy>;
    deps: (typeof Overlay)[];
    useFactory: typeof DATEPICKER_SCROLL_STRATEGY_FACTORY;
};
/** Form control that can be associated with a datepicker. */
interface DatepickerControl<D> {
    getStartValue(): D | null;
    min: D | null;
    max: D | null;
    disabled: boolean;
    dateFilter: DateFilterFn<D>;
    getConnectedOverlayOrigin(): ElementRef;
    getOverlayLabelId(): string | null;
    stateChanges: Observable<void>;
}
/** A datepicker that can be attached to a {@link DatepickerControl}. */
interface DatepickerPanel<C extends DatepickerControl<D>, S, D = ExtractDateTypeFromSelection<S>> {
    /** Stream that emits whenever the date picker is closed. */
    closedStream: EventEmitter<void>;
    /** The input element the datepicker is associated with. */
    datepickerInput: C;
    /** Whether the datepicker pop-up should be disabled. */
    disabled: boolean;
    /** The id for the datepicker's calendar. */
    id: string;
    /** Whether the datepicker is open. */
    opened: boolean;
    /** Stream that emits whenever the date picker is opened. */
    openedStream: EventEmitter<void>;
    /** Emits when the datepicker's state changes. */
    stateChanges: Subject<void>;
    /** Opens the datepicker. */
    open(): void;
    /** Register an input with the datepicker. */
    registerInput(input: C): DateSelectionModel<S, D>;
}
/** Base class for a datepicker. */
declare abstract class DatepickerBase<C extends DatepickerControl<D>, S, D = ExtractDateTypeFromSelection<S>> implements DatepickerPanel<C, S, D>, OnDestroy, OnChanges {
    private _overlay;
    private _ngZone;
    private _viewContainerRef;
    private _dateAdapter;
    private _dir;
    private _model;
    private _scrollStrategy;
    private _inputStateChanges;
    private _document;
    /** An input indicating the type of the custom header component for the calendar, if set. */
    calendarHeaderComponent: ComponentType<any>;
    /** The date to open the calendar to initially. */
    get startAt(): D | null;
    set startAt(value: D | null);
    private _startAt;
    /** The view that the calendar should start in. */
    startView: 'month' | 'year' | 'multi-year';
    /**
     * Whether the calendar UI is in touch mode. In touch mode the calendar opens in a dialog rather
     * than a dropdown and elements have more padding to allow for bigger touch targets.
     */
    touchUi: boolean;
    /** Whether the datepicker pop-up should be disabled. */
    get disabled(): boolean;
    set disabled(value: boolean);
    private _disabled;
    /** Preferred position of the datepicker in the X axis. */
    xPosition: DatepickerDropdownPositionX;
    /** Preferred position of the datepicker in the Y axis. */
    yPosition: DatepickerDropdownPositionY;
    /**
     * Whether to restore focus to the previously-focused element when the calendar is closed.
     * Note that automatic focus restoration is an accessibility feature and it is recommended that
     * you provide your own equivalent, if you decide to turn it off.
     */
    restoreFocus: boolean;
    /**
     * Emits selected year in multiyear view.
     * This doesn't imply a change on the selected date.
     */
    readonly yearSelected: EventEmitter<D>;
    /**
     * Emits selected month in year view.
     * This doesn't imply a change on the selected date.
     */
    readonly monthSelected: EventEmitter<D>;
    /**
     * Emits when the current view changes.
     */
    readonly viewChanged: EventEmitter<CalendarView>;
    /** Function that can be used to add custom CSS classes to dates. */
    dateClass: CalendarCellClassFunction<D>;
    /** Emits when the datepicker has been opened. */
    readonly openedStream: EventEmitter<void>;
    /** Emits when the datepicker has been closed. */
    readonly closedStream: EventEmitter<void>;
    /**
     * Classes to be passed to the date picker panel.
     * Supports string and string array values, similar to `ngClass`.
     */
    get panelClass(): string | string[];
    set panelClass(value: string | string[]);
    private _panelClass;
    /** Whether the calendar is open. */
    get opened(): boolean;
    set opened(value: boolean);
    private _opened;
    /** The id for the datepicker calendar. */
    id: string;
    /** The minimum selectable date. */
    _getMinDate(): D | null;
    /** The maximum selectable date. */
    _getMaxDate(): D | null;
    _getDateFilter(): DateFilterFn<D>;
    /** A reference to the overlay into which we've rendered the calendar. */
    private _overlayRef;
    /** Reference to the component instance rendered in the overlay. */
    private _componentRef;
    /** The element that was focused before the datepicker was opened. */
    private _focusedElementBeforeOpen;
    /** Unique class that will be added to the backdrop so that the test harnesses can look it up. */
    private _backdropHarnessClass;
    /** The input element this datepicker is associated with. */
    datepickerInput: C;
    /** Emits when the datepicker's state changes. */
    readonly stateChanges: Subject<void>;
    constructor();
    ngOnChanges(changes: SimpleChanges): void;
    ngOnDestroy(): void;
    /** Selects the given date */
    select(date: D): void;
    /** Emits the selected year in multiyear view */
    _selectYear(normalizedYear: D): void;
    /** Emits selected month in year view */
    _selectMonth(normalizedMonth: D): void;
    /** Emits changed view */
    _viewChanged(view: CalendarView): void;
    /**
     * Register an input with this datepicker.
     * @param input The datepicker input to register with this datepicker.
     * @returns Selection model that the input should hook itself up to.
     */
    registerInput(input: C): DateSelectionModel<S, D>;
    /** Open the calendar. */
    open(): void;
    /** Close the calendar. */
    close(): void;
    apply(): void;
    /** Applies the current pending selection on the overlay to the model. */
    _applyPendingSelection(): void;
    /** Forwards relevant values from the datepicker to the datepicker content inside the overlay. */
    protected _forwardContentValues(instance: DatepickerContent<S, D>): void;
    /** Opens the overlay with the calendar. */
    private _openOverlay;
    /** Destroys the current overlay. */
    private _destroyOverlay;
    /** Gets a position strategy that will open the calendar as a dropdown. */
    private _getDialogStrategy;
    /** Gets a position strategy that will open the calendar as a dropdown. */
    private _getDropdownStrategy;
    /** Sets the positions of the datepicker in dropdown mode based on the current configuration. */
    private _setConnectedPositions;
    /** Gets an observable that will emit when the overlay is supposed to be closed. */
    private _getCloseStream;
    static ɵfac: i0.ɵɵFactoryDeclaration<DatepickerBase<any, any, any>, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<DatepickerBase<any, any, any>, never, never, { "calendarHeaderComponent": { "alias": "calendarHeaderComponent"; "required": false; }; "startAt": { "alias": "startAt"; "required": false; }; "startView": { "alias": "startView"; "required": false; }; "touchUi": { "alias": "touchUi"; "required": false; }; "disabled": { "alias": "disabled"; "required": false; }; "xPosition": { "alias": "xPosition"; "required": false; }; "yPosition": { "alias": "yPosition"; "required": false; }; "restoreFocus": { "alias": "restoreFocus"; "required": false; }; "dateClass": { "alias": "dateClass"; "required": false; }; "panelClass": { "alias": "panelClass"; "required": false; }; "opened": { "alias": "opened"; "required": false; }; }, { "yearSelected": "yearSelected"; "monthSelected": "monthSelected"; "viewChanged": "viewChanged"; "openedStream": "opened"; "closedStream": "closed"; }, never, never, true, never>;
    static ngAcceptInputType_touchUi: unknown;
    static ngAcceptInputType_disabled: unknown;
    static ngAcceptInputType_restoreFocus: unknown;
    static ngAcceptInputType_opened: unknown;
}

declare class Datepicker<D> extends DatepickerBase<DatepickerControl<D>, D | null, D> {
    static ɵfac: i0.ɵɵFactoryDeclaration<Datepicker<any>, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<Datepicker<any>, "date-picker", ["datepicker"], {}, {}, never, never, true, never>;
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/** @docs-private */
declare const DATEPICKER_VALUE_ACCESSOR: any;
/** @docs-private */
declare const DATEPICKER_VALIDATORS: any;
/** Directive used to connect an input to a Datepicker. */
declare class DatepickerInput<D> extends DatepickerInputBase<D | null, D> implements DatepickerControl<D | null>, OnDestroy {
    private _closedSubscription;
    /** The datepicker that this input is associated with. */
    set datepicker(datepicker: DatepickerPanel<DatepickerControl<D>, D | null, D>);
    _datepicker: DatepickerPanel<DatepickerControl<D>, D | null, D>;
    /** The minimum valid date. */
    get min(): D | null;
    set min(value: D | null);
    private _min;
    /** The maximum valid date. */
    get max(): D | null;
    set max(value: D | null);
    private _max;
    /** Function that can be used to filter out dates within the datepicker. */
    get dateFilter(): DateFilterFn<D | null>;
    set dateFilter(value: DateFilterFn<D | null>);
    private _dateFilter;
    /** The combined form control validator for this input. */
    protected _validator: ValidatorFn | null;
    constructor();
    /**
     * Gets the element that the datepicker popup should be connected to.
     * @return The element to connect the popup to.
     */
    getConnectedOverlayOrigin(): ElementRef;
    /** Gets the ID of an element that should be used a description for the calendar overlay. */
    getOverlayLabelId(): string | null;
    /** Gets the value at which the calendar should start. */
    getStartValue(): D | null;
    ngOnDestroy(): void;
    /** Opens the associated datepicker. */
    protected _openPopup(): void;
    protected _getValueFromModel(modelValue: D | null): D | null;
    protected _assignValueToModel(value: D | null): void;
    /** Gets the input's minimum date. */
    _getMinDate(): D | null;
    /** Gets the input's maximum date. */
    _getMaxDate(): D | null;
    /** Gets the input's date filtering function. */
    protected _getDateFilter(): DateFilterFn<D | null>;
    protected _shouldHandleChangeEvent(event: DateSelectionModelChange<D>): boolean;
    static ɵfac: i0.ɵɵFactoryDeclaration<DatepickerInput<any>, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<DatepickerInput<any>, "input[datepicker]", ["datepickerInput"], { "datepicker": { "alias": "datepicker"; "required": false; }; "min": { "alias": "min"; "required": false; }; "max": { "alias": "max"; "required": false; }; "dateFilter": { "alias": "datepickerFilter"; "required": false; }; }, {}, never, never, true, never>;
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

declare class DatepickerToggle<D> implements AfterContentInit, OnChanges, OnDestroy {
    private _changeDetectorRef;
    private _stateChanges;
    /** Datepicker instance that the button will toggle. */
    datepicker: DatepickerPanel<DatepickerControl<any>, D>;
    /** Screen-reader label for the button. */
    ariaLabel: string;
    /** Whether the toggle button is disabled. */
    get disabled(): boolean;
    set disabled(value: boolean);
    private _disabled;
    ngOnChanges(changes: SimpleChanges): void;
    ngOnDestroy(): void;
    ngAfterContentInit(): void;
    _open(event: Event): void;
    private _watchStateChanges;
    static ɵfac: i0.ɵɵFactoryDeclaration<DatepickerToggle<any>, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<DatepickerToggle<any>, "datepicker-toggle", ["datepickerToggle"], { "datepicker": { "alias": "for"; "required": false; }; "ariaLabel": { "alias": "aria-label"; "required": false; }; "disabled": { "alias": "disabled"; "required": false; }; }, {}, never, never, true, never>;
    static ngAcceptInputType_disabled: unknown;
}

declare class DatepickerInputModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<DatepickerInputModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<DatepickerInputModule, never, [typeof i1.CommonModule, typeof i2.OverlayModule, typeof i3.A11yModule, typeof i4.PortalModule, typeof CalendarModule, typeof Datepicker, typeof DatepickerContent, typeof DatepickerInput, typeof DatepickerToggle], [typeof i11.CdkScrollableModule, typeof Datepicker, typeof DatepickerContent, typeof DatepickerInput, typeof DatepickerToggle]>;
    static ɵinj: i0.ɵɵInjectorDeclaration<DatepickerInputModule>;
}

declare class DatepickerModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<DatepickerModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<DatepickerModule, never, [typeof CalendarModule, typeof DatepickerInputModule], [typeof CalendarModule, typeof DatepickerInputModule]>;
    static ɵinj: i0.ɵɵInjectorDeclaration<DatepickerModule>;
}

export { Calendar, CalendarBody, CalendarCell, CalendarHeader, CalendarModule, DATEPICKER_SCROLL_STRATEGY, DATEPICKER_SCROLL_STRATEGY_FACTORY, DATEPICKER_SCROLL_STRATEGY_FACTORY_PROVIDER, DATEPICKER_VALIDATORS, DATEPICKER_VALUE_ACCESSOR, DATE_FORMATS, DATE_LOCALE, DATE_LOCALE_FACTORY, DateAdapter, DateRange, DateSelectionModel, Datepicker, DatepickerContent, DatepickerInput, DatepickerInputEvent, DatepickerInputModule, DatepickerModule, DatepickerToggle, MonthView, MultiYearView, NATIVE_DATE_FORMATS, NativeDateAdapter, NativeDateModule, SINGLE_DATE_SELECTION_MODEL_FACTORY, SINGLE_DATE_SELECTION_MODEL_PROVIDER, SingleDateSelectionModel, YearView, provideNativeDateAdapter, yearsPerPage, yearsPerRow };
export type { CalendarCellClassFunction, CalendarCellCssClasses, CalendarUserEvent, CalendarView, DateFormats, DateSelectionModelChange, ExtractDateTypeFromSelection };
