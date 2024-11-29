import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import * as i0 from "@angular/core";
import * as i1 from "../../../navigation.service";
export class HorizontalNavigationSpacerItemComponent {
    _changeDetectorRef;
    _navigationService;
    item;
    name;
    _horizontalNavigationComponent;
    _unsubscribeAll = new Subject();
    constructor(_changeDetectorRef, _navigationService) {
        this._changeDetectorRef = _changeDetectorRef;
        this._navigationService = _navigationService;
    }
    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------
    ngOnInit() {
        // Get the parent navigation component
        this._horizontalNavigationComponent = this._navigationService.getComponent(this.name);
        // Subscribe to onRefreshed on the navigation component
        this._horizontalNavigationComponent.onRefreshed
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(() => {
            // Mark for check
            this._changeDetectorRef.markForCheck();
        });
    }
    ngOnDestroy() {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.13", ngImport: i0, type: HorizontalNavigationSpacerItemComponent, deps: [{ token: i0.ChangeDetectorRef }, { token: i1.NavigationService }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "18.2.13", type: HorizontalNavigationSpacerItemComponent, isStandalone: true, selector: "horizontal-navigation-spacer-item", inputs: { item: "item", name: "name" }, ngImport: i0, template: "<div\n  class=\"horizontal-navigation-item-wrapper\"\n  [ngClass]=\"item.classes?.wrapper\"\n></div>\n", dependencies: [{ kind: "directive", type: NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.13", ngImport: i0, type: HorizontalNavigationSpacerItemComponent, decorators: [{
            type: Component,
            args: [{ selector: 'horizontal-navigation-spacer-item', changeDetection: ChangeDetectionStrategy.OnPush, standalone: true, imports: [NgClass], template: "<div\n  class=\"horizontal-navigation-item-wrapper\"\n  [ngClass]=\"item.classes?.wrapper\"\n></div>\n" }]
        }], ctorParameters: () => [{ type: i0.ChangeDetectorRef }, { type: i1.NavigationService }], propDecorators: { item: [{
                type: Input
            }], name: [{
                type: Input
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3BhY2VyLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2xpYnMvbmF2aWdhdGlvbi9zcmMvbGliL2hvcml6b250YWwvY29tcG9uZW50cy9zcGFjZXIvc3BhY2VyLmNvbXBvbmVudC50cyIsIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2xpYnMvbmF2aWdhdGlvbi9zcmMvbGliL2hvcml6b250YWwvY29tcG9uZW50cy9zcGFjZXIvc3BhY2VyLmNvbXBvbmVudC5odG1sIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUMxQyxPQUFPLEVBQ0wsdUJBQXVCLEVBRXZCLFNBQVMsRUFDVCxLQUFLLEdBR04sTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxNQUFNLENBQUM7OztBQWExQyxNQUFNLE9BQU8sdUNBQXVDO0lBUXhDO0lBQ0E7SUFSRCxJQUFJLENBQWlCO0lBQ3JCLElBQUksQ0FBUztJQUVkLDhCQUE4QixDQUFnQztJQUM5RCxlQUFlLEdBQWlCLElBQUksT0FBTyxFQUFPLENBQUM7SUFFM0QsWUFDVSxrQkFBcUMsRUFDckMsa0JBQXFDO1FBRHJDLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBbUI7UUFDckMsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFtQjtJQUM1QyxDQUFDO0lBRUosd0dBQXdHO0lBQ3hHLG9CQUFvQjtJQUNwQix3R0FBd0c7SUFFeEcsUUFBUTtRQUNOLHNDQUFzQztRQUN0QyxJQUFJLENBQUMsOEJBQThCLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFdEYsdURBQXVEO1FBQ3ZELElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxXQUFXO2FBQzVDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO2FBQ3JDLFNBQVMsQ0FBQyxHQUFHLEVBQUU7WUFDZCxpQkFBaUI7WUFDakIsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFlBQVksRUFBRSxDQUFDO1FBQ3pDLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVELFdBQVc7UUFDVCxxQ0FBcUM7UUFDckMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDaEMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUNsQyxDQUFDO3dHQWpDVSx1Q0FBdUM7NEZBQXZDLHVDQUF1QyxxSUN0QnBELHdHQUlBLDRDRGdCWSxPQUFPOzs0RkFFTix1Q0FBdUM7a0JBUG5ELFNBQVM7K0JBQ0UsbUNBQW1DLG1CQUU1Qix1QkFBdUIsQ0FBQyxNQUFNLGNBQ25DLElBQUksV0FDUCxDQUFDLE9BQU8sQ0FBQztzSEFHVCxJQUFJO3NCQUFaLEtBQUs7Z0JBQ0csSUFBSTtzQkFBWixLQUFLIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTmdDbGFzcyB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQge1xuICBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSxcbiAgQ2hhbmdlRGV0ZWN0b3JSZWYsXG4gIENvbXBvbmVudCxcbiAgSW5wdXQsXG4gIE9uRGVzdHJveSxcbiAgT25Jbml0LFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IFN1YmplY3QsIHRha2VVbnRpbCB9IGZyb20gJ3J4anMnO1xuXG5pbXBvcnQgeyBOYXZpZ2F0aW9uU2VydmljZSB9IGZyb20gJy4uLy4uLy4uL25hdmlnYXRpb24uc2VydmljZSc7XG5pbXBvcnQgeyBOYXZpZ2F0aW9uSXRlbSB9IGZyb20gJy4uLy4uLy4uL25hdmlnYXRpb24udHlwZXMnO1xuaW1wb3J0IHsgSG9yaXpvbnRhbE5hdmlnYXRpb25Db21wb25lbnQgfSBmcm9tICcuLi8uLi9ob3Jpem9udGFsLmNvbXBvbmVudCc7XG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ2hvcml6b250YWwtbmF2aWdhdGlvbi1zcGFjZXItaXRlbScsXG4gIHRlbXBsYXRlVXJsOiAnLi9zcGFjZXIuY29tcG9uZW50Lmh0bWwnLFxuICBjaGFuZ2VEZXRlY3Rpb246IENoYW5nZURldGVjdGlvblN0cmF0ZWd5Lk9uUHVzaCxcbiAgc3RhbmRhbG9uZTogdHJ1ZSxcbiAgaW1wb3J0czogW05nQ2xhc3NdLFxufSlcbmV4cG9ydCBjbGFzcyBIb3Jpem9udGFsTmF2aWdhdGlvblNwYWNlckl0ZW1Db21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQsIE9uRGVzdHJveSB7XG4gIEBJbnB1dCgpIGl0ZW06IE5hdmlnYXRpb25JdGVtO1xuICBASW5wdXQoKSBuYW1lOiBzdHJpbmc7XG5cbiAgcHJpdmF0ZSBfaG9yaXpvbnRhbE5hdmlnYXRpb25Db21wb25lbnQ6IEhvcml6b250YWxOYXZpZ2F0aW9uQ29tcG9uZW50O1xuICBwcml2YXRlIF91bnN1YnNjcmliZUFsbDogU3ViamVjdDxhbnk+ID0gbmV3IFN1YmplY3Q8YW55PigpO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgX2NoYW5nZURldGVjdG9yUmVmOiBDaGFuZ2VEZXRlY3RvclJlZixcbiAgICBwcml2YXRlIF9uYXZpZ2F0aW9uU2VydmljZTogTmF2aWdhdGlvblNlcnZpY2VcbiAgKSB7fVxuXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIEAgTGlmZWN5Y2xlIGhvb2tzXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgbmdPbkluaXQoKTogdm9pZCB7XG4gICAgLy8gR2V0IHRoZSBwYXJlbnQgbmF2aWdhdGlvbiBjb21wb25lbnRcbiAgICB0aGlzLl9ob3Jpem9udGFsTmF2aWdhdGlvbkNvbXBvbmVudCA9IHRoaXMuX25hdmlnYXRpb25TZXJ2aWNlLmdldENvbXBvbmVudCh0aGlzLm5hbWUpO1xuXG4gICAgLy8gU3Vic2NyaWJlIHRvIG9uUmVmcmVzaGVkIG9uIHRoZSBuYXZpZ2F0aW9uIGNvbXBvbmVudFxuICAgIHRoaXMuX2hvcml6b250YWxOYXZpZ2F0aW9uQ29tcG9uZW50Lm9uUmVmcmVzaGVkXG4gICAgICAucGlwZSh0YWtlVW50aWwodGhpcy5fdW5zdWJzY3JpYmVBbGwpKVxuICAgICAgLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICAgIC8vIE1hcmsgZm9yIGNoZWNrXG4gICAgICAgIHRoaXMuX2NoYW5nZURldGVjdG9yUmVmLm1hcmtGb3JDaGVjaygpO1xuICAgICAgfSk7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpOiB2b2lkIHtcbiAgICAvLyBVbnN1YnNjcmliZSBmcm9tIGFsbCBzdWJzY3JpcHRpb25zXG4gICAgdGhpcy5fdW5zdWJzY3JpYmVBbGwubmV4dChudWxsKTtcbiAgICB0aGlzLl91bnN1YnNjcmliZUFsbC5jb21wbGV0ZSgpO1xuICB9XG59XG4iLCI8ZGl2XG4gIGNsYXNzPVwiaG9yaXpvbnRhbC1uYXZpZ2F0aW9uLWl0ZW0td3JhcHBlclwiXG4gIFtuZ0NsYXNzXT1cIml0ZW0uY2xhc3Nlcz8ud3JhcHBlclwiXG4+PC9kaXY+XG4iXX0=