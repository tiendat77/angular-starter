/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { CdkMonitorFocus } from '@angular/cdk/a11y';
import { CdkPortalOutlet, ComponentPortal } from '@angular/cdk/portal';
import * as i0 from '@angular/core';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Inject,
  Input,
  Optional,
  Output,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { Subject } from 'rxjs';
import * as i1 from '../adapter';
import { DATE_FORMATS } from '../adapter';
import {
  DateRange,
  SINGLE_DATE_SELECTION_MODEL_PROVIDER,
} from '../date-picker/date-selection-model';
import { createMissingDateImplError } from '../utils/errors';
import { CalendarHeader } from './calendar-header';
import { MonthView } from './month-view';
import { MultiYearView } from './multi-year-view';
import { YearView } from './year-view';
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
    } else {
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
    const minDateChange =
      changes['minDate'] &&
      !this._dateAdapter.sameDate(changes['minDate'].previousValue, changes['minDate'].currentValue)
        ? changes['minDate']
        : undefined;
    const maxDateChange =
      changes['maxDate'] &&
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
    if (
      this.selected instanceof DateRange ||
      (date && !this._dateAdapter.sameDate(date, this.selected))
    ) {
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
    if (!this._activeDrag) return;
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
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: '12.0.0',
    version: '18.2.13',
    ngImport: i0,
    type: Calendar,
    deps: [
      { token: i1.DateAdapter, optional: true },
      { token: DATE_FORMATS, optional: true },
      { token: i0.ChangeDetectorRef },
    ],
    target: i0.ɵɵFactoryTarget.Component,
  });
  static ɵcmp = i0.ɵɵngDeclareComponent({
    minVersion: '17.0.0',
    version: '18.2.13',
    type: Calendar,
    isStandalone: true,
    selector: 'calendar',
    inputs: {
      headerComponent: 'headerComponent',
      startAt: 'startAt',
      startView: 'startView',
      selected: 'selected',
      minDate: 'minDate',
      maxDate: 'maxDate',
      dateFilter: 'dateFilter',
      dateClass: 'dateClass',
      comparisonStart: 'comparisonStart',
      comparisonEnd: 'comparisonEnd',
      startDateAccessibleName: 'startDateAccessibleName',
      endDateAccessibleName: 'endDateAccessibleName',
    },
    outputs: {
      selectedChange: 'selectedChange',
      yearSelected: 'yearSelected',
      monthSelected: 'monthSelected',
      viewChanged: 'viewChanged',
      _userSelection: '_userSelection',
      _userDragDrop: '_userDragDrop',
    },
    host: { classAttribute: 'calendar' },
    providers: [SINGLE_DATE_SELECTION_MODEL_PROVIDER],
    viewQueries: [
      { propertyName: 'monthView', first: true, predicate: MonthView, descendants: true },
      { propertyName: 'yearView', first: true, predicate: YearView, descendants: true },
      { propertyName: 'multiYearView', first: true, predicate: MultiYearView, descendants: true },
    ],
    exportAs: ['calendar'],
    usesOnChanges: true,
    ngImport: i0,
    template:
      '<ng-template [cdkPortalOutlet]="_calendarHeaderPortal" />\n\n<div\n  class="px-3 pt-1.5"\n  cdkMonitorSubtreeFocus\n  tabindex="-1"\n>\n  @switch (currentView) {\n    @case (\'month\') {\n      <month-view\n        [selected]="selected"\n        [dateFilter]="dateFilter"\n        [maxDate]="maxDate"\n        [minDate]="minDate"\n        [dateClass]="dateClass"\n        [comparisonStart]="comparisonStart"\n        [comparisonEnd]="comparisonEnd"\n        [activeDrag]="_activeDrag"\n        [(activeDate)]="activeDate"\n        (_userSelection)="_dateSelected($event)"\n        (dragStarted)="_dragStarted($event)"\n        (dragEnded)="_dragEnded($event)"\n      />\n    }\n\n    @case (\'year\') {\n      <year-view\n        [selected]="selected"\n        [dateFilter]="dateFilter"\n        [maxDate]="maxDate"\n        [minDate]="minDate"\n        [dateClass]="dateClass"\n        [(activeDate)]="activeDate"\n        (monthSelected)="_monthSelectedInYearView($event)"\n        (selectedChange)="_goToDateInView($event, \'month\')"\n      />\n    }\n\n    @case (\'multi-year\') {\n      <multi-year-view\n        [selected]="selected"\n        [dateFilter]="dateFilter"\n        [maxDate]="maxDate"\n        [minDate]="minDate"\n        [dateClass]="dateClass"\n        [(activeDate)]="activeDate"\n        (yearSelected)="_yearSelectedInMultiYearView($event)"\n        (selectedChange)="_goToDateInView($event, \'year\')"\n      />\n    }\n  }\n</div>\n',
    styles: [
      '.calendar .calendar-table{width:100%;border-collapse:collapse}.calendar .calendar-table-header th{font-size:.875rem;font-weight:400;color:var(--text-hint);padding-bottom:.5rem}\n',
    ],
    dependencies: [
      {
        kind: 'directive',
        type: CdkPortalOutlet,
        selector: '[cdkPortalOutlet]',
        inputs: ['cdkPortalOutlet'],
        outputs: ['attached'],
        exportAs: ['cdkPortalOutlet'],
      },
      {
        kind: 'directive',
        type: CdkMonitorFocus,
        selector: '[cdkMonitorElementFocus], [cdkMonitorSubtreeFocus]',
        outputs: ['cdkFocusChange'],
        exportAs: ['cdkMonitorFocus'],
      },
      {
        kind: 'component',
        type: MonthView,
        selector: 'month-view',
        inputs: [
          'activeDate',
          'selected',
          'minDate',
          'maxDate',
          'dateFilter',
          'dateClass',
          'comparisonStart',
          'comparisonEnd',
          'startDateAccessibleName',
          'endDateAccessibleName',
          'activeDrag',
        ],
        outputs: [
          'selectedChange',
          '_userSelection',
          'dragStarted',
          'dragEnded',
          'activeDateChange',
        ],
        exportAs: ['monthView'],
      },
      {
        kind: 'component',
        type: YearView,
        selector: 'year-view',
        inputs: ['activeDate', 'selected', 'minDate', 'maxDate', 'dateFilter', 'dateClass'],
        outputs: ['selectedChange', 'monthSelected', 'activeDateChange'],
        exportAs: ['yearView'],
      },
      {
        kind: 'component',
        type: MultiYearView,
        selector: 'multi-year-view',
        inputs: ['activeDate', 'selected', 'minDate', 'maxDate', 'dateFilter', 'dateClass'],
        outputs: ['selectedChange', 'yearSelected', 'activeDateChange'],
        exportAs: ['multiYearView'],
      },
    ],
    changeDetection: i0.ChangeDetectionStrategy.OnPush,
    encapsulation: i0.ViewEncapsulation.None,
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: '12.0.0',
  version: '18.2.13',
  ngImport: i0,
  type: Calendar,
  decorators: [
    {
      type: Component,
      args: [
        {
          selector: 'calendar',
          host: {
            class: 'calendar',
          },
          exportAs: 'calendar',
          encapsulation: ViewEncapsulation.None,
          changeDetection: ChangeDetectionStrategy.OnPush,
          providers: [SINGLE_DATE_SELECTION_MODEL_PROVIDER],
          standalone: true,
          imports: [CdkPortalOutlet, CdkMonitorFocus, MonthView, YearView, MultiYearView],
          template:
            '<ng-template [cdkPortalOutlet]="_calendarHeaderPortal" />\n\n<div\n  class="px-3 pt-1.5"\n  cdkMonitorSubtreeFocus\n  tabindex="-1"\n>\n  @switch (currentView) {\n    @case (\'month\') {\n      <month-view\n        [selected]="selected"\n        [dateFilter]="dateFilter"\n        [maxDate]="maxDate"\n        [minDate]="minDate"\n        [dateClass]="dateClass"\n        [comparisonStart]="comparisonStart"\n        [comparisonEnd]="comparisonEnd"\n        [activeDrag]="_activeDrag"\n        [(activeDate)]="activeDate"\n        (_userSelection)="_dateSelected($event)"\n        (dragStarted)="_dragStarted($event)"\n        (dragEnded)="_dragEnded($event)"\n      />\n    }\n\n    @case (\'year\') {\n      <year-view\n        [selected]="selected"\n        [dateFilter]="dateFilter"\n        [maxDate]="maxDate"\n        [minDate]="minDate"\n        [dateClass]="dateClass"\n        [(activeDate)]="activeDate"\n        (monthSelected)="_monthSelectedInYearView($event)"\n        (selectedChange)="_goToDateInView($event, \'month\')"\n      />\n    }\n\n    @case (\'multi-year\') {\n      <multi-year-view\n        [selected]="selected"\n        [dateFilter]="dateFilter"\n        [maxDate]="maxDate"\n        [minDate]="minDate"\n        [dateClass]="dateClass"\n        [(activeDate)]="activeDate"\n        (yearSelected)="_yearSelectedInMultiYearView($event)"\n        (selectedChange)="_goToDateInView($event, \'year\')"\n      />\n    }\n  }\n</div>\n',
          styles: [
            '.calendar .calendar-table{width:100%;border-collapse:collapse}.calendar .calendar-table-header th{font-size:.875rem;font-weight:400;color:var(--text-hint);padding-bottom:.5rem}\n',
          ],
        },
      ],
    },
  ],
  ctorParameters: () => [
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
  propDecorators: {
    headerComponent: [
      {
        type: Input,
      },
    ],
    startAt: [
      {
        type: Input,
      },
    ],
    startView: [
      {
        type: Input,
      },
    ],
    selected: [
      {
        type: Input,
      },
    ],
    minDate: [
      {
        type: Input,
      },
    ],
    maxDate: [
      {
        type: Input,
      },
    ],
    dateFilter: [
      {
        type: Input,
      },
    ],
    dateClass: [
      {
        type: Input,
      },
    ],
    comparisonStart: [
      {
        type: Input,
      },
    ],
    comparisonEnd: [
      {
        type: Input,
      },
    ],
    startDateAccessibleName: [
      {
        type: Input,
      },
    ],
    endDateAccessibleName: [
      {
        type: Input,
      },
    ],
    selectedChange: [
      {
        type: Output,
      },
    ],
    yearSelected: [
      {
        type: Output,
      },
    ],
    monthSelected: [
      {
        type: Output,
      },
    ],
    viewChanged: [
      {
        type: Output,
      },
    ],
    _userSelection: [
      {
        type: Output,
      },
    ],
    _userDragDrop: [
      {
        type: Output,
      },
    ],
    monthView: [
      {
        type: ViewChild,
        args: [MonthView],
      },
    ],
    yearView: [
      {
        type: ViewChild,
        args: [YearView],
      },
    ],
    multiYearView: [
      {
        type: ViewChild,
        args: [MultiYearView],
      },
    ],
  },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FsZW5kYXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9saWJzL2RhdGUtcGlja2VyL3NyYy9saWIvY2FsZW5kYXIvY2FsZW5kYXIudHMiLCIuLi8uLi8uLi8uLi8uLi9saWJzL2RhdGUtcGlja2VyL3NyYy9saWIvY2FsZW5kYXIvY2FsZW5kYXIuaHRtbCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUUsZUFBZSxFQUFFLGVBQWUsRUFBeUIsTUFBTSxxQkFBcUIsQ0FBQztBQUM5RixPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFFcEQsT0FBTyxFQUdMLHVCQUF1QixFQUV2QixTQUFTLEVBQ1QsWUFBWSxFQUNaLE1BQU0sRUFDTixLQUFLLEVBR0wsUUFBUSxFQUNSLE1BQU0sRUFHTixTQUFTLEVBQ1QsaUJBQWlCLEdBQ2xCLE1BQU0sZUFBZSxDQUFDO0FBRXZCLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFFL0IsT0FBTyxFQUNMLG9DQUFvQyxFQUNwQyxTQUFTLEdBQ1YsTUFBTSxxQ0FBcUMsQ0FBQztBQUM3QyxPQUFPLEVBQUUsMEJBQTBCLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUM3RCxPQUFPLEVBQWUsWUFBWSxFQUFlLE1BQU0sWUFBWSxDQUFDO0FBRXBFLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxhQUFhLENBQUM7QUFDdkMsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLGNBQWMsQ0FBQztBQUN6QyxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFDbEQsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLG1CQUFtQixDQUFDOzs7QUFRbkQseURBQXlEO0FBZXpELE1BQU0sT0FBTyxRQUFRO0lBMEpHO0lBQ3NCO0lBQ2xDO0lBM0pWLG9FQUFvRTtJQUMzRCxlQUFlLENBQXFCO0lBRTdDLHVFQUF1RTtJ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U0FBUztnQkFHQyxRQUFRO3NCQUE1QixTQUFTO3VCQUFDLFFBQVE7Z0JBR08sYUFBYTtzQkFBdEMsU0FBUzt1QkFBQyxhQUFhIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7IENka1BvcnRhbE91dGxldCwgQ29tcG9uZW50UG9ydGFsLCBDb21wb25lbnRUeXBlLCBQb3J0YWwgfSBmcm9tICdAYW5ndWxhci9jZGsvcG9ydGFsJztcbmltcG9ydCB7IENka01vbml0b3JGb2N1cyB9IGZyb20gJ0Bhbmd1bGFyL2Nkay9hMTF5JztcblxuaW1wb3J0IHtcbiAgQWZ0ZXJDb250ZW50SW5pdCxcbiAgQWZ0ZXJWaWV3Q2hlY2tlZCxcbiAgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksXG4gIENoYW5nZURldGVjdG9yUmVmLFxuICBDb21wb25lbnQsXG4gIEV2ZW50RW1pdHRlcixcbiAgSW5qZWN0LFxuICBJbnB1dCxcbiAgT25DaGFuZ2VzLFxuICBPbkRlc3Ryb3ksXG4gIE9wdGlvbmFsLFxuICBPdXRwdXQsXG4gIFNpbXBsZUNoYW5nZSxcbiAgU2ltcGxlQ2hhbmdlcyxcbiAgVmlld0NoaWxkLFxuICBWaWV3RW5jYXBzdWxhdGlvbixcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7IFN1YmplY3QgfSBmcm9tICdyeGpzJztcblxuaW1wb3J0IHtcbiAgU0lOR0xFX0RBVEVfU0VMRUNUSU9OX01PREVMX1BST1ZJREVSLFxuICBEYXRlUmFuZ2UsXG59IGZyb20gJy4uL2RhdGUtcGlja2VyL2RhdGUtc2VsZWN0aW9uLW1vZGVsJztcbmltcG9ydCB7IGNyZWF0ZU1pc3NpbmdEYXRlSW1wbEVycm9yIH0gZnJvbSAnLi4vdXRpbHMvZXJyb3JzJztcbmltcG9ydCB7IERhdGVBZGFwdGVyLCBEQVRFX0ZPUk1BVFMsIERhdGVGb3JtYXRzIH0gZnJvbSAnLi4vYWRhcHRlcic7XG5pbXBvcnQgeyBDYWxlbmRhclVzZXJFdmVudCwgQ2FsZW5kYXJDZWxsQ2xhc3NGdW5jdGlvbiB9IGZyb20gJy4vY2FsZW5kYXItYm9keSc7XG5pbXBvcnQgeyBZZWFyVmlldyB9IGZyb20gJy4veWVhci12aWV3JztcbmltcG9ydCB7IE1vbnRoVmlldyB9IGZyb20gJy4vbW9udGgtdmlldyc7XG5pbXBvcnQgeyBNdWx0aVllYXJWaWV3IH0gZnJvbSAnLi9tdWx0aS15ZWFyLXZpZXcnO1xuaW1wb3J0IHsgQ2FsZW5kYXJIZWFkZXIgfSBmcm9tICcuL2NhbGVuZGFyLWhlYWRlcic7XG5cbi8qKlxuICogUG9zc2libGUgdmlld3MgZm9yIHRoZSBjYWxlbmRhci5cbiAqIEBkb2NzLXByaXZhdGVcbiAqL1xuZXhwb3J0IHR5cGUgQ2FsZW5kYXJWaWV3ID0gJ21vbnRoJyB8ICd5ZWFyJyB8ICdtdWx0aS15ZWFyJztcblxuLyoqIEEgY2FsZW5kYXIgdGhhdCBpcyB1c2VkIGFzIHBhcnQgb2YgdGhlIGRhdGVwaWNrZXIuICovXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdjYWxlbmRhcicsXG4gIHRlbXBsYXRlVXJsOiAnY2FsZW5kYXIuaHRtbCcsXG4gIHN0eWxlVXJsOiAnY2FsZW5kYXIuc2NzcycsXG4gIGhvc3Q6IHtcbiAgICBjbGFzczogJ2NhbGVuZGFyJyxcbiAgfSxcbiAgZXhwb3J0QXM6ICdjYWxlbmRhcicsXG4gIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLk5vbmUsXG4gIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuT25QdXNoLFxuICBwcm92aWRlcnM6IFtTSU5HTEVfREFURV9TRUxFQ1RJT05fTU9ERUxfUFJPVklERVJdLFxuICBzdGFuZGFsb25lOiB0cnVlLFxuICBpbXBvcnRzOiBbQ2RrUG9ydGFsT3V0bGV0LCBDZGtNb25pdG9yRm9jdXMsIE1vbnRoVmlldywgWWVhclZpZXcsIE11bHRpWWVhclZpZXddLFxufSlcbmV4cG9ydCBjbGFzcyBDYWxlbmRhcjxEPiBpbXBsZW1lbnRzIEFmdGVyQ29udGVudEluaXQsIEFmdGVyVmlld0NoZWNrZWQsIE9uRGVzdHJveSwgT25DaGFuZ2VzIHtcbiAgLyoqIEFuIGlucHV0IGluZGljYXRpbmcgdGhlIHR5cGUgb2YgdGhlIGhlYWRlciBjb21wb25lbnQsIGlmIHNldC4gKi9cbiAgQElucHV0KCkgaGVhZGVyQ29tcG9uZW50OiBDb21wb25lbnRUeXBlPGFueT47XG5cbiAgLyoqIEEgcG9ydGFsIGNvbnRhaW5pbmcgdGhlIGhlYWRlciBjb21wb25lbnQgdHlwZSBmb3IgdGhpcyBjYWxlbmRhci4gKi9cbiAgX2NhbGVuZGFySGVhZGVyUG9ydGFsOiBQb3J0YWw8YW55PjtcblxuICAvKipcbiAgICogVXNlZCBmb3Igc2NoZWR1bGluZyB0aGF0IGZvY3VzIHNob3VsZCBiZSBtb3ZlZCB0byB0aGUgYWN0aXZlIGNlbGwgb24gdGhlIG5leHQgdGljay5cbiAgICogV2UgbmVlZCB0byBzY2hlZHVsZSBpdCwgcmF0aGVyIHRoYW4gZG8gaXQgaW1tZWRpYXRlbHksIGJlY2F1c2Ugd2UgaGF2ZSB0byB3YWl0XG4gICAqIGZvciBBbmd1bGFyIHRvIHJlLWV2YWx1YXRlIHRoZSB2aWV3IGNoaWxkcmVuLlxuICAgKi9cbiAgcHJpdmF0ZSBfbW92ZUZvY3VzT25OZXh0VGljayA9IGZhbHNlO1xuXG4gIC8qKiBBIGRhdGUgcmVwcmVzZW50aW5nIHRoZSBwZXJpb2QgKG1vbnRoIG9yIHllYXIpIHRvIHN0YXJ0IHRoZSBjYWxlbmRhciBpbi4gKi9cbiAgQElucHV0KClcbiAgZ2V0IHN0YXJ0QXQoKTogRCB8IG51bGwge1xuICAgIHJldHVybiB0aGlzLl9zdGFydEF0O1xuICB9XG4gIHNldCBzdGFydEF0KHZhbHVlOiBEIHwgbnVsbCkge1xuICAgIHRoaXMuX3N0YXJ0QXQgPSB0aGlzLl9kYXRlQWRhcHRlci5nZXRWYWxpZERhdGVPck51bGwodGhpcy5fZGF0ZUFkYXB0ZXIuZGVzZXJpYWxpemUodmFsdWUpKTtcbiAgfVxuICBwcml2YXRlIF9zdGFydEF0OiBEIHwgbnVsbDtcblxuICAvKiogV2hldGhlciB0aGUgY2FsZW5kYXIgc2hvdWxkIGJlIHN0YXJ0ZWQgaW4gbW9udGggb3IgeWVhciB2aWV3LiAqL1xuICBASW5wdXQoKSBzdGFydFZpZXc6IENhbGVuZGFyVmlldyA9ICdtb250aCc7XG5cbiAgLyoqIFRoZSBjdXJyZW50bHkgc2VsZWN0ZWQgZGF0ZS4gKi9cbiAgQElucHV0KClcbiAgZ2V0IHNlbGVjdGVkKCk6IERhdGVSYW5nZTxEPiB8IEQgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5fc2VsZWN0ZWQ7XG4gIH1cbiAgc2V0IHNlbGVjdGVkKHZhbHVlOiBEYXRlUmFuZ2U8RD4gfCBEIHwgbnVsbCkge1xuICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIERhdGVSYW5nZSkge1xuICAgICAgdGhpcy5fc2VsZWN0ZWQgPSB2YWx1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fc2VsZWN0ZWQgPSB0aGlzLl9kYXRlQWRhcHRlci5nZXRWYWxpZERhdGVPck51bGwodGhpcy5fZGF0ZUFkYXB0ZXIuZGVzZXJpYWxpemUodmFsdWUpKTtcbiAgICB9XG4gIH1cbiAgcHJpdmF0ZSBfc2VsZWN0ZWQ6IERhdGVSYW5nZTxEPiB8IEQgfCBudWxsO1xuXG4gIC8qKiBUaGUgbWluaW11bSBzZWxlY3RhYmxlIGRhdGUuICovXG4gIEBJbnB1dCgpXG4gIGdldCBtaW5EYXRlKCk6IEQgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5fbWluRGF0ZTtcbiAgfVxuICBzZXQgbWluRGF0ZSh2YWx1ZTogRCB8IG51bGwpIHtcbiAgICB0aGlzLl9taW5EYXRlID0gdGhpcy5fZGF0ZUFkYXB0ZXIuZ2V0VmFsaWREYXRlT3JOdWxsKHRoaXMuX2RhdGVBZGFwdGVyLmRlc2VyaWFsaXplKHZhbHVlKSk7XG4gIH1cbiAgcHJpdmF0ZSBfbWluRGF0ZTogRCB8IG51bGw7XG5cbiAgLyoqIFRoZSBtYXhpbXVtIHNlbGVjdGFibGUgZGF0ZS4gKi9cbiAgQElucHV0KClcbiAgZ2V0IG1heERhdGUoKTogRCB8IG51bGwge1xuICAgIHJldHVybiB0aGlzLl9tYXhEYXRlO1xuICB9XG4gIHNldCBtYXhEYXRlKHZhbHVlOiBEIHwgbnVsbCkge1xuICAgIHRoaXMuX21heERhdGUgPSB0aGlzLl9kYXRlQWRhcHRlci5nZXRWYWxpZERhdGVPck51bGwodGhpcy5fZGF0ZUFkYXB0ZXIuZGVzZXJpYWxpemUodmFsdWUpKTtcbiAgfVxuICBwcml2YXRlIF9tYXhEYXRlOiBEIHwgbnVsbDtcblxuICAvKiogRnVuY3Rpb24gdXNlZCB0byBmaWx0ZXIgd2hpY2ggZGF0ZXMgYXJlIHNlbGVjdGFibGUuICovXG4gIEBJbnB1dCgpIGRhdGVGaWx0ZXI6IChkYXRlOiBEKSA9PiBib29sZWFuO1xuXG4gIC8qKiBGdW5jdGlvbiB0aGF0IGNhbiBiZSB1c2VkIHRvIGFkZCBjdXN0b20gQ1NTIGNsYXNzZXMgdG8gZGF0ZXMuICovXG4gIEBJbnB1dCgpIGRhdGVDbGFzczogQ2FsZW5kYXJDZWxsQ2xhc3NGdW5jdGlvbjxEPjtcblxuICAvKiogU3RhcnQgb2YgdGhlIGNvbXBhcmlzb24gcmFuZ2UuICovXG4gIEBJbnB1dCgpIGNvbXBhcmlzb25TdGFydDogRCB8IG51bGw7XG5cbiAgLyoqIEVuZCBvZiB0aGUgY29tcGFyaXNvbiByYW5nZS4gKi9cbiAgQElucHV0KCkgY29tcGFyaXNvbkVuZDogRCB8IG51bGw7XG5cbiAgLyoqIEFSSUEgQWNjZXNzaWJsZSBuYW1lIG9mIHRoZSBgPGlucHV0IHN0YXJ0RGF0ZS8+YCAqL1xuICBASW5wdXQoKSBzdGFydERhdGVBY2Nlc3NpYmxlTmFtZTogc3RyaW5nIHwgbnVsbDtcblxuICAvKiogQVJJQSBBY2Nlc3NpYmxlIG5hbWUgb2YgdGhlIGA8aW5wdXQgZW5kRGF0ZS8+YCAqL1xuICBASW5wdXQoKSBlbmREYXRlQWNjZXNzaWJsZU5hbWU6IHN0cmluZyB8IG51bGw7XG5cbiAgLyoqIEVtaXRzIHdoZW4gdGhlIGN1cnJlbnRseSBzZWxlY3RlZCBkYXRlIGNoYW5nZXMuICovXG4gIEBPdXRwdXQoKSByZWFkb25seSBzZWxlY3RlZENoYW5nZTogRXZlbnRFbWl0dGVyPEQgfCBudWxsPiA9IG5ldyBFdmVudEVtaXR0ZXI8RCB8IG51bGw+KCk7XG5cbiAgLyoqXG4gICAqIEVtaXRzIHRoZSB5ZWFyIGNob3NlbiBpbiBtdWx0aXllYXIgdmlldy5cbiAgICogVGhpcyBkb2Vzbid0IGltcGx5IGEgY2hhbmdlIG9uIHRoZSBzZWxlY3RlZCBkYXRlLlxuICAgKi9cbiAgQE91dHB1dCgpIHJlYWRvbmx5IHllYXJTZWxlY3RlZDogRXZlbnRFbWl0dGVyPEQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxEPigpO1xuXG4gIC8qKlxuICAgKiBFbWl0cyB0aGUgbW9udGggY2hvc2VuIGluIHllYXIgdmlldy5cbiAgICogVGhpcyBkb2Vzbid0IGltcGx5IGEgY2hhbmdlIG9uIHRoZSBzZWxlY3RlZCBkYXRlLlxuICAgKi9cbiAgQE91dHB1dCgpIHJlYWRvbmx5IG1vbnRoU2VsZWN0ZWQ6IEV2ZW50RW1pdHRlcjxEPiA9IG5ldyBFdmVudEVtaXR0ZXI8RD4oKTtcblxuICAvKipcbiAgICogRW1pdHMgd2hlbiB0aGUgY3VycmVudCB2aWV3IGNoYW5nZXMuXG4gICAqL1xuICBAT3V0cHV0KCkgcmVhZG9ubHkgdmlld0NoYW5nZWQ6IEV2ZW50RW1pdHRlcjxDYWxlbmRhclZpZXc+ID0gbmV3IEV2ZW50RW1pdHRlcjxDYWxlbmRhclZpZXc+KHRydWUpO1xuXG4gIC8qKiBFbWl0cyB3aGVuIGFueSBkYXRlIGlzIHNlbGVjdGVkLiAqL1xuICBAT3V0cHV0KCkgcmVhZG9ubHkgX3VzZXJTZWxlY3Rpb246IEV2ZW50RW1pdHRlcjxDYWxlbmRhclVzZXJFdmVudDxEIHwgbnVsbD4+ID0gbmV3IEV2ZW50RW1pdHRlcjxcbiAgICBDYWxlbmRhclVzZXJFdmVudDxEIHwgbnVsbD5cbiAgPigpO1xuXG4gIC8qKiBFbWl0cyBhIG5ldyBkYXRlIHJhbmdlIHZhbHVlIHdoZW4gdGhlIHVzZXIgY29tcGxldGVzIGEgZHJhZyBkcm9wIG9wZXJhdGlvbi4gKi9cbiAgQE91dHB1dCgpIHJlYWRvbmx5IF91c2VyRHJhZ0Ryb3AgPSBuZXcgRXZlbnRFbWl0dGVyPENhbGVuZGFyVXNlckV2ZW50PERhdGVSYW5nZTxEPj4+KCk7XG5cbiAgLyoqIFJlZmVyZW5jZSB0byB0aGUgY3VycmVudCBtb250aCB2aWV3IGNvbXBvbmVudC4gKi9cbiAgQFZpZXdDaGlsZChNb250aFZpZXcpIG1vbnRoVmlldzogTW9udGhWaWV3PEQ+O1xuXG4gIC8qKiBSZWZlcmVuY2UgdG8gdGhlIGN1cnJlbnQgeWVhciB2aWV3IGNvbXBvbmVudC4gKi9cbiAgQFZpZXdDaGlsZChZZWFyVmlldykgeWVhclZpZXc6IFllYXJWaWV3PEQ+O1xuXG4gIC8qKiBSZWZlcmVuY2UgdG8gdGhlIGN1cnJlbnQgbXVsdGkteWVhciB2aWV3IGNvbXBvbmVudC4gKi9cbiAgQFZpZXdDaGlsZChNdWx0aVllYXJWaWV3KSBtdWx0aVllYXJWaWV3OiBNdWx0aVllYXJWaWV3PEQ+O1xuXG4gIC8qKlxuICAgKiBUaGUgY3VycmVudCBhY3RpdmUgZGF0ZS4gVGhpcyBkZXRlcm1pbmVzIHdoaWNoIHRpbWUgcGVyaW9kIGlzIHNob3duIGFuZCB3aGljaCBkYXRlIGlzXG4gICAqIGhpZ2hsaWdodGVkIHdoZW4gdXNpbmcga2V5Ym9hcmQgbmF2aWdhdGlvbi5cbiAgICovXG4gIGdldCBhY3RpdmVEYXRlKCk6IEQge1xuICAgIHJldHVybiB0aGlzLl9jbGFtcGVkQWN0aXZlRGF0ZTtcbiAgfVxuICBzZXQgYWN0aXZlRGF0ZSh2YWx1ZTogRCkge1xuICAgIHRoaXMuX2NsYW1wZWRBY3RpdmVEYXRlID0gdGhpcy5fZGF0ZUFkYXB0ZXIuY2xhbXBEYXRlKHZhbHVlLCB0aGlzLm1pbkRhdGUsIHRoaXMubWF4RGF0ZSk7XG4gICAgdGhpcy5zdGF0ZUNoYW5nZXMubmV4dCgpO1xuICAgIHRoaXMuX2NoYW5nZURldGVjdG9yUmVmLm1hcmtGb3JDaGVjaygpO1xuICB9XG4gIHByaXZhdGUgX2NsYW1wZWRBY3RpdmVEYXRlOiBEO1xuXG4gIC8qKiBXaGV0aGVyIHRoZSBjYWxlbmRhciBpcyBpbiBtb250aCB2aWV3LiAqL1xuICBnZXQgY3VycmVudFZpZXcoKTogQ2FsZW5kYXJWaWV3IHtcbiAgICByZXR1cm4gdGhpcy5fY3VycmVudFZpZXc7XG4gIH1cbiAgc2V0IGN1cnJlbnRWaWV3KHZhbHVlOiBDYWxlbmRhclZpZXcpIHtcbiAgICBjb25zdCB2aWV3Q2hhbmdlZFJlc3VsdCA9IHRoaXMuX2N1cnJlbnRWaWV3ICE9PSB2YWx1ZSA/IHZhbHVlIDogbnVsbDtcbiAgICB0aGlzLl9jdXJyZW50VmlldyA9IHZhbHVlO1xuICAgIHRoaXMuX21vdmVGb2N1c09uTmV4dFRpY2sgPSB0cnVlO1xuICAgIHRoaXMuX2NoYW5nZURldGVjdG9yUmVmLm1hcmtGb3JDaGVjaygpO1xuICAgIGlmICh2aWV3Q2hhbmdlZFJlc3VsdCkge1xuICAgICAgdGhpcy52aWV3Q2hhbmdlZC5lbWl0KHZpZXdDaGFuZ2VkUmVzdWx0KTtcbiAgICB9XG4gIH1cbiAgcHJpdmF0ZSBfY3VycmVudFZpZXc6IENhbGVuZGFyVmlldztcblxuICAvKiogT3JpZ2luIG9mIGFjdGl2ZSBkcmFnLCBvciBudWxsIHdoZW4gZHJhZ2dpbmcgaXMgbm90IGFjdGl2ZS4gKi9cbiAgcHJvdGVjdGVkIF9hY3RpdmVEcmFnOiBDYWxlbmRhclVzZXJFdmVudDxEPiB8IG51bGwgPSBudWxsO1xuXG4gIC8qKlxuICAgKiBFbWl0cyB3aGVuZXZlciB0aGVyZSBpcyBhIHN0YXRlIGNoYW5nZSB0aGF0IHRoZSBoZWFkZXIgbWF5IG5lZWQgdG8gcmVzcG9uZCB0by5cbiAgICovXG4gIHJlYWRvbmx5IHN0YXRlQ2hhbmdlcyA9IG5ldyBTdWJqZWN0PHZvaWQ+KCk7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgQE9wdGlvbmFsKCkgcHJpdmF0ZSBfZGF0ZUFkYXB0ZXI6IERhdGVBZGFwdGVyPEQ+LFxuICAgIEBPcHRpb25hbCgpIEBJbmplY3QoREFURV9GT1JNQVRTKSBwcml2YXRlIF9kYXRlRm9ybWF0czogRGF0ZUZvcm1hdHMsXG4gICAgcHJpdmF0ZSBfY2hhbmdlRGV0ZWN0b3JSZWY6IENoYW5nZURldGVjdG9yUmVmXG4gICkge1xuICAgIGlmICghdGhpcy5fZGF0ZUFkYXB0ZXIpIHtcbiAgICAgIHRocm93IGNyZWF0ZU1pc3NpbmdEYXRlSW1wbEVycm9yKCdEYXRlQWRhcHRlcicpO1xuICAgIH1cblxuICAgIGlmICghdGhpcy5fZGF0ZUZvcm1hdHMpIHtcbiAgICAgIHRocm93IGNyZWF0ZU1pc3NpbmdEYXRlSW1wbEVycm9yKCdEQVRFX0ZPUk1BVFMnKTtcbiAgICB9XG4gIH1cblxuICBuZ0FmdGVyQ29udGVudEluaXQoKSB7XG4gICAgdGhpcy5fY2FsZW5kYXJIZWFkZXJQb3J0YWwgPSBuZXcgQ29tcG9uZW50UG9ydGFsKHRoaXMuaGVhZGVyQ29tcG9uZW50IHx8IENhbGVuZGFySGVhZGVyKTtcbiAgICB0aGlzLmFjdGl2ZURhdGUgPSB0aGlzLnN0YXJ0QXQgfHwgdGhpcy5fZGF0ZUFkYXB0ZXIudG9kYXkoKTtcblxuICAgIC8vIEFzc2lnbiB0byB0aGUgcHJpdmF0ZSBwcm9wZXJ0eSBzaW5jZSB3ZSBkb24ndCB3YW50IHRvIG1vdmUgZm9jdXMgb24gaW5pdC5cbiAgICB0aGlzLl9jdXJyZW50VmlldyA9IHRoaXMuc3RhcnRWaWV3O1xuICB9XG5cbiAgbmdBZnRlclZpZXdDaGVja2VkKCkge1xuICAgIGlmICh0aGlzLl9tb3ZlRm9jdXNPbk5leHRUaWNrKSB7XG4gICAgICB0aGlzLl9tb3ZlRm9jdXNPbk5leHRUaWNrID0gZmFsc2U7XG4gICAgICB0aGlzLmZvY3VzQWN0aXZlQ2VsbCgpO1xuICAgIH1cbiAgfVxuXG4gIG5nT25EZXN0cm95KCkge1xuICAgIHRoaXMuc3RhdGVDaGFuZ2VzLmNvbXBsZXRlKCk7XG4gIH1cblxuICBuZ09uQ2hhbmdlcyhjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKSB7XG4gICAgLy8gSWdub3JlIGRhdGUgY2hhbmdlcyB0aGF0IGFyZSBhdCBhIGRpZmZlcmVudCB0aW1lIG9uIHRoZSBzYW1lIGRheS4gVGhpcyBmaXhlcyBpc3N1ZXMgd2hlcmVcbiAgICAvLyB0aGUgY2FsZW5kYXIgcmUtcmVuZGVycyB3aGVuIHRoZXJlIGlzIG5vIG1lYW5pbmdmdWwgY2hhbmdlIHRvIFttaW5EYXRlXSBvciBbbWF4RGF0ZV1cbiAgICAvLyAoIzI0NDM1KS5cbiAgICBjb25zdCBtaW5EYXRlQ2hhbmdlOiBTaW1wbGVDaGFuZ2UgfCB1bmRlZmluZWQgPVxuICAgICAgY2hhbmdlc1snbWluRGF0ZSddICYmXG4gICAgICAhdGhpcy5fZGF0ZUFkYXB0ZXIuc2FtZURhdGUoY2hhbmdlc1snbWluRGF0ZSddLnByZXZpb3VzVmFsdWUsIGNoYW5nZXNbJ21pbkRhdGUnXS5jdXJyZW50VmFsdWUpXG4gICAgICAgID8gY2hhbmdlc1snbWluRGF0ZSddXG4gICAgICAgIDogdW5kZWZpbmVkO1xuICAgIGNvbnN0IG1heERhdGVDaGFuZ2U6IFNpbXBsZUNoYW5nZSB8IHVuZGVmaW5lZCA9XG4gICAgICBjaGFuZ2VzWydtYXhEYXRlJ10gJiZcbiAgICAgICF0aGlzLl9kYXRlQWRhcHRlci5zYW1lRGF0ZShjaGFuZ2VzWydtYXhEYXRlJ10ucHJldmlvdXNWYWx1ZSwgY2hhbmdlc1snbWF4RGF0ZSddLmN1cnJlbnRWYWx1ZSlcbiAgICAgICAgPyBjaGFuZ2VzWydtYXhEYXRlJ11cbiAgICAgICAgOiB1bmRlZmluZWQ7XG5cbiAgICBjb25zdCBjaGFuZ2UgPSBtaW5EYXRlQ2hhbmdlIHx8IG1heERhdGVDaGFuZ2UgfHwgY2hhbmdlc1snZGF0ZUZpbHRlciddO1xuXG4gICAgaWYgKGNoYW5nZSAmJiAhY2hhbmdlLmZpcnN0Q2hhbmdlKSB7XG4gICAgICBjb25zdCB2aWV3ID0gdGhpcy5fZ2V0Q3VycmVudFZpZXdDb21wb25lbnQoKTtcblxuICAgICAgaWYgKHZpZXcpIHtcbiAgICAgICAgLy8gV2UgbmVlZCB0byBgZGV0ZWN0Q2hhbmdlc2AgbWFudWFsbHkgaGVyZSwgYmVjYXVzZSB0aGUgYG1pbkRhdGVgLCBgbWF4RGF0ZWAgZXRjLiBhcmVcbiAgICAgICAgLy8gcGFzc2VkIGRvd24gdG8gdGhlIHZpZXcgdmlhIGRhdGEgYmluZGluZ3Mgd2hpY2ggd29uJ3QgYmUgdXAtdG8tZGF0ZSB3aGVuIHdlIGNhbGwgYF9pbml0YC5cbiAgICAgICAgdGhpcy5fY2hhbmdlRGV0ZWN0b3JSZWYuZGV0ZWN0Q2hhbmdlcygpO1xuICAgICAgICB2aWV3Ll9pbml0KCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5zdGF0ZUNoYW5nZXMubmV4dCgpO1xuICB9XG5cbiAgLyoqIEZvY3VzZXMgdGhlIGFjdGl2ZSBkYXRlLiAqL1xuICBmb2N1c0FjdGl2ZUNlbGwoKSB7XG4gICAgdGhpcy5fZ2V0Q3VycmVudFZpZXdDb21wb25lbnQoKS5fZm9jdXNBY3RpdmVDZWxsKGZhbHNlKTtcbiAgfVxuXG4gIC8qKiBVcGRhdGVzIHRvZGF5J3MgZGF0ZSBhZnRlciBhbiB1cGRhdGUgb2YgdGhlIGFjdGl2ZSBkYXRlICovXG4gIHVwZGF0ZVRvZGF5c0RhdGUoKSB7XG4gICAgdGhpcy5fZ2V0Q3VycmVudFZpZXdDb21wb25lbnQoKS5faW5pdCgpO1xuICB9XG5cbiAgLyoqIEhhbmRsZXMgZGF0ZSBzZWxlY3Rpb24gaW4gdGhlIG1vbnRoIHZpZXcuICovXG4gIF9kYXRlU2VsZWN0ZWQoZXZlbnQ6IENhbGVuZGFyVXNlckV2ZW50PEQgfCBudWxsPik6IHZvaWQge1xuICAgIGNvbnN0IGRhdGUgPSBldmVudC52YWx1ZTtcblxuICAgIGlmIChcbiAgICAgIHRoaXMuc2VsZWN0ZWQgaW5zdGFuY2VvZiBEYXRlUmFuZ2UgfHxcbiAgICAgIChkYXRlICYmICF0aGlzLl9kYXRlQWRhcHRlci5zYW1lRGF0ZShkYXRlLCB0aGlzLnNlbGVjdGVkKSlcbiAgICApIHtcbiAgICAgIHRoaXMuc2VsZWN0ZWRDaGFuZ2UuZW1pdChkYXRlKTtcbiAgICB9XG5cbiAgICB0aGlzLl91c2VyU2VsZWN0aW9uLmVtaXQoZXZlbnQpO1xuICB9XG5cbiAgLyoqIEhhbmRsZXMgeWVhciBzZWxlY3Rpb24gaW4gdGhlIG11bHRpeWVhciB2aWV3LiAqL1xuICBfeWVhclNlbGVjdGVkSW5NdWx0aVllYXJWaWV3KG5vcm1hbGl6ZWRZZWFyOiBEKSB7XG4gICAgdGhpcy55ZWFyU2VsZWN0ZWQuZW1pdChub3JtYWxpemVkWWVhcik7XG4gIH1cblxuICAvKiogSGFuZGxlcyBtb250aCBzZWxlY3Rpb24gaW4gdGhlIHllYXIgdmlldy4gKi9cbiAgX21vbnRoU2VsZWN0ZWRJblllYXJWaWV3KG5vcm1hbGl6ZWRNb250aDogRCkge1xuICAgIHRoaXMubW9udGhTZWxlY3RlZC5lbWl0KG5vcm1hbGl6ZWRNb250aCk7XG4gIH1cblxuICAvKiogSGFuZGxlcyB5ZWFyL21vbnRoIHNlbGVjdGlvbiBpbiB0aGUgbXVsdGkteWVhci95ZWFyIHZpZXdzLiAqL1xuICBfZ29Ub0RhdGVJblZpZXcoZGF0ZTogRCwgdmlldzogJ21vbnRoJyB8ICd5ZWFyJyB8ICdtdWx0aS15ZWFyJyk6IHZvaWQge1xuICAgIHRoaXMuYWN0aXZlRGF0ZSA9IGRhdGU7XG4gICAgdGhpcy5jdXJyZW50VmlldyA9IHZpZXc7XG4gIH1cblxuICAvKiogQ2FsbGVkIHdoZW4gdGhlIHVzZXIgc3RhcnRzIGRyYWdnaW5nIHRvIGNoYW5nZSBhIGRhdGUgcmFuZ2UuICovXG4gIF9kcmFnU3RhcnRlZChldmVudDogQ2FsZW5kYXJVc2VyRXZlbnQ8RD4pIHtcbiAgICB0aGlzLl9hY3RpdmVEcmFnID0gZXZlbnQ7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gYSBkcmFnIGNvbXBsZXRlcy4gSXQgbWF5IGVuZCBpbiBjYW5jZWxhdGlvbiBvciBpbiB0aGUgc2VsZWN0aW9uXG4gICAqIG9mIGEgbmV3IHJhbmdlLlxuICAgKi9cbiAgX2RyYWdFbmRlZChldmVudDogQ2FsZW5kYXJVc2VyRXZlbnQ8RGF0ZVJhbmdlPEQ+IHwgbnVsbD4pIHtcbiAgICBpZiAoIXRoaXMuX2FjdGl2ZURyYWcpIHJldHVybjtcblxuICAgIGlmIChldmVudC52YWx1ZSkge1xuICAgICAgdGhpcy5fdXNlckRyYWdEcm9wLmVtaXQoZXZlbnQgYXMgQ2FsZW5kYXJVc2VyRXZlbnQ8RGF0ZVJhbmdlPEQ+Pik7XG4gICAgfVxuXG4gICAgdGhpcy5fYWN0aXZlRHJhZyA9IG51bGw7XG4gIH1cblxuICAvKiogUmV0dXJucyB0aGUgY29tcG9uZW50IGluc3RhbmNlIHRoYXQgY29ycmVzcG9uZHMgdG8gdGhlIGN1cnJlbnQgY2FsZW5kYXIgdmlldy4gKi9cbiAgcHJpdmF0ZSBfZ2V0Q3VycmVudFZpZXdDb21wb25lbnQoKTogTW9udGhWaWV3PEQ+IHwgWWVhclZpZXc8RD4gfCBNdWx0aVllYXJWaWV3PEQ+IHtcbiAgICAvLyBUaGUgcmV0dXJuIHR5cGUgaXMgZXhwbGljaXRseSB3cml0dGVuIGFzIGEgdW5pb24gdG8gZW5zdXJlIHRoYXQgdGhlIENsb3N1cmUgY29tcGlsZXIgZG9lc1xuICAgIC8vIG5vdCBvcHRpbWl6ZSBjYWxscyB0byBfaW5pdCgpLiBXaXRob3V0IHRoZSBleHBsaWNpdCByZXR1cm4gdHlwZSwgVHlwZVNjcmlwdCBuYXJyb3dzIGl0IHRvXG4gICAgLy8gb25seSB0aGUgZmlyc3QgY29tcG9uZW50IHR5cGUuIFNlZSBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9jb21wb25lbnRzL2lzc3Vlcy8yMjk5Ni5cbiAgICByZXR1cm4gdGhpcy5tb250aFZpZXcgfHwgdGhpcy55ZWFyVmlldyB8fCB0aGlzLm11bHRpWWVhclZpZXc7XG4gIH1cbn1cbiIsIjxuZy10ZW1wbGF0ZSBbY2RrUG9ydGFsT3V0bGV0XT1cIl9jYWxlbmRhckhlYWRlclBvcnRhbFwiIC8+XG5cbjxkaXZcbiAgY2xhc3M9XCJweC0zIHB0LTEuNVwiXG4gIGNka01vbml0b3JTdWJ0cmVlRm9jdXNcbiAgdGFiaW5kZXg9XCItMVwiXG4+XG4gIEBzd2l0Y2ggKGN1cnJlbnRWaWV3KSB7XG4gICAgQGNhc2UgKCdtb250aCcpIHtcbiAgICAgIDxtb250aC12aWV3XG4gICAgICAgIFtzZWxlY3RlZF09XCJzZWxlY3RlZFwiXG4gICAgICAgIFtkYXRlRmlsdGVyXT1cImRhdGVGaWx0ZXJcIlxuICAgICAgICBbbWF4RGF0ZV09XCJtYXhEYXRlXCJcbiAgICAgICAgW21pbkRhdGVdPVwibWluRGF0ZVwiXG4gICAgICAgIFtkYXRlQ2xhc3NdPVwiZGF0ZUNsYXNzXCJcbiAgICAgICAgW2NvbXBhcmlzb25TdGFydF09XCJjb21wYXJpc29uU3RhcnRcIlxuICAgICAgICBbY29tcGFyaXNvbkVuZF09XCJjb21wYXJpc29uRW5kXCJcbiAgICAgICAgW2FjdGl2ZURyYWddPVwiX2FjdGl2ZURyYWdcIlxuICAgICAgICBbKGFjdGl2ZURhdGUpXT1cImFjdGl2ZURhdGVcIlxuICAgICAgICAoX3VzZXJTZWxlY3Rpb24pPVwiX2RhdGVTZWxlY3RlZCgkZXZlbnQpXCJcbiAgICAgICAgKGRyYWdTdGFydGVkKT1cIl9kcmFnU3RhcnRlZCgkZXZlbnQpXCJcbiAgICAgICAgKGRyYWdFbmRlZCk9XCJfZHJhZ0VuZGVkKCRldmVudClcIlxuICAgICAgLz5cbiAgICB9XG5cbiAgICBAY2FzZSAoJ3llYXInKSB7XG4gICAgICA8eWVhci12aWV3XG4gICAgICAgIFtzZWxlY3RlZF09XCJzZWxlY3RlZFwiXG4gICAgICAgIFtkYXRlRmlsdGVyXT1cImRhdGVGaWx0ZXJcIlxuICAgICAgICBbbWF4RGF0ZV09XCJtYXhEYXRlXCJcbiAgICAgICAgW21pbkRhdGVdPVwibWluRGF0ZVwiXG4gICAgICAgIFtkYXRlQ2xhc3NdPVwiZGF0ZUNsYXNzXCJcbiAgICAgICAgWyhhY3RpdmVEYXRlKV09XCJhY3RpdmVEYXRlXCJcbiAgICAgICAgKG1vbnRoU2VsZWN0ZWQpPVwiX21vbnRoU2VsZWN0ZWRJblllYXJWaWV3KCRldmVudClcIlxuICAgICAgICAoc2VsZWN0ZWRDaGFuZ2UpPVwiX2dvVG9EYXRlSW5WaWV3KCRldmVudCwgJ21vbnRoJylcIlxuICAgICAgLz5cbiAgICB9XG5cbiAgICBAY2FzZSAoJ211bHRpLXllYXInKSB7XG4gICAgICA8bXVsdGkteWVhci12aWV3XG4gICAgICAgIFtzZWxlY3RlZF09XCJzZWxlY3RlZFwiXG4gICAgICAgIFtkYXRlRmlsdGVyXT1cImRhdGVGaWx0ZXJcIlxuICAgICAgICBbbWF4RGF0ZV09XCJtYXhEYXRlXCJcbiAgICAgICAgW21pbkRhdGVdPVwibWluRGF0ZVwiXG4gICAgICAgIFtkYXRlQ2xhc3NdPVwiZGF0ZUNsYXNzXCJcbiAgICAgICAgWyhhY3RpdmVEYXRlKV09XCJhY3RpdmVEYXRlXCJcbiAgICAgICAgKHllYXJTZWxlY3RlZCk9XCJfeWVhclNlbGVjdGVkSW5NdWx0aVllYXJWaWV3KCRldmVudClcIlxuICAgICAgICAoc2VsZWN0ZWRDaGFuZ2UpPVwiX2dvVG9EYXRlSW5WaWV3KCRldmVudCwgJ3llYXInKVwiXG4gICAgICAvPlxuICAgIH1cbiAgfVxuPC9kaXY+XG4iXX0=
