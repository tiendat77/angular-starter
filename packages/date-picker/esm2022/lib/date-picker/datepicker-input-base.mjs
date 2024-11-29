/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { DOWN_ARROW, hasModifierKey } from '@angular/cdk/keycodes';
import * as i0 from '@angular/core';
import {
  Directive,
  EventEmitter,
  Inject,
  Input,
  Optional,
  Output,
  booleanAttribute,
} from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import * as i1 from '../adapter';
import { DATE_FORMATS } from '../adapter';
import { createMissingDateImplError } from '../utils/errors';
/**
 * An event used for datepicker input and change events. We don't always have access to a native
 * input or change event because the event may have been triggered by the user clicking on the
 * calendar popup. For consistency, we always use datepickerInputEvent instead.
 */
export class DatepickerInputEvent {
  target;
  targetElement;
  /** The new value for the target datepicker input. */
  value;
  constructor(
    /** Reference to the datepicker input component that emitted the event. */
    target,
    /** Reference to the native input element associated with the datepicker input. */
    targetElement
  ) {
    this.target = target;
    this.targetElement = targetElement;
    this.value = this.target.value;
  }
}
/** Base class for datepicker inputs. */
export class DatepickerInputBase {
  _elementRef;
  _dateAdapter;
  _dateFormats;
  /** Whether the component has been initialized. */
  _isInitialized;
  /** The value of the input. */
  get value() {
    return this._model ? this._getValueFromModel(this._model.selection) : this._pendingValue;
  }
  set value(value) {
    this._assignValueProgrammatically(value);
  }
  _model;
  /** Whether the datepicker-input is disabled. */
  get disabled() {
    return !!this._disabled || this._parentDisabled();
  }
  set disabled(value) {
    const newValue = value;
    const element = this._elementRef.nativeElement;
    if (this._disabled !== newValue) {
      this._disabled = newValue;
      this.stateChanges.next(undefined);
    }
    // We need to null check the `blur` method, because it's undefined during SSR.
    // In Ivy static bindings are invoked earlier, before the element is attached to the DOM.
    // This can cause an error to be thrown in some browsers (IE/Edge) which assert that the
    // element has been inserted.
    if (newValue && this._isInitialized && element.blur) {
      // Normally, native input elements automatically blur if they turn disabled. This behavior
      // is problematic, because it would mean that it triggers another change detection cycle,
      // which then causes a changed after checked error if the input element was focused before.
      element.blur();
    }
  }
  _disabled;
  /** Emits when a `change` event is fired on this `<input>`. */
  dateChange = new EventEmitter();
  /** Emits when an `input` event is fired on this `<input>`. */
  dateInput = new EventEmitter();
  /** Emits when the internal state has changed */
  stateChanges = new Subject();
  _onTouched = () => {};
  _validatorOnChange = () => {};
  _cvaOnChange = () => {};
  _valueChangesSubscription = Subscription.EMPTY;
  _localeSubscription = Subscription.EMPTY;
  _translocoSubscription = Subscription.EMPTY;
  /**
   * Since the value is kept on the model which is assigned in an Input,
   * we might get a value before we have a model. This property keeps track
   * of the value until we have somewhere to assign it.
   */
  _pendingValue;
  /** The form control validator for whether the input parses. */
  _parseValidator = () => {
    return this._lastValueValid
      ? null
      : { datepickerParse: { text: this._elementRef.nativeElement.value } };
  };
  /** The form control validator for the date filter. */
  _filterValidator = (control) => {
    const controlValue = this._dateAdapter.getValidDateOrNull(
      this._dateAdapter.deserialize(control.value)
    );
    return !controlValue || this._matchesFilter(controlValue) ? null : { datepickerFilter: true };
  };
  /** The form control validator for the min date. */
  _minValidator = (control) => {
    const controlValue = this._dateAdapter.getValidDateOrNull(
      this._dateAdapter.deserialize(control.value)
    );
    const min = this._getMinDate();
    return !min || !controlValue || this._dateAdapter.compareDate(min, controlValue) <= 0
      ? null
      : { datepickerMin: { min: min, actual: controlValue } };
  };
  /** The form control validator for the max date. */
  _maxValidator = (control) => {
    const controlValue = this._dateAdapter.getValidDateOrNull(
      this._dateAdapter.deserialize(control.value)
    );
    const max = this._getMaxDate();
    return !max || !controlValue || this._dateAdapter.compareDate(max, controlValue) >= 0
      ? null
      : { datepickerMax: { max: max, actual: controlValue } };
  };
  /** Gets the base validator functions. */
  _getValidators() {
    return [this._parseValidator, this._minValidator, this._maxValidator, this._filterValidator];
  }
  /** Registers a date selection model with the input. */
  _registerModel(model) {
    this._model = model;
    this._valueChangesSubscription.unsubscribe();
    if (this._pendingValue) {
      this._assignValue(this._pendingValue);
    }
    this._valueChangesSubscription = this._model.selectionChanged.subscribe((event) => {
      if (this._shouldHandleChangeEvent(event)) {
        const value = this._getValueFromModel(event.selection);
        this._lastValueValid = this._isValidValue(value);
        this._cvaOnChange(value);
        this._onTouched();
        this._formatValue(value);
        this.dateInput.emit(new DatepickerInputEvent(this, this._elementRef.nativeElement));
        this.dateChange.emit(new DatepickerInputEvent(this, this._elementRef.nativeElement));
      }
    });
  }
  /** Whether the last value set on the input was valid. */
  _lastValueValid = false;
  constructor(
    _elementRef,
    _dateAdapter,
    _dateFormats
    // @Optional() private _transloco: TranslocoService
  ) {
    this._elementRef = _elementRef;
    this._dateAdapter = _dateAdapter;
    this._dateFormats = _dateFormats;
    if (!this._dateAdapter) {
      throw createMissingDateImplError('DateAdapter');
    }
    if (!this._dateFormats) {
      throw createMissingDateImplError('DATE_FORMATS');
    }
    // Update the displayed date when the locale changes.
    this._localeSubscription = _dateAdapter.localeChanges.subscribe(() => {
      this._assignValueProgrammatically(this.value);
    });
    // this._translocoSubscription = this._transloco.langChanges$.subscribe((lang) => {
    //   this._dateAdapter.setLocale(lang);
    // });
  }
  ngAfterViewInit() {
    this._isInitialized = true;
  }
  ngOnChanges(changes) {
    if (dateInputsHaveChanged(changes, this._dateAdapter)) {
      this.stateChanges.next(undefined);
    }
  }
  ngOnDestroy() {
    this._valueChangesSubscription.unsubscribe();
    this._localeSubscription.unsubscribe();
    this._translocoSubscription.unsubscribe();
    this.stateChanges.complete();
  }
  /** @docs-private */
  registerOnValidatorChange(fn) {
    this._validatorOnChange = fn;
  }
  /** @docs-private */
  validate(c) {
    return this._validator ? this._validator(c) : null;
  }
  // Implemented as part of ControlValueAccessor.
  writeValue(value) {
    this._assignValueProgrammatically(value);
  }
  // Implemented as part of ControlValueAccessor.
  registerOnChange(fn) {
    this._cvaOnChange = fn;
  }
  // Implemented as part of ControlValueAccessor.
  registerOnTouched(fn) {
    this._onTouched = fn;
  }
  // Implemented as part of ControlValueAccessor.
  setDisabledState(isDisabled) {
    this.disabled = isDisabled;
  }
  _onKeydown(event) {
    const ctrlShiftMetaModifiers = ['ctrlKey', 'shiftKey', 'metaKey'];
    const isAltDownArrow =
      hasModifierKey(event, 'altKey') &&
      event.keyCode === DOWN_ARROW &&
      ctrlShiftMetaModifiers.every((modifier) => !hasModifierKey(event, modifier));
    if (isAltDownArrow && !this._elementRef.nativeElement.readOnly) {
      this._openPopup();
      event.preventDefault();
    }
  }
  _onInput(value) {
    const lastValueWasValid = this._lastValueValid;
    let date = this._dateAdapter.parse(value, this._dateFormats.parse.dateInput);
    this._lastValueValid = this._isValidValue(date);
    date = this._dateAdapter.getValidDateOrNull(date);
    const hasChanged = !this._dateAdapter.sameDate(date, this.value);
    // We need to fire the CVA change event for all
    // nulls, otherwise the validators won't run.
    if (!date || hasChanged) {
      this._cvaOnChange(date);
    } else {
      // Call the CVA change handler for invalid values
      // since this is what marks the control as dirty.
      if (value && !this.value) {
        this._cvaOnChange(date);
      }
      if (lastValueWasValid !== this._lastValueValid) {
        this._validatorOnChange();
      }
    }
    if (hasChanged) {
      this._assignValue(date);
      this.dateInput.emit(new DatepickerInputEvent(this, this._elementRef.nativeElement));
    }
  }
  _onChange() {
    this.dateChange.emit(new DatepickerInputEvent(this, this._elementRef.nativeElement));
  }
  /** Handles blur events on the input. */
  _onBlur() {
    // Reformat the input only if we have a valid value.
    if (this.value) {
      this._formatValue(this.value);
    }
    this._onTouched();
  }
  /** Formats a value and sets it on the input element. */
  _formatValue(value) {
    this._elementRef.nativeElement.value =
      value != null ? this._dateAdapter.format(value, this._dateFormats.display.dateInput) : '';
  }
  /** Assigns a value to the model. */
  _assignValue(value) {
    // We may get some incoming values before the model was
    // assigned. Save the value so that we can assign it later.
    if (this._model) {
      this._assignValueToModel(value);
      this._pendingValue = null;
    } else {
      this._pendingValue = value;
    }
  }
  /** Whether a value is considered valid. */
  _isValidValue(value) {
    return !value || this._dateAdapter.isValid(value);
  }
  /**
   * Checks whether a parent control is disabled. This is in place so that it can be overridden
   * by inputs extending this one which can be placed inside of a group that can be disabled.
   */
  _parentDisabled() {
    return false;
  }
  /** Programmatically assigns a value to the input. */
  _assignValueProgrammatically(value) {
    value = this._dateAdapter.deserialize(value);
    this._lastValueValid = this._isValidValue(value);
    value = this._dateAdapter.getValidDateOrNull(value);
    this._assignValue(value);
    this._formatValue(value);
  }
  /** Gets whether a value matches the current date filter. */
  _matchesFilter(value) {
    const filter = this._getDateFilter();
    return !filter || filter(value);
  }
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: '12.0.0',
    version: '18.2.13',
    ngImport: i0,
    type: DatepickerInputBase,
    deps: [
      { token: i0.ElementRef },
      { token: i1.DateAdapter, optional: true },
      { token: DATE_FORMATS, optional: true },
    ],
    target: i0.ɵɵFactoryTarget.Directive,
  });
  static ɵdir = i0.ɵɵngDeclareDirective({
    minVersion: '16.1.0',
    version: '18.2.13',
    type: DatepickerInputBase,
    isStandalone: true,
    inputs: { value: 'value', disabled: ['disabled', 'disabled', booleanAttribute] },
    outputs: { dateChange: 'dateChange', dateInput: 'dateInput' },
    usesOnChanges: true,
    ngImport: i0,
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: '12.0.0',
  version: '18.2.13',
  ngImport: i0,
  type: DatepickerInputBase,
  decorators: [
    {
      type: Directive,
      args: [{ standalone: true }],
    },
  ],
  ctorParameters: () => [
    { type: i0.ElementRef },
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
  ],
  propDecorators: {
    value: [
      {
        type: Input,
      },
    ],
    disabled: [
      {
        type: Input,
        args: [{ transform: booleanAttribute }],
      },
    ],
    dateChange: [
      {
        type: Output,
      },
    ],
    dateInput: [
      {
        type: Output,
      },
    ],
  },
});
/**
 * Checks whether the `SimpleChanges` object from an `ngOnChanges`
 * callback has any changes, accounting for date objects.
 */
export function dateInputsHaveChanged(changes, adapter) {
  const keys = Object.keys(changes);
  for (const key of keys) {
    const { previousValue, currentValue } = changes[key];
    if (adapter.isDateInstance(previousValue) && adapter.isDateInstance(currentValue)) {
      if (!adapter.sameDate(previousValue, currentValue)) {
        return true;
      }
    } else {
      return true;
    }
  }
  return false;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZXBpY2tlci1pbnB1dC1iYXNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vbGlicy9kYXRlLXBpY2tlci9zcmMvbGliL2RhdGUtcGlja2VyL2RhdGVwaWNrZXItaW5wdXQtYmFzZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUUsVUFBVSxFQUFFLGNBQWMsRUFBZSxNQUFNLHVCQUF1QixDQUFDO0FBRWhGLE9BQU8sRUFDTCxTQUFTLEVBRVQsWUFBWSxFQUNaLE1BQU0sRUFDTixLQUFLLEVBRUwsUUFBUSxFQUNSLE1BQU0sRUFJTixnQkFBZ0IsR0FDakIsTUFBTSxlQUFlLENBQUM7QUFVdkIsT0FBTyxFQUFFLFlBQVksRUFBRSxPQUFPLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFFN0MsT0FBTyxFQUFFLDBCQUEwQixFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDN0QsT0FBTyxFQUFlLFlBQVksRUFBZSxNQUFNLFlBQVksQ0FBQzs7O0FBT3BFOzs7O0dBSUc7QUFDSCxNQUFNLE9BQU8sb0JBQW9CO0lBTXRCO0lBRUE7SUFQVCxxREFBcUQ7SUFDckQsS0FBSyxDQUFXO0lBRWhCO0lBQ0UsMEVBQTBFO0lBQ25FLE1BQWlDO0lBQ3hDLGtGQUFrRjtJQUMzRSxhQUEwQjtRQUYxQixXQUFNLEdBQU4sTUFBTSxDQUEyQjtRQUVqQyxrQkFBYSxHQUFiLGFBQWEsQ0FBYTtRQUVqQyxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDO0lBQ2pDLENBQUM7Q0FDRjtBQUtELHdDQUF3QztBQUV4QyxNQUFNLE9BQWdCLG1CQUFtQjtJQW1LM0I7SUFDUztJQUN1QjtJQWxLNUMsa0RBQWtEO0lBQzFDLGNBQWMsQ0FBVTtJQUVoQyw4QkFBOEI7SUFDOUIsSUFDSSxLQUFLO1FBQ1AsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJ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TTs7QUE4UlQ7OztHQUdHO0FBQ0gsTUFBTSxVQUFVLHFCQUFxQixDQUNuQyxPQUFzQixFQUN0QixPQUE2QjtJQUU3QixNQUFNLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBRWxDLEtBQUssTUFBTSxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7UUFDdkIsTUFBTSxFQUFFLGFBQWEsRUFBRSxZQUFZLEVBQUUsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFckQsSUFBSSxPQUFPLENBQUMsY0FBYyxDQUFDLGFBQWEsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxjQUFjLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQztZQUNsRixJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxhQUFhLEVBQUUsWUFBWSxDQUFDLEVBQUUsQ0FBQztnQkFDbkQsT0FBTyxJQUFJLENBQUM7WUFDZCxDQUFDO1FBQ0gsQ0FBQzthQUFNLENBQUM7WUFDTixPQUFPLElBQUksQ0FBQztRQUNkLENBQUM7SUFDSCxDQUFDO0lBRUQsT0FBTyxLQUFLLENBQUM7QUFDZixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7IERPV05fQVJST1csIGhhc01vZGlmaWVyS2V5LCBNb2RpZmllcktleSB9IGZyb20gJ0Bhbmd1bGFyL2Nkay9rZXljb2Rlcyc7XG5cbmltcG9ydCB7XG4gIERpcmVjdGl2ZSxcbiAgRWxlbWVudFJlZixcbiAgRXZlbnRFbWl0dGVyLFxuICBJbmplY3QsXG4gIElucHV0LFxuICBPbkRlc3Ryb3ksXG4gIE9wdGlvbmFsLFxuICBPdXRwdXQsXG4gIEFmdGVyVmlld0luaXQsXG4gIE9uQ2hhbmdlcyxcbiAgU2ltcGxlQ2hhbmdlcyxcbiAgYm9vbGVhbkF0dHJpYnV0ZSxcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7XG4gIEFic3RyYWN0Q29udHJvbCxcbiAgQ29udHJvbFZhbHVlQWNjZXNzb3IsXG4gIFZhbGlkYXRpb25FcnJvcnMsXG4gIFZhbGlkYXRvcixcbiAgVmFsaWRhdG9yRm4sXG59IGZyb20gJ0Bhbmd1bGFyL2Zvcm1zJztcblxuaW1wb3J0IHsgU3Vic2NyaXB0aW9uLCBTdWJqZWN0IH0gZnJvbSAncnhqcyc7XG5cbmltcG9ydCB7IGNyZWF0ZU1pc3NpbmdEYXRlSW1wbEVycm9yIH0gZnJvbSAnLi4vdXRpbHMvZXJyb3JzJztcbmltcG9ydCB7IERhdGVBZGFwdGVyLCBEQVRFX0ZPUk1BVFMsIERhdGVGb3JtYXRzIH0gZnJvbSAnLi4vYWRhcHRlcic7XG5pbXBvcnQge1xuICBFeHRyYWN0RGF0ZVR5cGVGcm9tU2VsZWN0aW9uLFxuICBEYXRlU2VsZWN0aW9uTW9kZWwsXG4gIERhdGVTZWxlY3Rpb25Nb2RlbENoYW5nZSxcbn0gZnJvbSAnLi9kYXRlLXNlbGVjdGlvbi1tb2RlbCc7XG5cbi8qKlxuICogQW4gZXZlbnQgdXNlZCBmb3IgZGF0ZXBpY2tlciBpbnB1dCBhbmQgY2hhbmdlIGV2ZW50cy4gV2UgZG9uJ3QgYWx3YXlzIGhhdmUgYWNjZXNzIHRvIGEgbmF0aXZlXG4gKiBpbnB1dCBvciBjaGFuZ2UgZXZlbnQgYmVjYXVzZSB0aGUgZXZlbnQgbWF5IGhhdmUgYmVlbiB0cmlnZ2VyZWQgYnkgdGhlIHVzZXIgY2xpY2tpbmcgb24gdGhlXG4gKiBjYWxlbmRhciBwb3B1cC4gRm9yIGNvbnNpc3RlbmN5LCB3ZSBhbHdheXMgdXNlIGRhdGVwaWNrZXJJbnB1dEV2ZW50IGluc3RlYWQuXG4gKi9cbmV4cG9ydCBjbGFzcyBEYXRlcGlja2VySW5wdXRFdmVudDxELCBTID0gdW5rbm93bj4ge1xuICAvKiogVGhlIG5ldyB2YWx1ZSBmb3IgdGhlIHRhcmdldCBkYXRlcGlja2VyIGlucHV0LiAqL1xuICB2YWx1ZTogRCB8IG51bGw7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgLyoqIFJlZmVyZW5jZSB0byB0aGUgZGF0ZXBpY2tlciBpbnB1dCBjb21wb25lbnQgdGhhdCBlbWl0dGVkIHRoZSBldmVudC4gKi9cbiAgICBwdWJsaWMgdGFyZ2V0OiBEYXRlcGlja2VySW5wdXRCYXNlPFMsIEQ+LFxuICAgIC8qKiBSZWZlcmVuY2UgdG8gdGhlIG5hdGl2ZSBpbnB1dCBlbGVtZW50IGFzc29jaWF0ZWQgd2l0aCB0aGUgZGF0ZXBpY2tlciBpbnB1dC4gKi9cbiAgICBwdWJsaWMgdGFyZ2V0RWxlbWVudDogSFRNTEVsZW1lbnRcbiAgKSB7XG4gICAgdGhpcy52YWx1ZSA9IHRoaXMudGFyZ2V0LnZhbHVlO1xuICB9XG59XG5cbi8qKiBGdW5jdGlvbiB0aGF0IGNhbiBiZSB1c2VkIHRvIGZpbHRlciBvdXQgZGF0ZXMgZnJvbSBhIGNhbGVuZGFyLiAqL1xuZXhwb3J0IHR5cGUgRGF0ZUZpbHRlckZuPEQ+ID0gKGRhdGU6IEQgfCBudWxsKSA9PiBib29sZWFuO1xuXG4vKiogQmFzZSBjbGFzcyBmb3IgZGF0ZXBpY2tlciBpbnB1dHMuICovXG5ARGlyZWN0aXZlKHsgc3RhbmRhbG9uZTogdHJ1ZSB9KVxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIERhdGVwaWNrZXJJbnB1dEJhc2U8UywgRCA9IEV4dHJhY3REYXRlVHlwZUZyb21TZWxlY3Rpb248Uz4+XG4gIGltcGxlbWVudHMgQ29udHJvbFZhbHVlQWNjZXNzb3IsIEFmdGVyVmlld0luaXQsIE9uQ2hhbmdlcywgT25EZXN0cm95LCBWYWxpZGF0b3JcbntcbiAgLyoqIFdoZXRoZXIgdGhlIGNvbXBvbmVudCBoYXMgYmVlbiBpbml0aWFsaXplZC4gKi9cbiAgcHJpdmF0ZSBfaXNJbml0aWFsaXplZDogYm9vbGVhbjtcblxuICAvKiogVGhlIHZhbHVlIG9mIHRoZSBpbnB1dC4gKi9cbiAgQElucHV0KClcbiAgZ2V0IHZhbHVlKCk6IEQgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5fbW9kZWwgPyB0aGlzLl9nZXRWYWx1ZUZyb21Nb2RlbCh0aGlzLl9tb2RlbC5zZWxlY3Rpb24pIDogdGhpcy5fcGVuZGluZ1ZhbHVlO1xuICB9XG4gIHNldCB2YWx1ZSh2YWx1ZTogYW55KSB7XG4gICAgdGhpcy5fYXNzaWduVmFsdWVQcm9ncmFtbWF0aWNhbGx5KHZhbHVlKTtcbiAgfVxuICBwcm90ZWN0ZWQgX21vZGVsOiBEYXRlU2VsZWN0aW9uTW9kZWw8UywgRD4gfCB1bmRlZmluZWQ7XG5cbiAgLyoqIFdoZXRoZXIgdGhlIGRhdGVwaWNrZXItaW5wdXQgaXMgZGlzYWJsZWQuICovXG4gIEBJbnB1dCh7IHRyYW5zZm9ybTogYm9vbGVhbkF0dHJpYnV0ZSB9KVxuICBnZXQgZGlzYWJsZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuICEhdGhpcy5fZGlzYWJsZWQgfHwgdGhpcy5fcGFyZW50RGlzYWJsZWQoKTtcbiAgfVxuICBzZXQgZGlzYWJsZWQodmFsdWU6IGJvb2xlYW4pIHtcbiAgICBjb25zdCBuZXdWYWx1ZSA9IHZhbHVlO1xuICAgIGNvbnN0IGVsZW1lbnQgPSB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQ7XG5cbiAgICBpZiAodGhpcy5fZGlzYWJsZWQgIT09IG5ld1ZhbHVlKSB7XG4gICAgICB0aGlzLl9kaXNhYmxlZCA9IG5ld1ZhbHVlO1xuICAgICAgdGhpcy5zdGF0ZUNoYW5nZXMubmV4dCh1bmRlZmluZWQpO1xuICAgIH1cblxuICAgIC8vIFdlIG5lZWQgdG8gbnVsbCBjaGVjayB0aGUgYGJsdXJgIG1ldGhvZCwgYmVjYXVzZSBpdCdzIHVuZGVmaW5lZCBkdXJpbmcgU1NSLlxuICAgIC8vIEluIEl2eSBzdGF0aWMgYmluZGluZ3MgYXJlIGludm9rZWQgZWFybGllciwgYmVmb3JlIHRoZSBlbGVtZW50IGlzIGF0dGFjaGVkIHRvIHRoZSBET00uXG4gICAgLy8gVGhpcyBjYW4gY2F1c2UgYW4gZXJyb3IgdG8gYmUgdGhyb3duIGluIHNvbWUgYnJvd3NlcnMgKElFL0VkZ2UpIHdoaWNoIGFzc2VydCB0aGF0IHRoZVxuICAgIC8vIGVsZW1lbnQgaGFzIGJlZW4gaW5zZXJ0ZWQuXG4gICAgaWYgKG5ld1ZhbHVlICYmIHRoaXMuX2lzSW5pdGlhbGl6ZWQgJiYgZWxlbWVudC5ibHVyKSB7XG4gICAgICAvLyBOb3JtYWxseSwgbmF0aXZlIGlucHV0IGVsZW1lbnRzIGF1dG9tYXRpY2FsbHkgYmx1ciBpZiB0aGV5IHR1cm4gZGlzYWJsZWQuIFRoaXMgYmVoYXZpb3JcbiAgICAgIC8vIGlzIHByb2JsZW1hdGljLCBiZWNhdXNlIGl0IHdvdWxkIG1lYW4gdGhhdCBpdCB0cmlnZ2VycyBhbm90aGVyIGNoYW5nZSBkZXRlY3Rpb24gY3ljbGUsXG4gICAgICAvLyB3aGljaCB0aGVuIGNhdXNlcyBhIGNoYW5nZWQgYWZ0ZXIgY2hlY2tlZCBlcnJvciBpZiB0aGUgaW5wdXQgZWxlbWVudCB3YXMgZm9jdXNlZCBiZWZvcmUuXG4gICAgICBlbGVtZW50LmJsdXIoKTtcbiAgICB9XG4gIH1cbiAgcHJpdmF0ZSBfZGlzYWJsZWQ6IGJvb2xlYW47XG5cbiAgLyoqIEVtaXRzIHdoZW4gYSBgY2hhbmdlYCBldmVudCBpcyBmaXJlZCBvbiB0aGlzIGA8aW5wdXQ+YC4gKi9cbiAgQE91dHB1dCgpIHJlYWRvbmx5IGRhdGVDaGFuZ2U6IEV2ZW50RW1pdHRlcjxEYXRlcGlja2VySW5wdXRFdmVudDxELCBTPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFxuICAgIERhdGVwaWNrZXJJbnB1dEV2ZW50PEQsIFM+XG4gID4oKTtcblxuICAvKiogRW1pdHMgd2hlbiBhbiBgaW5wdXRgIGV2ZW50IGlzIGZpcmVkIG9uIHRoaXMgYDxpbnB1dD5gLiAqL1xuICBAT3V0cHV0KCkgcmVhZG9ubHkgZGF0ZUlucHV0OiBFdmVudEVtaXR0ZXI8RGF0ZXBpY2tlcklucHV0RXZlbnQ8RCwgUz4+ID0gbmV3IEV2ZW50RW1pdHRlcjxcbiAgICBEYXRlcGlja2VySW5wdXRFdmVudDxELCBTPlxuICA+KCk7XG5cbiAgLyoqIEVtaXRzIHdoZW4gdGhlIGludGVybmFsIHN0YXRlIGhhcyBjaGFuZ2VkICovXG4gIHJlYWRvbmx5IHN0YXRlQ2hhbmdlcyA9IG5ldyBTdWJqZWN0PHZvaWQ+KCk7XG5cbiAgX29uVG91Y2hlZCA9ICgpID0+IHt9O1xuICBfdmFsaWRhdG9yT25DaGFuZ2UgPSAoKSA9PiB7fTtcblxuICBwcml2YXRlIF9jdmFPbkNoYW5nZTogKHZhbHVlOiBhbnkpID0+IHZvaWQgPSAoKSA9PiB7fTtcbiAgcHJpdmF0ZSBfdmFsdWVDaGFuZ2VzU3Vic2NyaXB0aW9uID0gU3Vic2NyaXB0aW9uLkVNUFRZO1xuICBwcml2YXRlIF9sb2NhbGVTdWJzY3JpcHRpb24gPSBTdWJzY3JpcHRpb24uRU1QVFk7XG4gIHByaXZhdGUgX3RyYW5zbG9jb1N1YnNjcmlwdGlvbiA9IFN1YnNjcmlwdGlvbi5FTVBUWTtcblxuICAvKipcbiAgICogU2luY2UgdGhlIHZhbHVlIGlzIGtlcHQgb24gdGhlIG1vZGVsIHdoaWNoIGlzIGFzc2lnbmVkIGluIGFuIElucHV0LFxuICAgKiB3ZSBtaWdodCBnZXQgYSB2YWx1ZSBiZWZvcmUgd2UgaGF2ZSBhIG1vZGVsLiBUaGlzIHByb3BlcnR5IGtlZXBzIHRyYWNrXG4gICAqIG9mIHRoZSB2YWx1ZSB1bnRpbCB3ZSBoYXZlIHNvbWV3aGVyZSB0byBhc3NpZ24gaXQuXG4gICAqL1xuICBwcml2YXRlIF9wZW5kaW5nVmFsdWU6IEQgfCBudWxsO1xuXG4gIC8qKiBUaGUgZm9ybSBjb250cm9sIHZhbGlkYXRvciBmb3Igd2hldGhlciB0aGUgaW5wdXQgcGFyc2VzLiAqL1xuICBwcml2YXRlIF9wYXJzZVZhbGlkYXRvcjogVmFsaWRhdG9yRm4gPSAoKTogVmFsaWRhdGlvbkVycm9ycyB8IG51bGwgPT4ge1xuICAgIHJldHVybiB0aGlzLl9sYXN0VmFsdWVWYWxpZFxuICAgICAgPyBudWxsXG4gICAgICA6IHsgZGF0ZXBpY2tlclBhcnNlOiB7IHRleHQ6IHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudC52YWx1ZSB9IH07XG4gIH07XG5cbiAgLyoqIFRoZSBmb3JtIGNvbnRyb2wgdmFsaWRhdG9yIGZvciB0aGUgZGF0ZSBmaWx0ZXIuICovXG4gIHByaXZhdGUgX2ZpbHRlclZhbGlkYXRvcjogVmFsaWRhdG9yRm4gPSAoY29udHJvbDogQWJzdHJhY3RDb250cm9sKTogVmFsaWRhdGlvbkVycm9ycyB8IG51bGwgPT4ge1xuICAgIGNvbnN0IGNvbnRyb2xWYWx1ZSA9IHRoaXMuX2RhdGVBZGFwdGVyLmdldFZhbGlkRGF0ZU9yTnVsbChcbiAgICAgIHRoaXMuX2RhdGVBZGFwdGVyLmRlc2VyaWFsaXplKGNvbnRyb2wudmFsdWUpXG4gICAgKTtcbiAgICByZXR1cm4gIWNvbnRyb2xWYWx1ZSB8fCB0aGlzLl9tYXRjaGVzRmlsdGVyKGNvbnRyb2xWYWx1ZSkgPyBudWxsIDogeyBkYXRlcGlja2VyRmlsdGVyOiB0cnVlIH07XG4gIH07XG5cbiAgLyoqIFRoZSBmb3JtIGNvbnRyb2wgdmFsaWRhdG9yIGZvciB0aGUgbWluIGRhdGUuICovXG4gIHByaXZhdGUgX21pblZhbGlkYXRvcjogVmFsaWRhdG9yRm4gPSAoY29udHJvbDogQWJzdHJhY3RDb250cm9sKTogVmFsaWRhdGlvbkVycm9ycyB8IG51bGwgPT4ge1xuICAgIGNvbnN0IGNvbnRyb2xWYWx1ZSA9IHRoaXMuX2RhdGVBZGFwdGVyLmdldFZhbGlkRGF0ZU9yTnVsbChcbiAgICAgIHRoaXMuX2RhdGVBZGFwdGVyLmRlc2VyaWFsaXplKGNvbnRyb2wudmFsdWUpXG4gICAgKTtcbiAgICBjb25zdCBtaW4gPSB0aGlzLl9nZXRNaW5EYXRlKCk7XG4gICAgcmV0dXJuICFtaW4gfHwgIWNvbnRyb2xWYWx1ZSB8fCB0aGlzLl9kYXRlQWRhcHRlci5jb21wYXJlRGF0ZShtaW4sIGNvbnRyb2xWYWx1ZSkgPD0gMFxuICAgICAgPyBudWxsXG4gICAgICA6IHsgZGF0ZXBpY2tlck1pbjogeyBtaW46IG1pbiwgYWN0dWFsOiBjb250cm9sVmFsdWUgfSB9O1xuICB9O1xuXG4gIC8qKiBUaGUgZm9ybSBjb250cm9sIHZhbGlkYXRvciBmb3IgdGhlIG1heCBkYXRlLiAqL1xuICBwcml2YXRlIF9tYXhWYWxpZGF0b3I6IFZhbGlkYXRvckZuID0gKGNvbnRyb2w6IEFic3RyYWN0Q29udHJvbCk6IFZhbGlkYXRpb25FcnJvcnMgfCBudWxsID0+IHtcbiAgICBjb25zdCBjb250cm9sVmFsdWUgPSB0aGlzLl9kYXRlQWRhcHRlci5nZXRWYWxpZERhdGVPck51bGwoXG4gICAgICB0aGlzLl9kYXRlQWRhcHRlci5kZXNlcmlhbGl6ZShjb250cm9sLnZhbHVlKVxuICAgICk7XG4gICAgY29uc3QgbWF4ID0gdGhpcy5fZ2V0TWF4RGF0ZSgpO1xuICAgIHJldHVybiAhbWF4IHx8ICFjb250cm9sVmFsdWUgfHwgdGhpcy5fZGF0ZUFkYXB0ZXIuY29tcGFyZURhdGUobWF4LCBjb250cm9sVmFsdWUpID49IDBcbiAgICAgID8gbnVsbFxuICAgICAgOiB7IGRhdGVwaWNrZXJNYXg6IHsgbWF4OiBtYXgsIGFjdHVhbDogY29udHJvbFZhbHVlIH0gfTtcbiAgfTtcblxuICAvKiogR2V0cyB0aGUgYmFzZSB2YWxpZGF0b3IgZnVuY3Rpb25zLiAqL1xuICBwcm90ZWN0ZWQgX2dldFZhbGlkYXRvcnMoKTogVmFsaWRhdG9yRm5bXSB7XG4gICAgcmV0dXJuIFt0aGlzLl9wYXJzZVZhbGlkYXRvciwgdGhpcy5fbWluVmFsaWRhdG9yLCB0aGlzLl9tYXhWYWxpZGF0b3IsIHRoaXMuX2ZpbHRlclZhbGlkYXRvcl07XG4gIH1cblxuICAvKiogR2V0cyB0aGUgbWluaW11bSBkYXRlIGZvciB0aGUgaW5wdXQuIFVzZWQgZm9yIHZhbGlkYXRpb24uICovXG4gIGFic3RyYWN0IF9nZXRNaW5EYXRlKCk6IEQgfCBudWxsO1xuXG4gIC8qKiBHZXRzIHRoZSBtYXhpbXVtIGRhdGUgZm9yIHRoZSBpbnB1dC4gVXNlZCBmb3IgdmFsaWRhdGlvbi4gKi9cbiAgYWJzdHJhY3QgX2dldE1heERhdGUoKTogRCB8IG51bGw7XG5cbiAgLyoqIEdldHMgdGhlIGRhdGUgZmlsdGVyIGZ1bmN0aW9uLiBVc2VkIGZvciB2YWxpZGF0aW9uLiAqL1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgX2dldERhdGVGaWx0ZXIoKTogRGF0ZUZpbHRlckZuPEQ+IHwgdW5kZWZpbmVkO1xuXG4gIC8qKiBSZWdpc3RlcnMgYSBkYXRlIHNlbGVjdGlvbiBtb2RlbCB3aXRoIHRoZSBpbnB1dC4gKi9cbiAgX3JlZ2lzdGVyTW9kZWwobW9kZWw6IERhdGVTZWxlY3Rpb25Nb2RlbDxTLCBEPik6IHZvaWQge1xuICAgIHRoaXMuX21vZGVsID0gbW9kZWw7XG4gICAgdGhpcy5fdmFsdWVDaGFuZ2VzU3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XG5cbiAgICBpZiAodGhpcy5fcGVuZGluZ1ZhbHVlKSB7XG4gICAgICB0aGlzLl9hc3NpZ25WYWx1ZSh0aGlzLl9wZW5kaW5nVmFsdWUpO1xuICAgIH1cblxuICAgIHRoaXMuX3ZhbHVlQ2hhbmdlc1N1YnNjcmlwdGlvbiA9IHRoaXMuX21vZGVsLnNlbGVjdGlvbkNoYW5nZWQuc3Vic2NyaWJlKChldmVudCkgPT4ge1xuICAgICAgaWYgKHRoaXMuX3Nob3VsZEhhbmRsZUNoYW5nZUV2ZW50KGV2ZW50KSkge1xuICAgICAgICBjb25zdCB2YWx1ZSA9IHRoaXMuX2dldFZhbHVlRnJvbU1vZGVsKGV2ZW50LnNlbGVjdGlvbik7XG4gICAgICAgIHRoaXMuX2xhc3RWYWx1ZVZhbGlkID0gdGhpcy5faXNWYWxpZFZhbHVlKHZhbHVlKTtcbiAgICAgICAgdGhpcy5fY3ZhT25DaGFuZ2UodmFsdWUpO1xuICAgICAgICB0aGlzLl9vblRvdWNoZWQoKTtcbiAgICAgICAgdGhpcy5fZm9ybWF0VmFsdWUodmFsdWUpO1xuICAgICAgICB0aGlzLmRhdGVJbnB1dC5lbWl0KG5ldyBEYXRlcGlja2VySW5wdXRFdmVudCh0aGlzLCB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQpKTtcbiAgICAgICAgdGhpcy5kYXRlQ2hhbmdlLmVtaXQobmV3IERhdGVwaWNrZXJJbnB1dEV2ZW50KHRoaXMsIHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudCkpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqIE9wZW5zIHRoZSBwb3B1cCBhc3NvY2lhdGVkIHdpdGggdGhlIGlucHV0LiAqL1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgX29wZW5Qb3B1cCgpOiB2b2lkO1xuXG4gIC8qKiBBc3NpZ25zIGEgdmFsdWUgdG8gdGhlIGlucHV0J3MgbW9kZWwuICovXG4gIHByb3RlY3RlZCBhYnN0cmFjdCBfYXNzaWduVmFsdWVUb01vZGVsKG1vZGVsOiBEIHwgbnVsbCk6IHZvaWQ7XG5cbiAgLyoqIENvbnZlcnRzIGEgdmFsdWUgZnJvbSB0aGUgbW9kZWwgaW50byBhIG5hdGl2ZSB2YWx1ZSBmb3IgdGhlIGlucHV0LiAqL1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgX2dldFZhbHVlRnJvbU1vZGVsKG1vZGVsVmFsdWU6IFMpOiBEIHwgbnVsbDtcblxuICAvKiogQ29tYmluZWQgZm9ybSBjb250cm9sIHZhbGlkYXRvciBmb3IgdGhpcyBpbnB1dC4gKi9cbiAgcHJvdGVjdGVkIGFic3RyYWN0IF92YWxpZGF0b3I6IFZhbGlkYXRvckZuIHwgbnVsbDtcblxuICAvKiogUHJlZGljYXRlIHRoYXQgZGV0ZXJtaW5lcyB3aGV0aGVyIHRoZSBpbnB1dCBzaG91bGQgaGFuZGxlIGEgcGFydGljdWxhciBjaGFuZ2UgZXZlbnQuICovXG4gIHByb3RlY3RlZCBhYnN0cmFjdCBfc2hvdWxkSGFuZGxlQ2hhbmdlRXZlbnQoZXZlbnQ6IERhdGVTZWxlY3Rpb25Nb2RlbENoYW5nZTxTPik6IGJvb2xlYW47XG5cbiAgLyoqIFdoZXRoZXIgdGhlIGxhc3QgdmFsdWUgc2V0IG9uIHRoZSBpbnB1dCB3YXMgdmFsaWQuICovXG4gIHByb3RlY3RlZCBfbGFzdFZhbHVlVmFsaWQgPSBmYWxzZTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcm90ZWN0ZWQgX2VsZW1lbnRSZWY6IEVsZW1lbnRSZWY8SFRNTElucHV0RWxlbWVudD4sXG4gICAgQE9wdGlvbmFsKCkgcHVibGljIF9kYXRlQWRhcHRlcjogRGF0ZUFkYXB0ZXI8RD4sXG4gICAgQE9wdGlvbmFsKCkgQEluamVjdChEQVRFX0ZPUk1BVFMpIHByaXZhdGUgX2RhdGVGb3JtYXRzOiBEYXRlRm9ybWF0c1xuICAgIC8vIEBPcHRpb25hbCgpIHByaXZhdGUgX3RyYW5zbG9jbzogVHJhbnNsb2NvU2VydmljZVxuICApIHtcbiAgICBpZiAoIXRoaXMuX2RhdGVBZGFwdGVyKSB7XG4gICAgICB0aHJvdyBjcmVhdGVNaXNzaW5nRGF0ZUltcGxFcnJvcignRGF0ZUFkYXB0ZXInKTtcbiAgICB9XG4gICAgaWYgKCF0aGlzLl9kYXRlRm9ybWF0cykge1xuICAgICAgdGhyb3cgY3JlYXRlTWlzc2luZ0RhdGVJbXBsRXJyb3IoJ0RBVEVfRk9STUFUUycpO1xuICAgIH1cblxuICAgIC8vIFVwZGF0ZSB0aGUgZGlzcGxheWVkIGRhdGUgd2hlbiB0aGUgbG9jYWxlIGNoYW5nZXMuXG4gICAgdGhpcy5fbG9jYWxlU3Vic2NyaXB0aW9uID0gX2RhdGVBZGFwdGVyLmxvY2FsZUNoYW5nZXMuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgIHRoaXMuX2Fzc2lnblZhbHVlUHJvZ3JhbW1hdGljYWxseSh0aGlzLnZhbHVlKTtcbiAgICB9KTtcblxuICAgIC8vIHRoaXMuX3RyYW5zbG9jb1N1YnNjcmlwdGlvbiA9IHRoaXMuX3RyYW5zbG9jby5sYW5nQ2hhbmdlcyQuc3Vic2NyaWJlKChsYW5nKSA9PiB7XG4gICAgLy8gICB0aGlzLl9kYXRlQWRhcHRlci5zZXRMb2NhbGUobGFuZyk7XG4gICAgLy8gfSk7XG4gIH1cblxuICBuZ0FmdGVyVmlld0luaXQoKSB7XG4gICAgdGhpcy5faXNJbml0aWFsaXplZCA9IHRydWU7XG4gIH1cblxuICBuZ09uQ2hhbmdlcyhjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKSB7XG4gICAgaWYgKGRhdGVJbnB1dHNIYXZlQ2hhbmdlZChjaGFuZ2VzLCB0aGlzLl9kYXRlQWRhcHRlcikpIHtcbiAgICAgIHRoaXMuc3RhdGVDaGFuZ2VzLm5leHQodW5kZWZpbmVkKTtcbiAgICB9XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICB0aGlzLl92YWx1ZUNoYW5nZXNTdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcbiAgICB0aGlzLl9sb2NhbGVTdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcbiAgICB0aGlzLl90cmFuc2xvY29TdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcbiAgICB0aGlzLnN0YXRlQ2hhbmdlcy5jb21wbGV0ZSgpO1xuICB9XG5cbiAgLyoqIEBkb2NzLXByaXZhdGUgKi9cbiAgcmVnaXN0ZXJPblZhbGlkYXRvckNoYW5nZShmbjogKCkgPT4gdm9pZCk6IHZvaWQge1xuICAgIHRoaXMuX3ZhbGlkYXRvck9uQ2hhbmdlID0gZm47XG4gIH1cblxuICAvKiogQGRvY3MtcHJpdmF0ZSAqL1xuICB2YWxpZGF0ZShjOiBBYnN0cmFjdENvbnRyb2wpOiBWYWxpZGF0aW9uRXJyb3JzIHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuX3ZhbGlkYXRvciA/IHRoaXMuX3ZhbGlkYXRvcihjKSA6IG51bGw7XG4gIH1cblxuICAvLyBJbXBsZW1lbnRlZCBhcyBwYXJ0IG9mIENvbnRyb2xWYWx1ZUFjY2Vzc29yLlxuICB3cml0ZVZhbHVlKHZhbHVlOiBEKTogdm9pZCB7XG4gICAgdGhpcy5fYXNzaWduVmFsdWVQcm9ncmFtbWF0aWNhbGx5KHZhbHVlKTtcbiAgfVxuXG4gIC8vIEltcGxlbWVudGVkIGFzIHBhcnQgb2YgQ29udHJvbFZhbHVlQWNjZXNzb3IuXG4gIHJlZ2lzdGVyT25DaGFuZ2UoZm46ICh2YWx1ZTogYW55KSA9PiB2b2lkKTogdm9pZCB7XG4gICAgdGhpcy5fY3ZhT25DaGFuZ2UgPSBmbjtcbiAgfVxuXG4gIC8vIEltcGxlbWVudGVkIGFzIHBhcnQgb2YgQ29udHJvbFZhbHVlQWNjZXNzb3IuXG4gIHJlZ2lzdGVyT25Ub3VjaGVkKGZuOiAoKSA9PiB2b2lkKTogdm9pZCB7XG4gICAgdGhpcy5fb25Ub3VjaGVkID0gZm47XG4gIH1cblxuICAvLyBJbXBsZW1lbnRlZCBhcyBwYXJ0IG9mIENvbnRyb2xWYWx1ZUFjY2Vzc29yLlxuICBzZXREaXNhYmxlZFN0YXRlKGlzRGlzYWJsZWQ6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICB0aGlzLmRpc2FibGVkID0gaXNEaXNhYmxlZDtcbiAgfVxuXG4gIF9vbktleWRvd24oZXZlbnQ6IEtleWJvYXJkRXZlbnQpIHtcbiAgICBjb25zdCBjdHJsU2hpZnRNZXRhTW9kaWZpZXJzOiBNb2RpZmllcktleVtdID0gWydjdHJsS2V5JywgJ3NoaWZ0S2V5JywgJ21ldGFLZXknXTtcbiAgICBjb25zdCBpc0FsdERvd25BcnJvdyA9XG4gICAgICBoYXNNb2RpZmllcktleShldmVudCwgJ2FsdEtleScpICYmXG4gICAgICBldmVudC5rZXlDb2RlID09PSBET1dOX0FSUk9XICYmXG4gICAgICBjdHJsU2hpZnRNZXRhTW9kaWZpZXJzLmV2ZXJ5KChtb2RpZmllcjogTW9kaWZpZXJLZXkpID0+ICFoYXNNb2RpZmllcktleShldmVudCwgbW9kaWZpZXIpKTtcblxuICAgIGlmIChpc0FsdERvd25BcnJvdyAmJiAhdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LnJlYWRPbmx5KSB7XG4gICAgICB0aGlzLl9vcGVuUG9wdXAoKTtcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgfVxuICB9XG5cbiAgX29uSW5wdXQodmFsdWU6IHN0cmluZykge1xuICAgIGNvbnN0IGxhc3RWYWx1ZVdhc1ZhbGlkID0gdGhpcy5fbGFzdFZhbHVlVmFsaWQ7XG4gICAgbGV0IGRhdGUgPSB0aGlzLl9kYXRlQWRhcHRlci5wYXJzZSh2YWx1ZSwgdGhpcy5fZGF0ZUZvcm1hdHMucGFyc2UuZGF0ZUlucHV0KTtcbiAgICB0aGlzLl9sYXN0VmFsdWVWYWxpZCA9IHRoaXMuX2lzVmFsaWRWYWx1ZShkYXRlKTtcbiAgICBkYXRlID0gdGhpcy5fZGF0ZUFkYXB0ZXIuZ2V0VmFsaWREYXRlT3JOdWxsKGRhdGUpO1xuICAgIGNvbnN0IGhhc0NoYW5nZWQgPSAhdGhpcy5fZGF0ZUFkYXB0ZXIuc2FtZURhdGUoZGF0ZSwgdGhpcy52YWx1ZSk7XG5cbiAgICAvLyBXZSBuZWVkIHRvIGZpcmUgdGhlIENWQSBjaGFuZ2UgZXZlbnQgZm9yIGFsbFxuICAgIC8vIG51bGxzLCBvdGhlcndpc2UgdGhlIHZhbGlkYXRvcnMgd29uJ3QgcnVuLlxuICAgIGlmICghZGF0ZSB8fCBoYXNDaGFuZ2VkKSB7XG4gICAgICB0aGlzLl9jdmFPbkNoYW5nZShkYXRlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gQ2FsbCB0aGUgQ1ZBIGNoYW5nZSBoYW5kbGVyIGZvciBpbnZhbGlkIHZhbHVlc1xuICAgICAgLy8gc2luY2UgdGhpcyBpcyB3aGF0IG1hcmtzIHRoZSBjb250cm9sIGFzIGRpcnR5LlxuICAgICAgaWYgKHZhbHVlICYmICF0aGlzLnZhbHVlKSB7XG4gICAgICAgIHRoaXMuX2N2YU9uQ2hhbmdlKGRhdGUpO1xuICAgICAgfVxuXG4gICAgICBpZiAobGFzdFZhbHVlV2FzVmFsaWQgIT09IHRoaXMuX2xhc3RWYWx1ZVZhbGlkKSB7XG4gICAgICAgIHRoaXMuX3ZhbGlkYXRvck9uQ2hhbmdlKCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGhhc0NoYW5nZWQpIHtcbiAgICAgIHRoaXMuX2Fzc2lnblZhbHVlKGRhdGUpO1xuICAgICAgdGhpcy5kYXRlSW5wdXQuZW1pdChuZXcgRGF0ZXBpY2tlcklucHV0RXZlbnQodGhpcywgdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50KSk7XG4gICAgfVxuICB9XG5cbiAgX29uQ2hhbmdlKCkge1xuICAgIHRoaXMuZGF0ZUNoYW5nZS5lbWl0KG5ldyBEYXRlcGlja2VySW5wdXRFdmVudCh0aGlzLCB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQpKTtcbiAgfVxuXG4gIC8qKiBIYW5kbGVzIGJsdXIgZXZlbnRzIG9uIHRoZSBpbnB1dC4gKi9cbiAgX29uQmx1cigpIHtcbiAgICAvLyBSZWZvcm1hdCB0aGUgaW5wdXQgb25seSBpZiB3ZSBoYXZlIGEgdmFsaWQgdmFsdWUuXG4gICAgaWYgKHRoaXMudmFsdWUpIHtcbiAgICAgIHRoaXMuX2Zvcm1hdFZhbHVlKHRoaXMudmFsdWUpO1xuICAgIH1cblxuICAgIHRoaXMuX29uVG91Y2hlZCgpO1xuICB9XG5cbiAgLyoqIEZvcm1hdHMgYSB2YWx1ZSBhbmQgc2V0cyBpdCBvbiB0aGUgaW5wdXQgZWxlbWVudC4gKi9cbiAgcHJvdGVjdGVkIF9mb3JtYXRWYWx1ZSh2YWx1ZTogRCB8IG51bGwpIHtcbiAgICB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQudmFsdWUgPVxuICAgICAgdmFsdWUgIT0gbnVsbCA/IHRoaXMuX2RhdGVBZGFwdGVyLmZvcm1hdCh2YWx1ZSwgdGhpcy5fZGF0ZUZvcm1hdHMuZGlzcGxheS5kYXRlSW5wdXQpIDogJyc7XG4gIH1cblxuICAvKiogQXNzaWducyBhIHZhbHVlIHRvIHRoZSBtb2RlbC4gKi9cbiAgcHJpdmF0ZSBfYXNzaWduVmFsdWUodmFsdWU6IEQgfCBudWxsKSB7XG4gICAgLy8gV2UgbWF5IGdldCBzb21lIGluY29taW5nIHZhbHVlcyBiZWZvcmUgdGhlIG1vZGVsIHdhc1xuICAgIC8vIGFzc2lnbmVkLiBTYXZlIHRoZSB2YWx1ZSBzbyB0aGF0IHdlIGNhbiBhc3NpZ24gaXQgbGF0ZXIuXG4gICAgaWYgKHRoaXMuX21vZGVsKSB7XG4gICAgICB0aGlzLl9hc3NpZ25WYWx1ZVRvTW9kZWwodmFsdWUpO1xuICAgICAgdGhpcy5fcGVuZGluZ1ZhbHVlID0gbnVsbDtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fcGVuZGluZ1ZhbHVlID0gdmFsdWU7XG4gICAgfVxuICB9XG5cbiAgLyoqIFdoZXRoZXIgYSB2YWx1ZSBpcyBjb25zaWRlcmVkIHZhbGlkLiAqL1xuICBwcml2YXRlIF9pc1ZhbGlkVmFsdWUodmFsdWU6IEQgfCBudWxsKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuICF2YWx1ZSB8fCB0aGlzLl9kYXRlQWRhcHRlci5pc1ZhbGlkKHZhbHVlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3Mgd2hldGhlciBhIHBhcmVudCBjb250cm9sIGlzIGRpc2FibGVkLiBUaGlzIGlzIGluIHBsYWNlIHNvIHRoYXQgaXQgY2FuIGJlIG92ZXJyaWRkZW5cbiAgICogYnkgaW5wdXRzIGV4dGVuZGluZyB0aGlzIG9uZSB3aGljaCBjYW4gYmUgcGxhY2VkIGluc2lkZSBvZiBhIGdyb3VwIHRoYXQgY2FuIGJlIGRpc2FibGVkLlxuICAgKi9cbiAgcHJvdGVjdGVkIF9wYXJlbnREaXNhYmxlZCgpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvKiogUHJvZ3JhbW1hdGljYWxseSBhc3NpZ25zIGEgdmFsdWUgdG8gdGhlIGlucHV0LiAqL1xuICBwcm90ZWN0ZWQgX2Fzc2lnblZhbHVlUHJvZ3JhbW1hdGljYWxseSh2YWx1ZTogRCB8IG51bGwpIHtcbiAgICB2YWx1ZSA9IHRoaXMuX2RhdGVBZGFwdGVyLmRlc2VyaWFsaXplKHZhbHVlKTtcbiAgICB0aGlzLl9sYXN0VmFsdWVWYWxpZCA9IHRoaXMuX2lzVmFsaWRWYWx1ZSh2YWx1ZSk7XG4gICAgdmFsdWUgPSB0aGlzLl9kYXRlQWRhcHRlci5nZXRWYWxpZERhdGVPck51bGwodmFsdWUpO1xuICAgIHRoaXMuX2Fzc2lnblZhbHVlKHZhbHVlKTtcbiAgICB0aGlzLl9mb3JtYXRWYWx1ZSh2YWx1ZSk7XG4gIH1cblxuICAvKiogR2V0cyB3aGV0aGVyIGEgdmFsdWUgbWF0Y2hlcyB0aGUgY3VycmVudCBkYXRlIGZpbHRlci4gKi9cbiAgX21hdGNoZXNGaWx0ZXIodmFsdWU6IEQgfCBudWxsKTogYm9vbGVhbiB7XG4gICAgY29uc3QgZmlsdGVyID0gdGhpcy5fZ2V0RGF0ZUZpbHRlcigpO1xuICAgIHJldHVybiAhZmlsdGVyIHx8IGZpbHRlcih2YWx1ZSk7XG4gIH1cbn1cblxuLyoqXG4gKiBDaGVja3Mgd2hldGhlciB0aGUgYFNpbXBsZUNoYW5nZXNgIG9iamVjdCBmcm9tIGFuIGBuZ09uQ2hhbmdlc2BcbiAqIGNhbGxiYWNrIGhhcyBhbnkgY2hhbmdlcywgYWNjb3VudGluZyBmb3IgZGF0ZSBvYmplY3RzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZGF0ZUlucHV0c0hhdmVDaGFuZ2VkKFxuICBjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzLFxuICBhZGFwdGVyOiBEYXRlQWRhcHRlcjx1bmtub3duPlxuKTogYm9vbGVhbiB7XG4gIGNvbnN0IGtleXMgPSBPYmplY3Qua2V5cyhjaGFuZ2VzKTtcblxuICBmb3IgKGNvbnN0IGtleSBvZiBrZXlzKSB7XG4gICAgY29uc3QgeyBwcmV2aW91c1ZhbHVlLCBjdXJyZW50VmFsdWUgfSA9IGNoYW5nZXNba2V5XTtcblxuICAgIGlmIChhZGFwdGVyLmlzRGF0ZUluc3RhbmNlKHByZXZpb3VzVmFsdWUpICYmIGFkYXB0ZXIuaXNEYXRlSW5zdGFuY2UoY3VycmVudFZhbHVlKSkge1xuICAgICAgaWYgKCFhZGFwdGVyLnNhbWVEYXRlKHByZXZpb3VzVmFsdWUsIGN1cnJlbnRWYWx1ZSkpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBmYWxzZTtcbn1cbiJdfQ==
