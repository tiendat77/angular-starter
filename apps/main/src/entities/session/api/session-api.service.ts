import { HttpBackend, HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  catchError,
  finalize,
  Observable,
  of,
  shareReplay,
  switchMap,
  tap,
  throwError,
} from 'rxjs';

import { environment } from '@environment';
import { SessionStore, SessionTokens } from '../model/session.store';

@Injectable({ providedIn: 'root' })
export class SessionApiService {
  private readonly _session = inject(SessionStore);
  // Bypasses the interceptors: the refresh call must not trigger another refresh on a 401
  private readonly _http = new HttpClient(inject(HttpBackend));

  /** Exchanges the refresh token for new tokens; concurrent callers share one request. */
  refreshAccessToken(): Observable<SessionTokens> {
    if (this._session.refreshInFlight) {
      return this._session.refreshInFlight;
    }

    const request$ = this._http
      .post(`${environment.apiUrl}/auth/refresh-token`, {
        accessToken: this._session.accessToken,
        refreshToken: this._session.refreshToken,
      })
      .pipe(
        switchMap((response: any) => {
          if (response.isError) {
            return throwError(() => new Error(response.message || 'An error occurred'));
          }

          return of(response.data);
        }),
        tap((data: SessionTokens) => {
          this._session.accessToken = data.accessToken;
          this._session.refreshToken = data.refreshToken;
        }),
        catchError((error) => {
          this._session.signOut();
          return throwError(() => error);
        }),
        finalize(() => {
          this._session.refreshInFlight = null;
        }),
        shareReplay({ bufferSize: 1, refCount: true })
      );

    this._session.refreshInFlight = request$;
    return request$;
  }
}
