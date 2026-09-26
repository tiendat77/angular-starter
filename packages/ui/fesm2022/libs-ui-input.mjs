import * as i0 from '@angular/core';
import { Directive, InjectionToken, inject, Injector, DestroyRef, input, signal, computed, forwardRef, Renderer2, contentChild, ElementRef, effect, ChangeDetectionStrategy, Component } from '@angular/core';
import { cva, UiFormFieldControl, UI_CONFIG } from '@libs/ui/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgControl, NG_VALUE_ACCESSOR } from '@angular/forms';

let nextErrorId = 0;
/**
 * Applies error styling to a projected `<span uiError>` and exposes a
 * unique `id`, which `UiFormFieldComponent` reads to link the error into
 * the control's `aria-describedby`.
 */
class UiErrorDirective {
    id = `ui-error-${nextErrorId++}`;
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiErrorDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "22.0.5", type: UiErrorDirective, isStandalone: true, selector: "span[uiError]", host: { attributes: { "role": "alert" }, properties: { "attr.id": "id" }, classAttribute: "text-xs text-error" }, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiErrorDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: 'span[uiError]',
                    host: {
                        class: 'text-xs text-error',
                        role: 'alert',
                        '[attr.id]': 'id',
                    },
                }]
        }] });

const UI_FORM_FIELD = new InjectionToken('UI_FORM_FIELD');

let nextHintId = 0;
/**
 * Applies hint styling to a projected `<span uiHint>` and exposes a unique
 * `id`, which `UiFormFieldComponent` reads to link the hint into the
 * control's `aria-describedby`.
 */
class UiHintDirective {
    id = `ui-hint-${nextHintId++}`;
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiHintDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "22.0.5", type: UiHintDirective, isStandalone: true, selector: "span[uiHint]", host: { properties: { "attr.id": "id" }, classAttribute: "text-xs text-foreground/60" }, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiHintDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: 'span[uiHint]',
                    host: {
                        class: 'text-xs text-foreground/60',
                        '[attr.id]': 'id',
                    },
                }]
        }] });

const sharedBase = 'flex w-full min-w-0 text-foreground transition-colors placeholder:text-foreground/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-error aria-invalid:focus-visible:outline-error';
const sharedAppearance = {
    outline: 'border border-border bg-background',
    filled: 'border border-transparent bg-muted',
};
const inputVariants = cva({
    base: `${sharedBase} rounded-lg`,
    variants: {
        appearance: sharedAppearance,
        size: {
            xs: 'h-7 px-2 text-xs rounded-md',
            sm: 'h-8 px-2.5 text-xs rounded-md',
            md: 'h-10 px-3 text-sm',
            lg: 'h-12 px-4 text-base',
            xl: 'h-14 px-5 text-lg rounded-xl',
        },
    },
    defaultVariants: {
        appearance: 'outline',
        size: 'md',
    },
});
/**
 * Bordered box drawn by `UiFormFieldComponent` around a `uiInput` plus its
 * `uiPrefix`/`uiSuffix`, so the affixes sit inside the field. Mirrors the
 * sizing of `inputVariants`; focus, disabled and invalid states are derived
 * from the inner input via `:focus-within`/`:has()`.
 */
const inputAffixBoxVariants = cva({
    base: 'flex w-full min-w-0 items-center text-foreground transition-colors focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary has-disabled:cursor-not-allowed has-disabled:opacity-50 has-[[aria-invalid=true]]:border-error has-[[aria-invalid=true]]:focus-within:outline-error',
    variants: {
        appearance: sharedAppearance,
        size: {
            xs: 'h-7 gap-1.5 px-2 text-xs rounded-md',
            sm: 'h-8 gap-1.5 px-2.5 text-xs rounded-md',
            md: 'h-10 gap-2 px-3 text-sm rounded-lg',
            lg: 'h-12 gap-2 px-4 text-base rounded-lg',
            xl: 'h-14 gap-2.5 px-5 text-lg rounded-xl',
        },
    },
    defaultVariants: {
        appearance: 'outline',
        size: 'md',
    },
});
/** Borderless `uiInput` used inside `inputAffixBoxVariants`, which owns the border and padding. */
const inputAffixedClass = 'h-full w-full min-w-0 flex-1 bg-transparent text-inherit outline-none placeholder:text-foreground/50 disabled:cursor-not-allowed';
const textareaVariants = cva({
    base: `${sharedBase} resize-y rounded-lg`,
    variants: {
        appearance: sharedAppearance,
        size: {
            xs: 'min-h-12 px-2 py-1 text-xs rounded-md',
            sm: 'min-h-16 px-2.5 py-1.5 text-xs rounded-md',
            md: 'min-h-24 px-3 py-2 text-sm',
            lg: 'min-h-32 px-4 py-2.5 text-base',
            xl: 'min-h-40 px-5 py-3 text-lg rounded-xl',
        },
    },
    defaultVariants: {
        appearance: 'outline',
        size: 'md',
    },
});

let nextInputId = 0;
/**
 * Applies the design system's text-field visual treatment to a native
 * `<input>` and bridges it into Angular forms via `ControlValueAccessor`.
 *
 * Extends `UiFormFieldControl` so a wrapping `UiFormFieldComponent` can
 * discover this control through content projection (via DI, using
 * `UiFormFieldControl` as the query token) without knowing whether the
 * projected control is an `input` or a `textarea`.
 */
class UiInputDirective extends UiFormFieldControl {
    _uiConfig = inject(UI_CONFIG, { optional: true });
    _injector = inject(Injector);
    _destroyRef = inject(DestroyRef);
    _formField = inject(UI_FORM_FIELD, { optional: true });
    /**
     * Resolved lazily in `ngOnInit` rather than injected at field/constructor
     * time: this directive is itself the `NG_VALUE_ACCESSOR` for the host
     * element, so eagerly self-injecting `NgControl` during construction
     * (which needs the value accessor to construct) forms a circular
     * dependency (`NG0200`). By `ngOnInit`, every directive on this element
     * has already finished constructing, so the lookup is safe.
     */
    _ngControl = null;
    id = `ui-input-${nextInputId++}`;
    appearance = input(this._uiConfig?.formField?.appearance ?? 'outline', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "appearance" }] : /* istanbul ignore next */ []));
    size = input(this._uiConfig?.defaultSize ?? 'md', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "size" }] : /* istanbul ignore next */ []));
    _value = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "_value" }] : /* istanbul ignore next */ []));
    _disabled = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "_disabled" }] : /* istanbul ignore next */ []));
    _focused = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "_focused" }] : /* istanbul ignore next */ []));
    $value = this._value.asReadonly();
    $disabled = this._disabled.asReadonly();
    $focused = this._focused.asReadonly();
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
    _invalid = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "_invalid" }] : /* istanbul ignore next */ []));
    $invalid = this._invalid.asReadonly();
    hostClass = computed(() => this._formField?.$hasAffix()
        ? inputAffixedClass
        : inputVariants({ appearance: this.appearance(), size: this.size() }), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "hostClass" }] : /* istanbul ignore next */ []));
    _onChange = () => undefined;
    _onTouched = () => undefined;
    ngOnInit() {
        this._ngControl = this._injector.get(NgControl, null, { optional: true, self: true });
        const control = this._ngControl?.control;
        if (!control) {
            return;
        }
        this._updateInvalid();
        control.events
            .pipe(takeUntilDestroyed(this._destroyRef))
            .subscribe(() => this._updateInvalid());
    }
    _updateInvalid() {
        const ngControl = this._ngControl;
        this._invalid.set(!!ngControl?.invalid && !!(ngControl.touched || ngControl.dirty));
    }
    writeValue(value) {
        this._value.set(value ?? null);
    }
    registerOnChange(fn) {
        this._onChange = fn;
    }
    registerOnTouched(fn) {
        this._onTouched = fn;
    }
    setDisabledState(isDisabled) {
        this._disabled.set(isDisabled);
    }
    onInput(event) {
        const value = event.target.value;
        this._value.set(value);
        this._onChange(value);
    }
    onBlur() {
        this._focused.set(false);
        this._onTouched();
    }
    onFocus() {
        this._focused.set(true);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiInputDirective, deps: null, target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "17.1.0", version: "22.0.5", type: UiInputDirective, isStandalone: true, selector: "input[uiInput]", inputs: { appearance: { classPropertyName: "appearance", publicName: "appearance", isSignal: true, isRequired: false, transformFunction: null }, size: { classPropertyName: "size", publicName: "size", isSignal: true, isRequired: false, transformFunction: null } }, host: { listeners: { "input": "onInput($event)", "blur": "onBlur()", "focus": "onFocus()" }, properties: { "class": "hostClass()", "id": "id", "disabled": "$disabled()" } }, providers: [
            { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => UiInputDirective), multi: true },
            { provide: UiFormFieldControl, useExisting: forwardRef(() => UiInputDirective) },
        ], usesInheritance: true, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiInputDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: 'input[uiInput]',
                    providers: [
                        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => UiInputDirective), multi: true },
                        { provide: UiFormFieldControl, useExisting: forwardRef(() => UiInputDirective) },
                    ],
                    host: {
                        '[class]': 'hostClass()',
                        '[id]': 'id',
                        '[disabled]': '$disabled()',
                        '(input)': 'onInput($event)',
                        '(blur)': 'onBlur()',
                        '(focus)': 'onFocus()',
                    },
                }]
        }], propDecorators: { appearance: [{ type: i0.Input, args: [{ isSignal: true, alias: "appearance", required: false }] }], size: [{ type: i0.Input, args: [{ isSignal: true, alias: "size", required: false }] }] } });

/**
 * Applies the design system's label styling to a native `<label>` projected
 * into a `UiFormFieldComponent`.
 *
 * `UiFormFieldComponent` links this label to its control by writing the
 * control's generated `id` onto this element's `for` attribute, so no input
 * is needed here to configure that relationship manually.
 */
class UiLabelDirective {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiLabelDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "22.0.5", type: UiLabelDirective, isStandalone: true, selector: "label[uiLabel]", host: { classAttribute: "block text-sm font-medium text-foreground" }, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiLabelDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: 'label[uiLabel]',
                    host: {
                        class: 'block text-sm font-medium text-foreground',
                    },
                }]
        }] });

/**
 * Marks projected content (an icon, a unit label, an action button, etc.)
 * to render before the control inside a `UiFormFieldComponent`'s control
 * row.
 */
class UiPrefixDirective {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiPrefixDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "22.0.5", type: UiPrefixDirective, isStandalone: true, selector: "[uiPrefix]", host: { classAttribute: "flex shrink-0 items-center text-foreground/60" }, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiPrefixDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[uiPrefix]',
                    host: {
                        class: 'flex shrink-0 items-center text-foreground/60',
                    },
                }]
        }] });
/**
 * Marks projected content to render after the control inside a
 * `UiFormFieldComponent`'s control row.
 */
class UiSuffixDirective {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiSuffixDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "22.0.5", type: UiSuffixDirective, isStandalone: true, selector: "[uiSuffix]", host: { classAttribute: "flex shrink-0 items-center text-foreground/60" }, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiSuffixDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[uiSuffix]',
                    host: {
                        class: 'flex shrink-0 items-center text-foreground/60',
                    },
                }]
        }] });

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
class UiFormFieldComponent {
    _renderer = inject(Renderer2);
    control = contentChild(UiFormFieldControl, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "control" }] : /* istanbul ignore next */ []));
    _controlElementRef = contentChild(UiFormFieldControl, { ...(ngDevMode ? { debugName: "_controlElementRef" } : /* istanbul ignore next */ {}), read: ElementRef });
    _labelElementRef = contentChild(UiLabelDirective, { ...(ngDevMode ? { debugName: "_labelElementRef" } : /* istanbul ignore next */ {}), read: ElementRef });
    hint = contentChild(UiHintDirective, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "hint" }] : /* istanbul ignore next */ []));
    error = contentChild(UiErrorDirective, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "error" }] : /* istanbul ignore next */ []));
    _input = contentChild(UiInputDirective, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "_input" }] : /* istanbul ignore next */ []));
    _prefix = contentChild(UiPrefixDirective, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "_prefix" }] : /* istanbul ignore next */ []));
    _suffix = contentChild(UiSuffixDirective, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "_suffix" }] : /* istanbul ignore next */ []));
    /** Affixes are drawn inside the box only for `uiInput`; a `uiTextarea` keeps them alongside. */
    $hasAffix = computed(() => !!this._input() && !!(this._prefix() || this._suffix()), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "$hasAffix" }] : /* istanbul ignore next */ []));
    $controlRowClass = computed(() => {
        const input = this._input();
        return this.$hasAffix() && input
            ? inputAffixBoxVariants({ appearance: input.appearance(), size: input.size() })
            : 'relative flex items-center gap-2';
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "$controlRowClass" }] : /* istanbul ignore next */ []));
    constructor() {
        effect(() => {
            const control = this.control();
            const controlElementRef = this._controlElementRef();
            if (!control || !controlElementRef) {
                return;
            }
            const controlEl = controlElementRef.nativeElement;
            const labelElementRef = this._labelElementRef();
            if (labelElementRef) {
                this._renderer.setAttribute(labelElementRef.nativeElement, 'for', control.id);
            }
            const describedByIds = [this.hint()?.id, this.error()?.id].filter((id) => !!id);
            if (describedByIds.length > 0) {
                this._renderer.setAttribute(controlEl, 'aria-describedby', describedByIds.join(' '));
            }
            else {
                this._renderer.removeAttribute(controlEl, 'aria-describedby');
            }
            if (control.$invalid()) {
                this._renderer.setAttribute(controlEl, 'aria-invalid', 'true');
            }
            else {
                this._renderer.removeAttribute(controlEl, 'aria-invalid');
            }
        });
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiFormFieldComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.2.0", version: "22.0.5", type: UiFormFieldComponent, isStandalone: true, selector: "ui-form-field", host: { classAttribute: "flex flex-col gap-1.5" }, providers: [{ provide: UI_FORM_FIELD, useExisting: forwardRef(() => UiFormFieldComponent) }], queries: [{ propertyName: "control", first: true, predicate: UiFormFieldControl, descendants: true, isSignal: true }, { propertyName: "_controlElementRef", first: true, predicate: UiFormFieldControl, descendants: true, read: ElementRef, isSignal: true }, { propertyName: "_labelElementRef", first: true, predicate: UiLabelDirective, descendants: true, read: ElementRef, isSignal: true }, { propertyName: "hint", first: true, predicate: UiHintDirective, descendants: true, isSignal: true }, { propertyName: "error", first: true, predicate: UiErrorDirective, descendants: true, isSignal: true }, { propertyName: "_input", first: true, predicate: UiInputDirective, descendants: true, isSignal: true }, { propertyName: "_prefix", first: true, predicate: UiPrefixDirective, descendants: true, isSignal: true }, { propertyName: "_suffix", first: true, predicate: UiSuffixDirective, descendants: true, isSignal: true }], ngImport: i0, template: `
    <ng-content select="[uiLabel]" />
    <div [class]="$controlRowClass()">
      <ng-content select="[uiPrefix]" />
      <ng-content select="[uiInput], [uiTextarea]" />
      <ng-content select="[uiSuffix]" />
    </div>
    <ng-content select="[uiHint]" />
    <ng-content select="[uiError]" />
  `, isInline: true, changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiFormFieldComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'ui-form-field',
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    providers: [{ provide: UI_FORM_FIELD, useExisting: forwardRef(() => UiFormFieldComponent) }],
                    host: {
                        class: 'flex flex-col gap-1.5',
                    },
                    template: `
    <ng-content select="[uiLabel]" />
    <div [class]="$controlRowClass()">
      <ng-content select="[uiPrefix]" />
      <ng-content select="[uiInput], [uiTextarea]" />
      <ng-content select="[uiSuffix]" />
    </div>
    <ng-content select="[uiHint]" />
    <ng-content select="[uiError]" />
  `,
                }]
        }], ctorParameters: () => [], propDecorators: { control: [{ type: i0.ContentChild, args: [i0.forwardRef(() => UiFormFieldControl), { isSignal: true }] }], _controlElementRef: [{ type: i0.ContentChild, args: [i0.forwardRef(() => UiFormFieldControl), { ...{ read: ElementRef }, isSignal: true }] }], _labelElementRef: [{ type: i0.ContentChild, args: [i0.forwardRef(() => UiLabelDirective), { ...{ read: ElementRef }, isSignal: true }] }], hint: [{ type: i0.ContentChild, args: [i0.forwardRef(() => UiHintDirective), { isSignal: true }] }], error: [{ type: i0.ContentChild, args: [i0.forwardRef(() => UiErrorDirective), { isSignal: true }] }], _input: [{ type: i0.ContentChild, args: [i0.forwardRef(() => UiInputDirective), { isSignal: true }] }], _prefix: [{ type: i0.ContentChild, args: [i0.forwardRef(() => UiPrefixDirective), { isSignal: true }] }], _suffix: [{ type: i0.ContentChild, args: [i0.forwardRef(() => UiSuffixDirective), { isSignal: true }] }] } });

let nextTextareaId = 0;
/**
 * Applies the design system's text-field visual treatment to a native
 * `<textarea>` and bridges it into Angular forms via `ControlValueAccessor`.
 *
 * Mirrors `UiInputDirective` exactly, aside from targeting `<textarea>` and
 * using `textareaVariants` (resizable, height-based rather than fixed-height
 * sizing).
 */
class UiTextareaDirective extends UiFormFieldControl {
    _uiConfig = inject(UI_CONFIG, { optional: true });
    _injector = inject(Injector);
    _destroyRef = inject(DestroyRef);
    /**
     * Resolved lazily in `ngOnInit` rather than injected at field/constructor
     * time: this directive is itself the `NG_VALUE_ACCESSOR` for the host
     * element, so eagerly self-injecting `NgControl` during construction
     * (which needs the value accessor to construct) forms a circular
     * dependency (`NG0200`). By `ngOnInit`, every directive on this element
     * has already finished constructing, so the lookup is safe.
     */
    _ngControl = null;
    id = `ui-textarea-${nextTextareaId++}`;
    appearance = input(this._uiConfig?.formField?.appearance ?? 'outline', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "appearance" }] : /* istanbul ignore next */ []));
    size = input(this._uiConfig?.defaultSize ?? 'md', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "size" }] : /* istanbul ignore next */ []));
    _value = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "_value" }] : /* istanbul ignore next */ []));
    _disabled = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "_disabled" }] : /* istanbul ignore next */ []));
    _focused = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "_focused" }] : /* istanbul ignore next */ []));
    $value = this._value.asReadonly();
    $disabled = this._disabled.asReadonly();
    $focused = this._focused.asReadonly();
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
    _invalid = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "_invalid" }] : /* istanbul ignore next */ []));
    $invalid = this._invalid.asReadonly();
    hostClass = computed(() => textareaVariants({ appearance: this.appearance(), size: this.size() }), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "hostClass" }] : /* istanbul ignore next */ []));
    _onChange = () => undefined;
    _onTouched = () => undefined;
    ngOnInit() {
        this._ngControl = this._injector.get(NgControl, null, { optional: true, self: true });
        const control = this._ngControl?.control;
        if (!control) {
            return;
        }
        this._updateInvalid();
        control.events
            .pipe(takeUntilDestroyed(this._destroyRef))
            .subscribe(() => this._updateInvalid());
    }
    _updateInvalid() {
        const ngControl = this._ngControl;
        this._invalid.set(!!ngControl?.invalid && !!(ngControl.touched || ngControl.dirty));
    }
    writeValue(value) {
        this._value.set(value ?? null);
    }
    registerOnChange(fn) {
        this._onChange = fn;
    }
    registerOnTouched(fn) {
        this._onTouched = fn;
    }
    setDisabledState(isDisabled) {
        this._disabled.set(isDisabled);
    }
    onInput(event) {
        const value = event.target.value;
        this._value.set(value);
        this._onChange(value);
    }
    onBlur() {
        this._focused.set(false);
        this._onTouched();
    }
    onFocus() {
        this._focused.set(true);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiTextareaDirective, deps: null, target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "17.1.0", version: "22.0.5", type: UiTextareaDirective, isStandalone: true, selector: "textarea[uiTextarea]", inputs: { appearance: { classPropertyName: "appearance", publicName: "appearance", isSignal: true, isRequired: false, transformFunction: null }, size: { classPropertyName: "size", publicName: "size", isSignal: true, isRequired: false, transformFunction: null } }, host: { listeners: { "input": "onInput($event)", "blur": "onBlur()", "focus": "onFocus()" }, properties: { "class": "hostClass()", "id": "id", "disabled": "$disabled()" } }, providers: [
            {
                provide: NG_VALUE_ACCESSOR,
                useExisting: forwardRef(() => UiTextareaDirective),
                multi: true,
            },
            { provide: UiFormFieldControl, useExisting: forwardRef(() => UiTextareaDirective) },
        ], usesInheritance: true, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiTextareaDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: 'textarea[uiTextarea]',
                    providers: [
                        {
                            provide: NG_VALUE_ACCESSOR,
                            useExisting: forwardRef(() => UiTextareaDirective),
                            multi: true,
                        },
                        { provide: UiFormFieldControl, useExisting: forwardRef(() => UiTextareaDirective) },
                    ],
                    host: {
                        '[class]': 'hostClass()',
                        '[id]': 'id',
                        '[disabled]': '$disabled()',
                        '(input)': 'onInput($event)',
                        '(blur)': 'onBlur()',
                        '(focus)': 'onFocus()',
                    },
                }]
        }], propDecorators: { appearance: [{ type: i0.Input, args: [{ isSignal: true, alias: "appearance", required: false }] }], size: [{ type: i0.Input, args: [{ isSignal: true, alias: "size", required: false }] }] } });

/**
 * Generated bundle index. Do not edit.
 */

export { UI_FORM_FIELD, UiErrorDirective, UiFormFieldComponent, UiHintDirective, UiInputDirective, UiLabelDirective, UiPrefixDirective, UiSuffixDirective, UiTextareaDirective, inputAffixBoxVariants, inputAffixedClass, inputVariants, textareaVariants };
//# sourceMappingURL=libs-ui-input.mjs.map
