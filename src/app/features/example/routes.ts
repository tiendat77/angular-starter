import { Routes } from '@angular/router';

import { AriaExampleComponent } from './aria/aria-example';
import { WelcomeComponent } from './welcome/welcome';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'welcome',
  },
  {
    path: 'welcome',
    component: WelcomeComponent,
  },
  {
    path: 'aria',
    component: AriaExampleComponent,
  },
];

export default routes;
