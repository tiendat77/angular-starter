import { NgClass, NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, forwardRef, Input, } from '@angular/core';
import { SvgIconModule } from '@libs/svg-icon';
import { Subject, takeUntil } from 'rxjs';
import { HorizontalNavigationBasicItemComponent } from '../basic/basic.component';
import { HorizontalNavigationDividerItemComponent } from '../divider/divider.component';
import * as i0 from "@angular/core";
import * as i1 from "../../../navigation.service";
import * as i2 from "@libs/svg-icon";
export class HorizontalNavigationBranchItemComponent {
    _changeDetectorRef;
    _navigationService;
    static ngAcceptInputType_child;
    child = false;
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
    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------
    triggerChangeDetection() {
        // Mark for check
        this._changeDetectorRef.markForCheck();
    }
    trackByFn(index, item) {
        return item.id || index;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.13", ngImport: i0, type: HorizontalNavigationBranchItemComponent, deps: [{ token: i0.ChangeDetectorRef }, { token: i1.NavigationService }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "18.2.13", type: HorizontalNavigationBranchItemComponent, isStandalone: true, selector: "horizontal-navigation-branch-item", inputs: { child: "child", item: "item", name: "name" }, ngImport: i0, template: "@if (!child) {\n  <div class=\"dropdown dropdown-bottom\">\n    <div\n      tabindex=\"0\"\n      [ngClass]=\"{\n        'horizontal-navigation-menu-active-forced': item.active,\n      }\"\n    >\n      <ng-container *ngTemplateOutlet=\"itemTemplate; context: { $implicit: item }\" />\n    </div>\n\n    <div\n      tabindex=\"0\"\n      class=\"menu dropdown-content z-[1] min-w-52 rounded-box bg-base-100 p-2 shadow\"\n    >\n      @for (item of item.children; track item.id) {\n        <!-- Skip the hidden items -->\n        @if ((item.hidden && !item.hidden(item)) || !item.hidden) {\n          <!-- Basic -->\n          @if (item.type === 'basic') {\n            <div\n              class=\"horizontal-navigation-menu-item\"\n              mat-menu-item\n            >\n              <horizontal-navigation-basic-item\n                [item]=\"item\"\n                [name]=\"name\"\n              />\n            </div>\n          }\n\n          <!-- Branch: aside, collapsable, group -->\n          <!-- @if (item.type === 'aside' || item.type === 'collapsable' || item.type === 'group') {\n            <div\n              class=\"horizontal-navigation-menu-item\"\n              [disabled]=\"item.disabled\"\n              [matMenuTriggerFor]=\"branch.matMenu\"\n              mat-menu-item>\n              <ng-container *ngTemplateOutlet=\"itemTemplate; context: {$implicit: item}\">}\n              <horizontal-navigation-branch-item\n                [child]=\"true\"\n                [item]=\"item\"\n                [name]=\"name\"\n                #branch></horizontal-navigation-branch-item>\n            </div>\n          } -->\n\n          <!-- Divider -->\n          @if (item.type === 'divider') {\n            <div\n              class=\"horizontal-navigation-menu-item\"\n              mat-menu-item\n            >\n              <horizontal-navigation-divider-item\n                [item]=\"item\"\n                [name]=\"name\"\n              />\n            </div>\n          }\n        }\n      }\n    </div>\n  </div>\n}\n\n<!-- Item template -->\n<ng-template\n  #itemTemplate\n  let-item\n>\n  <div\n    class=\"horizontal-navigation-item-wrapper\"\n    [class.horizontal-navigation-item-has-subtitle]=\"!!item.subtitle\"\n    [ngClass]=\"item.classes?.wrapper\"\n  >\n    <div\n      class=\"horizontal-navigation-item\"\n      [ngClass]=\"{\n        'horizontal-navigation-item-disabled': item.disabled,\n        'horizontal-navigation-item-active-forced': item.active,\n      }\"\n    >\n      <!-- Icon -->\n      @if (item.icon) {\n        <svg-icon\n          class=\"horizontal-navigation-item-icon\"\n          [ngClass]=\"item.classes?.icon\"\n          [name]=\"item.icon\"\n        />\n      }\n\n      <!-- Title & Subtitle -->\n      <div class=\"horizontal-navigation-item-title-wrapper\">\n        <div class=\"horizontal-navigation-item-title\">\n          <span [ngClass]=\"item.classes?.title\">\n            {{ item.title }}\n          </span>\n        </div>\n        @if (item.subtitle) {\n          <div class=\"horizontal-navigation-item-subtitle text-hint\">\n            <span [ngClass]=\"item.classes?.subtitle\">\n              {{ item.subtitle }}\n            </span>\n          </div>\n        }\n      </div>\n\n      <!-- Badge -->\n      @if (item.badge) {\n        <div class=\"horizontal-navigation-item-badge\">\n          <div\n            class=\"horizontal-navigation-item-badge-content\"\n            [ngClass]=\"item.badge.classes\"\n          >\n            {{ item.badge.title }}\n          </div>\n        </div>\n      }\n    </div>\n  </div>\n</ng-template>\n", dependencies: [{ kind: "directive", type: i0.forwardRef(() => NgClass), selector: "[ngClass]", inputs: ["class", "ngClass"] }, { kind: "directive", type: i0.forwardRef(() => NgTemplateOutlet), selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet", "ngTemplateOutletInjector"] }, { kind: "ngmodule", type: i0.forwardRef(() => SvgIconModule) }, { kind: "component", type: i0.forwardRef(() => i2.SvgIcon), selector: "svg-icon", inputs: ["inline", "name", "fontSet", "fontIcon"], exportAs: ["svgIcon"] }, { kind: "component", type: i0.forwardRef(() => HorizontalNavigationBasicItemComponent), selector: "horizontal-navigation-basic-item", inputs: ["item", "name"] }, { kind: "component", type: i0.forwardRef(() => HorizontalNavigationDividerItemComponent), selector: "horizontal-navigation-divider-item", inputs: ["item", "name"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.13", ngImport: i0, type: HorizontalNavigationBranchItemComponent, decorators: [{
            type: Component,
            args: [{ selector: 'horizontal-navigation-branch-item', changeDetection: ChangeDetectionStrategy.OnPush, standalone: true, imports: [
                        NgIf,
                        NgClass,
                        NgTemplateOutlet,
                        NgFor,
                        SvgIconModule,
                        HorizontalNavigationBasicItemComponent,
                        HorizontalNavigationDividerItemComponent,
                        forwardRef(() => HorizontalNavigationBranchItemComponent),
                    ], template: "@if (!child) {\n  <div class=\"dropdown dropdown-bottom\">\n    <div\n      tabindex=\"0\"\n      [ngClass]=\"{\n        'horizontal-navigation-menu-active-forced': item.active,\n      }\"\n    >\n      <ng-container *ngTemplateOutlet=\"itemTemplate; context: { $implicit: item }\" />\n    </div>\n\n    <div\n      tabindex=\"0\"\n      class=\"menu dropdown-content z-[1] min-w-52 rounded-box bg-base-100 p-2 shadow\"\n    >\n      @for (item of item.children; track item.id) {\n        <!-- Skip the hidden items -->\n        @if ((item.hidden && !item.hidden(item)) || !item.hidden) {\n          <!-- Basic -->\n          @if (item.type === 'basic') {\n            <div\n              class=\"horizontal-navigation-menu-item\"\n              mat-menu-item\n            >\n              <horizontal-navigation-basic-item\n                [item]=\"item\"\n                [name]=\"name\"\n              />\n            </div>\n          }\n\n          <!-- Branch: aside, collapsable, group -->\n          <!-- @if (item.type === 'aside' || item.type === 'collapsable' || item.type === 'group') {\n            <div\n              class=\"horizontal-navigation-menu-item\"\n              [disabled]=\"item.disabled\"\n              [matMenuTriggerFor]=\"branch.matMenu\"\n              mat-menu-item>\n              <ng-container *ngTemplateOutlet=\"itemTemplate; context: {$implicit: item}\">}\n              <horizontal-navigation-branch-item\n                [child]=\"true\"\n                [item]=\"item\"\n                [name]=\"name\"\n                #branch></horizontal-navigation-branch-item>\n            </div>\n          } -->\n\n          <!-- Divider -->\n          @if (item.type === 'divider') {\n            <div\n              class=\"horizontal-navigation-menu-item\"\n              mat-menu-item\n            >\n              <horizontal-navigation-divider-item\n                [item]=\"item\"\n                [name]=\"name\"\n              />\n            </div>\n          }\n        }\n      }\n    </div>\n  </div>\n}\n\n<!-- Item template -->\n<ng-template\n  #itemTemplate\n  let-item\n>\n  <div\n    class=\"horizontal-navigation-item-wrapper\"\n    [class.horizontal-navigation-item-has-subtitle]=\"!!item.subtitle\"\n    [ngClass]=\"item.classes?.wrapper\"\n  >\n    <div\n      class=\"horizontal-navigation-item\"\n      [ngClass]=\"{\n        'horizontal-navigation-item-disabled': item.disabled,\n        'horizontal-navigation-item-active-forced': item.active,\n      }\"\n    >\n      <!-- Icon -->\n      @if (item.icon) {\n        <svg-icon\n          class=\"horizontal-navigation-item-icon\"\n          [ngClass]=\"item.classes?.icon\"\n          [name]=\"item.icon\"\n        />\n      }\n\n      <!-- Title & Subtitle -->\n      <div class=\"horizontal-navigation-item-title-wrapper\">\n        <div class=\"horizontal-navigation-item-title\">\n          <span [ngClass]=\"item.classes?.title\">\n            {{ item.title }}\n          </span>\n        </div>\n        @if (item.subtitle) {\n          <div class=\"horizontal-navigation-item-subtitle text-hint\">\n            <span [ngClass]=\"item.classes?.subtitle\">\n              {{ item.subtitle }}\n            </span>\n          </div>\n        }\n      </div>\n\n      <!-- Badge -->\n      @if (item.badge) {\n        <div class=\"horizontal-navigation-item-badge\">\n          <div\n            class=\"horizontal-navigation-item-badge-content\"\n            [ngClass]=\"item.badge.classes\"\n          >\n            {{ item.badge.title }}\n          </div>\n        </div>\n      }\n    </div>\n  </div>\n</ng-template>\n" }]
        }], ctorParameters: () => [{ type: i0.ChangeDetectorRef }, { type: i1.NavigationService }], propDecorators: { child: [{
                type: Input
            }], item: [{
                type: Input
            }], name: [{
                type: Input
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJhbmNoLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2xpYnMvbmF2aWdhdGlvbi9zcmMvbGliL2hvcml6b250YWwvY29tcG9uZW50cy9icmFuY2gvYnJhbmNoLmNvbXBvbmVudC50cyIsIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2xpYnMvbmF2aWdhdGlvbi9zcmMvbGliL2hvcml6b250YWwvY29tcG9uZW50cy9icmFuY2gvYnJhbmNoLmNvbXBvbmVudC5odG1sIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQ3pFLE9BQU8sRUFDTCx1QkFBdUIsRUFFdkIsU0FBUyxFQUNULFVBQVUsRUFDVixLQUFLLEdBR04sTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBRS9DLE9BQU8sRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBSzFDLE9BQU8sRUFBRSxzQ0FBc0MsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQ2xGLE9BQU8sRUFBRSx3Q0FBd0MsRUFBRSxNQUFNLDhCQUE4QixDQUFDOzs7O0FBa0J4RixNQUFNLE9BQU8sdUNBQXVDO0lBV3hDO0lBQ0E7SUFYVixNQUFNLENBQUMsdUJBQXVCLENBQWU7SUFFcEMsS0FBSyxHQUFZLEtBQUssQ0FBQztJQUN2QixJQUFJLENBQWlCO0lBQ3JCLElBQUksQ0FBUztJQUVkLDhCQUE4QixDQUFnQztJQUM5RCxlQUFlLEdBQWlCLElBQUksT0FBTyxFQUFPLENBQUM7SUFFM0QsWUFDVSxrQkFBcUMsRUFDckMsa0JBQXFDO1FBRHJDLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBbUI7UUFDckMsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFtQjtJQUM1QyxDQUFDO0lBRUosd0dBQXdHO0lBQ3hHLG9CQUFvQjtJQUNwQix3R0FBd0c7SUFFeEcsUUFBUTtRQUNOLHNDQUFzQztRQUN0QyxJQUFJLENBQUMsOEJBQThCLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFdEYsdURBQXVEO1FBQ3ZELElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxXQUFXO2FBQzVDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO2FBQ3JDLFNBQVMsQ0FBQyxHQUFHLEVBQUU7WUFDZCxpQkFBaUI7WUFDakIsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFlBQVksRUFBRSxDQUFDO1FBQ3pDLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVELFdBQVc7UUFDVCxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNoQyxJQUFJLENBQUMsZUFBZSxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQ2xDLENBQUM7SUFFRCx3R0FBd0c7SUFDeEcsbUJBQW1CO0lBQ25CLHdHQUF3RztJQUV4RyxzQkFBc0I7UUFDcEIsaUJBQWlCO1FBQ2pCLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxZQUFZLEVBQUUsQ0FBQztJQUN6QyxDQUFDO0lBRUQsU0FBUyxDQUFDLEtBQWEsRUFBRSxJQUFTO1FBQ2hDLE9BQU8sSUFBSSxDQUFDLEVBQUUsSUFBSSxLQUFLLENBQUM7SUFDMUIsQ0FBQzt3R0FoRFUsdUNBQXVDOzRGQUF2Qyx1Q0FBdUMscUpDckNwRCxxakhBeUhBLGdFRDdGSSxPQUFPLHlHQUNQLGdCQUFnQix3S0FFaEIsYUFBYSxrTkFDYixzQ0FBc0MsNEhBQ3RDLHdDQUF3Qzs7NEZBSS9CLHVDQUF1QztrQkFoQm5ELFNBQVM7K0JBQ0UsbUNBQW1DLG1CQUU1Qix1QkFBdUIsQ0FBQyxNQUFNLGNBQ25DLElBQUksV0FDUDt3QkFDUCxJQUFJO3dCQUNKLE9BQU87d0JBQ1AsZ0JBQWdCO3dCQUNoQixLQUFLO3dCQUNMLGFBQWE7d0JBQ2Isc0NBQXNDO3dCQUN0Qyx3Q0FBd0M7d0JBQ3hDLFVBQVUsQ0FBQyxHQUFHLEVBQUUsd0NBQXdDLENBQUM7cUJBQzFEO3NIQUtRLEtBQUs7c0JBQWIsS0FBSztnQkFDRyxJQUFJO3NCQUFaLEtBQUs7Z0JBQ0csSUFBSTtzQkFBWixLQUFLIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQm9vbGVhbklucHV0IH0gZnJvbSAnQGFuZ3VsYXIvY2RrL2NvZXJjaW9uJztcbmltcG9ydCB7IE5nQ2xhc3MsIE5nRm9yLCBOZ0lmLCBOZ1RlbXBsYXRlT3V0bGV0IH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7XG4gIENoYW5nZURldGVjdGlvblN0cmF0ZWd5LFxuICBDaGFuZ2VEZXRlY3RvclJlZixcbiAgQ29tcG9uZW50LFxuICBmb3J3YXJkUmVmLFxuICBJbnB1dCxcbiAgT25EZXN0cm95LFxuICBPbkluaXQsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgU3ZnSWNvbk1vZHVsZSB9IGZyb20gJ0BsaWJzL3N2Zy1pY29uJztcblxuaW1wb3J0IHsgU3ViamVjdCwgdGFrZVVudGlsIH0gZnJvbSAncnhqcyc7XG5pbXBvcnQgeyBOYXZpZ2F0aW9uU2VydmljZSB9IGZyb20gJy4uLy4uLy4uL25hdmlnYXRpb24uc2VydmljZSc7XG5pbXBvcnQgeyBOYXZpZ2F0aW9uSXRlbSB9IGZyb20gJy4uLy4uLy4uL25hdmlnYXRpb24udHlwZXMnO1xuXG5pbXBvcnQgeyBIb3Jpem9udGFsTmF2aWdhdGlvbkNvbXBvbmVudCB9IGZyb20gJy4uLy4uL2hvcml6b250YWwuY29tcG9uZW50JztcbmltcG9ydCB7IEhvcml6b250YWxOYXZpZ2F0aW9uQmFzaWNJdGVtQ29tcG9uZW50IH0gZnJvbSAnLi4vYmFzaWMvYmFzaWMuY29tcG9uZW50JztcbmltcG9ydCB7IEhvcml6b250YWxOYXZpZ2F0aW9uRGl2aWRlckl0ZW1Db21wb25lbnQgfSBmcm9tICcuLi9kaXZpZGVyL2RpdmlkZXIuY29tcG9uZW50JztcblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnaG9yaXpvbnRhbC1uYXZpZ2F0aW9uLWJyYW5jaC1pdGVtJyxcbiAgdGVtcGxhdGVVcmw6ICcuL2JyYW5jaC5jb21wb25lbnQuaHRtbCcsXG4gIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuT25QdXNoLFxuICBzdGFuZGFsb25lOiB0cnVlLFxuICBpbXBvcnRzOiBbXG4gICAgTmdJZixcbiAgICBOZ0NsYXNzLFxuICAgIE5nVGVtcGxhdGVPdXRsZXQsXG4gICAgTmdGb3IsXG4gICAgU3ZnSWNvbk1vZHVsZSxcbiAgICBIb3Jpem9udGFsTmF2aWdhdGlvbkJhc2ljSXRlbUNvbXBvbmVudCxcbiAgICBIb3Jpem9udGFsTmF2aWdhdGlvbkRpdmlkZXJJdGVtQ29tcG9uZW50LFxuICAgIGZvcndhcmRSZWYoKCkgPT4gSG9yaXpvbnRhbE5hdmlnYXRpb25CcmFuY2hJdGVtQ29tcG9uZW50KSxcbiAgXSxcbn0pXG5leHBvcnQgY2xhc3MgSG9yaXpvbnRhbE5hdmlnYXRpb25CcmFuY2hJdGVtQ29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0LCBPbkRlc3Ryb3kge1xuICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfY2hpbGQ6IEJvb2xlYW5JbnB1dDtcblxuICBASW5wdXQoKSBjaGlsZDogYm9vbGVhbiA9IGZhbHNlO1xuICBASW5wdXQoKSBpdGVtOiBOYXZpZ2F0aW9uSXRlbTtcbiAgQElucHV0KCkgbmFtZTogc3RyaW5nO1xuXG4gIHByaXZhdGUgX2hvcml6b250YWxOYXZpZ2F0aW9uQ29tcG9uZW50OiBIb3Jpem9udGFsTmF2aWdhdGlvbkNvbXBvbmVudDtcbiAgcHJpdmF0ZSBfdW5zdWJzY3JpYmVBbGw6IFN1YmplY3Q8YW55PiA9IG5ldyBTdWJqZWN0PGFueT4oKTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIF9jaGFuZ2VEZXRlY3RvclJlZjogQ2hhbmdlRGV0ZWN0b3JSZWYsXG4gICAgcHJpdmF0ZSBfbmF2aWdhdGlvblNlcnZpY2U6IE5hdmlnYXRpb25TZXJ2aWNlXG4gICkge31cblxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBAIExpZmVjeWNsZSBob29rc1xuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIG5nT25Jbml0KCk6IHZvaWQge1xuICAgIC8vIEdldCB0aGUgcGFyZW50IG5hdmlnYXRpb24gY29tcG9uZW50XG4gICAgdGhpcy5faG9yaXpvbnRhbE5hdmlnYXRpb25Db21wb25lbnQgPSB0aGlzLl9uYXZpZ2F0aW9uU2VydmljZS5nZXRDb21wb25lbnQodGhpcy5uYW1lKTtcblxuICAgIC8vIFN1YnNjcmliZSB0byBvblJlZnJlc2hlZCBvbiB0aGUgbmF2aWdhdGlvbiBjb21wb25lbnRcbiAgICB0aGlzLl9ob3Jpem9udGFsTmF2aWdhdGlvbkNvbXBvbmVudC5vblJlZnJlc2hlZFxuICAgICAgLnBpcGUodGFrZVVudGlsKHRoaXMuX3Vuc3Vic2NyaWJlQWxsKSlcbiAgICAgIC5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgICAvLyBNYXJrIGZvciBjaGVja1xuICAgICAgICB0aGlzLl9jaGFuZ2VEZXRlY3RvclJlZi5tYXJrRm9yQ2hlY2soKTtcbiAgICAgIH0pO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKTogdm9pZCB7XG4gICAgdGhpcy5fdW5zdWJzY3JpYmVBbGwubmV4dChudWxsKTtcbiAgICB0aGlzLl91bnN1YnNjcmliZUFsbC5jb21wbGV0ZSgpO1xuICB9XG5cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gQCBQdWJsaWMgbWV0aG9kc1xuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIHRyaWdnZXJDaGFuZ2VEZXRlY3Rpb24oKTogdm9pZCB7XG4gICAgLy8gTWFyayBmb3IgY2hlY2tcbiAgICB0aGlzLl9jaGFuZ2VEZXRlY3RvclJlZi5tYXJrRm9yQ2hlY2soKTtcbiAgfVxuXG4gIHRyYWNrQnlGbihpbmRleDogbnVtYmVyLCBpdGVtOiBhbnkpOiBhbnkge1xuICAgIHJldHVybiBpdGVtLmlkIHx8IGluZGV4O1xuICB9XG59XG4iLCJAaWYgKCFjaGlsZCkge1xuICA8ZGl2IGNsYXNzPVwiZHJvcGRvd24gZHJvcGRvd24tYm90dG9tXCI+XG4gICAgPGRpdlxuICAgICAgdGFiaW5kZXg9XCIwXCJcbiAgICAgIFtuZ0NsYXNzXT1cIntcbiAgICAgICAgJ2hvcml6b250YWwtbmF2aWdhdGlvbi1tZW51LWFjdGl2ZS1mb3JjZWQnOiBpdGVtLmFjdGl2ZSxcbiAgICAgIH1cIlxuICAgID5cbiAgICAgIDxuZy1jb250YWluZXIgKm5nVGVtcGxhdGVPdXRsZXQ9XCJpdGVtVGVtcGxhdGU7IGNvbnRleHQ6IHsgJGltcGxpY2l0OiBpdGVtIH1cIiAvPlxuICAgIDwvZGl2PlxuXG4gICAgPGRpdlxuICAgICAgdGFiaW5kZXg9XCIwXCJcbiAgICAgIGNsYXNzPVwibWVudSBkcm9wZG93bi1jb250ZW50IHotWzFdIG1pbi13LTUyIHJvdW5kZWQtYm94IGJnLWJhc2UtMTAwIHAtMiBzaGFkb3dcIlxuICAgID5cbiAgICAgIEBmb3IgKGl0ZW0gb2YgaXRlbS5jaGlsZHJlbjsgdHJhY2sgaXRlbS5pZCkge1xuICAgICAgICA8IS0tIFNraXAgdGhlIGhpZGRlbiBpdGVtcyAtLT5cbiAgICAgICAgQGlmICgoaXRlbS5oaWRkZW4gJiYgIWl0ZW0uaGlkZGVuKGl0ZW0pKSB8fCAhaXRlbS5oaWRkZW4pIHtcbiAgICAgICAgICA8IS0tIEJhc2ljIC0tPlxuICAgICAgICAgIEBpZiAoaXRlbS50eXBlID09PSAnYmFzaWMnKSB7XG4gICAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICAgIGNsYXNzPVwiaG9yaXpvbnRhbC1uYXZpZ2F0aW9uLW1lbnUtaXRlbVwiXG4gICAgICAgICAgICAgIG1hdC1tZW51LWl0ZW1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgPGhvcml6b250YWwtbmF2aWdhdGlvbi1iYXNpYy1pdGVtXG4gICAgICAgICAgICAgICAgW2l0ZW1dPVwiaXRlbVwiXG4gICAgICAgICAgICAgICAgW25hbWVdPVwibmFtZVwiXG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICB9XG5cbiAgICAgICAgICA8IS0tIEJyYW5jaDogYXNpZGUsIGNvbGxhcHNhYmxlLCBncm91cCAtLT5cbiAgICAgICAgICA8IS0tIEBpZiAoaXRlbS50eXBlID09PSAnYXNpZGUnIHx8IGl0ZW0udHlwZSA9PT0gJ2NvbGxhcHNhYmxlJyB8fCBpdGVtLnR5cGUgPT09ICdncm91cCcpIHtcbiAgICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgICAgY2xhc3M9XCJob3Jpem9udGFsLW5hdmlnYXRpb24tbWVudS1pdGVtXCJcbiAgICAgICAgICAgICAgW2Rpc2FibGVkXT1cIml0ZW0uZGlzYWJsZWRcIlxuICAgICAgICAgICAgICBbbWF0TWVudVRyaWdnZXJGb3JdPVwiYnJhbmNoLm1hdE1lbnVcIlxuICAgICAgICAgICAgICBtYXQtbWVudS1pdGVtPlxuICAgICAgICAgICAgICA8bmctY29udGFpbmVyICpuZ1RlbXBsYXRlT3V0bGV0PVwiaXRlbVRlbXBsYXRlOyBjb250ZXh0OiB7JGltcGxpY2l0OiBpdGVtfVwiPn1cbiAgICAgICAgICAgICAgPGhvcml6b250YWwtbmF2aWdhdGlvbi1icmFuY2gtaXRlbVxuICAgICAgICAgICAgICAgIFtjaGlsZF09XCJ0cnVlXCJcbiAgICAgICAgICAgICAgICBbaXRlbV09XCJpdGVtXCJcbiAgICAgICAgICAgICAgICBbbmFtZV09XCJuYW1lXCJcbiAgICAgICAgICAgICAgICAjYnJhbmNoPjwvaG9yaXpvbnRhbC1uYXZpZ2F0aW9uLWJyYW5jaC1pdGVtPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgfSAtLT5cblxuICAgICAgICAgIDwhLS0gRGl2aWRlciAtLT5cbiAgICAgICAgICBAaWYgKGl0ZW0udHlwZSA9PT0gJ2RpdmlkZXInKSB7XG4gICAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICAgIGNsYXNzPVwiaG9yaXpvbnRhbC1uYXZpZ2F0aW9uLW1lbnUtaXRlbVwiXG4gICAgICAgICAgICAgIG1hdC1tZW51LWl0ZW1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgPGhvcml6b250YWwtbmF2aWdhdGlvbi1kaXZpZGVyLWl0ZW1cbiAgICAgICAgICAgICAgICBbaXRlbV09XCJpdGVtXCJcbiAgICAgICAgICAgICAgICBbbmFtZV09XCJuYW1lXCJcbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIDwvZGl2PlxuICA8L2Rpdj5cbn1cblxuPCEtLSBJdGVtIHRlbXBsYXRlIC0tPlxuPG5nLXRlbXBsYXRlXG4gICNpdGVtVGVtcGxhdGVcbiAgbGV0LWl0ZW1cbj5cbiAgPGRpdlxuICAgIGNsYXNzPVwiaG9yaXpvbnRhbC1uYXZpZ2F0aW9uLWl0ZW0td3JhcHBlclwiXG4gICAgW2NsYXNzLmhvcml6b250YWwtbmF2aWdhdGlvbi1pdGVtLWhhcy1zdWJ0aXRsZV09XCIhIWl0ZW0uc3VidGl0bGVcIlxuICAgIFtuZ0NsYXNzXT1cIml0ZW0uY2xhc3Nlcz8ud3JhcHBlclwiXG4gID5cbiAgICA8ZGl2XG4gICAgICBjbGFzcz1cImhvcml6b250YWwtbmF2aWdhdGlvbi1pdGVtXCJcbiAgICAgIFtuZ0NsYXNzXT1cIntcbiAgICAgICAgJ2hvcml6b250YWwtbmF2aWdhdGlvbi1pdGVtLWRpc2FibGVkJzogaXRlbS5kaXNhYmxlZCxcbiAgICAgICAgJ2hvcml6b250YWwtbmF2aWdhdGlvbi1pdGVtLWFjdGl2ZS1mb3JjZWQnOiBpdGVtLmFjdGl2ZSxcbiAgICAgIH1cIlxuICAgID5cbiAgICAgIDwhLS0gSWNvbiAtLT5cbiAgICAgIEBpZiAoaXRlbS5pY29uKSB7XG4gICAgICAgIDxzdmctaWNvblxuICAgICAgICAgIGNsYXNzPVwiaG9yaXpvbnRhbC1uYXZpZ2F0aW9uLWl0ZW0taWNvblwiXG4gICAgICAgICAgW25nQ2xhc3NdPVwiaXRlbS5jbGFzc2VzPy5pY29uXCJcbiAgICAgICAgICBbbmFtZV09XCJpdGVtLmljb25cIlxuICAgICAgICAvPlxuICAgICAgfVxuXG4gICAgICA8IS0tIFRpdGxlICYgU3VidGl0bGUgLS0+XG4gICAgICA8ZGl2IGNsYXNzPVwiaG9yaXpvbnRhbC1uYXZpZ2F0aW9uLWl0ZW0tdGl0bGUtd3JhcHBlclwiPlxuICAgICAgICA8ZGl2IGNsYXNzPVwiaG9yaXpvbnRhbC1uYXZpZ2F0aW9uLWl0ZW0tdGl0bGVcIj5cbiAgICAgICAgICA8c3BhbiBbbmdDbGFzc109XCJpdGVtLmNsYXNzZXM/LnRpdGxlXCI+XG4gICAgICAgICAgICB7eyBpdGVtLnRpdGxlIH19XG4gICAgICAgICAgPC9zcGFuPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgQGlmIChpdGVtLnN1YnRpdGxlKSB7XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImhvcml6b250YWwtbmF2aWdhdGlvbi1pdGVtLXN1YnRpdGxlIHRleHQtaGludFwiPlxuICAgICAgICAgICAgPHNwYW4gW25nQ2xhc3NdPVwiaXRlbS5jbGFzc2VzPy5zdWJ0aXRsZVwiPlxuICAgICAgICAgICAgICB7eyBpdGVtLnN1YnRpdGxlIH19XG4gICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIH1cbiAgICAgIDwvZGl2PlxuXG4gICAgICA8IS0tIEJhZGdlIC0tPlxuICAgICAgQGlmIChpdGVtLmJhZGdlKSB7XG4gICAgICAgIDxkaXYgY2xhc3M9XCJob3Jpem9udGFsLW5hdmlnYXRpb24taXRlbS1iYWRnZVwiPlxuICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgIGNsYXNzPVwiaG9yaXpvbnRhbC1uYXZpZ2F0aW9uLWl0ZW0tYmFkZ2UtY29udGVudFwiXG4gICAgICAgICAgICBbbmdDbGFzc109XCJpdGVtLmJhZGdlLmNsYXNzZXNcIlxuICAgICAgICAgID5cbiAgICAgICAgICAgIHt7IGl0ZW0uYmFkZ2UudGl0bGUgfX1cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICB9XG4gICAgPC9kaXY+XG4gIDwvZGl2PlxuPC9uZy10ZW1wbGF0ZT5cbiJdfQ==