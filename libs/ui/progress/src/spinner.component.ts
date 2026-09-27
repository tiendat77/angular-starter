import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  numberAttribute,
} from '@angular/core';
import { UiSpinnerColor, UiSpinnerSize } from './progress.types';
import { clampProgress, clampValue, progressValueAttribute } from './progress.utils';
import { spinnerVariants } from './progress.variants';

/** Ring radius in the 24×24 viewBox. */
const RADIUS = 10;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** Default stroke width (viewBox units) per size: small spinners stay visible, large ones stay light. */
const DEFAULT_STROKE: Record<UiSpinnerSize, number> = {
  inherit: 3,
  xs: 3,
  sm: 3,
  md: 2.5,
  lg: 2,
  xl: 2,
};

/**
 * Circular progress indicator. Indeterminate (rotating arc) while `value` is `null`; a determinate
 * ring filled to `value / max` otherwise.
 */
@Component({
  selector: 'ui-spinner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'progressbar',
    '[class]': 'hostClass()',
    '[attr.aria-label]': 'label()',
    '[attr.aria-valuemin]': 'determinate() ? 0 : null',
    '[attr.aria-valuemax]': 'determinate() ? max() : null',
    '[attr.aria-valuenow]': 'determinate() ? valueNow() : null',
  },
  template: `
    <svg
      class="spinner-svg"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      @if (determinate()) {
        <circle
          class="spinner-track"
          cx="12"
          cy="12"
          r="10"
          fill="none"
          [attr.stroke-width]="stroke()"
        />
      }
      <circle
        class="spinner-indicator"
        cx="12"
        cy="12"
        r="10"
        fill="none"
        [attr.stroke-width]="stroke()"
        [attr.stroke-dasharray]="determinate() ? circumference : null"
        [attr.stroke-dashoffset]="dashOffset()"
      />
    </svg>
    @if (showValueText()) {
      <span
        class="spinner-value"
        aria-hidden="true"
        >{{ percentText() }}%</span
      >
    }
  `,
})
export class UiSpinnerComponent {
  readonly value = input<number | null, unknown>(null, { transform: progressValueAttribute });
  readonly max = input(100, { transform: numberAttribute });
  readonly size = input<UiSpinnerSize>('inherit');
  readonly strokeWidth = input<number | null, unknown>(null, { transform: progressValueAttribute });
  readonly color = input<UiSpinnerColor>('current');
  readonly showValue = input(false, { transform: booleanAttribute });
  readonly label = input('Loading');

  protected readonly circumference = CIRCUMFERENCE;
  protected readonly determinate = computed(() => this.value() !== null);
  protected readonly percent = computed(() => clampProgress(this.value() ?? 0, this.max()));
  protected readonly percentText = computed(() => Math.round(this.percent()));
  protected readonly valueNow = computed(() => clampValue(this.value() ?? 0, this.max()));
  protected readonly dashOffset = computed(() =>
    this.determinate() ? CIRCUMFERENCE * (1 - this.percent() / 100) : null
  );
  protected readonly stroke = computed(() => this.strokeWidth() ?? DEFAULT_STROKE[this.size()]);
  protected readonly showValueText = computed(
    () => this.showValue() && this.determinate() && (this.size() === 'lg' || this.size() === 'xl')
  );

  protected readonly hostClass = computed(() =>
    spinnerVariants({
      size: this.size(),
      color: this.color(),
      mode: this.determinate() ? 'determinate' : 'indeterminate',
    })
  );
}
