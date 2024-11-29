import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import { NgModule } from '@angular/core';
import { LoaderComponent } from './loader.component';
import { LoaderService } from './loader.service';
import * as i0 from "@angular/core";
export class ToastModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.13", ngImport: i0, type: ToastModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "18.2.13", ngImport: i0, type: ToastModule, imports: [OverlayModule, PortalModule, LoaderComponent], exports: [LoaderComponent] });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "18.2.13", ngImport: i0, type: ToastModule, providers: [LoaderService], imports: [OverlayModule, PortalModule] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.13", ngImport: i0, type: ToastModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [OverlayModule, PortalModule, LoaderComponent],
                    exports: [LoaderComponent],
                    providers: [LoaderService],
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9hZGVyLm1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL2xpYnMvbG9hZGVyL3NyYy9saWIvbG9hZGVyLm1vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDckQsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBQ25ELE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFekMsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBQ3JELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQzs7QUFPakQsTUFBTSxPQUFPLFdBQVc7d0dBQVgsV0FBVzt5R0FBWCxXQUFXLFlBSlosYUFBYSxFQUFFLFlBQVksRUFBRSxlQUFlLGFBQzVDLGVBQWU7eUdBR2QsV0FBVyxhQUZYLENBQUMsYUFBYSxDQUFDLFlBRmhCLGFBQWEsRUFBRSxZQUFZOzs0RkFJMUIsV0FBVztrQkFMdkIsUUFBUTttQkFBQztvQkFDUixPQUFPLEVBQUUsQ0FBQyxhQUFhLEVBQUUsWUFBWSxFQUFFLGVBQWUsQ0FBQztvQkFDdkQsT0FBTyxFQUFFLENBQUMsZUFBZSxDQUFDO29CQUMxQixTQUFTLEVBQUUsQ0FBQyxhQUFhLENBQUM7aUJBQzNCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgT3ZlcmxheU1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2Nkay9vdmVybGF5JztcbmltcG9ydCB7IFBvcnRhbE1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2Nkay9wb3J0YWwnO1xuaW1wb3J0IHsgTmdNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgTG9hZGVyQ29tcG9uZW50IH0gZnJvbSAnLi9sb2FkZXIuY29tcG9uZW50JztcbmltcG9ydCB7IExvYWRlclNlcnZpY2UgfSBmcm9tICcuL2xvYWRlci5zZXJ2aWNlJztcblxuQE5nTW9kdWxlKHtcbiAgaW1wb3J0czogW092ZXJsYXlNb2R1bGUsIFBvcnRhbE1vZHVsZSwgTG9hZGVyQ29tcG9uZW50XSxcbiAgZXhwb3J0czogW0xvYWRlckNvbXBvbmVudF0sXG4gIHByb3ZpZGVyczogW0xvYWRlclNlcnZpY2VdLFxufSlcbmV4cG9ydCBjbGFzcyBUb2FzdE1vZHVsZSB7fVxuIl19