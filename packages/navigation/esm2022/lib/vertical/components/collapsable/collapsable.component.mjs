import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, forwardRef, HostBinding, Input, } from '@angular/core';
import { NavigationEnd } from '@angular/router';
import { SvgIconModule } from '@libs/svg-icon';
import { filter, Subject, takeUntil } from 'rxjs';
import { expandCollapse } from '../../../animations/expand-collapse';
import { VerticalNavigationBasicItemComponent } from '../basic/basic.component';
import { VerticalNavigationDividerItemComponent } from '../divider/divider.component';
import { VerticalNavigationGroupItemComponent } from '../group/group.component';
import { VerticalNavigationSpacerItemComponent } from '../spacer/spacer.component';
import * as i0 from "@angular/core";
import * as i1 from "@angular/router";
import * as i2 from "../../../navigation.service";
import * as i3 from "@libs/svg-icon";
export class VerticalNavigationCollapsableItemComponent {
    _router;
    _changeDetectorRef;
    _navigationService;
    static ngAcceptInputType_autoCollapse;
    autoCollapse;
    item;
    name;
    isCollapsed = true;
    isExpanded = false;
    _verticalNavigationComponent;
    _unsubscribeAll = new Subject();
    constructor(_router, _changeDetectorRef, _navigationService) {
        this._router = _router;
        this._changeDetectorRef = _changeDetectorRef;
        this._navigationService = _navigationService;
    }
    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------
    get classList() {
        return {
            'vertical-navigation-item-collapsed': this.isCollapsed,
            'vertical-navigation-item-expanded': this.isExpanded,
        };
    }
    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------
    ngOnInit() {
        // Get the parent navigation component
        this._verticalNavigationComponent = this._navigationService.getComponent(this.name);
        // If the item has a children that has a matching url with the current url, expand...
        if (this._hasActiveChild(this.item, this._router.url)) {
            this.expand();
        }
        // Otherwise...
        else {
            // If the autoCollapse is on, collapse...
            if (this.autoCollapse) {
                this.collapse();
            }
        }
        // Listen for the onCollapsableItemCollapsed from the service
        this._verticalNavigationComponent.onCollapsableItemCollapsed
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((collapsedItem) => {
            // Check if the collapsed item is null
            if (collapsedItem === null) {
                return;
            }
            // Collapse if this is a children of the collapsed item
            if (this._isChildrenOf(collapsedItem, this.item)) {
                this.collapse();
            }
        });
        // Listen for the onCollapsableItemExpanded from the service if the autoCollapse is on
        if (this.autoCollapse) {
            this._verticalNavigationComponent.onCollapsableItemExpanded
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((expandedItem) => {
                // Check if the expanded item is null
                if (expandedItem === null) {
                    return;
                }
                // Check if this is a parent of the expanded item
                if (this._isChildrenOf(this.item, expandedItem)) {
                    return;
                }
                // Check if this has a children with a matching url with the current active url
                if (this._hasActiveChild(this.item, this._router.url)) {
                    return;
                }
                // Check if this is the expanded item
                if (this.item === expandedItem) {
                    return;
                }
                // If none of the above conditions are matched, collapse this item
                this.collapse();
            });
        }
        // Attach a listener to the NavigationEnd event
        this._router.events
            .pipe(filter((event) => event instanceof NavigationEnd), takeUntil(this._unsubscribeAll))
            .subscribe((event) => {
            // If the item has a children that has a matching url with the current url, expand...
            if (this._hasActiveChild(this.item, event.urlAfterRedirects)) {
                this.expand();
            }
            // Otherwise...
            else {
                // If the autoCollapse is on, collapse...
                if (this.autoCollapse) {
                    this.collapse();
                }
            }
        });
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
    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------
    collapse() {
        // Return if the item is disabled
        if (this.item.disabled) {
            return;
        }
        // Return if the item is already collapsed
        if (this.isCollapsed) {
            return;
        }
        // Collapse it
        this.isCollapsed = true;
        this.isExpanded = !this.isCollapsed;
        // Mark for check
        this._changeDetectorRef.markForCheck();
        // Execute the observable
        this._verticalNavigationComponent.onCollapsableItemCollapsed.next(this.item);
    }
    expand() {
        // Return if the item is disabled
        if (this.item.disabled) {
            return;
        }
        // Return if the item is already expanded
        if (!this.isCollapsed) {
            return;
        }
        // Expand it
        this.isCollapsed = false;
        this.isExpanded = !this.isCollapsed;
        // Mark for check
        this._changeDetectorRef.markForCheck();
        // Execute the observable
        this._verticalNavigationComponent.onCollapsableItemExpanded.next(this.item);
    }
    toggleCollapsable() {
        // Toggle collapse/expand
        if (this.isCollapsed) {
            this.expand();
        }
        else {
            this.collapse();
        }
    }
    trackByFn(index, item) {
        return item.id || index;
    }
    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------
    _hasActiveChild(item, currentUrl) {
        const children = item.children;
        if (!children) {
            return false;
        }
        for (const child of children) {
            if (child.children) {
                if (this._hasActiveChild(child, currentUrl)) {
                    return true;
                }
            }
            // Check if the child has a link and is active
            if (child.link && this._router.isActive(child.link, child.exactMatch || false)) {
                return true;
            }
        }
        return false;
    }
    _isChildrenOf(parent, item) {
        const children = parent.children;
        if (!children) {
            return false;
        }
        if (children.indexOf(item) > -1) {
            return true;
        }
        for (const child of children) {
            if (child.children) {
                if (this._isChildrenOf(child, item)) {
                    return true;
                }
            }
        }
        return false;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.13", ngImport: i0, type: VerticalNavigationCollapsableItemComponent, deps: [{ token: i1.Router }, { token: i0.ChangeDetectorRef }, { token: i2.NavigationService }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "18.2.13", type: VerticalNavigationCollapsableItemComponent, isStandalone: true, selector: "vertical-navigation-collapsable-item", inputs: { autoCollapse: "autoCollapse", item: "item", name: "name" }, host: { properties: { "class": "this.classList" } }, ngImport: i0, template: "<div\n  class=\"vertical-navigation-item-wrapper\"\n  [class.vertical-navigation-item-has-subtitle]=\"!!item.subtitle\"\n  [ngClass]=\"item.classes?.wrapper\"\n>\n  <button\n    class=\"vertical-navigation-item\"\n    [ngClass]=\"{ 'vertical-navigation-item-disabled': item.disabled }\"\n    (click)=\"toggleCollapsable()\"\n  >\n    <!-- Icon -->\n    @if (item.icon) {\n      <svg-icon\n        class=\"vertical-navigation-item-icon\"\n        [ngClass]=\"item.classes?.icon\"\n        [name]=\"item.icon\"\n      />\n    }\n\n    <!-- Title & Subtitle -->\n    <div class=\"vertical-navigation-item-title-wrapper\">\n      <div class=\"vertical-navigation-item-title\">\n        <span [ngClass]=\"item.classes?.title\">\n          {{ item.title }}\n        </span>\n      </div>\n      @if (item.subtitle) {\n        <div class=\"vertical-navigation-item-subtitle\">\n          <span [ngClass]=\"item.classes?.subtitle\">\n            {{ item.subtitle }}\n          </span>\n        </div>\n      }\n    </div>\n\n    <!-- Badge -->\n    @if (item.badge) {\n      <div class=\"vertical-navigation-item-badge\">\n        <div\n          class=\"vertical-navigation-item-badge-content\"\n          [ngClass]=\"item.badge.classes\"\n        >\n          {{ item.badge.title }}\n        </div>\n      </div>\n    }\n\n    <!-- Arrow -->\n    <svg-icon\n      class=\"vertical-navigation-item-arrow icon-size-4\"\n      [name]=\"'heroicons_solid:chevron-right'\"\n    />\n  </button>\n</div>\n\n@if (!isCollapsed) {\n  <div\n    class=\"vertical-navigation-item-children\"\n    @expandCollapse\n  >\n    @for (item of item.children; track item.id) {\n      <!-- Skip the hidden items -->\n      @if ((item.hidden && !item.hidden(item)) || !item.hidden) {\n        <!-- Basic -->\n        @if (item.type === 'basic') {\n          <vertical-navigation-basic-item\n            [item]=\"item\"\n            [name]=\"name\"\n          />\n        }\n\n        <!-- Collapsable -->\n        @if (item.type === 'collapsable') {\n          <vertical-navigation-collapsable-item\n            [item]=\"item\"\n            [name]=\"name\"\n            [autoCollapse]=\"autoCollapse\"\n          />\n        }\n\n        <!-- Divider -->\n        @if (item.type === 'divider') {\n          <vertical-navigation-divider-item\n            [item]=\"item\"\n            [name]=\"name\"\n          />\n        }\n\n        <!-- Group -->\n        @if (item.type === 'group') {\n          <vertical-navigation-group-item\n            [item]=\"item\"\n            [name]=\"name\"\n          />\n        }\n\n        <!-- Spacer -->\n        @if (item.type === 'spacer') {\n          <vertical-navigation-spacer-item\n            [item]=\"item\"\n            [name]=\"name\"\n          />\n        }\n      }\n    }\n  </div>\n}\n", dependencies: [{ kind: "component", type: i0.forwardRef(() => VerticalNavigationCollapsableItemComponent), selector: "vertical-navigation-collapsable-item", inputs: ["autoCollapse", "item", "name"] }, { kind: "directive", type: i0.forwardRef(() => NgClass), selector: "[ngClass]", inputs: ["class", "ngClass"] }, { kind: "ngmodule", type: i0.forwardRef(() => SvgIconModule) }, { kind: "component", type: i0.forwardRef(() => i3.SvgIcon), selector: "svg-icon", inputs: ["inline", "name", "fontSet", "fontIcon"], exportAs: ["svgIcon"] }, { kind: "component", type: i0.forwardRef(() => VerticalNavigationBasicItemComponent), selector: "vertical-navigation-basic-item", inputs: ["item", "name"] }, { kind: "component", type: i0.forwardRef(() => VerticalNavigationDividerItemComponent), selector: "vertical-navigation-divider-item", inputs: ["item", "name"] }, { kind: "component", type: i0.forwardRef(() => VerticalNavigationGroupItemComponent), selector: "vertical-navigation-group-item", inputs: ["autoCollapse", "item", "name"] }, { kind: "component", type: i0.forwardRef(() => VerticalNavigationSpacerItemComponent), selector: "vertical-navigation-spacer-item", inputs: ["item", "name"] }], animations: [expandCollapse], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.13", ngImport: i0, type: VerticalNavigationCollapsableItemComponent, decorators: [{
            type: Component,
            args: [{ selector: 'vertical-navigation-collapsable-item', animations: [expandCollapse], changeDetection: ChangeDetectionStrategy.OnPush, standalone: true, imports: [
                        NgClass,
                        SvgIconModule,
                        VerticalNavigationBasicItemComponent,
                        VerticalNavigationDividerItemComponent,
                        VerticalNavigationGroupItemComponent,
                        VerticalNavigationSpacerItemComponent,
                        forwardRef(() => VerticalNavigationCollapsableItemComponent),
                    ], template: "<div\n  class=\"vertical-navigation-item-wrapper\"\n  [class.vertical-navigation-item-has-subtitle]=\"!!item.subtitle\"\n  [ngClass]=\"item.classes?.wrapper\"\n>\n  <button\n    class=\"vertical-navigation-item\"\n    [ngClass]=\"{ 'vertical-navigation-item-disabled': item.disabled }\"\n    (click)=\"toggleCollapsable()\"\n  >\n    <!-- Icon -->\n    @if (item.icon) {\n      <svg-icon\n        class=\"vertical-navigation-item-icon\"\n        [ngClass]=\"item.classes?.icon\"\n        [name]=\"item.icon\"\n      />\n    }\n\n    <!-- Title & Subtitle -->\n    <div class=\"vertical-navigation-item-title-wrapper\">\n      <div class=\"vertical-navigation-item-title\">\n        <span [ngClass]=\"item.classes?.title\">\n          {{ item.title }}\n        </span>\n      </div>\n      @if (item.subtitle) {\n        <div class=\"vertical-navigation-item-subtitle\">\n          <span [ngClass]=\"item.classes?.subtitle\">\n            {{ item.subtitle }}\n          </span>\n        </div>\n      }\n    </div>\n\n    <!-- Badge -->\n    @if (item.badge) {\n      <div class=\"vertical-navigation-item-badge\">\n        <div\n          class=\"vertical-navigation-item-badge-content\"\n          [ngClass]=\"item.badge.classes\"\n        >\n          {{ item.badge.title }}\n        </div>\n      </div>\n    }\n\n    <!-- Arrow -->\n    <svg-icon\n      class=\"vertical-navigation-item-arrow icon-size-4\"\n      [name]=\"'heroicons_solid:chevron-right'\"\n    />\n  </button>\n</div>\n\n@if (!isCollapsed) {\n  <div\n    class=\"vertical-navigation-item-children\"\n    @expandCollapse\n  >\n    @for (item of item.children; track item.id) {\n      <!-- Skip the hidden items -->\n      @if ((item.hidden && !item.hidden(item)) || !item.hidden) {\n        <!-- Basic -->\n        @if (item.type === 'basic') {\n          <vertical-navigation-basic-item\n            [item]=\"item\"\n            [name]=\"name\"\n          />\n        }\n\n        <!-- Collapsable -->\n        @if (item.type === 'collapsable') {\n          <vertical-navigation-collapsable-item\n            [item]=\"item\"\n            [name]=\"name\"\n            [autoCollapse]=\"autoCollapse\"\n          />\n        }\n\n        <!-- Divider -->\n        @if (item.type === 'divider') {\n          <vertical-navigation-divider-item\n            [item]=\"item\"\n            [name]=\"name\"\n          />\n        }\n\n        <!-- Group -->\n        @if (item.type === 'group') {\n          <vertical-navigation-group-item\n            [item]=\"item\"\n            [name]=\"name\"\n          />\n        }\n\n        <!-- Spacer -->\n        @if (item.type === 'spacer') {\n          <vertical-navigation-spacer-item\n            [item]=\"item\"\n            [name]=\"name\"\n          />\n        }\n      }\n    }\n  </div>\n}\n" }]
        }], ctorParameters: () => [{ type: i1.Router }, { type: i0.ChangeDetectorRef }, { type: i2.NavigationService }], propDecorators: { autoCollapse: [{
                type: Input
            }], item: [{
                type: Input
            }], name: [{
                type: Input
            }], classList: [{
                type: HostBinding,
                args: ['class']
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sbGFwc2FibGUuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vbGlicy9uYXZpZ2F0aW9uL3NyYy9saWIvdmVydGljYWwvY29tcG9uZW50cy9jb2xsYXBzYWJsZS9jb2xsYXBzYWJsZS5jb21wb25lbnQudHMiLCIuLi8uLi8uLi8uLi8uLi8uLi8uLi9saWJzL25hdmlnYXRpb24vc3JjL2xpYi92ZXJ0aWNhbC9jb21wb25lbnRzL2NvbGxhcHNhYmxlL2NvbGxhcHNhYmxlLmNvbXBvbmVudC5odG1sIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUMxQyxPQUFPLEVBQ0wsdUJBQXVCLEVBRXZCLFNBQVMsRUFDVCxVQUFVLEVBQ1YsV0FBVyxFQUNYLEtBQUssR0FHTixNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQUUsYUFBYSxFQUFVLE1BQU0saUJBQWlCLENBQUM7QUFFeEQsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBRS9DLE9BQU8sRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUNsRCxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0scUNBQXFDLENBQUM7QUFLckUsT0FBTyxFQUFFLG9DQUFvQyxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFDaEYsT0FBTyxFQUFFLHNDQUFzQyxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFDdEYsT0FBTyxFQUFFLG9DQUFvQyxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFDaEYsT0FBTyxFQUFFLHFDQUFxQyxFQUFFLE1BQU0sNEJBQTRCLENBQUM7Ozs7O0FBa0JuRixNQUFNLE9BQU8sMENBQTBDO0lBYzNDO0lBQ0E7SUFDQTtJQWZWLE1BQU0sQ0FBQyw4QkFBOEIsQ0FBZTtJQUUzQyxZQUFZLENBQVU7SUFDdEIsSUFB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O1lBQ2hDLE9BQU8sSUFBSSxDQUFDO1FBQ2QsQ0FBQztRQUVELEtBQUssTUFBTSxLQUFLLElBQUksUUFBUSxFQUFFLENBQUM7WUFDN0IsSUFBSSxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7Z0JBQ25CLElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQztvQkFDcEMsT0FBTyxJQUFJLENBQUM7Z0JBQ2QsQ0FBQztZQUNILENBQUM7UUFDSCxDQUFDO1FBRUQsT0FBTyxLQUFLLENBQUM7SUFDZixDQUFDO3dHQTlPVSwwQ0FBMEM7NEZBQTFDLDBDQUEwQywyTkMzQ3ZELDB2RkEyR0EsZ0VEaEVhLDBDQUEwQyxnSkFUbkQsT0FBTyx3R0FDUCxhQUFhLGtOQUNiLG9DQUFvQywwSEFDcEMsc0NBQXNDLDRIQUN0QyxvQ0FBb0MsMElBQ3BDLHFDQUFxQyx5RkFUM0IsQ0FBQyxjQUFjLENBQUM7OzRGQWFqQiwwQ0FBMEM7a0JBaEJ0RCxTQUFTOytCQUNFLHNDQUFzQyxjQUVwQyxDQUFDLGNBQWMsQ0FBQyxtQkFDWCx1QkFBdUIsQ0FBQyxNQUFNLGNBQ25DLElBQUksV0FDUDt3QkFDUCxPQUFPO3dCQUNQLGFBQWE7d0JBQ2Isb0NBQW9DO3dCQUNwQyxzQ0FBc0M7d0JBQ3RDLG9DQUFvQzt3QkFDcEMscUNBQXFDO3dCQUNyQyxVQUFVLENBQUMsR0FBRyxFQUFFLDJDQUEyQyxDQUFDO3FCQUM3RDsySUFLUSxZQUFZO3NCQUFwQixLQUFLO2dCQUNHLElBQUk7c0JBQVosS0FBSztnQkFDRyxJQUFJO3NCQUFaLEtBQUs7Z0JBa0JvQixTQUFTO3NCQUFsQyxXQUFXO3VCQUFDLE9BQU8iLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBCb29sZWFuSW5wdXQgfSBmcm9tICdAYW5ndWxhci9jZGsvY29lcmNpb24nO1xuaW1wb3J0IHsgTmdDbGFzcyB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQge1xuICBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSxcbiAgQ2hhbmdlRGV0ZWN0b3JSZWYsXG4gIENvbXBvbmVudCxcbiAgZm9yd2FyZFJlZixcbiAgSG9zdEJpbmRpbmcsXG4gIElucHV0LFxuICBPbkRlc3Ryb3ksXG4gIE9uSW5pdCxcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBOYXZpZ2F0aW9uRW5kLCBSb3V0ZXIgfSBmcm9tICdAYW5ndWxhci9yb3V0ZXInO1xuXG5pbXBvcnQgeyBTdmdJY29uTW9kdWxlIH0gZnJvbSAnQGxpYnMvc3ZnLWljb24nO1xuXG5pbXBvcnQgeyBmaWx0ZXIsIFN1YmplY3QsIHRha2VVbnRpbCB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgZXhwYW5kQ29sbGFwc2UgfSBmcm9tICcuLi8uLi8uLi9hbmltYXRpb25zL2V4cGFuZC1jb2xsYXBzZSc7XG5pbXBvcnQgeyBOYXZpZ2F0aW9uSXRlbSB9IGZyb20gJy4uLy4uLy4uL25hdmlnYXRpb24udHlwZXMnO1xuXG5pbXBvcnQgeyBOYXZpZ2F0aW9uU2VydmljZSB9IGZyb20gJy4uLy4uLy4uL25hdmlnYXRpb24uc2VydmljZSc7XG5pbXBvcnQgeyBWZXJ0aWNhbE5hdmlnYXRpb25Db21wb25lbnQgfSBmcm9tICcuLi8uLi92ZXJ0aWNhbC5jb21wb25lbnQnO1xuaW1wb3J0IHsgVmVydGljYWxOYXZpZ2F0aW9uQmFzaWNJdGVtQ29tcG9uZW50IH0gZnJvbSAnLi4vYmFzaWMvYmFzaWMuY29tcG9uZW50JztcbmltcG9ydCB7IFZlcnRpY2FsTmF2aWdhdGlvbkRpdmlkZXJJdGVtQ29tcG9uZW50IH0gZnJvbSAnLi4vZGl2aWRlci9kaXZpZGVyLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBWZXJ0aWNhbE5hdmlnYXRpb25Hcm91cEl0ZW1Db21wb25lbnQgfSBmcm9tICcuLi9ncm91cC9ncm91cC5jb21wb25lbnQnO1xuaW1wb3J0IHsgVmVydGljYWxOYXZpZ2F0aW9uU3BhY2VySXRlbUNvbXBvbmVudCB9IGZyb20gJy4uL3NwYWNlci9zcGFjZXIuY29tcG9uZW50JztcblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAndmVydGljYWwtbmF2aWdhdGlvbi1jb2xsYXBzYWJsZS1pdGVtJyxcbiAgdGVtcGxhdGVVcmw6ICcuL2NvbGxhcHNhYmxlLmNvbXBvbmVudC5odG1sJyxcbiAgYW5pbWF0aW9uczogW2V4cGFuZENvbGxhcHNlXSxcbiAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5PblB1c2gsXG4gIHN0YW5kYWxvbmU6IHRydWUsXG4gIGltcG9ydHM6IFtcbiAgICBOZ0NsYXNzLFxuICAgIFN2Z0ljb25Nb2R1bGUsXG4gICAgVmVydGljYWxOYXZpZ2F0aW9uQmFzaWNJdGVtQ29tcG9uZW50LFxuICAgIFZlcnRpY2FsTmF2aWdhdGlvbkRpdmlkZXJJdGVtQ29tcG9uZW50LFxuICAgIFZlcnRpY2FsTmF2aWdhdGlvbkdyb3VwSXRlbUNvbXBvbmVudCxcbiAgICBWZXJ0aWNhbE5hdmlnYXRpb25TcGFjZXJJdGVtQ29tcG9uZW50LFxuICAgIGZvcndhcmRSZWYoKCkgPT4gVmVydGljYWxOYXZpZ2F0aW9uQ29sbGFwc2FibGVJdGVtQ29tcG9uZW50KSxcbiAgXSxcbn0pXG5leHBvcnQgY2xhc3MgVmVydGljYWxOYXZpZ2F0aW9uQ29sbGFwc2FibGVJdGVtQ29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0LCBPbkRlc3Ryb3kge1xuICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfYXV0b0NvbGxhcHNlOiBCb29sZWFuSW5wdXQ7XG5cbiAgQElucHV0KCkgYXV0b0NvbGxhcHNlOiBib29sZWFuO1xuICBASW5wdXQoKSBpdGVtOiBOYXZpZ2F0aW9uSXRlbTtcbiAgQElucHV0KCkgbmFtZTogc3RyaW5nO1xuXG4gIGlzQ29sbGFwc2VkID0gdHJ1ZTtcbiAgaXNFeHBhbmRlZCA9IGZhbHNlO1xuXG4gIHByaXZhdGUgX3ZlcnRpY2FsTmF2aWdhdGlvbkNvbXBvbmVudDogVmVydGljYWxOYXZpZ2F0aW9uQ29tcG9uZW50O1xuICBwcml2YXRlIF91bnN1YnNjcmliZUFsbDogU3ViamVjdDxhbnk+ID0gbmV3IFN1YmplY3Q8YW55PigpO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgX3JvdXRlcjogUm91dGVyLFxuICAgIHByaXZhdGUgX2NoYW5nZURldGVjdG9yUmVmOiBDaGFuZ2VEZXRlY3RvclJlZixcbiAgICBwcml2YXRlIF9uYXZpZ2F0aW9uU2VydmljZTogTmF2aWdhdGlvblNlcnZpY2VcbiAgKSB7fVxuXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIEAgQWNjZXNzb3JzXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgQEhvc3RCaW5kaW5nKCdjbGFzcycpIGdldCBjbGFzc0xpc3QoKTogYW55IHtcbiAgICByZXR1cm4ge1xuICAgICAgJ3ZlcnRpY2FsLW5hdmlnYXRpb24taXRlbS1jb2xsYXBzZWQnOiB0aGlzLmlzQ29sbGFwc2VkLFxuICAgICAgJ3ZlcnRpY2FsLW5hdmlnYXRpb24taXRlbS1leHBhbmRlZCc6IHRoaXMuaXNFeHBhbmRlZCxcbiAgICB9O1xuICB9XG5cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gQCBMaWZlY3ljbGUgaG9va3NcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICBuZ09uSW5pdCgpOiB2b2lkIHtcbiAgICAvLyBHZXQgdGhlIHBhcmVudCBuYXZpZ2F0aW9uIGNvbXBvbmVudFxuICAgIHRoaXMuX3ZlcnRpY2FsTmF2aWdhdGlvbkNvbXBvbmVudCA9IHRoaXMuX25hdmlnYXRpb25TZXJ2aWNlLmdldENvbXBvbmVudCh0aGlzLm5hbWUpO1xuXG4gICAgLy8gSWYgdGhlIGl0ZW0gaGFzIGEgY2hpbGRyZW4gdGhhdCBoYXMgYSBtYXRjaGluZyB1cmwgd2l0aCB0aGUgY3VycmVudCB1cmwsIGV4cGFuZC4uLlxuICAgIGlmICh0aGlzLl9oYXNBY3RpdmVDaGlsZCh0aGlzLml0ZW0sIHRoaXMuX3JvdXRlci51cmwpKSB7XG4gICAgICB0aGlzLmV4cGFuZCgpO1xuICAgIH1cbiAgICAvLyBPdGhlcndpc2UuLi5cbiAgICBlbHNlIHtcbiAgICAgIC8vIElmIHRoZSBhdXRvQ29sbGFwc2UgaXMgb24sIGNvbGxhcHNlLi4uXG4gICAgICBpZiAodGhpcy5hdXRvQ29sbGFwc2UpIHtcbiAgICAgICAgdGhpcy5jb2xsYXBzZSgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIExpc3RlbiBmb3IgdGhlIG9uQ29sbGFwc2FibGVJdGVtQ29sbGFwc2VkIGZyb20gdGhlIHNlcnZpY2VcbiAgICB0aGlzLl92ZXJ0aWNhbE5hdmlnYXRpb25Db21wb25lbnQub25Db2xsYXBzYWJsZUl0ZW1Db2xsYXBzZWRcbiAgICAgIC5waXBlKHRha2VVbnRpbCh0aGlzLl91bnN1YnNjcmliZUFsbCkpXG4gICAgICAuc3Vic2NyaWJlKChjb2xsYXBzZWRJdGVtKSA9PiB7XG4gICAgICAgIC8vIENoZWNrIGlmIHRoZSBjb2xsYXBzZWQgaXRlbSBpcyBudWxsXG4gICAgICAgIGlmIChjb2xsYXBzZWRJdGVtID09PSBudWxsKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ29sbGFwc2UgaWYgdGhpcyBpcyBhIGNoaWxkcmVuIG9mIHRoZSBjb2xsYXBzZWQgaXRlbVxuICAgICAgICBpZiAodGhpcy5faXNDaGlsZHJlbk9mKGNvbGxhcHNlZEl0ZW0sIHRoaXMuaXRlbSkpIHtcbiAgICAgICAgICB0aGlzLmNvbGxhcHNlKCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgLy8gTGlzdGVuIGZvciB0aGUgb25Db2xsYXBzYWJsZUl0ZW1FeHBhbmRlZCBmcm9tIHRoZSBzZXJ2aWNlIGlmIHRoZSBhdXRvQ29sbGFwc2UgaXMgb25cbiAgICBpZiAodGhpcy5hdXRvQ29sbGFwc2UpIHtcbiAgICAgIHRoaXMuX3ZlcnRpY2FsTmF2aWdhdGlvbkNvbXBvbmVudC5vbkNvbGxhcHNhYmxlSXRlbUV4cGFuZGVkXG4gICAgICAgIC5waXBlKHRha2VVbnRpbCh0aGlzLl91bnN1YnNjcmliZUFsbCkpXG4gICAgICAgIC5zdWJzY3JpYmUoKGV4cGFuZGVkSXRlbSkgPT4ge1xuICAgICAgICAgIC8vIENoZWNrIGlmIHRoZSBleHBhbmRlZCBpdGVtIGlzIG51bGxcbiAgICAgICAgICBpZiAoZXhwYW5kZWRJdGVtID09PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gQ2hlY2sgaWYgdGhpcyBpcyBhIHBhcmVudCBvZiB0aGUgZXhwYW5kZWQgaXRlbVxuICAgICAgICAgIGlmICh0aGlzLl9pc0NoaWxkcmVuT2YodGhpcy5pdGVtLCBleHBhbmRlZEl0ZW0pKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gQ2hlY2sgaWYgdGhpcyBoYXMgYSBjaGlsZHJlbiB3aXRoIGEgbWF0Y2hpbmcgdXJsIHdpdGggdGhlIGN1cnJlbnQgYWN0aXZlIHVybFxuICAgICAgICAgIGlmICh0aGlzLl9oYXNBY3RpdmVDaGlsZCh0aGlzLml0ZW0sIHRoaXMuX3JvdXRlci51cmwpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gQ2hlY2sgaWYgdGhpcyBpcyB0aGUgZXhwYW5kZWQgaXRlbVxuICAgICAgICAgIGlmICh0aGlzLml0ZW0gPT09IGV4cGFuZGVkSXRlbSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIElmIG5vbmUgb2YgdGhlIGFib3ZlIGNvbmRpdGlvbnMgYXJlIG1hdGNoZWQsIGNvbGxhcHNlIHRoaXMgaXRlbVxuICAgICAgICAgIHRoaXMuY29sbGFwc2UoKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gQXR0YWNoIGEgbGlzdGVuZXIgdG8gdGhlIE5hdmlnYXRpb25FbmQgZXZlbnRcbiAgICB0aGlzLl9yb3V0ZXIuZXZlbnRzXG4gICAgICAucGlwZShcbiAgICAgICAgZmlsdGVyKChldmVudCk6IGV2ZW50IGlzIE5hdmlnYXRpb25FbmQgPT4gZXZlbnQgaW5zdGFuY2VvZiBOYXZpZ2F0aW9uRW5kKSxcbiAgICAgICAgdGFrZVVudGlsKHRoaXMuX3Vuc3Vic2NyaWJlQWxsKVxuICAgICAgKVxuICAgICAgLnN1YnNjcmliZSgoZXZlbnQ6IE5hdmlnYXRpb25FbmQpID0+IHtcbiAgICAgICAgLy8gSWYgdGhlIGl0ZW0gaGFzIGEgY2hpbGRyZW4gdGhhdCBoYXMgYSBtYXRjaGluZyB1cmwgd2l0aCB0aGUgY3VycmVudCB1cmwsIGV4cGFuZC4uLlxuICAgICAgICBpZiAodGhpcy5faGFzQWN0aXZlQ2hpbGQodGhpcy5pdGVtLCBldmVudC51cmxBZnRlclJlZGlyZWN0cykpIHtcbiAgICAgICAgICB0aGlzLmV4cGFuZCgpO1xuICAgICAgICB9XG4gICAgICAgIC8vIE90aGVyd2lzZS4uLlxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAvLyBJZiB0aGUgYXV0b0NvbGxhcHNlIGlzIG9uLCBjb2xsYXBzZS4uLlxuICAgICAgICAgIGlmICh0aGlzLmF1dG9Db2xsYXBzZSkge1xuICAgICAgICAgICAgdGhpcy5jb2xsYXBzZSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAvLyBTdWJzY3JpYmUgdG8gb25SZWZyZXNoZWQgb24gdGhlIG5hdmlnYXRpb24gY29tcG9uZW50XG4gICAgdGhpcy5fdmVydGljYWxOYXZpZ2F0aW9uQ29tcG9uZW50Lm9uUmVmcmVzaGVkXG4gICAgICAucGlwZSh0YWtlVW50aWwodGhpcy5fdW5zdWJzY3JpYmVBbGwpKVxuICAgICAgLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICAgIC8vIE1hcmsgZm9yIGNoZWNrXG4gICAgICAgIHRoaXMuX2NoYW5nZURldGVjdG9yUmVmLm1hcmtGb3JDaGVjaygpO1xuICAgICAgfSk7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpOiB2b2lkIHtcbiAgICAvLyBVbnN1YnNjcmliZSBmcm9tIGFsbCBzdWJzY3JpcHRpb25zXG4gICAgdGhpcy5fdW5zdWJzY3JpYmVBbGwubmV4dChudWxsKTtcbiAgICB0aGlzLl91bnN1YnNjcmliZUFsbC5jb21wbGV0ZSgpO1xuICB9XG5cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gQCBQdWJsaWMgbWV0aG9kc1xuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIGNvbGxhcHNlKCk6IHZvaWQge1xuICAgIC8vIFJldHVybiBpZiB0aGUgaXRlbSBpcyBkaXNhYmxlZFxuICAgIGlmICh0aGlzLml0ZW0uZGlzYWJsZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBSZXR1cm4gaWYgdGhlIGl0ZW0gaXMgYWxyZWFkeSBjb2xsYXBzZWRcbiAgICBpZiAodGhpcy5pc0NvbGxhcHNlZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIENvbGxhcHNlIGl0XG4gICAgdGhpcy5pc0NvbGxhcHNlZCA9IHRydWU7XG4gICAgdGhpcy5pc0V4cGFuZGVkID0gIXRoaXMuaXNDb2xsYXBzZWQ7XG5cbiAgICAvLyBNYXJrIGZvciBjaGVja1xuICAgIHRoaXMuX2NoYW5nZURldGVjdG9yUmVmLm1hcmtGb3JDaGVjaygpO1xuXG4gICAgLy8gRXhlY3V0ZSB0aGUgb2JzZXJ2YWJsZVxuICAgIHRoaXMuX3ZlcnRpY2FsTmF2aWdhdGlvbkNvbXBvbmVudC5vbkNvbGxhcHNhYmxlSXRlbUNvbGxhcHNlZC5uZXh0KHRoaXMuaXRlbSk7XG4gIH1cblxuICBleHBhbmQoKTogdm9pZCB7XG4gICAgLy8gUmV0dXJuIGlmIHRoZSBpdGVtIGlzIGRpc2FibGVkXG4gICAgaWYgKHRoaXMuaXRlbS5kaXNhYmxlZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFJldHVybiBpZiB0aGUgaXRlbSBpcyBhbHJlYWR5IGV4cGFuZGVkXG4gICAgaWYgKCF0aGlzLmlzQ29sbGFwc2VkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gRXhwYW5kIGl0XG4gICAgdGhpcy5pc0NvbGxhcHNlZCA9IGZhbHNlO1xuICAgIHRoaXMuaXNFeHBhbmRlZCA9ICF0aGlzLmlzQ29sbGFwc2VkO1xuXG4gICAgLy8gTWFyayBmb3IgY2hlY2tcbiAgICB0aGlzLl9jaGFuZ2VEZXRlY3RvclJlZi5tYXJrRm9yQ2hlY2soKTtcblxuICAgIC8vIEV4ZWN1dGUgdGhlIG9ic2VydmFibGVcbiAgICB0aGlzLl92ZXJ0aWNhbE5hdmlnYXRpb25Db21wb25lbnQub25Db2xsYXBzYWJsZUl0ZW1FeHBhbmRlZC5uZXh0KHRoaXMuaXRlbSk7XG4gIH1cblxuICB0b2dnbGVDb2xsYXBzYWJsZSgpOiB2b2lkIHtcbiAgICAvLyBUb2dnbGUgY29sbGFwc2UvZXhwYW5kXG4gICAgaWYgKHRoaXMuaXNDb2xsYXBzZWQpIHtcbiAgICAgIHRoaXMuZXhwYW5kKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuY29sbGFwc2UoKTtcbiAgICB9XG4gIH1cblxuICB0cmFja0J5Rm4oaW5kZXg6IG51bWJlciwgaXRlbTogYW55KTogYW55IHtcbiAgICByZXR1cm4gaXRlbS5pZCB8fCBpbmRleDtcbiAgfVxuXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIEAgUHJpdmF0ZSBtZXRob2RzXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgcHJpdmF0ZSBfaGFzQWN0aXZlQ2hpbGQoaXRlbTogTmF2aWdhdGlvbkl0ZW0sIGN1cnJlbnRVcmw6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IGNoaWxkcmVuID0gaXRlbS5jaGlsZHJlbjtcblxuICAgIGlmICghY2hpbGRyZW4pIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBmb3IgKGNvbnN0IGNoaWxkIG9mIGNoaWxkcmVuKSB7XG4gICAgICBpZiAoY2hpbGQuY2hpbGRyZW4pIHtcbiAgICAgICAgaWYgKHRoaXMuX2hhc0FjdGl2ZUNoaWxkKGNoaWxkLCBjdXJyZW50VXJsKSkge1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIENoZWNrIGlmIHRoZSBjaGlsZCBoYXMgYSBsaW5rIGFuZCBpcyBhY3RpdmVcbiAgICAgIGlmIChjaGlsZC5saW5rICYmIHRoaXMuX3JvdXRlci5pc0FjdGl2ZShjaGlsZC5saW5rLCBjaGlsZC5leGFjdE1hdGNoIHx8IGZhbHNlKSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBwcml2YXRlIF9pc0NoaWxkcmVuT2YocGFyZW50OiBOYXZpZ2F0aW9uSXRlbSwgaXRlbTogTmF2aWdhdGlvbkl0ZW0pOiBib29sZWFuIHtcbiAgICBjb25zdCBjaGlsZHJlbiA9IHBhcmVudC5jaGlsZHJlbjtcblxuICAgIGlmICghY2hpbGRyZW4pIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAoY2hpbGRyZW4uaW5kZXhPZihpdGVtKSA+IC0xKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBmb3IgKGNvbnN0IGNoaWxkIG9mIGNoaWxkcmVuKSB7XG4gICAgICBpZiAoY2hpbGQuY2hpbGRyZW4pIHtcbiAgICAgICAgaWYgKHRoaXMuX2lzQ2hpbGRyZW5PZihjaGlsZCwgaXRlbSkpIHtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuIiwiPGRpdlxuICBjbGFzcz1cInZlcnRpY2FsLW5hdmlnYXRpb24taXRlbS13cmFwcGVyXCJcbiAgW2NsYXNzLnZlcnRpY2FsLW5hdmlnYXRpb24taXRlbS1oYXMtc3VidGl0bGVdPVwiISFpdGVtLnN1YnRpdGxlXCJcbiAgW25nQ2xhc3NdPVwiaXRlbS5jbGFzc2VzPy53cmFwcGVyXCJcbj5cbiAgPGJ1dHRvblxuICAgIGNsYXNzPVwidmVydGljYWwtbmF2aWdhdGlvbi1pdGVtXCJcbiAgICBbbmdDbGFzc109XCJ7ICd2ZXJ0aWNhbC1uYXZpZ2F0aW9uLWl0ZW0tZGlzYWJsZWQnOiBpdGVtLmRpc2FibGVkIH1cIlxuICAgIChjbGljayk9XCJ0b2dnbGVDb2xsYXBzYWJsZSgpXCJcbiAgPlxuICAgIDwhLS0gSWNvbiAtLT5cbiAgICBAaWYgKGl0ZW0uaWNvbikge1xuICAgICAgPHN2Zy1pY29uXG4gICAgICAgIGNsYXNzPVwidmVydGljYWwtbmF2aWdhdGlvbi1pdGVtLWljb25cIlxuICAgICAgICBbbmdDbGFzc109XCJpdGVtLmNsYXNzZXM/Lmljb25cIlxuICAgICAgICBbbmFtZV09XCJpdGVtLmljb25cIlxuICAgICAgLz5cbiAgICB9XG5cbiAgICA8IS0tIFRpdGxlICYgU3VidGl0bGUgLS0+XG4gICAgPGRpdiBjbGFzcz1cInZlcnRpY2FsLW5hdmlnYXRpb24taXRlbS10aXRsZS13cmFwcGVyXCI+XG4gICAgICA8ZGl2IGNsYXNzPVwidmVydGljYWwtbmF2aWdhdGlvbi1pdGVtLXRpdGxlXCI+XG4gICAgICAgIDxzcGFuIFtuZ0NsYXNzXT1cIml0ZW0uY2xhc3Nlcz8udGl0bGVcIj5cbiAgICAgICAgICB7eyBpdGVtLnRpdGxlIH19XG4gICAgICAgIDwvc3Bhbj5cbiAgICAgIDwvZGl2PlxuICAgICAgQGlmIChpdGVtLnN1YnRpdGxlKSB7XG4gICAgICAgIDxkaXYgY2xhc3M9XCJ2ZXJ0aWNhbC1uYXZpZ2F0aW9uLWl0ZW0tc3VidGl0bGVcIj5cbiAgICAgICAgICA8c3BhbiBbbmdDbGFzc109XCJpdGVtLmNsYXNzZXM/LnN1YnRpdGxlXCI+XG4gICAgICAgICAgICB7eyBpdGVtLnN1YnRpdGxlIH19XG4gICAgICAgICAgPC9zcGFuPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIH1cbiAgICA8L2Rpdj5cblxuICAgIDwhLS0gQmFkZ2UgLS0+XG4gICAgQGlmIChpdGVtLmJhZGdlKSB7XG4gICAgICA8ZGl2IGNsYXNzPVwidmVydGljYWwtbmF2aWdhdGlvbi1pdGVtLWJhZGdlXCI+XG4gICAgICAgIDxkaXZcbiAgICAgICAgICBjbGFzcz1cInZlcnRpY2FsLW5hdmlnYXRpb24taXRlbS1iYWRnZS1jb250ZW50XCJcbiAgICAgICAgICBbbmdDbGFzc109XCJpdGVtLmJhZGdlLmNsYXNzZXNcIlxuICAgICAgICA+XG4gICAgICAgICAge3sgaXRlbS5iYWRnZS50aXRsZSB9fVxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgIH1cblxuICAgIDwhLS0gQXJyb3cgLS0+XG4gICAgPHN2Zy1pY29uXG4gICAgICBjbGFzcz1cInZlcnRpY2FsLW5hdmlnYXRpb24taXRlbS1hcnJvdyBpY29uLXNpemUtNFwiXG4gICAgICBbbmFtZV09XCInaGVyb2ljb25zX3NvbGlkOmNoZXZyb24tcmlnaHQnXCJcbiAgICAvPlxuICA8L2J1dHRvbj5cbjwvZGl2PlxuXG5AaWYgKCFpc0NvbGxhcHNlZCkge1xuICA8ZGl2XG4gICAgY2xhc3M9XCJ2ZXJ0aWNhbC1uYXZpZ2F0aW9uLWl0ZW0tY2hpbGRyZW5cIlxuICAgIEBleHBhbmRDb2xsYXBzZVxuICA+XG4gICAgQGZvciAoaXRlbSBvZiBpdGVtLmNoaWxkcmVuOyB0cmFjayBpdGVtLmlkKSB7XG4gICAgICA8IS0tIFNraXAgdGhlIGhpZGRlbiBpdGVtcyAtLT5cbiAgICAgIEBpZiAoKGl0ZW0uaGlkZGVuICYmICFpdGVtLmhpZGRlbihpdGVtKSkgfHwgIWl0ZW0uaGlkZGVuKSB7XG4gICAgICAgIDwhLS0gQmFzaWMgLS0+XG4gICAgICAgIEBpZiAoaXRlbS50eXBlID09PSAnYmFzaWMnKSB7XG4gICAgICAgICAgPHZlcnRpY2FsLW5hdmlnYXRpb24tYmFzaWMtaXRlbVxuICAgICAgICAgICAgW2l0ZW1dPVwiaXRlbVwiXG4gICAgICAgICAgICBbbmFtZV09XCJuYW1lXCJcbiAgICAgICAgICAvPlxuICAgICAgICB9XG5cbiAgICAgICAgPCEtLSBDb2xsYXBzYWJsZSAtLT5cbiAgICAgICAgQGlmIChpdGVtLnR5cGUgPT09ICdjb2xsYXBzYWJsZScpIHtcbiAgICAgICAgICA8dmVydGljYWwtbmF2aWdhdGlvbi1jb2xsYXBzYWJsZS1pdGVtXG4gICAgICAgICAgICBbaXRlbV09XCJpdGVtXCJcbiAgICAgICAgICAgIFtuYW1lXT1cIm5hbWVcIlxuICAgICAgICAgICAgW2F1dG9Db2xsYXBzZV09XCJhdXRvQ29sbGFwc2VcIlxuICAgICAgICAgIC8+XG4gICAgICAgIH1cblxuICAgICAgICA8IS0tIERpdmlkZXIgLS0+XG4gICAgICAgIEBpZiAoaXRlbS50eXBlID09PSAnZGl2aWRlcicpIHtcbiAgICAgICAgICA8dmVydGljYWwtbmF2aWdhdGlvbi1kaXZpZGVyLWl0ZW1cbiAgICAgICAgICAgIFtpdGVtXT1cIml0ZW1cIlxuICAgICAgICAgICAgW25hbWVdPVwibmFtZVwiXG4gICAgICAgICAgLz5cbiAgICAgICAgfVxuXG4gICAgICAgIDwhLS0gR3JvdXAgLS0+XG4gICAgICAgIEBpZiAoaXRlbS50eXBlID09PSAnZ3JvdXAnKSB7XG4gICAgICAgICAgPHZlcnRpY2FsLW5hdmlnYXRpb24tZ3JvdXAtaXRlbVxuICAgICAgICAgICAgW2l0ZW1dPVwiaXRlbVwiXG4gICAgICAgICAgICBbbmFtZV09XCJuYW1lXCJcbiAgICAgICAgICAvPlxuICAgICAgICB9XG5cbiAgICAgICAgPCEtLSBTcGFjZXIgLS0+XG4gICAgICAgIEBpZiAoaXRlbS50eXBlID09PSAnc3BhY2VyJykge1xuICAgICAgICAgIDx2ZXJ0aWNhbC1uYXZpZ2F0aW9uLXNwYWNlci1pdGVtXG4gICAgICAgICAgICBbaXRlbV09XCJpdGVtXCJcbiAgICAgICAgICAgIFtuYW1lXT1cIm5hbWVcIlxuICAgICAgICAgIC8+XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIDwvZGl2PlxufVxuIl19