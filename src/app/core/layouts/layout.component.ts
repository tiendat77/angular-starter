import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { DenseLayoutComponent } from './dense/dense.component';
import { EmptyLayoutComponent } from './empty/empty.component';

@Component({
  standalone: true,
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
  encapsulation: ViewEncapsulation.None,
  imports: [EmptyLayoutComponent, DenseLayoutComponent],
})
export class LayoutComponent implements OnInit {
  layout: string;

  constructor(private _route: ActivatedRoute) {}

  ngOnInit(): void {
    const paths = this._route.pathFromRoot;
    paths.forEach((path) => {
      if (path.routeConfig && path.routeConfig.data && path.routeConfig.data['layout']) {
        this.layout = path.routeConfig.data['layout'];
      }
    });
  }
}
