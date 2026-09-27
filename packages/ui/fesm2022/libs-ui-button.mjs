import * as i0 from '@angular/core';
import { ChangeDetectionStrategy, Component, inject, ElementRef, input, booleanAttribute, computed } from '@angular/core';
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
    base: 'btn',
    variants: {
        variant: {
            primary: 'btn-primary',
            secondary: 'btn-secondary',
            outline: 'btn-outline',
            ghost: 'btn-ghost',
            danger: 'btn-danger',
        },
        size: {
            sm: 'btn-sm',
            md: 'btn-md',
            lg: 'btn-lg',
            icon: 'btn-icon',
        },
        fullWidth: {
            true: 'btn-block',
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
 * While `loading()` is true a spinner is rendered before the content and the
 * button is treated exactly like `disabled()`.
 *
 * `<a>` elements have no native `disabled` DOM property, so this component
 * also intercepts the host `click` event and prevents/stops it while
 * disabled or loading — covering both button-inside-form submission and
 * anchor navigation.
 */
class UiButtonComponent {
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
    isDisabled = computed(() => this.disabled() || this.loading(), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "isDisabled" }] : /* istanbul ignore next */ []));
    hostClass = computed(() => buttonVariants({
        variant: this.variant(),
        size: this.size(),
        fullWidth: this.fullWidth() ? 'true' : 'false',
    }), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "hostClass" }] : /* istanbul ignore next */ []));
    onHostClick(event) {
        if (this.isDisabled()) {
            event.preventDefault();
            event.stopImmediatePropagation();
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiButtonComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "22.0.5", type: UiButtonComponent, isStandalone: true, selector: "button[uiButton], a[uiButton]", inputs: { variant: { classPropertyName: "variant", publicName: "variant", isSignal: true, isRequired: false, transformFunction: null }, size: { classPropertyName: "size", publicName: "size", isSignal: true, isRequired: false, transformFunction: null }, loading: { classPropertyName: "loading", publicName: "loading", isSignal: true, isRequired: false, transformFunction: null }, disabled: { classPropertyName: "disabled", publicName: "disabled", isSignal: true, isRequired: false, transformFunction: null }, fullWidth: { classPropertyName: "fullWidth", publicName: "fullWidth", isSignal: true, isRequired: false, transformFunction: null } }, host: { listeners: { "click": "onHostClick($event)" }, properties: { "class": "hostClass()", "attr.aria-busy": "loading() ? \"true\" : null", "attr.aria-disabled": "isDisabled() ? \"true\" : null", "attr.disabled": "isButtonElement && isDisabled() ? \"\" : null" } }, ngImport: i0, template: `
    @if (loading()) {
      <span
        aria-hidden="true"
        class="spinner"
      ></span>
    }
    <ng-content />
  `, isInline: true, changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiButtonComponent, decorators: [{
            type: Component,
            args: [{
                    // Attribute selector keeps native <button>/<a> semantics (focus, form submit, href)
                    // eslint-disable-next-line @angular-eslint/component-selector
                    selector: 'button[uiButton], a[uiButton]',
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    host: {
                        '[class]': 'hostClass()',
                        '[attr.aria-busy]': 'loading() ? "true" : null',
                        '[attr.aria-disabled]': 'isDisabled() ? "true" : null',
                        '[attr.disabled]': 'isButtonElement && isDisabled() ? "" : null',
                        '(click)': 'onHostClick($event)',
                    },
                    template: `
    @if (loading()) {
      <span
        aria-hidden="true"
        class="spinner"
      ></span>
    }
    <ng-content />
  `,
                }]
        }], propDecorators: { variant: [{ type: i0.Input, args: [{ isSignal: true, alias: "variant", required: false }] }], size: [{ type: i0.Input, args: [{ isSignal: true, alias: "size", required: false }] }], loading: [{ type: i0.Input, args: [{ isSignal: true, alias: "loading", required: false }] }], disabled: [{ type: i0.Input, args: [{ isSignal: true, alias: "disabled", required: false }] }], fullWidth: [{ type: i0.Input, args: [{ isSignal: true, alias: "fullWidth", required: false }] }] } });

/**
 * Generated bundle index. Do not edit.
 */

export { UiButtonComponent, UiButtonGroupComponent, buttonVariants };
//# sourceMappingURL=libs-ui-button.mjs.map
