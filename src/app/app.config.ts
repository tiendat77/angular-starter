import { APP_INITIALIZER, ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { provideIcons } from '@libs/svg-icon';

import { ThemeService } from '@/services/theme.service';
import { startUpFn } from '@configs/start-up.config';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
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

    /** Preload setup before the app starts */
    {
      provide: APP_INITIALIZER,
      useFactory: startUpFn,
      deps: [ThemeService],
      multi: true,
    },
  ],
};
