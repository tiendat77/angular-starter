import { NgClass } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';

import { SvgIconModule } from '@libs/ui/svg-icon';

import { filter } from 'rxjs';
import { NavigationItemBase } from '../../../navigation-item.base';
import { NavigationItem } from '../../../navigation.types';
import { VerticalNavigationComponent } from '../../vertical.component';
import { VerticalNavigationBasicItemComponent } from '../basic/basic.component';
import { VerticalNavigationDividerItemComponent } from '../divider/divider.component';
import { VerticalNavigationGroupItemComponent } from '../group/group.component';
import { VerticalNavigationSpacerItemComponent } from '../spacer/spacer.component';

@Component({
  selector: 'vertical-navigation-collapsable-item',
  templateUrl: './collapsable.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgClass,
    SvgIconModule,
    VerticalNavigationBasicItemComponent,
    VerticalNavigationDividerItemComponent,
    VerticalNavigationGroupItemComponent,
    VerticalNavigationSpacerItemComponent,
    forwardRef(() => VerticalNavigationCollapsableItemComponent),
  ],
  host: {
    '[class.vertical-navigation-item-collapsed]': '$collapsed()',
    '[class.vertical-navigation-item-expanded]': '$expanded()',
  },
})
export class VerticalNavigationCollapsableItemComponent
  extends NavigationItemBase<VerticalNavigationComponent>
  implements OnInit, AfterViewInit
{
  readonly autoCollapse = input(false);

  protected readonly $collapsed = signal(true);
  protected readonly $expanded = computed(() => !this.$collapsed());

  /** Class played when the children enter; empty for the initial render. Fixed when expanding. */
  protected readonly $enterClass = signal('');

  /** Whether the first render is over; before that the children appear without an enter animation. */
  private _viewReady = false;

  private _router = inject(Router);

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  override ngOnInit(): void {
    super.ngOnInit();

    const item = this.item();

    // If the item has a children that has a matching url with the current url, expand...
    if (this._hasActiveChild(item, this._router.url)) {
      this.expand();
    }
    // Otherwise, if the autoCollapse is on, collapse...
    else if (this.autoCollapse()) {
      this.collapse();
    }

    // Collapse if this is a children of the collapsed item
    this.navigation.onCollapsableItemCollapsed
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((collapsedItem) => {
        if (collapsedItem !== null && this._isChildrenOf(collapsedItem, item)) {
          this.collapse();
        }
      });

    // Collapse when another item expands, if the autoCollapse is on
    if (this.autoCollapse()) {
      this.navigation.onCollapsableItemExpanded
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe((expandedItem) => {
          if (
            expandedItem === null ||
            // This is a parent of the expanded item
            this._isChildrenOf(item, expandedItem) ||
            // This has a children with a matching url with the current active url
            this._hasActiveChild(item, this._router.url) ||
            // This is the expanded item
            item === expandedItem
          ) {
            return;
          }

          this.collapse();
        });
    }

    // Expand or collapse after every navigation
    this._router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this._destroyRef)
      )
      .subscribe((event) => {
        if (this._hasActiveChild(item, event.urlAfterRedirects)) {
          this.expand();
        } else if (this.autoCollapse()) {
          this.collapse();
        }
      });
  }

  ngAfterViewInit(): void {
    this._viewReady = true;
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  collapse(): void {
    // Return if the item is disabled
    if (this.item().disabled) {
      return;
    }

    // Return if the item is already collapsed
    if (this.$collapsed()) {
      return;
    }

    // Collapse it
    this.$collapsed.set(true);

    // Execute the observable
    this.navigation.onCollapsableItemCollapsed.next(this.item());
  }

  expand(): void {
    // Return if the item is disabled
    if (this.item().disabled) {
      return;
    }

    // Return if the item is already expanded
    if (!this.$collapsed()) {
      return;
    }

    // Expand it
    this.$enterClass.set(this._viewReady ? 'vertical-navigation-collapsable-expand' : '');
    this.$collapsed.set(false);

    // Execute the observable
    this.navigation.onCollapsableItemExpanded.next(this.item());
  }

  toggleCollapsable(): void {
    // Toggle collapse/expand
    if (this.$collapsed()) {
      this.expand();
    } else {
      this.collapse();
    }
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
