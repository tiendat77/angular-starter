import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  ViewEncapsulation,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { LayoutService } from '../layout.service';

import { LogoComponent } from '../../commons/logo';

import {
  HorizontalNavigationComponent,
  NavigationService,
  VerticalNavigationComponent,
} from '@libs/navigation';
import { SvgIconModule } from '@libs/svg-icon';

@Component({
  selector: 'modern-layout',
  templateUrl: './modern.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterOutlet,
    LogoComponent,
    SvgIconModule,
    VerticalNavigationComponent,
    HorizontalNavigationComponent,
  ],
})
export class ModernLayoutComponent {
  private _layoutService = inject(LayoutService);
  private _navigationService = inject(NavigationService);

  $navigation = this._layoutService.$navigation;
  $isScreenSmall = computed(
    () => !this._layoutService.$onMediaChange().matchingAliases.includes('md')
  );

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  toggleNavigation(name: string): void {
    // Get the navigation
    const navigation = this._navigationService.getComponent<VerticalNavigationComponent>(name);

    if (navigation) {
      navigation.toggle();
    }
  }
}
