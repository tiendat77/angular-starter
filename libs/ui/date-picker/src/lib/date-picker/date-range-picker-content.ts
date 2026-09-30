import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

import { animations } from '../utils/animations';
import { DateRangeCalendar } from './date-range-calendar';
import { DateRange } from './date-selection-model';
import { DatepickerContent } from './datepicker-content';

/**
 * Overlay content of the `DateRangePicker`: two months side by side. Everything else (animations,
 * closing, selection model) is inherited from {@link DatepickerContent}.
 */
@Component({
  selector: 'date-range-picker-content',
  templateUrl: './date-range-picker-content.html',
  styleUrl: './date-range-picker-content.scss',
  host: {
    class: 'datepicker-content date-range-picker-content',
    '[@transformPanel]': '_animationState',
    '(@transformPanel.start)': '_handleAnimationEvent($event)',
    '(@transformPanel.done)': '_handleAnimationEvent($event)',
  },
  animations: [animations.transformPanel],
  exportAs: 'dateRangePickerContent',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DateRangeCalendar],
})
export class DateRangePickerContent<D> extends DatepickerContent<DateRange<D>, D> {
  _getRange(): DateRange<D> | null {
    const selected = this._getSelected();
    return selected instanceof DateRange ? selected : null;
  }
}
