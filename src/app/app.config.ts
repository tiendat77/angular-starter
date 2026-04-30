import {
  ApplicationConfig,
  importProvidersFrom,
  inject,
  provideEnvironmentInitializer,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { provideIcons } from '@libs/svg-icon';

import { provideAuth } from './core/auth';
import { ThemeService } from './services/theme.service';
import { UserService } from './services/user.service';

import { NgxPermissionsModule } from 'ngx-permissions';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimations(),
    provideAuth(),
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
      inject(UserService);
    }),
  ],
};
