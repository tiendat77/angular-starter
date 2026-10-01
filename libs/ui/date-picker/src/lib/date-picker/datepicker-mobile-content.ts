import { CdkTrapFocus } from '@angular/cdk/a11y';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  signal,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';

import { DateAdapter } from '../adapter';
import { MonthView } from '../calendar/month-view';
import { animations } from '../utils/animations';
import { DateRange, ExtractDateTypeFromSelection } from './date-selection-model';
import { DatepickerContent } from './datepicker-content';
import { formatMonthYear } from './datepicker-intl';

/** Months offered before / after the initial one when the picker has no `min` / `max`. */
const DEFAULT_MONTHS_SPAN = 36;

/** Upper bound so a very wide `min`..`max` can't create thousands of placeholders. */
const MAX_MONTHS = 1200;

interface MonthEntry<D> {
  date: D;
  title: string;
  /** Week rows the month needs (4–6); drives the placeholder height. */
  rows: number;
}

/**
 * Overlay content used on small screens: a full-screen sheet with a vertically scrolling list of
 * months. Works for single dates and ranges alike (it only relies on the shared selection model).
 *
 * Smooth scrolling comes from two things:
 *  - every month is a placeholder whose height is known up front (rows × cell size, expressed in
 *    container-query units), so the scroll height is exact and nothing shifts while scrolling;
 *  - the heavy `month-view` is only mounted for months near the viewport (IntersectionObserver),
 *    so a few hundred months cost a few hundred empty boxes rather than thousands of buttons.
 */
@Component({
  selector: 'datepicker-mobile-content',
  templateUrl: './datepicker-mobile-content.html',
  styleUrl: './datepicker-mobile-content.scss',
  host: {
    class: 'datepicker-content datepicker-mobile-content',
    '[@transformPanel]': '_animationState',
    '(@transformPanel.start)': '_handleAnimationEvent($event)',
    '(@transformPanel.done)': '_handleAnimationEvent($event)',
  },
  animations: [animations.transformPanel],
  exportAs: 'datepickerMobileContent',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MonthView, CdkTrapFocus],
})
export class DatepickerMobileContent<S, D = ExtractDateTypeFromSelection<S>>
  extends DatepickerContent<S, D>
  implements OnInit, AfterViewInit, OnDestroy
{
  private _adapter = inject<DateAdapter<D>>(DateAdapter);

  @ViewChild('scroller', { static: true }) private _scroller: ElementRef<HTMLElement>;

  protected _months: MonthEntry<D>[] = [];
  protected _weekdays: { long: string; narrow: string }[] = [];
  protected _title = '';
  /** Day-cell height relative to its width; taller when cells carry lunar / extra text. */
  protected _ratio = 1;

  /** Indices of the months whose `month-view` is currently mounted. */
  protected readonly _mounted = signal<ReadonlySet<number>>(new Set());

  private _initialIndex = 0;
  private _observer: IntersectionObserver | null = null;

  override ngOnInit() {
    this._animationState = 'enter-fullscreen';

    const a = this._adapter;
    const selection = this._getSelected();
    const selectedDate = selection instanceof DateRange ? selection.start : (selection as D | null);
    const initial = selectedDate ?? this.datepicker.startAt ?? a.today();

    const first = this._firstOfMonth(
      this.datepicker._getMinDate() ?? a.addCalendarMonths(initial, -DEFAULT_MONTHS_SPAN)
    );
    const last = this._firstOfMonth(
      this.datepicker._getMaxDate() ?? a.addCalendarMonths(initial, DEFAULT_MONTHS_SPAN)
    );
    const count = Math.min(
      MAX_MONTHS,
      Math.max(
        1,
        (a.getYear(last) - a.getYear(first)) * 12 + a.getMonth(last) - a.getMonth(first) + 1
      )
    );

    const firstDayOfWeek = a.getFirstDayOfWeek();
    this._months = Array.from({ length: count }, (_, i) => {
      const date = a.addCalendarMonths(first, i);
      const offset = (a.getDayOfWeek(date) - firstDayOfWeek + 7) % 7;
      return {
        date,
        title: formatMonthYear(a, this._intl, date),
        rows: Math.ceil((offset + a.getNumDaysInMonth(date)) / 7),
      };
    });

    const initialMonth = this._firstOfMonth(initial);
    this._initialIndex = Math.min(
      count - 1,
      Math.max(
        0,
        (a.getYear(initialMonth) - a.getYear(first)) * 12 +
          a.getMonth(initialMonth) -
          a.getMonth(first)
      )
    );
    // Mount the neighbourhood of the first visible month right away to avoid a blank first frame
    this._mounted.set(
      new Set(
        Array.from({ length: 5 }, (_, i) => this._initialIndex - 2 + i).filter(
          (i) => i >= 0 && i < count
        )
      )
    );

    const narrow = a.getDayOfWeekNames('narrow');
    const long = a.getDayOfWeekNames('long');
    const names = long.map((l, i) => ({ long: l, narrow: narrow[i] }));
    this._weekdays = names.slice(firstDayOfWeek).concat(names.slice(0, firstDayOfWeek));

    this._ratio = this.datepicker.showLunar || this.datepicker.dayExtra ? 1.2 : 1;
    this._title = this._getDialogTitle();
  }

  override ngAfterViewInit() {
    super.ngAfterViewInit();

    const scroller = this._scroller.nativeElement;
    const target = scroller.querySelector<HTMLElement>(`[data-index="${this._initialIndex}"]`);
    scroller.scrollTop = target?.offsetTop ?? 0;

    if (typeof IntersectionObserver === 'undefined') {
      // No windowing available: show everything (small lists in old/test environments)
      this._mounted.set(new Set(this._months.map((_, i) => i)));
      return;
    }

    // One viewport of look-ahead above and below keeps fast flicks from showing empty months
    this._observer = new IntersectionObserver(
      (entries) => {
        const next = new Set(this._mounted());
        for (const entry of entries) {
          const index = Number((entry.target as HTMLElement).dataset['index']);
          if (entry.isIntersecting) next.add(index);
          else next.delete(index);
        }
        this._mounted.set(next);
      },
      { root: scroller, rootMargin: '100% 0px' }
    );
    scroller
      .querySelectorAll<HTMLElement>('[data-index]')
      .forEach((section) => this._observer!.observe(section));
  }

  override ngOnDestroy() {
    this._observer?.disconnect();
    super.ngOnDestroy();
  }

  protected _getDialogTitle(): string {
    return this._globalSelectionIsRange()
      ? this._intl.selectDatesLabel
      : this._intl.selectDateLabel;
  }

  private _globalSelectionIsRange(): boolean {
    return this._getSelected() instanceof DateRange;
  }

  private _firstOfMonth(date: D): D {
    return this._adapter.createDate(this._adapter.getYear(date), this._adapter.getMonth(date), 1);
  }
}
