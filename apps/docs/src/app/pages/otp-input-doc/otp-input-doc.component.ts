import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { UiButtonComponent } from '@libs/ui/button';
import {
  UiErrorDirective,
  UiFormFieldComponent,
  UiHintDirective,
  UiLabelDirective,
} from '@libs/ui/input';
import { UiOtpFormatterPreset, UiOtpInput, UiOtpInputSize } from '@libs/ui/otp-input';
import { ApiRow, ApiTableComponent } from '../../shared/api-table/api-table.component';
import { PlaygroundComponent } from '../../shared/playground/playground.component';

@Component({
  selector: 'doc-otp-input',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    UiButtonComponent,
    UiFormFieldComponent,
    UiLabelDirective,
    UiHintDirective,
    UiErrorDirective,
    UiOtpInput,
    PlaygroundComponent,
    ApiTableComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './otp-input-doc.component.html',
})
export class OtpInputDocComponent {
  readonly length = signal(6);
  readonly size = signal<UiOtpInputSize>('md');
  readonly formatter = signal<UiOtpFormatterPreset>('numeric');
  readonly mask = signal(false);
  readonly autoFocus = signal(false);

  readonly control = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.minLength(6)],
  });

  readonly verifyForm = new FormGroup({
    code: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(6)],
    }),
  });

  readonly standaloneCode = signal('');
  readonly submittedCode = signal<string | null>(null);

  /** Changing `length` keeps the control's value in step, as the component does not notify the form. */
  setLength(length: number): void {
    this.length.set(length);
    this.control.setValue(this.control.value.slice(0, length));
    this.control.setValidators([Validators.required, Validators.minLength(length)]);
    this.control.updateValueAndValidity();
  }

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

  submit(): void {
    this.verifyForm.markAllAsTouched();
    if (this.verifyForm.valid) {
      this.submittedCode.set(this.verifyForm.controls.code.value);
    }
  }

  readonly generatedCode = computed(() => {
    const attrs = [
      '[formControl]="codeControl"',
      `[length]="${this.length()}"`,
      `size="${this.size()}"`,
      `formatter="${this.formatter()}"`,
    ];
    if (this.mask()) attrs.push('[mask]="true"');
    if (this.autoFocus()) attrs.push('[autoFocus]="true"');
    return [
      '<ui-form-field>',
      '  <label uiLabel for="otp">Verification code</label>',
      `  <ui-otp-input inputId="otp" ${attrs.join(' ')} (completed)="verify($event)" />`,
      `  <span uiHint>Enter the ${this.length()}-digit code we sent you.</span>`,
      '  @if (codeControl.invalid && codeControl.touched) {',
      `    <span uiError>Enter all ${this.length()} characters.</span>`,
      '  }',
      '</ui-form-field>',
    ].join('\n');
  });

  readonly reactiveFormsCode = `verifyForm = new FormGroup({
  code: new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.minLength(6)],
  }),
});

<form [formGroup]="verifyForm" (ngSubmit)="submit()">
  <ui-form-field>
    <label uiLabel for="otp">Verification code</label>
    <ui-otp-input inputId="otp" formControlName="code" [autoFocus]="true" (completed)="submit()" />
    <span uiHint>Enter the 6-digit code we sent you.</span>
    @if (verifyForm.controls.code.invalid && verifyForm.controls.code.touched) {
      <span uiError>Enter all 6 digits.</span>
    }
  </ui-form-field>
  <button uiButton type="submit">Verify</button>
</form>`;

  readonly standaloneUsageCode = `<!-- No ui-form-field, no forms directive: read the code from (completed) -->
<ui-otp-input [length]="4" ariaLabel="PIN" (completed)="pin = $event" />

<!-- A plain <label> works through inputId, which lands on the first slot -->
<label for="otp">Verification code</label>
<ui-otp-input inputId="otp" />

<!-- Or label it with any element -->
<h3 id="otp-title">Enter your code</h3>
<ui-otp-input ariaLabelledby="otp-title" />`;

  readonly apiRows: ApiRow[] = [
    { name: 'length', type: 'number', default: '6', description: 'Number of slots.' },
    {
      name: 'formatter',
      type: "'numeric' | 'alphanumeric' | RegExp | (char) => string",
      default: "'numeric'",
      description:
        'Filters every incoming character. A function may transform it (e.g. upper-case) or return an empty string to reject it.',
    },
    {
      name: 'mask',
      type: 'boolean | string',
      default: 'false',
      description: 'Hides entered characters. true shows •, a string shows its first character.',
    },
    { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Slot size.' },
    { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables every slot.' },
    {
      name: 'autoFocus',
      type: 'boolean',
      default: 'false',
      description: 'Focuses the first empty slot once rendered.',
    },
    {
      name: 'inputMode',
      type: 'string',
      default: 'numeric / text',
      description: 'Virtual keyboard hint; numeric only for the numeric formatter.',
    },
    {
      name: 'inputId',
      type: 'string',
      default: 'auto',
      description: 'DOM id of the first slot, so a plain <label for> focuses the control.',
    },
    {
      name: 'ariaLabel',
      type: 'string',
      default: "'OTP verification code'",
      description: 'Accessible name of the group. Ignored when ariaLabelledby is set.',
    },
    {
      name: 'ariaLabelledby',
      type: 'string',
      description: 'Id of an element that labels the group.',
    },
    {
      name: 'slotLabel',
      type: '(index, length) => string',
      default: '"Digit i of n"',
      description: 'Accessible name of each slot; index is 1-based. Use it to localise.',
    },
    {
      name: '(completed)',
      type: 'string',
      description: 'Emitted when a user edit leaves every slot filled. Not emitted by writeValue.',
    },
  ];
}
