import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  UiCollapse,
  UiCollapseContentDirective,
  UiCollapseExtraDirective,
  UiCollapseHeaderDirective,
  UiCollapseIconDirective,
  UiCollapseIconPosition,
  UiCollapsePanel,
  UiCollapseVariant,
} from '@libs/ui';
import { ApiRow, ApiTableComponent } from '../../shared/api-table/api-table.component';
import { PlaygroundComponent } from '../../shared/playground/playground.component';

@Component({
  selector: 'doc-collapse',
  standalone: true,
  imports: [
    JsonPipe,
    FormsModule,
    UiCollapse,
    UiCollapsePanel,
    UiCollapseHeaderDirective,
    UiCollapseExtraDirective,
    UiCollapseContentDirective,
    UiCollapseIconDirective,
    PlaygroundComponent,
    ApiTableComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './collapse-doc.component.html',
})
export class CollapseDocComponent {
  readonly variants: UiCollapseVariant[] = ['bordered', 'frameless', 'ghost'];
  readonly iconPositions: UiCollapseIconPosition[] = ['left', 'right'];

  // Playground state
  readonly variant = signal<UiCollapseVariant>('bordered');
  readonly accordion = signal(false);
  readonly expandIconPosition = signal<UiCollapseIconPosition>('left');
  readonly playgroundActiveIds = signal<any>(['panel-1']);

  // Accordion demo state
  readonly accordionActiveId = signal<string | null>('faq-1');

  // Action count state
  readonly actionCount = signal(0);

  readonly generatedCode = computed(() => {
    const isAccordion = this.accordion();
    const v = this.variant();
    const pos = this.expandIconPosition();

    return `<ui-collapse
  [accordion]="${isAccordion}"
  variant="${v}"
  expandIconPosition="${pos}"
  [(activeIds)]="activeIds"
>
  <ui-collapse-panel [id]="'panel-1'" header="System Overview">
    <p>Comprehensive monitoring and metrics of running services.</p>
  </ui-collapse-panel>
  <ui-collapse-panel [id]="'panel-2'" header="Access Control">
    <p>Role-based permissions and API token revocation.</p>
  </ui-collapse-panel>
  <ui-collapse-panel [id]="'panel-3'" header="Billing & Invoices">
    <p>Payment methods, billing contacts, and downloadable receipts.</p>
  </ui-collapse-panel>
</ui-collapse>`;
  });

  onExtraAction(event: Event): void {
    event.stopPropagation();
    this.actionCount.update((c) => c + 1);
  }

  readonly collapseApi: ApiRow[] = [
    {
      name: 'accordion',
      type: 'boolean',
      default: 'false',
      description: 'When true, enforces single-panel expansion (accordion mode).',
    },
    {
      name: 'variant',
      type: "'bordered' | 'frameless' | 'ghost'",
      default: "'bordered'",
      description: 'Visual appearance variant for the container and panels.',
    },
    {
      name: 'expandIconPosition',
      type: "'left' | 'right'",
      default: "'left'",
      description: 'Placement of the expand indicator icon.',
    },
    {
      name: '[(activeIds)]',
      type: 'model<string | number | (string | number)[] | null>',
      default: 'null',
      description: 'Two-way binding for active panel ID(s).',
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      description: 'Disables all panels within the collapse container.',
    },
  ];

  readonly panelApi: ApiRow[] = [
    {
      name: 'id',
      type: 'string | number',
      default: 'auto-generated',
      description: 'Unique panel identifier matching activeIds.',
    },
    {
      name: 'header',
      type: 'string',
      default: "''",
      description: 'Title string when custom template slot is not used.',
    },
    {
      name: 'extra',
      type: 'string',
      default: "''",
      description: 'Extra text rendered opposite the title.',
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      description: 'Disables interaction on this specific panel.',
    },
    {
      name: 'showArrow',
      type: 'boolean',
      default: 'true',
      description: 'Controls whether the expand icon is displayed.',
    },
    {
      name: '[(expanded)]',
      type: 'model<boolean>',
      default: 'false',
      description: 'Two-way binding for individual panel expansion state.',
    },
  ];

  readonly directiveApi: ApiRow[] = [
    {
      name: '*uiCollapseHeader',
      type: 'Structural / Template Directive',
      default: '-',
      description: 'Custom projection slot for the panel header title.',
    },
    {
      name: '*uiCollapseExtra',
      type: 'Structural / Template Directive',
      default: '-',
      description: 'Action slot (buttons, badges) with click event isolation.',
    },
    {
      name: '*uiCollapseContent',
      type: 'Structural Directive',
      default: '-',
      description: 'Enables lazy rendering; instantiated only upon first expansion.',
    },
    {
      name: '*uiCollapseIcon',
      type: 'Template Directive',
      default: '-',
      description: 'Custom template slot overriding the default chevron icon.',
    },
  ];
}
