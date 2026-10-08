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
import { NgModule } from '@angular/core';

import { CalendarModule } from '../calendar/calendar.module';
import { Datepicker } from './date-picker';
import { DateRangeInput } from './date-range-input';
import { DateRangeEndInput, DateRangeStartInput } from './date-range-input-parts';
import { DateRangePicker } from './date-range-picker';
import { DATEPICKER_SCROLL_STRATEGY_FACTORY_PROVIDER } from './datepicker-base';
import { DatepickerContent } from './datepicker-content';
import { DatepickerDayExtra } from './datepicker-day-extra';
import { DatepickerInput } from './datepicker-input';
import { DatepickerRangeInput } from './datepicker-range-input';
import { DatepickerToggle } from './datepicker-toggle';

@NgModule({
  imports: [
    CommonModule,
    OverlayModule,
    A11yModule,
    PortalModule,
    CalendarModule,
    Datepicker,
    DateRangePicker,
    DatepickerContent,
    DatepickerDayExtra,
    DatepickerInput,
    DatepickerRangeInput,
    DateRangeInput,
    DateRangeStartInput,
    DateRangeEndInput,
    DatepickerToggle,
  ],
  exports: [
    CdkScrollableModule,
    Datepicker,
    DateRangePicker,
    DatepickerContent,
    DatepickerDayExtra,
    DatepickerInput,
    DatepickerRangeInput,
    DateRangeInput,
    DateRangeStartInput,
    DateRangeEndInput,
    DatepickerToggle,
  ],
  providers: [DATEPICKER_SCROLL_STRATEGY_FACTORY_PROVIDER],
})
export class DatepickerInputModule {}
