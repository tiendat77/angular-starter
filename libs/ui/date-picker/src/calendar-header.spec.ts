import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { Calendar, CalendarView } from './lib/calendar/calendar';
import { provideNativeDateAdapter } from './public-api';

@Component({
  imports: [Calendar],
  providers: [provideNativeDateAdapter()],
  template: `<calendar
    [startAt]="startAt"
    [startView]="startView()"
  />`,
})
class HostComponent {
  readonly startAt = new Date(2026, 9, 8); // October 2026
  readonly startView = signal<CalendarView>('month');
}

describe('CalendarHeader labels', () => {
  let fixture: ComponentFixture<HostComponent>;

  const root = (): HTMLElement => fixture.nativeElement;
  const label = (kind: 'month' | 'year'): HTMLButtonElement =>
    root().querySelectorAll<HTMLButtonElement>('calendar-header .calendar-header-label')[
      kind === 'month' ? 0 : 1
    ];
  const text = (kind: 'month' | 'year'): string => label(kind).textContent!.trim();
  const view = (): 'days' | 'months' | 'years' =>
    root().querySelector('year-view')
      ? 'months'
      : root().querySelector('multi-year-view')
        ? 'years'
        : 'days';
  const click = (el: HTMLElement): void => {
    el.click();
    fixture.detectChanges();
  };
  const cell = (name: string): HTMLElement =>
    Array.from(root().querySelectorAll<HTMLElement>('.calendar-body-cell')).find(
      (c) => c.textContent?.trim().toLowerCase() === name.toLowerCase()
    )!;

  const create = (startView: CalendarView = 'month'): void => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.startView.set(startView);
    fixture.detectChanges();
  };

  it('shows the month and the year as two separate buttons', () => {
    create();
    expect([text('month'), text('year')]).toEqual(['October', '2026']);
    expect(label('month').type).toBe('button');
    expect(view()).toBe('days');
  });

  it('opens the month grid and marks the month label active', () => {
    create();
    click(label('month'));
    expect(view()).toBe('months');
    expect(label('month').getAttribute('aria-expanded')).toBe('true');
    expect(label('year').getAttribute('aria-expanded')).toBe('false');
  });

  it('opens the year grid and marks the year label active', () => {
    create();
    click(label('year'));
    expect(view()).toBe('years');
    expect(label('year').getAttribute('aria-expanded')).toBe('true');
    expect(label('month').getAttribute('aria-expanded')).toBe('false');
  });

  it('goes back to the days when the open label is clicked again', () => {
    create();
    click(label('month'));
    click(label('month'));
    expect(view()).toBe('days');
    click(label('year'));
    click(label('year'));
    expect(view()).toBe('days');
  });

  it('jumps to the picked month', () => {
    create();
    click(label('month'));
    click(cell('mar'));
    expect(view()).toBe('days');
    expect([text('month'), text('year')]).toEqual(['March', '2026']);
  });

  it('jumps straight to the days of the picked year, keeping the month', () => {
    create();
    click(label('year'));
    click(cell('2019'));
    expect(view()).toBe('days');
    expect([text('month'), text('year')]).toEqual(['October', '2019']);
  });

  it('keeps the quick return when the grids are switched from one to the other', () => {
    create();
    click(label('month'));
    click(label('year'));
    expect(view()).toBe('years');
    click(cell('2031'));
    expect(view()).toBe('days');
    expect(text('year')).toBe('2031');
  });

  it('keeps the year → month → day flow of a picker that starts on the years', () => {
    create('multi-year');
    click(cell('2019'));
    expect(view()).toBe('months');
    click(cell('feb'));
    expect(view()).toBe('days');
    expect([text('month'), text('year')]).toEqual(['February', '2019']);
  });

  it('pages by a month, a year or 24 years according to the grid', () => {
    create();
    const arrow = (name: string): HTMLButtonElement =>
      root().querySelector<HTMLButtonElement>(`calendar-header button[aria-label="${name}"]`)!;
    click(arrow('Next month'));
    expect(text('month')).toBe('November');
    click(label('month'));
    click(arrow('Next year'));
    expect(text('year')).toBe('2027');
    click(label('year'));
    click(arrow('Previous 24 years'));
    expect(text('year')).toBe('2003');
  });
});
