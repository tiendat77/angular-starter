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
export * from './luxon-date-adapter';
export * from './luxon-date-formats';
export declare class LuxonDateModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<LuxonDateModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<LuxonDateModule, never, never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<LuxonDateModule>;
}
export declare function provideLuxonDateAdapter(formats?: DateFormats): Provider[];
