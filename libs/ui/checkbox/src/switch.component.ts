import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  inject,
  input,
  model,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { cn, UI_CONFIG, UiSize } from '@libs/ui/core';
import {
  switchThumbTranslateMap,
  switchThumbVariants,
  switchTrackVariants,
  switchVariants,
} from './checkbox.variants';

let nextSwitchId = 0;

@Component({
  selector: 'ui-switch',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UiSwitchComponent),
      multi: true,
    },
  ],
  template: `
    <div [class]="$rootClass()">
      <button
        type="button"
        role="switch"
        [id]="$effectiveId()"
        [attr.aria-checked]="checked() ? 'true' : 'false'"
        [attr.aria-disabled]="$effectiveDisabled() ? 'true' : null"
        [disabled]="$effectiveDisabled()"
        [class]="$trackClass()"
        (click)="toggle()"
        (blur)="onBlur()"
      >
        <span
          aria-hidden="true"
          [class]="$thumbClass()"
        ></span>
      </button>
      @if (label()) {
        <label
          [attr.for]="$effectiveId()"
          [class]="$labelClass()"
        >
          {{ label() }}
        </label>
      } @else {
        <ng-content />
      }
    </div>
  `,
})
export class UiSwitchComponent implements ControlValueAccessor {
  // -----------------------------------------------------------------------------------------------------
  // @ Public properties
  // -----------------------------------------------------------------------------------------------------
  readonly checked = model<boolean>(false);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly size = input<UiSize>('md');
  readonly label = input<string>();
  readonly id = input<string>();

  // -----------------------------------------------------------------------------------------------------
  // @ Private / Protected properties
  // -----------------------------------------------------------------------------------------------------
  private readonly _autoId = `ui-switch-${++nextSwitchId}`;
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
    switchVariants({
      disabled: this.$effectiveDisabled() ? 'true' : 'false',
    })
  );

  protected readonly $trackClass = computed(() =>
    switchTrackVariants({
      size: this.$effectiveSize(),
      checked: this.checked() ? 'true' : 'false',
    })
  );

  protected readonly $thumbClass = computed(() =>
    cn(
      switchThumbVariants({
        size: this.$effectiveSize(),
        checked: this.checked() ? 'true' : 'false',
      }),
      this.checked() && switchThumbTranslateMap[this.$effectiveSize()]
    )
  );

  protected readonly $labelClass = computed(() =>
    cn(
      'cursor-pointer text-foreground select-none',
      this.$effectiveSize() === 'xs' && 'text-xs',
      this.$effectiveSize() === 'sm' && 'text-xs',
      this.$effectiveSize() === 'md' && 'text-sm',
      this.$effectiveSize() === 'lg' && 'text-base',
      this.$effectiveSize() === 'xl' && 'text-lg'
    )
  );

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
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------
  toggle(): void {
    if (this.$effectiveDisabled()) {
      return;
    }
    const next = !this.checked();
    this.checked.set(next);
    this._onChange(next);
    this._onTouched();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Protected methods
  // -----------------------------------------------------------------------------------------------------
  protected onBlur(): void {
    this._onTouched();
  }
}
