import { ScrollStrategy, ScrollStrategyOptions } from '@angular/cdk/overlay';
import {
  AfterViewInit,
  booleanAttribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  model,
  OnDestroy,
  OnInit,
  output,
  Renderer2,
  signal,
  untracked,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';

import { prefersReducedMotion } from '@libs/ui/core';
import { NavigationService } from '../navigation.service';
import { UtilsHelper } from '../utils.helper';

import { VerticalNavigationAsideItemComponent } from './components/aside/aside.component';
import { VerticalNavigationBasicItemComponent } from './components/basic/basic.component';
import { VerticalNavigationCollapsableItemComponent } from './components/collapsable/collapsable.component';
import { VerticalNavigationDividerItemComponent } from './components/divider/divider.component';
import { VerticalNavigationGroupItemComponent } from './components/group/group.component';
import { VerticalNavigationSpacerItemComponent } from './components/spacer/spacer.component';

import { ReplaySubject } from 'rxjs';
import { filter } from 'rxjs/operators';
import {
  NavigationItem,
  VerticalNavigationAppearance,
  VerticalNavigationMode,
  VerticalNavigationPosition,
} from '../navigation.types';

@Component({
  selector: 'vertical-navigation',
  templateUrl: './vertical.component.html',
  styleUrls: ['./vertical.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  exportAs: 'verticalNavigation',
  imports: [
    VerticalNavigationBasicItemComponent,
    VerticalNavigationGroupItemComponent,
    VerticalNavigationAsideItemComponent,
    VerticalNavigationCollapsableItemComponent,
    VerticalNavigationDividerItemComponent,
    VerticalNavigationSpacerItemComponent,
  ],
  host: {
    '[class]': 'classList()',
    '[style.visibility]': "opened() ? 'visible' : 'hidden'",
    '(mouseenter)': 'onMouseenter()',
    '(mouseleave)': 'onMouseleave()',
  },
})
export class VerticalNavigationComponent implements OnInit, AfterViewInit, OnDestroy {
  readonly appearance = input<VerticalNavigationAppearance>('default');
  readonly autoCollapse = input(true);
  readonly inner = input(false, { transform: booleanAttribute });
  readonly mode = input<VerticalNavigationMode>('side');
  readonly name = input<string>(UtilsHelper.randomId());
  readonly navigation = input<NavigationItem[]>([]);
  /** Whether the navigation is open. Two-way: `open()`, `close()` and `toggle()` change it too. */
  readonly opened = model(true);
  readonly position = input<VerticalNavigationPosition>('left');
  readonly transparentOverlay = input(false, { transform: booleanAttribute });

  readonly appearanceChanged = output<VerticalNavigationAppearance>();
  readonly modeChanged = output<VerticalNavigationMode>();
  readonly openedChanged = output<boolean>();
  readonly positionChanged = output<VerticalNavigationPosition>();

  /** The `name` the items look this navigation up by; a random one when `name` is empty. */
  readonly $name = computed(() => this.name() || this._fallbackName);

  /** The id of the aside item whose panel is open. */
  readonly activeAsideItemId = signal<string | null>(null);

  onCollapsableItemCollapsed: ReplaySubject<NavigationItem> = new ReplaySubject<NavigationItem>(1);
  onCollapsableItemExpanded: ReplaySubject<NavigationItem> = new ReplaySubject<NavigationItem>(1);
  onRefreshed: ReplaySubject<boolean> = new ReplaySubject<boolean>(1);

  protected readonly classList = computed(() => ({
    'vertical-navigation-animations-enabled': this._animationsEnabled(),
    [`vertical-navigation-appearance-${this.appearance()}`]: true,
    'vertical-navigation-hover': this._hovered(),
    'vertical-navigation-inner': this.inner(),
    'vertical-navigation-mode-over': this.mode() === 'over',
    'vertical-navigation-mode-side': this.mode() === 'side',
    'vertical-navigation-opened': this.opened(),
    'vertical-navigation-position-left': this.position() === 'left',
    'vertical-navigation-position-right': this.position() === 'right',
  }));

  private readonly _navigationContentEl = viewChild<ElementRef<HTMLElement>>('navigationContent');

  private readonly _animationsEnabled = signal(false);
  private readonly _hovered = signal(false);
  private readonly _fallbackName = UtilsHelper.randomId();
  private _registeredName: string;
  private _asideOverlay: HTMLElement;
  private readonly _handleAsideOverlayClick: any;
  private readonly _handleOverlayClick: any;
  private _overlay: HTMLElement;
  private _scrollStrategy: ScrollStrategy;
  /** The mode the overlays were last set up for. */
  private _appliedMode: VerticalNavigationMode | undefined;
  /** The open state the overlay and the outputs were last brought in line with. */
  private _appliedOpened: boolean | undefined;

  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _destroyRef = inject(DestroyRef);
  private _elementRef = inject(ElementRef);
  private _renderer2 = inject(Renderer2);
  private _router = inject(Router);
  private _scrollStrategyOptions = inject(ScrollStrategyOptions);
  private _navigationService = inject(NavigationService);

  constructor() {
    this._handleAsideOverlayClick = (): void => {
      this.closeAside();
    };
    this._handleOverlayClick = (): void => {
      this.close();
    };
    this._scrollStrategy = this._scrollStrategyOptions.block();

    effect(() => {
      const appearance = this.appearance();
      untracked(() => this.appearanceChanged.emit(appearance));
    });
    effect(() => {
      const position = this.position();
      untracked(() => this.positionChanged.emit(position));
    });
    // The mode first: the overlay depends on it, and so does what an open state change does
    effect(() => {
      const mode = this.mode();
      untracked(() => this._applyMode(mode));
    });
    effect(() => {
      const opened = this.opened();
      untracked(() => this._applyOpened(opened));
    });
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Host listeners
  // -----------------------------------------------------------------------------------------------------

  onMouseenter(): void {
    // Enable the animations
    this._enableAnimations();

    // Set the hovered
    this._hovered.set(true);
  }

  onMouseleave(): void {
    // Enable the animations
    this._enableAnimations();

    // Set the hovered
    this._hovered.set(false);
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  ngOnInit(): void {
    // Register the navigation component
    this._registeredName = this.$name();
    this._navigationService.registerComponent(this._registeredName, this);

    // Subscribe to the 'NavigationEnd' event
    this._router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(this._destroyRef)
      )
      .subscribe(() => {
        // If the mode is 'over' and the navigation is opened...
        if (this.mode() === 'over' && this.opened()) {
          // Close the navigation
          this.close();
        }

        // If the mode is 'side' and the aside is active...
        if (this.mode() === 'side' && this.activeAsideItemId()) {
          // Close the aside
          this.closeAside();
        }
      });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      // Return if 'navigation content' element does not exist
      const content = this._navigationContentEl();
      if (!content) {
        return;
      }

      const activeItem = content.nativeElement.querySelector('.vertical-navigation-item-active');

      // If the active item exists, scroll it into view. `nearest`: an item that is already visible
      // must not move (the drawer is closed on a phone, and `start` would scroll its header away)
      if (activeItem) {
        activeItem.scrollIntoView({ block: 'nearest' });
      }
    });
  }

  ngOnDestroy(): void {
    // Forcefully close the navigation and aside in case they are opened
    this.close();
    this.closeAside();

    // Deregister the navigation component from the registry
    this._navigationService.deregisterComponent(this._registeredName);
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /** Re-renders the items after the app changed some of them in place (a badge, a title). */
  refresh(): void {
    // Mark for check
    this._changeDetectorRef.markForCheck();

    // Execute the observable
    this.onRefreshed.next(true);
  }

  open(): void {
    // Return if the navigation is already open
    if (this.opened()) {
      return;
    }

    // Set the opened
    this.opened.set(true);
    this._applyOpened(true);
  }

  close(): void {
    // Return if the navigation is already closed
    if (!this.opened()) {
      return;
    }

    // Close the aside
    this.closeAside();

    // Set the opened
    this.opened.set(false);
    this._applyOpened(false);
  }

  toggle(): void {
    // Toggle
    if (this.opened()) {
      this.close();
    } else {
      this.open();
    }
  }

  openAside(item: NavigationItem): void {
    // Return if the item is disabled
    if (item.disabled || !item.id) {
      return;
    }

    // Open
    this.activeAsideItemId.set(item.id);

    // Show the aside overlay
    this._showAsideOverlay();
  }

  closeAside(): void {
    // Close
    this.activeAsideItemId.set(null);

    // Hide the aside overlay
    this._hideAsideOverlay();
  }

  toggleAside(item: NavigationItem): void {
    // Toggle
    if (this.activeAsideItemId() === item.id) {
      this.closeAside();
    } else {
      this.openAside(item);
    }
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------

  private _enableAnimations(): void {
    this._animationsEnabled.set(true);
  }

  private _disableAnimations(): void {
    this._animationsEnabled.set(false);
  }

  /** Sets the overlays up for a new mode. */
  private _applyMode(mode: VerticalNavigationMode): void {
    const previousMode = this._appliedMode;
    this._appliedMode = mode;

    // Disable the animations
    this._disableAnimations();

    // If the mode changes: 'over -> side'
    if (previousMode === 'over' && mode === 'side') {
      // Hide the overlay
      this._hideOverlay();
    }

    // If the mode changes: 'side -> over'
    if (previousMode === 'side' && mode === 'over') {
      // Close the aside
      this.closeAside();

      // If the navigation is opened
      if (this.opened()) {
        // Show the overlay
        this._showOverlay();
      }
    }

    // Execute the observable
    this.modeChanged.emit(mode);

    // Enable the animations after a delay
    // The delay must be bigger than the current transition-duration
    // to make sure nothing will be animated while the mode changing
    setTimeout(() => {
      this._enableAnimations();
    }, 500);
  }

  /** Brings the overlay and the `openedChanged` output in line with the open state. */
  private _applyOpened(open: boolean): void {
    // `open()` / `close()` apply it right away; the effect then finds nothing left to do
    if (this._appliedOpened === open) {
      return;
    }
    this._appliedOpened = open;

    // Enable the animations
    this._enableAnimations();

    // If the navigation opened, and the mode
    // is 'over', show the overlay
    if (this.mode() === 'over') {
      if (open) {
        this._showOverlay();
      } else {
        this._hideOverlay();
      }
    }

    // Execute the observable
    this.openedChanged.emit(open);
  }

  /** Fades an overlay in: flushes its hidden state first so the class change is transitioned. */
  private _fadeIn(overlay: HTMLElement): void {
    void overlay.offsetWidth;
    overlay.classList.add('vertical-navigation-overlay-visible');
  }

  /** Fades an overlay out and resolves once the transition has finished. */
  private _fadeOut(overlay: HTMLElement): Promise<void> {
    overlay.classList.remove('vertical-navigation-overlay-visible');

    return new Promise((resolve) => {
      const done = () => {
        clearTimeout(fallback);
        overlay.removeEventListener('transitionrun', started);
        overlay.removeEventListener('transitionend', onEnd);
        overlay.removeEventListener('transitioncancel', onEnd);
        resolve();
      };
      const started = (event: Event) => event.target === overlay && clearTimeout(fallback);
      const onEnd = (event: Event) => event.target === overlay && done();

      // A transition that never runs (reduced motion, overlay not shown yet) sends no events.
      const fallback = setTimeout(done, prefersReducedMotion() ? 0 : 100);

      overlay.addEventListener('transitionrun', started);
      overlay.addEventListener('transitionend', onEnd);
      overlay.addEventListener('transitioncancel', onEnd);
    });
  }

  private _showOverlay(): void {
    // Return if there is already an overlay
    if (this._asideOverlay) {
      return;
    }

    // Create the overlay element
    this._overlay = this._renderer2.createElement('div');

    // Add a class to the overlay element
    this._overlay.classList.add('vertical-navigation-overlay');

    // Add a class depending on the transparentOverlay option
    if (this.transparentOverlay()) {
      this._overlay.classList.add('vertical-navigation-overlay-transparent');
    }

    // Append the overlay to the parent of the navigation
    this._renderer2.appendChild(this._elementRef.nativeElement.parentElement, this._overlay);

    // Enable block scroll strategy
    this._scrollStrategy.enable();

    // Fade the overlay in (the transition is defined in the stylesheet)
    this._fadeIn(this._overlay);

    // Add an event listener to the overlay
    this._overlay.addEventListener('click', this._handleOverlayClick);
  }

  private _hideOverlay(): void {
    if (!this._overlay) {
      return;
    }

    // Fade the overlay out and, once that is done...
    this._fadeOut(this._overlay).then(() => {
      // If the overlay still exists...
      if (this._overlay) {
        // Remove the event listener
        this._overlay.removeEventListener('click', this._handleOverlayClick);

        // Remove the overlay
        this._overlay.parentNode?.removeChild(this._overlay);
        this._overlay = null as any;
      }

      // Disable block scroll strategy
      this._scrollStrategy.disable();
    });
  }

  private _showAsideOverlay(): void {
    // Return if there is already an overlay
    if (this._asideOverlay) {
      return;
    }

    // Create the aside overlay element
    this._asideOverlay = this._renderer2.createElement('div');

    // Add a class to the aside overlay element
    this._asideOverlay.classList.add('vertical-navigation-aside-overlay');

    // Append the aside overlay to the parent of the navigation
    this._renderer2.appendChild(this._elementRef.nativeElement.parentElement, this._asideOverlay);

    // Fade the aside overlay in
    this._fadeIn(this._asideOverlay);

    // Add an event listener to the aside overlay
    this._asideOverlay.addEventListener('click', this._handleAsideOverlayClick);
  }

  private _hideAsideOverlay(): void {
    if (!this._asideOverlay) {
      return;
    }

    // Fade the aside overlay out and, once that is done...
    this._fadeOut(this._asideOverlay).then(() => {
      // If the aside overlay still exists...
      if (this._asideOverlay) {
        // Remove the event listener
        this._asideOverlay.removeEventListener('click', this._handleAsideOverlayClick);

        // Remove the aside overlay
        this._asideOverlay.parentNode?.removeChild(this._asideOverlay);
        this._asideOverlay = null as any;
      }
    });
  }
}
