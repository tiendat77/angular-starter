import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  output,
} from '@angular/core';
import { clamp, snapToStep, valueForKey } from './slider.utils';

/**
 * One thumb of a slider: the `role="slider"` element, with its ARIA attributes, its keyboard
 * handling and the value bubble. Internal: `UiSlider` renders one and `UiRangeSlider` two. Dragging
 * is not here, the slider's track owns the pointer (so a press on the track can pick the thumb).
 */
@Component({
  selector: 'ui-slider-thumb',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'slider-thumb',
    role: 'slider',
    '[attr.id]': 'thumbId()',
    '[attr.tabindex]': 'disabled() ? -1 : 0',
    '[attr.aria-valuemin]': 'lowerBound()',
    '[attr.aria-valuemax]': 'upperBound()',
    '[attr.aria-valuenow]': 'value()',
    '[attr.aria-valuetext]': 'valueText()',
    '[attr.aria-orientation]': '"horizontal"',
    '[attr.aria-disabled]': 'disabled() ? "true" : null',
    '[attr.aria-invalid]': 'invalid() ? "true" : null',
    '[attr.aria-label]': 'label()',
    '[attr.aria-labelledby]': 'labelledby()',
    '[attr.aria-describedby]': 'describedBy()',
    '[style.inset-inline-start.%]': 'percent()',
    '[class.slider-thumb-active]': 'active()',
    '[class.slider-thumb-show]': 'showValue()',
    '(keydown)': 'onKeydown($event)',
  },
  template: `<span
    class="slider-bubble"
    aria-hidden="true"
    >{{ bubbleText() }}</span
  >`,
})
export class UiSliderThumb {
  readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  readonly thumbId = input<string | null>(null);
  readonly value = input.required<number>();
  /** The whole slider: the step grid starts at `min`. */
  readonly min = input.required<number>();
  readonly max = input.required<number>();
  /** What this thumb may reach: a thumb of a range slider stops at the other one. */
  readonly lowerBound = input.required<number>();
  readonly upperBound = input.required<number>();
  readonly step = input.required<number>();
  readonly pageStep = input.required<number>();
  readonly rtl = input(false);
  /** Position on the track, 0–100. */
  readonly percent = input.required<number>();

  readonly disabled = input(false);
  readonly invalid = input(false);
  readonly label = input<string | null>(null);
  readonly labelledby = input<string | null>(null);
  readonly describedBy = input<string | null>(null);
  /** `aria-valuetext`, only when the app formats the value. */
  readonly valueText = input<string | null>(null);
  readonly bubbleText = input.required<string>();
  /** The bubble stays visible (otherwise it shows on hover, focus and drag). */
  readonly showValue = input(false);
  /** A pointer is dragging this thumb. */
  readonly active = input(false);

  /** The value the user asked for with the keyboard, already snapped and within the bounds. */
  readonly valueChange = output<number>();

  protected onKeydown(event: KeyboardEvent): void {
    if (this.disabled() || event.altKey || event.ctrlKey || event.metaKey) {
      return;
    }
    const lower = this.lowerBound();
    const upper = this.upperBound();
    const wanted = valueForKey(event.key, this.value(), {
      min: lower,
      max: upper,
      step: this.step(),
      page: this.pageStep(),
      rtl: this.rtl(),
    });
    if (wanted === null) {
      return;
    }
    event.preventDefault();
    const next = clamp(snapToStep(wanted, this.min(), this.max(), this.step()), lower, upper);
    if (next !== this.value()) {
      this.valueChange.emit(next);
    }
  }
}
