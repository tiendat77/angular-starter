import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { UiRadioComponent, UiRadioGroupComponent } from './public-api';

@Component({
  standalone: true,
  imports: [UiRadioGroupComponent, UiRadioComponent],
  template: `
    <ui-radio-group [(value)]="selected">
      <ui-radio
        value="option1"
        label="Option 1"
      />
      <ui-radio
        value="option2"
        label="Option 2"
      />
    </ui-radio-group>
  `,
})
class RadioHostComponent {
  readonly selected = signal('option1');
}

describe('UiRadioGroupComponent', () => {
  let fixture: ComponentFixture<RadioHostComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [RadioHostComponent] });
    fixture = TestBed.createComponent(RadioHostComponent);
    fixture.detectChanges();
  });

  it('should mark first radio as checked and active', () => {
    const radios = fixture.nativeElement.querySelectorAll('ui-radio');
    expect(radios[0].getAttribute('aria-checked')).toBe('true');
    expect(radios[1].getAttribute('aria-checked')).toBe('false');
  });

  it('should change active selection on click', () => {
    const radios = fixture.nativeElement.querySelectorAll('ui-radio');
    radios[1].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.selected()).toBe('option2');
    expect(radios[1].getAttribute('aria-checked')).toBe('true');
  });

  it('should navigate radios using arrow keys', () => {
    const radios = fixture.nativeElement.querySelectorAll('ui-radio');
    radios[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.selected()).toBe('option2');
    expect(radios[1].getAttribute('aria-checked')).toBe('true');

    radios[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.selected()).toBe('option1');
    expect(radios[0].getAttribute('aria-checked')).toBe('true');
  });
});
