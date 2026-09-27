import * as i0 from '@angular/core';
import { Directive, input, booleanAttribute, model, output, computed, ChangeDetectionStrategy, Component } from '@angular/core';
import { cva } from '@libs/ui/core';

/** 24×24 stroke icon paths, the same as `@libs/ui/toast`. Neutral and primary have no default icon. */
const UI_ALERT_ICONS = {
    info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    success: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    warning: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
    error: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
};

/** Bold first line of a `ui-alert`. */
class UiAlertTitleDirective {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiAlertTitleDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "22.0.5", type: UiAlertTitleDirective, isStandalone: true, selector: "[uiAlertTitle]", host: { classAttribute: "alert-title" }, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiAlertTitleDirective, decorators: [{
            type: Directive,
            args: [{ selector: '[uiAlertTitle]', host: { class: 'alert-title' } }]
        }] });
/** Replaces the default icon of a `ui-alert`. */
class UiAlertIconDirective {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiAlertIconDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "22.0.5", type: UiAlertIconDirective, isStandalone: true, selector: "[uiAlertIcon]", ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiAlertIconDirective, decorators: [{
            type: Directive,
            args: [{ selector: '[uiAlertIcon]' }]
        }] });
/** Row of actions under the alert's message. */
class UiAlertActionsDirective {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiAlertActionsDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "22.0.5", type: UiAlertActionsDirective, isStandalone: true, selector: "[uiAlertActions]", host: { classAttribute: "alert-actions" }, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiAlertActionsDirective, decorators: [{
            type: Directive,
            args: [{ selector: '[uiAlertActions]', host: { class: 'alert-actions' } }]
        }] });

const alertVariants = cva({
    base: 'alert alert-row',
    variants: {
        color: {
            neutral: 'alert-neutral',
            primary: 'alert-primary',
            info: 'alert-info',
            success: 'alert-success',
            warning: 'alert-warning',
            error: 'alert-error',
        },
        appearance: {
            soft: 'alert-soft',
            outline: 'alert-outline',
            dash: 'alert-dash',
            solid: 'alert-solid',
        },
        banner: { true: 'alert-banner', false: '' },
    },
    defaultVariants: { color: 'neutral', appearance: 'soft', banner: 'false' },
});

/**
 * Inline message (or full-width banner). Dismissing only hides it and updates `open`; the consumer
 * decides whether to remove it.
 */
class UiAlertComponent {
    color = input('neutral', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "color" }] : /* istanbul ignore next */ []));
    appearance = input('soft', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "appearance" }] : /* istanbul ignore next */ []));
    icon = input(true, { ...(ngDevMode ? { debugName: "icon" } : /* istanbul ignore next */ {}), transform: booleanAttribute });
    banner = input(false, { ...(ngDevMode ? { debugName: "banner" } : /* istanbul ignore next */ {}), transform: booleanAttribute });
    dismissible = input(false, { ...(ngDevMode ? { debugName: "dismissible" } : /* istanbul ignore next */ {}), transform: booleanAttribute });
    closeLabel = input('Dismiss', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "closeLabel" }] : /* istanbul ignore next */ []));
    role = input(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "role" }] : /* istanbul ignore next */ []));
    open = model(true, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "open" }] : /* istanbul ignore next */ []));
    closed = output();
    iconPath = computed(() => this.icon() ? (UI_ALERT_ICONS[this.color()] ?? null) : null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "iconPath" }] : /* istanbul ignore next */ []));
    effectiveRole = computed(() => {
        const role = this.role();
        if (role === 'none')
            return null;
        if (role)
            return role;
        return this.color() === 'error' || this.color() === 'warning' ? 'alert' : 'status';
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "effectiveRole" }] : /* istanbul ignore next */ []));
    hostClass = computed(() => alertVariants({
        color: this.color(),
        appearance: this.appearance(),
        banner: this.banner() ? 'true' : 'false',
    }), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "hostClass" }] : /* istanbul ignore next */ []));
    close() {
        this.open.set(false);
        this.closed.emit();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiAlertComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "22.0.5", type: UiAlertComponent, isStandalone: true, selector: "ui-alert", inputs: { color: { classPropertyName: "color", publicName: "color", isSignal: true, isRequired: false, transformFunction: null }, appearance: { classPropertyName: "appearance", publicName: "appearance", isSignal: true, isRequired: false, transformFunction: null }, icon: { classPropertyName: "icon", publicName: "icon", isSignal: true, isRequired: false, transformFunction: null }, banner: { classPropertyName: "banner", publicName: "banner", isSignal: true, isRequired: false, transformFunction: null }, dismissible: { classPropertyName: "dismissible", publicName: "dismissible", isSignal: true, isRequired: false, transformFunction: null }, closeLabel: { classPropertyName: "closeLabel", publicName: "closeLabel", isSignal: true, isRequired: false, transformFunction: null }, role: { classPropertyName: "role", publicName: "role", isSignal: true, isRequired: false, transformFunction: null }, open: { classPropertyName: "open", publicName: "open", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { open: "openChange", closed: "closed" }, host: { properties: { "class": "hostClass()", "attr.role": "effectiveRole()", "attr.hidden": "open() ? null : \"\"" } }, ngImport: i0, template: "<div class=\"alert-icon\">\n  <ng-content select=\"[uiAlertIcon]\">\n    @if (iconPath(); as path) {\n      <svg\n        xmlns=\"http://www.w3.org/2000/svg\"\n        fill=\"none\"\n        viewBox=\"0 0 24 24\"\n        stroke=\"currentColor\"\n        aria-hidden=\"true\"\n      >\n        <path\n          stroke-linecap=\"round\"\n          stroke-linejoin=\"round\"\n          stroke-width=\"2\"\n          [attr.d]=\"path\"\n        />\n      </svg>\n    }\n  </ng-content>\n</div>\n\n<div class=\"alert-description\">\n  <ng-content select=\"[uiAlertTitle]\" />\n  <ng-content />\n  <ng-content select=\"[uiAlertActions]\" />\n</div>\n\n@if (dismissible()) {\n  <button\n    type=\"button\"\n    class=\"alert-close\"\n    [attr.aria-label]=\"closeLabel()\"\n    (click)=\"close()\"\n  >\n    <svg\n      xmlns=\"http://www.w3.org/2000/svg\"\n      fill=\"none\"\n      viewBox=\"0 0 24 24\"\n      stroke=\"currentColor\"\n      stroke-width=\"2\"\n      stroke-linecap=\"round\"\n      aria-hidden=\"true\"\n    >\n      <path d=\"M18 6 6 18M6 6l12 12\" />\n    </svg>\n  </button>\n}\n", changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiAlertComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ui-alert', changeDetection: ChangeDetectionStrategy.OnPush, host: {
                        '[class]': 'hostClass()',
                        '[attr.role]': 'effectiveRole()',
                        '[attr.hidden]': 'open() ? null : ""',
                    }, template: "<div class=\"alert-icon\">\n  <ng-content select=\"[uiAlertIcon]\">\n    @if (iconPath(); as path) {\n      <svg\n        xmlns=\"http://www.w3.org/2000/svg\"\n        fill=\"none\"\n        viewBox=\"0 0 24 24\"\n        stroke=\"currentColor\"\n        aria-hidden=\"true\"\n      >\n        <path\n          stroke-linecap=\"round\"\n          stroke-linejoin=\"round\"\n          stroke-width=\"2\"\n          [attr.d]=\"path\"\n        />\n      </svg>\n    }\n  </ng-content>\n</div>\n\n<div class=\"alert-description\">\n  <ng-content select=\"[uiAlertTitle]\" />\n  <ng-content />\n  <ng-content select=\"[uiAlertActions]\" />\n</div>\n\n@if (dismissible()) {\n  <button\n    type=\"button\"\n    class=\"alert-close\"\n    [attr.aria-label]=\"closeLabel()\"\n    (click)=\"close()\"\n  >\n    <svg\n      xmlns=\"http://www.w3.org/2000/svg\"\n      fill=\"none\"\n      viewBox=\"0 0 24 24\"\n      stroke=\"currentColor\"\n      stroke-width=\"2\"\n      stroke-linecap=\"round\"\n      aria-hidden=\"true\"\n    >\n      <path d=\"M18 6 6 18M6 6l12 12\" />\n    </svg>\n  </button>\n}\n" }]
        }], propDecorators: { color: [{ type: i0.Input, args: [{ isSignal: true, alias: "color", required: false }] }], appearance: [{ type: i0.Input, args: [{ isSignal: true, alias: "appearance", required: false }] }], icon: [{ type: i0.Input, args: [{ isSignal: true, alias: "icon", required: false }] }], banner: [{ type: i0.Input, args: [{ isSignal: true, alias: "banner", required: false }] }], dismissible: [{ type: i0.Input, args: [{ isSignal: true, alias: "dismissible", required: false }] }], closeLabel: [{ type: i0.Input, args: [{ isSignal: true, alias: "closeLabel", required: false }] }], role: [{ type: i0.Input, args: [{ isSignal: true, alias: "role", required: false }] }], open: [{ type: i0.Input, args: [{ isSignal: true, alias: "open", required: false }] }, { type: i0.Output, args: ["openChange"] }], closed: [{ type: i0.Output, args: ["closed"] }] } });

/**
 * Generated bundle index. Do not edit.
 */

export { UI_ALERT_ICONS, UiAlertActionsDirective, UiAlertComponent, UiAlertIconDirective, UiAlertTitleDirective, alertVariants };
//# sourceMappingURL=libs-ui-alert.mjs.map
