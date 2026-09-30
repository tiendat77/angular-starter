import {
  booleanAttribute,
  Directive,
  ElementRef,
  forwardRef,
  inject,
  Input,
  OnDestroy,
} from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  Validator,
} from '@angular/forms';
import { Subject, Subscription } from 'rxjs';

import { DATE_FORMATS, DateAdapter, DateFormats } from '../adapter';
import { DateRange, DateSelectionModel } from './date-selection-model';
import { DatepickerControl, DatepickerPanel } from './datepicker-base';
import { DateFilterFn } from './datepicker-input-base';

/** Separator between the start and end date in the input text. */
const RANGE_SEPARATOR = ' – ';

/**
 * Connects a single text input to a `<date-range-picker>`. The form value is a `DateRange`, shown
 * as `start – end`. Typing is supported: enter two dates separated by a dash.
 */
@Directive({
  selector: 'input[dateRangePicker]',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatepickerRangeInput),
      multi: true,
    },
    { provide: NG_VALIDATORS, useExisting: forwardRef(() => DatepickerRangeInput), multi: true },
  ],
  host: {
    '[attr.aria-owns]': '(_picker?.opened && _picker.id) || null',
    '[disabled]': 'disabled',
    '(input)': '_onInput($any($event.target).value)',
    '(blur)': '_onBlur()',
    '(keydown)': '_onKeydown($event)',
  },
  exportAs: 'dateRangePickerInput',
})
export class DatepickerRangeInput<D>
  implements DatepickerControl<D>, ControlValueAccessor, Validator, OnDestroy
{
  private _elementRef = inject<ElementRef<HTMLInputElement>>(ElementRef);
  private _dateAdapter = inject<DateAdapter<D>>(DateAdapter);
  private _dateFormats = inject<DateFormats>(DATE_FORMATS);

  private _model: DateSelectionModel<DateRange<D>, D> | undefined;
  private _pendingValue: DateRange<D> | null = null;
  private _modelSubscription = Subscription.EMPTY;
  private _closedSubscription = Subscription.EMPTY;
  private _localeSubscription: Subscription;
  private _lastTextValid = true;

  private _onChangeFn: (value: DateRange<D> | null) => void = () => undefined;
  private _onTouched: () => void = () => undefined;
  private _validatorOnChange: () => void = () => undefined;

  readonly stateChanges = new Subject<void>();

  /** The range picker that this input is associated with. */
  @Input()
  set dateRangePicker(picker: DatepickerPanel<DatepickerControl<D>, DateRange<D>, D>) {
    if (picker) {
      this._picker = picker;
      this._closedSubscription = picker.closedStream.subscribe(() => this._onTouched());
      this._registerModel(picker.registerInput(this));
    }
  }
  _picker: DatepickerPanel<DatepickerControl<D>, DateRange<D>, D>;

  @Input() min: D | null = null;
  @Input() max: D | null = null;

  /** Function that can be used to filter out dates within the picker. */
  // Same public name as on `input[datepicker]`
  // eslint-disable-next-line @angular-eslint/no-input-rename
  @Input('datepickerFilter') dateFilter: DateFilterFn<D | null> = () => true;

  @Input({ transform: booleanAttribute }) disabled = false;

  constructor() {
    this._localeSubscription = this._dateAdapter.localeChanges.subscribe(() =>
      this._formatValue(this._model?.selection ?? this._pendingValue)
    );
  }

  ngOnDestroy() {
    this._modelSubscription.unsubscribe();
    this._closedSubscription.unsubscribe();
    this._localeSubscription.unsubscribe();
    this.stateChanges.complete();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ DatepickerControl
  // -----------------------------------------------------------------------------------------------------
  getStartValue(): D | null {
    return this._range()?.start ?? null;
  }

  getConnectedOverlayOrigin(): ElementRef {
    return this._elementRef;
  }

  getOverlayLabelId(): string | null {
    return this._elementRef.nativeElement.getAttribute('aria-labelledby');
  }

  // -----------------------------------------------------------------------------------------------------
  // @ ControlValueAccessor / Validator
  // -----------------------------------------------------------------------------------------------------
  writeValue(value: DateRange<D> | null): void {
    this._setRange(value, false);
  }

  registerOnChange(fn: (value: DateRange<D> | null) => void): void {
    this._onChangeFn = fn;
  }

  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  registerOnValidatorChange(fn: () => void): void {
    this._validatorOnChange = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.stateChanges.next();
  }

  validate(control: AbstractControl): ValidationErrors | null {
    if (!this._lastTextValid) {
      return { datepickerParse: { text: this._elementRef.nativeElement.value } };
    }

    const range = control.value as DateRange<D> | null;
    if (!range) {
      return null;
    }

    const { start, end } = range;
    if (start && end && this._dateAdapter.compareDate(start, end) > 0) {
      return { datepickerRange: { start, end } };
    }
    for (const date of [start, end]) {
      if (!date) continue;
      if (this.min && this._dateAdapter.compareDate(this.min, date) > 0) {
        return { datepickerMin: { min: this.min, actual: date } };
      }
      if (this.max && this._dateAdapter.compareDate(this.max, date) < 0) {
        return { datepickerMax: { max: this.max, actual: date } };
      }
      if (this.dateFilter && !this.dateFilter(date)) {
        return { datepickerFilter: true };
      }
    }
    return null;
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Host handlers
  // -----------------------------------------------------------------------------------------------------
  _onInput(text: string): void {
    const parts = text.split(/\s*[–—-]\s*/);
    const parse = (part?: string) =>
      part?.trim()
        ? this._dateAdapter.getValidDateOrNull(
            this._dateAdapter.parse(part, this._dateFormats.parse.dateInput)
          )
        : null;

    const start = parse(parts[0]);
    const end = parse(parts[1]);
    this._lastTextValid = !text.trim() || (!!start && (parts.length < 2 || !!end));

    const range = start || end ? new DateRange<D>(start, end) : null;
    this._setRange(range, true, false);
    this._validatorOnChange();
  }

  _onBlur(): void {
    if (this._lastTextValid) {
      this._formatValue(this._range());
    }
    this._onTouched();
  }

  _onKeydown(event: KeyboardEvent): void {
    if (event.altKey && event.key === 'ArrowDown') {
      this._picker?.open();
      event.preventDefault();
    }
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Private
  // -----------------------------------------------------------------------------------------------------
  private _range(): DateRange<D> | null {
    return this._model ? this._model.selection : this._pendingValue;
  }

  private _registerModel(model: DateSelectionModel<DateRange<D>, D>): void {
    this._model = model;
    this._modelSubscription.unsubscribe();

    if (this._pendingValue) {
      model.updateSelection(this._pendingValue, this);
      this._pendingValue = null;
    }

    this._modelSubscription = model.selectionChanged.subscribe((event) => {
      // Changes made by this input are already reflected in the text
      if (event.source === this) {
        return;
      }
      this._lastTextValid = true;
      this._onChangeFn(event.selection);
      this._onTouched();
      this._formatValue(event.selection);
      this._validatorOnChange();
    });
  }

  /** Pushes a range into the model and, optionally, reformats the text and notifies the form. */
  private _setRange(value: unknown, notify: boolean, reformat = true): void {
    const range = value instanceof DateRange ? value : null;
    const start = this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(range?.start));
    const end = this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(range?.end));
    const next = new DateRange<D>(start, end);

    if (this._model) {
      this._model.updateSelection(next, this);
    } else {
      this._pendingValue = next;
    }

    if (!notify) {
      this._lastTextValid = true;
    }
    if (reformat) {
      this._formatValue(next);
    }
    if (notify) {
      this._onChangeFn(start || end ? next : null);
    }
  }

  private _formatValue(range: DateRange<D> | null): void {
    const format = (date: D | null) =>
      date ? this._dateAdapter.format(date, this._dateFormats.display.dateInput) : '';
    const start = format(range?.start ?? null);
    const end = format(range?.end ?? null);

    this._elementRef.nativeElement.value = start || end ? `${start}${RANGE_SEPARATOR}${end}` : '';
  }
}
