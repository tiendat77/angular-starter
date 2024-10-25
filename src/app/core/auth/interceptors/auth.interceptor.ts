import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

import { catchError, Observable, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { environment } from '@environment';

export const authInterceptor = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  if (!new RegExp(`^${environment?.apiUrl}`, 'i').test(req.url)) {
    return next(req);
  }

  const authService = inject(AuthService);
  const router = inject(Router);

  let newReq = req.clone();

  if (authService.accessToken) {
    newReq = req.clone({
      headers: req.headers.set('Authorization', 'Bearer ' + authService.accessToken),
    });
  }

  // Response
  return next(newReq).pipe(
    catchError((error) => {
      if (error instanceof HttpErrorResponse && error.status === 401 /** "401 Unauthorized" */) {
        return authService.refreshAccessToken().pipe(
          switchMap((res) => {
            const request = req.clone({
              headers: req.headers.set('Authorization', 'Bearer ' + res.accessToken),
            });

            // Retry request with the new token
            return next(request);
          }),
          catchError((error) => {
            // Logout on error
            authService.signOut();
            setTimeout(() => location.reload(), 10);
            return throwError(() => error);
          })
        );
      }

      if (error instanceof HttpErrorResponse && error.status === 403) {
        router.navigate(['/access-denied']);
      }

      return throwError(() => error);
    })
  );
};
