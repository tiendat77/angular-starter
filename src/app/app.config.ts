import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { provideIcons } from '@libs/svg-icon';

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
  ],
};
