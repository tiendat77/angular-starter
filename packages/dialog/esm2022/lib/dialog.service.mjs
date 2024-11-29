import { Dialog, DialogConfig } from '@angular/cdk/dialog';
import { Overlay } from '@angular/cdk/overlay';
import { Injectable, inject } from '@angular/core';
import { merge } from 'es-toolkit';
import { DialogConfirmComponent } from './confirm.dialog';
import * as i0 from "@angular/core";
export class DialogService {
    _dialog = inject(Dialog);
    _overlay = inject(Overlay);
    open(componentOrTemplateRef, config) {
        config = {
            ...new DialogConfig(),
            ...config,
        };
        const cdkRef = this._dialog.open(componentOrTemplateRef, config);
        return cdkRef;
    }
    confirm(config) {
        return this.open(DialogConfirmComponent, {
            minWidth: '400px',
            data: merge({ type: 'info' }, config),
        });
    }
    closeAll() {
        this._dialog.closeAll();
    }
    ngOnDestroy() {
        this.closeAll();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.13", ngImport: i0, type: DialogService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.2.13", ngImport: i0, type: DialogService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.13", ngImport: i0, type: DialogService, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root',
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlhbG9nLnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9saWJzL2RpYWxvZy9zcmMvbGliL2RpYWxvZy5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxNQUFNLEVBQUUsWUFBWSxFQUFhLE1BQU0scUJBQXFCLENBQUM7QUFDdEUsT0FBTyxFQUFpQixPQUFPLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUM5RCxPQUFPLEVBQUUsVUFBVSxFQUEwQixNQUFNLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFM0UsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLFlBQVksQ0FBQztBQUNuQyxPQUFPLEVBQUUsc0JBQXNCLEVBQXVCLE1BQU0sa0JBQWtCLENBQUM7O0FBSy9FLE1BQU0sT0FBTyxhQUFhO0lBQ2QsT0FBTyxHQUFXLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNqQyxRQUFRLEdBQVksTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBRTlDLElBQUksQ0FDRixzQkFBeUQsRUFDekQsTUFBeUM7UUFFekMsTUFBTSxHQUFHO1lBQ1AsR0FBRyxJQUFJLFlBQVksRUFBc0I7WUFDekMsR0FBRyxNQUFNO1NBQ1YsQ0FBQztRQUVGLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFVLHNCQUFzQixFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBRTFFLE9BQU8sTUFBTSxDQUFDO0lBQ2hCLENBQUM7SUFFRCxPQUFPLENBQUMsTUFBMkI7UUFDakMsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLHNCQUFzQixFQUFFO1lBQ3ZDLFFBQVEsRUFBRSxPQUFPO1lBQ2pCLElBQUksRUFBRSxLQUFLLENBQUMsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLEVBQUUsTUFBTSxDQUFDO1NBQ3RDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRCxRQUFRO1FBQ04sSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUMxQixDQUFDO0lBRUQsV0FBVztRQUNULElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUNsQixDQUFDO3dHQS9CVSxhQUFhOzRHQUFiLGFBQWEsY0FGWixNQUFNOzs0RkFFUCxhQUFhO2tCQUh6QixVQUFVO21CQUFDO29CQUNWLFVBQVUsRUFBRSxNQUFNO2lCQUNuQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IERpYWxvZywgRGlhbG9nQ29uZmlnLCBEaWFsb2dSZWYgfSBmcm9tICdAYW5ndWxhci9jZGsvZGlhbG9nJztcbmltcG9ydCB7IENvbXBvbmVudFR5cGUsIE92ZXJsYXkgfSBmcm9tICdAYW5ndWxhci9jZGsvb3ZlcmxheSc7XG5pbXBvcnQgeyBJbmplY3RhYmxlLCBPbkRlc3Ryb3ksIFRlbXBsYXRlUmVmLCBpbmplY3QgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgbWVyZ2UgfSBmcm9tICdlcy10b29sa2l0JztcbmltcG9ydCB7IERpYWxvZ0NvbmZpcm1Db21wb25lbnQsIERpYWxvZ0NvbmZpcm1Db25maWcgfSBmcm9tICcuL2NvbmZpcm0uZGlhbG9nJztcblxuQEluamVjdGFibGUoe1xuICBwcm92aWRlZEluOiAncm9vdCcsXG59KVxuZXhwb3J0IGNsYXNzIERpYWxvZ1NlcnZpY2UgaW1wbGVtZW50cyBPbkRlc3Ryb3kge1xuICBwcm90ZWN0ZWQgX2RpYWxvZzogRGlhbG9nID0gaW5qZWN0KERpYWxvZyk7XG4gIHByb3RlY3RlZCBfb3ZlcmxheTogT3ZlcmxheSA9IGluamVjdChPdmVybGF5KTtcblxuICBvcGVuPFQsIEQgPSBhbnksIFIgPSBhbnk+KFxuICAgIGNvbXBvbmVudE9yVGVtcGxhdGVSZWY6IENvbXBvbmVudFR5cGU8VD4gfCBUZW1wbGF0ZVJlZjxUPixcbiAgICBjb25maWc/OiBEaWFsb2dDb25maWc8RCwgRGlhbG9nUmVmPFIsIFQ+PlxuICApOiBEaWFsb2dSZWY8UiwgVD4ge1xuICAgIGNvbmZpZyA9IHtcbiAgICAgIC4uLm5ldyBEaWFsb2dDb25maWc8RCwgRGlhbG9nUmVmPFIsIFQ+PigpLFxuICAgICAgLi4uY29uZmlnLFxuICAgIH07XG5cbiAgICBjb25zdCBjZGtSZWYgPSB0aGlzLl9kaWFsb2cub3BlbjxSLCBELCBUPihjb21wb25lbnRPclRlbXBsYXRlUmVmLCBjb25maWcpO1xuXG4gICAgcmV0dXJuIGNka1JlZjtcbiAgfVxuXG4gIGNvbmZpcm0oY29uZmlnOiBEaWFsb2dDb25maXJtQ29uZmlnKSB7XG4gICAgcmV0dXJuIHRoaXMub3BlbihEaWFsb2dDb25maXJtQ29tcG9uZW50LCB7XG4gICAgICBtaW5XaWR0aDogJzQwMHB4JyxcbiAgICAgIGRhdGE6IG1lcmdlKHsgdHlwZTogJ2luZm8nIH0sIGNvbmZpZyksXG4gICAgfSk7XG4gIH1cblxuICBjbG9zZUFsbCgpOiB2b2lkIHtcbiAgICB0aGlzLl9kaWFsb2cuY2xvc2VBbGwoKTtcbiAgfVxuXG4gIG5nT25EZXN0cm95KCkge1xuICAgIHRoaXMuY2xvc2VBbGwoKTtcbiAgfVxufVxuIl19