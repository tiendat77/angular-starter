import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { describe, expect, it } from 'vitest';
import { UiCollapseModule } from './collapse.module';
import { UiCollapse, UiCollapsePanel } from './public-api';

@Component({
  imports: [UiCollapseModule],
  template: `
    <ui-collapse accordion>
      <ui-collapse-panel
        id="a"
        header="First"
        >One</ui-collapse-panel
      >
      <ui-collapse-panel id="b">
        <div *uiCollapseHeader>Second</div>
        <button *uiCollapseExtra>Extra</button>
        <ng-template uiCollapseIcon>+</ng-template>
        Two
      </ui-collapse-panel>
    </ui-collapse>
  `,
})
class Host {}

describe('UiCollapseModule', () => {
  it('brings the collapse, its panels and the header, extra and icon templates', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.directive(UiCollapse))).not.toBeNull();
    expect(fixture.debugElement.queryAll(By.directive(UiCollapsePanel)).length).toBe(2);
    expect(fixture.nativeElement.textContent).toContain('First');
    expect(fixture.nativeElement.textContent).toContain('Second');
    expect(fixture.nativeElement.textContent).toContain('Extra');
  });
});
