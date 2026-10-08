import { Directive, forwardRef, inject } from '@angular/core';
import {
  AbstractControl,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';

import { DateRangeInputParent } from './date-range-input-parent';
import { DateRange, DateSelectionModelChange } from './date-selection-model';
import { DateFilterFn, DatepickerInputBase } from './datepicker-input-base';

/**
 * One of the two inputs of a `<date-range-input>`: a form control of its own that holds a single
 * date, and writes its side (start or end) of the range the picker shares. Each is a plain
 * `<input>`, so it can sit in a field box of its own.
 */
@Directive({
  host: {
    '[attr.disabled]': 'disabled ? "" : null',
    '(input)': '_onInput($any($event.target).value)',
    '(change)': '_onChange()',
    '(blur)': '_onBlur()',
    '(keydown)': '_onKeydown($event)',
  },
})
export abstract class DateRangeInputPart<D> extends DatepickerInputBase<DateRange<D>, D> {
  protected readonly _parent = inject<DateRangeInputParent<D>>(DateRangeInputParent);

  protected _validator: ValidatorFn | null;

  constructor() {
    super();
    this._validator = Validators.compose([
      ...super._getValidators(),
      (control) => this._rangeValidator(control),
    ]);
  }

  /** The text input element. */
  get element(): HTMLInputElement {
    return this._elementRef.nativeElement;
  }

  /** The error of a start that comes after the end (set on both inputs), or `null`. */
  protected abstract _rangeValidator(control: AbstractControl): ValidationErrors | null;

  _getMinDate(): D | null {
    return this._parent.min;
  }

  _getMaxDate(): D | null {
    return this._parent.max;
  }

  protected _getDateFilter(): DateFilterFn<D> | undefined {
    return this._parent.dateFilter as DateFilterFn<D>;
  }

  protected _openPopup(): void {
    this._parent._openPicker();
  }

  /** A change one of the two inputs made is already in the text of that input. */
  protected _shouldHandleChangeEvent(event: DateSelectionModelChange<DateRange<D>>): boolean {
    return !(event.source instanceof DateRangeInputPart);
  }

  protected override _parentDisabled(): boolean {
    return this._parent._disabledInput;
  }

  protected _rangeError(control: AbstractControl, otherIsEnd: boolean): ValidationErrors | null {
    const own = this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(control.value));
    const selection = this._model?.selection;
    const other = otherIsEnd ? selection?.end : selection?.start;
    if (!own || !other) {
      return null;
    }
    const [start, end] = otherIsEnd ? [own, other] : [other, own];
    return this._dateAdapter.compareDate(start, end) > 0
      ? { datepickerRange: { start, end } }
      : null;
  }
}

/** The first of the two inputs of a `<date-range-input>`: the start date. */
@Directive({
  selector: 'input[dateRangeStart]',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DateRangeStartInput),
      multi: true,
    },
    { provide: NG_VALIDATORS, useExisting: forwardRef(() => DateRangeStartInput), multi: true },
  ],
  exportAs: 'dateRangeStartInput',
})
export class DateRangeStartInput<D> extends DateRangeInputPart<D> {
  protected _getValueFromModel(modelValue: DateRange<D>): D | null {
    return modelValue.start;
  }

  protected _assignValueToModel(value: D | null): void {
    const model = this._model!;
    model.updateSelection(new DateRange<D>(value, model.selection.end), this);
    this._parent._handleChildValueChange();
  }

  protected _rangeValidator(control: AbstractControl): ValidationErrors | null {
    return this._rangeError(control, true);
  }
}

/** The second of the two inputs of a `<date-range-input>`: the end date. */
@Directive({
  selector: 'input[dateRangeEnd]',
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => DateRangeEndInput), multi: true },
    { provide: NG_VALIDATORS, useExisting: forwardRef(() => DateRangeEndInput), multi: true },
  ],
  exportAs: 'dateRangeEndInput',
})
export class DateRangeEndInput<D> extends DateRangeInputPart<D> {
  protected _getValueFromModel(modelValue: DateRange<D>): D | null {
    return modelValue.end;
  }

  protected _assignValueToModel(value: D | null): void {
    const model = this._model!;
    model.updateSelection(new DateRange<D>(model.selection.start, value), this);
    this._parent._handleChildValueChange();
  }

  protected _rangeValidator(control: AbstractControl): ValidationErrors | null {
    return this._rangeError(control, false);
  }
}
