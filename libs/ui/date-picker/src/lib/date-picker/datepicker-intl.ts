import { Injectable, Provider } from '@angular/core';
import { Subject } from 'rxjs';

/** Strings rendered by the date picker itself (buttons and screen-reader labels). */
export interface DatepickerLabels {
  /** Layout of the month view title; `{month}` and `{year}` are replaced (e.g. `{month}, {year}`). */
  monthYearFormat: string;
  /** Close button, only reachable by keyboard / screen reader. */
  closeLabel: string;
  /** `aria-label` of the period button in month view. */
  switchToMultiYearViewLabel: string;
  /** `aria-label` of the period button in year views. */
  switchToMonthViewLabel: string;
  prevMonthLabel: string;
  prevYearLabel: string;
  prevMultiYearLabel: string;
  nextMonthLabel: string;
  nextYearLabel: string;
  nextMultiYearLabel: string;
}

/**
 * Localizable strings of the date picker. Dates, month and weekday names come from the
 * `DateAdapter` locale; everything else comes from here.
 *
 * Override with {@link provideDatepickerLabels}, or extend the class and provide it as
 * `DatepickerIntl`. Call `changes.next()` after mutating the labels at runtime (e.g. on a language
 * switch) so open pickers re-render.
 */
@Injectable({ providedIn: 'root' })
export class DatepickerIntl implements DatepickerLabels {
  /** Emits when a label changed. */
  readonly changes = new Subject<void>();

  monthYearFormat = '{month} {year}';
  closeLabel = 'Close';
  switchToMultiYearViewLabel = 'Choose month and year';
  switchToMonthViewLabel = 'Choose date';
  prevMonthLabel = 'Previous month';
  prevYearLabel = 'Previous year';
  prevMultiYearLabel = 'Previous 24 years';
  nextMonthLabel = 'Next month';
  nextYearLabel = 'Next year';
  nextMultiYearLabel = 'Next 24 years';
}

/**
 * Overrides some of the labels, e.g.
 * `provideDatepickerLabels({ closeLabel: 'Đóng', applyLabel: 'Áp dụng' })`.
 */
export function provideDatepickerLabels(labels: Partial<DatepickerLabels>): Provider {
  return {
    provide: DatepickerIntl,
    useFactory: () => Object.assign(new DatepickerIntl(), labels),
  };
}
