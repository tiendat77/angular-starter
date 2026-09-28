import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UiSize } from '@libs/ui/core';
import {
  UiErrorDirective,
  UiFormFieldAppearance,
  UiFormFieldComponent,
  UiHintDirective,
  UiInputDirective,
  UiLabelDirective,
  UiPrefixDirective,
  UiSuffixDirective,
} from '@libs/ui/input';
import { PlaygroundComponent } from '../../shared/playground/playground.component';

@Component({
  selector: 'doc-input',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    UiFormFieldComponent,
    UiInputDirective,
    UiLabelDirective,
    UiHintDirective,
    UiErrorDirective,
    UiPrefixDirective,
    UiSuffixDirective,
    PlaygroundComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './input-doc.component.html',
})
export class InputDocComponent {
  readonly appearance = signal<UiFormFieldAppearance>('outline');
  readonly size = signal<UiSize>('md');
  readonly label = signal('Email Address');
  readonly placeholder = signal('you@example.com');
  readonly prefix = signal('@');
  readonly suffix = signal('');
  readonly hint = signal('We will never share your email.');
  readonly errorMessage = signal('Valid email is required.');

  readonly control = new FormControl('', [Validators.required, Validators.email]);

  toggleDisabled(disabled: boolean): void {
    if (disabled) {
      this.control.disable();
    } else {
      this.control.enable();
    }
  }

  toggleTouched(touched: boolean): void {
    if (touched) {
      this.control.markAsTouched();
    } else {
      this.control.markAsUntouched();
    }
  }

  readonly generatedCode = computed(() => {
    const lines = ['<ui-form-field>', `  <label uiLabel>${this.label()}</label>`];
    if (this.prefix()) lines.push(`  <span uiPrefix>${this.prefix()}</span>`);
    lines.push(
      `  <input uiInput appearance="${this.appearance()}" size="${this.size()}" [formControl]="emailControl" placeholder="${this.placeholder()}" />`
    );
    if (this.suffix()) lines.push(`  <span uiSuffix>${this.suffix()}</span>`);
    lines.push(
      `  <span uiHint>${this.hint()}</span>`,
      '  @if (emailControl.invalid && emailControl.touched) {',
      `    <span uiError>${this.errorMessage()}</span>`,
      '  }',
      '</ui-form-field>'
    );
    return lines.join('\n');
  });
}
