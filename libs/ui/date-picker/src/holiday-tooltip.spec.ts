import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { Calendar } from './lib/calendar/calendar';
import { DatepickerIntl } from './lib/date-picker/datepicker-intl';
import { provideNativeDateAdapter } from './public-api';

@Component({
  imports: [Calendar],
  providers: [provideNativeDateAdapter()],
  template: `<calendar
    [startAt]="startAt"
    [showHolidays]="showHolidays()"
  />`,
})
class HostComponent {
  readonly startAt = new Date(2026, 8, 10); // September 2026
  readonly showHolidays = signal(true);
}

const wait = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

describe('Holiday tooltip on day cells', () => {
  let fixture: ComponentFixture<HostComponent>;
  let overlay: HTMLElement;

  const cell = (day: string): HTMLElement =>
    Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>('.calendar-body-cell')
    ).find((c) => c.querySelector('.calendar-body-cell-value')?.textContent?.trim() === day)!;
  const tooltip = (): string | undefined =>
    overlay.querySelector('[role="tooltip"]')?.textContent?.trim();
  const hover = async (day: string): Promise<void> => {
    cell(day).dispatchEvent(new MouseEvent('mouseenter'));
    await wait(260); // the tooltip's show delay
    fixture.detectChanges();
  };

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    fixture = TestBed.createComponent(HostComponent);
    overlay = TestBed.inject(OverlayContainer).getContainerElement();
    fixture.detectChanges();
  });

  afterEach(() => {
    cell('1').dispatchEvent(new MouseEvent('mouseleave'));
    TestBed.inject(OverlayContainer).ngOnDestroy();
  });

  it('shows the holiday name when a holiday cell is hovered', async () => {
    await hover('2');
    expect(tooltip()).toBe('National Day');
  });

  it('shows nothing for an ordinary day', async () => {
    await hover('9');
    expect(tooltip()).toBeUndefined();
  });

  it('names the holiday in Vietnamese when DatepickerIntl says so', async () => {
    const intl = TestBed.inject(DatepickerIntl);
    intl.holidayLanguage = 'vi';
    intl.changes.next();
    fixture.detectChanges();
    await hover('2');
    expect(tooltip()).toBe('Quốc khánh');
  });

  it('is off with showHolidays = false', async () => {
    fixture.componentInstance.showHolidays.set(false);
    fixture.detectChanges();
    await hover('2');
    expect(tooltip()).toBeUndefined();
  });

  it('shows on hover only, not when the cell is focused', async () => {
    cell('2').dispatchEvent(new FocusEvent('focusin'));
    await wait(260);
    fixture.detectChanges();
    expect(tooltip()).toBeUndefined();
  });

  it('leaves the cell label alone: the tooltip is extra', () => {
    expect(cell('2').getAttribute('aria-label')).toContain('2026');
    expect(cell('2').getAttribute('aria-label')).not.toContain('National');
  });
});
