import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideUiConfig } from '@libs/ui/core';
import { provideIcons } from '@libs/ui/svg-icon';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    // Toast and date-picker use @angular/animations triggers
    provideAnimationsAsync(),
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
