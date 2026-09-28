import * as _angular_core from '@angular/core';
import { InjectionToken, TemplateRef, OnDestroy } from '@angular/core';
import { UiColor } from '@libs/ui/core';
import { ConnectedPosition } from '@angular/cdk/overlay';

type UiTooltipPosition = 'top' | 'bottom' | 'left' | 'right';
type UiTooltipSize = 'sm' | 'md';
type UiTooltipContent = string | TemplateRef<unknown> | null;
interface UiTooltipConfig {
    position?: UiTooltipPosition;
    color?: UiColor;
    size?: UiTooltipSize;
    arrow?: boolean;
    showDelay?: number;
    hideDelay?: number;
    touchGestures?: 'auto' | 'on' | 'off';
}
declare const UI_TOOLTIP_CONFIG: InjectionToken<UiTooltipConfig>;

declare class UiTooltipComponent {
    readonly id: _angular_core.WritableSignal<string>;
    readonly content: _angular_core.WritableSignal<UiTooltipContent>;
    readonly color: _angular_core.WritableSignal<UiColor>;
    readonly size: _angular_core.WritableSignal<UiTooltipSize>;
    readonly arrow: _angular_core.WritableSignal<boolean>;
    readonly interactive: _angular_core.WritableSignal<boolean>;
    readonly placement: _angular_core.WritableSignal<UiTooltipPosition>;
    readonly classes: _angular_core.Signal<string>;
    isTemplate(val: unknown): val is TemplateRef<unknown>;
    asTemplate(val: unknown): TemplateRef<unknown>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<UiTooltipComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<UiTooltipComponent, "ui-tooltip", never, {}, {}, never, never, true, never>;
}

declare class UiTooltipDirective implements OnDestroy {
    private readonly overlay;
    private readonly elementRef;
    private readonly viewContainerRef;
    private readonly config;
    private readonly tooltipId;
    private overlayRef;
    private positionStrategy;
    private componentRef;
    private positionSubscription;
    private showTimer;
    private hideTimer;
    private overlayMouseListenersCleanup;
    private readonly activePlacement;
    readonly content: _angular_core.InputSignal<UiTooltipContent>;
    readonly position: _angular_core.InputSignal<UiTooltipPosition>;
    readonly color: _angular_core.InputSignal<UiColor>;
    readonly size: _angular_core.InputSignal<UiTooltipSize>;
    readonly arrow: _angular_core.InputSignal<boolean>;
    readonly delay: _angular_core.InputSignal<number>;
    readonly hideDelay: _angular_core.InputSignal<number>;
    readonly disabled: _angular_core.InputSignal<boolean>;
    readonly interactive: _angular_core.InputSignal<boolean | undefined>;
    readonly class: _angular_core.InputSignal<string>;
    readonly tooltipVisibleChange: _angular_core.OutputEmitterRef<boolean>;
    get isOpen(): boolean;
    private get isInteractive();
    private get hasValidContent();
    constructor();
    onMouseEnter(): void;
    onMouseLeave(): void;
    onFocusIn(): void;
    onFocusOut(): void;
    onEscape(event: Event): void;
    show(delay?: number): void;
    hide(delay?: number): void;
    toggle(): void;
    private openOverlay;
    private closeOverlay;
    private updateComponentInputs;
    private getOrCreateOverlay;
    private attachOverlayListeners;
    private cleanupOverlayListeners;
    private addDescribedBy;
    private removeDescribedBy;
    private clearShowTimer;
    private clearHideTimer;
    ngOnDestroy(): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<UiTooltipDirective, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<UiTooltipDirective, "[uiTooltip]", ["uiTooltip"], { "content": { "alias": "uiTooltip"; "required": false; "isSignal": true; }; "position": { "alias": "uiTooltipPosition"; "required": false; "isSignal": true; }; "color": { "alias": "uiTooltipColor"; "required": false; "isSignal": true; }; "size": { "alias": "uiTooltipSize"; "required": false; "isSignal": true; }; "arrow": { "alias": "uiTooltipArrow"; "required": false; "isSignal": true; }; "delay": { "alias": "uiTooltipDelay"; "required": false; "isSignal": true; }; "hideDelay": { "alias": "uiTooltipHideDelay"; "required": false; "isSignal": true; }; "disabled": { "alias": "uiTooltipDisabled"; "required": false; "isSignal": true; }; "interactive": { "alias": "uiTooltipInteractive"; "required": false; "isSignal": true; }; "class": { "alias": "uiTooltipClass"; "required": false; "isSignal": true; }; }, { "tooltipVisibleChange": "tooltipVisibleChange"; }, never, never, true, never>;
}

declare const TOOLTIP_POSITIONS: Record<UiTooltipPosition, ConnectedPosition[]>;
declare function mapConnectedPositionToPlacement(pos: ConnectedPosition): UiTooltipPosition;

interface TooltipVariantProps {
    color?: UiColor;
    size?: UiTooltipSize;
    interactive?: boolean | 'true' | 'false';
}
declare function tooltipVariants(props?: TooltipVariantProps, extraClass?: string): string;

export { TOOLTIP_POSITIONS, UI_TOOLTIP_CONFIG, UiTooltipComponent, UiTooltipDirective, mapConnectedPositionToPlacement, tooltipVariants };
export type { TooltipVariantProps, UiTooltipConfig, UiTooltipContent, UiTooltipPosition, UiTooltipSize };
