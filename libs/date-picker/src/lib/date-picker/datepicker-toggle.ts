/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/* eslint-disable @angular-eslint/no-input-rename */

import {
  AfterContentInit,
  booleanAttribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';

import { merge, Observable, of as observableOf, Subscription } from 'rxjs';
import { DatepickerControl, DatepickerPanel } from './datepicker-base';

@Component({
  selector: 'datepicker-toggle',
  templateUrl: 'datepicker-toggle.html',
  host: {
    '(click)': '_open($event)',
  },
  standalone: true,
  exportAs: 'datepickerToggle',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatepickerToggle<D> implements AfterContentInit, OnChanges, OnDestroy {
  private _stateChanges = Subscription.EMPTY;

  /** Datepicker instance that the button will toggle. */
  @Input('for') datepicker: DatepickerPanel<DatepickerControl<any>, D>;

  /** Screen-reader label for the button. */
  @Input('aria-label') ariaLabel: string;

  /** Whether the toggle button is disabled. */
  @Input({ transform: booleanAttribute })
  get disabled(): boolean {
    if (this._disabled === undefined && this.datepicker) {
      return this.datepicker.disabled;
    }

    return !!this._disabled;
  }
  set disabled(value: boolean) {
    this._disabled = value;
  }
  private _disabled: boolean;

  constructor(private _changeDetectorRef: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges) {
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

  _open(event: Event): void {
    if (this.datepicker && !this.disabled) {
      this.datepicker.open();
      event.stopPropagation();
    }
  }

  private _watchStateChanges() {
    const datepickerStateChanged = this.datepicker ? this.datepicker.stateChanges : observableOf();
    const inputStateChanged =
      this.datepicker && this.datepicker.datepickerInput
        ? this.datepicker.datepickerInput.stateChanges
        : observableOf();
    const datepickerToggled = this.datepicker
      ? merge(this.datepicker.openedStream, this.datepicker.closedStream)
      : observableOf();

    this._stateChanges.unsubscribe();

    this._stateChanges = merge(
      datepickerStateChanged as Observable<void>,
      inputStateChanged,
      datepickerToggled
    ).subscribe(() => this._changeDetectorRef.markForCheck());
  }
}
