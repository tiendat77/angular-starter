import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  forwardRef,
  input,
  numberAttribute,
} from '@angular/core';
import { UiSize } from '@libs/ui/core';
import { UiAvatarComponent } from './avatar.component';
import { UI_AVATAR_GROUP, UiAvatarGroupContext } from './avatar.tokens';
import { UiAvatarShape } from './avatar.types';
import { avatarVariants } from './avatar.variants';

function optionalNumberAttribute(value: unknown): number | null {
  return value === null || value === undefined || value === '' ? null : numberAttribute(value);
}

/** Overlapping row of avatars. Avatars beyond `max` are hidden behind a "+N" avatar. */
@Component({
  selector: 'ui-avatar-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: UI_AVATAR_GROUP, useExisting: forwardRef(() => UiAvatarGroupComponent) }],
  host: {
    role: 'group',
    class: 'avatar-group',
  },
  template: `
    <ng-content />
    @if (overflow() > 0) {
      <span
        role="img"
        [class]="moreClass()"
        [attr.aria-label]="overflow() + ' more'"
        >+{{ overflow() }}</span
      >
    }
  `,
})
export class UiAvatarGroupComponent implements UiAvatarGroupContext {
  readonly max = input<number | null, unknown>(null, { transform: optionalNumberAttribute });
  readonly size = input<UiSize>('md');
  readonly shape = input<UiAvatarShape>('circle');

  private readonly _avatars = contentChildren(UiAvatarComponent);

  protected readonly overflow = computed(() => {
    const max = this.max();
    return max === null ? 0 : Math.max(0, this._avatars().length - max);
  });

  protected readonly moreClass = computed(() =>
    avatarVariants({ size: this.size(), shape: this.shape() }, 'avatar-more')
  );

  isHidden(avatar: object): boolean {
    const max = this.max();
    if (max === null) return false;
    return this._avatars().indexOf(avatar as UiAvatarComponent) >= max;
  }
}
