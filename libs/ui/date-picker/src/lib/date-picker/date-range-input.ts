import {
  AfterContentInit,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  contentChild,
  ElementRef,
  forwardRef,
  inject,
  Input,
  OnDestroy,
  ViewEncapsulation,
} from '@angular/core';
import { merge, Subject, Subscription } from 'rxjs';

import { DateRangeInputParent } from './date-range-input-parent';
import { DateRangeEndInput, DateRangeStartInput } from './date-range-input-parts';
import { DateRange, DateSelectionModel } from './date-selection-model';
import { DatepickerControl, DatepickerPanel } from './datepicker-base';
import { DateFilterFn } from './datepicker-input-base';

/**
 * Connects two separate inputs, one for the start date and one for the end date, to a
 * `<date-range-picker>`. Unlike `input[dateRangePicker]` (one text field `start – end`), each date
 * has its own input and form control, so each can sit in a field box of its own:
 *
 * ```html
 * <date-range-input [rangePicker]="picker">
 *   <label class="input"><input dateRangeStart [formControl]="start" /></label>
 *   <span>→</span>
 *   <label class="input"><input dateRangeEnd [formControl]="end" /></label>
 * </date-range-input>
 * <date-range-picker #picker />
 * ```
 *
 * It draws nothing itself (a flex row, with a gap): it is the one control the picker connects to,
 * the calendar opens under the whole row, and the inputs share the range the calendar picks.
 */
@Component({
  selector: 'date-range-input',
  template: '<ng-content />',
  exportAs: 'dateRangeInput',
  host: { class: 'flex items-center gap-2' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [{ provide: DateRangeInputParent, useExisting: forwardRef(() => DateRangeInput) }],
})
export class DateRangeInput<D>
  extends DateRangeInputParent<D>
  implements DatepickerControl<D>, AfterContentInit, OnDestroy
{
  private readonly _elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  private readonly _start = contentChild(DateRangeStartInput<D>);
  private readonly _end = contentChild(DateRangeEndInput<D>);

  private _model: DateSelectionModel<DateRange<D>, D> | undefined;
  private _initialised = false;
  private _closedSubscription = Subscription.EMPTY;
  private _stateSubscription = Subscription.EMPTY;

  readonly stateChanges = new Subject<void>();

  /** The range picker that this input is associated with. */
  @Input()
  set rangePicker(picker: DatepickerPanel<DatepickerControl<D>, DateRange<D>, D>) {
    if (!picker) {
      return;
    }
    this._picker = picker;
    this._closedSubscription.unsubscribe();
    this._closedSubscription = picker.closedStream.subscribe(() => {
      this._start()?._onTouched();
      this._end()?._onTouched();
    });
    this._model = picker.registerInput(this);
    this._registerParts();
  }
  private _picker: DatepickerPanel<DatepickerControl<D>, DateRange<D>, D> | undefined;

  /** The minimum valid date, for both inputs. */
  @Input()
  get min(): D | null {
    return this._min;
  }
  set min(value: D | null) {
    this._min = value;
    this._handleChildValueChange();
  }
  private _min: D | null = null;

  /** The maximum valid date, for both inputs. */
  @Input()
  get max(): D | null {
    return this._max;
  }
  set max(value: D | null) {
    this._max = value;
    this._handleChildValueChange();
  }
  private _max: D | null = null;

  /** Function that filters out the dates the user may not pick (also checked on typed dates). */
  // Same public name as on `input[datepicker]`
  @Input('datepickerFilter')
  get dateFilter(): DateFilterFn<D | null> {
    return this._dateFilter;
  }
  set dateFilter(value: DateFilterFn<D | null>) {
    this._dateFilter = value;
    this._handleChildValueChange();
  }
  private _dateFilter: DateFilterFn<D | null> = () => true;

  /** Disables both inputs. Each input can also be disabled on its own (a form control). */
  @Input({ transform: booleanAttribute })
  set disabled(value: boolean) {
    this._disabledInputValue = value;
    this.stateChanges.next();
  }
  get disabled(): boolean {
    const start = this._start();
    const end = this._end();
    return this._disabledInputValue || (!!start && !!end && start.disabled && end.disabled);
  }
  private _disabledInputValue = false;

  get _disabledInput(): boolean {
    return this._disabledInputValue;
  }

  ngAfterContentInit(): void {
    this._initialised = true;
    this._registerParts();
    const start = this._start();
    const end = this._end();
    if (start && end) {
      this._stateSubscription = merge(start.stateChanges, end.stateChanges).subscribe(() =>
        this.stateChanges.next()
      );
    }
  }

  ngOnDestroy(): void {
    this._closedSubscription.unsubscribe();
    this._stateSubscription.unsubscribe();
    this.stateChanges.complete();
  }

  _openPicker(): void {
    this._picker?.open();
  }

  _handleChildValueChange(): void {
    this._start()?._validatorOnChange();
    this._end()?._validatorOnChange();
  }

  // DatepickerControl -----------------------------------------------------------------------------

  getStartValue(): D | null {
    return this._model?.selection.start ?? null;
  }

  /** The calendar opens under the whole row, not under one of the inputs. */
  getConnectedOverlayOrigin(): ElementRef {
    return this._elementRef;
  }

  getOverlayLabelId(): string | null {
    return this._start()?.element.getAttribute('aria-labelledby') ?? null;
  }

  private _registerParts(): void {
    if (!this._model || !this._initialised) {
      return;
    }
    this._start()?._registerModel(this._model);
    this._end()?._registerModel(this._model);
  }
}
