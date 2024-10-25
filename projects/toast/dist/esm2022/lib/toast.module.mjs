import { NgModule } from '@angular/core';
import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import { ToastComponent } from './toast.component';
import { ToastService } from './toast.service';
import { ToastContainerComponent } from './toast.container';
import * as i0 from "@angular/core";
export class ToastModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: ToastModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "18.2.8", ngImport: i0, type: ToastModule, imports: [OverlayModule, PortalModule, ToastContainerComponent, ToastComponent], exports: [ToastContainerComponent, ToastComponent] });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: ToastModule, providers: [ToastService], imports: [OverlayModule, PortalModule] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: ToastModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [OverlayModule, PortalModule, ToastContainerComponent, ToastComponent],
                    exports: [ToastContainerComponent, ToastComponent],
                    providers: [ToastService],
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9hc3QubW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xpYi90b2FzdC5tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUN6QyxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDckQsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBRW5ELE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUNuRCxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDL0MsT0FBTyxFQUFFLHVCQUF1QixFQUFFLE1BQU0sbUJBQW1CLENBQUM7O0FBTzVELE1BQU0sT0FBTyxXQUFXO3VHQUFYLFdBQVc7d0dBQVgsV0FBVyxZQUpaLGFBQWEsRUFBRSxZQUFZLEVBQUUsdUJBQXVCLEVBQUUsY0FBYyxhQUNwRSx1QkFBdUIsRUFBRSxjQUFjO3dHQUd0QyxXQUFXLGFBRlgsQ0FBQyxZQUFZLENBQUMsWUFGZixhQUFhLEVBQUUsWUFBWTs7MkZBSTFCLFdBQVc7a0JBTHZCLFFBQVE7bUJBQUM7b0JBQ1IsT0FBTyxFQUFFLENBQUMsYUFBYSxFQUFFLFlBQVksRUFBRSx1QkFBdUIsRUFBRSxjQUFjLENBQUM7b0JBQy9FLE9BQU8sRUFBRSxDQUFDLHVCQUF1QixFQUFFLGNBQWMsQ0FBQztvQkFDbEQsU0FBUyxFQUFFLENBQUMsWUFBWSxDQUFDO2lCQUMxQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5nTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBPdmVybGF5TW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvY2RrL292ZXJsYXknO1xuaW1wb3J0IHsgUG9ydGFsTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvY2RrL3BvcnRhbCc7XG5cbmltcG9ydCB7IFRvYXN0Q29tcG9uZW50IH0gZnJvbSAnLi90b2FzdC5jb21wb25lbnQnO1xuaW1wb3J0IHsgVG9hc3RTZXJ2aWNlIH0gZnJvbSAnLi90b2FzdC5zZXJ2aWNlJztcbmltcG9ydCB7IFRvYXN0Q29udGFpbmVyQ29tcG9uZW50IH0gZnJvbSAnLi90b2FzdC5jb250YWluZXInO1xuXG5ATmdNb2R1bGUoe1xuICBpbXBvcnRzOiBbT3ZlcmxheU1vZHVsZSwgUG9ydGFsTW9kdWxlLCBUb2FzdENvbnRhaW5lckNvbXBvbmVudCwgVG9hc3RDb21wb25lbnRdLFxuICBleHBvcnRzOiBbVG9hc3RDb250YWluZXJDb21wb25lbnQsIFRvYXN0Q29tcG9uZW50XSxcbiAgcHJvdmlkZXJzOiBbVG9hc3RTZXJ2aWNlXSxcbn0pXG5leHBvcnQgY2xhc3MgVG9hc3RNb2R1bGUge31cbiJdfQ==