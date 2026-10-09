import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { describe, expect, it } from 'vitest';
import { UiInputModule } from './input.module';
import {
  UiErrorDirective,
  UiFormFieldComponent,
  UiHintDirective,
  UiInputDirective,
  UiLabelDirective,
  UiPrefixDirective,
  UiSuffixDirective,
  UiTextareaDirective,
} from './public-api';

@Component({
  imports: [UiInputModule, ReactiveFormsModule],
  template: `
    <ui-form-field>
      <label uiLabel>Amount</label>
      <span uiPrefix>$</span>
      <input
        uiInput
        [formControl]="amount"
      />
      <span uiSuffix>USD</span>
      <span uiHint>Hint</span>
      <span uiError>Error</span>
    </ui-form-field>
    <ui-form-field>
      <label uiLabel>Notes</label>
      <textarea
        uiTextarea
        [formControl]="notes"
      ></textarea>
    </ui-form-field>
  `,
})
class Host {
  readonly amount = new FormControl('', Validators.required);
  readonly notes = new FormControl('');
}

describe('UiInputModule', () => {
  it('brings the form field and all its parts', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    for (const directive of [
      UiFormFieldComponent,
      UiInputDirective,
      UiTextareaDirective,
      UiLabelDirective,
      UiHintDirective,
      UiErrorDirective,
      UiPrefixDirective,
      UiSuffixDirective,
    ]) {
      expect(fixture.debugElement.query(By.directive(directive))).not.toBeNull();
    }
  });

  it('wires the label to the control', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const label: HTMLLabelElement = fixture.nativeElement.querySelector('label');
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    expect(label.getAttribute('for')).toBe(input.id);
  });
});
