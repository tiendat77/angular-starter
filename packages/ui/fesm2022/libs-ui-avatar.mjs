import * as i0 from '@angular/core';
import { InjectionToken, inject, input, linkedSignal, computed, ChangeDetectionStrategy, Component, numberAttribute, contentChildren, forwardRef } from '@angular/core';
import { cva } from '@libs/ui/core';

const UI_AVATAR_GROUP = new InjectionToken('UI_AVATAR_GROUP');

const avatarVariants = cva({
    base: 'avatar',
    variants: {
        size: {
            xs: 'avatar-xs',
            sm: 'avatar-sm',
            md: 'avatar-md',
            lg: 'avatar-lg',
            xl: 'avatar-xl',
        },
        shape: { circle: '', square: 'avatar-square' },
    },
    defaultVariants: { size: 'md', shape: 'circle' },
});

/** First user-perceived character, so combining marks and emoji stay whole. */
function firstGrapheme(word) {
    if (typeof Intl !== 'undefined' && typeof Intl.Segmenter === 'function') {
        const segments = new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(word);
        const first = segments[Symbol.iterator]().next();
        return first.done ? '' : first.value.segment;
    }
    return Array.from(word)[0] ?? '';
}
/** "Nguyễn Văn An" → "NA", "linh" → "L", blank → "". */
function getInitials(name) {
    const words = (name ?? '').trim().split(/\s+/).filter(Boolean);
    if (words.length === 0)
        return '';
    const first = firstGrapheme(words[0]);
    const last = words.length > 1 ? firstGrapheme(words[words.length - 1]) : '';
    return (first + last).toLocaleUpperCase();
}

/**
 * User picture with a fallback chain: image → initials from `name` → projected content → user icon.
 * The fallback stays underneath until the image has loaded, and returns if it fails.
 */
class UiAvatarComponent {
    _group = inject(UI_AVATAR_GROUP, { optional: true });
    src = input(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "src" }] : /* istanbul ignore next */ []));
    alt = input(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "alt" }] : /* istanbul ignore next */ []));
    name = input(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "name" }] : /* istanbul ignore next */ []));
    size = input(undefined, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "size" }] : /* istanbul ignore next */ []));
    shape = input(undefined, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "shape" }] : /* istanbul ignore next */ []));
    /** Reset whenever `src` changes, so a new URL is tried again. */
    failed = linkedSignal({ ...(ngDevMode ? { debugName: "failed" } : /* istanbul ignore next */ {}), source: this.src, computation: () => false });
    loaded = linkedSignal({ ...(ngDevMode ? { debugName: "loaded" } : /* istanbul ignore next */ {}), source: this.src, computation: () => false });
    initials = computed(() => getInitials(this.name()), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "initials" }] : /* istanbul ignore next */ []));
    showImage = computed(() => !!this.src() && !this.failed(), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "showImage" }] : /* istanbul ignore next */ []));
    accessibleName = computed(() => (this.alt() ?? this.name() ?? '').trim(), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "accessibleName" }] : /* istanbul ignore next */ []));
    decorative = computed(() => this.accessibleName() === '', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "decorative" }] : /* istanbul ignore next */ []));
    hiddenByGroup = computed(() => this._group?.isHidden(this) ?? false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "hiddenByGroup" }] : /* istanbul ignore next */ []));
    hostClass = computed(() => avatarVariants({
        size: this.size() ?? this._group?.size() ?? 'md',
        shape: this.shape() ?? this._group?.shape() ?? 'circle',
    }), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "hostClass" }] : /* istanbul ignore next */ []));
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiAvatarComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "22.0.5", type: UiAvatarComponent, isStandalone: true, selector: "ui-avatar", inputs: { src: { classPropertyName: "src", publicName: "src", isSignal: true, isRequired: false, transformFunction: null }, alt: { classPropertyName: "alt", publicName: "alt", isSignal: true, isRequired: false, transformFunction: null }, name: { classPropertyName: "name", publicName: "name", isSignal: true, isRequired: false, transformFunction: null }, size: { classPropertyName: "size", publicName: "size", isSignal: true, isRequired: false, transformFunction: null }, shape: { classPropertyName: "shape", publicName: "shape", isSignal: true, isRequired: false, transformFunction: null } }, host: { properties: { "class": "hostClass()", "attr.role": "decorative() ? null : \"img\"", "attr.aria-label": "decorative() ? null : accessibleName()", "attr.aria-hidden": "decorative() ? \"true\" : null", "attr.hidden": "hiddenByGroup() ? \"\" : null" } }, ngImport: i0, template: "@if (!loaded()) {\n  @if (initials()) {\n    <span\n      class=\"avatar-initials\"\n      aria-hidden=\"true\"\n    >\n      {{ initials() }}\n    </span>\n  } @else {\n    <span\n      class=\"avatar-fallback\"\n      aria-hidden=\"true\"\n    >\n      <ng-content>\n        <svg\n          class=\"avatar-icon\"\n          viewBox=\"0 0 24 24\"\n          fill=\"currentColor\"\n        >\n          <path\n            d=\"M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-4.42 0-8 2.24-8 5v1a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-1c0-2.76-3.58-5-8-5Z\"\n          />\n        </svg>\n      </ng-content>\n    </span>\n  }\n}\n@if (showImage()) {\n  <img\n    class=\"avatar-image\"\n    alt=\"\"\n    [src]=\"src()\"\n    [class.avatar-image-loaded]=\"loaded()\"\n    (load)=\"loaded.set(true)\"\n    (error)=\"failed.set(true)\"\n  />\n}\n", changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiAvatarComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ui-avatar', changeDetection: ChangeDetectionStrategy.OnPush, host: {
                        '[class]': 'hostClass()',
                        '[attr.role]': 'decorative() ? null : "img"',
                        '[attr.aria-label]': 'decorative() ? null : accessibleName()',
                        '[attr.aria-hidden]': 'decorative() ? "true" : null',
                        '[attr.hidden]': 'hiddenByGroup() ? "" : null',
                    }, template: "@if (!loaded()) {\n  @if (initials()) {\n    <span\n      class=\"avatar-initials\"\n      aria-hidden=\"true\"\n    >\n      {{ initials() }}\n    </span>\n  } @else {\n    <span\n      class=\"avatar-fallback\"\n      aria-hidden=\"true\"\n    >\n      <ng-content>\n        <svg\n          class=\"avatar-icon\"\n          viewBox=\"0 0 24 24\"\n          fill=\"currentColor\"\n        >\n          <path\n            d=\"M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-4.42 0-8 2.24-8 5v1a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-1c0-2.76-3.58-5-8-5Z\"\n          />\n        </svg>\n      </ng-content>\n    </span>\n  }\n}\n@if (showImage()) {\n  <img\n    class=\"avatar-image\"\n    alt=\"\"\n    [src]=\"src()\"\n    [class.avatar-image-loaded]=\"loaded()\"\n    (load)=\"loaded.set(true)\"\n    (error)=\"failed.set(true)\"\n  />\n}\n" }]
        }], propDecorators: { src: [{ type: i0.Input, args: [{ isSignal: true, alias: "src", required: false }] }], alt: [{ type: i0.Input, args: [{ isSignal: true, alias: "alt", required: false }] }], name: [{ type: i0.Input, args: [{ isSignal: true, alias: "name", required: false }] }], size: [{ type: i0.Input, args: [{ isSignal: true, alias: "size", required: false }] }], shape: [{ type: i0.Input, args: [{ isSignal: true, alias: "shape", required: false }] }] } });

function optionalNumberAttribute(value) {
    return value === null || value === undefined || value === '' ? null : numberAttribute(value);
}
/** Overlapping row of avatars. Avatars beyond `max` are hidden behind a "+N" avatar. */
class UiAvatarGroupComponent {
    max = input(null, { ...(ngDevMode ? { debugName: "max" } : /* istanbul ignore next */ {}), transform: optionalNumberAttribute });
    size = input('md', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "size" }] : /* istanbul ignore next */ []));
    shape = input('circle', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "shape" }] : /* istanbul ignore next */ []));
    _avatars = contentChildren(UiAvatarComponent, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "_avatars" }] : /* istanbul ignore next */ []));
    overflow = computed(() => {
        const max = this.max();
        return max === null ? 0 : Math.max(0, this._avatars().length - max);
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "overflow" }] : /* istanbul ignore next */ []));
    moreClass = computed(() => avatarVariants({ size: this.size(), shape: this.shape() }, 'avatar-more'), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "moreClass" }] : /* istanbul ignore next */ []));
    isHidden(avatar) {
        const max = this.max();
        if (max === null)
            return false;
        return this._avatars().indexOf(avatar) >= max;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiAvatarGroupComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "22.0.5", type: UiAvatarGroupComponent, isStandalone: true, selector: "ui-avatar-group", inputs: { max: { classPropertyName: "max", publicName: "max", isSignal: true, isRequired: false, transformFunction: null }, size: { classPropertyName: "size", publicName: "size", isSignal: true, isRequired: false, transformFunction: null }, shape: { classPropertyName: "shape", publicName: "shape", isSignal: true, isRequired: false, transformFunction: null } }, host: { attributes: { "role": "group" }, classAttribute: "avatar-group" }, providers: [{ provide: UI_AVATAR_GROUP, useExisting: forwardRef(() => UiAvatarGroupComponent) }], queries: [{ propertyName: "_avatars", predicate: UiAvatarComponent, isSignal: true }], ngImport: i0, template: `
    <ng-content />
    @if (overflow() > 0) {
      <span
        role="img"
        [class]="moreClass()"
        [attr.aria-label]="overflow() + ' more'"
        >+{{ overflow() }}</span
      >
    }
  `, isInline: true, changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiAvatarGroupComponent, decorators: [{
            type: Component,
            args: [{
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
                }]
        }], propDecorators: { max: [{ type: i0.Input, args: [{ isSignal: true, alias: "max", required: false }] }], size: [{ type: i0.Input, args: [{ isSignal: true, alias: "size", required: false }] }], shape: [{ type: i0.Input, args: [{ isSignal: true, alias: "shape", required: false }] }], _avatars: [{ type: i0.ContentChildren, args: [i0.forwardRef(() => UiAvatarComponent), { isSignal: true }] }] } });

/**
 * Generated bundle index. Do not edit.
 */

export { UI_AVATAR_GROUP, UiAvatarComponent, UiAvatarGroupComponent, avatarVariants, getInitials };
//# sourceMappingURL=libs-ui-avatar.mjs.map
