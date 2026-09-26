import * as i0 from '@angular/core';
import { model, input, booleanAttribute, viewChild, signal, inject, computed, effect, forwardRef, ChangeDetectionStrategy, Component } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { cva, UI_CONFIG, cn } from '@libs/ui/core';

const checkboxVariants = cva({
    base: 'inline-flex items-center gap-2 select-none cursor-pointer group',
    variants: {
        disabled: {
            true: 'cursor-not-allowed opacity-50 pointer-events-none',
            false: '',
        },
    },
    defaultVariants: {
        disabled: 'false',
    },
});
const checkboxBoxVariants = cva({
    base: 'inline-flex items-center justify-center shrink-0 border border-border transition-colors duration-150 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary',
    variants: {
        size: {
            xs: 'h-3.5 w-3.5 rounded text-xs',
            sm: 'h-4 w-4 rounded text-xs',
            md: 'h-5 w-5 rounded-md text-sm',
            lg: 'h-6 w-6 rounded-md text-base',
            xl: 'h-7 w-7 rounded-lg text-lg',
        },
        checked: {
            true: 'bg-primary border-primary text-primary-content',
            false: 'bg-background hover:bg-muted text-transparent',
        },
    },
    defaultVariants: {
        size: 'md',
        checked: 'false',
    },
});
const switchVariants = cva({
    base: 'inline-flex items-center gap-2 select-none cursor-pointer',
    variants: {
        disabled: {
            true: 'cursor-not-allowed opacity-50 pointer-events-none',
            false: '',
        },
    },
    defaultVariants: {
        disabled: 'false',
    },
});
const switchTrackVariants = cva({
    base: 'inline-flex shrink-0 items-center rounded-full p-0.5 border border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
    variants: {
        size: {
            xs: 'h-4 w-7',
            sm: 'h-5 w-9',
            md: 'h-6 w-11',
            lg: 'h-7 w-14',
            xl: 'h-8 w-16',
        },
        checked: {
            true: 'bg-primary border-primary',
            false: 'bg-muted border-border',
        },
    },
    defaultVariants: {
        size: 'md',
        checked: 'false',
    },
});
const switchThumbVariants = cva({
    base: 'pointer-events-none block rounded-full bg-background shadow-xs transition-transform duration-200 ease-in-out',
    variants: {
        size: {
            xs: 'h-3 w-3',
            sm: 'h-4 w-4',
            md: 'h-5 w-5',
            lg: 'h-6 w-6',
            xl: 'h-7 w-7',
        },
        checked: {
            true: '',
            false: 'translate-x-0',
        },
    },
    defaultVariants: {
        size: 'md',
        checked: 'false',
    },
});
const switchThumbTranslateMap = {
    xs: 'translate-x-3',
    sm: 'translate-x-4',
    md: 'translate-x-5',
    lg: 'translate-x-7',
    xl: 'translate-x-8',
};

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
        disabled: this.$effectiveDisabled() ? 'true' : 'false',
    }), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "$rootClass" }] : /* istanbul ignore next */ []));
    $boxClass = computed(() => checkboxBoxVariants({
        size: this.$effectiveSize(),
        checked: this.checked() || this.indeterminate() ? 'true' : 'false',
    }), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "$boxClass" }] : /* istanbul ignore next */ []));
    $labelClass = computed(() => cn('text-foreground', this.$effectiveSize() === 'xs' && 'text-xs', this.$effectiveSize() === 'sm' && 'text-xs', this.$effectiveSize() === 'md' && 'text-sm', this.$effectiveSize() === 'lg' && 'text-base', this.$effectiveSize() === 'xl' && 'text-lg'), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "$labelClass" }] : /* istanbul ignore next */ []));
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
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "22.0.5", type: UiCheckboxComponent, isStandalone: true, selector: "ui-checkbox", inputs: { checked: { classPropertyName: "checked", publicName: "checked", isSignal: true, isRequired: false, transformFunction: null }, indeterminate: { classPropertyName: "indeterminate", publicName: "indeterminate", isSignal: true, isRequired: false, transformFunction: null }, disabled: { classPropertyName: "disabled", publicName: "disabled", isSignal: true, isRequired: false, transformFunction: null }, size: { classPropertyName: "size", publicName: "size", isSignal: true, isRequired: false, transformFunction: null }, label: { classPropertyName: "label", publicName: "label", isSignal: true, isRequired: false, transformFunction: null }, id: { classPropertyName: "id", publicName: "id", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { checked: "checkedChange" }, providers: [
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
      <input
        #inputRef
        type="checkbox"
        class="peer sr-only"
        [id]="$effectiveId()"
        [checked]="checked()"
        [disabled]="$effectiveDisabled()"
        (change)="onInputChange($event)"
        (blur)="onBlur()"
      />
      <span
        [class]="$boxClass()"
        aria-hidden="true"
      >
        @if (indeterminate()) {
          <svg
            class="h-3/4 w-3/4 stroke-current stroke-3"
            viewBox="0 0 24 24"
            fill="none"
          >
            <line
              x1="5"
              y1="12"
              x2="19"
              y2="12"
            />
          </svg>
        } @else if (checked()) {
          <svg
            class="h-3/4 w-3/4 stroke-current stroke-3"
            viewBox="0 0 24 24"
            fill="none"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        }
      </span>
      @if (label()) {
        <span [class]="$labelClass()">{{ label() }}</span>
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
      <input
        #inputRef
        type="checkbox"
        class="peer sr-only"
        [id]="$effectiveId()"
        [checked]="checked()"
        [disabled]="$effectiveDisabled()"
        (change)="onInputChange($event)"
        (blur)="onBlur()"
      />
      <span
        [class]="$boxClass()"
        aria-hidden="true"
      >
        @if (indeterminate()) {
          <svg
            class="h-3/4 w-3/4 stroke-current stroke-3"
            viewBox="0 0 24 24"
            fill="none"
          >
            <line
              x1="5"
              y1="12"
              x2="19"
              y2="12"
            />
          </svg>
        } @else if (checked()) {
          <svg
            class="h-3/4 w-3/4 stroke-current stroke-3"
            viewBox="0 0 24 24"
            fill="none"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        }
      </span>
      @if (label()) {
        <span [class]="$labelClass()">{{ label() }}</span>
      } @else {
        <ng-content />
      }
    </label>
  `,
                }]
        }], ctorParameters: () => [], propDecorators: { checked: [{ type: i0.Input, args: [{ isSignal: true, alias: "checked", required: false }] }, { type: i0.Output, args: ["checkedChange"] }], indeterminate: [{ type: i0.Input, args: [{ isSignal: true, alias: "indeterminate", required: false }] }], disabled: [{ type: i0.Input, args: [{ isSignal: true, alias: "disabled", required: false }] }], size: [{ type: i0.Input, args: [{ isSignal: true, alias: "size", required: false }] }], label: [{ type: i0.Input, args: [{ isSignal: true, alias: "label", required: false }] }], id: [{ type: i0.Input, args: [{ isSignal: true, alias: "id", required: false }] }], _inputRef: [{ type: i0.ViewChild, args: ['inputRef', { isSignal: true }] }] } });

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
    $rootClass = computed(() => switchVariants({
        disabled: this.$effectiveDisabled() ? 'true' : 'false',
    }), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "$rootClass" }] : /* istanbul ignore next */ []));
    $trackClass = computed(() => switchTrackVariants({
        size: this.$effectiveSize(),
        checked: this.checked() ? 'true' : 'false',
    }), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "$trackClass" }] : /* istanbul ignore next */ []));
    $thumbClass = computed(() => cn(switchThumbVariants({
        size: this.$effectiveSize(),
        checked: this.checked() ? 'true' : 'false',
    }), this.checked() && switchThumbTranslateMap[this.$effectiveSize()]), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "$thumbClass" }] : /* istanbul ignore next */ []));
    $labelClass = computed(() => cn('cursor-pointer text-foreground select-none', this.$effectiveSize() === 'xs' && 'text-xs', this.$effectiveSize() === 'sm' && 'text-xs', this.$effectiveSize() === 'md' && 'text-sm', this.$effectiveSize() === 'lg' && 'text-base', this.$effectiveSize() === 'xl' && 'text-lg'), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "$labelClass" }] : /* istanbul ignore next */ []));
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
    onBlur() {
        this._onTouched();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiSwitchComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "22.0.5", type: UiSwitchComponent, isStandalone: true, selector: "ui-switch", inputs: { checked: { classPropertyName: "checked", publicName: "checked", isSignal: true, isRequired: false, transformFunction: null }, disabled: { classPropertyName: "disabled", publicName: "disabled", isSignal: true, isRequired: false, transformFunction: null }, size: { classPropertyName: "size", publicName: "size", isSignal: true, isRequired: false, transformFunction: null }, label: { classPropertyName: "label", publicName: "label", isSignal: true, isRequired: false, transformFunction: null }, id: { classPropertyName: "id", publicName: "id", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { checked: "checkedChange" }, providers: [
            {
                provide: NG_VALUE_ACCESSOR,
                useExisting: forwardRef(() => UiSwitchComponent),
                multi: true,
            },
        ], ngImport: i0, template: `
    <div [class]="$rootClass()">
      <button
        type="button"
        role="switch"
        [id]="$effectiveId()"
        [attr.aria-checked]="checked() ? 'true' : 'false'"
        [attr.aria-disabled]="$effectiveDisabled() ? 'true' : null"
        [disabled]="$effectiveDisabled()"
        [class]="$trackClass()"
        (click)="toggle()"
        (blur)="onBlur()"
      >
        <span
          [class]="$thumbClass()"
          aria-hidden="true"
        ></span>
      </button>
      @if (label()) {
        <label
          [attr.for]="$effectiveId()"
          [class]="$labelClass()"
        >
          {{ label() }}
        </label>
      } @else {
        <ng-content />
      }
    </div>
  `, isInline: true, changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiSwitchComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'ui-switch',
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    providers: [
                        {
                            provide: NG_VALUE_ACCESSOR,
                            useExisting: forwardRef(() => UiSwitchComponent),
                            multi: true,
                        },
                    ],
                    template: `
    <div [class]="$rootClass()">
      <button
        type="button"
        role="switch"
        [id]="$effectiveId()"
        [attr.aria-checked]="checked() ? 'true' : 'false'"
        [attr.aria-disabled]="$effectiveDisabled() ? 'true' : null"
        [disabled]="$effectiveDisabled()"
        [class]="$trackClass()"
        (click)="toggle()"
        (blur)="onBlur()"
      >
        <span
          [class]="$thumbClass()"
          aria-hidden="true"
        ></span>
      </button>
      @if (label()) {
        <label
          [attr.for]="$effectiveId()"
          [class]="$labelClass()"
        >
          {{ label() }}
        </label>
      } @else {
        <ng-content />
      }
    </div>
  `,
                }]
        }], propDecorators: { checked: [{ type: i0.Input, args: [{ isSignal: true, alias: "checked", required: false }] }, { type: i0.Output, args: ["checkedChange"] }], disabled: [{ type: i0.Input, args: [{ isSignal: true, alias: "disabled", required: false }] }], size: [{ type: i0.Input, args: [{ isSignal: true, alias: "size", required: false }] }], label: [{ type: i0.Input, args: [{ isSignal: true, alias: "label", required: false }] }], id: [{ type: i0.Input, args: [{ isSignal: true, alias: "id", required: false }] }] } });

/**
 * Generated bundle index. Do not edit.
 */

export { UiCheckboxComponent, UiSwitchComponent, checkboxBoxVariants, checkboxVariants, switchThumbTranslateMap, switchThumbVariants, switchTrackVariants, switchVariants };
//# sourceMappingURL=libs-ui-checkbox.mjs.map
