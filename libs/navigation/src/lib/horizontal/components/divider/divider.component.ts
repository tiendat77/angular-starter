import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Subject, takeUntil } from 'rxjs';

import { NavigationService } from '../../../navigation.service';
import { NavigationItem } from '../../../navigation.types';
import { HorizontalNavigationComponent } from '../../horizontal.component';

@Component({
  selector: 'horizontal-navigation-divider-item',
  templateUrl: './divider.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass],
})
export class HorizontalNavigationDividerItemComponent implements OnInit, OnDestroy {
  @Input() item: NavigationItem;
  @Input() name: string;

  private _horizontalNavigationComponent: HorizontalNavigationComponent;
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _navigationService = inject(NavigationService);

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  ngOnInit(): void {
    // Get the parent navigation component
    this._horizontalNavigationComponent = this._navigationService.getComponent(this.name);

    // Subscribe to onRefreshed on the navigation component
    this._horizontalNavigationComponent.onRefreshed
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(() => {
        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }
}
