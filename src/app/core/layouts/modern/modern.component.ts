import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnDestroy,
  OnInit,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Subject, takeUntil } from 'rxjs';
import { LayoutService } from '../layout.service';

import { LogoComponent } from '../../commons/logo';

import {
  HorizontalNavigationComponent,
  NavigationItem,
  NavigationService,
  VerticalNavigationComponent,
} from '@libs/navigation';
import { SvgIconModule } from '@libs/svg-icon';

@Component({
  selector: 'modern-layout',
  templateUrl: './modern.component.html',
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
export class ModernLayoutComponent implements OnInit, OnDestroy {
  $isScreenSmall = signal<boolean>(false);
  $navigation = signal<NavigationItem[]>([]);

  private _unsubscribeAll: Subject<any> = new Subject<any>();

  private _layoutService = inject(LayoutService);
  private _navigationService = inject(NavigationService);

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  ngOnInit(): void {
    this._layoutService.navigation$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((navigation: NavigationItem[]) => {
        this.$navigation.set(navigation);
      });

    this._layoutService.onMediaChange$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(({ matchingAliases }) => {
        this.$isScreenSmall.set(!matchingAliases.includes('md'));
      });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

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
