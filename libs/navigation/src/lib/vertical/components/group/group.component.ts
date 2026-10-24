import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, forwardRef, input } from '@angular/core';
import { SvgIconModule } from '@libs/ui/svg-icon';

import { NavigationItemBase } from '../../../navigation-item.base';
import { VerticalNavigationComponent } from '../../vertical.component';
import { VerticalNavigationBasicItemComponent } from '../basic/basic.component';
import { VerticalNavigationCollapsableItemComponent } from '../collapsable/collapsable.component';
import { VerticalNavigationDividerItemComponent } from '../divider/divider.component';
import { VerticalNavigationSpacerItemComponent } from '../spacer/spacer.component';

@Component({
  selector: 'vertical-navigation-group-item',
  templateUrl: './group.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgClass,
    SvgIconModule,
    VerticalNavigationBasicItemComponent,
    VerticalNavigationCollapsableItemComponent,
    VerticalNavigationDividerItemComponent,
    VerticalNavigationSpacerItemComponent,
    forwardRef(() => VerticalNavigationGroupItemComponent),
  ],
})
export class VerticalNavigationGroupItemComponent extends NavigationItemBase<VerticalNavigationComponent> {
  readonly autoCollapse = input(false);
}
