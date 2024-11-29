import { provideHttpClient } from '@angular/common/http';
import { ENVIRONMENT_INITIALIZER, EnvironmentProviders, inject, Provider } from '@angular/core';

import { IconNamespace } from './icon.interface';
import { ICON_NAMESPACES } from './icon.token';
import { IconsService } from './icons.service';

export const provideIcons = (
  namespaces: IconNamespace[] = []
): (Provider | EnvironmentProviders)[] => {
  return [
    provideHttpClient(),
    {
      provide: ICON_NAMESPACES,
      useValue: namespaces,
    },
    {
      provide: ENVIRONMENT_INITIALIZER,
      useValue: () => inject(IconsService),
      multi: true,
    },
  ];
};
