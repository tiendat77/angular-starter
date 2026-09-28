import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DatepickerModule, provideNativeDateAdapter } from '@libs/ui/date-picker';
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

  readonly control = new FormControl<Date | null>(null);

  readonly dateFilter = (date: Date | null): boolean => {
    if (!this.weekdaysOnly() || !date) return true;
    const day = date.getDay();
    return day !== 0 && day !== 6;
  };

  readonly generatedCode = computed(() => {
    const pickerAttrs = this.startView() !== 'month' ? ` startView="${this.startView()}"` : '';
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
<date-picker #picker${pickerAttrs} />`;
  });

  readonly apiRows: ApiRow[] = [
    {
      name: 'input[datepicker]',
      type: 'DatepickerPanel',
      description: 'Connects a text input (and its form control) to a <date-picker>.',
    },
    { name: 'min / max', type: 'D | null', description: 'Earliest / latest selectable date.' },
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

  toggleDisabled(disabled: boolean): void {
    this.disabled.set(disabled);
    if (disabled) {
      this.control.disable();
    } else {
      this.control.enable();
    }
  }
}
