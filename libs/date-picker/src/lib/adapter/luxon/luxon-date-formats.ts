/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { DateFormats } from '../date-formats';

export const LUXON_DATE_FORMATS: DateFormats = {
  parse: {
    dateInput: 'dd/MM/yyyy',
  },
  display: {
    dateInput: 'dd/MM/yyyy',
    monthYearLabel: 'LLL yyyy',
    dateA11yLabel: 'DD',
    monthYearA11yLabel: 'LLLL yyyy',
    dayMonthDateLabel: 'ccc, MMMM dd',
  },
};
