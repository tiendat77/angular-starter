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
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: ToastContainerComponent, deps: [{ token: i0.NgZone }, { token: i0.ChangeDetectorRef }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "18.2.8", type: ToastContainerComponent, isStandalone: true, selector: "toast-container", host: { listeners: { "@state.done": "onAnimationEnd($event)" }, properties: { "@state": "_animationState" }, classAttribute: "m-4 flex flex-col" }, viewQueries: [{ propertyName: "_portalOutlet", first: true, predicate: CdkPortalOutlet, descendants: true, static: true }], usesInheritance: true, ngImport: i0, template: '<ng-template cdkPortalOutlet />', isInline: true, dependencies: [{ kind: "directive", type: CdkPortalOutlet, selector: "[cdkPortalOutlet]", inputs: ["cdkPortalOutlet"], outputs: ["attached"], exportAs: ["cdkPortalOutlet"] }], animations: [toastAnimations.toastState] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: ToastContainerComponent, decorators: [{
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9hc3QuY29udGFpbmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xpYi90b2FzdC5jb250YWluZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUVMLFNBQVMsRUFLVCxTQUFTLEdBQ1YsTUFBTSxlQUFlLENBQUM7QUFFdkIsT0FBTyxFQUNMLGdCQUFnQixFQUNoQixlQUFlLEdBSWhCLE1BQU0scUJBQXFCLENBQUM7QUFHN0IsT0FBTyxFQUFjLE9BQU8sRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUUzQyxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sbUJBQW1CLENBQUM7O0FBY3BELE1BQU0sT0FBTyx1QkFBd0IsU0FBUSxnQkFBZ0I7SUFpQmpEO0lBQ0E7SUFqQlYsZ0RBQWdEO0lBQ3hDLFVBQVUsR0FBRyxLQUFLLENBQUM7SUFFM0IsOEZBQThGO0lBQ2hELGFBQWEsQ0FBa0I7SUFFN0UsaUVBQWlFO0lBQ3hELE9BQU8sR0FBRyxJQUFJLE9BQU8sRUFBUSxDQUFDO0lBRXZDLDJFQUEyRTtJQUNsRSxRQUFRLEdBQUcsSUFBSSxPQUFPLEVBQVEsQ0FBQztJQUV4Qyx5Q0FBeUM7SUFDekMsZUFBZSxHQUFHLE1BQU0sQ0FBQztJQUV6QixZQUNVLE9BQWUsRUFDZixrQkFBcUM7UUFFN0MsS0FBSyxFQUFFLENBQUM7UUFIQSxZQUFPLEdBQVAsT0FBTyxDQUFRO1FBQ2YsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFtQjtJQUcvQyxDQUFDO0lBRUQscUJBQXFCLENBQUksTUFBMEI7UUFDakQsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxxQkFBcUIsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNoRSxPQUFPLE1BQU0sQ0FBQztJQUNoQixDQUFDO0lBRUQsb0JBQW9CLENBQUksTUFBeUI7UUFDL0MsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxvQkFBb0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUMvRCxPQUFPLE1BQU0sQ0FBQztJQUNoQixDQUFDO0lBRVEsZUFBZSxHQUFHLENBQUMsTUFBaUIsRUFBRSxFQUFFO1FBQy9DLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzFELE9BQU8sTUFBTSxDQUFDO0lBQ2hCLENBQUMsQ0FBQztJQUVGLGNBQWMsQ0FBQyxLQUFxQjtRQUNsQyxNQUFNLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxHQUFHLEtBQUssQ0FBQztRQUVyQyxJQUFJLENBQUMsT0FBTyxLQUFLLE1BQU0sSUFBSSxTQUFTLEtBQUssTUFBTSxDQUFDLElBQUksT0FBTyxLQUFLLFFBQVEsRUFBRSxDQUFDO1lBQ3pFLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUN2QixDQUFDO1FBRUQsSUFBSSxPQUFPLEtBQUssU0FBUyxFQUFFLENBQUM7WUFDMUIsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztZQUU5QixJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUU7Z0JBQ3BCLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDZixPQUFPLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDckIsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO0lBQ0gsQ0FBQztJQUVELEtBQUs7UUFDSCxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBQ3JCLElBQUksQ0FBQyxlQUFlLEdBQUcsU0FBUyxDQUFDO1lBQ2pDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxZQUFZLEVBQUUsQ0FBQztZQUN2QyxJQUFJLENBQUMsa0JBQWtCLENBQUMsYUFBYSxFQUFFLENBQUM7UUFDMUMsQ0FBQztJQUNILENBQUM7SUFFRCxJQUFJO1FBQ0YsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFO1lBQ3BCLElBQUksQ0FBQyxlQUFlLEdBQUcsUUFBUSxDQUFDO1lBQ2hDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUN6QyxDQUFDLENBQUMsQ0FBQztRQUVILE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQztJQUN0QixDQUFDO0lBRUQsV0FBVztRQUNULElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztJQUN2QixDQUFDO0lBRU8sYUFBYTtRQUNuQixjQUFjLENBQUMsR0FBRyxFQUFFO1lBQ2xCLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDcEIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUMxQixDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7dUdBbEZVLHVCQUF1QjsyRkFBdkIsdUJBQXVCLDhRQUt2QixlQUFlLHFGQWRoQixpQ0FBaUMsNERBRWpDLGVBQWUsbUlBRGIsQ0FBQyxlQUFlLENBQUMsVUFBVSxDQUFDOzsyRkFRN0IsdUJBQXVCO2tCQVpuQyxTQUFTO21CQUFDO29CQUNULFVBQVUsRUFBRSxJQUFJO29CQUNoQixRQUFRLEVBQUUsaUJBQWlCO29CQUMzQixRQUFRLEVBQUUsaUNBQWlDO29CQUMzQyxVQUFVLEVBQUUsQ0FBQyxlQUFlLENBQUMsVUFBVSxDQUFDO29CQUN4QyxPQUFPLEVBQUUsQ0FBQyxlQUFlLENBQUM7b0JBQzFCLElBQUksRUFBRTt3QkFDSixLQUFLLEVBQUUsbUJBQW1CO3dCQUMxQixVQUFVLEVBQUUsaUJBQWlCO3dCQUM3QixlQUFlLEVBQUUsd0JBQXdCO3FCQUMxQztpQkFDRjsyR0FNK0MsYUFBYTtzQkFBMUQsU0FBUzt1QkFBQyxlQUFlLEVBQUUsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgQ2hhbmdlRGV0ZWN0b3JSZWYsXG4gIENvbXBvbmVudCxcbiAgQ29tcG9uZW50UmVmLFxuICBFbWJlZGRlZFZpZXdSZWYsXG4gIE5nWm9uZSxcbiAgT25EZXN0cm95LFxuICBWaWV3Q2hpbGQsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge1xuICBCYXNlUG9ydGFsT3V0bGV0LFxuICBDZGtQb3J0YWxPdXRsZXQsXG4gIENvbXBvbmVudFBvcnRhbCxcbiAgRG9tUG9ydGFsLFxuICBUZW1wbGF0ZVBvcnRhbCxcbn0gZnJvbSAnQGFuZ3VsYXIvY2RrL3BvcnRhbCc7XG5cbmltcG9ydCB7IEFuaW1hdGlvbkV2ZW50IH0gZnJvbSAnQGFuZ3VsYXIvYW5pbWF0aW9ucyc7XG5pbXBvcnQgeyBPYnNlcnZhYmxlLCBTdWJqZWN0IH0gZnJvbSAncnhqcyc7XG5cbmltcG9ydCB7IHRvYXN0QW5pbWF0aW9ucyB9IGZyb20gJy4vdG9hc3QuYW5pbWF0aW9uJztcblxuQENvbXBvbmVudCh7XG4gIHN0YW5kYWxvbmU6IHRydWUsXG4gIHNlbGVjdG9yOiAndG9hc3QtY29udGFpbmVyJyxcbiAgdGVtcGxhdGU6ICc8bmctdGVtcGxhdGUgY2RrUG9ydGFsT3V0bGV0IC8+JyxcbiAgYW5pbWF0aW9uczogW3RvYXN0QW5pbWF0aW9ucy50b2FzdFN0YXRlXSxcbiAgaW1wb3J0czogW0Nka1BvcnRhbE91dGxldF0sXG4gIGhvc3Q6IHtcbiAgICBjbGFzczogJ20tNCBmbGV4IGZsZXgtY29sJyxcbiAgICAnW0BzdGF0ZV0nOiAnX2FuaW1hdGlvblN0YXRlJyxcbiAgICAnKEBzdGF0ZS5kb25lKSc6ICdvbkFuaW1hdGlvbkVuZCgkZXZlbnQpJyxcbiAgfSxcbn0pXG5leHBvcnQgY2xhc3MgVG9hc3RDb250YWluZXJDb21wb25lbnQgZXh0ZW5kcyBCYXNlUG9ydGFsT3V0bGV0IGltcGxlbWVudHMgT25EZXN0cm95IHtcbiAgLyoqIFdoZXRoZXIgdGhlIGNvbXBvbmVudCBoYXMgYmVlbiBkZXN0cm95ZWQuICovXG4gIHByaXZhdGUgX2Rlc3Ryb3llZCA9IGZhbHNlO1xuXG4gIC8qKiBUaGUgcG9ydGFsIG91dGxldCBpbnNpZGUgb2YgdGhpcyBjb250YWluZXIgaW50byB3aGljaCB0aGUgdG9hc3QgY29udGVudCB3aWxsIGJlIGxvYWRlZC4gKi9cbiAgQFZpZXdDaGlsZChDZGtQb3J0YWxPdXRsZXQsIHsgc3RhdGljOiB0cnVlIH0pIF9wb3J0YWxPdXRsZXQ6IENka1BvcnRhbE91dGxldDtcblxuICAvKiogU3ViamVjdCBmb3Igbm90aWZ5aW5nIHRoYXQgdGhlIHRvYXN0IGhhcyBleGl0ZWQgZnJvbSB2aWV3LiAqL1xuICByZWFkb25seSBfb25FeGl0ID0gbmV3IFN1YmplY3Q8dm9pZD4oKTtcblxuICAvKiogU3ViamVjdCBmb3Igbm90aWZ5aW5nIHRoYXQgdGhlIHRvYXN0IGhhcyBmaW5pc2hlZCBlbnRlcmluZyB0aGUgdmlldy4gKi9cbiAgcmVhZG9ubHkgX29uRW50ZXIgPSBuZXcgU3ViamVjdDx2b2lkPigpO1xuXG4gIC8qKiBUaGUgc3RhdGUgb2YgdGhlIHRvYXN0IGFuaW1hdGlvbnMuICovXG4gIF9hbmltYXRpb25TdGF0ZSA9ICd2b2lkJztcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIF9uZ1pvbmU6IE5nWm9uZSxcbiAgICBwcml2YXRlIF9jaGFuZ2VEZXRlY3RvclJlZjogQ2hhbmdlRGV0ZWN0b3JSZWZcbiAgKSB7XG4gICAgc3VwZXIoKTtcbiAgfVxuXG4gIGF0dGFjaENvbXBvbmVudFBvcnRhbDxUPihwb3J0YWw6IENvbXBvbmVudFBvcnRhbDxUPik6IENvbXBvbmVudFJlZjxUPiB7XG4gICAgY29uc3QgcmVzdWx0ID0gdGhpcy5fcG9ydGFsT3V0bGV0LmF0dGFjaENvbXBvbmVudFBvcnRhbChwb3J0YWwpO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBhdHRhY2hUZW1wbGF0ZVBvcnRhbDxDPihwb3J0YWw6IFRlbXBsYXRlUG9ydGFsPEM+KTogRW1iZWRkZWRWaWV3UmVmPEM+IHtcbiAgICBjb25zdCByZXN1bHQgPSB0aGlzLl9wb3J0YWxPdXRsZXQuYXR0YWNoVGVtcGxhdGVQb3J0YWwocG9ydGFsKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgb3ZlcnJpZGUgYXR0YWNoRG9tUG9ydGFsID0gKHBvcnRhbDogRG9tUG9ydGFsKSA9PiB7XG4gICAgY29uc3QgcmVzdWx0ID0gdGhpcy5fcG9ydGFsT3V0bGV0LmF0dGFjaERvbVBvcnRhbChwb3J0YWwpO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG5cbiAgb25BbmltYXRpb25FbmQoZXZlbnQ6IEFuaW1hdGlvbkV2ZW50KSB7XG4gICAgY29uc3QgeyBmcm9tU3RhdGUsIHRvU3RhdGUgfSA9IGV2ZW50O1xuXG4gICAgaWYgKCh0b1N0YXRlID09PSAndm9pZCcgJiYgZnJvbVN0YXRlICE9PSAndm9pZCcpIHx8IHRvU3RhdGUgPT09ICdoaWRkZW4nKSB7XG4gICAgICB0aGlzLl9jb21wbGV0ZUV4aXQoKTtcbiAgICB9XG5cbiAgICBpZiAodG9TdGF0ZSA9PT0gJ3Zpc2libGUnKSB7XG4gICAgICBjb25zdCBvbkVudGVyID0gdGhpcy5fb25FbnRlcjtcblxuICAgICAgdGhpcy5fbmdab25lLnJ1bigoKSA9PiB7XG4gICAgICAgIG9uRW50ZXIubmV4dCgpO1xuICAgICAgICBvbkVudGVyLmNvbXBsZXRlKCk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBlbnRlcigpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuX2Rlc3Ryb3llZCkge1xuICAgICAgdGhpcy5fYW5pbWF0aW9uU3RhdGUgPSAndmlzaWJsZSc7XG4gICAgICB0aGlzLl9jaGFuZ2VEZXRlY3RvclJlZi5tYXJrRm9yQ2hlY2soKTtcbiAgICAgIHRoaXMuX2NoYW5nZURldGVjdG9yUmVmLmRldGVjdENoYW5nZXMoKTtcbiAgICB9XG4gIH1cblxuICBleGl0KCk6IE9ic2VydmFibGU8dm9pZD4ge1xuICAgIHRoaXMuX25nWm9uZS5ydW4oKCkgPT4ge1xuICAgICAgdGhpcy5fYW5pbWF0aW9uU3RhdGUgPSAnaGlkZGVuJztcbiAgICAgIHRoaXMuX2NoYW5nZURldGVjdG9yUmVmLm1hcmtGb3JDaGVjaygpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHRoaXMuX29uRXhpdDtcbiAgfVxuXG4gIG5nT25EZXN0cm95KCkge1xuICAgIHRoaXMuX2Rlc3Ryb3llZCA9IHRydWU7XG4gICAgdGhpcy5fY29tcGxldGVFeGl0KCk7XG4gIH1cblxuICBwcml2YXRlIF9jb21wbGV0ZUV4aXQoKSB7XG4gICAgcXVldWVNaWNyb3Rhc2soKCkgPT4ge1xuICAgICAgdGhpcy5fb25FeGl0Lm5leHQoKTtcbiAgICAgIHRoaXMuX29uRXhpdC5jb21wbGV0ZSgpO1xuICAgIH0pO1xuICB9XG59XG4iXX0=