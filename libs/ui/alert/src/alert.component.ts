import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
  output,
} from '@angular/core';
import { UiColor } from '@libs/ui/core';
import { UI_ALERT_ICONS } from './alert-icons';
import { UiAlertAppearance, UiAlertRole } from './alert.types';
import { alertVariants } from './alert.variants';

/**
 * Inline message (or full-width banner). Dismissing only hides it and updates `open`; the consumer
 * decides whether to remove it.
 */
@Component({
  selector: 'ui-alert',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './alert.component.html',
  host: {
    '[class]': 'hostClass()',
    '[attr.role]': 'effectiveRole()',
    '[attr.hidden]': 'open() ? null : ""',
  },
})
export class UiAlertComponent {
  readonly color = input<UiColor>('neutral');
  readonly appearance = input<UiAlertAppearance>('soft');
  readonly icon = input(true, { transform: booleanAttribute });
  readonly banner = input(false, { transform: booleanAttribute });
  readonly dismissible = input(false, { transform: booleanAttribute });
  readonly closeLabel = input('Dismiss');
  readonly role = input<UiAlertRole | null>(null);
  readonly open = model(true);
  readonly closed = output<void>();

  protected readonly iconPath = computed(() =>
    this.icon() ? (UI_ALERT_ICONS[this.color()] ?? null) : null
  );

  protected readonly effectiveRole = computed(() => {
    const role = this.role();
    if (role === 'none') return null;
    if (role) return role;
    return this.color() === 'error' || this.color() === 'warning' ? 'alert' : 'status';
  });

  protected readonly hostClass = computed(() =>
    alertVariants({
      color: this.color(),
      appearance: this.appearance(),
      banner: this.banner() ? 'true' : 'false',
    })
  );

  close(): void {
    this.open.set(false);
    this.closed.emit();
  }
}
