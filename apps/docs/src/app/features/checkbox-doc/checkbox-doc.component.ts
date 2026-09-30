import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  UiCheckboxComponent,
  UiSwitchComponent,
  UiSwitchLabeledComponent,
} from '@libs/ui/checkbox';
import { UiSize } from '@libs/ui/core';
import { PlaygroundComponent } from '../../shared/playground/playground.component';

@Component({
  selector: 'doc-checkbox',
  imports: [
    FormsModule,
    UiCheckboxComponent,
    UiSwitchComponent,
    UiSwitchLabeledComponent,
    PlaygroundComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './checkbox-doc.component.html',
})
export class CheckboxDocComponent {
  readonly size = signal<UiSize>('md');
  readonly disabled = signal(false);
  readonly indeterminate = signal(false);
  readonly checkboxChecked = signal(false);
  readonly switchChecked = signal(true);
  readonly checkboxLabel = signal('Accept terms and conditions');
  readonly switchLabel = signal('Enable email notifications');

  readonly generatedCode = computed(() => {
    return `<ui-checkbox\n  [(checked)]="isChecked"\n  size="${this.size()}"\n  label="${this.checkboxLabel()}"${this.indeterminate() ? '\n  indeterminate' : ''}${this.disabled() ? '\n  disabled' : ''}\n/>\n\n<ui-switch\n  [(checked)]="isSwitchOn"\n  size="${this.size()}"\n  label="${this.switchLabel()}"${this.disabled() ? '\n  disabled' : ''}\n/>`;
  });
}
