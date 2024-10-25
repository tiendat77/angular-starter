/* eslint-disable @angular-eslint/component-selector */
import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

import { Subject, takeUntil } from 'rxjs';

import { LayoutService } from '../layout.service';
import { LogoComponent } from '@/core/commons/logo/logo.component';

import { SvgIcon } from '@libs/svg-icon';
import { NavigationItem, NavigationService, VerticalNavigationComponent } from '@libs/navigation';

@Component({
  standalone: true,
  selector: 'dense-layout',
  templateUrl: './dense.component.html',
  encapsulation: ViewEncapsulation.None,
  imports: [RouterOutlet, RouterLink, SvgIcon, LogoComponent, VerticalNavigationComponent],
})
export class DenseLayoutComponent implements OnInit, OnDestroy {
  isScreenSmall: boolean;
  navigation: NavigationItem[];
  navigationAppearance: 'default' | 'dense' = 'dense';

  private _unsubscribeAll: Subject<any> = new Subject<any>();

  constructor(
    private _cdRef: ChangeDetectorRef,
    private _layoutService: LayoutService,
    private _navigationService: NavigationService
  ) {}

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  ngOnInit(): void {
    this._layoutService.navigation$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((navigation: NavigationItem[]) => {
        this.navigation = navigation;
      });

    this._layoutService.onMediaChange$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(({ matchingAliases }) => {
        this.isScreenSmall = !matchingAliases.includes('md');
        this.navigationAppearance = this.isScreenSmall ? 'default' : 'dense';
      });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  toggle(): void {
    const navigation =
      this._navigationService.getComponent<VerticalNavigationComponent>('main-navigation');

    if (navigation) {
      navigation.toggle();
    }

    this._cdRef.markForCheck();
  }
}
