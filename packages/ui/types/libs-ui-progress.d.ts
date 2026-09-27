import * as _angular_core from '@angular/core';
import { UiColor, UiSize } from '@libs/ui/core';

/** `inherit` sizes the spinner to `1em`, so it scales with the surrounding text. */
type UiSpinnerSize = UiSize | 'inherit';
/** `current` uses `currentColor`. */
type UiSpinnerColor = UiColor | 'current';
type UiProgressBarSize = 'sm' | 'md' | 'lg';

/** Linear progress indicator. Indeterminate while `value` is `null`. */
declare class UiProgressBarComponent {
    readonly value: _angular_core.InputSignalWithTransform<number | null, unknown>;
    readonly max: _angular_core.InputSignalWithTransform<number, unknown>;
    readonly size: _angular_core.InputSignal<UiProgressBarSize>;
    readonly color: _angular_core.InputSignal<UiColor>;
    readonly label: _angular_core.InputSignal<string>;
    protected readonly determinate: _angular_core.Signal<boolean>;
    protected readonly valueNow: _angular_core.Signal<number>;
    protected readonly fillTransform: _angular_core.Signal<string | null>;
    protected readonly hostClass: _angular_core.Signal<string>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<UiProgressBarComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<UiProgressBarComponent, "ui-progress-bar", never, { "value": { "alias": "value"; "required": false; "isSignal": true; }; "max": { "alias": "max"; "required": false; "isSignal": true; }; "size": { "alias": "size"; "required": false; "isSignal": true; }; "color": { "alias": "color"; "required": false; "isSignal": true; }; "label": { "alias": "label"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}

/** Percentage of `value` over `max`, clamped to [0, 100]. Invalid input (NaN, `max <= 0`) gives 0. */
declare function clampProgress(value: number, max?: number): number;
/** `value` clamped to [0, max], for `aria-valuenow`. Invalid input gives 0. */
declare function clampValue(value: number, max?: number): number;
/** Input transform: `null`, `undefined` and `''` stay `null` (indeterminate); anything else becomes a number. */
declare function progressValueAttribute(value: unknown): number | null;

declare const spinnerVariants: (props?: {
    size?: "xs" | "sm" | "md" | "lg" | "xl" | "inherit" | undefined;
    color?: "neutral" | "primary" | "info" | "success" | "warning" | "error" | "current" | undefined;
    mode?: "determinate" | "indeterminate" | undefined;
} | undefined, extraClass?: string) => string;
declare const progressBarVariants: (props?: {
    size?: "sm" | "md" | "lg" | undefined;
    color?: "neutral" | "primary" | "info" | "success" | "warning" | "error" | undefined;
    mode?: "determinate" | "indeterminate" | undefined;
} | undefined, extraClass?: string) => string;

/**
 * Circular progress indicator. Indeterminate (rotating arc) while `value` is `null`; a determinate
 * ring filled to `value / max` otherwise.
 */
declare class UiSpinnerComponent {
    readonly value: _angular_core.InputSignalWithTransform<number | null, unknown>;
    readonly max: _angular_core.InputSignalWithTransform<number, unknown>;
    readonly size: _angular_core.InputSignal<UiSpinnerSize>;
    readonly strokeWidth: _angular_core.InputSignalWithTransform<number | null, unknown>;
    readonly color: _angular_core.InputSignal<UiSpinnerColor>;
    readonly showValue: _angular_core.InputSignalWithTransform<boolean, unknown>;
    readonly label: _angular_core.InputSignal<string>;
    protected readonly circumference: number;
    protected readonly determinate: _angular_core.Signal<boolean>;
    protected readonly percent: _angular_core.Signal<number>;
    protected readonly percentText: _angular_core.Signal<number>;
    protected readonly valueNow: _angular_core.Signal<number>;
    protected readonly dashOffset: _angular_core.Signal<number | null>;
    protected readonly stroke: _angular_core.Signal<number>;
    protected readonly showValueText: _angular_core.Signal<boolean>;
    protected readonly hostClass: _angular_core.Signal<string>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<UiSpinnerComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<UiSpinnerComponent, "ui-spinner", never, { "value": { "alias": "value"; "required": false; "isSignal": true; }; "max": { "alias": "max"; "required": false; "isSignal": true; }; "size": { "alias": "size"; "required": false; "isSignal": true; }; "strokeWidth": { "alias": "strokeWidth"; "required": false; "isSignal": true; }; "color": { "alias": "color"; "required": false; "isSignal": true; }; "showValue": { "alias": "showValue"; "required": false; "isSignal": true; }; "label": { "alias": "label"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}

export { UiProgressBarComponent, UiSpinnerComponent, clampProgress, clampValue, progressBarVariants, progressValueAttribute, spinnerVariants };
export type { UiProgressBarSize, UiSpinnerColor, UiSpinnerSize };
