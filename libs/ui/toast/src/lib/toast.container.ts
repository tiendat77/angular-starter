import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ComponentRef,
  ElementRef,
  EmbeddedViewRef,
  NgZone,
  OnDestroy,
  ViewChild,
  inject,
} from '@angular/core';

import {
  BasePortalOutlet,
  CdkPortalOutlet,
  ComponentPortal,
  DomPortal,
  TemplatePortal,
} from '@angular/cdk/portal';

import { prefersReducedMotion } from '@libs/ui/core';
import { Observable, Subject } from 'rxjs';

@Component({
  selector: 'toast-container',
  template: '<ng-template cdkPortalOutlet />',
  styleUrl: './toast.container.scss',
  imports: [CdkPortalOutlet],
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {
    class: 'm-4 flex flex-col',
    '(animationstart)': '_handleAnimationEvent($event)',
    '(animationend)': '_handleAnimationEvent($event)',
    '(animationcancel)': '_handleAnimationEvent($event)',
  },
})
export class ToastContainerComponent extends BasePortalOutlet implements OnDestroy {
  private _elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private _ngZone = inject(NgZone);
  private _changeDetectorRef = inject(ChangeDetectorRef);

  /** Whether the component has been destroyed. */
  private _destroyed = false;

  /** The portal outlet inside of this container into which the toast content will be loaded. */
  @ViewChild(CdkPortalOutlet, { static: true }) _portalOutlet: CdkPortalOutlet;

  /** Subject for notifying that the toast has exited from view. */
  readonly _onExit = new Subject<void>();

  /** Subject for notifying that the toast has finished entering the view. */
  readonly _onEnter = new Subject<void>();

  /** The state of the toast animations. */
  _animationState: 'void' | 'visible' | 'hidden' = 'void';

  /** Settles the current state when no animation events come (reduced motion, tests, ...). */
  private _animationFallback: ReturnType<typeof setTimeout> | undefined;

  attachComponentPortal<T>(portal: ComponentPortal<T>): ComponentRef<T> {
    const result = this._portalOutlet.attachComponentPortal(portal);
    return result;
  }

  attachTemplatePortal<C>(portal: TemplatePortal<C>): EmbeddedViewRef<C> {
    const result = this._portalOutlet.attachTemplatePortal(portal);
    return result;
  }

  override attachDomPortal = (portal: DomPortal) => {
    const result = this._portalOutlet.attachDomPortal(portal);
    return result;
  };

  /** Moves to `state`; the animation of `toast.container.scss` reports back through its events. */
  private _play(state: 'visible' | 'hidden') {
    const element = this._elementRef.nativeElement;

    this._animationState = state;
    element.classList.toggle('toast-enter', state === 'visible');
    element.classList.toggle('toast-leave', state === 'hidden');

    // An animation that never starts sends no events, so give up waiting if none starts.
    clearTimeout(this._animationFallback);
    this._animationFallback = setTimeout(
      () => this._settle(state),
      prefersReducedMotion() ? 0 : 200
    );
  }

  _handleAnimationEvent(event: AnimationEvent) {
    const state = this._animationState;

    // Only the animation of the current state counts (not the enter that an exit cancelled).
    if (
      event.target !== this._elementRef.nativeElement ||
      state === 'void' ||
      event.animationName.includes('toast-out') !== (state === 'hidden')
    ) {
      return;
    }

    if (event.type === 'animationstart') {
      clearTimeout(this._animationFallback);
    } else {
      this._settle(state);
    }
  }

  private _settle(state: 'visible' | 'hidden') {
    if (state !== this._animationState) {
      return;
    }
    clearTimeout(this._animationFallback);

    if (state === 'hidden') {
      this._completeExit();
    } else {
      const onEnter = this._onEnter;

      this._ngZone.run(() => {
        onEnter.next();
        onEnter.complete();
      });
    }
  }

  enter(): void {
    if (!this._destroyed) {
      this._play('visible');
      this._changeDetectorRef.detectChanges();
    }
  }

  exit(): Observable<void> {
    if (this._animationState === 'void') {
      // Never shown, so there is nothing to animate out.
      this._animationState = 'hidden';
      this._completeExit();
    } else {
      this._ngZone.run(() => this._play('hidden'));
    }

    return this._onExit;
  }

  ngOnDestroy() {
    this._destroyed = true;
    clearTimeout(this._animationFallback);
    this._completeExit();
  }

  private _completeExit() {
    queueMicrotask(() => {
      this._onExit.next();
      this._onExit.complete();
    });
  }
}
