import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { NavigationItemBase } from '../../../navigation-item.base';
import { VerticalNavigationComponent } from '../../vertical.component';

@Component({
  selector: 'vertical-navigation-divider-item',
  templateUrl: './divider.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass],
})
export class VerticalNavigationDividerItemComponent extends NavigationItemBase<VerticalNavigationComponent> {}
