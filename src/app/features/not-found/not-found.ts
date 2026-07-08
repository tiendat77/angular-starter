import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './not-found.scss',
})
export class NotFoundComponent {}
