/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as i0 from '@angular/core';
import {
  AfterContentInit,
  ChangeDetectorRef,
  OnChanges,
  OnDestroy,
  SimpleChanges,
} from '@angular/core';
import { DatepickerControl, DatepickerPanel } from './datepicker-base';
export declare class DatepickerToggle<D> implements AfterContentInit, OnChanges, OnDestroy {
  private _changeDetectorRef;
  private _stateChanges;
  /** Datepicker instance that the button will toggle. */
  datepicker: DatepickerPanel<DatepickerControl<any>, D>;
  /** Screen-reader label for the button. */
  ariaLabel: string;
  /** Whether the toggle button is disabled. */
  get disabled(): boolean;
  set disabled(value: boolean);
  private _disabled;
  constructor(_changeDetectorRef: ChangeDetectorRef);
  ngOnChanges(changes: SimpleChanges): void;
  ngOnDestroy(): void;
  ngAfterContentInit(): void;
  _open(event: Event): void;
  private _watchStateChanges;
  static ɵfac: i0.ɵɵFactoryDeclaration<DatepickerToggle<any>, never>;
  static ɵcmp: i0.ɵɵComponentDeclaration<
    DatepickerToggle<any>,
    'datepicker-toggle',
    ['datepickerToggle'],
    {
      datepicker: { alias: 'for'; required: false };
      ariaLabel: { alias: 'aria-label'; required: false };
      disabled: { alias: 'disabled'; required: false };
    },
    {},
    never,
    never,
    true,
    never
  >;
  static ngAcceptInputType_disabled: unknown;
}
