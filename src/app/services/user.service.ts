import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, Signal, signal } from '@angular/core';
import { NgxPermissionsService } from 'ngx-permissions';

import { ResponseModel } from '@/api/models';
import { environment } from '@environment';
import { UserModel } from '@models';
import { map, Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserService {
  private _httpClient = inject(HttpClient);
  private _user = signal<UserModel | null>(null);
  private _permission = inject(NgxPermissionsService);

  // -----------------------------------------------------------------------------------------------------
  // @ Accessors
  // -----------------------------------------------------------------------------------------------------

  set user(value: UserModel | null) {
    this._user.set(value);
    this._permission.flushPermissions();
    this._permission.loadPermissions(value?.permissions ?? []);
  }

  get $user(): Signal<UserModel | null> {
    return this._user;
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  get(): Observable<UserModel> {
    return this._httpClient.get<UserModel>('api/common/user').pipe(
      tap((user) => {
        this._user.set(user);
      })
    );
  }

  update(user: UserModel): Observable<any> {
    return this._httpClient.patch<UserModel>('api/common/user', { user }).pipe(
      map((response) => {
        this._user.set(response);
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
