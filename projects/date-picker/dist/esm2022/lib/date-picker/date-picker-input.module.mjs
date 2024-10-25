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
import { CalendarModule } from '../calendar/calendar.module';
import { Datepicker } from './date-picker';
import { DatepickerInput } from './datepicker-input';
import { DatepickerContent } from './datepicker-content';
import { DatepickerToggle } from './datepicker-toggle';
import { DATEPICKER_SCROLL_STRATEGY_FACTORY_PROVIDER } from './datepicker-base';
import * as i0 from "@angular/core";
export class DatepickerInputModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: DatepickerInputModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "18.2.8", ngImport: i0, type: DatepickerInputModule, imports: [CommonModule,
            OverlayModule,
            A11yModule,
            PortalModule,
            CalendarModule,
            Datepicker,
            DatepickerContent,
            DatepickerInput,
            DatepickerToggle], exports: [CdkScrollableModule, Datepicker, DatepickerContent, DatepickerInput, DatepickerToggle] });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: DatepickerInputModule, providers: [DATEPICKER_SCROLL_STRATEGY_FACTORY_PROVIDER], imports: [CommonModule,
            OverlayModule,
            A11yModule,
            PortalModule,
            CalendarModule, CdkScrollableModule] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: DatepickerInputModule, decorators: [{
            type: NgModule,
            args: [{
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
                    exports: [CdkScrollableModule, Datepicker, DatepickerContent, DatepickerInput, DatepickerToggle],
                    providers: [DATEPICKER_SCROLL_STRATEGY_FACTORY_PROVIDER],
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZS1waWNrZXItaW5wdXQubW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2xpYi9kYXRlLXBpY2tlci9kYXRlLXBpY2tlci1pbnB1dC5tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUN6QyxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFDL0MsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBQ3JELE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUNuRCxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUM3RCxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFFL0MsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBQzdELE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDM0MsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBQ3JELE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBQ3pELE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBQ3ZELE9BQU8sRUFBRSwyQ0FBMkMsRUFBRSxNQUFNLG1CQUFtQixDQUFDOztBQWlCaEYsTUFBTSxPQUFPLHFCQUFxQjt1R0FBckIscUJBQXFCO3dHQUFyQixxQkFBcUIsWUFiOUIsWUFBWTtZQUNaLGFBQWE7WUFDYixVQUFVO1lBQ1YsWUFBWTtZQUNaLGNBQWM7WUFDZCxVQUFVO1lBQ1YsaUJBQWlCO1lBQ2pCLGVBQWU7WUFDZixnQkFBZ0IsYUFFUixtQkFBbUIsRUFBRSxVQUFVLEVBQUUsaUJBQWlCLEVBQUUsZUFBZSxFQUFFLGdCQUFnQjt3R0FHcEYscUJBQXFCLGFBRnJCLENBQUMsMkNBQTJDLENBQUMsWUFYdEQsWUFBWTtZQUNaLGFBQWE7WUFDYixVQUFVO1lBQ1YsWUFBWTtZQUNaLGNBQWMsRUFNTixtQkFBbUI7OzJGQUdsQixxQkFBcUI7a0JBZmpDLFFBQVE7bUJBQUM7b0JBQ1IsT0FBTyxFQUFFO3dCQUNQLFlBQVk7d0JBQ1osYUFBYTt3QkFDYixVQUFVO3dCQUNWLFlBQVk7d0JBQ1osY0FBYzt3QkFDZCxVQUFVO3dCQUNWLGlCQUFpQjt3QkFDakIsZUFBZTt3QkFDZixnQkFBZ0I7cUJBQ2pCO29CQUNELE9BQU8sRUFBRSxDQUFDLG1CQUFtQixFQUFFLFVBQVUsRUFBRSxpQkFBaUIsRUFBRSxlQUFlLEVBQUUsZ0JBQWdCLENBQUM7b0JBQ2hHLFNBQVMsRUFBRSxDQUFDLDJDQUEyQyxDQUFDO2lCQUN6RCIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgeyBOZ01vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgQTExeU1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2Nkay9hMTF5JztcbmltcG9ydCB7IE92ZXJsYXlNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jZGsvb3ZlcmxheSc7XG5pbXBvcnQgeyBQb3J0YWxNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jZGsvcG9ydGFsJztcbmltcG9ydCB7IENka1Njcm9sbGFibGVNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jZGsvc2Nyb2xsaW5nJztcbmltcG9ydCB7IENvbW1vbk1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5cbmltcG9ydCB7IENhbGVuZGFyTW9kdWxlIH0gZnJvbSAnLi4vY2FsZW5kYXIvY2FsZW5kYXIubW9kdWxlJztcbmltcG9ydCB7IERhdGVwaWNrZXIgfSBmcm9tICcuL2RhdGUtcGlja2VyJztcbmltcG9ydCB7IERhdGVwaWNrZXJJbnB1dCB9IGZyb20gJy4vZGF0ZXBpY2tlci1pbnB1dCc7XG5pbXBvcnQgeyBEYXRlcGlja2VyQ29udGVudCB9IGZyb20gJy4vZGF0ZXBpY2tlci1jb250ZW50JztcbmltcG9ydCB7IERhdGVwaWNrZXJUb2dnbGUgfSBmcm9tICcuL2RhdGVwaWNrZXItdG9nZ2xlJztcbmltcG9ydCB7IERBVEVQSUNLRVJfU0NST0xMX1NUUkFURUdZX0ZBQ1RPUllfUFJPVklERVIgfSBmcm9tICcuL2RhdGVwaWNrZXItYmFzZSc7XG5cbkBOZ01vZHVsZSh7XG4gIGltcG9ydHM6IFtcbiAgICBDb21tb25Nb2R1bGUsXG4gICAgT3ZlcmxheU1vZHVsZSxcbiAgICBBMTF5TW9kdWxlLFxuICAgIFBvcnRhbE1vZHVsZSxcbiAgICBDYWxlbmRhck1vZHVsZSxcbiAgICBEYXRlcGlja2VyLFxuICAgIERhdGVwaWNrZXJDb250ZW50LFxuICAgIERhdGVwaWNrZXJJbnB1dCxcbiAgICBEYXRlcGlja2VyVG9nZ2xlLFxuICBdLFxuICBleHBvcnRzOiBbQ2RrU2Nyb2xsYWJsZU1vZHVsZSwgRGF0ZXBpY2tlciwgRGF0ZXBpY2tlckNvbnRlbnQsIERhdGVwaWNrZXJJbnB1dCwgRGF0ZXBpY2tlclRvZ2dsZV0sXG4gIHByb3ZpZGVyczogW0RBVEVQSUNLRVJfU0NST0xMX1NUUkFURUdZX0ZBQ1RPUllfUFJPVklERVJdLFxufSlcbmV4cG9ydCBjbGFzcyBEYXRlcGlja2VySW5wdXRNb2R1bGUge31cbiJdfQ==