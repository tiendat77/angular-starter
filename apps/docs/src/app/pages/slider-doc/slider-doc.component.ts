import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { UiButtonComponent } from '@libs/ui/button';
import {
  UiErrorDirective,
  UiFormFieldComponent,
  UiHintDirective,
  UiLabelDirective,
} from '@libs/ui/input';
import {
  UiRangeSlider,
  UiRangeSliderValue,
  UiSlider,
  UiSliderColor,
  UiSliderSize,
  UiSliderValueText,
} from '@libs/ui/slider';
import { ApiRow, ApiTableComponent } from '../../shared/api-table/api-table.component';
import { PlaygroundComponent } from '../../shared/playground/playground.component';

type Format = 'none' | 'percent' | 'currency';

const FORMATTERS: Record<Format, UiSliderValueText | undefined> = {
  none: undefined,
  percent: (value) => `${value}%`,
  currency: (value) => `$${value.toLocaleString('en-US')}`,
};

const COLORS: UiSliderColor[] = [
  'neutral',
  'primary',
  'secondary',
  'info',
  'success',
  'warning',
  'error',
];

@Component({
  selector: 'doc-slider',
  imports: [
    JsonPipe,
    FormsModule,
    ReactiveFormsModule,
    UiButtonComponent,
    UiFormFieldComponent,
    UiLabelDirective,
    UiHintDirective,
    UiErrorDirective,
    UiSlider,
    UiRangeSlider,
    PlaygroundComponent,
    ApiTableComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './slider-doc.component.html',
})
export class SliderDocComponent {
  readonly colors = COLORS;

  // Single slider playground
  readonly value = signal<number | null>(40);
  readonly min = signal(0);
  readonly max = signal(100);
  readonly step = signal(1);
  readonly size = signal<UiSliderSize>('md');
  readonly color = signal<UiSliderColor>('primary');
  readonly showTicks = signal(false);
  readonly tickStep = signal<number | null>(null);
  readonly showValue = signal(false);
  readonly disabled = signal(false);
  readonly format = signal<Format>('none');
  readonly displayWith = computed(() => FORMATTERS[this.format()]);

  readonly code = computed(() => {
    const attrs = [
      '[(value)]="volume"',
      this.min() !== 0 ? `[min]="${this.min()}"` : '',
      this.max() !== 100 ? `[max]="${this.max()}"` : '',
      this.step() !== 1 ? `[step]="${this.step()}"` : '',
      this.size() !== 'md' ? `size="${this.size()}"` : '',
      this.color() !== 'primary' ? `color="${this.color()}"` : '',
      this.showTicks() ? 'showTicks' : '',
      this.showTicks() && this.tickStep() ? `[tickStep]="${this.tickStep()}"` : '',
      this.showValue() ? 'showValue' : '',
      this.format() !== 'none' ? '[displayWith]="format"' : '',
      this.disabled() ? 'disabled' : '',
      'ariaLabel="Volume"',
    ].filter(Boolean);
    return `<ui-slider\n  ${attrs.join('\n  ')}\n/>\n<!-- volume = signal<number | null>(40) -->`;
  });

  // Range slider playground
  readonly range = signal<UiRangeSliderValue | null>([20, 60]);
  readonly rangeStep = signal(1);
  readonly rangeGap = signal(0);
  readonly rangeSize = signal<UiSliderSize>('md');
  readonly rangeColor = signal<UiSliderColor>('primary');
  readonly rangeTicks = signal(false);
  readonly rangeShowValue = signal(true);
  readonly rangeDisabled = signal(false);
  readonly rangeFormat = signal<Format>('percent');
  readonly rangeDisplayWith = computed(() => FORMATTERS[this.rangeFormat()]);

  readonly rangeText = computed(() => {
    const range = this.range();
    return range ? `[${range[0]}, ${range[1]}]` : 'null';
  });

  readonly rangeCode = computed(() => {
    const attrs = [
      '[(value)]="range"',
      this.rangeStep() !== 1 ? `[step]="${this.rangeStep()}"` : '',
      this.rangeGap() ? `[minGap]="${this.rangeGap()}"` : '',
      this.rangeSize() !== 'md' ? `size="${this.rangeSize()}"` : '',
      this.rangeColor() !== 'primary' ? `color="${this.rangeColor()}"` : '',
      this.rangeTicks() ? 'showTicks' : '',
      this.rangeShowValue() ? 'showValue' : '',
      this.rangeFormat() !== 'none' ? '[displayWith]="format"' : '',
      this.rangeDisabled() ? 'disabled' : '',
      'ariaLabel="Price range"',
    ].filter(Boolean);
    return `<ui-range-slider\n  ${attrs.join('\n  ')}\n/>\n<!-- range = signal<[number, number] | null>([20, 60]) -->`;
  });

  // Reactive forms example
  readonly orderForm = new FormGroup({
    volume: new FormControl<number | null>(30, { validators: [Validators.min(10)] }),
    price: new FormControl<UiRangeSliderValue | null>([200, 800], {
      validators: [
        (control) => {
          const value = control.value as UiRangeSliderValue | null;
          return value && value[1] - value[0] < 100 ? { narrow: true } : null;
        },
      ],
    }),
  });

  readonly submitted = signal<unknown>(null);

  readonly currency = FORMATTERS.currency;
  readonly percent = FORMATTERS.percent;

  submit(): void {
    this.orderForm.markAllAsTouched();
    if (this.orderForm.valid) {
      this.submitted.set(this.orderForm.value);
    }
  }

  reset(): void {
    this.orderForm.reset({ volume: 30, price: [200, 800] });
    this.submitted.set(null);
  }

  readonly reactiveCode = `form = new FormGroup({
  volume: new FormControl<number | null>(30, { validators: [Validators.min(10)] }),
  price: new FormControl<[number, number] | null>([200, 800]),
});

<form [formGroup]="form">
  <ui-form-field>
    <label uiLabel>Volume</label>
    <ui-slider formControlName="volume" ariaLabel="Volume" [displayWith]="percent" />
    <span uiHint>Pick at least 10%.</span>
  </ui-form-field>

  <ui-form-field>
    <label uiLabel>Price</label>
    <ui-range-slider formControlName="price" ariaLabel="Price" [min]="0" [max]="1000" [step]="50"
      [minGap]="100" showValue [displayWith]="currency" />
  </ui-form-field>

  <!-- the value of the range slider is a [low, high] tuple -->
  {{ form.value | json }}
</form>`;

  readonly commonRows: ApiRow[] = [
    { name: 'min / max', type: 'number', default: '0 / 100', description: 'Ends of the track.' },
    {
      name: 'step',
      type: 'number',
      default: '1',
      description: 'The value moves in multiples of step, counted from min.',
    },
    { name: 'disabled', type: 'boolean', default: 'false', description: 'Also set by the form.' },
    {
      name: 'size',
      type: "'xs' | 'sm' | 'md' | 'lg'",
      default: "'md'",
      description: 'Track and thumb size.',
    },
    {
      name: 'color',
      type: "'neutral' | 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error'",
      default: "'primary'",
      description: 'Colour of the filled part, from the semantic tokens.',
    },
    {
      name: 'showTicks / tickStep',
      type: 'boolean / number',
      default: 'false / step',
      description: 'A tick under the track every tickStep (at most 200 are drawn).',
    },
    {
      name: 'displayWith',
      type: '(value: number) => string',
      description: 'Text of a value: the bubble over a thumb and aria-valuetext.',
    },
    {
      name: 'showValue',
      type: 'boolean',
      default: 'false',
      description: 'Keeps the bubble visible; otherwise it shows on hover, focus and drag.',
    },
    {
      name: 'ariaLabel / ariaLabelledby',
      type: 'string',
      description: 'Accessible name. ariaLabelledby wins.',
    },
    {
      name: 'inputId',
      type: 'string',
      default: 'auto',
      description: 'DOM id of the (first) thumb.',
    },
  ];

  readonly sliderRows: ApiRow[] = [
    {
      name: 'value',
      type: 'model<number | null>',
      description: 'Two-way ([(value)]) and a form control (formControl, ngModel). null shows min.',
    },
    ...this.commonRows,
  ];

  readonly rangeRows: ApiRow[] = [
    {
      name: 'value',
      type: 'model<[number, number] | null>',
      description:
        'Two-way ([(value)]) and a form control: a [low, high] tuple. null shows the whole track.',
    },
    {
      name: 'minGap',
      type: 'number',
      default: '0',
      description: 'Least distance between the thumbs. They never cross.',
    },
    {
      name: 'startLabel / endLabel',
      type: 'string',
      default: "'Minimum' / 'Maximum'",
      description: 'Accessible name of the lower / upper thumb. Use them to localise.',
    },
    ...this.commonRows,
  ];

  readonly keyboardRows: ApiRow[] = [
    {
      name: 'Arrow Right / Up',
      type: 'key',
      description: 'Increase by step (Left in right-to-left).',
    },
    {
      name: 'Arrow Left / Down',
      type: 'key',
      description: 'Decrease by step (Right in right-to-left).',
    },
    { name: 'Page Up / Page Down', type: 'key', description: '10% of the range, in whole steps.' },
    {
      name: 'Home / End',
      type: 'key',
      description:
        "The thumb's lower / upper limit: min / max, or the other thumb of a range slider.",
    },
  ];
}
