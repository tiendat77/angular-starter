import * as i0 from '@angular/core';
import { InjectionToken, inject, LOCALE_ID, Injectable, Optional, Inject, NgModule, SkipSelf, EventEmitter, Component, ViewEncapsulation, ChangeDetectionStrategy, Input, Output, ViewChild, forwardRef, booleanAttribute, Directive } from '@angular/core';
import { Subject, Subscription, merge, of } from 'rxjs';
import { DateTime, Info } from 'luxon';
import { CdkMonitorFocus, A11yModule } from '@angular/cdk/a11y';
import * as i1 from '@angular/cdk/overlay';
import { OverlayModule, Overlay, FlexibleConnectedPositionStrategy, OverlayConfig } from '@angular/cdk/overlay';
import { ComponentPortal, CdkPortalOutlet, PortalModule } from '@angular/cdk/portal';
import { CdkScrollableModule } from '@angular/cdk/scrolling';
import { NgClass, CommonModule, DOCUMENT } from '@angular/common';
import { SPACE, ENTER, PAGE_DOWN, PAGE_UP, END, HOME, DOWN_ARROW, UP_ARROW, RIGHT_ARROW, LEFT_ARROW, ESCAPE, hasModifierKey } from '@angular/cdk/keycodes';
import { take, startWith, filter } from 'rxjs/operators';
import { normalizePassiveListenerOptions, Platform, _getFocusedElementPierceShadowDom } from '@angular/cdk/platform';
import * as i2 from '@angular/cdk/bidi';
import { coerceStringArray } from '@angular/cdk/coercion';
import { trigger, transition, animate, keyframes, style, state } from '@angular/animations';
import { NG_VALUE_ACCESSOR, NG_VALIDATORS, Validators } from '@angular/forms';

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/** InjectionToken for datepicker that can be used to override default locale code. */
const DATE_LOCALE = new InjectionToken('DATE_LOCALE', {
    providedIn: 'root',
    factory: DATE_LOCALE_FACTORY,
});
/** @docs-private */
function DATE_LOCALE_FACTORY() {
    return inject(LOCALE_ID);
}
/** Adapts type `D` to be usable as a date by cdk-based components that work with dates. */
class DateAdapter {
    /** The locale to use for all dates. */
    locale;
    _localeChanges = new Subject();
    /** A stream that emits when the locale changes. */
    localeChanges = this._localeChanges;
    /**
     * Given a potential date object, returns that same date object if it is
     * a valid date, or `null` if it's not a valid date.
     * @param obj The object to check.
     * @returns A date or `null`.
     */
    getValidDateOrNull(obj) {
        return this.isDateInstance(obj) && this.isValid(obj) ? obj : null;
    }
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
    deserialize(value) {
        if (value == null || (this.isDateInstance(value) && this.isValid(value))) {
            return value;
        }
        return this.invalid();
    }
    /**
     * Sets the locale used for all dates.
     * @param locale The new locale.
     */
    setLocale(locale) {
        this.locale = locale;
        this._localeChanges.next();
    }
    /**
     * Compares two dates.
     * @param first The first date to compare.
     * @param second The second date to compare.
     * @returns 0 if the dates are equal, a number less than 0 if the first date is earlier,
     *     a number greater than 0 if the first date is later.
     */
    compareDate(first, second) {
        return (this.getYear(first) - this.getYear(second) ||
            this.getMonth(first) - this.getMonth(second) ||
            this.getDate(first) - this.getDate(second));
    }
    /**
     * Checks if two dates are equal.
     * @param first The first date to check.
     * @param second The second date to check.
     * @returns Whether the two dates are equal.
     *     Null dates are considered equal to other null dates.
     */
    sameDate(first, second) {
        if (first && second) {
            const firstValid = this.isValid(first);
            const secondValid = this.isValid(second);
            if (firstValid && secondValid) {
                return !this.compareDate(first, second);
            }
            return firstValid == secondValid;
        }
        return first == second;
    }
    /**
     * Clamp the given date between min and max dates.
     * @param date The date to clamp.
     * @param min The minimum value to allow. If null or omitted no min is enforced.
     * @param max The maximum value to allow. If null or omitted no max is enforced.
     * @returns `min` if `date` is less than `min`, `max` if date is greater than `max`,
     *     otherwise `date`.
     */
    clampDate(date, min, max) {
        if (min && this.compareDate(date, min) < 0) {
            return min;
        }
        if (max && this.compareDate(date, max) > 0) {
            return max;
        }
        return date;
    }
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const DATE_FORMATS = new InjectionToken('date-formats');

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/** InjectionToken for LuxonDateAdapter to configure options. */
const LUXON_DATE_ADAPTER_OPTIONS = new InjectionToken('LUXON_DATE_ADAPTER_OPTIONS', {
    providedIn: 'root',
    factory: LUXON_DATE_ADAPTER_OPTIONS_FACTORY,
});
/** @docs-private */
function LUXON_DATE_ADAPTER_OPTIONS_FACTORY() {
    return {
        useUtc: false,
        firstDayOfWeek: 0,
        defaultOutputCalendar: 'gregory',
    };
}
/** Creates an array and fills it with values. */
function range$1(length, valueFunction) {
    const valuesArray = Array(length);
    for (let i = 0; i < length; i++) {
        valuesArray[i] = valueFunction(i);
    }
    return valuesArray;
}
/** Adapts Luxon Dates for use with Angular Material. */
class LuxonDateAdapter extends DateAdapter {
    _useUTC;
    _firstDayOfWeek;
    _defaultOutputCalendar;
    constructor(dateLocale, options) {
        super();
        this._useUTC = !!options?.useUtc;
        this._firstDayOfWeek = options?.firstDayOfWeek || 0;
        this._defaultOutputCalendar = options?.defaultOutputCalendar || 'gregory';
        this.setLocale(dateLocale || DateTime.local().locale);
    }
    getYear(date) {
        return date.year;
    }
    getMonth(date) {
        // Luxon works with 1-indexed months whereas our code expects 0-indexed.
        return date.month - 1;
    }
    getDate(date) {
        return date.day;
    }
    getDayOfWeek(date) {
        return date.weekday;
    }
    getMonthNames(style) {
        // Adding outputCalendar option, because LuxonInfo doesn't get effected by LuxonSettings
        return Info.months(style, {
            locale: this.locale,
            outputCalendar: this._defaultOutputCalendar,
        });
    }
    getDateNames() {
        // At the time of writing, Luxon doesn't offer similar
        // functionality so we have to fall back to the Intl API.
        const dtf = new Intl.DateTimeFormat(this.locale, { day: 'numeric', timeZone: 'utc' });
        // Format a UTC date in order to avoid DST issues.
        return range$1(31, (i) => dtf.format(DateTime.utc(2017, 1, i + 1).toJSDate()));
    }
    getDayOfWeekNames(style) {
        // Note that we shift the array once, because Luxon returns Monday as the
        // first day of the week, whereas our logic assumes that it's Sunday. See:
        // https://moment.github.io/luxon/api-docs/index.html#infoweekdays
        const days = Info.weekdays(style, { locale: this.locale });
        days.unshift(days.pop());
        return days;
    }
    getYearName(date) {
        return date.toFormat('yyyy', this._getOptions());
    }
    getFirstDayOfWeek() {
        return this._firstDayOfWeek;
    }
    getNumDaysInMonth(date) {
        return date.daysInMonth;
    }
    clone(date) {
        return DateTime.fromObject(date.toObject(), this._getOptions());
    }
    createDate(year, month, date) {
        const options = this._getOptions();
        if (month < 0 || month > 11) {
            throw Error(`Invalid month index "${month}". Month index has to be between 0 and 11.`);
        }
        if (date < 1) {
            throw Error(`Invalid date "${date}". Date has to be greater than 0.`);
        }
        // Luxon uses 1-indexed months so we need to add one to the month.
        const result = this._useUTC
            ? DateTime.utc(year, month + 1, date, options)
            : DateTime.local(year, month + 1, date, options);
        if (!this.isValid(result)) {
            throw Error(`Invalid date "${date}". Reason: "${result.invalidReason}".`);
        }
        return result;
    }
    today() {
        const options = this._getOptions();
        return this._useUTC ? DateTime.utc(options) : DateTime.local(options);
    }
    parse(value, parseFormat) {
        const options = this._getOptions();
        if (typeof value == 'string' && value.length > 0) {
            const iso8601Date = DateTime.fromISO(value, options);
            if (this.isValid(iso8601Date)) {
                return iso8601Date;
            }
            const formats = Array.isArray(parseFormat) ? parseFormat : [parseFormat];
            if (!parseFormat.length) {
                throw Error('Formats array must not be empty.');
            }
            for (const format of formats) {
                const fromFormat = DateTime.fromFormat(value, format, options);
                if (this.isValid(fromFormat)) {
                    return fromFormat;
                }
            }
            return this.invalid();
        }
        else if (typeof value === 'number') {
            return DateTime.fromMillis(value, options);
        }
        else if (value instanceof Date) {
            return DateTime.fromJSDate(value, options);
        }
        else if (value instanceof DateTime) {
            return DateTime.fromMillis(value.toMillis(), options);
        }
        return null;
    }
    format(date, displayFormat) {
        if (!this.isValid(date)) {
            throw Error('LuxonDateAdapter: Cannot format invalid date.');
        }
        if (this._useUTC) {
            return date.setLocale(this.locale).setZone('utc').toFormat(displayFormat);
        }
        else {
            return date.setLocale(this.locale).toFormat(displayFormat);
        }
    }
    addCalendarYears(date, years) {
        return date.reconfigure(this._getOptions()).plus({ years });
    }
    addCalendarMonths(date, months) {
        return date.reconfigure(this._getOptions()).plus({ months });
    }
    addCalendarDays(date, days) {
        return date.reconfigure(this._getOptions()).plus({ days });
    }
    toIso8601(date) {
        return date.toISO();
    }
    /**
     * Returns the given value if given a valid Luxon or null. Deserializes valid ISO 8601 strings
     * (https://www.ietf.org/rfc/rfc3339.txt) and valid Date objects into valid DateTime and empty
     * string into null. Returns an invalid date for all other values.
     */
    deserialize(value) {
        const options = this._getOptions();
        let date;
        if (value instanceof Date) {
            date = DateTime.fromJSDate(value, options);
        }
        if (typeof value === 'string') {
            if (!value) {
                return null;
            }
            date = DateTime.fromISO(value, options);
        }
        if (date && this.isValid(date)) {
            return date;
        }
        return super.deserialize(value);
    }
    isDateInstance(obj) {
        return obj instanceof DateTime;
    }
    isValid(date) {
        return date.isValid;
    }
    invalid() {
        return DateTime.invalid('Invalid Luxon DateTime object.');
    }
    /** Gets the options that should be used when constructing a new `DateTime` object. */
    _getOptions() {
        return {
            zone: this._useUTC ? 'utc' : undefined,
            locale: this.locale,
            outputCalendar: this._defaultOutputCalendar,
        };
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: LuxonDateAdapter, deps: [{ token: DATE_LOCALE, optional: true }, { token: LUXON_DATE_ADAPTER_OPTIONS, optional: true }], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: LuxonDateAdapter });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: LuxonDateAdapter, decorators: [{
            type: Injectable
        }], ctorParameters: () => [{ type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [DATE_LOCALE]
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [LUXON_DATE_ADAPTER_OPTIONS]
                }] }] });

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const LUXON_DATE_FORMATS = {
    parse: {
        dateInput: 'dd/MM/yyyy',
    },
    display: {
        dateInput: 'dd/MM/yyyy',
        monthYearLabel: 'LLL yyyy',
        dateA11yLabel: 'DD',
        monthYearA11yLabel: 'LLLL yyyy',
        dayMonthDateLabel: 'ccc, MMMM dd',
    },
};

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
class LuxonDateModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: LuxonDateModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "18.2.8", ngImport: i0, type: LuxonDateModule });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: LuxonDateModule, providers: [
            {
                provide: DateAdapter,
                useClass: LuxonDateAdapter,
                deps: [DATE_LOCALE, LUXON_DATE_ADAPTER_OPTIONS],
            },
        ] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: LuxonDateModule, decorators: [{
            type: NgModule,
            args: [{
                    providers: [
                        {
                            provide: DateAdapter,
                            useClass: LuxonDateAdapter,
                            deps: [DATE_LOCALE, LUXON_DATE_ADAPTER_OPTIONS],
                        },
                    ],
                }]
        }] });
function provideLuxonDateAdapter(formats = LUXON_DATE_FORMATS) {
    return [
        {
            provide: DateAdapter,
            useClass: LuxonDateAdapter,
            deps: [DATE_LOCALE, LUXON_DATE_ADAPTER_OPTIONS],
        },
        { provide: DATE_FORMATS, useValue: formats },
    ];
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * Matches strings that have the form of a valid RFC 3339 string
 * (https://tools.ietf.org/html/rfc3339). Note that the string may not actually be a valid date
 * because the regex will match strings an with out of bounds month, date, etc.
 */
const ISO_8601_REGEX = /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|(?:(?:\+|-)\d{2}:\d{2}))?)?$/;
/** Creates an array and fills it with values. */
function range(length, valueFunction) {
    const valuesArray = Array(length);
    for (let i = 0; i < length; i++) {
        valuesArray[i] = valueFunction(i);
    }
    return valuesArray;
}
/** Adapts the native JS Date for use with cdk-based components that work with dates. */
class NativeDateAdapter extends DateAdapter {
    /**
     * @deprecated No longer being used. To be removed.
     * @breaking-change 14.0.0
     */
    useUtcForDisplay = false;
    /** The injected locale. */
    _dateLocale = inject(DATE_LOCALE, { optional: true });
    constructor(
    /**
     * @deprecated Now injected via inject(), param to be removed.
     * @breaking-change 18.0.0
     */
    dateLocale) {
        super();
        if (dateLocale !== undefined) {
            this._dateLocale = dateLocale;
        }
        super.setLocale(this._dateLocale);
    }
    getYear(date) {
        return date.getFullYear();
    }
    getMonth(date) {
        return date.getMonth();
    }
    getDate(date) {
        return date.getDate();
    }
    getDayOfWeek(date) {
        return date.getDay();
    }
    getMonthNames(style) {
        const dtf = new Intl.DateTimeFormat(this.locale, { month: style, timeZone: 'utc' });
        return range(12, (i) => this._format(dtf, new Date(2017, i, 1)));
    }
    getDateNames() {
        const dtf = new Intl.DateTimeFormat(this.locale, { day: 'numeric', timeZone: 'utc' });
        return range(31, (i) => this._format(dtf, new Date(2017, 0, i + 1)));
    }
    getDayOfWeekNames(style) {
        const dtf = new Intl.DateTimeFormat(this.locale, { weekday: style, timeZone: 'utc' });
        return range(7, (i) => this._format(dtf, new Date(2017, 0, i + 1)));
    }
    getYearName(date) {
        const dtf = new Intl.DateTimeFormat(this.locale, { year: 'numeric', timeZone: 'utc' });
        return this._format(dtf, date);
    }
    getFirstDayOfWeek() {
        // We can't tell using native JS Date what the first day of the week is, we default to Sunday.
        return 0;
    }
    getNumDaysInMonth(date) {
        return this.getDate(this._createDateWithOverflow(this.getYear(date), this.getMonth(date) + 1, 0));
    }
    clone(date) {
        return new Date(date.getTime());
    }
    createDate(year, month, date) {
        // Check for invalid month and date (except upper bound on date which we have to check after
        // creating the Date).
        if (month < 0 || month > 11) {
            throw Error(`Invalid month index "${month}". Month index has to be between 0 and 11.`);
        }
        if (date < 1) {
            throw Error(`Invalid date "${date}". Date has to be greater than 0.`);
        }
        const result = this._createDateWithOverflow(year, month, date);
        // Check that the date wasn't above the upper bound for the month, causing the month to overflow
        if (result.getMonth() != month) {
            throw Error(`Invalid date "${date}" for month with index "${month}".`);
        }
        return result;
    }
    today() {
        return new Date();
    }
    parse(value, parseFormat) {
        // We have no way using the native JS Date to set the parse format or locale, so we ignore these
        // parameters.
        if (typeof value == 'number') {
            return new Date(value);
        }
        return value ? new Date(Date.parse(value)) : null;
    }
    format(date, displayFormat) {
        if (!this.isValid(date)) {
            throw Error('NativeDateAdapter: Cannot format invalid date.');
        }
        const dtf = new Intl.DateTimeFormat(this.locale, { ...displayFormat, timeZone: 'utc' });
        return this._format(dtf, date);
    }
    addCalendarYears(date, years) {
        return this.addCalendarMonths(date, years * 12);
    }
    addCalendarMonths(date, months) {
        let newDate = this._createDateWithOverflow(this.getYear(date), this.getMonth(date) + months, this.getDate(date));
        // It's possible to wind up in the wrong month if the original month has more days than the new
        // month. In this case we want to go to the last day of the desired month.
        // Note: the additional + 12 % 12 ensures we end up with a positive number, since JS % doesn't
        // guarantee this.
        if (this.getMonth(newDate) != (((this.getMonth(date) + months) % 12) + 12) % 12) {
            newDate = this._createDateWithOverflow(this.getYear(newDate), this.getMonth(newDate), 0);
        }
        return newDate;
    }
    addCalendarDays(date, days) {
        return this._createDateWithOverflow(this.getYear(date), this.getMonth(date), this.getDate(date) + days);
    }
    toIso8601(date) {
        return [
            date.getUTCFullYear(),
            this._2digit(date.getUTCMonth() + 1),
            this._2digit(date.getUTCDate()),
        ].join('-');
    }
    /**
     * Returns the given value if given a valid Date or null. Deserializes valid ISO 8601 strings
     * (https://www.ietf.org/rfc/rfc3339.txt) into valid Dates and empty string into null. Returns an
     * invalid date for all other values.
     */
    deserialize(value) {
        if (typeof value === 'string') {
            if (!value) {
                return null;
            }
            // The `Date` constructor accepts formats other than ISO 8601, so we need to make sure the
            // string is the right format first.
            if (ISO_8601_REGEX.test(value)) {
                const date = new Date(value);
                if (this.isValid(date)) {
                    return date;
                }
            }
        }
        return super.deserialize(value);
    }
    isDateInstance(obj) {
        return obj instanceof Date;
    }
    isValid(date) {
        return !isNaN(date.getTime());
    }
    invalid() {
        return new Date(NaN);
    }
    /** Creates a date but allows the month and date to overflow. */
    _createDateWithOverflow(year, month, date) {
        // Passing the year to the constructor causes year numbers <100 to be converted to 19xx.
        // To work around this we use `setFullYear` and `setHours` instead.
        const d = new Date();
        d.setFullYear(year, month, date);
        d.setHours(0, 0, 0, 0);
        return d;
    }
    /**
     * Pads a number to make it two digits.
     * @param n The number to pad.
     * @returns The padded number.
     */
    _2digit(n) {
        return ('00' + n).slice(-2);
    }
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
    _format(dtf, date) {
        // Passing the year to the constructor causes year numbers <100 to be converted to 19xx.
        // To work around this we use `setUTCFullYear` and `setUTCHours` instead.
        const d = new Date();
        d.setUTCFullYear(date.getFullYear(), date.getMonth(), date.getDate());
        d.setUTCHours(date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds());
        return dtf.format(d);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: NativeDateAdapter, deps: [{ token: DATE_LOCALE, optional: true }], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: NativeDateAdapter });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: NativeDateAdapter, decorators: [{
            type: Injectable
        }], ctorParameters: () => [{ type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [DATE_LOCALE]
                }] }] });

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const NATIVE_DATE_FORMATS = {
    parse: {
        dateInput: null,
    },
    display: {
        dateInput: { year: 'numeric', month: 'numeric', day: 'numeric' },
        monthYearLabel: { year: 'numeric', month: 'short' },
        dateA11yLabel: { year: 'numeric', month: 'long', day: 'numeric' },
        monthYearA11yLabel: { year: 'numeric', month: 'long' },
        dayMonthDateLabel: { weekday: 'short', month: 'long', day: 'numeric' },
    },
};

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
class NativeDateModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: NativeDateModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "18.2.8", ngImport: i0, type: NativeDateModule });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: NativeDateModule, providers: [{ provide: DateAdapter, useClass: NativeDateAdapter }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: NativeDateModule, decorators: [{
            type: NgModule,
            args: [{
                    providers: [{ provide: DateAdapter, useClass: NativeDateAdapter }],
                }]
        }] });
function provideNativeDateAdapter(formats = NATIVE_DATE_FORMATS) {
    return [
        { provide: DateAdapter, useClass: NativeDateAdapter },
        { provide: DATE_FORMATS, useValue: formats },
    ];
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/** A class representing a range of dates. */
class DateRange {
    start;
    end;
    /**
     * Ensures that objects with a `start` and `end` property can't be assigned to a variable that
     * expects a `DateRange`
     */
    _disableStructuralEquivalency;
    constructor(
    /** The start date of the range. */
    start, 
    /** The end date of the range. */
    end) {
        this.start = start;
        this.end = end;
    }
}
/**
 * A selection model containing a date selection.
 * @docs-private
 */
class DateSelectionModel {
    selection;
    _adapter;
    _selectionChanged = new Subject();
    /** Emits when the selection has changed. */
    selectionChanged = this._selectionChanged;
    constructor(
    /** The current selection. */
    selection, _adapter) {
        this.selection = selection;
        this._adapter = _adapter;
        this.selection = selection;
    }
    /**
     * Updates the current selection in the model.
     * @param value New selection that should be assigned.
     * @param source Object that triggered the selection change.
     */
    updateSelection(value, source) {
        const oldValue = this.selection;
        this.selection = value;
        this._selectionChanged.next({ selection: value, source, oldValue });
    }
    ngOnDestroy() {
        this._selectionChanged.complete();
    }
    _isValidDateInstance(date) {
        return this._adapter.isDateInstance(date) && this._adapter.isValid(date);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: DateSelectionModel, deps: "invalid", target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: DateSelectionModel });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: DateSelectionModel, decorators: [{
            type: Injectable
        }], ctorParameters: () => [{ type: undefined }, { type: DateAdapter }] });
/**
 * A selection model that contains a single date.
 * @docs-private
 */
class SingleDateSelectionModel extends DateSelectionModel {
    constructor(adapter) {
        super(null, adapter);
    }
    /**
     * Adds a date to the current selection. In the case of a single date selection, the added date
     * simply overwrites the previous selection
     */
    add(date) {
        super.updateSelection(date, this);
    }
    /** Checks whether the current selection is valid. */
    isValid() {
        return this.selection != null && this._isValidDateInstance(this.selection);
    }
    /**
     * Checks whether the current selection is complete. In the case of a single date selection, this
     * is true if the current selection is not null.
     */
    isComplete() {
        return this.selection != null;
    }
    /** Clones the selection model. */
    clone() {
        const clone = new SingleDateSelectionModel(this._adapter);
        clone.updateSelection(this.selection, this);
        return clone;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: SingleDateSelectionModel, deps: [{ token: DateAdapter }], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: SingleDateSelectionModel });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: SingleDateSelectionModel, decorators: [{
            type: Injectable
        }], ctorParameters: () => [{ type: DateAdapter }] });
/** @docs-private */
function SINGLE_DATE_SELECTION_MODEL_FACTORY(parent, adapter) {
    return parent || new SingleDateSelectionModel(adapter);
}
/**
 * Used to provide a single selection model to a component.
 * @docs-private
 */
const SINGLE_DATE_SELECTION_MODEL_PROVIDER = {
    provide: DateSelectionModel,
    deps: [[new Optional(), new SkipSelf(), DateSelectionModel], DateAdapter],
    useFactory: SINGLE_DATE_SELECTION_MODEL_FACTORY,
};

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/** @docs-private */
function createMissingDateImplError(provider) {
    return Error(`Datepicker: No provider found for ${provider}. You must add one of the following ` +
        'to your app config: provideNativeDateAdapter, provideDateFnsAdapter, ' +
        'provideLuxonDateAdapter, provideMomentDateAdapter, or provide a custom implementation.');
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * An internal class that represents the data corresponding to a single calendar cell.
 * @docs-private
 */
class CalendarCell {
    value;
    displayValue;
    ariaLabel;
    enabled;
    cssClasses;
    compareValue;
    rawValue;
    constructor(value, displayValue, ariaLabel, enabled, cssClasses = {}, compareValue = value, rawValue) {
        this.value = value;
        this.displayValue = displayValue;
        this.ariaLabel = ariaLabel;
        this.enabled = enabled;
        this.cssClasses = cssClasses;
        this.compareValue = compareValue;
        this.rawValue = rawValue;
    }
}
let calendarBodyId = 1;
/** Event options that can be used to bind an active, capturing event. */
const activeCapturingEventOptions = normalizePassiveListenerOptions({
    passive: false,
    capture: true,
});
/** Event options that can be used to bind a passive, capturing event. */
const passiveCapturingEventOptions = normalizePassiveListenerOptions({
    passive: true,
    capture: true,
});
/** Event options that can be used to bind a passive, non-capturing event. */
const passiveEventOptions = normalizePassiveListenerOptions({ passive: true });
/**
 * An internal component used to display calendar data in a table.
 * @docs-private
 */
class CalendarBody {
    _elementRef;
    _ngZone;
    _platform = inject(Platform);
    /**
     * Used to skip the next focus event when rendering the preview range.
     * We need a flag like this, because some browsers fire focus events asynchronously.
     */
    _skipNextFocus;
    /**
     * Used to focus the active cell after change detection has run.
     */
    _focusActiveCellAfterViewChecked = false;
    /** The label for the table. (e.g. "Jan 2017"). */
    label;
    /** The cells to display in the table. */
    rows;
    /** The value in the table that corresponds to today. */
    todayValue;
    /** Start value of the selected date range. */
    startValue;
    /** End value of the selected date range. */
    endValue;
    /** The minimum number of free cells needed to fit the label in the first row. */
    labelMinRequiredCells;
    /** The number of columns in the table. */
    numCols = 7;
    /** The cell number of the active cell in the table. */
    activeCell = 0;
    ngAfterViewChecked() {
        if (this._focusActiveCellAfterViewChecked) {
            this._focusActiveCell();
            this._focusActiveCellAfterViewChecked = false;
        }
    }
    /** Whether a range is being selected. */
    isRange = false;
    /**
     * The aspect ratio (width / height) to use for the cells in the table. This aspect ratio will be
     * maintained even as the table resizes.
     */
    cellAspectRatio = 1;
    /** Start of the comparison range. */
    comparisonStart;
    /** End of the comparison range. */
    comparisonEnd;
    /** Start of the preview range. */
    previewStart = null;
    /** End of the preview range. */
    previewEnd = null;
    /** ARIA Accessible name of the `<input startDate/>` */
    startDateAccessibleName;
    /** ARIA Accessible name of the `<input endDate/>` */
    endDateAccessibleName;
    /** Emits when a new value is selected. */
    selectedValueChange = new EventEmitter();
    /** Emits when the preview has changed as a result of a user action. */
    previewChange = new EventEmitter();
    activeDateChange = new EventEmitter();
    /** Emits the date at the possible start of a drag event. */
    dragStarted = new EventEmitter();
    /** Emits the date at the conclusion of a drag, or null if mouse was not released on a date. */
    dragEnded = new EventEmitter();
    /** The number of blank cells to put at the beginning for the first row. */
    _firstRowOffset;
    /** Padding for the individual date cells. */
    _cellPadding;
    /** Width of an individual cell. */
    _cellWidth;
    _didDragSinceMouseDown = false;
    constructor(_elementRef, _ngZone) {
        this._elementRef = _elementRef;
        this._ngZone = _ngZone;
        _ngZone.runOutsideAngular(() => {
            const element = _elementRef.nativeElement;
            // `touchmove` is active since we need to call `preventDefault`.
            element.addEventListener('touchmove', this._touchmoveHandler, activeCapturingEventOptions);
            element.addEventListener('mouseenter', this._enterHandler, passiveCapturingEventOptions);
            element.addEventListener('focus', this._enterHandler, passiveCapturingEventOptions);
            element.addEventListener('mouseleave', this._leaveHandler, passiveCapturingEventOptions);
            element.addEventListener('blur', this._leaveHandler, passiveCapturingEventOptions);
            element.addEventListener('mousedown', this._mousedownHandler, passiveEventOptions);
            element.addEventListener('touchstart', this._mousedownHandler, passiveEventOptions);
            if (this._platform.isBrowser) {
                window.addEventListener('mouseup', this._mouseupHandler);
                window.addEventListener('touchend', this._touchendHandler);
            }
        });
    }
    /** Called when a cell is clicked. */
    _cellClicked(cell, event) {
        // Ignore "clicks" that are actually canceled drags (eg the user dragged
        // off and then went back to this cell to undo).
        if (this._didDragSinceMouseDown) {
            return;
        }
        if (cell.enabled) {
            this.selectedValueChange.emit({ value: cell.value, event });
        }
    }
    _emitActiveDateChange(cell, event) {
        if (cell.enabled) {
            this.activeDateChange.emit({ value: cell.value, event });
        }
    }
    /** Returns whether a cell should be marked as selected. */
    _isSelected(value) {
        return this.startValue === value || this.endValue === value;
    }
    ngOnChanges(changes) {
        const columnChanges = changes['numCols'];
        const { rows, numCols } = this;
        if (changes['rows'] || columnChanges) {
            this._firstRowOffset = rows && rows.length && rows[0].length ? numCols - rows[0].length : 0;
        }
        if (changes['cellAspectRatio'] || columnChanges || !this._cellPadding) {
            this._cellPadding = `${(50 * this.cellAspectRatio) / numCols}%`;
        }
        if (columnChanges || !this._cellWidth) {
            this._cellWidth = `${100 / numCols}%`;
        }
    }
    ngOnDestroy() {
        const element = this._elementRef.nativeElement;
        element.removeEventListener('touchmove', this._touchmoveHandler, activeCapturingEventOptions);
        element.removeEventListener('mouseenter', this._enterHandler, passiveCapturingEventOptions);
        element.removeEventListener('focus', this._enterHandler, passiveCapturingEventOptions);
        element.removeEventListener('mouseleave', this._leaveHandler, passiveCapturingEventOptions);
        element.removeEventListener('blur', this._leaveHandler, passiveCapturingEventOptions);
        element.removeEventListener('mousedown', this._mousedownHandler, passiveEventOptions);
        element.removeEventListener('touchstart', this._mousedownHandler, passiveEventOptions);
        if (this._platform.isBrowser) {
            window.removeEventListener('mouseup', this._mouseupHandler);
            window.removeEventListener('touchend', this._touchendHandler);
        }
    }
    /** Returns whether a cell is active. */
    _isActiveCell(rowIndex, colIndex) {
        let cellNumber = rowIndex * this.numCols + colIndex;
        // Account for the fact that the first row may not have as many cells.
        if (rowIndex) {
            cellNumber -= this._firstRowOffset;
        }
        return cellNumber == this.activeCell;
    }
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
    _focusActiveCell(movePreview = true) {
        this._ngZone.runOutsideAngular(() => {
            this._ngZone.onStable.pipe(take(1)).subscribe(() => {
                setTimeout(() => {
                    const activeCell = this._elementRef.nativeElement.querySelector('.calendar-body-active');
                    if (activeCell) {
                        if (!movePreview) {
                            this._skipNextFocus = true;
                        }
                        activeCell.focus();
                    }
                });
            });
        });
    }
    /** Focuses the active cell after change detection has run and the microtask queue is empty. */
    _scheduleFocusActiveCellAfterViewChecked() {
        this._focusActiveCellAfterViewChecked = true;
    }
    /** Gets whether a value is the start of the main range. */
    _isRangeStart(value) {
        return isStart(value, this.startValue, this.endValue);
    }
    /** Gets whether a value is the end of the main range. */
    _isRangeEnd(value) {
        return isEnd(value, this.startValue, this.endValue);
    }
    /** Gets whether a value is within the currently-selected range. */
    _isInRange(value) {
        return isInRange(value, this.startValue, this.endValue, this.isRange);
    }
    /** Gets whether a value is the start of the comparison range. */
    _isComparisonStart(value) {
        return isStart(value, this.comparisonStart, this.comparisonEnd);
    }
    /** Whether the cell is a start bridge cell between the main and comparison ranges. */
    _isComparisonBridgeStart(value, rowIndex, colIndex) {
        if (!this._isComparisonStart(value) || this._isRangeStart(value) || !this._isInRange(value)) {
            return false;
        }
        let previousCell = this.rows[rowIndex][colIndex - 1];
        if (!previousCell) {
            const previousRow = this.rows[rowIndex - 1];
            previousCell = previousRow && previousRow[previousRow.length - 1];
        }
        return previousCell && !this._isRangeEnd(previousCell.compareValue);
    }
    /** Whether the cell is an end bridge cell between the main and comparison ranges. */
    _isComparisonBridgeEnd(value, rowIndex, colIndex) {
        if (!this._isComparisonEnd(value) || this._isRangeEnd(value) || !this._isInRange(value)) {
            return false;
        }
        let nextCell = this.rows[rowIndex][colIndex + 1];
        if (!nextCell) {
            const nextRow = this.rows[rowIndex + 1];
            nextCell = nextRow && nextRow[0];
        }
        return nextCell && !this._isRangeStart(nextCell.compareValue);
    }
    /** Gets whether a value is the end of the comparison range. */
    _isComparisonEnd(value) {
        return isEnd(value, this.comparisonStart, this.comparisonEnd);
    }
    /** Gets whether a value is within the current comparison range. */
    _isInComparisonRange(value) {
        return isInRange(value, this.comparisonStart, this.comparisonEnd, this.isRange);
    }
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
    _isComparisonIdentical(value) {
        // Note that we don't need to null check the start/end
        // here, because the `value` will always be defined.
        return this.comparisonStart === this.comparisonEnd && value === this.comparisonStart;
    }
    /** Gets whether a value is the start of the preview range. */
    _isPreviewStart(value) {
        return isStart(value, this.previewStart, this.previewEnd);
    }
    /** Gets whether a value is the end of the preview range. */
    _isPreviewEnd(value) {
        return isEnd(value, this.previewStart, this.previewEnd);
    }
    /** Gets whether a value is inside the preview range. */
    _isInPreview(value) {
        return isInRange(value, this.previewStart, this.previewEnd, this.isRange);
    }
    /** Gets ids of aria descriptions for the start and end of a date range. */
    _getDescribedby(value) {
        if (!this.isRange) {
            return null;
        }
        if (this.startValue === value && this.endValue === value) {
            return `${this._startDateLabelId} ${this._endDateLabelId}`;
        }
        else if (this.startValue === value) {
            return this._startDateLabelId;
        }
        else if (this.endValue === value) {
            return this._endDateLabelId;
        }
        return null;
    }
    /**
     * Event handler for when the user enters an element
     * inside the calendar body (e.g. by hovering in or focus).
     */
    _enterHandler = (event) => {
        if (this._skipNextFocus && event.type === 'focus') {
            this._skipNextFocus = false;
            return;
        }
        // We only need to hit the zone when we're selecting a range.
        if (event.target && this.isRange) {
            const cell = this._getCellFromElement(event.target);
            if (cell) {
                this._ngZone.run(() => this.previewChange.emit({ value: cell.enabled ? cell : null, event }));
            }
        }
    };
    _touchmoveHandler = (event) => {
        if (!this.isRange)
            return;
        const target = getActualTouchTarget(event);
        const cell = target ? this._getCellFromElement(target) : null;
        if (target !== event.target) {
            this._didDragSinceMouseDown = true;
        }
        // If the initial target of the touch is a date cell, prevent default so
        // that the move is not handled as a scroll.
        if (getCellElement(event.target)) {
            event.preventDefault();
        }
        this._ngZone.run(() => this.previewChange.emit({ value: cell?.enabled ? cell : null, event }));
    };
    /**
     * Event handler for when the user's pointer leaves an element
     * inside the calendar body (e.g. by hovering out or blurring).
     */
    _leaveHandler = (event) => {
        // We only need to hit the zone when we're selecting a range.
        if (this.previewEnd !== null && this.isRange) {
            if (event.type !== 'blur') {
                this._didDragSinceMouseDown = true;
            }
            // Only reset the preview end value when leaving cells. This looks better, because
            // we have a gap between the cells and the rows and we don't want to remove the
            // range just for it to show up again when the user moves a few pixels to the side.
            if (event.target &&
                this._getCellFromElement(event.target) &&
                !(event.relatedTarget &&
                    this._getCellFromElement(event.relatedTarget))) {
                this._ngZone.run(() => this.previewChange.emit({ value: null, event }));
            }
        }
    };
    /**
     * Triggered on mousedown or touchstart on a date cell.
     * Respsonsible for starting a drag sequence.
     */
    _mousedownHandler = (event) => {
        if (!this.isRange)
            return;
        this._didDragSinceMouseDown = false;
        // Begin a drag if a cell within the current range was targeted.
        const cell = event.target && this._getCellFromElement(event.target);
        if (!cell || !this._isInRange(cell.compareValue)) {
            return;
        }
        this._ngZone.run(() => {
            this.dragStarted.emit({
                value: cell.rawValue,
                event,
            });
        });
    };
    /** Triggered on mouseup anywhere. Respsonsible for ending a drag sequence. */
    _mouseupHandler = (event) => {
        if (!this.isRange)
            return;
        const cellElement = getCellElement(event.target);
        if (!cellElement) {
            // Mouseup happened outside of datepicker. Cancel drag.
            this._ngZone.run(() => {
                this.dragEnded.emit({ value: null, event });
            });
            return;
        }
        if (cellElement.closest('.calendar-body') !== this._elementRef.nativeElement) {
            // Mouseup happened inside a different month instance.
            // Allow it to handle the event.
            return;
        }
        this._ngZone.run(() => {
            const cell = this._getCellFromElement(cellElement);
            this.dragEnded.emit({ value: cell?.rawValue ?? null, event });
        });
    };
    /** Triggered on touchend anywhere. Respsonsible for ending a drag sequence. */
    _touchendHandler = (event) => {
        const target = getActualTouchTarget(event);
        if (target) {
            this._mouseupHandler({ target });
        }
    };
    /** Finds the MatCalendarCell that corresponds to a DOM node. */
    _getCellFromElement(element) {
        const cell = getCellElement(element);
        if (cell) {
            const row = cell.getAttribute('data-row');
            const col = cell.getAttribute('data-col');
            if (row && col) {
                return this.rows[parseInt(row)][parseInt(col)];
            }
        }
        return null;
    }
    _id = `calendar-body-${calendarBodyId++}`;
    _startDateLabelId = `${this._id}-start-date`;
    _endDateLabelId = `${this._id}-end-date`;
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: CalendarBody, deps: [{ token: i0.ElementRef }, { token: i0.NgZone }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "18.2.8", type: CalendarBody, isStandalone: true, selector: "[calendar-body]", inputs: { label: "label", rows: "rows", todayValue: "todayValue", startValue: "startValue", endValue: "endValue", labelMinRequiredCells: "labelMinRequiredCells", numCols: "numCols", activeCell: "activeCell", isRange: "isRange", cellAspectRatio: "cellAspectRatio", comparisonStart: "comparisonStart", comparisonEnd: "comparisonEnd", previewStart: "previewStart", previewEnd: "previewEnd", startDateAccessibleName: "startDateAccessibleName", endDateAccessibleName: "endDateAccessibleName" }, outputs: { selectedValueChange: "selectedValueChange", previewChange: "previewChange", activeDateChange: "activeDateChange", dragStarted: "dragStarted", dragEnded: "dragEnded" }, host: { classAttribute: "calendar-body" }, exportAs: ["calendarBody"], usesOnChanges: true, ngImport: i0, template: "<!-- eslint-disable @angular-eslint/template/no-call-expression -->\n<!-- Create the first row separately so we can include a special spacer cell. -->\n@for (row of rows; track row; let rowIndex = $index) {\n  <tr role=\"row\">\n    <!--\n      This cell is purely decorative, but we can't put `aria-hidden` or `role=\"presentation\"` on it,\n      because it throws off the week days for the rest of the row on NVDA. The aspect ratio of the\n      table cells is maintained by setting the top and bottom padding as a percentage of the width\n      (a variant of the trick described here: https://www.w3schools.com/howto/howto_css_aspect_ratio.asp).\n    -->\n    @if (rowIndex === 0 && _firstRowOffset) {\n      <td\n        class=\"calendar-body-label\"\n        [attr.colspan]=\"_firstRowOffset\"\n        [style.paddingTop]=\"_cellPadding\"\n        [style.paddingBottom]=\"_cellPadding\"\n      ></td>\n    }\n    <!--\n      Each gridcell in the calendar contains a button, which signals to assistive technology that the\n      cell is intractable, as well as the selection state via `aria-pressed`. See #23476 for\n      background.\n    -->\n    @for (item of row; track item; let colIndex = $index) {\n      <td\n        role=\"gridcell\"\n        class=\"calendar-body-cell-container\"\n        [style.width]=\"_cellWidth\"\n        [style.paddingTop]=\"_cellPadding\"\n        [style.paddingBottom]=\"_cellPadding\"\n        [attr.data-row]=\"rowIndex\"\n        [attr.data-col]=\"colIndex\"\n      >\n        <button\n          type=\"button\"\n          class=\"calendar-body-cell\"\n          [ngClass]=\"item.cssClasses\"\n          [tabindex]=\"_isActiveCell(rowIndex, colIndex) ? 0 : -1\"\n          [class.calendar-body-disabled]=\"!item.enabled\"\n          [class.calendar-body-active]=\"_isActiveCell(rowIndex, colIndex)\"\n          [class.calendar-body-range-start]=\"_isRangeStart(item.compareValue)\"\n          [class.calendar-body-range-end]=\"_isRangeEnd(item.compareValue)\"\n          [class.calendar-body-in-range]=\"_isInRange(item.compareValue)\"\n          [class.calendar-body-comparison-bridge-start]=\"\n            _isComparisonBridgeStart(item.compareValue, rowIndex, colIndex)\n          \"\n          [class.calendar-body-comparison-bridge-end]=\"\n            _isComparisonBridgeEnd(item.compareValue, rowIndex, colIndex)\n          \"\n          [class.calendar-body-comparison-start]=\"_isComparisonStart(item.compareValue)\"\n          [class.calendar-body-comparison-end]=\"_isComparisonEnd(item.compareValue)\"\n          [class.calendar-body-in-comparison-range]=\"_isInComparisonRange(item.compareValue)\"\n          [class.calendar-body-preview-start]=\"_isPreviewStart(item.compareValue)\"\n          [class.calendar-body-preview-end]=\"_isPreviewEnd(item.compareValue)\"\n          [class.calendar-body-in-preview]=\"_isInPreview(item.compareValue)\"\n          [attr.aria-label]=\"item.ariaLabel\"\n          [attr.aria-disabled]=\"!item.enabled || null\"\n          [attr.aria-pressed]=\"_isSelected(item.compareValue)\"\n          [attr.aria-current]=\"todayValue === item.compareValue ? 'date' : null\"\n          [attr.aria-describedby]=\"_getDescribedby(item.compareValue)\"\n          (click)=\"_cellClicked(item, $event)\"\n          (focus)=\"_emitActiveDateChange(item, $event)\"\n        >\n          <span\n            class=\"calendar-body-cell-content focus-indicator\"\n            [class.calendar-body-selected]=\"_isSelected(item.compareValue)\"\n            [class.calendar-body-comparison-identical]=\"_isComparisonIdentical(item.compareValue)\"\n            [class.calendar-body-today]=\"todayValue === item.compareValue\"\n          >\n            {{ item.displayValue }}\n          </span>\n          <span\n            class=\"calendar-body-cell-preview\"\n            aria-hidden=\"true\"\n          ></span>\n        </button>\n      </td>\n    }\n  </tr>\n}\n\n<label\n  class=\"calendar-body-hidden-label\"\n  for=\"\"\n  [id]=\"_startDateLabelId\"\n>\n  {{ startDateAccessibleName }}\n</label>\n\n<label\n  class=\"calendar-body-hidden-label\"\n  for=\"\"\n  [id]=\"_endDateLabelId\"\n>\n  {{ endDateAccessibleName }}\n</label>\n", styles: [".calendar-body{min-width:17.5rem}.calendar-body-today{border-color:var(--border)!important}.calendar-body-label{height:0;line-height:0;text-align:start;padding-left:4.7142857143%;padding-right:4.7142857143%}.calendar-body-hidden-label{display:none}.calendar-body-cell-container{position:relative;height:0;line-height:0}.calendar-body-cell{position:absolute;top:0;left:0;width:100%;height:100%;background:none;text-align:center;outline:none;font-family:inherit;margin:0}.calendar-body-cell-content{top:5%;left:5%;z-index:1;display:flex;align-items:center;justify-content:center;box-sizing:border-box;width:90%;height:90%;line-height:1;border-width:1px;border-style:solid;border-radius:999px;border-color:transparent}.calendar-body-cell-content.focus-indicator{position:absolute}.calendar-body-active .calendar-body-cell-content{background-color:var(--primary);color:var(--on-primary)}\n"], dependencies: [{ kind: "directive", type: NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: CalendarBody, decorators: [{
            type: Component,
            args: [{ selector: '[calendar-body]', host: {
                        class: 'calendar-body',
                    }, exportAs: 'calendarBody', standalone: true, encapsulation: ViewEncapsulation.None, changeDetection: ChangeDetectionStrategy.OnPush, imports: [NgClass], template: "<!-- eslint-disable @angular-eslint/template/no-call-expression -->\n<!-- Create the first row separately so we can include a special spacer cell. -->\n@for (row of rows; track row; let rowIndex = $index) {\n  <tr role=\"row\">\n    <!--\n      This cell is purely decorative, but we can't put `aria-hidden` or `role=\"presentation\"` on it,\n      because it throws off the week days for the rest of the row on NVDA. The aspect ratio of the\n      table cells is maintained by setting the top and bottom padding as a percentage of the width\n      (a variant of the trick described here: https://www.w3schools.com/howto/howto_css_aspect_ratio.asp).\n    -->\n    @if (rowIndex === 0 && _firstRowOffset) {\n      <td\n        class=\"calendar-body-label\"\n        [attr.colspan]=\"_firstRowOffset\"\n        [style.paddingTop]=\"_cellPadding\"\n        [style.paddingBottom]=\"_cellPadding\"\n      ></td>\n    }\n    <!--\n      Each gridcell in the calendar contains a button, which signals to assistive technology that the\n      cell is intractable, as well as the selection state via `aria-pressed`. See #23476 for\n      background.\n    -->\n    @for (item of row; track item; let colIndex = $index) {\n      <td\n        role=\"gridcell\"\n        class=\"calendar-body-cell-container\"\n        [style.width]=\"_cellWidth\"\n        [style.paddingTop]=\"_cellPadding\"\n        [style.paddingBottom]=\"_cellPadding\"\n        [attr.data-row]=\"rowIndex\"\n        [attr.data-col]=\"colIndex\"\n      >\n        <button\n          type=\"button\"\n          class=\"calendar-body-cell\"\n          [ngClass]=\"item.cssClasses\"\n          [tabindex]=\"_isActiveCell(rowIndex, colIndex) ? 0 : -1\"\n          [class.calendar-body-disabled]=\"!item.enabled\"\n          [class.calendar-body-active]=\"_isActiveCell(rowIndex, colIndex)\"\n          [class.calendar-body-range-start]=\"_isRangeStart(item.compareValue)\"\n          [class.calendar-body-range-end]=\"_isRangeEnd(item.compareValue)\"\n          [class.calendar-body-in-range]=\"_isInRange(item.compareValue)\"\n          [class.calendar-body-comparison-bridge-start]=\"\n            _isComparisonBridgeStart(item.compareValue, rowIndex, colIndex)\n          \"\n          [class.calendar-body-comparison-bridge-end]=\"\n            _isComparisonBridgeEnd(item.compareValue, rowIndex, colIndex)\n          \"\n          [class.calendar-body-comparison-start]=\"_isComparisonStart(item.compareValue)\"\n          [class.calendar-body-comparison-end]=\"_isComparisonEnd(item.compareValue)\"\n          [class.calendar-body-in-comparison-range]=\"_isInComparisonRange(item.compareValue)\"\n          [class.calendar-body-preview-start]=\"_isPreviewStart(item.compareValue)\"\n          [class.calendar-body-preview-end]=\"_isPreviewEnd(item.compareValue)\"\n          [class.calendar-body-in-preview]=\"_isInPreview(item.compareValue)\"\n          [attr.aria-label]=\"item.ariaLabel\"\n          [attr.aria-disabled]=\"!item.enabled || null\"\n          [attr.aria-pressed]=\"_isSelected(item.compareValue)\"\n          [attr.aria-current]=\"todayValue === item.compareValue ? 'date' : null\"\n          [attr.aria-describedby]=\"_getDescribedby(item.compareValue)\"\n          (click)=\"_cellClicked(item, $event)\"\n          (focus)=\"_emitActiveDateChange(item, $event)\"\n        >\n          <span\n            class=\"calendar-body-cell-content focus-indicator\"\n            [class.calendar-body-selected]=\"_isSelected(item.compareValue)\"\n            [class.calendar-body-comparison-identical]=\"_isComparisonIdentical(item.compareValue)\"\n            [class.calendar-body-today]=\"todayValue === item.compareValue\"\n          >\n            {{ item.displayValue }}\n          </span>\n          <span\n            class=\"calendar-body-cell-preview\"\n            aria-hidden=\"true\"\n          ></span>\n        </button>\n      </td>\n    }\n  </tr>\n}\n\n<label\n  class=\"calendar-body-hidden-label\"\n  for=\"\"\n  [id]=\"_startDateLabelId\"\n>\n  {{ startDateAccessibleName }}\n</label>\n\n<label\n  class=\"calendar-body-hidden-label\"\n  for=\"\"\n  [id]=\"_endDateLabelId\"\n>\n  {{ endDateAccessibleName }}\n</label>\n", styles: [".calendar-body{min-width:17.5rem}.calendar-body-today{border-color:var(--border)!important}.calendar-body-label{height:0;line-height:0;text-align:start;padding-left:4.7142857143%;padding-right:4.7142857143%}.calendar-body-hidden-label{display:none}.calendar-body-cell-container{position:relative;height:0;line-height:0}.calendar-body-cell{position:absolute;top:0;left:0;width:100%;height:100%;background:none;text-align:center;outline:none;font-family:inherit;margin:0}.calendar-body-cell-content{top:5%;left:5%;z-index:1;display:flex;align-items:center;justify-content:center;box-sizing:border-box;width:90%;height:90%;line-height:1;border-width:1px;border-style:solid;border-radius:999px;border-color:transparent}.calendar-body-cell-content.focus-indicator{position:absolute}.calendar-body-active .calendar-body-cell-content{background-color:var(--primary);color:var(--on-primary)}\n"] }]
        }], ctorParameters: () => [{ type: i0.ElementRef }, { type: i0.NgZone }], propDecorators: { label: [{
                type: Input
            }], rows: [{
                type: Input
            }], todayValue: [{
                type: Input
            }], startValue: [{
                type: Input
            }], endValue: [{
                type: Input
            }], labelMinRequiredCells: [{
                type: Input
            }], numCols: [{
                type: Input
            }], activeCell: [{
                type: Input
            }], isRange: [{
                type: Input
            }], cellAspectRatio: [{
                type: Input
            }], comparisonStart: [{
                type: Input
            }], comparisonEnd: [{
                type: Input
            }], previewStart: [{
                type: Input
            }], previewEnd: [{
                type: Input
            }], startDateAccessibleName: [{
                type: Input
            }], endDateAccessibleName: [{
                type: Input
            }], selectedValueChange: [{
                type: Output
            }], previewChange: [{
                type: Output
            }], activeDateChange: [{
                type: Output
            }], dragStarted: [{
                type: Output
            }], dragEnded: [{
                type: Output
            }] } });
/** Checks whether a node is a table cell element. */
function isTableCell(node) {
    return node?.nodeName === 'TD';
}
/**
 * Gets the date table cell element that is or contains the specified element.
 * Or returns null if element is not part of a date cell.
 */
function getCellElement(element) {
    let cell;
    if (isTableCell(element)) {
        cell = element;
    }
    else if (isTableCell(element.parentNode)) {
        cell = element.parentNode;
    }
    else if (isTableCell(element.parentNode?.parentNode)) {
        cell = element.parentNode.parentNode;
    }
    return cell?.getAttribute('data-row') != null ? cell : null;
}
/** Checks whether a value is the start of a range. */
function isStart(value, start, end) {
    return end !== null && start !== end && value < end && value === start;
}
/** Checks whether a value is the end of a range. */
function isEnd(value, start, end) {
    return start !== null && start !== end && value >= start && value === end;
}
/** Checks whether a value is inside of a range. */
function isInRange(value, start, end, rangeEnabled) {
    return (rangeEnabled &&
        start !== null &&
        end !== null &&
        start !== end &&
        value >= start &&
        value <= end);
}
/**
 * Extracts the element that actually corresponds to a touch event's location
 * (rather than the element that initiated the sequence of touch events).
 */
function getActualTouchTarget(event) {
    const touchLocation = event.changedTouches[0];
    return document.elementFromPoint(touchLocation.clientX, touchLocation.clientY);
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * An internal component used to display a single year in the datepicker.
 * @docs-private
 */
class YearView {
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
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: YearView, deps: [{ token: i0.ChangeDetectorRef }, { token: DATE_FORMATS, optional: true }, { token: DateAdapter, optional: true }, { token: i2.Directionality, optional: true }], target: i0.ɵɵFactoryTarget.Component });
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
                }] }, { type: DateAdapter, decorators: [{
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

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const DAYS_PER_WEEK = 7;
/**
 * An internal component used to display a single month in the datepicker.
 * @docs-private
 */
class MonthView {
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
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: MonthView, deps: [{ token: i0.ChangeDetectorRef }, { token: DATE_FORMATS, optional: true }, { token: DateAdapter, optional: true }, { token: i2.Directionality, optional: true }], target: i0.ɵɵFactoryTarget.Component });
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
                }] }, { type: DateAdapter, decorators: [{
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

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const yearsPerPage = 24;
const yearsPerRow = 4;
/**
 * An internal component used to display a year selector in the datepicker.
 * @docs-private
 */
class MultiYearView {
    _changeDetectorRef;
    _dateAdapter;
    _dir;
    _rerenderSubscription = Subscription.EMPTY;
    /** Flag used to filter out space/enter keyup events that originated outside of the view. */
    _selectionKeyPressed;
    /** The date to display in this multi-year view (everything other than the year is ignored). */
    get activeDate() {
        return this._activeDate;
    }
    set activeDate(value) {
        const oldActiveDate = this._activeDate;
        const validDate = this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(value)) ||
            this._dateAdapter.today();
        this._activeDate = this._dateAdapter.clampDate(validDate, this.minDate, this.maxDate);
        if (!isSameMultiYearView(this._dateAdapter, oldActiveDate, this._activeDate, this.minDate, this.maxDate)) {
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
        this._setSelectedYear(value);
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
    /** Emits when a new year is selected. */
    selectedChange = new EventEmitter();
    /** Emits the selected year. This doesn't imply a change on the selected date */
    yearSelected = new EventEmitter();
    /** Emits when any date is activated. */
    activeDateChange = new EventEmitter();
    /** The body of calendar table */
    _calendarBody;
    /** Grid of calendar cells representing the currently displayed years. */
    _years;
    /** The year that today falls on. */
    _todayYear;
    /** The year of the selected date. Null if the selected date is null. */
    _selectedYear;
    constructor(_changeDetectorRef, _dateAdapter, _dir) {
        this._changeDetectorRef = _changeDetectorRef;
        this._dateAdapter = _dateAdapter;
        this._dir = _dir;
        if (!this._dateAdapter) {
            throw createMissingDateImplError('DateAdapter');
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
    /** Initializes this multi-year view. */
    _init() {
        this._todayYear = this._dateAdapter.getYear(this._dateAdapter.today());
        // We want a range years such that we maximize the number of
        // enabled dates visible at once. This prevents issues where the minimum year
        // is the last item of a page OR the maximum year is the first item of a page.
        // The offset from the active year to the "slot" for the starting year is the
        // *actual* first rendered year in the multi-year view.
        const activeYear = this._dateAdapter.getYear(this._activeDate);
        const minYearOfPage = activeYear - getActiveOffset(this._dateAdapter, this.activeDate, this.minDate, this.maxDate);
        this._years = [];
        for (let i = 0, row = []; i < yearsPerPage; i++) {
            row.push(minYearOfPage + i);
            if (row.length == yearsPerRow) {
                this._years.push(row.map((year) => this._createCellForYear(year)));
                row = [];
            }
        }
        this._changeDetectorRef.markForCheck();
    }
    /** Handles when a new year is selected. */
    _yearSelected(event) {
        const year = event.value;
        const selectedYear = this._dateAdapter.createDate(year, 0, 1);
        const selectedDate = this._getDateFromYear(year);
        this.yearSelected.emit(selectedYear);
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
        const year = event.value;
        const oldActiveDate = this._activeDate;
        this.activeDate = this._getDateFromYear(year);
        if (this._dateAdapter.compareDate(oldActiveDate, this.activeDate)) {
            this.activeDateChange.emit(this.activeDate);
        }
    }
    /** Handles keydown events on the calendar body when calendar is in multi-year view. */
    _handleCalendarBodyKeydown(event) {
        const oldActiveDate = this._activeDate;
        const isRtl = this._isRtl();
        switch (event.keyCode) {
            case LEFT_ARROW:
                this.activeDate = this._dateAdapter.addCalendarYears(this._activeDate, isRtl ? 1 : -1);
                break;
            case RIGHT_ARROW:
                this.activeDate = this._dateAdapter.addCalendarYears(this._activeDate, isRtl ? -1 : 1);
                break;
            case UP_ARROW:
                this.activeDate = this._dateAdapter.addCalendarYears(this._activeDate, -yearsPerRow);
                break;
            case DOWN_ARROW:
                this.activeDate = this._dateAdapter.addCalendarYears(this._activeDate, yearsPerRow);
                break;
            case HOME:
                this.activeDate = this._dateAdapter.addCalendarYears(this._activeDate, -getActiveOffset(this._dateAdapter, this.activeDate, this.minDate, this.maxDate));
                break;
            case END:
                this.activeDate = this._dateAdapter.addCalendarYears(this._activeDate, yearsPerPage -
                    getActiveOffset(this._dateAdapter, this.activeDate, this.minDate, this.maxDate) -
                    1);
                break;
            case PAGE_UP:
                this.activeDate = this._dateAdapter.addCalendarYears(this._activeDate, event.altKey ? -yearsPerPage * 10 : -yearsPerPage);
                break;
            case PAGE_DOWN:
                this.activeDate = this._dateAdapter.addCalendarYears(this._activeDate, event.altKey ? yearsPerPage * 10 : yearsPerPage);
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
        }
        this._focusActiveCellAfterViewChecked();
        // Prevent unexpected default actions such as form submission.
        event.preventDefault();
    }
    /** Handles keyup events on the calendar body when calendar is in multi-year view. */
    _handleCalendarBodyKeyup(event) {
        if (event.keyCode === SPACE || event.keyCode === ENTER) {
            if (this._selectionKeyPressed) {
                this._yearSelected({ value: this._dateAdapter.getYear(this._activeDate), event });
            }
            this._selectionKeyPressed = false;
        }
    }
    _getActiveCell() {
        return getActiveOffset(this._dateAdapter, this.activeDate, this.minDate, this.maxDate);
    }
    /** Focuses the active cell after the microtask queue is empty. */
    _focusActiveCell() {
        this._calendarBody._focusActiveCell();
    }
    /** Focuses the active cell after change detection has run and the microtask queue is empty. */
    _focusActiveCellAfterViewChecked() {
        this._calendarBody._scheduleFocusActiveCellAfterViewChecked();
    }
    /**
     * Takes a year and returns a new date on the same day and month as the currently active date
     *  The returned date will have the same year as the argument date.
     */
    _getDateFromYear(year) {
        const activeMonth = this._dateAdapter.getMonth(this.activeDate);
        const daysInMonth = this._dateAdapter.getNumDaysInMonth(this._dateAdapter.createDate(year, activeMonth, 1));
        const normalizedDate = this._dateAdapter.createDate(year, activeMonth, Math.min(this._dateAdapter.getDate(this.activeDate), daysInMonth));
        return normalizedDate;
    }
    /** Creates an CalendarCell for the given year. */
    _createCellForYear(year) {
        const date = this._dateAdapter.createDate(year, 0, 1);
        const yearName = this._dateAdapter.getYearName(date);
        const cellClasses = this.dateClass ? this.dateClass(date, 'multi-year') : undefined;
        return new CalendarCell(year, yearName, yearName, this._shouldEnableYear(year), cellClasses);
    }
    /** Whether the given year is enabled. */
    _shouldEnableYear(year) {
        // disable if the year is greater than maxDate lower than minDate
        if (year === undefined ||
            year === null ||
            (this.maxDate && year > this._dateAdapter.getYear(this.maxDate)) ||
            (this.minDate && year < this._dateAdapter.getYear(this.minDate))) {
            return false;
        }
        // enable if it reaches here and there's no filter defined
        if (!this.dateFilter) {
            return true;
        }
        const firstOfYear = this._dateAdapter.createDate(year, 0, 1);
        // If any date in the year is enabled count the year as enabled.
        for (let date = firstOfYear; this._dateAdapter.getYear(date) == year; date = this._dateAdapter.addCalendarDays(date, 1)) {
            if (this.dateFilter(date)) {
                return true;
            }
        }
        return false;
    }
    /** Determines whether the user has the RTL layout direction. */
    _isRtl() {
        return this._dir && this._dir.value === 'rtl';
    }
    /** Sets the currently-highlighted year based on a model value. */
    _setSelectedYear(value) {
        this._selectedYear = null;
        if (value instanceof DateRange) {
            const displayValue = value.start || value.end;
            if (displayValue) {
                this._selectedYear = this._dateAdapter.getYear(displayValue);
            }
        }
        else if (value) {
            this._selectedYear = this._dateAdapter.getYear(value);
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: MultiYearView, deps: [{ token: i0.ChangeDetectorRef }, { token: DateAdapter, optional: true }, { token: i2.Directionality, optional: true }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "18.2.8", type: MultiYearView, isStandalone: true, selector: "multi-year-view", inputs: { activeDate: "activeDate", selected: "selected", minDate: "minDate", maxDate: "maxDate", dateFilter: "dateFilter", dateClass: "dateClass" }, outputs: { selectedChange: "selectedChange", yearSelected: "yearSelected", activeDateChange: "activeDateChange" }, viewQueries: [{ propertyName: "_calendarBody", first: true, predicate: CalendarBody, descendants: true }], exportAs: ["multiYearView"], ngImport: i0, template: "<!-- eslint-disable @angular-eslint/template/interactive-supports-focus -->\n<table\n  class=\"calendar-table\"\n  role=\"grid\"\n>\n  <thead\n    aria-hidden=\"true\"\n    class=\"calendar-table-header\"\n  >\n    <tr>\n      <th\n        class=\"calendar-table-header-divider\"\n        colspan=\"4\"\n      ></th>\n    </tr>\n  </thead>\n  <tbody\n    calendar-body\n    [rows]=\"_years\"\n    [todayValue]=\"_todayYear\"\n    [startValue]=\"_selectedYear!\"\n    [endValue]=\"_selectedYear!\"\n    [numCols]=\"4\"\n    [cellAspectRatio]=\"4 / 7\"\n    [activeCell]=\"_getActiveCell()\"\n    (selectedValueChange)=\"_yearSelected($event)\"\n    (activeDateChange)=\"_updateActiveDate($event)\"\n    (keyup)=\"_handleCalendarBodyKeyup($event)\"\n    (keydown)=\"_handleCalendarBodyKeydown($event)\"\n  ></tbody>\n</table>\n", dependencies: [{ kind: "component", type: CalendarBody, selector: "[calendar-body]", inputs: ["label", "rows", "todayValue", "startValue", "endValue", "labelMinRequiredCells", "numCols", "activeCell", "isRange", "cellAspectRatio", "comparisonStart", "comparisonEnd", "previewStart", "previewEnd", "startDateAccessibleName", "endDateAccessibleName"], outputs: ["selectedValueChange", "previewChange", "activeDateChange", "dragStarted", "dragEnded"], exportAs: ["calendarBody"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: MultiYearView, decorators: [{
            type: Component,
            args: [{ selector: 'multi-year-view', exportAs: 'multiYearView', encapsulation: ViewEncapsulation.None, changeDetection: ChangeDetectionStrategy.OnPush, standalone: true, imports: [CalendarBody], template: "<!-- eslint-disable @angular-eslint/template/interactive-supports-focus -->\n<table\n  class=\"calendar-table\"\n  role=\"grid\"\n>\n  <thead\n    aria-hidden=\"true\"\n    class=\"calendar-table-header\"\n  >\n    <tr>\n      <th\n        class=\"calendar-table-header-divider\"\n        colspan=\"4\"\n      ></th>\n    </tr>\n  </thead>\n  <tbody\n    calendar-body\n    [rows]=\"_years\"\n    [todayValue]=\"_todayYear\"\n    [startValue]=\"_selectedYear!\"\n    [endValue]=\"_selectedYear!\"\n    [numCols]=\"4\"\n    [cellAspectRatio]=\"4 / 7\"\n    [activeCell]=\"_getActiveCell()\"\n    (selectedValueChange)=\"_yearSelected($event)\"\n    (activeDateChange)=\"_updateActiveDate($event)\"\n    (keyup)=\"_handleCalendarBodyKeyup($event)\"\n    (keydown)=\"_handleCalendarBodyKeydown($event)\"\n  ></tbody>\n</table>\n" }]
        }], ctorParameters: () => [{ type: i0.ChangeDetectorRef }, { type: DateAdapter, decorators: [{
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
            }], yearSelected: [{
                type: Output
            }], activeDateChange: [{
                type: Output
            }], _calendarBody: [{
                type: ViewChild,
                args: [CalendarBody]
            }] } });
function isSameMultiYearView(dateAdapter, date1, date2, minDate, maxDate) {
    const year1 = dateAdapter.getYear(date1);
    const year2 = dateAdapter.getYear(date2);
    const startingYear = getStartingYear(dateAdapter, minDate, maxDate);
    return (Math.floor((year1 - startingYear) / yearsPerPage) ===
        Math.floor((year2 - startingYear) / yearsPerPage));
}
/**
 * When the multi-year view is first opened, the active year will be in view.
 * So we compute how many years are between the active year and the *slot* where our
 * "startingYear" will render when paged into view.
 */
function getActiveOffset(dateAdapter, activeDate, minDate, maxDate) {
    const activeYear = dateAdapter.getYear(activeDate);
    return euclideanModulo(activeYear - getStartingYear(dateAdapter, minDate, maxDate), yearsPerPage);
}
/**
 * We pick a "starting" year such that either the maximum year would be at the end
 * or the minimum year would be at the beginning of a page.
 */
function getStartingYear(dateAdapter, minDate, maxDate) {
    let startingYear = 0;
    if (maxDate) {
        const maxYear = dateAdapter.getYear(maxDate);
        startingYear = maxYear - yearsPerPage + 1;
    }
    else if (minDate) {
        startingYear = dateAdapter.getYear(minDate);
    }
    return startingYear;
}
/** Gets remainder that is non-negative, even if first number is negative */
function euclideanModulo(a, b) {
    return ((a % b) + b) % b;
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
let calendarHeaderId = 1;
/** Default header for MatCalendar */
class CalendarHeader {
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
                : this._dateAdapter.addCalendarYears(this.calendar.activeDate, this.calendar.currentView == 'year' ? -1 : -yearsPerPage);
    }
    /** Handles user clicks on the next button. */
    nextClicked() {
        this.calendar.activeDate =
            this.calendar.currentView == 'month'
                ? this._dateAdapter.addCalendarMonths(this.calendar.activeDate, 1)
                : this._dateAdapter.addCalendarYears(this.calendar.activeDate, this.calendar.currentView == 'year' ? 1 : yearsPerPage);
    }
    /** Whether the previous period button is enabled. */
    previousEnabled() {
        if (!this.calendar.minDate) {
            return true;
        }
        return (!this.calendar.minDate || !this._isSameView(this.calendar.activeDate, this.calendar.minDate));
    }
    /** Whether the next period button is enabled. */
    nextEnabled() {
        return (!this.calendar.maxDate || !this._isSameView(this.calendar.activeDate, this.calendar.maxDate));
    }
    /** Whether the two dates represent the same view in the current view mode (month or year). */
    _isSameView(date1, date2) {
        if (this.calendar.currentView == 'month') {
            return (this._dateAdapter.getYear(date1) == this._dateAdapter.getYear(date2) &&
                this._dateAdapter.getMonth(date1) == this._dateAdapter.getMonth(date2));
        }
        if (this.calendar.currentView == 'year') {
            return this._dateAdapter.getYear(date1) == this._dateAdapter.getYear(date2);
        }
        // Otherwise we are in 'multi-year' view.
        return isSameMultiYearView(this._dateAdapter, date1, date2, this.calendar.minDate, this.calendar.maxDate);
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
        const minYearOfPage = activeYear -
            getActiveOffset(this._dateAdapter, this.calendar.activeDate, this.calendar.minDate, this.calendar.maxDate);
        const maxYearOfPage = minYearOfPage + yearsPerPage - 1;
        const minYearLabel = this._dateAdapter.getYearName(this._dateAdapter.createDate(minYearOfPage, 0, 1));
        const maxYearLabel = this._dateAdapter.getYearName(this._dateAdapter.createDate(maxYearOfPage, 0, 1));
        return [minYearLabel, maxYearLabel];
    }
    _id = `calendar-header-${calendarHeaderId++}`;
    _periodButtonLabelId = `${this._id}-period-label`;
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: CalendarHeader, deps: [{ token: forwardRef(() => Calendar) }, { token: DateAdapter, optional: true }, { token: DATE_FORMATS, optional: true }, { token: i0.ChangeDetectorRef }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "18.2.8", type: CalendarHeader, isStandalone: true, selector: "calendar-header", exportAs: ["calendarHeader"], ngImport: i0, template: "<div class=\"px-3 pt-2.5 pb-0 flex items-center justify-between\">\n  <!-- [Firefox Issue: https://bugzilla.mozilla.org/show_bug.cgi?id=1880533]\n    Relocated label next to related button and made visually hidden via cdk-visually-hidden\n    to enable label to appear in a11y tree for SR when using Firefox -->\n  <label\n    class=\"hidden cdk-visually-hidden\"\n    for=\"\"\n    [id]=\"_periodButtonLabelId\"\n  >\n    {{ periodButtonDescription }}\n  </label>\n\n  <button\n    class=\"btn btn-ghost\"\n    aria-live=\"polite\"\n    [attr.aria-label]=\"periodButtonLabel\"\n    [attr.aria-describedby]=\"_periodButtonLabelId\"\n    (click)=\"currentPeriodClicked()\"\n  >\n    <span aria-hidden=\"true\">{{ periodButtonText }}</span>\n\n    <svg\n      class=\"w-3 h-3\"\n      fill=\"none\"\n      viewBox=\"0 0 24 24\"\n      stroke-width=\"3\"\n      stroke=\"currentColor\"\n    >\n      <path\n        stroke-linecap=\"round\"\n        stroke-linejoin=\"round\"\n        d=\"m19.5 8.25-7.5 7.5-7.5-7.5\"\n      />\n    </svg>\n  </button>\n\n  <div class=\"flex-auto\"></div>\n\n  <ng-content />\n\n  <button\n    type=\"button\"\n    class=\"btn btn-ghost btn-circle btn-sm\"\n    [disabled]=\"!previousEnabled()\"\n    [attr.aria-label]=\"prevButtonLabel\"\n    (click)=\"previousClicked()\"\n  >\n    <svg\n      class=\"w-6 h-6\"\n      fill=\"none\"\n      viewBox=\"0 0 24 24\"\n      stroke-width=\"2\"\n      stroke=\"currentColor\"\n    >\n      <path\n        stroke-linecap=\"round\"\n        stroke-linejoin=\"round\"\n        d=\"M15.75 19.5 8.25 12l7.5-7.5\"\n      />\n    </svg>\n  </button>\n\n  <button\n    type=\"button\"\n    class=\"btn btn-ghost btn-circle btn-sm\"\n    [disabled]=\"!nextEnabled()\"\n    [attr.aria-label]=\"nextButtonLabel\"\n    (click)=\"nextClicked()\"\n  >\n    <svg\n      class=\"w-6 h-6\"\n      fill=\"none\"\n      viewBox=\"0 0 24 24\"\n      stroke-width=\"2\"\n      stroke=\"currentColor\"\n    >\n      <path\n        stroke-linecap=\"round\"\n        stroke-linejoin=\"round\"\n        d=\"m8.25 4.5 7.5 7.5-7.5 7.5\"\n      />\n    </svg>\n  </button>\n</div>\n", changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: CalendarHeader, decorators: [{
            type: Component,
            args: [{ standalone: true, selector: 'calendar-header', encapsulation: ViewEncapsulation.None, changeDetection: ChangeDetectionStrategy.OnPush, exportAs: 'calendarHeader', template: "<div class=\"px-3 pt-2.5 pb-0 flex items-center justify-between\">\n  <!-- [Firefox Issue: https://bugzilla.mozilla.org/show_bug.cgi?id=1880533]\n    Relocated label next to related button and made visually hidden via cdk-visually-hidden\n    to enable label to appear in a11y tree for SR when using Firefox -->\n  <label\n    class=\"hidden cdk-visually-hidden\"\n    for=\"\"\n    [id]=\"_periodButtonLabelId\"\n  >\n    {{ periodButtonDescription }}\n  </label>\n\n  <button\n    class=\"btn btn-ghost\"\n    aria-live=\"polite\"\n    [attr.aria-label]=\"periodButtonLabel\"\n    [attr.aria-describedby]=\"_periodButtonLabelId\"\n    (click)=\"currentPeriodClicked()\"\n  >\n    <span aria-hidden=\"true\">{{ periodButtonText }}</span>\n\n    <svg\n      class=\"w-3 h-3\"\n      fill=\"none\"\n      viewBox=\"0 0 24 24\"\n      stroke-width=\"3\"\n      stroke=\"currentColor\"\n    >\n      <path\n        stroke-linecap=\"round\"\n        stroke-linejoin=\"round\"\n        d=\"m19.5 8.25-7.5 7.5-7.5-7.5\"\n      />\n    </svg>\n  </button>\n\n  <div class=\"flex-auto\"></div>\n\n  <ng-content />\n\n  <button\n    type=\"button\"\n    class=\"btn btn-ghost btn-circle btn-sm\"\n    [disabled]=\"!previousEnabled()\"\n    [attr.aria-label]=\"prevButtonLabel\"\n    (click)=\"previousClicked()\"\n  >\n    <svg\n      class=\"w-6 h-6\"\n      fill=\"none\"\n      viewBox=\"0 0 24 24\"\n      stroke-width=\"2\"\n      stroke=\"currentColor\"\n    >\n      <path\n        stroke-linecap=\"round\"\n        stroke-linejoin=\"round\"\n        d=\"M15.75 19.5 8.25 12l7.5-7.5\"\n      />\n    </svg>\n  </button>\n\n  <button\n    type=\"button\"\n    class=\"btn btn-ghost btn-circle btn-sm\"\n    [disabled]=\"!nextEnabled()\"\n    [attr.aria-label]=\"nextButtonLabel\"\n    (click)=\"nextClicked()\"\n  >\n    <svg\n      class=\"w-6 h-6\"\n      fill=\"none\"\n      viewBox=\"0 0 24 24\"\n      stroke-width=\"2\"\n      stroke=\"currentColor\"\n    >\n      <path\n        stroke-linecap=\"round\"\n        stroke-linejoin=\"round\"\n        d=\"m8.25 4.5 7.5 7.5-7.5 7.5\"\n      />\n    </svg>\n  </button>\n</div>\n" }]
        }], ctorParameters: () => [{ type: Calendar, decorators: [{
                    type: Inject,
                    args: [forwardRef(() => Calendar)]
                }] }, { type: DateAdapter, decorators: [{
                    type: Optional
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [DATE_FORMATS]
                }] }, { type: i0.ChangeDetectorRef }] });

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/** A calendar that is used as part of the datepicker. */
class Calendar {
    _dateAdapter;
    _dateFormats;
    _changeDetectorRef;
    /** An input indicating the type of the header component, if set. */
    headerComponent;
    /** A portal containing the header component type for this calendar. */
    _calendarHeaderPortal;
    /**
     * Used for scheduling that focus should be moved to the active cell on the next tick.
     * We need to schedule it, rather than do it immediately, because we have to wait
     * for Angular to re-evaluate the view children.
     */
    _moveFocusOnNextTick = false;
    /** A date representing the period (month or year) to start the calendar in. */
    get startAt() {
        return this._startAt;
    }
    set startAt(value) {
        this._startAt = this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(value));
    }
    _startAt;
    /** Whether the calendar should be started in month or year view. */
    startView = 'month';
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
    /** Emits when the currently selected date changes. */
    selectedChange = new EventEmitter();
    /**
     * Emits the year chosen in multiyear view.
     * This doesn't imply a change on the selected date.
     */
    yearSelected = new EventEmitter();
    /**
     * Emits the month chosen in year view.
     * This doesn't imply a change on the selected date.
     */
    monthSelected = new EventEmitter();
    /**
     * Emits when the current view changes.
     */
    viewChanged = new EventEmitter(true);
    /** Emits when any date is selected. */
    _userSelection = new EventEmitter();
    /** Emits a new date range value when the user completes a drag drop operation. */
    _userDragDrop = new EventEmitter();
    /** Reference to the current month view component. */
    monthView;
    /** Reference to the current year view component. */
    yearView;
    /** Reference to the current multi-year view component. */
    multiYearView;
    /**
     * The current active date. This determines which time period is shown and which date is
     * highlighted when using keyboard navigation.
     */
    get activeDate() {
        return this._clampedActiveDate;
    }
    set activeDate(value) {
        this._clampedActiveDate = this._dateAdapter.clampDate(value, this.minDate, this.maxDate);
        this.stateChanges.next();
        this._changeDetectorRef.markForCheck();
    }
    _clampedActiveDate;
    /** Whether the calendar is in month view. */
    get currentView() {
        return this._currentView;
    }
    set currentView(value) {
        const viewChangedResult = this._currentView !== value ? value : null;
        this._currentView = value;
        this._moveFocusOnNextTick = true;
        this._changeDetectorRef.markForCheck();
        if (viewChangedResult) {
            this.viewChanged.emit(viewChangedResult);
        }
    }
    _currentView;
    /** Origin of active drag, or null when dragging is not active. */
    _activeDrag = null;
    /**
     * Emits whenever there is a state change that the header may need to respond to.
     */
    stateChanges = new Subject();
    constructor(_dateAdapter, _dateFormats, _changeDetectorRef) {
        this._dateAdapter = _dateAdapter;
        this._dateFormats = _dateFormats;
        this._changeDetectorRef = _changeDetectorRef;
        if (!this._dateAdapter) {
            throw createMissingDateImplError('DateAdapter');
        }
        if (!this._dateFormats) {
            throw createMissingDateImplError('DATE_FORMATS');
        }
    }
    ngAfterContentInit() {
        this._calendarHeaderPortal = new ComponentPortal(this.headerComponent || CalendarHeader);
        this.activeDate = this.startAt || this._dateAdapter.today();
        // Assign to the private property since we don't want to move focus on init.
        this._currentView = this.startView;
    }
    ngAfterViewChecked() {
        if (this._moveFocusOnNextTick) {
            this._moveFocusOnNextTick = false;
            this.focusActiveCell();
        }
    }
    ngOnDestroy() {
        this.stateChanges.complete();
    }
    ngOnChanges(changes) {
        // Ignore date changes that are at a different time on the same day. This fixes issues where
        // the calendar re-renders when there is no meaningful change to [minDate] or [maxDate]
        // (#24435).
        const minDateChange = changes['minDate'] &&
            !this._dateAdapter.sameDate(changes['minDate'].previousValue, changes['minDate'].currentValue)
            ? changes['minDate']
            : undefined;
        const maxDateChange = changes['maxDate'] &&
            !this._dateAdapter.sameDate(changes['maxDate'].previousValue, changes['maxDate'].currentValue)
            ? changes['maxDate']
            : undefined;
        const change = minDateChange || maxDateChange || changes['dateFilter'];
        if (change && !change.firstChange) {
            const view = this._getCurrentViewComponent();
            if (view) {
                // We need to `detectChanges` manually here, because the `minDate`, `maxDate` etc. are
                // passed down to the view via data bindings which won't be up-to-date when we call `_init`.
                this._changeDetectorRef.detectChanges();
                view._init();
            }
        }
        this.stateChanges.next();
    }
    /** Focuses the active date. */
    focusActiveCell() {
        this._getCurrentViewComponent()._focusActiveCell(false);
    }
    /** Updates today's date after an update of the active date */
    updateTodaysDate() {
        this._getCurrentViewComponent()._init();
    }
    /** Handles date selection in the month view. */
    _dateSelected(event) {
        const date = event.value;
        if (this.selected instanceof DateRange ||
            (date && !this._dateAdapter.sameDate(date, this.selected))) {
            this.selectedChange.emit(date);
        }
        this._userSelection.emit(event);
    }
    /** Handles year selection in the multiyear view. */
    _yearSelectedInMultiYearView(normalizedYear) {
        this.yearSelected.emit(normalizedYear);
    }
    /** Handles month selection in the year view. */
    _monthSelectedInYearView(normalizedMonth) {
        this.monthSelected.emit(normalizedMonth);
    }
    /** Handles year/month selection in the multi-year/year views. */
    _goToDateInView(date, view) {
        this.activeDate = date;
        this.currentView = view;
    }
    /** Called when the user starts dragging to change a date range. */
    _dragStarted(event) {
        this._activeDrag = event;
    }
    /**
     * Called when a drag completes. It may end in cancelation or in the selection
     * of a new range.
     */
    _dragEnded(event) {
        if (!this._activeDrag)
            return;
        if (event.value) {
            this._userDragDrop.emit(event);
        }
        this._activeDrag = null;
    }
    /** Returns the component instance that corresponds to the current calendar view. */
    _getCurrentViewComponent() {
        // The return type is explicitly written as a union to ensure that the Closure compiler does
        // not optimize calls to _init(). Without the explicit return type, TypeScript narrows it to
        // only the first component type. See https://github.com/angular/components/issues/22996.
        return this.monthView || this.yearView || this.multiYearView;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: Calendar, deps: [{ token: DateAdapter, optional: true }, { token: DATE_FORMATS, optional: true }, { token: i0.ChangeDetectorRef }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "18.2.8", type: Calendar, isStandalone: true, selector: "calendar", inputs: { headerComponent: "headerComponent", startAt: "startAt", startView: "startView", selected: "selected", minDate: "minDate", maxDate: "maxDate", dateFilter: "dateFilter", dateClass: "dateClass", comparisonStart: "comparisonStart", comparisonEnd: "comparisonEnd", startDateAccessibleName: "startDateAccessibleName", endDateAccessibleName: "endDateAccessibleName" }, outputs: { selectedChange: "selectedChange", yearSelected: "yearSelected", monthSelected: "monthSelected", viewChanged: "viewChanged", _userSelection: "_userSelection", _userDragDrop: "_userDragDrop" }, host: { classAttribute: "calendar" }, providers: [SINGLE_DATE_SELECTION_MODEL_PROVIDER], viewQueries: [{ propertyName: "monthView", first: true, predicate: MonthView, descendants: true }, { propertyName: "yearView", first: true, predicate: YearView, descendants: true }, { propertyName: "multiYearView", first: true, predicate: MultiYearView, descendants: true }], exportAs: ["calendar"], usesOnChanges: true, ngImport: i0, template: "<ng-template [cdkPortalOutlet]=\"_calendarHeaderPortal\" />\n\n<div\n  class=\"px-3 pt-1.5\"\n  cdkMonitorSubtreeFocus\n  tabindex=\"-1\"\n>\n  @switch (currentView) {\n    @case ('month') {\n      <month-view\n        [selected]=\"selected\"\n        [dateFilter]=\"dateFilter\"\n        [maxDate]=\"maxDate\"\n        [minDate]=\"minDate\"\n        [dateClass]=\"dateClass\"\n        [comparisonStart]=\"comparisonStart\"\n        [comparisonEnd]=\"comparisonEnd\"\n        [activeDrag]=\"_activeDrag\"\n        [(activeDate)]=\"activeDate\"\n        (_userSelection)=\"_dateSelected($event)\"\n        (dragStarted)=\"_dragStarted($event)\"\n        (dragEnded)=\"_dragEnded($event)\"\n      />\n    }\n\n    @case ('year') {\n      <year-view\n        [selected]=\"selected\"\n        [dateFilter]=\"dateFilter\"\n        [maxDate]=\"maxDate\"\n        [minDate]=\"minDate\"\n        [dateClass]=\"dateClass\"\n        [(activeDate)]=\"activeDate\"\n        (monthSelected)=\"_monthSelectedInYearView($event)\"\n        (selectedChange)=\"_goToDateInView($event, 'month')\"\n      />\n    }\n\n    @case ('multi-year') {\n      <multi-year-view\n        [selected]=\"selected\"\n        [dateFilter]=\"dateFilter\"\n        [maxDate]=\"maxDate\"\n        [minDate]=\"minDate\"\n        [dateClass]=\"dateClass\"\n        [(activeDate)]=\"activeDate\"\n        (yearSelected)=\"_yearSelectedInMultiYearView($event)\"\n        (selectedChange)=\"_goToDateInView($event, 'year')\"\n      />\n    }\n  }\n</div>\n", styles: [".calendar .calendar-table{width:100%;border-collapse:collapse}.calendar .calendar-table-header th{font-size:.875rem;font-weight:400;color:var(--text-hint);padding-bottom:.5rem}\n"], dependencies: [{ kind: "directive", type: CdkPortalOutlet, selector: "[cdkPortalOutlet]", inputs: ["cdkPortalOutlet"], outputs: ["attached"], exportAs: ["cdkPortalOutlet"] }, { kind: "directive", type: CdkMonitorFocus, selector: "[cdkMonitorElementFocus], [cdkMonitorSubtreeFocus]", outputs: ["cdkFocusChange"], exportAs: ["cdkMonitorFocus"] }, { kind: "component", type: MonthView, selector: "month-view", inputs: ["activeDate", "selected", "minDate", "maxDate", "dateFilter", "dateClass", "comparisonStart", "comparisonEnd", "startDateAccessibleName", "endDateAccessibleName", "activeDrag"], outputs: ["selectedChange", "_userSelection", "dragStarted", "dragEnded", "activeDateChange"], exportAs: ["monthView"] }, { kind: "component", type: YearView, selector: "year-view", inputs: ["activeDate", "selected", "minDate", "maxDate", "dateFilter", "dateClass"], outputs: ["selectedChange", "monthSelected", "activeDateChange"], exportAs: ["yearView"] }, { kind: "component", type: MultiYearView, selector: "multi-year-view", inputs: ["activeDate", "selected", "minDate", "maxDate", "dateFilter", "dateClass"], outputs: ["selectedChange", "yearSelected", "activeDateChange"], exportAs: ["multiYearView"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: Calendar, decorators: [{
            type: Component,
            args: [{ selector: 'calendar', host: {
                        class: 'calendar',
                    }, exportAs: 'calendar', encapsulation: ViewEncapsulation.None, changeDetection: ChangeDetectionStrategy.OnPush, providers: [SINGLE_DATE_SELECTION_MODEL_PROVIDER], standalone: true, imports: [CdkPortalOutlet, CdkMonitorFocus, MonthView, YearView, MultiYearView], template: "<ng-template [cdkPortalOutlet]=\"_calendarHeaderPortal\" />\n\n<div\n  class=\"px-3 pt-1.5\"\n  cdkMonitorSubtreeFocus\n  tabindex=\"-1\"\n>\n  @switch (currentView) {\n    @case ('month') {\n      <month-view\n        [selected]=\"selected\"\n        [dateFilter]=\"dateFilter\"\n        [maxDate]=\"maxDate\"\n        [minDate]=\"minDate\"\n        [dateClass]=\"dateClass\"\n        [comparisonStart]=\"comparisonStart\"\n        [comparisonEnd]=\"comparisonEnd\"\n        [activeDrag]=\"_activeDrag\"\n        [(activeDate)]=\"activeDate\"\n        (_userSelection)=\"_dateSelected($event)\"\n        (dragStarted)=\"_dragStarted($event)\"\n        (dragEnded)=\"_dragEnded($event)\"\n      />\n    }\n\n    @case ('year') {\n      <year-view\n        [selected]=\"selected\"\n        [dateFilter]=\"dateFilter\"\n        [maxDate]=\"maxDate\"\n        [minDate]=\"minDate\"\n        [dateClass]=\"dateClass\"\n        [(activeDate)]=\"activeDate\"\n        (monthSelected)=\"_monthSelectedInYearView($event)\"\n        (selectedChange)=\"_goToDateInView($event, 'month')\"\n      />\n    }\n\n    @case ('multi-year') {\n      <multi-year-view\n        [selected]=\"selected\"\n        [dateFilter]=\"dateFilter\"\n        [maxDate]=\"maxDate\"\n        [minDate]=\"minDate\"\n        [dateClass]=\"dateClass\"\n        [(activeDate)]=\"activeDate\"\n        (yearSelected)=\"_yearSelectedInMultiYearView($event)\"\n        (selectedChange)=\"_goToDateInView($event, 'year')\"\n      />\n    }\n  }\n</div>\n", styles: [".calendar .calendar-table{width:100%;border-collapse:collapse}.calendar .calendar-table-header th{font-size:.875rem;font-weight:400;color:var(--text-hint);padding-bottom:.5rem}\n"] }]
        }], ctorParameters: () => [{ type: DateAdapter, decorators: [{
                    type: Optional
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [DATE_FORMATS]
                }] }, { type: i0.ChangeDetectorRef }], propDecorators: { headerComponent: [{
                type: Input
            }], startAt: [{
                type: Input
            }], startView: [{
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
            }], selectedChange: [{
                type: Output
            }], yearSelected: [{
                type: Output
            }], monthSelected: [{
                type: Output
            }], viewChanged: [{
                type: Output
            }], _userSelection: [{
                type: Output
            }], _userDragDrop: [{
                type: Output
            }], monthView: [{
                type: ViewChild,
                args: [MonthView]
            }], yearView: [{
                type: ViewChild,
                args: [YearView]
            }], multiYearView: [{
                type: ViewChild,
                args: [MultiYearView]
            }] } });

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
class CalendarModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: CalendarModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "18.2.8", ngImport: i0, type: CalendarModule, imports: [CommonModule,
            OverlayModule,
            A11yModule,
            PortalModule,
            Calendar,
            CalendarBody,
            MonthView,
            YearView,
            MultiYearView,
            CalendarHeader], exports: [CdkScrollableModule,
            Calendar,
            CalendarBody,
            MonthView,
            YearView,
            MultiYearView,
            CalendarHeader] });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: CalendarModule, imports: [CommonModule,
            OverlayModule,
            A11yModule,
            PortalModule, CdkScrollableModule] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: CalendarModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [
                        CommonModule,
                        OverlayModule,
                        A11yModule,
                        PortalModule,
                        Calendar,
                        CalendarBody,
                        MonthView,
                        YearView,
                        MultiYearView,
                        CalendarHeader,
                    ],
                    exports: [
                        CdkScrollableModule,
                        Calendar,
                        CalendarBody,
                        MonthView,
                        YearView,
                        MultiYearView,
                        CalendarHeader,
                    ],
                }]
        }] });

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * Animations used by the Material datepicker.
 * @docs-private
 */
const animations = {
    /** Transforms the height of the datepicker's calendar. */
    transformPanel: trigger('transformPanel', [
        transition('void => enter-dropdown', animate('120ms cubic-bezier(0, 0, 0.2, 1)', keyframes([
            style({ opacity: 0, transform: 'scale(1, 0.8)' }),
            style({ opacity: 1, transform: 'scale(1, 1)' }),
        ]))),
        transition('void => enter-dialog', animate('150ms cubic-bezier(0, 0, 0.2, 1)', keyframes([
            style({ opacity: 0, transform: 'scale(0.7)' }),
            style({ transform: 'none', opacity: 1 }),
        ]))),
        transition('* => void', animate('100ms linear', style({ opacity: 0 }))),
    ]),
    /** Fades in the content of the calendar. */
    fadeInCalendar: trigger('fadeInCalendar', [
        state('void', style({ opacity: 0 })),
        state('enter', style({ opacity: 1 })),
        transition('void => *', animate('120ms 100ms cubic-bezier(0.55, 0, 0.55, 0.2)')),
    ]),
};

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
class DatepickerContent {
    _elementRef;
    _changeDetectorRef;
    _globalModel;
    _dateAdapter;
    _dateFormats;
    _subscriptions = new Subscription();
    _model;
    /** Reference to the internal calendar component. */
    _calendar;
    /** Reference to the datepicker that created the overlay. */
    datepicker;
    /** Start of the comparison range. */
    comparisonStart;
    /** End of the comparison range. */
    comparisonEnd;
    /** ARIA Accessible name of the `<input startDate/>` */
    startDateAccessibleName;
    /** ARIA Accessible name of the `<input endDate/>` */
    endDateAccessibleName;
    /** Whether the datepicker is above or below the input. */
    _isAbove;
    /** Current state of the animation. */
    _animationState;
    /** Emits when an animation has finished. */
    _animationDone = new Subject();
    /** Whether there is an in-progress animation. */
    _isAnimating = false;
    /** Whether the close button currently has focus. */
    _closeButtonFocused;
    /** Id of the label for the `role="dialog"` element. */
    _dialogLabelId;
    constructor(_elementRef, _changeDetectorRef, _globalModel, _dateAdapter, _dateFormats) {
        this._elementRef = _elementRef;
        this._changeDetectorRef = _changeDetectorRef;
        this._globalModel = _globalModel;
        this._dateAdapter = _dateAdapter;
        this._dateFormats = _dateFormats;
    }
    ngOnInit() {
        this._animationState = this.datepicker.touchUi ? 'enter-dialog' : 'enter-dropdown';
    }
    ngAfterViewInit() {
        this._subscriptions.add(this.datepicker.stateChanges.subscribe(() => {
            this._changeDetectorRef.markForCheck();
        }));
        this._calendar.focusActiveCell();
    }
    ngOnDestroy() {
        this._subscriptions.unsubscribe();
        this._animationDone.complete();
    }
    _handleUserSelection(event) {
        const selection = this._model.selection;
        const value = event.value;
        const isRange = selection instanceof DateRange;
        if (value && (isRange || !this._dateAdapter.sameDate(value, selection))) {
            this._model.add(value);
        }
        if (!this._model || this._model.isComplete()) {
            this.datepicker.close();
        }
    }
    _handleUserDragDrop(event) {
        this._model.updateSelection(event.value, this);
    }
    _startExitAnimation() {
        this._animationState = 'void';
        this._changeDetectorRef.markForCheck();
    }
    _handleAnimationEvent(event) {
        this._isAnimating = event.phaseName === 'start';
        if (!this._isAnimating) {
            this._animationDone.next();
        }
    }
    _getSelected() {
        return this._model?.selection;
    }
    _getSelectedDisplay() {
        const selected = this._model.selection || this._dateAdapter.today();
        return selected
            ? this._dateAdapter.format(selected, this._dateFormats.display.dayMonthDateLabel)
            : '';
    }
    /** Applies the current pending selection to the global model. */
    _applyPendingSelection() {
        if (this._model !== this._globalModel) {
            this._globalModel.updateSelection(this._model.selection, this);
        }
    }
    /**
     * @param forceRerender
     */
    _assignModel(forceRerender) {
        this._model = this._globalModel;
        if (forceRerender) {
            this._changeDetectorRef.detectChanges();
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: DatepickerContent, deps: [{ token: i0.ElementRef }, { token: i0.ChangeDetectorRef }, { token: DateSelectionModel }, { token: DateAdapter }, { token: DATE_FORMATS, optional: true }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "18.2.8", type: DatepickerContent, isStandalone: true, selector: "datepicker-content", host: { listeners: { "@transformPanel.start": "_handleAnimationEvent($event)", "@transformPanel.done": "_handleAnimationEvent($event)" }, properties: { "@transformPanel": "_animationState", "class.datepicker-content-touch": "datepicker.touchUi" }, classAttribute: "datepicker-content" }, viewQueries: [{ propertyName: "_calendar", first: true, predicate: Calendar, descendants: true }], exportAs: ["datepickerContent"], ngImport: i0, template: "<div\n  cdkTrapFocus\n  role=\"dialog\"\n  class=\"flex flex-col flex-auto overflow-hidden rounded-lg\"\n  [attr.aria-modal]=\"true\"\n  [attr.aria-labelledby]=\"_dialogLabelId ?? undefined\"\n>\n  <div class=\"flex flex-col px-3 py-2 bg-primary\">\n    <div class=\"flex flex-col\">\n      <span class=\"text-xs font-normal tracking-wider uppercase text-primary-content\">\n        Selected date\n      </span>\n    </div>\n    <div class=\"flex flex-col mt-4\">\n      <span class=\"text-xl font-normal text-primary-content\">\n        {{ _getSelectedDisplay() }}\n      </span>\n    </div>\n  </div>\n\n  <calendar\n    class=\"flex-auto\"\n    [id]=\"datepicker.id\"\n    [ngClass]=\"datepicker.panelClass\"\n    [startAt]=\"datepicker.startAt\"\n    [startView]=\"datepicker.startView\"\n    [minDate]=\"datepicker._getMinDate()\"\n    [maxDate]=\"datepicker._getMaxDate()\"\n    [dateFilter]=\"datepicker._getDateFilter()\"\n    [headerComponent]=\"datepicker.calendarHeaderComponent\"\n    [selected]=\"_getSelected()\"\n    [dateClass]=\"datepicker.dateClass\"\n    [comparisonStart]=\"comparisonStart\"\n    [comparisonEnd]=\"comparisonEnd\"\n    [@fadeInCalendar]=\"'enter'\"\n    [startDateAccessibleName]=\"startDateAccessibleName\"\n    [endDateAccessibleName]=\"endDateAccessibleName\"\n    (yearSelected)=\"datepicker._selectYear($event)\"\n    (monthSelected)=\"datepicker._selectMonth($event)\"\n    (viewChanged)=\"datepicker._viewChanged($event)\"\n    (_userSelection)=\"_handleUserSelection($event)\"\n    (_userDragDrop)=\"_handleUserDragDrop($event)\"\n  />\n\n  <div class=\"flex items-center justify-end w-full gap-3 px-3 py-3\">\n    <button\n      type=\"button\"\n      class=\"btn\"\n      [class.cdk-visually-hidden]=\"!_closeButtonFocused\"\n      (focus)=\"_closeButtonFocused = true\"\n      (blur)=\"_closeButtonFocused = false\"\n      (click)=\"datepicker.close()\"\n    >\n      Close\n    </button>\n\n    <button\n      type=\"button\"\n      class=\"btn btn-primary\"\n      (click)=\"datepicker.apply()\"\n    >\n      Apply\n    </button>\n  </div>\n</div>\n", styles: [".datepicker-content{position:relative;display:flex;flex-direction:column;border-radius:.5rem;background-color:oklch(var(--b1));box-shadow:0 0 #0000,0 0 #0000,rgba(var(--shadow-card-rgb),.2) 0 8px 24px}.datepicker-content .calendar{width:22rem;height:24rem}.datepicker-content-container{display:flex;flex-direction:column;justify-content:space-between}.datepicker-content-touch{display:block;max-height:80vh;position:relative;overflow:visible}.datepicker-content-touch .datepicker-content-container{min-height:312px;max-height:788px;min-width:250px;max-width:750px}.datepicker-content-touch .calendar{width:100%;height:auto}@media all and (orientation: landscape){.datepicker-content-touch .datepicker-content-container{width:64vh;height:80vh}}@media all and (orientation: portrait){.datepicker-content-touch .datepicker-content-container{width:80vw;height:100vw}}\n"], dependencies: [{ kind: "component", type: Calendar, selector: "calendar", inputs: ["headerComponent", "startAt", "startView", "selected", "minDate", "maxDate", "dateFilter", "dateClass", "comparisonStart", "comparisonEnd", "startDateAccessibleName", "endDateAccessibleName"], outputs: ["selectedChange", "yearSelected", "monthSelected", "viewChanged", "_userSelection", "_userDragDrop"], exportAs: ["calendar"] }, { kind: "directive", type: NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }], animations: [animations.transformPanel, animations.fadeInCalendar], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: DatepickerContent, decorators: [{
            type: Component,
            args: [{ selector: 'datepicker-content', host: {
                        class: 'datepicker-content',
                        '[@transformPanel]': '_animationState',
                        '(@transformPanel.start)': '_handleAnimationEvent($event)',
                        '(@transformPanel.done)': '_handleAnimationEvent($event)',
                        '[class.datepicker-content-touch]': 'datepicker.touchUi',
                    }, animations: [animations.transformPanel, animations.fadeInCalendar], exportAs: 'datepickerContent', encapsulation: ViewEncapsulation.None, changeDetection: ChangeDetectionStrategy.OnPush, standalone: true, imports: [Calendar, NgClass, CdkPortalOutlet], template: "<div\n  cdkTrapFocus\n  role=\"dialog\"\n  class=\"flex flex-col flex-auto overflow-hidden rounded-lg\"\n  [attr.aria-modal]=\"true\"\n  [attr.aria-labelledby]=\"_dialogLabelId ?? undefined\"\n>\n  <div class=\"flex flex-col px-3 py-2 bg-primary\">\n    <div class=\"flex flex-col\">\n      <span class=\"text-xs font-normal tracking-wider uppercase text-primary-content\">\n        Selected date\n      </span>\n    </div>\n    <div class=\"flex flex-col mt-4\">\n      <span class=\"text-xl font-normal text-primary-content\">\n        {{ _getSelectedDisplay() }}\n      </span>\n    </div>\n  </div>\n\n  <calendar\n    class=\"flex-auto\"\n    [id]=\"datepicker.id\"\n    [ngClass]=\"datepicker.panelClass\"\n    [startAt]=\"datepicker.startAt\"\n    [startView]=\"datepicker.startView\"\n    [minDate]=\"datepicker._getMinDate()\"\n    [maxDate]=\"datepicker._getMaxDate()\"\n    [dateFilter]=\"datepicker._getDateFilter()\"\n    [headerComponent]=\"datepicker.calendarHeaderComponent\"\n    [selected]=\"_getSelected()\"\n    [dateClass]=\"datepicker.dateClass\"\n    [comparisonStart]=\"comparisonStart\"\n    [comparisonEnd]=\"comparisonEnd\"\n    [@fadeInCalendar]=\"'enter'\"\n    [startDateAccessibleName]=\"startDateAccessibleName\"\n    [endDateAccessibleName]=\"endDateAccessibleName\"\n    (yearSelected)=\"datepicker._selectYear($event)\"\n    (monthSelected)=\"datepicker._selectMonth($event)\"\n    (viewChanged)=\"datepicker._viewChanged($event)\"\n    (_userSelection)=\"_handleUserSelection($event)\"\n    (_userDragDrop)=\"_handleUserDragDrop($event)\"\n  />\n\n  <div class=\"flex items-center justify-end w-full gap-3 px-3 py-3\">\n    <button\n      type=\"button\"\n      class=\"btn\"\n      [class.cdk-visually-hidden]=\"!_closeButtonFocused\"\n      (focus)=\"_closeButtonFocused = true\"\n      (blur)=\"_closeButtonFocused = false\"\n      (click)=\"datepicker.close()\"\n    >\n      Close\n    </button>\n\n    <button\n      type=\"button\"\n      class=\"btn btn-primary\"\n      (click)=\"datepicker.apply()\"\n    >\n      Apply\n    </button>\n  </div>\n</div>\n", styles: [".datepicker-content{position:relative;display:flex;flex-direction:column;border-radius:.5rem;background-color:oklch(var(--b1));box-shadow:0 0 #0000,0 0 #0000,rgba(var(--shadow-card-rgb),.2) 0 8px 24px}.datepicker-content .calendar{width:22rem;height:24rem}.datepicker-content-container{display:flex;flex-direction:column;justify-content:space-between}.datepicker-content-touch{display:block;max-height:80vh;position:relative;overflow:visible}.datepicker-content-touch .datepicker-content-container{min-height:312px;max-height:788px;min-width:250px;max-width:750px}.datepicker-content-touch .calendar{width:100%;height:auto}@media all and (orientation: landscape){.datepicker-content-touch .datepicker-content-container{width:64vh;height:80vh}}@media all and (orientation: portrait){.datepicker-content-touch .datepicker-content-container{width:80vw;height:100vw}}\n"] }]
        }], ctorParameters: () => [{ type: i0.ElementRef }, { type: i0.ChangeDetectorRef }, { type: DateSelectionModel }, { type: DateAdapter }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [DATE_FORMATS]
                }] }], propDecorators: { _calendar: [{
                type: ViewChild,
                args: [Calendar]
            }] } });

/** Used to generate a unique ID for each datepicker instance. */
let datepickerUid = 0;
/** Injection token that determines the scroll handling while the calendar is open. */
const DATEPICKER_SCROLL_STRATEGY = new InjectionToken('datepicker-scroll-strategy', {
    providedIn: 'root',
    factory: () => {
        const overlay = inject(Overlay);
        return () => overlay.scrollStrategies.reposition();
    },
});
/** @docs-private */
function DATEPICKER_SCROLL_STRATEGY_FACTORY(overlay) {
    return () => overlay.scrollStrategies.reposition();
}
/** @docs-private */
const DATEPICKER_SCROLL_STRATEGY_FACTORY_PROVIDER = {
    provide: DATEPICKER_SCROLL_STRATEGY,
    deps: [Overlay],
    useFactory: DATEPICKER_SCROLL_STRATEGY_FACTORY,
};
/** Base class for a datepicker. */
class DatepickerBase {
    _overlay;
    _ngZone;
    _viewContainerRef;
    _dateAdapter;
    _dir;
    _model;
    _scrollStrategy;
    _inputStateChanges = Subscription.EMPTY;
    _document = inject(DOCUMENT);
    /** An input indicating the type of the custom header component for the calendar, if set. */
    calendarHeaderComponent;
    /** The date to open the calendar to initially. */
    get startAt() {
        // If an explicit startAt is set we start there, otherwise we start at whatever the currently
        // selected value is.
        return this._startAt || (this.datepickerInput ? this.datepickerInput.getStartValue() : null);
    }
    set startAt(value) {
        this._startAt = this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(value));
    }
    _startAt;
    /** The view that the calendar should start in. */
    startView = 'month';
    /**
     * Whether the calendar UI is in touch mode. In touch mode the calendar opens in a dialog rather
     * than a dropdown and elements have more padding to allow for bigger touch targets.
     */
    touchUi = false;
    /** Whether the datepicker pop-up should be disabled. */
    get disabled() {
        return this._disabled === undefined && this.datepickerInput
            ? this.datepickerInput.disabled
            : !!this._disabled;
    }
    set disabled(value) {
        if (value !== this._disabled) {
            this._disabled = value;
            this.stateChanges.next(undefined);
        }
    }
    _disabled;
    /** Preferred position of the datepicker in the X axis. */
    xPosition = 'start';
    /** Preferred position of the datepicker in the Y axis. */
    yPosition = 'below';
    /**
     * Whether to restore focus to the previously-focused element when the calendar is closed.
     * Note that automatic focus restoration is an accessibility feature and it is recommended that
     * you provide your own equivalent, if you decide to turn it off.
     */
    restoreFocus = true;
    /**
     * Emits selected year in multiyear view.
     * This doesn't imply a change on the selected date.
     */
    yearSelected = new EventEmitter();
    /**
     * Emits selected month in year view.
     * This doesn't imply a change on the selected date.
     */
    monthSelected = new EventEmitter();
    /**
     * Emits when the current view changes.
     */
    viewChanged = new EventEmitter(true);
    /** Function that can be used to add custom CSS classes to dates. */
    dateClass;
    /** Emits when the datepicker has been opened. */
    openedStream = new EventEmitter();
    /** Emits when the datepicker has been closed. */
    closedStream = new EventEmitter();
    /**
     * Classes to be passed to the date picker panel.
     * Supports string and string array values, similar to `ngClass`.
     */
    get panelClass() {
        return this._panelClass;
    }
    set panelClass(value) {
        this._panelClass = coerceStringArray(value);
    }
    _panelClass;
    /** Whether the calendar is open. */
    get opened() {
        return this._opened;
    }
    set opened(value) {
        if (value) {
            this.open();
        }
        else {
            this.close();
        }
    }
    _opened = false;
    /** The id for the datepicker calendar. */
    id = `datepicker-${datepickerUid++}`;
    /** The minimum selectable date. */
    _getMinDate() {
        return this.datepickerInput && this.datepickerInput.min;
    }
    /** The maximum selectable date. */
    _getMaxDate() {
        return this.datepickerInput && this.datepickerInput.max;
    }
    _getDateFilter() {
        return this.datepickerInput && this.datepickerInput.dateFilter;
    }
    /** A reference to the overlay into which we've rendered the calendar. */
    _overlayRef;
    /** Reference to the component instance rendered in the overlay. */
    _componentRef;
    /** The element that was focused before the datepicker was opened. */
    _focusedElementBeforeOpen = null;
    /** Unique class that will be added to the backdrop so that the test harnesses can look it up. */
    _backdropHarnessClass = `${this.id}-backdrop`;
    /** The input element this datepicker is associated with. */
    datepickerInput;
    /** Emits when the datepicker's state changes. */
    stateChanges = new Subject();
    constructor(_overlay, _ngZone, _viewContainerRef, scrollStrategy, _dateAdapter, _dir, _model) {
        this._overlay = _overlay;
        this._ngZone = _ngZone;
        this._viewContainerRef = _viewContainerRef;
        this._dateAdapter = _dateAdapter;
        this._dir = _dir;
        this._model = _model;
        if (!this._dateAdapter) {
            throw createMissingDateImplError('DateAdapter');
        }
        this._scrollStrategy = scrollStrategy;
    }
    ngOnChanges(changes) {
        const positionChange = changes['xPosition'] || changes['yPosition'];
        if (positionChange && !positionChange.firstChange && this._overlayRef) {
            const positionStrategy = this._overlayRef.getConfig().positionStrategy;
            if (positionStrategy instanceof FlexibleConnectedPositionStrategy) {
                this._setConnectedPositions(positionStrategy);
                if (this.opened) {
                    this._overlayRef.updatePosition();
                }
            }
        }
        this.stateChanges.next(undefined);
    }
    ngOnDestroy() {
        this._destroyOverlay();
        this.close();
        this._inputStateChanges.unsubscribe();
        this.stateChanges.complete();
    }
    /** Selects the given date */
    select(date) {
        this._model.add(date);
    }
    /** Emits the selected year in multiyear view */
    _selectYear(normalizedYear) {
        this.yearSelected.emit(normalizedYear);
    }
    /** Emits selected month in year view */
    _selectMonth(normalizedMonth) {
        this.monthSelected.emit(normalizedMonth);
    }
    /** Emits changed view */
    _viewChanged(view) {
        this.viewChanged.emit(view);
    }
    /**
     * Register an input with this datepicker.
     * @param input The datepicker input to register with this datepicker.
     * @returns Selection model that the input should hook itself up to.
     */
    registerInput(input) {
        if (this.datepickerInput) {
            throw Error('A Datepicker can only be associated with a single input.');
        }
        this._inputStateChanges.unsubscribe();
        this.datepickerInput = input;
        this._inputStateChanges = input.stateChanges.subscribe(() => this.stateChanges.next(undefined));
        return this._model;
    }
    /** Open the calendar. */
    open() {
        // Skip reopening if there's an in-progress animation to avoid overlapping
        // sequences which can cause "changed after checked" errors. See #25837.
        if (this._opened || this.disabled || this._componentRef?.instance._isAnimating) {
            return;
        }
        if (!this.datepickerInput) {
            throw Error('Attempted to open an Datepicker with no associated input.');
        }
        this._focusedElementBeforeOpen = _getFocusedElementPierceShadowDom();
        this._openOverlay();
        this._opened = true;
        this.openedStream.emit();
    }
    /** Close the calendar. */
    close() {
        // Skip reopening if there's an in-progress animation to avoid overlapping
        // sequences which can cause "changed after checked" errors. See #25837.
        if (!this._opened || this._componentRef?.instance._isAnimating) {
            return;
        }
        const canRestoreFocus = this.restoreFocus &&
            this._focusedElementBeforeOpen &&
            typeof this._focusedElementBeforeOpen.focus === 'function';
        const completeClose = () => {
            // The `_opened` could've been reset already if
            // we got two events in quick succession.
            if (this._opened) {
                this._opened = false;
                this.closedStream.emit();
            }
        };
        if (this._componentRef) {
            const { instance, location } = this._componentRef;
            instance._startExitAnimation();
            instance._animationDone.pipe(take(1)).subscribe(() => {
                const activeElement = this._document.activeElement;
                // Since we restore focus after the exit animation, we have to check that
                // the user didn't move focus themselves inside the `close` handler.
                if (canRestoreFocus &&
                    (!activeElement ||
                        activeElement === this._document.activeElement ||
                        location.nativeElement.contains(activeElement))) {
                    this._focusedElementBeforeOpen.focus();
                }
                this._focusedElementBeforeOpen = null;
                this._destroyOverlay();
            });
        }
        if (canRestoreFocus) {
            // Because IE moves focus asynchronously, we can't count on it being restored before we've
            // marked the datepicker as closed. If the event fires out of sequence and the element that
            // we're refocusing opens the datepicker on focus, the user could be stuck with not being
            // able to close the calendar at all. We work around it by making the logic, that marks
            // the datepicker as closed, async as well.
            setTimeout(completeClose);
        }
        else {
            completeClose();
        }
    }
    apply() {
        this._applyPendingSelection();
        this.close();
    }
    /** Applies the current pending selection on the overlay to the model. */
    _applyPendingSelection() {
        this._componentRef?.instance?._applyPendingSelection();
    }
    /** Forwards relevant values from the datepicker to the datepicker content inside the overlay. */
    _forwardContentValues(instance) {
        instance.datepicker = this;
        instance._dialogLabelId = this.datepickerInput.getOverlayLabelId();
        instance._assignModel(false);
    }
    /** Opens the overlay with the calendar. */
    _openOverlay() {
        this._destroyOverlay();
        const isDialog = this.touchUi;
        const portal = new ComponentPortal(DatepickerContent, this._viewContainerRef);
        const overlayRef = (this._overlayRef = this._overlay.create(new OverlayConfig({
            positionStrategy: isDialog ? this._getDialogStrategy() : this._getDropdownStrategy(),
            hasBackdrop: true,
            backdropClass: [
                isDialog ? 'cdk-overlay-dark-backdrop' : 'overlay-transparent-backdrop',
                this._backdropHarnessClass,
            ],
            direction: this._dir,
            scrollStrategy: isDialog ? this._overlay.scrollStrategies.block() : this._scrollStrategy(),
            panelClass: `datepicker-${isDialog ? 'dialog' : 'popup'}`,
        })));
        this._getCloseStream(overlayRef).subscribe((event) => {
            if (event) {
                event.preventDefault();
            }
            this.close();
        });
        // The `preventDefault` call happens inside the calendar as well, however focus moves into
        // it inside a timeout which can give browsers a chance to fire off a keyboard event in-between
        // that can scroll the page (see #24969). Always block default actions of arrow keys for the
        // entire overlay so the page doesn't get scrolled by accident.
        overlayRef.keydownEvents().subscribe((event) => {
            const keyCode = event.keyCode;
            if (keyCode === UP_ARROW ||
                keyCode === DOWN_ARROW ||
                keyCode === LEFT_ARROW ||
                keyCode === RIGHT_ARROW ||
                keyCode === PAGE_UP ||
                keyCode === PAGE_DOWN) {
                event.preventDefault();
            }
        });
        this._componentRef = overlayRef.attach(portal);
        this._forwardContentValues(this._componentRef.instance);
        // Update the position once the calendar has rendered. Only relevant in dropdown mode.
        if (!isDialog) {
            this._ngZone.onStable.pipe(take(1)).subscribe(() => overlayRef.updatePosition());
        }
    }
    /** Destroys the current overlay. */
    _destroyOverlay() {
        if (this._overlayRef) {
            this._overlayRef.dispose();
            this._overlayRef = this._componentRef = null;
        }
    }
    /** Gets a position strategy that will open the calendar as a dropdown. */
    _getDialogStrategy() {
        return this._overlay.position().global().centerHorizontally().centerVertically();
    }
    /** Gets a position strategy that will open the calendar as a dropdown. */
    _getDropdownStrategy() {
        const strategy = this._overlay
            .position()
            .flexibleConnectedTo(this.datepickerInput.getConnectedOverlayOrigin())
            .withTransformOriginOn('.datepicker-content')
            .withFlexibleDimensions(false)
            .withViewportMargin(8)
            .withLockedPosition();
        return this._setConnectedPositions(strategy);
    }
    /** Sets the positions of the datepicker in dropdown mode based on the current configuration. */
    _setConnectedPositions(strategy) {
        const primaryX = this.xPosition === 'end' ? 'end' : 'start';
        const secondaryX = primaryX === 'start' ? 'end' : 'start';
        const primaryY = this.yPosition === 'above' ? 'bottom' : 'top';
        const secondaryY = primaryY === 'top' ? 'bottom' : 'top';
        return strategy.withPositions([
            {
                originX: primaryX,
                originY: secondaryY,
                overlayX: primaryX,
                overlayY: primaryY,
            },
            {
                originX: primaryX,
                originY: primaryY,
                overlayX: primaryX,
                overlayY: secondaryY,
            },
            {
                originX: secondaryX,
                originY: secondaryY,
                overlayX: secondaryX,
                overlayY: primaryY,
            },
            {
                originX: secondaryX,
                originY: primaryY,
                overlayX: secondaryX,
                overlayY: secondaryY,
            },
        ]);
    }
    /** Gets an observable that will emit when the overlay is supposed to be closed. */
    _getCloseStream(overlayRef) {
        const ctrlShiftMetaModifiers = ['ctrlKey', 'shiftKey', 'metaKey'];
        return merge(overlayRef.backdropClick(), overlayRef.detachments(), overlayRef.keydownEvents().pipe(filter((event) => {
            // Closing on alt + up is only valid when there's an input associated with the datepicker.
            return ((event.keyCode === ESCAPE && !hasModifierKey(event)) ||
                (this.datepickerInput &&
                    hasModifierKey(event, 'altKey') &&
                    event.keyCode === UP_ARROW &&
                    ctrlShiftMetaModifiers.every((modifier) => !hasModifierKey(event, modifier))));
        })));
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: DatepickerBase, deps: [{ token: i1.Overlay }, { token: i0.NgZone }, { token: i0.ViewContainerRef }, { token: DATEPICKER_SCROLL_STRATEGY }, { token: DateAdapter, optional: true }, { token: i2.Directionality, optional: true }, { token: DateSelectionModel }], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "16.1.0", version: "18.2.8", type: DatepickerBase, inputs: { calendarHeaderComponent: "calendarHeaderComponent", startAt: "startAt", startView: "startView", touchUi: ["touchUi", "touchUi", booleanAttribute], disabled: ["disabled", "disabled", booleanAttribute], xPosition: "xPosition", yPosition: "yPosition", restoreFocus: ["restoreFocus", "restoreFocus", booleanAttribute], dateClass: "dateClass", panelClass: "panelClass", opened: ["opened", "opened", booleanAttribute] }, outputs: { yearSelected: "yearSelected", monthSelected: "monthSelected", viewChanged: "viewChanged", openedStream: "opened", closedStream: "closed" }, usesOnChanges: true, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: DatepickerBase, decorators: [{
            type: Directive
        }], ctorParameters: () => [{ type: i1.Overlay }, { type: i0.NgZone }, { type: i0.ViewContainerRef }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [DATEPICKER_SCROLL_STRATEGY]
                }] }, { type: DateAdapter, decorators: [{
                    type: Optional
                }] }, { type: i2.Directionality, decorators: [{
                    type: Optional
                }] }, { type: DateSelectionModel }], propDecorators: { calendarHeaderComponent: [{
                type: Input
            }], startAt: [{
                type: Input
            }], startView: [{
                type: Input
            }], touchUi: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], disabled: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], xPosition: [{
                type: Input
            }], yPosition: [{
                type: Input
            }], restoreFocus: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], yearSelected: [{
                type: Output
            }], monthSelected: [{
                type: Output
            }], viewChanged: [{
                type: Output
            }], dateClass: [{
                type: Input
            }], openedStream: [{
                type: Output,
                args: ['opened']
            }], closedStream: [{
                type: Output,
                args: ['closed']
            }], panelClass: [{
                type: Input
            }], opened: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }] } });

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
class Datepicker extends DatepickerBase {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: Datepicker, deps: null, target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "18.2.8", type: Datepicker, isStandalone: true, selector: "date-picker", providers: [
            SINGLE_DATE_SELECTION_MODEL_PROVIDER,
            { provide: DatepickerBase, useExisting: Datepicker },
        ], exportAs: ["datepicker"], usesInheritance: true, ngImport: i0, template: '', isInline: true, changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: Datepicker, decorators: [{
            type: Component,
            args: [{
                    selector: 'date-picker',
                    template: '',
                    exportAs: 'datepicker',
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    encapsulation: ViewEncapsulation.None,
                    providers: [
                        SINGLE_DATE_SELECTION_MODEL_PROVIDER,
                        { provide: DatepickerBase, useExisting: Datepicker },
                    ],
                    standalone: true,
                }]
        }] });

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * An event used for datepicker input and change events. We don't always have access to a native
 * input or change event because the event may have been triggered by the user clicking on the
 * calendar popup. For consistency, we always use datepickerInputEvent instead.
 */
class DatepickerInputEvent {
    target;
    targetElement;
    /** The new value for the target datepicker input. */
    value;
    constructor(
    /** Reference to the datepicker input component that emitted the event. */
    target, 
    /** Reference to the native input element associated with the datepicker input. */
    targetElement) {
        this.target = target;
        this.targetElement = targetElement;
        this.value = this.target.value;
    }
}
/** Base class for datepicker inputs. */
class DatepickerInputBase {
    _elementRef;
    _dateAdapter;
    _dateFormats;
    /** Whether the component has been initialized. */
    _isInitialized;
    /** The value of the input. */
    get value() {
        return this._model ? this._getValueFromModel(this._model.selection) : this._pendingValue;
    }
    set value(value) {
        this._assignValueProgrammatically(value);
    }
    _model;
    /** Whether the datepicker-input is disabled. */
    get disabled() {
        return !!this._disabled || this._parentDisabled();
    }
    set disabled(value) {
        const newValue = value;
        const element = this._elementRef.nativeElement;
        if (this._disabled !== newValue) {
            this._disabled = newValue;
            this.stateChanges.next(undefined);
        }
        // We need to null check the `blur` method, because it's undefined during SSR.
        // In Ivy static bindings are invoked earlier, before the element is attached to the DOM.
        // This can cause an error to be thrown in some browsers (IE/Edge) which assert that the
        // element has been inserted.
        if (newValue && this._isInitialized && element.blur) {
            // Normally, native input elements automatically blur if they turn disabled. This behavior
            // is problematic, because it would mean that it triggers another change detection cycle,
            // which then causes a changed after checked error if the input element was focused before.
            element.blur();
        }
    }
    _disabled;
    /** Emits when a `change` event is fired on this `<input>`. */
    dateChange = new EventEmitter();
    /** Emits when an `input` event is fired on this `<input>`. */
    dateInput = new EventEmitter();
    /** Emits when the internal state has changed */
    stateChanges = new Subject();
    _onTouched = () => { };
    _validatorOnChange = () => { };
    _cvaOnChange = () => { };
    _valueChangesSubscription = Subscription.EMPTY;
    _localeSubscription = Subscription.EMPTY;
    _translocoSubscription = Subscription.EMPTY;
    /**
     * Since the value is kept on the model which is assigned in an Input,
     * we might get a value before we have a model. This property keeps track
     * of the value until we have somewhere to assign it.
     */
    _pendingValue;
    /** The form control validator for whether the input parses. */
    _parseValidator = () => {
        return this._lastValueValid
            ? null
            : { datepickerParse: { text: this._elementRef.nativeElement.value } };
    };
    /** The form control validator for the date filter. */
    _filterValidator = (control) => {
        const controlValue = this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(control.value));
        return !controlValue || this._matchesFilter(controlValue) ? null : { datepickerFilter: true };
    };
    /** The form control validator for the min date. */
    _minValidator = (control) => {
        const controlValue = this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(control.value));
        const min = this._getMinDate();
        return !min || !controlValue || this._dateAdapter.compareDate(min, controlValue) <= 0
            ? null
            : { datepickerMin: { min: min, actual: controlValue } };
    };
    /** The form control validator for the max date. */
    _maxValidator = (control) => {
        const controlValue = this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(control.value));
        const max = this._getMaxDate();
        return !max || !controlValue || this._dateAdapter.compareDate(max, controlValue) >= 0
            ? null
            : { datepickerMax: { max: max, actual: controlValue } };
    };
    /** Gets the base validator functions. */
    _getValidators() {
        return [this._parseValidator, this._minValidator, this._maxValidator, this._filterValidator];
    }
    /** Registers a date selection model with the input. */
    _registerModel(model) {
        this._model = model;
        this._valueChangesSubscription.unsubscribe();
        if (this._pendingValue) {
            this._assignValue(this._pendingValue);
        }
        this._valueChangesSubscription = this._model.selectionChanged.subscribe((event) => {
            if (this._shouldHandleChangeEvent(event)) {
                const value = this._getValueFromModel(event.selection);
                this._lastValueValid = this._isValidValue(value);
                this._cvaOnChange(value);
                this._onTouched();
                this._formatValue(value);
                this.dateInput.emit(new DatepickerInputEvent(this, this._elementRef.nativeElement));
                this.dateChange.emit(new DatepickerInputEvent(this, this._elementRef.nativeElement));
            }
        });
    }
    /** Whether the last value set on the input was valid. */
    _lastValueValid = false;
    constructor(_elementRef, _dateAdapter, _dateFormats
    // @Optional() private _transloco: TranslocoService
    ) {
        this._elementRef = _elementRef;
        this._dateAdapter = _dateAdapter;
        this._dateFormats = _dateFormats;
        if (!this._dateAdapter) {
            throw createMissingDateImplError('DateAdapter');
        }
        if (!this._dateFormats) {
            throw createMissingDateImplError('DATE_FORMATS');
        }
        // Update the displayed date when the locale changes.
        this._localeSubscription = _dateAdapter.localeChanges.subscribe(() => {
            this._assignValueProgrammatically(this.value);
        });
        // this._translocoSubscription = this._transloco.langChanges$.subscribe((lang) => {
        //   this._dateAdapter.setLocale(lang);
        // });
    }
    ngAfterViewInit() {
        this._isInitialized = true;
    }
    ngOnChanges(changes) {
        if (dateInputsHaveChanged(changes, this._dateAdapter)) {
            this.stateChanges.next(undefined);
        }
    }
    ngOnDestroy() {
        this._valueChangesSubscription.unsubscribe();
        this._localeSubscription.unsubscribe();
        this._translocoSubscription.unsubscribe();
        this.stateChanges.complete();
    }
    /** @docs-private */
    registerOnValidatorChange(fn) {
        this._validatorOnChange = fn;
    }
    /** @docs-private */
    validate(c) {
        return this._validator ? this._validator(c) : null;
    }
    // Implemented as part of ControlValueAccessor.
    writeValue(value) {
        this._assignValueProgrammatically(value);
    }
    // Implemented as part of ControlValueAccessor.
    registerOnChange(fn) {
        this._cvaOnChange = fn;
    }
    // Implemented as part of ControlValueAccessor.
    registerOnTouched(fn) {
        this._onTouched = fn;
    }
    // Implemented as part of ControlValueAccessor.
    setDisabledState(isDisabled) {
        this.disabled = isDisabled;
    }
    _onKeydown(event) {
        const ctrlShiftMetaModifiers = ['ctrlKey', 'shiftKey', 'metaKey'];
        const isAltDownArrow = hasModifierKey(event, 'altKey') &&
            event.keyCode === DOWN_ARROW &&
            ctrlShiftMetaModifiers.every((modifier) => !hasModifierKey(event, modifier));
        if (isAltDownArrow && !this._elementRef.nativeElement.readOnly) {
            this._openPopup();
            event.preventDefault();
        }
    }
    _onInput(value) {
        const lastValueWasValid = this._lastValueValid;
        let date = this._dateAdapter.parse(value, this._dateFormats.parse.dateInput);
        this._lastValueValid = this._isValidValue(date);
        date = this._dateAdapter.getValidDateOrNull(date);
        const hasChanged = !this._dateAdapter.sameDate(date, this.value);
        // We need to fire the CVA change event for all
        // nulls, otherwise the validators won't run.
        if (!date || hasChanged) {
            this._cvaOnChange(date);
        }
        else {
            // Call the CVA change handler for invalid values
            // since this is what marks the control as dirty.
            if (value && !this.value) {
                this._cvaOnChange(date);
            }
            if (lastValueWasValid !== this._lastValueValid) {
                this._validatorOnChange();
            }
        }
        if (hasChanged) {
            this._assignValue(date);
            this.dateInput.emit(new DatepickerInputEvent(this, this._elementRef.nativeElement));
        }
    }
    _onChange() {
        this.dateChange.emit(new DatepickerInputEvent(this, this._elementRef.nativeElement));
    }
    /** Handles blur events on the input. */
    _onBlur() {
        // Reformat the input only if we have a valid value.
        if (this.value) {
            this._formatValue(this.value);
        }
        this._onTouched();
    }
    /** Formats a value and sets it on the input element. */
    _formatValue(value) {
        this._elementRef.nativeElement.value =
            value != null ? this._dateAdapter.format(value, this._dateFormats.display.dateInput) : '';
    }
    /** Assigns a value to the model. */
    _assignValue(value) {
        // We may get some incoming values before the model was
        // assigned. Save the value so that we can assign it later.
        if (this._model) {
            this._assignValueToModel(value);
            this._pendingValue = null;
        }
        else {
            this._pendingValue = value;
        }
    }
    /** Whether a value is considered valid. */
    _isValidValue(value) {
        return !value || this._dateAdapter.isValid(value);
    }
    /**
     * Checks whether a parent control is disabled. This is in place so that it can be overridden
     * by inputs extending this one which can be placed inside of a group that can be disabled.
     */
    _parentDisabled() {
        return false;
    }
    /** Programmatically assigns a value to the input. */
    _assignValueProgrammatically(value) {
        value = this._dateAdapter.deserialize(value);
        this._lastValueValid = this._isValidValue(value);
        value = this._dateAdapter.getValidDateOrNull(value);
        this._assignValue(value);
        this._formatValue(value);
    }
    /** Gets whether a value matches the current date filter. */
    _matchesFilter(value) {
        const filter = this._getDateFilter();
        return !filter || filter(value);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: DatepickerInputBase, deps: [{ token: i0.ElementRef }, { token: DateAdapter, optional: true }, { token: DATE_FORMATS, optional: true }], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "16.1.0", version: "18.2.8", type: DatepickerInputBase, isStandalone: true, inputs: { value: "value", disabled: ["disabled", "disabled", booleanAttribute] }, outputs: { dateChange: "dateChange", dateInput: "dateInput" }, usesOnChanges: true, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: DatepickerInputBase, decorators: [{
            type: Directive,
            args: [{ standalone: true }]
        }], ctorParameters: () => [{ type: i0.ElementRef }, { type: DateAdapter, decorators: [{
                    type: Optional
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [DATE_FORMATS]
                }] }], propDecorators: { value: [{
                type: Input
            }], disabled: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], dateChange: [{
                type: Output
            }], dateInput: [{
                type: Output
            }] } });
/**
 * Checks whether the `SimpleChanges` object from an `ngOnChanges`
 * callback has any changes, accounting for date objects.
 */
function dateInputsHaveChanged(changes, adapter) {
    const keys = Object.keys(changes);
    for (const key of keys) {
        const { previousValue, currentValue } = changes[key];
        if (adapter.isDateInstance(previousValue) && adapter.isDateInstance(currentValue)) {
            if (!adapter.sameDate(previousValue, currentValue)) {
                return true;
            }
        }
        else {
            return true;
        }
    }
    return false;
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/* eslint-disable @angular-eslint/directive-class-suffix */
/** @docs-private */
const DATEPICKER_VALUE_ACCESSOR = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => DatepickerInput),
    multi: true,
};
/** @docs-private */
const DATEPICKER_VALIDATORS = {
    provide: NG_VALIDATORS,
    useExisting: forwardRef(() => DatepickerInput),
    multi: true,
};
const INPUT_VALUE_ACCESSOR = {
    provide: new InjectionToken('INPUT_VALUE_ACCESSOR'),
    useExisting: forwardRef(() => DatepickerInput),
};
/** Directive used to connect an input to a Datepicker. */
class DatepickerInput extends DatepickerInputBase {
    _closedSubscription = Subscription.EMPTY;
    /** The datepicker that this input is associated with. */
    set datepicker(datepicker) {
        if (datepicker) {
            this._datepicker = datepicker;
            this._closedSubscription = datepicker.closedStream.subscribe(() => this._onTouched());
            this._registerModel(datepicker.registerInput(this));
        }
    }
    _datepicker;
    /** The minimum valid date. */
    get min() {
        return this._min;
    }
    set min(value) {
        const validValue = this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(value));
        if (!this._dateAdapter.sameDate(validValue, this._min)) {
            this._min = validValue;
            this._validatorOnChange();
        }
    }
    _min;
    /** The maximum valid date. */
    get max() {
        return this._max;
    }
    set max(value) {
        const validValue = this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(value));
        if (!this._dateAdapter.sameDate(validValue, this._max)) {
            this._max = validValue;
            this._validatorOnChange();
        }
    }
    _max;
    /** Function that can be used to filter out dates within the datepicker. */
    get dateFilter() {
        return this._dateFilter;
    }
    set dateFilter(value) {
        const wasMatchingValue = this._matchesFilter(this.value);
        this._dateFilter = value;
        if (this._matchesFilter(this.value) !== wasMatchingValue) {
            this._validatorOnChange();
        }
    }
    _dateFilter;
    /** The combined form control validator for this input. */
    _validator;
    constructor(elementRef, dateAdapter, dateFormats) {
        super(elementRef, dateAdapter, dateFormats);
        this._validator = Validators.compose(super._getValidators());
    }
    /**
     * Gets the element that the datepicker popup should be connected to.
     * @return The element to connect the popup to.
     */
    getConnectedOverlayOrigin() {
        return this._elementRef;
    }
    /** Gets the ID of an element that should be used a description for the calendar overlay. */
    getOverlayLabelId() {
        return this._elementRef.nativeElement.getAttribute('aria-labelledby');
    }
    /** Gets the value at which the calendar should start. */
    getStartValue() {
        return this.value;
    }
    ngOnDestroy() {
        super.ngOnDestroy();
        this._closedSubscription.unsubscribe();
    }
    /** Opens the associated datepicker. */
    _openPopup() {
        if (this._datepicker) {
            this._datepicker.open();
        }
    }
    _getValueFromModel(modelValue) {
        return modelValue;
    }
    _assignValueToModel(value) {
        if (this._model) {
            this._model.updateSelection(value, this);
        }
    }
    /** Gets the input's minimum date. */
    _getMinDate() {
        return this._min;
    }
    /** Gets the input's maximum date. */
    _getMaxDate() {
        return this._max;
    }
    /** Gets the input's date filtering function. */
    _getDateFilter() {
        return this._dateFilter;
    }
    _shouldHandleChangeEvent(event) {
        return event.source !== this;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: DatepickerInput, deps: [{ token: i0.ElementRef }, { token: DateAdapter, optional: true }, { token: DATE_FORMATS, optional: true }], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.8", type: DatepickerInput, isStandalone: true, selector: "input[datepicker]", inputs: { datepicker: "datepicker", min: "min", max: "max", dateFilter: ["datepickerFilter", "dateFilter"] }, host: { listeners: { "input": "_onInput($event.target.value)", "change": "_onChange()", "blur": "_onBlur()", "keydown": "_onKeydown($event)" }, properties: { "attr.aria-owns": "(_datepicker?.opened && _datepicker.id) || null", "attr.min": "min ? _dateAdapter.toIso8601(min) : null", "attr.max": "max ? _dateAdapter.toIso8601(max) : null", "disabled": "disabled" } }, providers: [DATEPICKER_VALUE_ACCESSOR, DATEPICKER_VALIDATORS, INPUT_VALUE_ACCESSOR], exportAs: ["datepickerInput"], usesInheritance: true, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: DatepickerInput, decorators: [{
            type: Directive,
            args: [{
                    standalone: true,
                    selector: 'input[datepicker]',
                    providers: [DATEPICKER_VALUE_ACCESSOR, DATEPICKER_VALIDATORS, INPUT_VALUE_ACCESSOR],
                    host: {
                        '[attr.aria-owns]': '(_datepicker?.opened && _datepicker.id) || null',
                        '[attr.min]': 'min ? _dateAdapter.toIso8601(min) : null',
                        '[attr.max]': 'max ? _dateAdapter.toIso8601(max) : null',
                        '[disabled]': 'disabled',
                        '(input)': '_onInput($event.target.value)',
                        '(change)': '_onChange()',
                        '(blur)': '_onBlur()',
                        '(keydown)': '_onKeydown($event)',
                    },
                    exportAs: 'datepickerInput',
                }]
        }], ctorParameters: () => [{ type: i0.ElementRef }, { type: DateAdapter, decorators: [{
                    type: Optional
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [DATE_FORMATS]
                }] }], propDecorators: { datepicker: [{
                type: Input
            }], min: [{
                type: Input
            }], max: [{
                type: Input
            }], dateFilter: [{
                type: Input,
                args: ['datepickerFilter']
            }] } });

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/* eslint-disable @angular-eslint/no-input-rename */
class DatepickerToggle {
    _changeDetectorRef;
    _stateChanges = Subscription.EMPTY;
    /** Datepicker instance that the button will toggle. */
    datepicker;
    /** Screen-reader label for the button. */
    ariaLabel;
    /** Whether the toggle button is disabled. */
    get disabled() {
        if (this._disabled === undefined && this.datepicker) {
            return this.datepicker.disabled;
        }
        return !!this._disabled;
    }
    set disabled(value) {
        this._disabled = value;
    }
    _disabled;
    constructor(_changeDetectorRef) {
        this._changeDetectorRef = _changeDetectorRef;
    }
    ngOnChanges(changes) {
        if (changes['datepicker']) {
            this._watchStateChanges();
        }
    }
    ngOnDestroy() {
        this._stateChanges.unsubscribe();
    }
    ngAfterContentInit() {
        this._watchStateChanges();
    }
    _open(event) {
        if (this.datepicker && !this.disabled) {
            this.datepicker.open();
            event.stopPropagation();
        }
    }
    _watchStateChanges() {
        const datepickerStateChanged = this.datepicker ? this.datepicker.stateChanges : of();
        const inputStateChanged = this.datepicker && this.datepicker.datepickerInput
            ? this.datepicker.datepickerInput.stateChanges
            : of();
        const datepickerToggled = this.datepicker
            ? merge(this.datepicker.openedStream, this.datepicker.closedStream)
            : of();
        this._stateChanges.unsubscribe();
        this._stateChanges = merge(datepickerStateChanged, inputStateChanged, datepickerToggled).subscribe(() => this._changeDetectorRef.markForCheck());
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: DatepickerToggle, deps: [{ token: i0.ChangeDetectorRef }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "16.1.0", version: "18.2.8", type: DatepickerToggle, isStandalone: true, selector: "datepicker-toggle", inputs: { datepicker: ["for", "datepicker"], ariaLabel: ["aria-label", "ariaLabel"], disabled: ["disabled", "disabled", booleanAttribute] }, host: { listeners: { "click": "_open($event)" } }, exportAs: ["datepickerToggle"], usesOnChanges: true, ngImport: i0, template: "<button\n  class=\"btn btn-circle btn-ghost btn-sm\"\n  [disabled]=\"disabled\"\n>\n  <svg\n    class=\"w-6 h-6\"\n    viewBox=\"0 0 24 24\"\n    fill=\"none\"\n    stroke-width=\"1.5\"\n    stroke=\"currentColor\"\n    xmlns=\"http://www.w3.org/2000/svg\"\n  >\n    <path\n      stroke-linecap=\"round\"\n      stroke-linejoin=\"round\"\n      d=\"M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5\"\n    />\n  </svg>\n</button>\n", changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: DatepickerToggle, decorators: [{
            type: Component,
            args: [{ selector: 'datepicker-toggle', host: {
                        '(click)': '_open($event)',
                    }, standalone: true, exportAs: 'datepickerToggle', encapsulation: ViewEncapsulation.None, changeDetection: ChangeDetectionStrategy.OnPush, template: "<button\n  class=\"btn btn-circle btn-ghost btn-sm\"\n  [disabled]=\"disabled\"\n>\n  <svg\n    class=\"w-6 h-6\"\n    viewBox=\"0 0 24 24\"\n    fill=\"none\"\n    stroke-width=\"1.5\"\n    stroke=\"currentColor\"\n    xmlns=\"http://www.w3.org/2000/svg\"\n  >\n    <path\n      stroke-linecap=\"round\"\n      stroke-linejoin=\"round\"\n      d=\"M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5\"\n    />\n  </svg>\n</button>\n" }]
        }], ctorParameters: () => [{ type: i0.ChangeDetectorRef }], propDecorators: { datepicker: [{
                type: Input,
                args: ['for']
            }], ariaLabel: [{
                type: Input,
                args: ['aria-label']
            }], disabled: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }] } });

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
class DatepickerInputModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: DatepickerInputModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "18.2.8", ngImport: i0, type: DatepickerInputModule, imports: [CommonModule,
            OverlayModule,
            A11yModule,
            PortalModule,
            CalendarModule,
            Datepicker,
            DatepickerContent,
            DatepickerInput,
            DatepickerToggle], exports: [CdkScrollableModule, Datepicker, DatepickerContent, DatepickerInput, DatepickerToggle] });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: DatepickerInputModule, providers: [DATEPICKER_SCROLL_STRATEGY_FACTORY_PROVIDER], imports: [CommonModule,
            OverlayModule,
            A11yModule,
            PortalModule,
            CalendarModule, CdkScrollableModule] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: DatepickerInputModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [
                        CommonModule,
                        OverlayModule,
                        A11yModule,
                        PortalModule,
                        CalendarModule,
                        Datepicker,
                        DatepickerContent,
                        DatepickerInput,
                        DatepickerToggle,
                    ],
                    exports: [CdkScrollableModule, Datepicker, DatepickerContent, DatepickerInput, DatepickerToggle],
                    providers: [DATEPICKER_SCROLL_STRATEGY_FACTORY_PROVIDER],
                }]
        }] });

class DatepickerModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: DatepickerModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "18.2.8", ngImport: i0, type: DatepickerModule, imports: [CalendarModule, DatepickerInputModule], exports: [CalendarModule, DatepickerInputModule] });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: DatepickerModule, imports: [CalendarModule, DatepickerInputModule, CalendarModule, DatepickerInputModule] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: DatepickerModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [CalendarModule, DatepickerInputModule],
                    exports: [CalendarModule, DatepickerInputModule],
                }]
        }] });

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Generated bundle index. Do not edit.
 */

export { Calendar, CalendarBody, CalendarCell, CalendarHeader, CalendarModule, DATEPICKER_SCROLL_STRATEGY, DATEPICKER_SCROLL_STRATEGY_FACTORY, DATEPICKER_SCROLL_STRATEGY_FACTORY_PROVIDER, DATEPICKER_VALIDATORS, DATEPICKER_VALUE_ACCESSOR, DATE_FORMATS, DATE_LOCALE, DATE_LOCALE_FACTORY, DateAdapter, DateRange, DateSelectionModel, Datepicker, DatepickerContent, DatepickerInput, DatepickerInputEvent, DatepickerInputModule, DatepickerModule, DatepickerToggle, LUXON_DATE_ADAPTER_OPTIONS, LUXON_DATE_ADAPTER_OPTIONS_FACTORY, LUXON_DATE_FORMATS, LuxonDateAdapter, LuxonDateModule, MonthView, MultiYearView, NATIVE_DATE_FORMATS, NativeDateAdapter, NativeDateModule, SINGLE_DATE_SELECTION_MODEL_FACTORY, SINGLE_DATE_SELECTION_MODEL_PROVIDER, SingleDateSelectionModel, YearView, provideLuxonDateAdapter, provideNativeDateAdapter, yearsPerPage, yearsPerRow };
//# sourceMappingURL=libs-date-picker.mjs.map
