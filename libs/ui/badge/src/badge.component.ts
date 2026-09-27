import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  numberAttribute,
} from '@angular/core';
import { UiColor } from '@libs/ui/core';
import { UiBadgeSize } from './badge.types';
import { formatBadgeCount } from './badge.utils';
import { badgeVariants } from './badge.variants';

/** Inline count or dot, e.g. next to a menu label. Hidden when there is nothing to show. */
@Component({
  selector: 'ui-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'hostClass()',
    '[attr.hidden]': 'visible() ? null : ""',
  },
  template: '{{ text() }}',
})
export class UiBadgeComponent {
  readonly count = input<number | string | null>(null);
  readonly max = input(99, { transform: numberAttribute });
  readonly showZero = input(false, { transform: booleanAttribute });
  readonly dot = input(false, { transform: booleanAttribute });
  readonly color = input<UiColor>('error');
  readonly size = input<UiBadgeSize>('md');

  protected readonly text = computed(() =>
    this.dot() ? '' : formatBadgeCount(this.count(), this.max(), this.showZero())
  );
  protected readonly visible = computed(() => this.dot() || this.text() !== '');
  protected readonly hostClass = computed(() =>
    badgeVariants({ color: this.color(), size: this.dot() ? 'dot' : this.size() })
  );
}
