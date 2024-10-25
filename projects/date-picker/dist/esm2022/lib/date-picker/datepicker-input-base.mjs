/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { DOWN_ARROW, hasModifierKey } from '@angular/cdk/keycodes';
import { Directive, EventEmitter, Inject, Input, Optional, Output, booleanAttribute, } from '@angular/core';
import { Subscription, Subject } from 'rxjs';
import { createMissingDateImplError } from '../utils/errors';
import { DATE_FORMATS } from '../adapter';
import * as i0 from "@angular/core";
import * as i1 from "../adapter";
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
    targetElement) {
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
    _onTouched = () => { };
    _validatorOnChange = () => { };
    _cvaOnChange = () => { };
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
        const controlValue = this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(control.value));
        return !controlValue || this._matchesFilter(controlValue) ? null : { datepickerFilter: true };
    };
    /** The form control validator for the min date. */
    _minValidator = (control) => {
        const controlValue = this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(control.value));
        const min = this._getMinDate();
        return !min || !controlValue || this._dateAdapter.compareDate(min, controlValue) <= 0
            ? null
            : { datepickerMin: { min: min, actual: controlValue } };
    };
    /** The form control validator for the max date. */
    _maxValidator = (control) => {
        const controlValue = this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(control.value));
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
    constructor(_elementRef, _dateAdapter, _dateFormats
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
        const isAltDownArrow = hasModifierKey(event, 'altKey') &&
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
        }
        else {
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
        }
        else {
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
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: DatepickerInputBase, deps: [{ token: i0.ElementRef }, { token: i1.DateAdapter, optional: true }, { token: DATE_FORMATS, optional: true }], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "16.1.0", version: "18.2.8", type: DatepickerInputBase, isStandalone: true, inputs: { value: "value", disabled: ["disabled", "disabled", booleanAttribute] }, outputs: { dateChange: "dateChange", dateInput: "dateInput" }, usesOnChanges: true, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: DatepickerInputBase, decorators: [{
            type: Directive,
            args: [{ standalone: true }]
        }], ctorParameters: () => [{ type: i0.ElementRef }, { type: i1.DateAdapter, decorators: [{
                    type: Optional
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [DATE_FORMATS]
                }] }], propDecorators: { value: [{
                type: Input
            }], disabled: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], dateChange: [{
                type: Output
            }], dateInput: [{
                type: Output
            }] } });
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
        }
        else {
            return true;
        }
    }
    return false;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZXBpY2tlci1pbnB1dC1iYXNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2xpYi9kYXRlLXBpY2tlci9kYXRlcGlja2VyLWlucHV0LWJhc2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFFLFVBQVUsRUFBRSxjQUFjLEVBQWUsTUFBTSx1QkFBdUIsQ0FBQztBQUVoRixPQUFPLEVBQ0wsU0FBUyxFQUVULFlBQVksRUFDWixNQUFNLEVBQ04sS0FBSyxFQUVMLFFBQVEsRUFDUixNQUFNLEVBSU4sZ0JBQWdCLEdBQ2pCLE1BQU0sZUFBZSxDQUFDO0FBVXZCLE9BQU8sRUFBRSxZQUFZLEVBQUUsT0FBTyxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBRTdDLE9BQU8sRUFBRSwwQkFBMEIsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQzdELE9BQU8sRUFBZSxZQUFZLEVBQWUsTUFBTSxZQUFZLENBQUM7OztBQU9wRTs7OztHQUlHO0FBQ0gsTUFBTSxPQUFPLG9CQUFvQjtJQU10QjtJQUVBO0lBUFQscURBQXFEO0lBQ3JELEtBQUssQ0FBVztJQUVoQjtJQUNFLDBFQUEwRTtJQUNuRSxNQUFpQztJQUN4QyxrRkFBa0Y7SUFDM0UsYUFBMEI7UUFGMUIsV0FBTSxHQUFOLE1BQU0sQ0FBMkI7UUFFakMsa0JBQWEsR0FBYixhQUFhLENBQWE7UUFFakMsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQztJQUNqQyxDQUFDO0NBQ0Y7QUFLRCx3Q0FBd0M7QUFFeEMsTUFBTSxPQUFnQixtQkFBbUI7SUFtSzNCO0lBQ1M7SUFDdUI7SUFsSzVDLGtEQUFrRDtJQUMxQyxjQUFjLENBQVU7SUFFaEMsOEJBQThCO0lBQzlCLElBQ0ksS0FBSztRQUNQLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElB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LE1BQU0sVUFBVSxxQkFBcUIsQ0FDbkMsT0FBc0IsRUFDdEIsT0FBNkI7SUFFN0IsTUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUVsQyxLQUFLLE1BQU0sR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO1FBQ3ZCLE1BQU0sRUFBRSxhQUFhLEVBQUUsWUFBWSxFQUFFLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRXJELElBQUksT0FBTyxDQUFDLGNBQWMsQ0FBQyxhQUFhLENBQUMsSUFBSSxPQUFPLENBQUMsY0FBYyxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUM7WUFDbEYsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsYUFBYSxFQUFFLFlBQVksQ0FBQyxFQUFFLENBQUM7Z0JBQ25ELE9BQU8sSUFBSSxDQUFDO1lBQ2QsQ0FBQztRQUNILENBQUM7YUFBTSxDQUFDO1lBQ04sT0FBTyxJQUFJLENBQUM7UUFDZCxDQUFDO0lBQ0gsQ0FBQztJQUVELE9BQU8sS0FBSyxDQUFDO0FBQ2YsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgeyBET1dOX0FSUk9XLCBoYXNNb2RpZmllcktleSwgTW9kaWZpZXJLZXkgfSBmcm9tICdAYW5ndWxhci9jZGsva2V5Y29kZXMnO1xuXG5pbXBvcnQge1xuICBEaXJlY3RpdmUsXG4gIEVsZW1lbnRSZWYsXG4gIEV2ZW50RW1pdHRlcixcbiAgSW5qZWN0LFxuICBJbnB1dCxcbiAgT25EZXN0cm95LFxuICBPcHRpb25hbCxcbiAgT3V0cHV0LFxuICBBZnRlclZpZXdJbml0LFxuICBPbkNoYW5nZXMsXG4gIFNpbXBsZUNoYW5nZXMsXG4gIGJvb2xlYW5BdHRyaWJ1dGUsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge1xuICBBYnN0cmFjdENvbnRyb2wsXG4gIENvbnRyb2xWYWx1ZUFjY2Vzc29yLFxuICBWYWxpZGF0aW9uRXJyb3JzLFxuICBWYWxpZGF0b3IsXG4gIFZhbGlkYXRvckZuLFxufSBmcm9tICdAYW5ndWxhci9mb3Jtcyc7XG5cbmltcG9ydCB7IFN1YnNjcmlwdGlvbiwgU3ViamVjdCB9IGZyb20gJ3J4anMnO1xuXG5pbXBvcnQgeyBjcmVhdGVNaXNzaW5nRGF0ZUltcGxFcnJvciB9IGZyb20gJy4uL3V0aWxzL2Vycm9ycyc7XG5pbXBvcnQgeyBEYXRlQWRhcHRlciwgREFURV9GT1JNQVRTLCBEYXRlRm9ybWF0cyB9IGZyb20gJy4uL2FkYXB0ZXInO1xuaW1wb3J0IHtcbiAgRXh0cmFjdERhdGVUeXBlRnJvbVNlbGVjdGlvbixcbiAgRGF0ZVNlbGVjdGlvbk1vZGVsLFxuICBEYXRlU2VsZWN0aW9uTW9kZWxDaGFuZ2UsXG59IGZyb20gJy4vZGF0ZS1zZWxlY3Rpb24tbW9kZWwnO1xuXG4vKipcbiAqIEFuIGV2ZW50IHVzZWQgZm9yIGRhdGVwaWNrZXIgaW5wdXQgYW5kIGNoYW5nZSBldmVudHMuIFdlIGRvbid0IGFsd2F5cyBoYXZlIGFjY2VzcyB0byBhIG5hdGl2ZVxuICogaW5wdXQgb3IgY2hhbmdlIGV2ZW50IGJlY2F1c2UgdGhlIGV2ZW50IG1heSBoYXZlIGJlZW4gdHJpZ2dlcmVkIGJ5IHRoZSB1c2VyIGNsaWNraW5nIG9uIHRoZVxuICogY2FsZW5kYXIgcG9wdXAuIEZvciBjb25zaXN0ZW5jeSwgd2UgYWx3YXlzIHVzZSBkYXRlcGlja2VySW5wdXRFdmVudCBpbnN0ZWFkLlxuICovXG5leHBvcnQgY2xhc3MgRGF0ZXBpY2tlcklucHV0RXZlbnQ8RCwgUyA9IHVua25vd24+IHtcbiAgLyoqIFRoZSBuZXcgdmFsdWUgZm9yIHRoZSB0YXJnZXQgZGF0ZXBpY2tlciBpbnB1dC4gKi9cbiAgdmFsdWU6IEQgfCBudWxsO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIC8qKiBSZWZlcmVuY2UgdG8gdGhlIGRhdGVwaWNrZXIgaW5wdXQgY29tcG9uZW50IHRoYXQgZW1pdHRlZCB0aGUgZXZlbnQuICovXG4gICAgcHVibGljIHRhcmdldDogRGF0ZXBpY2tlcklucHV0QmFzZTxTLCBEPixcbiAgICAvKiogUmVmZXJlbmNlIHRvIHRoZSBuYXRpdmUgaW5wdXQgZWxlbWVudCBhc3NvY2lhdGVkIHdpdGggdGhlIGRhdGVwaWNrZXIgaW5wdXQuICovXG4gICAgcHVibGljIHRhcmdldEVsZW1lbnQ6IEhUTUxFbGVtZW50XG4gICkge1xuICAgIHRoaXMudmFsdWUgPSB0aGlzLnRhcmdldC52YWx1ZTtcbiAgfVxufVxuXG4vKiogRnVuY3Rpb24gdGhhdCBjYW4gYmUgdXNlZCB0byBmaWx0ZXIgb3V0IGRhdGVzIGZyb20gYSBjYWxlbmRhci4gKi9cbmV4cG9ydCB0eXBlIERhdGVGaWx0ZXJGbjxEPiA9IChkYXRlOiBEIHwgbnVsbCkgPT4gYm9vbGVhbjtcblxuLyoqIEJhc2UgY2xhc3MgZm9yIGRhdGVwaWNrZXIgaW5wdXRzLiAqL1xuQERpcmVjdGl2ZSh7IHN0YW5kYWxvbmU6IHRydWUgfSlcbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBEYXRlcGlja2VySW5wdXRCYXNlPFMsIEQgPSBFeHRyYWN0RGF0ZVR5cGVGcm9tU2VsZWN0aW9uPFM+PlxuICBpbXBsZW1lbnRzIENvbnRyb2xWYWx1ZUFjY2Vzc29yLCBBZnRlclZpZXdJbml0LCBPbkNoYW5nZXMsIE9uRGVzdHJveSwgVmFsaWRhdG9yXG57XG4gIC8qKiBXaGV0aGVyIHRoZSBjb21wb25lbnQgaGFzIGJlZW4gaW5pdGlhbGl6ZWQuICovXG4gIHByaXZhdGUgX2lzSW5pdGlhbGl6ZWQ6IGJvb2xlYW47XG5cbiAgLyoqIFRoZSB2YWx1ZSBvZiB0aGUgaW5wdXQuICovXG4gIEBJbnB1dCgpXG4gIGdldCB2YWx1ZSgpOiBEIHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuX21vZGVsID8gdGhpcy5fZ2V0VmFsdWVGcm9tTW9kZWwodGhpcy5fbW9kZWwuc2VsZWN0aW9uKSA6IHRoaXMuX3BlbmRpbmdWYWx1ZTtcbiAgfVxuICBzZXQgdmFsdWUodmFsdWU6IGFueSkge1xuICAgIHRoaXMuX2Fzc2lnblZhbHVlUHJvZ3JhbW1hdGljYWxseSh2YWx1ZSk7XG4gIH1cbiAgcHJvdGVjdGVkIF9tb2RlbDogRGF0ZVNlbGVjdGlvbk1vZGVsPFMsIEQ+IHwgdW5kZWZpbmVkO1xuXG4gIC8qKiBXaGV0aGVyIHRoZSBkYXRlcGlja2VyLWlucHV0IGlzIGRpc2FibGVkLiAqL1xuICBASW5wdXQoeyB0cmFuc2Zvcm06IGJvb2xlYW5BdHRyaWJ1dGUgfSlcbiAgZ2V0IGRpc2FibGVkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAhIXRoaXMuX2Rpc2FibGVkIHx8IHRoaXMuX3BhcmVudERpc2FibGVkKCk7XG4gIH1cbiAgc2V0IGRpc2FibGVkKHZhbHVlOiBib29sZWFuKSB7XG4gICAgY29uc3QgbmV3VmFsdWUgPSB2YWx1ZTtcbiAgICBjb25zdCBlbGVtZW50ID0gdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50O1xuXG4gICAgaWYgKHRoaXMuX2Rpc2FibGVkICE9PSBuZXdWYWx1ZSkge1xuICAgICAgdGhpcy5fZGlzYWJsZWQgPSBuZXdWYWx1ZTtcbiAgICAgIHRoaXMuc3RhdGVDaGFuZ2VzLm5leHQodW5kZWZpbmVkKTtcbiAgICB9XG5cbiAgICAvLyBXZSBuZWVkIHRvIG51bGwgY2hlY2sgdGhlIGBibHVyYCBtZXRob2QsIGJlY2F1c2UgaXQncyB1bmRlZmluZWQgZHVyaW5nIFNTUi5cbiAgICAvLyBJbiBJdnkgc3RhdGljIGJpbmRpbmdzIGFyZSBpbnZva2VkIGVhcmxpZXIsIGJlZm9yZSB0aGUgZWxlbWVudCBpcyBhdHRhY2hlZCB0byB0aGUgRE9NLlxuICAgIC8vIFRoaXMgY2FuIGNhdXNlIGFuIGVycm9yIHRvIGJlIHRocm93biBpbiBzb21lIGJyb3dzZXJzIChJRS9FZGdlKSB3aGljaCBhc3NlcnQgdGhhdCB0aGVcbiAgICAvLyBlbGVtZW50IGhhcyBiZWVuIGluc2VydGVkLlxuICAgIGlmIChuZXdWYWx1ZSAmJiB0aGlzLl9pc0luaXRpYWxpemVkICYmIGVsZW1lbnQuYmx1cikge1xuICAgICAgLy8gTm9ybWFsbHksIG5hdGl2ZSBpbnB1dCBlbGVtZW50cyBhdXRvbWF0aWNhbGx5IGJsdXIgaWYgdGhleSB0dXJuIGRpc2FibGVkLiBUaGlzIGJlaGF2aW9yXG4gICAgICAvLyBpcyBwcm9ibGVtYXRpYywgYmVjYXVzZSBpdCB3b3VsZCBtZWFuIHRoYXQgaXQgdHJpZ2dlcnMgYW5vdGhlciBjaGFuZ2UgZGV0ZWN0aW9uIGN5Y2xlLFxuICAgICAgLy8gd2hpY2ggdGhlbiBjYXVzZXMgYSBjaGFuZ2VkIGFmdGVyIGNoZWNrZWQgZXJyb3IgaWYgdGhlIGlucHV0IGVsZW1lbnQgd2FzIGZvY3VzZWQgYmVmb3JlLlxuICAgICAgZWxlbWVudC5ibHVyKCk7XG4gICAgfVxuICB9XG4gIHByaXZhdGUgX2Rpc2FibGVkOiBib29sZWFuO1xuXG4gIC8qKiBFbWl0cyB3aGVuIGEgYGNoYW5nZWAgZXZlbnQgaXMgZmlyZWQgb24gdGhpcyBgPGlucHV0PmAuICovXG4gIEBPdXRwdXQoKSByZWFkb25seSBkYXRlQ2hhbmdlOiBFdmVudEVtaXR0ZXI8RGF0ZXBpY2tlcklucHV0RXZlbnQ8RCwgUz4+ID0gbmV3IEV2ZW50RW1pdHRlcjxcbiAgICBEYXRlcGlja2VySW5wdXRFdmVudDxELCBTPlxuICA+KCk7XG5cbiAgLyoqIEVtaXRzIHdoZW4gYW4gYGlucHV0YCBldmVudCBpcyBmaXJlZCBvbiB0aGlzIGA8aW5wdXQ+YC4gKi9cbiAgQE91dHB1dCgpIHJlYWRvbmx5IGRhdGVJbnB1dDogRXZlbnRFbWl0dGVyPERhdGVwaWNrZXJJbnB1dEV2ZW50PEQsIFM+PiA9IG5ldyBFdmVudEVtaXR0ZXI8XG4gICAgRGF0ZXBpY2tlcklucHV0RXZlbnQ8RCwgUz5cbiAgPigpO1xuXG4gIC8qKiBFbWl0cyB3aGVuIHRoZSBpbnRlcm5hbCBzdGF0ZSBoYXMgY2hhbmdlZCAqL1xuICByZWFkb25seSBzdGF0ZUNoYW5nZXMgPSBuZXcgU3ViamVjdDx2b2lkPigpO1xuXG4gIF9vblRvdWNoZWQgPSAoKSA9PiB7fTtcbiAgX3ZhbGlkYXRvck9uQ2hhbmdlID0gKCkgPT4ge307XG5cbiAgcHJpdmF0ZSBfY3ZhT25DaGFuZ2U6ICh2YWx1ZTogYW55KSA9PiB2b2lkID0gKCkgPT4ge307XG4gIHByaXZhdGUgX3ZhbHVlQ2hhbmdlc1N1YnNjcmlwdGlvbiA9IFN1YnNjcmlwdGlvbi5FTVBUWTtcbiAgcHJpdmF0ZSBfbG9jYWxlU3Vic2NyaXB0aW9uID0gU3Vic2NyaXB0aW9uLkVNUFRZO1xuICBwcml2YXRlIF90cmFuc2xvY29TdWJzY3JpcHRpb24gPSBTdWJzY3JpcHRpb24uRU1QVFk7XG5cbiAgLyoqXG4gICAqIFNpbmNlIHRoZSB2YWx1ZSBpcyBrZXB0IG9uIHRoZSBtb2RlbCB3aGljaCBpcyBhc3NpZ25lZCBpbiBhbiBJbnB1dCxcbiAgICogd2UgbWlnaHQgZ2V0IGEgdmFsdWUgYmVmb3JlIHdlIGhhdmUgYSBtb2RlbC4gVGhpcyBwcm9wZXJ0eSBrZWVwcyB0cmFja1xuICAgKiBvZiB0aGUgdmFsdWUgdW50aWwgd2UgaGF2ZSBzb21ld2hlcmUgdG8gYXNzaWduIGl0LlxuICAgKi9cbiAgcHJpdmF0ZSBfcGVuZGluZ1ZhbHVlOiBEIHwgbnVsbDtcblxuICAvKiogVGhlIGZvcm0gY29udHJvbCB2YWxpZGF0b3IgZm9yIHdoZXRoZXIgdGhlIGlucHV0IHBhcnNlcy4gKi9cbiAgcHJpdmF0ZSBfcGFyc2VWYWxpZGF0b3I6IFZhbGlkYXRvckZuID0gKCk6IFZhbGlkYXRpb25FcnJvcnMgfCBudWxsID0+IHtcbiAgICByZXR1cm4gdGhpcy5fbGFzdFZhbHVlVmFsaWRcbiAgICAgID8gbnVsbFxuICAgICAgOiB7IGRhdGVwaWNrZXJQYXJzZTogeyB0ZXh0OiB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQudmFsdWUgfSB9O1xuICB9O1xuXG4gIC8qKiBUaGUgZm9ybSBjb250cm9sIHZhbGlkYXRvciBmb3IgdGhlIGRhdGUgZmlsdGVyLiAqL1xuICBwcml2YXRlIF9maWx0ZXJWYWxpZGF0b3I6IFZhbGlkYXRvckZuID0gKGNvbnRyb2w6IEFic3RyYWN0Q29udHJvbCk6IFZhbGlkYXRpb25FcnJvcnMgfCBudWxsID0+IHtcbiAgICBjb25zdCBjb250cm9sVmFsdWUgPSB0aGlzLl9kYXRlQWRhcHRlci5nZXRWYWxpZERhdGVPck51bGwoXG4gICAgICB0aGlzLl9kYXRlQWRhcHRlci5kZXNlcmlhbGl6ZShjb250cm9sLnZhbHVlKVxuICAgICk7XG4gICAgcmV0dXJuICFjb250cm9sVmFsdWUgfHwgdGhpcy5fbWF0Y2hlc0ZpbHRlcihjb250cm9sVmFsdWUpID8gbnVsbCA6IHsgZGF0ZXBpY2tlckZpbHRlcjogdHJ1ZSB9O1xuICB9O1xuXG4gIC8qKiBUaGUgZm9ybSBjb250cm9sIHZhbGlkYXRvciBmb3IgdGhlIG1pbiBkYXRlLiAqL1xuICBwcml2YXRlIF9taW5WYWxpZGF0b3I6IFZhbGlkYXRvckZuID0gKGNvbnRyb2w6IEFic3RyYWN0Q29udHJvbCk6IFZhbGlkYXRpb25FcnJvcnMgfCBudWxsID0+IHtcbiAgICBjb25zdCBjb250cm9sVmFsdWUgPSB0aGlzLl9kYXRlQWRhcHRlci5nZXRWYWxpZERhdGVPck51bGwoXG4gICAgICB0aGlzLl9kYXRlQWRhcHRlci5kZXNlcmlhbGl6ZShjb250cm9sLnZhbHVlKVxuICAgICk7XG4gICAgY29uc3QgbWluID0gdGhpcy5fZ2V0TWluRGF0ZSgpO1xuICAgIHJldHVybiAhbWluIHx8ICFjb250cm9sVmFsdWUgfHwgdGhpcy5fZGF0ZUFkYXB0ZXIuY29tcGFyZURhdGUobWluLCBjb250cm9sVmFsdWUpIDw9IDBcbiAgICAgID8gbnVsbFxuICAgICAgOiB7IGRhdGVwaWNrZXJNaW46IHsgbWluOiBtaW4sIGFjdHVhbDogY29udHJvbFZhbHVlIH0gfTtcbiAgfTtcblxuICAvKiogVGhlIGZvcm0gY29udHJvbCB2YWxpZGF0b3IgZm9yIHRoZSBtYXggZGF0ZS4gKi9cbiAgcHJpdmF0ZSBfbWF4VmFsaWRhdG9yOiBWYWxpZGF0b3JGbiA9IChjb250cm9sOiBBYnN0cmFjdENvbnRyb2wpOiBWYWxpZGF0aW9uRXJyb3JzIHwgbnVsbCA9PiB7XG4gICAgY29uc3QgY29udHJvbFZhbHVlID0gdGhpcy5fZGF0ZUFkYXB0ZXIuZ2V0VmFsaWREYXRlT3JOdWxsKFxuICAgICAgdGhpcy5fZGF0ZUFkYXB0ZXIuZGVzZXJpYWxpemUoY29udHJvbC52YWx1ZSlcbiAgICApO1xuICAgIGNvbnN0IG1heCA9IHRoaXMuX2dldE1heERhdGUoKTtcbiAgICByZXR1cm4gIW1heCB8fCAhY29udHJvbFZhbHVlIHx8IHRoaXMuX2RhdGVBZGFwdGVyLmNvbXBhcmVEYXRlKG1heCwgY29udHJvbFZhbHVlKSA+PSAwXG4gICAgICA/IG51bGxcbiAgICAgIDogeyBkYXRlcGlja2VyTWF4OiB7IG1heDogbWF4LCBhY3R1YWw6IGNvbnRyb2xWYWx1ZSB9IH07XG4gIH07XG5cbiAgLyoqIEdldHMgdGhlIGJhc2UgdmFsaWRhdG9yIGZ1bmN0aW9ucy4gKi9cbiAgcHJvdGVjdGVkIF9nZXRWYWxpZGF0b3JzKCk6IFZhbGlkYXRvckZuW10ge1xuICAgIHJldHVybiBbdGhpcy5fcGFyc2VWYWxpZGF0b3IsIHRoaXMuX21pblZhbGlkYXRvciwgdGhpcy5fbWF4VmFsaWRhdG9yLCB0aGlzLl9maWx0ZXJWYWxpZGF0b3JdO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIG1pbmltdW0gZGF0ZSBmb3IgdGhlIGlucHV0LiBVc2VkIGZvciB2YWxpZGF0aW9uLiAqL1xuICBhYnN0cmFjdCBfZ2V0TWluRGF0ZSgpOiBEIHwgbnVsbDtcblxuICAvKiogR2V0cyB0aGUgbWF4aW11bSBkYXRlIGZvciB0aGUgaW5wdXQuIFVzZWQgZm9yIHZhbGlkYXRpb24uICovXG4gIGFic3RyYWN0IF9nZXRNYXhEYXRlKCk6IEQgfCBudWxsO1xuXG4gIC8qKiBHZXRzIHRoZSBkYXRlIGZpbHRlciBmdW5jdGlvbi4gVXNlZCBmb3IgdmFsaWRhdGlvbi4gKi9cbiAgcHJvdGVjdGVkIGFic3RyYWN0IF9nZXREYXRlRmlsdGVyKCk6IERhdGVGaWx0ZXJGbjxEPiB8IHVuZGVmaW5lZDtcblxuICAvKiogUmVnaXN0ZXJzIGEgZGF0ZSBzZWxlY3Rpb24gbW9kZWwgd2l0aCB0aGUgaW5wdXQuICovXG4gIF9yZWdpc3Rlck1vZGVsKG1vZGVsOiBEYXRlU2VsZWN0aW9uTW9kZWw8UywgRD4pOiB2b2lkIHtcbiAgICB0aGlzLl9tb2RlbCA9IG1vZGVsO1xuICAgIHRoaXMuX3ZhbHVlQ2hhbmdlc1N1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xuXG4gICAgaWYgKHRoaXMuX3BlbmRpbmdWYWx1ZSkge1xuICAgICAgdGhpcy5fYXNzaWduVmFsdWUodGhpcy5fcGVuZGluZ1ZhbHVlKTtcbiAgICB9XG5cbiAgICB0aGlzLl92YWx1ZUNoYW5nZXNTdWJzY3JpcHRpb24gPSB0aGlzLl9tb2RlbC5zZWxlY3Rpb25DaGFuZ2VkLnN1YnNjcmliZSgoZXZlbnQpID0+IHtcbiAgICAgIGlmICh0aGlzLl9zaG91bGRIYW5kbGVDaGFuZ2VFdmVudChldmVudCkpIHtcbiAgICAgICAgY29uc3QgdmFsdWUgPSB0aGlzLl9nZXRWYWx1ZUZyb21Nb2RlbChldmVudC5zZWxlY3Rpb24pO1xuICAgICAgICB0aGlzLl9sYXN0VmFsdWVWYWxpZCA9IHRoaXMuX2lzVmFsaWRWYWx1ZSh2YWx1ZSk7XG4gICAgICAgIHRoaXMuX2N2YU9uQ2hhbmdlKHZhbHVlKTtcbiAgICAgICAgdGhpcy5fb25Ub3VjaGVkKCk7XG4gICAgICAgIHRoaXMuX2Zvcm1hdFZhbHVlKHZhbHVlKTtcbiAgICAgICAgdGhpcy5kYXRlSW5wdXQuZW1pdChuZXcgRGF0ZXBpY2tlcklucHV0RXZlbnQodGhpcywgdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50KSk7XG4gICAgICAgIHRoaXMuZGF0ZUNoYW5nZS5lbWl0KG5ldyBEYXRlcGlja2VySW5wdXRFdmVudCh0aGlzLCB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQpKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBPcGVucyB0aGUgcG9wdXAgYXNzb2NpYXRlZCB3aXRoIHRoZSBpbnB1dC4gKi9cbiAgcHJvdGVjdGVkIGFic3RyYWN0IF9vcGVuUG9wdXAoKTogdm9pZDtcblxuICAvKiogQXNzaWducyBhIHZhbHVlIHRvIHRoZSBpbnB1dCdzIG1vZGVsLiAqL1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgX2Fzc2lnblZhbHVlVG9Nb2RlbChtb2RlbDogRCB8IG51bGwpOiB2b2lkO1xuXG4gIC8qKiBDb252ZXJ0cyBhIHZhbHVlIGZyb20gdGhlIG1vZGVsIGludG8gYSBuYXRpdmUgdmFsdWUgZm9yIHRoZSBpbnB1dC4gKi9cbiAgcHJvdGVjdGVkIGFic3RyYWN0IF9nZXRWYWx1ZUZyb21Nb2RlbChtb2RlbFZhbHVlOiBTKTogRCB8IG51bGw7XG5cbiAgLyoqIENvbWJpbmVkIGZvcm0gY29udHJvbCB2YWxpZGF0b3IgZm9yIHRoaXMgaW5wdXQuICovXG4gIHByb3RlY3RlZCBhYnN0cmFjdCBfdmFsaWRhdG9yOiBWYWxpZGF0b3JGbiB8IG51bGw7XG5cbiAgLyoqIFByZWRpY2F0ZSB0aGF0IGRldGVybWluZXMgd2hldGhlciB0aGUgaW5wdXQgc2hvdWxkIGhhbmRsZSBhIHBhcnRpY3VsYXIgY2hhbmdlIGV2ZW50LiAqL1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgX3Nob3VsZEhhbmRsZUNoYW5nZUV2ZW50KGV2ZW50OiBEYXRlU2VsZWN0aW9uTW9kZWxDaGFuZ2U8Uz4pOiBib29sZWFuO1xuXG4gIC8qKiBXaGV0aGVyIHRoZSBsYXN0IHZhbHVlIHNldCBvbiB0aGUgaW5wdXQgd2FzIHZhbGlkLiAqL1xuICBwcm90ZWN0ZWQgX2xhc3RWYWx1ZVZhbGlkID0gZmFsc2U7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJvdGVjdGVkIF9lbGVtZW50UmVmOiBFbGVtZW50UmVmPEhUTUxJbnB1dEVsZW1lbnQ+LFxuICAgIEBPcHRpb25hbCgpIHB1YmxpYyBfZGF0ZUFkYXB0ZXI6IERhdGVBZGFwdGVyPEQ+LFxuICAgIEBPcHRpb25hbCgpIEBJbmplY3QoREFURV9GT1JNQVRTKSBwcml2YXRlIF9kYXRlRm9ybWF0czogRGF0ZUZvcm1hdHNcbiAgICAvLyBAT3B0aW9uYWwoKSBwcml2YXRlIF90cmFuc2xvY286IFRyYW5zbG9jb1NlcnZpY2VcbiAgKSB7XG4gICAgaWYgKCF0aGlzLl9kYXRlQWRhcHRlcikge1xuICAgICAgdGhyb3cgY3JlYXRlTWlzc2luZ0RhdGVJbXBsRXJyb3IoJ0RhdGVBZGFwdGVyJyk7XG4gICAgfVxuICAgIGlmICghdGhpcy5fZGF0ZUZvcm1hdHMpIHtcbiAgICAgIHRocm93IGNyZWF0ZU1pc3NpbmdEYXRlSW1wbEVycm9yKCdEQVRFX0ZPUk1BVFMnKTtcbiAgICB9XG5cbiAgICAvLyBVcGRhdGUgdGhlIGRpc3BsYXllZCBkYXRlIHdoZW4gdGhlIGxvY2FsZSBjaGFuZ2VzLlxuICAgIHRoaXMuX2xvY2FsZVN1YnNjcmlwdGlvbiA9IF9kYXRlQWRhcHRlci5sb2NhbGVDaGFuZ2VzLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICB0aGlzLl9hc3NpZ25WYWx1ZVByb2dyYW1tYXRpY2FsbHkodGhpcy52YWx1ZSk7XG4gICAgfSk7XG5cbiAgICAvLyB0aGlzLl90cmFuc2xvY29TdWJzY3JpcHRpb24gPSB0aGlzLl90cmFuc2xvY28ubGFuZ0NoYW5nZXMkLnN1YnNjcmliZSgobGFuZykgPT4ge1xuICAgIC8vICAgdGhpcy5fZGF0ZUFkYXB0ZXIuc2V0TG9jYWxlKGxhbmcpO1xuICAgIC8vIH0pO1xuICB9XG5cbiAgbmdBZnRlclZpZXdJbml0KCkge1xuICAgIHRoaXMuX2lzSW5pdGlhbGl6ZWQgPSB0cnVlO1xuICB9XG5cbiAgbmdPbkNoYW5nZXMoY2hhbmdlczogU2ltcGxlQ2hhbmdlcykge1xuICAgIGlmIChkYXRlSW5wdXRzSGF2ZUNoYW5nZWQoY2hhbmdlcywgdGhpcy5fZGF0ZUFkYXB0ZXIpKSB7XG4gICAgICB0aGlzLnN0YXRlQ2hhbmdlcy5uZXh0KHVuZGVmaW5lZCk7XG4gICAgfVxuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgdGhpcy5fdmFsdWVDaGFuZ2VzU3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XG4gICAgdGhpcy5fbG9jYWxlU3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XG4gICAgdGhpcy5fdHJhbnNsb2NvU3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XG4gICAgdGhpcy5zdGF0ZUNoYW5nZXMuY29tcGxldGUoKTtcbiAgfVxuXG4gIC8qKiBAZG9jcy1wcml2YXRlICovXG4gIHJlZ2lzdGVyT25WYWxpZGF0b3JDaGFuZ2UoZm46ICgpID0+IHZvaWQpOiB2b2lkIHtcbiAgICB0aGlzLl92YWxpZGF0b3JPbkNoYW5nZSA9IGZuO1xuICB9XG5cbiAgLyoqIEBkb2NzLXByaXZhdGUgKi9cbiAgdmFsaWRhdGUoYzogQWJzdHJhY3RDb250cm9sKTogVmFsaWRhdGlvbkVycm9ycyB8IG51bGwge1xuICAgIHJldHVybiB0aGlzLl92YWxpZGF0b3IgPyB0aGlzLl92YWxpZGF0b3IoYykgOiBudWxsO1xuICB9XG5cbiAgLy8gSW1wbGVtZW50ZWQgYXMgcGFydCBvZiBDb250cm9sVmFsdWVBY2Nlc3Nvci5cbiAgd3JpdGVWYWx1ZSh2YWx1ZTogRCk6IHZvaWQge1xuICAgIHRoaXMuX2Fzc2lnblZhbHVlUHJvZ3JhbW1hdGljYWxseSh2YWx1ZSk7XG4gIH1cblxuICAvLyBJbXBsZW1lbnRlZCBhcyBwYXJ0IG9mIENvbnRyb2xWYWx1ZUFjY2Vzc29yLlxuICByZWdpc3Rlck9uQ2hhbmdlKGZuOiAodmFsdWU6IGFueSkgPT4gdm9pZCk6IHZvaWQge1xuICAgIHRoaXMuX2N2YU9uQ2hhbmdlID0gZm47XG4gIH1cblxuICAvLyBJbXBsZW1lbnRlZCBhcyBwYXJ0IG9mIENvbnRyb2xWYWx1ZUFjY2Vzc29yLlxuICByZWdpc3Rlck9uVG91Y2hlZChmbjogKCkgPT4gdm9pZCk6IHZvaWQge1xuICAgIHRoaXMuX29uVG91Y2hlZCA9IGZuO1xuICB9XG5cbiAgLy8gSW1wbGVtZW50ZWQgYXMgcGFydCBvZiBDb250cm9sVmFsdWVBY2Nlc3Nvci5cbiAgc2V0RGlzYWJsZWRTdGF0ZShpc0Rpc2FibGVkOiBib29sZWFuKTogdm9pZCB7XG4gICAgdGhpcy5kaXNhYmxlZCA9IGlzRGlzYWJsZWQ7XG4gIH1cblxuICBfb25LZXlkb3duKGV2ZW50OiBLZXlib2FyZEV2ZW50KSB7XG4gICAgY29uc3QgY3RybFNoaWZ0TWV0YU1vZGlmaWVyczogTW9kaWZpZXJLZXlbXSA9IFsnY3RybEtleScsICdzaGlmdEtleScsICdtZXRhS2V5J107XG4gICAgY29uc3QgaXNBbHREb3duQXJyb3cgPVxuICAgICAgaGFzTW9kaWZpZXJLZXkoZXZlbnQsICdhbHRLZXknKSAmJlxuICAgICAgZXZlbnQua2V5Q29kZSA9PT0gRE9XTl9BUlJPVyAmJlxuICAgICAgY3RybFNoaWZ0TWV0YU1vZGlmaWVycy5ldmVyeSgobW9kaWZpZXI6IE1vZGlmaWVyS2V5KSA9PiAhaGFzTW9kaWZpZXJLZXkoZXZlbnQsIG1vZGlmaWVyKSk7XG5cbiAgICBpZiAoaXNBbHREb3duQXJyb3cgJiYgIXRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudC5yZWFkT25seSkge1xuICAgICAgdGhpcy5fb3BlblBvcHVwKCk7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH1cbiAgfVxuXG4gIF9vbklucHV0KHZhbHVlOiBzdHJpbmcpIHtcbiAgICBjb25zdCBsYXN0VmFsdWVXYXNWYWxpZCA9IHRoaXMuX2xhc3RWYWx1ZVZhbGlkO1xuICAgIGxldCBkYXRlID0gdGhpcy5fZGF0ZUFkYXB0ZXIucGFyc2UodmFsdWUsIHRoaXMuX2RhdGVGb3JtYXRzLnBhcnNlLmRhdGVJbnB1dCk7XG4gICAgdGhpcy5fbGFzdFZhbHVlVmFsaWQgPSB0aGlzLl9pc1ZhbGlkVmFsdWUoZGF0ZSk7XG4gICAgZGF0ZSA9IHRoaXMuX2RhdGVBZGFwdGVyLmdldFZhbGlkRGF0ZU9yTnVsbChkYXRlKTtcbiAgICBjb25zdCBoYXNDaGFuZ2VkID0gIXRoaXMuX2RhdGVBZGFwdGVyLnNhbWVEYXRlKGRhdGUsIHRoaXMudmFsdWUpO1xuXG4gICAgLy8gV2UgbmVlZCB0byBmaXJlIHRoZSBDVkEgY2hhbmdlIGV2ZW50IGZvciBhbGxcbiAgICAvLyBudWxscywgb3RoZXJ3aXNlIHRoZSB2YWxpZGF0b3JzIHdvbid0IHJ1bi5cbiAgICBpZiAoIWRhdGUgfHwgaGFzQ2hhbmdlZCkge1xuICAgICAgdGhpcy5fY3ZhT25DaGFuZ2UoZGF0ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIENhbGwgdGhlIENWQSBjaGFuZ2UgaGFuZGxlciBmb3IgaW52YWxpZCB2YWx1ZXNcbiAgICAgIC8vIHNpbmNlIHRoaXMgaXMgd2hhdCBtYXJrcyB0aGUgY29udHJvbCBhcyBkaXJ0eS5cbiAgICAgIGlmICh2YWx1ZSAmJiAhdGhpcy52YWx1ZSkge1xuICAgICAgICB0aGlzLl9jdmFPbkNoYW5nZShkYXRlKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGxhc3RWYWx1ZVdhc1ZhbGlkICE9PSB0aGlzLl9sYXN0VmFsdWVWYWxpZCkge1xuICAgICAgICB0aGlzLl92YWxpZGF0b3JPbkNoYW5nZSgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChoYXNDaGFuZ2VkKSB7XG4gICAgICB0aGlzLl9hc3NpZ25WYWx1ZShkYXRlKTtcbiAgICAgIHRoaXMuZGF0ZUlucHV0LmVtaXQobmV3IERhdGVwaWNrZXJJbnB1dEV2ZW50KHRoaXMsIHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudCkpO1xuICAgIH1cbiAgfVxuXG4gIF9vbkNoYW5nZSgpIHtcbiAgICB0aGlzLmRhdGVDaGFuZ2UuZW1pdChuZXcgRGF0ZXBpY2tlcklucHV0RXZlbnQodGhpcywgdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50KSk7XG4gIH1cblxuICAvKiogSGFuZGxlcyBibHVyIGV2ZW50cyBvbiB0aGUgaW5wdXQuICovXG4gIF9vbkJsdXIoKSB7XG4gICAgLy8gUmVmb3JtYXQgdGhlIGlucHV0IG9ubHkgaWYgd2UgaGF2ZSBhIHZhbGlkIHZhbHVlLlxuICAgIGlmICh0aGlzLnZhbHVlKSB7XG4gICAgICB0aGlzLl9mb3JtYXRWYWx1ZSh0aGlzLnZhbHVlKTtcbiAgICB9XG5cbiAgICB0aGlzLl9vblRvdWNoZWQoKTtcbiAgfVxuXG4gIC8qKiBGb3JtYXRzIGEgdmFsdWUgYW5kIHNldHMgaXQgb24gdGhlIGlucHV0IGVsZW1lbnQuICovXG4gIHByb3RlY3RlZCBfZm9ybWF0VmFsdWUodmFsdWU6IEQgfCBudWxsKSB7XG4gICAgdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LnZhbHVlID1cbiAgICAgIHZhbHVlICE9IG51bGwgPyB0aGlzLl9kYXRlQWRhcHRlci5mb3JtYXQodmFsdWUsIHRoaXMuX2RhdGVGb3JtYXRzLmRpc3BsYXkuZGF0ZUlucHV0KSA6ICcnO1xuICB9XG5cbiAgLyoqIEFzc2lnbnMgYSB2YWx1ZSB0byB0aGUgbW9kZWwuICovXG4gIHByaXZhdGUgX2Fzc2lnblZhbHVlKHZhbHVlOiBEIHwgbnVsbCkge1xuICAgIC8vIFdlIG1heSBnZXQgc29tZSBpbmNvbWluZyB2YWx1ZXMgYmVmb3JlIHRoZSBtb2RlbCB3YXNcbiAgICAvLyBhc3NpZ25lZC4gU2F2ZSB0aGUgdmFsdWUgc28gdGhhdCB3ZSBjYW4gYXNzaWduIGl0IGxhdGVyLlxuICAgIGlmICh0aGlzLl9tb2RlbCkge1xuICAgICAgdGhpcy5fYXNzaWduVmFsdWVUb01vZGVsKHZhbHVlKTtcbiAgICAgIHRoaXMuX3BlbmRpbmdWYWx1ZSA9IG51bGw7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX3BlbmRpbmdWYWx1ZSA9IHZhbHVlO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBXaGV0aGVyIGEgdmFsdWUgaXMgY29uc2lkZXJlZCB2YWxpZC4gKi9cbiAgcHJpdmF0ZSBfaXNWYWxpZFZhbHVlKHZhbHVlOiBEIHwgbnVsbCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAhdmFsdWUgfHwgdGhpcy5fZGF0ZUFkYXB0ZXIuaXNWYWxpZCh2YWx1ZSk7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIHdoZXRoZXIgYSBwYXJlbnQgY29udHJvbCBpcyBkaXNhYmxlZC4gVGhpcyBpcyBpbiBwbGFjZSBzbyB0aGF0IGl0IGNhbiBiZSBvdmVycmlkZGVuXG4gICAqIGJ5IGlucHV0cyBleHRlbmRpbmcgdGhpcyBvbmUgd2hpY2ggY2FuIGJlIHBsYWNlZCBpbnNpZGUgb2YgYSBncm91cCB0aGF0IGNhbiBiZSBkaXNhYmxlZC5cbiAgICovXG4gIHByb3RlY3RlZCBfcGFyZW50RGlzYWJsZWQoKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLyoqIFByb2dyYW1tYXRpY2FsbHkgYXNzaWducyBhIHZhbHVlIHRvIHRoZSBpbnB1dC4gKi9cbiAgcHJvdGVjdGVkIF9hc3NpZ25WYWx1ZVByb2dyYW1tYXRpY2FsbHkodmFsdWU6IEQgfCBudWxsKSB7XG4gICAgdmFsdWUgPSB0aGlzLl9kYXRlQWRhcHRlci5kZXNlcmlhbGl6ZSh2YWx1ZSk7XG4gICAgdGhpcy5fbGFzdFZhbHVlVmFsaWQgPSB0aGlzLl9pc1ZhbGlkVmFsdWUodmFsdWUpO1xuICAgIHZhbHVlID0gdGhpcy5fZGF0ZUFkYXB0ZXIuZ2V0VmFsaWREYXRlT3JOdWxsKHZhbHVlKTtcbiAgICB0aGlzLl9hc3NpZ25WYWx1ZSh2YWx1ZSk7XG4gICAgdGhpcy5fZm9ybWF0VmFsdWUodmFsdWUpO1xuICB9XG5cbiAgLyoqIEdldHMgd2hldGhlciBhIHZhbHVlIG1hdGNoZXMgdGhlIGN1cnJlbnQgZGF0ZSBmaWx0ZXIuICovXG4gIF9tYXRjaGVzRmlsdGVyKHZhbHVlOiBEIHwgbnVsbCk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IGZpbHRlciA9IHRoaXMuX2dldERhdGVGaWx0ZXIoKTtcbiAgICByZXR1cm4gIWZpbHRlciB8fCBmaWx0ZXIodmFsdWUpO1xuICB9XG59XG5cbi8qKlxuICogQ2hlY2tzIHdoZXRoZXIgdGhlIGBTaW1wbGVDaGFuZ2VzYCBvYmplY3QgZnJvbSBhbiBgbmdPbkNoYW5nZXNgXG4gKiBjYWxsYmFjayBoYXMgYW55IGNoYW5nZXMsIGFjY291bnRpbmcgZm9yIGRhdGUgb2JqZWN0cy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRhdGVJbnB1dHNIYXZlQ2hhbmdlZChcbiAgY2hhbmdlczogU2ltcGxlQ2hhbmdlcyxcbiAgYWRhcHRlcjogRGF0ZUFkYXB0ZXI8dW5rbm93bj5cbik6IGJvb2xlYW4ge1xuICBjb25zdCBrZXlzID0gT2JqZWN0LmtleXMoY2hhbmdlcyk7XG5cbiAgZm9yIChjb25zdCBrZXkgb2Yga2V5cykge1xuICAgIGNvbnN0IHsgcHJldmlvdXNWYWx1ZSwgY3VycmVudFZhbHVlIH0gPSBjaGFuZ2VzW2tleV07XG5cbiAgICBpZiAoYWRhcHRlci5pc0RhdGVJbnN0YW5jZShwcmV2aW91c1ZhbHVlKSAmJiBhZGFwdGVyLmlzRGF0ZUluc3RhbmNlKGN1cnJlbnRWYWx1ZSkpIHtcbiAgICAgIGlmICghYWRhcHRlci5zYW1lRGF0ZShwcmV2aW91c1ZhbHVlLCBjdXJyZW50VmFsdWUpKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gZmFsc2U7XG59XG4iXX0=