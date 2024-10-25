/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { FactoryProvider, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';
import { DateAdapter } from '../adapter/date-adapter';
import * as i0 from "@angular/core";
/** A class representing a range of dates. */
export declare class DateRange<D> {
    /** The start date of the range. */
    readonly start: D | null;
    /** The end date of the range. */
    readonly end: D | null;
    /**
     * Ensures that objects with a `start` and `end` property can't be assigned to a variable that
     * expects a `DateRange`
     */
    private _disableStructuralEquivalency;
    constructor(
    /** The start date of the range. */
    start: D | null, 
    /** The end date of the range. */
    end: D | null);
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
export declare abstract class DateSelectionModel<S, D = ExtractDateTypeFromSelection<S>> implements OnDestroy {
    /** The current selection. */
    readonly selection: S;
    protected _adapter: DateAdapter<D>;
    private readonly _selectionChanged;
    /** Emits when the selection has changed. */
    selectionChanged: Observable<DateSelectionModelChange<S>>;
    protected constructor(
    /** The current selection. */
    selection: S, _adapter: DateAdapter<D>);
    /**
     * Updates the current selection in the model.
     * @param value New selection that should be assigned.
     * @param source Object that triggered the selection change.
     */
    updateSelection(value: S, source: unknown): void;
    ngOnDestroy(): void;
    protected _isValidDateInstance(date: D): boolean;
    /** Adds a date to the current selection. */
    abstract add(date: D | null): void;
    /** Checks whether the current selection is valid. */
    abstract isValid(): boolean;
    /** Checks whether the current selection is complete. */
    abstract isComplete(): boolean;
    /** Clones the selection model. */
    abstract clone(): DateSelectionModel<S, D>;
    static ɵfac: i0.ɵɵFactoryDeclaration<DateSelectionModel<any, any>, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<DateSelectionModel<any, any>>;
}
/**
 * A selection model that contains a single date.
 * @docs-private
 */
export declare class SingleDateSelectionModel<D> extends DateSelectionModel<D | null, D> {
    constructor(adapter: DateAdapter<D>);
    /**
     * Adds a date to the current selection. In the case of a single date selection, the added date
     * simply overwrites the previous selection
     */
    add(date: D | null): void;
    /** Checks whether the current selection is valid. */
    isValid(): boolean;
    /**
     * Checks whether the current selection is complete. In the case of a single date selection, this
     * is true if the current selection is not null.
     */
    isComplete(): boolean;
    /** Clones the selection model. */
    clone(): SingleDateSelectionModel<D>;
    static ɵfac: i0.ɵɵFactoryDeclaration<SingleDateSelectionModel<any>, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<SingleDateSelectionModel<any>>;
}
/** @docs-private */
export declare function SINGLE_DATE_SELECTION_MODEL_FACTORY(parent: SingleDateSelectionModel<unknown>, adapter: DateAdapter<unknown>): SingleDateSelectionModel<unknown>;
/**
 * Used to provide a single selection model to a component.
 * @docs-private
 */
export declare const SINGLE_DATE_SELECTION_MODEL_PROVIDER: FactoryProvider;
