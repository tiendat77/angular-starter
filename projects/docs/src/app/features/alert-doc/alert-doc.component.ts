import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  UiAlertActionsDirective,
  UiAlertAppearance,
  UiAlertComponent,
  UiAlertTitleDirective,
} from '@libs/ui/alert';
import { UiButtonComponent } from '@libs/ui/button';
import { UiColor } from '@libs/ui/core';
import { ApiRow, ApiTableComponent } from '../../shared/api-table/api-table.component';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';
import { PlaygroundComponent } from '../../shared/playground/playground.component';

@Component({
  selector: 'doc-alert',
  imports: [
    FormsModule,
    UiAlertComponent,
    UiAlertTitleDirective,
    UiAlertActionsDirective,
    UiButtonComponent,
    PlaygroundComponent,
    ApiTableComponent,
    CodeBlockComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './alert-doc.component.html',
})
export class AlertDocComponent {
  readonly colors: UiColor[] = ['neutral', 'primary', 'info', 'success', 'warning', 'error'];
  readonly appearances: UiAlertAppearance[] = ['soft', 'outline', 'dash', 'solid'];

  readonly color = signal<UiColor>('info');
  readonly appearance = signal<UiAlertAppearance>('soft');
  readonly icon = signal(true);
  readonly banner = signal(false);
  readonly dismissible = signal(true);
  readonly withTitle = signal(true);
  readonly withActions = signal(false);
  readonly open = signal(true);

  readonly generatedCode = computed(() => {
    const attrs: string[] = [];
    if (this.color() !== 'neutral') attrs.push(`color="${this.color()}"`);
    if (this.appearance() !== 'soft') attrs.push(`appearance="${this.appearance()}"`);
    if (!this.icon()) attrs.push('[icon]="false"');
    if (this.banner()) attrs.push('banner');
    if (this.dismissible()) attrs.push('dismissible [(open)]="open"');
    const lines = [`<ui-alert${attrs.length ? ' ' + attrs.join(' ') : ''}>`];
    if (this.withTitle()) lines.push('  <span uiAlertTitle>Scheduled maintenance</span>');
    lines.push('  The service will be unavailable on Sunday from 02:00 to 04:00 UTC.');
    if (this.withActions()) {
      lines.push(
        '  <div uiAlertActions>',
        '    <button uiButton size="sm">View details</button>',
        '  </div>'
      );
    }
    lines.push('</ui-alert>');
    return lines.join('\n');
  });

  readonly bannerCode = `<ui-alert banner color="warning" dismissible>
  Your trial ends in 3 days.
</ui-alert>`;

  readonly apiRows: ApiRow[] = [
    { name: 'color', type: 'UiColor', default: "'neutral'", description: 'Semantic color.' },
    {
      name: 'appearance',
      type: "'soft' | 'outline' | 'dash' | 'solid'",
      default: "'soft'",
      description: 'How the color is applied.',
    },
    {
      name: 'icon',
      type: 'boolean',
      default: 'true',
      description:
        'Default icon for info/success/warning/error. A projected [uiAlertIcon] always wins.',
    },
    {
      name: 'banner',
      type: 'boolean',
      default: 'false',
      description: 'Square corners, bottom border only.',
    },
    {
      name: 'dismissible',
      type: 'boolean',
      default: 'false',
      description: 'Shows a close button.',
    },
    {
      name: 'closeLabel',
      type: 'string',
      default: "'Dismiss'",
      description: 'Close button aria-label.',
    },
    {
      name: 'open',
      type: 'model<boolean>',
      default: 'true',
      description: 'false hides the alert. Two-way bindable.',
    },
    {
      name: 'role',
      type: "'alert' | 'status' | 'none' | null",
      default: 'null',
      description: 'null picks alert for error/warning and status otherwise. none renders no role.',
    },
    {
      name: '(closed)',
      type: 'void',
      description: 'Emitted when the close button hides the alert.',
    },
    {
      name: '[uiAlertTitle] / [uiAlertIcon] / [uiAlertActions]',
      type: 'directive',
      description: 'Title line, custom icon, and a row of actions under the message.',
    },
  ];
}
