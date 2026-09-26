import { booleanAttribute, computed, Directive, ElementRef, inject, input } from '@angular/core';
import { UI_CONFIG } from '@libs/ui/core';
import { buttonVariants } from './button.variants';
import { UiButtonSize, UiButtonVariant } from './types';

/**
 * Applies the design system's button visual treatment and accessible
 * disabled/loading behavior to a native `<button>` or `<a>` element.
 *
 * `<a>` elements have no native `disabled` DOM property, so this directive
 * also intercepts the host `click` event and prevents/stops it while
 * `disabled()` is true — covering both button-inside-form submission and
 * anchor navigation.
 */
@Directive({
  selector: 'button[uiButton], a[uiButton]',
  host: {
    '[class]': 'hostClass()',
    '[attr.aria-busy]': 'loading() ? "true" : null',
    '[attr.aria-disabled]': 'disabled() ? "true" : null',
    '[attr.disabled]': 'isButtonElement && disabled() ? "" : null',
    '(click)': 'onHostClick($event)',
  },
})
export class UiButtonDirective {
  private readonly _uiConfig = inject(UI_CONFIG, { optional: true });
  private readonly _elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  /** Only `<button>` supports the native `disabled` DOM property/attribute. */
  protected readonly isButtonElement = this._elementRef.nativeElement.tagName === 'BUTTON';

  readonly variant = input<UiButtonVariant>(
    (this._uiConfig?.button?.defaultVariant as UiButtonVariant | undefined) ?? 'primary'
  );
  readonly size = input<UiButtonSize>(
    (this._uiConfig?.button?.defaultSize as UiButtonSize | undefined) ?? 'md'
  );
  readonly loading = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly fullWidth = input(false, { transform: booleanAttribute });

  protected readonly hostClass = computed(() =>
    buttonVariants({
      variant: this.variant(),
      size: this.size(),
      fullWidth: this.fullWidth() ? 'true' : 'false',
    })
  );

  protected onHostClick(event: Event): void {
    if (this.disabled()) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }
}
