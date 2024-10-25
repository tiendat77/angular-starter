import { inject } from '@angular/core';
import { Routes } from '@angular/router';

import { LayoutComponent, LayoutService } from '@/core/layouts';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'app/overview',
  },

  {
    path: 'app',
    component: LayoutComponent,
    data: { layout: 'dense' },
    resolve: {
      initial: () => {
        const _layoutService = inject(LayoutService);
        return _layoutService.get();
      },
    },
    children: [
      {
        path: 'overview',
        loadChildren: () => import('./features/example/example.routes').then((m) => m.routes),
      },
    ],
  },
];
