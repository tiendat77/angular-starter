import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Renderer2,
  contentChild,
  effect,
  inject,
} from '@angular/core';
import { UiFormFieldControl } from '@libs/ui/core';
import { UiErrorDirective } from './error.directive';
import { UiHintDirective } from './hint.directive';
import { UiLabelDirective } from './label.directive';

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
 * The control is discovered via `contentChild(UiFormFieldControl)` — the
 * shared abstract base that `UiInputDirective`/`UiTextareaDirective`
 * provide themselves as — so this component works with either without
 * knowing which one is projected.
 */
@Component({
  selector: 'ui-form-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex flex-col gap-1.5',
  },
  template: `
    <ng-content select="[uiLabel]" />
    <div
      class="focus-within:outline-primary relative flex items-center gap-2 rounded-lg focus-within:outline-2 focus-within:outline-offset-2"
    >
      <ng-content select="[uiPrefix]" />
      <ng-content select="[uiInput], [uiTextarea]" />
      <ng-content select="[uiSuffix]" />
    </div>
    <ng-content select="[uiHint]" />
    <ng-content select="[uiError]" />
  `,
})
export class UiFormFieldComponent {
  private readonly _renderer = inject(Renderer2);

  protected readonly control = contentChild(UiFormFieldControl);
  private readonly _controlElementRef = contentChild(UiFormFieldControl, { read: ElementRef });
  private readonly _labelElementRef = contentChild(UiLabelDirective, { read: ElementRef });
  protected readonly hint = contentChild(UiHintDirective);
  protected readonly error = contentChild(UiErrorDirective);

  constructor() {
    effect(() => {
      const control = this.control();
      const controlElementRef = this._controlElementRef();
      if (!control || !controlElementRef) {
        return;
      }
      const controlEl = controlElementRef.nativeElement as HTMLElement;

      const labelElementRef = this._labelElementRef();
      if (labelElementRef) {
        this._renderer.setAttribute(labelElementRef.nativeElement, 'for', control.id);
      }

      const describedByIds = [this.hint()?.id, this.error()?.id].filter((id): id is string => !!id);
      if (describedByIds.length > 0) {
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
