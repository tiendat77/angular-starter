import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, } from '@angular/core';
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
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.13", ngImport: i0, type: VerticalNavigationSpacerItemComponent, deps: [{ token: i0.ChangeDetectorRef }, { token: i1.NavigationService }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "18.2.13", type: VerticalNavigationSpacerItemComponent, isStandalone: true, selector: "vertical-navigation-spacer-item", inputs: { item: "item", name: "name" }, ngImport: i0, template: "<div\n  class=\"vertical-navigation-item-wrapper\"\n  [ngClass]=\"item.classes?.wrapper\"\n></div>\n", dependencies: [{ kind: "directive", type: NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.13", ngImport: i0, type: VerticalNavigationSpacerItemComponent, decorators: [{
            type: Component,
            args: [{ selector: 'vertical-navigation-spacer-item', changeDetection: ChangeDetectionStrategy.OnPush, standalone: true, imports: [NgClass], template: "<div\n  class=\"vertical-navigation-item-wrapper\"\n  [ngClass]=\"item.classes?.wrapper\"\n></div>\n" }]
        }], ctorParameters: () => [{ type: i0.ChangeDetectorRef }, { type: i1.NavigationService }], propDecorators: { item: [{
                type: Input
            }], name: [{
                type: Input
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3BhY2VyLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2xpYnMvbmF2aWdhdGlvbi9zcmMvbGliL3ZlcnRpY2FsL2NvbXBvbmVudHMvc3BhY2VyL3NwYWNlci5jb21wb25lbnQudHMiLCIuLi8uLi8uLi8uLi8uLi8uLi8uLi9saWJzL25hdmlnYXRpb24vc3JjL2xpYi92ZXJ0aWNhbC9jb21wb25lbnRzL3NwYWNlci9zcGFjZXIuY29tcG9uZW50Lmh0bWwiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQzFDLE9BQU8sRUFDTCx1QkFBdUIsRUFFdkIsU0FBUyxFQUNULEtBQUssR0FHTixNQUFNLGVBQWUsQ0FBQztBQUV2QixPQUFPLEVBQUUsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLE1BQU0sQ0FBQzs7O0FBWTFDLE1BQU0sT0FBTyxxQ0FBcUM7SUFRdEM7SUFDQTtJQVJELElBQUksQ0FBaUI7SUFDckIsSUFBSSxDQUFTO0lBRWQsNEJBQTRCLENBQThCO0lBQzFELGVBQWUsR0FBaUIsSUFBSSxPQUFPLEVBQU8sQ0FBQztJQUUzRCxZQUNVLGtCQUFxQyxFQUNyQyxrQkFBcUM7UUFEckMsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFtQjtRQUNyQyx1QkFBa0IsR0FBbEIsa0JBQWtCLENBQW1CO0lBQzVDLENBQUM7SUFFSix3R0FBd0c7SUFDeEcsb0JBQW9CO0lBQ3BCLHdHQUF3RztJQUV4RyxRQUFRO1FBQ04sSUFBSSxDQUFDLDRCQUE0QixHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRXBGLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxXQUFXO2FBQzFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO2FBQ3JDLFNBQVMsQ0FBQyxHQUFHLEVBQUU7WUFDZCxJQUFJLENBQUMsa0JBQWtCLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDekMsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQsV0FBVztRQUNULElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2hDLElBQUksQ0FBQyxlQUFlLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDbEMsQ0FBQzt3R0E3QlUscUNBQXFDOzRGQUFyQyxxQ0FBcUMsbUlDdEJsRCxzR0FJQSw0Q0RnQlksT0FBTzs7NEZBRU4scUNBQXFDO2tCQVBqRCxTQUFTOytCQUNFLGlDQUFpQyxtQkFFMUIsdUJBQXVCLENBQUMsTUFBTSxjQUNuQyxJQUFJLFdBQ1AsQ0FBQyxPQUFPLENBQUM7c0hBR1QsSUFBSTtzQkFBWixLQUFLO2dCQUNHLElBQUk7c0JBQVosS0FBSyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5nQ2xhc3MgfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHtcbiAgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksXG4gIENoYW5nZURldGVjdG9yUmVmLFxuICBDb21wb25lbnQsXG4gIElucHV0LFxuICBPbkRlc3Ryb3ksXG4gIE9uSW5pdCxcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7IFN1YmplY3QsIHRha2VVbnRpbCB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgTmF2aWdhdGlvblNlcnZpY2UgfSBmcm9tICcuLi8uLi8uLi9uYXZpZ2F0aW9uLnNlcnZpY2UnO1xuaW1wb3J0IHsgTmF2aWdhdGlvbkl0ZW0gfSBmcm9tICcuLi8uLi8uLi9uYXZpZ2F0aW9uLnR5cGVzJztcbmltcG9ydCB7IFZlcnRpY2FsTmF2aWdhdGlvbkNvbXBvbmVudCB9IGZyb20gJy4uLy4uL3ZlcnRpY2FsLmNvbXBvbmVudCc7XG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ3ZlcnRpY2FsLW5hdmlnYXRpb24tc3BhY2VyLWl0ZW0nLFxuICB0ZW1wbGF0ZVVybDogJy4vc3BhY2VyLmNvbXBvbmVudC5odG1sJyxcbiAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5PblB1c2gsXG4gIHN0YW5kYWxvbmU6IHRydWUsXG4gIGltcG9ydHM6IFtOZ0NsYXNzXSxcbn0pXG5leHBvcnQgY2xhc3MgVmVydGljYWxOYXZpZ2F0aW9uU3BhY2VySXRlbUNvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCwgT25EZXN0cm95IHtcbiAgQElucHV0KCkgaXRlbTogTmF2aWdhdGlvbkl0ZW07XG4gIEBJbnB1dCgpIG5hbWU6IHN0cmluZztcblxuICBwcml2YXRlIF92ZXJ0aWNhbE5hdmlnYXRpb25Db21wb25lbnQ6IFZlcnRpY2FsTmF2aWdhdGlvbkNvbXBvbmVudDtcbiAgcHJpdmF0ZSBfdW5zdWJzY3JpYmVBbGw6IFN1YmplY3Q8YW55PiA9IG5ldyBTdWJqZWN0PGFueT4oKTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIF9jaGFuZ2VEZXRlY3RvclJlZjogQ2hhbmdlRGV0ZWN0b3JSZWYsXG4gICAgcHJpdmF0ZSBfbmF2aWdhdGlvblNlcnZpY2U6IE5hdmlnYXRpb25TZXJ2aWNlXG4gICkge31cblxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBAIExpZmVjeWNsZSBob29rc1xuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIG5nT25Jbml0KCk6IHZvaWQge1xuICAgIHRoaXMuX3ZlcnRpY2FsTmF2aWdhdGlvbkNvbXBvbmVudCA9IHRoaXMuX25hdmlnYXRpb25TZXJ2aWNlLmdldENvbXBvbmVudCh0aGlzLm5hbWUpO1xuXG4gICAgdGhpcy5fdmVydGljYWxOYXZpZ2F0aW9uQ29tcG9uZW50Lm9uUmVmcmVzaGVkXG4gICAgICAucGlwZSh0YWtlVW50aWwodGhpcy5fdW5zdWJzY3JpYmVBbGwpKVxuICAgICAgLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICAgIHRoaXMuX2NoYW5nZURldGVjdG9yUmVmLm1hcmtGb3JDaGVjaygpO1xuICAgICAgfSk7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpOiB2b2lkIHtcbiAgICB0aGlzLl91bnN1YnNjcmliZUFsbC5uZXh0KG51bGwpO1xuICAgIHRoaXMuX3Vuc3Vic2NyaWJlQWxsLmNvbXBsZXRlKCk7XG4gIH1cbn1cbiIsIjxkaXZcbiAgY2xhc3M9XCJ2ZXJ0aWNhbC1uYXZpZ2F0aW9uLWl0ZW0td3JhcHBlclwiXG4gIFtuZ0NsYXNzXT1cIml0ZW0uY2xhc3Nlcz8ud3JhcHBlclwiXG4+PC9kaXY+XG4iXX0=