import * as i1 from '@angular/aria/tabs';
import { TabContent, TabList, TabPanel, Tab, Tabs } from '@angular/aria/tabs';
import * as i0 from '@angular/core';
import { Directive, InjectionToken, inject, input, computed } from '@angular/core';
import { cva } from '@libs/ui/core';

class UiTabContentDirective {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiTabContentDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "22.0.5", type: UiTabContentDirective, isStandalone: true, selector: "ng-template[uiTabContent]", exportAs: ["uiTabContent"], hostDirectives: [{ directive: i1.TabContent }], ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiTabContentDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: 'ng-template[uiTabContent]',
                    exportAs: 'uiTabContent',
                    standalone: true,
                    hostDirectives: [TabContent],
                }]
        }] });

const UI_TABS_CONTEXT = new InjectionToken('UI_TABS_CONTEXT');
const UI_TABS_CONFIG = new InjectionToken('UI_TABS_CONFIG');

class UiTabListDirective {
    context = inject(UI_TABS_CONTEXT, { optional: true });
    tabList = inject(TabList);
    orientation = input(undefined, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "orientation" }] : /* istanbul ignore next */ []));
    softDisabled = input(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "softDisabled" }] : /* istanbul ignore next */ []));
    effectiveOrientation = computed(() => {
        return this.orientation() ?? this.context?.orientation() ?? 'horizontal';
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "effectiveOrientation" }] : /* istanbul ignore next */ []));
    classes = computed(() => {
        const v = this.context?.variant() ?? 'bordered';
        const s = this.context?.size() ?? 'md';
        const o = this.effectiveOrientation();
        return `tabs tabs-${v} tabs-${s} tabs-${o}`;
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "classes" }] : /* istanbul ignore next */ []));
    constructor() {
        // Bridge context and library defaults into @angular/aria/tabs internals:
        // 1. By default, softDisabled in @angular/aria/tabs is true (roving tabindex lands on disabled tabs).
        //    We default softDisabled to false so disabled tabs are properly skipped during keyboard arrow navigation.
        // 2. TabList initializes its pattern once at property instantiation; dynamically updating orientation
        //    and softDisabled signals ensures vertical arrow keys (ArrowUp/Down) and skip logic function seamlessly.
        const tabListAny = this.tabList;
        tabListAny.orientation = this.effectiveOrientation;
        tabListAny.softDisabled = this.softDisabled;
        const pattern = tabListAny._pattern;
        if (pattern) {
            pattern.orientation = this.effectiveOrientation;
            if (pattern.inputs) {
                pattern.inputs.orientation = this.effectiveOrientation;
                pattern.inputs.softDisabled = this.softDisabled;
            }
            if (pattern.focusBehavior?.inputs) {
                pattern.focusBehavior.inputs.softDisabled = this.softDisabled;
            }
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiTabListDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "17.1.0", version: "22.0.5", type: UiTabListDirective, isStandalone: true, selector: "[uiTabList]", inputs: { orientation: { classPropertyName: "orientation", publicName: "orientation", isSignal: true, isRequired: false, transformFunction: null }, softDisabled: { classPropertyName: "softDisabled", publicName: "softDisabled", isSignal: true, isRequired: false, transformFunction: null } }, host: { properties: { "class": "classes()" } }, exportAs: ["uiTabList"], hostDirectives: [{ directive: i1.TabList, inputs: ["wrap", "wrap", "selectedTab", "selectedTab", "selectionMode", "selectionMode"], outputs: ["selectedTabChange", "selectedTabChange"] }], ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiTabListDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[uiTabList]',
                    exportAs: 'uiTabList',
                    standalone: true,
                    hostDirectives: [
                        {
                            directive: TabList,
                            inputs: ['wrap', 'selectedTab', 'selectionMode'],
                            outputs: ['selectedTabChange'],
                        },
                    ],
                    host: {
                        '[class]': 'classes()',
                    },
                }]
        }], ctorParameters: () => [], propDecorators: { orientation: [{ type: i0.Input, args: [{ isSignal: true, alias: "orientation", required: false }] }], softDisabled: [{ type: i0.Input, args: [{ isSignal: true, alias: "softDisabled", required: false }] }] } });

class UiTabPanelDirective {
    tabPanel = inject(TabPanel);
    visible = this.tabPanel.visible;
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiTabPanelDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "22.0.5", type: UiTabPanelDirective, isStandalone: true, selector: "[uiTabPanel]", host: { properties: { "hidden": "!visible()" }, classAttribute: "tab-panel" }, exportAs: ["uiTabPanel"], hostDirectives: [{ directive: i1.TabPanel, inputs: ["value", "value", "id", "id"] }], ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiTabPanelDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[uiTabPanel]',
                    exportAs: 'uiTabPanel',
                    standalone: true,
                    hostDirectives: [
                        {
                            directive: TabPanel,
                            inputs: ['value', 'id'],
                        },
                    ],
                    host: {
                        class: 'tab-panel',
                        '[hidden]': '!visible()',
                    },
                }]
        }] });

const _tabVariants = cva({
    base: 'tab',
    variants: {
        variant: {
            bordered: 'tab-bordered-item',
            lift: 'tab-lift-item',
            pill: 'tab-pill-item',
        },
        size: {
            sm: 'tab-sm',
            md: 'tab-md',
            lg: 'tab-lg',
        },
        color: {
            primary: 'tab-color-primary',
            neutral: 'tab-color-neutral',
            secondary: 'tab-color-secondary',
            info: 'tab-color-info',
            success: 'tab-color-success',
            warning: 'tab-color-warning',
            error: 'tab-color-error',
        },
        orientation: {
            horizontal: 'tab-horizontal',
            vertical: 'tab-vertical',
        },
    },
    defaultVariants: {
        variant: 'bordered',
        size: 'md',
        color: 'primary',
        orientation: 'horizontal',
    },
});
function tabVariants(props, extraClass) {
    return _tabVariants({
        variant: props?.variant,
        size: props?.size,
        color: props?.color,
        orientation: props?.orientation,
    }, extraClass);
}

class UiTabDirective {
    context = inject(UI_TABS_CONTEXT, { optional: true });
    tabList = inject(UiTabListDirective, { optional: true });
    tab = inject(Tab);
    uiTabColor = input(undefined, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "uiTabColor" }] : /* istanbul ignore next */ []));
    classes = computed(() => {
        return tabVariants({
            variant: this.context?.variant() ?? 'bordered',
            size: this.context?.size() ?? 'md',
            color: this.uiTabColor() ?? this.context?.color() ?? 'primary',
            orientation: this.tabList?.effectiveOrientation() ?? this.context?.orientation() ?? 'horizontal',
        });
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "classes" }] : /* istanbul ignore next */ []));
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiTabDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "17.1.0", version: "22.0.5", type: UiTabDirective, isStandalone: true, selector: "[uiTab]", inputs: { uiTabColor: { classPropertyName: "uiTabColor", publicName: "uiTabColor", isSignal: true, isRequired: false, transformFunction: null } }, host: { properties: { "class": "classes()" } }, exportAs: ["uiTab"], hostDirectives: [{ directive: i1.Tab, inputs: ["value", "value", "disabled", "disabled", "id", "id"] }], ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiTabDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[uiTab]',
                    exportAs: 'uiTab',
                    standalone: true,
                    hostDirectives: [
                        {
                            directive: Tab,
                            inputs: ['value', 'disabled', 'id'],
                        },
                    ],
                    host: {
                        '[class]': 'classes()',
                    },
                }]
        }], propDecorators: { uiTabColor: [{ type: i0.Input, args: [{ isSignal: true, alias: "uiTabColor", required: false }] }] } });

class UiTabsDirective {
    config = inject(UI_TABS_CONFIG, { optional: true });
    uiTabs = input(undefined, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "uiTabs" }] : /* istanbul ignore next */ []));
    uiTabsVariant = input(undefined, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "uiTabsVariant" }] : /* istanbul ignore next */ []));
    variant = computed(() => {
        const shorthand = this.uiTabs();
        if (shorthand) {
            return shorthand;
        }
        return this.uiTabsVariant() ?? this.config?.variant ?? 'bordered';
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "variant" }] : /* istanbul ignore next */ []));
    uiTabsSize = input(undefined, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "uiTabsSize" }] : /* istanbul ignore next */ []));
    size = computed(() => {
        return this.uiTabsSize() ?? this.config?.size ?? 'md';
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "size" }] : /* istanbul ignore next */ []));
    uiTabsOrientation = input(undefined, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "uiTabsOrientation" }] : /* istanbul ignore next */ []));
    orientation = computed(() => {
        return this.uiTabsOrientation() ?? this.config?.orientation ?? 'horizontal';
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "orientation" }] : /* istanbul ignore next */ []));
    uiTabsColor = input(undefined, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "uiTabsColor" }] : /* istanbul ignore next */ []));
    color = computed(() => {
        return this.uiTabsColor() ?? this.config?.color ?? 'primary';
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "color" }] : /* istanbul ignore next */ []));
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiTabsDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "17.1.0", version: "22.0.5", type: UiTabsDirective, isStandalone: true, selector: "[uiTabs]", inputs: { uiTabs: { classPropertyName: "uiTabs", publicName: "uiTabs", isSignal: true, isRequired: false, transformFunction: null }, uiTabsVariant: { classPropertyName: "uiTabsVariant", publicName: "uiTabsVariant", isSignal: true, isRequired: false, transformFunction: null }, uiTabsSize: { classPropertyName: "uiTabsSize", publicName: "uiTabsSize", isSignal: true, isRequired: false, transformFunction: null }, uiTabsOrientation: { classPropertyName: "uiTabsOrientation", publicName: "uiTabsOrientation", isSignal: true, isRequired: false, transformFunction: null }, uiTabsColor: { classPropertyName: "uiTabsColor", publicName: "uiTabsColor", isSignal: true, isRequired: false, transformFunction: null } }, providers: [
            {
                provide: UI_TABS_CONTEXT,
                useExisting: UiTabsDirective,
            },
        ], exportAs: ["uiTabs"], hostDirectives: [{ directive: i1.Tabs }], ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiTabsDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[uiTabs]',
                    exportAs: 'uiTabs',
                    standalone: true,
                    hostDirectives: [Tabs],
                    providers: [
                        {
                            provide: UI_TABS_CONTEXT,
                            useExisting: UiTabsDirective,
                        },
                    ],
                }]
        }], propDecorators: { uiTabs: [{ type: i0.Input, args: [{ isSignal: true, alias: "uiTabs", required: false }] }], uiTabsVariant: [{ type: i0.Input, args: [{ isSignal: true, alias: "uiTabsVariant", required: false }] }], uiTabsSize: [{ type: i0.Input, args: [{ isSignal: true, alias: "uiTabsSize", required: false }] }], uiTabsOrientation: [{ type: i0.Input, args: [{ isSignal: true, alias: "uiTabsOrientation", required: false }] }], uiTabsColor: [{ type: i0.Input, args: [{ isSignal: true, alias: "uiTabsColor", required: false }] }] } });

/**
 * Generated bundle index. Do not edit.
 */

export { UI_TABS_CONFIG, UI_TABS_CONTEXT, UiTabContentDirective, UiTabDirective, UiTabListDirective, UiTabPanelDirective, UiTabsDirective, tabVariants };
//# sourceMappingURL=libs-ui-tabs.mjs.map
