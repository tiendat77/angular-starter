/** Angular */
import { HttpBackend, HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';

/** Utils */
import { BehaviorSubject, Observable, forkJoin, of, throwError } from 'rxjs';
import { catchError, filter, finalize, switchMap, take, tap } from 'rxjs/operators';
import { AuthUtils } from '../helpers/auth.utils';

/** Services */
import { DialogService } from '@libs/dialog';
import { ToastService } from '@libs/toast';
import { UserService } from './user.service';

/** Models */
import { ResponseModel } from '@/api/models';
import { STORAGE_KEYS } from '@configs/storage.config';
import { environment } from '@environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private _authenticated = false;

  private _router = inject(Router);
  private _user = inject(UserService);
  private _toast = inject(ToastService);
  private _dialog = inject(DialogService);

  private _httpHandler = inject(HttpBackend);
  private _httpClient = new HttpClient(this._httpHandler);

  // -----------------------------------------------------------------------------------------------------
  // @ Accessors
  // -----------------------------------------------------------------------------------------------------

  /**
   * Access token
   */
  get accessToken(): string {
    return this._accessToken;
  }

  set accessToken(value: string) {
    this._accessToken = value;
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, value);
  }

  private _accessToken = '';

  /**
   * Refresh token
   */
  get refreshToken(): string {
    return this._refreshToken;
  }

  set refreshToken(value: string) {
    this._refreshToken = value;
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, value);
  }

  private _refreshToken = '';
  private _refreshTokenSub$ = new BehaviorSubject<string | null>(null);

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  signIn(credentials: { username: string; password: string }): Observable<any> {
    return this._httpClient
      .post<ResponseModel>(`${environment.apiUrl}/authentication/login`, credentials)
      .pipe(
        switchMap((response: any) => {
          if (response.isError) {
            return throwError(() => new Error(response.message || 'An error occurred'));
          }

          return of(response.data);
        }),
        tap((response: any) => {
          this.accessToken = response.accessToken;
          this.refreshToken = response.refreshToken;
          this._authenticated = true;

          // Get the user data
          const decoded = AuthUtils.decode(response.accessToken);

          if (decoded) {
            this._user.user$.set(decoded as any);
          }
        })
      );
  }

  signInUsingToken(): Observable<any> {
    return forkJoin([
      of(localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) ?? ''),
      of(localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN) ?? ''),
    ]).pipe(
      switchMap(([token, refreshToken]) => {
        if (!token || !refreshToken) {
          return of(false);
        }

        const decoded = AuthUtils.decode(token);

        if (!decoded) {
          return of(false);
        }

        this.accessToken = token;
        this.refreshToken = refreshToken;
        this._authenticated = true;

        // Get the user data
        this._user.user$.set(decoded as any);

        return of(true);
      }),
      catchError((error) => {
        console.error(error);
        return of(false);
      })
    );
  }

  signOut(): Observable<any> {
    // Set the authenticated flag to false
    this._authenticated = false;

    // Clear user data
    this._user.user$.set(null);

    // Close all the dialogs
    this._dialog.closeAll();

    // Close all toast notifications
    this._toast.dismiss();

    // Remove the access token from the local storage
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    this._accessToken = '';
    this._refreshToken = '';

    // Navigate to the sign-in page
    this._router.navigate(['/sign-in']);

    return of(true);
  }

  refreshAccessToken(): Observable<{
    accessToken: string;
    refreshToken: string;
  }> {
    if (this._refreshTokenSub$.value) {
      return this._refreshTokenSub$.pipe(
        filter((token) => token != null),
        take(1),
        switchMap(() => {
          return of({
            accessToken: this.accessToken,
            refreshToken: this.refreshToken,
          });
        })
      );
    }

    this._refreshTokenSub$.next(null);

    return this._httpClient
      .post(`${environment.apiUrl}/authentication/refresh-token`, {
        accessToken: this.accessToken,
        refreshToken: this.refreshToken,
      })
      .pipe(
        switchMap((response: any) => {
          if (response.isError) {
            return throwError(() => new Error(response.message || 'An error occurred'));
          }

          return of(response.data);
        }),
        tap((data: any) => {
          this.accessToken = data.accessToken;
          this.refreshToken = data.refreshToken;
        }),
        catchError((error) => {
          this.signOut();
          return throwError(() => error);
        }),
        finalize(() => {
          this._refreshTokenSub$.next(this.refreshToken);
        })
      );
  }

  check(): Observable<boolean> {
    // Check if the user is logged in
    if (this._authenticated) {
      return of(true);
    }

    // Check if token already generated
    return of(localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) ?? '').pipe(
      switchMap((token) => {
        if (!token) {
          return of(false);
        }

        if (AuthUtils.isTokenExpired(token ?? '')) {
          return of(false);
        }

        return token;
      }),
      switchMap(() =>
        /**
         * If the access token exists and it didn't expire,
         * use it to sign in
         */
        this.signInUsingToken()
      ),
      catchError(() => {
        // Clear invalid token
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        return of(false);
      })
    );
  }

  signUp(form: { name: string; email: string; password: string }): Observable<any> {
    return this._httpClient
      .post<ResponseModel>(`${environment.apiUrl}/authentication/sign-up`, form)
      .pipe(
        switchMap((response: any) => {
          if (response.isError) {
            return throwError(() => new Error(response.message || 'An error occurred'));
          }

          return of(response.data);
        }),
        tap((response: any) => {
          this.accessToken = response.accessToken;
          this.refreshToken = response.refreshToken;
          this._authenticated = true;

          // Get the user data
          const decoded = AuthUtils.decode(response.accessToken);

          if (decoded) {
            this._user.user$.set(decoded as any);
          }
        })
      );
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------
}
