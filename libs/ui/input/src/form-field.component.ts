import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Renderer2,
  computed,
  contentChild,
  effect,
  forwardRef,
  inject,
} from '@angular/core';
import { UiFormFieldControl } from '@libs/ui/core';
import { UiErrorDirective } from './error.directive';
import { UI_FORM_FIELD, UiFormFieldContext } from './form-field.token';
import { UiHintDirective } from './hint.directive';
import { UiInputDirective } from './input.directive';
import { inputVariants } from './input.variants';
import { UiLabelDirective } from './label.directive';
import { UiPrefixDirective, UiSuffixDirective } from './prefix-suffix.directive';

/**
 * Lays out a label, a control (`uiInput`/`uiTextarea`, optionally flanked
 * by `uiPrefix`/`uiSuffix`), and hint/error text, then wires the
 * accessibility relationships between them:
 *
 * - The projected `uiLabel`'s `for` attribute is set to the control's `id`.
 * - The control's `aria-describedby` is set to the id(s) of whichever of
 *   the projected `uiHint`/`uiError` are currently present in content.
 * - The control's `aria-invalid` is set to `"true"` whenever the bound
 *   `UiFormFieldControl.$invalid` signal is `true`, and removed otherwise.
 *
 * When a `uiPrefix`/`uiSuffix` is projected next to a `uiInput`, the control
 * row becomes the bordered box (using the input's `appearance`/`size`) and
 * the input renders borderless inside it, so the affixes sit within the field.
 *
 * The control is discovered via `contentChild(UiFormFieldControl)` — the
 * shared abstract base that `UiInputDirective`/`UiTextareaDirective`
 * provide themselves as — so this component works with either without
 * knowing which one is projected. Controls whose focusable element isn't their host
 * (e.g. `ui-select`) expose it as `ariaTarget`.
 */
@Component({
  selector: 'ui-form-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: UI_FORM_FIELD, useExisting: forwardRef(() => UiFormFieldComponent) }],
  host: {
    class: 'flex flex-col gap-1.5',
  },
  template: `
    <ng-content select="[uiLabel]" />
    <div [class]="$controlRowClass()">
      <ng-content select="[uiPrefix]" />
      <ng-content select="[uiInput], [uiTextarea], ui-select, ui-otp-input, ui-editor" />
      <ng-content select="[uiSuffix]" />
    </div>
    <ng-content select="[uiHint]" />
    <ng-content select="[uiError]" />
  `,
})
export class UiFormFieldComponent implements UiFormFieldContext {
  private readonly _renderer = inject(Renderer2);

  protected readonly control = contentChild(UiFormFieldControl);
  private readonly _controlElementRef = contentChild(UiFormFieldControl, { read: ElementRef });
  private readonly _labelElementRef = contentChild(UiLabelDirective, { read: ElementRef });
  protected readonly hint = contentChild(UiHintDirective);
  protected readonly error = contentChild(UiErrorDirective);
  private readonly _input = contentChild(UiInputDirective);
  private readonly _prefix = contentChild(UiPrefixDirective);
  private readonly _suffix = contentChild(UiSuffixDirective);

  /** Affixes are drawn inside the box only for `uiInput`; a `uiTextarea` keeps them alongside. */
  readonly $hasAffix = computed(() => !!this._input() && !!(this._prefix() || this._suffix()));

  protected readonly $controlRowClass = computed(() => {
    const input = this._input();
    return this.$hasAffix() && input
      ? inputVariants({ appearance: input.appearance(), size: input.size() })
      : 'relative flex items-center gap-2';
  });

  constructor() {
    effect(() => {
      const control = this.control();
      const controlElementRef = this._controlElementRef();
      if (!control || !controlElementRef) {
        return;
      }
      const controlEl = control.ariaTarget?.() ?? (controlElementRef.nativeElement as HTMLElement);

      const labelElementRef = this._labelElementRef();
      if (labelElementRef) {
        this._renderer.setAttribute(labelElementRef.nativeElement, 'for', control.id);
      }

      const describedByIds = [this.hint()?.id, this.error()?.id].filter((id): id is string => !!id);
      if (control.setDescribedByIds) {
        control.setDescribedByIds(describedByIds);
      } else if (describedByIds.length > 0) {
        this._renderer.setAttribute(controlEl, 'aria-describedby', describedByIds.join(' '));
      } else {
        this._renderer.removeAttribute(controlEl, 'aria-describedby');
      }

      if (control.$invalid()) {
        this._renderer.setAttribute(controlEl, 'aria-invalid', 'true');
      } else {
        this._renderer.removeAttribute(controlEl, 'aria-invalid');
      }
    });
  }
}
