/** Angular */
import { BreakpointObserver } from '@angular/cdk/layout';
import { Injectable } from '@angular/core';

/** Utils */
import { fromPairs } from 'es-toolkit/compat';
import { Observable, ReplaySubject, map, of, switchMap } from 'rxjs';

/** Config */
import { navigation } from '@configs/navigation.config';
import { NavigationItem } from '@libs/navigation';

interface MediaChange {
  matchingAliases: string[];
  matchingQueries: any;
}

@Injectable({ providedIn: 'root' })
export class LayoutService {
  private _navigation = new ReplaySubject<NavigationItem[]>(1);
  private _onMediaChange = new ReplaySubject<MediaChange>(1);

  constructor(private _breakpointObserver: BreakpointObserver) {
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
                Object.entries(state.breakpoints).filter(([query, matches]) => matches) ?? [];
              for (const [query] of matchingBreakpoints) {
                // Find the alias of the matching query
                const matchingAlias = Object.entries(screens).find(
                  ([alias, q]) => q === query
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

  get onMediaChange$(): Observable<MediaChange> {
    return this._onMediaChange.asObservable();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  get(): Observable<NavigationItem[]> {
    return new Observable((resolver) => {
      this._navigation.next(navigation);
      resolver.next([]);
      resolver.complete();
    });
  }
}
