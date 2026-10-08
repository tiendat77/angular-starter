import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  model,
  numberAttribute,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { UiFormFieldControl } from '@libs/ui/core';
import { UiSliderBase } from './slider-base';
import { UiSliderThumb } from './slider-thumb.component';
import { UiRangeSliderValue } from './slider.types';
import { clamp, snapToStep } from './slider.utils';

/**
 * A slider with two thumbs: the value is `[low, high]`, two numbers between `min` and `max`. The
 * thumbs never cross (`minGap` keeps them apart). A press on the track moves the nearest thumb.
 *
 * Works on its own (`[(value)]`) and with `formControl` / `ngModel`, and inside `ui-form-field`.
 * Each thumb is its own `role="slider"` inside a `role="group"`; Tab goes from the lower to the upper.
 */
@Component({
  selector: 'ui-range-slider',
  exportAs: 'uiRangeSlider',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UiSliderThumb],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => UiRangeSlider), multi: true },
    { provide: UiFormFieldControl, useExisting: forwardRef(() => UiRangeSlider) },
  ],
  host: {
    role: 'group',
    '[attr.aria-label]': 'ariaLabelledby() ? null : (ariaLabel() ?? null)',
    '[attr.aria-labelledby]': 'ariaLabelledby() ?? null',
  },
  templateUrl: './range-slider.component.html',
})
export class UiRangeSlider extends UiSliderBase<UiRangeSliderValue> {
  /** `[low, high]`; `null` (a form that has none yet) shows the whole track. */
  readonly value = model<UiRangeSliderValue | null>(null);

  /** The least distance between the two thumbs (0: they may touch). */
  readonly minGap = input(0, { transform: (value: unknown) => numberAttribute(value, 0) });
  /** Accessible name of the lower / upper thumb. */
  readonly startLabel = input('Minimum');
  readonly endLabel = input('Maximum');

  readonly $value = computed(() => this.value());

  /** The values the thumbs show: ordered and kept inside the track, without touching the form. */
  protected readonly $shown = computed<readonly [number, number]>(() => {
    const value = this.value();
    const min = this.$min();
    const max = this.$max();
    if (!value) {
      return [min, max];
    }
    const [a, b] = value;
    return [clamp(Math.min(a, b), min, max), clamp(Math.max(a, b), min, max)];
  });

  private readonly _gap = computed(() => Math.max(0, this.minGap()));

  /** What each thumb may reach: the lower stops at the upper (less the gap), and the reverse. */
  protected readonly $lowerBounds = computed(() => [
    this.$min(),
    Math.max(this.$min(), this.$shown()[1] - this._gap()),
  ]);
  protected readonly $upperBounds = computed(() => [
    Math.min(this.$max(), this.$shown()[0] + this._gap()),
    this.$max(),
  ]);

  writeValue(value: UiRangeSliderValue | null | undefined): void {
    const valid =
      Array.isArray(value) &&
      value.length === 2 &&
      value.every((part) => typeof part === 'number' && Number.isFinite(part));
    this.value.set(valid ? (value as UiRangeSliderValue) : null);
  }

  protected override _thumbValues(): readonly number[] {
    return this.$shown();
  }

  protected override _fillRange(): readonly [number, number] {
    return this.$shown();
  }

  protected override _setThumb(index: number, raw: number): void {
    const [low, high] = this.$shown();
    const [lowest, highest] = index === 0 ? this.$lowerBounds() : this.$upperBounds();
    const snapped = snapToStep(raw, this.$min(), this.$max(), this.$step());
    const next = clamp(snapped, lowest, highest);
    const out: UiRangeSliderValue = index === 0 ? [next, high] : [low, next];

    const current = this.value();
    if (current && current[0] === out[0] && current[1] === out[1]) {
      return;
    }
    this.value.set(out);
    this._onChange(out);
  }
}
