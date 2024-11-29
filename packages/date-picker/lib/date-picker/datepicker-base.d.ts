/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directionality } from '@angular/cdk/bidi';
import { Overlay, ScrollStrategy } from '@angular/cdk/overlay';
import { ComponentType } from '@angular/cdk/portal';
import * as i0 from '@angular/core';
import {
  ElementRef,
  EventEmitter,
  InjectionToken,
  NgZone,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewContainerRef,
} from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { DateAdapter } from '../adapter/date-adapter';
import { CalendarView } from '../calendar/calendar';
import { CalendarCellClassFunction } from '../calendar/calendar-body';
import { DateSelectionModel, ExtractDateTypeFromSelection } from './date-selection-model';
import { DatepickerContent } from './datepicker-content';
import { DateFilterFn } from './datepicker-input-base';
/** Injection token that determines the scroll handling while the calendar is open. */
export declare const DATEPICKER_SCROLL_STRATEGY: InjectionToken<() => ScrollStrategy>;
/** @docs-private */
export declare function DATEPICKER_SCROLL_STRATEGY_FACTORY(overlay: Overlay): () => ScrollStrategy;
/** Possible positions for the datepicker dropdown along the X axis. */
export type DatepickerDropdownPositionX = 'start' | 'end';
/** Possible positions for the datepicker dropdown along the Y axis. */
export type DatepickerDropdownPositionY = 'above' | 'below';
/** @docs-private */
export declare const DATEPICKER_SCROLL_STRATEGY_FACTORY_PROVIDER: {
  provide: InjectionToken<() => ScrollStrategy>;
  deps: (typeof Overlay)[];
  useFactory: typeof DATEPICKER_SCROLL_STRATEGY_FACTORY;
};
/** Form control that can be associated with a datepicker. */
export interface DatepickerControl<D> {
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
export interface DatepickerPanel<
  C extends DatepickerControl<D>,
  S,
  D = ExtractDateTypeFromSelection<S>,
> {
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
export declare abstract class DatepickerBase<
    C extends DatepickerControl<D>,
    S,
    D = ExtractDateTypeFromSelection<S>,
  >
  implements DatepickerPanel<C, S, D>, OnDestroy, OnChanges
{
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
  constructor(
    _overlay: Overlay,
    _ngZone: NgZone,
    _viewContainerRef: ViewContainerRef,
    scrollStrategy: any,
    _dateAdapter: DateAdapter<D>,
    _dir: Directionality,
    _model: DateSelectionModel<S, D>
  );
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
  static ɵfac: i0.ɵɵFactoryDeclaration<
    DatepickerBase<any, any, any>,
    [null, null, null, null, { optional: true }, { optional: true }, null]
  >;
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    DatepickerBase<any, any, any>,
    never,
    never,
    {
      calendarHeaderComponent: { alias: 'calendarHeaderComponent'; required: false };
      startAt: { alias: 'startAt'; required: false };
      startView: { alias: 'startView'; required: false };
      touchUi: { alias: 'touchUi'; required: false };
      disabled: { alias: 'disabled'; required: false };
      xPosition: { alias: 'xPosition'; required: false };
      yPosition: { alias: 'yPosition'; required: false };
      restoreFocus: { alias: 'restoreFocus'; required: false };
      dateClass: { alias: 'dateClass'; required: false };
      panelClass: { alias: 'panelClass'; required: false };
      opened: { alias: 'opened'; required: false };
    },
    {
      yearSelected: 'yearSelected';
      monthSelected: 'monthSelected';
      viewChanged: 'viewChanged';
      openedStream: 'opened';
      closedStream: 'closed';
    },
    never,
    never,
    false,
    never
  >;
  static ngAcceptInputType_touchUi: unknown;
  static ngAcceptInputType_disabled: unknown;
  static ngAcceptInputType_restoreFocus: unknown;
  static ngAcceptInputType_opened: unknown;
}
