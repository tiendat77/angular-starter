import { provideHttpClient, withInterceptors, withXhr } from '@angular/common/http';
import {
  EnvironmentProviders,
  inject,
  provideEnvironmentInitializer,
  Provider,
} from '@angular/core';

import { authInterceptor } from './auth.interceptor';
import { AuthService } from './auth.service';

/**
 * Provide Auth
 */
export const provideAuth = (): (Provider | EnvironmentProviders)[] => {
  return [
    provideHttpClient(withXhr(), withInterceptors([authInterceptor])),
    provideEnvironmentInitializer(() => inject(AuthService)),
  ];
};
