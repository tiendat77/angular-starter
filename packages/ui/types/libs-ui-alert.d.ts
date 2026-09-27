import { UiColor } from '@libs/ui/core';
import * as _angular_core from '@angular/core';

/** 24×24 stroke icon paths, the same as `@libs/ui/toast`. Neutral and primary have no default icon. */
declare const UI_ALERT_ICONS: Partial<Record<UiColor, string>>;

/** Bold first line of a `ui-alert`. */
declare class UiAlertTitleDirective {
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<UiAlertTitleDirective, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<UiAlertTitleDirective, "[uiAlertTitle]", never, {}, {}, never, never, true, never>;
}
/** Replaces the default icon of a `ui-alert`. */
declare class UiAlertIconDirective {
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<UiAlertIconDirective, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<UiAlertIconDirective, "[uiAlertIcon]", never, {}, {}, never, never, true, never>;
}
/** Row of actions under the alert's message. */
declare class UiAlertActionsDirective {
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<UiAlertActionsDirective, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<UiAlertActionsDirective, "[uiAlertActions]", never, {}, {}, never, never, true, never>;
}

type UiAlertAppearance = 'soft' | 'outline' | 'dash' | 'solid';
/** `none` renders no role (a static note); omitted (`null`) picks `alert` for error/warning, else `status`. */
type UiAlertRole = 'alert' | 'status' | 'none';

/**
 * Inline message (or full-width banner). Dismissing only hides it and updates `open`; the consumer
 * decides whether to remove it.
 */
declare class UiAlertComponent {
    readonly color: _angular_core.InputSignal<UiColor>;
    readonly appearance: _angular_core.InputSignal<UiAlertAppearance>;
    readonly icon: _angular_core.InputSignalWithTransform<boolean, unknown>;
    readonly banner: _angular_core.InputSignalWithTransform<boolean, unknown>;
    readonly dismissible: _angular_core.InputSignalWithTransform<boolean, unknown>;
    readonly closeLabel: _angular_core.InputSignal<string>;
    readonly role: _angular_core.InputSignal<UiAlertRole | null>;
    readonly open: _angular_core.ModelSignal<boolean>;
    readonly closed: _angular_core.OutputEmitterRef<void>;
    protected readonly iconPath: _angular_core.Signal<string | null>;
    protected readonly effectiveRole: _angular_core.Signal<"alert" | "status" | null>;
    protected readonly hostClass: _angular_core.Signal<string>;
    close(): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<UiAlertComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<UiAlertComponent, "ui-alert", never, { "color": { "alias": "color"; "required": false; "isSignal": true; }; "appearance": { "alias": "appearance"; "required": false; "isSignal": true; }; "icon": { "alias": "icon"; "required": false; "isSignal": true; }; "banner": { "alias": "banner"; "required": false; "isSignal": true; }; "dismissible": { "alias": "dismissible"; "required": false; "isSignal": true; }; "closeLabel": { "alias": "closeLabel"; "required": false; "isSignal": true; }; "role": { "alias": "role"; "required": false; "isSignal": true; }; "open": { "alias": "open"; "required": false; "isSignal": true; }; }, { "open": "openChange"; "closed": "closed"; }, never, ["[uiAlertIcon]", "[uiAlertTitle]", "*", "[uiAlertActions]"], true, never>;
}

declare const alertVariants: (props?: {
    color?: "neutral" | "primary" | "info" | "success" | "warning" | "error" | undefined;
    appearance?: "soft" | "outline" | "dash" | "solid" | undefined;
    banner?: "true" | "false" | undefined;
} | undefined, extraClass?: string) => string;

export { UI_ALERT_ICONS, UiAlertActionsDirective, UiAlertComponent, UiAlertIconDirective, UiAlertTitleDirective, alertVariants };
export type { UiAlertAppearance, UiAlertRole };
