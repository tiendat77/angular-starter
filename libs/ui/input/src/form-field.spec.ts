import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { describe, expect, it } from 'vitest';
import {
  UiErrorDirective,
  UiFormFieldComponent,
  UiHintDirective,
  UiInputDirective,
  UiLabelDirective,
  UiPrefixDirective,
  UiSuffixDirective,
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

@Component({
  standalone: true,
  imports: [UiFormFieldComponent, UiInputDirective, UiPrefixDirective, UiSuffixDirective],
  template: `
    <ui-form-field>
      @if (showPrefix()) {
        <span uiPrefix>$</span>
      }
      <input uiInput />
      <span uiSuffix>USD</span>
    </ui-form-field>
  `,
})
class AffixHostComponent {
  readonly showPrefix = signal(true);
}

describe('UiFormFieldComponent (prefix/suffix)', () => {
  let fixture: ComponentFixture<AffixHostComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [AffixHostComponent] });
    fixture = TestBed.createComponent(AffixHostComponent);
    fixture.detectChanges();
  });

  it('should render prefix, input and suffix inside one bordered box', () => {
    const inputEl: HTMLInputElement = fixture.nativeElement.querySelector('input');
    const box = inputEl.parentElement as HTMLElement;

    expect(box.querySelector('[uiPrefix]')?.textContent).toBe('$');
    expect(box.querySelector('[uiSuffix]')?.textContent).toBe('USD');
    expect(box.className).toContain('border');
    expect(inputEl.className).not.toContain('border');
  });

  it('should keep the box while only a suffix is projected', () => {
    fixture.componentInstance.showPrefix.set(false);
    fixture.detectChanges();

    const inputEl: HTMLInputElement = fixture.nativeElement.querySelector('input');
    expect(fixture.nativeElement.querySelector('[uiPrefix]')).toBeNull();
    expect(inputEl.parentElement?.className).toContain('border');
  });
});
