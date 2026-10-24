import { ChangeDetectorRef, DestroyRef, Directive, inject, input, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';

import { NavigationService } from './navigation.service';
import { NavigationItem } from './navigation.types';

/** What an item needs from the navigation it is rendered in. */
export interface NavigationRefreshable {
  /** Emits when the app changed an item in place and called `refresh()` on the navigation. */
  onRefreshed: Observable<boolean>;
}

/**
 * Base of every navigation item. An item is the `NavigationItem` it renders plus the `name` of the
 * navigation that owns it (the owner is looked up in the `NavigationService`).
 *
 * Items are plain objects that the app may mutate in place (a badge, a title). Signals cannot see
 * that, so the owner's `refresh()` is the one place left that marks the item for check.
 */
@Directive()
export abstract class NavigationItemBase<T extends NavigationRefreshable> implements OnInit {
  readonly item = input.required<NavigationItem>();
  readonly name = input.required<string>();

  /** The navigation component that owns this item. */
  protected navigation!: T;

  protected readonly _changeDetectorRef = inject(ChangeDetectorRef);
  protected readonly _destroyRef = inject(DestroyRef);
  protected readonly _navigationService = inject(NavigationService);

  ngOnInit(): void {
    this.navigation = this._navigationService.getComponent<T>(this.name());

    this.navigation.onRefreshed
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(() => this._changeDetectorRef.markForCheck());
  }
}
