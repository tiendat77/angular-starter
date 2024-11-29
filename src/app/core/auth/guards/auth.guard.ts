import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';

import { of, switchMap } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const AuthGuard: CanActivateFn | CanActivateChildFn = (route, state) => {
  const router: Router = inject(Router);

  return inject(AuthService)
    .check()
    .pipe(
      switchMap((authenticated) => {
        if (!authenticated) {
          // Redirect to the sign-in page with redirect URL
          const redirectUrl = state.url === '/sign-out' ? '' : `redirectURL=${state.url}`;
          const urlTree = router.parseUrl(`sign-in?${redirectUrl}`);

          return of(urlTree);
        }

        // Allow the route to be activated
        return of(true);
      })
    );
};
