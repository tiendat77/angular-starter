import { ENVIRONMENT_INITIALIZER, EnvironmentProviders, inject, Provider } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';

import { IconsService } from './icons.service';
import { ICON_NAMESPACES } from './icon.token';
import { IconNamespace } from './icon.interface';

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
