import * as i0 from '@angular/core';
import { ChangeDetectionStrategy, Component, inject, ElementRef, input, booleanAttribute, computed, Directive } from '@angular/core';
import { cva, UI_CONFIG } from '@libs/ui/core';

/**
 * Lays out projected `uiButton` elements in a row with consistent spacing.
 *
 * Deliberately minimal: the plan doesn't specify behavior beyond rendering a
 * styled wrapper around projected buttons, so no extra inputs (orientation,
 * segmented/attached borders, etc.) were invented — see task report.
 */
class UiButtonGroupComponent {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiButtonGroupComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "22.0.5", type: UiButtonGroupComponent, isStandalone: true, selector: "ui-button-group", host: { classAttribute: "inline-flex items-center gap-2" }, ngImport: i0, template: '<ng-content />', isInline: true, changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiButtonGroupComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'ui-button-group',
                    standalone: true,
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    host: {
                        class: 'inline-flex items-center gap-2',
                    },
                    template: '<ng-content />',
                }]
        }] });

const buttonVariants = cva({
    base: 'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 select-none cursor-pointer',
    variants: {
        variant: {
            primary: 'bg-primary text-primary-content hover:bg-primary/90 focus-visible:outline-primary',
            secondary: 'bg-secondary text-secondary-content hover:bg-secondary/90 focus-visible:outline-secondary',
            outline: 'border border-border bg-transparent hover:bg-muted text-foreground',
            ghost: 'hover:bg-muted text-foreground',
            danger: 'bg-error text-error-content hover:bg-error/90 focus-visible:outline-error',
        },
        size: {
            sm: 'h-8 px-3 text-xs rounded-md gap-1.5',
            md: 'h-10 px-4 text-sm rounded-lg gap-2',
            lg: 'h-12 px-6 text-base rounded-xl gap-2.5',
            icon: 'h-10 w-10 rounded-lg p-0',
        },
        fullWidth: {
            true: 'w-full',
            false: '',
        },
    },
    defaultVariants: {
        variant: 'primary',
        size: 'md',
        fullWidth: 'false',
    },
});

/**
 * Applies the design system's button visual treatment and accessible
 * disabled/loading behavior to a native `<button>` or `<a>` element.
 *
 * `<a>` elements have no native `disabled` DOM property, so this directive
 * also intercepts the host `click` event and prevents/stops it while
 * `disabled()` is true — covering both button-inside-form submission and
 * anchor navigation.
 */
class UiButtonDirective {
    _uiConfig = inject(UI_CONFIG, { optional: true });
    _elementRef = inject(ElementRef);
    /** Only `<button>` supports the native `disabled` DOM property/attribute. */
    isButtonElement = this._elementRef.nativeElement.tagName === 'BUTTON';
    variant = input(this._uiConfig?.button?.defaultVariant ?? 'primary', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "variant" }] : /* istanbul ignore next */ []));
    size = input(this._uiConfig?.button?.defaultSize ?? 'md', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "size" }] : /* istanbul ignore next */ []));
    loading = input(false, { ...(ngDevMode ? { debugName: "loading" } : /* istanbul ignore next */ {}), transform: booleanAttribute });
    disabled = input(false, { ...(ngDevMode ? { debugName: "disabled" } : /* istanbul ignore next */ {}), transform: booleanAttribute });
    fullWidth = input(false, { ...(ngDevMode ? { debugName: "fullWidth" } : /* istanbul ignore next */ {}), transform: booleanAttribute });
    hostClass = computed(() => buttonVariants({
        variant: this.variant(),
        size: this.size(),
        fullWidth: this.fullWidth() ? 'true' : 'false',
    }), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "hostClass" }] : /* istanbul ignore next */ []));
    onHostClick(event) {
        if (this.disabled()) {
            event.preventDefault();
            event.stopImmediatePropagation();
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiButtonDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "17.1.0", version: "22.0.5", type: UiButtonDirective, isStandalone: true, selector: "button[uiButton], a[uiButton]", inputs: { variant: { classPropertyName: "variant", publicName: "variant", isSignal: true, isRequired: false, transformFunction: null }, size: { classPropertyName: "size", publicName: "size", isSignal: true, isRequired: false, transformFunction: null }, loading: { classPropertyName: "loading", publicName: "loading", isSignal: true, isRequired: false, transformFunction: null }, disabled: { classPropertyName: "disabled", publicName: "disabled", isSignal: true, isRequired: false, transformFunction: null }, fullWidth: { classPropertyName: "fullWidth", publicName: "fullWidth", isSignal: true, isRequired: false, transformFunction: null } }, host: { listeners: { "click": "onHostClick($event)" }, properties: { "class": "hostClass()", "attr.aria-busy": "loading() ? \"true\" : null", "attr.aria-disabled": "disabled() ? \"true\" : null", "attr.disabled": "isButtonElement && disabled() ? \"\" : null" } }, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiButtonDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: 'button[uiButton], a[uiButton]',
                    host: {
                        '[class]': 'hostClass()',
                        '[attr.aria-busy]': 'loading() ? "true" : null',
                        '[attr.aria-disabled]': 'disabled() ? "true" : null',
                        '[attr.disabled]': 'isButtonElement && disabled() ? "" : null',
                        '(click)': 'onHostClick($event)',
                    },
                }]
        }], propDecorators: { variant: [{ type: i0.Input, args: [{ isSignal: true, alias: "variant", required: false }] }], size: [{ type: i0.Input, args: [{ isSignal: true, alias: "size", required: false }] }], loading: [{ type: i0.Input, args: [{ isSignal: true, alias: "loading", required: false }] }], disabled: [{ type: i0.Input, args: [{ isSignal: true, alias: "disabled", required: false }] }], fullWidth: [{ type: i0.Input, args: [{ isSignal: true, alias: "fullWidth", required: false }] }] } });

/**
 * Generated bundle index. Do not edit.
 */

export { UiButtonDirective, UiButtonGroupComponent, buttonVariants };
//# sourceMappingURL=libs-ui-button.mjs.map
