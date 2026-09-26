import * as _angular_core from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { UiSize } from '@libs/ui/core';

declare const radioCircleVariants: (props?: {
    size?: "xs" | "sm" | "md" | "lg" | "xl" | undefined;
    checked?: "true" | "false" | undefined;
} | undefined, extraClass?: string) => string;
declare const radioDotVariants: (props?: {
    size?: "xs" | "sm" | "md" | "lg" | "xl" | undefined;
} | undefined, extraClass?: string) => string;
declare class UiRadioComponent {
    readonly value: _angular_core.InputSignal<any>;
    readonly disabled: _angular_core.InputSignalWithTransform<boolean, unknown>;
    readonly label: _angular_core.InputSignal<string | undefined>;
    private readonly _group;
    private readonly _elementRef;
    readonly isChecked: _angular_core.Signal<boolean>;
    readonly isDisabled: _angular_core.Signal<boolean>;
    readonly effectiveSize: _angular_core.Signal<UiSize>;
    readonly tabIndex: _angular_core.Signal<-1 | 0>;
    protected readonly $hostClass: _angular_core.Signal<string>;
    protected readonly $circleClass: _angular_core.Signal<string>;
    protected readonly $dotClass: _angular_core.Signal<string>;
    protected readonly $labelClass: _angular_core.Signal<string>;
    select(): void;
    focus(): void;
    protected onKeyDown(event: KeyboardEvent): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<UiRadioComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<UiRadioComponent, "ui-radio", never, { "value": { "alias": "value"; "required": true; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "label": { "alias": "label"; "required": false; "isSignal": true; }; }, {}, never, ["*"], true, never>;
}

declare class UiRadioGroupComponent implements ControlValueAccessor {
    readonly value: _angular_core.ModelSignal<any>;
    readonly name: _angular_core.InputSignal<string>;
    readonly disabled: _angular_core.InputSignalWithTransform<boolean, unknown>;
    readonly size: _angular_core.InputSignal<UiSize>;
    private readonly _cvaDisabled$;
    private readonly _uiConfig;
    protected readonly radios: _angular_core.Signal<readonly any[]>;
    private _onChange;
    private _onTouched;
    readonly effectiveDisabled: _angular_core.Signal<boolean>;
    readonly effectiveSize: _angular_core.Signal<UiSize>;
    protected readonly hostClass: _angular_core.Signal<string>;
    writeValue(value: any): void;
    registerOnChange(fn: (value: any) => void): void;
    registerOnTouched(fn: () => void): void;
    setDisabledState(isDisabled: boolean): void;
    selectValue(val: any): void;
    selectNext(current: UiRadioComponent): void;
    selectPrevious(current: UiRadioComponent): void;
    isFirstEnabledRadio(radio: UiRadioComponent): boolean;
    hasCheckedRadio(): boolean;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<UiRadioGroupComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<UiRadioGroupComponent, "ui-radio-group", never, { "value": { "alias": "value"; "required": false; "isSignal": true; }; "name": { "alias": "name"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "size": { "alias": "size"; "required": false; "isSignal": true; }; }, { "value": "valueChange"; }, ["radios"], ["*"], true, never>;
}

export { UiRadioComponent, UiRadioGroupComponent, radioCircleVariants, radioDotVariants };
