import { ChangeDetectionStrategy, Component, Input, } from '@angular/core';
import { NgClass } from '@angular/common';
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
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: HorizontalNavigationDividerItemComponent, deps: [{ token: i0.ChangeDetectorRef }, { token: i1.NavigationService }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "18.2.8", type: HorizontalNavigationDividerItemComponent, isStandalone: true, selector: "horizontal-navigation-divider-item", inputs: { item: "item", name: "name" }, ngImport: i0, template: "<div\n  class=\"horizontal-navigation-item-wrapper divider\"\n  [ngClass]=\"item.classes?.wrapper\"\n></div>\n", dependencies: [{ kind: "directive", type: NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: HorizontalNavigationDividerItemComponent, decorators: [{
            type: Component,
            args: [{ selector: 'horizontal-navigation-divider-item', changeDetection: ChangeDetectionStrategy.OnPush, standalone: true, imports: [NgClass], template: "<div\n  class=\"horizontal-navigation-item-wrapper divider\"\n  [ngClass]=\"item.classes?.wrapper\"\n></div>\n" }]
        }], ctorParameters: () => [{ type: i0.ChangeDetectorRef }, { type: i1.NavigationService }], propDecorators: { item: [{
                type: Input
            }], name: [{
                type: Input
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGl2aWRlci5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbGliL2hvcml6b250YWwvY29tcG9uZW50cy9kaXZpZGVyL2RpdmlkZXIuY29tcG9uZW50LnRzIiwiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2xpYi9ob3Jpem9udGFsL2NvbXBvbmVudHMvZGl2aWRlci9kaXZpZGVyLmNvbXBvbmVudC5odG1sIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFDTCx1QkFBdUIsRUFFdkIsU0FBUyxFQUNULEtBQUssR0FHTixNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDMUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxNQUFNLENBQUM7OztBQWExQyxNQUFNLE9BQU8sd0NBQXdDO0lBUXpDO0lBQ0E7SUFSRCxJQUFJLENBQWlCO0lBQ3JCLElBQUksQ0FBUztJQUVkLDhCQUE4QixDQUFnQztJQUM5RCxlQUFlLEdBQWlCLElBQUksT0FBTyxFQUFPLENBQUM7SUFFM0QsWUFDVSxrQkFBcUMsRUFDckMsa0JBQXFDO1FBRHJDLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBbUI7UUFDckMsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFtQjtJQUM1QyxDQUFDO0lBRUosd0dBQXdHO0lBQ3hHLG9CQUFvQjtJQUNwQix3R0FBd0c7SUFFeEcsUUFBUTtRQUNOLHNDQUFzQztRQUN0QyxJQUFJLENBQUMsOEJBQThCLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFdEYsdURBQXVEO1FBQ3ZELElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxXQUFXO2FBQzVDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO2FBQ3JDLFNBQVMsQ0FBQyxHQUFHLEVBQUU7WUFDZCxpQkFBaUI7WUFDakIsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFlBQVksRUFBRSxDQUFDO1FBQ3pDLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVELFdBQVc7UUFDVCxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNoQyxJQUFJLENBQUMsZUFBZSxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQ2xDLENBQUM7dUdBaENVLHdDQUF3QzsyRkFBeEMsd0NBQXdDLHNJQ3RCckQsZ0hBSUEsNENEZ0JZLE9BQU87OzJGQUVOLHdDQUF3QztrQkFQcEQsU0FBUzsrQkFDRSxvQ0FBb0MsbUJBRTdCLHVCQUF1QixDQUFDLE1BQU0sY0FDbkMsSUFBSSxXQUNQLENBQUMsT0FBTyxDQUFDO3NIQUdULElBQUk7c0JBQVosS0FBSztnQkFDRyxJQUFJO3NCQUFaLEtBQUsiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSxcbiAgQ2hhbmdlRGV0ZWN0b3JSZWYsXG4gIENvbXBvbmVudCxcbiAgSW5wdXQsXG4gIE9uRGVzdHJveSxcbiAgT25Jbml0LFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IE5nQ2xhc3MgfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHsgU3ViamVjdCwgdGFrZVVudGlsIH0gZnJvbSAncnhqcyc7XG5cbmltcG9ydCB7IEhvcml6b250YWxOYXZpZ2F0aW9uQ29tcG9uZW50IH0gZnJvbSAnLi4vLi4vL2hvcml6b250YWwuY29tcG9uZW50JztcbmltcG9ydCB7IE5hdmlnYXRpb25TZXJ2aWNlIH0gZnJvbSAnLi4vLi4vLi4vbmF2aWdhdGlvbi5zZXJ2aWNlJztcbmltcG9ydCB7IE5hdmlnYXRpb25JdGVtIH0gZnJvbSAnLi4vLi4vLi4vbmF2aWdhdGlvbi50eXBlcyc7XG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ2hvcml6b250YWwtbmF2aWdhdGlvbi1kaXZpZGVyLWl0ZW0nLFxuICB0ZW1wbGF0ZVVybDogJy4vZGl2aWRlci5jb21wb25lbnQuaHRtbCcsXG4gIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuT25QdXNoLFxuICBzdGFuZGFsb25lOiB0cnVlLFxuICBpbXBvcnRzOiBbTmdDbGFzc10sXG59KVxuZXhwb3J0IGNsYXNzIEhvcml6b250YWxOYXZpZ2F0aW9uRGl2aWRlckl0ZW1Db21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQsIE9uRGVzdHJveSB7XG4gIEBJbnB1dCgpIGl0ZW06IE5hdmlnYXRpb25JdGVtO1xuICBASW5wdXQoKSBuYW1lOiBzdHJpbmc7XG5cbiAgcHJpdmF0ZSBfaG9yaXpvbnRhbE5hdmlnYXRpb25Db21wb25lbnQ6IEhvcml6b250YWxOYXZpZ2F0aW9uQ29tcG9uZW50O1xuICBwcml2YXRlIF91bnN1YnNjcmliZUFsbDogU3ViamVjdDxhbnk+ID0gbmV3IFN1YmplY3Q8YW55PigpO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgX2NoYW5nZURldGVjdG9yUmVmOiBDaGFuZ2VEZXRlY3RvclJlZixcbiAgICBwcml2YXRlIF9uYXZpZ2F0aW9uU2VydmljZTogTmF2aWdhdGlvblNlcnZpY2VcbiAgKSB7fVxuXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIEAgTGlmZWN5Y2xlIGhvb2tzXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgbmdPbkluaXQoKTogdm9pZCB7XG4gICAgLy8gR2V0IHRoZSBwYXJlbnQgbmF2aWdhdGlvbiBjb21wb25lbnRcbiAgICB0aGlzLl9ob3Jpem9udGFsTmF2aWdhdGlvbkNvbXBvbmVudCA9IHRoaXMuX25hdmlnYXRpb25TZXJ2aWNlLmdldENvbXBvbmVudCh0aGlzLm5hbWUpO1xuXG4gICAgLy8gU3Vic2NyaWJlIHRvIG9uUmVmcmVzaGVkIG9uIHRoZSBuYXZpZ2F0aW9uIGNvbXBvbmVudFxuICAgIHRoaXMuX2hvcml6b250YWxOYXZpZ2F0aW9uQ29tcG9uZW50Lm9uUmVmcmVzaGVkXG4gICAgICAucGlwZSh0YWtlVW50aWwodGhpcy5fdW5zdWJzY3JpYmVBbGwpKVxuICAgICAgLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICAgIC8vIE1hcmsgZm9yIGNoZWNrXG4gICAgICAgIHRoaXMuX2NoYW5nZURldGVjdG9yUmVmLm1hcmtGb3JDaGVjaygpO1xuICAgICAgfSk7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpOiB2b2lkIHtcbiAgICB0aGlzLl91bnN1YnNjcmliZUFsbC5uZXh0KG51bGwpO1xuICAgIHRoaXMuX3Vuc3Vic2NyaWJlQWxsLmNvbXBsZXRlKCk7XG4gIH1cbn1cbiIsIjxkaXZcbiAgY2xhc3M9XCJob3Jpem9udGFsLW5hdmlnYXRpb24taXRlbS13cmFwcGVyIGRpdmlkZXJcIlxuICBbbmdDbGFzc109XCJpdGVtLmNsYXNzZXM/LndyYXBwZXJcIlxuPjwvZGl2PlxuIl19