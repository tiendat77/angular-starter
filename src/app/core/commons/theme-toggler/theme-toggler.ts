import { ChangeDetectionStrategy, Component, computed, inject, viewChild } from '@angular/core';

import { ThemeService } from '@/services/theme.service';
import { Menu, MenuItem, MenuTrigger } from '@angular/aria/menu';
import { OverlayModule } from '@angular/cdk/overlay';
import { SvgIconModule } from '@libs/svg-icon';
import { ColorSchemeType } from '@models';

@Component({
  selector: 'theme-toggler',
  imports: [SvgIconModule, Menu, MenuItem, MenuTrigger, OverlayModule],
  templateUrl: './theme-toggler.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeTogglerComponent {
  $menu = viewChild<Menu<string>>('themeMenu');

  private _themeService = inject(ThemeService);

  scheme$ = this._themeService.scheme$;

  $iconName = computed(() => {
    switch (this.scheme$()) {
      case 'light':
        return 'heroicons_outline:sun';
      case 'dark':
        return 'heroicons_outline:moon';
      case 'system':
      default:
        return 'heroicons_outline:computer-desktop';
    }
  });

  setTheme(scheme: ColorSchemeType): void {
    this._themeService.scheme = scheme;
  }
}
