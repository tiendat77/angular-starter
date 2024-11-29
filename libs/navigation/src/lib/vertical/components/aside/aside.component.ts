import { BooleanInput } from '@angular/cdk/coercion';
import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { SvgIconModule } from '@libs/svg-icon';

import { filter, Subject, takeUntil } from 'rxjs';
import { NavigationService } from '../../../navigation.service';
import { NavigationItem } from '../../../navigation.types';

import { VerticalNavigationComponent } from '../../vertical.component';
import { VerticalNavigationBasicItemComponent } from '../basic/basic.component';
import { VerticalNavigationCollapsableItemComponent } from '../collapsable/collapsable.component';
import { VerticalNavigationDividerItemComponent } from '../divider/divider.component';
import { VerticalNavigationGroupItemComponent } from '../group/group.component';
import { VerticalNavigationSpacerItemComponent } from '../spacer/spacer.component';

@Component({
  selector: 'vertical-navigation-aside-item',
  templateUrl: './aside.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgClass,
    SvgIconModule,
    VerticalNavigationBasicItemComponent,
    VerticalNavigationCollapsableItemComponent,
    VerticalNavigationDividerItemComponent,
    VerticalNavigationGroupItemComponent,
    VerticalNavigationSpacerItemComponent,
  ],
})
export class VerticalNavigationAsideItemComponent implements OnChanges, OnInit, OnDestroy {
  static ngAcceptInputType_autoCollapse: BooleanInput;
  static ngAcceptInputType_skipChildren: BooleanInput;

  @Input() activeItemId: string;
  @Input() autoCollapse: boolean;
  @Input() item: NavigationItem;
  @Input() name: string;
  @Input() skipChildren: boolean;

  active = false;

  private _VerticalNavigationComponent: VerticalNavigationComponent;
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _router: Router,
    private _NavigationService: NavigationService
  ) {}

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  ngOnChanges(changes: SimpleChanges): void {
    // Active item id
    if ('activeItemId' in changes) {
      // Mark if active
      this._markIfActive(this._router.url);
    }
  }

  ngOnInit(): void {
    // Mark if active
    this._markIfActive(this._router.url);

    // Attach a listener to the NavigationEnd event
    this._router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntil(this._unsubscribeAll)
      )
      .subscribe((event: NavigationEnd) => {
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

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

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

  private _markIfActive(currentUrl: string): void {
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
}
