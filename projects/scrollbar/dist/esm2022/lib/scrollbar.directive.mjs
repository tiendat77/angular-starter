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
            this._options = merge(this._options, changes['scrollbarOptions'].currentValue);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2Nyb2xsYmFyLmRpcmVjdGl2ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9saWIvc2Nyb2xsYmFyLmRpcmVjdGl2ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQ0wsU0FBUyxFQUVULEtBQUssR0FLTixNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQWdCLHFCQUFxQixFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFHNUUsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLFlBQVksQ0FBQztBQUNuQyxPQUFPLGdCQUFnQixNQUFNLG1CQUFtQixDQUFDO0FBQ2pELE9BQU8sRUFBRSxZQUFZLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDbkUsT0FBTyxFQUFFLGlCQUFpQixFQUFFLGlCQUFpQixFQUFFLE1BQU0sbUJBQW1CLENBQUM7OztBQUV6RTs7O0dBR0c7QUFNSCxNQUFNLE9BQU8sa0JBQWtCO0lBZW5CO0lBQ0E7SUFmVixNQUFNLENBQUMsMkJBQTJCLENBQWU7SUFFeEMsU0FBUyxHQUFHLElBQUksQ0FBQztJQUNqQixnQkFBZ0IsQ0FBMkI7SUFFNUMsVUFBVSxDQUFTO0lBQ25CLFFBQVEsQ0FBMkI7SUFDbkMsR0FBRyxDQUFtQjtJQUN0QixlQUFlLEdBQWlCLElBQUksT0FBTyxFQUFPLENBQUM7SUFFM0Q7O09BRUc7SUFDSCxZQUNVLFdBQXVCLEVBQ3ZCLFNBQW1CO1FBRG5CLGdCQUFXLEdBQVgsV0FBVyxDQUFZO1FBQ3ZCLGNBQVMsR0FBVCxTQUFTLENBQVU7SUFDMUIsQ0FBQztJQUVKLHdHQUF3RztJQUN4RyxjQUFjO0lBQ2Qsd0dBQXdHO0lBRXhHLElBQUksVUFBVTtRQUNaLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQztJQUMxQixDQUFDO0lBRUQsSUFBSSxFQUFFO1FBQ0osT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDO0lBQ2xCLENBQUM7SUFF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OUUsSUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7WUFDdkIsT0FBTztRQUNULENBQUM7UUFFRCxrQ0FBa0M7UUFDbEMsSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLGdCQUFnQixDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsYUFBYSxFQUFFLEVBQUUsR0FBRyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztJQUN4RixDQUFDO0lBRU8sUUFBUTtRQUNkLDRCQUE0QjtRQUM1QixJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO1lBQ2QsT0FBTztRQUNULENBQUM7UUFFRCwrQkFBK0I7UUFDL0IsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUVuQixXQUFXO1FBQ1gsSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFXLENBQUM7SUFDekIsQ0FBQzt1R0EzUlUsa0JBQWtCOzJGQUFsQixrQkFBa0I7OzJGQUFsQixrQkFBa0I7a0JBTDlCLFNBQVM7bUJBQUM7b0JBQ1QsUUFBUSxFQUFFLGFBQWE7b0JBQ3ZCLFFBQVEsRUFBRSxXQUFXO29CQUNyQixVQUFVLEVBQUUsSUFBSTtpQkFDakI7c0dBSVUsU0FBUztzQkFBakIsS0FBSztnQkFDRyxnQkFBZ0I7c0JBQXhCLEtBQUsiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBEaXJlY3RpdmUsXG4gIEVsZW1lbnRSZWYsXG4gIElucHV0LFxuICBPbkNoYW5nZXMsXG4gIE9uRGVzdHJveSxcbiAgT25Jbml0LFxuICBTaW1wbGVDaGFuZ2VzLFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IEJvb2xlYW5JbnB1dCwgY29lcmNlQm9vbGVhblByb3BlcnR5IH0gZnJvbSAnQGFuZ3VsYXIvY2RrL2NvZXJjaW9uJztcbmltcG9ydCB7IFBsYXRmb3JtIH0gZnJvbSAnQGFuZ3VsYXIvY2RrL3BsYXRmb3JtJztcblxuaW1wb3J0IHsgbWVyZ2UgfSBmcm9tICdlcy10b29sa2l0JztcbmltcG9ydCBQZXJmZWN0U2Nyb2xsYmFyIGZyb20gJ3BlcmZlY3Qtc2Nyb2xsYmFyJztcbmltcG9ydCB7IGRlYm91bmNlVGltZSwgZnJvbUV2ZW50LCBTdWJqZWN0LCB0YWtlVW50aWwgfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IFNjcm9sbGJhckdlb21ldHJ5LCBTY3JvbGxiYXJQb3NpdGlvbiB9IGZyb20gJy4vc2Nyb2xsYmFyLnR5cGVzJztcblxuLyoqXG4gKiBXcmFwcGVyIGRpcmVjdGl2ZSBmb3IgdGhlIFBlcmZlY3QgU2Nyb2xsYmFyOlxuICogaHR0cHM6Ly9naXRodWIuY29tL21kYm9vdHN0cmFwL3BlcmZlY3Qtc2Nyb2xsYmFyXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1tzY3JvbGxiYXJdJyxcbiAgZXhwb3J0QXM6ICdzY3JvbGxiYXInLFxuICBzdGFuZGFsb25lOiB0cnVlLFxufSlcbmV4cG9ydCBjbGFzcyBTY3JvbGxiYXJEaXJlY3RpdmUgaW1wbGVtZW50cyBPbkNoYW5nZXMsIE9uSW5pdCwgT25EZXN0cm95IHtcbiAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3Njcm9sbGJhcjogQm9vbGVhbklucHV0O1xuXG4gIEBJbnB1dCgpIHNjcm9sbGJhciA9IHRydWU7XG4gIEBJbnB1dCgpIHNjcm9sbGJhck9wdGlvbnM6IFBlcmZlY3RTY3JvbGxiYXIuT3B0aW9ucztcblxuICBwcml2YXRlIF9hbmltYXRpb246IG51bWJlcjtcbiAgcHJpdmF0ZSBfb3B0aW9uczogUGVyZmVjdFNjcm9sbGJhci5PcHRpb25zO1xuICBwcml2YXRlIF9wczogUGVyZmVjdFNjcm9sbGJhcjtcbiAgcHJpdmF0ZSBfdW5zdWJzY3JpYmVBbGw6IFN1YmplY3Q8YW55PiA9IG5ldyBTdWJqZWN0PGFueT4oKTtcblxuICAvKipcbiAgICogQ29uc3RydWN0b3JcbiAgICovXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgX2VsZW1lbnRSZWY6IEVsZW1lbnRSZWYsXG4gICAgcHJpdmF0ZSBfcGxhdGZvcm06IFBsYXRmb3JtXG4gICkge31cblxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBAIEFjY2Vzc29yc1xuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIGdldCBlbGVtZW50UmVmKCk6IEVsZW1lbnRSZWYge1xuICAgIHJldHVybiB0aGlzLl9lbGVtZW50UmVmO1xuICB9XG5cbiAgZ2V0IHBzKCk6IFBlcmZlY3RTY3JvbGxiYXIgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5fcHM7XG4gIH1cblxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBAIExpZmVjeWNsZSBob29rc1xuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIG5nT25DaGFuZ2VzKGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMpOiB2b2lkIHtcbiAgICAvLyBFbmFibGVkXG4gICAgaWYgKCdzY3JvbGxiYXInIGluIGNoYW5nZXMpIHtcbiAgICAgIC8vIEludGVycHJldCBlbXB0eSBzdHJpbmcgYXMgJ3RydWUnXG4gICAgICB0aGlzLnNjcm9sbGJhciA9IGNvZXJjZUJvb2xlYW5Qcm9wZXJ0eShjaGFuZ2VzWydzY3JvbGxiYXInXS5jdXJyZW50VmFsdWUpO1xuXG4gICAgICAvLyBJZiBlbmFibGVkLCBpbml0IHRoZSBkaXJlY3RpdmVcbiAgICAgIGlmICh0aGlzLnNjcm9sbGJhcikge1xuICAgICAgICB0aGlzLl9pbml0KCk7XG4gICAgICB9XG4gICAgICAvLyBPdGhlcndpc2UgZGVzdHJveSBpdFxuICAgICAgZWxzZSB7XG4gICAgICAgIHRoaXMuX2Rlc3Ryb3koKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBTY3JvbGxiYXIgb3B0aW9uc1xuICAgIGlmICgnc2Nyb2xsYmFyT3B0aW9ucycgaW4gY2hhbmdlcykge1xuICAgICAgLy8gTWVyZ2UgdGhlIG9wdGlvbnNcbiAgICAgIHRoaXMuX29wdGlvbnMgPSBtZXJnZSh0aGlzLl9vcHRpb25zLCBjaGFuZ2VzWydzY3JvbGxiYXJPcHRpb25zJ10uY3VycmVudFZhbHVlKTtcblxuICAgICAgLy8gUmV0dXJuIGlmIG5vdCBpbml0aWFsaXplZFxuICAgICAgaWYgKCF0aGlzLl9wcykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIERlc3Ryb3kgYW5kIHJlLWluaXQgdGhlIFBlcmZlY3RTY3JvbGxiYXIgdG8gdXBkYXRlIGl0cyBvcHRpb25zXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgdGhpcy5fZGVzdHJveSgpO1xuICAgICAgfSk7XG5cbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICB0aGlzLl9pbml0KCk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBuZ09uSW5pdCgpOiB2b2lkIHtcbiAgICAvLyBTdWJzY3JpYmUgdG8gd2luZG93IHJlc2l6ZSBldmVudFxuICAgIGZyb21FdmVudCh3aW5kb3csICdyZXNpemUnKVxuICAgICAgLnBpcGUodGFrZVVudGlsKHRoaXMuX3Vuc3Vic2NyaWJlQWxsKSwgZGVib3VuY2VUaW1lKDE1MCkpXG4gICAgICAuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgICAgLy8gVXBkYXRlIHRoZSBQZXJmZWN0U2Nyb2xsYmFyXG4gICAgICAgIHRoaXMudXBkYXRlKCk7XG4gICAgICB9KTtcbiAgfVxuXG4gIG5nT25EZXN0cm95KCk6IHZvaWQge1xuICAgIHRoaXMuX2Rlc3Ryb3koKTtcblxuICAgIC8vIFVuc3Vic2NyaWJlIGZyb20gYWxsIHN1YnNjcmlwdGlvbnNcbiAgICB0aGlzLl91bnN1YnNjcmliZUFsbC5uZXh0KG51bGwpO1xuICAgIHRoaXMuX3Vuc3Vic2NyaWJlQWxsLmNvbXBsZXRlKCk7XG4gIH1cblxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBAIFB1YmxpYyBtZXRob2RzXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgaXNFbmFibGVkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnNjcm9sbGJhcjtcbiAgfVxuXG4gIHVwZGF0ZSgpOiB2b2lkIHtcbiAgICAvLyBSZXR1cm4gaWYgbm90IGluaXRpYWxpemVkXG4gICAgaWYgKCF0aGlzLl9wcykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFVwZGF0ZSB0aGUgUGVyZmVjdFNjcm9sbGJhclxuICAgIHRoaXMuX3BzLnVwZGF0ZSgpO1xuICB9XG5cbiAgZGVzdHJveSgpOiB2b2lkIHtcbiAgICB0aGlzLm5nT25EZXN0cm95KCk7XG4gIH1cblxuICBnZW9tZXRyeShwcmVmaXggPSAnc2Nyb2xsJyk6IFNjcm9sbGJhckdlb21ldHJ5IHtcbiAgICByZXR1cm4gbmV3IFNjcm9sbGJhckdlb21ldHJ5KFxuICAgICAgdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50W3ByZWZpeCArICdMZWZ0J10sXG4gICAgICB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnRbcHJlZml4ICsgJ1RvcCddLFxuICAgICAgdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50W3ByZWZpeCArICdXaWR0aCddLFxuICAgICAgdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50W3ByZWZpeCArICdIZWlnaHQnXVxuICAgICk7XG4gIH1cblxuICBwb3NpdGlvbihhYnNvbHV0ZSA9IGZhbHNlKTogU2Nyb2xsYmFyUG9zaXRpb24ge1xuICAgIGxldCBzY3JvbGxiYXJQb3NpdGlvbjtcblxuICAgIGlmICghYWJzb2x1dGUgJiYgdGhpcy5fcHMpIHtcbiAgICAgIHNjcm9sbGJhclBvc2l0aW9uID0gbmV3IFNjcm9sbGJhclBvc2l0aW9uKHRoaXMuX3BzLnJlYWNoLnggfHwgMCwgdGhpcy5fcHMucmVhY2gueSB8fCAwKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc2Nyb2xsYmFyUG9zaXRpb24gPSBuZXcgU2Nyb2xsYmFyUG9zaXRpb24oXG4gICAgICAgIHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudC5zY3JvbGxMZWZ0LFxuICAgICAgICB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQuc2Nyb2xsVG9wXG4gICAgICApO1xuICAgIH1cblxuICAgIHJldHVybiBzY3JvbGxiYXJQb3NpdGlvbjtcbiAgfVxuXG4gIHNjcm9sbFRvKHg6IG51bWJlciwgeT86IG51bWJlciwgc3BlZWQ/OiBudW1iZXIpOiB2b2lkIHtcbiAgICBpZiAoeSA9PSBudWxsICYmIHNwZWVkID09IG51bGwpIHtcbiAgICAgIHRoaXMuYW5pbWF0ZVNjcm9sbGluZygnc2Nyb2xsVG9wJywgeCwgc3BlZWQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoeCAhPSBudWxsKSB7XG4gICAgICAgIHRoaXMuYW5pbWF0ZVNjcm9sbGluZygnc2Nyb2xsTGVmdCcsIHgsIHNwZWVkKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHkgIT0gbnVsbCkge1xuICAgICAgICB0aGlzLmFuaW1hdGVTY3JvbGxpbmcoJ3Njcm9sbFRvcCcsIHksIHNwZWVkKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBzY3JvbGxUb1goeDogbnVtYmVyLCBzcGVlZD86IG51bWJlcik6IHZvaWQge1xuICAgIHRoaXMuYW5pbWF0ZVNjcm9sbGluZygnc2Nyb2xsTGVmdCcsIHgsIHNwZWVkKTtcbiAgfVxuXG4gIHNjcm9sbFRvWSh5OiBudW1iZXIsIHNwZWVkPzogbnVtYmVyKTogdm9pZCB7XG4gICAgdGhpcy5hbmltYXRlU2Nyb2xsaW5nKCdzY3JvbGxUb3AnLCB5LCBzcGVlZCk7XG4gIH1cblxuICBzY3JvbGxUb1RvcChvZmZzZXQgPSAwLCBzcGVlZD86IG51bWJlcik6IHZvaWQge1xuICAgIHRoaXMuYW5pbWF0ZVNjcm9sbGluZygnc2Nyb2xsVG9wJywgb2Zmc2V0LCBzcGVlZCk7XG4gIH1cblxuICBzY3JvbGxUb0JvdHRvbShvZmZzZXQgPSAwLCBzcGVlZD86IG51bWJlcik6IHZvaWQge1xuICAgIGNvbnN0IHRvcCA9XG4gICAgICB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQuc2Nyb2xsSGVpZ2h0IC0gdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LmNsaWVudEhlaWdodDtcbiAgICB0aGlzLmFuaW1hdGVTY3JvbGxpbmcoJ3Njcm9sbFRvcCcsIHRvcCAtIG9mZnNldCwgc3BlZWQpO1xuICB9XG5cbiAgc2Nyb2xsVG9MZWZ0KG9mZnNldCA9IDAsIHNwZWVkPzogbnVtYmVyKTogdm9pZCB7XG4gICAgdGhpcy5hbmltYXRlU2Nyb2xsaW5nKCdzY3JvbGxMZWZ0Jywgb2Zmc2V0LCBzcGVlZCk7XG4gIH1cblxuICBzY3JvbGxUb1JpZ2h0KG9mZnNldCA9IDAsIHNwZWVkPzogbnVtYmVyKTogdm9pZCB7XG4gICAgY29uc3QgbGVmdCA9XG4gICAgICB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQuc2Nyb2xsV2lkdGggLSB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQuY2xpZW50V2lkdGg7XG4gICAgdGhpcy5hbmltYXRlU2Nyb2xsaW5nKCdzY3JvbGxMZWZ0JywgbGVmdCAtIG9mZnNldCwgc3BlZWQpO1xuICB9XG5cbiAgc2Nyb2xsVG9FbGVtZW50KHFzOiBzdHJpbmcsIG9mZnNldCA9IDAsIGlnbm9yZVZpc2libGUgPSBmYWxzZSwgc3BlZWQ/OiBudW1iZXIpOiB2b2lkIHtcbiAgICBjb25zdCBlbGVtZW50ID0gdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LnF1ZXJ5U2VsZWN0b3IocXMpO1xuXG4gICAgaWYgKCFlbGVtZW50KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgZWxlbWVudFBvcyA9IGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgY29uc3Qgc2Nyb2xsZXJQb3MgPSB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cbiAgICBpZiAodGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LmNsYXNzTGlzdC5jb250YWlucygncHMtLWFjdGl2ZS14JykpIHtcbiAgICAgIGlmIChpZ25vcmVWaXNpYmxlICYmIGVsZW1lbnRQb3MucmlnaHQgPD0gc2Nyb2xsZXJQb3MucmlnaHQgLSBNYXRoLmFicyhvZmZzZXQpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgY29uc3QgY3VycmVudFBvcyA9IHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudFsnc2Nyb2xsTGVmdCddO1xuICAgICAgY29uc3QgcG9zaXRpb24gPSBlbGVtZW50UG9zLmxlZnQgLSBzY3JvbGxlclBvcy5sZWZ0ICsgY3VycmVudFBvcztcblxuICAgICAgdGhpcy5hbmltYXRlU2Nyb2xsaW5nKCdzY3JvbGxMZWZ0JywgcG9zaXRpb24gKyBvZmZzZXQsIHNwZWVkKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LmNsYXNzTGlzdC5jb250YWlucygncHMtLWFjdGl2ZS15JykpIHtcbiAgICAgIGlmIChpZ25vcmVWaXNpYmxlICYmIGVsZW1lbnRQb3MuYm90dG9tIDw9IHNjcm9sbGVyUG9zLmJvdHRvbSAtIE1hdGguYWJzKG9mZnNldCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBjdXJyZW50UG9zID0gdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50WydzY3JvbGxUb3AnXTtcbiAgICAgIGNvbnN0IHBvc2l0aW9uID0gZWxlbWVudFBvcy50b3AgLSBzY3JvbGxlclBvcy50b3AgKyBjdXJyZW50UG9zO1xuXG4gICAgICB0aGlzLmFuaW1hdGVTY3JvbGxpbmcoJ3Njcm9sbFRvcCcsIHBvc2l0aW9uICsgb2Zmc2V0LCBzcGVlZCk7XG4gICAgfVxuICB9XG5cbiAgYW5pbWF0ZVNjcm9sbGluZyh0YXJnZXQ6IHN0cmluZywgdmFsdWU6IG51bWJlciwgc3BlZWQ/OiBudW1iZXIpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fYW5pbWF0aW9uKSB7XG4gICAgICB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUodGhpcy5fYW5pbWF0aW9uKTtcbiAgICAgIHRoaXMuX2FuaW1hdGlvbiA9IG51bGwgYXMgYW55O1xuICAgIH1cblxuICAgIGlmICghc3BlZWQgfHwgdHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudFt0YXJnZXRdID0gdmFsdWU7XG4gICAgfSBlbHNlIGlmICh2YWx1ZSAhPT0gdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50W3RhcmdldF0pIHtcbiAgICAgIGxldCBuZXdWYWx1ZSA9IDA7XG4gICAgICBsZXQgc2Nyb2xsQ291bnQgPSAwO1xuXG4gICAgICBsZXQgb2xkVGltZXN0YW1wID0gcGVyZm9ybWFuY2Uubm93KCk7XG4gICAgICBsZXQgb2xkVmFsdWUgPSB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnRbdGFyZ2V0XTtcblxuICAgICAgY29uc3QgY29zUGFyYW1ldGVyID0gKG9sZFZhbHVlIC0gdmFsdWUpIC8gMjtcblxuICAgICAgY29uc3Qgc3RlcCA9IChuZXdUaW1lc3RhbXA6IG51bWJlcik6IHZvaWQgPT4ge1xuICAgICAgICBzY3JvbGxDb3VudCArPSBNYXRoLlBJIC8gKHNwZWVkIC8gKG5ld1RpbWVzdGFtcCAtIG9sZFRpbWVzdGFtcCkpO1xuICAgICAgICBuZXdWYWx1ZSA9IE1hdGgucm91bmQodmFsdWUgKyBjb3NQYXJhbWV0ZXIgKyBjb3NQYXJhbWV0ZXIgKiBNYXRoLmNvcyhzY3JvbGxDb3VudCkpO1xuXG4gICAgICAgIC8vIE9ubHkgY29udGludWUgYW5pbWF0aW9uIGlmIHNjcm9sbCBwb3NpdGlvbiBoYXMgbm90IGNoYW5nZWRcbiAgICAgICAgaWYgKHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudFt0YXJnZXRdID09PSBvbGRWYWx1ZSkge1xuICAgICAgICAgIGlmIChzY3JvbGxDb3VudCA+PSBNYXRoLlBJKSB7XG4gICAgICAgICAgICB0aGlzLmFuaW1hdGVTY3JvbGxpbmcodGFyZ2V0LCB2YWx1ZSwgMCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudFt0YXJnZXRdID0gbmV3VmFsdWU7XG5cbiAgICAgICAgICAgIC8vIE9uIGEgem9vbWVkIG91dCBwYWdlIHRoZSByZXN1bHRpbmcgb2Zmc2V0IG1heSBkaWZmZXJcbiAgICAgICAgICAgIG9sZFZhbHVlID0gdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50W3RhcmdldF07XG4gICAgICAgICAgICBvbGRUaW1lc3RhbXAgPSBuZXdUaW1lc3RhbXA7XG5cbiAgICAgICAgICAgIHRoaXMuX2FuaW1hdGlvbiA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoc3RlcCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKHN0ZXApO1xuICAgIH1cbiAgfVxuXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIEAgUHJpdmF0ZSBtZXRob2RzXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgcHJpdmF0ZSBfaW5pdCgpOiB2b2lkIHtcbiAgICAvLyBSZXR1cm4gaWYgYWxyZWFkeSBpbml0aWFsaXplZFxuICAgIGlmICh0aGlzLl9wcykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFJldHVybiBpZiBvbiBtb2JpbGUgb3Igbm90IG9uIGJyb3dzZXJcbiAgICBpZiAodGhpcy5fcGxhdGZvcm0uQU5EUk9JRCB8fCB0aGlzLl9wbGF0Zm9ybS5JT1MgfHwgIXRoaXMuX3BsYXRmb3JtLmlzQnJvd3Nlcikge1xuICAgICAgdGhpcy5zY3JvbGxiYXIgPSBmYWxzZTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBJbml0aWFsaXplIHRoZSBQZXJmZWN0U2Nyb2xsYmFyXG4gICAgdGhpcy5fcHMgPSBuZXcgUGVyZmVjdFNjcm9sbGJhcih0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQsIHsgLi4udGhpcy5fb3B0aW9ucyB9KTtcbiAgfVxuXG4gIHByaXZhdGUgX2Rlc3Ryb3koKTogdm9pZCB7XG4gICAgLy8gUmV0dXJuIGlmIG5vdCBpbml0aWFsaXplZFxuICAgIGlmICghdGhpcy5fcHMpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBEZXN0cm95IHRoZSBQZXJmZWN0U2Nyb2xsYmFyXG4gICAgdGhpcy5fcHMuZGVzdHJveSgpO1xuXG4gICAgLy8gQ2xlYW4gdXBcbiAgICB0aGlzLl9wcyA9IG51bGwgYXMgYW55O1xuICB9XG59XG4iXX0=