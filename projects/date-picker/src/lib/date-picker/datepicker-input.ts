/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/* eslint-disable @angular-eslint/directive-class-suffix */

import {
  Directive,
  ElementRef,
  forwardRef,
  Inject,
  InjectionToken,
  Input,
  OnDestroy,
  Optional,
} from '@angular/core';
import { NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidatorFn, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

import { DateAdapter, DATE_FORMATS, DateFormats } from '../adapter';
import { DatepickerInputBase, DateFilterFn } from './datepicker-input-base';
import { DatepickerControl, DatepickerPanel } from './datepicker-base';
import { DateSelectionModelChange } from './date-selection-model';

/** @docs-private */
export const DATEPICKER_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => DatepickerInput),
  multi: true,
};

/** @docs-private */
export const DATEPICKER_VALIDATORS: any = {
  provide: NG_VALIDATORS,
  useExisting: forwardRef(() => DatepickerInput),
  multi: true,
};

export const INPUT_VALUE_ACCESSOR: any = {
  provide: new InjectionToken<{ value: any }>('INPUT_VALUE_ACCESSOR'),
  useExisting: forwardRef(() => DatepickerInput),
};

/** Directive used to connect an input to a Datepicker. */
@Directive({
  standalone: true,
  selector: 'input[datepicker]',
  providers: [DATEPICKER_VALUE_ACCESSOR, DATEPICKER_VALIDATORS, INPUT_VALUE_ACCESSOR],
  host: {
    '[attr.aria-owns]': '(_datepicker?.opened && _datepicker.id) || null',
    '[attr.min]': 'min ? _dateAdapter.toIso8601(min) : null',
    '[attr.max]': 'max ? _dateAdapter.toIso8601(max) : null',
    '[disabled]': 'disabled',
    '(input)': '_onInput($event.target.value)',
    '(change)': '_onChange()',
    '(blur)': '_onBlur()',
    '(keydown)': '_onKeydown($event)',
  },
  exportAs: 'datepickerInput',
})
export class DatepickerInput<D>
  extends DatepickerInputBase<D | null, D>
  implements DatepickerControl<D | null>, OnDestroy
{
  private _closedSubscription = Subscription.EMPTY;

  /** The datepicker that this input is associated with. */
  @Input()
  set datepicker(datepicker: DatepickerPanel<DatepickerControl<D>, D | null, D>) {
    if (datepicker) {
      this._datepicker = datepicker;
      this._closedSubscription = datepicker.closedStream.subscribe(() => this._onTouched());
      this._registerModel(datepicker.registerInput(this));
    }
  }
  _datepicker: DatepickerPanel<DatepickerControl<D>, D | null, D>;

  /** The minimum valid date. */
  @Input()
  get min(): D | null {
    return this._min;
  }
  set min(value: D | null) {
    const validValue = this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(value));

    if (!this._dateAdapter.sameDate(validValue, this._min)) {
      this._min = validValue;
      this._validatorOnChange();
    }
  }
  private _min: D | null;

  /** The maximum valid date. */
  @Input()
  get max(): D | null {
    return this._max;
  }
  set max(value: D | null) {
    const validValue = this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(value));

    if (!this._dateAdapter.sameDate(validValue, this._max)) {
      this._max = validValue;
      this._validatorOnChange();
    }
  }
  private _max: D | null;

  /** Function that can be used to filter out dates within the datepicker. */
  @Input('datepickerFilter')
  get dateFilter() {
    return this._dateFilter;
  }
  set dateFilter(value: DateFilterFn<D | null>) {
    const wasMatchingValue = this._matchesFilter(this.value);
    this._dateFilter = value;

    if (this._matchesFilter(this.value) !== wasMatchingValue) {
      this._validatorOnChange();
    }
  }
  private _dateFilter: DateFilterFn<D | null>;

  /** The combined form control validator for this input. */
  protected _validator: ValidatorFn | null;

  constructor(
    elementRef: ElementRef<HTMLInputElement>,
    @Optional() dateAdapter: DateAdapter<D>,
    @Optional() @Inject(DATE_FORMATS) dateFormats: DateFormats
  ) {
    super(elementRef, dateAdapter, dateFormats);
    this._validator = Validators.compose(super._getValidators());
  }

  /**
   * Gets the element that the datepicker popup should be connected to.
   * @return The element to connect the popup to.
   */
  getConnectedOverlayOrigin(): ElementRef {
    return this._elementRef;
  }

  /** Gets the ID of an element that should be used a description for the calendar overlay. */
  getOverlayLabelId(): string | null {
    return this._elementRef.nativeElement.getAttribute('aria-labelledby');
  }

  /** Gets the value at which the calendar should start. */
  getStartValue(): D | null {
    return this.value;
  }

  override ngOnDestroy() {
    super.ngOnDestroy();
    this._closedSubscription.unsubscribe();
  }

  /** Opens the associated datepicker. */
  protected _openPopup(): void {
    if (this._datepicker) {
      this._datepicker.open();
    }
  }

  protected _getValueFromModel(modelValue: D | null): D | null {
    return modelValue;
  }

  protected _assignValueToModel(value: D | null): void {
    if (this._model) {
      this._model.updateSelection(value, this);
    }
  }

  /** Gets the input's minimum date. */
  _getMinDate() {
    return this._min;
  }

  /** Gets the input's maximum date. */
  _getMaxDate() {
    return this._max;
  }

  /** Gets the input's date filtering function. */
  protected _getDateFilter() {
    return this._dateFilter;
  }

  protected _shouldHandleChangeEvent(event: DateSelectionModelChange<D>) {
    return event.source !== this;
  }
}
