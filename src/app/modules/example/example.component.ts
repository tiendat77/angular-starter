import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NotificationService } from '@services';

@Component({
  selector: 'app-example',
  templateUrl: './example.component.html',
  styleUrls: ['./example.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExampleComponent {

  constructor(
    private _notification: NotificationService
  ) { }

  toast() {
    this._notification.success('This is a test notification');
  }

}
