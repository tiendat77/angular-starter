import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
  inject,
} from '@angular/core';

import { Subject, takeUntil } from 'rxjs';
import { NavigationService } from '../../../navigation.service';
import { NavigationItem } from '../../../navigation.types';
import { VerticalNavigationComponent } from '../../vertical.component';

@Component({
  selector: 'vertical-navigation-spacer-item',
  templateUrl: './spacer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass],
})
export class VerticalNavigationSpacerItemComponent implements OnInit, OnDestroy {
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _navigationService = inject(NavigationService);

  @Input() item: NavigationItem;
  @Input() name: string;

  private _verticalNavigationComponent: VerticalNavigationComponent;
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  ngOnInit(): void {
    this._verticalNavigationComponent = this._navigationService.getComponent(this.name);

    this._verticalNavigationComponent.onRefreshed
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(() => {
        this._changeDetectorRef.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }
}
