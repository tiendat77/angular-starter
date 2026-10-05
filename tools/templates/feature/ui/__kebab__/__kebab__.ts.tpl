import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Presentational: data in through inputs, user actions out through outputs, no store or router. */
@Component({
  selector: '__kebab__',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './__kebab__.html',
})
export class __Pascal__Component {
  readonly label = input('__Title__');
}
