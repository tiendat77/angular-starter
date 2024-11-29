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
import { CalendarModule } from '../calendar/calendar.module';
import { Datepicker } from './date-picker';
import { DATEPICKER_SCROLL_STRATEGY_FACTORY_PROVIDER } from './datepicker-base';
import { DatepickerContent } from './datepicker-content';
import { DatepickerInput } from './datepicker-input';
import { DatepickerToggle } from './datepicker-toggle';
export class DatepickerInputModule {
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: '12.0.0',
    version: '18.2.13',
    ngImport: i0,
    type: DatepickerInputModule,
    deps: [],
    target: i0.ɵɵFactoryTarget.NgModule,
  });
  static ɵmod = i0.ɵɵngDeclareNgModule({
    minVersion: '14.0.0',
    version: '18.2.13',
    ngImport: i0,
    type: DatepickerInputModule,
    imports: [
      CommonModule,
      OverlayModule,
      A11yModule,
      PortalModule,
      CalendarModule,
      Datepicker,
      DatepickerContent,
      DatepickerInput,
      DatepickerToggle,
    ],
    exports: [
      CdkScrollableModule,
      Datepicker,
      DatepickerContent,
      DatepickerInput,
      DatepickerToggle,
    ],
  });
  static ɵinj = i0.ɵɵngDeclareInjector({
    minVersion: '12.0.0',
    version: '18.2.13',
    ngImport: i0,
    type: DatepickerInputModule,
    providers: [DATEPICKER_SCROLL_STRATEGY_FACTORY_PROVIDER],
    imports: [
      CommonModule,
      OverlayModule,
      A11yModule,
      PortalModule,
      CalendarModule,
      CdkScrollableModule,
    ],
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: '12.0.0',
  version: '18.2.13',
  ngImport: i0,
  type: DatepickerInputModule,
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
            CalendarModule,
            Datepicker,
            DatepickerContent,
            DatepickerInput,
            DatepickerToggle,
          ],
          exports: [
            CdkScrollableModule,
            Datepicker,
            DatepickerContent,
            DatepickerInput,
            DatepickerToggle,
          ],
          providers: [DATEPICKER_SCROLL_STRATEGY_FACTORY_PROVIDER],
        },
      ],
    },
  ],
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZS1waWNrZXItaW5wdXQubW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vbGlicy9kYXRlLXBpY2tlci9zcmMvbGliL2RhdGUtcGlja2VyL2RhdGUtcGlja2VyLWlucHV0Lm1vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ3pDLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUMvQyxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDckQsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBQ25ELE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBQzdELE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUUvQyxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDN0QsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUMzQyxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFDckQsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDekQsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFDdkQsT0FBTyxFQUFFLDJDQUEyQyxFQUFFLE1BQU0sbUJBQW1CLENBQUM7O0FBaUJoRixNQUFNLE9BQU8scUJBQXFCO3dHQUFyQixxQkFBcUI7eUdBQXJCLHFCQUFxQixZQWI5QixZQUFZO1lBQ1osYUFBYTtZQUNiLFVBQVU7WUFDVixZQUFZO1lBQ1osY0FBYztZQUNkLFVBQVU7WUFDVixpQkFBaUI7WUFDakIsZUFBZTtZQUNmLGdCQUFnQixhQUVSLG1CQUFtQixFQUFFLFVBQVUsRUFBRSxpQkFBaUIsRUFBRSxlQUFlLEVBQUUsZ0JBQWdCO3lHQUdwRixxQkFBcUIsYUFGckIsQ0FBQywyQ0FBMkMsQ0FBQyxZQVh0RCxZQUFZO1lBQ1osYUFBYTtZQUNiLFVBQVU7WUFDVixZQUFZO1lBQ1osY0FBYyxFQU1OLG1CQUFtQjs7NEZBR2xCLHFCQUFxQjtrQkFmakMsUUFBUTttQkFBQztvQkFDUixPQUFPLEVBQUU7d0JBQ1AsWUFBWTt3QkFDWixhQUFhO3dCQUNiLFVBQVU7d0JBQ1YsWUFBWTt3QkFDWixjQUFjO3dCQUNkLFVBQVU7d0JBQ1YsaUJBQWlCO3dCQUNqQixlQUFlO3dCQUNmLGdCQUFnQjtxQkFDakI7b0JBQ0QsT0FBTyxFQUFFLENBQUMsbUJBQW1CLEVBQUUsVUFBVSxFQUFFLGlCQUFpQixFQUFFLGVBQWUsRUFBRSxnQkFBZ0IsQ0FBQztvQkFDaEcsU0FBUyxFQUFFLENBQUMsMkNBQTJDLENBQUM7aUJBQ3pEIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7IE5nTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBBMTF5TW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvY2RrL2ExMXknO1xuaW1wb3J0IHsgT3ZlcmxheU1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2Nkay9vdmVybGF5JztcbmltcG9ydCB7IFBvcnRhbE1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2Nkay9wb3J0YWwnO1xuaW1wb3J0IHsgQ2RrU2Nyb2xsYWJsZU1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2Nkay9zY3JvbGxpbmcnO1xuaW1wb3J0IHsgQ29tbW9uTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcblxuaW1wb3J0IHsgQ2FsZW5kYXJNb2R1bGUgfSBmcm9tICcuLi9jYWxlbmRhci9jYWxlbmRhci5tb2R1bGUnO1xuaW1wb3J0IHsgRGF0ZXBpY2tlciB9IGZyb20gJy4vZGF0ZS1waWNrZXInO1xuaW1wb3J0IHsgRGF0ZXBpY2tlcklucHV0IH0gZnJvbSAnLi9kYXRlcGlja2VyLWlucHV0JztcbmltcG9ydCB7IERhdGVwaWNrZXJDb250ZW50IH0gZnJvbSAnLi9kYXRlcGlja2VyLWNvbnRlbnQnO1xuaW1wb3J0IHsgRGF0ZXBpY2tlclRvZ2dsZSB9IGZyb20gJy4vZGF0ZXBpY2tlci10b2dnbGUnO1xuaW1wb3J0IHsgREFURVBJQ0tFUl9TQ1JPTExfU1RSQVRFR1lfRkFDVE9SWV9QUk9WSURFUiB9IGZyb20gJy4vZGF0ZXBpY2tlci1iYXNlJztcblxuQE5nTW9kdWxlKHtcbiAgaW1wb3J0czogW1xuICAgIENvbW1vbk1vZHVsZSxcbiAgICBPdmVybGF5TW9kdWxlLFxuICAgIEExMXlNb2R1bGUsXG4gICAgUG9ydGFsTW9kdWxlLFxuICAgIENhbGVuZGFyTW9kdWxlLFxuICAgIERhdGVwaWNrZXIsXG4gICAgRGF0ZXBpY2tlckNvbnRlbnQsXG4gICAgRGF0ZXBpY2tlcklucHV0LFxuICAgIERhdGVwaWNrZXJUb2dnbGUsXG4gIF0sXG4gIGV4cG9ydHM6IFtDZGtTY3JvbGxhYmxlTW9kdWxlLCBEYXRlcGlja2VyLCBEYXRlcGlja2VyQ29udGVudCwgRGF0ZXBpY2tlcklucHV0LCBEYXRlcGlja2VyVG9nZ2xlXSxcbiAgcHJvdmlkZXJzOiBbREFURVBJQ0tFUl9TQ1JPTExfU1RSQVRFR1lfRkFDVE9SWV9QUk9WSURFUl0sXG59KVxuZXhwb3J0IGNsYXNzIERhdGVwaWNrZXJJbnB1dE1vZHVsZSB7fVxuIl19
