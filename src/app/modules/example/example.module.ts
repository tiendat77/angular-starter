import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Route, RouterModule } from '@angular/router';

import { ExampleComponent } from './example.component';

const routes: Route[] = [{
  path: '',
  component: ExampleComponent
}];

@NgModule({
  declarations: [
    ExampleComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class ExampleModule { }
