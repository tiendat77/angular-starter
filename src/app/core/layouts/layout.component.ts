import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { DenseLayoutComponent } from './dense/dense.component';
import { EmptyLayoutComponent } from './empty/empty.component';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EmptyLayoutComponent, DenseLayoutComponent],
})
export class LayoutComponent implements OnInit {
  layout: string;

  private _route = inject(ActivatedRoute);

  ngOnInit(): void {
    const paths = this._route.pathFromRoot;
    paths.forEach((path) => {
      if (path.routeConfig && path.routeConfig.data && path.routeConfig.data['layout']) {
        this.layout = path.routeConfig.data['layout'];
      }
    });
  }
}
