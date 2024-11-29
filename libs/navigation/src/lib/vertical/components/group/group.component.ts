import { BooleanInput } from '@angular/cdk/coercion';
import { NgClass, NgFor, NgIf } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  forwardRef,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { SvgIconModule } from '@libs/svg-icon';

import { Subject, takeUntil } from 'rxjs';
import { NavigationService } from '../../../navigation.service';
import { NavigationItem } from '../../../navigation.types';

import { VerticalNavigationComponent } from '../../vertical.component';
import { VerticalNavigationBasicItemComponent } from '../basic/basic.component';
import { VerticalNavigationCollapsableItemComponent } from '../collapsable/collapsable.component';
import { VerticalNavigationDividerItemComponent } from '../divider/divider.component';
import { VerticalNavigationSpacerItemComponent } from '../spacer/spacer.component';

@Component({
  selector: 'vertical-navigation-group-item',
  templateUrl: './group.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgClass,
    NgIf,
    NgFor,
    SvgIconModule,
    VerticalNavigationBasicItemComponent,
    VerticalNavigationCollapsableItemComponent,
    VerticalNavigationDividerItemComponent,
    VerticalNavigationSpacerItemComponent,
    forwardRef(() => VerticalNavigationGroupItemComponent),
  ],
})
export class VerticalNavigationGroupItemComponent implements OnInit, OnDestroy {
  static ngAcceptInputType_autoCollapse: BooleanInput;

  @Input() autoCollapse: boolean;
  @Input() item: NavigationItem;
  @Input() name: string;

  private _verticalNavigationComponent: VerticalNavigationComponent;
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _navigationService: NavigationService
  ) {}

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  ngOnInit(): void {
    // Get the parent navigation component
    this._verticalNavigationComponent = this._navigationService.getComponent(this.name);

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
