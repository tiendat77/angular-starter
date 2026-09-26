import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'button',
  },
  {
    path: 'button',
    loadComponent: () =>
      import('./features/button-doc/button-doc.component').then((m) => m.ButtonDocComponent),
  },
  {
    path: 'input',
    loadComponent: () =>
      import('./features/input-doc/input-doc.component').then((m) => m.InputDocComponent),
  },
  {
    path: 'checkbox',
    loadComponent: () =>
      import('./features/checkbox-doc/checkbox-doc.component').then((m) => m.CheckboxDocComponent),
  },
  {
    path: 'radio',
    loadComponent: () =>
      import('./features/radio-doc/radio-doc.component').then((m) => m.RadioDocComponent),
  },
  {
    path: '**',
    redirectTo: 'button',
  },
];
