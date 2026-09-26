/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { NgModule, Provider } from '@angular/core';

import { DateAdapter } from '../date-adapter';
import { DATE_FORMATS, DateFormats } from '../date-formats';

import { NativeDateAdapter } from './native-date-adapter';
import { NATIVE_DATE_FORMATS } from './native-date-formats';

export * from './native-date-adapter';
export * from './native-date-formats';

@NgModule({
  providers: [{ provide: DateAdapter, useClass: NativeDateAdapter }],
})
export class NativeDateModule {}

export function provideNativeDateAdapter(formats: DateFormats = NATIVE_DATE_FORMATS): Provider[] {
  return [
    { provide: DateAdapter, useClass: NativeDateAdapter },
    { provide: DATE_FORMATS, useValue: formats },
  ];
}
