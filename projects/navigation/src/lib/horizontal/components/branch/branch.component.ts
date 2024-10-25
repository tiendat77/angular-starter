import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  forwardRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { NgClass, NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
import { BooleanInput } from '@angular/cdk/coercion';
import { SvgIconModule } from '@libs/svg-icon';

import { Subject, takeUntil } from 'rxjs';
import { NavigationService } from '../../../navigation.service';
import { NavigationItem } from '../../../navigation.types';

import { HorizontalNavigationBasicItemComponent } from '../../components/basic/basic.component';
import { HorizontalNavigationDividerItemComponent } from '../../../horizontal/components/divider/divider.component';
import { HorizontalNavigationComponent } from '../../../horizontal/horizontal.component';

@Component({
  selector: 'horizontal-navigation-branch-item',
  templateUrl: './branch.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgIf,
    NgClass,
    NgTemplateOutlet,
    NgFor,
    SvgIconModule,
    HorizontalNavigationBasicItemComponent,
    HorizontalNavigationDividerItemComponent,
    forwardRef(() => HorizontalNavigationBranchItemComponent),
  ],
})
export class HorizontalNavigationBranchItemComponent implements OnInit, OnDestroy {
  static ngAcceptInputType_child: BooleanInput;

  @Input() child: boolean = false;
  @Input() item: NavigationItem;
  @Input() name: string;

  private _horizontalNavigationComponent: HorizontalNavigationComponent;
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

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  triggerChangeDetection(): void {
    // Mark for check
    this._changeDetectorRef.markForCheck();
  }

  trackByFn(index: number, item: any): any {
    return item.id || index;
  }
}
