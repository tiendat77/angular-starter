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
    path: 'svg-icon',
    loadComponent: () =>
      import('./features/svg-icon-doc/svg-icon-doc.component').then((m) => m.SvgIconDocComponent),
  },
  {
    path: 'dialog',
    loadComponent: () =>
      import('./features/dialog-doc/dialog-doc.component').then((m) => m.DialogDocComponent),
  },
  {
    path: 'toast',
    loadComponent: () =>
      import('./features/toast-doc/toast-doc.component').then((m) => m.ToastDocComponent),
  },
  {
    path: 'loader',
    loadComponent: () =>
      import('./features/loader-doc/loader-doc.component').then((m) => m.LoaderDocComponent),
  },
  {
    path: 'date-picker',
    loadComponent: () =>
      import('./features/date-picker-doc/date-picker-doc.component').then(
        (m) => m.DatePickerDocComponent
      ),
  },
  {
    path: 'paginator',
    loadComponent: () =>
      import('./features/paginator-doc/paginator-doc.component').then(
        (m) => m.PaginatorDocComponent
      ),
  },
  {
    path: '**',
    redirectTo: 'button',
  },
];
