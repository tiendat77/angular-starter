import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UiButtonComponent } from '@libs/ui/button';
import {
  UiMenuDirective,
  UiMenuDividerDirective,
  UiMenuItemDirective,
  UiMenuLabelDirective,
  UiMenuPosition,
  UiMenuSize,
  UiMenuTriggerDirective,
} from '@libs/ui/menu';
import { ApiRow, ApiTableComponent } from '../../shared/api-table/api-table.component';
import { PlaygroundComponent } from '../../shared/playground/playground.component';

@Component({
  selector: 'doc-menu',
  standalone: true,
  imports: [
    FormsModule,
    UiButtonComponent,
    UiMenuDirective,
    UiMenuItemDirective,
    UiMenuDividerDirective,
    UiMenuLabelDirective,
    UiMenuTriggerDirective,
    PlaygroundComponent,
    ApiTableComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './menu-doc.component.html',
})
export class MenuDocComponent {
  readonly positions: UiMenuPosition[] = [
    'bottom-start',
    'bottom-end',
    'top-start',
    'top-end',
    'left-start',
    'right-start',
  ];
  readonly sizes: UiMenuSize[] = ['sm', 'md', 'lg'];

  // Playground state
  readonly position = signal<UiMenuPosition>('bottom-start');
  readonly size = signal<UiMenuSize>('md');
  readonly disabled = signal(false);
  readonly offsetY = signal(4);
  readonly lastAction = signal<string>('None');

  onAction(name: string): void {
    this.lastAction.set(name);
  }

  readonly generatedCode = computed(() => {
    const triggerAttrs = ['[uiMenuTriggerFor]="myMenu"'];
    if (this.position() !== 'bottom-start') {
      triggerAttrs.push(`uiMenuPosition="${this.position()}"`);
    }
    if (this.disabled()) {
      triggerAttrs.push('[uiMenuDisabled]="true"');
    }
    if (this.offsetY() !== 4) {
      triggerAttrs.push(`[uiMenuOffsetY]="${this.offsetY()}"`);
    }

    const sizeAttr = this.size() !== 'md' ? ` [uiMenuSize]="'${this.size()}'"` : '';

    return `<button uiButton ${triggerAttrs.join(' ')}>
  Options
</button>

<ng-template #myMenu>
  <div uiMenu${sizeAttr}>
    <div uiMenuLabel>Account</div>
    <button uiMenuItem (click)="onAction('Profile')">
      Profile
    </button>
    <button uiMenuItem (click)="onAction('Settings')">
      Settings
    </button>
    <div uiMenuDivider></div>
    <button uiMenuItem [danger]="true" (click)="onAction('Logout')">
      Sign out
    </button>
  </div>
</ng-template>`;
  });

  readonly triggerApi: ApiRow[] = [
    {
      name: 'uiMenuTriggerFor',
      type: 'TemplateRef<unknown>',
      default: 'required',
      description: 'Reference to the ng-template containing the menu markup.',
    },
    {
      name: 'uiMenuPosition',
      type: "'bottom-start' | 'bottom-end' | 'top-start' | 'top-end' | 'left-start' | 'right-start'",
      default: "'bottom-start'",
      description: 'Connected overlay placement relative to trigger with auto-flipping.',
    },
    {
      name: 'uiMenuDisabled',
      type: 'boolean',
      default: 'false',
      description: 'Whether opening the menu via click or keyboard is disabled.',
    },
    {
      name: 'uiMenuOffsetY',
      type: 'number',
      default: '4',
      description: 'Pixel offset gap between trigger element and floating menu portal.',
    },
    {
      name: 'menuOpened',
      type: 'Output<void>',
      default: '-',
      description: 'Emits when the menu overlay is attached and opened.',
    },
    {
      name: 'menuClosed',
      type: 'Output<void>',
      default: '-',
      description: 'Emits when the menu overlay is closed and destroyed.',
    },
  ];

  readonly menuApi: ApiRow[] = [
    {
      name: 'uiMenuSize',
      type: "'sm' | 'md' | 'lg'",
      default: "'md'",
      description: 'Controls padding, typography, and density across all child items.',
    },
    {
      name: 'closeRequested',
      type: 'Output<void>',
      default: '-',
      description: 'Emits when menu requests to close (via item click, Escape, etc.).',
    },
    {
      name: 'itemSelected',
      type: 'Output<unknown>',
      default: '-',
      description: 'Emits the value of an item when triggered.',
    },
  ];

  readonly itemApi: ApiRow[] = [
    {
      name: 'danger',
      type: 'boolean',
      default: 'false',
      description: 'Applies destructive danger red accent styling for delete/logout actions.',
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      description: 'Disables interactive selection and skips during arrow roving.',
    },
    {
      name: 'value',
      type: 'unknown',
      default: 'undefined',
      description: 'Optional payload emitted upon item selection.',
    },
    {
      name: 'triggered',
      type: 'Output<unknown>',
      default: '-',
      description: 'Emits when this specific menu item is activated.',
    },
  ];
}
