import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  UI_MENU_CONFIG,
  UiMenuDirective,
  UiMenuItemDirective,
  UiMenuPosition,
  UiMenuTriggerDirective,
} from './public-api';

@Component({
  standalone: true,
  imports: [UiMenuTriggerDirective, UiMenuDirective, UiMenuItemDirective],
  template: `
    <button
      id="trigger-btn"
      [uiMenuTriggerFor]="menuTpl"
      [uiMenuPosition]="position()"
      [uiMenuDisabled]="disabled()"
    >
      Options
    </button>

    <ng-template #menuTpl>
      <div
        uiMenu
        id="menu-root"
        (itemSelected)="onItemSelected($event)"
      >
        <button
          uiMenuItem
          id="action-1"
          value="item-1-val"
          (click)="onAction1()"
        >
          Action 1
        </button>
        <button
          uiMenuItem
          id="action-disabled"
          value="disabled-val"
          [disabled]="true"
          (click)="onActionDisabled()"
        >
          Action Disabled
        </button>
        <button
          uiMenuItem
          id="action-2"
          value="item-2-val"
          (click)="onAction2()"
        >
          Action 2
        </button>
      </div>
    </ng-template>
  `,
})
class TestHostComponent {
  readonly position = signal<UiMenuPosition>('bottom-start');
  readonly disabled = signal<boolean>(false);
  action1Count = 0;
  action2Count = 0;
  actionDisabledCount = 0;
  selectedItem: unknown = null;

  onAction1() {
    this.action1Count++;
  }
  onAction2() {
    this.action2Count++;
  }
  onActionDisabled() {
    this.actionDisabledCount++;
  }
  onItemSelected(val: unknown) {
    this.selectedItem = val;
  }
}

describe('UiMenu Full Integration', () => {
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent],
    });
    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
  });

  it('opens menu on trigger click and closes on subsequent trigger click', () => {
    const trigger: HTMLElement = fixture.nativeElement.querySelector('#trigger-btn');
    expect(document.querySelector('#menu-root')).toBeNull();
    expect(trigger.getAttribute('aria-expanded')).toBe('false');

    trigger.click();
    fixture.detectChanges();

    expect(document.querySelector('#menu-root')).not.toBeNull();
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(trigger.getAttribute('aria-controls')).not.toBeNull();

    trigger.click();
    fixture.detectChanges();

    expect(document.querySelector('#menu-root')).toBeNull();
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('closes menu and restores focus when Escape key is pressed on menu', () => {
    const trigger: HTMLElement = fixture.nativeElement.querySelector('#trigger-btn');
    trigger.click();
    fixture.detectChanges();

    expect(document.querySelector('#menu-root')).not.toBeNull();

    const menuEl = document.querySelector('#menu-root') as HTMLElement;
    menuEl.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();

    expect(document.querySelector('#menu-root')).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it('closes menu when Escape key is pressed on trigger element', () => {
    const trigger: HTMLElement = fixture.nativeElement.querySelector('#trigger-btn');
    trigger.click();
    fixture.detectChanges();

    expect(document.querySelector('#menu-root')).not.toBeNull();

    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();

    expect(document.querySelector('#menu-root')).toBeNull();
  });

  it('closes menu when backdrop is clicked', () => {
    const trigger: HTMLElement = fixture.nativeElement.querySelector('#trigger-btn');
    trigger.click();
    fixture.detectChanges();

    const backdrop = document.querySelector('.cdk-overlay-backdrop') as HTMLElement;
    expect(backdrop).not.toBeNull();
    backdrop.click();
    fixture.detectChanges();

    expect(document.querySelector('#menu-root')).toBeNull();
  });

  it('executes item click, emits itemSelected, and automatically closes menu', () => {
    const trigger: HTMLElement = fixture.nativeElement.querySelector('#trigger-btn');
    trigger.click();
    fixture.detectChanges();

    const item1 = document.querySelector('#action-1') as HTMLElement;
    item1.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.action1Count).toBe(1);
    expect(fixture.componentInstance.selectedItem).toBe('item-1-val');
    expect(document.querySelector('#menu-root')).toBeNull();
  });

  it('does not trigger action or close menu when disabled item is clicked', () => {
    const trigger: HTMLElement = fixture.nativeElement.querySelector('#trigger-btn');
    trigger.click();
    fixture.detectChanges();

    const disabledItem = document.querySelector('#action-disabled') as HTMLElement;
    disabledItem.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.actionDisabledCount).toBe(0);
    expect(fixture.componentInstance.selectedItem).toBeNull();
    expect(document.querySelector('#menu-root')).not.toBeNull();
  });

  it('does not open menu when uiMenuDisabled is true', () => {
    fixture.componentInstance.disabled.set(true);
    fixture.detectChanges();

    const trigger: HTMLElement = fixture.nativeElement.querySelector('#trigger-btn');
    expect(trigger.getAttribute('aria-disabled')).toBe('true');
    trigger.click();
    fixture.detectChanges();

    expect(document.querySelector('#menu-root')).toBeNull();
  });

  it('navigates with ArrowDown and ArrowUp, skipping disabled items', () => {
    const trigger: HTMLElement = fixture.nativeElement.querySelector('#trigger-btn');
    trigger.click();
    fixture.detectChanges();

    const item1 = document.querySelector('#action-1') as HTMLElement;
    item1.focus();

    item1.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    fixture.detectChanges();

    // Skips disabled item and focuses action-2
    const item2 = document.querySelector('#action-2') as HTMLElement;
    expect(document.activeElement).toBe(item2);

    item2.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
    fixture.detectChanges();

    expect(document.activeElement).toBe(item1);
  });

  it('navigates with Home and End keys to first and last enabled items', () => {
    const trigger: HTMLElement = fixture.nativeElement.querySelector('#trigger-btn');
    trigger.click();
    fixture.detectChanges();

    const item1 = document.querySelector('#action-1') as HTMLElement;
    const item2 = document.querySelector('#action-2') as HTMLElement;

    item1.focus();
    item1.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    fixture.detectChanges();
    expect(document.activeElement).toBe(item2);

    item2.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    fixture.detectChanges();
    expect(document.activeElement).toBe(item1);
  });

  it('opens menu with ArrowDown and ArrowUp from trigger button', () => {
    const trigger: HTMLElement = fixture.nativeElement.querySelector('#trigger-btn');

    // ArrowDown opens menu
    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    fixture.detectChanges();
    expect(document.querySelector('#menu-root')).not.toBeNull();

    // Close
    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    expect(document.querySelector('#menu-root')).toBeNull();

    // ArrowUp opens menu
    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
    fixture.detectChanges();
    expect(document.querySelector('#menu-root')).not.toBeNull();
  });
});

@Component({
  standalone: true,
  imports: [UiMenuTriggerDirective, UiMenuDirective, UiMenuItemDirective],
  template: `
    <button [uiMenuTriggerFor]="cfgTpl">Trigger</button>
    <ng-template #cfgTpl>
      <div
        uiMenu
        id="cfg-menu"
      >
        <button uiMenuItem>Config Item</button>
      </div>
    </ng-template>
  `,
})
class ConfiguredHostComponent {}

describe('UI_MENU_CONFIG overrides', () => {
  it('applies default size from UI_MENU_CONFIG provider', () => {
    TestBed.configureTestingModule({
      imports: [ConfiguredHostComponent],
      providers: [
        {
          provide: UI_MENU_CONFIG,
          useValue: { size: 'lg' },
        },
      ],
    });

    const fixture = TestBed.createComponent(ConfiguredHostComponent);
    fixture.detectChanges();

    const trigger: HTMLElement = fixture.nativeElement.querySelector('button');
    trigger.click();
    fixture.detectChanges();

    const menu = document.querySelector('#cfg-menu') as HTMLElement;
    expect(menu.className).toContain('menu-lg');
  });
});
