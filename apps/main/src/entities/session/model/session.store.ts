import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NgxPermissionsService } from 'ngx-permissions';
import { catchError, Observable, of, switchMap } from 'rxjs';

import { STORAGE_KEYS } from '@/shared/config/storage.config';
import { AuthUtils } from './auth.utils';
import { UserModel } from './user.model';

export interface SessionTokens {
  accessToken: string;
  refreshToken: string;
}

/**
 * The signed-in session: tokens (persisted in localStorage), the current user and its permissions.
 * Sign-in / refresh transactions live elsewhere (`features/auth`, `SessionApiService`) and report
 * their outcome here.
 */
@Injectable({ providedIn: 'root' })
export class SessionStore {
  private readonly _router = inject(Router);
  private readonly _permissions = inject(NgxPermissionsService);

  private readonly _user = signal<UserModel | null>(null);
  private _authenticated = false;
  private _accessToken = '';
  private _refreshToken = '';

  /** The single in-flight token refresh, so concurrent 401s share one HTTP call. */
  refreshInFlight: Observable<SessionTokens> | null = null;

  // -----------------------------------------------------------------------------------------------------
  // @ Accessors
  // -----------------------------------------------------------------------------------------------------

  /** The current user, `null` when signed out. */
  readonly $user = this._user.asReadonly();

  get accessToken(): string {
    return this._accessToken;
  }

  set accessToken(value: string) {
    this._accessToken = value || '';
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, value || '');
  }

  get refreshToken(): string {
    return this._refreshToken;
  }

  set refreshToken(value: string) {
    this._refreshToken = value || '';
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, value || '');
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /** Starts a session from freshly issued tokens (sign-in). Returns whether the token decoded. */
  start(accessToken: string, refreshToken: string): boolean {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this._authenticated = true;

    const decoded = AuthUtils.decode(accessToken);
    if (decoded) {
      this.setUser(decoded as UserModel);
    }
    return !!decoded;
  }

  /** Restores a session from the tokens kept in localStorage. */
  restore(): boolean {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    if (!token || !refreshToken) {
      return false;
    }

    const decoded = AuthUtils.decode(token);
    if (!decoded) {
      return false;
    }

    this.accessToken = token;
    this.refreshToken = refreshToken;
    this._authenticated = true;
    this.setUser(decoded as UserModel);
    return true;
  }

  /** Whether there is a valid session, restoring it from localStorage when needed. */
  check(): Observable<boolean> {
    if (this._authenticated) {
      return of(true);
    }

    return of(localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)).pipe(
      switchMap((token) => {
        if (!token || AuthUtils.isTokenExpired(token)) {
          return of(false);
        }

        // The access token exists and didn't expire: use it to sign in
        return of(this.restore());
      }),
      catchError((error) => {
        console.error(error);
        // Clear the invalid token
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        return of(false);
      })
    );
  }

  /** Sets the user and loads its permissions. */
  setUser(user: UserModel | null): void {
    this._user.set(user);
    this._permissions.flushPermissions();
    this._permissions.loadPermissions(user?.permissions ?? []);
  }

  /** Replaces the profile data of the current user without touching its permissions. */
  setProfile(user: UserModel): void {
    this._user.set(user);
  }

  /** Drops the session and goes to the sign-in page. */
  signOut(): Observable<boolean> {
    this._authenticated = false;
    this.setUser(null);

    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);

    this._accessToken = '';
    this._refreshToken = '';
    this.refreshInFlight = null;

    this._router.navigate(['/sign-in']);

    return of(true);
  }
}
