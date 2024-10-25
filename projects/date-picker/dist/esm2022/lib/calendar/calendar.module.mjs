/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { NgModule } from '@angular/core';
import { A11yModule } from '@angular/cdk/a11y';
import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import { CdkScrollableModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { Calendar } from './calendar';
import { CalendarHeader } from './calendar-header';
import { MultiYearView } from './multi-year-view';
import { CalendarBody } from './calendar-body';
import { MonthView } from './month-view';
import { YearView } from './year-view';
import * as i0 from "@angular/core";
export class CalendarModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: CalendarModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "18.2.8", ngImport: i0, type: CalendarModule, imports: [CommonModule,
            OverlayModule,
            A11yModule,
            PortalModule,
            Calendar,
            CalendarBody,
            MonthView,
            YearView,
            MultiYearView,
            CalendarHeader], exports: [CdkScrollableModule,
            Calendar,
            CalendarBody,
            MonthView,
            YearView,
            MultiYearView,
            CalendarHeader] });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: CalendarModule, imports: [CommonModule,
            OverlayModule,
            A11yModule,
            PortalModule, CdkScrollableModule] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: CalendarModule, decorators: [{
            type: NgModule,
            args: [{
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
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FsZW5kYXIubW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2xpYi9jYWxlbmRhci9jYWxlbmRhci5tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUN6QyxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFDL0MsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBQ3JELE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUNuRCxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUM3RCxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFFL0MsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLFlBQVksQ0FBQztBQUN0QyxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFDbkQsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBQ2xELE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUMvQyxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sY0FBYyxDQUFDO0FBQ3pDLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxhQUFhLENBQUM7O0FBeUJ2QyxNQUFNLE9BQU8sY0FBYzt1R0FBZCxjQUFjO3dHQUFkLGNBQWMsWUFyQnZCLFlBQVk7WUFDWixhQUFhO1lBQ2IsVUFBVTtZQUNWLFlBQVk7WUFDWixRQUFRO1lBQ1IsWUFBWTtZQUNaLFNBQVM7WUFDVCxRQUFRO1lBQ1IsYUFBYTtZQUNiLGNBQWMsYUFHZCxtQkFBbUI7WUFDbkIsUUFBUTtZQUNSLFlBQVk7WUFDWixTQUFTO1lBQ1QsUUFBUTtZQUNSLGFBQWE7WUFDYixjQUFjO3dHQUdMLGNBQWMsWUFyQnZCLFlBQVk7WUFDWixhQUFhO1lBQ2IsVUFBVTtZQUNWLFlBQVksRUFTWixtQkFBbUI7OzJGQVNWLGNBQWM7a0JBdkIxQixRQUFRO21CQUFDO29CQUNSLE9BQU8sRUFBRTt3QkFDUCxZQUFZO3dCQUNaLGFBQWE7d0JBQ2IsVUFBVTt3QkFDVixZQUFZO3dCQUNaLFFBQVE7d0JBQ1IsWUFBWTt3QkFDWixTQUFTO3dCQUNULFFBQVE7d0JBQ1IsYUFBYTt3QkFDYixjQUFjO3FCQUNmO29CQUNELE9BQU8sRUFBRTt3QkFDUCxtQkFBbUI7d0JBQ25CLFFBQVE7d0JBQ1IsWUFBWTt3QkFDWixTQUFTO3dCQUNULFFBQVE7d0JBQ1IsYUFBYTt3QkFDYixjQUFjO3FCQUNmO2lCQUNGIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7IE5nTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBBMTF5TW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvY2RrL2ExMXknO1xuaW1wb3J0IHsgT3ZlcmxheU1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2Nkay9vdmVybGF5JztcbmltcG9ydCB7IFBvcnRhbE1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2Nkay9wb3J0YWwnO1xuaW1wb3J0IHsgQ2RrU2Nyb2xsYWJsZU1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2Nkay9zY3JvbGxpbmcnO1xuaW1wb3J0IHsgQ29tbW9uTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcblxuaW1wb3J0IHsgQ2FsZW5kYXIgfSBmcm9tICcuL2NhbGVuZGFyJztcbmltcG9ydCB7IENhbGVuZGFySGVhZGVyIH0gZnJvbSAnLi9jYWxlbmRhci1oZWFkZXInO1xuaW1wb3J0IHsgTXVsdGlZZWFyVmlldyB9IGZyb20gJy4vbXVsdGkteWVhci12aWV3JztcbmltcG9ydCB7IENhbGVuZGFyQm9keSB9IGZyb20gJy4vY2FsZW5kYXItYm9keSc7XG5pbXBvcnQgeyBNb250aFZpZXcgfSBmcm9tICcuL21vbnRoLXZpZXcnO1xuaW1wb3J0IHsgWWVhclZpZXcgfSBmcm9tICcuL3llYXItdmlldyc7XG5cbkBOZ01vZHVsZSh7XG4gIGltcG9ydHM6IFtcbiAgICBDb21tb25Nb2R1bGUsXG4gICAgT3ZlcmxheU1vZHVsZSxcbiAgICBBMTF5TW9kdWxlLFxuICAgIFBvcnRhbE1vZHVsZSxcbiAgICBDYWxlbmRhcixcbiAgICBDYWxlbmRhckJvZHksXG4gICAgTW9udGhWaWV3LFxuICAgIFllYXJWaWV3LFxuICAgIE11bHRpWWVhclZpZXcsXG4gICAgQ2FsZW5kYXJIZWFkZXIsXG4gIF0sXG4gIGV4cG9ydHM6IFtcbiAgICBDZGtTY3JvbGxhYmxlTW9kdWxlLFxuICAgIENhbGVuZGFyLFxuICAgIENhbGVuZGFyQm9keSxcbiAgICBNb250aFZpZXcsXG4gICAgWWVhclZpZXcsXG4gICAgTXVsdGlZZWFyVmlldyxcbiAgICBDYWxlbmRhckhlYWRlcixcbiAgXSxcbn0pXG5leHBvcnQgY2xhc3MgQ2FsZW5kYXJNb2R1bGUge31cbiJdfQ==