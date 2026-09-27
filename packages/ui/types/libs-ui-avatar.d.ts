import * as _angular_core from '@angular/core';
import { InjectionToken, Signal } from '@angular/core';
import { UiSize } from '@libs/ui/core';

type UiAvatarShape = 'circle' | 'square';

/** Provided by `ui-avatar-group` to its avatars. */
interface UiAvatarGroupContext {
    readonly size: Signal<UiSize>;
    readonly shape: Signal<UiAvatarShape>;
    /** Whether the group hides this avatar (beyond `max`). Reads signals, so it's reactive. */
    isHidden(avatar: object): boolean;
}
declare const UI_AVATAR_GROUP: InjectionToken<UiAvatarGroupContext>;

/** Overlapping row of avatars. Avatars beyond `max` are hidden behind a "+N" avatar. */
declare class UiAvatarGroupComponent implements UiAvatarGroupContext {
    readonly max: _angular_core.InputSignalWithTransform<number | null, unknown>;
    readonly size: _angular_core.InputSignal<UiSize>;
    readonly shape: _angular_core.InputSignal<UiAvatarShape>;
    private readonly _avatars;
    protected readonly overflow: _angular_core.Signal<number>;
    protected readonly moreClass: _angular_core.Signal<string>;
    isHidden(avatar: object): boolean;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<UiAvatarGroupComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<UiAvatarGroupComponent, "ui-avatar-group", never, { "max": { "alias": "max"; "required": false; "isSignal": true; }; "size": { "alias": "size"; "required": false; "isSignal": true; }; "shape": { "alias": "shape"; "required": false; "isSignal": true; }; }, {}, ["_avatars"], ["*"], true, never>;
}

/**
 * User picture with a fallback chain: image → initials from `name` → projected content → user icon.
 * The fallback stays underneath until the image has loaded, and returns if it fails.
 */
declare class UiAvatarComponent {
    private readonly _group;
    readonly src: _angular_core.InputSignal<string | null>;
    readonly alt: _angular_core.InputSignal<string | null>;
    readonly name: _angular_core.InputSignal<string | null>;
    readonly size: _angular_core.InputSignal<UiSize | undefined>;
    readonly shape: _angular_core.InputSignal<UiAvatarShape | undefined>;
    /** Reset whenever `src` changes, so a new URL is tried again. */
    protected readonly failed: _angular_core.WritableSignal<boolean>;
    protected readonly loaded: _angular_core.WritableSignal<boolean>;
    protected readonly initials: _angular_core.Signal<string>;
    protected readonly showImage: _angular_core.Signal<boolean>;
    protected readonly accessibleName: _angular_core.Signal<string>;
    protected readonly decorative: _angular_core.Signal<boolean>;
    protected readonly hiddenByGroup: _angular_core.Signal<boolean>;
    protected readonly hostClass: _angular_core.Signal<string>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<UiAvatarComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<UiAvatarComponent, "ui-avatar", never, { "src": { "alias": "src"; "required": false; "isSignal": true; }; "alt": { "alias": "alt"; "required": false; "isSignal": true; }; "name": { "alias": "name"; "required": false; "isSignal": true; }; "size": { "alias": "size"; "required": false; "isSignal": true; }; "shape": { "alias": "shape"; "required": false; "isSignal": true; }; }, {}, never, ["*"], true, never>;
}

declare const avatarVariants: (props?: {
    size?: "xs" | "sm" | "md" | "lg" | "xl" | undefined;
    shape?: "circle" | "square" | undefined;
} | undefined, extraClass?: string) => string;

/** "Nguyễn Văn An" → "NA", "linh" → "L", blank → "". */
declare function getInitials(name: string | null | undefined): string;

export { UI_AVATAR_GROUP, UiAvatarComponent, UiAvatarGroupComponent, avatarVariants, getInitials };
export type { UiAvatarGroupContext, UiAvatarShape };
