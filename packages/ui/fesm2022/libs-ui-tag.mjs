import * as i0 from '@angular/core';
import { Directive, input, booleanAttribute, model, output, computed, isDevMode, ChangeDetectionStrategy, Component } from '@angular/core';
import { cva } from '@libs/ui/core';

/** Leading icon or avatar of a `ui-tag`, sized to the tag's text. */
class UiTagIconDirective {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiTagIconDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "22.0.5", type: UiTagIconDirective, isStandalone: true, selector: "[uiTagIcon]", host: { classAttribute: "tag-icon" }, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiTagIconDirective, decorators: [{
            type: Directive,
            args: [{ selector: '[uiTagIcon]', host: { class: 'tag-icon' } }]
        }] });

const tagVariants = cva({
    base: 'tag',
    variants: {
        color: {
            neutral: 'tag-neutral',
            primary: 'tag-primary',
            info: 'tag-info',
            success: 'tag-success',
            warning: 'tag-warning',
            error: 'tag-error',
        },
        // soft is the base look of `tag`, so it needs no modifier
        appearance: { soft: '', outline: 'tag-outline', solid: 'tag-solid' },
        size: { sm: 'tag-sm', md: 'tag-md', lg: 'tag-lg' },
        checkable: { true: 'tag-checkable', false: '' },
        disabled: { true: 'tag-disabled', false: '' },
    },
    defaultVariants: {
        color: 'neutral',
        appearance: 'soft',
        size: 'md',
        checkable: 'false',
        disabled: 'false',
    },
});

let nextTagId = 0;
/**
 * Text label chip. `removable` adds a × button that emits `(removed)` (the consumer removes the tag).
 * `checkable` turns the whole tag into a toggle button bound to `checked`. The two are exclusive.
 */
class UiTagComponent {
    color = input('neutral', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "color" }] : /* istanbul ignore next */ []));
    appearance = input('soft', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "appearance" }] : /* istanbul ignore next */ []));
    size = input('md', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "size" }] : /* istanbul ignore next */ []));
    removable = input(false, { ...(ngDevMode ? { debugName: "removable" } : /* istanbul ignore next */ {}), transform: booleanAttribute });
    removeLabel = input('Remove', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "removeLabel" }] : /* istanbul ignore next */ []));
    checkable = input(false, { ...(ngDevMode ? { debugName: "checkable" } : /* istanbul ignore next */ {}), transform: booleanAttribute });
    checked = model(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "checked" }] : /* istanbul ignore next */ []));
    disabled = input(false, { ...(ngDevMode ? { debugName: "disabled" } : /* istanbul ignore next */ {}), transform: booleanAttribute });
    removed = output();
    _id = `ui-tag-${++nextTagId}`;
    labelId = `${this._id}-label`;
    removeTextId = `${this._id}-remove`;
    hostClass = computed(() => tagVariants({
        color: this.color(),
        appearance: this.checkable() ? (this.checked() ? 'solid' : 'outline') : this.appearance(),
        size: this.size(),
        checkable: this.checkable() ? 'true' : 'false',
        disabled: this.disabled() ? 'true' : 'false',
    }), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "hostClass" }] : /* istanbul ignore next */ []));
    ngOnInit() {
        if (isDevMode() && this.removable() && this.checkable()) {
            throw new Error('ui-tag: `removable` and `checkable` cannot be combined (a button inside a button is invalid).');
        }
    }
    toggle() {
        if (!this.checkable() || this.disabled())
            return;
        this.checked.update((checked) => !checked);
    }
    onToggleKey(event) {
        if (!this.checkable())
            return;
        event.preventDefault();
        this.toggle();
    }
    remove(event) {
        event.preventDefault();
        event.stopPropagation();
        if (this.disabled())
            return;
        this.removed.emit();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiTagComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "22.0.5", type: UiTagComponent, isStandalone: true, selector: "ui-tag", inputs: { color: { classPropertyName: "color", publicName: "color", isSignal: true, isRequired: false, transformFunction: null }, appearance: { classPropertyName: "appearance", publicName: "appearance", isSignal: true, isRequired: false, transformFunction: null }, size: { classPropertyName: "size", publicName: "size", isSignal: true, isRequired: false, transformFunction: null }, removable: { classPropertyName: "removable", publicName: "removable", isSignal: true, isRequired: false, transformFunction: null }, removeLabel: { classPropertyName: "removeLabel", publicName: "removeLabel", isSignal: true, isRequired: false, transformFunction: null }, checkable: { classPropertyName: "checkable", publicName: "checkable", isSignal: true, isRequired: false, transformFunction: null }, checked: { classPropertyName: "checked", publicName: "checked", isSignal: true, isRequired: false, transformFunction: null }, disabled: { classPropertyName: "disabled", publicName: "disabled", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { checked: "checkedChange", removed: "removed" }, host: { listeners: { "click": "toggle()", "keydown.enter": "onToggleKey($event)", "keydown.space": "onToggleKey($event)" }, properties: { "class": "hostClass()", "attr.role": "checkable() ? \"button\" : null", "attr.tabindex": "checkable() ? (disabled() ? -1 : 0) : null", "attr.aria-pressed": "checkable() ? checked() : null", "attr.aria-disabled": "disabled() ? \"true\" : null" } }, ngImport: i0, template: "<ng-content select=\"[uiTagIcon]\" />\n<span\n  class=\"tag-label\"\n  [id]=\"labelId\"\n>\n  <ng-content />\n</span>\n@if (removable()) {\n  <button\n    type=\"button\"\n    class=\"tag-remove\"\n    [disabled]=\"disabled()\"\n    [attr.aria-labelledby]=\"removeTextId + ' ' + labelId\"\n    (click)=\"remove($event)\"\n    (keydown.backspace)=\"remove($event)\"\n    (keydown.delete)=\"remove($event)\"\n  >\n    <span\n      class=\"sr-only\"\n      [id]=\"removeTextId\"\n    >\n      {{ removeLabel() }}\n    </span>\n    <svg\n      class=\"size-3\"\n      viewBox=\"0 0 24 24\"\n      fill=\"none\"\n      stroke=\"currentColor\"\n      stroke-width=\"2\"\n      stroke-linecap=\"round\"\n      aria-hidden=\"true\"\n    >\n      <path d=\"M18 6 6 18M6 6l12 12\" />\n    </svg>\n  </button>\n}\n", changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiTagComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ui-tag', changeDetection: ChangeDetectionStrategy.OnPush, host: {
                        '[class]': 'hostClass()',
                        '[attr.role]': 'checkable() ? "button" : null',
                        '[attr.tabindex]': 'checkable() ? (disabled() ? -1 : 0) : null',
                        '[attr.aria-pressed]': 'checkable() ? checked() : null',
                        '[attr.aria-disabled]': 'disabled() ? "true" : null',
                        '(click)': 'toggle()',
                        '(keydown.enter)': 'onToggleKey($event)',
                        '(keydown.space)': 'onToggleKey($event)',
                    }, template: "<ng-content select=\"[uiTagIcon]\" />\n<span\n  class=\"tag-label\"\n  [id]=\"labelId\"\n>\n  <ng-content />\n</span>\n@if (removable()) {\n  <button\n    type=\"button\"\n    class=\"tag-remove\"\n    [disabled]=\"disabled()\"\n    [attr.aria-labelledby]=\"removeTextId + ' ' + labelId\"\n    (click)=\"remove($event)\"\n    (keydown.backspace)=\"remove($event)\"\n    (keydown.delete)=\"remove($event)\"\n  >\n    <span\n      class=\"sr-only\"\n      [id]=\"removeTextId\"\n    >\n      {{ removeLabel() }}\n    </span>\n    <svg\n      class=\"size-3\"\n      viewBox=\"0 0 24 24\"\n      fill=\"none\"\n      stroke=\"currentColor\"\n      stroke-width=\"2\"\n      stroke-linecap=\"round\"\n      aria-hidden=\"true\"\n    >\n      <path d=\"M18 6 6 18M6 6l12 12\" />\n    </svg>\n  </button>\n}\n" }]
        }], propDecorators: { color: [{ type: i0.Input, args: [{ isSignal: true, alias: "color", required: false }] }], appearance: [{ type: i0.Input, args: [{ isSignal: true, alias: "appearance", required: false }] }], size: [{ type: i0.Input, args: [{ isSignal: true, alias: "size", required: false }] }], removable: [{ type: i0.Input, args: [{ isSignal: true, alias: "removable", required: false }] }], removeLabel: [{ type: i0.Input, args: [{ isSignal: true, alias: "removeLabel", required: false }] }], checkable: [{ type: i0.Input, args: [{ isSignal: true, alias: "checkable", required: false }] }], checked: [{ type: i0.Input, args: [{ isSignal: true, alias: "checked", required: false }] }, { type: i0.Output, args: ["checkedChange"] }], disabled: [{ type: i0.Input, args: [{ isSignal: true, alias: "disabled", required: false }] }], removed: [{ type: i0.Output, args: ["removed"] }] } });

/**
 * Generated bundle index. Do not edit.
 */

export { UiTagComponent, UiTagIconDirective, tagVariants };
//# sourceMappingURL=libs-ui-tag.mjs.map
