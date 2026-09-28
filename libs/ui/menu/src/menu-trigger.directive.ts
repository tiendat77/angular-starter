import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import {
  Directive,
  ElementRef,
  Injector,
  OnDestroy,
  TemplateRef,
  ViewContainerRef,
  booleanAttribute,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { Subscription, merge } from 'rxjs';
import { filter } from 'rxjs/operators';
import { getMenuPositions } from './menu.positions';
import {
  UI_MENU_CONFIG,
  UI_MENU_TRIGGER,
  UiMenuConfig,
  UiMenuPosition,
  UiMenuTrigger,
} from './menu.types';

let nextMenuId = 0;

@Directive({
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
})
export class UiMenuTriggerDirective implements UiMenuTrigger, OnDestroy {
  private readonly overlay = inject(Overlay);
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly config = inject<UiMenuConfig>(UI_MENU_CONFIG, { optional: true });

  readonly uiMenuTriggerFor = input.required<TemplateRef<unknown>>();
  readonly uiMenuPosition = input<UiMenuPosition | undefined>(undefined);
  readonly uiMenuDisabled = input(false, { transform: booleanAttribute });
  readonly uiMenuOffsetY = input<number | undefined>(undefined);

  readonly menuOpened = output<void>();
  readonly menuClosed = output<void>();

  readonly isOpen = signal(false);
  readonly focusDirection = signal<'first' | 'last'>('first');
  readonly menuId = signal(`ui-menu-${nextMenuId++}`);

  private overlayRef: OverlayRef | null = null;
  private closeSubscription: Subscription | null = null;

  readonly effectivePosition = computed<UiMenuPosition>(() => {
    return this.uiMenuPosition() ?? this.config?.position ?? 'bottom-start';
  });

  readonly effectiveOffsetY = computed<number>(() => {
    return this.uiMenuOffsetY() ?? this.config?.offsetY ?? 4;
  });

  open(focusDirection: 'first' | 'last' = 'first'): void {
    if (this.uiMenuDisabled() || this.isOpen()) return;

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

    const portal = new TemplatePortal(
      this.uiMenuTriggerFor(),
      this.viewContainerRef,
      { $implicit: { close: () => this.close() } },
      injector
    );

    this.overlayRef.attach(portal);
    this.isOpen.set(true);
    this.menuOpened.emit();

    this.closeSubscription = merge(
      this.overlayRef.backdropClick(),
      this.overlayRef.keydownEvents().pipe(filter((event) => event.key === 'Escape'))
    ).subscribe(() => {
      this.close();
    });
  }

  close(): void {
    if (!this.isOpen()) return;

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

  toggle(): void {
    if (this.isOpen()) {
      this.close();
    } else {
      this.open();
    }
  }

  handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.isOpen()) {
      event.preventDefault();
      this.close();
      return;
    }

    if (this.uiMenuDisabled()) return;

    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (!this.isOpen()) {
        this.open('first');
      }
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (!this.isOpen()) {
        this.open('last');
      }
    }
  }

  ngOnDestroy(): void {
    this.closeSubscription?.unsubscribe();
    if (this.overlayRef) {
      this.overlayRef.dispose();
      this.overlayRef = null;
    }
  }
}
