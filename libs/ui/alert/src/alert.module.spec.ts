import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { describe, expect, it } from 'vitest';
import { UiAlertModule } from './alert.module';
import {
  UiAlertActionsDirective,
  UiAlertComponent,
  UiAlertIconDirective,
  UiAlertTitleDirective,
} from './public-api';

@Component({
  imports: [UiAlertModule],
  template: `
    <ui-alert color="warning">
      <svg uiAlertIcon></svg>
      <span uiAlertTitle>Heads up</span>
      Body
      <div uiAlertActions><button>Undo</button></div>
    </ui-alert>
  `,
})
class Host {}

describe('UiAlertModule', () => {
  it('brings the alert and all its parts', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    for (const directive of [
      UiAlertComponent,
      UiAlertTitleDirective,
      UiAlertIconDirective,
      UiAlertActionsDirective,
    ]) {
      expect(fixture.debugElement.query(By.directive(directive))).not.toBeNull();
    }
    expect(fixture.nativeElement.querySelector('ui-alert').getAttribute('role')).toBe('alert');
  });
});
