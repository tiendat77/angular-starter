import { NgClass, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { SvgIconModule } from '@libs/ui/svg-icon';

import { NavigationItemBase } from '../../../navigation-item.base';
import { UtilsHelper } from '../../../utils.helper';
import { VerticalNavigationComponent } from '../../vertical.component';

@Component({
  selector: 'vertical-navigation-basic-item',
  templateUrl: './basic.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass, NgTemplateOutlet, RouterLink, RouterLinkActive, SvgIconModule],
})
export class VerticalNavigationBasicItemComponent extends NavigationItemBase<VerticalNavigationComponent> {
  /**
   * The match options either from the item's `isActiveMatchOptions` or the equivalent form of its
   * `exactMatch`. They are never `undefined`: the router throws (and stops working) when
   * `[routerLinkActiveOptions]` is.
   */
  protected readonly $isActiveMatchOptions = computed(() => {
    const item = this.item();

    return (item.isActiveMatchOptions ?? item.exactMatch)
      ? UtilsHelper.exactMatchOptions
      : UtilsHelper.subsetMatchOptions;
  });
}
