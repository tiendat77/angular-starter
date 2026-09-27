import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UiColor } from '@libs/ui/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { UiProgressBarComponent } from './progress-bar.component';
import { UiProgressBarSize } from './progress.types';

@Component({
  imports: [UiProgressBarComponent],
  template: `
    <ui-progress-bar
      [value]="value()"
      [max]="max()"
      [size]="size()"
      [color]="color()"
      [label]="label()"
    />
  `,
})
class BarHostComponent {
  readonly value = signal<number | null>(50);
  readonly max = signal(100);
  readonly size = signal<UiProgressBarSize>('md');
  readonly color = signal<UiColor>('primary');
  readonly label = signal('Progress');
}

@Component({
  imports: [UiProgressBarComponent],
  template: `<ui-progress-bar value="30" />`,
})
class StaticAttrHostComponent {}

describe('UiProgressBarComponent', () => {
  let fixture: ComponentFixture<BarHostComponent>;
  let host: BarHostComponent;
  let el: HTMLElement;

  const fill = () => el.querySelector<HTMLElement>('.progress-bar-fill')!;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [BarHostComponent] });
    fixture = TestBed.createComponent(BarHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    el = fixture.nativeElement.querySelector('ui-progress-bar');
  });

  it('is a determinate progressbar scaled to the value', () => {
    expect(el.getAttribute('role')).toBe('progressbar');
    expect(el.getAttribute('aria-label')).toBe('Progress');
    expect(el.getAttribute('aria-valuenow')).toBe('50');
    expect(el.getAttribute('aria-valuemin')).toBe('0');
    expect(el.getAttribute('aria-valuemax')).toBe('100');
    expect(fill().style.transform).toBe('scaleX(0.5)');
    expect(el.classList).not.toContain('progress-bar-indeterminate');
  });

  it('clamps the fill and aria-valuenow', () => {
    host.value.set(150);
    fixture.detectChanges();
    expect(fill().style.transform).toBe('scaleX(1)');
    expect(el.getAttribute('aria-valuenow')).toBe('100');

    host.value.set(-5);
    fixture.detectChanges();
    expect(fill().style.transform).toBe('scaleX(0)');
    expect(el.getAttribute('aria-valuenow')).toBe('0');
  });

  it('respects a custom max', () => {
    host.value.set(3);
    host.max.set(4);
    fixture.detectChanges();
    expect(fill().style.transform).toBe('scaleX(0.75)');
    expect(el.getAttribute('aria-valuemax')).toBe('4');
  });

  it('is indeterminate when value is null', () => {
    host.value.set(null);
    fixture.detectChanges();
    expect(el.classList).toContain('progress-bar-indeterminate');
    expect(el.hasAttribute('aria-valuenow')).toBe(false);
    expect(el.hasAttribute('aria-valuemax')).toBe(false);
    expect(fill().style.transform).toBe('');
  });

  it('maps size and color to classes', () => {
    expect(el.classList).toContain('progress-bar');
    expect(el.classList).toContain('progress-bar-md');
    expect(el.classList).toContain('progress-bar-primary');

    host.size.set('lg');
    host.color.set('success');
    fixture.detectChanges();
    expect(el.classList).toContain('progress-bar-lg');
    expect(el.classList).toContain('progress-bar-success');
  });
});

describe('UiProgressBarComponent (static attributes)', () => {
  it('accepts value as a string', () => {
    TestBed.configureTestingModule({ imports: [StaticAttrHostComponent] });
    const fixture = TestBed.createComponent(StaticAttrHostComponent);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement.querySelector('ui-progress-bar');
    expect(el.getAttribute('aria-valuenow')).toBe('30');
    expect(el.querySelector<HTMLElement>('.progress-bar-fill')!.style.transform).toBe(
      'scaleX(0.3)'
    );
  });
});
