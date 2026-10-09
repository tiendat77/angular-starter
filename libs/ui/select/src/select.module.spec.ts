import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { describe, expect, it } from 'vitest';
import { UiSelectComponent } from './public-api';
import { UiSelectModule } from './select.module';
import { options, settle, trigger } from './select.testing';

@Component({
  imports: [UiSelectModule],
  template: `
    <ui-select
      [(value)]="country"
      placeholder="Country"
      ariaLabel="Country"
      searchable
    >
      <ui-option
        value="vn"
        label="Vietnam"
      />
      <ui-option
        value="jp"
        label="Japan"
      />
      <ng-template
        uiSelectEmpty
        let-term
        >Nothing for {{ term }}</ng-template
      >
    </ui-select>
  `,
})
class Host {
  readonly country = signal<string | null>('vn');
}

describe('UiSelectModule', () => {
  it('brings the select, its options and the empty template', async () => {
    const fixture = TestBed.createComponent(Host);
    await settle(fixture);
    expect(fixture.debugElement.query(By.directive(UiSelectComponent))).not.toBeNull();
    expect(trigger()).not.toBeNull();

    trigger().click();
    await settle(fixture);
    expect(options().map((o) => o.textContent?.trim())).toEqual(['Vietnam', 'Japan']);
  });
});
