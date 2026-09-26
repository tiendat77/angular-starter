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

  it('should have role="switch" and toggle aria-checked on switch', () => {
    const switchEl = fixture.nativeElement.querySelector('ui-switch button');
    expect(switchEl.getAttribute('role')).toBe('switch');
    switchEl.click();
    fixture.detectChanges();
    expect(switchEl.getAttribute('aria-checked')).toBe('true');
    expect(fixture.componentInstance.switchChecked()).toBe(true);
  });
});
