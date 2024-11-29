import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import { ReplaySubject, Subject } from 'rxjs';

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
  standalone: true,
  imports: [
    HorizontalNavigationBasicItemComponent,
    HorizontalNavigationBranchItemComponent,
    HorizontalNavigationSpacerItemComponent,
  ],
})
export class HorizontalNavigationComponent implements OnChanges, OnInit, OnDestroy {
  @Input() name: string = UtilsHelper.randomId();
  @Input() navigation: NavigationItem[];

  onRefreshed: ReplaySubject<boolean> = new ReplaySubject<boolean>(1);
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  /**
   * Constructor
   */
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _navigationService: NavigationService
  ) {}

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  ngOnChanges(changes: SimpleChanges): void {
    // Navigation
    if ('navigation' in changes) {
      // Mark for check
      this._changeDetectorRef.markForCheck();
    }
  }

  ngOnInit(): void {
    // Make sure the name input is not an empty string
    if (this.name === '') {
      this.name = UtilsHelper.randomId();
    }

    // Register the navigation component
    this._navigationService.registerComponent(this.name, this);
  }

  ngOnDestroy(): void {
    // Deregister the navigation component from the registry
    this._navigationService.deregisterComponent(this.name);

    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  refresh(): void {
    this._changeDetectorRef.markForCheck();
    this.onRefreshed.next(true);
  }
}
