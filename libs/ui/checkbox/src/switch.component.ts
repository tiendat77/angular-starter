import { ChangeDetectionStrategy, Component, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { UiSwitchBase } from './switch-base';

/** Switch with the label beside the track. */
@Component({
  selector: 'ui-switch',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'inline-flex align-top',
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UiSwitchComponent),
      multi: true,
    },
  ],
  template: `
    <label
      [class]="$rootClass()"
      [attr.for]="$effectiveId()"
    >
      <!-- One text line tall, so the track stays centered on the first line of the label -->
      <span class="flex h-lh shrink-0 items-center">
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
      </span>
      @if (label()) {
        <span>{{ label() }}</span>
      } @else {
        <ng-content />
      }
    </label>
  `,
})
export class UiSwitchComponent extends UiSwitchBase {}
