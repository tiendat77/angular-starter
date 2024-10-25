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

@NgModule({
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
})
export class CalendarModule {}
