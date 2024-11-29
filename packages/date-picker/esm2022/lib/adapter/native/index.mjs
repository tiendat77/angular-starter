/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as i0 from '@angular/core';
import { NgModule } from '@angular/core';
import { DateAdapter } from '../date-adapter';
import { DATE_FORMATS } from '../date-formats';
import { NativeDateAdapter } from './native-date-adapter';
import { NATIVE_DATE_FORMATS } from './native-date-formats';
export * from './native-date-adapter';
export * from './native-date-formats';
export class NativeDateModule {
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: '12.0.0',
    version: '18.2.13',
    ngImport: i0,
    type: NativeDateModule,
    deps: [],
    target: i0.ɵɵFactoryTarget.NgModule,
  });
  static ɵmod = i0.ɵɵngDeclareNgModule({
    minVersion: '14.0.0',
    version: '18.2.13',
    ngImport: i0,
    type: NativeDateModule,
  });
  static ɵinj = i0.ɵɵngDeclareInjector({
    minVersion: '12.0.0',
    version: '18.2.13',
    ngImport: i0,
    type: NativeDateModule,
    providers: [{ provide: DateAdapter, useClass: NativeDateAdapter }],
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: '12.0.0',
  version: '18.2.13',
  ngImport: i0,
  type: NativeDateModule,
  decorators: [
    {
      type: NgModule,
      args: [
        {
          providers: [{ provide: DateAdapter, useClass: NativeDateAdapter }],
        },
      ],
    },
  ],
});
export function provideNativeDateAdapter(formats = NATIVE_DATE_FORMATS) {
  return [
    { provide: DateAdapter, useClass: NativeDateAdapter },
    { provide: DATE_FORMATS, useValue: formats },
  ];
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9saWJzL2RhdGUtcGlja2VyL3NyYy9saWIvYWRhcHRlci9uYXRpdmUvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBQ0gsT0FBTyxFQUFFLFFBQVEsRUFBWSxNQUFNLGVBQWUsQ0FBQztBQUVuRCxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDOUMsT0FBTyxFQUFFLFlBQVksRUFBZSxNQUFNLGlCQUFpQixDQUFDO0FBRTVELE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBQzFELE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLHVCQUF1QixDQUFDOztBQUU1RCxjQUFjLHVCQUF1QixDQUFDO0FBQ3RDLGNBQWMsdUJBQXVCLENBQUM7QUFLdEMsTUFBTSxPQUFPLGdCQUFnQjt3R0FBaEIsZ0JBQWdCO3lHQUFoQixnQkFBZ0I7eUdBQWhCLGdCQUFnQixhQUZoQixDQUFDLEVBQUUsT0FBTyxFQUFFLFdBQVcsRUFBRSxRQUFRLEVBQUUsaUJBQWlCLEVBQUUsQ0FBQzs7NEZBRXZELGdCQUFnQjtrQkFINUIsUUFBUTttQkFBQztvQkFDUixTQUFTLEVBQUUsQ0FBQyxFQUFFLE9BQU8sRUFBRSxXQUFXLEVBQUUsUUFBUSxFQUFFLGlCQUFpQixFQUFFLENBQUM7aUJBQ25FOztBQUdELE1BQU0sVUFBVSx3QkFBd0IsQ0FBQyxVQUF1QixtQkFBbUI7SUFDakYsT0FBTztRQUNMLEVBQUUsT0FBTyxFQUFFLFdBQVcsRUFBRSxRQUFRLEVBQUUsaUJBQWlCLEVBQUU7UUFDckQsRUFBRSxPQUFPLEVBQUUsWUFBWSxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUU7S0FDN0MsQ0FBQztBQUNKLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7IE5nTW9kdWxlLCBQcm92aWRlciB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyBEYXRlQWRhcHRlciB9IGZyb20gJy4uL2RhdGUtYWRhcHRlcic7XG5pbXBvcnQgeyBEQVRFX0ZPUk1BVFMsIERhdGVGb3JtYXRzIH0gZnJvbSAnLi4vZGF0ZS1mb3JtYXRzJztcblxuaW1wb3J0IHsgTmF0aXZlRGF0ZUFkYXB0ZXIgfSBmcm9tICcuL25hdGl2ZS1kYXRlLWFkYXB0ZXInO1xuaW1wb3J0IHsgTkFUSVZFX0RBVEVfRk9STUFUUyB9IGZyb20gJy4vbmF0aXZlLWRhdGUtZm9ybWF0cyc7XG5cbmV4cG9ydCAqIGZyb20gJy4vbmF0aXZlLWRhdGUtYWRhcHRlcic7XG5leHBvcnQgKiBmcm9tICcuL25hdGl2ZS1kYXRlLWZvcm1hdHMnO1xuXG5ATmdNb2R1bGUoe1xuICBwcm92aWRlcnM6IFt7IHByb3ZpZGU6IERhdGVBZGFwdGVyLCB1c2VDbGFzczogTmF0aXZlRGF0ZUFkYXB0ZXIgfV0sXG59KVxuZXhwb3J0IGNsYXNzIE5hdGl2ZURhdGVNb2R1bGUge31cblxuZXhwb3J0IGZ1bmN0aW9uIHByb3ZpZGVOYXRpdmVEYXRlQWRhcHRlcihmb3JtYXRzOiBEYXRlRm9ybWF0cyA9IE5BVElWRV9EQVRFX0ZPUk1BVFMpOiBQcm92aWRlcltdIHtcbiAgcmV0dXJuIFtcbiAgICB7IHByb3ZpZGU6IERhdGVBZGFwdGVyLCB1c2VDbGFzczogTmF0aXZlRGF0ZUFkYXB0ZXIgfSxcbiAgICB7IHByb3ZpZGU6IERBVEVfRk9STUFUUywgdXNlVmFsdWU6IGZvcm1hdHMgfSxcbiAgXTtcbn1cbiJdfQ==
