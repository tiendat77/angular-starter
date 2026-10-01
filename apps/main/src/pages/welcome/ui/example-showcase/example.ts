import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { WelcomeComponent } from '../welcome/welcome';

import { DatepickerModule, provideNativeDateAdapter } from '@libs/ui/date-picker';
import { DialogService } from '@libs/ui/dialog';
import { LoaderService } from '@libs/ui/loader';
import { SvgIcon } from '@libs/ui/svg-icon';
import { ToastService } from '@libs/ui/toast';

import { ExampleDialogComponent } from '../example-dialog/example-dialog';

@Component({
  selector: 'app-example',
  imports: [WelcomeComponent, SvgIcon, DatepickerModule],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideNativeDateAdapter()],
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
