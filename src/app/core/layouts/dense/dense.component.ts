import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  OnDestroy,
  OnInit,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

import { Subject, takeUntil } from 'rxjs';

import { LogoComponent } from '../../commons/logo';
import { LayoutService } from '../layout.service';

import { NavigationItem, NavigationService, VerticalNavigationComponent } from '@libs/navigation';
import { SvgIcon } from '@libs/svg-icon';

@Component({
  selector: 'dense-layout',
  templateUrl: './dense.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, SvgIcon, LogoComponent, VerticalNavigationComponent],
  host: {
    class: 'flex flex-row flex-auto w-full h-full',
  },
})
export class DenseLayoutComponent implements OnInit, OnDestroy {
  $isScreenSmall = signal<boolean>(false);
  $navigation = signal<NavigationItem[]>([]);
  $navigationAppearance = signal<'default' | 'dense'>('default');

  private _unsubscribeAll: Subject<any> = new Subject<any>();

  private _cdRef = inject(ChangeDetectorRef);
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
        this.$isScreenSmall.set(!matchingAliases.includes('lg'));
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
