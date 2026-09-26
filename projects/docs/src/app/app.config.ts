import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideUiConfig } from '@libs/ui/core';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
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
