import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';

import { of, switchMap } from 'rxjs';
import { AuthService } from '../auth';

export const NoAuthGuard: CanActivateFn | CanActivateChildFn = () => {
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
