import { ENVIRONMENT_INITIALIZER, EnvironmentProviders, Provider, inject } from '@angular/core';
import { UiBottomSheet } from './bottom-sheet.service';

/** Eagerly instantiates UiBottomSheet at bootstrap so it's ready before the first open() call. */
export const provideBottomSheet = (): (Provider | EnvironmentProviders)[] => {
  return [
    {
      provide: ENVIRONMENT_INITIALIZER,
      useValue: () => inject(UiBottomSheet),
      multi: true,
    },
  ];
};
