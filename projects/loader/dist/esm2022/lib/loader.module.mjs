import { NgModule } from '@angular/core';
import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import { LoaderComponent } from './loader.component';
import { LoaderService } from './loader.service';
import * as i0 from "@angular/core";
export class ToastModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: ToastModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "18.2.8", ngImport: i0, type: ToastModule, imports: [OverlayModule, PortalModule, LoaderComponent], exports: [LoaderComponent] });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: ToastModule, providers: [LoaderService], imports: [OverlayModule, PortalModule] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: ToastModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [OverlayModule, PortalModule, LoaderComponent],
                    exports: [LoaderComponent],
                    providers: [LoaderService],
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9hZGVyLm1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9saWIvbG9hZGVyLm1vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ3pDLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUNyRCxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFFbkQsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBQ3JELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQzs7QUFPakQsTUFBTSxPQUFPLFdBQVc7dUdBQVgsV0FBVzt3R0FBWCxXQUFXLFlBSlosYUFBYSxFQUFFLFlBQVksRUFBRSxlQUFlLGFBQzVDLGVBQWU7d0dBR2QsV0FBVyxhQUZYLENBQUMsYUFBYSxDQUFDLFlBRmhCLGFBQWEsRUFBRSxZQUFZOzsyRkFJMUIsV0FBVztrQkFMdkIsUUFBUTttQkFBQztvQkFDUixPQUFPLEVBQUUsQ0FBQyxhQUFhLEVBQUUsWUFBWSxFQUFFLGVBQWUsQ0FBQztvQkFDdkQsT0FBTyxFQUFFLENBQUMsZUFBZSxDQUFDO29CQUMxQixTQUFTLEVBQUUsQ0FBQyxhQUFhLENBQUM7aUJBQzNCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTmdNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IE92ZXJsYXlNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jZGsvb3ZlcmxheSc7XG5pbXBvcnQgeyBQb3J0YWxNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jZGsvcG9ydGFsJztcblxuaW1wb3J0IHsgTG9hZGVyQ29tcG9uZW50IH0gZnJvbSAnLi9sb2FkZXIuY29tcG9uZW50JztcbmltcG9ydCB7IExvYWRlclNlcnZpY2UgfSBmcm9tICcuL2xvYWRlci5zZXJ2aWNlJztcblxuQE5nTW9kdWxlKHtcbiAgaW1wb3J0czogW092ZXJsYXlNb2R1bGUsIFBvcnRhbE1vZHVsZSwgTG9hZGVyQ29tcG9uZW50XSxcbiAgZXhwb3J0czogW0xvYWRlckNvbXBvbmVudF0sXG4gIHByb3ZpZGVyczogW0xvYWRlclNlcnZpY2VdLFxufSlcbmV4cG9ydCBjbGFzcyBUb2FzdE1vZHVsZSB7fVxuIl19