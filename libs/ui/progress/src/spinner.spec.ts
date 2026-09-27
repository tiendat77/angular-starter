import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { UiSpinnerColor, UiSpinnerSize } from './progress.types';
import { UiSpinnerComponent } from './spinner.component';

const CIRCUMFERENCE = 2 * Math.PI * 10;

@Component({
  imports: [UiSpinnerComponent],
  template: `
    <ui-spinner
      [value]="value()"
      [max]="max()"
      [size]="size()"
      [color]="color()"
      [strokeWidth]="strokeWidth()"
      [showValue]="showValue()"
      [label]="label()"
    />
  `,
})
class SpinnerHostComponent {
  readonly value = signal<number | null>(null);
  readonly max = signal(100);
  readonly size = signal<UiSpinnerSize>('inherit');
  readonly color = signal<UiSpinnerColor>('current');
  readonly strokeWidth = signal<number | null>(null);
  readonly showValue = signal(false);
  readonly label = signal('Loading');
}

@Component({
  imports: [UiSpinnerComponent],
  template: `<ui-spinner
    value="5"
    max="10"
  />`,
})
class StaticAttrHostComponent {}

describe('UiSpinnerComponent', () => {
  let fixture: ComponentFixture<SpinnerHostComponent>;
  let host: SpinnerHostComponent;
  let el: HTMLElement;

  const indicator = () => el.querySelector('.spinner-indicator')!;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [SpinnerHostComponent] });
    fixture = TestBed.createComponent(SpinnerHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    el = fixture.nativeElement.querySelector('ui-spinner');
  });

  it('is an indeterminate progressbar by default', () => {
    expect(el.getAttribute('role')).toBe('progressbar');
    expect(el.getAttribute('aria-label')).toBe('Loading');
    expect(el.hasAttribute('aria-valuenow')).toBe(false);
    expect(el.hasAttribute('aria-valuemin')).toBe(false);
    expect(el.hasAttribute('aria-valuemax')).toBe(false);
    expect(el.classList).toContain('spinner-ring');
    expect(el.classList).toContain('spinner-indeterminate');
    expect(el.querySelector('.spinner-track')).toBeNull();
    expect(indicator().hasAttribute('stroke-dasharray')).toBe(false);
  });

  it('renders a determinate ring when value is set', () => {
    host.value.set(42);
    fixture.detectChanges();

    expect(el.getAttribute('aria-valuenow')).toBe('42');
    expect(el.getAttribute('aria-valuemin')).toBe('0');
    expect(el.getAttribute('aria-valuemax')).toBe('100');
    expect(el.classList).toContain('spinner-determinate');
    expect(el.querySelector('.spinner-track')).not.toBeNull();
    expect(Number(indicator().getAttribute('stroke-dasharray'))).toBeCloseTo(CIRCUMFERENCE, 3);
    expect(Number(indicator().getAttribute('stroke-dashoffset'))).toBeCloseTo(
      CIRCUMFERENCE * 0.58,
      3
    );
  });

  it('clamps out-of-range values', () => {
    host.value.set(150);
    fixture.detectChanges();
    expect(el.getAttribute('aria-valuenow')).toBe('100');
    expect(Number(indicator().getAttribute('stroke-dashoffset'))).toBeCloseTo(0, 5);

    host.value.set(-10);
    fixture.detectChanges();
    expect(el.getAttribute('aria-valuenow')).toBe('0');
  });

  it('respects a custom max', () => {
    host.value.set(5);
    host.max.set(10);
    fixture.detectChanges();
    expect(el.getAttribute('aria-valuenow')).toBe('5');
    expect(el.getAttribute('aria-valuemax')).toBe('10');
    expect(Number(indicator().getAttribute('stroke-dashoffset'))).toBeCloseTo(
      CIRCUMFERENCE * 0.5,
      3
    );
  });

  it('shows the rounded percentage only when determinate and lg or xl', () => {
    host.showValue.set(true);
    host.size.set('lg');
    fixture.detectChanges();
    expect(el.querySelector('.spinner-value')).toBeNull(); // indeterminate

    host.value.set(42.4);
    fixture.detectChanges();
    expect(el.querySelector('.spinner-value')!.textContent!.trim()).toBe('42%');

    host.size.set('sm');
    fixture.detectChanges();
    expect(el.querySelector('.spinner-value')).toBeNull();
  });

  it('maps size and color to classes', () => {
    expect(el.className).not.toMatch(/spinner-(xs|sm|md|lg|xl)\b/);
    expect(el.className).not.toContain('spinner-primary');

    host.size.set('lg');
    host.color.set('primary');
    fixture.detectChanges();
    expect(el.classList).toContain('spinner-lg');
    expect(el.classList).toContain('spinner-primary');
  });

  it('uses a per-size default stroke width unless one is given', () => {
    host.size.set('xl');
    fixture.detectChanges();
    expect(indicator().getAttribute('stroke-width')).toBe('2');

    host.strokeWidth.set(4);
    fixture.detectChanges();
    expect(indicator().getAttribute('stroke-width')).toBe('4');
  });

  it('uses the label as aria-label', () => {
    host.label.set('Loading orders');
    fixture.detectChanges();
    expect(el.getAttribute('aria-label')).toBe('Loading orders');
  });
});

describe('UiSpinnerComponent (static attributes)', () => {
  it('accepts value and max as strings', () => {
    TestBed.configureTestingModule({ imports: [StaticAttrHostComponent] });
    const fixture = TestBed.createComponent(StaticAttrHostComponent);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement.querySelector('ui-spinner');
    expect(el.getAttribute('aria-valuenow')).toBe('5');
    expect(el.getAttribute('aria-valuemax')).toBe('10');
    expect(el.classList).toContain('spinner-determinate');
  });
});
