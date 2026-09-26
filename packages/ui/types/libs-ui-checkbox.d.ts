import * as _angular_core from '@angular/core';
import { ElementRef } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { UiSize } from '@libs/ui/core';

declare class UiCheckboxComponent implements ControlValueAccessor {
    readonly checked: _angular_core.ModelSignal<boolean>;
    readonly indeterminate: _angular_core.InputSignalWithTransform<boolean, unknown>;
    readonly disabled: _angular_core.InputSignalWithTransform<boolean, unknown>;
    readonly size: _angular_core.InputSignal<UiSize>;
    readonly label: _angular_core.InputSignal<string | undefined>;
    readonly id: _angular_core.InputSignal<string | undefined>;
    protected readonly _inputRef: _angular_core.Signal<ElementRef<HTMLInputElement> | undefined>;
    private readonly _autoId;
    private readonly _cvaDisabled$;
    private readonly _uiConfig;
    private _onChange;
    private _onTouched;
    protected readonly $effectiveDisabled: _angular_core.Signal<boolean>;
    protected readonly $effectiveId: _angular_core.Signal<string>;
    protected readonly $effectiveSize: _angular_core.Signal<UiSize>;
    protected readonly $rootClass: _angular_core.Signal<string>;
    protected readonly $boxClass: _angular_core.Signal<string>;
    constructor();
    writeValue(value: boolean): void;
    registerOnChange(fn: (value: boolean) => void): void;
    registerOnTouched(fn: () => void): void;
    setDisabledState(isDisabled: boolean): void;
    protected onInputChange(event: Event): void;
    protected onBlur(): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<UiCheckboxComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<UiCheckboxComponent, "ui-checkbox", never, { "checked": { "alias": "checked"; "required": false; "isSignal": true; }; "indeterminate": { "alias": "indeterminate"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "size": { "alias": "size"; "required": false; "isSignal": true; }; "label": { "alias": "label"; "required": false; "isSignal": true; }; "id": { "alias": "id"; "required": false; "isSignal": true; }; }, { "checked": "checkedChange"; }, never, ["*"], true, never>;
}

/** Root `<label>` shared by checkbox and switch: layout, label typography and disabled state. */
declare const checkboxVariants: (props?: {
    size?: "xs" | "sm" | "md" | "lg" | "xl" | undefined;
    disabled?: "true" | "false" | undefined;
} | undefined, extraClass?: string) => string;
/** Maps inputs onto the `checkbox` CSS utilities (`@libs/ui/styles`). */
declare const checkboxBoxVariants: (props?: {
    size?: "xs" | "sm" | "md" | "lg" | "xl" | undefined;
} | undefined, extraClass?: string) => string;
/** Maps inputs onto the `toggle` CSS utilities (`@libs/ui/styles`). */
declare const switchTrackVariants: (props?: {
    size?: "xs" | "sm" | "md" | "lg" | "xl" | undefined;
} | undefined, extraClass?: string) => string;

declare class UiSwitchComponent implements ControlValueAccessor {
    readonly checked: _angular_core.ModelSignal<boolean>;
    readonly disabled: _angular_core.InputSignalWithTransform<boolean, unknown>;
    readonly size: _angular_core.InputSignal<UiSize>;
    readonly label: _angular_core.InputSignal<string | undefined>;
    readonly id: _angular_core.InputSignal<string | undefined>;
    private readonly _autoId;
    private readonly _cvaDisabled$;
    private readonly _uiConfig;
    private _onChange;
    private _onTouched;
    protected readonly $effectiveDisabled: _angular_core.Signal<boolean>;
    protected readonly $effectiveId: _angular_core.Signal<string>;
    protected readonly $effectiveSize: _angular_core.Signal<UiSize>;
    protected readonly $rootClass: _angular_core.Signal<string>;
    protected readonly $trackClass: _angular_core.Signal<string>;
    writeValue(value: boolean): void;
    registerOnChange(fn: (value: boolean) => void): void;
    registerOnTouched(fn: () => void): void;
    setDisabledState(isDisabled: boolean): void;
    toggle(): void;
    protected onInputChange(event: Event): void;
    protected onBlur(): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<UiSwitchComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<UiSwitchComponent, "ui-switch", never, { "checked": { "alias": "checked"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "size": { "alias": "size"; "required": false; "isSignal": true; }; "label": { "alias": "label"; "required": false; "isSignal": true; }; "id": { "alias": "id"; "required": false; "isSignal": true; }; }, { "checked": "checkedChange"; }, never, ["*"], true, never>;
}

export { UiCheckboxComponent, UiSwitchComponent, checkboxBoxVariants, checkboxVariants, switchTrackVariants };
