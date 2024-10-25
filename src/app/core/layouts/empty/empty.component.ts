/* eslint-disable @angular-eslint/component-selector */
import { Component, ViewEncapsulation } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  standalone: true,
  selector: 'empty-layout',
  templateUrl: './empty.component.html',
  encapsulation: ViewEncapsulation.None,
  imports: [RouterOutlet],
})
export class EmptyLayoutComponent {}
