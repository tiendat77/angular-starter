import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { UiCheckboxComponent, UiSwitchComponent } from './public-api';

@Component({
  standalone: true,
  imports: [UiCheckboxComponent, UiSwitchComponent],
  template: `
    <ui-checkbox
      [(checked)]="checked"
      [disabled]="disabled()"
      label="Accept Terms"
    />
    <ui-switch
      [(checked)]="switchChecked"
      label="Notifications"
    />
  `,
})
class CheckboxHostComponent {
  readonly checked = signal(false);
  readonly disabled = signal(false);
  readonly switchChecked = signal(false);
}

describe('UiCheckboxComponent and UiSwitchComponent', () => {
  let fixture: ComponentFixture<CheckboxHostComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [CheckboxHostComponent] });
    fixture = TestBed.createComponent(CheckboxHostComponent);
    fixture.detectChanges();
  });

  it('should toggle checked signal when checkbox is clicked', () => {
    const checkboxEl = fixture.nativeElement.querySelector('ui-checkbox input');
    checkboxEl.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.checked()).toBe(true);
  });

  it('should render a native role="switch" checkbox and toggle it on click', () => {
    const switchEl: HTMLInputElement = fixture.nativeElement.querySelector('ui-switch input');
    expect(switchEl.type).toBe('checkbox');
    expect(switchEl.getAttribute('role')).toBe('switch');
    expect(switchEl.classList).toContain('toggle');

    switchEl.click();
    fixture.detectChanges();
    expect(switchEl.checked).toBe(true);
    expect(fixture.componentInstance.switchChecked()).toBe(true);
  });

  it('should style the checkbox with the shared checkbox utility', () => {
    const checkboxEl: HTMLInputElement = fixture.nativeElement.querySelector('ui-checkbox input');
    expect(checkboxEl.classList).toContain('checkbox');
    expect(checkboxEl.classList).toContain('checkbox-md');
  });

  it('forwards ariaLabel to the native input', () => {
    const labelled = TestBed.createComponent(UiCheckboxComponent);
    labelled.componentRef.setInput('ariaLabel', 'Select row 1');
    labelled.detectChanges();
    const input = labelled.nativeElement.querySelector('input') as HTMLInputElement;
    expect(input.getAttribute('aria-label')).toBe('Select row 1');
  });
});
