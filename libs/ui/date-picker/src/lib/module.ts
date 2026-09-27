import { NgModule } from '@angular/core';

import { CalendarModule } from './calendar/calendar.module';
import { DatepickerInputModule } from './date-picker/date-picker-input.module';

@NgModule({
  imports: [CalendarModule, DatepickerInputModule],
  exports: [CalendarModule, DatepickerInputModule],
})
export class DatepickerModule {}
