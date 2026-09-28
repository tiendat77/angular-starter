import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UiColor } from '@libs/ui/core';
import {
  UiTabContentDirective,
  UiTabDirective,
  UiTabListDirective,
  UiTabPanelDirective,
  UiTabsDirective,
  UiTabsOrientation,
  UiTabsSize,
  UiTabsVariant,
} from '@libs/ui/tabs';
import { ApiRow, ApiTableComponent } from '../../shared/api-table/api-table.component';
import { PlaygroundComponent } from '../../shared/playground/playground.component';

@Component({
  selector: 'doc-tabs',
  standalone: true,
  imports: [
    FormsModule,
    UiTabsDirective,
    UiTabListDirective,
    UiTabDirective,
    UiTabPanelDirective,
    UiTabContentDirective,
    PlaygroundComponent,
    ApiTableComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './tabs-doc.component.html',
})
export class TabsDocComponent {
  readonly variants: UiTabsVariant[] = ['bordered', 'lift', 'pill'];
  readonly orientations: UiTabsOrientation[] = ['horizontal', 'vertical'];
  readonly sizes: UiTabsSize[] = ['sm', 'md', 'lg'];
  readonly colors: UiColor[] = ['primary', 'neutral', 'info', 'success', 'warning', 'error'];

  readonly variant = signal<UiTabsVariant>('bordered');
  readonly orientation = signal<UiTabsOrientation>('horizontal');
  readonly size = signal<UiTabsSize>('md');
  readonly color = signal<UiColor>('primary');
  readonly selectedTab = signal<string | undefined>('account');

  // Showcase section signals
  readonly showcaseVariantTab = signal<string | undefined>('bordered-1');
  readonly verticalTab = signal<string | undefined>('profile');
  readonly lazyTab = signal<string | undefined>('general');
  readonly disabledDemoTab = signal<string | undefined>('tab-a');

  readonly generatedCode = computed(() => {
    const attrs = [
      `[uiTabsVariant]="'${this.variant()}'"`,
      `[uiTabsOrientation]="'${this.orientation()}'"`,
      `[uiTabsSize]="'${this.size()}'"`,
    ];
    if (this.color() !== 'primary') {
      attrs.push(`[uiTabsColor]="'${this.color()}'"`);
    }

    return `<div uiTabs
     ${attrs.join('\n     ')}>
  <div uiTabList [selectedTab]="selectedTab()" (selectedTabChange)="selectedTab.set($event)">
    <button uiTab value="account">Account</button>
    <button uiTab value="password">Password</button>
    <button uiTab value="settings">Settings</button>
  </div>

  <div uiTabPanel value="account">
    <ng-template uiTabContent>
      <p>Manage your personal profile and account settings.</p>
    </ng-template>
  </div>
  <div uiTabPanel value="password">
    <ng-template uiTabContent>
      <p>Update your authentication password and 2FA credentials.</p>
    </ng-template>
  </div>
  <div uiTabPanel value="settings">
    <ng-template uiTabContent>
      <p>Configure team preferences and notification channels.</p>
    </ng-template>
  </div>
</div>`;
  });

  readonly tabsApi: ApiRow[] = [
    {
      name: 'uiTabs',
      type: 'UiTabsVariant | ""',
      default: "'bordered'",
      description: 'Root tabs directive selector and variant shorthand.',
    },
    {
      name: 'uiTabsVariant',
      type: "'bordered' | 'lift' | 'pill'",
      default: "'bordered'",
      description: 'Visual presentation variant of the tab group.',
    },
    {
      name: 'uiTabsOrientation',
      type: "'horizontal' | 'vertical'",
      default: "'horizontal'",
      description: 'Direction of tab list layout and keyboard arrow navigation.',
    },
    {
      name: 'uiTabsSize',
      type: "'sm' | 'md' | 'lg'",
      default: "'md'",
      description: 'Size scaling of tab buttons and indicators.',
    },
    {
      name: 'uiTabsColor',
      type: 'UiColor',
      default: "'primary'",
      description: 'Active tab accent color token.',
    },
  ];

  readonly tabListApi: ApiRow[] = [
    {
      name: 'uiTabList',
      type: 'directive selector',
      default: '-',
      description: 'Compound container directive wrapping the tab button collection.',
    },
    {
      name: 'selectedTab',
      type: 'string',
      default: 'undefined',
      description: 'Model signal of the currently active tab value.',
    },
    {
      name: 'selectedTabChange',
      type: 'EventEmitter<string>',
      default: '-',
      description: 'Emitted when active tab selection changes.',
    },
    {
      name: 'orientation',
      type: "'horizontal' | 'vertical'",
      default: "inherited from context ('horizontal')",
      description: 'Explicit orientation override on the tablist element.',
    },
    {
      name: 'wrap',
      type: 'boolean',
      default: 'true',
      description: 'Whether keyboard arrow navigation wraps around at start/end.',
    },
    {
      name: 'softDisabled',
      type: 'boolean',
      default: 'false',
      description: 'Whether disabled tabs can receive keyboard roving focus.',
    },
  ];

  readonly tabApi: ApiRow[] = [
    {
      name: 'uiTab',
      type: 'directive selector',
      default: '-',
      description: 'Tab trigger button directive with roving tabindex and a11y bindings.',
    },
    {
      name: 'value',
      type: 'string',
      default: 'required',
      description: 'Unique identifier matching a corresponding uiTabPanel value.',
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      description: 'Whether the tab trigger button is disabled and skipped during navigation.',
    },
    {
      name: 'uiTabColor',
      type: 'UiColor',
      default: 'undefined',
      description: 'Optional per-tab color override, superseding the root uiTabsColor.',
    },
  ];

  readonly tabPanelApi: ApiRow[] = [
    {
      name: 'uiTabPanel',
      type: 'directive selector',
      default: '-',
      description: 'Tab panel content container connected to a tab value.',
    },
    {
      name: 'value',
      type: 'string',
      default: 'required',
      description: 'Unique identifier matching the corresponding uiTab value.',
    },
  ];

  readonly tabContentApi: ApiRow[] = [
    {
      name: 'uiTabContent',
      type: 'directive selector (ng-template)',
      default: '-',
      description: 'Structural directive on <ng-template> enabling lazy deferred rendering.',
    },
  ];
}
