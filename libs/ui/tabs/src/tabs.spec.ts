import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UiColor } from '@libs/ui/core';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  UI_TABS_CONFIG,
  UiTabContentDirective,
  UiTabDirective,
  UiTabListDirective,
  UiTabPanelDirective,
  UiTabsDirective,
} from './public-api';
import { UiTabsOrientation, UiTabsSize, UiTabsVariant } from './tabs.types';

@Component({
  standalone: true,
  imports: [
    UiTabsDirective,
    UiTabListDirective,
    UiTabDirective,
    UiTabPanelDirective,
    UiTabContentDirective,
  ],
  template: `
    <div
      uiTabs
      [uiTabsVariant]="variant()"
      [uiTabsOrientation]="orientation()"
      [uiTabsSize]="size()"
      [uiTabsColor]="color()"
    >
      <div
        uiTabList
        [selectedTab]="selectedTab()"
        (selectedTabChange)="selectedTab.set($event)"
      >
        <button
          uiTab
          value="tab1"
          id="tab1-btn"
        >
          Tab 1
        </button>
        <button
          uiTab
          value="tab2"
          id="tab2-btn"
          [disabled]="tab2Disabled()"
        >
          Tab 2
        </button>
        <button
          uiTab
          value="tab3"
          id="tab3-btn"
        >
          Tab 3
        </button>
        <button
          uiTab
          value="tab4"
          id="tab4-btn"
        >
          Tab 4
        </button>
      </div>

      <div
        uiTabPanel
        value="tab1"
        id="panel1"
      >
        <ng-template uiTabContent>
          <span class="panel1-content">Content 1</span>
        </ng-template>
      </div>

      <div
        uiTabPanel
        value="tab2"
        id="panel2"
      >
        <ng-template uiTabContent>
          <span class="panel2-content">Content 2</span>
        </ng-template>
      </div>

      <div
        uiTabPanel
        value="tab3"
        id="panel3"
      >
        <ng-template uiTabContent>
          <span class="panel3-content">Content 3</span>
        </ng-template>
      </div>

      <div
        uiTabPanel
        value="tab4"
        id="panel4"
      >
        <span class="panel4-eager">Eager Content 4</span>
      </div>
    </div>
  `,
})
class TestHostComponent {
  readonly variant = signal<UiTabsVariant>('bordered');
  readonly orientation = signal<UiTabsOrientation>('horizontal');
  readonly size = signal<UiTabsSize>('md');
  readonly color = signal<UiColor>('primary');
  readonly selectedTab = signal<string | undefined>('tab1');
  readonly tab2Disabled = signal<boolean>(false);
}

@Component({
  standalone: true,
  imports: [UiTabsDirective, UiTabListDirective, UiTabDirective, UiTabPanelDirective],
  template: `
    <div uiTabs="pill">
      <div uiTabList>
        <button
          uiTab
          value="a"
          id="tab-a"
        >
          A
        </button>
      </div>
      <div
        uiTabPanel
        value="a"
      ></div>
    </div>
  `,
})
class TestShorthandComponent {}

@Component({
  standalone: true,
  imports: [UiTabsDirective, UiTabListDirective, UiTabDirective, UiTabPanelDirective],
  template: `
    <div uiTabs>
      <div uiTabList>
        <button
          uiTab
          value="cfg"
          id="tab-cfg"
        >
          Config
        </button>
      </div>
      <div
        uiTabPanel
        value="cfg"
      ></div>
    </div>
  `,
})
class TestConfigComponent {}

describe('UiTabs Full Integration', () => {
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent],
    });
    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
  });

  it('renders initial active tab with aria-selected="true" and associated panel content', () => {
    const tab1: HTMLElement = fixture.nativeElement.querySelector('#tab1-btn');
    const tab2: HTMLElement = fixture.nativeElement.querySelector('#tab2-btn');
    expect(tab1.getAttribute('aria-selected')).toBe('true');
    expect(tab2.getAttribute('aria-selected')).toBe('false');

    // Panel 1 lazy content is rendered
    expect(fixture.nativeElement.querySelector('.panel1-content')).not.toBeNull();
    // Inactive panels have not rendered their lazy template content
    expect(fixture.nativeElement.querySelector('.panel2-content')).toBeNull();
    expect(fixture.nativeElement.querySelector('.panel3-content')).toBeNull();
  });

  it('hides inactive panels visually with hidden attribute and inert styling', () => {
    const panel1: HTMLElement = fixture.nativeElement.querySelector('#panel1');
    const panel2: HTMLElement = fixture.nativeElement.querySelector('#panel2');
    const panel4: HTMLElement = fixture.nativeElement.querySelector('#panel4');

    expect(panel1.hidden).toBe(false);
    expect(panel2.hidden).toBe(true);
    expect(panel4.hidden).toBe(true);
  });

  it('establishes correct WAI-ARIA roles, aria-controls, and aria-labelledby linkage', () => {
    const list: HTMLElement = fixture.nativeElement.querySelector('[uiTabList]');
    expect(list.getAttribute('role')).toBe('tablist');

    const tab1: HTMLElement = fixture.nativeElement.querySelector('#tab1-btn');
    expect(tab1.getAttribute('role')).toBe('tab');

    const panel1: HTMLElement = fixture.nativeElement.querySelector('#panel1');
    expect(panel1.getAttribute('role')).toBe('tabpanel');

    expect(tab1.getAttribute('aria-controls')).toBe(panel1.id);
    expect(panel1.getAttribute('aria-labelledby')).toBe(tab1.id);
  });

  it('reactively updates classes on tab buttons when root variant, size, or color changes', () => {
    const tab1: HTMLElement = fixture.nativeElement.querySelector('#tab1-btn');
    expect(tab1.className).toContain('tab-bordered-item');
    expect(tab1.className).toContain('tab-md');
    expect(tab1.className).toContain('tab-color-primary');

    fixture.componentInstance.variant.set('pill');
    fixture.componentInstance.size.set('lg');
    fixture.componentInstance.color.set('error');
    fixture.detectChanges();

    expect(tab1.className).toContain('tab-pill-item');
    expect(tab1.className).toContain('tab-lg');
    expect(tab1.className).toContain('tab-color-error');
  });

  it('switches tabs on click and lazy-loads corresponding panel content', () => {
    const tab3: HTMLElement = fixture.nativeElement.querySelector('#tab3-btn');
    tab3.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.selectedTab()).toBe('tab3');
    expect(tab3.getAttribute('aria-selected')).toBe('true');
    expect(fixture.nativeElement.querySelector('.panel3-content')).not.toBeNull();
  });

  it('does not switch tabs when clicking a disabled tab', () => {
    fixture.componentInstance.tab2Disabled.set(true);
    fixture.detectChanges();

    const tab2: HTMLElement = fixture.nativeElement.querySelector('#tab2-btn');
    tab2.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.selectedTab()).toBe('tab1');
  });

  it('navigates with ArrowRight and ArrowLeft in horizontal mode', () => {
    const tab1: HTMLElement = fixture.nativeElement.querySelector('#tab1-btn');
    tab1.focus();

    tab1.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    fixture.detectChanges();

    expect(fixture.componentInstance.selectedTab()).toBe('tab2');
    const tab2: HTMLElement = fixture.nativeElement.querySelector('#tab2-btn');
    expect(tab2.getAttribute('aria-selected')).toBe('true');

    tab2.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    fixture.detectChanges();

    expect(fixture.componentInstance.selectedTab()).toBe('tab1');
    expect(tab1.getAttribute('aria-selected')).toBe('true');
  });

  it('skips disabled tabs during keyboard navigation', () => {
    fixture.componentInstance.tab2Disabled.set(true);
    fixture.detectChanges();

    const tab1: HTMLElement = fixture.nativeElement.querySelector('#tab1-btn');
    tab1.focus();

    tab1.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    fixture.detectChanges();

    // Skipped tab2 and jumped to tab3!
    expect(fixture.componentInstance.selectedTab()).toBe('tab3');
    const tab3: HTMLElement = fixture.nativeElement.querySelector('#tab3-btn');
    expect(tab3.getAttribute('aria-selected')).toBe('true');
  });

  it('navigates with ArrowDown and ArrowUp in vertical mode', () => {
    fixture.componentInstance.orientation.set('vertical');
    fixture.detectChanges();

    const tab1: HTMLElement = fixture.nativeElement.querySelector('#tab1-btn');
    tab1.focus();

    tab1.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    fixture.detectChanges();

    expect(fixture.componentInstance.selectedTab()).toBe('tab2');

    const tab2: HTMLElement = fixture.nativeElement.querySelector('#tab2-btn');
    tab2.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
    fixture.detectChanges();

    expect(fixture.componentInstance.selectedTab()).toBe('tab1');
  });

  it('jumps to first and last tabs with Home and End keys', () => {
    const tab1: HTMLElement = fixture.nativeElement.querySelector('#tab1-btn');
    tab1.focus();

    tab1.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.selectedTab()).toBe('tab4');

    tab1.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.selectedTab()).toBe('tab1');
  });

  it('supports selector shorthand uiTabs="pill"', () => {
    const shorthandFixture = TestBed.createComponent(TestShorthandComponent);
    shorthandFixture.detectChanges();

    const listEl = shorthandFixture.nativeElement.querySelector('[uiTabList]');
    expect(listEl.className).toContain('tabs-pill');

    const tabA = shorthandFixture.nativeElement.querySelector('#tab-a');
    expect(tabA.className).toContain('tab-pill-item');
  });

  it('respects global UI_TABS_CONFIG token', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [TestConfigComponent],
      providers: [
        {
          provide: UI_TABS_CONFIG,
          useValue: { variant: 'lift', size: 'lg', color: 'success' },
        },
      ],
    });
    const configFixture = TestBed.createComponent(TestConfigComponent);
    configFixture.detectChanges();

    const listEl = configFixture.nativeElement.querySelector('[uiTabList]');
    expect(listEl.className).toContain('tabs-lift');

    const tabCfg = configFixture.nativeElement.querySelector('#tab-cfg');
    expect(tabCfg.className).toContain('tab-lift-item');
    expect(tabCfg.className).toContain('tab-lg');
    expect(tabCfg.className).toContain('tab-color-success');
  });
});
