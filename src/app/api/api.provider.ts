import { ENVIRONMENT_INITIALIZER, EnvironmentProviders, inject, Provider } from '@angular/core';
import { ApiService } from './api.service';

export const provideApi = (): (Provider | EnvironmentProviders)[] => {
  return [
    {
      provide: ENVIRONMENT_INITIALIZER,
      useValue: () => inject(ApiService),
      multi: true,
    },
  ];
};
