import { Directive, Input, } from '@angular/core';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { merge } from 'es-toolkit';
import PerfectScrollbar from 'perfect-scrollbar';
import { debounceTime, fromEvent, Subject, takeUntil } from 'rxjs';
import { ScrollbarGeometry, ScrollbarPosition } from './scrollbar.types';
import * as i0 from "@angular/core";
import * as i1 from "@angular/cdk/platform";
/**
 * Wrapper directive for the Perfect Scrollbar:
 * https://github.com/mdbootstrap/perfect-scrollbar
 */
export class ScrollbarDirective {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2Nyb2xsYmFyLmRpcmVjdGl2ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9saWIvc2Nyb2xsYmFyLmRpcmVjdGl2ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQ0wsU0FBUyxFQUVULEtBQUssR0FLTixNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQWdCLHFCQUFxQixFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFHNUUsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLFlBQVksQ0FBQztBQUNuQyxPQUFPLGdCQUFnQixNQUFNLG1CQUFtQixDQUFDO0FBQ2pELE9BQU8sRUFBRSxZQUFZLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDbkUsT0FBTyxFQUFFLGlCQUFpQixFQUFFLGlCQUFpQixFQUFFLE1BQU0sbUJBQW1CLENBQUM7OztBQUV6RTs7O0dBR0c7QUFNSCxNQUFNLE9BQU8sa0JBQWtCO0lBZW5CO0lBQ0E7SUFmVixNQUFNLENBQUMsMkJBQTJCLENBQWU7SUFFeEMsU0FBUyxHQUFHLElBQUksQ0FBQztJQUNqQixnQkFBZ0IsQ0FBMkI7SUFFNUMsVUFBVSxDQUFTO0lBQ25CLFFBQVEsQ0FBMkI7SUFDbkMsR0FBRyxDQUFtQjtJQUN0QixlQUFlLEdBQWlCLElBQUksT0FBTyxFQUFPLENBQUM7SUFFM0Q7O09BRUc7SUFDSCxZQUNVLFdBQXVCLEVBQ3ZCLFNBQW1CO1FBRG5CLGdCQUFXLEdBQVgsV0FBVyxDQUFZO1FBQ3ZCLGNBQVMsR0FBVCxTQUFTLENBQVU7SUFDMUIsQ0FBQztJQUVKLHdHQUF3RztJQUN4RyxjQUFjO0lBQ2Qsd0dBQXdHO0lBRXhHLElBQUksVUFBVTtRQUNaLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQztJQUMxQixDQUFDO0lBRUQsSUFBSSxFQUFFO1FBQ0osT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDO0lBQ2xCLENBQUM7SUFF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RSxDQUFDO1lBQzlFLElBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO1lBQ3ZCLE9BQU87UUFDVCxDQUFDO1FBRUQsa0NBQWtDO1FBQ2xDLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLGFBQWEsRUFBRSxFQUFFLEdBQUcsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7SUFDeEYsQ0FBQztJQUVPLFFBQVE7UUFDZCw0QkFBNEI7UUFDNUIsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUNkLE9BQU87UUFDVCxDQUFDO1FBRUQsK0JBQStCO1FBQy9CLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLENBQUM7UUFFbkIsV0FBVztRQUNYLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBVyxDQUFDO0lBQ3pCLENBQUM7dUdBM1JVLGtCQUFrQjsyRkFBbEIsa0JBQWtCOzsyRkFBbEIsa0JBQWtCO2tCQUw5QixTQUFTO21CQUFDO29CQUNULFFBQVEsRUFBRSxhQUFhO29CQUN2QixRQUFRLEVBQUUsV0FBVztvQkFDckIsVUFBVSxFQUFFLElBQUk7aUJBQ2pCO3NHQUlVLFNBQVM7c0JBQWpCLEtBQUs7Z0JBQ0csZ0JBQWdCO3NCQUF4QixLQUFLIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgRGlyZWN0aXZlLFxuICBFbGVtZW50UmVmLFxuICBJbnB1dCxcbiAgT25DaGFuZ2VzLFxuICBPbkRlc3Ryb3ksXG4gIE9uSW5pdCxcbiAgU2ltcGxlQ2hhbmdlcyxcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBCb29sZWFuSW5wdXQsIGNvZXJjZUJvb2xlYW5Qcm9wZXJ0eSB9IGZyb20gJ0Bhbmd1bGFyL2Nkay9jb2VyY2lvbic7XG5pbXBvcnQgeyBQbGF0Zm9ybSB9IGZyb20gJ0Bhbmd1bGFyL2Nkay9wbGF0Zm9ybSc7XG5cbmltcG9ydCB7IG1lcmdlIH0gZnJvbSAnZXMtdG9vbGtpdCc7XG5pbXBvcnQgUGVyZmVjdFNjcm9sbGJhciBmcm9tICdwZXJmZWN0LXNjcm9sbGJhcic7XG5pbXBvcnQgeyBkZWJvdW5jZVRpbWUsIGZyb21FdmVudCwgU3ViamVjdCwgdGFrZVVudGlsIH0gZnJvbSAncnhqcyc7XG5pbXBvcnQgeyBTY3JvbGxiYXJHZW9tZXRyeSwgU2Nyb2xsYmFyUG9zaXRpb24gfSBmcm9tICcuL3Njcm9sbGJhci50eXBlcyc7XG5cbi8qKlxuICogV3JhcHBlciBkaXJlY3RpdmUgZm9yIHRoZSBQZXJmZWN0IFNjcm9sbGJhcjpcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9tZGJvb3RzdHJhcC9wZXJmZWN0LXNjcm9sbGJhclxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbc2Nyb2xsYmFyXScsXG4gIGV4cG9ydEFzOiAnc2Nyb2xsYmFyJyxcbiAgc3RhbmRhbG9uZTogdHJ1ZSxcbn0pXG5leHBvcnQgY2xhc3MgU2Nyb2xsYmFyRGlyZWN0aXZlIGltcGxlbWVudHMgT25DaGFuZ2VzLCBPbkluaXQsIE9uRGVzdHJveSB7XG4gIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zY3JvbGxiYXI6IEJvb2xlYW5JbnB1dDtcblxuICBASW5wdXQoKSBzY3JvbGxiYXIgPSB0cnVlO1xuICBASW5wdXQoKSBzY3JvbGxiYXJPcHRpb25zOiBQZXJmZWN0U2Nyb2xsYmFyLk9wdGlvbnM7XG5cbiAgcHJpdmF0ZSBfYW5pbWF0aW9uOiBudW1iZXI7XG4gIHByaXZhdGUgX29wdGlvbnM6IFBlcmZlY3RTY3JvbGxiYXIuT3B0aW9ucztcbiAgcHJpdmF0ZSBfcHM6IFBlcmZlY3RTY3JvbGxiYXI7XG4gIHByaXZhdGUgX3Vuc3Vic2NyaWJlQWxsOiBTdWJqZWN0PGFueT4gPSBuZXcgU3ViamVjdDxhbnk+KCk7XG5cbiAgLyoqXG4gICAqIENvbnN0cnVjdG9yXG4gICAqL1xuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIF9lbGVtZW50UmVmOiBFbGVtZW50UmVmLFxuICAgIHByaXZhdGUgX3BsYXRmb3JtOiBQbGF0Zm9ybVxuICApIHt9XG5cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gQCBBY2Nlc3NvcnNcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICBnZXQgZWxlbWVudFJlZigpOiBFbGVtZW50UmVmIHtcbiAgICByZXR1cm4gdGhpcy5fZWxlbWVudFJlZjtcbiAgfVxuXG4gIGdldCBwcygpOiBQZXJmZWN0U2Nyb2xsYmFyIHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuX3BzO1xuICB9XG5cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gQCBMaWZlY3ljbGUgaG9va3NcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICBuZ09uQ2hhbmdlcyhjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKTogdm9pZCB7XG4gICAgLy8gRW5hYmxlZFxuICAgIGlmICgnc2Nyb2xsYmFyJyBpbiBjaGFuZ2VzKSB7XG4gICAgICAvLyBJbnRlcnByZXQgZW1wdHkgc3RyaW5nIGFzICd0cnVlJ1xuICAgICAgdGhpcy5zY3JvbGxiYXIgPSBjb2VyY2VCb29sZWFuUHJvcGVydHkoY2hhbmdlc1snc2Nyb2xsYmFyJ10uY3VycmVudFZhbHVlKTtcblxuICAgICAgLy8gSWYgZW5hYmxlZCwgaW5pdCB0aGUgZGlyZWN0aXZlXG4gICAgICBpZiAodGhpcy5zY3JvbGxiYXIpIHtcbiAgICAgICAgdGhpcy5faW5pdCgpO1xuICAgICAgfVxuICAgICAgLy8gT3RoZXJ3aXNlIGRlc3Ryb3kgaXRcbiAgICAgIGVsc2Uge1xuICAgICAgICB0aGlzLl9kZXN0cm95KCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gU2Nyb2xsYmFyIG9wdGlvbnNcbiAgICBpZiAoJ3Njcm9sbGJhck9wdGlvbnMnIGluIGNoYW5nZXMpIHtcbiAgICAgIC8vIE1lcmdlIHRoZSBvcHRpb25zXG4gICAgICB0aGlzLl9vcHRpb25zID0gbWVyZ2UodGhpcy5fb3B0aW9ucyB8fCB7fSwgY2hhbmdlc1snc2Nyb2xsYmFyT3B0aW9ucyddLmN1cnJlbnRWYWx1ZSk7XG5cbiAgICAgIC8vIFJldHVybiBpZiBub3QgaW5pdGlhbGl6ZWRcbiAgICAgIGlmICghdGhpcy5fcHMpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBEZXN0cm95IGFuZCByZS1pbml0IHRoZSBQZXJmZWN0U2Nyb2xsYmFyIHRvIHVwZGF0ZSBpdHMgb3B0aW9uc1xuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHRoaXMuX2Rlc3Ryb3koKTtcbiAgICAgIH0pO1xuXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgdGhpcy5faW5pdCgpO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgbmdPbkluaXQoKTogdm9pZCB7XG4gICAgLy8gU3Vic2NyaWJlIHRvIHdpbmRvdyByZXNpemUgZXZlbnRcbiAgICBmcm9tRXZlbnQod2luZG93LCAncmVzaXplJylcbiAgICAgIC5waXBlKHRha2VVbnRpbCh0aGlzLl91bnN1YnNjcmliZUFsbCksIGRlYm91bmNlVGltZSgxNTApKVxuICAgICAgLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICAgIC8vIFVwZGF0ZSB0aGUgUGVyZmVjdFNjcm9sbGJhclxuICAgICAgICB0aGlzLnVwZGF0ZSgpO1xuICAgICAgfSk7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpOiB2b2lkIHtcbiAgICB0aGlzLl9kZXN0cm95KCk7XG5cbiAgICAvLyBVbnN1YnNjcmliZSBmcm9tIGFsbCBzdWJzY3JpcHRpb25zXG4gICAgdGhpcy5fdW5zdWJzY3JpYmVBbGwubmV4dChudWxsKTtcbiAgICB0aGlzLl91bnN1YnNjcmliZUFsbC5jb21wbGV0ZSgpO1xuICB9XG5cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gQCBQdWJsaWMgbWV0aG9kc1xuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIGlzRW5hYmxlZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5zY3JvbGxiYXI7XG4gIH1cblxuICB1cGRhdGUoKTogdm9pZCB7XG4gICAgLy8gUmV0dXJuIGlmIG5vdCBpbml0aWFsaXplZFxuICAgIGlmICghdGhpcy5fcHMpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBVcGRhdGUgdGhlIFBlcmZlY3RTY3JvbGxiYXJcbiAgICB0aGlzLl9wcy51cGRhdGUoKTtcbiAgfVxuXG4gIGRlc3Ryb3koKTogdm9pZCB7XG4gICAgdGhpcy5uZ09uRGVzdHJveSgpO1xuICB9XG5cbiAgZ2VvbWV0cnkocHJlZml4ID0gJ3Njcm9sbCcpOiBTY3JvbGxiYXJHZW9tZXRyeSB7XG4gICAgcmV0dXJuIG5ldyBTY3JvbGxiYXJHZW9tZXRyeShcbiAgICAgIHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudFtwcmVmaXggKyAnTGVmdCddLFxuICAgICAgdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50W3ByZWZpeCArICdUb3AnXSxcbiAgICAgIHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudFtwcmVmaXggKyAnV2lkdGgnXSxcbiAgICAgIHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudFtwcmVmaXggKyAnSGVpZ2h0J11cbiAgICApO1xuICB9XG5cbiAgcG9zaXRpb24oYWJzb2x1dGUgPSBmYWxzZSk6IFNjcm9sbGJhclBvc2l0aW9uIHtcbiAgICBsZXQgc2Nyb2xsYmFyUG9zaXRpb247XG5cbiAgICBpZiAoIWFic29sdXRlICYmIHRoaXMuX3BzKSB7XG4gICAgICBzY3JvbGxiYXJQb3NpdGlvbiA9IG5ldyBTY3JvbGxiYXJQb3NpdGlvbih0aGlzLl9wcy5yZWFjaC54IHx8IDAsIHRoaXMuX3BzLnJlYWNoLnkgfHwgMCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHNjcm9sbGJhclBvc2l0aW9uID0gbmV3IFNjcm9sbGJhclBvc2l0aW9uKFxuICAgICAgICB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQuc2Nyb2xsTGVmdCxcbiAgICAgICAgdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LnNjcm9sbFRvcFxuICAgICAgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gc2Nyb2xsYmFyUG9zaXRpb247XG4gIH1cblxuICBzY3JvbGxUbyh4OiBudW1iZXIsIHk/OiBudW1iZXIsIHNwZWVkPzogbnVtYmVyKTogdm9pZCB7XG4gICAgaWYgKHkgPT0gbnVsbCAmJiBzcGVlZCA9PSBudWxsKSB7XG4gICAgICB0aGlzLmFuaW1hdGVTY3JvbGxpbmcoJ3Njcm9sbFRvcCcsIHgsIHNwZWVkKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHggIT0gbnVsbCkge1xuICAgICAgICB0aGlzLmFuaW1hdGVTY3JvbGxpbmcoJ3Njcm9sbExlZnQnLCB4LCBzcGVlZCk7XG4gICAgICB9XG5cbiAgICAgIGlmICh5ICE9IG51bGwpIHtcbiAgICAgICAgdGhpcy5hbmltYXRlU2Nyb2xsaW5nKCdzY3JvbGxUb3AnLCB5LCBzcGVlZCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgc2Nyb2xsVG9YKHg6IG51bWJlciwgc3BlZWQ/OiBudW1iZXIpOiB2b2lkIHtcbiAgICB0aGlzLmFuaW1hdGVTY3JvbGxpbmcoJ3Njcm9sbExlZnQnLCB4LCBzcGVlZCk7XG4gIH1cblxuICBzY3JvbGxUb1koeTogbnVtYmVyLCBzcGVlZD86IG51bWJlcik6IHZvaWQge1xuICAgIHRoaXMuYW5pbWF0ZVNjcm9sbGluZygnc2Nyb2xsVG9wJywgeSwgc3BlZWQpO1xuICB9XG5cbiAgc2Nyb2xsVG9Ub3Aob2Zmc2V0ID0gMCwgc3BlZWQ/OiBudW1iZXIpOiB2b2lkIHtcbiAgICB0aGlzLmFuaW1hdGVTY3JvbGxpbmcoJ3Njcm9sbFRvcCcsIG9mZnNldCwgc3BlZWQpO1xuICB9XG5cbiAgc2Nyb2xsVG9Cb3R0b20ob2Zmc2V0ID0gMCwgc3BlZWQ/OiBudW1iZXIpOiB2b2lkIHtcbiAgICBjb25zdCB0b3AgPVxuICAgICAgdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LnNjcm9sbEhlaWdodCAtIHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudC5jbGllbnRIZWlnaHQ7XG4gICAgdGhpcy5hbmltYXRlU2Nyb2xsaW5nKCdzY3JvbGxUb3AnLCB0b3AgLSBvZmZzZXQsIHNwZWVkKTtcbiAgfVxuXG4gIHNjcm9sbFRvTGVmdChvZmZzZXQgPSAwLCBzcGVlZD86IG51bWJlcik6IHZvaWQge1xuICAgIHRoaXMuYW5pbWF0ZVNjcm9sbGluZygnc2Nyb2xsTGVmdCcsIG9mZnNldCwgc3BlZWQpO1xuICB9XG5cbiAgc2Nyb2xsVG9SaWdodChvZmZzZXQgPSAwLCBzcGVlZD86IG51bWJlcik6IHZvaWQge1xuICAgIGNvbnN0IGxlZnQgPVxuICAgICAgdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LnNjcm9sbFdpZHRoIC0gdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LmNsaWVudFdpZHRoO1xuICAgIHRoaXMuYW5pbWF0ZVNjcm9sbGluZygnc2Nyb2xsTGVmdCcsIGxlZnQgLSBvZmZzZXQsIHNwZWVkKTtcbiAgfVxuXG4gIHNjcm9sbFRvRWxlbWVudChxczogc3RyaW5nLCBvZmZzZXQgPSAwLCBpZ25vcmVWaXNpYmxlID0gZmFsc2UsIHNwZWVkPzogbnVtYmVyKTogdm9pZCB7XG4gICAgY29uc3QgZWxlbWVudCA9IHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudC5xdWVyeVNlbGVjdG9yKHFzKTtcblxuICAgIGlmICghZWxlbWVudCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGVsZW1lbnRQb3MgPSBlbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIGNvbnN0IHNjcm9sbGVyUG9zID0gdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXG4gICAgaWYgKHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoJ3BzLS1hY3RpdmUteCcpKSB7XG4gICAgICBpZiAoaWdub3JlVmlzaWJsZSAmJiBlbGVtZW50UG9zLnJpZ2h0IDw9IHNjcm9sbGVyUG9zLnJpZ2h0IC0gTWF0aC5hYnMob2Zmc2V0KSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGN1cnJlbnRQb3MgPSB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnRbJ3Njcm9sbExlZnQnXTtcbiAgICAgIGNvbnN0IHBvc2l0aW9uID0gZWxlbWVudFBvcy5sZWZ0IC0gc2Nyb2xsZXJQb3MubGVmdCArIGN1cnJlbnRQb3M7XG5cbiAgICAgIHRoaXMuYW5pbWF0ZVNjcm9sbGluZygnc2Nyb2xsTGVmdCcsIHBvc2l0aW9uICsgb2Zmc2V0LCBzcGVlZCk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoJ3BzLS1hY3RpdmUteScpKSB7XG4gICAgICBpZiAoaWdub3JlVmlzaWJsZSAmJiBlbGVtZW50UG9zLmJvdHRvbSA8PSBzY3JvbGxlclBvcy5ib3R0b20gLSBNYXRoLmFicyhvZmZzZXQpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgY29uc3QgY3VycmVudFBvcyA9IHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudFsnc2Nyb2xsVG9wJ107XG4gICAgICBjb25zdCBwb3NpdGlvbiA9IGVsZW1lbnRQb3MudG9wIC0gc2Nyb2xsZXJQb3MudG9wICsgY3VycmVudFBvcztcblxuICAgICAgdGhpcy5hbmltYXRlU2Nyb2xsaW5nKCdzY3JvbGxUb3AnLCBwb3NpdGlvbiArIG9mZnNldCwgc3BlZWQpO1xuICAgIH1cbiAgfVxuXG4gIGFuaW1hdGVTY3JvbGxpbmcodGFyZ2V0OiBzdHJpbmcsIHZhbHVlOiBudW1iZXIsIHNwZWVkPzogbnVtYmVyKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX2FuaW1hdGlvbikge1xuICAgICAgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lKHRoaXMuX2FuaW1hdGlvbik7XG4gICAgICB0aGlzLl9hbmltYXRpb24gPSBudWxsIGFzIGFueTtcbiAgICB9XG5cbiAgICBpZiAoIXNwZWVkIHx8IHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnRbdGFyZ2V0XSA9IHZhbHVlO1xuICAgIH0gZWxzZSBpZiAodmFsdWUgIT09IHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudFt0YXJnZXRdKSB7XG4gICAgICBsZXQgbmV3VmFsdWUgPSAwO1xuICAgICAgbGV0IHNjcm9sbENvdW50ID0gMDtcblxuICAgICAgbGV0IG9sZFRpbWVzdGFtcCA9IHBlcmZvcm1hbmNlLm5vdygpO1xuICAgICAgbGV0IG9sZFZhbHVlID0gdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50W3RhcmdldF07XG5cbiAgICAgIGNvbnN0IGNvc1BhcmFtZXRlciA9IChvbGRWYWx1ZSAtIHZhbHVlKSAvIDI7XG5cbiAgICAgIGNvbnN0IHN0ZXAgPSAobmV3VGltZXN0YW1wOiBudW1iZXIpOiB2b2lkID0+IHtcbiAgICAgICAgc2Nyb2xsQ291bnQgKz0gTWF0aC5QSSAvIChzcGVlZCAvIChuZXdUaW1lc3RhbXAgLSBvbGRUaW1lc3RhbXApKTtcbiAgICAgICAgbmV3VmFsdWUgPSBNYXRoLnJvdW5kKHZhbHVlICsgY29zUGFyYW1ldGVyICsgY29zUGFyYW1ldGVyICogTWF0aC5jb3Moc2Nyb2xsQ291bnQpKTtcblxuICAgICAgICAvLyBPbmx5IGNvbnRpbnVlIGFuaW1hdGlvbiBpZiBzY3JvbGwgcG9zaXRpb24gaGFzIG5vdCBjaGFuZ2VkXG4gICAgICAgIGlmICh0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnRbdGFyZ2V0XSA9PT0gb2xkVmFsdWUpIHtcbiAgICAgICAgICBpZiAoc2Nyb2xsQ291bnQgPj0gTWF0aC5QSSkge1xuICAgICAgICAgICAgdGhpcy5hbmltYXRlU2Nyb2xsaW5nKHRhcmdldCwgdmFsdWUsIDApO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnRbdGFyZ2V0XSA9IG5ld1ZhbHVlO1xuXG4gICAgICAgICAgICAvLyBPbiBhIHpvb21lZCBvdXQgcGFnZSB0aGUgcmVzdWx0aW5nIG9mZnNldCBtYXkgZGlmZmVyXG4gICAgICAgICAgICBvbGRWYWx1ZSA9IHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudFt0YXJnZXRdO1xuICAgICAgICAgICAgb2xkVGltZXN0YW1wID0gbmV3VGltZXN0YW1wO1xuXG4gICAgICAgICAgICB0aGlzLl9hbmltYXRpb24gPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKHN0ZXApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShzdGVwKTtcbiAgICB9XG4gIH1cblxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBAIFByaXZhdGUgbWV0aG9kc1xuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIHByaXZhdGUgX2luaXQoKTogdm9pZCB7XG4gICAgLy8gUmV0dXJuIGlmIGFscmVhZHkgaW5pdGlhbGl6ZWRcbiAgICBpZiAodGhpcy5fcHMpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBSZXR1cm4gaWYgb24gbW9iaWxlIG9yIG5vdCBvbiBicm93c2VyXG4gICAgaWYgKHRoaXMuX3BsYXRmb3JtLkFORFJPSUQgfHwgdGhpcy5fcGxhdGZvcm0uSU9TIHx8ICF0aGlzLl9wbGF0Zm9ybS5pc0Jyb3dzZXIpIHtcbiAgICAgIHRoaXMuc2Nyb2xsYmFyID0gZmFsc2U7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gSW5pdGlhbGl6ZSB0aGUgUGVyZmVjdFNjcm9sbGJhclxuICAgIHRoaXMuX3BzID0gbmV3IFBlcmZlY3RTY3JvbGxiYXIodGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LCB7IC4uLnRoaXMuX29wdGlvbnMgfSk7XG4gIH1cblxuICBwcml2YXRlIF9kZXN0cm95KCk6IHZvaWQge1xuICAgIC8vIFJldHVybiBpZiBub3QgaW5pdGlhbGl6ZWRcbiAgICBpZiAoIXRoaXMuX3BzKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gRGVzdHJveSB0aGUgUGVyZmVjdFNjcm9sbGJhclxuICAgIHRoaXMuX3BzLmRlc3Ryb3koKTtcblxuICAgIC8vIENsZWFuIHVwXG4gICAgdGhpcy5fcHMgPSBudWxsIGFzIGFueTtcbiAgfVxufVxuIl19