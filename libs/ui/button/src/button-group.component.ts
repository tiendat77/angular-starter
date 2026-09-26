import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Lays out projected `uiButton` elements in a row with consistent spacing.
 *
 * Deliberately minimal: the plan doesn't specify behavior beyond rendering a
 * styled wrapper around projected buttons, so no extra inputs (orientation,
 * segmented/attached borders, etc.) were invented — see task report.
 */
@Component({
  selector: 'ui-button-group',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'inline-flex items-center gap-2',
  },
  template: '<ng-content />',
})
export class UiButtonGroupComponent {}
