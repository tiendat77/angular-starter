import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
} from '@angular/core';
import { cva, UiSize } from '@libs/ui/core';
import { UiRadioGroupComponent } from './radio-group.component';

/**
 * Maps inputs onto the `radio` CSS utilities (`@libs/ui/styles`). `ui-radio` is an ARIA radio
 * (roving tabindex), not a native input, so the checked look is driven by `data-checked`.
 */
export const radioCircleVariants = cva({
  base: 'radio',
  variants: {
    size: {
      xs: 'radio-xs',
      sm: 'radio-sm',
      md: 'radio-md',
      lg: 'radio-lg',
      xl: 'radio-xl',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

/** Host layout, label typography and disabled state of `ui-radio`. */
export const radioVariants = cva({
  base: 'inline-flex items-start gap-2 select-none rounded-md p-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
  variants: {
    size: {
      xs: 'text-xs',
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base',
      xl: 'text-lg',
    },
    disabled: {
      true: 'cursor-not-allowed text-muted-foreground opacity-50 pointer-events-none',
      false: 'cursor-pointer text-foreground',
    },
  },
  defaultVariants: {
    size: 'md',
    disabled: 'false',
  },
});

@Component({
  selector: 'ui-radio',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'radio',
    '[attr.aria-checked]': 'isChecked() ? "true" : "false"',
    '[attr.aria-disabled]': 'isDisabled() ? "true" : null',
    '[attr.tabindex]': 'tabIndex()',
    '[class]': '$hostClass()',
    '(click)': 'select()',
    '(keydown)': 'onKeyDown($event)',
  },
  template: `
    <!-- One text line tall, so the circle stays centered on the first line of the label -->
    <span class="flex h-lh shrink-0 items-center">
      <span
        aria-hidden="true"
        [class]="$circleClass()"
        [attr.data-checked]="isChecked() ? '' : null"
      ></span>
    </span>
    @if (label()) {
      <span>{{ label() }}</span>
    } @else {
      <ng-content />
    }
  `,
})
export class UiRadioComponent {
  // -----------------------------------------------------------------------------------------------------
  // @ Public properties
  // -----------------------------------------------------------------------------------------------------
  readonly value = input.required<any>();
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly label = input<string>();

  // -----------------------------------------------------------------------------------------------------
  // @ Private / Protected properties
  // -----------------------------------------------------------------------------------------------------
  private readonly _group = inject(UiRadioGroupComponent, { optional: true });
  private readonly _elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly isChecked = computed(() => {
    if (!this._group) return false;
    return this._group.value() === this.value();
  });

  readonly isDisabled = computed(() => {
    return this.disabled() || (this._group?.effectiveDisabled() ?? false);
  });

  readonly effectiveSize = computed<UiSize>(() => {
    return this._group?.effectiveSize() ?? 'md';
  });

  readonly tabIndex = computed(() => {
    if (this.isDisabled()) return -1;
    if (!this._group) return 0;
    if (this.isChecked()) return 0;
    if (!this._group.hasCheckedRadio() && this._group.isFirstEnabledRadio(this)) {
      return 0;
    }
    return -1;
  });

  protected readonly $hostClass = computed(() =>
    radioVariants({
      size: this.effectiveSize(),
      disabled: this.isDisabled() ? 'true' : 'false',
    })
  );

  protected readonly $circleClass = computed(() =>
    radioCircleVariants({ size: this.effectiveSize() })
  );

  select(): void {
    if (this.isDisabled() || !this._group) {
      return;
    }
    this._group.selectValue(this.value());
  }

  focus(): void {
    this._elementRef.nativeElement.focus();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Protected methods
  // -----------------------------------------------------------------------------------------------------
  protected onKeyDown(event: KeyboardEvent): void {
    if (this.isDisabled() || !this._group) {
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        event.preventDefault();
        this._group.selectNext(this);
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        event.preventDefault();
        this._group.selectPrevious(this);
        break;
      case ' ':
        event.preventDefault();
        this.select();
        break;
    }
  }
}
