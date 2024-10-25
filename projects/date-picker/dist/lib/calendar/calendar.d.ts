/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ComponentType, Portal } from '@angular/cdk/portal';
import { AfterContentInit, AfterViewChecked, ChangeDetectorRef, EventEmitter, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { Subject } from 'rxjs';
import { DateRange } from '../date-picker/date-selection-model';
import { DateAdapter, DateFormats } from '../adapter';
import { CalendarUserEvent, CalendarCellClassFunction } from './calendar-body';
import { YearView } from './year-view';
import { MonthView } from './month-view';
import { MultiYearView } from './multi-year-view';
import * as i0 from "@angular/core";
/**
 * Possible views for the calendar.
 * @docs-private
 */
export type CalendarView = 'month' | 'year' | 'multi-year';
/** A calendar that is used as part of the datepicker. */
export declare class Calendar<D> implements AfterContentInit, AfterViewChecked, OnDestroy, OnChanges {
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
    constructor(_dateAdapter: DateAdapter<D>, _dateFormats: DateFormats, _changeDetectorRef: ChangeDetectorRef);
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
    static ɵfac: i0.ɵɵFactoryDeclaration<Calendar<any>, [{ optional: true; }, { optional: true; }, null]>;
    static ɵcmp: i0.ɵɵComponentDeclaration<Calendar<any>, "calendar", ["calendar"], { "headerComponent": { "alias": "headerComponent"; "required": false; }; "startAt": { "alias": "startAt"; "required": false; }; "startView": { "alias": "startView"; "required": false; }; "selected": { "alias": "selected"; "required": false; }; "minDate": { "alias": "minDate"; "required": false; }; "maxDate": { "alias": "maxDate"; "required": false; }; "dateFilter": { "alias": "dateFilter"; "required": false; }; "dateClass": { "alias": "dateClass"; "required": false; }; "comparisonStart": { "alias": "comparisonStart"; "required": false; }; "comparisonEnd": { "alias": "comparisonEnd"; "required": false; }; "startDateAccessibleName": { "alias": "startDateAccessibleName"; "required": false; }; "endDateAccessibleName": { "alias": "endDateAccessibleName"; "required": false; }; }, { "selectedChange": "selectedChange"; "yearSelected": "yearSelected"; "monthSelected": "monthSelected"; "viewChanged": "viewChanged"; "_userSelection": "_userSelection"; "_userDragDrop": "_userDragDrop"; }, never, never, true, never>;
}
