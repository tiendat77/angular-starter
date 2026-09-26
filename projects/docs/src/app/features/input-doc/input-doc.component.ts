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
    PlaygroundComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <doc-playground
      title="Input & Form Field"
      description="Form field wrapper and input directive with automatic accessible label binding, hint/error orchestration, and Reactive Forms support."
      [code]="generatedCode()"
    >
      <!-- Live Preview -->
      <div
        preview
        class="w-full max-w-sm p-4"
      >
        <ui-form-field>
          @if (label()) {
            <label
              uiLabel
              for="demo-email-input"
              >{{ label() }}</label
            >
          }
          <input
            id="demo-email-input"
            uiInput
            [appearance]="appearance()"
            [size]="size()"
            [formControl]="control"
            [placeholder]="placeholder()"
          />
          @if (hint()) {
            <span uiHint>{{ hint() }}</span>
          }
          @if (control.invalid && control.touched) {
            <span uiError>{{ errorMessage() }}</span>
          }
        </ui-form-field>
      </div>

      <!-- Controls -->
      <div
        controls
        class="space-y-4 text-xs"
      >
        <div>
          <label
            for="inp-appearance"
            class="text-muted-foreground mb-1 block font-medium"
            >Appearance</label
          >
          <select
            id="inp-appearance"
            class="border-border bg-background text-foreground w-full rounded-lg border px-3 py-1.5"
            [ngModel]="appearance()"
            (ngModelChange)="appearance.set($event)"
          >
            <option value="outline">outline</option>
            <option value="filled">filled</option>
          </select>
        </div>

        <div>
          <label
            for="inp-size"
            class="text-muted-foreground mb-1 block font-medium"
            >Size</label
          >
          <select
            id="inp-size"
            class="border-border bg-background text-foreground w-full rounded-lg border px-3 py-1.5"
            [ngModel]="size()"
            (ngModelChange)="size.set($event)"
          >
            <option value="xs">xs</option>
            <option value="sm">sm</option>
            <option value="md">md</option>
            <option value="lg">lg</option>
            <option value="xl">xl</option>
          </select>
        </div>

        <div>
          <label
            for="inp-label"
            class="text-muted-foreground mb-1 block font-medium"
            >Label</label
          >
          <input
            id="inp-label"
            type="text"
            class="border-border bg-background text-foreground w-full rounded-lg border px-3 py-1.5"
            [ngModel]="label()"
            (ngModelChange)="label.set($event)"
          />
        </div>

        <div>
          <label
            for="inp-placeholder"
            class="text-muted-foreground mb-1 block font-medium"
            >Placeholder</label
          >
          <input
            id="inp-placeholder"
            type="text"
            class="border-border bg-background text-foreground w-full rounded-lg border px-3 py-1.5"
            [ngModel]="placeholder()"
            (ngModelChange)="placeholder.set($event)"
          />
        </div>

        <div>
          <label
            for="inp-hint"
            class="text-muted-foreground mb-1 block font-medium"
            >Hint</label
          >
          <input
            id="inp-hint"
            type="text"
            class="border-border bg-background text-foreground w-full rounded-lg border px-3 py-1.5"
            [ngModel]="hint()"
            (ngModelChange)="hint.set($event)"
          />
        </div>

        <div class="border-border/50 space-y-2 border-t pt-2">
          <label class="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              class="border-border rounded"
              [ngModel]="control.disabled"
              (ngModelChange)="toggleDisabled($event)"
            />
            <span>Disabled</span>
          </label>
          <label class="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              class="border-border rounded"
              [ngModel]="control.touched"
              (ngModelChange)="toggleTouched($event)"
            />
            <span>Mark as Touched (Trigger Validation)</span>
          </label>
        </div>
      </div>

      <!-- API Reference -->
      <section class="mt-8 space-y-4">
        <h2 class="text-foreground text-xl font-bold tracking-tight">API Reference</h2>
        <div class="border-border overflow-hidden rounded-xl border">
          <table class="w-full text-left text-sm">
            <thead
              class="bg-muted/50 border-border text-muted-foreground border-b text-xs uppercase"
            >
              <tr>
                <th class="px-4 py-3">Directive / Component</th>
                <th class="px-4 py-3">Selector</th>
                <th class="px-4 py-3">Description</th>
              </tr>
            </thead>
            <tbody class="divide-border divide-y text-xs">
              <tr>
                <td class="text-primary px-4 py-3 font-mono font-semibold">UiFormFieldComponent</td>
                <td class="text-muted-foreground px-4 py-3 font-mono">ui-form-field</td>
                <td class="text-muted-foreground px-4 py-3">
                  Coordinates label, control, prefix/suffix, hints, and error messaging.
                </td>
              </tr>
              <tr>
                <td class="text-primary px-4 py-3 font-mono font-semibold">UiInputDirective</td>
                <td class="text-muted-foreground px-4 py-3 font-mono">input[uiInput]</td>
                <td class="text-muted-foreground px-4 py-3">
                  Binds CVA and applies design tokens to native HTML input.
                </td>
              </tr>
              <tr>
                <td class="text-primary px-4 py-3 font-mono font-semibold">UiLabelDirective</td>
                <td class="text-muted-foreground px-4 py-3 font-mono">label[uiLabel]</td>
                <td class="text-muted-foreground px-4 py-3">
                  Provides accessible label binding wired to the input id.
                </td>
              </tr>
              <tr>
                <td class="text-primary px-4 py-3 font-mono font-semibold">UiHintDirective</td>
                <td class="text-muted-foreground px-4 py-3 font-mono">span[uiHint]</td>
                <td class="text-muted-foreground px-4 py-3">
                  Accessible helper text referenced by aria-describedby.
                </td>
              </tr>
              <tr>
                <td class="text-primary px-4 py-3 font-mono font-semibold">UiErrorDirective</td>
                <td class="text-muted-foreground px-4 py-3 font-mono">span[uiError]</td>
                <td class="text-muted-foreground px-4 py-3">
                  Validation error message displaying with role="alert".
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </doc-playground>
  `,
})
export class InputDocComponent {
  readonly appearance = signal<UiFormFieldAppearance>('outline');
  readonly size = signal<UiSize>('md');
  readonly label = signal('Email Address');
  readonly placeholder = signal('you@example.com');
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
    return `<ui-form-field>\n  <label uiLabel>${this.label()}</label>\n  <input uiInput appearance="${this.appearance()}" size="${this.size()}" [formControl]="emailControl" placeholder="${this.placeholder()}" />\n  <span uiHint>${this.hint()}</span>\n  @if (emailControl.invalid && emailControl.touched) {\n    <span uiError>${this.errorMessage()}</span>\n  }\n</ui-form-field>`;
  });
}
