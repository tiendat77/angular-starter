/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { InjectionToken } from '@angular/core';
import { DateAdapter } from '../date-adapter';
import { DateTime as LuxonDateTime, CalendarSystem as LuxonCalendarSystem } from 'luxon';
import * as i0 from "@angular/core";
/** Configurable options for the `LuxonDateAdapter`. */
export interface LuxonDateAdapterOptions {
    /**
     * Turns the use of utc dates on or off.
     * Changing this will change how Angular Material components like DatePicker output dates.
     */
    useUtc: boolean;
    /**
     * Sets the first day of week.
     * Changing this will change how Angular Material components like DatePicker shows start of week.
     */
    firstDayOfWeek: number;
    /**
     * Sets the output Calendar.
     * Changing this will change how Angular Material components like DatePicker output dates.
     */
    defaultOutputCalendar: LuxonCalendarSystem;
}
/** InjectionToken for LuxonDateAdapter to configure options. */
export declare const LUXON_DATE_ADAPTER_OPTIONS: InjectionToken<LuxonDateAdapterOptions>;
/** @docs-private */
export declare function LUXON_DATE_ADAPTER_OPTIONS_FACTORY(): LuxonDateAdapterOptions;
/** Adapts Luxon Dates for use with Angular Material. */
export declare class LuxonDateAdapter extends DateAdapter<LuxonDateTime> {
    private _useUTC;
    private _firstDayOfWeek;
    private _defaultOutputCalendar;
    constructor(dateLocale: string, options?: LuxonDateAdapterOptions);
    getYear(date: LuxonDateTime): number;
    getMonth(date: LuxonDateTime): number;
    getDate(date: LuxonDateTime): number;
    getDayOfWeek(date: LuxonDateTime): number;
    getMonthNames(style: 'long' | 'short' | 'narrow'): string[];
    getDateNames(): string[];
    getDayOfWeekNames(style: 'long' | 'short' | 'narrow'): string[];
    getYearName(date: LuxonDateTime): string;
    getFirstDayOfWeek(): number;
    getNumDaysInMonth(date: LuxonDateTime): number;
    clone(date: LuxonDateTime): LuxonDateTime;
    createDate(year: number, month: number, date: number): LuxonDateTime;
    today(): LuxonDateTime;
    parse(value: any, parseFormat: string | string[]): LuxonDateTime | null;
    format(date: LuxonDateTime, displayFormat: string): string;
    addCalendarYears(date: LuxonDateTime, years: number): LuxonDateTime;
    addCalendarMonths(date: LuxonDateTime, months: number): LuxonDateTime;
    addCalendarDays(date: LuxonDateTime, days: number): LuxonDateTime;
    toIso8601(date: LuxonDateTime): string;
    /**
     * Returns the given value if given a valid Luxon or null. Deserializes valid ISO 8601 strings
     * (https://www.ietf.org/rfc/rfc3339.txt) and valid Date objects into valid DateTime and empty
     * string into null. Returns an invalid date for all other values.
     */
    deserialize(value: any): LuxonDateTime | null;
    isDateInstance(obj: any): boolean;
    isValid(date: LuxonDateTime): boolean;
    invalid(): LuxonDateTime;
    /** Gets the options that should be used when constructing a new `DateTime` object. */
    private _getOptions;
    static ɵfac: i0.ɵɵFactoryDeclaration<LuxonDateAdapter, [{ optional: true; }, { optional: true; }]>;
    static ɵprov: i0.ɵɵInjectableDeclaration<LuxonDateAdapter>;
}
