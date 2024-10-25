/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { DatepickerBase, DatepickerControl } from './datepicker-base';
import { SINGLE_DATE_SELECTION_MODEL_PROVIDER } from './date-selection-model';

@Component({
  selector: 'date-picker',
  template: '',
  exportAs: 'datepicker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [
    SINGLE_DATE_SELECTION_MODEL_PROVIDER,
    { provide: DatepickerBase, useExisting: Datepicker },
  ],
  standalone: true,
})
export class Datepicker<D> extends DatepickerBase<DatepickerControl<D>, D | null, D> {}
