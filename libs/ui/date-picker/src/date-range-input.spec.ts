import { Component, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { DateRangePicker, DatepickerModule, provideNativeDateAdapter } from './public-api';

@Component({
  imports: [ReactiveFormsModule, DatepickerModule],
  providers: [provideNativeDateAdapter()],
  template: `
    <date-range-input
      [rangePicker]="picker"
      [min]="min()"
      [max]="max()"
      [disabled]="disabled()"
    >
      <label class="input">
        <input
          dateRangeStart
          [formControl]="start"
          placeholder="Start"
        />
      </label>
      <span>→</span>
      <label class="input">
        <input
          dateRangeEnd
          [formControl]="end"
          placeholder="End"
        />
      </label>
    </date-range-input>
    <date-range-picker #picker />
  `,
})
class HostComponent {
  readonly start = new FormControl<Date | null>(null);
  readonly end = new FormControl<Date | null>(null);
  readonly min = signal<Date | null>(null);
  readonly max = signal<Date | null>(null);
  readonly disabled = signal(false);
  readonly picker = viewChild.required<DateRangePicker<Date>>('picker');
}

describe('DateRangeInput (two inputs)', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  const input = (which: 'start' | 'end'): HTMLInputElement =>
    fixture.nativeElement.querySelector(
      which === 'start' ? 'input[dateRangeStart]' : 'input[dateRangeEnd]'
    );
  const type = (which: 'start' | 'end', text: string): void => {
    const el = input(which);
    el.value = text;
    el.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  };
  const day = (text: string): HTMLElement =>
    Array.from(
      document.querySelectorAll<HTMLElement>(
        '.date-range-picker-content .calendar-body-cell-container:not(.hidden) .calendar-body-cell'
      )
    ).find((cell) => cell.textContent?.trim() === text)!;
  const ymd = (d: Date | null): string | null =>
    d ? `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}` : null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [provideNoopAnimations()],
    });
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => host.picker().close());

  it('keeps two separate inputs with a form control each', () => {
    expect(input('start')).not.toBe(input('end'));
    type('start', '1/10/2026');
    type('end', '1/20/2026');
    expect(ymd(host.start.value)).toBe('2026-1-10');
    expect(ymd(host.end.value)).toBe('2026-1-20');
  });

  it('writes a form value into the text of its own input only', () => {
    host.start.setValue(new Date(2026, 5, 3));
    fixture.detectChanges();
    expect(input('start').value).toContain('2026');
    expect(input('end').value).toBe('');
  });

  it('opens one calendar under the whole row, from either input (Alt + Down)', () => {
    input('end').dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', keyCode: 40, altKey: true, bubbles: true })
    );
    fixture.detectChanges();
    expect(host.picker().opened).toBe(true);
    expect(document.querySelectorAll('.date-range-picker-content').length).toBe(1);
  });

  it('fills both inputs from the days picked in the calendar', () => {
    host.picker().open();
    fixture.detectChanges();

    day('12').click();
    fixture.detectChanges();
    expect(host.start.value?.getDate()).toBe(12);
    expect(host.end.value).toBeNull();
    expect(input('end').value).toBe('');

    day('15').click();
    fixture.detectChanges();
    expect(host.start.value?.getDate()).toBe(12);
    expect(host.end.value?.getDate()).toBe(15);
    expect(input('start').value).toContain('12');
    expect(input('end').value).toContain('15');
  });

  it('starts a new range from the calendar: the end is cleared', () => {
    host.start.setValue(new Date(2026, 9, 8));
    host.end.setValue(new Date(2026, 9, 20));
    fixture.detectChanges();
    host.picker().open();
    fixture.detectChanges();

    day('3').click();
    fixture.detectChanges();
    expect(host.start.value?.getDate()).toBe(3);
    expect(host.end.value).toBeNull();
    expect(input('end').value).toBe('');
  });

  it('shows what is typed in the calendar the picker opens on', () => {
    type('start', '3/5/2027');
    expect(host.picker().datepickerInput.getStartValue()?.getFullYear()).toBe(2027);
  });

  it('flags an end before the start on both inputs, and clears it when fixed', () => {
    type('start', '1/20/2026');
    type('end', '1/10/2026');
    expect(host.end.errors?.['datepickerRange']).toBeTruthy();
    expect(host.start.errors?.['datepickerRange']).toBeTruthy();

    type('end', '1/25/2026');
    expect(host.end.errors).toBeNull();
    expect(host.start.errors).toBeNull();
  });

  it('revalidates the end when the start moves past it', () => {
    type('start', '1/10/2026');
    type('end', '1/15/2026');
    expect(host.end.valid).toBe(true);
    type('start', '1/20/2026');
    expect(host.end.errors?.['datepickerRange']).toBeTruthy();
  });

  it('reports text that is not a date on that input only', () => {
    type('start', 'not a date');
    expect(host.start.errors?.['datepickerParse']).toBeTruthy();
    expect(host.end.errors).toBeNull();
  });

  it('applies min and max to both inputs', () => {
    host.min.set(new Date(2026, 0, 5));
    host.max.set(new Date(2026, 0, 25));
    fixture.detectChanges();
    type('start', '1/1/2026');
    type('end', '2/1/2026');
    expect(host.start.errors?.['datepickerMin']).toBeTruthy();
    expect(host.end.errors?.['datepickerMax']).toBeTruthy();
  });

  it('disables both inputs with [disabled], and the picker', () => {
    host.disabled.set(true);
    fixture.detectChanges();
    expect(input('start').disabled).toBe(true);
    expect(input('end').disabled).toBe(true);
    expect(host.picker().disabled).toBe(true);
  });

  it('keeps the picker usable while only one input is disabled', () => {
    host.start.disable();
    fixture.detectChanges();
    expect(input('start').disabled).toBe(true);
    expect(input('end').disabled).toBe(false);
    expect(host.picker().disabled).toBe(false);
  });

  it('disables the picker when both inputs are disabled by their form controls', () => {
    host.start.disable();
    host.end.disable();
    fixture.detectChanges();
    expect(host.picker().disabled).toBe(true);
  });

  it('marks an input touched when it loses focus', () => {
    expect(host.start.touched).toBe(false);
    input('start').dispatchEvent(new Event('blur'));
    expect(host.start.touched).toBe(true);
    expect(host.end.touched).toBe(false);
  });
});
