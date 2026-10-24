import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  inject,
  input,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { ReplaySubject } from 'rxjs';

import { NavigationService } from '../navigation.service';
import { NavigationItem } from '../navigation.types';

import { UtilsHelper } from '../utils.helper';
import { HorizontalNavigationBasicItemComponent } from './components/basic/basic.component';
import { HorizontalNavigationBranchItemComponent } from './components/branch/branch.component';
import { HorizontalNavigationSpacerItemComponent } from './components/spacer/spacer.component';

@Component({
  selector: 'horizontal-navigation',
  templateUrl: './horizontal.component.html',
  styleUrls: ['./horizontal.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  exportAs: 'horizontalNavigation',
  imports: [
    HorizontalNavigationBasicItemComponent,
    HorizontalNavigationBranchItemComponent,
    HorizontalNavigationSpacerItemComponent,
  ],
})
export class HorizontalNavigationComponent implements OnInit, OnDestroy {
  readonly name = input<string>(UtilsHelper.randomId());
  readonly navigation = input<NavigationItem[]>([]);

  /** The `name` the items look this navigation up by; a random one when `name` is empty. */
  readonly $name = computed(() => this.name() || this._fallbackName);

  onRefreshed: ReplaySubject<boolean> = new ReplaySubject<boolean>(1);

  private readonly _fallbackName = UtilsHelper.randomId();
  private _registeredName: string;

  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _navigationService = inject(NavigationService);

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  ngOnInit(): void {
    // Register the navigation component
    this._registeredName = this.$name();
    this._navigationService.registerComponent(this._registeredName, this);
  }

  ngOnDestroy(): void {
    // Deregister the navigation component from the registry
    this._navigationService.deregisterComponent(this._registeredName);
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /** Re-renders the items after the app changed some of them in place (a badge, a title). */
  refresh(): void {
    this._changeDetectorRef.markForCheck();
    this.onRefreshed.next(true);
  }
}
