import { inject } from '@angular/core';
import { Routes } from '@angular/router';

import { AuthGuard, NoAuthGuard } from '@/core/guard';
import { LayoutComponent, LayoutService } from '@/core/layouts';
import { PERMISSION } from '@configs/permission.config';
import { ngxPermissionsGuard } from 'ngx-permissions';
import { UserService } from './services/user.service';

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
        loadChildren: () => import('@/features/auth/sign-in/routes'),
      },
      {
        path: 'sign-up',
        loadChildren: () => import('@/features/auth/sign-up/routes'),
      },
      {
        path: 'forgot-password',
        loadChildren: () => import('@/features/auth/forgot-password/routes'),
      },
      {
        path: 'reset-password',
        loadChildren: () => import('@/features/auth/reset-password/routes'),
      },
    ],
  },

  /**
   * Guarded routes for logged in user
   */
  {
    path: 'app',
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    component: LayoutComponent,
    data: { layout: 'dense' },
    resolve: {
      initial: () => {
        const _layoutService = inject(LayoutService);
        const _userService = inject(UserService);

        _layoutService.get(_userService.$user()?.permissions || []);
      },
    },
    children: [
      {
        path: 'example',
        canActivate: [ngxPermissionsGuard],
        data: {
          permissions: {
            only: [PERMISSION.OVERVIEW],
            redirectTo: '/access-denied',
          },
        },
        loadChildren: () => import('@/features/example/routes'),
      },
    ],
  },
  {
    path: 'access-denied',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    data: { layout: 'empty' },
    loadChildren: () => import('@/features/auth/access-denied/routes'),
  },

  /**
   * Not found route
   */
  {
    path: '**',
    loadChildren: () => import('@/features/not-found/routes'),
  },
];
