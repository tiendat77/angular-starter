import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  forwardRef,
  inject,
  input,
  model,
  signal,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { UI_CONFIG, UiSize } from '@libs/ui/core';
import { checkboxBoxVariants, checkboxVariants } from './checkbox.variants';

let nextCheckboxId = 0;

@Component({
  selector: 'ui-checkbox',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'inline-flex align-top',
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UiCheckboxComponent),
      multi: true,
    },
  ],
  template: `
    <label
      [class]="$rootClass()"
      [attr.for]="$effectiveId()"
    >
      <!-- One text line tall, so the box stays centered on the first line of the label -->
      <span class="flex h-lh shrink-0 items-center">
        <input
          #inputRef
          type="checkbox"
          [class]="$boxClass()"
          [id]="$effectiveId()"
          [checked]="checked()"
          [disabled]="$effectiveDisabled()"
          (change)="onInputChange($event)"
          (blur)="onBlur()"
        />
      </span>
      @if (label()) {
        <span>{{ label() }}</span>
      } @else {
        <ng-content />
      }
    </label>
  `,
})
export class UiCheckboxComponent implements ControlValueAccessor {
  // -----------------------------------------------------------------------------------------------------
  // @ Public properties
  // -----------------------------------------------------------------------------------------------------
  readonly checked = model<boolean>(false);
  readonly indeterminate = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly size = input<UiSize>('md');
  readonly label = input<string>();
  readonly id = input<string>();

  // -----------------------------------------------------------------------------------------------------
  // @ Private / Protected properties
  // -----------------------------------------------------------------------------------------------------
  protected readonly _inputRef = viewChild<ElementRef<HTMLInputElement>>('inputRef');
  private readonly _autoId = `ui-checkbox-${++nextCheckboxId}`;
  private readonly _cvaDisabled$ = signal(false);
  private readonly _uiConfig = inject(UI_CONFIG, { optional: true });

  private _onChange: (value: boolean) => void = () => undefined;
  private _onTouched: () => void = () => undefined;

  protected readonly $effectiveDisabled = computed(() => this.disabled() || this._cvaDisabled$());
  protected readonly $effectiveId = computed(() => this.id() || this._autoId);
  protected readonly $effectiveSize = computed(
    () => this.size() ?? this._uiConfig?.defaultSize ?? 'md'
  );

  protected readonly $rootClass = computed(() =>
    checkboxVariants({
      size: this.$effectiveSize(),
      disabled: this.$effectiveDisabled() ? 'true' : 'false',
    })
  );

  protected readonly $boxClass = computed(() =>
    checkboxBoxVariants({ size: this.$effectiveSize() })
  );

  constructor() {
    effect(() => {
      const isIndeterminate = this.indeterminate();
      const inputEl = this._inputRef()?.nativeElement;
      if (inputEl) {
        inputEl.indeterminate = isIndeterminate;
      }
    });
  }

  // -----------------------------------------------------------------------------------------------------
  // @ ControlValueAccessor
  // -----------------------------------------------------------------------------------------------------
  writeValue(value: boolean): void {
    this.checked.set(Boolean(value));
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this._cvaDisabled$.set(isDisabled);
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Protected methods
  // -----------------------------------------------------------------------------------------------------
  protected onInputChange(event: Event): void {
    if (this.$effectiveDisabled()) {
      return;
    }
    const inputEl = event.target as HTMLInputElement;
    const isChecked = inputEl.checked;
    this.checked.set(isChecked);
    this._onChange(isChecked);
    this._onTouched();
  }

  protected onBlur(): void {
    this._onTouched();
  }
}
