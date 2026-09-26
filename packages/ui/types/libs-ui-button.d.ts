import * as _angular_core from '@angular/core';

/**
 * Lays out projected `uiButton` elements in a row with consistent spacing.
 *
 * Deliberately minimal: the plan doesn't specify behavior beyond rendering a
 * styled wrapper around projected buttons, so no extra inputs (orientation,
 * segmented/attached borders, etc.) were invented — see task report.
 */
declare class UiButtonGroupComponent {
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<UiButtonGroupComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<UiButtonGroupComponent, "ui-button-group", never, {}, {}, never, ["*"], true, never>;
}

type UiButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type UiButtonSize = 'sm' | 'md' | 'lg' | 'icon';

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
declare class UiButtonComponent {
    private readonly _uiConfig;
    private readonly _elementRef;
    /** Only `<button>` supports the native `disabled` DOM property/attribute. */
    protected readonly isButtonElement: boolean;
    readonly variant: _angular_core.InputSignal<UiButtonVariant>;
    readonly size: _angular_core.InputSignal<UiButtonSize>;
    readonly loading: _angular_core.InputSignalWithTransform<boolean, unknown>;
    readonly disabled: _angular_core.InputSignalWithTransform<boolean, unknown>;
    readonly fullWidth: _angular_core.InputSignalWithTransform<boolean, unknown>;
    protected readonly isDisabled: _angular_core.Signal<boolean>;
    protected readonly hostClass: _angular_core.Signal<string>;
    protected onHostClick(event: Event): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<UiButtonComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<UiButtonComponent, "button[uiButton], a[uiButton]", never, { "variant": { "alias": "variant"; "required": false; "isSignal": true; }; "size": { "alias": "size"; "required": false; "isSignal": true; }; "loading": { "alias": "loading"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "fullWidth": { "alias": "fullWidth"; "required": false; "isSignal": true; }; }, {}, never, ["*"], true, never>;
}

declare const buttonVariants: (props?: {
    variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | undefined;
    size?: "sm" | "md" | "lg" | "icon" | undefined;
    fullWidth?: "true" | "false" | undefined;
} | undefined, extraClass?: string) => string;

export { UiButtonComponent, UiButtonGroupComponent, buttonVariants };
export type { UiButtonSize, UiButtonVariant };
