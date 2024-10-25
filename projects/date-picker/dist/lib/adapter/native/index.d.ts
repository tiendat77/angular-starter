/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Provider } from '@angular/core';
import { DateFormats } from '../date-formats';
import * as i0 from "@angular/core";
export * from './native-date-adapter';
export * from './native-date-formats';
export declare class NativeDateModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<NativeDateModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<NativeDateModule, never, never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<NativeDateModule>;
}
export declare function provideNativeDateAdapter(formats?: DateFormats): Provider[];
