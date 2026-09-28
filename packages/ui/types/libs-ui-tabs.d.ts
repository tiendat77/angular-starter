import * as _angular_core from '@angular/core';
import { InjectionToken, Signal } from '@angular/core';
import * as i1 from '@angular/aria/tabs';
import { Tab } from '@angular/aria/tabs';
import { UiColor } from '@libs/ui/core';

declare class UiTabContentDirective {
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<UiTabContentDirective, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<UiTabContentDirective, "ng-template[uiTabContent]", ["uiTabContent"], {}, {}, never, never, true, [{ directive: typeof i1.TabContent; inputs: {}; outputs: {}; }]>;
}

type UiTabsVariant = 'bordered' | 'lift' | 'pill';
type UiTabsSize = 'sm' | 'md' | 'lg';
type UiTabsOrientation = 'horizontal' | 'vertical';
interface UiTabsContext {
    variant: Signal<UiTabsVariant>;
    size: Signal<UiTabsSize>;
    orientation: Signal<UiTabsOrientation>;
    color: Signal<UiColor>;
}
declare const UI_TABS_CONTEXT: InjectionToken<UiTabsContext>;
interface UiTabsConfig {
    variant?: UiTabsVariant;
    size?: UiTabsSize;
    orientation?: UiTabsOrientation;
    color?: UiColor;
    selectionMode?: 'follow' | 'explicit';
}
declare const UI_TABS_CONFIG: InjectionToken<UiTabsConfig>;

declare class UiTabListDirective {
    private readonly context;
    private readonly tabList;
    readonly orientation: _angular_core.InputSignal<UiTabsOrientation | undefined>;
    readonly softDisabled: _angular_core.InputSignal<boolean>;
    readonly effectiveOrientation: _angular_core.Signal<UiTabsOrientation>;
    readonly classes: _angular_core.Signal<string>;
    constructor();
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<UiTabListDirective, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<UiTabListDirective, "[uiTabList]", ["uiTabList"], { "orientation": { "alias": "orientation"; "required": false; "isSignal": true; }; "softDisabled": { "alias": "softDisabled"; "required": false; "isSignal": true; }; }, {}, never, never, true, [{ directive: typeof i1.TabList; inputs: { "wrap": "wrap"; "selectedTab": "selectedTab"; "selectionMode": "selectionMode"; }; outputs: { "selectedTabChange": "selectedTabChange"; }; }]>;
}

declare class UiTabPanelDirective {
    private readonly tabPanel;
    readonly visible: _angular_core.Signal<boolean>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<UiTabPanelDirective, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<UiTabPanelDirective, "[uiTabPanel]", ["uiTabPanel"], {}, {}, never, never, true, [{ directive: typeof i1.TabPanel; inputs: { "value": "value"; "id": "id"; }; outputs: {}; }]>;
}

declare class UiTabDirective {
    private readonly context;
    private readonly tabList;
    readonly tab: Tab;
    readonly uiTabColor: _angular_core.InputSignal<UiColor | undefined>;
    readonly classes: _angular_core.Signal<string>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<UiTabDirective, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<UiTabDirective, "[uiTab]", ["uiTab"], { "uiTabColor": { "alias": "uiTabColor"; "required": false; "isSignal": true; }; }, {}, never, never, true, [{ directive: typeof i1.Tab; inputs: { "value": "value"; "disabled": "disabled"; "id": "id"; }; outputs: {}; }]>;
}

declare class UiTabsDirective implements UiTabsContext {
    private readonly config;
    readonly uiTabs: _angular_core.InputSignal<"" | UiTabsVariant | undefined>;
    readonly uiTabsVariant: _angular_core.InputSignal<UiTabsVariant | undefined>;
    readonly variant: _angular_core.Signal<UiTabsVariant>;
    readonly uiTabsSize: _angular_core.InputSignal<UiTabsSize | undefined>;
    readonly size: _angular_core.Signal<UiTabsSize>;
    readonly uiTabsOrientation: _angular_core.InputSignal<UiTabsOrientation | undefined>;
    readonly orientation: _angular_core.Signal<UiTabsOrientation>;
    readonly uiTabsColor: _angular_core.InputSignal<UiColor | undefined>;
    readonly color: _angular_core.Signal<UiColor>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<UiTabsDirective, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<UiTabsDirective, "[uiTabs]", ["uiTabs"], { "uiTabs": { "alias": "uiTabs"; "required": false; "isSignal": true; }; "uiTabsVariant": { "alias": "uiTabsVariant"; "required": false; "isSignal": true; }; "uiTabsSize": { "alias": "uiTabsSize"; "required": false; "isSignal": true; }; "uiTabsOrientation": { "alias": "uiTabsOrientation"; "required": false; "isSignal": true; }; "uiTabsColor": { "alias": "uiTabsColor"; "required": false; "isSignal": true; }; }, {}, never, never, true, [{ directive: typeof i1.Tabs; inputs: {}; outputs: {}; }]>;
}

interface TabVariantProps {
    variant?: UiTabsVariant;
    size?: UiTabsSize;
    color?: UiColor;
    orientation?: UiTabsOrientation;
}
declare function tabVariants(props?: TabVariantProps, extraClass?: string): string;

export { UI_TABS_CONFIG, UI_TABS_CONTEXT, UiTabContentDirective, UiTabDirective, UiTabListDirective, UiTabPanelDirective, UiTabsDirective, tabVariants };
export type { TabVariantProps, UiTabsConfig, UiTabsContext, UiTabsOrientation, UiTabsSize, UiTabsVariant };
