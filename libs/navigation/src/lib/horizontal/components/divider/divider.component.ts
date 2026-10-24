import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { NavigationItemBase } from '../../../navigation-item.base';
import { HorizontalNavigationComponent } from '../../horizontal.component';

@Component({
  selector: 'horizontal-navigation-divider-item',
  templateUrl: './divider.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass],
})
export class HorizontalNavigationDividerItemComponent extends NavigationItemBase<HorizontalNavigationComponent> {}
