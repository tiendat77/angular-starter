import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  UiBadgeAnchorDirective,
  UiBadgeComponent,
  UiBadgeOverlap,
  UiBadgePosition,
  UiBadgeSize,
} from '@libs/ui/badge';
import { UiButtonComponent } from '@libs/ui/button';
import { UiColor } from '@libs/ui/core';
import { ApiRow, ApiTableComponent } from '../../shared/api-table/api-table.component';
import { PlaygroundComponent } from '../../shared/playground/playground.component';

@Component({
  selector: 'doc-badge',
  imports: [
    FormsModule,
    UiBadgeComponent,
    UiBadgeAnchorDirective,
    UiButtonComponent,
    PlaygroundComponent,
    ApiTableComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './badge-doc.component.html',
})
export class BadgeDocComponent {
  readonly colors: UiColor[] = ['neutral', 'primary', 'info', 'success', 'warning', 'error'];
  readonly positions: UiBadgePosition[] = ['top-end', 'top-start', 'bottom-end', 'bottom-start'];

  readonly count = signal(5);
  readonly max = signal(99);
  readonly dot = signal(false);
  readonly showZero = signal(false);
  readonly color = signal<UiColor>('error');
  readonly size = signal<UiBadgeSize>('md');
  readonly position = signal<UiBadgePosition>('top-end');
  readonly overlap = signal<UiBadgeOverlap>('circular');

  readonly description = computed(() => `${this.count()} unread notifications`);

  readonly generatedCode = computed(() => {
    const attrs = [`[uiBadge]="${this.count()}"`];
    if (this.max() !== 99) attrs.push(`[uiBadgeMax]="${this.max()}"`);
    if (this.dot()) attrs.push('uiBadgeDot');
    if (this.showZero()) attrs.push('uiBadgeShowZero');
    if (this.color() !== 'error') attrs.push(`uiBadgeColor="${this.color()}"`);
    if (this.size() !== 'md') attrs.push(`uiBadgeSize="${this.size()}"`);
    if (this.position() !== 'top-end') attrs.push(`uiBadgePosition="${this.position()}"`);
    if (this.overlap() !== 'rectangular') attrs.push(`uiBadgeOverlap="${this.overlap()}"`);
    attrs.push(`uiBadgeDescription="${this.description()}"`);
    return `<button uiButton variant="ghost" size="icon" aria-label="Notifications"
        ${attrs.join('\n        ')}>
  <svg>…</svg>
</button>

<!-- inline -->
Inbox <ui-badge [count]="${this.count()}" />`;
  });

  readonly apiRows: ApiRow[] = [
    {
      name: 'uiBadge / count',
      type: 'number | string | null',
      default: 'null',
      description: 'Content. Numbers above max show "{max}+"; 0 is hidden unless showZero.',
    },
    { name: 'uiBadgeMax / max', type: 'number', default: '99', description: 'Overflow threshold.' },
    {
      name: 'uiBadgeShowZero / showZero',
      type: 'boolean',
      default: 'false',
      description: 'Show 0.',
    },
    {
      name: 'uiBadgeDot / dot',
      type: 'boolean',
      default: 'false',
      description: '8px dot without text.',
    },
    {
      name: 'uiBadgeColor / color',
      type: 'UiColor',
      default: "'error'",
      description: 'Fill color.',
    },
    {
      name: 'uiBadgeSize / size',
      type: "'sm' | 'md'",
      default: "'md'",
      description: 'Height 16 / 20px.',
    },
    {
      name: 'uiBadgePosition',
      type: "'top-end' | 'top-start' | 'bottom-end' | 'bottom-start'",
      default: "'top-end'",
      description: 'Corner of the host ([uiBadge] only). Follows the text direction.',
    },
    {
      name: 'uiBadgeOverlap',
      type: "'rectangular' | 'circular'",
      default: "'rectangular'",
      description: 'circular moves the badge onto the edge of round hosts.',
    },
    { name: 'uiBadgeHidden', type: 'boolean', default: 'false', description: 'Hide the badge.' },
    {
      name: 'uiBadgeDescription',
      type: 'string',
      default: "''",
      description:
        'Announced through aria-describedby while visible. The badge itself is aria-hidden.',
    },
  ];
}
