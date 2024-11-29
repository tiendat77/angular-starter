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
import { DATEPICKER_SCROLL_STRATEGY_FACTORY_PROVIDER } from './datepicker-base';
import { DatepickerContent } from './datepicker-content';
import { DatepickerInput } from './datepicker-input';
import { DatepickerToggle } from './datepicker-toggle';

@NgModule({
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
})
export class DatepickerInputModule {}
