import { InjectionToken, Signal } from '@angular/core';
import { UiSize } from '@libs/ui/core';
import { UiAvatarShape } from './avatar.types';

/** Provided by `ui-avatar-group` to its avatars. */
export interface UiAvatarGroupContext {
  readonly size: Signal<UiSize>;
  readonly shape: Signal<UiAvatarShape>;
  /** Whether the group hides this avatar (beyond `max`). Reads signals, so it's reactive. */
  isHidden(avatar: object): boolean;
}

export const UI_AVATAR_GROUP = new InjectionToken<UiAvatarGroupContext>('UI_AVATAR_GROUP');
