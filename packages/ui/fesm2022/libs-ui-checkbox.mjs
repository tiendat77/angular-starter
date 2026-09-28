import * as i0 from '@angular/core';
import { model, input, booleanAttribute, viewChild, signal, inject, computed, effect, forwardRef, ChangeDetectionStrategy, Component } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { cva, UI_CONFIG } from '@libs/ui/core';

/** Root `<label>` shared by checkbox and switch: layout, label typography and disabled state. */
const checkboxVariants = cva({
    base: 'relative flex items-start gap-2 select-none',
    variants: {
        size: {
            xs: 'text-xs',
            sm: 'text-xs',
            md: 'text-sm',
            lg: 'text-base',
            xl: 'text-lg',
        },
        disabled: {
            true: 'cursor-not-allowed text-muted-foreground',
            false: 'cursor-pointer text-foreground',
        },
    },
    defaultVariants: {
        size: 'md',
        disabled: 'false',
    },
});
/** Maps inputs onto the `checkbox` CSS utilities (`@libs/ui/styles`). */
const checkboxBoxVariants = cva({
    base: 'checkbox',
    variants: {
        size: {
            xs: 'checkbox-xs',
            sm: 'checkbox-sm',
            md: 'checkbox-md',
            lg: 'checkbox-lg',
            xl: 'checkbox-xl',
        },
    },
    defaultVariants: {
        size: 'md',
    },
});
/** Maps inputs onto the `toggle` CSS utilities (`@libs/ui/styles`). */
const switchTrackVariants = cva({
    base: 'toggle',
    variants: {
        size: {
            xs: 'toggle-xs',
            sm: 'toggle-sm',
            md: 'toggle-md',
            lg: 'toggle-lg',
            xl: 'toggle-xl',
        },
    },
    defaultVariants: {
        size: 'md',
    },
});

let nextCheckboxId = 0;
class UiCheckboxComponent {
    // -----------------------------------------------------------------------------------------------------
    // @ Public properties
    // -----------------------------------------------------------------------------------------------------
    checked = model(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "checked" }] : /* istanbul ignore next */ []));
    indeterminate = input(false, { ...(ngDevMode ? { debugName: "indeterminate" } : /* istanbul ignore next */ {}), transform: booleanAttribute });
    disabled = input(false, { ...(ngDevMode ? { debugName: "disabled" } : /* istanbul ignore next */ {}), transform: booleanAttribute });
    size = input('md', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "size" }] : /* istanbul ignore next */ []));
    label = input(/* @ts-ignore */
    ...(ngDevMode ? [undefined, { debugName: "label" }] : /* istanbul ignore next */ []));
    id = input(/* @ts-ignore */
    ...(ngDevMode ? [undefined, { debugName: "id" }] : /* istanbul ignore next */ []));
    /** Accessible name when there is no visible label (e.g. table selection cells). */
    ariaLabel = input(/* @ts-ignore */
    ...(ngDevMode ? [undefined, { debugName: "ariaLabel" }] : /* istanbul ignore next */ []));
    // -----------------------------------------------------------------------------------------------------
    // @ Private / Protected properties
    // -----------------------------------------------------------------------------------------------------
    _inputRef = viewChild('inputRef', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "_inputRef" }] : /* istanbul ignore next */ []));
    _autoId = `ui-checkbox-${++nextCheckboxId}`;
    _cvaDisabled$ = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "_cvaDisabled$" }] : /* istanbul ignore next */ []));
    _uiConfig = inject(UI_CONFIG, { optional: true });
    _onChange = () => undefined;
    _onTouched = () => undefined;
    $effectiveDisabled = computed(() => this.disabled() || this._cvaDisabled$(), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "$effectiveDisabled" }] : /* istanbul ignore next */ []));
    $effectiveId = computed(() => this.id() || this._autoId, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "$effectiveId" }] : /* istanbul ignore next */ []));
    $effectiveSize = computed(() => this.size() ?? this._uiConfig?.defaultSize ?? 'md', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "$effectiveSize" }] : /* istanbul ignore next */ []));
    $rootClass = computed(() => checkboxVariants({
        size: this.$effectiveSize(),
        disabled: this.$effectiveDisabled() ? 'true' : 'false',
    }), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "$rootClass" }] : /* istanbul ignore next */ []));
    $boxClass = computed(() => checkboxBoxVariants({ size: this.$effectiveSize() }), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "$boxClass" }] : /* istanbul ignore next */ []));
    constructor() {
        effect(() => {
            const isIndeterminate = this.indeterminate();
            const inputEl = this._inputRef()?.nativeElement;
            if (inputEl) {
                inputEl.indeterminate = isIndeterminate;
            }
        });
    }
    // -----------------------------------------------------------------------------------------------------
    // @ ControlValueAccessor
    // -----------------------------------------------------------------------------------------------------
    writeValue(value) {
        this.checked.set(Boolean(value));
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
    // @ Protected methods
    // -----------------------------------------------------------------------------------------------------
    onInputChange(event) {
        if (this.$effectiveDisabled()) {
            return;
        }
        const inputEl = event.target;
        const isChecked = inputEl.checked;
        this.checked.set(isChecked);
        this._onChange(isChecked);
        this._onTouched();
    }
    onBlur() {
        this._onTouched();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiCheckboxComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "22.0.5", type: UiCheckboxComponent, isStandalone: true, selector: "ui-checkbox", inputs: { checked: { classPropertyName: "checked", publicName: "checked", isSignal: true, isRequired: false, transformFunction: null }, indeterminate: { classPropertyName: "indeterminate", publicName: "indeterminate", isSignal: true, isRequired: false, transformFunction: null }, disabled: { classPropertyName: "disabled", publicName: "disabled", isSignal: true, isRequired: false, transformFunction: null }, size: { classPropertyName: "size", publicName: "size", isSignal: true, isRequired: false, transformFunction: null }, label: { classPropertyName: "label", publicName: "label", isSignal: true, isRequired: false, transformFunction: null }, id: { classPropertyName: "id", publicName: "id", isSignal: true, isRequired: false, transformFunction: null }, ariaLabel: { classPropertyName: "ariaLabel", publicName: "ariaLabel", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { checked: "checkedChange" }, host: { classAttribute: "inline-flex align-top" }, providers: [
            {
                provide: NG_VALUE_ACCESSOR,
                useExisting: forwardRef(() => UiCheckboxComponent),
                multi: true,
            },
        ], viewQueries: [{ propertyName: "_inputRef", first: true, predicate: ["inputRef"], descendants: true, isSignal: true }], ngImport: i0, template: `
    <label
      [class]="$rootClass()"
      [attr.for]="$effectiveId()"
    >
      <!-- One text line tall, so the box stays centered on the first line of the label -->
      <span class="flex h-lh shrink-0 items-center">
        <input
          #inputRef
          type="checkbox"
          [class]="$boxClass()"
          [id]="$effectiveId()"
          [checked]="checked()"
          [disabled]="$effectiveDisabled()"
          [attr.aria-label]="ariaLabel() ?? null"
          (change)="onInputChange($event)"
          (blur)="onBlur()"
        />
      </span>
      @if (label()) {
        <span>{{ label() }}</span>
      } @else {
        <ng-content />
      }
    </label>
  `, isInline: true, changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiCheckboxComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'ui-checkbox',
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    host: {
                        class: 'inline-flex align-top',
                    },
                    providers: [
                        {
                            provide: NG_VALUE_ACCESSOR,
                            useExisting: forwardRef(() => UiCheckboxComponent),
                            multi: true,
                        },
                    ],
                    template: `
    <label
      [class]="$rootClass()"
      [attr.for]="$effectiveId()"
    >
      <!-- One text line tall, so the box stays centered on the first line of the label -->
      <span class="flex h-lh shrink-0 items-center">
        <input
          #inputRef
          type="checkbox"
          [class]="$boxClass()"
          [id]="$effectiveId()"
          [checked]="checked()"
          [disabled]="$effectiveDisabled()"
          [attr.aria-label]="ariaLabel() ?? null"
          (change)="onInputChange($event)"
          (blur)="onBlur()"
        />
      </span>
      @if (label()) {
        <span>{{ label() }}</span>
      } @else {
        <ng-content />
      }
    </label>
  `,
                }]
        }], ctorParameters: () => [], propDecorators: { checked: [{ type: i0.Input, args: [{ isSignal: true, alias: "checked", required: false }] }, { type: i0.Output, args: ["checkedChange"] }], indeterminate: [{ type: i0.Input, args: [{ isSignal: true, alias: "indeterminate", required: false }] }], disabled: [{ type: i0.Input, args: [{ isSignal: true, alias: "disabled", required: false }] }], size: [{ type: i0.Input, args: [{ isSignal: true, alias: "size", required: false }] }], label: [{ type: i0.Input, args: [{ isSignal: true, alias: "label", required: false }] }], id: [{ type: i0.Input, args: [{ isSignal: true, alias: "id", required: false }] }], ariaLabel: [{ type: i0.Input, args: [{ isSignal: true, alias: "ariaLabel", required: false }] }], _inputRef: [{ type: i0.ViewChild, args: ['inputRef', { isSignal: true }] }] } });

let nextSwitchId = 0;
class UiSwitchComponent {
    // -----------------------------------------------------------------------------------------------------
    // @ Public properties
    // -----------------------------------------------------------------------------------------------------
    checked = model(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "checked" }] : /* istanbul ignore next */ []));
    disabled = input(false, { ...(ngDevMode ? { debugName: "disabled" } : /* istanbul ignore next */ {}), transform: booleanAttribute });
    size = input('md', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "size" }] : /* istanbul ignore next */ []));
    label = input(/* @ts-ignore */
    ...(ngDevMode ? [undefined, { debugName: "label" }] : /* istanbul ignore next */ []));
    id = input(/* @ts-ignore */
    ...(ngDevMode ? [undefined, { debugName: "id" }] : /* istanbul ignore next */ []));
    // -----------------------------------------------------------------------------------------------------
    // @ Private / Protected properties
    // -----------------------------------------------------------------------------------------------------
    _autoId = `ui-switch-${++nextSwitchId}`;
    _cvaDisabled$ = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "_cvaDisabled$" }] : /* istanbul ignore next */ []));
    _uiConfig = inject(UI_CONFIG, { optional: true });
    _onChange = () => undefined;
    _onTouched = () => undefined;
    $effectiveDisabled = computed(() => this.disabled() || this._cvaDisabled$(), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "$effectiveDisabled" }] : /* istanbul ignore next */ []));
    $effectiveId = computed(() => this.id() || this._autoId, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "$effectiveId" }] : /* istanbul ignore next */ []));
    $effectiveSize = computed(() => this.size() ?? this._uiConfig?.defaultSize ?? 'md', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "$effectiveSize" }] : /* istanbul ignore next */ []));
    $rootClass = computed(() => checkboxVariants({
        size: this.$effectiveSize(),
        disabled: this.$effectiveDisabled() ? 'true' : 'false',
    }), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "$rootClass" }] : /* istanbul ignore next */ []));
    $trackClass = computed(() => switchTrackVariants({ size: this.$effectiveSize() }), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "$trackClass" }] : /* istanbul ignore next */ []));
    // -----------------------------------------------------------------------------------------------------
    // @ ControlValueAccessor
    // -----------------------------------------------------------------------------------------------------
    writeValue(value) {
        this.checked.set(Boolean(value));
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
    toggle() {
        if (this.$effectiveDisabled()) {
            return;
        }
        const next = !this.checked();
        this.checked.set(next);
        this._onChange(next);
        this._onTouched();
    }
    // -----------------------------------------------------------------------------------------------------
    // @ Protected methods
    // -----------------------------------------------------------------------------------------------------
    onInputChange(event) {
        if (this.$effectiveDisabled()) {
            return;
        }
        const isChecked = event.target.checked;
        this.checked.set(isChecked);
        this._onChange(isChecked);
        this._onTouched();
    }
    onBlur() {
        this._onTouched();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiSwitchComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "22.0.5", type: UiSwitchComponent, isStandalone: true, selector: "ui-switch", inputs: { checked: { classPropertyName: "checked", publicName: "checked", isSignal: true, isRequired: false, transformFunction: null }, disabled: { classPropertyName: "disabled", publicName: "disabled", isSignal: true, isRequired: false, transformFunction: null }, size: { classPropertyName: "size", publicName: "size", isSignal: true, isRequired: false, transformFunction: null }, label: { classPropertyName: "label", publicName: "label", isSignal: true, isRequired: false, transformFunction: null }, id: { classPropertyName: "id", publicName: "id", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { checked: "checkedChange" }, host: { classAttribute: "inline-flex align-top" }, providers: [
            {
                provide: NG_VALUE_ACCESSOR,
                useExisting: forwardRef(() => UiSwitchComponent),
                multi: true,
            },
        ], ngImport: i0, template: `
    <label
      [class]="$rootClass()"
      [attr.for]="$effectiveId()"
    >
      <!-- One text line tall, so the track stays centered on the first line of the label -->
      <span class="flex h-lh shrink-0 items-center">
        <input
          type="checkbox"
          role="switch"
          [class]="$trackClass()"
          [id]="$effectiveId()"
          [checked]="checked()"
          [disabled]="$effectiveDisabled()"
          (change)="onInputChange($event)"
          (blur)="onBlur()"
        />
      </span>
      @if (label()) {
        <span>{{ label() }}</span>
      } @else {
        <ng-content />
      }
    </label>
  `, isInline: true, changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiSwitchComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'ui-switch',
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    host: {
                        class: 'inline-flex align-top',
                    },
                    providers: [
                        {
                            provide: NG_VALUE_ACCESSOR,
                            useExisting: forwardRef(() => UiSwitchComponent),
                            multi: true,
                        },
                    ],
                    template: `
    <label
      [class]="$rootClass()"
      [attr.for]="$effectiveId()"
    >
      <!-- One text line tall, so the track stays centered on the first line of the label -->
      <span class="flex h-lh shrink-0 items-center">
        <input
          type="checkbox"
          role="switch"
          [class]="$trackClass()"
          [id]="$effectiveId()"
          [checked]="checked()"
          [disabled]="$effectiveDisabled()"
          (change)="onInputChange($event)"
          (blur)="onBlur()"
        />
      </span>
      @if (label()) {
        <span>{{ label() }}</span>
      } @else {
        <ng-content />
      }
    </label>
  `,
                }]
        }], propDecorators: { checked: [{ type: i0.Input, args: [{ isSignal: true, alias: "checked", required: false }] }, { type: i0.Output, args: ["checkedChange"] }], disabled: [{ type: i0.Input, args: [{ isSignal: true, alias: "disabled", required: false }] }], size: [{ type: i0.Input, args: [{ isSignal: true, alias: "size", required: false }] }], label: [{ type: i0.Input, args: [{ isSignal: true, alias: "label", required: false }] }], id: [{ type: i0.Input, args: [{ isSignal: true, alias: "id", required: false }] }] } });

/**
 * Generated bundle index. Do not edit.
 */

export { UiCheckboxComponent, UiSwitchComponent, checkboxBoxVariants, checkboxVariants, switchTrackVariants };
//# sourceMappingURL=libs-ui-checkbox.mjs.map
