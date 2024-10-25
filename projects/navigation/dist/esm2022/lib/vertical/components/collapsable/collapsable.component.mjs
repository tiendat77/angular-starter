import { ChangeDetectionStrategy, Component, forwardRef, HostBinding, Input, } from '@angular/core';
import { NgClass } from '@angular/common';
import { NavigationEnd } from '@angular/router';
import { SvgIconModule } from '@libs/svg-icon';
import { filter, Subject, takeUntil } from 'rxjs';
import { expandCollapse } from '../../../animations/expand-collapse';
import { VerticalNavigationBasicItemComponent } from '../../../vertical/components/basic/basic.component';
import { VerticalNavigationDividerItemComponent } from '../../../vertical/components/divider/divider.component';
import { VerticalNavigationGroupItemComponent } from '../../../vertical/components/group/group.component';
import { VerticalNavigationSpacerItemComponent } from '../../../vertical/components/spacer/spacer.component';
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
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: VerticalNavigationCollapsableItemComponent, deps: [{ token: i1.Router }, { token: i0.ChangeDetectorRef }, { token: i2.NavigationService }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "18.2.8", type: VerticalNavigationCollapsableItemComponent, isStandalone: true, selector: "vertical-navigation-collapsable-item", inputs: { autoCollapse: "autoCollapse", item: "item", name: "name" }, host: { properties: { "class": "this.classList" } }, ngImport: i0, template: "<div\n  class=\"vertical-navigation-item-wrapper\"\n  [class.vertical-navigation-item-has-subtitle]=\"!!item.subtitle\"\n  [ngClass]=\"item.classes?.wrapper\"\n>\n  <button\n    class=\"vertical-navigation-item\"\n    [ngClass]=\"{ 'vertical-navigation-item-disabled': item.disabled }\"\n    (click)=\"toggleCollapsable()\"\n  >\n    <!-- Icon -->\n    @if (item.icon) {\n      <svg-icon\n        class=\"vertical-navigation-item-icon\"\n        [ngClass]=\"item.classes?.icon\"\n        [name]=\"item.icon\"\n      />\n    }\n\n    <!-- Title & Subtitle -->\n    <div class=\"vertical-navigation-item-title-wrapper\">\n      <div class=\"vertical-navigation-item-title\">\n        <span [ngClass]=\"item.classes?.title\">\n          {{ item.title }}\n        </span>\n      </div>\n      @if (item.subtitle) {\n        <div class=\"vertical-navigation-item-subtitle\">\n          <span [ngClass]=\"item.classes?.subtitle\">\n            {{ item.subtitle }}\n          </span>\n        </div>\n      }\n    </div>\n\n    <!-- Badge -->\n    @if (item.badge) {\n      <div class=\"vertical-navigation-item-badge\">\n        <div\n          class=\"vertical-navigation-item-badge-content\"\n          [ngClass]=\"item.badge.classes\"\n        >\n          {{ item.badge.title }}\n        </div>\n      </div>\n    }\n\n    <!-- Arrow -->\n    <svg-icon\n      class=\"vertical-navigation-item-arrow icon-size-4\"\n      [name]=\"'heroicons_solid:chevron-right'\"\n    />\n  </button>\n</div>\n\n@if (!isCollapsed) {\n  <div\n    class=\"vertical-navigation-item-children\"\n    @expandCollapse\n  >\n    @for (item of item.children; track item.id) {\n      <!-- Skip the hidden items -->\n      @if ((item.hidden && !item.hidden(item)) || !item.hidden) {\n        <!-- Basic -->\n        @if (item.type === 'basic') {\n          <vertical-navigation-basic-item\n            [item]=\"item\"\n            [name]=\"name\"\n          />\n        }\n\n        <!-- Collapsable -->\n        @if (item.type === 'collapsable') {\n          <vertical-navigation-collapsable-item\n            [item]=\"item\"\n            [name]=\"name\"\n            [autoCollapse]=\"autoCollapse\"\n          />\n        }\n\n        <!-- Divider -->\n        @if (item.type === 'divider') {\n          <vertical-navigation-divider-item\n            [item]=\"item\"\n            [name]=\"name\"\n          />\n        }\n\n        <!-- Group -->\n        @if (item.type === 'group') {\n          <vertical-navigation-group-item\n            [item]=\"item\"\n            [name]=\"name\"\n          />\n        }\n\n        <!-- Spacer -->\n        @if (item.type === 'spacer') {\n          <vertical-navigation-spacer-item\n            [item]=\"item\"\n            [name]=\"name\"\n          />\n        }\n      }\n    }\n  </div>\n}\n", dependencies: [{ kind: "component", type: i0.forwardRef(() => VerticalNavigationCollapsableItemComponent), selector: "vertical-navigation-collapsable-item", inputs: ["autoCollapse", "item", "name"] }, { kind: "directive", type: i0.forwardRef(() => NgClass), selector: "[ngClass]", inputs: ["class", "ngClass"] }, { kind: "ngmodule", type: i0.forwardRef(() => SvgIconModule) }, { kind: "component", type: i0.forwardRef(() => i3.SvgIcon), selector: "svg-icon", inputs: ["inline", "name", "fontSet", "fontIcon"], exportAs: ["svgIcon"] }, { kind: "component", type: i0.forwardRef(() => VerticalNavigationBasicItemComponent), selector: "vertical-navigation-basic-item", inputs: ["item", "name"] }, { kind: "component", type: i0.forwardRef(() => VerticalNavigationDividerItemComponent), selector: "vertical-navigation-divider-item", inputs: ["item", "name"] }, { kind: "component", type: i0.forwardRef(() => VerticalNavigationGroupItemComponent), selector: "vertical-navigation-group-item", inputs: ["autoCollapse", "item", "name"] }, { kind: "component", type: i0.forwardRef(() => VerticalNavigationSpacerItemComponent), selector: "vertical-navigation-spacer-item", inputs: ["item", "name"] }], animations: [expandCollapse], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: VerticalNavigationCollapsableItemComponent, decorators: [{
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sbGFwc2FibGUuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2xpYi92ZXJ0aWNhbC9jb21wb25lbnRzL2NvbGxhcHNhYmxlL2NvbGxhcHNhYmxlLmNvbXBvbmVudC50cyIsIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9saWIvdmVydGljYWwvY29tcG9uZW50cy9jb2xsYXBzYWJsZS9jb2xsYXBzYWJsZS5jb21wb25lbnQuaHRtbCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQ0wsdUJBQXVCLEVBRXZCLFNBQVMsRUFDVCxVQUFVLEVBQ1YsV0FBVyxFQUNYLEtBQUssR0FHTixNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDMUMsT0FBTyxFQUFFLGFBQWEsRUFBVSxNQUFNLGlCQUFpQixDQUFDO0FBR3hELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUUvQyxPQUFPLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDbEQsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLHFDQUFxQyxDQUFDO0FBS3JFLE9BQU8sRUFBRSxvQ0FBb0MsRUFBRSxNQUFNLG9EQUFvRCxDQUFDO0FBQzFHLE9BQU8sRUFBRSxzQ0FBc0MsRUFBRSxNQUFNLHdEQUF3RCxDQUFDO0FBQ2hILE9BQU8sRUFBRSxvQ0FBb0MsRUFBRSxNQUFNLG9EQUFvRCxDQUFDO0FBQzFHLE9BQU8sRUFBRSxxQ0FBcUMsRUFBRSxNQUFNLHNEQUFzRCxDQUFDOzs7OztBQWtCN0csTUFBTSxPQUFPLDBDQUEwQztJQWMzQztJQUNBO0lBQ0E7SUFmVixNQUFNLENBQUMsOEJBQThCLENBQWU7SUFFM0MsWUFBWSxDQUFVO0lBQ3RCLElBQUksQ0FBaUI7SUFDckIsSUFBSSxDQUFTO0lBRXRCLFdBQVcsR0FB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QUFLLE1BQU0sS0FBSyxJQUFJLFFBQVEsRUFBRSxDQUFDO1lBQzdCLElBQUksS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDO2dCQUNuQixJQUFJLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUM7b0JBQ3BDLE9BQU8sSUFBSSxDQUFDO2dCQUNkLENBQUM7WUFDSCxDQUFDO1FBQ0gsQ0FBQztRQUVELE9BQU8sS0FBSyxDQUFDO0lBQ2YsQ0FBQzt1R0E5T1UsMENBQTBDOzJGQUExQywwQ0FBMEMsMk5DM0N2RCwwdkZBMkdBLGdFRGhFYSwwQ0FBMEMsZ0pBVG5ELE9BQU8sd0dBQ1AsYUFBYSxrTkFDYixvQ0FBb0MsMEhBQ3BDLHNDQUFzQyw0SEFDdEMsb0NBQW9DLDBJQUNwQyxxQ0FBcUMseUZBVDNCLENBQUMsY0FBYyxDQUFDOzsyRkFhakIsMENBQTBDO2tCQWhCdEQsU0FBUzsrQkFDRSxzQ0FBc0MsY0FFcEMsQ0FBQyxjQUFjLENBQUMsbUJBQ1gsdUJBQXVCLENBQUMsTUFBTSxjQUNuQyxJQUFJLFdBQ1A7d0JBQ1AsT0FBTzt3QkFDUCxhQUFhO3dCQUNiLG9DQUFvQzt3QkFDcEMsc0NBQXNDO3dCQUN0QyxvQ0FBb0M7d0JBQ3BDLHFDQUFxQzt3QkFDckMsVUFBVSxDQUFDLEdBQUcsRUFBRSwyQ0FBMkMsQ0FBQztxQkFDN0Q7MklBS1EsWUFBWTtzQkFBcEIsS0FBSztnQkFDRyxJQUFJO3NCQUFaLEtBQUs7Z0JBQ0csSUFBSTtzQkFBWixLQUFLO2dCQWtCb0IsU0FBUztzQkFBbEMsV0FBVzt1QkFBQyxPQUFPIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksXG4gIENoYW5nZURldGVjdG9yUmVmLFxuICBDb21wb25lbnQsXG4gIGZvcndhcmRSZWYsXG4gIEhvc3RCaW5kaW5nLFxuICBJbnB1dCxcbiAgT25EZXN0cm95LFxuICBPbkluaXQsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgTmdDbGFzcyB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQgeyBOYXZpZ2F0aW9uRW5kLCBSb3V0ZXIgfSBmcm9tICdAYW5ndWxhci9yb3V0ZXInO1xuaW1wb3J0IHsgQm9vbGVhbklucHV0IH0gZnJvbSAnQGFuZ3VsYXIvY2RrL2NvZXJjaW9uJztcblxuaW1wb3J0IHsgU3ZnSWNvbk1vZHVsZSB9IGZyb20gJ0BsaWJzL3N2Zy1pY29uJztcblxuaW1wb3J0IHsgZmlsdGVyLCBTdWJqZWN0LCB0YWtlVW50aWwgfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IGV4cGFuZENvbGxhcHNlIH0gZnJvbSAnLi4vLi4vLi4vYW5pbWF0aW9ucy9leHBhbmQtY29sbGFwc2UnO1xuaW1wb3J0IHsgTmF2aWdhdGlvbkl0ZW0gfSBmcm9tICcuLi8uLi8uLi9uYXZpZ2F0aW9uLnR5cGVzJztcblxuaW1wb3J0IHsgTmF2aWdhdGlvblNlcnZpY2UgfSBmcm9tICcuLi8uLi8uLi9uYXZpZ2F0aW9uLnNlcnZpY2UnO1xuaW1wb3J0IHsgVmVydGljYWxOYXZpZ2F0aW9uQ29tcG9uZW50IH0gZnJvbSAnLi4vLi4vLi4vdmVydGljYWwvdmVydGljYWwuY29tcG9uZW50JztcbmltcG9ydCB7IFZlcnRpY2FsTmF2aWdhdGlvbkJhc2ljSXRlbUNvbXBvbmVudCB9IGZyb20gJy4uLy4uLy4uL3ZlcnRpY2FsL2NvbXBvbmVudHMvYmFzaWMvYmFzaWMuY29tcG9uZW50JztcbmltcG9ydCB7IFZlcnRpY2FsTmF2aWdhdGlvbkRpdmlkZXJJdGVtQ29tcG9uZW50IH0gZnJvbSAnLi4vLi4vLi4vdmVydGljYWwvY29tcG9uZW50cy9kaXZpZGVyL2RpdmlkZXIuY29tcG9uZW50JztcbmltcG9ydCB7IFZlcnRpY2FsTmF2aWdhdGlvbkdyb3VwSXRlbUNvbXBvbmVudCB9IGZyb20gJy4uLy4uLy4uL3ZlcnRpY2FsL2NvbXBvbmVudHMvZ3JvdXAvZ3JvdXAuY29tcG9uZW50JztcbmltcG9ydCB7IFZlcnRpY2FsTmF2aWdhdGlvblNwYWNlckl0ZW1Db21wb25lbnQgfSBmcm9tICcuLi8uLi8uLi92ZXJ0aWNhbC9jb21wb25lbnRzL3NwYWNlci9zcGFjZXIuY29tcG9uZW50JztcblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAndmVydGljYWwtbmF2aWdhdGlvbi1jb2xsYXBzYWJsZS1pdGVtJyxcbiAgdGVtcGxhdGVVcmw6ICcuL2NvbGxhcHNhYmxlLmNvbXBvbmVudC5odG1sJyxcbiAgYW5pbWF0aW9uczogW2V4cGFuZENvbGxhcHNlXSxcbiAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5PblB1c2gsXG4gIHN0YW5kYWxvbmU6IHRydWUsXG4gIGltcG9ydHM6IFtcbiAgICBOZ0NsYXNzLFxuICAgIFN2Z0ljb25Nb2R1bGUsXG4gICAgVmVydGljYWxOYXZpZ2F0aW9uQmFzaWNJdGVtQ29tcG9uZW50LFxuICAgIFZlcnRpY2FsTmF2aWdhdGlvbkRpdmlkZXJJdGVtQ29tcG9uZW50LFxuICAgIFZlcnRpY2FsTmF2aWdhdGlvbkdyb3VwSXRlbUNvbXBvbmVudCxcbiAgICBWZXJ0aWNhbE5hdmlnYXRpb25TcGFjZXJJdGVtQ29tcG9uZW50LFxuICAgIGZvcndhcmRSZWYoKCkgPT4gVmVydGljYWxOYXZpZ2F0aW9uQ29sbGFwc2FibGVJdGVtQ29tcG9uZW50KSxcbiAgXSxcbn0pXG5leHBvcnQgY2xhc3MgVmVydGljYWxOYXZpZ2F0aW9uQ29sbGFwc2FibGVJdGVtQ29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0LCBPbkRlc3Ryb3kge1xuICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfYXV0b0NvbGxhcHNlOiBCb29sZWFuSW5wdXQ7XG5cbiAgQElucHV0KCkgYXV0b0NvbGxhcHNlOiBib29sZWFuO1xuICBASW5wdXQoKSBpdGVtOiBOYXZpZ2F0aW9uSXRlbTtcbiAgQElucHV0KCkgbmFtZTogc3RyaW5nO1xuXG4gIGlzQ29sbGFwc2VkID0gdHJ1ZTtcbiAgaXNFeHBhbmRlZCA9IGZhbHNlO1xuXG4gIHByaXZhdGUgX3ZlcnRpY2FsTmF2aWdhdGlvbkNvbXBvbmVudDogVmVydGljYWxOYXZpZ2F0aW9uQ29tcG9uZW50O1xuICBwcml2YXRlIF91bnN1YnNjcmliZUFsbDogU3ViamVjdDxhbnk+ID0gbmV3IFN1YmplY3Q8YW55PigpO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgX3JvdXRlcjogUm91dGVyLFxuICAgIHByaXZhdGUgX2NoYW5nZURldGVjdG9yUmVmOiBDaGFuZ2VEZXRlY3RvclJlZixcbiAgICBwcml2YXRlIF9uYXZpZ2F0aW9uU2VydmljZTogTmF2aWdhdGlvblNlcnZpY2VcbiAgKSB7fVxuXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIEAgQWNjZXNzb3JzXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgQEhvc3RCaW5kaW5nKCdjbGFzcycpIGdldCBjbGFzc0xpc3QoKTogYW55IHtcbiAgICByZXR1cm4ge1xuICAgICAgJ3ZlcnRpY2FsLW5hdmlnYXRpb24taXRlbS1jb2xsYXBzZWQnOiB0aGlzLmlzQ29sbGFwc2VkLFxuICAgICAgJ3ZlcnRpY2FsLW5hdmlnYXRpb24taXRlbS1leHBhbmRlZCc6IHRoaXMuaXNFeHBhbmRlZCxcbiAgICB9O1xuICB9XG5cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gQCBMaWZlY3ljbGUgaG9va3NcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICBuZ09uSW5pdCgpOiB2b2lkIHtcbiAgICAvLyBHZXQgdGhlIHBhcmVudCBuYXZpZ2F0aW9uIGNvbXBvbmVudFxuICAgIHRoaXMuX3ZlcnRpY2FsTmF2aWdhdGlvbkNvbXBvbmVudCA9IHRoaXMuX25hdmlnYXRpb25TZXJ2aWNlLmdldENvbXBvbmVudCh0aGlzLm5hbWUpO1xuXG4gICAgLy8gSWYgdGhlIGl0ZW0gaGFzIGEgY2hpbGRyZW4gdGhhdCBoYXMgYSBtYXRjaGluZyB1cmwgd2l0aCB0aGUgY3VycmVudCB1cmwsIGV4cGFuZC4uLlxuICAgIGlmICh0aGlzLl9oYXNBY3RpdmVDaGlsZCh0aGlzLml0ZW0sIHRoaXMuX3JvdXRlci51cmwpKSB7XG4gICAgICB0aGlzLmV4cGFuZCgpO1xuICAgIH1cbiAgICAvLyBPdGhlcndpc2UuLi5cbiAgICBlbHNlIHtcbiAgICAgIC8vIElmIHRoZSBhdXRvQ29sbGFwc2UgaXMgb24sIGNvbGxhcHNlLi4uXG4gICAgICBpZiAodGhpcy5hdXRvQ29sbGFwc2UpIHtcbiAgICAgICAgdGhpcy5jb2xsYXBzZSgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIExpc3RlbiBmb3IgdGhlIG9uQ29sbGFwc2FibGVJdGVtQ29sbGFwc2VkIGZyb20gdGhlIHNlcnZpY2VcbiAgICB0aGlzLl92ZXJ0aWNhbE5hdmlnYXRpb25Db21wb25lbnQub25Db2xsYXBzYWJsZUl0ZW1Db2xsYXBzZWRcbiAgICAgIC5waXBlKHRha2VVbnRpbCh0aGlzLl91bnN1YnNjcmliZUFsbCkpXG4gICAgICAuc3Vic2NyaWJlKChjb2xsYXBzZWRJdGVtKSA9PiB7XG4gICAgICAgIC8vIENoZWNrIGlmIHRoZSBjb2xsYXBzZWQgaXRlbSBpcyBudWxsXG4gICAgICAgIGlmIChjb2xsYXBzZWRJdGVtID09PSBudWxsKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ29sbGFwc2UgaWYgdGhpcyBpcyBhIGNoaWxkcmVuIG9mIHRoZSBjb2xsYXBzZWQgaXRlbVxuICAgICAgICBpZiAodGhpcy5faXNDaGlsZHJlbk9mKGNvbGxhcHNlZEl0ZW0sIHRoaXMuaXRlbSkpIHtcbiAgICAgICAgICB0aGlzLmNvbGxhcHNlKCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgLy8gTGlzdGVuIGZvciB0aGUgb25Db2xsYXBzYWJsZUl0ZW1FeHBhbmRlZCBmcm9tIHRoZSBzZXJ2aWNlIGlmIHRoZSBhdXRvQ29sbGFwc2UgaXMgb25cbiAgICBpZiAodGhpcy5hdXRvQ29sbGFwc2UpIHtcbiAgICAgIHRoaXMuX3ZlcnRpY2FsTmF2aWdhdGlvbkNvbXBvbmVudC5vbkNvbGxhcHNhYmxlSXRlbUV4cGFuZGVkXG4gICAgICAgIC5waXBlKHRha2VVbnRpbCh0aGlzLl91bnN1YnNjcmliZUFsbCkpXG4gICAgICAgIC5zdWJzY3JpYmUoKGV4cGFuZGVkSXRlbSkgPT4ge1xuICAgICAgICAgIC8vIENoZWNrIGlmIHRoZSBleHBhbmRlZCBpdGVtIGlzIG51bGxcbiAgICAgICAgICBpZiAoZXhwYW5kZWRJdGVtID09PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gQ2hlY2sgaWYgdGhpcyBpcyBhIHBhcmVudCBvZiB0aGUgZXhwYW5kZWQgaXRlbVxuICAgICAgICAgIGlmICh0aGlzLl9pc0NoaWxkcmVuT2YodGhpcy5pdGVtLCBleHBhbmRlZEl0ZW0pKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gQ2hlY2sgaWYgdGhpcyBoYXMgYSBjaGlsZHJlbiB3aXRoIGEgbWF0Y2hpbmcgdXJsIHdpdGggdGhlIGN1cnJlbnQgYWN0aXZlIHVybFxuICAgICAgICAgIGlmICh0aGlzLl9oYXNBY3RpdmVDaGlsZCh0aGlzLml0ZW0sIHRoaXMuX3JvdXRlci51cmwpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gQ2hlY2sgaWYgdGhpcyBpcyB0aGUgZXhwYW5kZWQgaXRlbVxuICAgICAgICAgIGlmICh0aGlzLml0ZW0gPT09IGV4cGFuZGVkSXRlbSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIElmIG5vbmUgb2YgdGhlIGFib3ZlIGNvbmRpdGlvbnMgYXJlIG1hdGNoZWQsIGNvbGxhcHNlIHRoaXMgaXRlbVxuICAgICAgICAgIHRoaXMuY29sbGFwc2UoKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gQXR0YWNoIGEgbGlzdGVuZXIgdG8gdGhlIE5hdmlnYXRpb25FbmQgZXZlbnRcbiAgICB0aGlzLl9yb3V0ZXIuZXZlbnRzXG4gICAgICAucGlwZShcbiAgICAgICAgZmlsdGVyKChldmVudCk6IGV2ZW50IGlzIE5hdmlnYXRpb25FbmQgPT4gZXZlbnQgaW5zdGFuY2VvZiBOYXZpZ2F0aW9uRW5kKSxcbiAgICAgICAgdGFrZVVudGlsKHRoaXMuX3Vuc3Vic2NyaWJlQWxsKVxuICAgICAgKVxuICAgICAgLnN1YnNjcmliZSgoZXZlbnQ6IE5hdmlnYXRpb25FbmQpID0+IHtcbiAgICAgICAgLy8gSWYgdGhlIGl0ZW0gaGFzIGEgY2hpbGRyZW4gdGhhdCBoYXMgYSBtYXRjaGluZyB1cmwgd2l0aCB0aGUgY3VycmVudCB1cmwsIGV4cGFuZC4uLlxuICAgICAgICBpZiAodGhpcy5faGFzQWN0aXZlQ2hpbGQodGhpcy5pdGVtLCBldmVudC51cmxBZnRlclJlZGlyZWN0cykpIHtcbiAgICAgICAgICB0aGlzLmV4cGFuZCgpO1xuICAgICAgICB9XG4gICAgICAgIC8vIE90aGVyd2lzZS4uLlxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAvLyBJZiB0aGUgYXV0b0NvbGxhcHNlIGlzIG9uLCBjb2xsYXBzZS4uLlxuICAgICAgICAgIGlmICh0aGlzLmF1dG9Db2xsYXBzZSkge1xuICAgICAgICAgICAgdGhpcy5jb2xsYXBzZSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAvLyBTdWJzY3JpYmUgdG8gb25SZWZyZXNoZWQgb24gdGhlIG5hdmlnYXRpb24gY29tcG9uZW50XG4gICAgdGhpcy5fdmVydGljYWxOYXZpZ2F0aW9uQ29tcG9uZW50Lm9uUmVmcmVzaGVkXG4gICAgICAucGlwZSh0YWtlVW50aWwodGhpcy5fdW5zdWJzY3JpYmVBbGwpKVxuICAgICAgLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICAgIC8vIE1hcmsgZm9yIGNoZWNrXG4gICAgICAgIHRoaXMuX2NoYW5nZURldGVjdG9yUmVmLm1hcmtGb3JDaGVjaygpO1xuICAgICAgfSk7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpOiB2b2lkIHtcbiAgICAvLyBVbnN1YnNjcmliZSBmcm9tIGFsbCBzdWJzY3JpcHRpb25zXG4gICAgdGhpcy5fdW5zdWJzY3JpYmVBbGwubmV4dChudWxsKTtcbiAgICB0aGlzLl91bnN1YnNjcmliZUFsbC5jb21wbGV0ZSgpO1xuICB9XG5cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gQCBQdWJsaWMgbWV0aG9kc1xuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIGNvbGxhcHNlKCk6IHZvaWQge1xuICAgIC8vIFJldHVybiBpZiB0aGUgaXRlbSBpcyBkaXNhYmxlZFxuICAgIGlmICh0aGlzLml0ZW0uZGlzYWJsZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBSZXR1cm4gaWYgdGhlIGl0ZW0gaXMgYWxyZWFkeSBjb2xsYXBzZWRcbiAgICBpZiAodGhpcy5pc0NvbGxhcHNlZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIENvbGxhcHNlIGl0XG4gICAgdGhpcy5pc0NvbGxhcHNlZCA9IHRydWU7XG4gICAgdGhpcy5pc0V4cGFuZGVkID0gIXRoaXMuaXNDb2xsYXBzZWQ7XG5cbiAgICAvLyBNYXJrIGZvciBjaGVja1xuICAgIHRoaXMuX2NoYW5nZURldGVjdG9yUmVmLm1hcmtGb3JDaGVjaygpO1xuXG4gICAgLy8gRXhlY3V0ZSB0aGUgb2JzZXJ2YWJsZVxuICAgIHRoaXMuX3ZlcnRpY2FsTmF2aWdhdGlvbkNvbXBvbmVudC5vbkNvbGxhcHNhYmxlSXRlbUNvbGxhcHNlZC5uZXh0KHRoaXMuaXRlbSk7XG4gIH1cblxuICBleHBhbmQoKTogdm9pZCB7XG4gICAgLy8gUmV0dXJuIGlmIHRoZSBpdGVtIGlzIGRpc2FibGVkXG4gICAgaWYgKHRoaXMuaXRlbS5kaXNhYmxlZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFJldHVybiBpZiB0aGUgaXRlbSBpcyBhbHJlYWR5IGV4cGFuZGVkXG4gICAgaWYgKCF0aGlzLmlzQ29sbGFwc2VkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gRXhwYW5kIGl0XG4gICAgdGhpcy5pc0NvbGxhcHNlZCA9IGZhbHNlO1xuICAgIHRoaXMuaXNFeHBhbmRlZCA9ICF0aGlzLmlzQ29sbGFwc2VkO1xuXG4gICAgLy8gTWFyayBmb3IgY2hlY2tcbiAgICB0aGlzLl9jaGFuZ2VEZXRlY3RvclJlZi5tYXJrRm9yQ2hlY2soKTtcblxuICAgIC8vIEV4ZWN1dGUgdGhlIG9ic2VydmFibGVcbiAgICB0aGlzLl92ZXJ0aWNhbE5hdmlnYXRpb25Db21wb25lbnQub25Db2xsYXBzYWJsZUl0ZW1FeHBhbmRlZC5uZXh0KHRoaXMuaXRlbSk7XG4gIH1cblxuICB0b2dnbGVDb2xsYXBzYWJsZSgpOiB2b2lkIHtcbiAgICAvLyBUb2dnbGUgY29sbGFwc2UvZXhwYW5kXG4gICAgaWYgKHRoaXMuaXNDb2xsYXBzZWQpIHtcbiAgICAgIHRoaXMuZXhwYW5kKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuY29sbGFwc2UoKTtcbiAgICB9XG4gIH1cblxuICB0cmFja0J5Rm4oaW5kZXg6IG51bWJlciwgaXRlbTogYW55KTogYW55IHtcbiAgICByZXR1cm4gaXRlbS5pZCB8fCBpbmRleDtcbiAgfVxuXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIEAgUHJpdmF0ZSBtZXRob2RzXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgcHJpdmF0ZSBfaGFzQWN0aXZlQ2hpbGQoaXRlbTogTmF2aWdhdGlvbkl0ZW0sIGN1cnJlbnRVcmw6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IGNoaWxkcmVuID0gaXRlbS5jaGlsZHJlbjtcblxuICAgIGlmICghY2hpbGRyZW4pIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBmb3IgKGNvbnN0IGNoaWxkIG9mIGNoaWxkcmVuKSB7XG4gICAgICBpZiAoY2hpbGQuY2hpbGRyZW4pIHtcbiAgICAgICAgaWYgKHRoaXMuX2hhc0FjdGl2ZUNoaWxkKGNoaWxkLCBjdXJyZW50VXJsKSkge1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIENoZWNrIGlmIHRoZSBjaGlsZCBoYXMgYSBsaW5rIGFuZCBpcyBhY3RpdmVcbiAgICAgIGlmIChjaGlsZC5saW5rICYmIHRoaXMuX3JvdXRlci5pc0FjdGl2ZShjaGlsZC5saW5rLCBjaGlsZC5leGFjdE1hdGNoIHx8IGZhbHNlKSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBwcml2YXRlIF9pc0NoaWxkcmVuT2YocGFyZW50OiBOYXZpZ2F0aW9uSXRlbSwgaXRlbTogTmF2aWdhdGlvbkl0ZW0pOiBib29sZWFuIHtcbiAgICBjb25zdCBjaGlsZHJlbiA9IHBhcmVudC5jaGlsZHJlbjtcblxuICAgIGlmICghY2hpbGRyZW4pIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAoY2hpbGRyZW4uaW5kZXhPZihpdGVtKSA+IC0xKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBmb3IgKGNvbnN0IGNoaWxkIG9mIGNoaWxkcmVuKSB7XG4gICAgICBpZiAoY2hpbGQuY2hpbGRyZW4pIHtcbiAgICAgICAgaWYgKHRoaXMuX2lzQ2hpbGRyZW5PZihjaGlsZCwgaXRlbSkpIHtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuIiwiPGRpdlxuICBjbGFzcz1cInZlcnRpY2FsLW5hdmlnYXRpb24taXRlbS13cmFwcGVyXCJcbiAgW2NsYXNzLnZlcnRpY2FsLW5hdmlnYXRpb24taXRlbS1oYXMtc3VidGl0bGVdPVwiISFpdGVtLnN1YnRpdGxlXCJcbiAgW25nQ2xhc3NdPVwiaXRlbS5jbGFzc2VzPy53cmFwcGVyXCJcbj5cbiAgPGJ1dHRvblxuICAgIGNsYXNzPVwidmVydGljYWwtbmF2aWdhdGlvbi1pdGVtXCJcbiAgICBbbmdDbGFzc109XCJ7ICd2ZXJ0aWNhbC1uYXZpZ2F0aW9uLWl0ZW0tZGlzYWJsZWQnOiBpdGVtLmRpc2FibGVkIH1cIlxuICAgIChjbGljayk9XCJ0b2dnbGVDb2xsYXBzYWJsZSgpXCJcbiAgPlxuICAgIDwhLS0gSWNvbiAtLT5cbiAgICBAaWYgKGl0ZW0uaWNvbikge1xuICAgICAgPHN2Zy1pY29uXG4gICAgICAgIGNsYXNzPVwidmVydGljYWwtbmF2aWdhdGlvbi1pdGVtLWljb25cIlxuICAgICAgICBbbmdDbGFzc109XCJpdGVtLmNsYXNzZXM/Lmljb25cIlxuICAgICAgICBbbmFtZV09XCJpdGVtLmljb25cIlxuICAgICAgLz5cbiAgICB9XG5cbiAgICA8IS0tIFRpdGxlICYgU3VidGl0bGUgLS0+XG4gICAgPGRpdiBjbGFzcz1cInZlcnRpY2FsLW5hdmlnYXRpb24taXRlbS10aXRsZS13cmFwcGVyXCI+XG4gICAgICA8ZGl2IGNsYXNzPVwidmVydGljYWwtbmF2aWdhdGlvbi1pdGVtLXRpdGxlXCI+XG4gICAgICAgIDxzcGFuIFtuZ0NsYXNzXT1cIml0ZW0uY2xhc3Nlcz8udGl0bGVcIj5cbiAgICAgICAgICB7eyBpdGVtLnRpdGxlIH19XG4gICAgICAgIDwvc3Bhbj5cbiAgICAgIDwvZGl2PlxuICAgICAgQGlmIChpdGVtLnN1YnRpdGxlKSB7XG4gICAgICAgIDxkaXYgY2xhc3M9XCJ2ZXJ0aWNhbC1uYXZpZ2F0aW9uLWl0ZW0tc3VidGl0bGVcIj5cbiAgICAgICAgICA8c3BhbiBbbmdDbGFzc109XCJpdGVtLmNsYXNzZXM/LnN1YnRpdGxlXCI+XG4gICAgICAgICAgICB7eyBpdGVtLnN1YnRpdGxlIH19XG4gICAgICAgICAgPC9zcGFuPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIH1cbiAgICA8L2Rpdj5cblxuICAgIDwhLS0gQmFkZ2UgLS0+XG4gICAgQGlmIChpdGVtLmJhZGdlKSB7XG4gICAgICA8ZGl2IGNsYXNzPVwidmVydGljYWwtbmF2aWdhdGlvbi1pdGVtLWJhZGdlXCI+XG4gICAgICAgIDxkaXZcbiAgICAgICAgICBjbGFzcz1cInZlcnRpY2FsLW5hdmlnYXRpb24taXRlbS1iYWRnZS1jb250ZW50XCJcbiAgICAgICAgICBbbmdDbGFzc109XCJpdGVtLmJhZGdlLmNsYXNzZXNcIlxuICAgICAgICA+XG4gICAgICAgICAge3sgaXRlbS5iYWRnZS50aXRsZSB9fVxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgIH1cblxuICAgIDwhLS0gQXJyb3cgLS0+XG4gICAgPHN2Zy1pY29uXG4gICAgICBjbGFzcz1cInZlcnRpY2FsLW5hdmlnYXRpb24taXRlbS1hcnJvdyBpY29uLXNpemUtNFwiXG4gICAgICBbbmFtZV09XCInaGVyb2ljb25zX3NvbGlkOmNoZXZyb24tcmlnaHQnXCJcbiAgICAvPlxuICA8L2J1dHRvbj5cbjwvZGl2PlxuXG5AaWYgKCFpc0NvbGxhcHNlZCkge1xuICA8ZGl2XG4gICAgY2xhc3M9XCJ2ZXJ0aWNhbC1uYXZpZ2F0aW9uLWl0ZW0tY2hpbGRyZW5cIlxuICAgIEBleHBhbmRDb2xsYXBzZVxuICA+XG4gICAgQGZvciAoaXRlbSBvZiBpdGVtLmNoaWxkcmVuOyB0cmFjayBpdGVtLmlkKSB7XG4gICAgICA8IS0tIFNraXAgdGhlIGhpZGRlbiBpdGVtcyAtLT5cbiAgICAgIEBpZiAoKGl0ZW0uaGlkZGVuICYmICFpdGVtLmhpZGRlbihpdGVtKSkgfHwgIWl0ZW0uaGlkZGVuKSB7XG4gICAgICAgIDwhLS0gQmFzaWMgLS0+XG4gICAgICAgIEBpZiAoaXRlbS50eXBlID09PSAnYmFzaWMnKSB7XG4gICAgICAgICAgPHZlcnRpY2FsLW5hdmlnYXRpb24tYmFzaWMtaXRlbVxuICAgICAgICAgICAgW2l0ZW1dPVwiaXRlbVwiXG4gICAgICAgICAgICBbbmFtZV09XCJuYW1lXCJcbiAgICAgICAgICAvPlxuICAgICAgICB9XG5cbiAgICAgICAgPCEtLSBDb2xsYXBzYWJsZSAtLT5cbiAgICAgICAgQGlmIChpdGVtLnR5cGUgPT09ICdjb2xsYXBzYWJsZScpIHtcbiAgICAgICAgICA8dmVydGljYWwtbmF2aWdhdGlvbi1jb2xsYXBzYWJsZS1pdGVtXG4gICAgICAgICAgICBbaXRlbV09XCJpdGVtXCJcbiAgICAgICAgICAgIFtuYW1lXT1cIm5hbWVcIlxuICAgICAgICAgICAgW2F1dG9Db2xsYXBzZV09XCJhdXRvQ29sbGFwc2VcIlxuICAgICAgICAgIC8+XG4gICAgICAgIH1cblxuICAgICAgICA8IS0tIERpdmlkZXIgLS0+XG4gICAgICAgIEBpZiAoaXRlbS50eXBlID09PSAnZGl2aWRlcicpIHtcbiAgICAgICAgICA8dmVydGljYWwtbmF2aWdhdGlvbi1kaXZpZGVyLWl0ZW1cbiAgICAgICAgICAgIFtpdGVtXT1cIml0ZW1cIlxuICAgICAgICAgICAgW25hbWVdPVwibmFtZVwiXG4gICAgICAgICAgLz5cbiAgICAgICAgfVxuXG4gICAgICAgIDwhLS0gR3JvdXAgLS0+XG4gICAgICAgIEBpZiAoaXRlbS50eXBlID09PSAnZ3JvdXAnKSB7XG4gICAgICAgICAgPHZlcnRpY2FsLW5hdmlnYXRpb24tZ3JvdXAtaXRlbVxuICAgICAgICAgICAgW2l0ZW1dPVwiaXRlbVwiXG4gICAgICAgICAgICBbbmFtZV09XCJuYW1lXCJcbiAgICAgICAgICAvPlxuICAgICAgICB9XG5cbiAgICAgICAgPCEtLSBTcGFjZXIgLS0+XG4gICAgICAgIEBpZiAoaXRlbS50eXBlID09PSAnc3BhY2VyJykge1xuICAgICAgICAgIDx2ZXJ0aWNhbC1uYXZpZ2F0aW9uLXNwYWNlci1pdGVtXG4gICAgICAgICAgICBbaXRlbV09XCJpdGVtXCJcbiAgICAgICAgICAgIFtuYW1lXT1cIm5hbWVcIlxuICAgICAgICAgIC8+XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIDwvZGl2PlxufVxuIl19