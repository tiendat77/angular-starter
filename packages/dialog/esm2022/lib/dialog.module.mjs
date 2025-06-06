import { DialogModule as CdkDialogModule } from '@angular/cdk/dialog';
import { NgModule } from '@angular/core';
import { DialogActionsDirective } from './dialog-actions.directive';
import { DialogBodyDirective } from './dialog-body.directive';
import { DialogDismissDirective } from './dialog-dismiss.directive';
import { DialogHeaderDirective } from './dialog-header.directive';
import { DialogTitleDirective } from './dialog-title.directive';
import { DialogLayoutComponent } from './dialog.component';
import { DialogService } from './dialog.service';
import * as i0 from "@angular/core";
const DIRECTIVES = [
    DialogActionsDirective,
    DialogBodyDirective,
    DialogDismissDirective,
    DialogHeaderDirective,
    DialogTitleDirective,
];
export class DialogModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.13", ngImport: i0, type: DialogModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "18.2.13", ngImport: i0, type: DialogModule, imports: [CdkDialogModule, DialogLayoutComponent, DialogActionsDirective,
            DialogBodyDirective,
            DialogDismissDirective,
            DialogHeaderDirective,
            DialogTitleDirective], exports: [DialogLayoutComponent, DialogActionsDirective,
            DialogBodyDirective,
            DialogDismissDirective,
            DialogHeaderDirective,
            DialogTitleDirective] });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "18.2.13", ngImport: i0, type: DialogModule, providers: [DialogService], imports: [CdkDialogModule, DialogLayoutComponent] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.13", ngImport: i0, type: DialogModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [CdkDialogModule, DialogLayoutComponent, ...DIRECTIVES],
                    exports: [DialogLayoutComponent, ...DIRECTIVES],
                    providers: [DialogService],
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlhbG9nLm1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL2xpYnMvZGlhbG9nL3NyYy9saWIvZGlhbG9nLm1vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsWUFBWSxJQUFJLGVBQWUsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBQ3RFLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFekMsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDcEUsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFDOUQsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDcEUsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDbEUsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFDaEUsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFDM0QsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLGtCQUFrQixDQUFDOztBQUVqRCxNQUFNLFVBQVUsR0FBRztJQUNqQixzQkFBc0I7SUFDdEIsbUJBQW1CO0lBQ25CLHNCQUFzQjtJQUN0QixxQkFBcUI7SUFDckIsb0JBQW9CO0NBQ3JCLENBQUM7QUFPRixNQUFNLE9BQU8sWUFBWTt3R0FBWixZQUFZO3lHQUFaLFlBQVksWUFKYixlQUFlLEVBQUUscUJBQXFCLEVBUmhELHNCQUFzQjtZQUN0QixtQkFBbUI7WUFDbkIsc0JBQXNCO1lBQ3RCLHFCQUFxQjtZQUNyQixvQkFBb0IsYUFLVixxQkFBcUIsRUFUL0Isc0JBQXNCO1lBQ3RCLG1CQUFtQjtZQUNuQixzQkFBc0I7WUFDdEIscUJBQXFCO1lBQ3JCLG9CQUFvQjt5R0FRVCxZQUFZLGFBRlosQ0FBQyxhQUFhLENBQUMsWUFGaEIsZUFBZSxFQUFFLHFCQUFxQjs7NEZBSXJDLFlBQVk7a0JBTHhCLFFBQVE7bUJBQUM7b0JBQ1IsT0FBTyxFQUFFLENBQUMsZUFBZSxFQUFFLHFCQUFxQixFQUFFLEdBQUcsVUFBVSxDQUFDO29CQUNoRSxPQUFPLEVBQUUsQ0FBQyxxQkFBcUIsRUFBRSxHQUFHLFVBQVUsQ0FBQztvQkFDL0MsU0FBUyxFQUFFLENBQUMsYUFBYSxDQUFDO2lCQUMzQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IERpYWxvZ01vZHVsZSBhcyBDZGtEaWFsb2dNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jZGsvZGlhbG9nJztcbmltcG9ydCB7IE5nTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7IERpYWxvZ0FjdGlvbnNEaXJlY3RpdmUgfSBmcm9tICcuL2RpYWxvZy1hY3Rpb25zLmRpcmVjdGl2ZSc7XG5pbXBvcnQgeyBEaWFsb2dCb2R5RGlyZWN0aXZlIH0gZnJvbSAnLi9kaWFsb2ctYm9keS5kaXJlY3RpdmUnO1xuaW1wb3J0IHsgRGlhbG9nRGlzbWlzc0RpcmVjdGl2ZSB9IGZyb20gJy4vZGlhbG9nLWRpc21pc3MuZGlyZWN0aXZlJztcbmltcG9ydCB7IERpYWxvZ0hlYWRlckRpcmVjdGl2ZSB9IGZyb20gJy4vZGlhbG9nLWhlYWRlci5kaXJlY3RpdmUnO1xuaW1wb3J0IHsgRGlhbG9nVGl0bGVEaXJlY3RpdmUgfSBmcm9tICcuL2RpYWxvZy10aXRsZS5kaXJlY3RpdmUnO1xuaW1wb3J0IHsgRGlhbG9nTGF5b3V0Q29tcG9uZW50IH0gZnJvbSAnLi9kaWFsb2cuY29tcG9uZW50JztcbmltcG9ydCB7IERpYWxvZ1NlcnZpY2UgfSBmcm9tICcuL2RpYWxvZy5zZXJ2aWNlJztcblxuY29uc3QgRElSRUNUSVZFUyA9IFtcbiAgRGlhbG9nQWN0aW9uc0RpcmVjdGl2ZSxcbiAgRGlhbG9nQm9keURpcmVjdGl2ZSxcbiAgRGlhbG9nRGlzbWlzc0RpcmVjdGl2ZSxcbiAgRGlhbG9nSGVhZGVyRGlyZWN0aXZlLFxuICBEaWFsb2dUaXRsZURpcmVjdGl2ZSxcbl07XG5cbkBOZ01vZHVsZSh7XG4gIGltcG9ydHM6IFtDZGtEaWFsb2dNb2R1bGUsIERpYWxvZ0xheW91dENvbXBvbmVudCwgLi4uRElSRUNUSVZFU10sXG4gIGV4cG9ydHM6IFtEaWFsb2dMYXlvdXRDb21wb25lbnQsIC4uLkRJUkVDVElWRVNdLFxuICBwcm92aWRlcnM6IFtEaWFsb2dTZXJ2aWNlXSxcbn0pXG5leHBvcnQgY2xhc3MgRGlhbG9nTW9kdWxlIHt9XG4iXX0=