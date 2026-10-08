import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { DateRangeCalendar } from './lib/date-picker/date-range-calendar';
import { DatepickerIntl } from './lib/date-picker/datepicker-intl';
import { provideNativeDateAdapter } from './public-api';

@Component({
  imports: [DateRangeCalendar],
  providers: [provideNativeDateAdapter()],
  template: `<date-range-calendar [startAt]="startAt" />`,
})
class HostComponent {
  readonly startAt = new Date(2026, 9, 8); // October 2026
}

describe('DateRangeCalendar header', () => {
  let fixture: ComponentFixture<HostComponent>;

  const panel = (side: 0 | 1): HTMLElement =>
    fixture.nativeElement.querySelectorAll('.date-range-calendar-panel')[side];
  const label = (side: 0 | 1, kind: 'month' | 'year'): HTMLButtonElement =>
    panel(side).querySelectorAll<HTMLButtonElement>('.calendar-header-label')[
      kind === 'month' ? 0 : 1
    ];
  const text = (side: 0 | 1, kind: 'month' | 'year'): string =>
    label(side, kind).textContent!.trim();
  const arrow = (side: 0 | 1): HTMLButtonElement =>
    panel(side).querySelector<HTMLButtonElement>('button.btn-circle')!;
  const arrows = (side: 0 | 1): string[] =>
    Array.from(panel(side).querySelectorAll<HTMLButtonElement>('button.btn-circle')).map(
      (b) => b.getAttribute('aria-label')!
    );
  const grid = (side: 0 | 1): 'days' | 'months' | 'years' =>
    panel(side).querySelector('year-view')
      ? 'months'
      : panel(side).querySelector('multi-year-view')
        ? 'years'
        : 'days';
  const click = (el: HTMLElement): void => {
    el.click();
    fixture.detectChanges();
  };
  const cell = (side: 0 | 1, name: string): HTMLElement =>
    Array.from(panel(side).querySelectorAll<HTMLElement>('.calendar-body-cell')).find(
      (c) => c.textContent?.trim().toLowerCase() === name.toLowerCase()
    )!;

  const create = (monthYearFormat?: string): void => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    if (monthYearFormat) {
      TestBed.inject(DatepickerIntl).monthYearFormat = monthYearFormat;
    }
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  };

  it('shows the month and the year as two separate buttons per panel', () => {
    create();
    expect([text(0, 'month'), text(0, 'year')]).toEqual(['October', '2026']);
    expect([text(1, 'month'), text(1, 'year')]).toEqual(['November', '2026']);
    expect(label(0, 'month').type).toBe('button');
  });

  it('puts the year first in locales that write it first', () => {
    create('{year} {month}');
    expect(panel(0).querySelector('.date-range-calendar-title')!.classList).toContain(
      'flex-row-reverse'
    );
  });

  it('opens the month grid in one panel only and marks its label active', () => {
    create();
    click(label(0, 'month'));
    expect(grid(0)).toBe('months');
    expect(grid(1)).toBe('days');
    expect(label(0, 'month').getAttribute('aria-expanded')).toBe('true');
    expect(label(0, 'year').getAttribute('aria-expanded')).toBe('false');
  });

  it('opens the year grid and marks the year label active', () => {
    create();
    click(label(1, 'year'));
    expect(grid(1)).toBe('years');
    expect(label(1, 'year').getAttribute('aria-expanded')).toBe('true');
    expect(label(1, 'month').getAttribute('aria-expanded')).toBe('false');
  });

  it('closes the grid when its label is clicked again, or the other label switches it', () => {
    create();
    click(label(0, 'month'));
    click(label(0, 'month'));
    expect(grid(0)).toBe('days');
    click(label(0, 'month'));
    click(label(0, 'year'));
    expect(grid(0)).toBe('years');
  });

  it('jumps to the picked month and drags the other panel along', () => {
    create();
    click(label(0, 'month'));
    click(cell(0, 'mar'));
    expect(grid(0)).toBe('days');
    expect([text(0, 'month'), text(0, 'year')]).toEqual(['March', '2026']);
    expect(text(1, 'month')).toBe('April');
  });

  it('jumping the right panel moves the left one to the month before', () => {
    create();
    click(label(1, 'month'));
    click(cell(1, 'jul'));
    expect(text(1, 'month')).toBe('July');
    expect(text(0, 'month')).toBe('June');
  });

  it('jumps to the picked year and keeps the month', () => {
    create();
    click(label(0, 'year'));
    click(cell(0, '2019'));
    expect(grid(0)).toBe('days');
    expect([text(0, 'month'), text(0, 'year')]).toEqual(['October', '2019']);
    expect([text(1, 'month'), text(1, 'year')]).toEqual(['November', '2019']);
  });

  it('has one arrow per panel on the days, and both in a month or year grid', () => {
    create();
    expect(arrows(0)).toEqual(['Previous month']);
    expect(arrows(1)).toEqual(['Next month']);

    click(label(0, 'month'));
    expect(arrows(0)).toEqual(['Previous year', 'Next year']);
    expect(arrows(1)).toEqual(['Next month']);

    click(label(1, 'year'));
    expect(arrows(1)).toEqual(['Previous 24 years', 'Next 24 years']);

    click(label(0, 'month'));
    click(label(1, 'year'));
    expect(arrows(0)).toEqual(['Previous month']);
    expect(arrows(1)).toEqual(['Next month']);
  });

  it('pages a grid in both directions from either panel, the other panel following', () => {
    create();
    click(label(1, 'month'));
    const next = panel(1).querySelectorAll<HTMLButtonElement>('button.btn-circle')[1];
    click(next);
    expect(text(1, 'year')).toBe('2027');
    expect(text(1, 'month')).toBe('November');
    expect([text(0, 'month'), text(0, 'year')]).toEqual(['October', '2027']);

    const prev = panel(1).querySelectorAll<HTMLButtonElement>('button.btn-circle')[0];
    click(prev);
    click(prev);
    expect(text(1, 'year')).toBe('2025');
  });

  it('moves the panels by a month, a year or a page of years, whatever the arrow shows', () => {
    create();
    click(arrow(0));
    expect([text(0, 'month'), text(0, 'year')]).toEqual(['September', '2026']);

    click(label(0, 'month'));
    expect(arrow(0).getAttribute('aria-label')).toBe('Previous year');
    click(arrow(0));
    expect(text(0, 'year')).toBe('2025');

    click(label(0, 'year'));
    expect(arrow(0).getAttribute('aria-label')).toBe('Previous 24 years');
    click(arrow(0));
    expect(text(0, 'year')).toBe('2001');
  });
});
