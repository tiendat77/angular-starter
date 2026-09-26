import { Component, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { describe, expect, it } from 'vitest';
import { Datepicker, DatepickerModule, provideNativeDateAdapter } from './public-api';

@Component({
  imports: [ReactiveFormsModule, DatepickerModule],
  providers: [provideNativeDateAdapter()],
  template: `
    <input
      [datepicker]="picker"
      [formControl]="control"
    />
    <date-picker #picker />
  `,
})
class DatepickerHostComponent {
  readonly control = new FormControl<Date | null>(new Date(2026, 0, 15));
  readonly picker = viewChild.required<Datepicker<Date>>('picker');
}

describe('Datepicker', () => {
  let fixture: ComponentFixture<DatepickerHostComponent>;

  const cellWithText = (text: string): HTMLElement =>
    Array.from(document.querySelectorAll<HTMLElement>('.calendar-body-cell')).find(
      (cell) => cell.textContent?.trim() === text
    )!;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DatepickerHostComponent],
      providers: [provideNoopAnimations()],
    });
    fixture = TestBed.createComponent(DatepickerHostComponent);
    fixture.detectChanges();
  });

  afterEach(() => fixture.componentInstance.picker().close());

  it('should format the form control value into the input', () => {
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    expect(input.value).toContain('2026');
    expect(input.value).toContain('15');
  });

  it('should open a calendar with the current value selected', () => {
    fixture.componentInstance.picker().open();
    fixture.detectChanges();

    expect(document.querySelector('.calendar-body-selected')?.textContent?.trim()).toBe('15');
  });

  it('should write the picked date back to the form control', () => {
    fixture.componentInstance.picker().open();
    fixture.detectChanges();

    cellWithText('20').click();
    fixture.detectChanges();
    const apply = Array.from(
      document.querySelectorAll<HTMLButtonElement>('.cdk-overlay-container button')
    ).find((b) => b.textContent?.trim() === 'Apply');
    apply?.click();
    fixture.detectChanges();

    const value = fixture.componentInstance.control.value!;
    expect(value.getFullYear()).toBe(2026);
    expect(value.getMonth()).toBe(0);
    expect(value.getDate()).toBe(20);
  });
});
