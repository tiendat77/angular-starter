/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { DatepickerBase } from './datepicker-base';
import { SINGLE_DATE_SELECTION_MODEL_PROVIDER } from './date-selection-model';
import * as i0 from "@angular/core";
export class Datepicker extends DatepickerBase {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: Datepicker, deps: null, target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "18.2.8", type: Datepicker, isStandalone: true, selector: "date-picker", providers: [
            SINGLE_DATE_SELECTION_MODEL_PROVIDER,
            { provide: DatepickerBase, useExisting: Datepicker },
        ], exportAs: ["datepicker"], usesInheritance: true, ngImport: i0, template: '', isInline: true, changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: Datepicker, decorators: [{
            type: Component,
            args: [{
                    selector: 'date-picker',
                    template: '',
                    exportAs: 'datepicker',
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    encapsulation: ViewEncapsulation.None,
                    providers: [
                        SINGLE_DATE_SELECTION_MODEL_PROVIDER,
                        { provide: DatepickerBase, useExisting: Datepicker },
                    ],
                    standalone: true,
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZS1waWNrZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvbGliL2RhdGUtcGlja2VyL2RhdGUtcGlja2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBRSx1QkFBdUIsRUFBRSxTQUFTLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDdEYsT0FBTyxFQUFFLGNBQWMsRUFBcUIsTUFBTSxtQkFBbUIsQ0FBQztBQUN0RSxPQUFPLEVBQUUsb0NBQW9DLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQzs7QUFjOUUsTUFBTSxPQUFPLFVBQWMsU0FBUSxjQUFpRDt1R0FBdkUsVUFBVTsyRkFBVixVQUFVLDBEQU5WO1lBQ1Qsb0NBQW9DO1lBQ3BDLEVBQUUsT0FBTyxFQUFFLGNBQWMsRUFBRSxXQUFXLEVBQUUsVUFBVSxFQUFFO1NBQ3JELDJFQVBTLEVBQUU7OzJGQVVELFVBQVU7a0JBWnRCLFNBQVM7bUJBQUM7b0JBQ1QsUUFBUSxFQUFFLGFBQWE7b0JBQ3ZCLFFBQVEsRUFBRSxFQUFFO29CQUNaLFFBQVEsRUFBRSxZQUFZO29CQUN0QixlQUFlLEVBQUUsdUJBQXVCLENBQUMsTUFBTTtvQkFDL0MsYUFBYSxFQUFFLGlCQUFpQixDQUFDLElBQUk7b0JBQ3JDLFNBQVMsRUFBRTt3QkFDVCxvQ0FBb0M7d0JBQ3BDLEVBQUUsT0FBTyxFQUFFLGNBQWMsRUFBRSxXQUFXLFlBQVksRUFBRTtxQkFDckQ7b0JBQ0QsVUFBVSxFQUFFLElBQUk7aUJBQ2pCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7IENoYW5nZURldGVjdGlvblN0cmF0ZWd5LCBDb21wb25lbnQsIFZpZXdFbmNhcHN1bGF0aW9uIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBEYXRlcGlja2VyQmFzZSwgRGF0ZXBpY2tlckNvbnRyb2wgfSBmcm9tICcuL2RhdGVwaWNrZXItYmFzZSc7XG5pbXBvcnQgeyBTSU5HTEVfREFURV9TRUxFQ1RJT05fTU9ERUxfUFJPVklERVIgfSBmcm9tICcuL2RhdGUtc2VsZWN0aW9uLW1vZGVsJztcblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnZGF0ZS1waWNrZXInLFxuICB0ZW1wbGF0ZTogJycsXG4gIGV4cG9ydEFzOiAnZGF0ZXBpY2tlcicsXG4gIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuT25QdXNoLFxuICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lLFxuICBwcm92aWRlcnM6IFtcbiAgICBTSU5HTEVfREFURV9TRUxFQ1RJT05fTU9ERUxfUFJPVklERVIsXG4gICAgeyBwcm92aWRlOiBEYXRlcGlja2VyQmFzZSwgdXNlRXhpc3Rpbmc6IERhdGVwaWNrZXIgfSxcbiAgXSxcbiAgc3RhbmRhbG9uZTogdHJ1ZSxcbn0pXG5leHBvcnQgY2xhc3MgRGF0ZXBpY2tlcjxEPiBleHRlbmRzIERhdGVwaWNrZXJCYXNlPERhdGVwaWNrZXJDb250cm9sPEQ+LCBEIHwgbnVsbCwgRD4ge31cbiJdfQ==