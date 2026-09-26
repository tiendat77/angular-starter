import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UiButtonComponent } from '@libs/ui/button';
import {
  ToastHorizontalPosition,
  ToastService,
  ToastType,
  ToastVerticalPosition,
} from '@libs/ui/toast';
import { ApiRow, ApiTableComponent } from '../../shared/api-table/api-table.component';
import { PlaygroundComponent } from '../../shared/playground/playground.component';

@Component({
  selector: 'doc-toast',
  imports: [FormsModule, UiButtonComponent, PlaygroundComponent, ApiTableComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './toast-doc.component.html',
})
export class ToastDocComponent {
  private readonly _toast = inject(ToastService);

  readonly type = signal<ToastType>('success');
  readonly title = signal('Saved');
  readonly message = signal('Your changes have been saved.');
  readonly duration = signal(5000);
  readonly horizontalPosition = signal<ToastHorizontalPosition>('center');
  readonly verticalPosition = signal<ToastVerticalPosition>('top');

  readonly generatedCode = computed(() => {
    const isDefaultConfig =
      this.duration() === 5000 &&
      this.horizontalPosition() === 'center' &&
      this.verticalPosition() === 'top';

    if (isDefaultConfig) {
      return `private readonly _toast = inject(ToastService);

this._toast.${this.type()}('${this.message()}', '${this.title()}');`;
    }

    return `private readonly _toast = inject(ToastService);

this._toast.open('${this.type()}', '${this.title()}', '${this.message()}', {
  duration: ${this.duration()},
  horizontalPosition: '${this.horizontalPosition()}',
  verticalPosition: '${this.verticalPosition()}',
});`;
  });

  readonly apiRows: ApiRow[] = [
    {
      name: 'success() / info() / warning() / error()',
      type: '(message, title?) => ToastRef',
      description: 'Shows a toast of that type with the default config.',
    },
    {
      name: 'open()',
      type: '(type, title, message, ToastConfig?) => ToastRef',
      description: 'Shows a toast with a custom config. Only one toast is visible at a time.',
    },
    { name: 'dismiss()', type: '() => void', description: 'Dismisses the visible toast.' },
    {
      name: 'ToastConfig.duration',
      type: 'number (ms)',
      default: '5000',
      description: 'Auto-dismiss delay. 0 keeps the toast until dismissed.',
    },
    {
      name: 'ToastConfig.horizontalPosition',
      type: "'start' | 'center' | 'end' | 'left' | 'right'",
      default: "'center'",
      description: 'Horizontal placement in the viewport.',
    },
    {
      name: 'ToastConfig.verticalPosition',
      type: "'top' | 'bottom'",
      default: "'top'",
      description: 'Vertical placement in the viewport.',
    },
    {
      name: 'TOAST_DEFAULT_OPTIONS',
      type: 'InjectionToken<ToastConfig>',
      description: 'Provide app-wide defaults for every toast.',
    },
  ];

  show(): void {
    this._toast.open(this.type(), this.title(), this.message(), {
      duration: this.duration(),
      horizontalPosition: this.horizontalPosition(),
      verticalPosition: this.verticalPosition(),
    });
  }

  dismiss(): void {
    this._toast.dismiss();
  }
}
