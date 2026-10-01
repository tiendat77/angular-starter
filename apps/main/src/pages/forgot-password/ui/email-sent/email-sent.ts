import { BaseComponent } from '@/shared/lib/base-component';
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-email-sent',
  imports: [],
  templateUrl: './email-sent.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmailSentComponent extends BaseComponent implements OnInit {
  email = '';
  private _route = inject(ActivatedRoute);

  ngOnInit() {
    this.email = this._route.snapshot.queryParams['email'];
  }
}
