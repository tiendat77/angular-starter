import { ChangeDetectionStrategy, Component, computed, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { switchLabeledVariants } from './checkbox.variants';
import { UiSwitchBase } from './switch-base';

/** Switch with the label inside the track, on the side opposite the thumb. */
@Component({
  selector: 'ui-switch-labeled',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'inline-flex align-top',
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UiSwitchLabeledComponent),
      multi: true,
    },
  ],
  template: `
    <label
      [class]="$rootClass()"
      [attr.for]="$effectiveId()"
    >
      <!-- The wrapper is sized by the label; the input fills it -->
      <span [class]="$insideClass()">
        <input
          type="checkbox"
          role="switch"
          [class]="$trackClass()"
          [id]="$effectiveId()"
          [checked]="checked()"
          [disabled]="$effectiveDisabled()"
          (change)="onInputChange($event)"
          (blur)="onBlur()"
        />
        <span class="toggle-label">
          @if (label()) {
            {{ label() }}
          } @else {
            <ng-content />
          }
        </span>
      </span>
    </label>
  `,
})
export class UiSwitchLabeledComponent extends UiSwitchBase {
  protected readonly $insideClass = computed(() =>
    switchLabeledVariants({ size: this.$effectiveSize() })
  );
}
