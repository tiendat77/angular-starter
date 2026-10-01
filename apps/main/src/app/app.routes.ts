import { Routes } from '@angular/router';

import { AuthGuard, NoAuthGuard } from './guards';

export const routes: Routes = [
  /**
   * Public routes
   */
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'app/example',
  },
  {
    path: 'signed-in-redirect',
    pathMatch: 'full',
    redirectTo: 'app/example',
  },

  /**
   * Auth routes for guest
   */
  {
    path: '',
    canActivate: [NoAuthGuard],
    canActivateChild: [NoAuthGuard],
    children: [
      {
        path: 'sign-in',
        loadChildren: () => import('@/pages/sign-in'),
      },
      {
        path: 'sign-up',
        loadChildren: () => import('@/pages/sign-up'),
      },
      {
        path: 'forgot-password',
        loadChildren: () => import('@/pages/forgot-password'),
      },
      {
        path: 'reset-password',
        loadChildren: () => import('@/pages/reset-password'),
      },
    ],
  },

  /**
   * Guarded routes for logged in user
   */
  {
    path: 'app',
    // canActivate: [AuthGuard],
    // canActivateChild: [AuthGuard],
    loadComponent: () => import('@/widgets/layouts').then((m) => m.LayoutComponent),
    data: { layout: 'dense' },
    children: [
      {
        path: 'example',
        // canActivate: [ngxPermissionsGuard],
        // data: {
        //   permissions: {
        //     only: [PERMISSION.OVERVIEW],
        //     redirectTo: '/access-denied',
        //   },
        // },
        children: [
          {
            path: '',
            pathMatch: 'full',
            redirectTo: 'welcome',
          },
          {
            path: 'welcome',
            loadChildren: () => import('@/pages/welcome'),
          },
          {
            path: 'products',
            loadChildren: () => import('@/pages/products'),
          },
        ],
      },
    ],
  },
  {
    path: 'access-denied',
    loadComponent: () => import('@/widgets/layouts').then((m) => m.LayoutComponent),
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    data: { layout: 'empty' },
    loadChildren: () => import('@/pages/access-denied'),
  },

  /**
   * Not found route
   */
  {
    path: '**',
    loadChildren: () => import('@/pages/not-found'),
  },
];
