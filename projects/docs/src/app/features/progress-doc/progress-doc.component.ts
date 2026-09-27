import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UiButtonComponent } from '@libs/ui/button';
import { UiColor } from '@libs/ui/core';
import {
  UiProgressBarComponent,
  UiProgressBarSize,
  UiSpinnerComponent,
  UiSpinnerSize,
} from '@libs/ui/progress';
import { ApiRow, ApiTableComponent } from '../../shared/api-table/api-table.component';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';
import { PlaygroundComponent } from '../../shared/playground/playground.component';

type ProgressKind = 'spinner' | 'bar';

@Component({
  selector: 'doc-progress',
  imports: [
    FormsModule,
    UiButtonComponent,
    UiSpinnerComponent,
    UiProgressBarComponent,
    PlaygroundComponent,
    ApiTableComponent,
    CodeBlockComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './progress-doc.component.html',
})
export class ProgressDocComponent {
  readonly colors: UiColor[] = ['neutral', 'primary', 'info', 'success', 'warning', 'error'];
  readonly spinnerSizes: UiSpinnerSize[] = ['inherit', 'xs', 'sm', 'md', 'lg', 'xl'];
  readonly barSizes: UiProgressBarSize[] = ['sm', 'md', 'lg'];

  readonly kind = signal<ProgressKind>('spinner');
  readonly determinate = signal(false);
  readonly value = signal(42);
  readonly spinnerSize = signal<UiSpinnerSize>('lg');
  readonly barSize = signal<UiProgressBarSize>('md');
  readonly color = signal<UiColor>('primary');
  readonly showValue = signal(true);

  readonly currentValue = computed(() => (this.determinate() ? this.value() : null));

  readonly generatedCode = computed(() => {
    const attrs: string[] = [];
    if (this.determinate()) attrs.push(`[value]="${this.value()}"`);
    if (this.kind() === 'spinner') {
      if (this.color() !== 'neutral') attrs.push(`color="${this.color()}"`);
      if (this.spinnerSize() !== 'inherit') attrs.push(`size="${this.spinnerSize()}"`);
      if (this.determinate() && this.showValue()) attrs.push('showValue');
      return `<ui-spinner ${attrs.join(' ')} />`;
    }
    if (this.color() !== 'primary') attrs.push(`color="${this.color()}"`);
    if (this.barSize() !== 'md') attrs.push(`size="${this.barSize()}"`);
    return `<ui-progress-bar ${attrs.join(' ')} />`;
  });

  readonly buttonCode = `<button uiButton loading>Saving</button>

<!-- or inline, sized to the text -->
<p>Syncing <ui-spinner /></p>`;

  readonly labelledBarCode = `<div class="flex justify-between text-sm">
  <span>Uploading report.pdf</span>
  <span>{{ uploaded() }}%</span>
</div>
<ui-progress-bar [value]="uploaded()" label="Uploading report.pdf" />`;

  readonly spinnerRows: ApiRow[] = [
    {
      name: 'value',
      type: 'number | null',
      default: 'null',
      description: 'null spins (indeterminate); a number fills the ring to value / max.',
    },
    { name: 'max', type: 'number', default: '100', description: 'Upper bound of value.' },
    {
      name: 'size',
      type: "'inherit' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'",
      default: "'inherit'",
      description: 'inherit is 1em, so the spinner scales with the surrounding text.',
    },
    {
      name: 'color',
      type: "UiColor | 'current'",
      default: "'current'",
      description: 'current uses the text color.',
    },
    {
      name: 'strokeWidth',
      type: 'number | null',
      default: 'per size',
      description: 'Stroke width in 24×24 viewBox units.',
    },
    {
      name: 'showValue',
      type: 'boolean',
      default: 'false',
      description: 'Shows the percentage in the center (determinate, lg and xl only).',
    },
    { name: 'label', type: 'string', default: "'Loading'", description: 'aria-label.' },
  ];

  readonly barRows: ApiRow[] = [
    {
      name: 'value',
      type: 'number | null',
      default: 'null',
      description: 'null is indeterminate.',
    },
    { name: 'max', type: 'number', default: '100', description: 'Upper bound of value.' },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      default: "'md'",
      description: 'Track height 4 / 8 / 12px.',
    },
    {
      name: 'color',
      type: 'UiColor',
      default: "'primary'",
      description: 'Fill color; the track is a 20% tint.',
    },
    { name: 'label', type: 'string', default: "'Progress'", description: 'aria-label.' },
  ];
}
