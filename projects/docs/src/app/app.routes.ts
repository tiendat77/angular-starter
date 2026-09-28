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
    path: 'select',
    loadComponent: () =>
      import('./features/select-doc/select-doc.component').then((m) => m.SelectDocComponent),
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
    path: 'alert',
    loadComponent: () =>
      import('./features/alert-doc/alert-doc.component').then((m) => m.AlertDocComponent),
  },
  {
    path: 'progress',
    loadComponent: () =>
      import('./features/progress-doc/progress-doc.component').then((m) => m.ProgressDocComponent),
  },
  {
    path: 'date-picker',
    loadComponent: () =>
      import('./features/date-picker-doc/date-picker-doc.component').then(
        (m) => m.DatePickerDocComponent
      ),
  },
  {
    path: 'card',
    loadComponent: () =>
      import('./features/card-doc/card-doc.component').then((m) => m.CardDocComponent),
  },
  {
    path: 'paginator',
    loadComponent: () =>
      import('./features/paginator-doc/paginator-doc.component').then(
        (m) => m.PaginatorDocComponent
      ),
  },
  {
    path: 'table',
    loadComponent: () =>
      import('./features/table-doc/table-doc.component').then((m) => m.TableDocComponent),
  },
  {
    path: 'avatar',
    loadComponent: () =>
      import('./features/avatar-doc/avatar-doc.component').then((m) => m.AvatarDocComponent),
  },
  {
    path: 'badge',
    loadComponent: () =>
      import('./features/badge-doc/badge-doc.component').then((m) => m.BadgeDocComponent),
  },
  {
    path: 'tag',
    loadComponent: () =>
      import('./features/tag-doc/tag-doc.component').then((m) => m.TagDocComponent),
  },
  {
    path: 'tooltip',
    loadComponent: () =>
      import('./features/tooltip-doc/tooltip-doc.component').then((m) => m.TooltipDocComponent),
  },
  {
    path: 'tabs',
    loadComponent: () =>
      import('./features/tabs-doc/tabs-doc.component').then((m) => m.TabsDocComponent),
  },
  {
    path: 'menu',
    loadComponent: () =>
      import('./features/menu-doc/menu-doc.component').then((m) => m.MenuDocComponent),
  },
  {
    path: 'bottom-sheet',
    loadComponent: () =>
      import('./features/bottom-sheet-doc/bottom-sheet-doc.component').then(
        (m) => m.BottomSheetDocComponent
      ),
  },
  {
    path: '**',
    redirectTo: 'button',
  },
];
