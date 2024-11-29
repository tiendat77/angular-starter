import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import { NgModule } from '@angular/core';
import { ToastComponent } from './toast.component';
import { ToastContainerComponent } from './toast.container';
import { ToastService } from './toast.service';
import * as i0 from "@angular/core";
export class ToastModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.13", ngImport: i0, type: ToastModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "18.2.13", ngImport: i0, type: ToastModule, imports: [OverlayModule, PortalModule, ToastContainerComponent, ToastComponent], exports: [ToastContainerComponent, ToastComponent] });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "18.2.13", ngImport: i0, type: ToastModule, providers: [ToastService], imports: [OverlayModule, PortalModule] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.13", ngImport: i0, type: ToastModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [OverlayModule, PortalModule, ToastContainerComponent, ToastComponent],
                    exports: [ToastContainerComponent, ToastComponent],
                    providers: [ToastService],
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9hc3QubW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vbGlicy90b2FzdC9zcmMvbGliL3RvYXN0Lm1vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDckQsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBQ25ELE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFekMsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBQ25ELE9BQU8sRUFBRSx1QkFBdUIsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBQzVELE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQzs7QUFPL0MsTUFBTSxPQUFPLFdBQVc7d0dBQVgsV0FBVzt5R0FBWCxXQUFXLFlBSlosYUFBYSxFQUFFLFlBQVksRUFBRSx1QkFBdUIsRUFBRSxjQUFjLGFBQ3BFLHVCQUF1QixFQUFFLGNBQWM7eUdBR3RDLFdBQVcsYUFGWCxDQUFDLFlBQVksQ0FBQyxZQUZmLGFBQWEsRUFBRSxZQUFZOzs0RkFJMUIsV0FBVztrQkFMdkIsUUFBUTttQkFBQztvQkFDUixPQUFPLEVBQUUsQ0FBQyxhQUFhLEVBQUUsWUFBWSxFQUFFLHVCQUF1QixFQUFFLGNBQWMsQ0FBQztvQkFDL0UsT0FBTyxFQUFFLENBQUMsdUJBQXVCLEVBQUUsY0FBYyxDQUFDO29CQUNsRCxTQUFTLEVBQUUsQ0FBQyxZQUFZLENBQUM7aUJBQzFCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgT3ZlcmxheU1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2Nkay9vdmVybGF5JztcbmltcG9ydCB7IFBvcnRhbE1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2Nkay9wb3J0YWwnO1xuaW1wb3J0IHsgTmdNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgVG9hc3RDb21wb25lbnQgfSBmcm9tICcuL3RvYXN0LmNvbXBvbmVudCc7XG5pbXBvcnQgeyBUb2FzdENvbnRhaW5lckNvbXBvbmVudCB9IGZyb20gJy4vdG9hc3QuY29udGFpbmVyJztcbmltcG9ydCB7IFRvYXN0U2VydmljZSB9IGZyb20gJy4vdG9hc3Quc2VydmljZSc7XG5cbkBOZ01vZHVsZSh7XG4gIGltcG9ydHM6IFtPdmVybGF5TW9kdWxlLCBQb3J0YWxNb2R1bGUsIFRvYXN0Q29udGFpbmVyQ29tcG9uZW50LCBUb2FzdENvbXBvbmVudF0sXG4gIGV4cG9ydHM6IFtUb2FzdENvbnRhaW5lckNvbXBvbmVudCwgVG9hc3RDb21wb25lbnRdLFxuICBwcm92aWRlcnM6IFtUb2FzdFNlcnZpY2VdLFxufSlcbmV4cG9ydCBjbGFzcyBUb2FzdE1vZHVsZSB7fVxuIl19