import { provideHttpClient, withInterceptors, withXhr } from '@angular/common/http';
import {
  ApplicationConfig,
  importProvidersFrom,
  inject,
  provideEnvironmentInitializer,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideIcons } from '@libs/ui/svg-icon';

import { ThemeService } from '@/shared/lib/theme/theme.service';
import { authInterceptor } from './interceptors/auth.interceptor';

import { NgxPermissionsModule } from 'ngx-permissions';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes),
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
