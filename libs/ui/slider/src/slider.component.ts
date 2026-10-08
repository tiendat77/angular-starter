import { ChangeDetectionStrategy, Component, computed, forwardRef, model } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { UiFormFieldControl } from '@libs/ui/core';
import { UiSliderBase } from './slider-base';
import { UiSliderThumb } from './slider-thumb.component';
import { clamp, snapToStep } from './slider.utils';

/**
 * A slider with one thumb: the value is a `number` between `min` and `max`, in multiples of `step`.
 *
 * Works on its own (`[(value)]`) and with `formControl` / `ngModel`, and inside `ui-form-field`.
 * Keyboard: arrows move by `step`, Page Up / Down by 10% of the range, Home / End to `min` / `max`.
 */
@Component({
  selector: 'ui-slider',
  exportAs: 'uiSlider',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UiSliderThumb],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => UiSlider), multi: true },
    { provide: UiFormFieldControl, useExisting: forwardRef(() => UiSlider) },
  ],
  templateUrl: './slider.component.html',
})
export class UiSlider extends UiSliderBase<number> {
  /** The value; `null` (a form that has none yet) shows `min`. */
  readonly value = model<number | null>(null);

  readonly $value = computed(() => this.value());

  /** What the thumb shows: the value kept inside the track, without touching the form's value. */
  protected readonly $shown = computed(() =>
    clamp(this.value() ?? this.$min(), this.$min(), this.$max())
  );

  writeValue(value: number | null | undefined): void {
    this.value.set(typeof value === 'number' && Number.isFinite(value) ? value : null);
  }

  protected override _thumbValues(): readonly number[] {
    return [this.$shown()];
  }

  protected override _fillRange(): readonly [number, number] {
    return [this.$min(), this.$shown()];
  }

  protected override _setThumb(_index: number, raw: number): void {
    const next = snapToStep(raw, this.$min(), this.$max(), this.$step());
    if (next === this.value()) {
      return;
    }
    this.value.set(next);
    this._onChange(next);
  }
}
