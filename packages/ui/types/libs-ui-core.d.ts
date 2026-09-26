import { InjectionToken, Provider, Signal } from '@angular/core';

type UiSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface UiConfig {
    defaultSize?: UiSize;
    button?: {
        defaultVariant?: string;
        defaultSize?: UiSize;
    };
    formField?: {
        appearance?: 'outline' | 'filled';
    };
}

declare const UI_CONFIG: InjectionToken<UiConfig>;
declare function provideUiConfig(config: UiConfig): Provider;

declare abstract class UiFormFieldControl<T> {
    abstract readonly $value: Signal<T | null>;
    abstract readonly $disabled: Signal<boolean>;
    abstract readonly $focused: Signal<boolean>;
    abstract readonly $invalid: Signal<boolean>;
    abstract readonly id: string;
    /**
     * Element that receives `aria-describedby` / `aria-invalid` from `ui-form-field`.
     * Omit it when that element is the control's host (e.g. `input[uiInput]`).
     */
    readonly ariaTarget?: Signal<HTMLElement | undefined>;
    /**
     * When implemented, `ui-form-field` hands its hint/error ids to the control instead of writing
     * `aria-describedby` itself, so the control can merge them with ids of its own.
     */
    setDescribedByIds?(ids: string[]): void;
}

type UiVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';

declare function cn(...inputs: (string | undefined | null | false)[]): string;

interface CvaConfig<T extends Record<string, Record<string, string>>> {
    base?: string;
    variants?: T;
    defaultVariants?: {
        [K in keyof T]?: keyof T[K];
    };
}
declare function cva<T extends Record<string, Record<string, string>>>(config: CvaConfig<T>): (props?: { [K in keyof T]?: keyof T[K]; }, extraClass?: string) => string;

export { UI_CONFIG, UiFormFieldControl, cn, cva, provideUiConfig };
export type { CvaConfig, UiConfig, UiSize, UiVariant };
