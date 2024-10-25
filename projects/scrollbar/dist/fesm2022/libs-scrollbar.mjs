import * as i0 from '@angular/core';
import { Directive, Input } from '@angular/core';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { merge } from 'es-toolkit';
import PerfectScrollbar from 'perfect-scrollbar';
import { Subject, fromEvent, takeUntil, debounceTime } from 'rxjs';
import * as i1 from '@angular/cdk/platform';

class ScrollbarGeometry {
    x;
    y;
    w;
    h;
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }
}
class ScrollbarPosition {
    x;
    y;
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

/**
 * Wrapper directive for the Perfect Scrollbar:
 * https://github.com/mdbootstrap/perfect-scrollbar
 */
class ScrollbarDirective {
    _elementRef;
    _platform;
    static ngAcceptInputType_scrollbar;
    scrollbar = true;
    scrollbarOptions;
    _animation;
    _options;
    _ps;
    _unsubscribeAll = new Subject();
    /**
     * Constructor
     */
    constructor(_elementRef, _platform) {
        this._elementRef = _elementRef;
        this._platform = _platform;
    }
    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------
    get elementRef() {
        return this._elementRef;
    }
    get ps() {
        return this._ps;
    }
    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------
    ngOnChanges(changes) {
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
    ngOnInit() {
        // Subscribe to window resize event
        fromEvent(window, 'resize')
            .pipe(takeUntil(this._unsubscribeAll), debounceTime(150))
            .subscribe(() => {
            // Update the PerfectScrollbar
            this.update();
        });
    }
    ngOnDestroy() {
        this._destroy();
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }
    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------
    isEnabled() {
        return this.scrollbar;
    }
    update() {
        // Return if not initialized
        if (!this._ps) {
            return;
        }
        // Update the PerfectScrollbar
        this._ps.update();
    }
    destroy() {
        this.ngOnDestroy();
    }
    geometry(prefix = 'scroll') {
        return new ScrollbarGeometry(this._elementRef.nativeElement[prefix + 'Left'], this._elementRef.nativeElement[prefix + 'Top'], this._elementRef.nativeElement[prefix + 'Width'], this._elementRef.nativeElement[prefix + 'Height']);
    }
    position(absolute = false) {
        let scrollbarPosition;
        if (!absolute && this._ps) {
            scrollbarPosition = new ScrollbarPosition(this._ps.reach.x || 0, this._ps.reach.y || 0);
        }
        else {
            scrollbarPosition = new ScrollbarPosition(this._elementRef.nativeElement.scrollLeft, this._elementRef.nativeElement.scrollTop);
        }
        return scrollbarPosition;
    }
    scrollTo(x, y, speed) {
        if (y == null && speed == null) {
            this.animateScrolling('scrollTop', x, speed);
        }
        else {
            if (x != null) {
                this.animateScrolling('scrollLeft', x, speed);
            }
            if (y != null) {
                this.animateScrolling('scrollTop', y, speed);
            }
        }
    }
    scrollToX(x, speed) {
        this.animateScrolling('scrollLeft', x, speed);
    }
    scrollToY(y, speed) {
        this.animateScrolling('scrollTop', y, speed);
    }
    scrollToTop(offset = 0, speed) {
        this.animateScrolling('scrollTop', offset, speed);
    }
    scrollToBottom(offset = 0, speed) {
        const top = this._elementRef.nativeElement.scrollHeight - this._elementRef.nativeElement.clientHeight;
        this.animateScrolling('scrollTop', top - offset, speed);
    }
    scrollToLeft(offset = 0, speed) {
        this.animateScrolling('scrollLeft', offset, speed);
    }
    scrollToRight(offset = 0, speed) {
        const left = this._elementRef.nativeElement.scrollWidth - this._elementRef.nativeElement.clientWidth;
        this.animateScrolling('scrollLeft', left - offset, speed);
    }
    scrollToElement(qs, offset = 0, ignoreVisible = false, speed) {
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
    animateScrolling(target, value, speed) {
        if (this._animation) {
            window.cancelAnimationFrame(this._animation);
            this._animation = null;
        }
        if (!speed || typeof window === 'undefined') {
            this._elementRef.nativeElement[target] = value;
        }
        else if (value !== this._elementRef.nativeElement[target]) {
            let newValue = 0;
            let scrollCount = 0;
            let oldTimestamp = performance.now();
            let oldValue = this._elementRef.nativeElement[target];
            const cosParameter = (oldValue - value) / 2;
            const step = (newTimestamp) => {
                scrollCount += Math.PI / (speed / (newTimestamp - oldTimestamp));
                newValue = Math.round(value + cosParameter + cosParameter * Math.cos(scrollCount));
                // Only continue animation if scroll position has not changed
                if (this._elementRef.nativeElement[target] === oldValue) {
                    if (scrollCount >= Math.PI) {
                        this.animateScrolling(target, value, 0);
                    }
                    else {
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
    _init() {
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
    _destroy() {
        // Return if not initialized
        if (!this._ps) {
            return;
        }
        // Destroy the PerfectScrollbar
        this._ps.destroy();
        // Clean up
        this._ps = null;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: ScrollbarDirective, deps: [{ token: i0.ElementRef }, { token: i1.Platform }], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.8", type: ScrollbarDirective, isStandalone: true, selector: "[scrollbar]", inputs: { scrollbar: "scrollbar", scrollbarOptions: "scrollbarOptions" }, exportAs: ["scrollbar"], usesOnChanges: true, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: ScrollbarDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[scrollbar]',
                    exportAs: 'scrollbar',
                    standalone: true,
                }]
        }], ctorParameters: () => [{ type: i0.ElementRef }, { type: i1.Platform }], propDecorators: { scrollbar: [{
                type: Input
            }], scrollbarOptions: [{
                type: Input
            }] } });

/*
 * Public API Surface of scrollbar
 */

/**
 * Generated bundle index. Do not edit.
 */

export { ScrollbarDirective, ScrollbarGeometry, ScrollbarPosition };
//# sourceMappingURL=libs-scrollbar.mjs.map
