import { NgClass, NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { IsActiveMatchOptions, RouterLink, RouterLinkActive } from '@angular/router';

import { SvgIconModule } from '@libs/svg-icon';

import { Subject, takeUntil } from 'rxjs';
import { NavigationService } from '../../../navigation.service';
import { NavigationItem } from '../../../navigation.types';
import { UtilsHelper } from '../../../utils.helper';
import { VerticalNavigationComponent } from '../../vertical.component';

@Component({
  selector: 'vertical-navigation-basic-item',
  templateUrl: './basic.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [NgClass, NgTemplateOutlet, RouterLink, RouterLinkActive, SvgIconModule],
})
export class VerticalNavigationBasicItemComponent implements OnInit, OnDestroy {
  @Input() item: NavigationItem;
  @Input() name: string;

  isActiveMatchOptions: IsActiveMatchOptions;

  private _verticalNavigationComponent: VerticalNavigationComponent;
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _navigationService: NavigationService
  ) {
    this.isActiveMatchOptions = UtilsHelper.subsetMatchOptions;
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  ngOnInit(): void {
    // Set the "isActiveMatchOptions" either from item's
    // "isActiveMatchOptions" or the equivalent form of
    // item's "exactMatch" option
    this.isActiveMatchOptions =
      (this.item.isActiveMatchOptions ?? this.item.exactMatch)
        ? UtilsHelper.exactMatchOptions
        : UtilsHelper.subsetMatchOptions;

    // Get the parent navigation component
    this._verticalNavigationComponent = this._navigationService.getComponent(this.name);

    // Mark for check
    this._changeDetectorRef.markForCheck();

    // Subscribe to onRefreshed on the navigation component
    this._verticalNavigationComponent.onRefreshed
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
