import * as i0 from '@angular/core';
import { Directive, InjectionToken, inject, ElementRef, input, booleanAttribute, output, computed, ViewContainerRef, signal, Injector, contentChildren, afterNextRender, forwardRef } from '@angular/core';
import { cva, cn } from '@libs/ui/core';
import { Overlay } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { merge } from 'rxjs';
import { filter } from 'rxjs/operators';

class UiMenuDividerDirective {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiMenuDividerDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "22.0.5", type: UiMenuDividerDirective, isStandalone: true, selector: "[uiMenuDivider]", host: { attributes: { "role": "separator" }, classAttribute: "my-1 border-t border-gray-200 dark:border-gray-800" }, exportAs: ["uiMenuDivider"], ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiMenuDividerDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[uiMenuDivider]',
                    exportAs: 'uiMenuDivider',
                    standalone: true,
                    host: {
                        role: 'separator',
                        class: 'my-1 border-t border-gray-200 dark:border-gray-800',
                    },
                }]
        }] });

const UI_MENU_CONTEXT = new InjectionToken('UI_MENU_CONTEXT');
const UI_MENU_CONFIG = new InjectionToken('UI_MENU_CONFIG');
const UI_MENU_TRIGGER = new InjectionToken('UI_MENU_TRIGGER');

const _menuItemVariants = cva({
    base: 'flex w-full items-center justify-between gap-3 text-left select-none transition-colors outline-none cursor-pointer',
    variants: {
        size: {
            sm: 'px-2.5 py-1 text-xs rounded-md',
            md: 'px-3 py-1.5 text-sm rounded-lg',
            lg: 'px-3.5 py-2 text-base rounded-lg',
        },
        danger: {
            false: 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 focus-visible:bg-gray-100 dark:focus-visible:bg-gray-800',
            true: 'text-error hover:bg-error/10 focus-visible:bg-error/10',
        },
        disabled: {
            true: 'opacity-50 pointer-events-none cursor-not-allowed',
            false: '',
        },
    },
    defaultVariants: {
        size: 'md',
        danger: 'false',
        disabled: 'false',
    },
});
function menuItemVariants(props, extraClass) {
    return _menuItemVariants({
        size: props?.size,
        danger: props?.danger ? 'true' : 'false',
        disabled: props?.disabled ? 'true' : 'false',
    }, extraClass);
}

class UiMenuItemDirective {
    context = inject(UI_MENU_CONTEXT, { optional: true });
    elementRef = inject(ElementRef);
    value = input(undefined, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "value" }] : /* istanbul ignore next */ []));
    danger = input(false, { ...(ngDevMode ? { debugName: "danger" } : /* istanbul ignore next */ {}), transform: booleanAttribute });
    disabled = input(false, { ...(ngDevMode ? { debugName: "disabled" } : /* istanbul ignore next */ {}), transform: booleanAttribute });
    triggered = output();
    isActive = computed(() => this.context?.activeItem() === this, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "isActive" }] : /* istanbul ignore next */ []));
    tabIndex = computed(() => (this.isActive() ? 0 : -1), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "tabIndex" }] : /* istanbul ignore next */ []));
    classes = computed(() => {
        return menuItemVariants({
            size: this.context?.size() ?? 'md',
            danger: this.danger(),
            disabled: this.disabled(),
        });
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "classes" }] : /* istanbul ignore next */ []));
    focus() {
        this.elementRef.nativeElement.focus();
        this.context?.setActiveItem(this);
    }
    isFocused() {
        return document.activeElement === this.elementRef.nativeElement;
    }
    handleFocusIn() {
        if (!this.disabled()) {
            this.context?.setActiveItem(this);
        }
    }
    handleClick(event) {
        if (this.disabled()) {
            event.preventDefault();
            event.stopImmediatePropagation();
            return;
        }
        this.triggered.emit(this.value());
        this.context?.selectItem(this.value());
        this.context?.close();
    }
    handleKeydown(event) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            if (!this.disabled()) {
                this.elementRef.nativeElement.click();
            }
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiMenuItemDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "17.1.0", version: "22.0.5", type: UiMenuItemDirective, isStandalone: true, selector: "[uiMenuItem]", inputs: { value: { classPropertyName: "value", publicName: "value", isSignal: true, isRequired: false, transformFunction: null }, danger: { classPropertyName: "danger", publicName: "danger", isSignal: true, isRequired: false, transformFunction: null }, disabled: { classPropertyName: "disabled", publicName: "disabled", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { triggered: "triggered" }, host: { attributes: { "role": "menuitem" }, listeners: { "click": "handleClick($event)", "keydown": "handleKeydown($event)", "focusin": "handleFocusIn()" }, properties: { "attr.tabindex": "tabIndex()", "class": "classes()", "attr.aria-disabled": "disabled() ? \"true\" : null", "attr.disabled": "disabled() ? \"\" : null" } }, exportAs: ["uiMenuItem"], ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiMenuItemDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[uiMenuItem]',
                    exportAs: 'uiMenuItem',
                    standalone: true,
                    host: {
                        role: 'menuitem',
                        '[attr.tabindex]': 'tabIndex()',
                        '[class]': 'classes()',
                        '[attr.aria-disabled]': 'disabled() ? "true" : null',
                        '[attr.disabled]': 'disabled() ? "" : null',
                        '(click)': 'handleClick($event)',
                        '(keydown)': 'handleKeydown($event)',
                        '(focusin)': 'handleFocusIn()',
                    },
                }]
        }], propDecorators: { value: [{ type: i0.Input, args: [{ isSignal: true, alias: "value", required: false }] }], danger: [{ type: i0.Input, args: [{ isSignal: true, alias: "danger", required: false }] }], disabled: [{ type: i0.Input, args: [{ isSignal: true, alias: "disabled", required: false }] }], triggered: [{ type: i0.Output, args: ["triggered"] }] } });

class UiMenuLabelDirective {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiMenuLabelDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "22.0.5", type: UiMenuLabelDirective, isStandalone: true, selector: "[uiMenuLabel]", host: { classAttribute: "menu-title px-3 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 select-none" }, exportAs: ["uiMenuLabel"], ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiMenuLabelDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[uiMenuLabel]',
                    exportAs: 'uiMenuLabel',
                    standalone: true,
                    host: {
                        class: 'menu-title px-3 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 select-none',
                    },
                }]
        }] });

function getMenuPositions(position, offsetY = 4) {
    switch (position) {
        case 'bottom-start':
            return [
                { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY },
                {
                    originX: 'start',
                    originY: 'top',
                    overlayX: 'start',
                    overlayY: 'bottom',
                    offsetY: -offsetY,
                },
            ];
        case 'bottom-end':
            return [
                { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top', offsetY },
                { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom', offsetY: -offsetY },
            ];
        case 'top-start':
            return [
                {
                    originX: 'start',
                    originY: 'top',
                    overlayX: 'start',
                    overlayY: 'bottom',
                    offsetY: -offsetY,
                },
                { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY },
            ];
        case 'top-end':
            return [
                { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom', offsetY: -offsetY },
                { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top', offsetY },
            ];
        case 'left-start':
            return [
                { originX: 'start', originY: 'top', overlayX: 'end', overlayY: 'top', offsetX: -offsetY },
                { originX: 'end', originY: 'top', overlayX: 'start', overlayY: 'top', offsetX: offsetY },
            ];
        case 'right-start':
            return [
                { originX: 'end', originY: 'top', overlayX: 'start', overlayY: 'top', offsetX: offsetY },
                { originX: 'start', originY: 'top', overlayX: 'end', overlayY: 'top', offsetX: -offsetY },
            ];
    }
}

let nextMenuId = 0;
class UiMenuTriggerDirective {
    overlay = inject(Overlay);
    elementRef = inject(ElementRef);
    viewContainerRef = inject(ViewContainerRef);
    config = inject(UI_MENU_CONFIG, { optional: true });
    uiMenuTriggerFor = input.required(/* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "uiMenuTriggerFor" }] : /* istanbul ignore next */ []));
    uiMenuPosition = input(undefined, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "uiMenuPosition" }] : /* istanbul ignore next */ []));
    uiMenuDisabled = input(false, { ...(ngDevMode ? { debugName: "uiMenuDisabled" } : /* istanbul ignore next */ {}), transform: booleanAttribute });
    uiMenuOffsetY = input(undefined, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "uiMenuOffsetY" }] : /* istanbul ignore next */ []));
    menuOpened = output();
    menuClosed = output();
    isOpen = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "isOpen" }] : /* istanbul ignore next */ []));
    focusDirection = signal('first', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "focusDirection" }] : /* istanbul ignore next */ []));
    menuId = signal(`ui-menu-${nextMenuId++}`, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "menuId" }] : /* istanbul ignore next */ []));
    overlayRef = null;
    closeSubscription = null;
    effectivePosition = computed(() => {
        return this.uiMenuPosition() ?? this.config?.position ?? 'bottom-start';
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "effectivePosition" }] : /* istanbul ignore next */ []));
    effectiveOffsetY = computed(() => {
        return this.uiMenuOffsetY() ?? this.config?.offsetY ?? 4;
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "effectiveOffsetY" }] : /* istanbul ignore next */ []));
    open(focusDirection = 'first') {
        if (this.uiMenuDisabled() || this.isOpen())
            return;
        this.focusDirection.set(focusDirection);
        const positionStrategy = this.overlay
            .position()
            .flexibleConnectedTo(this.elementRef)
            .withPositions(getMenuPositions(this.effectivePosition(), this.effectiveOffsetY()))
            .withPush(false);
        this.overlayRef = this.overlay.create({
            positionStrategy,
            hasBackdrop: true,
            backdropClass: 'cdk-overlay-transparent-backdrop',
            scrollStrategy: this.overlay.scrollStrategies.reposition(),
        });
        const injector = Injector.create({
            parent: this.viewContainerRef.injector,
            providers: [
                {
                    provide: UI_MENU_TRIGGER,
                    useValue: this,
                },
            ],
        });
        const portal = new TemplatePortal(this.uiMenuTriggerFor(), this.viewContainerRef, { $implicit: { close: () => this.close() } }, injector);
        this.overlayRef.attach(portal);
        this.isOpen.set(true);
        this.menuOpened.emit();
        this.closeSubscription = merge(this.overlayRef.backdropClick(), this.overlayRef.keydownEvents().pipe(filter((event) => event.key === 'Escape'))).subscribe(() => {
            this.close();
        });
    }
    close() {
        if (!this.isOpen())
            return;
        this.closeSubscription?.unsubscribe();
        this.closeSubscription = null;
        if (this.overlayRef) {
            this.overlayRef.detach();
            this.overlayRef.dispose();
            this.overlayRef = null;
        }
        this.isOpen.set(false);
        this.menuClosed.emit();
        this.elementRef.nativeElement.focus?.();
    }
    toggle() {
        if (this.isOpen()) {
            this.close();
        }
        else {
            this.open();
        }
    }
    handleKeydown(event) {
        if (event.key === 'Escape' && this.isOpen()) {
            event.preventDefault();
            this.close();
            return;
        }
        if (this.uiMenuDisabled())
            return;
        if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            if (!this.isOpen()) {
                this.open('first');
            }
        }
        else if (event.key === 'ArrowUp') {
            event.preventDefault();
            if (!this.isOpen()) {
                this.open('last');
            }
        }
    }
    ngOnDestroy() {
        this.closeSubscription?.unsubscribe();
        if (this.overlayRef) {
            this.overlayRef.dispose();
            this.overlayRef = null;
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiMenuTriggerDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "17.1.0", version: "22.0.5", type: UiMenuTriggerDirective, isStandalone: true, selector: "[uiMenuTriggerFor]", inputs: { uiMenuTriggerFor: { classPropertyName: "uiMenuTriggerFor", publicName: "uiMenuTriggerFor", isSignal: true, isRequired: true, transformFunction: null }, uiMenuPosition: { classPropertyName: "uiMenuPosition", publicName: "uiMenuPosition", isSignal: true, isRequired: false, transformFunction: null }, uiMenuDisabled: { classPropertyName: "uiMenuDisabled", publicName: "uiMenuDisabled", isSignal: true, isRequired: false, transformFunction: null }, uiMenuOffsetY: { classPropertyName: "uiMenuOffsetY", publicName: "uiMenuOffsetY", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { menuOpened: "menuOpened", menuClosed: "menuClosed" }, host: { attributes: { "aria-haspopup": "menu" }, listeners: { "click": "toggle()", "keydown": "handleKeydown($event)" }, properties: { "attr.aria-expanded": "isOpen() ? \"true\" : \"false\"", "attr.aria-controls": "isOpen() ? menuId() : null", "attr.aria-disabled": "uiMenuDisabled() ? \"true\" : null" } }, exportAs: ["uiMenuTrigger"], ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiMenuTriggerDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[uiMenuTriggerFor]',
                    exportAs: 'uiMenuTrigger',
                    standalone: true,
                    host: {
                        'aria-haspopup': 'menu',
                        '[attr.aria-expanded]': 'isOpen() ? "true" : "false"',
                        '[attr.aria-controls]': 'isOpen() ? menuId() : null',
                        '[attr.aria-disabled]': 'uiMenuDisabled() ? "true" : null',
                        '(click)': 'toggle()',
                        '(keydown)': 'handleKeydown($event)',
                    },
                }]
        }], propDecorators: { uiMenuTriggerFor: [{ type: i0.Input, args: [{ isSignal: true, alias: "uiMenuTriggerFor", required: true }] }], uiMenuPosition: [{ type: i0.Input, args: [{ isSignal: true, alias: "uiMenuPosition", required: false }] }], uiMenuDisabled: [{ type: i0.Input, args: [{ isSignal: true, alias: "uiMenuDisabled", required: false }] }], uiMenuOffsetY: [{ type: i0.Input, args: [{ isSignal: true, alias: "uiMenuOffsetY", required: false }] }], menuOpened: [{ type: i0.Output, args: ["menuOpened"] }], menuClosed: [{ type: i0.Output, args: ["menuClosed"] }] } });

class UiMenuDirective {
    config = inject(UI_MENU_CONFIG, { optional: true });
    trigger = inject(UI_MENU_TRIGGER, { optional: true });
    elementRef = inject(ElementRef);
    id = input('', { ...(ngDevMode ? { debugName: "id" } : /* istanbul ignore next */ {}), alias: 'id' });
    class = input('', { ...(ngDevMode ? { debugName: "class" } : /* istanbul ignore next */ {}), alias: 'class' });
    uiMenuSize = input(undefined, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "uiMenuSize" }] : /* istanbul ignore next */ []));
    closeRequested = output();
    itemSelected = output();
    items = contentChildren(UiMenuItemDirective, { ...(ngDevMode ? { debugName: "items" } : /* istanbul ignore next */ {}), descendants: true });
    activeItem = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "activeItem" }] : /* istanbul ignore next */ []));
    effectiveId = computed(() => {
        return this.id() || this.trigger?.menuId() || null;
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "effectiveId" }] : /* istanbul ignore next */ []));
    effectiveSize = computed(() => {
        return this.uiMenuSize() ?? this.config?.size ?? 'md';
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "effectiveSize" }] : /* istanbul ignore next */ []));
    hostClasses = computed(() => {
        return cn('menu menu-box bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg p-1 min-w-44 outline-none', `menu-${this.effectiveSize()}`, this.class());
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "hostClasses" }] : /* istanbul ignore next */ []));
    constructor() {
        afterNextRender(() => {
            if (this.trigger?.focusDirection() === 'last') {
                this.focusLastItem();
            }
            else {
                this.focusFirstItem();
            }
        });
    }
    closeMenu() {
        this.closeRequested.emit();
        this.trigger?.close();
    }
    getEnabledItems() {
        return this.items().filter((item) => !item.disabled());
    }
    focusFirstItem() {
        const enabled = this.getEnabledItems();
        if (enabled.length > 0) {
            enabled[0].focus();
            this.activeItem.set(enabled[0]);
        }
    }
    focusLastItem() {
        const enabled = this.getEnabledItems();
        if (enabled.length > 0) {
            enabled[enabled.length - 1].focus();
            this.activeItem.set(enabled[enabled.length - 1]);
        }
    }
    focusNextItem() {
        const enabled = this.getEnabledItems();
        if (enabled.length === 0)
            return;
        const currentIndex = enabled.findIndex((item) => item.isFocused());
        const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % enabled.length;
        enabled[nextIndex].focus();
        this.activeItem.set(enabled[nextIndex]);
    }
    focusPreviousItem() {
        const enabled = this.getEnabledItems();
        if (enabled.length === 0)
            return;
        const currentIndex = enabled.findIndex((item) => item.isFocused());
        const prevIndex = currentIndex <= 0 ? enabled.length - 1 : currentIndex - 1;
        enabled[prevIndex].focus();
        this.activeItem.set(enabled[prevIndex]);
    }
    handleKeydown(event) {
        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault();
                this.focusNextItem();
                break;
            case 'ArrowUp':
                event.preventDefault();
                this.focusPreviousItem();
                break;
            case 'Home':
                event.preventDefault();
                this.focusFirstItem();
                break;
            case 'End':
                event.preventDefault();
                this.focusLastItem();
                break;
            case 'Escape':
                event.preventDefault();
                this.closeMenu();
                break;
            case 'Tab':
                this.closeMenu();
                break;
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiMenuDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "17.2.0", version: "22.0.5", type: UiMenuDirective, isStandalone: true, selector: "[uiMenu]", inputs: { id: { classPropertyName: "id", publicName: "id", isSignal: true, isRequired: false, transformFunction: null }, class: { classPropertyName: "class", publicName: "class", isSignal: true, isRequired: false, transformFunction: null }, uiMenuSize: { classPropertyName: "uiMenuSize", publicName: "uiMenuSize", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { closeRequested: "closeRequested", itemSelected: "itemSelected" }, host: { attributes: { "role": "menu", "tabindex": "-1" }, listeners: { "keydown": "handleKeydown($event)" }, properties: { "id": "effectiveId()", "class": "hostClasses()" } }, providers: [
            {
                provide: UI_MENU_CONTEXT,
                useFactory: (menu) => ({
                    size: menu.effectiveSize,
                    close: () => menu.closeMenu(),
                    selectItem: (val) => menu.itemSelected.emit(val),
                    activeItem: menu.activeItem,
                    setActiveItem: (item) => menu.activeItem.set(item),
                }),
                deps: [forwardRef(() => UiMenuDirective)],
            },
        ], queries: [{ propertyName: "items", predicate: UiMenuItemDirective, descendants: true, isSignal: true }], exportAs: ["uiMenu"], ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiMenuDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[uiMenu]',
                    exportAs: 'uiMenu',
                    standalone: true,
                    providers: [
                        {
                            provide: UI_MENU_CONTEXT,
                            useFactory: (menu) => ({
                                size: menu.effectiveSize,
                                close: () => menu.closeMenu(),
                                selectItem: (val) => menu.itemSelected.emit(val),
                                activeItem: menu.activeItem,
                                setActiveItem: (item) => menu.activeItem.set(item),
                            }),
                            deps: [forwardRef(() => UiMenuDirective)],
                        },
                    ],
                    host: {
                        role: 'menu',
                        tabindex: '-1',
                        '[id]': 'effectiveId()',
                        '[class]': 'hostClasses()',
                        '(keydown)': 'handleKeydown($event)',
                    },
                }]
        }], ctorParameters: () => [], propDecorators: { id: [{ type: i0.Input, args: [{ isSignal: true, alias: "id", required: false }] }], class: [{ type: i0.Input, args: [{ isSignal: true, alias: "class", required: false }] }], uiMenuSize: [{ type: i0.Input, args: [{ isSignal: true, alias: "uiMenuSize", required: false }] }], closeRequested: [{ type: i0.Output, args: ["closeRequested"] }], itemSelected: [{ type: i0.Output, args: ["itemSelected"] }], items: [{ type: i0.ContentChildren, args: [i0.forwardRef(() => UiMenuItemDirective), { ...{ descendants: true }, isSignal: true }] }] } });

/**
 * Generated bundle index. Do not edit.
 */

export { UI_MENU_CONFIG, UI_MENU_CONTEXT, UI_MENU_TRIGGER, UiMenuDirective, UiMenuDividerDirective, UiMenuItemDirective, UiMenuLabelDirective, UiMenuTriggerDirective, getMenuPositions, menuItemVariants };
//# sourceMappingURL=libs-ui-menu.mjs.map
