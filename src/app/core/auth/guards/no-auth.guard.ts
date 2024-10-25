import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

import { of, switchMap } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const NoAuthGuard: CanActivateFn | CanActivateChildFn = (_route, _state) => {
  const router: Router = inject(Router);

  return inject(AuthService)
    .check()
    .pipe(
      switchMap((authenticated) => {
        if (authenticated) {
          return of(router.parseUrl(''));
        }

        // Allow the access
        return of(true);
      })
    );
};
