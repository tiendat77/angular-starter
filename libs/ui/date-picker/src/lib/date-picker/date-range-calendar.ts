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
import { MultiYearView } from '../calendar/multi-year-view';
import { YearView } from '../calendar/year-view';
import { DateRange } from './date-selection-model';
import { DatepickerIntl } from './datepicker-intl';

/** The left or the right of the two panels. */
type Side = 'left' | 'right';
/** What a panel shows under its header: the days, the 12 months or a page of 24 years. */
type PanelView = 'days' | 'months' | 'years';

const MONTHS_PER_YEAR = 12;
const YEARS_PER_PAGE = 24;

/**
 * Two month views side by side for picking a date range. The first panel owns the previous arrow, the
 * second one is always the month after it. Hovering shows a dashed preview of the range across both
 * panels. The month and the year in each header are buttons that swap that panel's days for a month
 * grid or a year grid, to jump straight to another month or year.
 *
 * It is kept apart from the single-date `Calendar` (which it doesn't use) so that one stays simple.
 */
@Component({
  selector: 'date-range-calendar',
  templateUrl: './date-range-calendar.html',
  host: { class: 'date-range-calendar' },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet, MonthView, YearView, MultiYearView],
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
  @Input() showHolidays = true;
  @Input() dayExtra: TemplateRef<any> | null = null;

  /** Emits when the user clicks a date. */
  @Output() readonly _userSelection = new EventEmitter<CalendarUserEvent<D | null>>();

  /** Dates shown (and focused) in the left / right panel; the months are always consecutive. */
  protected _leftActive: D;
  protected _rightActive: D;

  protected _leftView: PanelView = 'days';
  protected _rightView: PanelView = 'days';

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

  // Per-panel state -----------------------------------------------------------------------------

  protected _active(side: Side): D {
    return side === 'left' ? this._leftActive : this._rightActive;
  }

  protected _view(side: Side): PanelView {
    return side === 'left' ? this._leftView : this._rightView;
  }

  // Header labels -------------------------------------------------------------------------------

  protected _monthName(date: D): string {
    return this._adapter.getMonthNames('long')[this._adapter.getMonth(date)];
  }

  protected _yearName(date: D): string {
    return this._adapter.getYearName(date);
  }

  /** Locales that write the year before the month ("2026年9月"): put its label first. */
  protected get _yearFirst(): boolean {
    const format = this._intl.monthYearFormat;
    return format.indexOf('{year}') < format.indexOf('{month}');
  }

  protected _prevLabel(side: Side): string {
    const view = this._view(side);
    return view === 'days'
      ? this._intl.prevMonthLabel
      : view === 'months'
        ? this._intl.prevYearLabel
        : this._intl.prevMultiYearLabel;
  }

  protected _nextLabel(side: Side): string {
    const view = this._view(side);
    return view === 'days'
      ? this._intl.nextMonthLabel
      : view === 'months'
        ? this._intl.nextYearLabel
        : this._intl.nextMultiYearLabel;
  }

  // Navigation ----------------------------------------------------------------------------------

  /** Opens the grid, or goes back to the days when that grid is already the one showing. */
  protected _toggleView(side: Side, view: Exclude<PanelView, 'days'>) {
    this._setView(side, this._view(side) === view ? 'days' : view);
  }

  /** The arrow of a panel moves by what that panel shows: a month, a year or a page of years. */
  protected _shift(side: Side, direction: -1 | 1) {
    const view = this._view(side);
    const months =
      view === 'days' ? 1 : view === 'months' ? MONTHS_PER_YEAR : MONTHS_PER_YEAR * YEARS_PER_PAGE;
    this._setActive(side, this._adapter.addCalendarMonths(this._active(side), direction * months));
  }

  /** A month was picked in the month grid: show its days. */
  protected _pickMonth(side: Side, date: D) {
    const diff = this._adapter.getMonth(date) - this._adapter.getMonth(this._active(side));
    this._setActive(side, this._adapter.addCalendarMonths(this._active(side), diff));
    this._setView(side, 'days');
  }

  /** A year was picked in the year grid: keep the month, show its days. */
  protected _pickYear(side: Side, date: D) {
    const diff = this._adapter.getYear(date) - this._adapter.getYear(this._active(side));
    this._setActive(side, this._adapter.addCalendarYears(this._active(side), diff));
    this._setView(side, 'days');
  }

  /** The grids move the active date with the keyboard (arrows, Page Up / Down). */
  protected _onActiveChange(side: Side, date: D) {
    this._setActive(side, date);
  }

  /** Moves one panel; the other follows so the months stay consecutive. */
  private _setActive(side: Side, date: D) {
    const monthChanged = !this._sameMonth(date, this._active(side));
    if (side === 'left') {
      this._leftActive = date;
      if (monthChanged) {
        this._rightActive = this._adapter.addCalendarMonths(date, 1);
      }
    } else {
      this._rightActive = date;
      if (monthChanged) {
        this._leftActive = this._adapter.addCalendarMonths(date, -1);
      }
    }
  }

  private _setView(side: Side, view: PanelView) {
    if (side === 'left') {
      this._leftView = view;
    } else {
      this._rightView = view;
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
