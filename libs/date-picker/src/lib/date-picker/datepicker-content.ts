/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { CdkPortalOutlet } from '@angular/cdk/portal';

import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  OnInit,
  Optional,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';

import { AnimationEvent } from '@angular/animations';
import { NgClass } from '@angular/common';

import { Subject, Subscription } from 'rxjs';

import { DateAdapter } from '../adapter/date-adapter';
import { DATE_FORMATS, DateFormats } from '../adapter/date-formats';
import { Calendar } from '../calendar/calendar';
import { CalendarUserEvent } from '../calendar/calendar-body';
import { animations } from '../utils/animations';

import {
  DateRange,
  DateSelectionModel,
  ExtractDateTypeFromSelection,
} from './date-selection-model';
import { DatepickerBase } from './datepicker-base';

/**
 * Component used as the content for the datepicker overlay. We use this instead of using
 * Calendar directly as the content so we can control the initial focus. This also gives us a
 * place to put additional features of the overlay that are not part of the calendar itself in the
 * future. (e.g. confirmation buttons).
 * @docs-private
 */
@Component({
  selector: 'datepicker-content',
  templateUrl: 'datepicker-content.html',
  styleUrl: 'datepicker-content.scss',
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
})
export class DatepickerContent<S, D = ExtractDateTypeFromSelection<S>>
  implements OnInit, AfterViewInit, OnDestroy
{
  private _subscriptions = new Subscription();
  private _model: DateSelectionModel<S, D>;

  /** Reference to the internal calendar component. */
  @ViewChild(Calendar) _calendar: Calendar<D>;

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
  readonly _animationDone = new Subject<void>();

  /** Whether there is an in-progress animation. */
  _isAnimating = false;

  /** Whether the close button currently has focus. */
  _closeButtonFocused: boolean;

  /** Id of the label for the `role="dialog"` element. */
  _dialogLabelId: string | null;

  constructor(
    protected _elementRef: ElementRef,
    private _changeDetectorRef: ChangeDetectorRef,
    private _globalModel: DateSelectionModel<S, D>,
    private _dateAdapter: DateAdapter<D>,
    @Optional() @Inject(DATE_FORMATS) private _dateFormats: DateFormats
  ) {}

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

  _handleUserSelection(event: CalendarUserEvent<D | null>) {
    const selection = this._model.selection;
    const value = event.value;
    const isRange = selection instanceof DateRange;

    if (value && (isRange || !this._dateAdapter.sameDate(value, selection as unknown as D))) {
      this._model.add(value);
    }

    if (!this._model || this._model.isComplete()) {
      this.datepicker.close();
    }
  }

  _handleUserDragDrop(event: CalendarUserEvent<DateRange<D>>) {
    this._model.updateSelection(event.value as unknown as S, this);
  }

  _startExitAnimation() {
    this._animationState = 'void';
    this._changeDetectorRef.markForCheck();
  }

  _handleAnimationEvent(event: AnimationEvent) {
    this._isAnimating = event.phaseName === 'start';

    if (!this._isAnimating) {
      this._animationDone.next();
    }
  }

  _getSelected() {
    return this._model?.selection as unknown as D | DateRange<D> | null;
  }

  _getSelectedDisplay() {
    const selected = (this._model.selection as unknown as D | null) || this._dateAdapter.today();
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
  _assignModel(forceRerender: boolean) {
    this._model = this._globalModel;

    if (forceRerender) {
      this._changeDetectorRef.detectChanges();
    }
  }
}
