/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { A11yModule } from '@angular/cdk/a11y';
import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import { CdkScrollableModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import * as i0 from '@angular/core';
import { NgModule } from '@angular/core';
import { Calendar } from './calendar';
import { CalendarBody } from './calendar-body';
import { CalendarHeader } from './calendar-header';
import { MonthView } from './month-view';
import { MultiYearView } from './multi-year-view';
import { YearView } from './year-view';
export class CalendarModule {
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: '12.0.0',
    version: '18.2.13',
    ngImport: i0,
    type: CalendarModule,
    deps: [],
    target: i0.ɵɵFactoryTarget.NgModule,
  });
  static ɵmod = i0.ɵɵngDeclareNgModule({
    minVersion: '14.0.0',
    version: '18.2.13',
    ngImport: i0,
    type: CalendarModule,
    imports: [
      CommonModule,
      OverlayModule,
      A11yModule,
      PortalModule,
      Calendar,
      CalendarBody,
      MonthView,
      YearView,
      MultiYearView,
      CalendarHeader,
    ],
    exports: [
      CdkScrollableModule,
      Calendar,
      CalendarBody,
      MonthView,
      YearView,
      MultiYearView,
      CalendarHeader,
    ],
  });
  static ɵinj = i0.ɵɵngDeclareInjector({
    minVersion: '12.0.0',
    version: '18.2.13',
    ngImport: i0,
    type: CalendarModule,
    imports: [CommonModule, OverlayModule, A11yModule, PortalModule, CdkScrollableModule],
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: '12.0.0',
  version: '18.2.13',
  ngImport: i0,
  type: CalendarModule,
  decorators: [
    {
      type: NgModule,
      args: [
        {
          imports: [
            CommonModule,
            OverlayModule,
            A11yModule,
            PortalModule,
            Calendar,
            CalendarBody,
            MonthView,
            YearView,
            MultiYearView,
            CalendarHeader,
          ],
          exports: [
            CdkScrollableModule,
            Calendar,
            CalendarBody,
            MonthView,
            YearView,
            MultiYearView,
            CalendarHeader,
          ],
        },
      ],
    },
  ],
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FsZW5kYXIubW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vbGlicy9kYXRlLXBpY2tlci9zcmMvbGliL2NhbGVuZGFyL2NhbGVuZGFyLm1vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ3pDLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUMvQyxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDckQsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBQ25ELE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBQzdELE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUUvQyxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBQ3RDLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUNuRCxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFDbEQsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQy9DLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFDekMsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLGFBQWEsQ0FBQzs7QUF5QnZDLE1BQU0sT0FBTyxjQUFjO3dHQUFkLGNBQWM7eUdBQWQsY0FBYyxZQXJCdkIsWUFBWTtZQUNaLGFBQWE7WUFDYixVQUFVO1lBQ1YsWUFBWTtZQUNaLFFBQVE7WUFDUixZQUFZO1lBQ1osU0FBUztZQUNULFFBQVE7WUFDUixhQUFhO1lBQ2IsY0FBYyxhQUdkLG1CQUFtQjtZQUNuQixRQUFRO1lBQ1IsWUFBWTtZQUNaLFNBQVM7WUFDVCxRQUFRO1lBQ1IsYUFBYTtZQUNiLGNBQWM7eUdBR0wsY0FBYyxZQXJCdkIsWUFBWTtZQUNaLGFBQWE7WUFDYixVQUFVO1lBQ1YsWUFBWSxFQVNaLG1CQUFtQjs7NEZBU1YsY0FBYztrQkF2QjFCLFFBQVE7bUJBQUM7b0JBQ1IsT0FBTyxFQUFFO3dCQUNQLFlBQVk7d0JBQ1osYUFBYTt3QkFDYixVQUFVO3dCQUNWLFlBQVk7d0JBQ1osUUFBUTt3QkFDUixZQUFZO3dCQUNaLFNBQVM7d0JBQ1QsUUFBUTt3QkFDUixhQUFhO3dCQUNiLGNBQWM7cUJBQ2Y7b0JBQ0QsT0FBTyxFQUFFO3dCQUNQLG1CQUFtQjt3QkFDbkIsUUFBUTt3QkFDUixZQUFZO3dCQUNaLFNBQVM7d0JBQ1QsUUFBUTt3QkFDUixhQUFhO3dCQUNiLGNBQWM7cUJBQ2Y7aUJBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHsgTmdNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IEExMXlNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jZGsvYTExeSc7XG5pbXBvcnQgeyBPdmVybGF5TW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvY2RrL292ZXJsYXknO1xuaW1wb3J0IHsgUG9ydGFsTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvY2RrL3BvcnRhbCc7XG5pbXBvcnQgeyBDZGtTY3JvbGxhYmxlTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvY2RrL3Njcm9sbGluZyc7XG5pbXBvcnQgeyBDb21tb25Nb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuXG5pbXBvcnQgeyBDYWxlbmRhciB9IGZyb20gJy4vY2FsZW5kYXInO1xuaW1wb3J0IHsgQ2FsZW5kYXJIZWFkZXIgfSBmcm9tICcuL2NhbGVuZGFyLWhlYWRlcic7XG5pbXBvcnQgeyBNdWx0aVllYXJWaWV3IH0gZnJvbSAnLi9tdWx0aS15ZWFyLXZpZXcnO1xuaW1wb3J0IHsgQ2FsZW5kYXJCb2R5IH0gZnJvbSAnLi9jYWxlbmRhci1ib2R5JztcbmltcG9ydCB7IE1vbnRoVmlldyB9IGZyb20gJy4vbW9udGgtdmlldyc7XG5pbXBvcnQgeyBZZWFyVmlldyB9IGZyb20gJy4veWVhci12aWV3JztcblxuQE5nTW9kdWxlKHtcbiAgaW1wb3J0czogW1xuICAgIENvbW1vbk1vZHVsZSxcbiAgICBPdmVybGF5TW9kdWxlLFxuICAgIEExMXlNb2R1bGUsXG4gICAgUG9ydGFsTW9kdWxlLFxuICAgIENhbGVuZGFyLFxuICAgIENhbGVuZGFyQm9keSxcbiAgICBNb250aFZpZXcsXG4gICAgWWVhclZpZXcsXG4gICAgTXVsdGlZZWFyVmlldyxcbiAgICBDYWxlbmRhckhlYWRlcixcbiAgXSxcbiAgZXhwb3J0czogW1xuICAgIENka1Njcm9sbGFibGVNb2R1bGUsXG4gICAgQ2FsZW5kYXIsXG4gICAgQ2FsZW5kYXJCb2R5LFxuICAgIE1vbnRoVmlldyxcbiAgICBZZWFyVmlldyxcbiAgICBNdWx0aVllYXJWaWV3LFxuICAgIENhbGVuZGFySGVhZGVyLFxuICBdLFxufSlcbmV4cG9ydCBjbGFzcyBDYWxlbmRhck1vZHVsZSB7fVxuIl19
