import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';

import { of, switchMap } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const NoAuthGuard: CanActivateFn | CanActivateChildFn = (_route, _state) => {
  const router: Router = inject(Router);

  return inject(AuthService)
    .check()
    .pipe(
      switchMap((authenticated) => {
        if (authenticated) {
          return of(router.parseUrl('/signed-in-redirect'));
        }

        // Allow the access
        return of(true);
      })
    );
};
