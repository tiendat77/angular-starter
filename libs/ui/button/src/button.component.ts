import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
} from '@angular/core';
import { UI_CONFIG } from '@libs/ui/core';
import { buttonVariants } from './button.variants';
import { UiButtonSize, UiButtonVariant } from './types';

/**
 * Applies the design system's button visual treatment and accessible
 * disabled/loading behavior to a native `<button>` or `<a>` element.
 *
 * While `loading()` is true a spinner is rendered before the content and the
 * button is treated exactly like `disabled()`.
 *
 * `<a>` elements have no native `disabled` DOM property, so this component
 * also intercepts the host `click` event and prevents/stops it while
 * disabled or loading — covering both button-inside-form submission and
 * anchor navigation.
 */
@Component({
  // Attribute selector keeps native <button>/<a> semantics (focus, form submit, href)
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'button[uiButton], a[uiButton]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'hostClass()',
    '[attr.aria-busy]': 'loading() ? "true" : null',
    '[attr.aria-disabled]': 'isDisabled() ? "true" : null',
    '[attr.disabled]': 'isButtonElement && isDisabled() ? "" : null',
    '(click)': 'onHostClick($event)',
  },
  template: `
    @if (loading()) {
      <span
        aria-hidden="true"
        class="size-[1em] animate-spin rounded-full border-2 border-current border-r-transparent"
      ></span>
    }
    <ng-content />
  `,
})
export class UiButtonComponent {
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

  protected readonly isDisabled = computed(() => this.disabled() || this.loading());

  protected readonly hostClass = computed(() =>
    buttonVariants({
      variant: this.variant(),
      size: this.size(),
      fullWidth: this.fullWidth() ? 'true' : 'false',
    })
  );

  protected onHostClick(event: Event): void {
    if (this.isDisabled()) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }
}
