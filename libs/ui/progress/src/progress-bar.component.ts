import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  numberAttribute,
} from '@angular/core';
import { UiColor } from '@libs/ui/core';
import { UiProgressBarSize } from './progress.types';
import { clampProgress, clampValue, progressValueAttribute } from './progress.utils';
import { progressBarVariants } from './progress.variants';

/** Linear progress indicator. Indeterminate while `value` is `null`. */
@Component({
  selector: 'ui-progress-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'progressbar',
    '[class]': 'hostClass()',
    '[attr.aria-label]': 'label()',
    '[attr.aria-valuemin]': 'determinate() ? 0 : null',
    '[attr.aria-valuemax]': 'determinate() ? max() : null',
    '[attr.aria-valuenow]': 'determinate() ? valueNow() : null',
  },
  template: `<div
    class="progress-bar-fill"
    [style.transform]="fillTransform()"
  ></div>`,
})
export class UiProgressBarComponent {
  readonly value = input<number | null, unknown>(null, { transform: progressValueAttribute });
  readonly max = input(100, { transform: numberAttribute });
  readonly size = input<UiProgressBarSize>('md');
  readonly color = input<UiColor>('primary');
  readonly label = input('Progress');

  protected readonly determinate = computed(() => this.value() !== null);
  protected readonly valueNow = computed(() => clampValue(this.value() ?? 0, this.max()));
  protected readonly fillTransform = computed(() =>
    this.determinate() ? `scaleX(${clampProgress(this.value() ?? 0, this.max()) / 100})` : null
  );

  protected readonly hostClass = computed(() =>
    progressBarVariants({
      size: this.size(),
      color: this.color(),
      mode: this.determinate() ? 'determinate' : 'indeterminate',
    })
  );
}
