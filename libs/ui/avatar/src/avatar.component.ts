import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  linkedSignal,
} from '@angular/core';
import { UiSize } from '@libs/ui/core';
import { UI_AVATAR_GROUP } from './avatar.tokens';
import { UiAvatarShape } from './avatar.types';
import { avatarVariants } from './avatar.variants';
import { getInitials } from './initials';

/**
 * User picture with a fallback chain: image → initials from `name` → projected content → user icon.
 * The fallback stays underneath until the image has loaded, and returns if it fails.
 */
@Component({
  selector: 'ui-avatar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './avatar.component.html',
  host: {
    '[class]': 'hostClass()',
    '[attr.role]': 'decorative() ? null : "img"',
    '[attr.aria-label]': 'decorative() ? null : accessibleName()',
    '[attr.aria-hidden]': 'decorative() ? "true" : null',
    '[attr.hidden]': 'hiddenByGroup() ? "" : null',
  },
})
export class UiAvatarComponent {
  private readonly _group = inject(UI_AVATAR_GROUP, { optional: true });

  readonly src = input<string | null>(null);
  readonly alt = input<string | null>(null);
  readonly name = input<string | null>(null);
  readonly size = input<UiSize | undefined>(undefined);
  readonly shape = input<UiAvatarShape | undefined>(undefined);

  /** Reset whenever `src` changes, so a new URL is tried again. */
  protected readonly failed = linkedSignal({ source: this.src, computation: () => false });
  protected readonly loaded = linkedSignal({ source: this.src, computation: () => false });

  protected readonly initials = computed(() => getInitials(this.name()));
  protected readonly showImage = computed(() => !!this.src() && !this.failed());
  protected readonly accessibleName = computed(() => (this.alt() ?? this.name() ?? '').trim());
  protected readonly decorative = computed(() => this.accessibleName() === '');
  protected readonly hiddenByGroup = computed(() => this._group?.isHidden(this) ?? false);

  protected readonly hostClass = computed(() =>
    avatarVariants({
      size: this.size() ?? this._group?.size() ?? 'md',
      shape: this.shape() ?? this._group?.shape() ?? 'circle',
    })
  );
}
