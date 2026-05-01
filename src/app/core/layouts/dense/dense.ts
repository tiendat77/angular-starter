import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  inject,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

import { LogoComponent } from '../../commons/logo';
import { ThemeTogglerComponent } from '../../commons/theme-toggler';
import { LayoutService } from '../layout.service';

import { NavigationService, VerticalNavigationComponent } from '@libs/navigation';
import { SvgIcon } from '@libs/svg-icon';

@Component({
  selector: 'dense-layout',
  templateUrl: './dense.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterOutlet,
    RouterLink,
    SvgIcon,
    LogoComponent,
    ThemeTogglerComponent,
    VerticalNavigationComponent,
  ],
  host: {
    class: 'flex flex-row flex-auto w-full h-full',
  },
})
export class DenseLayoutComponent {
  $navigationAppearance = signal<'default' | 'dense'>('default');

  private _cdRef = inject(ChangeDetectorRef);
  private _layoutService = inject(LayoutService);
  private _navigationService = inject(NavigationService);

  $navigation = this._layoutService.$navigation;
  $isScreenSmall = computed(
    () => !this._layoutService.$onMediaChange().matchingAliases.includes('lg')
  );

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  toggle(): void {
    if (this.$isScreenSmall()) {
      const navigation =
        this._navigationService.getComponent<VerticalNavigationComponent>('main-navigation');

      if (navigation) {
        navigation.toggle();
        this.$navigationAppearance.set('default');
      }

      this._cdRef.markForCheck();
      return;
    }

    this.$navigationAppearance.update((appearance) =>
      appearance === 'default' ? 'dense' : 'default'
    );
  }
}
