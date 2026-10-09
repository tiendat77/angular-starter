import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { UiRadioModule } from './radio.module';

@Component({
  imports: [UiRadioModule],
  template: `
    <ui-radio-group
      [(value)]="plan"
      aria-label="Plan"
    >
      <ui-radio
        value="starter"
        label="Starter"
      />
      <ui-radio
        value="team"
        label="Team"
      />
    </ui-radio-group>
  `,
})
class Host {
  readonly plan = signal('team');
}

describe('UiRadioModule', () => {
  it('brings the radio group and the radios', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const group = fixture.nativeElement.querySelector('ui-radio-group');
    expect(group.getAttribute('role')).toBe('radiogroup');
    expect(fixture.nativeElement.querySelectorAll('ui-radio').length).toBe(2);
    const radios = fixture.nativeElement.querySelectorAll('ui-radio[role="radio"]');
    expect(radios.length).toBe(2);
    expect(radios[1].getAttribute('aria-checked')).toBe('true');
  });
});
