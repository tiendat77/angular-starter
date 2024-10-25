import { ChangeDetectionStrategy, Component, Input, } from '@angular/core';
import { NgClass } from '@angular/common';
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
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: HorizontalNavigationSpacerItemComponent, deps: [{ token: i0.ChangeDetectorRef }, { token: i1.NavigationService }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "18.2.8", type: HorizontalNavigationSpacerItemComponent, isStandalone: true, selector: "horizontal-navigation-spacer-item", inputs: { item: "item", name: "name" }, ngImport: i0, template: "<div\n  class=\"horizontal-navigation-item-wrapper\"\n  [ngClass]=\"item.classes?.wrapper\"\n></div>\n", dependencies: [{ kind: "directive", type: NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: HorizontalNavigationSpacerItemComponent, decorators: [{
            type: Component,
            args: [{ selector: 'horizontal-navigation-spacer-item', changeDetection: ChangeDetectionStrategy.OnPush, standalone: true, imports: [NgClass], template: "<div\n  class=\"horizontal-navigation-item-wrapper\"\n  [ngClass]=\"item.classes?.wrapper\"\n></div>\n" }]
        }], ctorParameters: () => [{ type: i0.ChangeDetectorRef }, { type: i1.NavigationService }], propDecorators: { item: [{
                type: Input
            }], name: [{
                type: Input
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3BhY2VyLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9saWIvaG9yaXpvbnRhbC9jb21wb25lbnRzL3NwYWNlci9zcGFjZXIuY29tcG9uZW50LnRzIiwiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2xpYi9ob3Jpem9udGFsL2NvbXBvbmVudHMvc3BhY2VyL3NwYWNlci5jb21wb25lbnQuaHRtbCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQ0wsdUJBQXVCLEVBRXZCLFNBQVMsRUFDVCxLQUFLLEdBR04sTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQzFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sTUFBTSxDQUFDOzs7QUFhMUMsTUFBTSxPQUFPLHVDQUF1QztJQVF4QztJQUNBO0lBUkQsSUFBSSxDQUFpQjtJQUNyQixJQUFJLENBQVM7SUFFZCw4QkFBOEIsQ0FBZ0M7SUFDOUQsZUFBZSxHQUFpQixJQUFJLE9BQU8sRUFBTyxDQUFDO0lBRTNELFlBQ1Usa0JBQXFDLEVBQ3JDLGtCQUFxQztRQURyQyx1QkFBa0IsR0FBbEIsa0JBQWtCLENBQW1CO1FBQ3JDLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBbUI7SUFDNUMsQ0FBQztJQUVKLHdHQUF3RztJQUN4RyxvQkFBb0I7SUFDcEIsd0dBQXdHO0lBRXhHLFFBQVE7UUFDTixzQ0FBc0M7UUFDdEMsSUFBSSxDQUFDLDhCQUE4QixHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRXRGLHVEQUF1RDtRQUN2RCxJQUFJLENBQUMsOEJBQThCLENBQUMsV0FBVzthQUM1QyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQzthQUNyQyxTQUFTLENBQUMsR0FBRyxFQUFFO1lBQ2QsaUJBQWlCO1lBQ2pCLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUN6QyxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRCxXQUFXO1FBQ1QscUNBQXFDO1FBQ3JDLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2hDLElBQUksQ0FBQyxlQUFlLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDbEMsQ0FBQzt1R0FqQ1UsdUNBQXVDOzJGQUF2Qyx1Q0FBdUMscUlDdEJwRCx3R0FJQSw0Q0RnQlksT0FBTzs7MkZBRU4sdUNBQXVDO2tCQVBuRCxTQUFTOytCQUNFLG1DQUFtQyxtQkFFNUIsdUJBQXVCLENBQUMsTUFBTSxjQUNuQyxJQUFJLFdBQ1AsQ0FBQyxPQUFPLENBQUM7c0hBR1QsSUFBSTtzQkFBWixLQUFLO2dCQUNHLElBQUk7c0JBQVosS0FBSyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIENoYW5nZURldGVjdGlvblN0cmF0ZWd5LFxuICBDaGFuZ2VEZXRlY3RvclJlZixcbiAgQ29tcG9uZW50LFxuICBJbnB1dCxcbiAgT25EZXN0cm95LFxuICBPbkluaXQsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgTmdDbGFzcyB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQgeyBTdWJqZWN0LCB0YWtlVW50aWwgfSBmcm9tICdyeGpzJztcblxuaW1wb3J0IHsgSG9yaXpvbnRhbE5hdmlnYXRpb25Db21wb25lbnQgfSBmcm9tICcuLi8uLi9ob3Jpem9udGFsLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBOYXZpZ2F0aW9uU2VydmljZSB9IGZyb20gJy4uLy4uLy4uL25hdmlnYXRpb24uc2VydmljZSc7XG5pbXBvcnQgeyBOYXZpZ2F0aW9uSXRlbSB9IGZyb20gJy4uLy4uLy4uL25hdmlnYXRpb24udHlwZXMnO1xuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdob3Jpem9udGFsLW5hdmlnYXRpb24tc3BhY2VyLWl0ZW0nLFxuICB0ZW1wbGF0ZVVybDogJy4vc3BhY2VyLmNvbXBvbmVudC5odG1sJyxcbiAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5PblB1c2gsXG4gIHN0YW5kYWxvbmU6IHRydWUsXG4gIGltcG9ydHM6IFtOZ0NsYXNzXSxcbn0pXG5leHBvcnQgY2xhc3MgSG9yaXpvbnRhbE5hdmlnYXRpb25TcGFjZXJJdGVtQ29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0LCBPbkRlc3Ryb3kge1xuICBASW5wdXQoKSBpdGVtOiBOYXZpZ2F0aW9uSXRlbTtcbiAgQElucHV0KCkgbmFtZTogc3RyaW5nO1xuXG4gIHByaXZhdGUgX2hvcml6b250YWxOYXZpZ2F0aW9uQ29tcG9uZW50OiBIb3Jpem9udGFsTmF2aWdhdGlvbkNvbXBvbmVudDtcbiAgcHJpdmF0ZSBfdW5zdWJzY3JpYmVBbGw6IFN1YmplY3Q8YW55PiA9IG5ldyBTdWJqZWN0PGFueT4oKTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIF9jaGFuZ2VEZXRlY3RvclJlZjogQ2hhbmdlRGV0ZWN0b3JSZWYsXG4gICAgcHJpdmF0ZSBfbmF2aWdhdGlvblNlcnZpY2U6IE5hdmlnYXRpb25TZXJ2aWNlXG4gICkge31cblxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBAIExpZmVjeWNsZSBob29rc1xuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIG5nT25Jbml0KCk6IHZvaWQge1xuICAgIC8vIEdldCB0aGUgcGFyZW50IG5hdmlnYXRpb24gY29tcG9uZW50XG4gICAgdGhpcy5faG9yaXpvbnRhbE5hdmlnYXRpb25Db21wb25lbnQgPSB0aGlzLl9uYXZpZ2F0aW9uU2VydmljZS5nZXRDb21wb25lbnQodGhpcy5uYW1lKTtcblxuICAgIC8vIFN1YnNjcmliZSB0byBvblJlZnJlc2hlZCBvbiB0aGUgbmF2aWdhdGlvbiBjb21wb25lbnRcbiAgICB0aGlzLl9ob3Jpem9udGFsTmF2aWdhdGlvbkNvbXBvbmVudC5vblJlZnJlc2hlZFxuICAgICAgLnBpcGUodGFrZVVudGlsKHRoaXMuX3Vuc3Vic2NyaWJlQWxsKSlcbiAgICAgIC5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgICAvLyBNYXJrIGZvciBjaGVja1xuICAgICAgICB0aGlzLl9jaGFuZ2VEZXRlY3RvclJlZi5tYXJrRm9yQ2hlY2soKTtcbiAgICAgIH0pO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKTogdm9pZCB7XG4gICAgLy8gVW5zdWJzY3JpYmUgZnJvbSBhbGwgc3Vic2NyaXB0aW9uc1xuICAgIHRoaXMuX3Vuc3Vic2NyaWJlQWxsLm5leHQobnVsbCk7XG4gICAgdGhpcy5fdW5zdWJzY3JpYmVBbGwuY29tcGxldGUoKTtcbiAgfVxufVxuIiwiPGRpdlxuICBjbGFzcz1cImhvcml6b250YWwtbmF2aWdhdGlvbi1pdGVtLXdyYXBwZXJcIlxuICBbbmdDbGFzc109XCJpdGVtLmNsYXNzZXM/LndyYXBwZXJcIlxuPjwvZGl2PlxuIl19