/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { CdkPortalOutlet, ComponentPortal } from '@angular/cdk/portal';
import { CdkMonitorFocus } from '@angular/cdk/a11y';
import { ChangeDetectionStrategy, Component, EventEmitter, Inject, Input, Optional, Output, ViewChild, ViewEncapsulation, } from '@angular/core';
import { Subject } from 'rxjs';
import { SINGLE_DATE_SELECTION_MODEL_PROVIDER, DateRange, } from '../date-picker/date-selection-model';
import { createMissingDateImplError } from '../utils/errors';
import { DATE_FORMATS } from '../adapter';
import { YearView } from './year-view';
import { MonthView } from './month-view';
import { MultiYearView } from './multi-year-view';
import { CalendarHeader } from './calendar-header';
import * as i0 from "@angular/core";
import * as i1 from "../adapter";
/** A calendar that is used as part of the datepicker. */
export class Calendar {
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
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: Calendar, deps: [{ token: i1.DateAdapter, optional: true }, { token: DATE_FORMATS, optional: true }, { token: i0.ChangeDetectorRef }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "18.2.8", type: Calendar, isStandalone: true, selector: "calendar", inputs: { headerComponent: "headerComponent", startAt: "startAt", startView: "startView", selected: "selected", minDate: "minDate", maxDate: "maxDate", dateFilter: "dateFilter", dateClass: "dateClass", comparisonStart: "comparisonStart", comparisonEnd: "comparisonEnd", startDateAccessibleName: "startDateAccessibleName", endDateAccessibleName: "endDateAccessibleName" }, outputs: { selectedChange: "selectedChange", yearSelected: "yearSelected", monthSelected: "monthSelected", viewChanged: "viewChanged", _userSelection: "_userSelection", _userDragDrop: "_userDragDrop" }, host: { classAttribute: "calendar" }, providers: [SINGLE_DATE_SELECTION_MODEL_PROVIDER], viewQueries: [{ propertyName: "monthView", first: true, predicate: MonthView, descendants: true }, { propertyName: "yearView", first: true, predicate: YearView, descendants: true }, { propertyName: "multiYearView", first: true, predicate: MultiYearView, descendants: true }], exportAs: ["calendar"], usesOnChanges: true, ngImport: i0, template: "<ng-template [cdkPortalOutlet]=\"_calendarHeaderPortal\" />\n\n<div\n  class=\"px-3 pt-1.5\"\n  cdkMonitorSubtreeFocus\n  tabindex=\"-1\"\n>\n  @switch (currentView) {\n    @case ('month') {\n      <month-view\n        [selected]=\"selected\"\n        [dateFilter]=\"dateFilter\"\n        [maxDate]=\"maxDate\"\n        [minDate]=\"minDate\"\n        [dateClass]=\"dateClass\"\n        [comparisonStart]=\"comparisonStart\"\n        [comparisonEnd]=\"comparisonEnd\"\n        [activeDrag]=\"_activeDrag\"\n        [(activeDate)]=\"activeDate\"\n        (_userSelection)=\"_dateSelected($event)\"\n        (dragStarted)=\"_dragStarted($event)\"\n        (dragEnded)=\"_dragEnded($event)\"\n      />\n    }\n\n    @case ('year') {\n      <year-view\n        [selected]=\"selected\"\n        [dateFilter]=\"dateFilter\"\n        [maxDate]=\"maxDate\"\n        [minDate]=\"minDate\"\n        [dateClass]=\"dateClass\"\n        [(activeDate)]=\"activeDate\"\n        (monthSelected)=\"_monthSelectedInYearView($event)\"\n        (selectedChange)=\"_goToDateInView($event, 'month')\"\n      />\n    }\n\n    @case ('multi-year') {\n      <multi-year-view\n        [selected]=\"selected\"\n        [dateFilter]=\"dateFilter\"\n        [maxDate]=\"maxDate\"\n        [minDate]=\"minDate\"\n        [dateClass]=\"dateClass\"\n        [(activeDate)]=\"activeDate\"\n        (yearSelected)=\"_yearSelectedInMultiYearView($event)\"\n        (selectedChange)=\"_goToDateInView($event, 'year')\"\n      />\n    }\n  }\n</div>\n", styles: [".calendar .calendar-table{width:100%;border-collapse:collapse}.calendar .calendar-table-header th{font-size:.875rem;font-weight:400;color:var(--text-hint);padding-bottom:.5rem}\n"], dependencies: [{ kind: "directive", type: CdkPortalOutlet, selector: "[cdkPortalOutlet]", inputs: ["cdkPortalOutlet"], outputs: ["attached"], exportAs: ["cdkPortalOutlet"] }, { kind: "directive", type: CdkMonitorFocus, selector: "[cdkMonitorElementFocus], [cdkMonitorSubtreeFocus]", outputs: ["cdkFocusChange"], exportAs: ["cdkMonitorFocus"] }, { kind: "component", type: MonthView, selector: "month-view", inputs: ["activeDate", "selected", "minDate", "maxDate", "dateFilter", "dateClass", "comparisonStart", "comparisonEnd", "startDateAccessibleName", "endDateAccessibleName", "activeDrag"], outputs: ["selectedChange", "_userSelection", "dragStarted", "dragEnded", "activeDateChange"], exportAs: ["monthView"] }, { kind: "component", type: YearView, selector: "year-view", inputs: ["activeDate", "selected", "minDate", "maxDate", "dateFilter", "dateClass"], outputs: ["selectedChange", "monthSelected", "activeDateChange"], exportAs: ["yearView"] }, { kind: "component", type: MultiYearView, selector: "multi-year-view", inputs: ["activeDate", "selected", "minDate", "maxDate", "dateFilter", "dateClass"], outputs: ["selectedChange", "yearSelected", "activeDateChange"], exportAs: ["multiYearView"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: Calendar, decorators: [{
            type: Component,
            args: [{ selector: 'calendar', host: {
                        class: 'calendar',
                    }, exportAs: 'calendar', encapsulation: ViewEncapsulation.None, changeDetection: ChangeDetectionStrategy.OnPush, providers: [SINGLE_DATE_SELECTION_MODEL_PROVIDER], standalone: true, imports: [CdkPortalOutlet, CdkMonitorFocus, MonthView, YearView, MultiYearView], template: "<ng-template [cdkPortalOutlet]=\"_calendarHeaderPortal\" />\n\n<div\n  class=\"px-3 pt-1.5\"\n  cdkMonitorSubtreeFocus\n  tabindex=\"-1\"\n>\n  @switch (currentView) {\n    @case ('month') {\n      <month-view\n        [selected]=\"selected\"\n        [dateFilter]=\"dateFilter\"\n        [maxDate]=\"maxDate\"\n        [minDate]=\"minDate\"\n        [dateClass]=\"dateClass\"\n        [comparisonStart]=\"comparisonStart\"\n        [comparisonEnd]=\"comparisonEnd\"\n        [activeDrag]=\"_activeDrag\"\n        [(activeDate)]=\"activeDate\"\n        (_userSelection)=\"_dateSelected($event)\"\n        (dragStarted)=\"_dragStarted($event)\"\n        (dragEnded)=\"_dragEnded($event)\"\n      />\n    }\n\n    @case ('year') {\n      <year-view\n        [selected]=\"selected\"\n        [dateFilter]=\"dateFilter\"\n        [maxDate]=\"maxDate\"\n        [minDate]=\"minDate\"\n        [dateClass]=\"dateClass\"\n        [(activeDate)]=\"activeDate\"\n        (monthSelected)=\"_monthSelectedInYearView($event)\"\n        (selectedChange)=\"_goToDateInView($event, 'month')\"\n      />\n    }\n\n    @case ('multi-year') {\n      <multi-year-view\n        [selected]=\"selected\"\n        [dateFilter]=\"dateFilter\"\n        [maxDate]=\"maxDate\"\n        [minDate]=\"minDate\"\n        [dateClass]=\"dateClass\"\n        [(activeDate)]=\"activeDate\"\n        (yearSelected)=\"_yearSelectedInMultiYearView($event)\"\n        (selectedChange)=\"_goToDateInView($event, 'year')\"\n      />\n    }\n  }\n</div>\n", styles: [".calendar .calendar-table{width:100%;border-collapse:collapse}.calendar .calendar-table-header th{font-size:.875rem;font-weight:400;color:var(--text-hint);padding-bottom:.5rem}\n"] }]
        }], ctorParameters: () => [{ type: i1.DateAdapter, decorators: [{
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FsZW5kYXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvbGliL2NhbGVuZGFyL2NhbGVuZGFyLnRzIiwiLi4vLi4vLi4vLi4vc3JjL2xpYi9jYWxlbmRhci9jYWxlbmRhci5odG1sIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBRSxlQUFlLEVBQUUsZUFBZSxFQUF5QixNQUFNLHFCQUFxQixDQUFDO0FBQzlGLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUVwRCxPQUFPLEVBR0wsdUJBQXVCLEVBRXZCLFNBQVMsRUFDVCxZQUFZLEVBQ1osTUFBTSxFQUNOLEtBQUssRUFHTCxRQUFRLEVBQ1IsTUFBTSxFQUdOLFNBQVMsRUFDVCxpQkFBaUIsR0FDbEIsTUFBTSxlQUFlLENBQUM7QUFFdkIsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUUvQixPQUFPLEVBQ0wsb0NBQW9DLEVBQ3BDLFNBQVMsR0FDVixNQUFNLHFDQUFxQyxDQUFDO0FBQzdDLE9BQU8sRUFBRSwwQkFBMEIsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQzdELE9BQU8sRUFBZSxZQUFZLEVBQWUsTUFBTSxZQUFZLENBQUM7QUFFcEUsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLGFBQWEsQ0FBQztBQUN2QyxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sY0FBYyxDQUFDO0FBQ3pDLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUNsRCxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sbUJBQW1CLENBQUM7OztBQVFuRCx5REFBeUQ7QUFlekQsTUFBTSxPQUFPLFFBQVE7SUEwSkc7SUFDc0I7SUFDbEM7SUEzSlYsb0VBQW9FO0lBQzNELGVBQWUsQ0FBcUI7SUFFN0MsdUVBQXVFO0lBQ3ZFLHFCQUFxQixDQUFjO0lBRW5DOzs7O09BSUc7SUFDSyxvQkFB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QkFHTyxhQUFhO3NCQUF0QyxTQUFTO3VCQUFDLGFBQWEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHsgQ2RrUG9ydGFsT3V0bGV0LCBDb21wb25lbnRQb3J0YWwsIENvbXBvbmVudFR5cGUsIFBvcnRhbCB9IGZyb20gJ0Bhbmd1bGFyL2Nkay9wb3J0YWwnO1xuaW1wb3J0IHsgQ2RrTW9uaXRvckZvY3VzIH0gZnJvbSAnQGFuZ3VsYXIvY2RrL2ExMXknO1xuXG5pbXBvcnQge1xuICBBZnRlckNvbnRlbnRJbml0LFxuICBBZnRlclZpZXdDaGVja2VkLFxuICBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSxcbiAgQ2hhbmdlRGV0ZWN0b3JSZWYsXG4gIENvbXBvbmVudCxcbiAgRXZlbnRFbWl0dGVyLFxuICBJbmplY3QsXG4gIElucHV0LFxuICBPbkNoYW5nZXMsXG4gIE9uRGVzdHJveSxcbiAgT3B0aW9uYWwsXG4gIE91dHB1dCxcbiAgU2ltcGxlQ2hhbmdlLFxuICBTaW1wbGVDaGFuZ2VzLFxuICBWaWV3Q2hpbGQsXG4gIFZpZXdFbmNhcHN1bGF0aW9uLFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgU3ViamVjdCB9IGZyb20gJ3J4anMnO1xuXG5pbXBvcnQge1xuICBTSU5HTEVfREFURV9TRUxFQ1RJT05fTU9ERUxfUFJPVklERVIsXG4gIERhdGVSYW5nZSxcbn0gZnJvbSAnLi4vZGF0ZS1waWNrZXIvZGF0ZS1zZWxlY3Rpb24tbW9kZWwnO1xuaW1wb3J0IHsgY3JlYXRlTWlzc2luZ0RhdGVJbXBsRXJyb3IgfSBmcm9tICcuLi91dGlscy9lcnJvcnMnO1xuaW1wb3J0IHsgRGF0ZUFkYXB0ZXIsIERBVEVfRk9STUFUUywgRGF0ZUZvcm1hdHMgfSBmcm9tICcuLi9hZGFwdGVyJztcbmltcG9ydCB7IENhbGVuZGFyVXNlckV2ZW50LCBDYWxlbmRhckNlbGxDbGFzc0Z1bmN0aW9uIH0gZnJvbSAnLi9jYWxlbmRhci1ib2R5JztcbmltcG9ydCB7IFllYXJWaWV3IH0gZnJvbSAnLi95ZWFyLXZpZXcnO1xuaW1wb3J0IHsgTW9udGhWaWV3IH0gZnJvbSAnLi9tb250aC12aWV3JztcbmltcG9ydCB7IE11bHRpWWVhclZpZXcgfSBmcm9tICcuL211bHRpLXllYXItdmlldyc7XG5pbXBvcnQgeyBDYWxlbmRhckhlYWRlciB9IGZyb20gJy4vY2FsZW5kYXItaGVhZGVyJztcblxuLyoqXG4gKiBQb3NzaWJsZSB2aWV3cyBmb3IgdGhlIGNhbGVuZGFyLlxuICogQGRvY3MtcHJpdmF0ZVxuICovXG5leHBvcnQgdHlwZSBDYWxlbmRhclZpZXcgPSAnbW9udGgnIHwgJ3llYXInIHwgJ211bHRpLXllYXInO1xuXG4vKiogQSBjYWxlbmRhciB0aGF0IGlzIHVzZWQgYXMgcGFydCBvZiB0aGUgZGF0ZXBpY2tlci4gKi9cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ2NhbGVuZGFyJyxcbiAgdGVtcGxhdGVVcmw6ICdjYWxlbmRhci5odG1sJyxcbiAgc3R5bGVVcmw6ICdjYWxlbmRhci5zY3NzJyxcbiAgaG9zdDoge1xuICAgIGNsYXNzOiAnY2FsZW5kYXInLFxuICB9LFxuICBleHBvcnRBczogJ2NhbGVuZGFyJyxcbiAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24uTm9uZSxcbiAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5PblB1c2gsXG4gIHByb3ZpZGVyczogW1NJTkdMRV9EQVRFX1NFTEVDVElPTl9NT0RFTF9QUk9WSURFUl0sXG4gIHN0YW5kYWxvbmU6IHRydWUsXG4gIGltcG9ydHM6IFtDZGtQb3J0YWxPdXRsZXQsIENka01vbml0b3JGb2N1cywgTW9udGhWaWV3LCBZZWFyVmlldywgTXVsdGlZZWFyVmlld10sXG59KVxuZXhwb3J0IGNsYXNzIENhbGVuZGFyPEQ+IGltcGxlbWVudHMgQWZ0ZXJDb250ZW50SW5pdCwgQWZ0ZXJWaWV3Q2hlY2tlZCwgT25EZXN0cm95LCBPbkNoYW5nZXMge1xuICAvKiogQW4gaW5wdXQgaW5kaWNhdGluZyB0aGUgdHlwZSBvZiB0aGUgaGVhZGVyIGNvbXBvbmVudCwgaWYgc2V0LiAqL1xuICBASW5wdXQoKSBoZWFkZXJDb21wb25lbnQ6IENvbXBvbmVudFR5cGU8YW55PjtcblxuICAvKiogQSBwb3J0YWwgY29udGFpbmluZyB0aGUgaGVhZGVyIGNvbXBvbmVudCB0eXBlIGZvciB0aGlzIGNhbGVuZGFyLiAqL1xuICBfY2FsZW5kYXJIZWFkZXJQb3J0YWw6IFBvcnRhbDxhbnk+O1xuXG4gIC8qKlxuICAgKiBVc2VkIGZvciBzY2hlZHVsaW5nIHRoYXQgZm9jdXMgc2hvdWxkIGJlIG1vdmVkIHRvIHRoZSBhY3RpdmUgY2VsbCBvbiB0aGUgbmV4dCB0aWNrLlxuICAgKiBXZSBuZWVkIHRvIHNjaGVkdWxlIGl0LCByYXRoZXIgdGhhbiBkbyBpdCBpbW1lZGlhdGVseSwgYmVjYXVzZSB3ZSBoYXZlIHRvIHdhaXRcbiAgICogZm9yIEFuZ3VsYXIgdG8gcmUtZXZhbHVhdGUgdGhlIHZpZXcgY2hpbGRyZW4uXG4gICAqL1xuICBwcml2YXRlIF9tb3ZlRm9jdXNPbk5leHRUaWNrID0gZmFsc2U7XG5cbiAgLyoqIEEgZGF0ZSByZXByZXNlbnRpbmcgdGhlIHBlcmlvZCAobW9udGggb3IgeWVhcikgdG8gc3RhcnQgdGhlIGNhbGVuZGFyIGluLiAqL1xuICBASW5wdXQoKVxuICBnZXQgc3RhcnRBdCgpOiBEIHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuX3N0YXJ0QXQ7XG4gIH1cbiAgc2V0IHN0YXJ0QXQodmFsdWU6IEQgfCBudWxsKSB7XG4gICAgdGhpcy5fc3RhcnRBdCA9IHRoaXMuX2RhdGVBZGFwdGVyLmdldFZhbGlkRGF0ZU9yTnVsbCh0aGlzLl9kYXRlQWRhcHRlci5kZXNlcmlhbGl6ZSh2YWx1ZSkpO1xuICB9XG4gIHByaXZhdGUgX3N0YXJ0QXQ6IEQgfCBudWxsO1xuXG4gIC8qKiBXaGV0aGVyIHRoZSBjYWxlbmRhciBzaG91bGQgYmUgc3RhcnRlZCBpbiBtb250aCBvciB5ZWFyIHZpZXcuICovXG4gIEBJbnB1dCgpIHN0YXJ0VmlldzogQ2FsZW5kYXJWaWV3ID0gJ21vbnRoJztcblxuICAvKiogVGhlIGN1cnJlbnRseSBzZWxlY3RlZCBkYXRlLiAqL1xuICBASW5wdXQoKVxuICBnZXQgc2VsZWN0ZWQoKTogRGF0ZVJhbmdlPEQ+IHwgRCB8IG51bGwge1xuICAgIHJldHVybiB0aGlzLl9zZWxlY3RlZDtcbiAgfVxuICBzZXQgc2VsZWN0ZWQodmFsdWU6IERhdGVSYW5nZTxEPiB8IEQgfCBudWxsKSB7XG4gICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgRGF0ZVJhbmdlKSB7XG4gICAgICB0aGlzLl9zZWxlY3RlZCA9IHZhbHVlO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9zZWxlY3RlZCA9IHRoaXMuX2RhdGVBZGFwdGVyLmdldFZhbGlkRGF0ZU9yTnVsbCh0aGlzLl9kYXRlQWRhcHRlci5kZXNlcmlhbGl6ZSh2YWx1ZSkpO1xuICAgIH1cbiAgfVxuICBwcml2YXRlIF9zZWxlY3RlZDogRGF0ZVJhbmdlPEQ+IHwgRCB8IG51bGw7XG5cbiAgLyoqIFRoZSBtaW5pbXVtIHNlbGVjdGFibGUgZGF0ZS4gKi9cbiAgQElucHV0KClcbiAgZ2V0IG1pbkRhdGUoKTogRCB8IG51bGwge1xuICAgIHJldHVybiB0aGlzLl9taW5EYXRlO1xuICB9XG4gIHNldCBtaW5EYXRlKHZhbHVlOiBEIHwgbnVsbCkge1xuICAgIHRoaXMuX21pbkRhdGUgPSB0aGlzLl9kYXRlQWRhcHRlci5nZXRWYWxpZERhdGVPck51bGwodGhpcy5fZGF0ZUFkYXB0ZXIuZGVzZXJpYWxpemUodmFsdWUpKTtcbiAgfVxuICBwcml2YXRlIF9taW5EYXRlOiBEIHwgbnVsbDtcblxuICAvKiogVGhlIG1heGltdW0gc2VsZWN0YWJsZSBkYXRlLiAqL1xuICBASW5wdXQoKVxuICBnZXQgbWF4RGF0ZSgpOiBEIHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuX21heERhdGU7XG4gIH1cbiAgc2V0IG1heERhdGUodmFsdWU6IEQgfCBudWxsKSB7XG4gICAgdGhpcy5fbWF4RGF0ZSA9IHRoaXMuX2RhdGVBZGFwdGVyLmdldFZhbGlkRGF0ZU9yTnVsbCh0aGlzLl9kYXRlQWRhcHRlci5kZXNlcmlhbGl6ZSh2YWx1ZSkpO1xuICB9XG4gIHByaXZhdGUgX21heERhdGU6IEQgfCBudWxsO1xuXG4gIC8qKiBGdW5jdGlvbiB1c2VkIHRvIGZpbHRlciB3aGljaCBkYXRlcyBhcmUgc2VsZWN0YWJsZS4gKi9cbiAgQElucHV0KCkgZGF0ZUZpbHRlcjogKGRhdGU6IEQpID0+IGJvb2xlYW47XG5cbiAgLyoqIEZ1bmN0aW9uIHRoYXQgY2FuIGJlIHVzZWQgdG8gYWRkIGN1c3RvbSBDU1MgY2xhc3NlcyB0byBkYXRlcy4gKi9cbiAgQElucHV0KCkgZGF0ZUNsYXNzOiBDYWxlbmRhckNlbGxDbGFzc0Z1bmN0aW9uPEQ+O1xuXG4gIC8qKiBTdGFydCBvZiB0aGUgY29tcGFyaXNvbiByYW5nZS4gKi9cbiAgQElucHV0KCkgY29tcGFyaXNvblN0YXJ0OiBEIHwgbnVsbDtcblxuICAvKiogRW5kIG9mIHRoZSBjb21wYXJpc29uIHJhbmdlLiAqL1xuICBASW5wdXQoKSBjb21wYXJpc29uRW5kOiBEIHwgbnVsbDtcblxuICAvKiogQVJJQSBBY2Nlc3NpYmxlIG5hbWUgb2YgdGhlIGA8aW5wdXQgc3RhcnREYXRlLz5gICovXG4gIEBJbnB1dCgpIHN0YXJ0RGF0ZUFjY2Vzc2libGVOYW1lOiBzdHJpbmcgfCBudWxsO1xuXG4gIC8qKiBBUklBIEFjY2Vzc2libGUgbmFtZSBvZiB0aGUgYDxpbnB1dCBlbmREYXRlLz5gICovXG4gIEBJbnB1dCgpIGVuZERhdGVBY2Nlc3NpYmxlTmFtZTogc3RyaW5nIHwgbnVsbDtcblxuICAvKiogRW1pdHMgd2hlbiB0aGUgY3VycmVudGx5IHNlbGVjdGVkIGRhdGUgY2hhbmdlcy4gKi9cbiAgQE91dHB1dCgpIHJlYWRvbmx5IHNlbGVjdGVkQ2hhbmdlOiBFdmVudEVtaXR0ZXI8RCB8IG51bGw+ID0gbmV3IEV2ZW50RW1pdHRlcjxEIHwgbnVsbD4oKTtcblxuICAvKipcbiAgICogRW1pdHMgdGhlIHllYXIgY2hvc2VuIGluIG11bHRpeWVhciB2aWV3LlxuICAgKiBUaGlzIGRvZXNuJ3QgaW1wbHkgYSBjaGFuZ2Ugb24gdGhlIHNlbGVjdGVkIGRhdGUuXG4gICAqL1xuICBAT3V0cHV0KCkgcmVhZG9ubHkgeWVhclNlbGVjdGVkOiBFdmVudEVtaXR0ZXI8RD4gPSBuZXcgRXZlbnRFbWl0dGVyPEQ+KCk7XG5cbiAgLyoqXG4gICAqIEVtaXRzIHRoZSBtb250aCBjaG9zZW4gaW4geWVhciB2aWV3LlxuICAgKiBUaGlzIGRvZXNuJ3QgaW1wbHkgYSBjaGFuZ2Ugb24gdGhlIHNlbGVjdGVkIGRhdGUuXG4gICAqL1xuICBAT3V0cHV0KCkgcmVhZG9ubHkgbW9udGhTZWxlY3RlZDogRXZlbnRFbWl0dGVyPEQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxEPigpO1xuXG4gIC8qKlxuICAgKiBFbWl0cyB3aGVuIHRoZSBjdXJyZW50IHZpZXcgY2hhbmdlcy5cbiAgICovXG4gIEBPdXRwdXQoKSByZWFkb25seSB2aWV3Q2hhbmdlZDogRXZlbnRFbWl0dGVyPENhbGVuZGFyVmlldz4gPSBuZXcgRXZlbnRFbWl0dGVyPENhbGVuZGFyVmlldz4odHJ1ZSk7XG5cbiAgLyoqIEVtaXRzIHdoZW4gYW55IGRhdGUgaXMgc2VsZWN0ZWQuICovXG4gIEBPdXRwdXQoKSByZWFkb25seSBfdXNlclNlbGVjdGlvbjogRXZlbnRFbWl0dGVyPENhbGVuZGFyVXNlckV2ZW50PEQgfCBudWxsPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFxuICAgIENhbGVuZGFyVXNlckV2ZW50PEQgfCBudWxsPlxuICA+KCk7XG5cbiAgLyoqIEVtaXRzIGEgbmV3IGRhdGUgcmFuZ2UgdmFsdWUgd2hlbiB0aGUgdXNlciBjb21wbGV0ZXMgYSBkcmFnIGRyb3Agb3BlcmF0aW9uLiAqL1xuICBAT3V0cHV0KCkgcmVhZG9ubHkgX3VzZXJEcmFnRHJvcCA9IG5ldyBFdmVudEVtaXR0ZXI8Q2FsZW5kYXJVc2VyRXZlbnQ8RGF0ZVJhbmdlPEQ+Pj4oKTtcblxuICAvKiogUmVmZXJlbmNlIHRvIHRoZSBjdXJyZW50IG1vbnRoIHZpZXcgY29tcG9uZW50LiAqL1xuICBAVmlld0NoaWxkKE1vbnRoVmlldykgbW9udGhWaWV3OiBNb250aFZpZXc8RD47XG5cbiAgLyoqIFJlZmVyZW5jZSB0byB0aGUgY3VycmVudCB5ZWFyIHZpZXcgY29tcG9uZW50LiAqL1xuICBAVmlld0NoaWxkKFllYXJWaWV3KSB5ZWFyVmlldzogWWVhclZpZXc8RD47XG5cbiAgLyoqIFJlZmVyZW5jZSB0byB0aGUgY3VycmVudCBtdWx0aS15ZWFyIHZpZXcgY29tcG9uZW50LiAqL1xuICBAVmlld0NoaWxkKE11bHRpWWVhclZpZXcpIG11bHRpWWVhclZpZXc6IE11bHRpWWVhclZpZXc8RD47XG5cbiAgLyoqXG4gICAqIFRoZSBjdXJyZW50IGFjdGl2ZSBkYXRlLiBUaGlzIGRldGVybWluZXMgd2hpY2ggdGltZSBwZXJpb2QgaXMgc2hvd24gYW5kIHdoaWNoIGRhdGUgaXNcbiAgICogaGlnaGxpZ2h0ZWQgd2hlbiB1c2luZyBrZXlib2FyZCBuYXZpZ2F0aW9uLlxuICAgKi9cbiAgZ2V0IGFjdGl2ZURhdGUoKTogRCB7XG4gICAgcmV0dXJuIHRoaXMuX2NsYW1wZWRBY3RpdmVEYXRlO1xuICB9XG4gIHNldCBhY3RpdmVEYXRlKHZhbHVlOiBEKSB7XG4gICAgdGhpcy5fY2xhbXBlZEFjdGl2ZURhdGUgPSB0aGlzLl9kYXRlQWRhcHRlci5jbGFtcERhdGUodmFsdWUsIHRoaXMubWluRGF0ZSwgdGhpcy5tYXhEYXRlKTtcbiAgICB0aGlzLnN0YXRlQ2hhbmdlcy5uZXh0KCk7XG4gICAgdGhpcy5fY2hhbmdlRGV0ZWN0b3JSZWYubWFya0ZvckNoZWNrKCk7XG4gIH1cbiAgcHJpdmF0ZSBfY2xhbXBlZEFjdGl2ZURhdGU6IEQ7XG5cbiAgLyoqIFdoZXRoZXIgdGhlIGNhbGVuZGFyIGlzIGluIG1vbnRoIHZpZXcuICovXG4gIGdldCBjdXJyZW50VmlldygpOiBDYWxlbmRhclZpZXcge1xuICAgIHJldHVybiB0aGlzLl9jdXJyZW50VmlldztcbiAgfVxuICBzZXQgY3VycmVudFZpZXcodmFsdWU6IENhbGVuZGFyVmlldykge1xuICAgIGNvbnN0IHZpZXdDaGFuZ2VkUmVzdWx0ID0gdGhpcy5fY3VycmVudFZpZXcgIT09IHZhbHVlID8gdmFsdWUgOiBudWxsO1xuICAgIHRoaXMuX2N1cnJlbnRWaWV3ID0gdmFsdWU7XG4gICAgdGhpcy5fbW92ZUZvY3VzT25OZXh0VGljayA9IHRydWU7XG4gICAgdGhpcy5fY2hhbmdlRGV0ZWN0b3JSZWYubWFya0ZvckNoZWNrKCk7XG4gICAgaWYgKHZpZXdDaGFuZ2VkUmVzdWx0KSB7XG4gICAgICB0aGlzLnZpZXdDaGFuZ2VkLmVtaXQodmlld0NoYW5nZWRSZXN1bHQpO1xuICAgIH1cbiAgfVxuICBwcml2YXRlIF9jdXJyZW50VmlldzogQ2FsZW5kYXJWaWV3O1xuXG4gIC8qKiBPcmlnaW4gb2YgYWN0aXZlIGRyYWcsIG9yIG51bGwgd2hlbiBkcmFnZ2luZyBpcyBub3QgYWN0aXZlLiAqL1xuICBwcm90ZWN0ZWQgX2FjdGl2ZURyYWc6IENhbGVuZGFyVXNlckV2ZW50PEQ+IHwgbnVsbCA9IG51bGw7XG5cbiAgLyoqXG4gICAqIEVtaXRzIHdoZW5ldmVyIHRoZXJlIGlzIGEgc3RhdGUgY2hhbmdlIHRoYXQgdGhlIGhlYWRlciBtYXkgbmVlZCB0byByZXNwb25kIHRvLlxuICAgKi9cbiAgcmVhZG9ubHkgc3RhdGVDaGFuZ2VzID0gbmV3IFN1YmplY3Q8dm9pZD4oKTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBAT3B0aW9uYWwoKSBwcml2YXRlIF9kYXRlQWRhcHRlcjogRGF0ZUFkYXB0ZXI8RD4sXG4gICAgQE9wdGlvbmFsKCkgQEluamVjdChEQVRFX0ZPUk1BVFMpIHByaXZhdGUgX2RhdGVGb3JtYXRzOiBEYXRlRm9ybWF0cyxcbiAgICBwcml2YXRlIF9jaGFuZ2VEZXRlY3RvclJlZjogQ2hhbmdlRGV0ZWN0b3JSZWZcbiAgKSB7XG4gICAgaWYgKCF0aGlzLl9kYXRlQWRhcHRlcikge1xuICAgICAgdGhyb3cgY3JlYXRlTWlzc2luZ0RhdGVJbXBsRXJyb3IoJ0RhdGVBZGFwdGVyJyk7XG4gICAgfVxuXG4gICAgaWYgKCF0aGlzLl9kYXRlRm9ybWF0cykge1xuICAgICAgdGhyb3cgY3JlYXRlTWlzc2luZ0RhdGVJbXBsRXJyb3IoJ0RBVEVfRk9STUFUUycpO1xuICAgIH1cbiAgfVxuXG4gIG5nQWZ0ZXJDb250ZW50SW5pdCgpIHtcbiAgICB0aGlzLl9jYWxlbmRhckhlYWRlclBvcnRhbCA9IG5ldyBDb21wb25lbnRQb3J0YWwodGhpcy5oZWFkZXJDb21wb25lbnQgfHwgQ2FsZW5kYXJIZWFkZXIpO1xuICAgIHRoaXMuYWN0aXZlRGF0ZSA9IHRoaXMuc3RhcnRBdCB8fCB0aGlzLl9kYXRlQWRhcHRlci50b2RheSgpO1xuXG4gICAgLy8gQXNzaWduIHRvIHRoZSBwcml2YXRlIHByb3BlcnR5IHNpbmNlIHdlIGRvbid0IHdhbnQgdG8gbW92ZSBmb2N1cyBvbiBpbml0LlxuICAgIHRoaXMuX2N1cnJlbnRWaWV3ID0gdGhpcy5zdGFydFZpZXc7XG4gIH1cblxuICBuZ0FmdGVyVmlld0NoZWNrZWQoKSB7XG4gICAgaWYgKHRoaXMuX21vdmVGb2N1c09uTmV4dFRpY2spIHtcbiAgICAgIHRoaXMuX21vdmVGb2N1c09uTmV4dFRpY2sgPSBmYWxzZTtcbiAgICAgIHRoaXMuZm9jdXNBY3RpdmVDZWxsKCk7XG4gICAgfVxuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgdGhpcy5zdGF0ZUNoYW5nZXMuY29tcGxldGUoKTtcbiAgfVxuXG4gIG5nT25DaGFuZ2VzKGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMpIHtcbiAgICAvLyBJZ25vcmUgZGF0ZSBjaGFuZ2VzIHRoYXQgYXJlIGF0IGEgZGlmZmVyZW50IHRpbWUgb24gdGhlIHNhbWUgZGF5LiBUaGlzIGZpeGVzIGlzc3VlcyB3aGVyZVxuICAgIC8vIHRoZSBjYWxlbmRhciByZS1yZW5kZXJzIHdoZW4gdGhlcmUgaXMgbm8gbWVhbmluZ2Z1bCBjaGFuZ2UgdG8gW21pbkRhdGVdIG9yIFttYXhEYXRlXVxuICAgIC8vICgjMjQ0MzUpLlxuICAgIGNvbnN0IG1pbkRhdGVDaGFuZ2U6IFNpbXBsZUNoYW5nZSB8IHVuZGVmaW5lZCA9XG4gICAgICBjaGFuZ2VzWydtaW5EYXRlJ10gJiZcbiAgICAgICF0aGlzLl9kYXRlQWRhcHRlci5zYW1lRGF0ZShjaGFuZ2VzWydtaW5EYXRlJ10ucHJldmlvdXNWYWx1ZSwgY2hhbmdlc1snbWluRGF0ZSddLmN1cnJlbnRWYWx1ZSlcbiAgICAgICAgPyBjaGFuZ2VzWydtaW5EYXRlJ11cbiAgICAgICAgOiB1bmRlZmluZWQ7XG4gICAgY29uc3QgbWF4RGF0ZUNoYW5nZTogU2ltcGxlQ2hhbmdlIHwgdW5kZWZpbmVkID1cbiAgICAgIGNoYW5nZXNbJ21heERhdGUnXSAmJlxuICAgICAgIXRoaXMuX2RhdGVBZGFwdGVyLnNhbWVEYXRlKGNoYW5nZXNbJ21heERhdGUnXS5wcmV2aW91c1ZhbHVlLCBjaGFuZ2VzWydtYXhEYXRlJ10uY3VycmVudFZhbHVlKVxuICAgICAgICA/IGNoYW5nZXNbJ21heERhdGUnXVxuICAgICAgICA6IHVuZGVmaW5lZDtcblxuICAgIGNvbnN0IGNoYW5nZSA9IG1pbkRhdGVDaGFuZ2UgfHwgbWF4RGF0ZUNoYW5nZSB8fCBjaGFuZ2VzWydkYXRlRmlsdGVyJ107XG5cbiAgICBpZiAoY2hhbmdlICYmICFjaGFuZ2UuZmlyc3RDaGFuZ2UpIHtcbiAgICAgIGNvbnN0IHZpZXcgPSB0aGlzLl9nZXRDdXJyZW50Vmlld0NvbXBvbmVudCgpO1xuXG4gICAgICBpZiAodmlldykge1xuICAgICAgICAvLyBXZSBuZWVkIHRvIGBkZXRlY3RDaGFuZ2VzYCBtYW51YWxseSBoZXJlLCBiZWNhdXNlIHRoZSBgbWluRGF0ZWAsIGBtYXhEYXRlYCBldGMuIGFyZVxuICAgICAgICAvLyBwYXNzZWQgZG93biB0byB0aGUgdmlldyB2aWEgZGF0YSBiaW5kaW5ncyB3aGljaCB3b24ndCBiZSB1cC10by1kYXRlIHdoZW4gd2UgY2FsbCBgX2luaXRgLlxuICAgICAgICB0aGlzLl9jaGFuZ2VEZXRlY3RvclJlZi5kZXRlY3RDaGFuZ2VzKCk7XG4gICAgICAgIHZpZXcuX2luaXQoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLnN0YXRlQ2hhbmdlcy5uZXh0KCk7XG4gIH1cblxuICAvKiogRm9jdXNlcyB0aGUgYWN0aXZlIGRhdGUuICovXG4gIGZvY3VzQWN0aXZlQ2VsbCgpIHtcbiAgICB0aGlzLl9nZXRDdXJyZW50Vmlld0NvbXBvbmVudCgpLl9mb2N1c0FjdGl2ZUNlbGwoZmFsc2UpO1xuICB9XG5cbiAgLyoqIFVwZGF0ZXMgdG9kYXkncyBkYXRlIGFmdGVyIGFuIHVwZGF0ZSBvZiB0aGUgYWN0aXZlIGRhdGUgKi9cbiAgdXBkYXRlVG9kYXlzRGF0ZSgpIHtcbiAgICB0aGlzLl9nZXRDdXJyZW50Vmlld0NvbXBvbmVudCgpLl9pbml0KCk7XG4gIH1cblxuICAvKiogSGFuZGxlcyBkYXRlIHNlbGVjdGlvbiBpbiB0aGUgbW9udGggdmlldy4gKi9cbiAgX2RhdGVTZWxlY3RlZChldmVudDogQ2FsZW5kYXJVc2VyRXZlbnQ8RCB8IG51bGw+KTogdm9pZCB7XG4gICAgY29uc3QgZGF0ZSA9IGV2ZW50LnZhbHVlO1xuXG4gICAgaWYgKFxuICAgICAgdGhpcy5zZWxlY3RlZCBpbnN0YW5jZW9mIERhdGVSYW5nZSB8fFxuICAgICAgKGRhdGUgJiYgIXRoaXMuX2RhdGVBZGFwdGVyLnNhbWVEYXRlKGRhdGUsIHRoaXMuc2VsZWN0ZWQpKVxuICAgICkge1xuICAgICAgdGhpcy5zZWxlY3RlZENoYW5nZS5lbWl0KGRhdGUpO1xuICAgIH1cblxuICAgIHRoaXMuX3VzZXJTZWxlY3Rpb24uZW1pdChldmVudCk7XG4gIH1cblxuICAvKiogSGFuZGxlcyB5ZWFyIHNlbGVjdGlvbiBpbiB0aGUgbXVsdGl5ZWFyIHZpZXcuICovXG4gIF95ZWFyU2VsZWN0ZWRJbk11bHRpWWVhclZpZXcobm9ybWFsaXplZFllYXI6IEQpIHtcbiAgICB0aGlzLnllYXJTZWxlY3RlZC5lbWl0KG5vcm1hbGl6ZWRZZWFyKTtcbiAgfVxuXG4gIC8qKiBIYW5kbGVzIG1vbnRoIHNlbGVjdGlvbiBpbiB0aGUgeWVhciB2aWV3LiAqL1xuICBfbW9udGhTZWxlY3RlZEluWWVhclZpZXcobm9ybWFsaXplZE1vbnRoOiBEKSB7XG4gICAgdGhpcy5tb250aFNlbGVjdGVkLmVtaXQobm9ybWFsaXplZE1vbnRoKTtcbiAgfVxuXG4gIC8qKiBIYW5kbGVzIHllYXIvbW9udGggc2VsZWN0aW9uIGluIHRoZSBtdWx0aS15ZWFyL3llYXIgdmlld3MuICovXG4gIF9nb1RvRGF0ZUluVmlldyhkYXRlOiBELCB2aWV3OiAnbW9udGgnIHwgJ3llYXInIHwgJ211bHRpLXllYXInKTogdm9pZCB7XG4gICAgdGhpcy5hY3RpdmVEYXRlID0gZGF0ZTtcbiAgICB0aGlzLmN1cnJlbnRWaWV3ID0gdmlldztcbiAgfVxuXG4gIC8qKiBDYWxsZWQgd2hlbiB0aGUgdXNlciBzdGFydHMgZHJhZ2dpbmcgdG8gY2hhbmdlIGEgZGF0ZSByYW5nZS4gKi9cbiAgX2RyYWdTdGFydGVkKGV2ZW50OiBDYWxlbmRhclVzZXJFdmVudDxEPikge1xuICAgIHRoaXMuX2FjdGl2ZURyYWcgPSBldmVudDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiBhIGRyYWcgY29tcGxldGVzLiBJdCBtYXkgZW5kIGluIGNhbmNlbGF0aW9uIG9yIGluIHRoZSBzZWxlY3Rpb25cbiAgICogb2YgYSBuZXcgcmFuZ2UuXG4gICAqL1xuICBfZHJhZ0VuZGVkKGV2ZW50OiBDYWxlbmRhclVzZXJFdmVudDxEYXRlUmFuZ2U8RD4gfCBudWxsPikge1xuICAgIGlmICghdGhpcy5fYWN0aXZlRHJhZykgcmV0dXJuO1xuXG4gICAgaWYgKGV2ZW50LnZhbHVlKSB7XG4gICAgICB0aGlzLl91c2VyRHJhZ0Ryb3AuZW1pdChldmVudCBhcyBDYWxlbmRhclVzZXJFdmVudDxEYXRlUmFuZ2U8RD4+KTtcbiAgICB9XG5cbiAgICB0aGlzLl9hY3RpdmVEcmFnID0gbnVsbDtcbiAgfVxuXG4gIC8qKiBSZXR1cm5zIHRoZSBjb21wb25lbnQgaW5zdGFuY2UgdGhhdCBjb3JyZXNwb25kcyB0byB0aGUgY3VycmVudCBjYWxlbmRhciB2aWV3LiAqL1xuICBwcml2YXRlIF9nZXRDdXJyZW50Vmlld0NvbXBvbmVudCgpOiBNb250aFZpZXc8RD4gfCBZZWFyVmlldzxEPiB8IE11bHRpWWVhclZpZXc8RD4ge1xuICAgIC8vIFRoZSByZXR1cm4gdHlwZSBpcyBleHBsaWNpdGx5IHdyaXR0ZW4gYXMgYSB1bmlvbiB0byBlbnN1cmUgdGhhdCB0aGUgQ2xvc3VyZSBjb21waWxlciBkb2VzXG4gICAgLy8gbm90IG9wdGltaXplIGNhbGxzIHRvIF9pbml0KCkuIFdpdGhvdXQgdGhlIGV4cGxpY2l0IHJldHVybiB0eXBlLCBUeXBlU2NyaXB0IG5hcnJvd3MgaXQgdG9cbiAgICAvLyBvbmx5IHRoZSBmaXJzdCBjb21wb25lbnQgdHlwZS4gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2NvbXBvbmVudHMvaXNzdWVzLzIyOTk2LlxuICAgIHJldHVybiB0aGlzLm1vbnRoVmlldyB8fCB0aGlzLnllYXJWaWV3IHx8IHRoaXMubXVsdGlZZWFyVmlldztcbiAgfVxufVxuIiwiPG5nLXRlbXBsYXRlIFtjZGtQb3J0YWxPdXRsZXRdPVwiX2NhbGVuZGFySGVhZGVyUG9ydGFsXCIgLz5cblxuPGRpdlxuICBjbGFzcz1cInB4LTMgcHQtMS41XCJcbiAgY2RrTW9uaXRvclN1YnRyZWVGb2N1c1xuICB0YWJpbmRleD1cIi0xXCJcbj5cbiAgQHN3aXRjaCAoY3VycmVudFZpZXcpIHtcbiAgICBAY2FzZSAoJ21vbnRoJykge1xuICAgICAgPG1vbnRoLXZpZXdcbiAgICAgICAgW3NlbGVjdGVkXT1cInNlbGVjdGVkXCJcbiAgICAgICAgW2RhdGVGaWx0ZXJdPVwiZGF0ZUZpbHRlclwiXG4gICAgICAgIFttYXhEYXRlXT1cIm1heERhdGVcIlxuICAgICAgICBbbWluRGF0ZV09XCJtaW5EYXRlXCJcbiAgICAgICAgW2RhdGVDbGFzc109XCJkYXRlQ2xhc3NcIlxuICAgICAgICBbY29tcGFyaXNvblN0YXJ0XT1cImNvbXBhcmlzb25TdGFydFwiXG4gICAgICAgIFtjb21wYXJpc29uRW5kXT1cImNvbXBhcmlzb25FbmRcIlxuICAgICAgICBbYWN0aXZlRHJhZ109XCJfYWN0aXZlRHJhZ1wiXG4gICAgICAgIFsoYWN0aXZlRGF0ZSldPVwiYWN0aXZlRGF0ZVwiXG4gICAgICAgIChfdXNlclNlbGVjdGlvbik9XCJfZGF0ZVNlbGVjdGVkKCRldmVudClcIlxuICAgICAgICAoZHJhZ1N0YXJ0ZWQpPVwiX2RyYWdTdGFydGVkKCRldmVudClcIlxuICAgICAgICAoZHJhZ0VuZGVkKT1cIl9kcmFnRW5kZWQoJGV2ZW50KVwiXG4gICAgICAvPlxuICAgIH1cblxuICAgIEBjYXNlICgneWVhcicpIHtcbiAgICAgIDx5ZWFyLXZpZXdcbiAgICAgICAgW3NlbGVjdGVkXT1cInNlbGVjdGVkXCJcbiAgICAgICAgW2RhdGVGaWx0ZXJdPVwiZGF0ZUZpbHRlclwiXG4gICAgICAgIFttYXhEYXRlXT1cIm1heERhdGVcIlxuICAgICAgICBbbWluRGF0ZV09XCJtaW5EYXRlXCJcbiAgICAgICAgW2RhdGVDbGFzc109XCJkYXRlQ2xhc3NcIlxuICAgICAgICBbKGFjdGl2ZURhdGUpXT1cImFjdGl2ZURhdGVcIlxuICAgICAgICAobW9udGhTZWxlY3RlZCk9XCJfbW9udGhTZWxlY3RlZEluWWVhclZpZXcoJGV2ZW50KVwiXG4gICAgICAgIChzZWxlY3RlZENoYW5nZSk9XCJfZ29Ub0RhdGVJblZpZXcoJGV2ZW50LCAnbW9udGgnKVwiXG4gICAgICAvPlxuICAgIH1cblxuICAgIEBjYXNlICgnbXVsdGkteWVhcicpIHtcbiAgICAgIDxtdWx0aS15ZWFyLXZpZXdcbiAgICAgICAgW3NlbGVjdGVkXT1cInNlbGVjdGVkXCJcbiAgICAgICAgW2RhdGVGaWx0ZXJdPVwiZGF0ZUZpbHRlclwiXG4gICAgICAgIFttYXhEYXRlXT1cIm1heERhdGVcIlxuICAgICAgICBbbWluRGF0ZV09XCJtaW5EYXRlXCJcbiAgICAgICAgW2RhdGVDbGFzc109XCJkYXRlQ2xhc3NcIlxuICAgICAgICBbKGFjdGl2ZURhdGUpXT1cImFjdGl2ZURhdGVcIlxuICAgICAgICAoeWVhclNlbGVjdGVkKT1cIl95ZWFyU2VsZWN0ZWRJbk11bHRpWWVhclZpZXcoJGV2ZW50KVwiXG4gICAgICAgIChzZWxlY3RlZENoYW5nZSk9XCJfZ29Ub0RhdGVJblZpZXcoJGV2ZW50LCAneWVhcicpXCJcbiAgICAgIC8+XG4gICAgfVxuICB9XG48L2Rpdj5cbiJdfQ==