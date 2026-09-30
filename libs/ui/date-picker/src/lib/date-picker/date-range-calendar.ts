import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
  signal,
  TemplateRef,
  ViewEncapsulation,
} from '@angular/core';

import { DateAdapter } from '../adapter';
import { CalendarUserEvent } from '../calendar/calendar-body';
import { MonthView } from '../calendar/month-view';
import { DateRange } from './date-selection-model';
import { DatepickerIntl } from './datepicker-intl';

/**
 * Two month views side by side for picking a date range. The first panel owns the navigation
 * (previous year / month), the second one is always the month after it. Hovering shows a dashed
 * preview of the range across both panels.
 *
 * It is kept apart from the single-date `Calendar` (which it doesn't use) so that one stays simple.
 */
@Component({
  selector: 'date-range-calendar',
  templateUrl: './date-range-calendar.html',
  host: { class: 'date-range-calendar' },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MonthView, NgTemplateOutlet],
})
export class DateRangeCalendar<D> implements OnInit {
  private _adapter = inject<DateAdapter<D>>(DateAdapter);
  protected _intl = inject(DatepickerIntl);

  /** The current selection. */
  @Input() selected: DateRange<D> | null = null;

  /** Date the left panel opens at, when nothing is selected. */
  @Input() startAt: D | null = null;

  @Input() minDate: D | null = null;
  @Input() maxDate: D | null = null;
  @Input() dateFilter: (date: D) => boolean;
  @Input() showLunar = false;
  @Input() dayExtra: TemplateRef<any> | null = null;

  /** Emits when the user clicks a date. */
  @Output() readonly _userSelection = new EventEmitter<CalendarUserEvent<D | null>>();

  /** Dates shown (and focused) in the left / right panel; the months are always consecutive. */
  protected _leftActive: D;
  protected _rightActive: D;

  private readonly _hovered = signal<D | null>(null);

  ngOnInit() {
    const initial = this.selected?.start ?? this.startAt ?? this._adapter.today();
    this._leftActive = initial;
    this._rightActive = this._adapter.addCalendarMonths(initial, 1);
  }

  /** The dashed preview while the end date is pending, spanning both panels. */
  protected get _preview(): DateRange<D> | null {
    const hovered = this._hovered();
    const start = this.selected?.start;

    if (hovered && start && !this.selected?.end && this._adapter.compareDate(hovered, start) >= 0) {
      return new DateRange(start, hovered);
    }
    return null;
  }

  protected _title(date: D): string {
    const month = this._adapter.getMonthNames('long')[this._adapter.getMonth(date)];
    return this._intl.monthYearFormat
      .replace('{month}', month)
      .replace('{year}', this._adapter.getYearName(date));
  }

  protected _shift(months: number) {
    this._leftActive = this._adapter.addCalendarMonths(this._leftActive, months);
    this._rightActive = this._adapter.addCalendarMonths(this._rightActive, months);
  }

  protected _onLeftActiveChange(date: D) {
    const monthChanged = !this._sameMonth(date, this._leftActive);
    this._leftActive = date;
    if (monthChanged) {
      this._rightActive = this._adapter.addCalendarMonths(date, 1);
    }
  }

  protected _onRightActiveChange(date: D) {
    const monthChanged = !this._sameMonth(date, this._rightActive);
    this._rightActive = date;
    if (monthChanged) {
      this._leftActive = this._adapter.addCalendarMonths(date, -1);
    }
  }

  protected _onHover(date: D | null) {
    this._hovered.set(date);
  }

  private _sameMonth(a: D, b: D): boolean {
    return (
      this._adapter.getYear(a) === this._adapter.getYear(b) &&
      this._adapter.getMonth(a) === this._adapter.getMonth(b)
    );
  }
}
