import * as i0 from '@angular/core';
import { Injectable, Component, ChangeDetectionStrategy, Input, forwardRef, ViewEncapsulation, HostBinding, EventEmitter, Inject, Output, ViewChild, ViewChildren, HostListener } from '@angular/core';
import { Subject, takeUntil, ReplaySubject, filter, merge } from 'rxjs';
import * as i1 from '@angular/router';
import { RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { NgClass, NgTemplateOutlet, NgIf, NgFor, DOCUMENT } from '@angular/common';
import * as i2 from '@libs/svg-icon';
import { SvgIconModule } from '@libs/svg-icon';
import * as i1$1 from '@angular/animations';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { ScrollbarDirective } from '@libs/scrollbar';
import { takeUntil as takeUntil$1, delay, filter as filter$1 } from 'rxjs/operators';
import * as i3 from '@angular/cdk/overlay';

class UtilsHelper {
    static randomId() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let name = '';
        for (let i = 0; i < 10; i++) {
            name += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return name;
    }
    static exactMatchOptions = {
        paths: 'exact',
        fragment: 'ignored',
        matrixParams: 'ignored',
        queryParams: 'exact',
    };
    static subsetMatchOptions = {
        paths: 'subset',
        fragment: 'ignored',
        matrixParams: 'ignored',
        queryParams: 'subset',
    };
}

class NavigationService {
    _componentRegistry = new Map();
    _navigationStore = new Map();
    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------
    registerComponent(name, component) {
        this._componentRegistry.set(name, component);
    }
    deregisterComponent(name) {
        this._componentRegistry.delete(name);
    }
    getComponent(name) {
        return this._componentRegistry.get(name);
    }
    storeNavigation(key, navigation) {
        this._navigationStore.set(key, navigation);
    }
    getNavigation(key) {
        return this._navigationStore.get(key) ?? [];
    }
    deleteNavigation(key) {
        // Check if the navigation exists
        if (!this._navigationStore.has(key)) {
            console.warn(`Navigation with the key '${key}' does not exist in the store.`);
        }
        // Delete from the storage
        this._navigationStore.delete(key);
    }
    getFlatNavigation(navigation, flatNavigation = []) {
        for (const item of navigation) {
            if (item.type === 'basic') {
                flatNavigation.push(item);
                continue;
            }
            if (item.type === 'aside' || item.type === 'collapsable' || item.type === 'group') {
                if (item.children) {
                    this.getFlatNavigation(item.children, flatNavigation);
                }
            }
        }
        return flatNavigation;
    }
    getItem(id, navigation) {
        for (const item of navigation) {
            if (item.id === id) {
                return item;
            }
            if (item.children) {
                const childItem = this.getItem(id, item.children);
                if (childItem) {
                    return childItem;
                }
            }
        }
        return null;
    }
    getItemParent(id, navigation, parent) {
        for (const item of navigation) {
            if (item.id === id) {
                return parent;
            }
            if (item.children) {
                const childItem = this.getItemParent(id, item.children, item);
                if (childItem) {
                    return childItem;
                }
            }
        }
        return null;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: NavigationService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: NavigationService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: NavigationService, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }] });

class HorizontalNavigationBasicItemComponent {
    _changeDetectorRef;
    _navigationService;
    item;
    name;
    isActiveMatchOptions;
    _horizontalNavigationComponent;
    _unsubscribeAll = new Subject();
    constructor(_changeDetectorRef, _navigationService) {
        this._changeDetectorRef = _changeDetectorRef;
        this._navigationService = _navigationService;
        // Set the equivalent of {exact: false} as default for active match options.
        // We are not assigning the item.isActiveMatchOptions directly to the
        // [routerLinkActiveOptions] because if it's "undefined" initially, the router
        // will throw an error and stop working.
        this.isActiveMatchOptions = UtilsHelper.subsetMatchOptions;
    }
    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------
    ngOnInit() {
        // Set the "isActiveMatchOptions" either from item's
        // "isActiveMatchOptions" or the equivalent form of
        // item's "exactMatch" option
        this.isActiveMatchOptions =
            (this.item.isActiveMatchOptions ?? this.item.exactMatch)
                ? UtilsHelper.exactMatchOptions
                : UtilsHelper.subsetMatchOptions;
        // Get the parent navigation component
        this._horizontalNavigationComponent = this._navigationService.getComponent(this.name);
        // Mark for check
        this._changeDetectorRef.markForCheck();
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
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: HorizontalNavigationBasicItemComponent, deps: [{ token: i0.ChangeDetectorRef }, { token: NavigationService }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "18.2.8", type: HorizontalNavigationBasicItemComponent, isStandalone: true, selector: "horizontal-navigation-basic-item", inputs: { item: "item", name: "name" }, ngImport: i0, template: "<!-- Item wrapper -->\n<div\n  class=\"horizontal-navigation-item-wrapper\"\n  [class.horizontal-navigation-item-has-subtitle]=\"!!item.subtitle\"\n  [ngClass]=\"item.classes?.wrapper\"\n>\n  <!-- Item with an internal link -->\n  @if (item.link && !item.externalLink && !item.function && !item.disabled) {\n    <div\n      class=\"horizontal-navigation-item\"\n      [ngClass]=\"{ 'horizontal-navigation-item-active-forced': item.active }\"\n      [routerLink]=\"[item.link]\"\n      [fragment]=\"item.fragment\"\n      [preserveFragment]=\"item.preserveFragment ?? false\"\n      [queryParams]=\"item.queryParams\"\n      [queryParamsHandling]=\"item.queryParamsHandling\"\n      [routerLinkActive]=\"'horizontal-navigation-item-active'\"\n      [routerLinkActiveOptions]=\"isActiveMatchOptions\"\n    >\n      <ng-container *ngTemplateOutlet=\"itemTemplate\" />\n    </div>\n  }\n\n  <!-- Item with an external link -->\n  @if (item.link && item.externalLink && !item.function && !item.disabled) {\n    <a\n      class=\"horizontal-navigation-item\"\n      [href]=\"item.link\"\n      [target]=\"item.target || '_self'\"\n    >\n      <ng-container *ngTemplateOutlet=\"itemTemplate\" />\n    </a>\n  }\n\n  <!-- Item with a function -->\n  @if (!item.link && item.function && !item.disabled) {\n    <button\n      class=\"horizontal-navigation-item\"\n      [ngClass]=\"{ 'horizontal-navigation-item-active-forced': item.active }\"\n      (click)=\"item.function(item)\"\n    >\n      <ng-container *ngTemplateOutlet=\"itemTemplate\" />\n    </button>\n  }\n\n  <!-- Item with an internal link and function -->\n  @if (item.link && !item.externalLink && item.function && !item.disabled) {\n    <button\n      class=\"horizontal-navigation-item\"\n      [ngClass]=\"{ 'horizontal-navigation-item-active-forced': item.active }\"\n      [routerLink]=\"[item.link]\"\n      [fragment]=\"item.fragment\"\n      [preserveFragment]=\"item.preserveFragment ?? false\"\n      [queryParams]=\"item.queryParams\"\n      [queryParamsHandling]=\"item.queryParamsHandling\"\n      [routerLinkActive]=\"'horizontal-navigation-item-active'\"\n      [routerLinkActiveOptions]=\"isActiveMatchOptions\"\n      (click)=\"item.function(item)\"\n    >\n      <ng-container *ngTemplateOutlet=\"itemTemplate\" />\n    </button>\n  }\n\n  <!-- Item with an external link and function -->\n  @if (item.link && item.externalLink && item.function && !item.disabled) {\n    <a\n      class=\"horizontal-navigation-item\"\n      [href]=\"item.link\"\n      [target]=\"item.target || '_self'\"\n      (click)=\"item.function(item)\"\n    >\n      <ng-container *ngTemplateOutlet=\"itemTemplate\" />\n    </a>\n  }\n\n  <!-- Item with a no link and no function -->\n  @if (!item.link && !item.function && !item.disabled) {\n    <div\n      class=\"horizontal-navigation-item\"\n      [ngClass]=\"{ 'horizontal-navigation-item-active-forced': item.active }\"\n    >\n      <ng-container *ngTemplateOutlet=\"itemTemplate\" />\n    </div>\n  }\n\n  <!-- Item is disabled -->\n  @if (item.disabled) {\n    <div class=\"horizontal-navigation-item horizontal-navigation-item-disabled\">\n      <ng-container *ngTemplateOutlet=\"itemTemplate\" />\n    </div>\n  }\n</div>\n\n<!-- Item template -->\n<ng-template #itemTemplate>\n  <!-- Icon -->\n  @if (item.icon) {\n    <svg-icon\n      class=\"horizontal-navigation-item-icon\"\n      [ngClass]=\"item.classes?.icon\"\n      [name]=\"item.icon\"\n    />\n  }\n\n  <!-- Title & Subtitle -->\n  <div class=\"horizontal-navigation-item-title-wrapper\">\n    <div class=\"horizontal-navigation-item-title\">\n      <span [ngClass]=\"item.classes?.title\">\n        {{ item.title }}\n      </span>\n    </div>\n    @if (item.subtitle) {\n      <div class=\"horizontal-navigation-item-subtitle text-hint\">\n        <span [ngClass]=\"item.classes?.subtitle\">\n          {{ item.subtitle }}\n        </span>\n      </div>\n    }\n  </div>\n\n  <!-- Badge -->\n  @if (item.badge) {\n    <div class=\"horizontal-navigation-item-badge\">\n      <div\n        class=\"horizontal-navigation-item-badge-content\"\n        [ngClass]=\"item.badge.classes\"\n      >\n        {{ item.badge.title }}\n      </div>\n    </div>\n  }\n</ng-template>\n", dependencies: [{ kind: "directive", type: NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }, { kind: "directive", type: NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet", "ngTemplateOutletInjector"] }, { kind: "directive", type: RouterLink, selector: "[routerLink]", inputs: ["target", "queryParams", "fragment", "queryParamsHandling", "state", "info", "relativeTo", "preserveFragment", "skipLocationChange", "replaceUrl", "routerLink"] }, { kind: "directive", type: RouterLinkActive, selector: "[routerLinkActive]", inputs: ["routerLinkActiveOptions", "ariaCurrentWhenActive", "routerLinkActive"], outputs: ["isActiveChange"], exportAs: ["routerLinkActive"] }, { kind: "ngmodule", type: SvgIconModule }, { kind: "component", type: i2.SvgIcon, selector: "svg-icon", inputs: ["inline", "name", "fontSet", "fontIcon"], exportAs: ["svgIcon"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: HorizontalNavigationBasicItemComponent, decorators: [{
            type: Component,
            args: [{ selector: 'horizontal-navigation-basic-item', changeDetection: ChangeDetectionStrategy.OnPush, standalone: true, imports: [NgClass, NgTemplateOutlet, RouterLink, RouterLinkActive, SvgIconModule], template: "<!-- Item wrapper -->\n<div\n  class=\"horizontal-navigation-item-wrapper\"\n  [class.horizontal-navigation-item-has-subtitle]=\"!!item.subtitle\"\n  [ngClass]=\"item.classes?.wrapper\"\n>\n  <!-- Item with an internal link -->\n  @if (item.link && !item.externalLink && !item.function && !item.disabled) {\n    <div\n      class=\"horizontal-navigation-item\"\n      [ngClass]=\"{ 'horizontal-navigation-item-active-forced': item.active }\"\n      [routerLink]=\"[item.link]\"\n      [fragment]=\"item.fragment\"\n      [preserveFragment]=\"item.preserveFragment ?? false\"\n      [queryParams]=\"item.queryParams\"\n      [queryParamsHandling]=\"item.queryParamsHandling\"\n      [routerLinkActive]=\"'horizontal-navigation-item-active'\"\n      [routerLinkActiveOptions]=\"isActiveMatchOptions\"\n    >\n      <ng-container *ngTemplateOutlet=\"itemTemplate\" />\n    </div>\n  }\n\n  <!-- Item with an external link -->\n  @if (item.link && item.externalLink && !item.function && !item.disabled) {\n    <a\n      class=\"horizontal-navigation-item\"\n      [href]=\"item.link\"\n      [target]=\"item.target || '_self'\"\n    >\n      <ng-container *ngTemplateOutlet=\"itemTemplate\" />\n    </a>\n  }\n\n  <!-- Item with a function -->\n  @if (!item.link && item.function && !item.disabled) {\n    <button\n      class=\"horizontal-navigation-item\"\n      [ngClass]=\"{ 'horizontal-navigation-item-active-forced': item.active }\"\n      (click)=\"item.function(item)\"\n    >\n      <ng-container *ngTemplateOutlet=\"itemTemplate\" />\n    </button>\n  }\n\n  <!-- Item with an internal link and function -->\n  @if (item.link && !item.externalLink && item.function && !item.disabled) {\n    <button\n      class=\"horizontal-navigation-item\"\n      [ngClass]=\"{ 'horizontal-navigation-item-active-forced': item.active }\"\n      [routerLink]=\"[item.link]\"\n      [fragment]=\"item.fragment\"\n      [preserveFragment]=\"item.preserveFragment ?? false\"\n      [queryParams]=\"item.queryParams\"\n      [queryParamsHandling]=\"item.queryParamsHandling\"\n      [routerLinkActive]=\"'horizontal-navigation-item-active'\"\n      [routerLinkActiveOptions]=\"isActiveMatchOptions\"\n      (click)=\"item.function(item)\"\n    >\n      <ng-container *ngTemplateOutlet=\"itemTemplate\" />\n    </button>\n  }\n\n  <!-- Item with an external link and function -->\n  @if (item.link && item.externalLink && item.function && !item.disabled) {\n    <a\n      class=\"horizontal-navigation-item\"\n      [href]=\"item.link\"\n      [target]=\"item.target || '_self'\"\n      (click)=\"item.function(item)\"\n    >\n      <ng-container *ngTemplateOutlet=\"itemTemplate\" />\n    </a>\n  }\n\n  <!-- Item with a no link and no function -->\n  @if (!item.link && !item.function && !item.disabled) {\n    <div\n      class=\"horizontal-navigation-item\"\n      [ngClass]=\"{ 'horizontal-navigation-item-active-forced': item.active }\"\n    >\n      <ng-container *ngTemplateOutlet=\"itemTemplate\" />\n    </div>\n  }\n\n  <!-- Item is disabled -->\n  @if (item.disabled) {\n    <div class=\"horizontal-navigation-item horizontal-navigation-item-disabled\">\n      <ng-container *ngTemplateOutlet=\"itemTemplate\" />\n    </div>\n  }\n</div>\n\n<!-- Item template -->\n<ng-template #itemTemplate>\n  <!-- Icon -->\n  @if (item.icon) {\n    <svg-icon\n      class=\"horizontal-navigation-item-icon\"\n      [ngClass]=\"item.classes?.icon\"\n      [name]=\"item.icon\"\n    />\n  }\n\n  <!-- Title & Subtitle -->\n  <div class=\"horizontal-navigation-item-title-wrapper\">\n    <div class=\"horizontal-navigation-item-title\">\n      <span [ngClass]=\"item.classes?.title\">\n        {{ item.title }}\n      </span>\n    </div>\n    @if (item.subtitle) {\n      <div class=\"horizontal-navigation-item-subtitle text-hint\">\n        <span [ngClass]=\"item.classes?.subtitle\">\n          {{ item.subtitle }}\n        </span>\n      </div>\n    }\n  </div>\n\n  <!-- Badge -->\n  @if (item.badge) {\n    <div class=\"horizontal-navigation-item-badge\">\n      <div\n        class=\"horizontal-navigation-item-badge-content\"\n        [ngClass]=\"item.badge.classes\"\n      >\n        {{ item.badge.title }}\n      </div>\n    </div>\n  }\n</ng-template>\n" }]
        }], ctorParameters: () => [{ type: i0.ChangeDetectorRef }, { type: NavigationService }], propDecorators: { item: [{
                type: Input
            }], name: [{
                type: Input
            }] } });

class HorizontalNavigationDividerItemComponent {
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
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: HorizontalNavigationDividerItemComponent, deps: [{ token: i0.ChangeDetectorRef }, { token: NavigationService }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "18.2.8", type: HorizontalNavigationDividerItemComponent, isStandalone: true, selector: "horizontal-navigation-divider-item", inputs: { item: "item", name: "name" }, ngImport: i0, template: "<div\n  class=\"horizontal-navigation-item-wrapper divider\"\n  [ngClass]=\"item.classes?.wrapper\"\n></div>\n", dependencies: [{ kind: "directive", type: NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: HorizontalNavigationDividerItemComponent, decorators: [{
            type: Component,
            args: [{ selector: 'horizontal-navigation-divider-item', changeDetection: ChangeDetectionStrategy.OnPush, standalone: true, imports: [NgClass], template: "<div\n  class=\"horizontal-navigation-item-wrapper divider\"\n  [ngClass]=\"item.classes?.wrapper\"\n></div>\n" }]
        }], ctorParameters: () => [{ type: i0.ChangeDetectorRef }, { type: NavigationService }], propDecorators: { item: [{
                type: Input
            }], name: [{
                type: Input
            }] } });

class HorizontalNavigationBranchItemComponent {
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
        this._horizontalNavigationComponent.onRefreshed.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
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
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: HorizontalNavigationBranchItemComponent, deps: [{ token: i0.ChangeDetectorRef }, { token: NavigationService }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "18.2.8", type: HorizontalNavigationBranchItemComponent, isStandalone: true, selector: "horizontal-navigation-branch-item", inputs: { child: "child", item: "item", name: "name" }, ngImport: i0, template: "@if (!child) {\n  <div class=\"dropdown dropdown-bottom\">\n    <div\n      tabindex=\"0\"\n      [ngClass]=\"{\n        'horizontal-navigation-menu-active-forced': item.active,\n      }\"\n    >\n      <ng-container *ngTemplateOutlet=\"itemTemplate; context: { $implicit: item }\" />\n    </div>\n\n    <div\n      tabindex=\"0\"\n      class=\"dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box min-w-52\"\n    >\n      @for (item of item.children; track item.id) {\n        <!-- Skip the hidden items -->\n        @if ((item.hidden && !item.hidden(item)) || !item.hidden) {\n          <!-- Basic -->\n          @if (item.type === 'basic') {\n            <div\n              class=\"horizontal-navigation-menu-item\"\n              mat-menu-item\n            >\n              <horizontal-navigation-basic-item\n                [item]=\"item\"\n                [name]=\"name\"\n              />\n            </div>\n          }\n\n          <!-- Branch: aside, collapsable, group -->\n          <!-- @if (item.type === 'aside' || item.type === 'collapsable' || item.type === 'group') {\n            <div\n              class=\"horizontal-navigation-menu-item\"\n              [disabled]=\"item.disabled\"\n              [matMenuTriggerFor]=\"branch.matMenu\"\n              mat-menu-item>\n              <ng-container *ngTemplateOutlet=\"itemTemplate; context: {$implicit: item}\">}\n              <horizontal-navigation-branch-item\n                [child]=\"true\"\n                [item]=\"item\"\n                [name]=\"name\"\n                #branch></horizontal-navigation-branch-item>\n            </div>\n          } -->\n\n          <!-- Divider -->\n          @if (item.type === 'divider') {\n            <div\n              class=\"horizontal-navigation-menu-item\"\n              mat-menu-item\n            >\n              <horizontal-navigation-divider-item\n                [item]=\"item\"\n                [name]=\"name\"\n              />\n            </div>\n          }\n        }\n      }\n    </div>\n  </div>\n}\n\n<!-- Item template -->\n<ng-template\n  #itemTemplate\n  let-item\n>\n  <div\n    class=\"horizontal-navigation-item-wrapper\"\n    [class.horizontal-navigation-item-has-subtitle]=\"!!item.subtitle\"\n    [ngClass]=\"item.classes?.wrapper\"\n  >\n    <div\n      class=\"horizontal-navigation-item\"\n      [ngClass]=\"{\n        'horizontal-navigation-item-disabled': item.disabled,\n        'horizontal-navigation-item-active-forced': item.active,\n      }\"\n    >\n      <!-- Icon -->\n      @if (item.icon) {\n        <svg-icon\n          class=\"horizontal-navigation-item-icon\"\n          [ngClass]=\"item.classes?.icon\"\n          [name]=\"item.icon\"\n        />\n      }\n\n      <!-- Title & Subtitle -->\n      <div class=\"horizontal-navigation-item-title-wrapper\">\n        <div class=\"horizontal-navigation-item-title\">\n          <span [ngClass]=\"item.classes?.title\">\n            {{ item.title }}\n          </span>\n        </div>\n        @if (item.subtitle) {\n          <div class=\"horizontal-navigation-item-subtitle text-hint\">\n            <span [ngClass]=\"item.classes?.subtitle\">\n              {{ item.subtitle }}\n            </span>\n          </div>\n        }\n      </div>\n\n      <!-- Badge -->\n      @if (item.badge) {\n        <div class=\"horizontal-navigation-item-badge\">\n          <div\n            class=\"horizontal-navigation-item-badge-content\"\n            [ngClass]=\"item.badge.classes\"\n          >\n            {{ item.badge.title }}\n          </div>\n        </div>\n      }\n    </div>\n  </div>\n</ng-template>\n", dependencies: [{ kind: "directive", type: i0.forwardRef(() => NgClass), selector: "[ngClass]", inputs: ["class", "ngClass"] }, { kind: "directive", type: i0.forwardRef(() => NgTemplateOutlet), selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet", "ngTemplateOutletInjector"] }, { kind: "ngmodule", type: i0.forwardRef(() => SvgIconModule) }, { kind: "component", type: i0.forwardRef(() => i2.SvgIcon), selector: "svg-icon", inputs: ["inline", "name", "fontSet", "fontIcon"], exportAs: ["svgIcon"] }, { kind: "component", type: i0.forwardRef(() => HorizontalNavigationBasicItemComponent), selector: "horizontal-navigation-basic-item", inputs: ["item", "name"] }, { kind: "component", type: i0.forwardRef(() => HorizontalNavigationDividerItemComponent), selector: "horizontal-navigation-divider-item", inputs: ["item", "name"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: HorizontalNavigationBranchItemComponent, decorators: [{
            type: Component,
            args: [{ selector: 'horizontal-navigation-branch-item', changeDetection: ChangeDetectionStrategy.OnPush, standalone: true, imports: [
                        NgIf, NgClass, NgTemplateOutlet, NgFor,
                        SvgIconModule,
                        HorizontalNavigationBasicItemComponent,
                        HorizontalNavigationDividerItemComponent,
                        forwardRef(() => HorizontalNavigationBranchItemComponent),
                    ], template: "@if (!child) {\n  <div class=\"dropdown dropdown-bottom\">\n    <div\n      tabindex=\"0\"\n      [ngClass]=\"{\n        'horizontal-navigation-menu-active-forced': item.active,\n      }\"\n    >\n      <ng-container *ngTemplateOutlet=\"itemTemplate; context: { $implicit: item }\" />\n    </div>\n\n    <div\n      tabindex=\"0\"\n      class=\"dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box min-w-52\"\n    >\n      @for (item of item.children; track item.id) {\n        <!-- Skip the hidden items -->\n        @if ((item.hidden && !item.hidden(item)) || !item.hidden) {\n          <!-- Basic -->\n          @if (item.type === 'basic') {\n            <div\n              class=\"horizontal-navigation-menu-item\"\n              mat-menu-item\n            >\n              <horizontal-navigation-basic-item\n                [item]=\"item\"\n                [name]=\"name\"\n              />\n            </div>\n          }\n\n          <!-- Branch: aside, collapsable, group -->\n          <!-- @if (item.type === 'aside' || item.type === 'collapsable' || item.type === 'group') {\n            <div\n              class=\"horizontal-navigation-menu-item\"\n              [disabled]=\"item.disabled\"\n              [matMenuTriggerFor]=\"branch.matMenu\"\n              mat-menu-item>\n              <ng-container *ngTemplateOutlet=\"itemTemplate; context: {$implicit: item}\">}\n              <horizontal-navigation-branch-item\n                [child]=\"true\"\n                [item]=\"item\"\n                [name]=\"name\"\n                #branch></horizontal-navigation-branch-item>\n            </div>\n          } -->\n\n          <!-- Divider -->\n          @if (item.type === 'divider') {\n            <div\n              class=\"horizontal-navigation-menu-item\"\n              mat-menu-item\n            >\n              <horizontal-navigation-divider-item\n                [item]=\"item\"\n                [name]=\"name\"\n              />\n            </div>\n          }\n        }\n      }\n    </div>\n  </div>\n}\n\n<!-- Item template -->\n<ng-template\n  #itemTemplate\n  let-item\n>\n  <div\n    class=\"horizontal-navigation-item-wrapper\"\n    [class.horizontal-navigation-item-has-subtitle]=\"!!item.subtitle\"\n    [ngClass]=\"item.classes?.wrapper\"\n  >\n    <div\n      class=\"horizontal-navigation-item\"\n      [ngClass]=\"{\n        'horizontal-navigation-item-disabled': item.disabled,\n        'horizontal-navigation-item-active-forced': item.active,\n      }\"\n    >\n      <!-- Icon -->\n      @if (item.icon) {\n        <svg-icon\n          class=\"horizontal-navigation-item-icon\"\n          [ngClass]=\"item.classes?.icon\"\n          [name]=\"item.icon\"\n        />\n      }\n\n      <!-- Title & Subtitle -->\n      <div class=\"horizontal-navigation-item-title-wrapper\">\n        <div class=\"horizontal-navigation-item-title\">\n          <span [ngClass]=\"item.classes?.title\">\n            {{ item.title }}\n          </span>\n        </div>\n        @if (item.subtitle) {\n          <div class=\"horizontal-navigation-item-subtitle text-hint\">\n            <span [ngClass]=\"item.classes?.subtitle\">\n              {{ item.subtitle }}\n            </span>\n          </div>\n        }\n      </div>\n\n      <!-- Badge -->\n      @if (item.badge) {\n        <div class=\"horizontal-navigation-item-badge\">\n          <div\n            class=\"horizontal-navigation-item-badge-content\"\n            [ngClass]=\"item.badge.classes\"\n          >\n            {{ item.badge.title }}\n          </div>\n        </div>\n      }\n    </div>\n  </div>\n</ng-template>\n" }]
        }], ctorParameters: () => [{ type: i0.ChangeDetectorRef }, { type: NavigationService }], propDecorators: { child: [{
                type: Input
            }], item: [{
                type: Input
            }], name: [{
                type: Input
            }] } });

class HorizontalNavigationSpacerItemComponent {
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
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: HorizontalNavigationSpacerItemComponent, deps: [{ token: i0.ChangeDetectorRef }, { token: NavigationService }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "18.2.8", type: HorizontalNavigationSpacerItemComponent, isStandalone: true, selector: "horizontal-navigation-spacer-item", inputs: { item: "item", name: "name" }, ngImport: i0, template: "<div\n  class=\"horizontal-navigation-item-wrapper\"\n  [ngClass]=\"item.classes?.wrapper\"\n></div>\n", dependencies: [{ kind: "directive", type: NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: HorizontalNavigationSpacerItemComponent, decorators: [{
            type: Component,
            args: [{ selector: 'horizontal-navigation-spacer-item', changeDetection: ChangeDetectionStrategy.OnPush, standalone: true, imports: [NgClass], template: "<div\n  class=\"horizontal-navigation-item-wrapper\"\n  [ngClass]=\"item.classes?.wrapper\"\n></div>\n" }]
        }], ctorParameters: () => [{ type: i0.ChangeDetectorRef }, { type: NavigationService }], propDecorators: { item: [{
                type: Input
            }], name: [{
                type: Input
            }] } });

class HorizontalNavigationComponent {
    _changeDetectorRef;
    _navigationService;
    name = UtilsHelper.randomId();
    navigation;
    onRefreshed = new ReplaySubject(1);
    _unsubscribeAll = new Subject();
    /**
     * Constructor
     */
    constructor(_changeDetectorRef, _navigationService) {
        this._changeDetectorRef = _changeDetectorRef;
        this._navigationService = _navigationService;
    }
    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------
    ngOnChanges(changes) {
        // Navigation
        if ('navigation' in changes) {
            // Mark for check
            this._changeDetectorRef.markForCheck();
        }
    }
    ngOnInit() {
        // Make sure the name input is not an empty string
        if (this.name === '') {
            this.name = UtilsHelper.randomId();
        }
        // Register the navigation component
        this._navigationService.registerComponent(this.name, this);
    }
    ngOnDestroy() {
        // Deregister the navigation component from the registry
        this._navigationService.deregisterComponent(this.name);
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }
    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------
    refresh() {
        this._changeDetectorRef.markForCheck();
        this.onRefreshed.next(true);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: HorizontalNavigationComponent, deps: [{ token: i0.ChangeDetectorRef }, { token: NavigationService }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "18.2.8", type: HorizontalNavigationComponent, isStandalone: true, selector: "horizontal-navigation", inputs: { name: "name", navigation: "navigation" }, exportAs: ["horizontalNavigation"], usesOnChanges: true, ngImport: i0, template: "<div class=\"horizontal-navigation-wrapper\">\n  @for (item of navigation; track item.id) {\n    <!-- Skip the hidden items -->\n    @if ((item.hidden && !item.hidden(item)) || !item.hidden) {\n      <!-- Basic -->\n      @if (item.type === 'basic') {\n        <horizontal-navigation-basic-item\n          class=\"horizontal-navigation-menu-item\"\n          [item]=\"item\"\n          [name]=\"name\"\n        />\n      }\n\n      <!-- Branch: aside, collapsable, group -->\n      @if (item.type === 'aside' || item.type === 'collapsable' || item.type === 'group') {\n        <horizontal-navigation-branch-item\n          class=\"horizontal-navigation-menu-item\"\n          [item]=\"item\"\n          [name]=\"name\"\n        />\n      }\n\n      <!-- Spacer -->\n      @if (item.type === 'spacer') {\n        <horizontal-navigation-spacer-item\n          class=\"horizontal-navigation-menu-item\"\n          [item]=\"item\"\n          [name]=\"name\"\n        />\n      }\n    }\n  }\n</div>\n", styles: ["horizontal-navigation .horizontal-navigation-wrapper{display:flex;align-items:center}horizontal-navigation .horizontal-navigation-wrapper horizontal-navigation-basic-item .horizontal-navigation-item-wrapper,horizontal-navigation .horizontal-navigation-wrapper horizontal-navigation-branch-item .horizontal-navigation-item-wrapper{border-radius:4px;overflow:hidden}horizontal-navigation .horizontal-navigation-wrapper horizontal-navigation-basic-item .horizontal-navigation-item-wrapper .horizontal-navigation-item,horizontal-navigation .horizontal-navigation-wrapper horizontal-navigation-branch-item .horizontal-navigation-item-wrapper .horizontal-navigation-item{padding:0 16px;cursor:pointer;-webkit-user-select:none;user-select:none}horizontal-navigation .horizontal-navigation-wrapper horizontal-navigation-basic-item .horizontal-navigation-item-wrapper .horizontal-navigation-item .horizontal-navigation-item-icon,horizontal-navigation .horizontal-navigation-wrapper horizontal-navigation-branch-item .horizontal-navigation-item-wrapper .horizontal-navigation-item .horizontal-navigation-item-icon{margin-right:12px}horizontal-navigation .horizontal-navigation-wrapper horizontal-navigation-basic-item .horizontal-navigation-item-active .horizontal-navigation-item-title,horizontal-navigation .horizontal-navigation-wrapper horizontal-navigation-basic-item .horizontal-navigation-item-active-forced .horizontal-navigation-item-title{color:var(--fallback-p, oklch(var(--p)))!important}horizontal-navigation .horizontal-navigation-wrapper horizontal-navigation-basic-item .horizontal-navigation-item-active .horizontal-navigation-item-subtitle,horizontal-navigation .horizontal-navigation-wrapper horizontal-navigation-basic-item .horizontal-navigation-item-active-forced .horizontal-navigation-item-subtitle{color:var(--fallback-p, oklch(var(--p)))!important}horizontal-navigation .horizontal-navigation-wrapper horizontal-navigation-basic-item .horizontal-navigation-item-active .horizontal-navigation-item-icon,horizontal-navigation .horizontal-navigation-wrapper horizontal-navigation-basic-item .horizontal-navigation-item-active-forced .horizontal-navigation-item-icon{color:var(--fallback-p, oklch(var(--p)))!important}horizontal-navigation .horizontal-navigation-wrapper horizontal-navigation-spacer-item{margin:12px 0}.horizontal-navigation-menu-panel .horizontal-navigation-menu-item{height:auto;min-height:0;line-height:normal;white-space:normal}.horizontal-navigation-menu-panel .horizontal-navigation-menu-item horizontal-navigation-basic-item,.horizontal-navigation-menu-panel .horizontal-navigation-menu-item horizontal-navigation-branch-item,.horizontal-navigation-menu-panel .horizontal-navigation-menu-item horizontal-navigation-divider-item{display:flex;flex:1 1 auto}.horizontal-navigation-menu-panel .horizontal-navigation-menu-item horizontal-navigation-divider-item{margin:8px -16px}.horizontal-navigation-menu-panel .horizontal-navigation-menu-item horizontal-navigation-divider-item .horizontal-navigation-item-wrapper{height:1px;box-shadow:0 1px}.horizontal-navigation-menu-item horizontal-navigation-basic-item .horizontal-navigation-item-active .horizontal-navigation-item-title,.horizontal-navigation-menu-item horizontal-navigation-basic-item .horizontal-navigation-item-active-forced .horizontal-navigation-item-title{color:var(--fallback-p, oklch(var(--p)))!important}.horizontal-navigation-menu-item horizontal-navigation-basic-item .horizontal-navigation-item-active .horizontal-navigation-item-subtitle,.horizontal-navigation-menu-item horizontal-navigation-basic-item .horizontal-navigation-item-active-forced .horizontal-navigation-item-subtitle{color:var(--fallback-p, oklch(var(--p)))!important}.horizontal-navigation-menu-item horizontal-navigation-basic-item .horizontal-navigation-item-active .horizontal-navigation-item-icon,.horizontal-navigation-menu-item horizontal-navigation-basic-item .horizontal-navigation-item-active-forced .horizontal-navigation-item-icon{color:var(--fallback-p, oklch(var(--p)))!important}.horizontal-navigation-menu-item .horizontal-navigation-item-wrapper{width:100%}.horizontal-navigation-menu-item .horizontal-navigation-item-wrapper.horizontal-navigation-item-has-subtitle .horizontal-navigation-item{min-height:56px}.horizontal-navigation-menu-item .horizontal-navigation-item-wrapper .horizontal-navigation-item{position:relative;display:flex;align-items:center;justify-content:flex-start;min-height:48px;width:100%;font-size:13px;font-weight:500;text-decoration:none}.horizontal-navigation-menu-item .horizontal-navigation-item-wrapper .horizontal-navigation-item .horizontal-navigation-item-title-wrapper .horizontal-navigation-item-subtitle{font-size:10px}.horizontal-navigation-menu-item .horizontal-navigation-item-wrapper .horizontal-navigation-item .horizontal-navigation-item-badge{margin-left:auto}.horizontal-navigation-menu-item .horizontal-navigation-item-wrapper .horizontal-navigation-item .horizontal-navigation-item-badge .horizontal-navigation-item-badge-content{display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:600;white-space:nowrap;height:20px}\n"], dependencies: [{ kind: "component", type: HorizontalNavigationBasicItemComponent, selector: "horizontal-navigation-basic-item", inputs: ["item", "name"] }, { kind: "component", type: HorizontalNavigationBranchItemComponent, selector: "horizontal-navigation-branch-item", inputs: ["child", "item", "name"] }, { kind: "component", type: HorizontalNavigationSpacerItemComponent, selector: "horizontal-navigation-spacer-item", inputs: ["item", "name"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: HorizontalNavigationComponent, decorators: [{
            type: Component,
            args: [{ selector: 'horizontal-navigation', encapsulation: ViewEncapsulation.None, changeDetection: ChangeDetectionStrategy.OnPush, exportAs: 'horizontalNavigation', standalone: true, imports: [
                        HorizontalNavigationBasicItemComponent,
                        HorizontalNavigationBranchItemComponent,
                        HorizontalNavigationSpacerItemComponent,
                    ], template: "<div class=\"horizontal-navigation-wrapper\">\n  @for (item of navigation; track item.id) {\n    <!-- Skip the hidden items -->\n    @if ((item.hidden && !item.hidden(item)) || !item.hidden) {\n      <!-- Basic -->\n      @if (item.type === 'basic') {\n        <horizontal-navigation-basic-item\n          class=\"horizontal-navigation-menu-item\"\n          [item]=\"item\"\n          [name]=\"name\"\n        />\n      }\n\n      <!-- Branch: aside, collapsable, group -->\n      @if (item.type === 'aside' || item.type === 'collapsable' || item.type === 'group') {\n        <horizontal-navigation-branch-item\n          class=\"horizontal-navigation-menu-item\"\n          [item]=\"item\"\n          [name]=\"name\"\n        />\n      }\n\n      <!-- Spacer -->\n      @if (item.type === 'spacer') {\n        <horizontal-navigation-spacer-item\n          class=\"horizontal-navigation-menu-item\"\n          [item]=\"item\"\n          [name]=\"name\"\n        />\n      }\n    }\n  }\n</div>\n", styles: ["horizontal-navigation .horizontal-navigation-wrapper{display:flex;align-items:center}horizontal-navigation .horizontal-navigation-wrapper horizontal-navigation-basic-item .horizontal-navigation-item-wrapper,horizontal-navigation .horizontal-navigation-wrapper horizontal-navigation-branch-item .horizontal-navigation-item-wrapper{border-radius:4px;overflow:hidden}horizontal-navigation .horizontal-navigation-wrapper horizontal-navigation-basic-item .horizontal-navigation-item-wrapper .horizontal-navigation-item,horizontal-navigation .horizontal-navigation-wrapper horizontal-navigation-branch-item .horizontal-navigation-item-wrapper .horizontal-navigation-item{padding:0 16px;cursor:pointer;-webkit-user-select:none;user-select:none}horizontal-navigation .horizontal-navigation-wrapper horizontal-navigation-basic-item .horizontal-navigation-item-wrapper .horizontal-navigation-item .horizontal-navigation-item-icon,horizontal-navigation .horizontal-navigation-wrapper horizontal-navigation-branch-item .horizontal-navigation-item-wrapper .horizontal-navigation-item .horizontal-navigation-item-icon{margin-right:12px}horizontal-navigation .horizontal-navigation-wrapper horizontal-navigation-basic-item .horizontal-navigation-item-active .horizontal-navigation-item-title,horizontal-navigation .horizontal-navigation-wrapper horizontal-navigation-basic-item .horizontal-navigation-item-active-forced .horizontal-navigation-item-title{color:var(--fallback-p, oklch(var(--p)))!important}horizontal-navigation .horizontal-navigation-wrapper horizontal-navigation-basic-item .horizontal-navigation-item-active .horizontal-navigation-item-subtitle,horizontal-navigation .horizontal-navigation-wrapper horizontal-navigation-basic-item .horizontal-navigation-item-active-forced .horizontal-navigation-item-subtitle{color:var(--fallback-p, oklch(var(--p)))!important}horizontal-navigation .horizontal-navigation-wrapper horizontal-navigation-basic-item .horizontal-navigation-item-active .horizontal-navigation-item-icon,horizontal-navigation .horizontal-navigation-wrapper horizontal-navigation-basic-item .horizontal-navigation-item-active-forced .horizontal-navigation-item-icon{color:var(--fallback-p, oklch(var(--p)))!important}horizontal-navigation .horizontal-navigation-wrapper horizontal-navigation-spacer-item{margin:12px 0}.horizontal-navigation-menu-panel .horizontal-navigation-menu-item{height:auto;min-height:0;line-height:normal;white-space:normal}.horizontal-navigation-menu-panel .horizontal-navigation-menu-item horizontal-navigation-basic-item,.horizontal-navigation-menu-panel .horizontal-navigation-menu-item horizontal-navigation-branch-item,.horizontal-navigation-menu-panel .horizontal-navigation-menu-item horizontal-navigation-divider-item{display:flex;flex:1 1 auto}.horizontal-navigation-menu-panel .horizontal-navigation-menu-item horizontal-navigation-divider-item{margin:8px -16px}.horizontal-navigation-menu-panel .horizontal-navigation-menu-item horizontal-navigation-divider-item .horizontal-navigation-item-wrapper{height:1px;box-shadow:0 1px}.horizontal-navigation-menu-item horizontal-navigation-basic-item .horizontal-navigation-item-active .horizontal-navigation-item-title,.horizontal-navigation-menu-item horizontal-navigation-basic-item .horizontal-navigation-item-active-forced .horizontal-navigation-item-title{color:var(--fallback-p, oklch(var(--p)))!important}.horizontal-navigation-menu-item horizontal-navigation-basic-item .horizontal-navigation-item-active .horizontal-navigation-item-subtitle,.horizontal-navigation-menu-item horizontal-navigation-basic-item .horizontal-navigation-item-active-forced .horizontal-navigation-item-subtitle{color:var(--fallback-p, oklch(var(--p)))!important}.horizontal-navigation-menu-item horizontal-navigation-basic-item .horizontal-navigation-item-active .horizontal-navigation-item-icon,.horizontal-navigation-menu-item horizontal-navigation-basic-item .horizontal-navigation-item-active-forced .horizontal-navigation-item-icon{color:var(--fallback-p, oklch(var(--p)))!important}.horizontal-navigation-menu-item .horizontal-navigation-item-wrapper{width:100%}.horizontal-navigation-menu-item .horizontal-navigation-item-wrapper.horizontal-navigation-item-has-subtitle .horizontal-navigation-item{min-height:56px}.horizontal-navigation-menu-item .horizontal-navigation-item-wrapper .horizontal-navigation-item{position:relative;display:flex;align-items:center;justify-content:flex-start;min-height:48px;width:100%;font-size:13px;font-weight:500;text-decoration:none}.horizontal-navigation-menu-item .horizontal-navigation-item-wrapper .horizontal-navigation-item .horizontal-navigation-item-title-wrapper .horizontal-navigation-item-subtitle{font-size:10px}.horizontal-navigation-menu-item .horizontal-navigation-item-wrapper .horizontal-navigation-item .horizontal-navigation-item-badge{margin-left:auto}.horizontal-navigation-menu-item .horizontal-navigation-item-wrapper .horizontal-navigation-item .horizontal-navigation-item-badge .horizontal-navigation-item-badge-content{display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:600;white-space:nowrap;height:20px}\n"] }]
        }], ctorParameters: () => [{ type: i0.ChangeDetectorRef }, { type: NavigationService }], propDecorators: { name: [{
                type: Input
            }], navigation: [{
                type: Input
            }] } });

class AnimationCurves {
    static standard = 'cubic-bezier(0.4, 0.0, 0.2, 1)';
    static deceleration = 'cubic-bezier(0.0, 0.0, 0.2, 1)';
    static acceleration = 'cubic-bezier(0.4, 0.0, 1, 1)';
    static sharp = 'cubic-bezier(0.4, 0.0, 0.6, 1)';
}
class AnimationDurations {
    static complex = '375ms';
    static entering = '225ms';
    static exiting = '195ms';
}

// -----------------------------------------------------------------------------------------------------
// @ Fade in
// -----------------------------------------------------------------------------------------------------
const fadeIn = trigger('fadeIn', [
    state('void', style({
        opacity: 0,
    })),
    state('*', style({
        opacity: 1,
    })),
    // Prevent the transition if the state is false
    transition('void => false', []),
    // Transition
    transition('void => *', animate('{{timings}}'), {
        params: {
            timings: `${AnimationDurations.entering} ${AnimationCurves.deceleration}`,
        },
    }),
]);
// -----------------------------------------------------------------------------------------------------
// @ Fade in top
// -----------------------------------------------------------------------------------------------------
const fadeInTop = trigger('fadeInTop', [
    state('void', style({
        opacity: 0,
        transform: 'translate3d(0, -100%, 0)',
    })),
    state('*', style({
        opacity: 1,
        transform: 'translate3d(0, 0, 0)',
    })),
    // Prevent the transition if the state is false
    transition('void => false', []),
    // Transition
    transition('void => *', animate('{{timings}}'), {
        params: {
            timings: `${AnimationDurations.entering} ${AnimationCurves.deceleration}`,
        },
    }),
]);
// -----------------------------------------------------------------------------------------------------
// @ Fade in bottom
// -----------------------------------------------------------------------------------------------------
const fadeInBottom = trigger('fadeInBottom', [
    state('void', style({
        opacity: 0,
        transform: 'translate3d(0, 100%, 0)',
    })),
    state('*', style({
        opacity: 1,
        transform: 'translate3d(0, 0, 0)',
    })),
    // Prevent the transition if the state is false
    transition('void => false', []),
    // Transition
    transition('void => *', animate('{{timings}}'), {
        params: {
            timings: `${AnimationDurations.entering} ${AnimationCurves.deceleration}`,
        },
    }),
]);
// -----------------------------------------------------------------------------------------------------
// @ Fade in left
// -----------------------------------------------------------------------------------------------------
const fadeInLeft = trigger('fadeInLeft', [
    state('void', style({
        opacity: 0,
        transform: 'translate3d(-100%, 0, 0)',
    })),
    state('*', style({
        opacity: 1,
        transform: 'translate3d(0, 0, 0)',
    })),
    // Prevent the transition if the state is false
    transition('void => false', []),
    // Transition
    transition('void => *', animate('{{timings}}'), {
        params: {
            timings: `${AnimationDurations.entering} ${AnimationCurves.deceleration}`,
        },
    }),
]);
// -----------------------------------------------------------------------------------------------------
// @ Fade in right
// -----------------------------------------------------------------------------------------------------
const fadeInRight = trigger('fadeInRight', [
    state('void', style({
        opacity: 0,
        transform: 'translate3d(100%, 0, 0)',
    })),
    state('*', style({
        opacity: 1,
        transform: 'translate3d(0, 0, 0)',
    })),
    // Prevent the transition if the state is false
    transition('void => false', []),
    // Transition
    transition('void => *', animate('{{timings}}'), {
        params: {
            timings: `${AnimationDurations.entering} ${AnimationCurves.deceleration}`,
        },
    }),
]);
// -----------------------------------------------------------------------------------------------------
// @ Fade out
// -----------------------------------------------------------------------------------------------------
const fadeOut = trigger('fadeOut', [
    state('*', style({
        opacity: 1,
    })),
    state('void', style({
        opacity: 0,
    })),
    // Prevent the transition if the state is false
    transition('false => void', []),
    // Transition
    transition('* => void', animate('{{timings}}'), {
        params: {
            timings: `${AnimationDurations.exiting} ${AnimationCurves.acceleration}`,
        },
    }),
]);
// -----------------------------------------------------------------------------------------------------
// @ Fade out top
// -----------------------------------------------------------------------------------------------------
const fadeOutTop = trigger('fadeOutTop', [
    state('*', style({
        opacity: 1,
        transform: 'translate3d(0, 0, 0)',
    })),
    state('void', style({
        opacity: 0,
        transform: 'translate3d(0, -100%, 0)',
    })),
    // Prevent the transition if the state is false
    transition('false => void', []),
    // Transition
    transition('* => void', animate('{{timings}}'), {
        params: {
            timings: `${AnimationDurations.exiting} ${AnimationCurves.acceleration}`,
        },
    }),
]);
// -----------------------------------------------------------------------------------------------------
// @ Fade out bottom
// -----------------------------------------------------------------------------------------------------
const fadeOutBottom = trigger('fadeOutBottom', [
    state('*', style({
        opacity: 1,
        transform: 'translate3d(0, 0, 0)',
    })),
    state('void', style({
        opacity: 0,
        transform: 'translate3d(0, 100%, 0)',
    })),
    // Prevent the transition if the state is false
    transition('false => void', []),
    // Transition
    transition('* => void', animate('{{timings}}'), {
        params: {
            timings: `${AnimationDurations.exiting} ${AnimationCurves.acceleration}`,
        },
    }),
]);
// -----------------------------------------------------------------------------------------------------
// @ Fade out left
// -----------------------------------------------------------------------------------------------------
const fadeOutLeft = trigger('fadeOutLeft', [
    state('*', style({
        opacity: 1,
        transform: 'translate3d(0, 0, 0)',
    })),
    state('void', style({
        opacity: 0,
        transform: 'translate3d(-100%, 0, 0)',
    })),
    // Prevent the transition if the state is false
    transition('false => void', []),
    // Transition
    transition('* => void', animate('{{timings}}'), {
        params: {
            timings: `${AnimationDurations.exiting} ${AnimationCurves.acceleration}`,
        },
    }),
]);
// -----------------------------------------------------------------------------------------------------
// @ Fade out right
// -----------------------------------------------------------------------------------------------------
const fadeOutRight = trigger('fadeOutRight', [
    state('*', style({
        opacity: 1,
        transform: 'translate3d(0, 0, 0)',
    })),
    state('void', style({
        opacity: 0,
        transform: 'translate3d(100%, 0, 0)',
    })),
    // Prevent the transition if the state is false
    transition('false => void', []),
    // Transition
    transition('* => void', animate('{{timings}}'), {
        params: {
            timings: `${AnimationDurations.exiting} ${AnimationCurves.acceleration}`,
        },
    }),
]);

class VerticalNavigationBasicItemComponent {
    _changeDetectorRef;
    _navigationService;
    item;
    name;
    isActiveMatchOptions;
    _verticalNavigationComponent;
    _unsubscribeAll = new Subject();
    constructor(_changeDetectorRef, _navigationService) {
        this._changeDetectorRef = _changeDetectorRef;
        this._navigationService = _navigationService;
        this.isActiveMatchOptions = UtilsHelper.subsetMatchOptions;
    }
    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------
    ngOnInit() {
        // Set the "isActiveMatchOptions" either from item's
        // "isActiveMatchOptions" or the equivalent form of
        // item's "exactMatch" option
        this.isActiveMatchOptions =
            (this.item.isActiveMatchOptions ?? this.item.exactMatch)
                ? UtilsHelper.exactMatchOptions
                : UtilsHelper.subsetMatchOptions;
        // Get the parent navigation component
        this._verticalNavigationComponent = this._navigationService.getComponent(this.name);
        // Mark for check
        this._changeDetectorRef.markForCheck();
        // Subscribe to onRefreshed on the navigation component
        this._verticalNavigationComponent.onRefreshed
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
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: VerticalNavigationBasicItemComponent, deps: [{ token: i0.ChangeDetectorRef }, { token: NavigationService }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "18.2.8", type: VerticalNavigationBasicItemComponent, isStandalone: true, selector: "vertical-navigation-basic-item", inputs: { item: "item", name: "name" }, ngImport: i0, template: "<!-- Item wrapper -->\n<div\n  class=\"vertical-navigation-item-wrapper\"\n  [class.vertical-navigation-item-has-subtitle]=\"!!item.subtitle\"\n  [ngClass]=\"item.classes?.wrapper\"\n>\n  <!-- Item with an internal link -->\n  @if (item.link && !item.externalLink && !item.function && !item.disabled) {\n    <a\n      class=\"vertical-navigation-item\"\n      [ngClass]=\"{ 'vertical-navigation-item-active-forced': item.active }\"\n      [routerLink]=\"[item.link]\"\n      [fragment]=\"item.fragment\"\n      [preserveFragment]=\"item.preserveFragment ?? false\"\n      [queryParams]=\"item.queryParams\"\n      [queryParamsHandling]=\"item.queryParamsHandling\"\n      [routerLinkActive]=\"'vertical-navigation-item-active'\"\n      [routerLinkActiveOptions]=\"isActiveMatchOptions\"\n    >\n      <ng-container *ngTemplateOutlet=\"itemTemplate\" />\n    </a>\n  }\n\n  <!-- Item with an external link -->\n  @if (item.link && item.externalLink && !item.function && !item.disabled) {\n    <a\n      class=\"vertical-navigation-item\"\n      [href]=\"item.link\"\n      [target]=\"item.target || '_self'\"\n    >\n      <ng-container *ngTemplateOutlet=\"itemTemplate\" />\n    </a>\n  }\n\n  <!-- Item with a function -->\n  @if (!item.link && item.function && !item.disabled) {\n    <button\n      class=\"vertical-navigation-item\"\n      [ngClass]=\"{ 'vertical-navigation-item-active-forced': item.active }\"\n      (click)=\"item.function(item)\"\n    >\n      <ng-container *ngTemplateOutlet=\"itemTemplate\" />\n    </button>\n  }\n\n  <!-- Item with an internal link and function -->\n  @if (item.link && !item.externalLink && item.function && !item.disabled) {\n    <a\n      class=\"vertical-navigation-item\"\n      [ngClass]=\"{ 'vertical-navigation-item-active-forced': item.active }\"\n      [routerLink]=\"[item.link]\"\n      [fragment]=\"item.fragment\"\n      [preserveFragment]=\"item.preserveFragment ?? false\"\n      [queryParams]=\"item.queryParams\"\n      [queryParamsHandling]=\"item.queryParamsHandling\"\n      [routerLinkActive]=\"'vertical-navigation-item-active'\"\n      [routerLinkActiveOptions]=\"isActiveMatchOptions\"\n      (click)=\"item.function(item)\"\n    >\n      <ng-container *ngTemplateOutlet=\"itemTemplate\" />\n    </a>\n  }\n\n  <!-- Item with an external link and function -->\n  @if (item.link && item.externalLink && item.function && !item.disabled) {\n    <a\n      class=\"vertical-navigation-item\"\n      [href]=\"item.link\"\n      [target]=\"item.target || '_self'\"\n      (click)=\"item.function(item)\"\n    >\n      <ng-container *ngTemplateOutlet=\"itemTemplate\" />\n    </a>\n  }\n\n  <!-- Item with a no link and no function -->\n  @if (!item.link && !item.function && !item.disabled) {\n    <div\n      class=\"vertical-navigation-item\"\n      [ngClass]=\"{ 'vertical-navigation-item-active-forced': item.active }\"\n    >\n      <ng-container *ngTemplateOutlet=\"itemTemplate\" />\n    </div>\n  }\n\n  <!-- Item is disabled -->\n  @if (item.disabled) {\n    <div class=\"vertical-navigation-item vertical-navigation-item-disabled\">\n      <ng-container *ngTemplateOutlet=\"itemTemplate\" />\n    </div>\n  }\n</div>\n\n<!-- Item template -->\n<ng-template #itemTemplate>\n  <!-- Icon -->\n  @if (item.icon) {\n    <svg-icon\n      class=\"vertical-navigation-item-icon\"\n      [ngClass]=\"item.classes?.icon\"\n      [name]=\"item.icon\"\n    />\n  }\n\n  <!-- Title & Subtitle -->\n  <div class=\"vertical-navigation-item-title-wrapper\">\n    <div class=\"vertical-navigation-item-title\">\n      <span [ngClass]=\"item.classes?.title\">\n        {{ item.title }}\n      </span>\n    </div>\n    @if (item.subtitle) {\n      <div class=\"vertical-navigation-item-subtitle\">\n        <span [ngClass]=\"item.classes?.subtitle\">\n          {{ item.subtitle }}\n        </span>\n      </div>\n    }\n  </div>\n\n  <!-- Badge -->\n  @if (item.badge) {\n    <div class=\"vertical-navigation-item-badge\">\n      <div\n        class=\"vertical-navigation-item-badge-content\"\n        [ngClass]=\"item.badge.classes\"\n      >\n        {{ item.badge.title }}\n      </div>\n    </div>\n  }\n</ng-template>\n", dependencies: [{ kind: "directive", type: NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }, { kind: "directive", type: NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet", "ngTemplateOutletInjector"] }, { kind: "directive", type: RouterLink, selector: "[routerLink]", inputs: ["target", "queryParams", "fragment", "queryParamsHandling", "state", "info", "relativeTo", "preserveFragment", "skipLocationChange", "replaceUrl", "routerLink"] }, { kind: "directive", type: RouterLinkActive, selector: "[routerLinkActive]", inputs: ["routerLinkActiveOptions", "ariaCurrentWhenActive", "routerLinkActive"], outputs: ["isActiveChange"], exportAs: ["routerLinkActive"] }, { kind: "ngmodule", type: SvgIconModule }, { kind: "component", type: i2.SvgIcon, selector: "svg-icon", inputs: ["inline", "name", "fontSet", "fontIcon"], exportAs: ["svgIcon"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: VerticalNavigationBasicItemComponent, decorators: [{
            type: Component,
            args: [{ selector: 'vertical-navigation-basic-item', changeDetection: ChangeDetectionStrategy.OnPush, standalone: true, imports: [NgClass, NgTemplateOutlet, RouterLink, RouterLinkActive, SvgIconModule], template: "<!-- Item wrapper -->\n<div\n  class=\"vertical-navigation-item-wrapper\"\n  [class.vertical-navigation-item-has-subtitle]=\"!!item.subtitle\"\n  [ngClass]=\"item.classes?.wrapper\"\n>\n  <!-- Item with an internal link -->\n  @if (item.link && !item.externalLink && !item.function && !item.disabled) {\n    <a\n      class=\"vertical-navigation-item\"\n      [ngClass]=\"{ 'vertical-navigation-item-active-forced': item.active }\"\n      [routerLink]=\"[item.link]\"\n      [fragment]=\"item.fragment\"\n      [preserveFragment]=\"item.preserveFragment ?? false\"\n      [queryParams]=\"item.queryParams\"\n      [queryParamsHandling]=\"item.queryParamsHandling\"\n      [routerLinkActive]=\"'vertical-navigation-item-active'\"\n      [routerLinkActiveOptions]=\"isActiveMatchOptions\"\n    >\n      <ng-container *ngTemplateOutlet=\"itemTemplate\" />\n    </a>\n  }\n\n  <!-- Item with an external link -->\n  @if (item.link && item.externalLink && !item.function && !item.disabled) {\n    <a\n      class=\"vertical-navigation-item\"\n      [href]=\"item.link\"\n      [target]=\"item.target || '_self'\"\n    >\n      <ng-container *ngTemplateOutlet=\"itemTemplate\" />\n    </a>\n  }\n\n  <!-- Item with a function -->\n  @if (!item.link && item.function && !item.disabled) {\n    <button\n      class=\"vertical-navigation-item\"\n      [ngClass]=\"{ 'vertical-navigation-item-active-forced': item.active }\"\n      (click)=\"item.function(item)\"\n    >\n      <ng-container *ngTemplateOutlet=\"itemTemplate\" />\n    </button>\n  }\n\n  <!-- Item with an internal link and function -->\n  @if (item.link && !item.externalLink && item.function && !item.disabled) {\n    <a\n      class=\"vertical-navigation-item\"\n      [ngClass]=\"{ 'vertical-navigation-item-active-forced': item.active }\"\n      [routerLink]=\"[item.link]\"\n      [fragment]=\"item.fragment\"\n      [preserveFragment]=\"item.preserveFragment ?? false\"\n      [queryParams]=\"item.queryParams\"\n      [queryParamsHandling]=\"item.queryParamsHandling\"\n      [routerLinkActive]=\"'vertical-navigation-item-active'\"\n      [routerLinkActiveOptions]=\"isActiveMatchOptions\"\n      (click)=\"item.function(item)\"\n    >\n      <ng-container *ngTemplateOutlet=\"itemTemplate\" />\n    </a>\n  }\n\n  <!-- Item with an external link and function -->\n  @if (item.link && item.externalLink && item.function && !item.disabled) {\n    <a\n      class=\"vertical-navigation-item\"\n      [href]=\"item.link\"\n      [target]=\"item.target || '_self'\"\n      (click)=\"item.function(item)\"\n    >\n      <ng-container *ngTemplateOutlet=\"itemTemplate\" />\n    </a>\n  }\n\n  <!-- Item with a no link and no function -->\n  @if (!item.link && !item.function && !item.disabled) {\n    <div\n      class=\"vertical-navigation-item\"\n      [ngClass]=\"{ 'vertical-navigation-item-active-forced': item.active }\"\n    >\n      <ng-container *ngTemplateOutlet=\"itemTemplate\" />\n    </div>\n  }\n\n  <!-- Item is disabled -->\n  @if (item.disabled) {\n    <div class=\"vertical-navigation-item vertical-navigation-item-disabled\">\n      <ng-container *ngTemplateOutlet=\"itemTemplate\" />\n    </div>\n  }\n</div>\n\n<!-- Item template -->\n<ng-template #itemTemplate>\n  <!-- Icon -->\n  @if (item.icon) {\n    <svg-icon\n      class=\"vertical-navigation-item-icon\"\n      [ngClass]=\"item.classes?.icon\"\n      [name]=\"item.icon\"\n    />\n  }\n\n  <!-- Title & Subtitle -->\n  <div class=\"vertical-navigation-item-title-wrapper\">\n    <div class=\"vertical-navigation-item-title\">\n      <span [ngClass]=\"item.classes?.title\">\n        {{ item.title }}\n      </span>\n    </div>\n    @if (item.subtitle) {\n      <div class=\"vertical-navigation-item-subtitle\">\n        <span [ngClass]=\"item.classes?.subtitle\">\n          {{ item.subtitle }}\n        </span>\n      </div>\n    }\n  </div>\n\n  <!-- Badge -->\n  @if (item.badge) {\n    <div class=\"vertical-navigation-item-badge\">\n      <div\n        class=\"vertical-navigation-item-badge-content\"\n        [ngClass]=\"item.badge.classes\"\n      >\n        {{ item.badge.title }}\n      </div>\n    </div>\n  }\n</ng-template>\n" }]
        }], ctorParameters: () => [{ type: i0.ChangeDetectorRef }, { type: NavigationService }], propDecorators: { item: [{
                type: Input
            }], name: [{
                type: Input
            }] } });

// -----------------------------------------------------------------------------------------------------
// @ Expand / collapse
// -----------------------------------------------------------------------------------------------------
const expandCollapse = trigger('expandCollapse', [
    state('void, collapsed', style({
        height: '0',
    })),
    state('*, expanded', style('*')),
    // Prevent the transition if the state is false
    transition('void <=> false, collapsed <=> false, expanded <=> false', []),
    // Transition
    transition('void <=> *, collapsed <=> expanded', animate('{{timings}}'), {
        params: {
            timings: `${AnimationDurations.entering} ${AnimationCurves.deceleration}`,
        },
    }),
]);

class VerticalNavigationDividerItemComponent {
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
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: VerticalNavigationDividerItemComponent, deps: [{ token: i0.ChangeDetectorRef }, { token: NavigationService }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "18.2.8", type: VerticalNavigationDividerItemComponent, isStandalone: true, selector: "vertical-navigation-divider-item", inputs: { item: "item", name: "name" }, ngImport: i0, template: "<div\n  class=\"vertical-navigation-item-wrapper divider\"\n  [ngClass]=\"item.classes?.wrapper\"\n></div>\n", dependencies: [{ kind: "directive", type: NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: VerticalNavigationDividerItemComponent, decorators: [{
            type: Component,
            args: [{ selector: 'vertical-navigation-divider-item', changeDetection: ChangeDetectionStrategy.OnPush, standalone: true, imports: [NgClass], template: "<div\n  class=\"vertical-navigation-item-wrapper divider\"\n  [ngClass]=\"item.classes?.wrapper\"\n></div>\n" }]
        }], ctorParameters: () => [{ type: i0.ChangeDetectorRef }, { type: NavigationService }], propDecorators: { item: [{
                type: Input
            }], name: [{
                type: Input
            }] } });

class VerticalNavigationSpacerItemComponent {
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
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: VerticalNavigationSpacerItemComponent, deps: [{ token: i0.ChangeDetectorRef }, { token: NavigationService }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "18.2.8", type: VerticalNavigationSpacerItemComponent, isStandalone: true, selector: "vertical-navigation-spacer-item", inputs: { item: "item", name: "name" }, ngImport: i0, template: "<div\n  class=\"vertical-navigation-item-wrapper\"\n  [ngClass]=\"item.classes?.wrapper\"\n></div>\n", dependencies: [{ kind: "directive", type: NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: VerticalNavigationSpacerItemComponent, decorators: [{
            type: Component,
            args: [{ selector: 'vertical-navigation-spacer-item', changeDetection: ChangeDetectionStrategy.OnPush, standalone: true, imports: [NgClass], template: "<div\n  class=\"vertical-navigation-item-wrapper\"\n  [ngClass]=\"item.classes?.wrapper\"\n></div>\n" }]
        }], ctorParameters: () => [{ type: i0.ChangeDetectorRef }, { type: NavigationService }], propDecorators: { item: [{
                type: Input
            }], name: [{
                type: Input
            }] } });

class VerticalNavigationCollapsableItemComponent {
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
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: VerticalNavigationCollapsableItemComponent, deps: [{ token: i1.Router }, { token: i0.ChangeDetectorRef }, { token: NavigationService }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "18.2.8", type: VerticalNavigationCollapsableItemComponent, isStandalone: true, selector: "vertical-navigation-collapsable-item", inputs: { autoCollapse: "autoCollapse", item: "item", name: "name" }, host: { properties: { "class": "this.classList" } }, ngImport: i0, template: "<div\n  class=\"vertical-navigation-item-wrapper\"\n  [class.vertical-navigation-item-has-subtitle]=\"!!item.subtitle\"\n  [ngClass]=\"item.classes?.wrapper\"\n>\n  <button\n    class=\"vertical-navigation-item\"\n    [ngClass]=\"{ 'vertical-navigation-item-disabled': item.disabled }\"\n    (click)=\"toggleCollapsable()\"\n  >\n    <!-- Icon -->\n    @if (item.icon) {\n      <svg-icon\n        class=\"vertical-navigation-item-icon\"\n        [ngClass]=\"item.classes?.icon\"\n        [name]=\"item.icon\"\n      />\n    }\n\n    <!-- Title & Subtitle -->\n    <div class=\"vertical-navigation-item-title-wrapper\">\n      <div class=\"vertical-navigation-item-title\">\n        <span [ngClass]=\"item.classes?.title\">\n          {{ item.title }}\n        </span>\n      </div>\n      @if (item.subtitle) {\n        <div class=\"vertical-navigation-item-subtitle\">\n          <span [ngClass]=\"item.classes?.subtitle\">\n            {{ item.subtitle }}\n          </span>\n        </div>\n      }\n    </div>\n\n    <!-- Badge -->\n    @if (item.badge) {\n      <div class=\"vertical-navigation-item-badge\">\n        <div\n          class=\"vertical-navigation-item-badge-content\"\n          [ngClass]=\"item.badge.classes\"\n        >\n          {{ item.badge.title }}\n        </div>\n      </div>\n    }\n\n    <!-- Arrow -->\n    <svg-icon\n      class=\"vertical-navigation-item-arrow icon-size-4\"\n      [name]=\"'heroicons_solid:chevron-right'\"\n    />\n  </button>\n</div>\n\n@if (!isCollapsed) {\n  <div\n    class=\"vertical-navigation-item-children\"\n    @expandCollapse\n  >\n    @for (item of item.children; track item.id) {\n      <!-- Skip the hidden items -->\n      @if ((item.hidden && !item.hidden(item)) || !item.hidden) {\n        <!-- Basic -->\n        @if (item.type === 'basic') {\n          <vertical-navigation-basic-item\n            [item]=\"item\"\n            [name]=\"name\"\n          />\n        }\n\n        <!-- Collapsable -->\n        @if (item.type === 'collapsable') {\n          <vertical-navigation-collapsable-item\n            [item]=\"item\"\n            [name]=\"name\"\n            [autoCollapse]=\"autoCollapse\"\n          />\n        }\n\n        <!-- Divider -->\n        @if (item.type === 'divider') {\n          <vertical-navigation-divider-item\n            [item]=\"item\"\n            [name]=\"name\"\n          />\n        }\n\n        <!-- Group -->\n        @if (item.type === 'group') {\n          <vertical-navigation-group-item\n            [item]=\"item\"\n            [name]=\"name\"\n          />\n        }\n\n        <!-- Spacer -->\n        @if (item.type === 'spacer') {\n          <vertical-navigation-spacer-item\n            [item]=\"item\"\n            [name]=\"name\"\n          />\n        }\n      }\n    }\n  </div>\n}\n", dependencies: [{ kind: "component", type: i0.forwardRef(() => VerticalNavigationCollapsableItemComponent), selector: "vertical-navigation-collapsable-item", inputs: ["autoCollapse", "item", "name"] }, { kind: "directive", type: i0.forwardRef(() => NgClass), selector: "[ngClass]", inputs: ["class", "ngClass"] }, { kind: "ngmodule", type: i0.forwardRef(() => SvgIconModule) }, { kind: "component", type: i0.forwardRef(() => i2.SvgIcon), selector: "svg-icon", inputs: ["inline", "name", "fontSet", "fontIcon"], exportAs: ["svgIcon"] }, { kind: "component", type: i0.forwardRef(() => VerticalNavigationBasicItemComponent), selector: "vertical-navigation-basic-item", inputs: ["item", "name"] }, { kind: "component", type: i0.forwardRef(() => VerticalNavigationDividerItemComponent), selector: "vertical-navigation-divider-item", inputs: ["item", "name"] }, { kind: "component", type: i0.forwardRef(() => VerticalNavigationGroupItemComponent), selector: "vertical-navigation-group-item", inputs: ["autoCollapse", "item", "name"] }, { kind: "component", type: i0.forwardRef(() => VerticalNavigationSpacerItemComponent), selector: "vertical-navigation-spacer-item", inputs: ["item", "name"] }], animations: [expandCollapse], changeDetection: i0.ChangeDetectionStrategy.OnPush });
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
        }], ctorParameters: () => [{ type: i1.Router }, { type: i0.ChangeDetectorRef }, { type: NavigationService }], propDecorators: { autoCollapse: [{
                type: Input
            }], item: [{
                type: Input
            }], name: [{
                type: Input
            }], classList: [{
                type: HostBinding,
                args: ['class']
            }] } });

class VerticalNavigationGroupItemComponent {
    _changeDetectorRef;
    _navigationService;
    static ngAcceptInputType_autoCollapse;
    autoCollapse;
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
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: VerticalNavigationGroupItemComponent, deps: [{ token: i0.ChangeDetectorRef }, { token: NavigationService }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "18.2.8", type: VerticalNavigationGroupItemComponent, isStandalone: true, selector: "vertical-navigation-group-item", inputs: { autoCollapse: "autoCollapse", item: "item", name: "name" }, ngImport: i0, template: "<!-- Item wrapper -->\n<div\n  class=\"vertical-navigation-item-wrapper\"\n  [class.vertical-navigation-item-has-subtitle]=\"!!item.subtitle\"\n  [ngClass]=\"item.classes?.wrapper\"\n>\n  <div class=\"vertical-navigation-item\">\n    <!-- Icon -->\n    @if (item.icon) {\n      <svg-icon\n        class=\"vertical-navigation-item-icon\"\n        [ngClass]=\"item.classes?.icon\"\n        [name]=\"item.icon\"\n      />\n    }\n\n    <!-- Title & Subtitle -->\n    <div class=\"vertical-navigation-item-title-wrapper\">\n      <div class=\"vertical-navigation-item-title\">\n        <span [ngClass]=\"item.classes?.title\">\n          {{ item.title }}\n        </span>\n      </div>\n      @if (item.subtitle) {\n        <div class=\"vertical-navigation-item-subtitle\">\n          <span [ngClass]=\"item.classes?.subtitle\">\n            {{ item.subtitle }}\n          </span>\n        </div>\n      }\n    </div>\n\n    <!-- Badge -->\n    @if (item.badge) {\n      <div class=\"vertical-navigation-item-badge\">\n        <div\n          class=\"vertical-navigation-item-badge-content\"\n          [ngClass]=\"item.badge.classes\"\n        >\n          {{ item.badge.title }}\n        </div>\n      </div>\n    }\n  </div>\n</div>\n\n@for (item of item.children; track item.id) {\n  <!-- Skip the hidden items -->\n  @if ((item.hidden && !item.hidden(item)) || !item.hidden) {\n    <!-- Basic -->\n    @if (item.type === 'basic') {\n      <vertical-navigation-basic-item\n        [item]=\"item\"\n        [name]=\"name\"\n      />\n    }\n\n    <!-- Collapsable -->\n    @if (item.type === 'collapsable') {\n      <vertical-navigation-collapsable-item\n        [item]=\"item\"\n        [name]=\"name\"\n        [autoCollapse]=\"autoCollapse\"\n      />\n    }\n\n    <!-- Divider -->\n    @if (item.type === 'divider') {\n      <vertical-navigation-divider-item\n        [item]=\"item\"\n        [name]=\"name\"\n      />\n    }\n\n    <!-- Group -->\n    @if (item.type === 'group') {\n      <vertical-navigation-group-item\n        [item]=\"item\"\n        [name]=\"name\"\n      />\n    }\n\n    <!-- Spacer -->\n    @if (item.type === 'spacer') {\n      <vertical-navigation-spacer-item\n        [item]=\"item\"\n        [name]=\"name\"\n      />\n    }\n  }\n}\n", dependencies: [{ kind: "component", type: i0.forwardRef(() => VerticalNavigationGroupItemComponent), selector: "vertical-navigation-group-item", inputs: ["autoCollapse", "item", "name"] }, { kind: "directive", type: i0.forwardRef(() => NgClass), selector: "[ngClass]", inputs: ["class", "ngClass"] }, { kind: "ngmodule", type: i0.forwardRef(() => SvgIconModule) }, { kind: "component", type: i0.forwardRef(() => i2.SvgIcon), selector: "svg-icon", inputs: ["inline", "name", "fontSet", "fontIcon"], exportAs: ["svgIcon"] }, { kind: "component", type: i0.forwardRef(() => VerticalNavigationBasicItemComponent), selector: "vertical-navigation-basic-item", inputs: ["item", "name"] }, { kind: "component", type: i0.forwardRef(() => VerticalNavigationCollapsableItemComponent), selector: "vertical-navigation-collapsable-item", inputs: ["autoCollapse", "item", "name"] }, { kind: "component", type: i0.forwardRef(() => VerticalNavigationDividerItemComponent), selector: "vertical-navigation-divider-item", inputs: ["item", "name"] }, { kind: "component", type: i0.forwardRef(() => VerticalNavigationSpacerItemComponent), selector: "vertical-navigation-spacer-item", inputs: ["item", "name"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: VerticalNavigationGroupItemComponent, decorators: [{
            type: Component,
            args: [{ selector: 'vertical-navigation-group-item', changeDetection: ChangeDetectionStrategy.OnPush, standalone: true, imports: [
                        NgClass,
                        NgIf,
                        NgFor,
                        SvgIconModule,
                        VerticalNavigationBasicItemComponent,
                        VerticalNavigationCollapsableItemComponent,
                        VerticalNavigationDividerItemComponent,
                        VerticalNavigationSpacerItemComponent,
                        forwardRef(() => VerticalNavigationGroupItemComponent),
                    ], template: "<!-- Item wrapper -->\n<div\n  class=\"vertical-navigation-item-wrapper\"\n  [class.vertical-navigation-item-has-subtitle]=\"!!item.subtitle\"\n  [ngClass]=\"item.classes?.wrapper\"\n>\n  <div class=\"vertical-navigation-item\">\n    <!-- Icon -->\n    @if (item.icon) {\n      <svg-icon\n        class=\"vertical-navigation-item-icon\"\n        [ngClass]=\"item.classes?.icon\"\n        [name]=\"item.icon\"\n      />\n    }\n\n    <!-- Title & Subtitle -->\n    <div class=\"vertical-navigation-item-title-wrapper\">\n      <div class=\"vertical-navigation-item-title\">\n        <span [ngClass]=\"item.classes?.title\">\n          {{ item.title }}\n        </span>\n      </div>\n      @if (item.subtitle) {\n        <div class=\"vertical-navigation-item-subtitle\">\n          <span [ngClass]=\"item.classes?.subtitle\">\n            {{ item.subtitle }}\n          </span>\n        </div>\n      }\n    </div>\n\n    <!-- Badge -->\n    @if (item.badge) {\n      <div class=\"vertical-navigation-item-badge\">\n        <div\n          class=\"vertical-navigation-item-badge-content\"\n          [ngClass]=\"item.badge.classes\"\n        >\n          {{ item.badge.title }}\n        </div>\n      </div>\n    }\n  </div>\n</div>\n\n@for (item of item.children; track item.id) {\n  <!-- Skip the hidden items -->\n  @if ((item.hidden && !item.hidden(item)) || !item.hidden) {\n    <!-- Basic -->\n    @if (item.type === 'basic') {\n      <vertical-navigation-basic-item\n        [item]=\"item\"\n        [name]=\"name\"\n      />\n    }\n\n    <!-- Collapsable -->\n    @if (item.type === 'collapsable') {\n      <vertical-navigation-collapsable-item\n        [item]=\"item\"\n        [name]=\"name\"\n        [autoCollapse]=\"autoCollapse\"\n      />\n    }\n\n    <!-- Divider -->\n    @if (item.type === 'divider') {\n      <vertical-navigation-divider-item\n        [item]=\"item\"\n        [name]=\"name\"\n      />\n    }\n\n    <!-- Group -->\n    @if (item.type === 'group') {\n      <vertical-navigation-group-item\n        [item]=\"item\"\n        [name]=\"name\"\n      />\n    }\n\n    <!-- Spacer -->\n    @if (item.type === 'spacer') {\n      <vertical-navigation-spacer-item\n        [item]=\"item\"\n        [name]=\"name\"\n      />\n    }\n  }\n}\n" }]
        }], ctorParameters: () => [{ type: i0.ChangeDetectorRef }, { type: NavigationService }], propDecorators: { autoCollapse: [{
                type: Input
            }], item: [{
                type: Input
            }], name: [{
                type: Input
            }] } });

class VerticalNavigationAsideItemComponent {
    _changeDetectorRef;
    _router;
    _NavigationService;
    static ngAcceptInputType_autoCollapse;
    static ngAcceptInputType_skipChildren;
    activeItemId;
    autoCollapse;
    item;
    name;
    skipChildren;
    active = false;
    _VerticalNavigationComponent;
    _unsubscribeAll = new Subject();
    constructor(_changeDetectorRef, _router, _NavigationService) {
        this._changeDetectorRef = _changeDetectorRef;
        this._router = _router;
        this._NavigationService = _NavigationService;
    }
    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------
    ngOnChanges(changes) {
        // Active item id
        if ('activeItemId' in changes) {
            // Mark if active
            this._markIfActive(this._router.url);
        }
    }
    ngOnInit() {
        // Mark if active
        this._markIfActive(this._router.url);
        // Attach a listener to the NavigationEnd event
        this._router.events
            .pipe(filter((event) => event instanceof NavigationEnd), takeUntil(this._unsubscribeAll))
            .subscribe((event) => {
            // Mark if active
            this._markIfActive(event.urlAfterRedirects);
        });
        // Get the parent navigation component
        this._VerticalNavigationComponent = this._NavigationService.getComponent(this.name);
        // Subscribe to onRefreshed on the navigation component
        this._VerticalNavigationComponent.onRefreshed
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
            // Skip items other than 'basic'
            if (child.type !== 'basic') {
                continue;
            }
            // Check if the child has a link and is active
            if (child.link && this._router.isActive(child.link, child.exactMatch || false)) {
                return true;
            }
        }
        return false;
    }
    _markIfActive(currentUrl) {
        // Check if the activeItemId is equals to this item id
        this.active = this.activeItemId === this.item.id;
        // If the aside has a children that is active,
        // always mark it as active
        if (this._hasActiveChild(this.item, currentUrl)) {
            this.active = true;
        }
        // Mark for check
        this._changeDetectorRef.markForCheck();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: VerticalNavigationAsideItemComponent, deps: [{ token: i0.ChangeDetectorRef }, { token: i1.Router }, { token: NavigationService }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "18.2.8", type: VerticalNavigationAsideItemComponent, isStandalone: true, selector: "vertical-navigation-aside-item", inputs: { activeItemId: "activeItemId", autoCollapse: "autoCollapse", item: "item", name: "name", skipChildren: "skipChildren" }, usesOnChanges: true, ngImport: i0, template: "<div\n  class=\"vertical-navigation-item-wrapper\"\n  [class.vertical-navigation-item-has-subtitle]=\"!!item.subtitle\"\n  [ngClass]=\"item.classes?.wrapper\"\n>\n  <div\n    class=\"vertical-navigation-item\"\n    [ngClass]=\"{\n      'vertical-navigation-item-active': active,\n      'vertical-navigation-item-disabled': item.disabled,\n      'vertical-navigation-item-active-forced': item.active,\n    }\"\n  >\n    <!-- Icon -->\n    @if (item.icon) {\n      <svg-icon\n        class=\"vertical-navigation-item-icon\"\n        [ngClass]=\"item.classes?.icon\"\n        [name]=\"item.icon\"\n      />\n    }\n\n    <!-- Title & Subtitle -->\n    <div class=\"vertical-navigation-item-title-wrapper\">\n      <div class=\"vertical-navigation-item-title\">\n        <span [ngClass]=\"item.classes?.title\">\n          {{ item.title }}\n        </span>\n      </div>\n      @if (item.subtitle) {\n        <div class=\"vertical-navigation-item-subtitle\">\n          <span [ngClass]=\"item.classes?.subtitle\">\n            {{ item.subtitle }}\n          </span>\n        </div>\n      }\n    </div>\n\n    <!-- Badge -->\n    @if (item.badge) {\n      <div class=\"vertical-navigation-item-badge\">\n        <div\n          class=\"vertical-navigation-item-badge-content\"\n          [ngClass]=\"item.badge.classes\"\n        >\n          {{ item.badge.title }}\n        </div>\n      </div>\n    }\n  </div>\n</div>\n\n@if (!skipChildren) {\n  <div class=\"vertical-navigation-item-children\">\n    @for (item of item.children; track item.id) {\n      <!-- Skip the hidden items -->\n      @if ((item.hidden && !item.hidden(item)) || !item.hidden) {\n        <!-- Basic -->\n        @if (item.type === 'basic') {\n          <vertical-navigation-basic-item\n            [item]=\"item\"\n            [name]=\"name\"\n          />\n        }\n\n        <!-- Collapsable -->\n        @if (item.type === 'collapsable') {\n          <vertical-navigation-collapsable-item\n            [item]=\"item\"\n            [name]=\"name\"\n            [autoCollapse]=\"autoCollapse\"\n          />\n        }\n\n        <!-- Divider -->\n        @if (item.type === 'divider') {\n          <vertical-navigation-divider-item\n            [item]=\"item\"\n            [name]=\"name\"\n          />\n        }\n\n        <!-- Group -->\n        @if (item.type === 'group') {\n          <vertical-navigation-group-item\n            [item]=\"item\"\n            [name]=\"name\"\n          />\n        }\n\n        <!-- Spacer -->\n        @if (item.type === 'spacer') {\n          <vertical-navigation-spacer-item\n            [item]=\"item\"\n            [name]=\"name\"\n          />\n        }\n      }\n    }\n  </div>\n}\n", dependencies: [{ kind: "directive", type: NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }, { kind: "ngmodule", type: SvgIconModule }, { kind: "component", type: i2.SvgIcon, selector: "svg-icon", inputs: ["inline", "name", "fontSet", "fontIcon"], exportAs: ["svgIcon"] }, { kind: "component", type: VerticalNavigationBasicItemComponent, selector: "vertical-navigation-basic-item", inputs: ["item", "name"] }, { kind: "component", type: VerticalNavigationCollapsableItemComponent, selector: "vertical-navigation-collapsable-item", inputs: ["autoCollapse", "item", "name"] }, { kind: "component", type: VerticalNavigationDividerItemComponent, selector: "vertical-navigation-divider-item", inputs: ["item", "name"] }, { kind: "component", type: VerticalNavigationGroupItemComponent, selector: "vertical-navigation-group-item", inputs: ["autoCollapse", "item", "name"] }, { kind: "component", type: VerticalNavigationSpacerItemComponent, selector: "vertical-navigation-spacer-item", inputs: ["item", "name"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: VerticalNavigationAsideItemComponent, decorators: [{
            type: Component,
            args: [{ selector: 'vertical-navigation-aside-item', changeDetection: ChangeDetectionStrategy.OnPush, standalone: true, imports: [
                        NgClass,
                        SvgIconModule,
                        VerticalNavigationBasicItemComponent,
                        VerticalNavigationCollapsableItemComponent,
                        VerticalNavigationDividerItemComponent,
                        VerticalNavigationGroupItemComponent,
                        VerticalNavigationSpacerItemComponent,
                    ], template: "<div\n  class=\"vertical-navigation-item-wrapper\"\n  [class.vertical-navigation-item-has-subtitle]=\"!!item.subtitle\"\n  [ngClass]=\"item.classes?.wrapper\"\n>\n  <div\n    class=\"vertical-navigation-item\"\n    [ngClass]=\"{\n      'vertical-navigation-item-active': active,\n      'vertical-navigation-item-disabled': item.disabled,\n      'vertical-navigation-item-active-forced': item.active,\n    }\"\n  >\n    <!-- Icon -->\n    @if (item.icon) {\n      <svg-icon\n        class=\"vertical-navigation-item-icon\"\n        [ngClass]=\"item.classes?.icon\"\n        [name]=\"item.icon\"\n      />\n    }\n\n    <!-- Title & Subtitle -->\n    <div class=\"vertical-navigation-item-title-wrapper\">\n      <div class=\"vertical-navigation-item-title\">\n        <span [ngClass]=\"item.classes?.title\">\n          {{ item.title }}\n        </span>\n      </div>\n      @if (item.subtitle) {\n        <div class=\"vertical-navigation-item-subtitle\">\n          <span [ngClass]=\"item.classes?.subtitle\">\n            {{ item.subtitle }}\n          </span>\n        </div>\n      }\n    </div>\n\n    <!-- Badge -->\n    @if (item.badge) {\n      <div class=\"vertical-navigation-item-badge\">\n        <div\n          class=\"vertical-navigation-item-badge-content\"\n          [ngClass]=\"item.badge.classes\"\n        >\n          {{ item.badge.title }}\n        </div>\n      </div>\n    }\n  </div>\n</div>\n\n@if (!skipChildren) {\n  <div class=\"vertical-navigation-item-children\">\n    @for (item of item.children; track item.id) {\n      <!-- Skip the hidden items -->\n      @if ((item.hidden && !item.hidden(item)) || !item.hidden) {\n        <!-- Basic -->\n        @if (item.type === 'basic') {\n          <vertical-navigation-basic-item\n            [item]=\"item\"\n            [name]=\"name\"\n          />\n        }\n\n        <!-- Collapsable -->\n        @if (item.type === 'collapsable') {\n          <vertical-navigation-collapsable-item\n            [item]=\"item\"\n            [name]=\"name\"\n            [autoCollapse]=\"autoCollapse\"\n          />\n        }\n\n        <!-- Divider -->\n        @if (item.type === 'divider') {\n          <vertical-navigation-divider-item\n            [item]=\"item\"\n            [name]=\"name\"\n          />\n        }\n\n        <!-- Group -->\n        @if (item.type === 'group') {\n          <vertical-navigation-group-item\n            [item]=\"item\"\n            [name]=\"name\"\n          />\n        }\n\n        <!-- Spacer -->\n        @if (item.type === 'spacer') {\n          <vertical-navigation-spacer-item\n            [item]=\"item\"\n            [name]=\"name\"\n          />\n        }\n      }\n    }\n  </div>\n}\n" }]
        }], ctorParameters: () => [{ type: i0.ChangeDetectorRef }, { type: i1.Router }, { type: NavigationService }], propDecorators: { activeItemId: [{
                type: Input
            }], autoCollapse: [{
                type: Input
            }], item: [{
                type: Input
            }], name: [{
                type: Input
            }], skipChildren: [{
                type: Input
            }] } });

class VerticalNavigationComponent {
    _document;
    _animationBuilder;
    _changeDetectorRef;
    _elementRef;
    _renderer2;
    _router;
    _scrollStrategyOptions;
    _navigationService;
    static ngAcceptInputType_inner;
    static ngAcceptInputType_opened;
    static ngAcceptInputType_transparentOverlay;
    appearance = 'default';
    autoCollapse = true;
    inner = false;
    mode = 'side';
    name = UtilsHelper.randomId();
    navigation;
    opened = true;
    position = 'left';
    transparentOverlay = false;
    appearanceChanged = new EventEmitter();
    modeChanged = new EventEmitter();
    openedChanged = new EventEmitter();
    positionChanged = new EventEmitter();
    _navigationContentEl;
    activeAsideItemId = null;
    onCollapsableItemCollapsed = new ReplaySubject(1);
    onCollapsableItemExpanded = new ReplaySubject(1);
    onRefreshed = new ReplaySubject(1);
    _animationsEnabled = false;
    _asideOverlay;
    _handleAsideOverlayClick;
    _handleOverlayClick;
    _hovered = false;
    _mutationObserver;
    _overlay;
    _player;
    _scrollStrategy;
    _scrollbarDirectives;
    _scrollbarDirectivesSubscription;
    _unsubscribeAll = new Subject();
    constructor(_document, _animationBuilder, _changeDetectorRef, _elementRef, _renderer2, _router, _scrollStrategyOptions, _navigationService) {
        this._document = _document;
        this._animationBuilder = _animationBuilder;
        this._changeDetectorRef = _changeDetectorRef;
        this._elementRef = _elementRef;
        this._renderer2 = _renderer2;
        this._router = _router;
        this._scrollStrategyOptions = _scrollStrategyOptions;
        this._navigationService = _navigationService;
        this._handleAsideOverlayClick = () => {
            this.closeAside();
        };
        this._handleOverlayClick = () => {
            this.close();
        };
        this._scrollStrategy = this._scrollStrategyOptions.block();
    }
    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------
    get classList() {
        return {
            'vertical-navigation-animations-enabled': this._animationsEnabled,
            [`vertical-navigation-appearance-${this.appearance}`]: true,
            'vertical-navigation-hover': this._hovered,
            'vertical-navigation-inner': this.inner,
            'vertical-navigation-mode-over': this.mode === 'over',
            'vertical-navigation-mode-side': this.mode === 'side',
            'vertical-navigation-opened': this.opened,
            'vertical-navigation-position-left': this.position === 'left',
            'vertical-navigation-position-right': this.position === 'right',
        };
    }
    get styleList() {
        return {
            visibility: this.opened ? 'visible' : 'hidden',
        };
    }
    set scrollbarDirectives(scrollbarDirectives) {
        this._scrollbarDirectives = scrollbarDirectives;
        // Return if there are no directives
        if (scrollbarDirectives.length === 0) {
            return;
        }
        // Unsubscribe the previous subscriptions
        if (this._scrollbarDirectivesSubscription) {
            this._scrollbarDirectivesSubscription.unsubscribe();
        }
        // Update the scrollbars on collapsable items' collapse/expand
        this._scrollbarDirectivesSubscription = merge(this.onCollapsableItemCollapsed, this.onCollapsableItemExpanded)
            .pipe(takeUntil$1(this._unsubscribeAll), delay(250))
            .subscribe(() => {
            // Loop through the scrollbars and update them
            scrollbarDirectives.forEach((scrollbarDirective) => {
                scrollbarDirective.update();
            });
        });
    }
    // -----------------------------------------------------------------------------------------------------
    // @ Decorated methods
    // -----------------------------------------------------------------------------------------------------
    _onMouseenter() {
        // Enable the animations
        this._enableAnimations();
        // Set the hovered
        this._hovered = true;
    }
    _onMouseleave() {
        // Enable the animations
        this._enableAnimations();
        // Set the hovered
        this._hovered = false;
    }
    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------
    ngOnChanges(changes) {
        // Appearance
        if ('appearance' in changes) {
            // Execute the observable
            this.appearanceChanged.next(changes['appearance'].currentValue);
        }
        // Inner
        if ('inner' in changes) {
            // Coerce the value to a boolean
            this.inner = coerceBooleanProperty(changes['inner'].currentValue);
        }
        // Mode
        if ('mode' in changes) {
            // Get the previous and current values
            const currentMode = changes['mode'].currentValue;
            const previousMode = changes['mode'].previousValue;
            // Disable the animations
            this._disableAnimations();
            // If the mode changes: 'over -> side'
            if (previousMode === 'over' && currentMode === 'side') {
                // Hide the overlay
                this._hideOverlay();
            }
            // If the mode changes: 'side -> over'
            if (previousMode === 'side' && currentMode === 'over') {
                // Close the aside
                this.closeAside();
                // If the navigation is opened
                if (this.opened) {
                    // Show the overlay
                    this._showOverlay();
                }
            }
            // Execute the observable
            this.modeChanged.next(currentMode);
            // Enable the animations after a delay
            // The delay must be bigger than the current transition-duration
            // to make sure nothing will be animated while the mode changing
            setTimeout(() => {
                this._enableAnimations();
            }, 500);
        }
        // Navigation
        if ('navigation' in changes) {
            // Mark for check
            this._changeDetectorRef.markForCheck();
        }
        // Opened
        if ('opened' in changes) {
            // Coerce the value to a boolean
            this.opened = coerceBooleanProperty(changes['opened'].currentValue);
            // Open/close the navigation
            this._toggleOpened(this.opened);
        }
        // Position
        if ('position' in changes) {
            // Execute the observable
            this.positionChanged.next(changes['position'].currentValue);
        }
        // Transparent overlay
        if ('transparentOverlay' in changes) {
            // Coerce the value to a boolean
            this.transparentOverlay = coerceBooleanProperty(changes['transparentOverlay'].currentValue);
        }
    }
    ngOnInit() {
        // Make sure the name input is not an empty string
        if (this.name === '') {
            this.name = UtilsHelper.randomId();
        }
        // Register the navigation component
        this._navigationService.registerComponent(this.name, this);
        // Subscribe to the 'NavigationEnd' event
        this._router.events
            .pipe(filter$1((event) => event instanceof NavigationEnd), takeUntil$1(this._unsubscribeAll))
            .subscribe(() => {
            // If the mode is 'over' and the navigation is opened...
            if (this.mode === 'over' && this.opened) {
                // Close the navigation
                this.close();
            }
            // If the mode is 'side' and the aside is active...
            if (this.mode === 'side' && this.activeAsideItemId) {
                // Close the aside
                this.closeAside();
            }
        });
    }
    ngAfterViewInit() {
        // Fix for Firefox.
        //
        // Because 'position: sticky' doesn't work correctly inside a 'position: fixed' parent,
        // adding the '.cdk-global-scrollblock' to the html element breaks the navigation's position.
        // This fixes the problem by reading the 'top' value from the html element and adding it as a
        // 'marginTop' to the navigation itself.
        this._mutationObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                const mutationTarget = mutation.target;
                if (mutation.attributeName === 'class') {
                    if (mutationTarget.classList.contains('cdk-global-scrollblock')) {
                        const top = parseInt(mutationTarget.style.top, 10);
                        this._renderer2.setStyle(this._elementRef.nativeElement, 'margin-top', `${Math.abs(top)}px`);
                    }
                    else {
                        this._renderer2.setStyle(this._elementRef.nativeElement, 'margin-top', null);
                    }
                }
            });
        });
        this._mutationObserver.observe(this._document.documentElement, {
            attributes: true,
            attributeFilter: ['class'],
        });
        setTimeout(() => {
            // Return if 'navigation content' element does not exist
            if (!this._navigationContentEl) {
                return;
            }
            // If 'navigation content' element doesn't have
            // perfect scrollbar activated on it...
            if (!this._navigationContentEl.nativeElement.classList.contains('ps')) {
                // Find the active item
                const activeItem = this._navigationContentEl.nativeElement.querySelector('.vertical-navigation-item-active');
                // If the active item exists, scroll it into view
                if (activeItem) {
                    activeItem.scrollIntoView();
                }
            }
            // Otherwise
            else {
                // Go through all the scrollbar directives
                this._scrollbarDirectives.forEach((scrollbarDirective) => {
                    // Skip if not enabled
                    if (!scrollbarDirective.isEnabled()) {
                        return;
                    }
                    // Scroll to the active element
                    scrollbarDirective.scrollToElement('.vertical-navigation-item-active', -120, true);
                });
            }
        });
    }
    ngOnDestroy() {
        // Disconnect the mutation observer
        this._mutationObserver.disconnect();
        // Forcefully close the navigation and aside in case they are opened
        this.close();
        this.closeAside();
        // Deregister the navigation component from the registry
        this._navigationService.deregisterComponent(this.name);
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }
    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------
    refresh() {
        // Mark for check
        this._changeDetectorRef.markForCheck();
        // Execute the observable
        this.onRefreshed.next(true);
    }
    open() {
        // Return if the navigation is already open
        if (this.opened) {
            return;
        }
        // Set the opened
        this._toggleOpened(true);
    }
    close() {
        // Return if the navigation is already closed
        if (!this.opened) {
            return;
        }
        // Close the aside
        this.closeAside();
        // Set the opened
        this._toggleOpened(false);
    }
    toggle() {
        // Toggle
        if (this.opened) {
            this.close();
        }
        else {
            this.open();
        }
    }
    openAside(item) {
        // Return if the item is disabled
        if (item.disabled || !item.id) {
            return;
        }
        // Open
        this.activeAsideItemId = item.id;
        // Show the aside overlay
        this._showAsideOverlay();
        // Mark for check
        this._changeDetectorRef.markForCheck();
    }
    closeAside() {
        // Close
        this.activeAsideItemId = null;
        // Hide the aside overlay
        this._hideAsideOverlay();
        // Mark for check
        this._changeDetectorRef.markForCheck();
    }
    toggleAside(item) {
        // Toggle
        if (this.activeAsideItemId === item.id) {
            this.closeAside();
        }
        else {
            this.openAside(item);
        }
    }
    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------
    _enableAnimations() {
        // Return if the animations are already enabled
        if (this._animationsEnabled) {
            return;
        }
        // Enable the animations
        this._animationsEnabled = true;
    }
    _disableAnimations() {
        // Return if the animations are already disabled
        if (!this._animationsEnabled) {
            return;
        }
        // Disable the animations
        this._animationsEnabled = false;
    }
    _showOverlay() {
        // Return if there is already an overlay
        if (this._asideOverlay) {
            return;
        }
        // Create the overlay element
        this._overlay = this._renderer2.createElement('div');
        // Add a class to the overlay element
        this._overlay.classList.add('vertical-navigation-overlay');
        // Add a class depending on the transparentOverlay option
        if (this.transparentOverlay) {
            this._overlay.classList.add('vertical-navigation-overlay-transparent');
        }
        // Append the overlay to the parent of the navigation
        this._renderer2.appendChild(this._elementRef.nativeElement.parentElement, this._overlay);
        // Enable block scroll strategy
        this._scrollStrategy.enable();
        // Create the enter animation and attach it to the player
        this._player = this._animationBuilder
            .build([animate('300ms cubic-bezier(0.25, 0.8, 0.25, 1)', style({ opacity: 1 }))])
            .create(this._overlay);
        // Play the animation
        this._player.play();
        // Add an event listener to the overlay
        this._overlay.addEventListener('click', this._handleOverlayClick);
    }
    _hideOverlay() {
        if (!this._overlay) {
            return;
        }
        // Create the leave animation and attach it to the player
        this._player = this._animationBuilder
            .build([animate('300ms cubic-bezier(0.25, 0.8, 0.25, 1)', style({ opacity: 0 }))])
            .create(this._overlay);
        // Play the animation
        this._player.play();
        // Once the animation is done...
        this._player.onDone(() => {
            // If the overlay still exists...
            if (this._overlay) {
                // Remove the event listener
                this._overlay.removeEventListener('click', this._handleOverlayClick);
                // Remove the overlay
                this._overlay.parentNode?.removeChild(this._overlay);
                this._overlay = null;
            }
            // Disable block scroll strategy
            this._scrollStrategy.disable();
        });
    }
    _showAsideOverlay() {
        // Return if there is already an overlay
        if (this._asideOverlay) {
            return;
        }
        // Create the aside overlay element
        this._asideOverlay = this._renderer2.createElement('div');
        // Add a class to the aside overlay element
        this._asideOverlay.classList.add('vertical-navigation-aside-overlay');
        // Append the aside overlay to the parent of the navigation
        this._renderer2.appendChild(this._elementRef.nativeElement.parentElement, this._asideOverlay);
        // Create the enter animation and attach it to the player
        this._player = this._animationBuilder
            .build([animate('300ms cubic-bezier(0.25, 0.8, 0.25, 1)', style({ opacity: 1 }))])
            .create(this._asideOverlay);
        // Play the animation
        this._player.play();
        // Add an event listener to the aside overlay
        this._asideOverlay.addEventListener('click', this._handleAsideOverlayClick);
    }
    _hideAsideOverlay() {
        if (!this._asideOverlay) {
            return;
        }
        // Create the leave animation and attach it to the player
        this._player = this._animationBuilder
            .build([animate('300ms cubic-bezier(0.25, 0.8, 0.25, 1)', style({ opacity: 0 }))])
            .create(this._asideOverlay);
        // Play the animation
        this._player.play();
        // Once the animation is done...
        this._player.onDone(() => {
            // If the aside overlay still exists...
            if (this._asideOverlay) {
                // Remove the event listener
                this._asideOverlay.removeEventListener('click', this._handleAsideOverlayClick);
                // Remove the aside overlay
                this._asideOverlay.parentNode?.removeChild(this._asideOverlay);
                this._asideOverlay = null;
            }
        });
    }
    _toggleOpened(open) {
        // Set the opened
        this.opened = open;
        // Enable the animations
        this._enableAnimations();
        // If the navigation opened, and the mode
        // is 'over', show the overlay
        if (this.mode === 'over') {
            if (this.opened) {
                this._showOverlay();
            }
            else {
                this._hideOverlay();
            }
        }
        // Execute the observable
        this.openedChanged.next(open);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: VerticalNavigationComponent, deps: [{ token: DOCUMENT }, { token: i1$1.AnimationBuilder }, { token: i0.ChangeDetectorRef }, { token: i0.ElementRef }, { token: i0.Renderer2 }, { token: i1.Router }, { token: i3.ScrollStrategyOptions }, { token: NavigationService }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "18.2.8", type: VerticalNavigationComponent, isStandalone: true, selector: "vertical-navigation", inputs: { appearance: "appearance", autoCollapse: "autoCollapse", inner: "inner", mode: "mode", name: "name", navigation: "navigation", opened: "opened", position: "position", transparentOverlay: "transparentOverlay" }, outputs: { appearanceChanged: "appearanceChanged", modeChanged: "modeChanged", openedChanged: "openedChanged", positionChanged: "positionChanged" }, host: { listeners: { "mouseenter": "_onMouseenter()", "mouseleave": "_onMouseleave()" }, properties: { "class": "this.classList", "style": "this.styleList" } }, viewQueries: [{ propertyName: "_navigationContentEl", first: true, predicate: ["navigationContent"], descendants: true }, { propertyName: "scrollbarDirectives", predicate: ScrollbarDirective, descendants: true }], exportAs: ["verticalNavigation"], usesOnChanges: true, ngImport: i0, template: "<div class=\"vertical-navigation-wrapper\">\n  <!-- Header -->\n  <div class=\"vertical-navigation-header\">\n    <ng-content select=\"[verticalNavigationHeader]\" />\n  </div>\n\n  <!-- Content -->\n  <div\n    #navigationContent\n    class=\"vertical-navigation-content\"\n    scrollbar\n    [scrollbarOptions]=\"{ wheelPropagation: inner, suppressScrollX: true }\"\n  >\n    <!-- Content header -->\n    <div class=\"vertical-navigation-content-header\">\n      <ng-content select=\"[verticalNavigationContentHeader]\" />\n    </div>\n\n    <!-- Items -->\n    @for (item of navigation; track item.id) {\n      <!-- Skip the hidden items -->\n      @if ((item.hidden && !item.hidden(item)) || !item.hidden) {\n        <!-- Aside -->\n        @if (item.type === 'aside') {\n          <vertical-navigation-aside-item\n            [item]=\"item\"\n            [name]=\"name\"\n            [activeItemId]=\"activeAsideItemId\"\n            [autoCollapse]=\"autoCollapse\"\n            [skipChildren]=\"true\"\n            (click)=\"toggleAside(item)\"\n          />\n        }\n\n        <!-- Basic -->\n        @if (item.type === 'basic') {\n          <vertical-navigation-basic-item\n            [item]=\"item\"\n            [name]=\"name\"\n          />\n        }\n\n        <!-- Collapsable -->\n        @if (item.type === 'collapsable') {\n          <vertical-navigation-collapsable-item\n            [item]=\"item\"\n            [name]=\"name\"\n            [autoCollapse]=\"autoCollapse\"\n          />\n        }\n\n        <!-- Divider -->\n        @if (item.type === 'divider') {\n          <vertical-navigation-divider-item\n            [item]=\"item\"\n            [name]=\"name\"\n          />\n        }\n\n        <!-- Group -->\n        @if (item.type === 'group') {\n          <vertical-navigation-group-item\n            [item]=\"item\"\n            [name]=\"name\"\n            [autoCollapse]=\"autoCollapse\"\n          />\n        }\n\n        <!-- Spacer -->\n        @if (item.type === 'spacer') {\n          <vertical-navigation-spacer-item\n            [item]=\"item\"\n            [name]=\"name\"\n          />\n        }\n      }\n    }\n\n    <!-- Content footer -->\n    <div class=\"vertical-navigation-content-footer\">\n      <ng-content select=\"[verticalNavigationContentFooter]\" />\n    </div>\n  </div>\n\n  <!-- Footer -->\n  <div class=\"vertical-navigation-footer\">\n    <ng-content select=\"[verticalNavigationFooter]\" />\n  </div>\n\n  <!-- Background Gradient -->\n  <div class=\"absolute bottom-0 left-0 z-0 vertical-navigation-background-gradient\">\n    <div\n      class=\"relative flex overflow-auto w-28 h-28 rounded-xl blur-2xl opacity-45 dark:opacity-25\"\n    >\n      <span class=\"absolute w-16 h-16 rotate-45 rounded-md -top-1 -right-1 bg-green-rose\"></span>\n      <span\n        class=\"absolute w-16 h-16 rotate-45 rounded-md -bottom-1 -right-1 bg-fuchsia-300\"\n      ></span>\n      <span class=\"absolute w-16 h-16 rotate-45 rounded-md -bottom-1 -left-1 bg-rose-200\"></span>\n    </div>\n  </div>\n</div>\n\n<!-- Aside -->\n@if (activeAsideItemId) {\n  <div\n    class=\"vertical-navigation-aside-wrapper\"\n    scrollbar\n    [scrollbarOptions]=\"{ wheelPropagation: false, suppressScrollX: true }\"\n    [@fadeInLeft]=\"position === 'left'\"\n    [@fadeInRight]=\"position === 'right'\"\n    [@fadeOutLeft]=\"position === 'left'\"\n    [@fadeOutRight]=\"position === 'right'\"\n  >\n    @for (item of navigation; track item.id) {\n      @if ((item.hidden && !item.hidden(item)) || !item.hidden) {\n        @if (item.type === 'aside' && item.id === activeAsideItemId) {\n          <vertical-navigation-aside-item\n            [item]=\"item\"\n            [name]=\"name\"\n            [autoCollapse]=\"autoCollapse\"\n          />\n        }\n      }\n    }\n  </div>\n}\n", styles: [":root{--vertical-navigation-width: 280px}vertical-navigation{position:sticky;display:flex;flex-direction:column;flex:1 0 auto;top:0;width:var(--vertical-navigation-width);min-width:var(--vertical-navigation-width);max-width:var(--vertical-navigation-width);height:100vh;min-height:100vh;max-height:100vh;z-index:51}vertical-navigation.vertical-navigation-animations-enabled{transition-duration:.4s;transition-timing-function:cubic-bezier(.25,.8,.25,1);transition-property:visibility,margin-left,margin-right,transform,width,max-width,min-width}vertical-navigation.vertical-navigation-animations-enabled .vertical-navigation-wrapper{transition-duration:.4s;transition-timing-function:cubic-bezier(.25,.8,.25,1);transition-property:width,max-width,min-width}vertical-navigation.vertical-navigation-mode-over{position:fixed;top:0;bottom:0}vertical-navigation.vertical-navigation-position-left.vertical-navigation-mode-side{margin-left:calc(var(--vertical-navigation-width) * -1)}vertical-navigation.vertical-navigation-position-left.vertical-navigation-mode-side.vertical-navigation-opened{margin-left:0}vertical-navigation.vertical-navigation-position-left.vertical-navigation-mode-over{left:0;transform:translate3d(-100%,0,0)}vertical-navigation.vertical-navigation-position-left.vertical-navigation-mode-over.vertical-navigation-opened{transform:translateZ(0)}vertical-navigation.vertical-navigation-position-left .vertical-navigation-wrapper{left:0}vertical-navigation.vertical-navigation-position-right.vertical-navigation-mode-side{margin-right:calc(var(--vertical-navigation-width) * -1)}vertical-navigation.vertical-navigation-position-right.vertical-navigation-mode-side.vertical-navigation-opened{margin-right:0}vertical-navigation.vertical-navigation-position-right.vertical-navigation-mode-over{right:0;transform:translate3d(100%,0,0)}vertical-navigation.vertical-navigation-position-right.vertical-navigation-mode-over.vertical-navigation-opened{transform:translateZ(0)}vertical-navigation.vertical-navigation-position-right .vertical-navigation-wrapper{right:0}vertical-navigation.vertical-navigation-inner{position:relative;width:auto;min-width:0;max-width:none;height:auto;min-height:0;max-height:none;box-shadow:none}vertical-navigation.vertical-navigation-inner .vertical-navigation-wrapper{position:relative;overflow:visible;height:auto}vertical-navigation.vertical-navigation-inner .vertical-navigation-wrapper .vertical-navigation-content{overflow:visible!important}vertical-navigation .vertical-navigation-wrapper{position:absolute;display:flex;flex:1 1 auto;flex-direction:column;top:0;bottom:0;width:100%;height:100%;overflow:hidden;z-index:10;background:inherit;box-shadow:inset -1px 0 0 var(--border)}vertical-navigation .vertical-navigation-wrapper .vertical-navigation-header{z-index:1}vertical-navigation .vertical-navigation-wrapper .vertical-navigation-content{z-index:1;flex:1 1 auto;overflow-x:hidden;overflow-y:auto;overscroll-behavior:contain;transition:transform .4s ease}vertical-navigation .vertical-navigation-wrapper .vertical-navigation-content>vertical-navigation-divider-item{margin:24px 0}vertical-navigation .vertical-navigation-wrapper .vertical-navigation-content>vertical-navigation-group-item{margin-top:24px}vertical-navigation .vertical-navigation-wrapper .vertical-navigation-content::-webkit-scrollbar{width:0px;background:transparent}vertical-navigation .vertical-navigation-wrapper .vertical-navigation-content:hover::-webkit-scrollbar{width:4px}vertical-navigation .vertical-navigation-wrapper .vertical-navigation-content::-webkit-scrollbar:hover,vertical-navigation .vertical-navigation-wrapper .vertical-navigation-content::-webkit-scrollbar-thumb:hover{width:6px}vertical-navigation .vertical-navigation-wrapper .vertical-navigation-content::-webkit-scrollbar-thumb{background:linear-gradient(175deg,oklch(var(--p)),oklch(var(--a)),oklch(var(--p)))}@media (hover: none){vertical-navigation .vertical-navigation-wrapper .vertical-navigation-content::-webkit-scrollbar{width:6px}}vertical-navigation .vertical-navigation-wrapper .vertical-navigation-footer{z-index:1}vertical-navigation .vertical-navigation-aside-wrapper{position:absolute;display:flex;flex:1 1 auto;flex-direction:column;top:0;bottom:0;left:var(--vertical-navigation-width);width:var(--vertical-navigation-width);height:100%;z-index:5;overflow-x:hidden;overflow-y:auto;-webkit-overflow-scrolling:touch;transition-duration:.4s;transition-property:left,right;transition-timing-function:cubic-bezier(.25,.8,.25,1);background:inherit}vertical-navigation .vertical-navigation-aside-wrapper>vertical-navigation-aside-item{padding:24px 0}vertical-navigation .vertical-navigation-aside-wrapper>vertical-navigation-aside-item>.vertical-navigation-item-wrapper{display:none!important}vertical-navigation.vertical-navigation-position-right .vertical-navigation-aside-wrapper{left:auto;right:var(--vertical-navigation-width)}vertical-navigation vertical-navigation-aside-item,vertical-navigation vertical-navigation-basic-item,vertical-navigation vertical-navigation-collapsable-item,vertical-navigation vertical-navigation-divider-item,vertical-navigation vertical-navigation-group-item,vertical-navigation vertical-navigation-spacer-item{display:flex;flex-direction:column;flex:1 0 auto;-webkit-user-select:none;user-select:none}vertical-navigation vertical-navigation-aside-item .vertical-navigation-item-wrapper .vertical-navigation-item,vertical-navigation vertical-navigation-basic-item .vertical-navigation-item-wrapper .vertical-navigation-item,vertical-navigation vertical-navigation-collapsable-item .vertical-navigation-item-wrapper .vertical-navigation-item,vertical-navigation vertical-navigation-divider-item .vertical-navigation-item-wrapper .vertical-navigation-item,vertical-navigation vertical-navigation-group-item .vertical-navigation-item-wrapper .vertical-navigation-item,vertical-navigation vertical-navigation-spacer-item .vertical-navigation-item-wrapper .vertical-navigation-item{position:relative;display:flex;align-items:center;justify-content:flex-start;padding:10px 16px;font-size:13px;font-weight:500;line-height:20px;text-decoration:none;border-radius:6px}vertical-navigation vertical-navigation-aside-item .vertical-navigation-item-wrapper .vertical-navigation-item.vertical-navigation-item-disabled,vertical-navigation vertical-navigation-basic-item .vertical-navigation-item-wrapper .vertical-navigation-item.vertical-navigation-item-disabled,vertical-navigation vertical-navigation-collapsable-item .vertical-navigation-item-wrapper .vertical-navigation-item.vertical-navigation-item-disabled,vertical-navigation vertical-navigation-divider-item .vertical-navigation-item-wrapper .vertical-navigation-item.vertical-navigation-item-disabled,vertical-navigation vertical-navigation-group-item .vertical-navigation-item-wrapper .vertical-navigation-item.vertical-navigation-item-disabled,vertical-navigation vertical-navigation-spacer-item .vertical-navigation-item-wrapper .vertical-navigation-item.vertical-navigation-item-disabled{cursor:default;opacity:.4}vertical-navigation vertical-navigation-aside-item .vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-icon,vertical-navigation vertical-navigation-basic-item .vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-icon,vertical-navigation vertical-navigation-collapsable-item .vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-icon,vertical-navigation vertical-navigation-divider-item .vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-icon,vertical-navigation vertical-navigation-group-item .vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-icon,vertical-navigation vertical-navigation-spacer-item .vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-icon{margin-right:16px}vertical-navigation vertical-navigation-aside-item .vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-title-wrapper .vertical-navigation-item-subtitle,vertical-navigation vertical-navigation-basic-item .vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-title-wrapper .vertical-navigation-item-subtitle,vertical-navigation vertical-navigation-collapsable-item .vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-title-wrapper .vertical-navigation-item-subtitle,vertical-navigation vertical-navigation-divider-item .vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-title-wrapper .vertical-navigation-item-subtitle,vertical-navigation vertical-navigation-group-item .vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-title-wrapper .vertical-navigation-item-subtitle,vertical-navigation vertical-navigation-spacer-item .vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-title-wrapper .vertical-navigation-item-subtitle{font-size:11px;line-height:1.5}vertical-navigation vertical-navigation-aside-item .vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-badge,vertical-navigation vertical-navigation-basic-item .vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-badge,vertical-navigation vertical-navigation-collapsable-item .vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-badge,vertical-navigation vertical-navigation-divider-item .vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-badge,vertical-navigation vertical-navigation-group-item .vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-badge,vertical-navigation vertical-navigation-spacer-item .vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-badge{margin-left:auto}vertical-navigation vertical-navigation-aside-item .vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-badge .vertical-navigation-item-badge-content,vertical-navigation vertical-navigation-basic-item .vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-badge .vertical-navigation-item-badge-content,vertical-navigation vertical-navigation-collapsable-item .vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-badge .vertical-navigation-item-badge-content,vertical-navigation vertical-navigation-divider-item .vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-badge .vertical-navigation-item-badge-content,vertical-navigation vertical-navigation-group-item .vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-badge .vertical-navigation-item-badge-content,vertical-navigation vertical-navigation-spacer-item .vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-badge .vertical-navigation-item-badge-content{display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:600;white-space:nowrap;height:20px}vertical-navigation vertical-navigation-aside-item>.vertical-navigation-item-wrapper,vertical-navigation vertical-navigation-basic-item>.vertical-navigation-item-wrapper,vertical-navigation vertical-navigation-collapsable-item>.vertical-navigation-item-wrapper,vertical-navigation vertical-navigation-group-item>.vertical-navigation-item-wrapper{margin:0 12px}vertical-navigation vertical-navigation-aside-item,vertical-navigation vertical-navigation-basic-item,vertical-navigation vertical-navigation-collapsable-item{margin-bottom:4px}vertical-navigation vertical-navigation-aside-item .vertical-navigation-item,vertical-navigation vertical-navigation-basic-item .vertical-navigation-item,vertical-navigation vertical-navigation-collapsable-item .vertical-navigation-item{cursor:pointer}vertical-navigation vertical-navigation-collapsable-item>.vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-badge+.vertical-navigation-item-arrow{margin-left:8px}vertical-navigation vertical-navigation-collapsable-item>.vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-arrow{height:20px;line-height:20px;margin-left:auto;transition:transform .3s cubic-bezier(.25,.8,.25,1),color 375ms cubic-bezier(.25,.8,.25,1)}vertical-navigation vertical-navigation-collapsable-item.vertical-navigation-item-expanded>.vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-arrow{transform:rotate(90deg)}vertical-navigation vertical-navigation-collapsable-item>.vertical-navigation-item-children>*:first-child{margin-top:6px}vertical-navigation vertical-navigation-collapsable-item>.vertical-navigation-item-children>*:last-child{padding-bottom:6px}vertical-navigation vertical-navigation-collapsable-item>.vertical-navigation-item-children>*:last-child>.vertical-navigation-item-children>*:last-child{padding-bottom:0}vertical-navigation vertical-navigation-collapsable-item>.vertical-navigation-item-children .vertical-navigation-item{padding:10px 16px}vertical-navigation vertical-navigation-collapsable-item .vertical-navigation-item-children{overflow:hidden}vertical-navigation vertical-navigation-collapsable-item .vertical-navigation-item-children .vertical-navigation-item{padding-left:56px}vertical-navigation vertical-navigation-collapsable-item .vertical-navigation-item-children .vertical-navigation-item-children .vertical-navigation-item{padding-left:72px}vertical-navigation vertical-navigation-collapsable-item .vertical-navigation-item-children .vertical-navigation-item-children .vertical-navigation-item-children .vertical-navigation-item{padding-left:88px}vertical-navigation vertical-navigation-collapsable-item .vertical-navigation-item-children .vertical-navigation-item-children .vertical-navigation-item-children .vertical-navigation-item-children .vertical-navigation-item{padding-left:104px}vertical-navigation vertical-navigation-divider-item{margin:12px 0}vertical-navigation vertical-navigation-divider-item .vertical-navigation-item-wrapper{height:1px}vertical-navigation vertical-navigation-group-item>.vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-badge,vertical-navigation vertical-navigation-group-item>.vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-icon{display:none!important}vertical-navigation vertical-navigation-group-item>.vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-title-wrapper .vertical-navigation-item-title{font-size:12px;font-weight:600;letter-spacing:.05em;text-transform:uppercase}vertical-navigation vertical-navigation-spacer-item{margin:6px 0}.vertical-navigation-overlay{position:absolute;inset:0;z-index:50;opacity:0;background-color:#0009}.vertical-navigation-overlay+.vertical-navigation-aside-overlay{background-color:transparent}.vertical-navigation-aside-overlay{position:absolute;inset:0;z-index:169;opacity:0;background-color:#0000004d}vertical-navigation-aside-item .vertical-navigation-item-wrapper .vertical-navigation-item,vertical-navigation-basic-item .vertical-navigation-item-wrapper .vertical-navigation-item,vertical-navigation-collapsable-item .vertical-navigation-item-wrapper .vertical-navigation-item,vertical-navigation-group-item .vertical-navigation-item-wrapper .vertical-navigation-item{color:currentColor}vertical-navigation-aside-item .vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-icon,vertical-navigation-basic-item .vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-icon,vertical-navigation-collapsable-item .vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-icon,vertical-navigation-group-item .vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-icon{color:currentColor;opacity:.6}vertical-navigation-aside-item .vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-title-wrapper .vertical-navigation-item-title,vertical-navigation-basic-item .vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-title-wrapper .vertical-navigation-item-title,vertical-navigation-collapsable-item .vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-title-wrapper .vertical-navigation-item-title,vertical-navigation-group-item .vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-title-wrapper .vertical-navigation-item-title{color:currentColor;opacity:.8}vertical-navigation-aside-item .vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-title-wrapper .vertical-navigation-item-subtitle,vertical-navigation-basic-item .vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-title-wrapper .vertical-navigation-item-subtitle,vertical-navigation-collapsable-item .vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-title-wrapper .vertical-navigation-item-subtitle,vertical-navigation-group-item .vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-title-wrapper .vertical-navigation-item-subtitle{color:currentColor;opacity:.5}vertical-navigation-aside-item>.vertical-navigation-item-wrapper .vertical-navigation-item:not(.vertical-navigation-item-disabled).vertical-navigation-item-active,vertical-navigation-aside-item>.vertical-navigation-item-wrapper .vertical-navigation-item:not(.vertical-navigation-item-disabled).vertical-navigation-item-active-forced,vertical-navigation-basic-item>.vertical-navigation-item-wrapper .vertical-navigation-item:not(.vertical-navigation-item-disabled).vertical-navigation-item-active,vertical-navigation-basic-item>.vertical-navigation-item-wrapper .vertical-navigation-item:not(.vertical-navigation-item-disabled).vertical-navigation-item-active-forced,vertical-navigation-collapsable-item>.vertical-navigation-item-wrapper .vertical-navigation-item:not(.vertical-navigation-item-disabled).vertical-navigation-item-active,vertical-navigation-collapsable-item>.vertical-navigation-item-wrapper .vertical-navigation-item:not(.vertical-navigation-item-disabled).vertical-navigation-item-active-forced{background-color:rgba(var(--navigation-item-active-bg-rgb),var(--navigation-item-active-bg-opacity))}vertical-navigation-aside-item>.vertical-navigation-item-wrapper .vertical-navigation-item:not(.vertical-navigation-item-disabled).vertical-navigation-item-active .vertical-navigation-item-icon,vertical-navigation-aside-item>.vertical-navigation-item-wrapper .vertical-navigation-item:not(.vertical-navigation-item-disabled).vertical-navigation-item-active-forced .vertical-navigation-item-icon,vertical-navigation-basic-item>.vertical-navigation-item-wrapper .vertical-navigation-item:not(.vertical-navigation-item-disabled).vertical-navigation-item-active .vertical-navigation-item-icon,vertical-navigation-basic-item>.vertical-navigation-item-wrapper .vertical-navigation-item:not(.vertical-navigation-item-disabled).vertical-navigation-item-active-forced .vertical-navigation-item-icon,vertical-navigation-collapsable-item>.vertical-navigation-item-wrapper .vertical-navigation-item:not(.vertical-navigation-item-disabled).vertical-navigation-item-active .vertical-navigation-item-icon,vertical-navigation-collapsable-item>.vertical-navigation-item-wrapper .vertical-navigation-item:not(.vertical-navigation-item-disabled).vertical-navigation-item-active-forced .vertical-navigation-item-icon{opacity:1}vertical-navigation-aside-item>.vertical-navigation-item-wrapper .vertical-navigation-item:not(.vertical-navigation-item-disabled).vertical-navigation-item-active .vertical-navigation-item-title,vertical-navigation-aside-item>.vertical-navigation-item-wrapper .vertical-navigation-item:not(.vertical-navigation-item-disabled).vertical-navigation-item-active-forced .vertical-navigation-item-title,vertical-navigation-basic-item>.vertical-navigation-item-wrapper .vertical-navigation-item:not(.vertical-navigation-item-disabled).vertical-navigation-item-active .vertical-navigation-item-title,vertical-navigation-basic-item>.vertical-navigation-item-wrapper .vertical-navigation-item:not(.vertical-navigation-item-disabled).vertical-navigation-item-active-forced .vertical-navigation-item-title,vertical-navigation-collapsable-item>.vertical-navigation-item-wrapper .vertical-navigation-item:not(.vertical-navigation-item-disabled).vertical-navigation-item-active .vertical-navigation-item-title,vertical-navigation-collapsable-item>.vertical-navigation-item-wrapper .vertical-navigation-item:not(.vertical-navigation-item-disabled).vertical-navigation-item-active-forced .vertical-navigation-item-title{opacity:1}vertical-navigation-aside-item>.vertical-navigation-item-wrapper .vertical-navigation-item:not(.vertical-navigation-item-disabled).vertical-navigation-item-active .vertical-navigation-item-subtitle,vertical-navigation-aside-item>.vertical-navigation-item-wrapper .vertical-navigation-item:not(.vertical-navigation-item-disabled).vertical-navigation-item-active-forced .vertical-navigation-item-subtitle,vertical-navigation-basic-item>.vertical-navigation-item-wrapper .vertical-navigation-item:not(.vertical-navigation-item-disabled).vertical-navigation-item-active .vertical-navigation-item-subtitle,vertical-navigation-basic-item>.vertical-navigation-item-wrapper .vertical-navigation-item:not(.vertical-navigation-item-disabled).vertical-navigation-item-active-forced .vertical-navigation-item-subtitle,vertical-navigation-collapsable-item>.vertical-navigation-item-wrapper .vertical-navigation-item:not(.vertical-navigation-item-disabled).vertical-navigation-item-active .vertical-navigation-item-subtitle,vertical-navigation-collapsable-item>.vertical-navigation-item-wrapper .vertical-navigation-item:not(.vertical-navigation-item-disabled).vertical-navigation-item-active-forced .vertical-navigation-item-subtitle{opacity:1}vertical-navigation-aside-item>.vertical-navigation-item-wrapper .vertical-navigation-item:not(.vertical-navigation-item-active-forced):not(.vertical-navigation-item-active):not(.vertical-navigation-item-disabled):hover,vertical-navigation-basic-item>.vertical-navigation-item-wrapper .vertical-navigation-item:not(.vertical-navigation-item-active-forced):not(.vertical-navigation-item-active):not(.vertical-navigation-item-disabled):hover,vertical-navigation-collapsable-item>.vertical-navigation-item-wrapper .vertical-navigation-item:not(.vertical-navigation-item-active-forced):not(.vertical-navigation-item-active):not(.vertical-navigation-item-disabled):hover{background-color:rgba(var(--navigation-item-active-bg-rgb)/var(--navigation-item-active-bg-opacity))}vertical-navigation-aside-item>.vertical-navigation-item-wrapper .vertical-navigation-item:not(.vertical-navigation-item-active-forced):not(.vertical-navigation-item-active):not(.vertical-navigation-item-disabled):hover .vertical-navigation-item-icon,vertical-navigation-basic-item>.vertical-navigation-item-wrapper .vertical-navigation-item:not(.vertical-navigation-item-active-forced):not(.vertical-navigation-item-active):not(.vertical-navigation-item-disabled):hover .vertical-navigation-item-icon,vertical-navigation-collapsable-item>.vertical-navigation-item-wrapper .vertical-navigation-item:not(.vertical-navigation-item-active-forced):not(.vertical-navigation-item-active):not(.vertical-navigation-item-disabled):hover .vertical-navigation-item-icon{opacity:1}vertical-navigation-aside-item>.vertical-navigation-item-wrapper .vertical-navigation-item:not(.vertical-navigation-item-active-forced):not(.vertical-navigation-item-active):not(.vertical-navigation-item-disabled):hover .vertical-navigation-item-title,vertical-navigation-aside-item>.vertical-navigation-item-wrapper .vertical-navigation-item:not(.vertical-navigation-item-active-forced):not(.vertical-navigation-item-active):not(.vertical-navigation-item-disabled):hover .vertical-navigation-item-arrow,vertical-navigation-basic-item>.vertical-navigation-item-wrapper .vertical-navigation-item:not(.vertical-navigation-item-active-forced):not(.vertical-navigation-item-active):not(.vertical-navigation-item-disabled):hover .vertical-navigation-item-title,vertical-navigation-basic-item>.vertical-navigation-item-wrapper .vertical-navigation-item:not(.vertical-navigation-item-active-forced):not(.vertical-navigation-item-active):not(.vertical-navigation-item-disabled):hover .vertical-navigation-item-arrow,vertical-navigation-collapsable-item>.vertical-navigation-item-wrapper .vertical-navigation-item:not(.vertical-navigation-item-active-forced):not(.vertical-navigation-item-active):not(.vertical-navigation-item-disabled):hover .vertical-navigation-item-title,vertical-navigation-collapsable-item>.vertical-navigation-item-wrapper .vertical-navigation-item:not(.vertical-navigation-item-active-forced):not(.vertical-navigation-item-active):not(.vertical-navigation-item-disabled):hover .vertical-navigation-item-arrow{opacity:1}vertical-navigation-aside-item>.vertical-navigation-item-wrapper .vertical-navigation-item:not(.vertical-navigation-item-active-forced):not(.vertical-navigation-item-active):not(.vertical-navigation-item-disabled):hover .vertical-navigation-item-subtitle,vertical-navigation-basic-item>.vertical-navigation-item-wrapper .vertical-navigation-item:not(.vertical-navigation-item-active-forced):not(.vertical-navigation-item-active):not(.vertical-navigation-item-disabled):hover .vertical-navigation-item-subtitle,vertical-navigation-collapsable-item>.vertical-navigation-item-wrapper .vertical-navigation-item:not(.vertical-navigation-item-active-forced):not(.vertical-navigation-item-active):not(.vertical-navigation-item-disabled):hover .vertical-navigation-item-subtitle{opacity:1}vertical-navigation-collapsable-item.vertical-navigation-item-expanded>.vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-icon{opacity:1}vertical-navigation-collapsable-item.vertical-navigation-item-expanded>.vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-title,vertical-navigation-collapsable-item.vertical-navigation-item-expanded>.vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-arrow{opacity:1}vertical-navigation-collapsable-item.vertical-navigation-item-expanded>.vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-subtitle{opacity:1}vertical-navigation-group-item>.vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-title-wrapper .vertical-navigation-item-title{opacity:1;color:var(--fallback-p, oklch(var(--p)))}:root{--vertical-navigation-width: 280px;--vertical-navigation-dense-width: 80px}vertical-navigation.vertical-navigation-appearance-dense:not(.vertical-navigation-mode-over){width:var(--vertical-navigation-dense-width);min-width:var(--vertical-navigation-dense-width);max-width:var(--vertical-navigation-dense-width)}vertical-navigation.vertical-navigation-appearance-dense:not(.vertical-navigation-mode-over).vertical-navigation-position-left.vertical-navigation-mode-side{margin-left:calc(var(--vertical-navigation-dense-width) * -1)}vertical-navigation.vertical-navigation-appearance-dense:not(.vertical-navigation-mode-over).vertical-navigation-position-left.vertical-navigation-opened{margin-left:0}vertical-navigation.vertical-navigation-appearance-dense:not(.vertical-navigation-mode-over).vertical-navigation-position-right.vertical-navigation-mode-side{margin-right:calc(var(--vertical-navigation-dense-width) * -1)}vertical-navigation.vertical-navigation-appearance-dense:not(.vertical-navigation-mode-over).vertical-navigation-position-right.vertical-navigation-opened{margin-right:0}vertical-navigation.vertical-navigation-appearance-dense:not(.vertical-navigation-mode-over).vertical-navigation-position-right .vertical-navigation-aside-wrapper{left:auto;right:var(--vertical-navigation-dense-width)}vertical-navigation.vertical-navigation-appearance-dense:not(.vertical-navigation-mode-over).vertical-navigation-position-right.vertical-navigation-hover .vertical-navigation-aside-wrapper{left:auto;right:var(--vertical-navigation-width)}vertical-navigation.vertical-navigation-appearance-dense .vertical-navigation-wrapper .vertical-navigation-content vertical-navigation-aside-item .vertical-navigation-item-wrapper .vertical-navigation-item,vertical-navigation.vertical-navigation-appearance-dense .vertical-navigation-wrapper .vertical-navigation-content vertical-navigation-basic-item .vertical-navigation-item-wrapper .vertical-navigation-item,vertical-navigation.vertical-navigation-appearance-dense .vertical-navigation-wrapper .vertical-navigation-content vertical-navigation-collapsable-item .vertical-navigation-item-wrapper .vertical-navigation-item,vertical-navigation.vertical-navigation-appearance-dense .vertical-navigation-wrapper .vertical-navigation-content vertical-navigation-group-item .vertical-navigation-item-wrapper .vertical-navigation-item{width:calc(var(--vertical-navigation-dense-width) - 24px);min-width:calc(var(--vertical-navigation-dense-width) - 24px);max-width:calc(var(--vertical-navigation-dense-width) - 24px)}vertical-navigation.vertical-navigation-appearance-dense .vertical-navigation-wrapper .vertical-navigation-content vertical-navigation-aside-item .vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-arrow,vertical-navigation.vertical-navigation-appearance-dense .vertical-navigation-wrapper .vertical-navigation-content vertical-navigation-aside-item .vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-badge,vertical-navigation.vertical-navigation-appearance-dense .vertical-navigation-wrapper .vertical-navigation-content vertical-navigation-aside-item .vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-title-wrapper,vertical-navigation.vertical-navigation-appearance-dense .vertical-navigation-wrapper .vertical-navigation-content vertical-navigation-basic-item .vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-arrow,vertical-navigation.vertical-navigation-appearance-dense .vertical-navigation-wrapper .vertical-navigation-content vertical-navigation-basic-item .vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-badge,vertical-navigation.vertical-navigation-appearance-dense .vertical-navigation-wrapper .vertical-navigation-content vertical-navigation-basic-item .vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-title-wrapper,vertical-navigation.vertical-navigation-appearance-dense .vertical-navigation-wrapper .vertical-navigation-content vertical-navigation-collapsable-item .vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-arrow,vertical-navigation.vertical-navigation-appearance-dense .vertical-navigation-wrapper .vertical-navigation-content vertical-navigation-collapsable-item .vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-badge,vertical-navigation.vertical-navigation-appearance-dense .vertical-navigation-wrapper .vertical-navigation-content vertical-navigation-collapsable-item .vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-title-wrapper,vertical-navigation.vertical-navigation-appearance-dense .vertical-navigation-wrapper .vertical-navigation-content vertical-navigation-group-item .vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-arrow,vertical-navigation.vertical-navigation-appearance-dense .vertical-navigation-wrapper .vertical-navigation-content vertical-navigation-group-item .vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-badge,vertical-navigation.vertical-navigation-appearance-dense .vertical-navigation-wrapper .vertical-navigation-content vertical-navigation-group-item .vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-title-wrapper{transition:opacity .4s cubic-bezier(.25,.8,.25,1)}vertical-navigation.vertical-navigation-appearance-dense .vertical-navigation-wrapper .vertical-navigation-content vertical-navigation-group-item:first-of-type{margin-top:0}vertical-navigation.vertical-navigation-appearance-dense:not(.vertical-navigation-hover):not(.vertical-navigation-mode-over) .vertical-navigation-wrapper .vertical-navigation-content .vertical-navigation-item-wrapper .vertical-navigation-item{padding:10px 16px}vertical-navigation.vertical-navigation-appearance-dense:not(.vertical-navigation-hover):not(.vertical-navigation-mode-over) .vertical-navigation-wrapper .vertical-navigation-content .vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-arrow,vertical-navigation.vertical-navigation-appearance-dense:not(.vertical-navigation-hover):not(.vertical-navigation-mode-over) .vertical-navigation-wrapper .vertical-navigation-content .vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-badge,vertical-navigation.vertical-navigation-appearance-dense:not(.vertical-navigation-hover):not(.vertical-navigation-mode-over) .vertical-navigation-wrapper .vertical-navigation-content .vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-title-wrapper{white-space:nowrap;opacity:0}vertical-navigation.vertical-navigation-appearance-dense:not(.vertical-navigation-hover):not(.vertical-navigation-mode-over) .vertical-navigation-wrapper .vertical-navigation-content vertical-navigation-collapsable-item .vertical-navigation-item-children{display:none}vertical-navigation.vertical-navigation-appearance-dense:not(.vertical-navigation-hover):not(.vertical-navigation-mode-over) .vertical-navigation-wrapper .vertical-navigation-content vertical-navigation-group-item>.vertical-navigation-item-wrapper .vertical-navigation-item:before{content:\"\";position:absolute;top:20px;width:23px;border-top-width:2px}vertical-navigation.vertical-navigation-appearance-dense .vertical-navigation-aside-wrapper{left:var(--vertical-navigation-dense-width)}vertical-navigation.vertical-navigation-appearance-dense .vertical-navigation-background-gradient{display:none}vertical-navigation.vertical-navigation-appearance-dense.vertical-navigation-hover .vertical-navigation-wrapper{width:var(--vertical-navigation-width)}vertical-navigation.vertical-navigation-appearance-dense.vertical-navigation-hover .vertical-navigation-wrapper .vertical-navigation-content .vertical-navigation-item-wrapper .vertical-navigation-item{width:calc(var(--vertical-navigation-width) - 24px);min-width:calc(var(--vertical-navigation-width) - 24px);max-width:calc(var(--vertical-navigation-width) - 24px)}vertical-navigation.vertical-navigation-appearance-dense.vertical-navigation-hover .vertical-navigation-wrapper .vertical-navigation-content .vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-arrow,vertical-navigation.vertical-navigation-appearance-dense.vertical-navigation-hover .vertical-navigation-wrapper .vertical-navigation-content .vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-badge,vertical-navigation.vertical-navigation-appearance-dense.vertical-navigation-hover .vertical-navigation-wrapper .vertical-navigation-content .vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-title-wrapper{white-space:nowrap;animation:removeWhiteSpaceNoWrap 1ms linear .35s;animation-fill-mode:forwards}vertical-navigation.vertical-navigation-appearance-dense.vertical-navigation-hover .vertical-navigation-aside-wrapper{left:var(--vertical-navigation-width)}vertical-navigation.vertical-navigation-appearance-dense.vertical-navigation-hover .vertical-navigation-background-gradient{display:block}@keyframes removeWhiteSpaceNoWrap{0%{white-space:nowrap}99%{white-space:nowrap}to{white-space:normal}}\n"], dependencies: [{ kind: "directive", type: ScrollbarDirective, selector: "[scrollbar]", inputs: ["scrollbar", "scrollbarOptions"], exportAs: ["scrollbar"] }, { kind: "component", type: VerticalNavigationBasicItemComponent, selector: "vertical-navigation-basic-item", inputs: ["item", "name"] }, { kind: "component", type: VerticalNavigationGroupItemComponent, selector: "vertical-navigation-group-item", inputs: ["autoCollapse", "item", "name"] }, { kind: "component", type: VerticalNavigationAsideItemComponent, selector: "vertical-navigation-aside-item", inputs: ["activeItemId", "autoCollapse", "item", "name", "skipChildren"] }, { kind: "component", type: VerticalNavigationCollapsableItemComponent, selector: "vertical-navigation-collapsable-item", inputs: ["autoCollapse", "item", "name"] }, { kind: "component", type: VerticalNavigationDividerItemComponent, selector: "vertical-navigation-divider-item", inputs: ["item", "name"] }, { kind: "component", type: VerticalNavigationSpacerItemComponent, selector: "vertical-navigation-spacer-item", inputs: ["item", "name"] }], animations: [fadeInLeft, fadeInRight, fadeOutLeft, fadeOutRight], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: VerticalNavigationComponent, decorators: [{
            type: Component,
            args: [{ standalone: true, selector: 'vertical-navigation', encapsulation: ViewEncapsulation.None, changeDetection: ChangeDetectionStrategy.OnPush, exportAs: 'verticalNavigation', animations: [fadeInLeft, fadeInRight, fadeOutLeft, fadeOutRight], imports: [
                        ScrollbarDirective,
                        VerticalNavigationBasicItemComponent,
                        VerticalNavigationGroupItemComponent,
                        VerticalNavigationAsideItemComponent,
                        VerticalNavigationCollapsableItemComponent,
                        VerticalNavigationDividerItemComponent,
                        VerticalNavigationSpacerItemComponent,
                    ], template: "<div class=\"vertical-navigation-wrapper\">\n  <!-- Header -->\n  <div class=\"vertical-navigation-header\">\n    <ng-content select=\"[verticalNavigationHeader]\" />\n  </div>\n\n  <!-- Content -->\n  <div\n    #navigationContent\n    class=\"vertical-navigation-content\"\n    scrollbar\n    [scrollbarOptions]=\"{ wheelPropagation: inner, suppressScrollX: true }\"\n  >\n    <!-- Content header -->\n    <div class=\"vertical-navigation-content-header\">\n      <ng-content select=\"[verticalNavigationContentHeader]\" />\n    </div>\n\n    <!-- Items -->\n    @for (item of navigation; track item.id) {\n      <!-- Skip the hidden items -->\n      @if ((item.hidden && !item.hidden(item)) || !item.hidden) {\n        <!-- Aside -->\n        @if (item.type === 'aside') {\n          <vertical-navigation-aside-item\n            [item]=\"item\"\n            [name]=\"name\"\n            [activeItemId]=\"activeAsideItemId\"\n            [autoCollapse]=\"autoCollapse\"\n            [skipChildren]=\"true\"\n            (click)=\"toggleAside(item)\"\n          />\n        }\n\n        <!-- Basic -->\n        @if (item.type === 'basic') {\n          <vertical-navigation-basic-item\n            [item]=\"item\"\n            [name]=\"name\"\n          />\n        }\n\n        <!-- Collapsable -->\n        @if (item.type === 'collapsable') {\n          <vertical-navigation-collapsable-item\n            [item]=\"item\"\n            [name]=\"name\"\n            [autoCollapse]=\"autoCollapse\"\n          />\n        }\n\n        <!-- Divider -->\n        @if (item.type === 'divider') {\n          <vertical-navigation-divider-item\n            [item]=\"item\"\n            [name]=\"name\"\n          />\n        }\n\n        <!-- Group -->\n        @if (item.type === 'group') {\n          <vertical-navigation-group-item\n            [item]=\"item\"\n            [name]=\"name\"\n            [autoCollapse]=\"autoCollapse\"\n          />\n        }\n\n        <!-- Spacer -->\n        @if (item.type === 'spacer') {\n          <vertical-navigation-spacer-item\n            [item]=\"item\"\n            [name]=\"name\"\n          />\n        }\n      }\n    }\n\n    <!-- Content footer -->\n    <div class=\"vertical-navigation-content-footer\">\n      <ng-content select=\"[verticalNavigationContentFooter]\" />\n    </div>\n  </div>\n\n  <!-- Footer -->\n  <div class=\"vertical-navigation-footer\">\n    <ng-content select=\"[verticalNavigationFooter]\" />\n  </div>\n\n  <!-- Background Gradient -->\n  <div class=\"absolute bottom-0 left-0 z-0 vertical-navigation-background-gradient\">\n    <div\n      class=\"relative flex overflow-auto w-28 h-28 rounded-xl blur-2xl opacity-45 dark:opacity-25\"\n    >\n      <span class=\"absolute w-16 h-16 rotate-45 rounded-md -top-1 -right-1 bg-green-rose\"></span>\n      <span\n        class=\"absolute w-16 h-16 rotate-45 rounded-md -bottom-1 -right-1 bg-fuchsia-300\"\n      ></span>\n      <span class=\"absolute w-16 h-16 rotate-45 rounded-md -bottom-1 -left-1 bg-rose-200\"></span>\n    </div>\n  </div>\n</div>\n\n<!-- Aside -->\n@if (activeAsideItemId) {\n  <div\n    class=\"vertical-navigation-aside-wrapper\"\n    scrollbar\n    [scrollbarOptions]=\"{ wheelPropagation: false, suppressScrollX: true }\"\n    [@fadeInLeft]=\"position === 'left'\"\n    [@fadeInRight]=\"position === 'right'\"\n    [@fadeOutLeft]=\"position === 'left'\"\n    [@fadeOutRight]=\"position === 'right'\"\n  >\n    @for (item of navigation; track item.id) {\n      @if ((item.hidden && !item.hidden(item)) || !item.hidden) {\n        @if (item.type === 'aside' && item.id === activeAsideItemId) {\n          <vertical-navigation-aside-item\n            [item]=\"item\"\n            [name]=\"name\"\n            [autoCollapse]=\"autoCollapse\"\n          />\n        }\n      }\n    }\n  </div>\n}\n", styles: [":root{--vertical-navigation-width: 280px}vertical-navigation{position:sticky;display:flex;flex-direction:column;flex:1 0 auto;top:0;width:var(--vertical-navigation-width);min-width:var(--vertical-navigation-width);max-width:var(--vertical-navigation-width);height:100vh;min-height:100vh;max-height:100vh;z-index:51}vertical-navigation.vertical-navigation-animations-enabled{transition-duration:.4s;transition-timing-function:cubic-bezier(.25,.8,.25,1);transition-property:visibility,margin-left,margin-right,transform,width,max-width,min-width}vertical-navigation.vertical-navigation-animations-enabled .vertical-navigation-wrapper{transition-duration:.4s;transition-timing-function:cubic-bezier(.25,.8,.25,1);transition-property:width,max-width,min-width}vertical-navigation.vertical-navigation-mode-over{position:fixed;top:0;bottom:0}vertical-navigation.vertical-navigation-position-left.vertical-navigation-mode-side{margin-left:calc(var(--vertical-navigation-width) * -1)}vertical-navigation.vertical-navigation-position-left.vertical-navigation-mode-side.vertical-navigation-opened{margin-left:0}vertical-navigation.vertical-navigation-position-left.vertical-navigation-mode-over{left:0;transform:translate3d(-100%,0,0)}vertical-navigation.vertical-navigation-position-left.vertical-navigation-mode-over.vertical-navigation-opened{transform:translateZ(0)}vertical-navigation.vertical-navigation-position-left .vertical-navigation-wrapper{left:0}vertical-navigation.vertical-navigation-position-right.vertical-navigation-mode-side{margin-right:calc(var(--vertical-navigation-width) * -1)}vertical-navigation.vertical-navigation-position-right.vertical-navigation-mode-side.vertical-navigation-opened{margin-right:0}vertical-navigation.vertical-navigation-position-right.vertical-navigation-mode-over{right:0;transform:translate3d(100%,0,0)}vertical-navigation.vertical-navigation-position-right.vertical-navigation-mode-over.vertical-navigation-opened{transform:translateZ(0)}vertical-navigation.vertical-navigation-position-right .vertical-navigation-wrapper{right:0}vertical-navigation.vertical-navigation-inner{position:relative;width:auto;min-width:0;max-width:none;height:auto;min-height:0;max-height:none;box-shadow:none}vertical-navigation.vertical-navigation-inner .vertical-navigation-wrapper{position:relative;overflow:visible;height:auto}vertical-navigation.vertical-navigation-inner .vertical-navigation-wrapper .vertical-navigation-content{overflow:visible!important}vertical-navigation .vertical-navigation-wrapper{position:absolute;display:flex;flex:1 1 auto;flex-direction:column;top:0;bottom:0;width:100%;height:100%;overflow:hidden;z-index:10;background:inherit;box-shadow:inset -1px 0 0 var(--border)}vertical-navigation .vertical-navigation-wrapper .vertical-navigation-header{z-index:1}vertical-navigation .vertical-navigation-wrapper .vertical-navigation-content{z-index:1;flex:1 1 auto;overflow-x:hidden;overflow-y:auto;overscroll-behavior:contain;transition:transform .4s ease}vertical-navigation .vertical-navigation-wrapper .vertical-navigation-content>vertical-navigation-divider-item{margin:24px 0}vertical-navigation .vertical-navigation-wrapper .vertical-navigation-content>vertical-navigation-group-item{margin-top:24px}vertical-navigation .vertical-navigation-wrapper .vertical-navigation-content::-webkit-scrollbar{width:0px;background:transparent}vertical-navigation .vertical-navigation-wrapper .vertical-navigation-content:hover::-webkit-scrollbar{width:4px}vertical-navigation .vertical-navigation-wrapper .vertical-navigation-content::-webkit-scrollbar:hover,vertical-navigation .vertical-navigation-wrapper .vertical-navigation-content::-webkit-scrollbar-thumb:hover{width:6px}vertical-navigation .vertical-navigation-wrapper .vertical-navigation-content::-webkit-scrollbar-thumb{background:linear-gradient(175deg,oklch(var(--p)),oklch(var(--a)),oklch(var(--p)))}@media (hover: none){vertical-navigation .vertical-navigation-wrapper .vertical-navigation-content::-webkit-scrollbar{width:6px}}vertical-navigation .vertical-navigation-wrapper .vertical-navigation-footer{z-index:1}vertical-navigation .vertical-navigation-aside-wrapper{position:absolute;display:flex;flex:1 1 auto;flex-direction:column;top:0;bottom:0;left:var(--vertical-navigation-width);width:var(--vertical-navigation-width);height:100%;z-index:5;overflow-x:hidden;overflow-y:auto;-webkit-overflow-scrolling:touch;transition-duration:.4s;transition-property:left,right;transition-timing-function:cubic-bezier(.25,.8,.25,1);background:inherit}vertical-navigation .vertical-navigation-aside-wrapper>vertical-navigation-aside-item{padding:24px 0}vertical-navigation .vertical-navigation-aside-wrapper>vertical-navigation-aside-item>.vertical-navigation-item-wrapper{display:none!important}vertical-navigation.vertical-navigation-position-right .vertical-navigation-aside-wrapper{left:auto;right:var(--vertical-navigation-width)}vertical-navigation vertical-navigation-aside-item,vertical-navigation vertical-navigation-basic-item,vertical-navigation vertical-navigation-collapsable-item,vertical-navigation vertical-navigation-divider-item,vertical-navigation vertical-navigation-group-item,vertical-navigation vertical-navigation-spacer-item{display:flex;flex-direction:column;flex:1 0 auto;-webkit-user-select:none;user-select:none}vertical-navigation vertical-navigation-aside-item .vertical-navigation-item-wrapper .vertical-navigation-item,vertical-navigation vertical-navigation-basic-item .vertical-navigation-item-wrapper .vertical-navigation-item,vertical-navigation vertical-navigation-collapsable-item .vertical-navigation-item-wrapper .vertical-navigation-item,vertical-navigation vertical-navigation-divider-item .vertical-navigation-item-wrapper .vertical-navigation-item,vertical-navigation vertical-navigation-group-item .vertical-navigation-item-wrapper .vertical-navigation-item,vertical-navigation vertical-navigation-spacer-item .vertical-navigation-item-wrapper .vertical-navigation-item{position:relative;display:flex;align-items:center;justify-content:flex-start;padding:10px 16px;font-size:13px;font-weight:500;line-height:20px;text-decoration:none;border-radius:6px}vertical-navigation vertical-navigation-aside-item .vertical-navigation-item-wrapper .vertical-navigation-item.vertical-navigation-item-disabled,vertical-navigation vertical-navigation-basic-item .vertical-navigation-item-wrapper .vertical-navigation-item.vertical-navigation-item-disabled,vertical-navigation vertical-navigation-collapsable-item .vertical-navigation-item-wrapper .vertical-navigation-item.vertical-navigation-item-disabled,vertical-navigation vertical-navigation-divider-item .vertical-navigation-item-wrapper .vertical-navigation-item.vertical-navigation-item-disabled,vertical-navigation vertical-navigation-group-item .vertical-navigation-item-wrapper .vertical-navigation-item.vertical-navigation-item-disabled,vertical-navigation vertical-navigation-spacer-item .vertical-navigation-item-wrapper .vertical-navigation-item.vertical-navigation-item-disabled{cursor:default;opacity:.4}vertical-navigation vertical-navigation-aside-item .vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-icon,vertical-navigation vertical-navigation-basic-item .vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-icon,vertical-navigation vertical-navigation-collapsable-item .vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-icon,vertical-navigation vertical-navigation-divider-item .vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-icon,vertical-navigation vertical-navigation-group-item .vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-icon,vertical-navigation vertical-navigation-spacer-item .vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-icon{margin-right:16px}vertical-navigation vertical-navigation-aside-item .vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-title-wrapper .vertical-navigation-item-subtitle,vertical-navigation vertical-navigation-basic-item .vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-title-wrapper .vertical-navigation-item-subtitle,vertical-navigation vertical-navigation-collapsable-item .vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-title-wrapper .vertical-navigation-item-subtitle,vertical-navigation vertical-navigation-divider-item .vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-title-wrapper .vertical-navigation-item-subtitle,vertical-navigation vertical-navigation-group-item .vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-title-wrapper .vertical-navigation-item-subtitle,vertical-navigation vertical-navigation-spacer-item .vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-title-wrapper .vertical-navigation-item-subtitle{font-size:11px;line-height:1.5}vertical-navigation vertical-navigation-aside-item .vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-badge,vertical-navigation vertical-navigation-basic-item .vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-badge,vertical-navigation vertical-navigation-collapsable-item .vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-badge,vertical-navigation vertical-navigation-divider-item .vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-badge,vertical-navigation vertical-navigation-group-item .vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-badge,vertical-navigation vertical-navigation-spacer-item .vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-badge{margin-left:auto}vertical-navigation vertical-navigation-aside-item .vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-badge .vertical-navigation-item-badge-content,vertical-navigation vertical-navigation-basic-item .vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-badge .vertical-navigation-item-badge-content,vertical-navigation vertical-navigation-collapsable-item .vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-badge .vertical-navigation-item-badge-content,vertical-navigation vertical-navigation-divider-item .vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-badge .vertical-navigation-item-badge-content,vertical-navigation vertical-navigation-group-item .vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-badge .vertical-navigation-item-badge-content,vertical-navigation vertical-navigation-spacer-item .vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-badge .vertical-navigation-item-badge-content{display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:600;white-space:nowrap;height:20px}vertical-navigation vertical-navigation-aside-item>.vertical-navigation-item-wrapper,vertical-navigation vertical-navigation-basic-item>.vertical-navigation-item-wrapper,vertical-navigation vertical-navigation-collapsable-item>.vertical-navigation-item-wrapper,vertical-navigation vertical-navigation-group-item>.vertical-navigation-item-wrapper{margin:0 12px}vertical-navigation vertical-navigation-aside-item,vertical-navigation vertical-navigation-basic-item,vertical-navigation vertical-navigation-collapsable-item{margin-bottom:4px}vertical-navigation vertical-navigation-aside-item .vertical-navigation-item,vertical-navigation vertical-navigation-basic-item .vertical-navigation-item,vertical-navigation vertical-navigation-collapsable-item .vertical-navigation-item{cursor:pointer}vertical-navigation vertical-navigation-collapsable-item>.vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-badge+.vertical-navigation-item-arrow{margin-left:8px}vertical-navigation vertical-navigation-collapsable-item>.vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-arrow{height:20px;line-height:20px;margin-left:auto;transition:transform .3s cubic-bezier(.25,.8,.25,1),color 375ms cubic-bezier(.25,.8,.25,1)}vertical-navigation vertical-navigation-collapsable-item.vertical-navigation-item-expanded>.vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-arrow{transform:rotate(90deg)}vertical-navigation vertical-navigation-collapsable-item>.vertical-navigation-item-children>*:first-child{margin-top:6px}vertical-navigation vertical-navigation-collapsable-item>.vertical-navigation-item-children>*:last-child{padding-bottom:6px}vertical-navigation vertical-navigation-collapsable-item>.vertical-navigation-item-children>*:last-child>.vertical-navigation-item-children>*:last-child{padding-bottom:0}vertical-navigation vertical-navigation-collapsable-item>.vertical-navigation-item-children .vertical-navigation-item{padding:10px 16px}vertical-navigation vertical-navigation-collapsable-item .vertical-navigation-item-children{overflow:hidden}vertical-navigation vertical-navigation-collapsable-item .vertical-navigation-item-children .vertical-navigation-item{padding-left:56px}vertical-navigation vertical-navigation-collapsable-item .vertical-navigation-item-children .vertical-navigation-item-children .vertical-navigation-item{padding-left:72px}vertical-navigation vertical-navigation-collapsable-item .vertical-navigation-item-children .vertical-navigation-item-children .vertical-navigation-item-children .vertical-navigation-item{padding-left:88px}vertical-navigation vertical-navigation-collapsable-item .vertical-navigation-item-children .vertical-navigation-item-children .vertical-navigation-item-children .vertical-navigation-item-children .vertical-navigation-item{padding-left:104px}vertical-navigation vertical-navigation-divider-item{margin:12px 0}vertical-navigation vertical-navigation-divider-item .vertical-navigation-item-wrapper{height:1px}vertical-navigation vertical-navigation-group-item>.vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-badge,vertical-navigation vertical-navigation-group-item>.vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-icon{display:none!important}vertical-navigation vertical-navigation-group-item>.vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-title-wrapper .vertical-navigation-item-title{font-size:12px;font-weight:600;letter-spacing:.05em;text-transform:uppercase}vertical-navigation vertical-navigation-spacer-item{margin:6px 0}.vertical-navigation-overlay{position:absolute;inset:0;z-index:50;opacity:0;background-color:#0009}.vertical-navigation-overlay+.vertical-navigation-aside-overlay{background-color:transparent}.vertical-navigation-aside-overlay{position:absolute;inset:0;z-index:169;opacity:0;background-color:#0000004d}vertical-navigation-aside-item .vertical-navigation-item-wrapper .vertical-navigation-item,vertical-navigation-basic-item .vertical-navigation-item-wrapper .vertical-navigation-item,vertical-navigation-collapsable-item .vertical-navigation-item-wrapper .vertical-navigation-item,vertical-navigation-group-item .vertical-navigation-item-wrapper .vertical-navigation-item{color:currentColor}vertical-navigation-aside-item .vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-icon,vertical-navigation-basic-item .vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-icon,vertical-navigation-collapsable-item .vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-icon,vertical-navigation-group-item .vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-icon{color:currentColor;opacity:.6}vertical-navigation-aside-item .vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-title-wrapper .vertical-navigation-item-title,vertical-navigation-basic-item .vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-title-wrapper .vertical-navigation-item-title,vertical-navigation-collapsable-item .vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-title-wrapper .vertical-navigation-item-title,vertical-navigation-group-item .vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-title-wrapper .vertical-navigation-item-title{color:currentColor;opacity:.8}vertical-navigation-aside-item .vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-title-wrapper .vertical-navigation-item-subtitle,vertical-navigation-basic-item .vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-title-wrapper .vertical-navigation-item-subtitle,vertical-navigation-collapsable-item .vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-title-wrapper .vertical-navigation-item-subtitle,vertical-navigation-group-item .vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-title-wrapper .vertical-navigation-item-subtitle{color:currentColor;opacity:.5}vertical-navigation-aside-item>.vertical-navigation-item-wrapper .vertical-navigation-item:not(.vertical-navigation-item-disabled).vertical-navigation-item-active,vertical-navigation-aside-item>.vertical-navigation-item-wrapper .vertical-navigation-item:not(.vertical-navigation-item-disabled).vertical-navigation-item-active-forced,vertical-navigation-basic-item>.vertical-navigation-item-wrapper .vertical-navigation-item:not(.vertical-navigation-item-disabled).vertical-navigation-item-active,vertical-navigation-basic-item>.vertical-navigation-item-wrapper .vertical-navigation-item:not(.vertical-navigation-item-disabled).vertical-navigation-item-active-forced,vertical-navigation-collapsable-item>.vertical-navigation-item-wrapper .vertical-navigation-item:not(.vertical-navigation-item-disabled).vertical-navigation-item-active,vertical-navigation-collapsable-item>.vertical-navigation-item-wrapper .vertical-navigation-item:not(.vertical-navigation-item-disabled).vertical-navigation-item-active-forced{background-color:rgba(var(--navigation-item-active-bg-rgb),var(--navigation-item-active-bg-opacity))}vertical-navigation-aside-item>.vertical-navigation-item-wrapper .vertical-navigation-item:not(.vertical-navigation-item-disabled).vertical-navigation-item-active .vertical-navigation-item-icon,vertical-navigation-aside-item>.vertical-navigation-item-wrapper .vertical-navigation-item:not(.vertical-navigation-item-disabled).vertical-navigation-item-active-forced .vertical-navigation-item-icon,vertical-navigation-basic-item>.vertical-navigation-item-wrapper .vertical-navigation-item:not(.vertical-navigation-item-disabled).vertical-navigation-item-active .vertical-navigation-item-icon,vertical-navigation-basic-item>.vertical-navigation-item-wrapper .vertical-navigation-item:not(.vertical-navigation-item-disabled).vertical-navigation-item-active-forced .vertical-navigation-item-icon,vertical-navigation-collapsable-item>.vertical-navigation-item-wrapper .vertical-navigation-item:not(.vertical-navigation-item-disabled).vertical-navigation-item-active .vertical-navigation-item-icon,vertical-navigation-collapsable-item>.vertical-navigation-item-wrapper .vertical-navigation-item:not(.vertical-navigation-item-disabled).vertical-navigation-item-active-forced .vertical-navigation-item-icon{opacity:1}vertical-navigation-aside-item>.vertical-navigation-item-wrapper .vertical-navigation-item:not(.vertical-navigation-item-disabled).vertical-navigation-item-active .vertical-navigation-item-title,vertical-navigation-aside-item>.vertical-navigation-item-wrapper .vertical-navigation-item:not(.vertical-navigation-item-disabled).vertical-navigation-item-active-forced .vertical-navigation-item-title,vertical-navigation-basic-item>.vertical-navigation-item-wrapper .vertical-navigation-item:not(.vertical-navigation-item-disabled).vertical-navigation-item-active .vertical-navigation-item-title,vertical-navigation-basic-item>.vertical-navigation-item-wrapper .vertical-navigation-item:not(.vertical-navigation-item-disabled).vertical-navigation-item-active-forced .vertical-navigation-item-title,vertical-navigation-collapsable-item>.vertical-navigation-item-wrapper .vertical-navigation-item:not(.vertical-navigation-item-disabled).vertical-navigation-item-active .vertical-navigation-item-title,vertical-navigation-collapsable-item>.vertical-navigation-item-wrapper .vertical-navigation-item:not(.vertical-navigation-item-disabled).vertical-navigation-item-active-forced .vertical-navigation-item-title{opacity:1}vertical-navigation-aside-item>.vertical-navigation-item-wrapper .vertical-navigation-item:not(.vertical-navigation-item-disabled).vertical-navigation-item-active .vertical-navigation-item-subtitle,vertical-navigation-aside-item>.vertical-navigation-item-wrapper .vertical-navigation-item:not(.vertical-navigation-item-disabled).vertical-navigation-item-active-forced .vertical-navigation-item-subtitle,vertical-navigation-basic-item>.vertical-navigation-item-wrapper .vertical-navigation-item:not(.vertical-navigation-item-disabled).vertical-navigation-item-active .vertical-navigation-item-subtitle,vertical-navigation-basic-item>.vertical-navigation-item-wrapper .vertical-navigation-item:not(.vertical-navigation-item-disabled).vertical-navigation-item-active-forced .vertical-navigation-item-subtitle,vertical-navigation-collapsable-item>.vertical-navigation-item-wrapper .vertical-navigation-item:not(.vertical-navigation-item-disabled).vertical-navigation-item-active .vertical-navigation-item-subtitle,vertical-navigation-collapsable-item>.vertical-navigation-item-wrapper .vertical-navigation-item:not(.vertical-navigation-item-disabled).vertical-navigation-item-active-forced .vertical-navigation-item-subtitle{opacity:1}vertical-navigation-aside-item>.vertical-navigation-item-wrapper .vertical-navigation-item:not(.vertical-navigation-item-active-forced):not(.vertical-navigation-item-active):not(.vertical-navigation-item-disabled):hover,vertical-navigation-basic-item>.vertical-navigation-item-wrapper .vertical-navigation-item:not(.vertical-navigation-item-active-forced):not(.vertical-navigation-item-active):not(.vertical-navigation-item-disabled):hover,vertical-navigation-collapsable-item>.vertical-navigation-item-wrapper .vertical-navigation-item:not(.vertical-navigation-item-active-forced):not(.vertical-navigation-item-active):not(.vertical-navigation-item-disabled):hover{background-color:rgba(var(--navigation-item-active-bg-rgb)/var(--navigation-item-active-bg-opacity))}vertical-navigation-aside-item>.vertical-navigation-item-wrapper .vertical-navigation-item:not(.vertical-navigation-item-active-forced):not(.vertical-navigation-item-active):not(.vertical-navigation-item-disabled):hover .vertical-navigation-item-icon,vertical-navigation-basic-item>.vertical-navigation-item-wrapper .vertical-navigation-item:not(.vertical-navigation-item-active-forced):not(.vertical-navigation-item-active):not(.vertical-navigation-item-disabled):hover .vertical-navigation-item-icon,vertical-navigation-collapsable-item>.vertical-navigation-item-wrapper .vertical-navigation-item:not(.vertical-navigation-item-active-forced):not(.vertical-navigation-item-active):not(.vertical-navigation-item-disabled):hover .vertical-navigation-item-icon{opacity:1}vertical-navigation-aside-item>.vertical-navigation-item-wrapper .vertical-navigation-item:not(.vertical-navigation-item-active-forced):not(.vertical-navigation-item-active):not(.vertical-navigation-item-disabled):hover .vertical-navigation-item-title,vertical-navigation-aside-item>.vertical-navigation-item-wrapper .vertical-navigation-item:not(.vertical-navigation-item-active-forced):not(.vertical-navigation-item-active):not(.vertical-navigation-item-disabled):hover .vertical-navigation-item-arrow,vertical-navigation-basic-item>.vertical-navigation-item-wrapper .vertical-navigation-item:not(.vertical-navigation-item-active-forced):not(.vertical-navigation-item-active):not(.vertical-navigation-item-disabled):hover .vertical-navigation-item-title,vertical-navigation-basic-item>.vertical-navigation-item-wrapper .vertical-navigation-item:not(.vertical-navigation-item-active-forced):not(.vertical-navigation-item-active):not(.vertical-navigation-item-disabled):hover .vertical-navigation-item-arrow,vertical-navigation-collapsable-item>.vertical-navigation-item-wrapper .vertical-navigation-item:not(.vertical-navigation-item-active-forced):not(.vertical-navigation-item-active):not(.vertical-navigation-item-disabled):hover .vertical-navigation-item-title,vertical-navigation-collapsable-item>.vertical-navigation-item-wrapper .vertical-navigation-item:not(.vertical-navigation-item-active-forced):not(.vertical-navigation-item-active):not(.vertical-navigation-item-disabled):hover .vertical-navigation-item-arrow{opacity:1}vertical-navigation-aside-item>.vertical-navigation-item-wrapper .vertical-navigation-item:not(.vertical-navigation-item-active-forced):not(.vertical-navigation-item-active):not(.vertical-navigation-item-disabled):hover .vertical-navigation-item-subtitle,vertical-navigation-basic-item>.vertical-navigation-item-wrapper .vertical-navigation-item:not(.vertical-navigation-item-active-forced):not(.vertical-navigation-item-active):not(.vertical-navigation-item-disabled):hover .vertical-navigation-item-subtitle,vertical-navigation-collapsable-item>.vertical-navigation-item-wrapper .vertical-navigation-item:not(.vertical-navigation-item-active-forced):not(.vertical-navigation-item-active):not(.vertical-navigation-item-disabled):hover .vertical-navigation-item-subtitle{opacity:1}vertical-navigation-collapsable-item.vertical-navigation-item-expanded>.vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-icon{opacity:1}vertical-navigation-collapsable-item.vertical-navigation-item-expanded>.vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-title,vertical-navigation-collapsable-item.vertical-navigation-item-expanded>.vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-arrow{opacity:1}vertical-navigation-collapsable-item.vertical-navigation-item-expanded>.vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-subtitle{opacity:1}vertical-navigation-group-item>.vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-title-wrapper .vertical-navigation-item-title{opacity:1;color:var(--fallback-p, oklch(var(--p)))}:root{--vertical-navigation-width: 280px;--vertical-navigation-dense-width: 80px}vertical-navigation.vertical-navigation-appearance-dense:not(.vertical-navigation-mode-over){width:var(--vertical-navigation-dense-width);min-width:var(--vertical-navigation-dense-width);max-width:var(--vertical-navigation-dense-width)}vertical-navigation.vertical-navigation-appearance-dense:not(.vertical-navigation-mode-over).vertical-navigation-position-left.vertical-navigation-mode-side{margin-left:calc(var(--vertical-navigation-dense-width) * -1)}vertical-navigation.vertical-navigation-appearance-dense:not(.vertical-navigation-mode-over).vertical-navigation-position-left.vertical-navigation-opened{margin-left:0}vertical-navigation.vertical-navigation-appearance-dense:not(.vertical-navigation-mode-over).vertical-navigation-position-right.vertical-navigation-mode-side{margin-right:calc(var(--vertical-navigation-dense-width) * -1)}vertical-navigation.vertical-navigation-appearance-dense:not(.vertical-navigation-mode-over).vertical-navigation-position-right.vertical-navigation-opened{margin-right:0}vertical-navigation.vertical-navigation-appearance-dense:not(.vertical-navigation-mode-over).vertical-navigation-position-right .vertical-navigation-aside-wrapper{left:auto;right:var(--vertical-navigation-dense-width)}vertical-navigation.vertical-navigation-appearance-dense:not(.vertical-navigation-mode-over).vertical-navigation-position-right.vertical-navigation-hover .vertical-navigation-aside-wrapper{left:auto;right:var(--vertical-navigation-width)}vertical-navigation.vertical-navigation-appearance-dense .vertical-navigation-wrapper .vertical-navigation-content vertical-navigation-aside-item .vertical-navigation-item-wrapper .vertical-navigation-item,vertical-navigation.vertical-navigation-appearance-dense .vertical-navigation-wrapper .vertical-navigation-content vertical-navigation-basic-item .vertical-navigation-item-wrapper .vertical-navigation-item,vertical-navigation.vertical-navigation-appearance-dense .vertical-navigation-wrapper .vertical-navigation-content vertical-navigation-collapsable-item .vertical-navigation-item-wrapper .vertical-navigation-item,vertical-navigation.vertical-navigation-appearance-dense .vertical-navigation-wrapper .vertical-navigation-content vertical-navigation-group-item .vertical-navigation-item-wrapper .vertical-navigation-item{width:calc(var(--vertical-navigation-dense-width) - 24px);min-width:calc(var(--vertical-navigation-dense-width) - 24px);max-width:calc(var(--vertical-navigation-dense-width) - 24px)}vertical-navigation.vertical-navigation-appearance-dense .vertical-navigation-wrapper .vertical-navigation-content vertical-navigation-aside-item .vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-arrow,vertical-navigation.vertical-navigation-appearance-dense .vertical-navigation-wrapper .vertical-navigation-content vertical-navigation-aside-item .vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-badge,vertical-navigation.vertical-navigation-appearance-dense .vertical-navigation-wrapper .vertical-navigation-content vertical-navigation-aside-item .vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-title-wrapper,vertical-navigation.vertical-navigation-appearance-dense .vertical-navigation-wrapper .vertical-navigation-content vertical-navigation-basic-item .vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-arrow,vertical-navigation.vertical-navigation-appearance-dense .vertical-navigation-wrapper .vertical-navigation-content vertical-navigation-basic-item .vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-badge,vertical-navigation.vertical-navigation-appearance-dense .vertical-navigation-wrapper .vertical-navigation-content vertical-navigation-basic-item .vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-title-wrapper,vertical-navigation.vertical-navigation-appearance-dense .vertical-navigation-wrapper .vertical-navigation-content vertical-navigation-collapsable-item .vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-arrow,vertical-navigation.vertical-navigation-appearance-dense .vertical-navigation-wrapper .vertical-navigation-content vertical-navigation-collapsable-item .vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-badge,vertical-navigation.vertical-navigation-appearance-dense .vertical-navigation-wrapper .vertical-navigation-content vertical-navigation-collapsable-item .vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-title-wrapper,vertical-navigation.vertical-navigation-appearance-dense .vertical-navigation-wrapper .vertical-navigation-content vertical-navigation-group-item .vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-arrow,vertical-navigation.vertical-navigation-appearance-dense .vertical-navigation-wrapper .vertical-navigation-content vertical-navigation-group-item .vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-badge,vertical-navigation.vertical-navigation-appearance-dense .vertical-navigation-wrapper .vertical-navigation-content vertical-navigation-group-item .vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-title-wrapper{transition:opacity .4s cubic-bezier(.25,.8,.25,1)}vertical-navigation.vertical-navigation-appearance-dense .vertical-navigation-wrapper .vertical-navigation-content vertical-navigation-group-item:first-of-type{margin-top:0}vertical-navigation.vertical-navigation-appearance-dense:not(.vertical-navigation-hover):not(.vertical-navigation-mode-over) .vertical-navigation-wrapper .vertical-navigation-content .vertical-navigation-item-wrapper .vertical-navigation-item{padding:10px 16px}vertical-navigation.vertical-navigation-appearance-dense:not(.vertical-navigation-hover):not(.vertical-navigation-mode-over) .vertical-navigation-wrapper .vertical-navigation-content .vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-arrow,vertical-navigation.vertical-navigation-appearance-dense:not(.vertical-navigation-hover):not(.vertical-navigation-mode-over) .vertical-navigation-wrapper .vertical-navigation-content .vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-badge,vertical-navigation.vertical-navigation-appearance-dense:not(.vertical-navigation-hover):not(.vertical-navigation-mode-over) .vertical-navigation-wrapper .vertical-navigation-content .vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-title-wrapper{white-space:nowrap;opacity:0}vertical-navigation.vertical-navigation-appearance-dense:not(.vertical-navigation-hover):not(.vertical-navigation-mode-over) .vertical-navigation-wrapper .vertical-navigation-content vertical-navigation-collapsable-item .vertical-navigation-item-children{display:none}vertical-navigation.vertical-navigation-appearance-dense:not(.vertical-navigation-hover):not(.vertical-navigation-mode-over) .vertical-navigation-wrapper .vertical-navigation-content vertical-navigation-group-item>.vertical-navigation-item-wrapper .vertical-navigation-item:before{content:\"\";position:absolute;top:20px;width:23px;border-top-width:2px}vertical-navigation.vertical-navigation-appearance-dense .vertical-navigation-aside-wrapper{left:var(--vertical-navigation-dense-width)}vertical-navigation.vertical-navigation-appearance-dense .vertical-navigation-background-gradient{display:none}vertical-navigation.vertical-navigation-appearance-dense.vertical-navigation-hover .vertical-navigation-wrapper{width:var(--vertical-navigation-width)}vertical-navigation.vertical-navigation-appearance-dense.vertical-navigation-hover .vertical-navigation-wrapper .vertical-navigation-content .vertical-navigation-item-wrapper .vertical-navigation-item{width:calc(var(--vertical-navigation-width) - 24px);min-width:calc(var(--vertical-navigation-width) - 24px);max-width:calc(var(--vertical-navigation-width) - 24px)}vertical-navigation.vertical-navigation-appearance-dense.vertical-navigation-hover .vertical-navigation-wrapper .vertical-navigation-content .vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-arrow,vertical-navigation.vertical-navigation-appearance-dense.vertical-navigation-hover .vertical-navigation-wrapper .vertical-navigation-content .vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-badge,vertical-navigation.vertical-navigation-appearance-dense.vertical-navigation-hover .vertical-navigation-wrapper .vertical-navigation-content .vertical-navigation-item-wrapper .vertical-navigation-item .vertical-navigation-item-title-wrapper{white-space:nowrap;animation:removeWhiteSpaceNoWrap 1ms linear .35s;animation-fill-mode:forwards}vertical-navigation.vertical-navigation-appearance-dense.vertical-navigation-hover .vertical-navigation-aside-wrapper{left:var(--vertical-navigation-width)}vertical-navigation.vertical-navigation-appearance-dense.vertical-navigation-hover .vertical-navigation-background-gradient{display:block}@keyframes removeWhiteSpaceNoWrap{0%{white-space:nowrap}99%{white-space:nowrap}to{white-space:normal}}\n"] }]
        }], ctorParameters: () => [{ type: Document, decorators: [{
                    type: Inject,
                    args: [DOCUMENT]
                }] }, { type: i1$1.AnimationBuilder }, { type: i0.ChangeDetectorRef }, { type: i0.ElementRef }, { type: i0.Renderer2 }, { type: i1.Router }, { type: i3.ScrollStrategyOptions }, { type: NavigationService }], propDecorators: { appearance: [{
                type: Input
            }], autoCollapse: [{
                type: Input
            }], inner: [{
                type: Input
            }], mode: [{
                type: Input
            }], name: [{
                type: Input
            }], navigation: [{
                type: Input
            }], opened: [{
                type: Input
            }], position: [{
                type: Input
            }], transparentOverlay: [{
                type: Input
            }], appearanceChanged: [{
                type: Output
            }], modeChanged: [{
                type: Output
            }], openedChanged: [{
                type: Output
            }], positionChanged: [{
                type: Output
            }], _navigationContentEl: [{
                type: ViewChild,
                args: ['navigationContent']
            }], classList: [{
                type: HostBinding,
                args: ['class']
            }], styleList: [{
                type: HostBinding,
                args: ['style']
            }], scrollbarDirectives: [{
                type: ViewChildren,
                args: [ScrollbarDirective]
            }], _onMouseenter: [{
                type: HostListener,
                args: ['mouseenter']
            }], _onMouseleave: [{
                type: HostListener,
                args: ['mouseleave']
            }] } });

/*
 * Public API Surface of navigation
 */

/**
 * Generated bundle index. Do not edit.
 */

export { HorizontalNavigationComponent, NavigationService, VerticalNavigationComponent };
//# sourceMappingURL=libs-navigation.mjs.map
