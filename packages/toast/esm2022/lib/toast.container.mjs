import { Component, ViewChild, } from '@angular/core';
import { BasePortalOutlet, CdkPortalOutlet, } from '@angular/cdk/portal';
import { Subject } from 'rxjs';
import { toastAnimations } from './toast.animation';
import * as i0 from "@angular/core";
export class ToastContainerComponent extends BasePortalOutlet {
    _ngZone;
    _changeDetectorRef;
    /** Whether the component has been destroyed. */
    _destroyed = false;
    /** The portal outlet inside of this container into which the toast content will be loaded. */
    _portalOutlet;
    /** Subject for notifying that the toast has exited from view. */
    _onExit = new Subject();
    /** Subject for notifying that the toast has finished entering the view. */
    _onEnter = new Subject();
    /** The state of the toast animations. */
    _animationState = 'void';
    constructor(_ngZone, _changeDetectorRef) {
        super();
        this._ngZone = _ngZone;
        this._changeDetectorRef = _changeDetectorRef;
    }
    attachComponentPortal(portal) {
        const result = this._portalOutlet.attachComponentPortal(portal);
        return result;
    }
    attachTemplatePortal(portal) {
        const result = this._portalOutlet.attachTemplatePortal(portal);
        return result;
    }
    attachDomPortal = (portal) => {
        const result = this._portalOutlet.attachDomPortal(portal);
        return result;
    };
    onAnimationEnd(event) {
        const { fromState, toState } = event;
        if ((toState === 'void' && fromState !== 'void') || toState === 'hidden') {
            this._completeExit();
        }
        if (toState === 'visible') {
            const onEnter = this._onEnter;
            this._ngZone.run(() => {
                onEnter.next();
                onEnter.complete();
            });
        }
    }
    enter() {
        if (!this._destroyed) {
            this._animationState = 'visible';
            this._changeDetectorRef.markForCheck();
            this._changeDetectorRef.detectChanges();
        }
    }
    exit() {
        this._ngZone.run(() => {
            this._animationState = 'hidden';
            this._changeDetectorRef.markForCheck();
        });
        return this._onExit;
    }
    ngOnDestroy() {
        this._destroyed = true;
        this._completeExit();
    }
    _completeExit() {
        queueMicrotask(() => {
            this._onExit.next();
            this._onExit.complete();
        });
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.13", ngImport: i0, type: ToastContainerComponent, deps: [{ token: i0.NgZone }, { token: i0.ChangeDetectorRef }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "18.2.13", type: ToastContainerComponent, isStandalone: true, selector: "toast-container", host: { listeners: { "@state.done": "onAnimationEnd($event)" }, properties: { "@state": "_animationState" }, classAttribute: "m-4 flex flex-col" }, viewQueries: [{ propertyName: "_portalOutlet", first: true, predicate: CdkPortalOutlet, descendants: true, static: true }], usesInheritance: true, ngImport: i0, template: '<ng-template cdkPortalOutlet />', isInline: true, dependencies: [{ kind: "directive", type: CdkPortalOutlet, selector: "[cdkPortalOutlet]", inputs: ["cdkPortalOutlet"], outputs: ["attached"], exportAs: ["cdkPortalOutlet"] }], animations: [toastAnimations.toastState] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.13", ngImport: i0, type: ToastContainerComponent, decorators: [{
            type: Component,
            args: [{
                    standalone: true,
                    selector: 'toast-container',
                    template: '<ng-template cdkPortalOutlet />',
                    animations: [toastAnimations.toastState],
                    imports: [CdkPortalOutlet],
                    host: {
                        class: 'm-4 flex flex-col',
                        '[@state]': '_animationState',
                        '(@state.done)': 'onAnimationEnd($event)',
                    },
                }]
        }], ctorParameters: () => [{ type: i0.NgZone }, { type: i0.ChangeDetectorRef }], propDecorators: { _portalOutlet: [{
                type: ViewChild,
                args: [CdkPortalOutlet, { static: true }]
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9hc3QuY29udGFpbmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vbGlicy90b2FzdC9zcmMvbGliL3RvYXN0LmNvbnRhaW5lci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBRUwsU0FBUyxFQUtULFNBQVMsR0FDVixNQUFNLGVBQWUsQ0FBQztBQUV2QixPQUFPLEVBQ0wsZ0JBQWdCLEVBQ2hCLGVBQWUsR0FJaEIsTUFBTSxxQkFBcUIsQ0FBQztBQUc3QixPQUFPLEVBQWMsT0FBTyxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBRTNDLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQzs7QUFjcEQsTUFBTSxPQUFPLHVCQUF3QixTQUFRLGdCQUFnQjtJQWlCakQ7SUFDQTtJQWpCVixnREFBZ0Q7SUFDeEMsVUFBVSxHQUFHLEtBQUssQ0FBQztJQUUzQiw4RkFBOEY7SUFDaEQsYUFBYSxDQUFrQjtJQUU3RSxpRUFBaUU7SUFDeEQsT0FBTyxHQUFHLElBQUksT0FBTyxFQUFRLENBQUM7SUFFdkMsMkVBQTJFO0lBQ2xFLFFBQVEsR0FBRyxJQUFJLE9BQU8sRUFBUSxDQUFDO0lBRXhDLHlDQUF5QztJQUN6QyxlQUFlLEdBQUcsTUFBTSxDQUFDO0lBRXpCLFlBQ1UsT0FBZSxFQUNmLGtCQUFxQztRQUU3QyxLQUFLLEVBQUUsQ0FBQztRQUhBLFlBQU8sR0FBUCxPQUFPLENBQVE7UUFDZix1QkFBa0IsR0FBbEIsa0JBQWtCLENBQW1CO0lBRy9DLENBQUM7SUFFRCxxQkFBcUIsQ0FBSSxNQUEwQjtRQUNqRCxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLHFCQUFxQixDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ2hFLE9BQU8sTUFBTSxDQUFDO0lBQ2hCLENBQUM7SUFFRCxvQkFBb0IsQ0FBSSxNQUF5QjtRQUMvQyxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLG9CQUFvQixDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQy9ELE9BQU8sTUFBTSxDQUFDO0lBQ2hCLENBQUM7SUFFUSxlQUFlLEdBQUcsQ0FBQyxNQUFpQixFQUFFLEVBQUU7UUFDL0MsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDMUQsT0FBTyxNQUFNLENBQUM7SUFDaEIsQ0FBQyxDQUFDO0lBRUYsY0FBYyxDQUFDLEtBQXFCO1FBQ2xDLE1BQU0sRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLEdBQUcsS0FBSyxDQUFDO1FBRXJDLElBQUksQ0FBQyxPQUFPLEtBQUssTUFBTSxJQUFJLFNBQVMsS0FBSyxNQUFNLENBQUMsSUFBSSxPQUFPLEtBQUssUUFBUSxFQUFFLENBQUM7WUFDekUsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1FBQ3ZCLENBQUM7UUFFRCxJQUFJLE9BQU8sS0FBSyxTQUFTLEVBQUUsQ0FBQztZQUMxQixNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO1lBRTlCLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRTtnQkFDcEIsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNmLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUNyQixDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7SUFDSCxDQUFDO0lBRUQsS0FBSztRQUNILElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDckIsSUFBSSxDQUFDLGVBQWUsR0FBRyxTQUFTLENBQUM7WUFDakMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFlBQVksRUFBRSxDQUFDO1lBQ3ZDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUMxQyxDQUFDO0lBQ0gsQ0FBQztJQUVELElBQUk7UUFDRixJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUU7WUFDcEIsSUFBSSxDQUFDLGVBQWUsR0FBRyxRQUFRLENBQUM7WUFDaEMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFlBQVksRUFBRSxDQUFDO1FBQ3pDLENBQUMsQ0FBQyxDQUFDO1FBRUgsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDO0lBQ3RCLENBQUM7SUFFRCxXQUFXO1FBQ1QsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7UUFDdkIsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO0lBQ3ZCLENBQUM7SUFFTyxhQUFhO1FBQ25CLGNBQWMsQ0FBQyxHQUFHLEVBQUU7WUFDbEIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNwQixJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQzFCLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQzt3R0FsRlUsdUJBQXVCOzRGQUF2Qix1QkFBdUIsOFFBS3ZCLGVBQWUscUZBZGhCLGlDQUFpQyw0REFFakMsZUFBZSxtSUFEYixDQUFDLGVBQWUsQ0FBQyxVQUFVLENBQUM7OzRGQVE3Qix1QkFBdUI7a0JBWm5DLFNBQVM7bUJBQUM7b0JBQ1QsVUFBVSxFQUFFLElBQUk7b0JBQ2hCLFFBQVEsRUFBRSxpQkFBaUI7b0JBQzNCLFFBQVEsRUFBRSxpQ0FBaUM7b0JBQzNDLFVBQVUsRUFBRSxDQUFDLGVBQWUsQ0FBQyxVQUFVLENBQUM7b0JBQ3hDLE9BQU8sRUFBRSxDQUFDLGVBQWUsQ0FBQztvQkFDMUIsSUFBSSxFQUFFO3dCQUNKLEtBQUssRUFBRSxtQkFBbUI7d0JBQzFCLFVBQVUsRUFBRSxpQkFBaUI7d0JBQzdCLGVBQWUsRUFBRSx3QkFBd0I7cUJBQzFDO2lCQUNGOzJHQU0rQyxhQUFhO3NCQUExRCxTQUFTO3VCQUFDLGVBQWUsRUFBRSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBDaGFuZ2VEZXRlY3RvclJlZixcbiAgQ29tcG9uZW50LFxuICBDb21wb25lbnRSZWYsXG4gIEVtYmVkZGVkVmlld1JlZixcbiAgTmdab25lLFxuICBPbkRlc3Ryb3ksXG4gIFZpZXdDaGlsZCxcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7XG4gIEJhc2VQb3J0YWxPdXRsZXQsXG4gIENka1BvcnRhbE91dGxldCxcbiAgQ29tcG9uZW50UG9ydGFsLFxuICBEb21Qb3J0YWwsXG4gIFRlbXBsYXRlUG9ydGFsLFxufSBmcm9tICdAYW5ndWxhci9jZGsvcG9ydGFsJztcblxuaW1wb3J0IHsgQW5pbWF0aW9uRXZlbnQgfSBmcm9tICdAYW5ndWxhci9hbmltYXRpb25zJztcbmltcG9ydCB7IE9ic2VydmFibGUsIFN1YmplY3QgfSBmcm9tICdyeGpzJztcblxuaW1wb3J0IHsgdG9hc3RBbmltYXRpb25zIH0gZnJvbSAnLi90b2FzdC5hbmltYXRpb24nO1xuXG5AQ29tcG9uZW50KHtcbiAgc3RhbmRhbG9uZTogdHJ1ZSxcbiAgc2VsZWN0b3I6ICd0b2FzdC1jb250YWluZXInLFxuICB0ZW1wbGF0ZTogJzxuZy10ZW1wbGF0ZSBjZGtQb3J0YWxPdXRsZXQgLz4nLFxuICBhbmltYXRpb25zOiBbdG9hc3RBbmltYXRpb25zLnRvYXN0U3RhdGVdLFxuICBpbXBvcnRzOiBbQ2RrUG9ydGFsT3V0bGV0XSxcbiAgaG9zdDoge1xuICAgIGNsYXNzOiAnbS00IGZsZXggZmxleC1jb2wnLFxuICAgICdbQHN0YXRlXSc6ICdfYW5pbWF0aW9uU3RhdGUnLFxuICAgICcoQHN0YXRlLmRvbmUpJzogJ29uQW5pbWF0aW9uRW5kKCRldmVudCknLFxuICB9LFxufSlcbmV4cG9ydCBjbGFzcyBUb2FzdENvbnRhaW5lckNvbXBvbmVudCBleHRlbmRzIEJhc2VQb3J0YWxPdXRsZXQgaW1wbGVtZW50cyBPbkRlc3Ryb3kge1xuICAvKiogV2hldGhlciB0aGUgY29tcG9uZW50IGhhcyBiZWVuIGRlc3Ryb3llZC4gKi9cbiAgcHJpdmF0ZSBfZGVzdHJveWVkID0gZmFsc2U7XG5cbiAgLyoqIFRoZSBwb3J0YWwgb3V0bGV0IGluc2lkZSBvZiB0aGlzIGNvbnRhaW5lciBpbnRvIHdoaWNoIHRoZSB0b2FzdCBjb250ZW50IHdpbGwgYmUgbG9hZGVkLiAqL1xuICBAVmlld0NoaWxkKENka1BvcnRhbE91dGxldCwgeyBzdGF0aWM6IHRydWUgfSkgX3BvcnRhbE91dGxldDogQ2RrUG9ydGFsT3V0bGV0O1xuXG4gIC8qKiBTdWJqZWN0IGZvciBub3RpZnlpbmcgdGhhdCB0aGUgdG9hc3QgaGFzIGV4aXRlZCBmcm9tIHZpZXcuICovXG4gIHJlYWRvbmx5IF9vbkV4aXQgPSBuZXcgU3ViamVjdDx2b2lkPigpO1xuXG4gIC8qKiBTdWJqZWN0IGZvciBub3RpZnlpbmcgdGhhdCB0aGUgdG9hc3QgaGFzIGZpbmlzaGVkIGVudGVyaW5nIHRoZSB2aWV3LiAqL1xuICByZWFkb25seSBfb25FbnRlciA9IG5ldyBTdWJqZWN0PHZvaWQ+KCk7XG5cbiAgLyoqIFRoZSBzdGF0ZSBvZiB0aGUgdG9hc3QgYW5pbWF0aW9ucy4gKi9cbiAgX2FuaW1hdGlvblN0YXRlID0gJ3ZvaWQnO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgX25nWm9uZTogTmdab25lLFxuICAgIHByaXZhdGUgX2NoYW5nZURldGVjdG9yUmVmOiBDaGFuZ2VEZXRlY3RvclJlZlxuICApIHtcbiAgICBzdXBlcigpO1xuICB9XG5cbiAgYXR0YWNoQ29tcG9uZW50UG9ydGFsPFQ+KHBvcnRhbDogQ29tcG9uZW50UG9ydGFsPFQ+KTogQ29tcG9uZW50UmVmPFQ+IHtcbiAgICBjb25zdCByZXN1bHQgPSB0aGlzLl9wb3J0YWxPdXRsZXQuYXR0YWNoQ29tcG9uZW50UG9ydGFsKHBvcnRhbCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIGF0dGFjaFRlbXBsYXRlUG9ydGFsPEM+KHBvcnRhbDogVGVtcGxhdGVQb3J0YWw8Qz4pOiBFbWJlZGRlZFZpZXdSZWY8Qz4ge1xuICAgIGNvbnN0IHJlc3VsdCA9IHRoaXMuX3BvcnRhbE91dGxldC5hdHRhY2hUZW1wbGF0ZVBvcnRhbChwb3J0YWwpO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBvdmVycmlkZSBhdHRhY2hEb21Qb3J0YWwgPSAocG9ydGFsOiBEb21Qb3J0YWwpID0+IHtcbiAgICBjb25zdCByZXN1bHQgPSB0aGlzLl9wb3J0YWxPdXRsZXQuYXR0YWNoRG9tUG9ydGFsKHBvcnRhbCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICBvbkFuaW1hdGlvbkVuZChldmVudDogQW5pbWF0aW9uRXZlbnQpIHtcbiAgICBjb25zdCB7IGZyb21TdGF0ZSwgdG9TdGF0ZSB9ID0gZXZlbnQ7XG5cbiAgICBpZiAoKHRvU3RhdGUgPT09ICd2b2lkJyAmJiBmcm9tU3RhdGUgIT09ICd2b2lkJykgfHwgdG9TdGF0ZSA9PT0gJ2hpZGRlbicpIHtcbiAgICAgIHRoaXMuX2NvbXBsZXRlRXhpdCgpO1xuICAgIH1cblxuICAgIGlmICh0b1N0YXRlID09PSAndmlzaWJsZScpIHtcbiAgICAgIGNvbnN0IG9uRW50ZXIgPSB0aGlzLl9vbkVudGVyO1xuXG4gICAgICB0aGlzLl9uZ1pvbmUucnVuKCgpID0+IHtcbiAgICAgICAgb25FbnRlci5uZXh0KCk7XG4gICAgICAgIG9uRW50ZXIuY29tcGxldGUoKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIGVudGVyKCk6IHZvaWQge1xuICAgIGlmICghdGhpcy5fZGVzdHJveWVkKSB7XG4gICAgICB0aGlzLl9hbmltYXRpb25TdGF0ZSA9ICd2aXNpYmxlJztcbiAgICAgIHRoaXMuX2NoYW5nZURldGVjdG9yUmVmLm1hcmtGb3JDaGVjaygpO1xuICAgICAgdGhpcy5fY2hhbmdlRGV0ZWN0b3JSZWYuZGV0ZWN0Q2hhbmdlcygpO1xuICAgIH1cbiAgfVxuXG4gIGV4aXQoKTogT2JzZXJ2YWJsZTx2b2lkPiB7XG4gICAgdGhpcy5fbmdab25lLnJ1bigoKSA9PiB7XG4gICAgICB0aGlzLl9hbmltYXRpb25TdGF0ZSA9ICdoaWRkZW4nO1xuICAgICAgdGhpcy5fY2hhbmdlRGV0ZWN0b3JSZWYubWFya0ZvckNoZWNrKCk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gdGhpcy5fb25FeGl0O1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgdGhpcy5fZGVzdHJveWVkID0gdHJ1ZTtcbiAgICB0aGlzLl9jb21wbGV0ZUV4aXQoKTtcbiAgfVxuXG4gIHByaXZhdGUgX2NvbXBsZXRlRXhpdCgpIHtcbiAgICBxdWV1ZU1pY3JvdGFzaygoKSA9PiB7XG4gICAgICB0aGlzLl9vbkV4aXQubmV4dCgpO1xuICAgICAgdGhpcy5fb25FeGl0LmNvbXBsZXRlKCk7XG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==