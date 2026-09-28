import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UiButtonComponent } from '@libs/ui/button';
import { UiColor } from '@libs/ui/core';
import { UiTooltipDirective, UiTooltipPosition, UiTooltipSize } from '@libs/ui/tooltip';
import { ApiRow, ApiTableComponent } from '../../shared/api-table/api-table.component';
import { PlaygroundComponent } from '../../shared/playground/playground.component';

@Component({
  selector: 'doc-tooltip',
  standalone: true,
  imports: [
    FormsModule,
    UiButtonComponent,
    UiTooltipDirective,
    PlaygroundComponent,
    ApiTableComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './tooltip-doc.component.html',
})
export class TooltipDocComponent {
  readonly positions: UiTooltipPosition[] = ['top', 'bottom', 'left', 'right'];
  readonly colors: UiColor[] = ['neutral', 'primary', 'info', 'success', 'warning', 'error'];
  readonly sizes: UiTooltipSize[] = ['sm', 'md'];

  readonly content = signal('Bookmark this page');
  readonly position = signal<UiTooltipPosition>('top');
  readonly color = signal<UiColor>('neutral');
  readonly size = signal<UiTooltipSize>('md');
  readonly arrow = signal(true);
  readonly delay = signal(200);
  readonly hideDelay = signal(0);
  readonly disabled = signal(false);
  readonly interactive = signal(false);

  readonly generatedCode = computed(() => {
    const attrs = [`[uiTooltip]="'${this.content()}'"`];
    if (this.position() !== 'top') attrs.push(`uiTooltipPosition="${this.position()}"`);
    if (this.color() !== 'neutral') attrs.push(`uiTooltipColor="${this.color()}"`);
    if (this.size() !== 'md') attrs.push(`uiTooltipSize="${this.size()}"`);
    if (!this.arrow()) attrs.push('[uiTooltipArrow]="false"');
    if (this.delay() !== 200) attrs.push(`[uiTooltipDelay]="${this.delay()}"`);
    if (this.hideDelay() !== 0) attrs.push(`[uiTooltipHideDelay]="${this.hideDelay()}"`);
    if (this.disabled()) attrs.push('[uiTooltipDisabled]="true"');
    if (this.interactive()) attrs.push('[uiTooltipInteractive]="true"');

    return `<button uiButton
        ${attrs.join('\n        ')}>
  Hover me
</button>`;
  });

  readonly directiveApi: ApiRow[] = [
    {
      name: 'uiTooltip',
      type: 'string | TemplateRef<unknown> | null',
      default: 'null',
      description: 'The tooltip content: plain text string or custom ng-template.',
    },
    {
      name: 'uiTooltipPosition',
      type: "'top' | 'bottom' | 'left' | 'right'",
      default: "'top'",
      description: 'Preferred placement relative to trigger. Automatically flips on collision.',
    },
    {
      name: 'uiTooltipColor',
      type: 'UiColor',
      default: "'neutral'",
      description:
        'Semantic color: neutral (high-contrast), primary, info, success, warning, error.',
    },
    {
      name: 'uiTooltipSize',
      type: "'sm' | 'md'",
      default: "'md'",
      description: 'Size variant of the tooltip bubble.',
    },
    {
      name: 'uiTooltipArrow',
      type: 'boolean',
      default: 'true',
      description: 'Whether to display the pointer arrow.',
    },
    {
      name: 'uiTooltipDelay',
      type: 'number',
      default: '200',
      description: 'Delay in milliseconds before showing tooltip on pointer hover.',
    },
    {
      name: 'uiTooltipHideDelay',
      type: 'number',
      default: '0',
      description: 'Delay in milliseconds before hiding tooltip on pointer leave.',
    },
    {
      name: 'uiTooltipDisabled',
      type: 'boolean',
      default: 'false',
      description: 'When true, tooltip will not trigger or open.',
    },
    {
      name: 'uiTooltipInteractive',
      type: 'boolean',
      default: 'false (true for TemplateRef)',
      description: 'Allows hovering over the tooltip content itself without closing.',
    },
    {
      name: 'uiTooltipClass',
      type: 'string',
      default: "''",
      description: 'Custom CSS class names applied to the floating overlay pane.',
    },
    {
      name: 'tooltipVisibleChange',
      type: 'EventEmitter<boolean>',
      default: '—',
      description: 'Emits when the tooltip visibility opens or closes.',
    },
  ];
}
