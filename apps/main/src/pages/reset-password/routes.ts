import { Routes } from '@angular/router';
import { ResetPasswordComponent } from './ui/reset-password';

const routes: Routes = [
  {
    path: '',
    component: ResetPasswordComponent,
  },
  {
    path: 'reset-success',
    loadComponent: () =>
      import('./ui/reset-success/reset-success').then((m) => m.ResetSuccessComponent),
  },
  {
    path: 'invalid-link',
    loadComponent: () =>
      import('./ui/invalid-link/invalid-link').then((m) => m.InvalidLinkComponent),
  },
];

export default routes;
