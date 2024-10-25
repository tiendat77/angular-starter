import { ChangeDetectionStrategy, Component, Input, } from '@angular/core';
import { NgClass } from '@angular/common';
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
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: VerticalNavigationDividerItemComponent, deps: [{ token: i0.ChangeDetectorRef }, { token: i1.NavigationService }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "18.2.8", type: VerticalNavigationDividerItemComponent, isStandalone: true, selector: "vertical-navigation-divider-item", inputs: { item: "item", name: "name" }, ngImport: i0, template: "<div\n  class=\"vertical-navigation-item-wrapper divider\"\n  [ngClass]=\"item.classes?.wrapper\"\n></div>\n", dependencies: [{ kind: "directive", type: NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: VerticalNavigationDividerItemComponent, decorators: [{
            type: Component,
            args: [{ selector: 'vertical-navigation-divider-item', changeDetection: ChangeDetectionStrategy.OnPush, standalone: true, imports: [NgClass], template: "<div\n  class=\"vertical-navigation-item-wrapper divider\"\n  [ngClass]=\"item.classes?.wrapper\"\n></div>\n" }]
        }], ctorParameters: () => [{ type: i0.ChangeDetectorRef }, { type: i1.NavigationService }], propDecorators: { item: [{
                type: Input
            }], name: [{
                type: Input
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGl2aWRlci5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbGliL3ZlcnRpY2FsL2NvbXBvbmVudHMvZGl2aWRlci9kaXZpZGVyLmNvbXBvbmVudC50cyIsIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9saWIvdmVydGljYWwvY29tcG9uZW50cy9kaXZpZGVyL2RpdmlkZXIuY29tcG9uZW50Lmh0bWwiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUNMLHVCQUF1QixFQUV2QixTQUFTLEVBQ1QsS0FBSyxHQUdOLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUMxQyxPQUFPLEVBQUUsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLE1BQU0sQ0FBQzs7O0FBYTFDLE1BQU0sT0FBTyxzQ0FBc0M7SUFRdkM7SUFDQTtJQVJELElBQUksQ0FBaUI7SUFDckIsSUFBSSxDQUFTO0lBRWQsNEJBQTRCLENBQThCO0lBQzFELGVBQWUsR0FBaUIsSUFBSSxPQUFPLEVBQU8sQ0FBQztJQUUzRCxZQUNVLGtCQUFxQyxFQUNyQyxrQkFBcUM7UUFEckMsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFtQjtRQUNyQyx1QkFBa0IsR0FBbEIsa0JBQWtCLENBQW1CO0lBQzVDLENBQUM7SUFFSix3R0FBd0c7SUFDeEcsb0JBQW9CO0lBQ3BCLHdHQUF3RztJQUV4RyxRQUFRO1FBQ04sc0NBQXNDO1FBQ3RDLElBQUksQ0FBQyw0QkFBNEIsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUVwRix1REFBdUQ7UUFDdkQsSUFBSSxDQUFDLDRCQUE0QixDQUFDLFdBQVc7YUFDMUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7YUFDckMsU0FBUyxDQUFDLEdBQUcsRUFBRTtZQUNkLGlCQUFpQjtZQUNqQixJQUFJLENBQUMsa0JBQWtCLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDekMsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQsV0FBVztRQUNULHFDQUFxQztRQUNyQyxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNoQyxJQUFJLENBQUMsZUFBZSxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQ2xDLENBQUM7dUdBakNVLHNDQUFzQzsyRkFBdEMsc0NBQXNDLG9JQ3RCbkQsOEdBSUEsNENEZ0JZLE9BQU87OzJGQUVOLHNDQUFzQztrQkFQbEQsU0FBUzsrQkFDRSxrQ0FBa0MsbUJBRTNCLHVCQUF1QixDQUFDLE1BQU0sY0FDbkMsSUFBSSxXQUNQLENBQUMsT0FBTyxDQUFDO3NIQUdULElBQUk7c0JBQVosS0FBSztnQkFDRyxJQUFJO3NCQUFaLEtBQUsiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSxcbiAgQ2hhbmdlRGV0ZWN0b3JSZWYsXG4gIENvbXBvbmVudCxcbiAgSW5wdXQsXG4gIE9uRGVzdHJveSxcbiAgT25Jbml0LFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IE5nQ2xhc3MgfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHsgU3ViamVjdCwgdGFrZVVudGlsIH0gZnJvbSAncnhqcyc7XG5cbmltcG9ydCB7IFZlcnRpY2FsTmF2aWdhdGlvbkNvbXBvbmVudCB9IGZyb20gJy4uLy4uLy4uL3ZlcnRpY2FsL3ZlcnRpY2FsLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBOYXZpZ2F0aW9uU2VydmljZSB9IGZyb20gJy4uLy4uLy4uL25hdmlnYXRpb24uc2VydmljZSc7XG5pbXBvcnQgeyBOYXZpZ2F0aW9uSXRlbSB9IGZyb20gJy4uLy4uLy4uL25hdmlnYXRpb24udHlwZXMnO1xuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICd2ZXJ0aWNhbC1uYXZpZ2F0aW9uLWRpdmlkZXItaXRlbScsXG4gIHRlbXBsYXRlVXJsOiAnLi9kaXZpZGVyLmNvbXBvbmVudC5odG1sJyxcbiAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5PblB1c2gsXG4gIHN0YW5kYWxvbmU6IHRydWUsXG4gIGltcG9ydHM6IFtOZ0NsYXNzXSxcbn0pXG5leHBvcnQgY2xhc3MgVmVydGljYWxOYXZpZ2F0aW9uRGl2aWRlckl0ZW1Db21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQsIE9uRGVzdHJveSB7XG4gIEBJbnB1dCgpIGl0ZW06IE5hdmlnYXRpb25JdGVtO1xuICBASW5wdXQoKSBuYW1lOiBzdHJpbmc7XG5cbiAgcHJpdmF0ZSBfdmVydGljYWxOYXZpZ2F0aW9uQ29tcG9uZW50OiBWZXJ0aWNhbE5hdmlnYXRpb25Db21wb25lbnQ7XG4gIHByaXZhdGUgX3Vuc3Vic2NyaWJlQWxsOiBTdWJqZWN0PGFueT4gPSBuZXcgU3ViamVjdDxhbnk+KCk7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBfY2hhbmdlRGV0ZWN0b3JSZWY6IENoYW5nZURldGVjdG9yUmVmLFxuICAgIHByaXZhdGUgX25hdmlnYXRpb25TZXJ2aWNlOiBOYXZpZ2F0aW9uU2VydmljZVxuICApIHt9XG5cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gQCBMaWZlY3ljbGUgaG9va3NcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICBuZ09uSW5pdCgpOiB2b2lkIHtcbiAgICAvLyBHZXQgdGhlIHBhcmVudCBuYXZpZ2F0aW9uIGNvbXBvbmVudFxuICAgIHRoaXMuX3ZlcnRpY2FsTmF2aWdhdGlvbkNvbXBvbmVudCA9IHRoaXMuX25hdmlnYXRpb25TZXJ2aWNlLmdldENvbXBvbmVudCh0aGlzLm5hbWUpO1xuXG4gICAgLy8gU3Vic2NyaWJlIHRvIG9uUmVmcmVzaGVkIG9uIHRoZSBuYXZpZ2F0aW9uIGNvbXBvbmVudFxuICAgIHRoaXMuX3ZlcnRpY2FsTmF2aWdhdGlvbkNvbXBvbmVudC5vblJlZnJlc2hlZFxuICAgICAgLnBpcGUodGFrZVVudGlsKHRoaXMuX3Vuc3Vic2NyaWJlQWxsKSlcbiAgICAgIC5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgICAvLyBNYXJrIGZvciBjaGVja1xuICAgICAgICB0aGlzLl9jaGFuZ2VEZXRlY3RvclJlZi5tYXJrRm9yQ2hlY2soKTtcbiAgICAgIH0pO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKTogdm9pZCB7XG4gICAgLy8gVW5zdWJzY3JpYmUgZnJvbSBhbGwgc3Vic2NyaXB0aW9uc1xuICAgIHRoaXMuX3Vuc3Vic2NyaWJlQWxsLm5leHQobnVsbCk7XG4gICAgdGhpcy5fdW5zdWJzY3JpYmVBbGwuY29tcGxldGUoKTtcbiAgfVxufVxuIiwiPGRpdlxuICBjbGFzcz1cInZlcnRpY2FsLW5hdmlnYXRpb24taXRlbS13cmFwcGVyIGRpdmlkZXJcIlxuICBbbmdDbGFzc109XCJpdGVtLmNsYXNzZXM/LndyYXBwZXJcIlxuPjwvZGl2PlxuIl19