import { BooleanInput } from '@angular/cdk/coercion';
import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  forwardRef,
  HostBinding,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

import { SvgIconModule } from '@libs/svg-icon';

import { filter, Subject, takeUntil } from 'rxjs';
import { expandCollapse } from '../../../animations/expand-collapse';
import { NavigationItem } from '../../../navigation.types';

import { NavigationService } from '../../../navigation.service';
import { VerticalNavigationComponent } from '../../vertical.component';
import { VerticalNavigationBasicItemComponent } from '../basic/basic.component';
import { VerticalNavigationDividerItemComponent } from '../divider/divider.component';
import { VerticalNavigationGroupItemComponent } from '../group/group.component';
import { VerticalNavigationSpacerItemComponent } from '../spacer/spacer.component';

@Component({
  selector: 'vertical-navigation-collapsable-item',
  templateUrl: './collapsable.component.html',
  animations: [expandCollapse],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgClass,
    SvgIconModule,
    VerticalNavigationBasicItemComponent,
    VerticalNavigationDividerItemComponent,
    VerticalNavigationGroupItemComponent,
    VerticalNavigationSpacerItemComponent,
    forwardRef(() => VerticalNavigationCollapsableItemComponent),
  ],
})
export class VerticalNavigationCollapsableItemComponent implements OnInit, OnDestroy {
  static ngAcceptInputType_autoCollapse: BooleanInput;

  @Input() autoCollapse: boolean;
  @Input() item: NavigationItem;
  @Input() name: string;

  isCollapsed = true;
  isExpanded = false;

  private _verticalNavigationComponent: VerticalNavigationComponent;
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  constructor(
    private _router: Router,
    private _changeDetectorRef: ChangeDetectorRef,
    private _navigationService: NavigationService
  ) {}

  // -----------------------------------------------------------------------------------------------------
  // @ Accessors
  // -----------------------------------------------------------------------------------------------------

  @HostBinding('class') get classList(): any {
    return {
      'vertical-navigation-item-collapsed': this.isCollapsed,
      'vertical-navigation-item-expanded': this.isExpanded,
    };
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  ngOnInit(): void {
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
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntil(this._unsubscribeAll)
      )
      .subscribe((event: NavigationEnd) => {
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

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  collapse(): void {
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

  expand(): void {
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

  toggleCollapsable(): void {
    // Toggle collapse/expand
    if (this.isCollapsed) {
      this.expand();
    } else {
      this.collapse();
    }
  }

  trackByFn(index: number, item: any): any {
    return item.id || index;
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------

  private _hasActiveChild(item: NavigationItem, currentUrl: string): boolean {
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

  private _isChildrenOf(parent: NavigationItem, item: NavigationItem): boolean {
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
}
