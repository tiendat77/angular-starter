/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  AfterContentInit,
  booleanAttribute,
  ChangeDetectorRef,
  Component,
  HostAttributeToken,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';

import { merge, Observable, of as observableOf, Subscription } from 'rxjs';
import { DatepickerControl, DatepickerPanel } from './datepicker-base';
import { DatepickerIntl } from './datepicker-intl';

@Component({
  selector: 'datepicker-toggle',
  templateUrl: './datepicker-toggle.html',
  host: {
    '[attr.tabindex]': 'null',
    '(click)': '_open($event)',
  },
  exportAs: 'datepickerToggle',
  encapsulation: ViewEncapsulation.None,
})
export class DatepickerToggle<D> implements AfterContentInit, OnChanges, OnDestroy {
  _intl = inject(DatepickerIntl);
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _stateChanges = Subscription.EMPTY;

  /** Datepicker instance that the button will toggle. */
  @Input('for') datepicker!: DatepickerPanel<DatepickerControl<any>, D>;

  /** Tabindex for the toggle. */
  @Input() tabIndex: number | null = null;

  /** Screen-reader label for the button. */
  @Input('aria-label') ariaLabel!: string;

  /** Whether the toggle button is disabled. */
  @Input({ transform: booleanAttribute })
  get disabled(): boolean {
    if (this._disabled === undefined && this.datepicker) {
      return this.datepicker.disabled;
    }

    return !!this._disabled;
  }
  set disabled(value: boolean) {
    this._disabled = value;
  }
  private _disabled: boolean | undefined;

  constructor() {
    const defaultTabIndex = inject(new HostAttributeToken('tabindex'), { optional: true });
    const parsedTabIndex = Number(defaultTabIndex);
    this.tabIndex = parsedTabIndex || parsedTabIndex === 0 ? parsedTabIndex : null;
  }

  ngOnChanges(changes: SimpleChanges<this>) {
    if (changes['datepicker']) {
      this._watchStateChanges();
    }
  }

  ngAfterContentInit() {
    this._watchStateChanges();
  }

  ngOnDestroy() {
    this._stateChanges.unsubscribe();
  }

  _open(event: Event): void {
    if (this.datepicker && !this.disabled) {
      this.datepicker.open();
      event.stopPropagation();
    }
  }

  private _watchStateChanges() {
    const datepickerStateChanged = this.datepicker ? this.datepicker.stateChanges : observableOf();
    const inputStateChanged =
      this.datepicker && this.datepicker.datepickerInput
        ? this.datepicker.datepickerInput.stateChanges
        : observableOf();
    const datepickerToggled = this.datepicker
      ? merge(this.datepicker.openedStream, this.datepicker.closedStream)
      : observableOf();

    this._stateChanges.unsubscribe();

    this._stateChanges = merge(
      datepickerStateChanged as Observable<void>,
      inputStateChanged,
      datepickerToggled
    ).subscribe(() => this._changeDetectorRef.markForCheck());
  }
}
