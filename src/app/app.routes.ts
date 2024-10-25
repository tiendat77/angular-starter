import { inject } from '@angular/core';
import { Routes } from '@angular/router';

import { AuthGuard, NoAuthGuard } from '@/core/auth';
import { LayoutComponent, LayoutService } from '@/core/layouts';

export const routes: Routes = [
  /**
   * Public routes
   */
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'app/overview',
  },
  {
    path: 'signed-in-redirect',
    pathMatch: 'full',
    redirectTo: 'app/overview',
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
        loadChildren: () => import('@/features/auth/sign-in/sign-in.routes'),
      },
      {
        path: 'sign-up',
        loadChildren: () => import('@/features/auth/sign-up/sign-up.routes'),
      },
      {
        path: 'forgot-password',
        loadChildren: () => import('@/features/auth/forgot-password/forgot-password.routes'),
      },
      {
        path: 'reset-password',
        loadChildren: () => import('@/features/auth/reset-password/reset-password.routes'),
      },
    ],
  },

  /**
   * Guarded routes for logged in user
   */
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
        loadChildren: () => import('@/features/example/example.routes'),
      },
    ],
  },
  {
    path: 'access-denied',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    data: { layout: 'empty' },
    loadChildren: () => import('@/features/auth/access-denied/access-denied.routes'),
  },

  /**
   * Not found route
   */
  {
    path: '**',
    loadChildren: () => import('@/features/not-found/not-found.routes'),
  },
];
