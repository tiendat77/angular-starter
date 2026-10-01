import { HttpBackend, HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, of, switchMap, tap, throwError } from 'rxjs';

import { SessionStore } from '@/entities/session';
import { ResponseModel } from '@/shared/api/models';
import { environment } from '@environment';

/** Unwraps a `ResponseModel`: errors flagged by the API become thrown errors. */
function unwrap<T = any>(response: any): Observable<T> {
  if (response.isError) {
    return throwError(() => new Error(response.message || 'An error occurred'));
  }

  return of(response.data);
}

/** The sign-in / sign-up / password transactions. A successful sign-in starts the session. */
@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly _session = inject(SessionStore);
  // Bypasses the interceptors: these calls are made without a session
  private readonly _http = new HttpClient(inject(HttpBackend));

  signIn(credentials: { username: string; password: string }): Observable<any> {
    return this._http.post<ResponseModel>(`${environment.apiUrl}/auth/login`, credentials).pipe(
      switchMap((response) => unwrap(response)),
      tap((data) => this._session.start(data.accessToken, data.refreshToken))
    );
  }

  signUp(credentials: { name: string; email: string; password: string }): Observable<any> {
    return this._http.post<ResponseModel>(`${environment.apiUrl}/auth/sign-up`, credentials);
  }

  forgotPassword(username: string): Observable<any> {
    return this._http
      .post<ResponseModel>(`${environment.apiUrl}/auth/forgot-password`, { username })
      .pipe(switchMap((response) => unwrap(response)));
  }

  resetPassword(credentials: { newPassword: string; token: string }): Observable<any> {
    return this._http
      .post<ResponseModel>(`${environment.apiUrl}/auth/reset-password`, credentials)
      .pipe(switchMap((response) => unwrap(response)));
  }
}
