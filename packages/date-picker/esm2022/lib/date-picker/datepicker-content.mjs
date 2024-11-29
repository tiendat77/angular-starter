/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { CdkPortalOutlet } from '@angular/cdk/portal';
import { NgClass } from '@angular/common';
import * as i0 from '@angular/core';
import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  Optional,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import * as i2 from '../adapter/date-adapter';
import { DATE_FORMATS } from '../adapter/date-formats';
import { Calendar } from '../calendar/calendar';
import { animations } from '../utils/animations';
import * as i1 from './date-selection-model';
import { DateRange } from './date-selection-model';
/**
 * Component used as the content for the datepicker overlay. We use this instead of using
 * Calendar directly as the content so we can control the initial focus. This also gives us a
 * place to put additional features of the overlay that are not part of the calendar itself in the
 * future. (e.g. confirmation buttons).
 * @docs-private
 */
export class DatepickerContent {
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
    this._subscriptions.add(
      this.datepicker.stateChanges.subscribe(() => {
        this._changeDetectorRef.markForCheck();
      })
    );
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
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: '12.0.0',
    version: '18.2.13',
    ngImport: i0,
    type: DatepickerContent,
    deps: [
      { token: i0.ElementRef },
      { token: i0.ChangeDetectorRef },
      { token: i1.DateSelectionModel },
      { token: i2.DateAdapter },
      { token: DATE_FORMATS, optional: true },
    ],
    target: i0.ɵɵFactoryTarget.Component,
  });
  static ɵcmp = i0.ɵɵngDeclareComponent({
    minVersion: '14.0.0',
    version: '18.2.13',
    type: DatepickerContent,
    isStandalone: true,
    selector: 'datepicker-content',
    host: {
      listeners: {
        '@transformPanel.start': '_handleAnimationEvent($event)',
        '@transformPanel.done': '_handleAnimationEvent($event)',
      },
      properties: {
        '@transformPanel': '_animationState',
        'class.datepicker-content-touch': 'datepicker.touchUi',
      },
      classAttribute: 'datepicker-content',
    },
    viewQueries: [
      { propertyName: '_calendar', first: true, predicate: Calendar, descendants: true },
    ],
    exportAs: ['datepickerContent'],
    ngImport: i0,
    template:
      '<div\n  cdkTrapFocus\n  role="dialog"\n  class="flex flex-col flex-auto overflow-hidden rounded-lg"\n  [attr.aria-modal]="true"\n  [attr.aria-labelledby]="_dialogLabelId ?? undefined"\n>\n  <div class="flex flex-col px-3 py-2 bg-primary">\n    <div class="flex flex-col">\n      <span class="text-xs font-normal tracking-wider uppercase text-primary-content">\n        Selected date\n      </span>\n    </div>\n    <div class="flex flex-col mt-4">\n      <span class="text-xl font-normal text-primary-content">\n        {{ _getSelectedDisplay() }}\n      </span>\n    </div>\n  </div>\n\n  <calendar\n    class="flex-auto"\n    [id]="datepicker.id"\n    [ngClass]="datepicker.panelClass"\n    [startAt]="datepicker.startAt"\n    [startView]="datepicker.startView"\n    [minDate]="datepicker._getMinDate()"\n    [maxDate]="datepicker._getMaxDate()"\n    [dateFilter]="datepicker._getDateFilter()"\n    [headerComponent]="datepicker.calendarHeaderComponent"\n    [selected]="_getSelected()"\n    [dateClass]="datepicker.dateClass"\n    [comparisonStart]="comparisonStart"\n    [comparisonEnd]="comparisonEnd"\n    [@fadeInCalendar]="\'enter\'"\n    [startDateAccessibleName]="startDateAccessibleName"\n    [endDateAccessibleName]="endDateAccessibleName"\n    (yearSelected)="datepicker._selectYear($event)"\n    (monthSelected)="datepicker._selectMonth($event)"\n    (viewChanged)="datepicker._viewChanged($event)"\n    (_userSelection)="_handleUserSelection($event)"\n    (_userDragDrop)="_handleUserDragDrop($event)"\n  />\n\n  <div class="flex items-center justify-end w-full gap-3 px-3 py-3">\n    <button\n      type="button"\n      class="btn"\n      [class.cdk-visually-hidden]="!_closeButtonFocused"\n      (focus)="_closeButtonFocused = true"\n      (blur)="_closeButtonFocused = false"\n      (click)="datepicker.close()"\n    >\n      Close\n    </button>\n\n    <button\n      type="button"\n      class="btn btn-primary"\n      (click)="datepicker.apply()"\n    >\n      Apply\n    </button>\n  </div>\n</div>\n',
    styles: [
      '.datepicker-content{position:relative;display:flex;flex-direction:column;border-radius:.5rem;background-color:oklch(var(--b1));box-shadow:0 0 #0000,0 0 #0000,rgba(var(--shadow-card-rgb),.2) 0 8px 24px}.datepicker-content .calendar{width:22rem;height:24rem}.datepicker-content-container{display:flex;flex-direction:column;justify-content:space-between}.datepicker-content-touch{display:block;max-height:80vh;position:relative;overflow:visible}.datepicker-content-touch .datepicker-content-container{min-height:312px;max-height:788px;min-width:250px;max-width:750px}.datepicker-content-touch .calendar{width:100%;height:auto}@media all and (orientation: landscape){.datepicker-content-touch .datepicker-content-container{width:64vh;height:80vh}}@media all and (orientation: portrait){.datepicker-content-touch .datepicker-content-container{width:80vw;height:100vw}}\n',
    ],
    dependencies: [
      {
        kind: 'component',
        type: Calendar,
        selector: 'calendar',
        inputs: [
          'headerComponent',
          'startAt',
          'startView',
          'selected',
          'minDate',
          'maxDate',
          'dateFilter',
          'dateClass',
          'comparisonStart',
          'comparisonEnd',
          'startDateAccessibleName',
          'endDateAccessibleName',
        ],
        outputs: [
          'selectedChange',
          'yearSelected',
          'monthSelected',
          'viewChanged',
          '_userSelection',
          '_userDragDrop',
        ],
        exportAs: ['calendar'],
      },
      { kind: 'directive', type: NgClass, selector: '[ngClass]', inputs: ['class', 'ngClass'] },
    ],
    animations: [animations.transformPanel, animations.fadeInCalendar],
    changeDetection: i0.ChangeDetectionStrategy.OnPush,
    encapsulation: i0.ViewEncapsulation.None,
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: '12.0.0',
  version: '18.2.13',
  ngImport: i0,
  type: DatepickerContent,
  decorators: [
    {
      type: Component,
      args: [
        {
          selector: 'datepicker-content',
          host: {
            class: 'datepicker-content',
            '[@transformPanel]': '_animationState',
            '(@transformPanel.start)': '_handleAnimationEvent($event)',
            '(@transformPanel.done)': '_handleAnimationEvent($event)',
            '[class.datepicker-content-touch]': 'datepicker.touchUi',
          },
          animations: [animations.transformPanel, animations.fadeInCalendar],
          exportAs: 'datepickerContent',
          encapsulation: ViewEncapsulation.None,
          changeDetection: ChangeDetectionStrategy.OnPush,
          standalone: true,
          imports: [Calendar, NgClass, CdkPortalOutlet],
          template:
            '<div\n  cdkTrapFocus\n  role="dialog"\n  class="flex flex-col flex-auto overflow-hidden rounded-lg"\n  [attr.aria-modal]="true"\n  [attr.aria-labelledby]="_dialogLabelId ?? undefined"\n>\n  <div class="flex flex-col px-3 py-2 bg-primary">\n    <div class="flex flex-col">\n      <span class="text-xs font-normal tracking-wider uppercase text-primary-content">\n        Selected date\n      </span>\n    </div>\n    <div class="flex flex-col mt-4">\n      <span class="text-xl font-normal text-primary-content">\n        {{ _getSelectedDisplay() }}\n      </span>\n    </div>\n  </div>\n\n  <calendar\n    class="flex-auto"\n    [id]="datepicker.id"\n    [ngClass]="datepicker.panelClass"\n    [startAt]="datepicker.startAt"\n    [startView]="datepicker.startView"\n    [minDate]="datepicker._getMinDate()"\n    [maxDate]="datepicker._getMaxDate()"\n    [dateFilter]="datepicker._getDateFilter()"\n    [headerComponent]="datepicker.calendarHeaderComponent"\n    [selected]="_getSelected()"\n    [dateClass]="datepicker.dateClass"\n    [comparisonStart]="comparisonStart"\n    [comparisonEnd]="comparisonEnd"\n    [@fadeInCalendar]="\'enter\'"\n    [startDateAccessibleName]="startDateAccessibleName"\n    [endDateAccessibleName]="endDateAccessibleName"\n    (yearSelected)="datepicker._selectYear($event)"\n    (monthSelected)="datepicker._selectMonth($event)"\n    (viewChanged)="datepicker._viewChanged($event)"\n    (_userSelection)="_handleUserSelection($event)"\n    (_userDragDrop)="_handleUserDragDrop($event)"\n  />\n\n  <div class="flex items-center justify-end w-full gap-3 px-3 py-3">\n    <button\n      type="button"\n      class="btn"\n      [class.cdk-visually-hidden]="!_closeButtonFocused"\n      (focus)="_closeButtonFocused = true"\n      (blur)="_closeButtonFocused = false"\n      (click)="datepicker.close()"\n    >\n      Close\n    </button>\n\n    <button\n      type="button"\n      class="btn btn-primary"\n      (click)="datepicker.apply()"\n    >\n      Apply\n    </button>\n  </div>\n</div>\n',
          styles: [
            '.datepicker-content{position:relative;display:flex;flex-direction:column;border-radius:.5rem;background-color:oklch(var(--b1));box-shadow:0 0 #0000,0 0 #0000,rgba(var(--shadow-card-rgb),.2) 0 8px 24px}.datepicker-content .calendar{width:22rem;height:24rem}.datepicker-content-container{display:flex;flex-direction:column;justify-content:space-between}.datepicker-content-touch{display:block;max-height:80vh;position:relative;overflow:visible}.datepicker-content-touch .datepicker-content-container{min-height:312px;max-height:788px;min-width:250px;max-width:750px}.datepicker-content-touch .calendar{width:100%;height:auto}@media all and (orientation: landscape){.datepicker-content-touch .datepicker-content-container{width:64vh;height:80vh}}@media all and (orientation: portrait){.datepicker-content-touch .datepicker-content-container{width:80vw;height:100vw}}\n',
          ],
        },
      ],
    },
  ],
  ctorParameters: () => [
    { type: i0.ElementRef },
    { type: i0.ChangeDetectorRef },
    { type: i1.DateSelectionModel },
    { type: i2.DateAdapter },
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
  ],
  propDecorators: {
    _calendar: [
      {
        type: ViewChild,
        args: [Calendar],
      },
    ],
  },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZXBpY2tlci1jb250ZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vbGlicy9kYXRlLXBpY2tlci9zcmMvbGliL2RhdGUtcGlja2VyL2RhdGVwaWNrZXItY29udGVudC50cyIsIi4uLy4uLy4uLy4uLy4uL2xpYnMvZGF0ZS1waWNrZXIvc3JjL2xpYi9kYXRlLXBpY2tlci9kYXRlcGlja2VyLWNvbnRlbnQuaHRtbCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFFdEQsT0FBTyxFQUVMLHVCQUF1QixFQUN2QixTQUFTLEVBR1QsU0FBUyxFQUNULGlCQUFpQixFQUdqQixNQUFNLEVBQ04sUUFBUSxHQUNULE1BQU0sZUFBZSxDQUFDO0FBRXZCLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUcxQyxPQUFPLEVBQUUsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUU3QyxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFFakQsT0FBTyxFQUFFLFlBQVksRUFBZSxNQUFNLHlCQUF5QixDQUFDO0FBQ3BFLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUloRCxPQUFPLEVBR0wsU0FBUyxHQUNWLE1BQU0sd0JBQXdCLENBQUM7Ozs7QUFFaEM7Ozs7OztHQU1HO0FBbUJILE1BQU0sT0FBTyxpQkFBaUI7SUEyQ2hCO0lBQ0Y7SUFDQTtJQUNBO0lBQ2tDO0lBNUNwQyxjQUFjLEdBQUcsSUFBSSxZQUFZLEVBQUUsQ0FBQztJQUNwQyxNQUFNLENBQTJCO0lBRXpDLG9EQUFvRDtJQUMvQixTQUFTLENBQWM7SUFFNUMsNERBQTREO0lBQzVELFVBQVUsQ0FBNEI7SUFFdEMscUNBQXFDO0lBQ3JDLGVBQWUsQ0FBVztJQUUxQixtQ0FBbUM7SUFDbkMs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LEVBQUUsK0JBQStCO3dCQUMxRCx3QkFBd0IsRUFBRSwrQkFBK0I7d0JBQ3pELGtDQUFrQyxFQUFFLG9CQUFvQjtxQkFDekQsY0FDVyxDQUFDLFVBQVUsQ0FBQyxjQUFjLEVBQUUsVUFBVSxDQUFDLGNBQWMsQ0FBQyxZQUN4RCxtQkFBbUIsaUJBQ2QsaUJBQWlCLENBQUMsSUFBSSxtQkFDcEIsdUJBQXVCLENBQUMsTUFBTSxjQUNuQyxJQUFJLFdBQ1AsQ0FBQyxRQUFRLEVBQUUsT0FBTyxFQUFFLGVBQWUsQ0FBQzs7MEJBaUQxQyxRQUFROzswQkFBSSxNQUFNOzJCQUFDLFlBQVk7eUNBeENiLFNBQVM7c0JBQTdCLFNBQVM7dUJBQUMsUUFBUSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgeyBDZGtQb3J0YWxPdXRsZXQgfSBmcm9tICdAYW5ndWxhci9jZGsvcG9ydGFsJztcblxuaW1wb3J0IHtcbiAgQWZ0ZXJWaWV3SW5pdCxcbiAgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksXG4gIENvbXBvbmVudCxcbiAgRWxlbWVudFJlZixcbiAgT25EZXN0cm95LFxuICBWaWV3Q2hpbGQsXG4gIFZpZXdFbmNhcHN1bGF0aW9uLFxuICBDaGFuZ2VEZXRlY3RvclJlZixcbiAgT25Jbml0LFxuICBJbmplY3QsXG4gIE9wdGlvbmFsLFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgTmdDbGFzcyB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQgeyBBbmltYXRpb25FdmVudCB9IGZyb20gJ0Bhbmd1bGFyL2FuaW1hdGlvbnMnO1xuXG5pbXBvcnQgeyBTdWJqZWN0LCBTdWJzY3JpcHRpb24gfSBmcm9tICdyeGpzJztcblxuaW1wb3J0IHsgYW5pbWF0aW9ucyB9IGZyb20gJy4uL3V0aWxzL2FuaW1hdGlvbnMnO1xuaW1wb3J0IHsgRGF0ZUFkYXB0ZXIgfSBmcm9tICcuLi9hZGFwdGVyL2RhdGUtYWRhcHRlcic7XG5pbXBvcnQgeyBEQVRFX0ZPUk1BVFMsIERhdGVGb3JtYXRzIH0gZnJvbSAnLi4vYWRhcHRlci9kYXRlLWZvcm1hdHMnO1xuaW1wb3J0IHsgQ2FsZW5kYXIgfSBmcm9tICcuLi9jYWxlbmRhci9jYWxlbmRhcic7XG5pbXBvcnQgeyBDYWxlbmRhclVzZXJFdmVudCB9IGZyb20gJy4uL2NhbGVuZGFyL2NhbGVuZGFyLWJvZHknO1xuXG5pbXBvcnQgeyBEYXRlcGlja2VyQmFzZSB9IGZyb20gJy4vZGF0ZXBpY2tlci1iYXNlJztcbmltcG9ydCB7XG4gIEV4dHJhY3REYXRlVHlwZUZyb21TZWxlY3Rpb24sXG4gIERhdGVTZWxlY3Rpb25Nb2RlbCxcbiAgRGF0ZVJhbmdlLFxufSBmcm9tICcuL2RhdGUtc2VsZWN0aW9uLW1vZGVsJztcblxuLyoqXG4gKiBDb21wb25lbnQgdXNlZCBhcyB0aGUgY29udGVudCBmb3IgdGhlIGRhdGVwaWNrZXIgb3ZlcmxheS4gV2UgdXNlIHRoaXMgaW5zdGVhZCBvZiB1c2luZ1xuICogQ2FsZW5kYXIgZGlyZWN0bHkgYXMgdGhlIGNvbnRlbnQgc28gd2UgY2FuIGNvbnRyb2wgdGhlIGluaXRpYWwgZm9jdXMuIFRoaXMgYWxzbyBnaXZlcyB1cyBhXG4gKiBwbGFjZSB0byBwdXQgYWRkaXRpb25hbCBmZWF0dXJlcyBvZiB0aGUgb3ZlcmxheSB0aGF0IGFyZSBub3QgcGFydCBvZiB0aGUgY2FsZW5kYXIgaXRzZWxmIGluIHRoZVxuICogZnV0dXJlLiAoZS5nLiBjb25maXJtYXRpb24gYnV0dG9ucykuXG4gKiBAZG9jcy1wcml2YXRlXG4gKi9cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ2RhdGVwaWNrZXItY29udGVudCcsXG4gIHRlbXBsYXRlVXJsOiAnZGF0ZXBpY2tlci1jb250ZW50Lmh0bWwnLFxuICBzdHlsZVVybDogJ2RhdGVwaWNrZXItY29udGVudC5zY3NzJyxcbiAgaG9zdDoge1xuICAgIGNsYXNzOiAnZGF0ZXBpY2tlci1jb250ZW50JyxcbiAgICAnW0B0cmFuc2Zvcm1QYW5lbF0nOiAnX2FuaW1hdGlvblN0YXRlJyxcbiAgICAnKEB0cmFuc2Zvcm1QYW5lbC5zdGFydCknOiAnX2hhbmRsZUFuaW1hdGlvbkV2ZW50KCRldmVudCknLFxuICAgICcoQHRyYW5zZm9ybVBhbmVsLmRvbmUpJzogJ19oYW5kbGVBbmltYXRpb25FdmVudCgkZXZlbnQpJyxcbiAgICAnW2NsYXNzLmRhdGVwaWNrZXItY29udGVudC10b3VjaF0nOiAnZGF0ZXBpY2tlci50b3VjaFVpJyxcbiAgfSxcbiAgYW5pbWF0aW9uczogW2FuaW1hdGlvbnMudHJhbnNmb3JtUGFuZWwsIGFuaW1hdGlvbnMuZmFkZUluQ2FsZW5kYXJdLFxuICBleHBvcnRBczogJ2RhdGVwaWNrZXJDb250ZW50JyxcbiAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24uTm9uZSxcbiAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5PblB1c2gsXG4gIHN0YW5kYWxvbmU6IHRydWUsXG4gIGltcG9ydHM6IFtDYWxlbmRhciwgTmdDbGFzcywgQ2RrUG9ydGFsT3V0bGV0XSxcbn0pXG5leHBvcnQgY2xhc3MgRGF0ZXBpY2tlckNvbnRlbnQ8UywgRCA9IEV4dHJhY3REYXRlVHlwZUZyb21TZWxlY3Rpb248Uz4+XG4gIGltcGxlbWVudHMgT25Jbml0LCBBZnRlclZpZXdJbml0LCBPbkRlc3Ryb3lcbntcbiAgcHJpdmF0ZSBfc3Vic2NyaXB0aW9ucyA9IG5ldyBTdWJzY3JpcHRpb24oKTtcbiAgcHJpdmF0ZSBfbW9kZWw6IERhdGVTZWxlY3Rpb25Nb2RlbDxTLCBEPjtcblxuICAvKiogUmVmZXJlbmNlIHRvIHRoZSBpbnRlcm5hbCBjYWxlbmRhciBjb21wb25lbnQuICovXG4gIEBWaWV3Q2hpbGQoQ2FsZW5kYXIpIF9jYWxlbmRhcjogQ2FsZW5kYXI8RD47XG5cbiAgLyoqIFJlZmVyZW5jZSB0byB0aGUgZGF0ZXBpY2tlciB0aGF0IGNyZWF0ZWQgdGhlIG92ZXJsYXkuICovXG4gIGRhdGVwaWNrZXI6IERhdGVwaWNrZXJCYXNlPGFueSwgUywgRD47XG5cbiAgLyoqIFN0YXJ0IG9mIHRoZSBjb21wYXJpc29uIHJhbmdlLiAqL1xuICBjb21wYXJpc29uU3RhcnQ6IEQgfCBudWxsO1xuXG4gIC8qKiBFbmQgb2YgdGhlIGNvbXBhcmlzb24gcmFuZ2UuICovXG4gIGNvbXBhcmlzb25FbmQ6IEQgfCBudWxsO1xuXG4gIC8qKiBBUklBIEFjY2Vzc2libGUgbmFtZSBvZiB0aGUgYDxpbnB1dCBzdGFydERhdGUvPmAgKi9cbiAgc3RhcnREYXRlQWNjZXNzaWJsZU5hbWU6IHN0cmluZyB8IG51bGw7XG5cbiAgLyoqIEFSSUEgQWNjZXNzaWJsZSBuYW1lIG9mIHRoZSBgPGlucHV0IGVuZERhdGUvPmAgKi9cbiAgZW5kRGF0ZUFjY2Vzc2libGVOYW1lOiBzdHJpbmcgfCBudWxsO1xuXG4gIC8qKiBXaGV0aGVyIHRoZSBkYXRlcGlja2VyIGlzIGFib3ZlIG9yIGJlbG93IHRoZSBpbnB1dC4gKi9cbiAgX2lzQWJvdmU6IGJvb2xlYW47XG5cbiAgLyoqIEN1cnJlbnQgc3RhdGUgb2YgdGhlIGFuaW1hdGlvbi4gKi9cbiAgX2FuaW1hdGlvblN0YXRlOiAnZW50ZXItZHJvcGRvd24nIHwgJ2VudGVyLWRpYWxvZycgfCAndm9pZCc7XG5cbiAgLyoqIEVtaXRzIHdoZW4gYW4gYW5pbWF0aW9uIGhhcyBmaW5pc2hlZC4gKi9cbiAgcmVhZG9ubHkgX2FuaW1hdGlvbkRvbmUgPSBuZXcgU3ViamVjdDx2b2lkPigpO1xuXG4gIC8qKiBXaGV0aGVyIHRoZXJlIGlzIGFuIGluLXByb2dyZXNzIGFuaW1hdGlvbi4gKi9cbiAgX2lzQW5pbWF0aW5nID0gZmFsc2U7XG5cbiAgLyoqIFdoZXRoZXIgdGhlIGNsb3NlIGJ1dHRvbiBjdXJyZW50bHkgaGFzIGZvY3VzLiAqL1xuICBfY2xvc2VCdXR0b25Gb2N1c2VkOiBib29sZWFuO1xuXG4gIC8qKiBJZCBvZiB0aGUgbGFiZWwgZm9yIHRoZSBgcm9sZT1cImRpYWxvZ1wiYCBlbGVtZW50LiAqL1xuICBfZGlhbG9nTGFiZWxJZDogc3RyaW5nIHwgbnVsbDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcm90ZWN0ZWQgX2VsZW1lbnRSZWY6IEVsZW1lbnRSZWYsXG4gICAgcHJpdmF0ZSBfY2hhbmdlRGV0ZWN0b3JSZWY6IENoYW5nZURldGVjdG9yUmVmLFxuICAgIHByaXZhdGUgX2dsb2JhbE1vZGVsOiBEYXRlU2VsZWN0aW9uTW9kZWw8UywgRD4sXG4gICAgcHJpdmF0ZSBfZGF0ZUFkYXB0ZXI6IERhdGVBZGFwdGVyPEQ+LFxuICAgIEBPcHRpb25hbCgpIEBJbmplY3QoREFURV9GT1JNQVRTKSBwcml2YXRlIF9kYXRlRm9ybWF0czogRGF0ZUZvcm1hdHNcbiAgKSB7fVxuXG4gIG5nT25Jbml0KCkge1xuICAgIHRoaXMuX2FuaW1hdGlvblN0YXRlID0gdGhpcy5kYXRlcGlja2VyLnRvdWNoVWkgPyAnZW50ZXItZGlhbG9nJyA6ICdlbnRlci1kcm9wZG93bic7XG4gIH1cblxuICBuZ0FmdGVyVmlld0luaXQoKSB7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICB0aGlzLmRhdGVwaWNrZXIuc3RhdGVDaGFuZ2VzLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICAgIHRoaXMuX2NoYW5nZURldGVjdG9yUmVmLm1hcmtGb3JDaGVjaygpO1xuICAgICAgfSlcbiAgICApO1xuICAgIHRoaXMuX2NhbGVuZGFyLmZvY3VzQWN0aXZlQ2VsbCgpO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy51bnN1YnNjcmliZSgpO1xuICAgIHRoaXMuX2FuaW1hdGlvbkRvbmUuY29tcGxldGUoKTtcbiAgfVxuXG4gIF9oYW5kbGVVc2VyU2VsZWN0aW9uKGV2ZW50OiBDYWxlbmRhclVzZXJFdmVudDxEIHwgbnVsbD4pIHtcbiAgICBjb25zdCBzZWxlY3Rpb24gPSB0aGlzLl9tb2RlbC5zZWxlY3Rpb247XG4gICAgY29uc3QgdmFsdWUgPSBldmVudC52YWx1ZTtcbiAgICBjb25zdCBpc1JhbmdlID0gc2VsZWN0aW9uIGluc3RhbmNlb2YgRGF0ZVJhbmdlO1xuXG4gICAgaWYgKHZhbHVlICYmIChpc1JhbmdlIHx8ICF0aGlzLl9kYXRlQWRhcHRlci5zYW1lRGF0ZSh2YWx1ZSwgc2VsZWN0aW9uIGFzIHVua25vd24gYXMgRCkpKSB7XG4gICAgICB0aGlzLl9tb2RlbC5hZGQodmFsdWUpO1xuICAgIH1cblxuICAgIGlmICghdGhpcy5fbW9kZWwgfHwgdGhpcy5fbW9kZWwuaXNDb21wbGV0ZSgpKSB7XG4gICAgICB0aGlzLmRhdGVwaWNrZXIuY2xvc2UoKTtcbiAgICB9XG4gIH1cblxuICBfaGFuZGxlVXNlckRyYWdEcm9wKGV2ZW50OiBDYWxlbmRhclVzZXJFdmVudDxEYXRlUmFuZ2U8RD4+KSB7XG4gICAgdGhpcy5fbW9kZWwudXBkYXRlU2VsZWN0aW9uKGV2ZW50LnZhbHVlIGFzIHVua25vd24gYXMgUywgdGhpcyk7XG4gIH1cblxuICBfc3RhcnRFeGl0QW5pbWF0aW9uKCkge1xuICAgIHRoaXMuX2FuaW1hdGlvblN0YXRlID0gJ3ZvaWQnO1xuICAgIHRoaXMuX2NoYW5nZURldGVjdG9yUmVmLm1hcmtGb3JDaGVjaygpO1xuICB9XG5cbiAgX2hhbmRsZUFuaW1hdGlvbkV2ZW50KGV2ZW50OiBBbmltYXRpb25FdmVudCkge1xuICAgIHRoaXMuX2lzQW5pbWF0aW5nID0gZXZlbnQucGhhc2VOYW1lID09PSAnc3RhcnQnO1xuXG4gICAgaWYgKCF0aGlzLl9pc0FuaW1hdGluZykge1xuICAgICAgdGhpcy5fYW5pbWF0aW9uRG9uZS5uZXh0KCk7XG4gICAgfVxuICB9XG5cbiAgX2dldFNlbGVjdGVkKCkge1xuICAgIHJldHVybiB0aGlzLl9tb2RlbD8uc2VsZWN0aW9uIGFzIHVua25vd24gYXMgRCB8IERhdGVSYW5nZTxEPiB8IG51bGw7XG4gIH1cblxuICBfZ2V0U2VsZWN0ZWREaXNwbGF5KCkge1xuICAgIGNvbnN0IHNlbGVjdGVkID0gKHRoaXMuX21vZGVsLnNlbGVjdGlvbiBhcyB1bmtub3duIGFzIEQgfCBudWxsKSB8fCB0aGlzLl9kYXRlQWRhcHRlci50b2RheSgpO1xuICAgIHJldHVybiBzZWxlY3RlZFxuICAgICAgPyB0aGlzLl9kYXRlQWRhcHRlci5mb3JtYXQoc2VsZWN0ZWQsIHRoaXMuX2RhdGVGb3JtYXRzLmRpc3BsYXkuZGF5TW9udGhEYXRlTGFiZWwpXG4gICAgICA6ICcnO1xuICB9XG5cbiAgLyoqIEFwcGxpZXMgdGhlIGN1cnJlbnQgcGVuZGluZyBzZWxlY3Rpb24gdG8gdGhlIGdsb2JhbCBtb2RlbC4gKi9cbiAgX2FwcGx5UGVuZGluZ1NlbGVjdGlvbigpIHtcbiAgICBpZiAodGhpcy5fbW9kZWwgIT09IHRoaXMuX2dsb2JhbE1vZGVsKSB7XG4gICAgICB0aGlzLl9nbG9iYWxNb2RlbC51cGRhdGVTZWxlY3Rpb24odGhpcy5fbW9kZWwuc2VsZWN0aW9uLCB0aGlzKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIGZvcmNlUmVyZW5kZXJcbiAgICovXG4gIF9hc3NpZ25Nb2RlbChmb3JjZVJlcmVuZGVyOiBib29sZWFuKSB7XG4gICAgdGhpcy5fbW9kZWwgPSB0aGlzLl9nbG9iYWxNb2RlbDtcblxuICAgIGlmIChmb3JjZVJlcmVuZGVyKSB7XG4gICAgICB0aGlzLl9jaGFuZ2VEZXRlY3RvclJlZi5kZXRlY3RDaGFuZ2VzKCk7XG4gICAgfVxuICB9XG59XG4iLCI8ZGl2XG4gIGNka1RyYXBGb2N1c1xuICByb2xlPVwiZGlhbG9nXCJcbiAgY2xhc3M9XCJmbGV4IGZsZXgtY29sIGZsZXgtYXV0byBvdmVyZmxvdy1oaWRkZW4gcm91bmRlZC1sZ1wiXG4gIFthdHRyLmFyaWEtbW9kYWxdPVwidHJ1ZVwiXG4gIFthdHRyLmFyaWEtbGFiZWxsZWRieV09XCJfZGlhbG9nTGFiZWxJZCA/PyB1bmRlZmluZWRcIlxuPlxuICA8ZGl2IGNsYXNzPVwiZmxleCBmbGV4LWNvbCBweC0zIHB5LTIgYmctcHJpbWFyeVwiPlxuICAgIDxkaXYgY2xhc3M9XCJmbGV4IGZsZXgtY29sXCI+XG4gICAgICA8c3BhbiBjbGFzcz1cInRleHQteHMgZm9udC1ub3JtYWwgdHJhY2tpbmctd2lkZXIgdXBwZXJjYXNlIHRleHQtcHJpbWFyeS1jb250ZW50XCI+XG4gICAgICAgIFNlbGVjdGVkIGRhdGVcbiAgICAgIDwvc3Bhbj5cbiAgICA8L2Rpdj5cbiAgICA8ZGl2IGNsYXNzPVwiZmxleCBmbGV4LWNvbCBtdC00XCI+XG4gICAgICA8c3BhbiBjbGFzcz1cInRleHQteGwgZm9udC1ub3JtYWwgdGV4dC1wcmltYXJ5LWNvbnRlbnRcIj5cbiAgICAgICAge3sgX2dldFNlbGVjdGVkRGlzcGxheSgpIH19XG4gICAgICA8L3NwYW4+XG4gICAgPC9kaXY+XG4gIDwvZGl2PlxuXG4gIDxjYWxlbmRhclxuICAgIGNsYXNzPVwiZmxleC1hdXRvXCJcbiAgICBbaWRdPVwiZGF0ZXBpY2tlci5pZFwiXG4gICAgW25nQ2xhc3NdPVwiZGF0ZXBpY2tlci5wYW5lbENsYXNzXCJcbiAgICBbc3RhcnRBdF09XCJkYXRlcGlja2VyLnN0YXJ0QXRcIlxuICAgIFtzdGFydFZpZXddPVwiZGF0ZXBpY2tlci5zdGFydFZpZXdcIlxuICAgIFttaW5EYXRlXT1cImRhdGVwaWNrZXIuX2dldE1pbkRhdGUoKVwiXG4gICAgW21heERhdGVdPVwiZGF0ZXBpY2tlci5fZ2V0TWF4RGF0ZSgpXCJcbiAgICBbZGF0ZUZpbHRlcl09XCJkYXRlcGlja2VyLl9nZXREYXRlRmlsdGVyKClcIlxuICAgIFtoZWFkZXJDb21wb25lbnRdPVwiZGF0ZXBpY2tlci5jYWxlbmRhckhlYWRlckNvbXBvbmVudFwiXG4gICAgW3NlbGVjdGVkXT1cIl9nZXRTZWxlY3RlZCgpXCJcbiAgICBbZGF0ZUNsYXNzXT1cImRhdGVwaWNrZXIuZGF0ZUNsYXNzXCJcbiAgICBbY29tcGFyaXNvblN0YXJ0XT1cImNvbXBhcmlzb25TdGFydFwiXG4gICAgW2NvbXBhcmlzb25FbmRdPVwiY29tcGFyaXNvbkVuZFwiXG4gICAgW0BmYWRlSW5DYWxlbmRhcl09XCInZW50ZXInXCJcbiAgICBbc3RhcnREYXRlQWNjZXNzaWJsZU5hbWVdPVwic3RhcnREYXRlQWNjZXNzaWJsZU5hbWVcIlxuICAgIFtlbmREYXRlQWNjZXNzaWJsZU5hbWVdPVwiZW5kRGF0ZUFjY2Vzc2libGVOYW1lXCJcbiAgICAoeWVhclNlbGVjdGVkKT1cImRhdGVwaWNrZXIuX3NlbGVjdFllYXIoJGV2ZW50KVwiXG4gICAgKG1vbnRoU2VsZWN0ZWQpPVwiZGF0ZXBpY2tlci5fc2VsZWN0TW9udGgoJGV2ZW50KVwiXG4gICAgKHZpZXdDaGFuZ2VkKT1cImRhdGVwaWNrZXIuX3ZpZXdDaGFuZ2VkKCRldmVudClcIlxuICAgIChfdXNlclNlbGVjdGlvbik9XCJfaGFuZGxlVXNlclNlbGVjdGlvbigkZXZlbnQpXCJcbiAgICAoX3VzZXJEcmFnRHJvcCk9XCJfaGFuZGxlVXNlckRyYWdEcm9wKCRldmVudClcIlxuICAvPlxuXG4gIDxkaXYgY2xhc3M9XCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWVuZCB3LWZ1bGwgZ2FwLTMgcHgtMyBweS0zXCI+XG4gICAgPGJ1dHRvblxuICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICBjbGFzcz1cImJ0blwiXG4gICAgICBbY2xhc3MuY2RrLXZpc3VhbGx5LWhpZGRlbl09XCIhX2Nsb3NlQnV0dG9uRm9jdXNlZFwiXG4gICAgICAoZm9jdXMpPVwiX2Nsb3NlQnV0dG9uRm9jdXNlZCA9IHRydWVcIlxuICAgICAgKGJsdXIpPVwiX2Nsb3NlQnV0dG9uRm9jdXNlZCA9IGZhbHNlXCJcbiAgICAgIChjbGljayk9XCJkYXRlcGlja2VyLmNsb3NlKClcIlxuICAgID5cbiAgICAgIENsb3NlXG4gICAgPC9idXR0b24+XG5cbiAgICA8YnV0dG9uXG4gICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgIGNsYXNzPVwiYnRuIGJ0bi1wcmltYXJ5XCJcbiAgICAgIChjbGljayk9XCJkYXRlcGlja2VyLmFwcGx5KClcIlxuICAgID5cbiAgICAgIEFwcGx5XG4gICAgPC9idXR0b24+XG4gIDwvZGl2PlxuPC9kaXY+XG4iXX0=
