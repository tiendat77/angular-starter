import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';

import { environment } from '@environment';
import { map, Observable, tap } from 'rxjs';

import { ResponseModel } from '@/api/models';
import { UserModel } from '../models';

@Injectable({ providedIn: 'root' })
export class UserService {
  user$ = signal<UserModel | null>(null);

  private _httpClient = inject(HttpClient);

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  get(): Observable<UserModel> {
    return this._httpClient.get<UserModel>('api/common/user').pipe(
      tap((user) => {
        this.user$.set(user);
      })
    );
  }

  update(user: UserModel): Observable<any> {
    return this._httpClient.patch<UserModel>('api/common/user', { user }).pipe(
      map((response) => {
        this.user$.set(response);
      })
    );
  }

  changePassword(password: string): Observable<any> {
    return this._httpClient.post<ResponseModel>(`${environment.apiUrl}/auth/change-password`, {
      password,
    });
  }

  forgotPassword(email: string): Observable<any> {
    return this._httpClient.post<ResponseModel>(`${environment.apiUrl}/auth/forgot-password`, {
      email,
    });
  }

  resetPassword(password: string, token: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this._httpClient.post<ResponseModel>(
      `${environment.apiUrl}/auth/reset-password`,
      { password },
      { headers }
    );
  }
}
