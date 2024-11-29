import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import * as i0 from "@angular/core";
import * as i1 from "../../../navigation.service";
export class VerticalNavigationDividerItemComponent {
    _changeDetectorRef;
    _navigationService;
    item;
    name;
    _verticalNavigationComponent;
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
        this._verticalNavigationComponent = this._navigationService.getComponent(this.name);
        // Subscribe to onRefreshed on the navigation component
        this._verticalNavigationComponent.onRefreshed
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
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.13", ngImport: i0, type: VerticalNavigationDividerItemComponent, deps: [{ token: i0.ChangeDetectorRef }, { token: i1.NavigationService }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "18.2.13", type: VerticalNavigationDividerItemComponent, isStandalone: true, selector: "vertical-navigation-divider-item", inputs: { item: "item", name: "name" }, ngImport: i0, template: "<div\n  class=\"vertical-navigation-item-wrapper divider\"\n  [ngClass]=\"item.classes?.wrapper\"\n></div>\n", dependencies: [{ kind: "directive", type: NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.13", ngImport: i0, type: VerticalNavigationDividerItemComponent, decorators: [{
            type: Component,
            args: [{ selector: 'vertical-navigation-divider-item', changeDetection: ChangeDetectionStrategy.OnPush, standalone: true, imports: [NgClass], template: "<div\n  class=\"vertical-navigation-item-wrapper divider\"\n  [ngClass]=\"item.classes?.wrapper\"\n></div>\n" }]
        }], ctorParameters: () => [{ type: i0.ChangeDetectorRef }, { type: i1.NavigationService }], propDecorators: { item: [{
                type: Input
            }], name: [{
                type: Input
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGl2aWRlci5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9saWJzL25hdmlnYXRpb24vc3JjL2xpYi92ZXJ0aWNhbC9jb21wb25lbnRzL2RpdmlkZXIvZGl2aWRlci5jb21wb25lbnQudHMiLCIuLi8uLi8uLi8uLi8uLi8uLi8uLi9saWJzL25hdmlnYXRpb24vc3JjL2xpYi92ZXJ0aWNhbC9jb21wb25lbnRzL2RpdmlkZXIvZGl2aWRlci5jb21wb25lbnQuaHRtbCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDMUMsT0FBTyxFQUNMLHVCQUF1QixFQUV2QixTQUFTLEVBQ1QsS0FBSyxHQUdOLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sTUFBTSxDQUFDOzs7QUFhMUMsTUFBTSxPQUFPLHNDQUFzQztJQVF2QztJQUNBO0lBUkQsSUFBSSxDQUFpQjtJQUNyQixJQUFJLENBQVM7SUFFZCw0QkFBNEIsQ0FBOEI7SUFDMUQsZUFBZSxHQUFpQixJQUFJLE9BQU8sRUFBTyxDQUFDO0lBRTNELFlBQ1Usa0JBQXFDLEVBQ3JDLGtCQUFxQztRQURyQyx1QkFBa0IsR0FBbEIsa0JBQWtCLENBQW1CO1FBQ3JDLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBbUI7SUFDNUMsQ0FBQztJQUVKLHdHQUF3RztJQUN4RyxvQkFBb0I7SUFDcEIsd0dBQXdHO0lBRXhHLFFBQVE7UUFDTixzQ0FBc0M7UUFDdEMsSUFBSSxDQUFDLDRCQUE0QixHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRXBGLHVEQUF1RDtRQUN2RCxJQUFJLENBQUMsNEJBQTRCLENBQUMsV0FBVzthQUMxQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQzthQUNyQyxTQUFTLENBQUMsR0FBRyxFQUFFO1lBQ2QsaUJBQWlCO1lBQ2pCLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUN6QyxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRCxXQUFXO1FBQ1QscUNBQXFDO1FBQ3JDLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2hDLElBQUksQ0FBQyxlQUFlLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDbEMsQ0FBQzt3R0FqQ1Usc0NBQXNDOzRGQUF0QyxzQ0FBc0Msb0lDdEJuRCw4R0FJQSw0Q0RnQlksT0FBTzs7NEZBRU4sc0NBQXNDO2tCQVBsRCxTQUFTOytCQUNFLGtDQUFrQyxtQkFFM0IsdUJBQXVCLENBQUMsTUFBTSxjQUNuQyxJQUFJLFdBQ1AsQ0FBQyxPQUFPLENBQUM7c0hBR1QsSUFBSTtzQkFBWixLQUFLO2dCQUNHLElBQUk7c0JBQVosS0FBSyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5nQ2xhc3MgfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHtcbiAgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksXG4gIENoYW5nZURldGVjdG9yUmVmLFxuICBDb21wb25lbnQsXG4gIElucHV0LFxuICBPbkRlc3Ryb3ksXG4gIE9uSW5pdCxcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBTdWJqZWN0LCB0YWtlVW50aWwgfSBmcm9tICdyeGpzJztcblxuaW1wb3J0IHsgTmF2aWdhdGlvblNlcnZpY2UgfSBmcm9tICcuLi8uLi8uLi9uYXZpZ2F0aW9uLnNlcnZpY2UnO1xuaW1wb3J0IHsgTmF2aWdhdGlvbkl0ZW0gfSBmcm9tICcuLi8uLi8uLi9uYXZpZ2F0aW9uLnR5cGVzJztcbmltcG9ydCB7IFZlcnRpY2FsTmF2aWdhdGlvbkNvbXBvbmVudCB9IGZyb20gJy4uLy4uL3ZlcnRpY2FsLmNvbXBvbmVudCc7XG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ3ZlcnRpY2FsLW5hdmlnYXRpb24tZGl2aWRlci1pdGVtJyxcbiAgdGVtcGxhdGVVcmw6ICcuL2RpdmlkZXIuY29tcG9uZW50Lmh0bWwnLFxuICBjaGFuZ2VEZXRlY3Rpb246IENoYW5nZURldGVjdGlvblN0cmF0ZWd5Lk9uUHVzaCxcbiAgc3RhbmRhbG9uZTogdHJ1ZSxcbiAgaW1wb3J0czogW05nQ2xhc3NdLFxufSlcbmV4cG9ydCBjbGFzcyBWZXJ0aWNhbE5hdmlnYXRpb25EaXZpZGVySXRlbUNvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCwgT25EZXN0cm95IHtcbiAgQElucHV0KCkgaXRlbTogTmF2aWdhdGlvbkl0ZW07XG4gIEBJbnB1dCgpIG5hbWU6IHN0cmluZztcblxuICBwcml2YXRlIF92ZXJ0aWNhbE5hdmlnYXRpb25Db21wb25lbnQ6IFZlcnRpY2FsTmF2aWdhdGlvbkNvbXBvbmVudDtcbiAgcHJpdmF0ZSBfdW5zdWJzY3JpYmVBbGw6IFN1YmplY3Q8YW55PiA9IG5ldyBTdWJqZWN0PGFueT4oKTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIF9jaGFuZ2VEZXRlY3RvclJlZjogQ2hhbmdlRGV0ZWN0b3JSZWYsXG4gICAgcHJpdmF0ZSBfbmF2aWdhdGlvblNlcnZpY2U6IE5hdmlnYXRpb25TZXJ2aWNlXG4gICkge31cblxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBAIExpZmVjeWNsZSBob29rc1xuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIG5nT25Jbml0KCk6IHZvaWQge1xuICAgIC8vIEdldCB0aGUgcGFyZW50IG5hdmlnYXRpb24gY29tcG9uZW50XG4gICAgdGhpcy5fdmVydGljYWxOYXZpZ2F0aW9uQ29tcG9uZW50ID0gdGhpcy5fbmF2aWdhdGlvblNlcnZpY2UuZ2V0Q29tcG9uZW50KHRoaXMubmFtZSk7XG5cbiAgICAvLyBTdWJzY3JpYmUgdG8gb25SZWZyZXNoZWQgb24gdGhlIG5hdmlnYXRpb24gY29tcG9uZW50XG4gICAgdGhpcy5fdmVydGljYWxOYXZpZ2F0aW9uQ29tcG9uZW50Lm9uUmVmcmVzaGVkXG4gICAgICAucGlwZSh0YWtlVW50aWwodGhpcy5fdW5zdWJzY3JpYmVBbGwpKVxuICAgICAgLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICAgIC8vIE1hcmsgZm9yIGNoZWNrXG4gICAgICAgIHRoaXMuX2NoYW5nZURldGVjdG9yUmVmLm1hcmtGb3JDaGVjaygpO1xuICAgICAgfSk7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpOiB2b2lkIHtcbiAgICAvLyBVbnN1YnNjcmliZSBmcm9tIGFsbCBzdWJzY3JpcHRpb25zXG4gICAgdGhpcy5fdW5zdWJzY3JpYmVBbGwubmV4dChudWxsKTtcbiAgICB0aGlzLl91bnN1YnNjcmliZUFsbC5jb21wbGV0ZSgpO1xuICB9XG59XG4iLCI8ZGl2XG4gIGNsYXNzPVwidmVydGljYWwtbmF2aWdhdGlvbi1pdGVtLXdyYXBwZXIgZGl2aWRlclwiXG4gIFtuZ0NsYXNzXT1cIml0ZW0uY2xhc3Nlcz8ud3JhcHBlclwiXG4+PC9kaXY+XG4iXX0=