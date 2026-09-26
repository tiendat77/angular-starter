import {
  computed,
  DestroyRef,
  Directive,
  forwardRef,
  inject,
  Injector,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NgControl } from '@angular/forms';
import { UI_CONFIG, UiFormFieldControl, UiSize } from '@libs/ui/core';
import { textareaVariants, UiFormFieldAppearance } from './input.variants';

let nextTextareaId = 0;

/**
 * Applies the design system's text-field visual treatment to a native
 * `<textarea>` and bridges it into Angular forms via `ControlValueAccessor`.
 *
 * Mirrors `UiInputDirective` exactly, aside from targeting `<textarea>` and
 * using `textareaVariants` (resizable, height-based rather than fixed-height
 * sizing).
 */
@Directive({
  selector: 'textarea[uiTextarea]',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UiTextareaDirective),
      multi: true,
    },
    { provide: UiFormFieldControl, useExisting: forwardRef(() => UiTextareaDirective) },
  ],
  host: {
    '[class]': 'hostClass()',
    '[id]': 'id',
    '[disabled]': '$disabled()',
    '(input)': 'onInput($event)',
    '(blur)': 'onBlur()',
    '(focus)': 'onFocus()',
  },
})
export class UiTextareaDirective
  extends UiFormFieldControl<string>
  implements ControlValueAccessor, OnInit
{
  private readonly _uiConfig = inject(UI_CONFIG, { optional: true });
  private readonly _injector = inject(Injector);
  private readonly _destroyRef = inject(DestroyRef);

  /**
   * Resolved lazily in `ngOnInit` rather than injected at field/constructor
   * time: this directive is itself the `NG_VALUE_ACCESSOR` for the host
   * element, so eagerly self-injecting `NgControl` during construction
   * (which needs the value accessor to construct) forms a circular
   * dependency (`NG0200`). By `ngOnInit`, every directive on this element
   * has already finished constructing, so the lookup is safe.
   */
  private _ngControl: NgControl | null = null;

  readonly id = `ui-textarea-${nextTextareaId++}`;

  readonly appearance = input<UiFormFieldAppearance>(
    this._uiConfig?.formField?.appearance ?? 'outline'
  );
  readonly size = input<UiSize>((this._uiConfig?.defaultSize as UiSize | undefined) ?? 'md');

  private readonly _value = signal<string | null>(null);
  private readonly _disabled = signal(false);
  private readonly _focused = signal(false);

  readonly $value = this._value.asReadonly();
  readonly $disabled = this._disabled.asReadonly();
  readonly $focused = this._focused.asReadonly();

  /**
   * `NgControl.invalid`/`.touched`/`.dirty` are plain getters that read
   * their backing signals through `untracked()` (by Angular's own design,
   * so incidental reads elsewhere don't create surprise reactive
   * dependencies) — so they can't be read inside a `computed()` here and
   * expected to invalidate it. Instead, `$invalid` is a plain signal kept
   * in sync by subscribing to the bound control's `events`, which fires on
   * every value/status/touched change (including a bare `markAsTouched()`
   * call, with no DOM interaction).
   */
  private readonly _invalid = signal(false);
  readonly $invalid = this._invalid.asReadonly();

  protected readonly hostClass = computed(() =>
    textareaVariants({ appearance: this.appearance(), size: this.size() })
  );

  private _onChange: (value: string) => void = () => undefined;
  private _onTouched: () => void = () => undefined;

  ngOnInit(): void {
    this._ngControl = this._injector.get(NgControl, null, { optional: true, self: true });
    const control = this._ngControl?.control;
    if (!control) {
      return;
    }

    this._updateInvalid();
    control.events
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(() => this._updateInvalid());
  }

  private _updateInvalid(): void {
    const ngControl = this._ngControl;
    this._invalid.set(!!ngControl?.invalid && !!(ngControl.touched || ngControl.dirty));
  }

  writeValue(value: string | null): void {
    this._value.set(value ?? null);
  }

  registerOnChange(fn: (value: string) => void): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this._disabled.set(isDisabled);
  }

  protected onInput(event: Event): void {
    const value = (event.target as HTMLTextAreaElement).value;
    this._value.set(value);
    this._onChange(value);
  }

  protected onBlur(): void {
    this._focused.set(false);
    this._onTouched();
  }

  protected onFocus(): void {
    this._focused.set(true);
  }
}
