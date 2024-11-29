/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { NgModule, Provider } from '@angular/core';

import { DATE_LOCALE, DateAdapter } from '../date-adapter';
import { DATE_FORMATS, DateFormats } from '../date-formats';

import { LUXON_DATE_ADAPTER_OPTIONS, LuxonDateAdapter } from './luxon-date-adapter';

import { LUXON_DATE_FORMATS } from './luxon-date-formats';

export * from './luxon-date-adapter';
export * from './luxon-date-formats';

@NgModule({
  providers: [
    {
      provide: DateAdapter,
      useClass: LuxonDateAdapter,
      deps: [DATE_LOCALE, LUXON_DATE_ADAPTER_OPTIONS],
    },
  ],
})
export class LuxonDateModule {}

export function provideLuxonDateAdapter(formats: DateFormats = LUXON_DATE_FORMATS): Provider[] {
  return [
    {
      provide: DateAdapter,
      useClass: LuxonDateAdapter,
      deps: [DATE_LOCALE, LUXON_DATE_ADAPTER_OPTIONS],
    },
    { provide: DATE_FORMATS, useValue: formats },
  ];
}
