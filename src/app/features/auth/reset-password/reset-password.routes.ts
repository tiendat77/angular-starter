import { Routes } from '@angular/router';
import { ResetPasswordComponent } from './reset-password.component';

const routes: Routes = [
  {
    path: '',
    component: ResetPasswordComponent,
  },
  {
    path: 'reset-success',
    loadComponent: () =>
      import('./reset-success/reset-success.component').then((m) => m.ResetSuccessComponent),
  },
  {
    path: 'invalid-link',
    loadComponent: () =>
      import('./invalid-link/invalid-link.component').then((m) => m.InvalidLinkComponent),
  },
];

export default routes;
