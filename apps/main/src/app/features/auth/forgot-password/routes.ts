import { Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'enter-email',
  },
  {
    path: 'enter-email',
    loadComponent: () => import('./enter-email/enter-email').then((m) => m.EnterEmailComponent),
  },
  {
    path: 'email-sent',
    loadComponent: () => import('./email-sent/email-sent').then((m) => m.EmailSentComponent),
  },
];

export default routes;
