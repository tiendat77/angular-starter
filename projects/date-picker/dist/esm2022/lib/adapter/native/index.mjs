/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { NgModule } from '@angular/core';
import { DateAdapter } from '../date-adapter';
import { DATE_FORMATS } from '../date-formats';
import { NativeDateAdapter } from './native-date-adapter';
import { NATIVE_DATE_FORMATS } from './native-date-formats';
import * as i0 from "@angular/core";
export * from './native-date-adapter';
export * from './native-date-formats';
export class NativeDateModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: NativeDateModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "18.2.8", ngImport: i0, type: NativeDateModule });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: NativeDateModule, providers: [{ provide: DateAdapter, useClass: NativeDateAdapter }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: NativeDateModule, decorators: [{
            type: NgModule,
            args: [{
                    providers: [{ provide: DateAdapter, useClass: NativeDateAdapter }],
                }]
        }] });
export function provideNativeDateAdapter(formats = NATIVE_DATE_FORMATS) {
    return [
        { provide: DateAdapter, useClass: NativeDateAdapter },
        { provide: DATE_FORMATS, useValue: formats },
    ];
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvbGliL2FkYXB0ZXIvbmF0aXZlL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUNILE9BQU8sRUFBRSxRQUFRLEVBQVksTUFBTSxlQUFlLENBQUM7QUFFbkQsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQzlDLE9BQU8sRUFBRSxZQUFZLEVBQWUsTUFBTSxpQkFBaUIsQ0FBQztBQUU1RCxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUMxRCxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQzs7QUFFNUQsY0FBYyx1QkFBdUIsQ0FBQztBQUN0QyxjQUFjLHVCQUF1QixDQUFDO0FBS3RDLE1BQU0sT0FBTyxnQkFBZ0I7dUdBQWhCLGdCQUFnQjt3R0FBaEIsZ0JBQWdCO3dHQUFoQixnQkFBZ0IsYUFGaEIsQ0FBQyxFQUFFLE9BQU8sRUFBRSxXQUFXLEVBQUUsUUFBUSxFQUFFLGlCQUFpQixFQUFFLENBQUM7OzJGQUV2RCxnQkFBZ0I7a0JBSDVCLFFBQVE7bUJBQUM7b0JBQ1IsU0FBUyxFQUFFLENBQUMsRUFBRSxPQUFPLEVBQUUsV0FBVyxFQUFFLFFBQVEsRUFBRSxpQkFBaUIsRUFBRSxDQUFDO2lCQUNuRTs7QUFHRCxNQUFNLFVBQVUsd0JBQXdCLENBQUMsVUFBdUIsbUJBQW1CO0lBQ2pGLE9BQU87UUFDTCxFQUFFLE9BQU8sRUFBRSxXQUFXLEVBQUUsUUFBUSxFQUFFLGlCQUFpQixFQUFFO1FBQ3JELEVBQUUsT0FBTyxFQUFFLFlBQVksRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFO0tBQzdDLENBQUM7QUFDSixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQgeyBOZ01vZHVsZSwgUHJvdmlkZXIgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgRGF0ZUFkYXB0ZXIgfSBmcm9tICcuLi9kYXRlLWFkYXB0ZXInO1xuaW1wb3J0IHsgREFURV9GT1JNQVRTLCBEYXRlRm9ybWF0cyB9IGZyb20gJy4uL2RhdGUtZm9ybWF0cyc7XG5cbmltcG9ydCB7IE5hdGl2ZURhdGVBZGFwdGVyIH0gZnJvbSAnLi9uYXRpdmUtZGF0ZS1hZGFwdGVyJztcbmltcG9ydCB7IE5BVElWRV9EQVRFX0ZPUk1BVFMgfSBmcm9tICcuL25hdGl2ZS1kYXRlLWZvcm1hdHMnO1xuXG5leHBvcnQgKiBmcm9tICcuL25hdGl2ZS1kYXRlLWFkYXB0ZXInO1xuZXhwb3J0ICogZnJvbSAnLi9uYXRpdmUtZGF0ZS1mb3JtYXRzJztcblxuQE5nTW9kdWxlKHtcbiAgcHJvdmlkZXJzOiBbeyBwcm92aWRlOiBEYXRlQWRhcHRlciwgdXNlQ2xhc3M6IE5hdGl2ZURhdGVBZGFwdGVyIH1dLFxufSlcbmV4cG9ydCBjbGFzcyBOYXRpdmVEYXRlTW9kdWxlIHt9XG5cbmV4cG9ydCBmdW5jdGlvbiBwcm92aWRlTmF0aXZlRGF0ZUFkYXB0ZXIoZm9ybWF0czogRGF0ZUZvcm1hdHMgPSBOQVRJVkVfREFURV9GT1JNQVRTKTogUHJvdmlkZXJbXSB7XG4gIHJldHVybiBbXG4gICAgeyBwcm92aWRlOiBEYXRlQWRhcHRlciwgdXNlQ2xhc3M6IE5hdGl2ZURhdGVBZGFwdGVyIH0sXG4gICAgeyBwcm92aWRlOiBEQVRFX0ZPUk1BVFMsIHVzZVZhbHVlOiBmb3JtYXRzIH0sXG4gIF07XG59XG4iXX0=