import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  DateAdapter,
  DateRange,
  DatepickerIntl,
  DatepickerModule,
  provideNativeDateAdapter,
} from '@libs/ui/date-picker';
import { ApiRow, ApiTableComponent } from '../../shared/api-table/api-table.component';
import { PlaygroundComponent } from '../../shared/playground/playground.component';

type StartView = 'month' | 'year' | 'multi-year';

@Component({
  selector: 'doc-date-picker',
  imports: [
    DatePipe,
    FormsModule,
    ReactiveFormsModule,
    DatepickerModule,
    PlaygroundComponent,
    ApiTableComponent,
  ],
  providers: [provideNativeDateAdapter()],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './date-picker-doc.component.html',
})
export class DatePickerDocComponent {
  readonly startView = signal<StartView>('month');
  readonly weekdaysOnly = signal(false);
  readonly disabled = signal(false);
  readonly showLunar = signal(false);
  readonly showHolidays = signal(true);
  readonly showExtra = signal(false);
  readonly vietnamese = signal(false);

  private readonly _adapter = inject<DateAdapter<Date>>(DateAdapter);
  private readonly _intl = inject(DatepickerIntl);

  readonly control = new FormControl<Date | null>(null);

  // Min / max demo: a booking window counted from today
  private readonly _today = new Date(new Date().setHours(0, 0, 0, 0));
  readonly minEnabled = signal(true);
  readonly maxEnabled = signal(true);
  readonly minOffset = signal(0);
  readonly maxOffset = signal(30);
  readonly minMaxControl = new FormControl<Date | null>(null);

  readonly minDate = computed(() => (this.minEnabled() ? this._addDays(this.minOffset()) : null));
  readonly maxDate = computed(() => (this.maxEnabled() ? this._addDays(this.maxOffset()) : null));

  private readonly _minMaxTick = signal(0);
  readonly minMaxError = computed(() => {
    this._minMaxTick();
    const errors = this.minMaxControl.errors;
    if (!errors) {
      return 'none';
    }
    return errors['datepickerParse']
      ? 'datepickerParse (not a date)'
      : errors['datepickerMin']
        ? 'datepickerMin (before the minimum)'
        : errors['datepickerMax']
          ? 'datepickerMax (after the maximum)'
          : Object.keys(errors).join(', ');
  });

  readonly minMaxCode = computed(() => {
    const fmt = (date: Date) =>
      `new Date(${date.getFullYear()}, ${date.getMonth()}, ${date.getDate()})`;
    const min = this.minDate();
    const max = this.maxDate();
    const attrs = (min ? '\n    [min]="min"' : '') + (max ? '\n    [max]="max"' : '');
    const fields =
      (min ? `\nmin = ${fmt(min)}; // today ${this._offsetText(this.minOffset())}` : '') +
      (max ? `\nmax = ${fmt(max)}; // today ${this._offsetText(this.maxOffset())}` : '');
    return `<!-- providers: [provideNativeDateAdapter()] -->
<label class="input">
  <datepicker-toggle [for]="picker" />
  <input
    placeholder="Arrival date"
    [datepicker]="picker"
    [formControl]="arrival"${attrs}
  />
</label>
<date-picker #picker />
<!-- arrival: FormControl<Date | null> -->
<!-- Days outside the range are disabled in the calendar, and a typed date outside it
     sets the datepickerMin / datepickerMax error on the control -->${fields}`;
  });

  // Date range demo
  readonly rangeLunar = signal(true);
  readonly rangeExtra = signal(true);
  readonly rangeControl = new FormControl<DateRange<Date> | null>(null);

  readonly rangeValue = toSignal(this.rangeControl.valueChanges, { initialValue: null });

  readonly rangeCode = computed(() => {
    const attrs = this.rangeLunar() ? ' showLunar' : '';
    const extra = this.rangeExtra()
      ? '>\n  <ng-template datepickerDayExtra let-date>{{ priceOf(date) }}</ng-template>\n</date-range-picker>'
      : ' />';
    return `<!-- providers: [provideNativeDateAdapter()] -->
<label class="input">
  <datepicker-toggle [for]="rangePicker" />
  <input
    [dateRangePicker]="rangePicker"
    [formControl]="stay"
    placeholder="Check-in – Check-out"
  />
</label>
<!-- stay: FormControl<DateRange<Date> | null> -->
<date-range-picker #rangePicker${attrs}${extra}`;
  });

  readonly rangeText = computed(() => {
    const range = this.rangeValue();
    const fmt = (d: Date | null) => (d ? this._datePipe.transform(d, 'yyyy-MM-dd') : '…');
    return range ? `${fmt(range.start)} → ${fmt(range.end)}` : 'null';
  });

  private readonly _datePipe = new DatePipe('en-US');

  // Two separate inputs demo
  readonly checkIn = new FormControl<Date | null>(null);
  readonly checkOut = new FormControl<Date | null>(null);
  readonly twoInputsDisabled = signal(false);

  readonly twoInputsCode = `<!-- providers: [provideNativeDateAdapter()] -->
<date-range-input [rangePicker]="picker">
  <label class="input">
    <input dateRangeStart [formControl]="checkIn" placeholder="Check-in" />
  </label>
  <span aria-hidden="true">→</span>
  <label class="input">
    <input dateRangeEnd [formControl]="checkOut" placeholder="Check-out" />
    <datepicker-toggle [for]="picker" />
  </label>
</date-range-input>
<date-range-picker #picker />
<!-- checkIn, checkOut: FormControl<Date | null> -->`;

  readonly twoInputsErrors = computed(() => {
    this._twoInputsTick();
    const names = (control: FormControl<Date | null>) =>
      Object.keys(control.errors ?? {}).join(', ') || 'none';
    return `start: ${names(this.checkIn)} · end: ${names(this.checkOut)}`;
  });
  private readonly _twoInputsTick = signal(0);

  constructor() {
    const tick = () => this._twoInputsTick.update((v) => v + 1);
    this.checkIn.statusChanges.subscribe(tick);
    this.checkOut.statusChanges.subscribe(tick);
    this.minMaxControl.statusChanges.subscribe(() => this._minMaxTick.update((v) => v + 1));
  }

  toggleTwoInputsDisabled(disabled: boolean): void {
    this.twoInputsDisabled.set(disabled);
  }

  readonly dateFilter = (date: Date | null): boolean => {
    if (!this.weekdaysOnly() || !date) return true;
    const day = date.getDay();
    return day !== 0 && day !== 6;
  };

  readonly generatedCode = computed(() => {
    const pickerAttrs =
      (this.startView() !== 'month' ? ` startView="${this.startView()}"` : '') +
      (this.showLunar() ? ' showLunar' : '') +
      (this.showHolidays() ? '' : ' [showHolidays]="false"');
    const extra = this.showExtra()
      ? '>\n  <ng-template datepickerDayExtra let-date>{{ priceOf(date) }}</ng-template>\n</date-picker>'
      : ' />';
    const filterAttr = this.weekdaysOnly() ? '\n    [datepickerFilter]="weekdaysOnly"' : '';
    return `<!-- providers: [provideNativeDateAdapter()] -->
<label class="input">
  <datepicker-toggle [for]="picker" />
  <input
    [datepicker]="picker"
    [formControl]="birthday"${filterAttr}
    placeholder="Pick a date"
  />
</label>
<date-picker #picker${pickerAttrs}${extra}`;
  });

  readonly apiRows: ApiRow[] = [
    {
      name: 'date-range-input',
      type: 'component',
      description:
        'Connects two separate inputs (dateRangeStart, dateRangeEnd) to a <date-range-picker>. Each input is a form control of its own, so each can sit in its own field box. Inputs: rangePicker, min, max, datepickerFilter, disabled.',
    },
    {
      name: 'input[datepicker]',
      type: 'DatepickerPanel',
      description: 'Connects a text input (and its form control) to a <date-picker>.',
    },
    {
      name: 'min / max',
      type: 'D | null',
      description:
        'Earliest / latest selectable date. Other days are disabled in the calendar; a typed date outside the range sets datepickerMin / datepickerMax on the form control.',
    },
    {
      name: 'datepickerFilter',
      type: '(date: D | null) => boolean',
      description: 'Return false to disable a date.',
    },
    {
      name: '<date-picker> startView',
      type: "'month' | 'year' | 'multi-year'",
      default: "'month'",
      description: 'View the calendar opens in.',
    },
    {
      name: 'showHolidays',
      type: 'boolean',
      default: 'true',
      description:
        'On <date-picker> and <date-range-picker>. Hovering a day that is a Vietnamese holiday or commemoration shows its name in a tooltip (hover only, from a static list: fixed solar dates and fixed lunar dates). The days off the government adds each year (Tết, Quốc khánh, days in lieu) are not in it.',
    },
    {
      name: 'DatepickerIntl.holidayLanguage',
      type: "'en' | 'vi'",
      default: "'en'",
      description:
        'Language of the holiday names. Set it with provideDatepickerLabels({ holidayLanguage: "vi" }), or on the DatepickerIntl instance followed by changes.next().',
    },
    {
      name: 'getVietnameseHolidays(day, month, year)',
      type: 'VietnameseHoliday[]',
      description:
        'The same static list as a function: { kind: "public" | "traditional" | "observance", name: { vi, en } } per holiday of a Gregorian date (month 1-12). vietnameseHolidayText() joins the names of a day.',
    },
    {
      name: '<date-picker> showLunar',
      type: 'boolean',
      default: 'false',
      description:
        'Shows the Vietnamese lunar date (Âm lịch) above each day; the 1st of a lunar month shows day/month.',
    },
    {
      name: 'ng-template[datepickerDayExtra]',
      type: 'TemplateRef<{ $implicit: D }>',
      description:
        'Content projected in <date-picker>; rendered below each day number with the cell date (e.g. best price of the day).',
    },
    {
      name: 'input[dateRangePicker]',
      type: 'DateRangePicker',
      description:
        'Connects a text input to a <date-range-picker>. The form value is a DateRange { start, end }; typing "start – end" works too.',
    },
    {
      name: '<date-range-picker>',
      type: 'component',
      description:
        'Same inputs as <date-picker> (showLunar, startView, touchUi, dayExtra template). Shows two months, selects start then end, and closes on the end date.',
    },
    {
      name: '<date-picker> fullscreenBreakpoint',
      type: 'string | false',
      default: "'(max-width: 640px)'",
      description:
        'Media query below which the picker opens as a full-screen sheet with a scrolling list of months (also on <date-range-picker>). false disables it.',
    },
    {
      name: '<date-picker> touchUi',
      type: 'boolean',
      default: 'false',
      description: 'Opens the calendar as a centered dialog instead of a dropdown.',
    },
    {
      name: '<date-picker> (opened) / (closed)',
      type: 'EventEmitter<void>',
      description: 'Emits when the calendar opens or closes.',
    },
    {
      name: '<datepicker-toggle> for',
      type: 'DatepickerPanel',
      description: 'Calendar button that opens the given picker.',
    },
    {
      name: 'provideNativeDateAdapter()',
      type: 'Provider[]',
      description: 'Date adapter for native Date objects. Required once per injector.',
    },
  ];

  private _addDays(days: number): Date {
    const date = new Date(this._today);
    date.setDate(date.getDate() + days);
    return date;
  }

  private _offsetText(days: number): string {
    return days === 0 ? '' : days > 0 ? `+ ${days} days` : `- ${-days} days`;
  }

  /** Demo data for the `datepickerDayExtra` template: a made-up price per day. */
  price(date: Date): string {
    const thousands = 18 + ((date.getDate() * 37 + date.getMonth() * 11) % 25);
    return `${thousands}.${(date.getDate() * 13) % 10}60K`;
  }

  setVietnamese(enabled: boolean): void {
    this.vietnamese.set(enabled);
    this._adapter.setLocale(enabled ? 'vi-VN' : 'en-US');
    // Labels are not derived from the locale; they are configured through `DatepickerIntl`
    Object.assign(
      this._intl,
      enabled
        ? {
            monthYearFormat: '{month}, {year}',
            closeLabel: 'Đóng',
            switchToMultiYearViewLabel: 'Chọn tháng và năm',
            switchToMonthViewLabel: 'Chọn ngày',
            holidayLanguage: 'vi',
            prevMonthLabel: 'Tháng trước',
            nextMonthLabel: 'Tháng sau',
          }
        : new DatepickerIntl()
    );
    this._intl.changes.next();
  }

  toggleDisabled(disabled: boolean): void {
    this.disabled.set(disabled);
    if (disabled) {
      this.control.disable();
    } else {
      this.control.enable();
    }
  }
}
