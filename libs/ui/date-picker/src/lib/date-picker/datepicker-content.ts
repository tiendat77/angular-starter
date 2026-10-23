/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation,
  inject,
} from '@angular/core';

import { NgClass } from '@angular/common';
import { prefersReducedMotion } from '@libs/ui/core';

import { Subject, Subscription } from 'rxjs';

import { DateAdapter } from '../adapter/date-adapter';
import { Calendar } from '../calendar/calendar';
import { CalendarUserEvent } from '../calendar/calendar-body';

import {
  DateRange,
  DateSelectionModel,
  ExtractDateTypeFromSelection,
} from './date-selection-model';
import { DatepickerBase } from './datepicker-base';
import { DatepickerIntl } from './datepicker-intl';

/**
 * Component used as the content for the datepicker overlay. We use this instead of using
 * Calendar directly as the content so we can control the initial focus. This also gives us a
 * place to put additional features of the overlay that are not part of the calendar itself in the
 * future. (e.g. confirmation buttons).
 * @docs-private
 */
@Component({
  selector: 'datepicker-content',
  templateUrl: './datepicker-content.html',
  styleUrl: './datepicker-content.scss',
  host: {
    class: 'datepicker-content',
    '[class.datepicker-content-touch]': 'datepicker.touchUi',
    // Motion lives in _panel-motion.scss; the exit class is added by `_startExitAnimation`.
    '[class.datepicker-motion-enter-dropdown]': '_animationState === "enter-dropdown"',
    '[class.datepicker-motion-enter-dialog]': '_animationState === "enter-dialog"',
    '[class.datepicker-motion-enter-fullscreen]': '_animationState === "enter-fullscreen"',
    '(animationstart)': '_handleAnimationEvent($event)',
    '(animationend)': '_handleAnimationEvent($event)',
    '(animationcancel)': '_handleAnimationEvent($event)',
  },
  exportAs: 'datepickerContent',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Calendar, NgClass],
})
export class DatepickerContent<S, D = ExtractDateTypeFromSelection<S>>
  implements OnInit, AfterViewInit, OnDestroy
{
  protected _elementRef = inject(ElementRef);
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _globalModel = inject<DateSelectionModel<S, D>>(DateSelectionModel);
  private _dateAdapter = inject<DateAdapter<D>>(DateAdapter);
  protected _intl = inject(DatepickerIntl);

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
  _animationState: 'enter-dropdown' | 'enter-dialog' | 'enter-fullscreen' | 'void';

  /** Emits when an animation has finished. */
  readonly _animationDone = new Subject<void>();

  /** Whether there is an in-progress animation. */
  _isAnimating = false;

  /** Reports the end of the exit when no animation events come (reduced motion, tests, ...). */
  private _animationFallback: ReturnType<typeof setTimeout> | undefined;

  /** Whether the close button currently has focus. */
  _closeButtonFocused: boolean;

  /** Id of the label for the `role="dialog"` element. */
  _dialogLabelId: string | null;

  ngOnInit() {
    this._animationState = this.datepicker.touchUi ? 'enter-dialog' : 'enter-dropdown';
  }

  ngAfterViewInit() {
    this._subscriptions.add(
      this._intl.changes.subscribe(() => this._changeDetectorRef.markForCheck())
    );
    this._subscriptions.add(
      this.datepicker.stateChanges.subscribe(() => {
        this._changeDetectorRef.markForCheck();
      })
    );
    this._calendar?.focusActiveCell();
  }

  ngOnDestroy() {
    clearTimeout(this._animationFallback);
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
    const wasFullscreen = this._animationState === 'enter-fullscreen';

    this._animationState = 'void';
    this._changeDetectorRef.markForCheck();
    this._elementRef.nativeElement.classList.add(
      wasFullscreen ? 'datepicker-motion-exit-fullscreen' : 'datepicker-motion-exit'
    );

    // An animation that never starts sends no events, so give up waiting if none starts. The
    // completion stays asynchronous: callers subscribe to `_animationDone` right after this.
    clearTimeout(this._animationFallback);
    this._animationFallback = setTimeout(
      () => {
        if (!this._isAnimating) {
          this._animationDone.next();
        }
      },
      prefersReducedMotion() ? 0 : 200
    );
  }

  _handleAnimationEvent(event: AnimationEvent) {
    const exiting = this._animationState === 'void';

    // Only the panel's own animation of the current phase counts (e.g. not the enter that the
    // exit cancelled).
    if (
      event.target !== this._elementRef.nativeElement ||
      !event.animationName.startsWith('datepicker-') ||
      event.animationName.includes('exit') !== exiting
    ) {
      return;
    }

    clearTimeout(this._animationFallback);
    this._isAnimating = event.type === 'animationstart';

    if (exiting && !this._isAnimating) {
      this._animationDone.next();
    }
  }

  _getSelected() {
    return this._model?.selection as unknown as D | DateRange<D> | null;
  }

  /** Applies the current pending selection to the global model. */
  _applyPendingSelection() {
    if (this._model !== this._globalModel) {
      this._globalModel.updateSelection(this._model.selection as S, this);
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
