/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/* eslint-disable @angular-eslint/directive-class-suffix */
import { Directive, forwardRef, Inject, InjectionToken, Input, Optional, } from '@angular/core';
import { NG_VALIDATORS, NG_VALUE_ACCESSOR, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { DATE_FORMATS } from '../adapter';
import { DatepickerInputBase } from './datepicker-input-base';
import * as i0 from "@angular/core";
import * as i1 from "../adapter";
/** @docs-private */
export const DATEPICKER_VALUE_ACCESSOR = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => DatepickerInput),
    multi: true,
};
/** @docs-private */
export const DATEPICKER_VALIDATORS = {
    provide: NG_VALIDATORS,
    useExisting: forwardRef(() => DatepickerInput),
    multi: true,
};
export const INPUT_VALUE_ACCESSOR = {
    provide: new InjectionToken('INPUT_VALUE_ACCESSOR'),
    useExisting: forwardRef(() => DatepickerInput),
};
/** Directive used to connect an input to a Datepicker. */
export class DatepickerInput extends DatepickerInputBase {
    _closedSubscription = Subscription.EMPTY;
    /** The datepicker that this input is associated with. */
    set datepicker(datepicker) {
        if (datepicker) {
            this._datepicker = datepicker;
            this._closedSubscription = datepicker.closedStream.subscribe(() => this._onTouched());
            this._registerModel(datepicker.registerInput(this));
        }
    }
    _datepicker;
    /** The minimum valid date. */
    get min() {
        return this._min;
    }
    set min(value) {
        const validValue = this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(value));
        if (!this._dateAdapter.sameDate(validValue, this._min)) {
            this._min = validValue;
            this._validatorOnChange();
        }
    }
    _min;
    /** The maximum valid date. */
    get max() {
        return this._max;
    }
    set max(value) {
        const validValue = this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(value));
        if (!this._dateAdapter.sameDate(validValue, this._max)) {
            this._max = validValue;
            this._validatorOnChange();
        }
    }
    _max;
    /** Function that can be used to filter out dates within the datepicker. */
    get dateFilter() {
        return this._dateFilter;
    }
    set dateFilter(value) {
        const wasMatchingValue = this._matchesFilter(this.value);
        this._dateFilter = value;
        if (this._matchesFilter(this.value) !== wasMatchingValue) {
            this._validatorOnChange();
        }
    }
    _dateFilter;
    /** The combined form control validator for this input. */
    _validator;
    constructor(elementRef, dateAdapter, dateFormats) {
        super(elementRef, dateAdapter, dateFormats);
        this._validator = Validators.compose(super._getValidators());
    }
    /**
     * Gets the element that the datepicker popup should be connected to.
     * @return The element to connect the popup to.
     */
    getConnectedOverlayOrigin() {
        return this._elementRef;
    }
    /** Gets the ID of an element that should be used a description for the calendar overlay. */
    getOverlayLabelId() {
        return this._elementRef.nativeElement.getAttribute('aria-labelledby');
    }
    /** Gets the value at which the calendar should start. */
    getStartValue() {
        return this.value;
    }
    ngOnDestroy() {
        super.ngOnDestroy();
        this._closedSubscription.unsubscribe();
    }
    /** Opens the associated datepicker. */
    _openPopup() {
        if (this._datepicker) {
            this._datepicker.open();
        }
    }
    _getValueFromModel(modelValue) {
        return modelValue;
    }
    _assignValueToModel(value) {
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
    _getDateFilter() {
        return this._dateFilter;
    }
    _shouldHandleChangeEvent(event) {
        return event.source !== this;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: DatepickerInput, deps: [{ token: i0.ElementRef }, { token: i1.DateAdapter, optional: true }, { token: DATE_FORMATS, optional: true }], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.8", type: DatepickerInput, isStandalone: true, selector: "input[datepicker]", inputs: { datepicker: "datepicker", min: "min", max: "max", dateFilter: ["datepickerFilter", "dateFilter"] }, host: { listeners: { "input": "_onInput($event.target.value)", "change": "_onChange()", "blur": "_onBlur()", "keydown": "_onKeydown($event)" }, properties: { "attr.aria-owns": "(_datepicker?.opened && _datepicker.id) || null", "attr.min": "min ? _dateAdapter.toIso8601(min) : null", "attr.max": "max ? _dateAdapter.toIso8601(max) : null", "disabled": "disabled" } }, providers: [DATEPICKER_VALUE_ACCESSOR, DATEPICKER_VALIDATORS, INPUT_VALUE_ACCESSOR], exportAs: ["datepickerInput"], usesInheritance: true, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: DatepickerInput, decorators: [{
            type: Directive,
            args: [{
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
                }]
        }], ctorParameters: () => [{ type: i0.ElementRef }, { type: i1.DateAdapter, decorators: [{
                    type: Optional
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [DATE_FORMATS]
                }] }], propDecorators: { datepicker: [{
                type: Input
            }], min: [{
                type: Input
            }], max: [{
                type: Input
            }], dateFilter: [{
                type: Input,
                args: ['datepickerFilter']
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZXBpY2tlci1pbnB1dC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9saWIvZGF0ZS1waWNrZXIvZGF0ZXBpY2tlci1pbnB1dC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFDSCwyREFBMkQ7QUFFM0QsT0FBTyxFQUNMLFNBQVMsRUFFVCxVQUFVLEVBQ1YsTUFBTSxFQUNOLGNBQWMsRUFDZCxLQUFLLEVBRUwsUUFBUSxHQUNULE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBRSxhQUFhLEVBQUUsaUJBQWlCLEVBQWUsVUFBVSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFDM0YsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUVwQyxPQUFPLEVBQWUsWUFBWSxFQUFlLE1BQU0sWUFBWSxDQUFDO0FBQ3BFLE9BQU8sRUFBRSxtQkFBbUIsRUFBZ0IsTUFBTSx5QkFBeUIsQ0FBQzs7O0FBSTVFLG9CQUFvQjtBQUNwQixNQUFNLENBQUMsTUFBTSx5QkFBeUIsR0FBUTtJQUM1QyxPQUFPLEVBQUUsaUJBQWlCO0lBQzFCLFdBQVcsRUFBRSxVQUFVLENBQUMsR0FBRyxFQUFFLENBQUMsZUFBZSxDQUFDO0lBQzlDLEtBQUssRUFBRSxJQUFJO0NBQ1osQ0FBQztBQUVGLG9CQUFvQjtBQUNwQixNQUFNLENBQUMsTUFBTSxxQkFBcUIsR0FBUTtJQUN4QyxPQUFPLEVBQUUsYUFBYTtJQUN0QixXQUFXLEVBQUUsVUFBVSxDQUFDLEdBQUcsRUFBRSxDQUFDLGVBQWUsQ0FBQztJQUM5QyxLQUFLLEVBQUUsSUFBSTtDQUNaLENBQUM7QUFFRixNQUFNLENBQUMsTUFBTSxvQkFBb0IsR0FBUTtJQUN2QyxPQUFPLEVBQUUsSUFBSSxjQUFjLENBQWlCLHNCQUFzQixDQUFDO0lBQ25FLFdBQVcsRUFBRSxVQUFVLENBQUMsR0FBRyxFQUFFLENBQUMsZUFBZSxDQUFDO0NBQy9DLENBQUM7QUFF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RSxvQkFBb0IsQ0FBQzs7MkZBYXhFLGVBQWU7a0JBaEIzQixTQUFTO21CQUFDO29CQUNULFVBQVUsRUFBRSxJQUFJO29CQUNoQixRQUFRLEVBQUUsbUJBQW1CO29CQUM3QixTQUFTLEVBQUUsQ0FBQyx5QkFBeUIsRUFBRSxxQkFBcUIsRUFBRSxvQkFBb0IsQ0FBQztvQkFDbkYsSUFBSSxFQUFFO3dCQUNKLGtCQUFrQixFQUFFLGlEQUFpRDt3QkFDckUsWUFBWSxFQUFFLDBDQUEwQzt3QkFDeEQsWUFBWSxFQUFFLDBDQUEwQzt3QkFDeEQsWUFBWSxFQUFFLFVBQVU7d0JBQ3hCLFNBQVMsRUFBRSwrQkFBK0I7d0JBQzFDLFVBQVUsRUFBRSxhQUFhO3dCQUN6QixRQUFRLEVBQUUsV0FBVzt3QkFDckIsV0FBVyxFQUFFLG9CQUFvQjtxQkFDbEM7b0JBQ0QsUUFBUSxFQUFFLGlCQUFpQjtpQkFDNUI7OzBCQW9FSSxRQUFROzswQkFDUixRQUFROzswQkFBSSxNQUFNOzJCQUFDLFlBQVk7eUNBNUQ5QixVQUFVO3NCQURiLEtBQUs7Z0JBWUYsR0FBRztzQkFETixLQUFLO2dCQWdCRixHQUFHO3NCQUROLEtBQUs7Z0JBZ0JGLFVBQVU7c0JBRGIsS0FBSzt1QkFBQyxrQkFBa0IiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbi8qIGVzbGludC1kaXNhYmxlIEBhbmd1bGFyLWVzbGludC9kaXJlY3RpdmUtY2xhc3Mtc3VmZml4ICovXG5cbmltcG9ydCB7XG4gIERpcmVjdGl2ZSxcbiAgRWxlbWVudFJlZixcbiAgZm9yd2FyZFJlZixcbiAgSW5qZWN0LFxuICBJbmplY3Rpb25Ub2tlbixcbiAgSW5wdXQsXG4gIE9uRGVzdHJveSxcbiAgT3B0aW9uYWwsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgTkdfVkFMSURBVE9SUywgTkdfVkFMVUVfQUNDRVNTT1IsIFZhbGlkYXRvckZuLCBWYWxpZGF0b3JzIH0gZnJvbSAnQGFuZ3VsYXIvZm9ybXMnO1xuaW1wb3J0IHsgU3Vic2NyaXB0aW9uIH0gZnJvbSAncnhqcyc7XG5cbmltcG9ydCB7IERhdGVBZGFwdGVyLCBEQVRFX0ZPUk1BVFMsIERhdGVGb3JtYXRzIH0gZnJvbSAnLi4vYWRhcHRlcic7XG5pbXBvcnQgeyBEYXRlcGlja2VySW5wdXRCYXNlLCBEYXRlRmlsdGVyRm4gfSBmcm9tICcuL2RhdGVwaWNrZXItaW5wdXQtYmFzZSc7XG5pbXBvcnQgeyBEYXRlcGlja2VyQ29udHJvbCwgRGF0ZXBpY2tlclBhbmVsIH0gZnJvbSAnLi9kYXRlcGlja2VyLWJhc2UnO1xuaW1wb3J0IHsgRGF0ZVNlbGVjdGlvbk1vZGVsQ2hhbmdlIH0gZnJvbSAnLi9kYXRlLXNlbGVjdGlvbi1tb2RlbCc7XG5cbi8qKiBAZG9jcy1wcml2YXRlICovXG5leHBvcnQgY29uc3QgREFURVBJQ0tFUl9WQUxVRV9BQ0NFU1NPUjogYW55ID0ge1xuICBwcm92aWRlOiBOR19WQUxVRV9BQ0NFU1NPUixcbiAgdXNlRXhpc3Rpbmc6IGZvcndhcmRSZWYoKCkgPT4gRGF0ZXBpY2tlcklucHV0KSxcbiAgbXVsdGk6IHRydWUsXG59O1xuXG4vKiogQGRvY3MtcHJpdmF0ZSAqL1xuZXhwb3J0IGNvbnN0IERBVEVQSUNLRVJfVkFMSURBVE9SUzogYW55ID0ge1xuICBwcm92aWRlOiBOR19WQUxJREFUT1JTLFxuICB1c2VFeGlzdGluZzogZm9yd2FyZFJlZigoKSA9PiBEYXRlcGlja2VySW5wdXQpLFxuICBtdWx0aTogdHJ1ZSxcbn07XG5cbmV4cG9ydCBjb25zdCBJTlBVVF9WQUxVRV9BQ0NFU1NPUjogYW55ID0ge1xuICBwcm92aWRlOiBuZXcgSW5qZWN0aW9uVG9rZW48eyB2YWx1ZTogYW55IH0+KCdJTlBVVF9WQUxVRV9BQ0NFU1NPUicpLFxuICB1c2VFeGlzdGluZzogZm9yd2FyZFJlZigoKSA9PiBEYXRlcGlja2VySW5wdXQpLFxufTtcblxuLyoqIERpcmVjdGl2ZSB1c2VkIHRvIGNvbm5lY3QgYW4gaW5wdXQgdG8gYSBEYXRlcGlja2VyLiAqL1xuQERpcmVjdGl2ZSh7XG4gIHN0YW5kYWxvbmU6IHRydWUsXG4gIHNlbGVjdG9yOiAnaW5wdXRbZGF0ZXBpY2tlcl0nLFxuICBwcm92aWRlcnM6IFtEQVRFUElDS0VSX1ZBTFVFX0FDQ0VTU09SLCBEQVRFUElDS0VSX1ZBTElEQVRPUlMsIElOUFVUX1ZBTFVFX0FDQ0VTU09SXSxcbiAgaG9zdDoge1xuICAgICdbYXR0ci5hcmlhLW93bnNdJzogJyhfZGF0ZXBpY2tlcj8ub3BlbmVkICYmIF9kYXRlcGlja2VyLmlkKSB8fCBudWxsJyxcbiAgICAnW2F0dHIubWluXSc6ICdtaW4gPyBfZGF0ZUFkYXB0ZXIudG9Jc284NjAxKG1pbikgOiBudWxsJyxcbiAgICAnW2F0dHIubWF4XSc6ICdtYXggPyBfZGF0ZUFkYXB0ZXIudG9Jc284NjAxKG1heCkgOiBudWxsJyxcbiAgICAnW2Rpc2FibGVkXSc6ICdkaXNhYmxlZCcsXG4gICAgJyhpbnB1dCknOiAnX29uSW5wdXQoJGV2ZW50LnRhcmdldC52YWx1ZSknLFxuICAgICcoY2hhbmdlKSc6ICdfb25DaGFuZ2UoKScsXG4gICAgJyhibHVyKSc6ICdfb25CbHVyKCknLFxuICAgICcoa2V5ZG93biknOiAnX29uS2V5ZG93bigkZXZlbnQpJyxcbiAgfSxcbiAgZXhwb3J0QXM6ICdkYXRlcGlja2VySW5wdXQnLFxufSlcbmV4cG9ydCBjbGFzcyBEYXRlcGlja2VySW5wdXQ8RD5cbiAgZXh0ZW5kcyBEYXRlcGlja2VySW5wdXRCYXNlPEQgfCBudWxsLCBEPlxuICBpbXBsZW1lbnRzIERhdGVwaWNrZXJDb250cm9sPEQgfCBudWxsPiwgT25EZXN0cm95XG57XG4gIHByaXZhdGUgX2Nsb3NlZFN1YnNjcmlwdGlvbiA9IFN1YnNjcmlwdGlvbi5FTVBUWTtcblxuICAvKiogVGhlIGRhdGVwaWNrZXIgdGhhdCB0aGlzIGlucHV0IGlzIGFzc29jaWF0ZWQgd2l0aC4gKi9cbiAgQElucHV0KClcbiAgc2V0IGRhdGVwaWNrZXIoZGF0ZXBpY2tlcjogRGF0ZXBpY2tlclBhbmVsPERhdGVwaWNrZXJDb250cm9sPEQ+LCBEIHwgbnVsbCwgRD4pIHtcbiAgICBpZiAoZGF0ZXBpY2tlcikge1xuICAgICAgdGhpcy5fZGF0ZXBpY2tlciA9IGRhdGVwaWNrZXI7XG4gICAgICB0aGlzLl9jbG9zZWRTdWJzY3JpcHRpb24gPSBkYXRlcGlja2VyLmNsb3NlZFN0cmVhbS5zdWJzY3JpYmUoKCkgPT4gdGhpcy5fb25Ub3VjaGVkKCkpO1xuICAgICAgdGhpcy5fcmVnaXN0ZXJNb2RlbChkYXRlcGlja2VyLnJlZ2lzdGVySW5wdXQodGhpcykpO1xuICAgIH1cbiAgfVxuICBfZGF0ZXBpY2tlcjogRGF0ZXBpY2tlclBhbmVsPERhdGVwaWNrZXJDb250cm9sPEQ+LCBEIHwgbnVsbCwgRD47XG5cbiAgLyoqIFRoZSBtaW5pbXVtIHZhbGlkIGRhdGUuICovXG4gIEBJbnB1dCgpXG4gIGdldCBtaW4oKTogRCB8IG51bGwge1xuICAgIHJldHVybiB0aGlzLl9taW47XG4gIH1cbiAgc2V0IG1pbih2YWx1ZTogRCB8IG51bGwpIHtcbiAgICBjb25zdCB2YWxpZFZhbHVlID0gdGhpcy5fZGF0ZUFkYXB0ZXIuZ2V0VmFsaWREYXRlT3JOdWxsKHRoaXMuX2RhdGVBZGFwdGVyLmRlc2VyaWFsaXplKHZhbHVlKSk7XG5cbiAgICBpZiAoIXRoaXMuX2RhdGVBZGFwdGVyLnNhbWVEYXRlKHZhbGlkVmFsdWUsIHRoaXMuX21pbikpIHtcbiAgICAgIHRoaXMuX21pbiA9IHZhbGlkVmFsdWU7XG4gICAgICB0aGlzLl92YWxpZGF0b3JPbkNoYW5nZSgpO1xuICAgIH1cbiAgfVxuICBwcml2YXRlIF9taW46IEQgfCBudWxsO1xuXG4gIC8qKiBUaGUgbWF4aW11bSB2YWxpZCBkYXRlLiAqL1xuICBASW5wdXQoKVxuICBnZXQgbWF4KCk6IEQgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5fbWF4O1xuICB9XG4gIHNldCBtYXgodmFsdWU6IEQgfCBudWxsKSB7XG4gICAgY29uc3QgdmFsaWRWYWx1ZSA9IHRoaXMuX2RhdGVBZGFwdGVyLmdldFZhbGlkRGF0ZU9yTnVsbCh0aGlzLl9kYXRlQWRhcHRlci5kZXNlcmlhbGl6ZSh2YWx1ZSkpO1xuXG4gICAgaWYgKCF0aGlzLl9kYXRlQWRhcHRlci5zYW1lRGF0ZSh2YWxpZFZhbHVlLCB0aGlzLl9tYXgpKSB7XG4gICAgICB0aGlzLl9tYXggPSB2YWxpZFZhbHVlO1xuICAgICAgdGhpcy5fdmFsaWRhdG9yT25DaGFuZ2UoKTtcbiAgICB9XG4gIH1cbiAgcHJpdmF0ZSBfbWF4OiBEIHwgbnVsbDtcblxuICAvKiogRnVuY3Rpb24gdGhhdCBjYW4gYmUgdXNlZCB0byBmaWx0ZXIgb3V0IGRhdGVzIHdpdGhpbiB0aGUgZGF0ZXBpY2tlci4gKi9cbiAgQElucHV0KCdkYXRlcGlja2VyRmlsdGVyJylcbiAgZ2V0IGRhdGVGaWx0ZXIoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2RhdGVGaWx0ZXI7XG4gIH1cbiAgc2V0IGRhdGVGaWx0ZXIodmFsdWU6IERhdGVGaWx0ZXJGbjxEIHwgbnVsbD4pIHtcbiAgICBjb25zdCB3YXNNYXRjaGluZ1ZhbHVlID0gdGhpcy5fbWF0Y2hlc0ZpbHRlcih0aGlzLnZhbHVlKTtcbiAgICB0aGlzLl9kYXRlRmlsdGVyID0gdmFsdWU7XG5cbiAgICBpZiAodGhpcy5fbWF0Y2hlc0ZpbHRlcih0aGlzLnZhbHVlKSAhPT0gd2FzTWF0Y2hpbmdWYWx1ZSkge1xuICAgICAgdGhpcy5fdmFsaWRhdG9yT25DaGFuZ2UoKTtcbiAgICB9XG4gIH1cbiAgcHJpdmF0ZSBfZGF0ZUZpbHRlcjogRGF0ZUZpbHRlckZuPEQgfCBudWxsPjtcblxuICAvKiogVGhlIGNvbWJpbmVkIGZvcm0gY29udHJvbCB2YWxpZGF0b3IgZm9yIHRoaXMgaW5wdXQuICovXG4gIHByb3RlY3RlZCBfdmFsaWRhdG9yOiBWYWxpZGF0b3JGbiB8IG51bGw7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgZWxlbWVudFJlZjogRWxlbWVudFJlZjxIVE1MSW5wdXRFbGVtZW50PixcbiAgICBAT3B0aW9uYWwoKSBkYXRlQWRhcHRlcjogRGF0ZUFkYXB0ZXI8RD4sXG4gICAgQE9wdGlvbmFsKCkgQEluamVjdChEQVRFX0ZPUk1BVFMpIGRhdGVGb3JtYXRzOiBEYXRlRm9ybWF0c1xuICApIHtcbiAgICBzdXBlcihlbGVtZW50UmVmLCBkYXRlQWRhcHRlciwgZGF0ZUZvcm1hdHMpO1xuICAgIHRoaXMuX3ZhbGlkYXRvciA9IFZhbGlkYXRvcnMuY29tcG9zZShzdXBlci5fZ2V0VmFsaWRhdG9ycygpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBlbGVtZW50IHRoYXQgdGhlIGRhdGVwaWNrZXIgcG9wdXAgc2hvdWxkIGJlIGNvbm5lY3RlZCB0by5cbiAgICogQHJldHVybiBUaGUgZWxlbWVudCB0byBjb25uZWN0IHRoZSBwb3B1cCB0by5cbiAgICovXG4gIGdldENvbm5lY3RlZE92ZXJsYXlPcmlnaW4oKTogRWxlbWVudFJlZiB7XG4gICAgcmV0dXJuIHRoaXMuX2VsZW1lbnRSZWY7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgSUQgb2YgYW4gZWxlbWVudCB0aGF0IHNob3VsZCBiZSB1c2VkIGEgZGVzY3JpcHRpb24gZm9yIHRoZSBjYWxlbmRhciBvdmVybGF5LiAqL1xuICBnZXRPdmVybGF5TGFiZWxJZCgpOiBzdHJpbmcgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LmdldEF0dHJpYnV0ZSgnYXJpYS1sYWJlbGxlZGJ5Jyk7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgdmFsdWUgYXQgd2hpY2ggdGhlIGNhbGVuZGFyIHNob3VsZCBzdGFydC4gKi9cbiAgZ2V0U3RhcnRWYWx1ZSgpOiBEIHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMudmFsdWU7XG4gIH1cblxuICBvdmVycmlkZSBuZ09uRGVzdHJveSgpIHtcbiAgICBzdXBlci5uZ09uRGVzdHJveSgpO1xuICAgIHRoaXMuX2Nsb3NlZFN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xuICB9XG5cbiAgLyoqIE9wZW5zIHRoZSBhc3NvY2lhdGVkIGRhdGVwaWNrZXIuICovXG4gIHByb3RlY3RlZCBfb3BlblBvcHVwKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9kYXRlcGlja2VyKSB7XG4gICAgICB0aGlzLl9kYXRlcGlja2VyLm9wZW4oKTtcbiAgICB9XG4gIH1cblxuICBwcm90ZWN0ZWQgX2dldFZhbHVlRnJvbU1vZGVsKG1vZGVsVmFsdWU6IEQgfCBudWxsKTogRCB8IG51bGwge1xuICAgIHJldHVybiBtb2RlbFZhbHVlO1xuICB9XG5cbiAgcHJvdGVjdGVkIF9hc3NpZ25WYWx1ZVRvTW9kZWwodmFsdWU6IEQgfCBudWxsKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX21vZGVsKSB7XG4gICAgICB0aGlzLl9tb2RlbC51cGRhdGVTZWxlY3Rpb24odmFsdWUsIHRoaXMpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSBpbnB1dCdzIG1pbmltdW0gZGF0ZS4gKi9cbiAgX2dldE1pbkRhdGUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX21pbjtcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSBpbnB1dCdzIG1heGltdW0gZGF0ZS4gKi9cbiAgX2dldE1heERhdGUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX21heDtcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSBpbnB1dCdzIGRhdGUgZmlsdGVyaW5nIGZ1bmN0aW9uLiAqL1xuICBwcm90ZWN0ZWQgX2dldERhdGVGaWx0ZXIoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2RhdGVGaWx0ZXI7XG4gIH1cblxuICBwcm90ZWN0ZWQgX3Nob3VsZEhhbmRsZUNoYW5nZUV2ZW50KGV2ZW50OiBEYXRlU2VsZWN0aW9uTW9kZWxDaGFuZ2U8RD4pIHtcbiAgICByZXR1cm4gZXZlbnQuc291cmNlICE9PSB0aGlzO1xuICB9XG59XG4iXX0=