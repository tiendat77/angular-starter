import { NgClass, NgTemplateOutlet } from '@angular/common';
import { booleanAttribute, ChangeDetectionStrategy, Component, input } from '@angular/core';
import { SvgIconModule } from '@libs/ui/svg-icon';

import { NavigationItemBase } from '../../../navigation-item.base';

import { HorizontalNavigationComponent } from '../../horizontal.component';
import { HorizontalNavigationBasicItemComponent } from '../basic/basic.component';
import { HorizontalNavigationDividerItemComponent } from '../divider/divider.component';

@Component({
  selector: 'horizontal-navigation-branch-item',
  templateUrl: './branch.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgClass,
    NgTemplateOutlet,
    SvgIconModule,
    HorizontalNavigationBasicItemComponent,
    HorizontalNavigationDividerItemComponent,
  ],
})
export class HorizontalNavigationBranchItemComponent extends NavigationItemBase<HorizontalNavigationComponent> {
  readonly child = input(false, { transform: booleanAttribute });

  triggerChangeDetection(): void {
    // Mark for check
    this._changeDetectorRef.markForCheck();
  }
}
