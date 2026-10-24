import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { NavigationItemBase } from '../../../navigation-item.base';
import { HorizontalNavigationComponent } from '../../horizontal.component';

@Component({
  selector: 'horizontal-navigation-spacer-item',
  templateUrl: './spacer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass],
})
export class HorizontalNavigationSpacerItemComponent extends NavigationItemBase<HorizontalNavigationComponent> {}
