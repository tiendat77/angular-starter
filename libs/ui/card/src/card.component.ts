import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
} from '@angular/core';
import { UiCardAppearance, UiCardPadding } from './card.types';
import { cardVariants } from './card.variants';

/**
 * Surface for grouped content. Works as `<ui-card>` or on a semantic host (`article[uiCard]`,
 * `a[uiCard]`, `button[uiCard]`). Links and buttons get the interactive look automatically.
 */
@Component({
  // Attribute form keeps native <a>/<button>/<article> semantics

  selector: 'ui-card, [uiCard]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'hostClass()' },
  template: '<ng-content />',
})
export class UiCardComponent {
  private readonly _tagName = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement.tagName;

  readonly appearance = input<UiCardAppearance>('outline');
  readonly padding = input<UiCardPadding>('md');
  readonly interactive = input(false, { transform: booleanAttribute });

  protected readonly hostClass = computed(() =>
    cardVariants({
      appearance: this.appearance(),
      padding: this.padding(),
      interactive:
        this.interactive() || this._tagName === 'A' || this._tagName === 'BUTTON'
          ? 'true'
          : 'false',
    })
  );
}
