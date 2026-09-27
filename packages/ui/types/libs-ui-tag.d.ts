import * as _angular_core from '@angular/core';
import { OnInit } from '@angular/core';
import { UiColor } from '@libs/ui/core';

/** Leading icon or avatar of a `ui-tag`, sized to the tag's text. */
declare class UiTagIconDirective {
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<UiTagIconDirective, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<UiTagIconDirective, "[uiTagIcon]", never, {}, {}, never, never, true, never>;
}

type UiTagAppearance = 'soft' | 'outline' | 'solid';
type UiTagSize = 'sm' | 'md' | 'lg';

/**
 * Text label chip. `removable` adds a × button that emits `(removed)` (the consumer removes the tag).
 * `checkable` turns the whole tag into a toggle button bound to `checked`. The two are exclusive.
 */
declare class UiTagComponent implements OnInit {
    readonly color: _angular_core.InputSignal<UiColor>;
    readonly appearance: _angular_core.InputSignal<UiTagAppearance>;
    readonly size: _angular_core.InputSignal<UiTagSize>;
    readonly removable: _angular_core.InputSignalWithTransform<boolean, unknown>;
    readonly removeLabel: _angular_core.InputSignal<string>;
    readonly checkable: _angular_core.InputSignalWithTransform<boolean, unknown>;
    readonly checked: _angular_core.ModelSignal<boolean>;
    readonly disabled: _angular_core.InputSignalWithTransform<boolean, unknown>;
    readonly removed: _angular_core.OutputEmitterRef<void>;
    private readonly _id;
    protected readonly labelId: string;
    protected readonly removeTextId: string;
    protected readonly hostClass: _angular_core.Signal<string>;
    ngOnInit(): void;
    protected toggle(): void;
    protected onToggleKey(event: Event): void;
    protected remove(event: Event): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<UiTagComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<UiTagComponent, "ui-tag", never, { "color": { "alias": "color"; "required": false; "isSignal": true; }; "appearance": { "alias": "appearance"; "required": false; "isSignal": true; }; "size": { "alias": "size"; "required": false; "isSignal": true; }; "removable": { "alias": "removable"; "required": false; "isSignal": true; }; "removeLabel": { "alias": "removeLabel"; "required": false; "isSignal": true; }; "checkable": { "alias": "checkable"; "required": false; "isSignal": true; }; "checked": { "alias": "checked"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; }, { "checked": "checkedChange"; "removed": "removed"; }, never, ["[uiTagIcon]", "*"], true, never>;
}

declare const tagVariants: (props?: {
    color?: "neutral" | "primary" | "info" | "success" | "warning" | "error" | undefined;
    appearance?: "soft" | "outline" | "solid" | undefined;
    size?: "sm" | "md" | "lg" | undefined;
    checkable?: "true" | "false" | undefined;
    disabled?: "true" | "false" | undefined;
} | undefined, extraClass?: string) => string;

export { UiTagComponent, UiTagIconDirective, tagVariants };
export type { UiTagAppearance, UiTagSize };
