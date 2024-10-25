import { ENVIRONMENT_INITIALIZER, EnvironmentProviders, inject, Provider } from '@angular/core';

import { LoaderService } from './loader.service';

export const provideLoader = (): (Provider | EnvironmentProviders)[] => {
  return [
    {
      provide: ENVIRONMENT_INITIALIZER,
      useValue: () => inject(LoaderService),
      multi: true,
    },
  ];
};
