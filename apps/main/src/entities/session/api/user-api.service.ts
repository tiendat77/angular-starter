import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable, tap } from 'rxjs';

import { ResponseModel } from '@/shared/api/models';
import { environment } from '@environment';
import { SessionStore } from '../model/session.store';
import { UserModel } from '../model/user.model';

@Injectable({ providedIn: 'root' })
export class UserApiService {
  private readonly _http = inject(HttpClient);
  private readonly _session = inject(SessionStore);

  get(): Observable<UserModel> {
    return this._http
      .get<UserModel>('api/common/user')
      .pipe(tap((user) => this._session.setProfile(user)));
  }

  update(user: UserModel): Observable<any> {
    return this._http
      .patch<UserModel>('api/common/user', { user })
      .pipe(map((response) => this._session.setProfile(response)));
  }

  changePassword(password: string): Observable<any> {
    return this._http.post<ResponseModel>(`${environment.apiUrl}/auth/change-password`, {
      password,
    });
  }

  forgotPassword(email: string): Observable<any> {
    return this._http.post<ResponseModel>(`${environment.apiUrl}/auth/forgot-password`, {
      email,
    });
  }

  resetPassword(password: string, token: string): Observable<any> {
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    return this._http.post<ResponseModel>(
      `${environment.apiUrl}/auth/reset-password`,
      { password },
      { headers }
    );
  }
}
