/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { FactoryProvider, Injectable, OnDestroy, Optional, SkipSelf, inject } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { DateAdapter } from '../adapter/date-adapter';

/** A class representing a range of dates. */
export class DateRange<D> {
  /**
   * Ensures that objects with a `start` and `end` property can't be assigned to a variable that
   * expects a `DateRange`
   */
  private _disableStructuralEquivalency: never;

  constructor(
    /** The start date of the range. */
    readonly start: D | null,
    /** The end date of the range. */
    readonly end: D | null
  ) {}
}

/**
 * Conditionally picks the date type, if a DateRange is passed in.
 * @docs-private
 */
export type ExtractDateTypeFromSelection<T> = T extends DateRange<infer D> ? D : NonNullable<T>;

/**
 * Event emitted by the date selection model when its selection changes.
 * @docs-private
 */
export interface DateSelectionModelChange<S> {
  /** New value for the selection. */
  selection: S;

  /** Object that triggered the change. */
  source: unknown;

  /** Previous value */
  oldValue?: S;
}

/**
 * A selection model containing a date selection.
 * @docs-private
 */
// eslint-disable-next-line @angular-eslint/use-injectable-provided-in
@Injectable()
export abstract class DateSelectionModel<
  S,
  D = ExtractDateTypeFromSelection<S>,
> implements OnDestroy {
  readonly selection: S;
  protected _adapter: DateAdapter<D>;

  private readonly _selectionChanged = new Subject<DateSelectionModelChange<S>>();

  /** Emits when the selection has changed. */
  selectionChanged: Observable<DateSelectionModelChange<S>> = this._selectionChanged;

  // eslint-disable-next-line @angular-eslint/prefer-inject
  protected constructor(selection: S, adapter: DateAdapter<D>) {
    this.selection = selection;
    this._adapter = adapter;
  }

  /**
   * Updates the current selection in the model.
   * @param value New selection that should be assigned.
   * @param source Object that triggered the selection change.
   */
  updateSelection(value: S, source: unknown) {
    const oldValue = (this as { selection: S }).selection;
    (this as { selection: S }).selection = value;
    this._selectionChanged.next({ selection: value, source, oldValue });
  }

  ngOnDestroy() {
    this._selectionChanged.complete();
  }

  protected _isValidDateInstance(date: D): boolean {
    return this._adapter.isDateInstance(date) && this._adapter.isValid(date);
  }

  /** Adds a date to the current selection. */
  abstract add(date: D | null): void;

  /** Checks whether the current selection is valid. */
  abstract isValid(): boolean;

  /** Checks whether the current selection is complete. */
  abstract isComplete(): boolean;

  /** Clones the selection model. */
  abstract clone(): DateSelectionModel<S, D>;
}

/**
 * A selection model that contains a single date.
 * @docs-private
 */
// eslint-disable-next-line @angular-eslint/use-injectable-provided-in
@Injectable()
export class SingleDateSelectionModel<D> extends DateSelectionModel<D | null, D> {
  // eslint-disable-next-line @angular-eslint/prefer-inject
  constructor(adapter?: DateAdapter<D>) {
    super(null, adapter || inject<DateAdapter<D>>(DateAdapter));
  }

  /**
   * Adds a date to the current selection. In the case of a single date selection, the added date
   * simply overwrites the previous selection
   */
  add(date: D | null) {
    super.updateSelection(date, this);
  }

  /** Checks whether the current selection is valid. */
  isValid(): boolean {
    return this.selection != null && this._isValidDateInstance(this.selection as D);
  }

  /**
   * Checks whether the current selection is complete. In the case of a single date selection, this
   * is true if the current selection is not null.
   */
  isComplete() {
    return this.selection != null;
  }

  /** Clones the selection model. */
  clone() {
    const clone = new SingleDateSelectionModel<D>(this._adapter);
    clone.updateSelection(this.selection, this);
    return clone;
  }
}

/** @docs-private */
export function SINGLE_DATE_SELECTION_MODEL_FACTORY(
  parent: SingleDateSelectionModel<unknown>,
  adapter: DateAdapter<unknown>
) {
  return parent || new SingleDateSelectionModel(adapter);
}

/**
 * Used to provide a single selection model to a component.
 * @docs-private
 */
export const SINGLE_DATE_SELECTION_MODEL_PROVIDER: FactoryProvider = {
  provide: DateSelectionModel,
  deps: [[new Optional(), new SkipSelf(), DateSelectionModel], DateAdapter],
  useFactory: SINGLE_DATE_SELECTION_MODEL_FACTORY,
};

/**
 * A selection model that contains a date range.
 * @docs-private
 */
// eslint-disable-next-line @angular-eslint/use-injectable-provided-in
@Injectable()
export class RangeDateSelectionModel<D> extends DateSelectionModel<DateRange<D>, D> {
  // eslint-disable-next-line @angular-eslint/prefer-inject
  constructor(adapter?: DateAdapter<D>) {
    super(new DateRange<D>(null, null), adapter || inject<DateAdapter<D>>(DateAdapter));
  }

  /**
   * Adds a date to the range: the first click sets the start, the second the end. A second click
   * before the start moves the start instead, and a click on a complete range begins a new one.
   */
  add(date: D | null): void {
    let { start, end } = this.selection;

    if (start == null || end != null) {
      start = date;
      end = null;
    } else if (date != null && this._adapter.compareDate(date, start) < 0) {
      start = date;
    } else {
      end = date;
    }

    super.updateSelection(new DateRange<D>(start, end), this);
  }

  /** Checks whether the current selection is valid. */
  isValid(): boolean {
    const { start, end } = this.selection;

    // Empty ranges are valid.
    if (start == null && end == null) {
      return true;
    }

    // Complete ranges are only valid if both dates are valid and the start is not after the end.
    if (start != null && end != null) {
      return (
        this._isValidDateInstance(start) &&
        this._isValidDateInstance(end) &&
        this._adapter.compareDate(start, end) <= 0
      );
    }

    // Partial ranges are valid if the start/end is valid.
    return (
      (start == null || this._isValidDateInstance(start)) &&
      (end == null || this._isValidDateInstance(end))
    );
  }

  /** A range is complete once both its start and end are set. */
  isComplete(): boolean {
    return this.selection.start != null && this.selection.end != null;
  }

  /** Clones the selection model. */
  clone() {
    const clone = new RangeDateSelectionModel<D>(this._adapter);
    clone.updateSelection(this.selection, this);
    return clone;
  }
}

/** @docs-private */
export function RANGE_DATE_SELECTION_MODEL_FACTORY(
  parent: RangeDateSelectionModel<unknown>,
  adapter: DateAdapter<unknown>
) {
  return parent || new RangeDateSelectionModel(adapter);
}

/**
 * Used to provide a range selection model to a component.
 * @docs-private
 */
export const RANGE_DATE_SELECTION_MODEL_PROVIDER: FactoryProvider = {
  provide: DateSelectionModel,
  deps: [[new Optional(), new SkipSelf(), DateSelectionModel], DateAdapter],
  useFactory: RANGE_DATE_SELECTION_MODEL_FACTORY,
};
