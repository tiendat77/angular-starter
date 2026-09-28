import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { DenseLayoutComponent } from './dense/dense';
import { EmptyLayoutComponent } from './empty/empty';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
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
