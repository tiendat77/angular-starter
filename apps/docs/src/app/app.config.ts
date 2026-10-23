import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideUiConfig } from '@libs/ui/core';
import { provideIcons } from '@libs/ui/svg-icon';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideIcons([
      { name: 'heroicons_outline', url: 'icons/heroicons-outline.svg' },
      { name: 'heroicons_solid', url: 'icons/heroicons-solid.svg' },
    ]),
    provideUiConfig({
      defaultSize: 'md',
      button: {
        defaultVariant: 'primary',
        defaultSize: 'md',
      },
      formField: {
        appearance: 'outline',
      },
    }),
  ],
};
