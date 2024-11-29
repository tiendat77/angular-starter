/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as i0 from '@angular/core';
import { NgModule } from '@angular/core';
import { DATE_LOCALE, DateAdapter } from '../date-adapter';
import { DATE_FORMATS } from '../date-formats';
import { LUXON_DATE_ADAPTER_OPTIONS, LuxonDateAdapter } from './luxon-date-adapter';
import { LUXON_DATE_FORMATS } from './luxon-date-formats';
export * from './luxon-date-adapter';
export * from './luxon-date-formats';
export class LuxonDateModule {
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: '12.0.0',
    version: '18.2.13',
    ngImport: i0,
    type: LuxonDateModule,
    deps: [],
    target: i0.ɵɵFactoryTarget.NgModule,
  });
  static ɵmod = i0.ɵɵngDeclareNgModule({
    minVersion: '14.0.0',
    version: '18.2.13',
    ngImport: i0,
    type: LuxonDateModule,
  });
  static ɵinj = i0.ɵɵngDeclareInjector({
    minVersion: '12.0.0',
    version: '18.2.13',
    ngImport: i0,
    type: LuxonDateModule,
    providers: [
      {
        provide: DateAdapter,
        useClass: LuxonDateAdapter,
        deps: [DATE_LOCALE, LUXON_DATE_ADAPTER_OPTIONS],
      },
    ],
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: '12.0.0',
  version: '18.2.13',
  ngImport: i0,
  type: LuxonDateModule,
  decorators: [
    {
      type: NgModule,
      args: [
        {
          providers: [
            {
              provide: DateAdapter,
              useClass: LuxonDateAdapter,
              deps: [DATE_LOCALE, LUXON_DATE_ADAPTER_OPTIONS],
            },
          ],
        },
      ],
    },
  ],
});
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9saWJzL2RhdGUtcGlja2VyL3NyYy9saWIvYWRhcHRlci9sdXhvbi9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUUsUUFBUSxFQUFZLE1BQU0sZUFBZSxDQUFDO0FBRW5ELE9BQU8sRUFBRSxXQUFXLEVBQUUsV0FBVyxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDM0QsT0FBTyxFQUFFLFlBQVksRUFBZSxNQUFNLGlCQUFpQixDQUFDO0FBRTVELE9BQU8sRUFBRSwwQkFBMEIsRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBRXBGLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLHNCQUFzQixDQUFDOztBQUUxRCxjQUFjLHNCQUFzQixDQUFDO0FBQ3JDLGNBQWMsc0JBQXNCLENBQUM7QUFXckMsTUFBTSxPQUFPLGVBQWU7d0dBQWYsZUFBZTt5R0FBZixlQUFlO3lHQUFmLGVBQWUsYUFSZjtZQUNUO2dCQUNFLE9BQU8sRUFBRSxXQUFXO2dCQUNwQixRQUFRLEVBQUUsZ0JBQWdCO2dCQUMxQixJQUFJLEVBQUUsQ0FBQyxXQUFXLEVBQUUsMEJBQTBCLENBQUM7YUFDaEQ7U0FDRjs7NEZBRVUsZUFBZTtrQkFUM0IsUUFBUTttQkFBQztvQkFDUixTQUFTLEVBQUU7d0JBQ1Q7NEJBQ0UsT0FBTyxFQUFFLFdBQVc7NEJBQ3BCLFFBQVEsRUFBRSxnQkFBZ0I7NEJBQzFCLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRSwwQkFBMEIsQ0FBQzt5QkFDaEQ7cUJBQ0Y7aUJBQ0Y7O0FBR0QsTUFBTSxVQUFVLHVCQUF1QixDQUFDLFVBQXVCLGtCQUFrQjtJQUMvRSxPQUFPO1FBQ0w7WUFDRSxPQUFPLEVBQUUsV0FBVztZQUNwQixRQUFRLEVBQUUsZ0JBQWdCO1lBQzFCLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRSwwQkFBMEIsQ0FBQztTQUNoRDtRQUNELEVBQUUsT0FBTyxFQUFFLFlBQVksRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFO0tBQzdDLENBQUM7QUFDSixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7IE5nTW9kdWxlLCBQcm92aWRlciB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyBEYXRlQWRhcHRlciwgREFURV9MT0NBTEUgfSBmcm9tICcuLi9kYXRlLWFkYXB0ZXInO1xuaW1wb3J0IHsgREFURV9GT1JNQVRTLCBEYXRlRm9ybWF0cyB9IGZyb20gJy4uL2RhdGUtZm9ybWF0cyc7XG5cbmltcG9ydCB7IExVWE9OX0RBVEVfQURBUFRFUl9PUFRJT05TLCBMdXhvbkRhdGVBZGFwdGVyIH0gZnJvbSAnLi9sdXhvbi1kYXRlLWFkYXB0ZXInO1xuXG5pbXBvcnQgeyBMVVhPTl9EQVRFX0ZPUk1BVFMgfSBmcm9tICcuL2x1eG9uLWRhdGUtZm9ybWF0cyc7XG5cbmV4cG9ydCAqIGZyb20gJy4vbHV4b24tZGF0ZS1hZGFwdGVyJztcbmV4cG9ydCAqIGZyb20gJy4vbHV4b24tZGF0ZS1mb3JtYXRzJztcblxuQE5nTW9kdWxlKHtcbiAgcHJvdmlkZXJzOiBbXG4gICAge1xuICAgICAgcHJvdmlkZTogRGF0ZUFkYXB0ZXIsXG4gICAgICB1c2VDbGFzczogTHV4b25EYXRlQWRhcHRlcixcbiAgICAgIGRlcHM6IFtEQVRFX0xPQ0FMRSwgTFVYT05fREFURV9BREFQVEVSX09QVElPTlNdLFxuICAgIH0sXG4gIF0sXG59KVxuZXhwb3J0IGNsYXNzIEx1eG9uRGF0ZU1vZHVsZSB7fVxuXG5leHBvcnQgZnVuY3Rpb24gcHJvdmlkZUx1eG9uRGF0ZUFkYXB0ZXIoZm9ybWF0czogRGF0ZUZvcm1hdHMgPSBMVVhPTl9EQVRFX0ZPUk1BVFMpOiBQcm92aWRlcltdIHtcbiAgcmV0dXJuIFtcbiAgICB7XG4gICAgICBwcm92aWRlOiBEYXRlQWRhcHRlcixcbiAgICAgIHVzZUNsYXNzOiBMdXhvbkRhdGVBZGFwdGVyLFxuICAgICAgZGVwczogW0RBVEVfTE9DQUxFLCBMVVhPTl9EQVRFX0FEQVBURVJfT1BUSU9OU10sXG4gICAgfSxcbiAgICB7IHByb3ZpZGU6IERBVEVfRk9STUFUUywgdXNlVmFsdWU6IGZvcm1hdHMgfSxcbiAgXTtcbn1cbiJdfQ==
