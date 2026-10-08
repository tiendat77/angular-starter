import { ComponentType } from '@angular/cdk/portal';
import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { DateRangePickerContent } from './date-range-picker-content';
import { DateRange, RANGE_DATE_SELECTION_MODEL_PROVIDER } from './date-selection-model';
import { DatepickerBase, DatepickerControl } from './datepicker-base';
import { DatepickerContent } from './datepicker-content';

/**
 * Calendar popup that selects a date range. Connect it to an `input[dateRangePicker]`, or to a `<date-range-input>` with two separate inputs. It shows two months
 * side by side and closes as soon as the end date is picked.
 */
@Component({
  selector: 'date-range-picker',
  template: '',
  exportAs: 'dateRangePicker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [
    RANGE_DATE_SELECTION_MODEL_PROVIDER,
    { provide: DatepickerBase, useExisting: DateRangePicker },
  ],
})
export class DateRangePicker<D> extends DatepickerBase<DatepickerControl<D>, DateRange<D>, D> {
  protected override _getDesktopContentComponent(): ComponentType<
    DatepickerContent<DateRange<D>, D>
  > {
    return DateRangePickerContent;
  }
}
