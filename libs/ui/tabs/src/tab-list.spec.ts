import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { UiTabListDirective } from './tab-list.directive';
import { UiTabsDirective } from './tabs.directive';
import { UiTabsOrientation, UiTabsVariant } from './tabs.types';

@Component({
  standalone: true,
  imports: [UiTabsDirective, UiTabListDirective],
  template: `
    <div
      uiTabs
      [uiTabsVariant]="variant()"
      [uiTabsOrientation]="orientation()"
    >
      <div
        uiTabList
        [selectedTab]="selected()"
        (selectedTabChange)="selected.set($event)"
      ></div>
    </div>
  `,
})
class TestHostComponent {
  readonly variant = signal<UiTabsVariant>('bordered');
  readonly orientation = signal<UiTabsOrientation>('horizontal');
  readonly selected = signal<string | undefined>('tab1');
}

describe('UiTabsDirective & UiTabListDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent],
    });
    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
  });

  it('renders tablist with role="tablist" and default classes', () => {
    const listEl = fixture.nativeElement.querySelector('[uiTabList]');
    expect(listEl.getAttribute('role')).toBe('tablist');
    expect(listEl.className).toContain('tabs');
    expect(listEl.className).toContain('tabs-bordered');
  });

  it('reactively updates classes when variant changes', () => {
    fixture.componentInstance.variant.set('pill');
    fixture.detectChanges();

    const listEl = fixture.nativeElement.querySelector('[uiTabList]');
    expect(listEl.className).toContain('tabs-pill');
    expect(listEl.className).not.toContain('tabs-bordered');
  });

  it('sets vertical orientation attributes and classes', () => {
    fixture.componentInstance.orientation.set('vertical');
    fixture.detectChanges();

    const listEl = fixture.nativeElement.querySelector('[uiTabList]');
    expect(listEl.className).toContain('tabs-vertical');
    expect(listEl.getAttribute('aria-orientation')).toBe('vertical');
  });
});
