import * as _angular_core from '@angular/core';
import { InjectionToken, Signal, OnInit } from '@angular/core';
import { UiFormFieldControl, UiSize } from '@libs/ui/core';
import { ControlValueAccessor } from '@angular/forms';

/**
 * Applies error styling to a projected `<span uiError>` and exposes a
 * unique `id`, which `UiFormFieldComponent` reads to link the error into
 * the control's `aria-describedby`.
 */
declare class UiErrorDirective {
    readonly id: string;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<UiErrorDirective, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<UiErrorDirective, "span[uiError]", never, {}, {}, never, never, true, never>;
}

/**
 * Lets a projected control read state from its wrapping `UiFormFieldComponent`
 * without importing the component (which already imports the control).
 */
interface UiFormFieldContext {
    /** True when a `uiPrefix` or `uiSuffix` is projected next to the control. */
    readonly $hasAffix: Signal<boolean>;
}
declare const UI_FORM_FIELD: InjectionToken<UiFormFieldContext>;

/**
 * Applies hint styling to a projected `<span uiHint>` and exposes a unique
 * `id`, which `UiFormFieldComponent` reads to link the hint into the
 * control's `aria-describedby`.
 */
declare class UiHintDirective {
    readonly id: string;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<UiHintDirective, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<UiHintDirective, "span[uiHint]", never, {}, {}, never, never, true, never>;
}

/**
 * Lays out a label, a control (`uiInput`/`uiTextarea`, optionally flanked
 * by `uiPrefix`/`uiSuffix`), and hint/error text, then wires the
 * accessibility relationships between them:
 *
 * - The projected `uiLabel`'s `for` attribute is set to the control's `id`.
 * - The control's `aria-describedby` is set to the id(s) of whichever of
 *   the projected `uiHint`/`uiError` are currently present in content.
 * - The control's `aria-invalid` is set to `"true"` whenever the bound
 *   `UiFormFieldControl.$invalid` signal is `true`, and removed otherwise.
 *
 * When a `uiPrefix`/`uiSuffix` is projected next to a `uiInput`, the control
 * row becomes the bordered box (using the input's `appearance`/`size`) and
 * the input renders borderless inside it, so the affixes sit within the field.
 *
 * The control is discovered via `contentChild(UiFormFieldControl)` — the
 * shared abstract base that `UiInputDirective`/`UiTextareaDirective`
 * provide themselves as — so this component works with either without
 * knowing which one is projected.
 */
declare class UiFormFieldComponent implements UiFormFieldContext {
    private readonly _renderer;
    protected readonly control: _angular_core.Signal<UiFormFieldControl<any> | undefined>;
    private readonly _controlElementRef;
    private readonly _labelElementRef;
    protected readonly hint: _angular_core.Signal<UiHintDirective | undefined>;
    protected readonly error: _angular_core.Signal<UiErrorDirective | undefined>;
    private readonly _input;
    private readonly _prefix;
    private readonly _suffix;
    /** Affixes are drawn inside the box only for `uiInput`; a `uiTextarea` keeps them alongside. */
    readonly $hasAffix: _angular_core.Signal<boolean>;
    protected readonly $controlRowClass: _angular_core.Signal<string>;
    constructor();
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<UiFormFieldComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<UiFormFieldComponent, "ui-form-field", never, {}, {}, ["control", "_controlElementRef", "_labelElementRef", "hint", "error", "_input", "_prefix", "_suffix"], ["[uiLabel]", "[uiPrefix]", "[uiInput], [uiTextarea]", "[uiSuffix]", "[uiHint]", "[uiError]"], true, never>;
}

/**
 * Visual treatment of a form control's boundary.
 *
 * Mirrors `UiConfig.formField.appearance` in `@libs/ui/core` so a global
 * default can be set once via `provideUiConfig(...)`.
 */
type UiFormFieldAppearance = 'outline' | 'filled';
/**
 * Maps inputs onto the `input` CSS utilities (`@libs/ui/styles`), so
 * `class="input input-md"` and `uiInput` render identically.
 *
 * Also used by `UiFormFieldComponent` for the box it draws around a `uiInput`
 * plus `uiPrefix`/`uiSuffix` (the utility styles a nested `<input>` as bare).
 */
declare const inputVariants: (props?: {
    appearance?: "outline" | "filled" | undefined;
    size?: "xs" | "sm" | "md" | "lg" | "xl" | undefined;
} | undefined, extraClass?: string) => string;
/** Maps inputs onto the `textarea` CSS utilities (`@libs/ui/styles`). */
declare const textareaVariants: (props?: {
    appearance?: "outline" | "filled" | undefined;
    size?: "xs" | "sm" | "md" | "lg" | "xl" | undefined;
} | undefined, extraClass?: string) => string;

/**
 * Applies the design system's text-field visual treatment to a native
 * `<input>` and bridges it into Angular forms via `ControlValueAccessor`.
 *
 * Extends `UiFormFieldControl` so a wrapping `UiFormFieldComponent` can
 * discover this control through content projection (via DI, using
 * `UiFormFieldControl` as the query token) without knowing whether the
 * projected control is an `input` or a `textarea`.
 */
declare class UiInputDirective extends UiFormFieldControl<string> implements ControlValueAccessor, OnInit {
    private readonly _uiConfig;
    private readonly _injector;
    private readonly _destroyRef;
    private readonly _formField;
    /**
     * Resolved lazily in `ngOnInit` rather than injected at field/constructor
     * time: this directive is itself the `NG_VALUE_ACCESSOR` for the host
     * element, so eagerly self-injecting `NgControl` during construction
     * (which needs the value accessor to construct) forms a circular
     * dependency (`NG0200`). By `ngOnInit`, every directive on this element
     * has already finished constructing, so the lookup is safe.
     */
    private _ngControl;
    readonly id: string;
    readonly appearance: _angular_core.InputSignal<UiFormFieldAppearance>;
    readonly size: _angular_core.InputSignal<UiSize>;
    private readonly _value;
    private readonly _disabled;
    private readonly _focused;
    readonly $value: _angular_core.Signal<string | null>;
    readonly $disabled: _angular_core.Signal<boolean>;
    readonly $focused: _angular_core.Signal<boolean>;
    /**
     * `NgControl.invalid`/`.touched`/`.dirty` are plain getters that read
     * their backing signals through `untracked()` (by Angular's own design,
     * so incidental reads elsewhere don't create surprise reactive
     * dependencies) — so they can't be read inside a `computed()` here and
     * expected to invalidate it. Instead, `$invalid` is a plain signal kept
     * in sync by subscribing to the bound control's `events`, which fires on
     * every value/status/touched change (including a bare `markAsTouched()`
     * call, with no DOM interaction).
     */
    private readonly _invalid;
    readonly $invalid: _angular_core.Signal<boolean>;
    protected readonly hostClass: _angular_core.Signal<string>;
    private _onChange;
    private _onTouched;
    ngOnInit(): void;
    private _updateInvalid;
    writeValue(value: string | null): void;
    registerOnChange(fn: (value: string) => void): void;
    registerOnTouched(fn: () => void): void;
    setDisabledState(isDisabled: boolean): void;
    protected onInput(event: Event): void;
    protected onBlur(): void;
    protected onFocus(): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<UiInputDirective, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<UiInputDirective, "input[uiInput]", never, { "appearance": { "alias": "appearance"; "required": false; "isSignal": true; }; "size": { "alias": "size"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}

/**
 * Applies the design system's label styling to a native `<label>` projected
 * into a `UiFormFieldComponent`.
 *
 * `UiFormFieldComponent` links this label to its control by writing the
 * control's generated `id` onto this element's `for` attribute, so no input
 * is needed here to configure that relationship manually.
 */
declare class UiLabelDirective {
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<UiLabelDirective, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<UiLabelDirective, "label[uiLabel]", never, {}, {}, never, never, true, never>;
}

/**
 * Marks projected content (an icon, a unit label, an action button, etc.)
 * to render before the control inside a `UiFormFieldComponent`'s control
 * row.
 */
declare class UiPrefixDirective {
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<UiPrefixDirective, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<UiPrefixDirective, "[uiPrefix]", never, {}, {}, never, never, true, never>;
}
/**
 * Marks projected content to render after the control inside a
 * `UiFormFieldComponent`'s control row.
 */
declare class UiSuffixDirective {
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<UiSuffixDirective, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<UiSuffixDirective, "[uiSuffix]", never, {}, {}, never, never, true, never>;
}

/**
 * Applies the design system's text-field visual treatment to a native
 * `<textarea>` and bridges it into Angular forms via `ControlValueAccessor`.
 *
 * Mirrors `UiInputDirective` exactly, aside from targeting `<textarea>` and
 * using `textareaVariants` (resizable, height-based rather than fixed-height
 * sizing).
 */
declare class UiTextareaDirective extends UiFormFieldControl<string> implements ControlValueAccessor, OnInit {
    private readonly _uiConfig;
    private readonly _injector;
    private readonly _destroyRef;
    /**
     * Resolved lazily in `ngOnInit` rather than injected at field/constructor
     * time: this directive is itself the `NG_VALUE_ACCESSOR` for the host
     * element, so eagerly self-injecting `NgControl` during construction
     * (which needs the value accessor to construct) forms a circular
     * dependency (`NG0200`). By `ngOnInit`, every directive on this element
     * has already finished constructing, so the lookup is safe.
     */
    private _ngControl;
    readonly id: string;
    readonly appearance: _angular_core.InputSignal<UiFormFieldAppearance>;
    readonly size: _angular_core.InputSignal<UiSize>;
    private readonly _value;
    private readonly _disabled;
    private readonly _focused;
    readonly $value: _angular_core.Signal<string | null>;
    readonly $disabled: _angular_core.Signal<boolean>;
    readonly $focused: _angular_core.Signal<boolean>;
    /**
     * `NgControl.invalid`/`.touched`/`.dirty` are plain getters that read
     * their backing signals through `untracked()` (by Angular's own design,
     * so incidental reads elsewhere don't create surprise reactive
     * dependencies) — so they can't be read inside a `computed()` here and
     * expected to invalidate it. Instead, `$invalid` is a plain signal kept
     * in sync by subscribing to the bound control's `events`, which fires on
     * every value/status/touched change (including a bare `markAsTouched()`
     * call, with no DOM interaction).
     */
    private readonly _invalid;
    readonly $invalid: _angular_core.Signal<boolean>;
    protected readonly hostClass: _angular_core.Signal<string>;
    private _onChange;
    private _onTouched;
    ngOnInit(): void;
    private _updateInvalid;
    writeValue(value: string | null): void;
    registerOnChange(fn: (value: string) => void): void;
    registerOnTouched(fn: () => void): void;
    setDisabledState(isDisabled: boolean): void;
    protected onInput(event: Event): void;
    protected onBlur(): void;
    protected onFocus(): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<UiTextareaDirective, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<UiTextareaDirective, "textarea[uiTextarea]", never, { "appearance": { "alias": "appearance"; "required": false; "isSignal": true; }; "size": { "alias": "size"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}

export { UI_FORM_FIELD, UiErrorDirective, UiFormFieldComponent, UiHintDirective, UiInputDirective, UiLabelDirective, UiPrefixDirective, UiSuffixDirective, UiTextareaDirective, inputVariants, textareaVariants };
export type { UiFormFieldAppearance, UiFormFieldContext };
