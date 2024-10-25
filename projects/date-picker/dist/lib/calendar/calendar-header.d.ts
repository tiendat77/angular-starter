/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ChangeDetectorRef } from '@angular/core';
import { DateAdapter, DateFormats } from '../adapter';
import { Calendar } from './calendar';
import * as i0 from "@angular/core";
/** Default header for MatCalendar */
export declare class CalendarHeader<D> {
    calendar: Calendar<D>;
    private _dateAdapter;
    private _dateFormats;
    constructor(calendar: Calendar<D>, _dateAdapter: DateAdapter<D>, _dateFormats: DateFormats, changeDetectorRef: ChangeDetectorRef);
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
    static ɵfac: i0.ɵɵFactoryDeclaration<CalendarHeader<any>, [null, { optional: true; }, { optional: true; }, null]>;
    static ɵcmp: i0.ɵɵComponentDeclaration<CalendarHeader<any>, "calendar-header", ["calendarHeader"], {}, {}, never, ["*"], true, never>;
}
