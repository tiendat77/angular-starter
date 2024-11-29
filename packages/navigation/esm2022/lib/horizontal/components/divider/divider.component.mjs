import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import * as i0 from "@angular/core";
import * as i1 from "../../../navigation.service";
export class HorizontalNavigationDividerItemComponent {
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
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.13", ngImport: i0, type: HorizontalNavigationDividerItemComponent, deps: [{ token: i0.ChangeDetectorRef }, { token: i1.NavigationService }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "18.2.13", type: HorizontalNavigationDividerItemComponent, isStandalone: true, selector: "horizontal-navigation-divider-item", inputs: { item: "item", name: "name" }, ngImport: i0, template: "<div\n  class=\"horizontal-navigation-item-wrapper divider\"\n  [ngClass]=\"item.classes?.wrapper\"\n></div>\n", dependencies: [{ kind: "directive", type: NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.13", ngImport: i0, type: HorizontalNavigationDividerItemComponent, decorators: [{
            type: Component,
            args: [{ selector: 'horizontal-navigation-divider-item', changeDetection: ChangeDetectionStrategy.OnPush, standalone: true, imports: [NgClass], template: "<div\n  class=\"horizontal-navigation-item-wrapper divider\"\n  [ngClass]=\"item.classes?.wrapper\"\n></div>\n" }]
        }], ctorParameters: () => [{ type: i0.ChangeDetectorRef }, { type: i1.NavigationService }], propDecorators: { item: [{
                type: Input
            }], name: [{
                type: Input
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGl2aWRlci5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9saWJzL25hdmlnYXRpb24vc3JjL2xpYi9ob3Jpem9udGFsL2NvbXBvbmVudHMvZGl2aWRlci9kaXZpZGVyLmNvbXBvbmVudC50cyIsIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2xpYnMvbmF2aWdhdGlvbi9zcmMvbGliL2hvcml6b250YWwvY29tcG9uZW50cy9kaXZpZGVyL2RpdmlkZXIuY29tcG9uZW50Lmh0bWwiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQzFDLE9BQU8sRUFDTCx1QkFBdUIsRUFFdkIsU0FBUyxFQUNULEtBQUssR0FHTixNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQUUsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLE1BQU0sQ0FBQzs7O0FBYTFDLE1BQU0sT0FBTyx3Q0FBd0M7SUFRekM7SUFDQTtJQVJELElBQUksQ0FBaUI7SUFDckIsSUFBSSxDQUFTO0lBRWQsOEJBQThCLENBQWdDO0lBQzlELGVBQWUsR0FBaUIsSUFBSSxPQUFPLEVBQU8sQ0FBQztJQUUzRCxZQUNVLGtCQUFxQyxFQUNyQyxrQkFBcUM7UUFEckMsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFtQjtRQUNyQyx1QkFBa0IsR0FBbEIsa0JBQWtCLENBQW1CO0lBQzVDLENBQUM7SUFFSix3R0FBd0c7SUFDeEcsb0JBQW9CO0lBQ3BCLHdHQUF3RztJQUV4RyxRQUFRO1FBQ04sc0NBQXNDO1FBQ3RDLElBQUksQ0FBQyw4QkFBOEIsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUV0Rix1REFBdUQ7UUFDdkQsSUFBSSxDQUFDLDhCQUE4QixDQUFDLFdBQVc7YUFDNUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7YUFDckMsU0FBUyxDQUFDLEdBQUcsRUFBRTtZQUNkLGlCQUFpQjtZQUNqQixJQUFJLENBQUMsa0JBQWtCLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDekMsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQsV0FBVztRQUNULElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2hDLElBQUksQ0FBQyxlQUFlLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDbEMsQ0FBQzt3R0FoQ1Usd0NBQXdDOzRGQUF4Qyx3Q0FBd0Msc0lDdEJyRCxnSEFJQSw0Q0RnQlksT0FBTzs7NEZBRU4sd0NBQXdDO2tCQVBwRCxTQUFTOytCQUNFLG9DQUFvQyxtQkFFN0IsdUJBQXVCLENBQUMsTUFBTSxjQUNuQyxJQUFJLFdBQ1AsQ0FBQyxPQUFPLENBQUM7c0hBR1QsSUFBSTtzQkFBWixLQUFLO2dCQUNHLElBQUk7c0JBQVosS0FBSyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5nQ2xhc3MgfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHtcbiAgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksXG4gIENoYW5nZURldGVjdG9yUmVmLFxuICBDb21wb25lbnQsXG4gIElucHV0LFxuICBPbkRlc3Ryb3ksXG4gIE9uSW5pdCxcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBTdWJqZWN0LCB0YWtlVW50aWwgfSBmcm9tICdyeGpzJztcblxuaW1wb3J0IHsgTmF2aWdhdGlvblNlcnZpY2UgfSBmcm9tICcuLi8uLi8uLi9uYXZpZ2F0aW9uLnNlcnZpY2UnO1xuaW1wb3J0IHsgTmF2aWdhdGlvbkl0ZW0gfSBmcm9tICcuLi8uLi8uLi9uYXZpZ2F0aW9uLnR5cGVzJztcbmltcG9ydCB7IEhvcml6b250YWxOYXZpZ2F0aW9uQ29tcG9uZW50IH0gZnJvbSAnLi4vLi4vaG9yaXpvbnRhbC5jb21wb25lbnQnO1xuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdob3Jpem9udGFsLW5hdmlnYXRpb24tZGl2aWRlci1pdGVtJyxcbiAgdGVtcGxhdGVVcmw6ICcuL2RpdmlkZXIuY29tcG9uZW50Lmh0bWwnLFxuICBjaGFuZ2VEZXRlY3Rpb246IENoYW5nZURldGVjdGlvblN0cmF0ZWd5Lk9uUHVzaCxcbiAgc3RhbmRhbG9uZTogdHJ1ZSxcbiAgaW1wb3J0czogW05nQ2xhc3NdLFxufSlcbmV4cG9ydCBjbGFzcyBIb3Jpem9udGFsTmF2aWdhdGlvbkRpdmlkZXJJdGVtQ29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0LCBPbkRlc3Ryb3kge1xuICBASW5wdXQoKSBpdGVtOiBOYXZpZ2F0aW9uSXRlbTtcbiAgQElucHV0KCkgbmFtZTogc3RyaW5nO1xuXG4gIHByaXZhdGUgX2hvcml6b250YWxOYXZpZ2F0aW9uQ29tcG9uZW50OiBIb3Jpem9udGFsTmF2aWdhdGlvbkNvbXBvbmVudDtcbiAgcHJpdmF0ZSBfdW5zdWJzY3JpYmVBbGw6IFN1YmplY3Q8YW55PiA9IG5ldyBTdWJqZWN0PGFueT4oKTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIF9jaGFuZ2VEZXRlY3RvclJlZjogQ2hhbmdlRGV0ZWN0b3JSZWYsXG4gICAgcHJpdmF0ZSBfbmF2aWdhdGlvblNlcnZpY2U6IE5hdmlnYXRpb25TZXJ2aWNlXG4gICkge31cblxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBAIExpZmVjeWNsZSBob29rc1xuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIG5nT25Jbml0KCk6IHZvaWQge1xuICAgIC8vIEdldCB0aGUgcGFyZW50IG5hdmlnYXRpb24gY29tcG9uZW50XG4gICAgdGhpcy5faG9yaXpvbnRhbE5hdmlnYXRpb25Db21wb25lbnQgPSB0aGlzLl9uYXZpZ2F0aW9uU2VydmljZS5nZXRDb21wb25lbnQodGhpcy5uYW1lKTtcblxuICAgIC8vIFN1YnNjcmliZSB0byBvblJlZnJlc2hlZCBvbiB0aGUgbmF2aWdhdGlvbiBjb21wb25lbnRcbiAgICB0aGlzLl9ob3Jpem9udGFsTmF2aWdhdGlvbkNvbXBvbmVudC5vblJlZnJlc2hlZFxuICAgICAgLnBpcGUodGFrZVVudGlsKHRoaXMuX3Vuc3Vic2NyaWJlQWxsKSlcbiAgICAgIC5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgICAvLyBNYXJrIGZvciBjaGVja1xuICAgICAgICB0aGlzLl9jaGFuZ2VEZXRlY3RvclJlZi5tYXJrRm9yQ2hlY2soKTtcbiAgICAgIH0pO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKTogdm9pZCB7XG4gICAgdGhpcy5fdW5zdWJzY3JpYmVBbGwubmV4dChudWxsKTtcbiAgICB0aGlzLl91bnN1YnNjcmliZUFsbC5jb21wbGV0ZSgpO1xuICB9XG59XG4iLCI8ZGl2XG4gIGNsYXNzPVwiaG9yaXpvbnRhbC1uYXZpZ2F0aW9uLWl0ZW0td3JhcHBlciBkaXZpZGVyXCJcbiAgW25nQ2xhc3NdPVwiaXRlbS5jbGFzc2VzPy53cmFwcGVyXCJcbj48L2Rpdj5cbiJdfQ==