import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';
import { Platform } from '@angular/cdk/platform';
import {
  Directive,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';

import { merge } from 'es-toolkit';
import PerfectScrollbar from 'perfect-scrollbar';
import { debounceTime, fromEvent, Subject, takeUntil } from 'rxjs';
import { ScrollbarGeometry, ScrollbarPosition } from './scrollbar.types';

/**
 * Wrapper directive for the Perfect Scrollbar:
 * https://github.com/mdbootstrap/perfect-scrollbar
 */
@Directive({
  selector: '[scrollbar]',
  exportAs: 'scrollbar',
  standalone: true,
})
export class ScrollbarDirective implements OnChanges, OnInit, OnDestroy {
  static ngAcceptInputType_scrollbar: BooleanInput;

  @Input() scrollbar = true;
  @Input() scrollbarOptions: PerfectScrollbar.Options;

  private _animation: number;
  private _options: PerfectScrollbar.Options;
  private _ps: PerfectScrollbar;
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  /**
   * Constructor
   */
  constructor(
    private _elementRef: ElementRef,
    private _platform: Platform
  ) {}

  // -----------------------------------------------------------------------------------------------------
  // @ Accessors
  // -----------------------------------------------------------------------------------------------------

  get elementRef(): ElementRef {
    return this._elementRef;
  }

  get ps(): PerfectScrollbar | null {
    return this._ps;
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  ngOnChanges(changes: SimpleChanges): void {
    // Enabled
    if ('scrollbar' in changes) {
      // Interpret empty string as 'true'
      this.scrollbar = coerceBooleanProperty(changes['scrollbar'].currentValue);

      // If enabled, init the directive
      if (this.scrollbar) {
        this._init();
      }
      // Otherwise destroy it
      else {
        this._destroy();
      }
    }

    // Scrollbar options
    if ('scrollbarOptions' in changes) {
      // Merge the options
      this._options = merge(this._options || {}, changes['scrollbarOptions'].currentValue);

      // Return if not initialized
      if (!this._ps) {
        return;
      }

      // Destroy and re-init the PerfectScrollbar to update its options
      setTimeout(() => {
        this._destroy();
      });

      setTimeout(() => {
        this._init();
      });
    }
  }

  ngOnInit(): void {
    // Subscribe to window resize event
    fromEvent(window, 'resize')
      .pipe(takeUntil(this._unsubscribeAll), debounceTime(150))
      .subscribe(() => {
        // Update the PerfectScrollbar
        this.update();
      });
  }

  ngOnDestroy(): void {
    this._destroy();

    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  isEnabled(): boolean {
    return this.scrollbar;
  }

  update(): void {
    // Return if not initialized
    if (!this._ps) {
      return;
    }

    // Update the PerfectScrollbar
    this._ps.update();
  }

  destroy(): void {
    this.ngOnDestroy();
  }

  geometry(prefix = 'scroll'): ScrollbarGeometry {
    return new ScrollbarGeometry(
      this._elementRef.nativeElement[prefix + 'Left'],
      this._elementRef.nativeElement[prefix + 'Top'],
      this._elementRef.nativeElement[prefix + 'Width'],
      this._elementRef.nativeElement[prefix + 'Height']
    );
  }

  position(absolute = false): ScrollbarPosition {
    let scrollbarPosition;

    if (!absolute && this._ps) {
      scrollbarPosition = new ScrollbarPosition(this._ps.reach.x || 0, this._ps.reach.y || 0);
    } else {
      scrollbarPosition = new ScrollbarPosition(
        this._elementRef.nativeElement.scrollLeft,
        this._elementRef.nativeElement.scrollTop
      );
    }

    return scrollbarPosition;
  }

  scrollTo(x: number, y?: number, speed?: number): void {
    if (y == null && speed == null) {
      this.animateScrolling('scrollTop', x, speed);
    } else {
      if (x != null) {
        this.animateScrolling('scrollLeft', x, speed);
      }

      if (y != null) {
        this.animateScrolling('scrollTop', y, speed);
      }
    }
  }

  scrollToX(x: number, speed?: number): void {
    this.animateScrolling('scrollLeft', x, speed);
  }

  scrollToY(y: number, speed?: number): void {
    this.animateScrolling('scrollTop', y, speed);
  }

  scrollToTop(offset = 0, speed?: number): void {
    this.animateScrolling('scrollTop', offset, speed);
  }

  scrollToBottom(offset = 0, speed?: number): void {
    const top =
      this._elementRef.nativeElement.scrollHeight - this._elementRef.nativeElement.clientHeight;
    this.animateScrolling('scrollTop', top - offset, speed);
  }

  scrollToLeft(offset = 0, speed?: number): void {
    this.animateScrolling('scrollLeft', offset, speed);
  }

  scrollToRight(offset = 0, speed?: number): void {
    const left =
      this._elementRef.nativeElement.scrollWidth - this._elementRef.nativeElement.clientWidth;
    this.animateScrolling('scrollLeft', left - offset, speed);
  }

  scrollToElement(qs: string, offset = 0, ignoreVisible = false, speed?: number): void {
    const element = this._elementRef.nativeElement.querySelector(qs);

    if (!element) {
      return;
    }

    const elementPos = element.getBoundingClientRect();
    const scrollerPos = this._elementRef.nativeElement.getBoundingClientRect();

    if (this._elementRef.nativeElement.classList.contains('ps--active-x')) {
      if (ignoreVisible && elementPos.right <= scrollerPos.right - Math.abs(offset)) {
        return;
      }

      const currentPos = this._elementRef.nativeElement['scrollLeft'];
      const position = elementPos.left - scrollerPos.left + currentPos;

      this.animateScrolling('scrollLeft', position + offset, speed);
    }

    if (this._elementRef.nativeElement.classList.contains('ps--active-y')) {
      if (ignoreVisible && elementPos.bottom <= scrollerPos.bottom - Math.abs(offset)) {
        return;
      }

      const currentPos = this._elementRef.nativeElement['scrollTop'];
      const position = elementPos.top - scrollerPos.top + currentPos;

      this.animateScrolling('scrollTop', position + offset, speed);
    }
  }

  animateScrolling(target: string, value: number, speed?: number): void {
    if (this._animation) {
      window.cancelAnimationFrame(this._animation);
      this._animation = null as any;
    }

    if (!speed || typeof window === 'undefined') {
      this._elementRef.nativeElement[target] = value;
    } else if (value !== this._elementRef.nativeElement[target]) {
      let newValue = 0;
      let scrollCount = 0;

      let oldTimestamp = performance.now();
      let oldValue = this._elementRef.nativeElement[target];

      const cosParameter = (oldValue - value) / 2;

      const step = (newTimestamp: number): void => {
        scrollCount += Math.PI / (speed / (newTimestamp - oldTimestamp));
        newValue = Math.round(value + cosParameter + cosParameter * Math.cos(scrollCount));

        // Only continue animation if scroll position has not changed
        if (this._elementRef.nativeElement[target] === oldValue) {
          if (scrollCount >= Math.PI) {
            this.animateScrolling(target, value, 0);
          } else {
            this._elementRef.nativeElement[target] = newValue;

            // On a zoomed out page the resulting offset may differ
            oldValue = this._elementRef.nativeElement[target];
            oldTimestamp = newTimestamp;

            this._animation = window.requestAnimationFrame(step);
          }
        }
      };

      window.requestAnimationFrame(step);
    }
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------

  private _init(): void {
    // Return if already initialized
    if (this._ps) {
      return;
    }

    // Return if on mobile or not on browser
    if (this._platform.ANDROID || this._platform.IOS || !this._platform.isBrowser) {
      this.scrollbar = false;
      return;
    }

    // Initialize the PerfectScrollbar
    this._ps = new PerfectScrollbar(this._elementRef.nativeElement, { ...this._options });
  }

  private _destroy(): void {
    // Return if not initialized
    if (!this._ps) {
      return;
    }

    // Destroy the PerfectScrollbar
    this._ps.destroy();

    // Clean up
    this._ps = null as any;
  }
}
