import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { afterEach, describe, expect, it } from 'vitest';
import { UiMenuModule } from './menu.module';
import { UiMenuTriggerDirective } from './public-api';

@Component({
  imports: [UiMenuModule],
  template: `
    <button [uiMenuTriggerFor]="actions">Actions</button>
    <ng-template #actions>
      <div uiMenu>
        <div uiMenuLabel>Project</div>
        <button uiMenuItem>Rename</button>
        <div uiMenuDivider></div>
        <button
          uiMenuItem
          danger
        >
          Delete
        </button>
      </div>
    </ng-template>
  `,
})
class Host {}

describe('UiMenuModule', () => {
  afterEach(() => document.querySelectorAll('.cdk-overlay-container').forEach((e) => e.remove()));

  it('brings the trigger, the menu, its items, label and divider', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const trigger = fixture.debugElement.query(By.directive(UiMenuTriggerDirective));
    expect(trigger).not.toBeNull();

    (trigger.nativeElement as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(document.querySelector('[role="menu"]')).not.toBeNull();
    expect(document.querySelectorAll('[role="menuitem"]').length).toBe(2);
  });
});
