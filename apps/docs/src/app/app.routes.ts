import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'button',
  },
  {
    path: 'theme',
    loadComponent: () =>
      import('./pages/theme-doc/theme-doc.component').then((m) => m.ThemeDocComponent),
  },
  {
    path: 'button',
    loadComponent: () =>
      import('./pages/button-doc/button-doc.component').then((m) => m.ButtonDocComponent),
  },
  {
    path: 'input',
    loadComponent: () =>
      import('./pages/input-doc/input-doc.component').then((m) => m.InputDocComponent),
  },
  {
    path: 'otp-input',
    loadComponent: () =>
      import('./pages/otp-input-doc/otp-input-doc.component').then((m) => m.OtpInputDocComponent),
  },
  {
    path: 'editor',
    loadComponent: () =>
      import('./pages/editor-doc/editor-doc.component').then((m) => m.EditorDocComponent),
  },
  {
    path: 'qr-code',
    loadComponent: () =>
      import('./pages/qr-code-doc/qr-code-doc.component').then((m) => m.QrCodeDocComponent),
  },
  {
    path: 'checkbox',
    loadComponent: () =>
      import('./pages/checkbox-doc/checkbox-doc.component').then((m) => m.CheckboxDocComponent),
  },
  {
    path: 'radio',
    loadComponent: () =>
      import('./pages/radio-doc/radio-doc.component').then((m) => m.RadioDocComponent),
  },
  {
    path: 'svg-icon',
    loadComponent: () =>
      import('./pages/svg-icon-doc/svg-icon-doc.component').then((m) => m.SvgIconDocComponent),
  },
  {
    path: 'select',
    loadComponent: () =>
      import('./pages/select-doc/select-doc.component').then((m) => m.SelectDocComponent),
  },
  {
    path: 'dialog',
    loadComponent: () =>
      import('./pages/dialog-doc/dialog-doc.component').then((m) => m.DialogDocComponent),
  },
  {
    path: 'toast',
    loadComponent: () =>
      import('./pages/toast-doc/toast-doc.component').then((m) => m.ToastDocComponent),
  },
  {
    path: 'loader',
    loadComponent: () =>
      import('./pages/loader-doc/loader-doc.component').then((m) => m.LoaderDocComponent),
  },
  {
    path: 'alert',
    loadComponent: () =>
      import('./pages/alert-doc/alert-doc.component').then((m) => m.AlertDocComponent),
  },
  {
    path: 'progress',
    loadComponent: () =>
      import('./pages/progress-doc/progress-doc.component').then((m) => m.ProgressDocComponent),
  },
  {
    path: 'date-picker',
    loadComponent: () =>
      import('./pages/date-picker-doc/date-picker-doc.component').then(
        (m) => m.DatePickerDocComponent
      ),
  },
  {
    path: 'card',
    loadComponent: () =>
      import('./pages/card-doc/card-doc.component').then((m) => m.CardDocComponent),
  },
  {
    path: 'paginator',
    loadComponent: () =>
      import('./pages/paginator-doc/paginator-doc.component').then((m) => m.PaginatorDocComponent),
  },
  {
    path: 'table',
    loadComponent: () =>
      import('./pages/table-doc/table-doc.component').then((m) => m.TableDocComponent),
  },
  {
    path: 'avatar',
    loadComponent: () =>
      import('./pages/avatar-doc/avatar-doc.component').then((m) => m.AvatarDocComponent),
  },
  {
    path: 'badge',
    loadComponent: () =>
      import('./pages/badge-doc/badge-doc.component').then((m) => m.BadgeDocComponent),
  },
  {
    path: 'tag',
    loadComponent: () => import('./pages/tag-doc/tag-doc.component').then((m) => m.TagDocComponent),
  },
  {
    path: 'tooltip',
    loadComponent: () =>
      import('./pages/tooltip-doc/tooltip-doc.component').then((m) => m.TooltipDocComponent),
  },
  {
    path: 'tabs',
    loadComponent: () =>
      import('./pages/tabs-doc/tabs-doc.component').then((m) => m.TabsDocComponent),
  },
  {
    path: 'menu',
    loadComponent: () =>
      import('./pages/menu-doc/menu-doc.component').then((m) => m.MenuDocComponent),
  },
  {
    path: 'bottom-sheet',
    loadComponent: () =>
      import('./pages/bottom-sheet-doc/bottom-sheet-doc.component').then(
        (m) => m.BottomSheetDocComponent
      ),
  },
  {
    path: 'collapse',
    loadComponent: () =>
      import('./pages/collapse-doc/collapse-doc.component').then((m) => m.CollapseDocComponent),
  },
  {
    path: '**',
    redirectTo: 'button',
  },
];
