import { Directionality } from '@angular/cdk/bidi';
import {
  AfterContentInit,
  booleanAttribute,
  computed,
  DestroyRef,
  Directive,
  ElementRef,
  inject,
  Injector,
  input,
  numberAttribute,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { UiFormFieldControl } from '@libs/ui/core';
import { UiSliderThumb } from './slider-thumb.component';
import { UiSliderColor, UiSliderSize, UiSliderValueText } from './slider.types';
import { fromRatio, pageStepOf, tickValues, toPercent } from './slider.utils';
import { sliderVariants } from './slider.variants';

let nextSliderId = 0;

interface Drag {
  pointerId: number;
  /** Which thumb, or `null` until the first move when two thumbs share a value. */
  index: number | null;
  /** Where the thumb was grabbed, so it does not jump under the pointer. */
  offset: number;
}

/**
 * What `UiSlider` and `UiRangeSlider` share: the inputs, the form plumbing (CVA, form field, touched
 * and invalid state) and the pointer handling of the track. A subclass says what its value is
 * (`_thumbValues`, `_setThumb`, `_fillRange`) and renders the thumbs.
 */
@Directive({
  host: {
    '[class]': '$hostClass()',
    '(focusin)': 'onFocusIn()',
    '(focusout)': 'onFocusOut($event)',
  },
})
export abstract class UiSliderBase<V>
  extends UiFormFieldControl<V | null>
  implements ControlValueAccessor, AfterContentInit
{
  private readonly _injector = inject(Injector);
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly _directionality = inject(Directionality, { optional: true });

  /** Resolved in `ngAfterContentInit`, see `UiOtpInput` for why not earlier. */
  private _ngControl: NgControl | null = null;
  private readonly _autoId = `ui-slider-${nextSliderId++}`;

  readonly min = input(0, { transform: (value: unknown) => numberAttribute(value, 0) });
  readonly max = input(100, { transform: (value: unknown) => numberAttribute(value, 100) });
  readonly step = input(1, { transform: (value: unknown) => numberAttribute(value, 1) });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly size = input<UiSliderSize>('md');
  readonly color = input<UiSliderColor>('primary');
  /** Draws a tick under the track every `tickStep`. */
  readonly showTicks = input(false, { transform: booleanAttribute });
  /** Distance between two ticks; defaults to `step`. */
  readonly tickStep = input<number | null, unknown>(null, {
    transform: (value: unknown) => {
      const step = numberAttribute(value, 0);
      return step > 0 ? step : null;
    },
  });
  /** Text of a value, for the bubble over a thumb and for `aria-valuetext`. */
  readonly displayWith = input<UiSliderValueText>();
  /** Keeps the value bubble visible (otherwise it shows on hover, focus and drag). */
  readonly showValue = input(false, { transform: booleanAttribute });
  /** Accessible name; ignored when `ariaLabelledby` is set. */
  readonly ariaLabel = input<string>();
  readonly ariaLabelledby = input<string>();
  /** DOM id of the (first) thumb. */
  readonly inputId = input<string>();

  private readonly _rail = viewChild.required<ElementRef<HTMLElement>>('rail');
  protected readonly _thumbs = viewChildren(UiSliderThumb);

  private readonly _cvaDisabled = signal(false);
  private readonly _focused = signal(false);
  private readonly _invalid = signal(false);
  private readonly _describedBy = signal<string | null>(null);
  /** The thumb a pointer is dragging. */
  protected readonly _dragging = signal<number | null>(null);
  private _drag: Drag | null = null;

  protected _onChange: (value: V | null) => void = () => undefined;
  protected _onTouched: () => void = () => undefined;

  readonly $disabled = computed(() => this.disabled() || this._cvaDisabled());
  readonly $focused = this._focused.asReadonly();
  readonly $invalid = this._invalid.asReadonly();
  protected readonly $describedBy = this._describedBy.asReadonly();

  /** The range of the track, guarded against a `max` below `min`. */
  protected readonly $min = computed(() => this.min());
  protected readonly $max = computed(() => Math.max(this.max(), this.min()));
  protected readonly $step = computed(() => (this.step() > 0 ? this.step() : 1));
  protected readonly $pageStep = computed(() => pageStepOf(this.$min(), this.$max(), this.$step()));
  protected readonly $ticks = computed(() =>
    this.showTicks() ? tickValues(this.$min(), this.$max(), this.tickStep() ?? this.$step()) : []
  );

  protected readonly $hostClass = computed(() =>
    sliderVariants({
      size: this.size(),
      color: this.color(),
      ticks: this.showTicks() ? 'true' : 'false',
      valued: this.showValue() ? 'true' : 'false',
      disabled: this.$disabled() ? 'true' : 'false',
      invalid: this.$invalid() ? 'true' : 'false',
    })
  );

  get id(): string {
    return this.inputId() ?? this._autoId;
  }

  /** The first thumb is what `ui-form-field` flags as invalid and describes. */
  override readonly ariaTarget = computed(() => this._thumbs()[0]?.element);

  // What a subclass provides --------------------------------------------------------------------

  /** The value of every thumb, in order (one or two). */
  protected abstract _thumbValues(): readonly number[];

  /** The user moved a thumb to `raw` (not snapped yet): snap, constrain, store and notify. */
  protected abstract _setThumb(index: number, raw: number): void;

  /** The part of the track that is filled, as two values. */
  protected abstract _fillRange(): readonly [number, number];

  abstract writeValue(value: V | null | undefined): void;

  // ControlValueAccessor ------------------------------------------------------------------------

  ngAfterContentInit(): void {
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

  registerOnChange(fn: (value: V | null) => void): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this._cvaDisabled.set(isDisabled);
  }

  override setDescribedByIds(ids: string[]): void {
    this._describedBy.set(ids.length ? ids.join(' ') : null);
  }

  // Template helpers ----------------------------------------------------------------------------

  protected percentOf(value: number): number {
    return toPercent(value, this.$min(), this.$max());
  }

  protected fillStart(): number {
    return this.percentOf(this._fillRange()[0]);
  }

  protected fillEnd(): number {
    return this.percentOf(this._fillRange()[1]);
  }

  protected tickActive(tick: number): boolean {
    const [from, to] = this._fillRange();
    return tick >= from && tick <= to;
  }

  protected valueText(value: number): string | null {
    return this.displayWith()?.(value) ?? null;
  }

  protected bubbleText(value: number): string {
    return this.displayWith()?.(value) ?? String(value);
  }

  protected isRtl(): boolean {
    return this._directionality?.value === 'rtl';
  }

  // Focus ---------------------------------------------------------------------------------------

  protected onFocusIn(): void {
    this._focused.set(true);
  }

  protected onFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget as Node | null;
    if (next && this._host.nativeElement.contains(next)) {
      return;
    }
    this._focused.set(false);
    this._onTouched();
  }

  // Pointer -------------------------------------------------------------------------------------

  protected onPointerDown(event: PointerEvent): void {
    if (this.$disabled() || event.button !== 0 || event.isPrimary === false) {
      return;
    }
    const rail = this._rail().nativeElement.getBoundingClientRect();
    if (!rail.width) {
      return;
    }

    const pointer = this._valueAt(event.clientX, rail);
    const values = this._thumbValues();
    const target = event.target as HTMLElement;
    const grabbed = this._thumbs().findIndex((thumb) => thumb.element.contains(target));
    const together = values.length === 2 && values[0] === values[1];

    let index: number | null;
    if (values.length === 1) {
      index = 0;
    } else if (grabbed >= 0 && !together) {
      index = grabbed;
    } else if (together) {
      // Both thumbs are at the same value: the side of the press, or else the first move, decides
      index = pointer < values[0] ? 0 : pointer > values[0] ? 1 : null;
    } else {
      index = Math.abs(pointer - values[0]) <= Math.abs(pointer - values[1]) ? 0 : 1;
    }

    // A press on a thumb keeps the grab point; a press on the track moves the thumb to it
    const offset = grabbed >= 0 && index !== null ? pointer - values[index] : 0;
    this._drag = { pointerId: event.pointerId, index, offset };
    (event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId);
    event.preventDefault();

    if (index !== null) {
      this._grab(index);
      this._setThumb(index, pointer - offset);
    }
  }

  protected onPointerMove(event: PointerEvent): void {
    const drag = this._drag;
    if (!drag || drag.pointerId !== event.pointerId) {
      return;
    }
    const rail = this._rail().nativeElement.getBoundingClientRect();
    const pointer = this._valueAt(event.clientX, rail) - drag.offset;

    if (drag.index === null) {
      const at = this._thumbValues()[0];
      if (pointer === at) {
        return;
      }
      drag.index = pointer > at ? 1 : 0;
      this._grab(drag.index);
    }
    this._setThumb(drag.index, pointer);
  }

  protected onPointerEnd(event: PointerEvent): void {
    if (this._drag && this._drag.pointerId === event.pointerId) {
      this._drag = null;
      this._dragging.set(null);
    }
  }

  private _grab(index: number): void {
    this._dragging.set(index);
    this._thumbs()[index]?.element.focus({ preventScroll: true });
  }

  /** The value under a horizontal position of the screen. */
  private _valueAt(clientX: number, rail: DOMRect): number {
    const ratio = this.isRtl()
      ? (rail.right - clientX) / rail.width
      : (clientX - rail.left) / rail.width;
    return fromRatio(ratio, this.$min(), this.$max());
  }

  private _updateInvalid(): void {
    const ngControl = this._ngControl;
    this._invalid.set(!!ngControl?.invalid && !!ngControl.touched);
  }
}
