import { NgTemplateOutlet } from '@angular/common';
import * as i0 from '@angular/core';
import { signal, computed, TemplateRef, ChangeDetectionStrategy, Component, InjectionToken, inject, ElementRef, ViewContainerRef, input, output, effect, HostListener, Directive } from '@angular/core';
import { cva } from '@libs/ui/core';
import { Overlay } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';

const _tooltipVariants = cva({
    base: 'tooltip',
    variants: {
        color: {
            neutral: 'tooltip-neutral',
            primary: 'tooltip-primary',
            info: 'tooltip-info',
            success: 'tooltip-success',
            warning: 'tooltip-warning',
            error: 'tooltip-error',
        },
        size: {
            sm: 'tooltip-sm',
            md: 'tooltip-md',
        },
        interactive: {
            true: 'tooltip-interactive',
            false: '',
        },
    },
    defaultVariants: {
        color: 'neutral',
        size: 'md',
        interactive: 'false',
    },
});
function tooltipVariants(props, extraClass) {
    return _tooltipVariants({
        color: props?.color,
        size: props?.size,
        interactive: props?.interactive !== undefined
            ? String(props.interactive)
            : undefined,
    }, extraClass);
}

class UiTooltipComponent {
    id = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "id" }] : /* istanbul ignore next */ []));
    content = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "content" }] : /* istanbul ignore next */ []));
    color = signal('neutral', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "color" }] : /* istanbul ignore next */ []));
    size = signal('md', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "size" }] : /* istanbul ignore next */ []));
    arrow = signal(true, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "arrow" }] : /* istanbul ignore next */ []));
    interactive = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "interactive" }] : /* istanbul ignore next */ []));
    placement = signal('top', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "placement" }] : /* istanbul ignore next */ []));
    classes = computed(() => tooltipVariants({
        color: this.color(),
        size: this.size(),
        interactive: this.interactive(),
    }), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "classes" }] : /* istanbul ignore next */ []));
    isTemplate(val) {
        return val instanceof TemplateRef;
    }
    asTemplate(val) {
        return val;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiTooltipComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "22.0.5", type: UiTooltipComponent, isStandalone: true, selector: "ui-tooltip", ngImport: i0, template: `
    <div
      role="tooltip"
      [id]="id()"
      [class]="classes()"
      [attr.data-placement]="placement()"
    >
      @if (isTemplate(content())) {
        <ng-container *ngTemplateOutlet="asTemplate(content())" />
      } @else {
        {{ content() }}
      }
      @if (arrow()) {
        <span
          class="tooltip-arrow"
          aria-hidden="true"
        ></span>
      }
    </div>
  `, isInline: true, dependencies: [{ kind: "directive", type: NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet", "ngTemplateOutletInjector"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiTooltipComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'ui-tooltip',
                    standalone: true,
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    imports: [NgTemplateOutlet],
                    template: `
    <div
      role="tooltip"
      [id]="id()"
      [class]="classes()"
      [attr.data-placement]="placement()"
    >
      @if (isTemplate(content())) {
        <ng-container *ngTemplateOutlet="asTemplate(content())" />
      } @else {
        {{ content() }}
      }
      @if (arrow()) {
        <span
          class="tooltip-arrow"
          aria-hidden="true"
        ></span>
      }
    </div>
  `,
                }]
        }] });

const TOOLTIP_POSITIONS = {
    top: [
        { originX: 'center', originY: 'top', overlayX: 'center', overlayY: 'bottom', offsetY: -8 },
        { originX: 'center', originY: 'bottom', overlayX: 'center', overlayY: 'top', offsetY: 8 },
        { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -8 },
        { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom', offsetY: -8 },
    ],
    bottom: [
        { originX: 'center', originY: 'bottom', overlayX: 'center', overlayY: 'top', offsetY: 8 },
        { originX: 'center', originY: 'top', overlayX: 'center', overlayY: 'bottom', offsetY: -8 },
        { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 8 },
        { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top', offsetY: 8 },
    ],
    left: [
        { originX: 'start', originY: 'center', overlayX: 'end', overlayY: 'center', offsetX: -8 },
        { originX: 'end', originY: 'center', overlayX: 'start', overlayY: 'center', offsetX: 8 },
        { originX: 'start', originY: 'top', overlayX: 'end', overlayY: 'top', offsetX: -8 },
        { originX: 'start', originY: 'bottom', overlayX: 'end', overlayY: 'bottom', offsetX: -8 },
    ],
    right: [
        { originX: 'end', originY: 'center', overlayX: 'start', overlayY: 'center', offsetX: 8 },
        { originX: 'start', originY: 'center', overlayX: 'end', overlayY: 'center', offsetX: -8 },
        { originX: 'end', originY: 'top', overlayX: 'start', overlayY: 'top', offsetX: 8 },
        { originX: 'end', originY: 'bottom', overlayX: 'start', overlayY: 'bottom', offsetX: 8 },
    ],
};
function mapConnectedPositionToPlacement(pos) {
    if (pos.originY === 'top' && pos.overlayY === 'bottom')
        return 'top';
    if (pos.originY === 'bottom' && pos.overlayY === 'top')
        return 'bottom';
    if (pos.originX === 'start' && pos.overlayX === 'end')
        return 'left';
    if (pos.originX === 'end' && pos.overlayX === 'start')
        return 'right';
    if (pos.offsetY != null && pos.offsetY < 0)
        return 'top';
    if (pos.offsetY != null && pos.offsetY > 0)
        return 'bottom';
    if (pos.offsetX != null && pos.offsetX < 0)
        return 'left';
    if (pos.offsetX != null && pos.offsetX > 0)
        return 'right';
    return 'top';
}

const UI_TOOLTIP_CONFIG = new InjectionToken('UI_TOOLTIP_CONFIG');

let nextTooltipId = 0;
class UiTooltipDirective {
    overlay = inject(Overlay);
    elementRef = inject(ElementRef);
    viewContainerRef = inject(ViewContainerRef);
    config = inject(UI_TOOLTIP_CONFIG, { optional: true });
    tooltipId = `ui-tooltip-${nextTooltipId++}`;
    overlayRef = null;
    positionStrategy = null;
    componentRef = null;
    positionSubscription = null;
    showTimer = null;
    hideTimer = null;
    overlayMouseListenersCleanup = null;
    activePlacement = signal('top', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "activePlacement" }] : /* istanbul ignore next */ []));
    content = input(null, { ...(ngDevMode ? { debugName: "content" } : /* istanbul ignore next */ {}), alias: 'uiTooltip' });
    position = input(this.config?.position ?? 'top', { ...(ngDevMode ? { debugName: "position" } : /* istanbul ignore next */ {}), alias: 'uiTooltipPosition' });
    color = input(this.config?.color ?? 'neutral', { ...(ngDevMode ? { debugName: "color" } : /* istanbul ignore next */ {}), alias: 'uiTooltipColor' });
    size = input(this.config?.size ?? 'md', { ...(ngDevMode ? { debugName: "size" } : /* istanbul ignore next */ {}), alias: 'uiTooltipSize' });
    arrow = input(this.config?.arrow ?? true, { ...(ngDevMode ? { debugName: "arrow" } : /* istanbul ignore next */ {}), alias: 'uiTooltipArrow' });
    delay = input(this.config?.showDelay ?? 200, { ...(ngDevMode ? { debugName: "delay" } : /* istanbul ignore next */ {}), alias: 'uiTooltipDelay' });
    hideDelay = input(this.config?.hideDelay ?? 0, { ...(ngDevMode ? { debugName: "hideDelay" } : /* istanbul ignore next */ {}), alias: 'uiTooltipHideDelay' });
    disabled = input(false, { ...(ngDevMode ? { debugName: "disabled" } : /* istanbul ignore next */ {}), alias: 'uiTooltipDisabled' });
    interactive = input(undefined, { ...(ngDevMode ? { debugName: "interactive" } : /* istanbul ignore next */ {}), alias: 'uiTooltipInteractive' });
    class = input('', { ...(ngDevMode ? { debugName: "class" } : /* istanbul ignore next */ {}), alias: 'uiTooltipClass' });
    tooltipVisibleChange = output();
    get isOpen() {
        return this.overlayRef?.hasAttached() ?? false;
    }
    get isInteractive() {
        const customInteractive = this.interactive();
        if (customInteractive !== undefined) {
            return customInteractive;
        }
        return this.content() instanceof TemplateRef;
    }
    get hasValidContent() {
        const val = this.content();
        if (val == null)
            return false;
        if (typeof val === 'string' && val.trim() === '')
            return false;
        return true;
    }
    constructor() {
        this.activePlacement.set(this.position());
        effect(() => {
            const disabled = this.disabled();
            const hasContent = this.hasValidContent;
            // Trigger reads for reactivity
            this.content();
            this.position();
            this.color();
            this.size();
            this.arrow();
            this.interactive();
            if (this.isOpen) {
                if (disabled || !hasContent) {
                    this.closeOverlay();
                }
                else {
                    if (this.positionStrategy) {
                        this.positionStrategy.withPositions(TOOLTIP_POSITIONS[this.position()]);
                        this.overlayRef?.updatePosition();
                    }
                    this.updateComponentInputs();
                }
            }
        });
    }
    onMouseEnter() {
        this.show(this.delay());
    }
    onMouseLeave() {
        this.hide();
    }
    onFocusIn() {
        this.show(0);
    }
    onFocusOut() {
        this.hide(0);
    }
    onEscape(event) {
        if (this.isOpen) {
            event.stopPropagation();
            this.hide(0);
        }
    }
    show(delay) {
        if (this.disabled() || !this.hasValidContent) {
            return;
        }
        this.clearHideTimer();
        const actualDelay = delay ?? this.delay();
        if (actualDelay > 0) {
            this.clearShowTimer();
            this.showTimer = setTimeout(() => {
                if (!this.disabled() && this.hasValidContent) {
                    this.openOverlay();
                }
            }, actualDelay);
        }
        else {
            this.clearShowTimer();
            this.openOverlay();
        }
    }
    hide(delay) {
        this.clearShowTimer();
        if (!this.isOpen) {
            return;
        }
        const transitGrace = this.isInteractive ? 150 : 0;
        const actualDelay = delay ?? Math.max(this.hideDelay(), transitGrace);
        if (actualDelay > 0) {
            this.clearHideTimer();
            this.hideTimer = setTimeout(() => {
                this.closeOverlay();
            }, actualDelay);
        }
        else {
            this.clearHideTimer();
            this.closeOverlay();
        }
    }
    toggle() {
        if (this.isOpen) {
            this.hide(0);
        }
        else {
            this.show(0);
        }
    }
    openOverlay() {
        if (this.isOpen) {
            this.updateComponentInputs();
            return;
        }
        this.activePlacement.set(this.position());
        const overlay = this.getOrCreateOverlay();
        this.positionStrategy?.withPositions(TOOLTIP_POSITIONS[this.position()]);
        const portal = new ComponentPortal(UiTooltipComponent, this.viewContainerRef);
        this.componentRef = overlay.attach(portal);
        this.updateComponentInputs();
        this.componentRef.changeDetectorRef.detectChanges();
        this.attachOverlayListeners();
        this.addDescribedBy();
        this.tooltipVisibleChange.emit(true);
    }
    closeOverlay() {
        if (this.overlayRef?.hasAttached()) {
            this.cleanupOverlayListeners();
            this.overlayRef.detach();
            this.componentRef = null;
            this.removeDescribedBy();
            this.tooltipVisibleChange.emit(false);
        }
    }
    updateComponentInputs() {
        if (!this.componentRef)
            return;
        const instance = this.componentRef.instance;
        instance.id.set(this.tooltipId);
        instance.content.set(this.content());
        instance.color.set(this.color());
        instance.size.set(this.size());
        instance.arrow.set(this.arrow());
        instance.interactive.set(this.isInteractive);
        instance.placement.set(this.activePlacement());
        this.componentRef.changeDetectorRef.markForCheck();
    }
    getOrCreateOverlay() {
        if (this.overlayRef) {
            return this.overlayRef;
        }
        this.positionStrategy = this.overlay
            .position()
            .flexibleConnectedTo(this.elementRef)
            .withPositions(TOOLTIP_POSITIONS[this.position()])
            .withPush(false)
            .withViewportMargin(8);
        this.positionSubscription = this.positionStrategy.positionChanges.subscribe((change) => {
            const placement = mapConnectedPositionToPlacement(change.connectionPair);
            this.activePlacement.set(placement);
            if (this.componentRef) {
                this.componentRef.instance.placement.set(placement);
                this.componentRef.changeDetectorRef.markForCheck();
            }
        });
        const classes = this.class();
        this.overlayRef = this.overlay.create({
            positionStrategy: this.positionStrategy,
            scrollStrategy: this.overlay.scrollStrategies.reposition({ scrollThrottle: 20 }),
            panelClass: ['ui-tooltip-panel', ...(classes ? classes.split(' ').filter(Boolean) : [])],
        });
        return this.overlayRef;
    }
    attachOverlayListeners() {
        if (!this.isInteractive || !this.overlayRef)
            return;
        const overlayEl = this.overlayRef.overlayElement;
        const onEnter = () => this.clearHideTimer();
        const onLeave = () => this.hide(this.hideDelay());
        overlayEl.addEventListener('mouseenter', onEnter);
        overlayEl.addEventListener('mouseleave', onLeave);
        overlayEl.addEventListener('mouseover', onEnter);
        this.overlayMouseListenersCleanup = () => {
            overlayEl.removeEventListener('mouseenter', onEnter);
            overlayEl.removeEventListener('mouseleave', onLeave);
            overlayEl.removeEventListener('mouseover', onEnter);
        };
    }
    cleanupOverlayListeners() {
        if (this.overlayMouseListenersCleanup) {
            this.overlayMouseListenersCleanup();
            this.overlayMouseListenersCleanup = null;
        }
    }
    addDescribedBy() {
        const host = this.elementRef.nativeElement;
        const current = host.getAttribute('aria-describedby');
        if (!current) {
            host.setAttribute('aria-describedby', this.tooltipId);
            return;
        }
        const ids = current.split(/\s+/).filter(Boolean);
        if (!ids.includes(this.tooltipId)) {
            ids.push(this.tooltipId);
            host.setAttribute('aria-describedby', ids.join(' '));
        }
    }
    removeDescribedBy() {
        const host = this.elementRef.nativeElement;
        const current = host.getAttribute('aria-describedby');
        if (!current)
            return;
        const ids = current
            .split(/\s+/)
            .filter(Boolean)
            .filter((id) => id !== this.tooltipId);
        if (ids.length > 0) {
            host.setAttribute('aria-describedby', ids.join(' '));
        }
        else {
            host.removeAttribute('aria-describedby');
        }
    }
    clearShowTimer() {
        if (this.showTimer) {
            clearTimeout(this.showTimer);
            this.showTimer = null;
        }
    }
    clearHideTimer() {
        if (this.hideTimer) {
            clearTimeout(this.hideTimer);
            this.hideTimer = null;
        }
    }
    ngOnDestroy() {
        this.clearShowTimer();
        this.clearHideTimer();
        this.cleanupOverlayListeners();
        this.removeDescribedBy();
        this.positionSubscription?.unsubscribe();
        if (this.overlayRef) {
            this.overlayRef.dispose();
            this.overlayRef = null;
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiTooltipDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "17.1.0", version: "22.0.5", type: UiTooltipDirective, isStandalone: true, selector: "[uiTooltip]", inputs: { content: { classPropertyName: "content", publicName: "uiTooltip", isSignal: true, isRequired: false, transformFunction: null }, position: { classPropertyName: "position", publicName: "uiTooltipPosition", isSignal: true, isRequired: false, transformFunction: null }, color: { classPropertyName: "color", publicName: "uiTooltipColor", isSignal: true, isRequired: false, transformFunction: null }, size: { classPropertyName: "size", publicName: "uiTooltipSize", isSignal: true, isRequired: false, transformFunction: null }, arrow: { classPropertyName: "arrow", publicName: "uiTooltipArrow", isSignal: true, isRequired: false, transformFunction: null }, delay: { classPropertyName: "delay", publicName: "uiTooltipDelay", isSignal: true, isRequired: false, transformFunction: null }, hideDelay: { classPropertyName: "hideDelay", publicName: "uiTooltipHideDelay", isSignal: true, isRequired: false, transformFunction: null }, disabled: { classPropertyName: "disabled", publicName: "uiTooltipDisabled", isSignal: true, isRequired: false, transformFunction: null }, interactive: { classPropertyName: "interactive", publicName: "uiTooltipInteractive", isSignal: true, isRequired: false, transformFunction: null }, class: { classPropertyName: "class", publicName: "uiTooltipClass", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { tooltipVisibleChange: "tooltipVisibleChange" }, host: { listeners: { "mouseenter": "onMouseEnter()", "mouseleave": "onMouseLeave()", "focusin": "onFocusIn()", "focusout": "onFocusOut()", "document:keydown.escape": "onEscape($event)" } }, exportAs: ["uiTooltip"], ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiTooltipDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[uiTooltip]',
                    exportAs: 'uiTooltip',
                    standalone: true,
                }]
        }], ctorParameters: () => [], propDecorators: { content: [{ type: i0.Input, args: [{ isSignal: true, alias: "uiTooltip", required: false }] }], position: [{ type: i0.Input, args: [{ isSignal: true, alias: "uiTooltipPosition", required: false }] }], color: [{ type: i0.Input, args: [{ isSignal: true, alias: "uiTooltipColor", required: false }] }], size: [{ type: i0.Input, args: [{ isSignal: true, alias: "uiTooltipSize", required: false }] }], arrow: [{ type: i0.Input, args: [{ isSignal: true, alias: "uiTooltipArrow", required: false }] }], delay: [{ type: i0.Input, args: [{ isSignal: true, alias: "uiTooltipDelay", required: false }] }], hideDelay: [{ type: i0.Input, args: [{ isSignal: true, alias: "uiTooltipHideDelay", required: false }] }], disabled: [{ type: i0.Input, args: [{ isSignal: true, alias: "uiTooltipDisabled", required: false }] }], interactive: [{ type: i0.Input, args: [{ isSignal: true, alias: "uiTooltipInteractive", required: false }] }], class: [{ type: i0.Input, args: [{ isSignal: true, alias: "uiTooltipClass", required: false }] }], tooltipVisibleChange: [{ type: i0.Output, args: ["tooltipVisibleChange"] }], onMouseEnter: [{
                type: HostListener,
                args: ['mouseenter']
            }], onMouseLeave: [{
                type: HostListener,
                args: ['mouseleave']
            }], onFocusIn: [{
                type: HostListener,
                args: ['focusin']
            }], onFocusOut: [{
                type: HostListener,
                args: ['focusout']
            }], onEscape: [{
                type: HostListener,
                args: ['document:keydown.escape', ['$event']]
            }] } });

/**
 * Generated bundle index. Do not edit.
 */

export { TOOLTIP_POSITIONS, UI_TOOLTIP_CONFIG, UiTooltipComponent, UiTooltipDirective, mapConnectedPositionToPlacement, tooltipVariants };
//# sourceMappingURL=libs-ui-tooltip.mjs.map
