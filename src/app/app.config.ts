import { APP_INITIALIZER, ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import { provideIcons } from '@libs/svg-icon';
import { provideMaterialConfig } from '@configs/material.config';

import { ThemeService } from '@/services/theme.service';
import { startUpFn } from '@configs/start-up.config';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimationsAsync(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideMaterialConfig(),
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
