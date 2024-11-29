import { Overlay, OverlayConfig } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Injectable, inject } from '@angular/core';
import { LoaderComponent } from './loader.component';
import { LoaderOverlayRef } from './loader.ref';
import * as i0 from "@angular/core";
export class LoaderService {
    _openedLoaderRef = null;
    _overlay = inject(Overlay);
    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------
    show() {
        if (this._openedLoaderRef) {
            return this._openedLoaderRef;
        }
        return this._attach();
    }
    hide() {
        if (this._openedLoaderRef) {
            this._openedLoaderRef.close();
        }
    }
    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------
    _attach() {
        const overlayRef = this._createOverlay();
        const loaderRef = new LoaderOverlayRef(overlayRef);
        const portal = new ComponentPortal(LoaderComponent);
        const contentRef = overlayRef.attach(portal);
        loaderRef.instance = contentRef.instance;
        this._openedLoaderRef = loaderRef;
        return this._openedLoaderRef;
    }
    _createOverlay() {
        const positionStrategy = this._overlay
            .position()
            .global()
            .centerHorizontally()
            .centerVertically();
        const scrollStrategy = this._overlay.scrollStrategies.block();
        const overlayConfig = new OverlayConfig({
            hasBackdrop: true,
            scrollStrategy,
            positionStrategy,
        });
        return this._overlay.create(overlayConfig);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.13", ngImport: i0, type: LoaderService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.2.13", ngImport: i0, type: LoaderService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.13", ngImport: i0, type: LoaderService, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root',
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9hZGVyLnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9saWJzL2xvYWRlci9zcmMvbGliL2xvYWRlci5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDOUQsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBQ3RELE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRW5ELE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUNyRCxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxjQUFjLENBQUM7O0FBS2hELE1BQU0sT0FBTyxhQUFhO0lBQ2hCLGdCQUFnQixHQUE0QixJQUFJLENBQUM7SUFDakQsUUFBUSxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUVuQyx3R0FBd0c7SUFDeEcsbUJBQW1CO0lBQ25CLHdHQUF3RztJQUV4RyxJQUFJO1FBQ0YsSUFBSSxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztZQUMxQixPQUFPLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQztRQUMvQixDQUFDO1FBRUQsT0FBTyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDeEIsQ0FBQztJQUVELElBQUk7UUFDRixJQUFJLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1lBQzFCLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNoQyxDQUFDO0lBQ0gsQ0FBQztJQUVELHdHQUF3RztJQUN4RyxvQkFBb0I7SUFDcEIsd0dBQXdHO0lBRWhHLE9BQU87UUFDYixNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDekMsTUFBTSxTQUFTLEdBQUcsSUFBSSxnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUVuRCxNQUFNLE1BQU0sR0FBRyxJQUFJLGVBQWUsQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUNwRCxNQUFNLFVBQVUsR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBRTdDLFNBQVMsQ0FBQyxRQUFRLEdBQUcsVUFBVSxDQUFDLFFBQVEsQ0FBQztRQUN6QyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsU0FBUyxDQUFDO1FBRWxDLE9BQU8sSUFBSSxDQUFDLGdCQUFnQixDQUFDO0lBQy9CLENBQUM7SUFFTyxjQUFjO1FBQ3BCLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLFFBQVE7YUFDbkMsUUFBUSxFQUFFO2FBQ1YsTUFBTSxFQUFFO2FBQ1Isa0JBQWtCLEVBQUU7YUFDcEIsZ0JBQWdCLEVBQUUsQ0FBQztRQUV0QixNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLGdCQUFnQixDQUFDLEtBQUssRUFBRSxDQUFDO1FBRTlELE1BQU0sYUFBYSxHQUFHLElBQUksYUFBYSxDQUFDO1lBQ3RDLFdBQVcsRUFBRSxJQUFJO1lBQ2pCLGNBQWM7WUFDZCxnQkFBZ0I7U0FDakIsQ0FBQyxDQUFDO1FBRUgsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUM3QyxDQUFDO3dHQXZEVSxhQUFhOzRHQUFiLGFBQWEsY0FGWixNQUFNOzs0RkFFUCxhQUFhO2tCQUh6QixVQUFVO21CQUFDO29CQUNWLFVBQVUsRUFBRSxNQUFNO2lCQUNuQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE92ZXJsYXksIE92ZXJsYXlDb25maWcgfSBmcm9tICdAYW5ndWxhci9jZGsvb3ZlcmxheSc7XG5pbXBvcnQgeyBDb21wb25lbnRQb3J0YWwgfSBmcm9tICdAYW5ndWxhci9jZGsvcG9ydGFsJztcbmltcG9ydCB7IEluamVjdGFibGUsIGluamVjdCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyBMb2FkZXJDb21wb25lbnQgfSBmcm9tICcuL2xvYWRlci5jb21wb25lbnQnO1xuaW1wb3J0IHsgTG9hZGVyT3ZlcmxheVJlZiB9IGZyb20gJy4vbG9hZGVyLnJlZic7XG5cbkBJbmplY3RhYmxlKHtcbiAgcHJvdmlkZWRJbjogJ3Jvb3QnLFxufSlcbmV4cG9ydCBjbGFzcyBMb2FkZXJTZXJ2aWNlIHtcbiAgcHJpdmF0ZSBfb3BlbmVkTG9hZGVyUmVmOiBMb2FkZXJPdmVybGF5UmVmIHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgX292ZXJsYXkgPSBpbmplY3QoT3ZlcmxheSk7XG5cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gQCBQdWJsaWMgbWV0aG9kc1xuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIHNob3coKSB7XG4gICAgaWYgKHRoaXMuX29wZW5lZExvYWRlclJlZikge1xuICAgICAgcmV0dXJuIHRoaXMuX29wZW5lZExvYWRlclJlZjtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fYXR0YWNoKCk7XG4gIH1cblxuICBoaWRlKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9vcGVuZWRMb2FkZXJSZWYpIHtcbiAgICAgIHRoaXMuX29wZW5lZExvYWRlclJlZi5jbG9zZSgpO1xuICAgIH1cbiAgfVxuXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIEAgUHJpdmF0ZSBtZXRob2RzXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgcHJpdmF0ZSBfYXR0YWNoKCkge1xuICAgIGNvbnN0IG92ZXJsYXlSZWYgPSB0aGlzLl9jcmVhdGVPdmVybGF5KCk7XG4gICAgY29uc3QgbG9hZGVyUmVmID0gbmV3IExvYWRlck92ZXJsYXlSZWYob3ZlcmxheVJlZik7XG5cbiAgICBjb25zdCBwb3J0YWwgPSBuZXcgQ29tcG9uZW50UG9ydGFsKExvYWRlckNvbXBvbmVudCk7XG4gICAgY29uc3QgY29udGVudFJlZiA9IG92ZXJsYXlSZWYuYXR0YWNoKHBvcnRhbCk7XG5cbiAgICBsb2FkZXJSZWYuaW5zdGFuY2UgPSBjb250ZW50UmVmLmluc3RhbmNlO1xuICAgIHRoaXMuX29wZW5lZExvYWRlclJlZiA9IGxvYWRlclJlZjtcblxuICAgIHJldHVybiB0aGlzLl9vcGVuZWRMb2FkZXJSZWY7XG4gIH1cblxuICBwcml2YXRlIF9jcmVhdGVPdmVybGF5KCkge1xuICAgIGNvbnN0IHBvc2l0aW9uU3RyYXRlZ3kgPSB0aGlzLl9vdmVybGF5XG4gICAgICAucG9zaXRpb24oKVxuICAgICAgLmdsb2JhbCgpXG4gICAgICAuY2VudGVySG9yaXpvbnRhbGx5KClcbiAgICAgIC5jZW50ZXJWZXJ0aWNhbGx5KCk7XG5cbiAgICBjb25zdCBzY3JvbGxTdHJhdGVneSA9IHRoaXMuX292ZXJsYXkuc2Nyb2xsU3RyYXRlZ2llcy5ibG9jaygpO1xuXG4gICAgY29uc3Qgb3ZlcmxheUNvbmZpZyA9IG5ldyBPdmVybGF5Q29uZmlnKHtcbiAgICAgIGhhc0JhY2tkcm9wOiB0cnVlLFxuICAgICAgc2Nyb2xsU3RyYXRlZ3ksXG4gICAgICBwb3NpdGlvblN0cmF0ZWd5LFxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHRoaXMuX292ZXJsYXkuY3JlYXRlKG92ZXJsYXlDb25maWcpO1xuICB9XG59XG4iXX0=