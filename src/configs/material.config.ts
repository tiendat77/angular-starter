import { EnvironmentProviders, Provider } from '@angular/core';

import { MATERIAL_SANITY_CHECKS } from '@angular/material/core';
import { MAT_PAGINATOR_DEFAULT_OPTIONS } from '@angular/material/paginator';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';

export const provideMaterialConfig = (): (Provider | EnvironmentProviders)[] => {
  return [
    {
      // Disable 'theme' sanity check
      provide: MATERIAL_SANITY_CHECKS,
      useValue: {
        doctype: true,
        theme: false,
        version: true,
      },
    },
    {
      // Use the 'fill' appearance on Material form fields by default
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: {
        appearance: 'fill',
      },
    },
    {
      // Set default page size for Material paginator
      provide: MAT_PAGINATOR_DEFAULT_OPTIONS,
      useValue: {
        pageSize: 10,
        pageSizeOptions: [10, 20, 30, 50],
        showFirstLastButtons: true,
      },
    },
  ];
};
