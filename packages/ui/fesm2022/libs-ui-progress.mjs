import * as i0 from '@angular/core';
import { numberAttribute, input, computed, ChangeDetectionStrategy, Component, booleanAttribute } from '@angular/core';
import { cva } from '@libs/ui/core';

/** Percentage of `value` over `max`, clamped to [0, 100]. Invalid input (NaN, `max <= 0`) gives 0. */
function clampProgress(value, max = 100) {
    if (!Number.isFinite(value) || !Number.isFinite(max) || max <= 0)
        return 0;
    return Math.min(100, Math.max(0, (value / max) * 100));
}
/** `value` clamped to [0, max], for `aria-valuenow`. Invalid input gives 0. */
function clampValue(value, max = 100) {
    if (!Number.isFinite(value) || !Number.isFinite(max) || max <= 0)
        return 0;
    return Math.min(max, Math.max(0, value));
}
/** Input transform: `null`, `undefined` and `''` stay `null` (indeterminate); anything else becomes a number. */
function progressValueAttribute(value) {
    return value === null || value === undefined || value === '' ? null : numberAttribute(value, NaN);
}

const spinnerVariants = cva({
    base: 'spinner-ring',
    variants: {
        size: {
            inherit: '',
            xs: 'spinner-xs',
            sm: 'spinner-sm',
            md: 'spinner-md',
            lg: 'spinner-lg',
            xl: 'spinner-xl',
        },
        color: {
            current: '',
            neutral: 'spinner-neutral',
            primary: 'spinner-primary',
            info: 'spinner-info',
            success: 'spinner-success',
            warning: 'spinner-warning',
            error: 'spinner-error',
        },
        mode: {
            determinate: 'spinner-determinate',
            indeterminate: 'spinner-indeterminate',
        },
    },
    defaultVariants: { size: 'inherit', color: 'current', mode: 'indeterminate' },
});
const progressBarVariants = cva({
    base: 'progress-bar',
    variants: {
        size: { sm: 'progress-bar-sm', md: 'progress-bar-md', lg: 'progress-bar-lg' },
        color: {
            neutral: 'progress-bar-neutral',
            primary: 'progress-bar-primary',
            info: 'progress-bar-info',
            success: 'progress-bar-success',
            warning: 'progress-bar-warning',
            error: 'progress-bar-error',
        },
        mode: { determinate: '', indeterminate: 'progress-bar-indeterminate' },
    },
    defaultVariants: { size: 'md', color: 'primary', mode: 'determinate' },
});

/** Linear progress indicator. Indeterminate while `value` is `null`. */
class UiProgressBarComponent {
    value = input(null, { ...(ngDevMode ? { debugName: "value" } : /* istanbul ignore next */ {}), transform: progressValueAttribute });
    max = input(100, { ...(ngDevMode ? { debugName: "max" } : /* istanbul ignore next */ {}), transform: numberAttribute });
    size = input('md', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "size" }] : /* istanbul ignore next */ []));
    color = input('primary', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "color" }] : /* istanbul ignore next */ []));
    label = input('Progress', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "label" }] : /* istanbul ignore next */ []));
    determinate = computed(() => this.value() !== null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "determinate" }] : /* istanbul ignore next */ []));
    valueNow = computed(() => clampValue(this.value() ?? 0, this.max()), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "valueNow" }] : /* istanbul ignore next */ []));
    fillTransform = computed(() => this.determinate() ? `scaleX(${clampProgress(this.value() ?? 0, this.max()) / 100})` : null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "fillTransform" }] : /* istanbul ignore next */ []));
    hostClass = computed(() => progressBarVariants({
        size: this.size(),
        color: this.color(),
        mode: this.determinate() ? 'determinate' : 'indeterminate',
    }), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "hostClass" }] : /* istanbul ignore next */ []));
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiProgressBarComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.1.0", version: "22.0.5", type: UiProgressBarComponent, isStandalone: true, selector: "ui-progress-bar", inputs: { value: { classPropertyName: "value", publicName: "value", isSignal: true, isRequired: false, transformFunction: null }, max: { classPropertyName: "max", publicName: "max", isSignal: true, isRequired: false, transformFunction: null }, size: { classPropertyName: "size", publicName: "size", isSignal: true, isRequired: false, transformFunction: null }, color: { classPropertyName: "color", publicName: "color", isSignal: true, isRequired: false, transformFunction: null }, label: { classPropertyName: "label", publicName: "label", isSignal: true, isRequired: false, transformFunction: null } }, host: { attributes: { "role": "progressbar" }, properties: { "class": "hostClass()", "attr.aria-label": "label()", "attr.aria-valuemin": "determinate() ? 0 : null", "attr.aria-valuemax": "determinate() ? max() : null", "attr.aria-valuenow": "determinate() ? valueNow() : null" } }, ngImport: i0, template: `<div
    class="progress-bar-fill"
    [style.transform]="fillTransform()"
  ></div>`, isInline: true, changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiProgressBarComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'ui-progress-bar',
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    host: {
                        role: 'progressbar',
                        '[class]': 'hostClass()',
                        '[attr.aria-label]': 'label()',
                        '[attr.aria-valuemin]': 'determinate() ? 0 : null',
                        '[attr.aria-valuemax]': 'determinate() ? max() : null',
                        '[attr.aria-valuenow]': 'determinate() ? valueNow() : null',
                    },
                    template: `<div
    class="progress-bar-fill"
    [style.transform]="fillTransform()"
  ></div>`,
                }]
        }], propDecorators: { value: [{ type: i0.Input, args: [{ isSignal: true, alias: "value", required: false }] }], max: [{ type: i0.Input, args: [{ isSignal: true, alias: "max", required: false }] }], size: [{ type: i0.Input, args: [{ isSignal: true, alias: "size", required: false }] }], color: [{ type: i0.Input, args: [{ isSignal: true, alias: "color", required: false }] }], label: [{ type: i0.Input, args: [{ isSignal: true, alias: "label", required: false }] }] } });

/** Ring radius in the 24×24 viewBox. */
const RADIUS = 10;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
/** Default stroke width (viewBox units) per size: small spinners stay visible, large ones stay light. */
const DEFAULT_STROKE = {
    inherit: 3,
    xs: 3,
    sm: 3,
    md: 2.5,
    lg: 2,
    xl: 2,
};
/**
 * Circular progress indicator. Indeterminate (rotating arc) while `value` is `null`; a determinate
 * ring filled to `value / max` otherwise.
 */
class UiSpinnerComponent {
    value = input(null, { ...(ngDevMode ? { debugName: "value" } : /* istanbul ignore next */ {}), transform: progressValueAttribute });
    max = input(100, { ...(ngDevMode ? { debugName: "max" } : /* istanbul ignore next */ {}), transform: numberAttribute });
    size = input('inherit', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "size" }] : /* istanbul ignore next */ []));
    strokeWidth = input(null, { ...(ngDevMode ? { debugName: "strokeWidth" } : /* istanbul ignore next */ {}), transform: progressValueAttribute });
    color = input('current', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "color" }] : /* istanbul ignore next */ []));
    showValue = input(false, { ...(ngDevMode ? { debugName: "showValue" } : /* istanbul ignore next */ {}), transform: booleanAttribute });
    label = input('Loading', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "label" }] : /* istanbul ignore next */ []));
    circumference = CIRCUMFERENCE;
    determinate = computed(() => this.value() !== null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "determinate" }] : /* istanbul ignore next */ []));
    percent = computed(() => clampProgress(this.value() ?? 0, this.max()), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "percent" }] : /* istanbul ignore next */ []));
    percentText = computed(() => Math.round(this.percent()), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "percentText" }] : /* istanbul ignore next */ []));
    valueNow = computed(() => clampValue(this.value() ?? 0, this.max()), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "valueNow" }] : /* istanbul ignore next */ []));
    dashOffset = computed(() => this.determinate() ? CIRCUMFERENCE * (1 - this.percent() / 100) : null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "dashOffset" }] : /* istanbul ignore next */ []));
    stroke = computed(() => this.strokeWidth() ?? DEFAULT_STROKE[this.size()], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "stroke" }] : /* istanbul ignore next */ []));
    showValueText = computed(() => this.showValue() && this.determinate() && (this.size() === 'lg' || this.size() === 'xl'), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "showValueText" }] : /* istanbul ignore next */ []));
    hostClass = computed(() => spinnerVariants({
        size: this.size(),
        color: this.color(),
        mode: this.determinate() ? 'determinate' : 'indeterminate',
    }), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "hostClass" }] : /* istanbul ignore next */ []));
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiSpinnerComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "22.0.5", type: UiSpinnerComponent, isStandalone: true, selector: "ui-spinner", inputs: { value: { classPropertyName: "value", publicName: "value", isSignal: true, isRequired: false, transformFunction: null }, max: { classPropertyName: "max", publicName: "max", isSignal: true, isRequired: false, transformFunction: null }, size: { classPropertyName: "size", publicName: "size", isSignal: true, isRequired: false, transformFunction: null }, strokeWidth: { classPropertyName: "strokeWidth", publicName: "strokeWidth", isSignal: true, isRequired: false, transformFunction: null }, color: { classPropertyName: "color", publicName: "color", isSignal: true, isRequired: false, transformFunction: null }, showValue: { classPropertyName: "showValue", publicName: "showValue", isSignal: true, isRequired: false, transformFunction: null }, label: { classPropertyName: "label", publicName: "label", isSignal: true, isRequired: false, transformFunction: null } }, host: { attributes: { "role": "progressbar" }, properties: { "class": "hostClass()", "attr.aria-label": "label()", "attr.aria-valuemin": "determinate() ? 0 : null", "attr.aria-valuemax": "determinate() ? max() : null", "attr.aria-valuenow": "determinate() ? valueNow() : null" } }, ngImport: i0, template: `
    <svg
      class="spinner-svg"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      @if (determinate()) {
        <circle
          class="spinner-track"
          cx="12"
          cy="12"
          r="10"
          fill="none"
          [attr.stroke-width]="stroke()"
        />
      }
      <circle
        class="spinner-indicator"
        cx="12"
        cy="12"
        r="10"
        fill="none"
        [attr.stroke-width]="stroke()"
        [attr.stroke-dasharray]="determinate() ? circumference : null"
        [attr.stroke-dashoffset]="dashOffset()"
      />
    </svg>
    @if (showValueText()) {
      <span
        class="spinner-value"
        aria-hidden="true"
        >{{ percentText() }}%</span
      >
    }
  `, isInline: true, changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiSpinnerComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'ui-spinner',
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    host: {
                        role: 'progressbar',
                        '[class]': 'hostClass()',
                        '[attr.aria-label]': 'label()',
                        '[attr.aria-valuemin]': 'determinate() ? 0 : null',
                        '[attr.aria-valuemax]': 'determinate() ? max() : null',
                        '[attr.aria-valuenow]': 'determinate() ? valueNow() : null',
                    },
                    template: `
    <svg
      class="spinner-svg"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      @if (determinate()) {
        <circle
          class="spinner-track"
          cx="12"
          cy="12"
          r="10"
          fill="none"
          [attr.stroke-width]="stroke()"
        />
      }
      <circle
        class="spinner-indicator"
        cx="12"
        cy="12"
        r="10"
        fill="none"
        [attr.stroke-width]="stroke()"
        [attr.stroke-dasharray]="determinate() ? circumference : null"
        [attr.stroke-dashoffset]="dashOffset()"
      />
    </svg>
    @if (showValueText()) {
      <span
        class="spinner-value"
        aria-hidden="true"
        >{{ percentText() }}%</span
      >
    }
  `,
                }]
        }], propDecorators: { value: [{ type: i0.Input, args: [{ isSignal: true, alias: "value", required: false }] }], max: [{ type: i0.Input, args: [{ isSignal: true, alias: "max", required: false }] }], size: [{ type: i0.Input, args: [{ isSignal: true, alias: "size", required: false }] }], strokeWidth: [{ type: i0.Input, args: [{ isSignal: true, alias: "strokeWidth", required: false }] }], color: [{ type: i0.Input, args: [{ isSignal: true, alias: "color", required: false }] }], showValue: [{ type: i0.Input, args: [{ isSignal: true, alias: "showValue", required: false }] }], label: [{ type: i0.Input, args: [{ isSignal: true, alias: "label", required: false }] }] } });

/**
 * Generated bundle index. Do not edit.
 */

export { UiProgressBarComponent, UiSpinnerComponent, clampProgress, clampValue, progressBarVariants, progressValueAttribute, spinnerVariants };
//# sourceMappingURL=libs-ui-progress.mjs.map
