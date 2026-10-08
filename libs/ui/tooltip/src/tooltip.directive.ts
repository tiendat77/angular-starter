import { FlexibleConnectedPositionStrategy, Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import {
  ComponentRef,
  Directive,
  ElementRef,
  HostListener,
  OnDestroy,
  TemplateRef,
  ViewContainerRef,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { UiColor } from '@libs/ui/core';
import { Subscription } from 'rxjs';
import { UiTooltipComponent } from './tooltip.component';
import { TOOLTIP_POSITIONS, mapConnectedPositionToPlacement } from './tooltip.positions';
import {
  UI_TOOLTIP_CONFIG,
  UiTooltipContent,
  UiTooltipPosition,
  UiTooltipSize,
} from './tooltip.types';

let nextTooltipId = 0;

@Directive({
  selector: '[uiTooltip]',
  exportAs: 'uiTooltip',
  standalone: true,
})
export class UiTooltipDirective implements OnDestroy {
  private readonly overlay = inject(Overlay);
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly config = inject(UI_TOOLTIP_CONFIG, { optional: true });

  private readonly tooltipId = `ui-tooltip-${nextTooltipId++}`;
  private overlayRef: OverlayRef | null = null;
  private positionStrategy: FlexibleConnectedPositionStrategy | null = null;
  private componentRef: ComponentRef<UiTooltipComponent> | null = null;
  private positionSubscription: Subscription | null = null;
  private showTimer: ReturnType<typeof setTimeout> | null = null;
  private hideTimer: ReturnType<typeof setTimeout> | null = null;
  private overlayMouseListenersCleanup: (() => void) | null = null;

  private readonly activePlacement = signal<UiTooltipPosition>('top');

  readonly content = input<UiTooltipContent>(null, { alias: 'uiTooltip' });
  readonly position = input<UiTooltipPosition>(this.config?.position ?? 'top', {
    alias: 'uiTooltipPosition',
  });
  readonly color = input<UiColor>(this.config?.color ?? 'neutral', {
    alias: 'uiTooltipColor',
  });
  readonly size = input<UiTooltipSize>(this.config?.size ?? 'md', {
    alias: 'uiTooltipSize',
  });
  readonly arrow = input<boolean>(this.config?.arrow ?? true, {
    alias: 'uiTooltipArrow',
  });
  readonly delay = input<number>(this.config?.showDelay ?? 200, {
    alias: 'uiTooltipDelay',
  });
  readonly hideDelay = input<number>(this.config?.hideDelay ?? 0, {
    alias: 'uiTooltipHideDelay',
  });
  readonly disabled = input<boolean>(false, {
    alias: 'uiTooltipDisabled',
  });
  /** Whether keyboard focus on the host shows the tooltip too (hover always does). */
  readonly showOnFocus = input<boolean>(true, {
    alias: 'uiTooltipShowOnFocus',
  });
  readonly interactive = input<boolean | undefined>(undefined, {
    alias: 'uiTooltipInteractive',
  });
  readonly class = input<string>('', {
    alias: 'uiTooltipClass',
  });

  readonly tooltipVisibleChange = output<boolean>();

  get isOpen(): boolean {
    return this.overlayRef?.hasAttached() ?? false;
  }

  private get isInteractive(): boolean {
    const customInteractive = this.interactive();
    if (customInteractive !== undefined) {
      return customInteractive;
    }
    return this.content() instanceof TemplateRef;
  }

  private get hasValidContent(): boolean {
    const val = this.content();
    if (val == null) return false;
    if (typeof val === 'string' && val.trim() === '') return false;
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
        } else {
          if (this.positionStrategy) {
            this.positionStrategy.withPositions(TOOLTIP_POSITIONS[this.position()]);
            this.overlayRef?.updatePosition();
          }
          this.updateComponentInputs();
        }
      }
    });
  }

  @HostListener('mouseenter')
  onMouseEnter(): void {
    this.show(this.delay());
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    this.hide();
  }

  @HostListener('focusin')
  onFocusIn(): void {
    if (!this.showOnFocus()) {
      return;
    }
    this.show(0);
  }

  @HostListener('focusout')
  onFocusOut(): void {
    this.hide(0);
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscape(event: Event): void {
    if (this.isOpen) {
      event.stopPropagation();
      this.hide(0);
    }
  }

  show(delay?: number): void {
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
    } else {
      this.clearShowTimer();
      this.openOverlay();
    }
  }

  hide(delay?: number): void {
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
    } else {
      this.clearHideTimer();
      this.closeOverlay();
    }
  }

  toggle(): void {
    if (this.isOpen) {
      this.hide(0);
    } else {
      this.show(0);
    }
  }

  private openOverlay(): void {
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

  private closeOverlay(): void {
    if (this.overlayRef?.hasAttached()) {
      this.cleanupOverlayListeners();
      this.overlayRef.detach();
      this.componentRef = null;
      this.removeDescribedBy();
      this.tooltipVisibleChange.emit(false);
    }
  }

  private updateComponentInputs(): void {
    if (!this.componentRef) return;
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

  private getOrCreateOverlay(): OverlayRef {
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

  private attachOverlayListeners(): void {
    if (!this.isInteractive || !this.overlayRef) return;

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

  private cleanupOverlayListeners(): void {
    if (this.overlayMouseListenersCleanup) {
      this.overlayMouseListenersCleanup();
      this.overlayMouseListenersCleanup = null;
    }
  }

  private addDescribedBy(): void {
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

  private removeDescribedBy(): void {
    const host = this.elementRef.nativeElement;
    const current = host.getAttribute('aria-describedby');
    if (!current) return;
    const ids = current
      .split(/\s+/)
      .filter(Boolean)
      .filter((id) => id !== this.tooltipId);
    if (ids.length > 0) {
      host.setAttribute('aria-describedby', ids.join(' '));
    } else {
      host.removeAttribute('aria-describedby');
    }
  }

  private clearShowTimer(): void {
    if (this.showTimer) {
      clearTimeout(this.showTimer);
      this.showTimer = null;
    }
  }

  private clearHideTimer(): void {
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }
  }

  ngOnDestroy(): void {
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
}
