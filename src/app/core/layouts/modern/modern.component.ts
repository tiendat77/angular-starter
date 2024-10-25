/* eslint-disable @angular-eslint/component-selector */
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Subject, takeUntil } from 'rxjs';
import { LayoutService } from '../layout.service';

import { LogoComponent } from '@/core/commons/logo/logo.component';

import {
  NavigationItem,
  NavigationService,
  VerticalNavigationComponent,
  HorizontalNavigationComponent,
} from '@libs/navigation';
import { SvgIconModule } from '@libs/svg-icon';

@Component({
  standalone: true,
  selector: 'modern-layout',
  templateUrl: './modern.component.html',
  encapsulation: ViewEncapsulation.None,
  imports: [
    RouterOutlet,
    LogoComponent,
    SvgIconModule,
    VerticalNavigationComponent,
    HorizontalNavigationComponent,
  ],
})
export class ModernLayoutComponent implements OnInit, OnDestroy {
  isScreenSmall: boolean;
  navigation: NavigationItem[];

  private _unsubscribeAll: Subject<any> = new Subject<any>();

  constructor(
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
