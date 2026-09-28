import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, TemplateRef, computed, signal } from '@angular/core';
import { UiColor } from '@libs/ui/core';
import { UiTooltipContent, UiTooltipPosition, UiTooltipSize } from './tooltip.types';
import { tooltipVariants } from './tooltip.variants';

@Component({
  selector: 'ui-tooltip',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet],
  template: `
    <div
      role="tooltip"
      [id]="id()"
      [class]="classes()"
      [attr.data-placement]="placement()"
    >
      @if (isTemplate(content())) {
        <ng-container *ngTemplateOutlet="asTemplate(content())" />
      } @else {
        {{ content() }}
      }
      @if (arrow()) {
        <span
          class="tooltip-arrow"
          aria-hidden="true"
        ></span>
      }
    </div>
  `,
})
export class UiTooltipComponent {
  readonly id = signal<string>('');
  readonly content = signal<UiTooltipContent>(null);
  readonly color = signal<UiColor>('neutral');
  readonly size = signal<UiTooltipSize>('md');
  readonly arrow = signal<boolean>(true);
  readonly interactive = signal<boolean>(false);
  readonly placement = signal<UiTooltipPosition>('top');

  readonly classes = computed(() =>
    tooltipVariants({
      color: this.color(),
      size: this.size(),
      interactive: this.interactive(),
    })
  );

  isTemplate(val: unknown): val is TemplateRef<unknown> {
    return val instanceof TemplateRef;
  }

  asTemplate(val: unknown): TemplateRef<unknown> {
    return val as TemplateRef<unknown>;
  }
}
