import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { describe, expect, it } from 'vitest';
import {
  UiErrorDirective,
  UiFormFieldComponent,
  UiHintDirective,
  UiInputDirective,
  UiLabelDirective,
} from './public-api';

@Component({
  standalone: true,
  imports: [
    ReactiveFormsModule,
    UiFormFieldComponent,
    UiInputDirective,
    UiLabelDirective,
    UiErrorDirective,
    UiHintDirective,
  ],
  template: `
    <ui-form-field>
      <label uiLabel>Email</label>
      <input
        uiInput
        [formControl]="emailControl"
        placeholder="Enter email"
      />
      <span uiHint>Helpful note</span>
      @if (emailControl.invalid && emailControl.touched) {
        <span uiError>Email required</span>
      }
    </ui-form-field>
  `,
})
class FormHostComponent {
  readonly emailControl = new FormControl('', Validators.required);
}

describe('UiFormFieldComponent', () => {
  let fixture: ComponentFixture<FormHostComponent>;
  let inputEl: HTMLInputElement;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [FormHostComponent] });
    fixture = TestBed.createComponent(FormHostComponent);
    fixture.detectChanges();
    inputEl = fixture.nativeElement.querySelector('input');
  });

  it('should associate label for attribute with input id', () => {
    const labelEl = fixture.nativeElement.querySelector('label');
    expect(labelEl.getAttribute('for')).toBe(inputEl.id);
  });

  it('should mark aria-invalid when control is touched and invalid', () => {
    fixture.componentInstance.emailControl.markAsTouched();
    fixture.detectChanges();
    expect(inputEl.getAttribute('aria-invalid')).toBe('true');
  });
});
