import { DOCUMENT } from '@angular/common';
import {
  AfterContentInit,
  afterNextRender,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  forwardRef,
  inject,
  Injector,
  input,
  numberAttribute,
  output,
  signal,
  viewChildren,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NgControl } from '@angular/forms';
import { UI_CONFIG, UiFormFieldControl } from '@libs/ui/core';
import { UiOtpFormatter, UiOtpInputSize, UiOtpSlotLabelFn } from './otp-input.types';
import { createCharFilter, overwriteAt, parseChars, removeAt } from './otp-input.utils';
import { otpSlotVariants } from './otp-input.variants';

let nextOtpInputId = 0;

const DEFAULT_MASK_CHAR = '•';

/**
 * One-time-code input made of single-character slots, each a native `<input>`.
 *
 * The form value is always a string of at most `length` characters, filled left to right with no
 * gaps (`''` → `'12'` → `'123456'`). Typing, SMS autofill and paste share one code path: whatever
 * text arrives is passed through the formatter and written from the edited slot onward, which is
 * why slots carry no `maxlength` (an OS autofill drops the whole code into a single slot).
 *
 * Works on its own (use `(completed)` or any forms directive) and inside `ui-form-field`, which
 * finds it through `UiFormFieldControl`.
 */
@Component({
  selector: 'ui-otp-input',
  exportAs: 'uiOtpInput',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => UiOtpInput), multi: true },
    { provide: UiFormFieldControl, useExisting: forwardRef(() => UiOtpInput) },
  ],
  host: {
    class: 'inline-flex gap-2',
    role: 'group',
    '[attr.aria-label]': 'ariaLabelledby() ? null : ariaLabel()',
    '[attr.aria-labelledby]': 'ariaLabelledby() || null',
    '(focusin)': 'onFocusIn()',
    '(focusout)': 'onFocusOut($event)',
  },
  template: `
    @for (i of $slots(); track i) {
      <input
        #slot
        type="text"
        autocomplete="one-time-code"
        autocapitalize="off"
        autocorrect="off"
        spellcheck="false"
        [class]="$slotClass()"
        [id]="slotId(i)"
        [attr.inputmode]="$inputMode()"
        [attr.tabindex]="i === $activeIndex() ? 0 : -1"
        [attr.aria-label]="slotLabel()(i + 1, length())"
        [attr.aria-invalid]="$invalid() ? 'true' : null"
        [attr.aria-describedby]="$describedBy()"
        [disabled]="$disabled()"
        [value]="display(i)"
        (input)="onInput(i, $event)"
        (keydown)="onKeydown(i, $event)"
        (paste)="onPaste(i, $event)"
        (focus)="onSlotFocus(i, $event)"
        (click)="onSlotClick($event)"
      />
    }
  `,
})
export class UiOtpInput
  extends UiFormFieldControl<string>
  implements ControlValueAccessor, AfterContentInit
{
  private readonly _uiConfig = inject(UI_CONFIG, { optional: true });
  private readonly _injector = inject(Injector);
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _document = inject(DOCUMENT);
  private readonly _host = inject<ElementRef<HTMLElement>>(ElementRef);

  /**
   * Resolved in `ngAfterContentInit`: not at construction, because this component is itself the
   * `NG_VALUE_ACCESSOR` for its host so self-injecting `NgControl` there would be circular
   * (`NG0200`); and not in `ngOnInit`, because the component's hooks run before those of the
   * `NgControl` directive on the same element, and `formControlName` only creates its `control`
   * in its own `ngOnChanges`.
   */
  private _ngControl: NgControl | null = null;

  private readonly _autoId = `ui-otp-input-${nextOtpInputId++}`;

  /** Number of slots. */
  readonly length = input(6, { transform: numberAttribute });
  /** Which characters are accepted (and optionally how they are transformed). */
  readonly formatter = input<UiOtpFormatter>('numeric');
  /** Hides entered characters; `true` shows `•`, a string shows its first character. */
  readonly mask = input<boolean | string>(false);
  readonly size = input<UiOtpInputSize>(this._defaultSize());
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Focuses the first empty slot once rendered. */
  readonly autoFocus = input(false, { transform: booleanAttribute });
  /** Overrides the virtual keyboard hint, which is `numeric` only for the `numeric` formatter. */
  readonly inputMode = input<string>();
  /** DOM id of the first slot, so a plain `<label for>` focuses the control. */
  readonly inputId = input<string>();
  /** Accessible name of the group; ignored when `ariaLabelledby` is set. */
  readonly ariaLabel = input('OTP verification code');
  /** Id of an element that labels the group. */
  readonly ariaLabelledby = input<string>();
  /** Accessible name of each slot; `index` is 1-based. */
  readonly slotLabel = input<UiOtpSlotLabelFn>((index, length) => `Digit ${index} of ${length}`);

  /** Emitted when a user edit leaves every slot filled. Not emitted by `writeValue`. */
  readonly completed = output<string>();

  private readonly _slots = viewChildren<ElementRef<HTMLInputElement>>('slot');

  private readonly _value = signal('');
  private readonly _cvaDisabled = signal(false);
  private readonly _focused = signal(false);
  private readonly _describedBy = signal<string | null>(null);

  /**
   * `NgControl.invalid`/`.touched` are plain getters reading through `untracked()`, so a
   * `computed()` would never invalidate; keep a signal in sync with the control's `events`
   * instead (same approach as `UiInputDirective`). Unlike a text field, a code is invalid by
   * design until its last character is typed, so the error shows only once the control is touched
   * (focus left the group, or the form marked it) and not as soon as it is dirty.
   */
  private readonly _invalid = signal(false);

  readonly $value = this._value.asReadonly();
  readonly $disabled = computed(() => this.disabled() || this._cvaDisabled());
  readonly $focused = this._focused.asReadonly();
  readonly $invalid = this._invalid.asReadonly();

  /** The first slot is the element a `ui-form-field` labels and flags as invalid. */
  override readonly ariaTarget = computed(() => this._slots()[0]?.nativeElement);

  get id(): string {
    return this.inputId() ?? this._autoId;
  }

  protected readonly $slots = computed(() =>
    Array.from({ length: Math.max(1, this.length()) }, (_, i) => i)
  );
  protected readonly $activeIndex = computed(() =>
    Math.min(Array.from(this._value()).length, this.$slots().length - 1)
  );
  protected readonly $slotClass = computed(() => otpSlotVariants({ size: this.size() }));
  protected readonly $describedBy = this._describedBy.asReadonly();
  protected readonly $inputMode = computed(
    () => this.inputMode() ?? (this.formatter() === 'numeric' ? 'numeric' : 'text')
  );

  private readonly _filter = computed(() => createCharFilter(this.formatter()));
  private readonly _maskChar = computed(() => {
    const mask = this.mask();
    if (mask === true) {
      return DEFAULT_MASK_CHAR;
    }
    return mask ? (Array.from(mask)[0] ?? null) : null;
  });

  private _onChange: (value: string) => void = () => undefined;
  private _onTouched: () => void = () => undefined;

  constructor() {
    super();
    afterNextRender(() => {
      if (this.autoFocus() && !this.$disabled()) {
        this._focusSlot(this.$activeIndex());
      }
    });
  }

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

  // ControlValueAccessor ------------------------------------------------------------------------

  writeValue(value: string | null): void {
    this._value.set(this._sanitize(value));
  }

  registerOnChange(fn: (value: string) => void): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this._cvaDisabled.set(isDisabled);
  }

  // UiFormFieldControl --------------------------------------------------------------------------

  override setDescribedByIds(ids: string[]): void {
    this._describedBy.set(ids.length ? ids.join(' ') : null);
  }

  // Template ------------------------------------------------------------------------------------

  protected slotId(index: number): string {
    return index === 0 ? this.id : `${this.id}-${index}`;
  }

  protected display(index: number): string {
    const char = Array.from(this._value())[index] ?? '';
    return char ? (this._maskChar() ?? char) : '';
  }

  protected onInput(index: number, event: Event): void {
    const slot = event.target as HTMLInputElement;
    const inputEvent = event as InputEvent;

    if (
      inputEvent.inputType?.startsWith('delete') ||
      (!inputEvent.inputType && slot.value === '')
    ) {
      // Android virtual keyboards report Backspace only as an input event, never as a keydown.
      this._backspace(index);
      return;
    }

    const text =
      inputEvent.inputType === 'insertText' && inputEvent.data ? inputEvent.data : slot.value;
    this._insert(index, text);
  }

  protected onPaste(index: number, event: ClipboardEvent): void {
    event.preventDefault();
    this._insert(index, event.clipboardData?.getData('text') ?? '');
  }

  protected onKeydown(index: number, event: KeyboardEvent): void {
    switch (event.key) {
      case 'Backspace':
        event.preventDefault();
        this._backspace(index);
        break;
      case 'Delete':
        event.preventDefault();
        this._delete(index);
        break;
      case 'ArrowLeft':
        event.preventDefault();
        this._focusSlot(index - 1);
        break;
      case 'ArrowRight':
        event.preventDefault();
        this._focusSlot(index + 1);
        break;
    }
  }

  protected onSlotFocus(index: number, event: FocusEvent): void {
    const length = Array.from(this._value()).length;
    if (index > length) {
      // Slots are always filled left to right: send the caret to the first empty one.
      this._focusSlot(this.$activeIndex());
      return;
    }
    (event.target as HTMLInputElement).select();
  }

  protected onSlotClick(event: Event): void {
    const slot = event.target as HTMLInputElement;
    // Safari drops the selection made on focus when the mouse button is released.
    if (this._document.activeElement === slot) {
      slot.select();
    }
  }

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

  // Editing -------------------------------------------------------------------------------------

  private _insert(index: number, text: string): void {
    const inserted = parseChars(text, this._filter());
    if (!inserted.length) {
      this._syncSlots();
      return;
    }

    const length = this.$slots().length;
    const next = overwriteAt(Array.from(this._value()), index, inserted, length);
    this._commit(next);
    this._focusSlot(Math.min(index + inserted.length, length - 1));
  }

  private _backspace(index: number): void {
    const current = Array.from(this._value());
    if (index < current.length) {
      this._commit(removeAt(current, index));
      this._syncSlots();
      return;
    }
    if (current.length) {
      this._commit(removeAt(current, current.length - 1));
      this._focusSlot(current.length - 1);
    }
  }

  private _delete(index: number): void {
    const current = Array.from(this._value());
    if (index < current.length) {
      this._commit(removeAt(current, index));
      this._syncSlots();
    }
  }

  private _commit(chars: string[]): void {
    const value = chars.join('');
    const changed = value !== this._value();
    this._value.set(value);
    this._syncSlots();
    if (!changed) {
      return;
    }
    this._onChange(value);
    if (chars.length === this.$slots().length) {
      this.completed.emit(value);
    }
  }

  // DOM -----------------------------------------------------------------------------------------

  /**
   * Repaints every slot from state right away. The `[value]` binding alone is not enough: it only
   * writes when its bound value changes, so a rejected keystroke (state unchanged, DOM changed)
   * would stay on screen.
   */
  private _syncSlots(): void {
    this._slots().forEach((ref, i) => {
      const text = this.display(i);
      if (ref.nativeElement.value !== text) {
        ref.nativeElement.value = text;
      }
    });
  }

  private _focusSlot(index: number): void {
    const slots = this._slots();
    const slot = slots[Math.max(0, Math.min(index, slots.length - 1))]?.nativeElement;
    slot?.focus();
    slot?.select();
  }

  // Helpers -------------------------------------------------------------------------------------

  private _sanitize(value: string | null | undefined): string {
    return parseChars(value, this._filter()).slice(0, this.$slots().length).join('');
  }

  private _updateInvalid(): void {
    const ngControl = this._ngControl;
    this._invalid.set(!!ngControl?.invalid && !!ngControl.touched);
  }

  private _defaultSize(): UiOtpInputSize {
    const size = this._uiConfig?.defaultSize;
    return size === 'sm' || size === 'lg' ? size : 'md';
  }
}
