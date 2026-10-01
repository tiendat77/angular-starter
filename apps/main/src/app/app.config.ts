import { provideHttpClient, withInterceptors, withXhr } from '@angular/common/http';
import {
  ApplicationConfig,
  importProvidersFrom,
  inject,
  provideEnvironmentInitializer,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import { provideIcons } from '@libs/ui/svg-icon';

import { ThemeService } from '@/shared/lib/theme/theme.service';
import { authInterceptor } from './interceptors/auth.interceptor';

import { NgxPermissionsModule } from 'ngx-permissions';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(withXhr(), withInterceptors([authInterceptor])),
    provideIcons([
      // See more at https://heroicons.com/
      {
        name: 'heroicons_outline',
        url: 'icons/heroicons-outline.svg',
      },
      {
        name: 'heroicons_solid',
        url: 'icons/heroicons-solid.svg',
      },
    ]),
    importProvidersFrom([NgxPermissionsModule.forRoot()]),
    provideEnvironmentInitializer(() => {
      inject(ThemeService);
    }),
  ],
};
