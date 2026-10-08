import { Directionality } from '@angular/cdk/bidi';
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UiFormFieldComponent, UiHintDirective, UiLabelDirective } from '@libs/ui/input';
import { of } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { UiSlider } from './slider.component';
import { UiSliderColor, UiSliderSize, UiSliderValueText } from './slider.types';

@Component({
  imports: [UiSlider, ReactiveFormsModule],
  template: `
    <ui-slider
      [formControl]="control"
      [min]="min()"
      [max]="max()"
      [step]="step()"
      [size]="size()"
      [color]="color()"
      [showTicks]="showTicks()"
      [tickStep]="tickStep()"
      [displayWith]="displayWith()"
      [showValue]="showValue()"
      [disabled]="disabled()"
      ariaLabel="Volume"
    />
  `,
})
class ReactiveHost {
  readonly control = new FormControl<number | null>(40);
  readonly min = signal(0);
  readonly max = signal(100);
  readonly step = signal(1);
  readonly size = signal<UiSliderSize>('md');
  readonly color = signal<UiSliderColor>('primary');
  readonly showTicks = signal(false);
  readonly tickStep = signal<number | null>(null);
  readonly displayWith = signal<UiSliderValueText | undefined>(undefined);
  readonly showValue = signal(false);
  readonly disabled = signal(false);
}

@Component({
  imports: [UiSlider],
  template: `<ui-slider
    [(value)]="value"
    ariaLabel="Brightness"
  />`,
})
class ModelHost {
  readonly value = signal<number | null>(25);
}

@Component({
  imports: [UiSlider, FormsModule],
  template: `<ui-slider
    [(ngModel)]="value"
    ariaLabel="Zoom"
  />`,
})
class NgModelHost {
  value: number | null = 30;
}

@Component({
  imports: [UiSlider, ReactiveFormsModule, UiFormFieldComponent, UiLabelDirective, UiHintDirective],
  template: `
    <ui-form-field>
      <label uiLabel>Volume</label>
      <ui-slider
        [formControl]="control"
        ariaLabel="Volume"
      />
      <span uiHint>Between 10 and 90</span>
    </ui-form-field>
  `,
})
class FormFieldHost {
  readonly control = new FormControl<number | null>(5, [Validators.min(10)]);
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
const thumb = (f: ComponentFixture<unknown>): HTMLElement =>
  root(f).querySelector('ui-slider-thumb') as HTMLElement;

/** A pointer event: jsdom has no PointerEvent, and the slider reads `pointerId` and `isPrimary`. */
function pointer(el: Element, type: string, x: number, init: MouseEventInit = {}): void {
  const event = new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, ...init });
  Object.defineProperties(event, { pointerId: { value: 1 }, isPrimary: { value: true } });
  el.dispatchEvent(event);
}

/** Gives the rail a width: jsdom measures everything as 0. */
function sizeRail(f: ComponentFixture<unknown>): void {
  (root(f).querySelector('.slider-rail') as HTMLElement).getBoundingClientRect = () =>
    ({ ...RAIL, toJSON: () => RAIL }) as DOMRect;
}

function press(f: ComponentFixture<unknown>, key: string, el = thumb(f)): void {
  el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
  f.detectChanges();
}

describe('UiSlider', () => {
  describe('ARIA', () => {
    it('is a named slider with its range and value', async () => {
      const fixture = await setup(ReactiveHost);
      const el = thumb(fixture);
      expect(el.getAttribute('role')).toBe('slider');
      expect(el.getAttribute('aria-label')).toBe('Volume');
      expect(el.getAttribute('aria-valuemin')).toBe('0');
      expect(el.getAttribute('aria-valuemax')).toBe('100');
      expect(el.getAttribute('aria-valuenow')).toBe('40');
      expect(el.getAttribute('aria-orientation')).toBe('horizontal');
      expect(el.getAttribute('tabindex')).toBe('0');
      expect(el.getAttribute('aria-disabled')).toBeNull();
    });

    it('has aria-valuetext only when the app formats the value', async () => {
      const fixture = await setup(ReactiveHost);
      expect(thumb(fixture).getAttribute('aria-valuetext')).toBeNull();
      fixture.componentInstance.displayWith.set((v) => `${v} percent`);
      fixture.detectChanges();
      expect(thumb(fixture).getAttribute('aria-valuetext')).toBe('40 percent');
      expect(thumb(fixture).querySelector('.slider-bubble')?.textContent).toBe('40 percent');
    });

    it('shows the plain value in the bubble by default', async () => {
      const fixture = await setup(ReactiveHost);
      expect(thumb(fixture).querySelector('.slider-bubble')?.textContent).toBe('40');
    });

    it('is disabled for assistive technology and leaves the tab order', async () => {
      const fixture = await setup(ReactiveHost);
      fixture.componentInstance.disabled.set(true);
      fixture.detectChanges();
      expect(thumb(fixture).getAttribute('aria-disabled')).toBe('true');
      expect(thumb(fixture).getAttribute('tabindex')).toBe('-1');
      expect(root(fixture).querySelector('.slider-disabled')).not.toBeNull();
    });

    it('prefers aria-labelledby over aria-label', async () => {
      @Component({
        imports: [UiSlider],
        template: `<ui-slider
          ariaLabel="ignored"
          ariaLabelledby="title"
        />`,
      })
      class LabelledHost {}
      const fixture = await setup(LabelledHost);
      expect(thumb(fixture).getAttribute('aria-labelledby')).toBe('title');
      expect(thumb(fixture).getAttribute('aria-label')).toBeNull();
    });
  });

  describe('keyboard', () => {
    it('moves by one step with the arrows', async () => {
      const fixture = await setup(ReactiveHost);
      press(fixture, 'ArrowRight');
      expect(fixture.componentInstance.control.value).toBe(41);
      press(fixture, 'ArrowUp');
      expect(fixture.componentInstance.control.value).toBe(42);
      press(fixture, 'ArrowLeft');
      press(fixture, 'ArrowDown');
      expect(fixture.componentInstance.control.value).toBe(40);
    });

    it('moves by the step input', async () => {
      const fixture = await setup(ReactiveHost);
      fixture.componentInstance.step.set(5);
      fixture.detectChanges();
      press(fixture, 'ArrowRight');
      expect(fixture.componentInstance.control.value).toBe(45);
    });

    it('moves by 10% of the range with Page Up and Page Down', async () => {
      const fixture = await setup(ReactiveHost);
      press(fixture, 'PageUp');
      expect(fixture.componentInstance.control.value).toBe(50);
      press(fixture, 'PageDown');
      press(fixture, 'PageDown');
      expect(fixture.componentInstance.control.value).toBe(30);
    });

    it('goes to the ends with Home and End', async () => {
      const fixture = await setup(ReactiveHost);
      press(fixture, 'End');
      expect(fixture.componentInstance.control.value).toBe(100);
      press(fixture, 'Home');
      expect(fixture.componentInstance.control.value).toBe(0);
    });

    it('stops at the ends', async () => {
      const fixture = await setup(ReactiveHost);
      fixture.componentInstance.control.setValue(100);
      fixture.detectChanges();
      press(fixture, 'ArrowRight');
      press(fixture, 'PageUp');
      expect(fixture.componentInstance.control.value).toBe(100);
    });

    it('leaves other keys alone, and does not scroll for the ones it handles', async () => {
      const fixture = await setup(ReactiveHost);
      const other = new KeyboardEvent('keydown', { key: 'a', bubbles: true, cancelable: true });
      thumb(fixture).dispatchEvent(other);
      expect(other.defaultPrevented).toBe(false);
      const arrow = new KeyboardEvent('keydown', {
        key: 'ArrowRight',
        bubbles: true,
        cancelable: true,
      });
      thumb(fixture).dispatchEvent(arrow);
      expect(arrow.defaultPrevented).toBe(true);
    });

    it('ignores keys with a modifier (browser shortcuts)', async () => {
      const fixture = await setup(ReactiveHost);
      thumb(fixture).dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowRight', ctrlKey: true, bubbles: true })
      );
      expect(fixture.componentInstance.control.value).toBe(40);
    });

    it('does nothing while disabled', async () => {
      const fixture = await setup(ReactiveHost);
      fixture.componentInstance.disabled.set(true);
      fixture.detectChanges();
      press(fixture, 'ArrowRight');
      expect(fixture.componentInstance.control.value).toBe(40);
    });

    it('swaps the horizontal arrows in a right-to-left layout', async () => {
      TestBed.configureTestingModule({
        providers: [{ provide: Directionality, useValue: { value: 'rtl', change: of() } }],
      });
      const fixture = await setup(ReactiveHost);
      press(fixture, 'ArrowRight');
      expect(fixture.componentInstance.control.value).toBe(39);
      press(fixture, 'ArrowLeft');
      press(fixture, 'ArrowLeft');
      expect(fixture.componentInstance.control.value).toBe(41);
    });
  });

  describe('pointer', () => {
    it('jumps to the pressed position of the track', async () => {
      const fixture = await setup(ReactiveHost);
      sizeRail(fixture);
      pointer(root(fixture).querySelector('.slider-area')!, 'pointerdown', 150);
      expect(fixture.componentInstance.control.value).toBe(75);
    });

    it('follows the pointer while dragging, and stops on release', async () => {
      const fixture = await setup(ReactiveHost);
      sizeRail(fixture);
      const area = root(fixture).querySelector('.slider-area')!;
      pointer(area, 'pointerdown', 80);
      fixture.detectChanges();
      expect(thumb(fixture).classList).toContain('slider-thumb-active');
      pointer(area, 'pointermove', 120);
      expect(fixture.componentInstance.control.value).toBe(60);
      pointer(area, 'pointermove', 20);
      expect(fixture.componentInstance.control.value).toBe(10);

      pointer(area, 'pointerup', 20);
      fixture.detectChanges();
      expect(thumb(fixture).classList).not.toContain('slider-thumb-active');
      pointer(area, 'pointermove', 180);
      expect(fixture.componentInstance.control.value).toBe(10);
    });

    it('keeps the value inside the track when the pointer leaves it', async () => {
      const fixture = await setup(ReactiveHost);
      sizeRail(fixture);
      const area = root(fixture).querySelector('.slider-area')!;
      pointer(area, 'pointerdown', 100);
      pointer(area, 'pointermove', 900);
      expect(fixture.componentInstance.control.value).toBe(100);
      pointer(area, 'pointermove', -900);
      expect(fixture.componentInstance.control.value).toBe(0);
    });

    it('snaps to the step', async () => {
      const fixture = await setup(ReactiveHost);
      fixture.componentInstance.step.set(10);
      fixture.detectChanges();
      sizeRail(fixture);
      pointer(root(fixture).querySelector('.slider-area')!, 'pointerdown', 94);
      expect(fixture.componentInstance.control.value).toBe(50);
    });

    it('does not move the thumb under the pointer when it is grabbed off centre', async () => {
      const fixture = await setup(ReactiveHost); // value 40 -> thumb at x = 80
      sizeRail(fixture);
      pointer(thumb(fixture), 'pointerdown', 90); // grabbed 10px (5 units) right of its centre
      expect(fixture.componentInstance.control.value).toBe(40);
      pointer(root(fixture).querySelector('.slider-area')!, 'pointermove', 110);
      expect(fixture.componentInstance.control.value).toBe(50);
    });

    it('ignores other mouse buttons and a disabled slider', async () => {
      const fixture = await setup(ReactiveHost);
      sizeRail(fixture);
      const area = root(fixture).querySelector('.slider-area')!;
      pointer(area, 'pointerdown', 150, { button: 2 });
      expect(fixture.componentInstance.control.value).toBe(40);
      fixture.componentInstance.disabled.set(true);
      fixture.detectChanges();
      pointer(area, 'pointerdown', 150);
      expect(fixture.componentInstance.control.value).toBe(40);
    });

    it('focuses the thumb it moves', async () => {
      const fixture = await setup(ReactiveHost);
      sizeRail(fixture);
      document.body.appendChild(fixture.nativeElement);
      pointer(root(fixture).querySelector('.slider-area')!, 'pointerdown', 100);
      expect(document.activeElement).toBe(thumb(fixture));
      fixture.nativeElement.remove();
    });
  });

  describe('value', () => {
    it('shows the minimum for a form that has no value yet', async () => {
      const fixture = await setup(ReactiveHost);
      fixture.componentInstance.control.setValue(null);
      fixture.detectChanges();
      expect(thumb(fixture).getAttribute('aria-valuenow')).toBe('0');
      expect(fixture.componentInstance.control.value).toBeNull();
    });

    it('shows a value outside the track clamped, and leaves the form value alone', async () => {
      const fixture = await setup(ReactiveHost);
      fixture.componentInstance.control.setValue(150);
      fixture.detectChanges();
      expect(thumb(fixture).getAttribute('aria-valuenow')).toBe('100');
      expect(fixture.componentInstance.control.value).toBe(150);
    });

    it('follows min and max', async () => {
      const fixture = await setup(ReactiveHost);
      fixture.componentInstance.min.set(20);
      fixture.componentInstance.max.set(60);
      fixture.detectChanges();
      expect(thumb(fixture).getAttribute('aria-valuemin')).toBe('20');
      expect(thumb(fixture).getAttribute('aria-valuemax')).toBe('60');
      press(fixture, 'End');
      expect(fixture.componentInstance.control.value).toBe(60);
    });

    it('does not emit when nothing changes', async () => {
      const fixture = await setup(ReactiveHost);
      let changes = 0;
      fixture.componentInstance.control.valueChanges.subscribe(() => changes++);
      press(fixture, 'Home');
      press(fixture, 'Home');
      expect(changes).toBe(1);
    });

    it('writes the form value into the thumb, without echoing it back', async () => {
      const fixture = await setup(ReactiveHost);
      let changes = 0;
      fixture.componentInstance.control.valueChanges.subscribe(() => changes++);
      fixture.componentInstance.control.setValue(70);
      fixture.detectChanges();
      expect(thumb(fixture).getAttribute('aria-valuenow')).toBe('70');
      expect(changes).toBe(1);
    });
  });

  describe('forms', () => {
    it('supports [(value)]', async () => {
      const fixture = await setup(ModelHost);
      expect(thumb(fixture).getAttribute('aria-valuenow')).toBe('25');
      press(fixture, 'ArrowRight');
      expect(fixture.componentInstance.value()).toBe(26);
      fixture.componentInstance.value.set(80);
      fixture.detectChanges();
      expect(thumb(fixture).getAttribute('aria-valuenow')).toBe('80');
    });

    it('supports ngModel', async () => {
      const fixture = await setup(NgModelHost);
      expect(thumb(fixture).getAttribute('aria-valuenow')).toBe('30');
      press(fixture, 'End');
      expect(fixture.componentInstance.value).toBe(100);
    });

    it('is disabled by the form control', async () => {
      const fixture = await setup(ReactiveHost);
      fixture.componentInstance.control.disable();
      fixture.detectChanges();
      expect(thumb(fixture).getAttribute('aria-disabled')).toBe('true');
      press(fixture, 'ArrowRight');
      expect(fixture.componentInstance.control.value).toBe(40);
      fixture.componentInstance.control.enable();
      fixture.detectChanges();
      expect(thumb(fixture).getAttribute('aria-disabled')).toBeNull();
    });

    it('is touched when focus leaves the slider', async () => {
      const fixture = await setup(ReactiveHost);
      expect(fixture.componentInstance.control.touched).toBe(false);
      root(fixture)
        .querySelector('ui-slider')!
        .dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: null }));
      expect(fixture.componentInstance.control.touched).toBe(true);
    });

    it('works inside ui-form-field: describes and flags the thumb', async () => {
      const fixture = await setup(FormFieldHost);
      const el = thumb(fixture);
      expect(el.getAttribute('aria-describedby')).toContain('ui-hint');
      expect(el.getAttribute('aria-invalid')).toBeNull();
      fixture.componentInstance.control.markAsTouched();
      fixture.detectChanges();
      expect(el.getAttribute('aria-invalid')).toBe('true');
      expect(root(fixture).querySelector('.slider-invalid')).not.toBeNull();
    });
  });

  describe('ticks', () => {
    it('draws none by default', async () => {
      const fixture = await setup(ReactiveHost);
      expect(root(fixture).querySelectorAll('.slider-tick').length).toBe(0);
    });

    it('draws one per step', async () => {
      const fixture = await setup(ReactiveHost);
      fixture.componentInstance.step.set(25);
      fixture.componentInstance.showTicks.set(true);
      fixture.detectChanges();
      expect(root(fixture).querySelectorAll('.slider-tick').length).toBe(5);
      expect(root(fixture).querySelector('.slider-ticked')).not.toBeNull();
    });

    it('draws one per tickStep, and marks the ones under the fill', async () => {
      const fixture = await setup(ReactiveHost);
      fixture.componentInstance.tickStep.set(20);
      fixture.componentInstance.showTicks.set(true);
      fixture.detectChanges();
      const ticks = Array.from(root(fixture).querySelectorAll('.slider-tick'));
      expect(ticks.length).toBe(6);
      // the value is 40: the ticks at 0, 20 and 40 are inside the fill
      expect(ticks.filter((t) => t.classList.contains('slider-tick-active')).length).toBe(3);
    });
  });

  describe('look', () => {
    it('maps size and color onto the CSS utilities', async () => {
      const fixture = await setup(ReactiveHost);
      fixture.componentInstance.size.set('lg');
      fixture.componentInstance.color.set('success');
      fixture.detectChanges();
      const host = root(fixture).querySelector('ui-slider')!;
      expect(host.className).toContain('slider-lg');
      expect(host.className).toContain('slider-success');
    });

    it('keeps the bubble visible with showValue', async () => {
      const fixture = await setup(ReactiveHost);
      fixture.componentInstance.showValue.set(true);
      fixture.detectChanges();
      expect(thumb(fixture).classList).toContain('slider-thumb-show');
      // room above the track, so the bubble does not cover what is over the slider
      expect(root(fixture).querySelector('ui-slider')!.className).toContain('slider-valued');
    });

    it('places the fill and the thumb by percent', async () => {
      const fixture = await setup(ReactiveHost);
      expect(thumb(fixture).style.insetInlineStart).toBe('40%');
      expect(
        (root(fixture).querySelector('.slider-fill') as HTMLElement).style.insetInlineEnd
      ).toBe('60%');
    });
  });
});
