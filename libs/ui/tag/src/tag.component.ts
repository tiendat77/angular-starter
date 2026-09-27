import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  isDevMode,
  model,
  OnInit,
  output,
} from '@angular/core';
import { UiColor } from '@libs/ui/core';
import { UiTagAppearance, UiTagSize } from './tag.types';
import { tagVariants } from './tag.variants';

let nextTagId = 0;

/**
 * Text label chip. `removable` adds a × button that emits `(removed)` (the consumer removes the tag).
 * `checkable` turns the whole tag into a toggle button bound to `checked`. The two are exclusive.
 */
@Component({
  selector: 'ui-tag',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './tag.component.html',
  host: {
    '[class]': 'hostClass()',
    '[attr.role]': 'checkable() ? "button" : null',
    '[attr.tabindex]': 'checkable() ? (disabled() ? -1 : 0) : null',
    '[attr.aria-pressed]': 'checkable() ? checked() : null',
    '[attr.aria-disabled]': 'disabled() ? "true" : null',
    '(click)': 'toggle()',
    '(keydown.enter)': 'onToggleKey($event)',
    '(keydown.space)': 'onToggleKey($event)',
  },
})
export class UiTagComponent implements OnInit {
  readonly color = input<UiColor>('neutral');
  readonly appearance = input<UiTagAppearance>('soft');
  readonly size = input<UiTagSize>('md');
  readonly removable = input(false, { transform: booleanAttribute });
  readonly removeLabel = input('Remove');
  readonly checkable = input(false, { transform: booleanAttribute });
  readonly checked = model(false);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly removed = output<void>();

  private readonly _id = `ui-tag-${++nextTagId}`;
  protected readonly labelId = `${this._id}-label`;
  protected readonly removeTextId = `${this._id}-remove`;

  protected readonly hostClass = computed(() =>
    tagVariants({
      color: this.color(),
      appearance: this.checkable() ? (this.checked() ? 'solid' : 'outline') : this.appearance(),
      size: this.size(),
      checkable: this.checkable() ? 'true' : 'false',
      disabled: this.disabled() ? 'true' : 'false',
    })
  );

  ngOnInit(): void {
    if (isDevMode() && this.removable() && this.checkable()) {
      throw new Error(
        'ui-tag: `removable` and `checkable` cannot be combined (a button inside a button is invalid).'
      );
    }
  }

  protected toggle(): void {
    if (!this.checkable() || this.disabled()) return;
    this.checked.update((checked) => !checked);
  }

  protected onToggleKey(event: Event): void {
    if (!this.checkable()) return;
    event.preventDefault();
    this.toggle();
  }

  protected remove(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    if (this.disabled()) return;
    this.removed.emit();
  }
}
