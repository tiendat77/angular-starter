import * as i0 from '@angular/core';
import { input, booleanAttribute, inject, ElementRef, computed, ChangeDetectionStrategy, Component, model, signal, contentChildren, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { cva, cn, UI_CONFIG } from '@libs/ui/core';

const radioCircleVariants = cva({
    base: 'inline-flex items-center justify-center shrink-0 rounded-full border border-border transition-colors duration-150',
    variants: {
        size: {
            xs: 'h-3.5 w-3.5',
            sm: 'h-4 w-4',
            md: 'h-5 w-5',
            lg: 'h-6 w-6',
            xl: 'h-7 w-7',
        },
        checked: {
            true: 'border-primary bg-primary text-primary-content',
            false: 'bg-background hover:bg-muted',
        },
    },
    defaultVariants: {
        size: 'md',
        checked: 'false',
    },
});
const radioDotVariants = cva({
    base: 'rounded-full bg-background',
    variants: {
        size: {
            xs: 'h-1.5 w-1.5',
            sm: 'h-1.5 w-1.5',
            md: 'h-2 w-2',
            lg: 'h-2.5 w-2.5',
            xl: 'h-3 w-3',
        },
    },
    defaultVariants: {
        size: 'md',
    },
});
class UiRadioComponent {
    // -----------------------------------------------------------------------------------------------------
    // @ Public properties
    // -----------------------------------------------------------------------------------------------------
    value = input.required(/* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "value" }] : /* istanbul ignore next */ []));
    disabled = input(false, { ...(ngDevMode ? { debugName: "disabled" } : /* istanbul ignore next */ {}), transform: booleanAttribute });
    label = input(/* @ts-ignore */
    ...(ngDevMode ? [undefined, { debugName: "label" }] : /* istanbul ignore next */ []));
    // -----------------------------------------------------------------------------------------------------
    // @ Private / Protected properties
    // -----------------------------------------------------------------------------------------------------
    _group = inject(UiRadioGroupComponent, { optional: true });
    _elementRef = inject(ElementRef);
    isChecked = computed(() => {
        if (!this._group)
            return false;
        return this._group.value() === this.value();
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "isChecked" }] : /* istanbul ignore next */ []));
    isDisabled = computed(() => {
        return this.disabled() || (this._group?.effectiveDisabled() ?? false);
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "isDisabled" }] : /* istanbul ignore next */ []));
    effectiveSize = computed(() => {
        return this._group?.effectiveSize() ?? 'md';
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "effectiveSize" }] : /* istanbul ignore next */ []));
    tabIndex = computed(() => {
        if (this.isDisabled())
            return -1;
        if (!this._group)
            return 0;
        if (this.isChecked())
            return 0;
        if (!this._group.hasCheckedRadio() && this._group.isFirstEnabledRadio(this)) {
            return 0;
        }
        return -1;
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "tabIndex" }] : /* istanbul ignore next */ []));
    $hostClass = computed(() => cn('inline-flex items-center gap-2 select-none cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary rounded-md p-0.5', this.isDisabled() && 'cursor-not-allowed opacity-50 pointer-events-none'), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "$hostClass" }] : /* istanbul ignore next */ []));
    $circleClass = computed(() => radioCircleVariants({
        size: this.effectiveSize(),
        checked: this.isChecked() ? 'true' : 'false',
    }), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "$circleClass" }] : /* istanbul ignore next */ []));
    $dotClass = computed(() => radioDotVariants({
        size: this.effectiveSize(),
    }), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "$dotClass" }] : /* istanbul ignore next */ []));
    $labelClass = computed(() => cn('text-foreground', this.effectiveSize() === 'xs' && 'text-xs', this.effectiveSize() === 'sm' && 'text-xs', this.effectiveSize() === 'md' && 'text-sm', this.effectiveSize() === 'lg' && 'text-base', this.effectiveSize() === 'xl' && 'text-lg'), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "$labelClass" }] : /* istanbul ignore next */ []));
    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------
    select() {
        if (this.isDisabled() || !this._group) {
            return;
        }
        this._group.selectValue(this.value());
    }
    focus() {
        this._elementRef.nativeElement.focus();
    }
    // -----------------------------------------------------------------------------------------------------
    // @ Protected methods
    // -----------------------------------------------------------------------------------------------------
    onKeyDown(event) {
        if (this.isDisabled() || !this._group) {
            return;
        }
        switch (event.key) {
            case 'ArrowDown':
            case 'ArrowRight':
                event.preventDefault();
                this._group.selectNext(this);
                break;
            case 'ArrowUp':
            case 'ArrowLeft':
                event.preventDefault();
                this._group.selectPrevious(this);
                break;
            case ' ':
                event.preventDefault();
                this.select();
                break;
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiRadioComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "22.0.5", type: UiRadioComponent, isStandalone: true, selector: "ui-radio", inputs: { value: { classPropertyName: "value", publicName: "value", isSignal: true, isRequired: true, transformFunction: null }, disabled: { classPropertyName: "disabled", publicName: "disabled", isSignal: true, isRequired: false, transformFunction: null }, label: { classPropertyName: "label", publicName: "label", isSignal: true, isRequired: false, transformFunction: null } }, host: { attributes: { "role": "radio" }, listeners: { "click": "select()", "keydown": "onKeyDown($event)" }, properties: { "attr.aria-checked": "isChecked() ? \"true\" : \"false\"", "attr.aria-disabled": "isDisabled() ? \"true\" : null", "attr.tabindex": "tabIndex()", "class": "$hostClass()" } }, ngImport: i0, template: `
    <span
      aria-hidden="true"
      [class]="$circleClass()"
    >
      @if (isChecked()) {
        <span [class]="$dotClass()"></span>
      }
    </span>
    @if (label()) {
      <span [class]="$labelClass()">{{ label() }}</span>
    } @else {
      <ng-content />
    }
  `, isInline: true, changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiRadioComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'ui-radio',
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    host: {
                        role: 'radio',
                        '[attr.aria-checked]': 'isChecked() ? "true" : "false"',
                        '[attr.aria-disabled]': 'isDisabled() ? "true" : null',
                        '[attr.tabindex]': 'tabIndex()',
                        '[class]': '$hostClass()',
                        '(click)': 'select()',
                        '(keydown)': 'onKeyDown($event)',
                    },
                    template: `
    <span
      aria-hidden="true"
      [class]="$circleClass()"
    >
      @if (isChecked()) {
        <span [class]="$dotClass()"></span>
      }
    </span>
    @if (label()) {
      <span [class]="$labelClass()">{{ label() }}</span>
    } @else {
      <ng-content />
    }
  `,
                }]
        }], propDecorators: { value: [{ type: i0.Input, args: [{ isSignal: true, alias: "value", required: true }] }], disabled: [{ type: i0.Input, args: [{ isSignal: true, alias: "disabled", required: false }] }], label: [{ type: i0.Input, args: [{ isSignal: true, alias: "label", required: false }] }] } });

let nextRadioGroupId = 0;
class UiRadioGroupComponent {
    // -----------------------------------------------------------------------------------------------------
    // @ Public properties
    // -----------------------------------------------------------------------------------------------------
    value = model(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "value" }] : /* istanbul ignore next */ []));
    name = input(`ui-radio-group-${++nextRadioGroupId}`, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "name" }] : /* istanbul ignore next */ []));
    disabled = input(false, { ...(ngDevMode ? { debugName: "disabled" } : /* istanbul ignore next */ {}), transform: booleanAttribute });
    size = input('md', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "size" }] : /* istanbul ignore next */ []));
    // -----------------------------------------------------------------------------------------------------
    // @ Private / Protected properties
    // -----------------------------------------------------------------------------------------------------
    _cvaDisabled$ = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "_cvaDisabled$" }] : /* istanbul ignore next */ []));
    _uiConfig = inject(UI_CONFIG, { optional: true });
    radios = contentChildren(forwardRef(() => UiRadioComponent), { ...(ngDevMode ? { debugName: "radios" } : /* istanbul ignore next */ {}), descendants: true });
    _onChange = () => undefined;
    _onTouched = () => undefined;
    effectiveDisabled = computed(() => this.disabled() || this._cvaDisabled$(), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "effectiveDisabled" }] : /* istanbul ignore next */ []));
    effectiveSize = computed(() => this.size() ?? this._uiConfig?.defaultSize ?? 'md', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "effectiveSize" }] : /* istanbul ignore next */ []));
    hostClass = computed(() => cn('inline-flex flex-col gap-2', this.effectiveDisabled() && 'opacity-50 pointer-events-none'), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "hostClass" }] : /* istanbul ignore next */ []));
    // -----------------------------------------------------------------------------------------------------
    // @ ControlValueAccessor
    // -----------------------------------------------------------------------------------------------------
    writeValue(value) {
        this.value.set(value);
    }
    registerOnChange(fn) {
        this._onChange = fn;
    }
    registerOnTouched(fn) {
        this._onTouched = fn;
    }
    setDisabledState(isDisabled) {
        this._cvaDisabled$.set(isDisabled);
    }
    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------
    selectValue(val) {
        if (this.effectiveDisabled()) {
            return;
        }
        this.value.set(val);
        this._onChange(val);
        this._onTouched();
    }
    selectNext(current) {
        const list = this.radios().filter((r) => !r.isDisabled());
        if (list.length === 0)
            return;
        const currentIndex = list.indexOf(current);
        const nextIndex = currentIndex < list.length - 1 ? currentIndex + 1 : 0;
        const nextRadio = list[nextIndex];
        this.selectValue(nextRadio.value());
        nextRadio.focus();
    }
    selectPrevious(current) {
        const list = this.radios().filter((r) => !r.isDisabled());
        if (list.length === 0)
            return;
        const currentIndex = list.indexOf(current);
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : list.length - 1;
        const prevRadio = list[prevIndex];
        this.selectValue(prevRadio.value());
        prevRadio.focus();
    }
    isFirstEnabledRadio(radio) {
        const firstEnabled = this.radios().find((r) => !r.isDisabled());
        return firstEnabled === radio;
    }
    hasCheckedRadio() {
        return this.radios().some((r) => r.isChecked());
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiRadioGroupComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.2.0", version: "22.0.5", type: UiRadioGroupComponent, isStandalone: true, selector: "ui-radio-group", inputs: { value: { classPropertyName: "value", publicName: "value", isSignal: true, isRequired: false, transformFunction: null }, name: { classPropertyName: "name", publicName: "name", isSignal: true, isRequired: false, transformFunction: null }, disabled: { classPropertyName: "disabled", publicName: "disabled", isSignal: true, isRequired: false, transformFunction: null }, size: { classPropertyName: "size", publicName: "size", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { value: "valueChange" }, host: { attributes: { "role": "radiogroup" }, properties: { "class": "hostClass()", "attr.aria-disabled": "effectiveDisabled() ? \"true\" : null" } }, providers: [
            {
                provide: NG_VALUE_ACCESSOR,
                useExisting: forwardRef(() => UiRadioGroupComponent),
                multi: true,
            },
        ], queries: [{ propertyName: "radios", predicate: i0.forwardRef(() => UiRadioComponent), descendants: true, isSignal: true }], ngImport: i0, template: '<ng-content />', isInline: true, changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiRadioGroupComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'ui-radio-group',
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    providers: [
                        {
                            provide: NG_VALUE_ACCESSOR,
                            useExisting: forwardRef(() => UiRadioGroupComponent),
                            multi: true,
                        },
                    ],
                    host: {
                        role: 'radiogroup',
                        '[class]': 'hostClass()',
                        '[attr.aria-disabled]': 'effectiveDisabled() ? "true" : null',
                    },
                    template: '<ng-content />',
                }]
        }], propDecorators: { value: [{ type: i0.Input, args: [{ isSignal: true, alias: "value", required: false }] }, { type: i0.Output, args: ["valueChange"] }], name: [{ type: i0.Input, args: [{ isSignal: true, alias: "name", required: false }] }], disabled: [{ type: i0.Input, args: [{ isSignal: true, alias: "disabled", required: false }] }], size: [{ type: i0.Input, args: [{ isSignal: true, alias: "size", required: false }] }], radios: [{ type: i0.ContentChildren, args: [forwardRef(() => UiRadioComponent), { ...{
                            descendants: true,
                        }, isSignal: true }] }] } });

/**
 * Generated bundle index. Do not edit.
 */

export { UiRadioComponent, UiRadioGroupComponent, radioCircleVariants, radioDotVariants };
//# sourceMappingURL=libs-ui-radio.mjs.map
