import * as _angular_core from '@angular/core';
import { ElementRef, InjectionToken, Signal, OnDestroy, TemplateRef } from '@angular/core';
import { ConnectedPosition } from '@angular/cdk/overlay';

declare class UiMenuDividerDirective {
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<UiMenuDividerDirective, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<UiMenuDividerDirective, "[uiMenuDivider]", ["uiMenuDivider"], {}, {}, never, never, true, never>;
}

declare class UiMenuItemDirective {
    private readonly context;
    readonly elementRef: ElementRef<HTMLElement>;
    readonly value: _angular_core.InputSignal<unknown>;
    readonly danger: _angular_core.InputSignalWithTransform<boolean, unknown>;
    readonly disabled: _angular_core.InputSignalWithTransform<boolean, unknown>;
    readonly triggered: _angular_core.OutputEmitterRef<unknown>;
    readonly isActive: _angular_core.Signal<boolean>;
    readonly tabIndex: _angular_core.Signal<0 | -1>;
    readonly classes: _angular_core.Signal<string>;
    focus(): void;
    isFocused(): boolean;
    handleFocusIn(): void;
    handleClick(event: MouseEvent): void;
    handleKeydown(event: KeyboardEvent): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<UiMenuItemDirective, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<UiMenuItemDirective, "[uiMenuItem]", ["uiMenuItem"], { "value": { "alias": "value"; "required": false; "isSignal": true; }; "danger": { "alias": "danger"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; }, { "triggered": "triggered"; }, never, never, true, never>;
}

declare class UiMenuLabelDirective {
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<UiMenuLabelDirective, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<UiMenuLabelDirective, "[uiMenuLabel]", ["uiMenuLabel"], {}, {}, never, never, true, never>;
}

type UiMenuPosition = 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end' | 'left-start' | 'right-start';
type UiMenuSize = 'sm' | 'md' | 'lg';
interface UiMenuContext {
    size: Signal<UiMenuSize>;
    close: () => void;
    selectItem: (value: unknown) => void;
    activeItem: Signal<unknown>;
    setActiveItem: (item: unknown) => void;
}
declare const UI_MENU_CONTEXT: InjectionToken<UiMenuContext>;
interface UiMenuConfig {
    size?: UiMenuSize;
    position?: UiMenuPosition;
    offsetY?: number;
}
declare const UI_MENU_CONFIG: InjectionToken<UiMenuConfig>;
interface UiMenuTrigger {
    close: () => void;
    open: (focusDirection?: 'first' | 'last') => void;
    toggle: () => void;
    isOpen: () => boolean;
    menuId: Signal<string>;
    focusDirection: Signal<'first' | 'last'>;
}
declare const UI_MENU_TRIGGER: InjectionToken<UiMenuTrigger>;

declare class UiMenuTriggerDirective implements UiMenuTrigger, OnDestroy {
    private readonly overlay;
    private readonly elementRef;
    private readonly viewContainerRef;
    private readonly config;
    readonly uiMenuTriggerFor: _angular_core.InputSignal<TemplateRef<unknown>>;
    readonly uiMenuPosition: _angular_core.InputSignal<UiMenuPosition | undefined>;
    readonly uiMenuDisabled: _angular_core.InputSignalWithTransform<boolean, unknown>;
    readonly uiMenuOffsetY: _angular_core.InputSignal<number | undefined>;
    readonly menuOpened: _angular_core.OutputEmitterRef<void>;
    readonly menuClosed: _angular_core.OutputEmitterRef<void>;
    readonly isOpen: _angular_core.WritableSignal<boolean>;
    readonly focusDirection: _angular_core.WritableSignal<"first" | "last">;
    readonly menuId: _angular_core.WritableSignal<string>;
    private overlayRef;
    private closeSubscription;
    readonly effectivePosition: _angular_core.Signal<UiMenuPosition>;
    readonly effectiveOffsetY: _angular_core.Signal<number>;
    open(focusDirection?: 'first' | 'last'): void;
    close(): void;
    toggle(): void;
    handleKeydown(event: KeyboardEvent): void;
    ngOnDestroy(): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<UiMenuTriggerDirective, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<UiMenuTriggerDirective, "[uiMenuTriggerFor]", ["uiMenuTrigger"], { "uiMenuTriggerFor": { "alias": "uiMenuTriggerFor"; "required": true; "isSignal": true; }; "uiMenuPosition": { "alias": "uiMenuPosition"; "required": false; "isSignal": true; }; "uiMenuDisabled": { "alias": "uiMenuDisabled"; "required": false; "isSignal": true; }; "uiMenuOffsetY": { "alias": "uiMenuOffsetY"; "required": false; "isSignal": true; }; }, { "menuOpened": "menuOpened"; "menuClosed": "menuClosed"; }, never, never, true, never>;
}

declare class UiMenuDirective {
    private readonly config;
    private readonly trigger;
    readonly elementRef: ElementRef<HTMLElement>;
    readonly id: _angular_core.InputSignal<string>;
    readonly class: _angular_core.InputSignal<string>;
    readonly uiMenuSize: _angular_core.InputSignal<UiMenuSize | undefined>;
    readonly closeRequested: _angular_core.OutputEmitterRef<void>;
    readonly itemSelected: _angular_core.OutputEmitterRef<unknown>;
    readonly items: Signal<readonly UiMenuItemDirective[]>;
    readonly activeItem: _angular_core.WritableSignal<UiMenuItemDirective | null>;
    readonly effectiveId: Signal<string | null>;
    readonly effectiveSize: Signal<UiMenuSize>;
    readonly hostClasses: Signal<string>;
    constructor();
    closeMenu(): void;
    getEnabledItems(): UiMenuItemDirective[];
    focusFirstItem(): void;
    focusLastItem(): void;
    focusNextItem(): void;
    focusPreviousItem(): void;
    handleKeydown(event: KeyboardEvent): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<UiMenuDirective, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<UiMenuDirective, "[uiMenu]", ["uiMenu"], { "id": { "alias": "id"; "required": false; "isSignal": true; }; "class": { "alias": "class"; "required": false; "isSignal": true; }; "uiMenuSize": { "alias": "uiMenuSize"; "required": false; "isSignal": true; }; }, { "closeRequested": "closeRequested"; "itemSelected": "itemSelected"; }, ["items"], never, true, never>;
}

declare function getMenuPositions(position: UiMenuPosition, offsetY?: number): ConnectedPosition[];

interface MenuItemVariantProps {
    size?: UiMenuSize;
    danger?: boolean;
    disabled?: boolean;
}
declare function menuItemVariants(props?: MenuItemVariantProps, extraClass?: string): string;

export { UI_MENU_CONFIG, UI_MENU_CONTEXT, UI_MENU_TRIGGER, UiMenuDirective, UiMenuDividerDirective, UiMenuItemDirective, UiMenuLabelDirective, UiMenuTriggerDirective, getMenuPositions, menuItemVariants };
export type { MenuItemVariantProps, UiMenuConfig, UiMenuContext, UiMenuPosition, UiMenuSize, UiMenuTrigger };
