import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { WelcomeComponent } from './welcome/welcome.component';

import { DatepickerModule, provideLuxonDateAdapter } from '@libs/date-picker';
import { DialogService } from '@libs/dialog';
import { LoaderService } from '@libs/loader';
import { SvgIcon } from '@libs/svg-icon';
import { ToastService } from '@libs/toast';

import { ExampleDialogComponent } from './example-dialog/example-dialog.component';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [WelcomeComponent, SvgIcon, DatepickerModule],
  templateUrl: './example.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideLuxonDateAdapter()],
})
export class ExampleComponent {
  protected _dialog = inject(DialogService);
  protected _loader = inject(LoaderService);
  protected _toast = inject(ToastService);

  openDialog() {
    this._dialog.open(ExampleDialogComponent, {
      width: '600px',
      data: {
        message: 'Hello World',
      },
    });
  }

  openLoader() {
    this._loader.show();

    setTimeout(() => {
      this._loader.hide();
    }, 3000);
  }

  openToast() {
    this._toast.warning('Message: Lorem ipsum dolor sit amet', 'Hello World');
  }
}
