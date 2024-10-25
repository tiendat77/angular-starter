import { ChangeDetectionStrategy, Component, Input, } from '@angular/core';
import { NgClass } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import * as i0 from "@angular/core";
import * as i1 from "../../../navigation.service";
export class VerticalNavigationSpacerItemComponent {
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
        this._verticalNavigationComponent = this._navigationService.getComponent(this.name);
        this._verticalNavigationComponent.onRefreshed
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(() => {
            this._changeDetectorRef.markForCheck();
        });
    }
    ngOnDestroy() {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: VerticalNavigationSpacerItemComponent, deps: [{ token: i0.ChangeDetectorRef }, { token: i1.NavigationService }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "18.2.8", type: VerticalNavigationSpacerItemComponent, isStandalone: true, selector: "vertical-navigation-spacer-item", inputs: { item: "item", name: "name" }, ngImport: i0, template: "<div\n  class=\"vertical-navigation-item-wrapper\"\n  [ngClass]=\"item.classes?.wrapper\"\n></div>\n", dependencies: [{ kind: "directive", type: NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: VerticalNavigationSpacerItemComponent, decorators: [{
            type: Component,
            args: [{ selector: 'vertical-navigation-spacer-item', changeDetection: ChangeDetectionStrategy.OnPush, standalone: true, imports: [NgClass], template: "<div\n  class=\"vertical-navigation-item-wrapper\"\n  [ngClass]=\"item.classes?.wrapper\"\n></div>\n" }]
        }], ctorParameters: () => [{ type: i0.ChangeDetectorRef }, { type: i1.NavigationService }], propDecorators: { item: [{
                type: Input
            }], name: [{
                type: Input
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3BhY2VyLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9saWIvdmVydGljYWwvY29tcG9uZW50cy9zcGFjZXIvc3BhY2VyLmNvbXBvbmVudC50cyIsIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9saWIvdmVydGljYWwvY29tcG9uZW50cy9zcGFjZXIvc3BhY2VyLmNvbXBvbmVudC5odG1sIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFDTCx1QkFBdUIsRUFFdkIsU0FBUyxFQUNULEtBQUssR0FHTixNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFFMUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxNQUFNLENBQUM7OztBQVkxQyxNQUFNLE9BQU8scUNBQXFDO0lBUXRDO0lBQ0E7SUFSRCxJQUFJLENBQWlCO0lBQ3JCLElBQUksQ0FBUztJQUVkLDRCQUE0QixDQUE4QjtJQUMxRCxlQUFlLEdBQWlCLElBQUksT0FBTyxFQUFPLENBQUM7SUFFM0QsWUFDVSxrQkFBcUMsRUFDckMsa0JBQXFDO1FBRHJDLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBbUI7UUFDckMsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFtQjtJQUM1QyxDQUFDO0lBRUosd0dBQXdHO0lBQ3hHLG9CQUFvQjtJQUNwQix3R0FBd0c7SUFFeEcsUUFBUTtRQUNOLElBQUksQ0FBQyw0QkFBNEIsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUVwRixJQUFJLENBQUMsNEJBQTRCLENBQUMsV0FBVzthQUMxQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQzthQUNyQyxTQUFTLENBQUMsR0FBRyxFQUFFO1lBQ2QsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFlBQVksRUFBRSxDQUFDO1FBQ3pDLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVELFdBQVc7UUFDVCxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNoQyxJQUFJLENBQUMsZUFBZSxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQ2xDLENBQUM7dUdBN0JVLHFDQUFxQzsyRkFBckMscUNBQXFDLG1JQ3RCbEQsc0dBSUEsNENEZ0JZLE9BQU87OzJGQUVOLHFDQUFxQztrQkFQakQsU0FBUzsrQkFDRSxpQ0FBaUMsbUJBRTFCLHVCQUF1QixDQUFDLE1BQU0sY0FDbkMsSUFBSSxXQUNQLENBQUMsT0FBTyxDQUFDO3NIQUdULElBQUk7c0JBQVosS0FBSztnQkFDRyxJQUFJO3NCQUFaLEtBQUsiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSxcbiAgQ2hhbmdlRGV0ZWN0b3JSZWYsXG4gIENvbXBvbmVudCxcbiAgSW5wdXQsXG4gIE9uRGVzdHJveSxcbiAgT25Jbml0LFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IE5nQ2xhc3MgfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuXG5pbXBvcnQgeyBTdWJqZWN0LCB0YWtlVW50aWwgfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IE5hdmlnYXRpb25TZXJ2aWNlIH0gZnJvbSAnLi4vLi4vLi4vbmF2aWdhdGlvbi5zZXJ2aWNlJztcbmltcG9ydCB7IE5hdmlnYXRpb25JdGVtIH0gZnJvbSAnLi4vLi4vLi4vbmF2aWdhdGlvbi50eXBlcyc7XG5pbXBvcnQgeyBWZXJ0aWNhbE5hdmlnYXRpb25Db21wb25lbnQgfSBmcm9tICcuLi8uLi8uLi92ZXJ0aWNhbC92ZXJ0aWNhbC5jb21wb25lbnQnO1xuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICd2ZXJ0aWNhbC1uYXZpZ2F0aW9uLXNwYWNlci1pdGVtJyxcbiAgdGVtcGxhdGVVcmw6ICcuL3NwYWNlci5jb21wb25lbnQuaHRtbCcsXG4gIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuT25QdXNoLFxuICBzdGFuZGFsb25lOiB0cnVlLFxuICBpbXBvcnRzOiBbTmdDbGFzc10sXG59KVxuZXhwb3J0IGNsYXNzIFZlcnRpY2FsTmF2aWdhdGlvblNwYWNlckl0ZW1Db21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQsIE9uRGVzdHJveSB7XG4gIEBJbnB1dCgpIGl0ZW06IE5hdmlnYXRpb25JdGVtO1xuICBASW5wdXQoKSBuYW1lOiBzdHJpbmc7XG5cbiAgcHJpdmF0ZSBfdmVydGljYWxOYXZpZ2F0aW9uQ29tcG9uZW50OiBWZXJ0aWNhbE5hdmlnYXRpb25Db21wb25lbnQ7XG4gIHByaXZhdGUgX3Vuc3Vic2NyaWJlQWxsOiBTdWJqZWN0PGFueT4gPSBuZXcgU3ViamVjdDxhbnk+KCk7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBfY2hhbmdlRGV0ZWN0b3JSZWY6IENoYW5nZURldGVjdG9yUmVmLFxuICAgIHByaXZhdGUgX25hdmlnYXRpb25TZXJ2aWNlOiBOYXZpZ2F0aW9uU2VydmljZVxuICApIHt9XG5cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gQCBMaWZlY3ljbGUgaG9va3NcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICBuZ09uSW5pdCgpOiB2b2lkIHtcbiAgICB0aGlzLl92ZXJ0aWNhbE5hdmlnYXRpb25Db21wb25lbnQgPSB0aGlzLl9uYXZpZ2F0aW9uU2VydmljZS5nZXRDb21wb25lbnQodGhpcy5uYW1lKTtcblxuICAgIHRoaXMuX3ZlcnRpY2FsTmF2aWdhdGlvbkNvbXBvbmVudC5vblJlZnJlc2hlZFxuICAgICAgLnBpcGUodGFrZVVudGlsKHRoaXMuX3Vuc3Vic2NyaWJlQWxsKSlcbiAgICAgIC5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgICB0aGlzLl9jaGFuZ2VEZXRlY3RvclJlZi5tYXJrRm9yQ2hlY2soKTtcbiAgICAgIH0pO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKTogdm9pZCB7XG4gICAgdGhpcy5fdW5zdWJzY3JpYmVBbGwubmV4dChudWxsKTtcbiAgICB0aGlzLl91bnN1YnNjcmliZUFsbC5jb21wbGV0ZSgpO1xuICB9XG59XG4iLCI8ZGl2XG4gIGNsYXNzPVwidmVydGljYWwtbmF2aWdhdGlvbi1pdGVtLXdyYXBwZXJcIlxuICBbbmdDbGFzc109XCJpdGVtLmNsYXNzZXM/LndyYXBwZXJcIlxuPjwvZGl2PlxuIl19