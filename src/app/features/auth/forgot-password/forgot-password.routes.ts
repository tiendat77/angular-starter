import { Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'enter-email',
  },
  {
    path: 'enter-email',
    loadComponent: () =>
      import('./enter-email/enter-email.component').then((m) => m.EnterEmailComponent),
  },
  {
    path: 'email-sent',
    loadComponent: () =>
      import('./email-sent/email-sent.component').then((m) => m.EmailSentComponent),
  },
];

export default routes;
