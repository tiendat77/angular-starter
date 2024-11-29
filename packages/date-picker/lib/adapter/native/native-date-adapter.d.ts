import * as i0 from '@angular/core';
import { DateAdapter } from '../date-adapter';
/** Adapts the native JS Date for use with cdk-based components that work with dates. */
export declare class NativeDateAdapter extends DateAdapter<Date> {
  /**
   * @deprecated No longer being used. To be removed.
   * @breaking-change 14.0.0
   */
  useUtcForDisplay: boolean;
  /** The injected locale. */
  private readonly _dateLocale;
  constructor(
    /**
     * @deprecated Now injected via inject(), param to be removed.
     * @breaking-change 18.0.0
     */
    dateLocale?: string
  );
  getYear(date: Date): number;
  getMonth(date: Date): number;
  getDate(date: Date): number;
  getDayOfWeek(date: Date): number;
  getMonthNames(style: 'long' | 'short' | 'narrow'): string[];
  getDateNames(): string[];
  getDayOfWeekNames(style: 'long' | 'short' | 'narrow'): string[];
  getYearName(date: Date): string;
  getFirstDayOfWeek(): number;
  getNumDaysInMonth(date: Date): number;
  clone(date: Date): Date;
  createDate(year: number, month: number, date: number): Date;
  today(): Date;
  parse(value: any, parseFormat?: any): Date | null;
  format(date: Date, displayFormat: object): string;
  addCalendarYears(date: Date, years: number): Date;
  addCalendarMonths(date: Date, months: number): Date;
  addCalendarDays(date: Date, days: number): Date;
  toIso8601(date: Date): string;
  /**
   * Returns the given value if given a valid Date or null. Deserializes valid ISO 8601 strings
   * (https://www.ietf.org/rfc/rfc3339.txt) into valid Dates and empty string into null. Returns an
   * invalid date for all other values.
   */
  deserialize(value: any): Date | null;
  isDateInstance(obj: any): obj is Date;
  isValid(date: Date): boolean;
  invalid(): Date;
  /** Creates a date but allows the month and date to overflow. */
  private _createDateWithOverflow;
  /**
   * Pads a number to make it two digits.
   * @param n The number to pad.
   * @returns The padded number.
   */
  private _2digit;
  /**
   * When converting Date object to string, javascript built-in functions may return wrong
   * results because it applies its internal DST rules. The DST rules around the world change
   * very frequently, and the current valid rule is not always valid in previous years though.
   * We work around this problem building a new Date object which has its internal UTC
   * representation with the local date and time.
   * @param dtf Intl.DateTimeFormat object, containing the desired string format. It must have
   *    timeZone set to 'utc' to work fine.
   * @param date Date from which we want to get the string representation according to dtf
   * @returns A Date object with its UTC representation based on the passed in date info
   */
  private _format;
  static ɵfac: i0.ɵɵFactoryDeclaration<NativeDateAdapter, [{ optional: true }]>;
  static ɵprov: i0.ɵɵInjectableDeclaration<NativeDateAdapter>;
}
