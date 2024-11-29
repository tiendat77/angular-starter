import * as i3 from '@angular/cdk/a11y';
import * as i2 from '@angular/cdk/overlay';
import * as i4 from '@angular/cdk/portal';
import * as i10 from '@angular/cdk/scrolling';
import * as i1 from '@angular/common';
import * as i0 from '@angular/core';
import * as i5 from '../calendar/calendar.module';
import * as i6 from './date-picker';
import * as i7 from './datepicker-content';
import * as i8 from './datepicker-input';
import * as i9 from './datepicker-toggle';
export declare class DatepickerInputModule {
  static ɵfac: i0.ɵɵFactoryDeclaration<DatepickerInputModule, never>;
  static ɵmod: i0.ɵɵNgModuleDeclaration<
    DatepickerInputModule,
    never,
    [
      typeof i1.CommonModule,
      typeof i2.OverlayModule,
      typeof i3.A11yModule,
      typeof i4.PortalModule,
      typeof i5.CalendarModule,
      typeof i6.Datepicker,
      typeof i7.DatepickerContent,
      typeof i8.DatepickerInput,
      typeof i9.DatepickerToggle,
    ],
    [
      typeof i10.CdkScrollableModule,
      typeof i6.Datepicker,
      typeof i7.DatepickerContent,
      typeof i8.DatepickerInput,
      typeof i9.DatepickerToggle,
    ]
  >;
  static ɵinj: i0.ɵɵInjectorDeclaration<DatepickerInputModule>;
}
