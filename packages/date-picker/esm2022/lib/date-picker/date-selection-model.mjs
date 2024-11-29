/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as i0 from '@angular/core';
import { Injectable, Optional, SkipSelf } from '@angular/core';
import { Subject } from 'rxjs';
import * as i1 from '../adapter/date-adapter';
import { DateAdapter } from '../adapter/date-adapter';
/** A class representing a range of dates. */
export class DateRange {
  start;
  end;
  /**
   * Ensures that objects with a `start` and `end` property can't be assigned to a variable that
   * expects a `DateRange`
   */
  _disableStructuralEquivalency;
  constructor(
    /** The start date of the range. */
    start,
    /** The end date of the range. */
    end
  ) {
    this.start = start;
    this.end = end;
  }
}
/**
 * A selection model containing a date selection.
 * @docs-private
 */
export class DateSelectionModel {
  selection;
  _adapter;
  _selectionChanged = new Subject();
  /** Emits when the selection has changed. */
  selectionChanged = this._selectionChanged;
  constructor(
    /** The current selection. */
    selection,
    _adapter
  ) {
    this.selection = selection;
    this._adapter = _adapter;
    this.selection = selection;
  }
  /**
   * Updates the current selection in the model.
   * @param value New selection that should be assigned.
   * @param source Object that triggered the selection change.
   */
  updateSelection(value, source) {
    const oldValue = this.selection;
    this.selection = value;
    this._selectionChanged.next({ selection: value, source, oldValue });
  }
  ngOnDestroy() {
    this._selectionChanged.complete();
  }
  _isValidDateInstance(date) {
    return this._adapter.isDateInstance(date) && this._adapter.isValid(date);
  }
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: '12.0.0',
    version: '18.2.13',
    ngImport: i0,
    type: DateSelectionModel,
    deps: 'invalid',
    target: i0.ɵɵFactoryTarget.Injectable,
  });
  static ɵprov = i0.ɵɵngDeclareInjectable({
    minVersion: '12.0.0',
    version: '18.2.13',
    ngImport: i0,
    type: DateSelectionModel,
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: '12.0.0',
  version: '18.2.13',
  ngImport: i0,
  type: DateSelectionModel,
  decorators: [
    {
      type: Injectable,
    },
  ],
  ctorParameters: () => [{ type: undefined }, { type: i1.DateAdapter }],
});
/**
 * A selection model that contains a single date.
 * @docs-private
 */
export class SingleDateSelectionModel extends DateSelectionModel {
  constructor(adapter) {
    super(null, adapter);
  }
  /**
   * Adds a date to the current selection. In the case of a single date selection, the added date
   * simply overwrites the previous selection
   */
  add(date) {
    super.updateSelection(date, this);
  }
  /** Checks whether the current selection is valid. */
  isValid() {
    return this.selection != null && this._isValidDateInstance(this.selection);
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
    const clone = new SingleDateSelectionModel(this._adapter);
    clone.updateSelection(this.selection, this);
    return clone;
  }
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: '12.0.0',
    version: '18.2.13',
    ngImport: i0,
    type: SingleDateSelectionModel,
    deps: [{ token: i1.DateAdapter }],
    target: i0.ɵɵFactoryTarget.Injectable,
  });
  static ɵprov = i0.ɵɵngDeclareInjectable({
    minVersion: '12.0.0',
    version: '18.2.13',
    ngImport: i0,
    type: SingleDateSelectionModel,
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: '12.0.0',
  version: '18.2.13',
  ngImport: i0,
  type: SingleDateSelectionModel,
  decorators: [
    {
      type: Injectable,
    },
  ],
  ctorParameters: () => [{ type: i1.DateAdapter }],
});
/** @docs-private */
export function SINGLE_DATE_SELECTION_MODEL_FACTORY(parent, adapter) {
  return parent || new SingleDateSelectionModel(adapter);
}
/**
 * Used to provide a single selection model to a component.
 * @docs-private
 */
export const SINGLE_DATE_SELECTION_MODEL_PROVIDER = {
  provide: DateSelectionModel,
  deps: [[new Optional(), new SkipSelf(), DateSelectionModel], DateAdapter],
  useFactory: SINGLE_DATE_SELECTION_MODEL_FACTORY,
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZS1zZWxlY3Rpb24tbW9kZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9saWJzL2RhdGUtcGlja2VyL3NyYy9saWIvZGF0ZS1waWNrZXIvZGF0ZS1zZWxlY3Rpb24tbW9kZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFtQixVQUFVLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBYSxNQUFNLGVBQWUsQ0FBQztBQUMzRixPQUFPLEVBQWMsT0FBTyxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQzNDLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQzs7O0FBRXRELDZDQUE2QztBQUM3QyxNQUFNLE9BQU8sU0FBUztJQVNUO0lBRUE7SUFWWDs7O09BR0c7SUFDSyw2QkFBNkIsQ0FBUTtJQUU3QztJQUNFLG1DQUFtQztJQUMxQixLQUFlO0lBQ3hCLGlDQUFpQztJQUN4QixHQUFhO1FBRmIsVUFBSyxHQUFMLEtBQUssQ0FBVTtRQUVmLFFBQUcsR0FBSCxHQUFHLENBQVU7SUFDckIsQ0FBQztDQUNMO0FBdUJEOzs7R0FHRztBQUVILE1BQU0sT0FBZ0Isa0JBQWtCO0lBVTNCO0lBQ0M7SUFSSyxpQkFBaUIsR0FBRyxJQUFJLE9BQU8sRUFBK0IsQ0FBQztJQUVoRiw0Q0FBNEM7SUFDNUMsZ0JBQWdCLEdBQTRDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQztJQUVuRjtJQUNFLDZCQUE2QjtJQUNwQixTQUFZLEVBQ1gsUUFBd0I7UUFEekIsY0FBUyxHQUFULFNBQVMsQ0FBRztRQUNYLGFBQVEsR0FBUixRQUFRLENBQWdCO1FBRWxDLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO0lBQzdCLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsZUFBZSxDQUFDLEtBQVEsRUFBRSxNQUFlO1FBQ3ZDLE1BQU0sUUFBUSxHQUFJLElBQXlCLENBQUMsU0FBUyxDQUFDO1FBQ3JELElBQXlCLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQztRQUM3QyxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLENBQUMsQ0FBQztJQUN0RSxDQUFDO0lBRUQsV0FBVztRQUNULElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUNwQyxDQUFDO0lBRVMsb0JBQW9CLENBQUMsSUFBTztRQUNwQyxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzNFLENBQUM7d0dBakNtQixrQkFBa0I7NEdBQWxCLGtCQUFrQjs7NEZBQWxCLGtCQUFrQjtrQkFEdkMsVUFBVTs7QUFpRFg7OztHQUdHO0FBRUgsTUFBTSxPQUFPLHdCQUE0QixTQUFRLGtCQUErQjtJQUM5RSxZQUFZLE9BQXVCO1FBQ2pDLEtBQUssQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDdkIsQ0FBQztJQUVEOzs7T0FHRztJQUNILEdBQUcsQ0FBQyxJQUFjO1FBQ2hCLEtBQUssQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ3BDLENBQUM7SUFFRCxxREFBcUQ7SUFDckQsT0FBTztRQUNMLE9BQU8sSUFBSSxDQUFDLFNBQVMsSUFBSSxJQUFJLElBQUksSUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUM3RSxDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsVUFBVTtRQUNSLE9BQU8sSUFBSSxDQUFDLFNBQVMsSUFBSSxJQUFJLENBQUM7SUFDaEMsQ0FBQztJQUVELGtDQUFrQztJQUNsQyxLQUFLO1FBQ0gsTUFBTSxLQUFLLEdBQUcsSUFBSSx3QkFBd0IsQ0FBSSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDN0QsS0FBSyxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQzVDLE9BQU8sS0FBSyxDQUFDO0lBQ2YsQ0FBQzt3R0EvQlUsd0JBQXdCOzRHQUF4Qix3QkFBd0I7OzRGQUF4Qix3QkFBd0I7a0JBRHBDLFVBQVU7O0FBbUNYLG9CQUFvQjtBQUNwQixNQUFNLFVBQVUsbUNBQW1DLENBQ2pELE1BQXlDLEVBQ3pDLE9BQTZCO0lBRTdCLE9BQU8sTUFBTSxJQUFJLElBQUksd0JBQXdCLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDekQsQ0FBQztBQUVEOzs7R0FHRztBQUNILE1BQU0sQ0FBQyxNQUFNLG9DQUFvQyxHQUFvQjtJQUNuRSxPQUFPLEVBQUUsa0JBQWtCO0lBQzNCLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxRQUFRLEVBQUUsRUFBRSxJQUFJLFFBQVEsRUFBRSxFQUFFLGtCQUFrQixDQUFDLEVBQUUsV0FBVyxDQUFDO0lBQ3pFLFVBQVUsRUFBRSxtQ0FBbUM7Q0FDaEQsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgeyBGYWN0b3J5UHJvdmlkZXIsIEluamVjdGFibGUsIE9wdGlvbmFsLCBTa2lwU2VsZiwgT25EZXN0cm95IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBPYnNlcnZhYmxlLCBTdWJqZWN0IH0gZnJvbSAncnhqcyc7XG5pbXBvcnQgeyBEYXRlQWRhcHRlciB9IGZyb20gJy4uL2FkYXB0ZXIvZGF0ZS1hZGFwdGVyJztcblxuLyoqIEEgY2xhc3MgcmVwcmVzZW50aW5nIGEgcmFuZ2Ugb2YgZGF0ZXMuICovXG5leHBvcnQgY2xhc3MgRGF0ZVJhbmdlPEQ+IHtcbiAgLyoqXG4gICAqIEVuc3VyZXMgdGhhdCBvYmplY3RzIHdpdGggYSBgc3RhcnRgIGFuZCBgZW5kYCBwcm9wZXJ0eSBjYW4ndCBiZSBhc3NpZ25lZCB0byBhIHZhcmlhYmxlIHRoYXRcbiAgICogZXhwZWN0cyBhIGBEYXRlUmFuZ2VgXG4gICAqL1xuICBwcml2YXRlIF9kaXNhYmxlU3RydWN0dXJhbEVxdWl2YWxlbmN5OiBuZXZlcjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAvKiogVGhlIHN0YXJ0IGRhdGUgb2YgdGhlIHJhbmdlLiAqL1xuICAgIHJlYWRvbmx5IHN0YXJ0OiBEIHwgbnVsbCxcbiAgICAvKiogVGhlIGVuZCBkYXRlIG9mIHRoZSByYW5nZS4gKi9cbiAgICByZWFkb25seSBlbmQ6IEQgfCBudWxsXG4gICkge31cbn1cblxuLyoqXG4gKiBDb25kaXRpb25hbGx5IHBpY2tzIHRoZSBkYXRlIHR5cGUsIGlmIGEgRGF0ZVJhbmdlIGlzIHBhc3NlZCBpbi5cbiAqIEBkb2NzLXByaXZhdGVcbiAqL1xuZXhwb3J0IHR5cGUgRXh0cmFjdERhdGVUeXBlRnJvbVNlbGVjdGlvbjxUPiA9IFQgZXh0ZW5kcyBEYXRlUmFuZ2U8aW5mZXIgRD4gPyBEIDogTm9uTnVsbGFibGU8VD47XG5cbi8qKlxuICogRXZlbnQgZW1pdHRlZCBieSB0aGUgZGF0ZSBzZWxlY3Rpb24gbW9kZWwgd2hlbiBpdHMgc2VsZWN0aW9uIGNoYW5nZXMuXG4gKiBAZG9jcy1wcml2YXRlXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgRGF0ZVNlbGVjdGlvbk1vZGVsQ2hhbmdlPFM+IHtcbiAgLyoqIE5ldyB2YWx1ZSBmb3IgdGhlIHNlbGVjdGlvbi4gKi9cbiAgc2VsZWN0aW9uOiBTO1xuXG4gIC8qKiBPYmplY3QgdGhhdCB0cmlnZ2VyZWQgdGhlIGNoYW5nZS4gKi9cbiAgc291cmNlOiB1bmtub3duO1xuXG4gIC8qKiBQcmV2aW91cyB2YWx1ZSAqL1xuICBvbGRWYWx1ZT86IFM7XG59XG5cbi8qKlxuICogQSBzZWxlY3Rpb24gbW9kZWwgY29udGFpbmluZyBhIGRhdGUgc2VsZWN0aW9uLlxuICogQGRvY3MtcHJpdmF0ZVxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgRGF0ZVNlbGVjdGlvbk1vZGVsPFMsIEQgPSBFeHRyYWN0RGF0ZVR5cGVGcm9tU2VsZWN0aW9uPFM+PlxuICBpbXBsZW1lbnRzIE9uRGVzdHJveVxue1xuICBwcml2YXRlIHJlYWRvbmx5IF9zZWxlY3Rpb25DaGFuZ2VkID0gbmV3IFN1YmplY3Q8RGF0ZVNlbGVjdGlvbk1vZGVsQ2hhbmdlPFM+PigpO1xuXG4gIC8qKiBFbWl0cyB3aGVuIHRoZSBzZWxlY3Rpb24gaGFzIGNoYW5nZWQuICovXG4gIHNlbGVjdGlvbkNoYW5nZWQ6IE9ic2VydmFibGU8RGF0ZVNlbGVjdGlvbk1vZGVsQ2hhbmdlPFM+PiA9IHRoaXMuX3NlbGVjdGlvbkNoYW5nZWQ7XG5cbiAgcHJvdGVjdGVkIGNvbnN0cnVjdG9yKFxuICAgIC8qKiBUaGUgY3VycmVudCBzZWxlY3Rpb24uICovXG4gICAgcmVhZG9ubHkgc2VsZWN0aW9uOiBTLFxuICAgIHByb3RlY3RlZCBfYWRhcHRlcjogRGF0ZUFkYXB0ZXI8RD5cbiAgKSB7XG4gICAgdGhpcy5zZWxlY3Rpb24gPSBzZWxlY3Rpb247XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlcyB0aGUgY3VycmVudCBzZWxlY3Rpb24gaW4gdGhlIG1vZGVsLlxuICAgKiBAcGFyYW0gdmFsdWUgTmV3IHNlbGVjdGlvbiB0aGF0IHNob3VsZCBiZSBhc3NpZ25lZC5cbiAgICogQHBhcmFtIHNvdXJjZSBPYmplY3QgdGhhdCB0cmlnZ2VyZWQgdGhlIHNlbGVjdGlvbiBjaGFuZ2UuXG4gICAqL1xuICB1cGRhdGVTZWxlY3Rpb24odmFsdWU6IFMsIHNvdXJjZTogdW5rbm93bikge1xuICAgIGNvbnN0IG9sZFZhbHVlID0gKHRoaXMgYXMgeyBzZWxlY3Rpb246IFMgfSkuc2VsZWN0aW9uO1xuICAgICh0aGlzIGFzIHsgc2VsZWN0aW9uOiBTIH0pLnNlbGVjdGlvbiA9IHZhbHVlO1xuICAgIHRoaXMuX3NlbGVjdGlvbkNoYW5nZWQubmV4dCh7IHNlbGVjdGlvbjogdmFsdWUsIHNvdXJjZSwgb2xkVmFsdWUgfSk7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICB0aGlzLl9zZWxlY3Rpb25DaGFuZ2VkLmNvbXBsZXRlKCk7XG4gIH1cblxuICBwcm90ZWN0ZWQgX2lzVmFsaWREYXRlSW5zdGFuY2UoZGF0ZTogRCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9hZGFwdGVyLmlzRGF0ZUluc3RhbmNlKGRhdGUpICYmIHRoaXMuX2FkYXB0ZXIuaXNWYWxpZChkYXRlKTtcbiAgfVxuXG4gIC8qKiBBZGRzIGEgZGF0ZSB0byB0aGUgY3VycmVudCBzZWxlY3Rpb24uICovXG4gIGFic3RyYWN0IGFkZChkYXRlOiBEIHwgbnVsbCk6IHZvaWQ7XG5cbiAgLyoqIENoZWNrcyB3aGV0aGVyIHRoZSBjdXJyZW50IHNlbGVjdGlvbiBpcyB2YWxpZC4gKi9cbiAgYWJzdHJhY3QgaXNWYWxpZCgpOiBib29sZWFuO1xuXG4gIC8qKiBDaGVja3Mgd2hldGhlciB0aGUgY3VycmVudCBzZWxlY3Rpb24gaXMgY29tcGxldGUuICovXG4gIGFic3RyYWN0IGlzQ29tcGxldGUoKTogYm9vbGVhbjtcblxuICAvKiogQ2xvbmVzIHRoZSBzZWxlY3Rpb24gbW9kZWwuICovXG4gIGFic3RyYWN0IGNsb25lKCk6IERhdGVTZWxlY3Rpb25Nb2RlbDxTLCBEPjtcbn1cblxuLyoqXG4gKiBBIHNlbGVjdGlvbiBtb2RlbCB0aGF0IGNvbnRhaW5zIGEgc2luZ2xlIGRhdGUuXG4gKiBAZG9jcy1wcml2YXRlXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBTaW5nbGVEYXRlU2VsZWN0aW9uTW9kZWw8RD4gZXh0ZW5kcyBEYXRlU2VsZWN0aW9uTW9kZWw8RCB8IG51bGwsIEQ+IHtcbiAgY29uc3RydWN0b3IoYWRhcHRlcjogRGF0ZUFkYXB0ZXI8RD4pIHtcbiAgICBzdXBlcihudWxsLCBhZGFwdGVyKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGEgZGF0ZSB0byB0aGUgY3VycmVudCBzZWxlY3Rpb24uIEluIHRoZSBjYXNlIG9mIGEgc2luZ2xlIGRhdGUgc2VsZWN0aW9uLCB0aGUgYWRkZWQgZGF0ZVxuICAgKiBzaW1wbHkgb3ZlcndyaXRlcyB0aGUgcHJldmlvdXMgc2VsZWN0aW9uXG4gICAqL1xuICBhZGQoZGF0ZTogRCB8IG51bGwpIHtcbiAgICBzdXBlci51cGRhdGVTZWxlY3Rpb24oZGF0ZSwgdGhpcyk7XG4gIH1cblxuICAvKiogQ2hlY2tzIHdoZXRoZXIgdGhlIGN1cnJlbnQgc2VsZWN0aW9uIGlzIHZhbGlkLiAqL1xuICBpc1ZhbGlkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnNlbGVjdGlvbiAhPSBudWxsICYmIHRoaXMuX2lzVmFsaWREYXRlSW5zdGFuY2UodGhpcy5zZWxlY3Rpb24pO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyB3aGV0aGVyIHRoZSBjdXJyZW50IHNlbGVjdGlvbiBpcyBjb21wbGV0ZS4gSW4gdGhlIGNhc2Ugb2YgYSBzaW5nbGUgZGF0ZSBzZWxlY3Rpb24sIHRoaXNcbiAgICogaXMgdHJ1ZSBpZiB0aGUgY3VycmVudCBzZWxlY3Rpb24gaXMgbm90IG51bGwuXG4gICAqL1xuICBpc0NvbXBsZXRlKCkge1xuICAgIHJldHVybiB0aGlzLnNlbGVjdGlvbiAhPSBudWxsO1xuICB9XG5cbiAgLyoqIENsb25lcyB0aGUgc2VsZWN0aW9uIG1vZGVsLiAqL1xuICBjbG9uZSgpIHtcbiAgICBjb25zdCBjbG9uZSA9IG5ldyBTaW5nbGVEYXRlU2VsZWN0aW9uTW9kZWw8RD4odGhpcy5fYWRhcHRlcik7XG4gICAgY2xvbmUudXBkYXRlU2VsZWN0aW9uKHRoaXMuc2VsZWN0aW9uLCB0aGlzKTtcbiAgICByZXR1cm4gY2xvbmU7XG4gIH1cbn1cblxuLyoqIEBkb2NzLXByaXZhdGUgKi9cbmV4cG9ydCBmdW5jdGlvbiBTSU5HTEVfREFURV9TRUxFQ1RJT05fTU9ERUxfRkFDVE9SWShcbiAgcGFyZW50OiBTaW5nbGVEYXRlU2VsZWN0aW9uTW9kZWw8dW5rbm93bj4sXG4gIGFkYXB0ZXI6IERhdGVBZGFwdGVyPHVua25vd24+XG4pIHtcbiAgcmV0dXJuIHBhcmVudCB8fCBuZXcgU2luZ2xlRGF0ZVNlbGVjdGlvbk1vZGVsKGFkYXB0ZXIpO1xufVxuXG4vKipcbiAqIFVzZWQgdG8gcHJvdmlkZSBhIHNpbmdsZSBzZWxlY3Rpb24gbW9kZWwgdG8gYSBjb21wb25lbnQuXG4gKiBAZG9jcy1wcml2YXRlXG4gKi9cbmV4cG9ydCBjb25zdCBTSU5HTEVfREFURV9TRUxFQ1RJT05fTU9ERUxfUFJPVklERVI6IEZhY3RvcnlQcm92aWRlciA9IHtcbiAgcHJvdmlkZTogRGF0ZVNlbGVjdGlvbk1vZGVsLFxuICBkZXBzOiBbW25ldyBPcHRpb25hbCgpLCBuZXcgU2tpcFNlbGYoKSwgRGF0ZVNlbGVjdGlvbk1vZGVsXSwgRGF0ZUFkYXB0ZXJdLFxuICB1c2VGYWN0b3J5OiBTSU5HTEVfREFURV9TRUxFQ1RJT05fTU9ERUxfRkFDVE9SWSxcbn07XG4iXX0=
