/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { NgModule } from '@angular/core';
import { DateAdapter, DATE_LOCALE } from '../date-adapter';
import { DATE_FORMATS } from '../date-formats';
import { LUXON_DATE_ADAPTER_OPTIONS, LuxonDateAdapter } from './luxon-date-adapter';
import { LUXON_DATE_FORMATS } from './luxon-date-formats';
import * as i0 from "@angular/core";
export * from './luxon-date-adapter';
export * from './luxon-date-formats';
export class LuxonDateModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: LuxonDateModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "18.2.8", ngImport: i0, type: LuxonDateModule });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: LuxonDateModule, providers: [
            {
                provide: DateAdapter,
                useClass: LuxonDateAdapter,
                deps: [DATE_LOCALE, LUXON_DATE_ADAPTER_OPTIONS],
            },
        ] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: LuxonDateModule, decorators: [{
            type: NgModule,
            args: [{
                    providers: [
                        {
                            provide: DateAdapter,
                            useClass: LuxonDateAdapter,
                            deps: [DATE_LOCALE, LUXON_DATE_ADAPTER_OPTIONS],
                        },
                    ],
                }]
        }] });
export function provideLuxonDateAdapter(formats = LUXON_DATE_FORMATS) {
    return [
        {
            provide: DateAdapter,
            useClass: LuxonDateAdapter,
            deps: [DATE_LOCALE, LUXON_DATE_ADAPTER_OPTIONS],
        },
        { provide: DATE_FORMATS, useValue: formats },
    ];
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvbGliL2FkYXB0ZXIvbHV4b24vaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFFLFFBQVEsRUFBWSxNQUFNLGVBQWUsQ0FBQztBQUVuRCxPQUFPLEVBQUUsV0FBVyxFQUFFLFdBQVcsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQzNELE9BQU8sRUFBRSxZQUFZLEVBQWUsTUFBTSxpQkFBaUIsQ0FBQztBQUU1RCxPQUFPLEVBQUUsMEJBQTBCLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUVwRixPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQzs7QUFFMUQsY0FBYyxzQkFBc0IsQ0FBQztBQUNyQyxjQUFjLHNCQUFzQixDQUFDO0FBV3JDLE1BQU0sT0FBTyxlQUFlO3VHQUFmLGVBQWU7d0dBQWYsZUFBZTt3R0FBZixlQUFlLGFBUmY7WUFDVDtnQkFDRSxPQUFPLEVBQUUsV0FBVztnQkFDcEIsUUFBUSxFQUFFLGdCQUFnQjtnQkFDMUIsSUFBSSxFQUFFLENBQUMsV0FBVyxFQUFFLDBCQUEwQixDQUFDO2FBQ2hEO1NBQ0Y7OzJGQUVVLGVBQWU7a0JBVDNCLFFBQVE7bUJBQUM7b0JBQ1IsU0FBUyxFQUFFO3dCQUNUOzRCQUNFLE9BQU8sRUFBRSxXQUFXOzRCQUNwQixRQUFRLEVBQUUsZ0JBQWdCOzRCQUMxQixJQUFJLEVBQUUsQ0FBQyxXQUFXLEVBQUUsMEJBQTBCLENBQUM7eUJBQ2hEO3FCQUNGO2lCQUNGOztBQUdELE1BQU0sVUFBVSx1QkFBdUIsQ0FBQyxVQUF1QixrQkFBa0I7SUFDL0UsT0FBTztRQUNMO1lBQ0UsT0FBTyxFQUFFLFdBQVc7WUFDcEIsUUFBUSxFQUFFLGdCQUFnQjtZQUMxQixJQUFJLEVBQUUsQ0FBQyxXQUFXLEVBQUUsMEJBQTBCLENBQUM7U0FDaEQ7UUFDRCxFQUFFLE9BQU8sRUFBRSxZQUFZLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRTtLQUM3QyxDQUFDO0FBQ0osQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgeyBOZ01vZHVsZSwgUHJvdmlkZXIgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgRGF0ZUFkYXB0ZXIsIERBVEVfTE9DQUxFIH0gZnJvbSAnLi4vZGF0ZS1hZGFwdGVyJztcbmltcG9ydCB7IERBVEVfRk9STUFUUywgRGF0ZUZvcm1hdHMgfSBmcm9tICcuLi9kYXRlLWZvcm1hdHMnO1xuXG5pbXBvcnQgeyBMVVhPTl9EQVRFX0FEQVBURVJfT1BUSU9OUywgTHV4b25EYXRlQWRhcHRlciB9IGZyb20gJy4vbHV4b24tZGF0ZS1hZGFwdGVyJztcblxuaW1wb3J0IHsgTFVYT05fREFURV9GT1JNQVRTIH0gZnJvbSAnLi9sdXhvbi1kYXRlLWZvcm1hdHMnO1xuXG5leHBvcnQgKiBmcm9tICcuL2x1eG9uLWRhdGUtYWRhcHRlcic7XG5leHBvcnQgKiBmcm9tICcuL2x1eG9uLWRhdGUtZm9ybWF0cyc7XG5cbkBOZ01vZHVsZSh7XG4gIHByb3ZpZGVyczogW1xuICAgIHtcbiAgICAgIHByb3ZpZGU6IERhdGVBZGFwdGVyLFxuICAgICAgdXNlQ2xhc3M6IEx1eG9uRGF0ZUFkYXB0ZXIsXG4gICAgICBkZXBzOiBbREFURV9MT0NBTEUsIExVWE9OX0RBVEVfQURBUFRFUl9PUFRJT05TXSxcbiAgICB9LFxuICBdLFxufSlcbmV4cG9ydCBjbGFzcyBMdXhvbkRhdGVNb2R1bGUge31cblxuZXhwb3J0IGZ1bmN0aW9uIHByb3ZpZGVMdXhvbkRhdGVBZGFwdGVyKGZvcm1hdHM6IERhdGVGb3JtYXRzID0gTFVYT05fREFURV9GT1JNQVRTKTogUHJvdmlkZXJbXSB7XG4gIHJldHVybiBbXG4gICAge1xuICAgICAgcHJvdmlkZTogRGF0ZUFkYXB0ZXIsXG4gICAgICB1c2VDbGFzczogTHV4b25EYXRlQWRhcHRlcixcbiAgICAgIGRlcHM6IFtEQVRFX0xPQ0FMRSwgTFVYT05fREFURV9BREFQVEVSX09QVElPTlNdLFxuICAgIH0sXG4gICAgeyBwcm92aWRlOiBEQVRFX0ZPUk1BVFMsIHVzZVZhbHVlOiBmb3JtYXRzIH0sXG4gIF07XG59XG4iXX0=