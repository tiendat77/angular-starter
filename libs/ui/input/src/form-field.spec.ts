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
  UiTextareaDirective,
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
    expect(box.classList).toContain('input');
    expect(inputEl.classList).not.toContain('input');
  });

  it('should keep the box while only a suffix is projected', () => {
    fixture.componentInstance.showPrefix.set(false);
    fixture.detectChanges();

    const inputEl: HTMLInputElement = fixture.nativeElement.querySelector('input');
    expect(fixture.nativeElement.querySelector('[uiPrefix]')).toBeNull();
    expect(inputEl.parentElement?.classList).toContain('input');
  });
});

@Component({
  standalone: true,
  imports: [UiFormFieldComponent, UiInputDirective, UiLabelDirective, UiTextareaDirective],
  template: `
    <ui-form-field>
      <label uiLabel>Static</label>
      <input
        uiInput
        id="static-id"
      />
    </ui-form-field>
    <ui-form-field>
      <label uiLabel>Bound</label>
      <input
        uiInput
        [id]="inputId()"
      />
    </ui-form-field>
    <ui-form-field>
      <label uiLabel>Notes</label>
      <textarea
        uiTextarea
        id="notes-id"
      ></textarea>
    </ui-form-field>
    <ui-form-field>
      <label uiLabel>Generated</label>
      <input uiInput />
    </ui-form-field>
  `,
})
class IdHostComponent {
  readonly inputId = signal('first');
}

describe('control id', () => {
  let fixture: ComponentFixture<IdHostComponent>;
  const controls = () =>
    Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('input, textarea'));
  const labels = () => Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('label'));

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [IdHostComponent] });
    fixture = TestBed.createComponent(IdHostComponent);
    fixture.detectChanges();
  });

  it('keeps the id set in the template, and the label points at it', () => {
    expect(controls()[0].id).toBe('static-id');
    expect(labels()[0].getAttribute('for')).toBe('static-id');
    expect(controls()[2].id).toBe('notes-id');
    expect(labels()[2].getAttribute('for')).toBe('notes-id');
  });

  it('follows a bound id', () => {
    expect(controls()[1].id).toBe('first');
    expect(labels()[1].getAttribute('for')).toBe('first');

    fixture.componentInstance.inputId.set('second');
    fixture.detectChanges();

    expect(controls()[1].id).toBe('second');
    expect(labels()[1].getAttribute('for')).toBe('second');
  });

  it('generates a unique id when the template sets none', () => {
    const id = controls()[3].id;

    expect(id).toMatch(/^ui-input-\d+$/);
    expect(labels()[3].getAttribute('for')).toBe(id);
  });
});
