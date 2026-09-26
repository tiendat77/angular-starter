import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
} from '@angular/core';
import { cn, cva, UiSize } from '@libs/ui/core';
import { UiRadioGroupComponent } from './radio-group.component';

export const radioCircleVariants = cva({
  base: 'inline-flex items-center justify-center shrink-0 rounded-full border border-border transition-colors duration-150',
  variants: {
    size: {
      xs: 'h-3.5 w-3.5',
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6',
      xl: 'h-7 w-7',
    },
    checked: {
      true: 'border-primary bg-primary text-primary-content',
      false: 'bg-background hover:bg-muted',
    },
  },
  defaultVariants: {
    size: 'md',
    checked: 'false',
  },
});

export const radioDotVariants = cva({
  base: 'rounded-full bg-background',
  variants: {
    size: {
      xs: 'h-1.5 w-1.5',
      sm: 'h-1.5 w-1.5',
      md: 'h-2 w-2',
      lg: 'h-2.5 w-2.5',
      xl: 'h-3 w-3',
    },
  },
  defaultVariants: {
    size: 'md',
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
    <span
      aria-hidden="true"
      [class]="$circleClass()"
    >
      @if (isChecked()) {
        <span [class]="$dotClass()"></span>
      }
    </span>
    @if (label()) {
      <span [class]="$labelClass()">{{ label() }}</span>
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
    cn(
      'inline-flex items-center gap-2 select-none cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary rounded-md p-0.5',
      this.isDisabled() && 'cursor-not-allowed opacity-50 pointer-events-none'
    )
  );

  protected readonly $circleClass = computed(() =>
    radioCircleVariants({
      size: this.effectiveSize(),
      checked: this.isChecked() ? 'true' : 'false',
    })
  );

  protected readonly $dotClass = computed(() =>
    radioDotVariants({
      size: this.effectiveSize(),
    })
  );

  protected readonly $labelClass = computed(() =>
    cn(
      'text-foreground',
      this.effectiveSize() === 'xs' && 'text-xs',
      this.effectiveSize() === 'sm' && 'text-xs',
      this.effectiveSize() === 'md' && 'text-sm',
      this.effectiveSize() === 'lg' && 'text-base',
      this.effectiveSize() === 'xl' && 'text-lg'
    )
  );

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------
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
