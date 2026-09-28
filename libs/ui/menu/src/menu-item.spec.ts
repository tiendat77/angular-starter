import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { UiMenuDividerDirective } from './menu-divider.directive';
import { UiMenuItemDirective } from './menu-item.directive';
import { UiMenuLabelDirective } from './menu-label.directive';
import { UiMenuDirective } from './menu.directive';

@Component({
  standalone: true,
  imports: [UiMenuDirective, UiMenuItemDirective, UiMenuDividerDirective, UiMenuLabelDirective],
  template: `
    <div
      uiMenu
      [uiMenuSize]="size()"
    >
      <div uiMenuLabel>Group 1</div>
      <button
        uiMenuItem
        id="item-1"
      >
        Item 1
      </button>
      <div uiMenuDivider></div>
      <button
        uiMenuItem
        id="item-danger"
        [danger]="true"
      >
        Delete
      </button>
      <button
        uiMenuItem
        id="item-disabled"
        [disabled]="true"
      >
        Disabled
      </button>
    </div>
  `,
})
class TestMenuComponent {
  readonly size = signal<'sm' | 'md' | 'lg'>('md');
}

describe('Menu Directives', () => {
  let fixture: ComponentFixture<TestMenuComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestMenuComponent],
    });
    fixture = TestBed.createComponent(TestMenuComponent);
    fixture.detectChanges();
  });

  it('renders menu container with role="menu" and base classes', () => {
    const menuEl = fixture.nativeElement.querySelector('[uiMenu]');
    expect(menuEl.getAttribute('role')).toBe('menu');
    expect(menuEl.className).toContain('menu');
    expect(menuEl.className).toContain('menu-md');
  });

  it('renders menu items with role="menuitem" and appropriate variant classes', () => {
    const item1 = fixture.nativeElement.querySelector('#item-1');
    expect(item1.getAttribute('role')).toBe('menuitem');
    expect(item1.className).toContain('text-gray-700');

    const itemDanger = fixture.nativeElement.querySelector('#item-danger');
    expect(itemDanger.className).toContain('text-error');

    const itemDisabled = fixture.nativeElement.querySelector('#item-disabled');
    expect(itemDisabled.className).toContain('opacity-50');
    expect(itemDisabled.getAttribute('aria-disabled')).toBe('true');
  });

  it('renders label and separator with correct roles and styles', () => {
    const label = fixture.nativeElement.querySelector('[uiMenuLabel]');
    expect(label.className).toContain('menu-title');

    const divider = fixture.nativeElement.querySelector('[uiMenuDivider]');
    expect(divider.getAttribute('role')).toBe('separator');
  });
});
