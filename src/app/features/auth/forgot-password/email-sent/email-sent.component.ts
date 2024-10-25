import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BaseComponent } from '@models';

@Component({
  selector: 'app-email-sent',
  standalone: true,
  imports: [],
  templateUrl: './email-sent.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmailSentComponent extends BaseComponent implements OnInit {
  email = '';
  private _route = inject(ActivatedRoute);

  ngOnInit() {
    this.email = this._route.snapshot.queryParams['email'];
  }
}
