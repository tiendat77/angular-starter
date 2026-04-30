/** Angular */
import { BreakpointObserver } from '@angular/cdk/layout';
import { inject, Injectable } from '@angular/core';

/** Utils */
import { cloneDeep } from 'es-toolkit';
import { fromPairs } from 'es-toolkit/compat';
import { map, Observable, of, ReplaySubject, switchMap } from 'rxjs';

/** Config */
import { navigation } from '@configs/navigation.config';
import { NavigationItem } from '@libs/navigation';

@Injectable({ providedIn: 'root' })
export class LayoutService {
  private _navigation = new ReplaySubject<NavigationItem[]>(1);
  private _onMediaChange = new ReplaySubject<{
    matchingAliases: string[];
    matchingQueries: any;
  }>(1);

  private _breakpointObserver = inject(BreakpointObserver);

  constructor() {
    const screens = fromPairs(
      Object.entries({
        sm: '600px',
        md: '960px',
        lg: '1280px',
        xl: '1440px',
      }).map(([alias, screen]) => [alias, `(min-width: ${screen})`])
    );

    of(Object.values(screens))
      .pipe(
        switchMap((breakpoints) =>
          this._breakpointObserver.observe(breakpoints).pipe(
            map((state) => {
              // Prepare the observable values and set their defaults
              const matchingAliases: string[] = [];
              const matchingQueries: any = {};

              // Get the matching breakpoints and use them to fill the subject
              const matchingBreakpoints =
                Object.entries(state.breakpoints).filter(([_query, matches]) => matches) ?? [];
              for (const [query] of matchingBreakpoints) {
                // Find the alias of the matching query
                const matchingAlias = Object.entries(screens).find(
                  ([_alias, q]) => q === query
                )?.[0];

                // Add the matching query to the observable values
                if (matchingAlias) {
                  matchingAliases.push(matchingAlias);
                  matchingQueries[matchingAlias] = query;
                }
              }

              // Execute the observable
              this._onMediaChange.next({
                matchingAliases,
                matchingQueries,
              });
            })
          )
        )
      )
      .subscribe();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Accessors
  // -----------------------------------------------------------------------------------------------------

  get navigation$(): Observable<NavigationItem[]> {
    return this._navigation.asObservable();
  }

  get onMediaChange$(): Observable<{
    matchingAliases: string[];
    matchingQueries: any;
  }> {
    return this._onMediaChange.asObservable();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  get(permissions: string[] = []): Observable<NavigationItem[]> {
    return new Observable((resolver) => {
      this._navigation.next(this._filter(cloneDeep(navigation), permissions));
      resolver.next([]);
      resolver.complete();
    });
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------

  private _filter(navigation: NavigationItem[], permissions: string[]) {
    return (
      navigation
        /** Just take the navigation that signed user has permission */
        .filter((item) => this._hasPermission(item, permissions))

        /** Remove navigation's children that user has no permission */
        .map((item) => {
          if (item.type === 'group') {
            item.children = item?.children?.filter((child) =>
              this._hasPermission(child, permissions)
            );
          }

          return item;
        })

        /** Remove navigation group that not have any children */
        .filter((item) => {
          if (item.type === 'group') {
            return (item?.children?.length || 0) > 0;
          }

          // if item is not group, return true
          return true;
        })
    );
  }

  private _hasPermission(item: NavigationItem, permissions: string[]): boolean {
    if (item.type === 'group' && !item?.children?.length) {
      return item?.children?.some((child) => this._hasPermission(child, permissions)) || false;
    }

    if (item?.permissions && item?.permissions?.length) {
      return item.permissions?.some((permission) => permissions?.includes(permission));
    }

    return true;
  }
}
