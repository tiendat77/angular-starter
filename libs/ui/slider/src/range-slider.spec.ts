import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { describe, expect, it } from 'vitest';
import { UiRangeSlider } from './range-slider.component';
import { UiRangeSliderValue } from './slider.types';

@Component({
  imports: [UiRangeSlider, ReactiveFormsModule],
  template: `
    <ui-range-slider
      [formControl]="control"
      [min]="min()"
      [max]="max()"
      [step]="step()"
      [minGap]="minGap()"
      [showTicks]="showTicks()"
      [disabled]="disabled()"
      ariaLabel="Price"
    />
  `,
})
class ReactiveHost {
  readonly control = new FormControl<UiRangeSliderValue | null>([20, 60]);
  readonly min = signal(0);
  readonly max = signal(100);
  readonly step = signal(1);
  readonly minGap = signal(0);
  readonly showTicks = signal(false);
  readonly disabled = signal(false);
}

@Component({
  imports: [UiRangeSlider],
  template: `<ui-range-slider
    [(value)]="value"
    ariaLabel="Range"
  />`,
})
class ModelHost {
  readonly value = signal<UiRangeSliderValue | null>([10, 30]);
}

const RAIL = { left: 0, right: 200, width: 200, top: 0, bottom: 8, height: 8, x: 0, y: 0 };

async function setup<T>(host: new () => T): Promise<ComponentFixture<T>> {
  const fixture = TestBed.createComponent(host);
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
  return fixture;
}

const root = (f: ComponentFixture<unknown>): HTMLElement => f.nativeElement;
const thumbs = (f: ComponentFixture<unknown>): HTMLElement[] =>
  Array.from(root(f).querySelectorAll<HTMLElement>('ui-slider-thumb'));
const value = (f: ComponentFixture<ReactiveHost>): UiRangeSliderValue | null =>
  f.componentInstance.control.value;

function pointer(el: Element, type: string, x: number, init: MouseEventInit = {}): void {
  const event = new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, ...init });
  Object.defineProperties(event, { pointerId: { value: 1 }, isPrimary: { value: true } });
  el.dispatchEvent(event);
}

function sizeRail(f: ComponentFixture<unknown>): void {
  (root(f).querySelector('.slider-rail') as HTMLElement).getBoundingClientRect = () =>
    ({ ...RAIL, toJSON: () => RAIL }) as DOMRect;
}

const area = (f: ComponentFixture<unknown>): Element => root(f).querySelector('.slider-area')!;

function press(f: ComponentFixture<unknown>, el: HTMLElement, key: string): void {
  el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
  f.detectChanges();
}

describe('UiRangeSlider', () => {
  describe('ARIA', () => {
    it('is a labelled group of two named sliders', async () => {
      const fixture = await setup(ReactiveHost);
      const group = root(fixture).querySelector('ui-range-slider')!;
      expect(group.getAttribute('role')).toBe('group');
      expect(group.getAttribute('aria-label')).toBe('Price');
      const [low, high] = thumbs(fixture);
      expect(low.getAttribute('role')).toBe('slider');
      expect(high.getAttribute('role')).toBe('slider');
      expect(low.getAttribute('aria-label')).toBe('Minimum');
      expect(high.getAttribute('aria-label')).toBe('Maximum');
      expect(low.getAttribute('aria-valuenow')).toBe('20');
      expect(high.getAttribute('aria-valuenow')).toBe('60');
    });

    it('bounds each thumb by the other, per the multi-thumb slider pattern', async () => {
      const fixture = await setup(ReactiveHost);
      const [low, high] = thumbs(fixture);
      expect(low.getAttribute('aria-valuemin')).toBe('0');
      expect(low.getAttribute('aria-valuemax')).toBe('60');
      expect(high.getAttribute('aria-valuemin')).toBe('20');
      expect(high.getAttribute('aria-valuemax')).toBe('100');
    });

    it('takes the gap between the thumbs into the bounds', async () => {
      const fixture = await setup(ReactiveHost);
      fixture.componentInstance.minGap.set(10);
      fixture.detectChanges();
      const [low, high] = thumbs(fixture);
      expect(low.getAttribute('aria-valuemax')).toBe('50');
      expect(high.getAttribute('aria-valuemin')).toBe('30');
    });

    it('has two tab stops, the lower first', async () => {
      const fixture = await setup(ReactiveHost);
      const [low, high] = thumbs(fixture);
      expect(low.getAttribute('tabindex')).toBe('0');
      expect(high.getAttribute('tabindex')).toBe('0');
      expect(low.compareDocumentPosition(high) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });

    it('lets the labels be localised', async () => {
      @Component({
        imports: [UiRangeSlider],
        template: `<ui-range-slider
          startLabel="Từ"
          endLabel="Đến"
        />`,
      })
      class ViHost {}
      const fixture = await setup(ViHost);
      expect(thumbs(fixture).map((t) => t.getAttribute('aria-label'))).toEqual(['Từ', 'Đến']);
    });
  });

  describe('keyboard', () => {
    it('moves each thumb on its own', async () => {
      const fixture = await setup(ReactiveHost);
      const [low, high] = thumbs(fixture);
      press(fixture, low, 'ArrowRight');
      expect(value(fixture)).toEqual([21, 60]);
      press(fixture, high, 'ArrowLeft');
      expect(value(fixture)).toEqual([21, 59]);
      press(fixture, high, 'PageUp');
      expect(value(fixture)).toEqual([21, 69]);
    });

    it("Home and End go to the thumb's own limits", async () => {
      const fixture = await setup(ReactiveHost);
      const [low, high] = thumbs(fixture);
      press(fixture, low, 'End'); // stops at the upper thumb
      expect(value(fixture)).toEqual([60, 60]);
      press(fixture, low, 'Home');
      expect(value(fixture)).toEqual([0, 60]);
      press(fixture, high, 'Home'); // stops at the lower thumb
      expect(value(fixture)).toEqual([0, 0]);
      press(fixture, high, 'End');
      expect(value(fixture)).toEqual([0, 100]);
    });

    it('never lets the thumbs cross', async () => {
      const fixture = await setup(ReactiveHost);
      fixture.componentInstance.control.setValue([50, 50]);
      fixture.detectChanges();
      const [low, high] = thumbs(fixture);
      press(fixture, low, 'ArrowRight');
      expect(value(fixture)).toEqual([50, 50]);
      press(fixture, high, 'ArrowLeft');
      expect(value(fixture)).toEqual([50, 50]);
      press(fixture, low, 'ArrowLeft');
      expect(value(fixture)).toEqual([49, 50]);
    });

    it('keeps the minimum gap', async () => {
      const fixture = await setup(ReactiveHost);
      fixture.componentInstance.minGap.set(10);
      fixture.componentInstance.control.setValue([40, 60]);
      fixture.detectChanges();
      const [low, high] = thumbs(fixture);
      press(fixture, low, 'PageUp'); // +10 would be 50: the gap is 10, so 50 is the limit
      expect(value(fixture)).toEqual([50, 60]);
      press(fixture, low, 'ArrowRight');
      expect(value(fixture)).toEqual([50, 60]);
      press(fixture, high, 'ArrowLeft');
      expect(value(fixture)).toEqual([50, 60]);
    });

    it('does nothing while disabled', async () => {
      const fixture = await setup(ReactiveHost);
      fixture.componentInstance.disabled.set(true);
      fixture.detectChanges();
      press(fixture, thumbs(fixture)[0], 'ArrowRight');
      expect(value(fixture)).toEqual([20, 60]);
      expect(thumbs(fixture).every((t) => t.getAttribute('aria-disabled') === 'true')).toBe(true);
    });
  });

  describe('pointer', () => {
    it('moves the nearest thumb to the pressed position', async () => {
      const fixture = await setup(ReactiveHost); // thumbs at x = 40 and x = 120
      sizeRail(fixture);
      pointer(area(fixture), 'pointerdown', 20); // 10: nearest is the lower
      pointer(area(fixture), 'pointerup', 20);
      expect(value(fixture)).toEqual([10, 60]);
      pointer(area(fixture), 'pointerdown', 190); // 95: nearest is the upper
      expect(value(fixture)).toEqual([10, 95]);
    });

    it('picks by distance when the press is between the thumbs', async () => {
      const fixture = await setup(ReactiveHost);
      sizeRail(fixture);
      pointer(area(fixture), 'pointerdown', 70); // 35: 15 from 20, 25 from 60
      expect(value(fixture)).toEqual([35, 60]);
    });

    it('drags the thumb it started on, and the thumbs do not cross', async () => {
      const fixture = await setup(ReactiveHost);
      sizeRail(fixture);
      pointer(thumbs(fixture)[0], 'pointerdown', 40);
      pointer(area(fixture), 'pointermove', 100); // 50
      expect(value(fixture)).toEqual([50, 60]);
      pointer(area(fixture), 'pointermove', 190); // 95, but the upper thumb is at 60
      expect(value(fixture)).toEqual([60, 60]);
      pointer(area(fixture), 'pointermove', 0);
      expect(value(fixture)).toEqual([0, 60]);
    });

    it('marks the thumb in use, and releases it', async () => {
      const fixture = await setup(ReactiveHost);
      sizeRail(fixture);
      pointer(thumbs(fixture)[1], 'pointerdown', 120);
      fixture.detectChanges();
      expect(thumbs(fixture)[1].classList).toContain('slider-thumb-active');
      expect(thumbs(fixture)[0].classList).not.toContain('slider-thumb-active');
      pointer(area(fixture), 'pointerup', 120);
      fixture.detectChanges();
      expect(thumbs(fixture)[1].classList).not.toContain('slider-thumb-active');
    });

    it('picks the side of the press when both thumbs share a value', async () => {
      const fixture = await setup(ReactiveHost);
      fixture.componentInstance.control.setValue([50, 50]);
      fixture.detectChanges();
      sizeRail(fixture);
      pointer(area(fixture), 'pointerdown', 40); // 20: left of both
      expect(value(fixture)).toEqual([20, 50]);
      pointer(area(fixture), 'pointerup', 40);

      fixture.componentInstance.control.setValue([50, 50]);
      fixture.detectChanges();
      pointer(area(fixture), 'pointerdown', 170); // 85: right of both
      expect(value(fixture)).toEqual([50, 85]);
    });

    it('lets the first move decide when both thumbs share a value and the press is on them', async () => {
      const fixture = await setup(ReactiveHost);
      fixture.componentInstance.control.setValue([50, 50]);
      fixture.detectChanges();
      sizeRail(fixture);
      pointer(thumbs(fixture)[0], 'pointerdown', 100);
      expect(value(fixture)).toEqual([50, 50]); // nothing moved yet
      pointer(area(fixture), 'pointermove', 140);
      expect(value(fixture)).toEqual([50, 70]);
      pointer(area(fixture), 'pointerup', 140);

      fixture.componentInstance.control.setValue([50, 50]);
      fixture.detectChanges();
      pointer(thumbs(fixture)[1], 'pointerdown', 100);
      pointer(area(fixture), 'pointermove', 60);
      expect(value(fixture)).toEqual([30, 50]);
    });

    it('does nothing while disabled', async () => {
      const fixture = await setup(ReactiveHost);
      fixture.componentInstance.disabled.set(true);
      fixture.detectChanges();
      sizeRail(fixture);
      pointer(area(fixture), 'pointerdown', 100);
      expect(value(fixture)).toEqual([20, 60]);
    });
  });

  describe('value', () => {
    it('shows the whole track for a form that has no value yet', async () => {
      const fixture = await setup(ReactiveHost);
      fixture.componentInstance.control.setValue(null);
      fixture.detectChanges();
      expect(thumbs(fixture).map((t) => t.getAttribute('aria-valuenow'))).toEqual(['0', '100']);
      expect(value(fixture)).toBeNull();
    });

    it('shows an unordered or out-of-range value ordered and inside the track', async () => {
      const fixture = await setup(ReactiveHost);
      fixture.componentInstance.control.setValue([80, -10]);
      fixture.detectChanges();
      expect(thumbs(fixture).map((t) => t.getAttribute('aria-valuenow'))).toEqual(['0', '80']);
      expect(value(fixture)).toEqual([80, -10]); // the form's value is left alone
    });

    it('ignores a value that is not a pair of numbers', async () => {
      const fixture = await setup(ReactiveHost);
      fixture.componentInstance.control.setValue([1] as unknown as UiRangeSliderValue);
      fixture.detectChanges();
      expect(thumbs(fixture).map((t) => t.getAttribute('aria-valuenow'))).toEqual(['0', '100']);
    });

    it('starts the form value from the whole track when only one thumb moved', async () => {
      const fixture = await setup(ReactiveHost);
      fixture.componentInstance.control.setValue(null);
      fixture.detectChanges();
      press(fixture, thumbs(fixture)[0], 'ArrowRight');
      expect(value(fixture)).toEqual([1, 100]);
    });

    it('fills between the thumbs', async () => {
      const fixture = await setup(ReactiveHost);
      const fill = root(fixture).querySelector('.slider-fill') as HTMLElement;
      expect(fill.style.insetInlineStart).toBe('20%');
      expect(fill.style.insetInlineEnd).toBe('40%');
    });

    it('snaps to the step', async () => {
      const fixture = await setup(ReactiveHost);
      fixture.componentInstance.step.set(10);
      fixture.detectChanges();
      sizeRail(fixture);
      pointer(area(fixture), 'pointerdown', 62); // 31 -> 30
      expect(value(fixture)).toEqual([30, 60]);
    });
  });

  describe('forms', () => {
    it('supports [(value)]', async () => {
      const fixture = await setup(ModelHost);
      expect(thumbs(fixture).map((t) => t.getAttribute('aria-valuenow'))).toEqual(['10', '30']);
      press(fixture, thumbs(fixture)[1], 'ArrowRight');
      expect(fixture.componentInstance.value()).toEqual([10, 31]);
      fixture.componentInstance.value.set([40, 70]);
      fixture.detectChanges();
      expect(thumbs(fixture).map((t) => t.getAttribute('aria-valuenow'))).toEqual(['40', '70']);
    });

    it('is disabled by the form control', async () => {
      const fixture = await setup(ReactiveHost);
      fixture.componentInstance.control.disable();
      fixture.detectChanges();
      press(fixture, thumbs(fixture)[0], 'ArrowRight');
      expect(value(fixture)).toEqual([20, 60]);
    });

    it('is touched when focus leaves both thumbs, not when it moves between them', async () => {
      const fixture = await setup(ReactiveHost);
      const host = root(fixture).querySelector('ui-range-slider')!;
      host.dispatchEvent(
        new FocusEvent('focusout', { bubbles: true, relatedTarget: thumbs(fixture)[1] })
      );
      expect(fixture.componentInstance.control.touched).toBe(false);
      host.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: null }));
      expect(fixture.componentInstance.control.touched).toBe(true);
    });
  });

  it('draws ticks, marking the ones between the thumbs', async () => {
    const fixture = await setup(ReactiveHost);
    fixture.componentInstance.step.set(20);
    fixture.componentInstance.showTicks.set(true);
    fixture.detectChanges();
    const ticks = Array.from(root(fixture).querySelectorAll('.slider-tick'));
    expect(ticks.length).toBe(6);
    // [20, 60]: the ticks at 20, 40 and 60
    expect(ticks.filter((t) => t.classList.contains('slider-tick-active')).length).toBe(3);
  });
});
