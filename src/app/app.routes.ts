import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'example',
  },
  {
    path: 'example',
    loadChildren: () => import('@/features/example/example.routes').then((m) => m.routes),
  },
];
