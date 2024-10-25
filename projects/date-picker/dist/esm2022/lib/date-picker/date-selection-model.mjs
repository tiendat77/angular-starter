/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Injectable, Optional, SkipSelf } from '@angular/core';
import { Subject } from 'rxjs';
import { DateAdapter } from '../adapter/date-adapter';
import * as i0 from "@angular/core";
import * as i1 from "../adapter/date-adapter";
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
    end) {
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
    selection, _adapter) {
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
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: DateSelectionModel, deps: "invalid", target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: DateSelectionModel });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: DateSelectionModel, decorators: [{
            type: Injectable
        }], ctorParameters: () => [{ type: undefined }, { type: i1.DateAdapter }] });
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
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: SingleDateSelectionModel, deps: [{ token: i1.DateAdapter }], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: SingleDateSelectionModel });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: SingleDateSelectionModel, decorators: [{
            type: Injectable
        }], ctorParameters: () => [{ type: i1.DateAdapter }] });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZS1zZWxlY3Rpb24tbW9kZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvbGliL2RhdGUtcGlja2VyL2RhdGUtc2VsZWN0aW9uLW1vZGVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBbUIsVUFBVSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQWEsTUFBTSxlQUFlLENBQUM7QUFDM0YsT0FBTyxFQUFjLE9BQU8sRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUMzQyxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0seUJBQXlCLENBQUM7OztBQUV0RCw2Q0FBNkM7QUFDN0MsTUFBTSxPQUFPLFNBQVM7SUFTVDtJQUVBO0lBVlg7OztPQUdHO0lBQ0ssNkJBQTZCLENBQVE7SUFFN0M7SUFDRSxtQ0FBbUM7SUFDMUIsS0FBZTtJQUN4QixpQ0FBaUM7SUFDeEIsR0FBYTtRQUZiLFVBQUssR0FBTCxLQUFLLENBQVU7UUFFZixRQUFHLEdBQUgsR0FBRyxDQUFVO0lBQ3JCLENBQUM7Q0FDTDtBQXVCRDs7O0dBR0c7QUFFSCxNQUFNLE9BQWdCLGtCQUFrQjtJQVUzQjtJQUNDO0lBUkssaUJBQWlCLEdBQUcsSUFBSSxPQUFPLEVBQStCLENBQUM7SUFFaEYsNENBQTRDO0lBQzVDLGdCQUFnQixHQUE0QyxJQUFJLENBQUMsaUJBQWlCLENBQUM7SUFFbkY7SUFDRSw2QkFBNkI7SUFDcEIsU0FBWSxFQUNYLFFBQXdCO1FBRHpCLGNBQVMsR0FBVCxTQUFTLENBQUc7UUFDWCxhQUFRLEdBQVIsUUFBUSxDQUFnQjtRQUVsQyxJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztJQUM3QixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILGVBQWUsQ0FBQyxLQUFRLEVBQUUsTUFBZTtRQUN2QyxNQUFNLFFBQVEsR0FBSSxJQUF5QixDQUFDLFNBQVMsQ0FBQztRQUNyRCxJQUF5QixDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7UUFDN0MsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUM7SUFDdEUsQ0FBQztJQUVELFdBQVc7UUFDVCxJQUFJLENBQUMsaUJBQWlCLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDcEMsQ0FBQztJQUVTLG9CQUFvQixDQUFDLElBQU87UUFDcEMsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUMzRSxDQUFDO3VHQWpDbUIsa0JBQWtCOzJHQUFsQixrQkFBa0I7OzJGQUFsQixrQkFBa0I7a0JBRHZDLFVBQVU7O0FBaURYOzs7R0FHRztBQUVILE1BQU0sT0FBTyx3QkFBNEIsU0FBUSxrQkFBK0I7SUFDOUUsWUFBWSxPQUF1QjtRQUNqQyxLQUFLLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ3ZCLENBQUM7SUFFRDs7O09BR0c7SUFDSCxHQUFHLENBQUMsSUFBYztRQUNoQixLQUFLLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNwQyxDQUFDO0lBRUQscURBQXFEO0lBQ3JELE9BQU87UUFDTCxPQUFPLElBQUksQ0FBQyxTQUFTLElBQUksSUFBSSxJQUFJLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDN0UsQ0FBQztJQUVEOzs7T0FHRztJQUNILFVBQVU7UUFDUixPQUFPLElBQUksQ0FBQyxTQUFTLElBQUksSUFBSSxDQUFDO0lBQ2hDLENBQUM7SUFFRCxrQ0FBa0M7SUFDbEMsS0FBSztRQUNILE1BQU0sS0FBSyxHQUFHLElBQUksd0JBQXdCLENBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzdELEtBQUssQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUM1QyxPQUFPLEtBQUssQ0FBQztJQUNmLENBQUM7dUdBL0JVLHdCQUF3QjsyR0FBeEIsd0JBQXdCOzsyRkFBeEIsd0JBQXdCO2tCQURwQyxVQUFVOztBQW1DWCxvQkFBb0I7QUFDcEIsTUFBTSxVQUFVLG1DQUFtQyxDQUNqRCxNQUF5QyxFQUN6QyxPQUE2QjtJQUU3QixPQUFPLE1BQU0sSUFBSSxJQUFJLHdCQUF3QixDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ3pELENBQUM7QUFFRDs7O0dBR0c7QUFDSCxNQUFNLENBQUMsTUFBTSxvQ0FBb0MsR0FBb0I7SUFDbkUsT0FBTyxFQUFFLGtCQUFrQjtJQUMzQixJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUksUUFBUSxFQUFFLEVBQUUsSUFBSSxRQUFRLEVBQUUsRUFBRSxrQkFBa0IsQ0FBQyxFQUFFLFdBQVcsQ0FBQztJQUN6RSxVQUFVLEVBQUUsbUNBQW1DO0NBQ2hELENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHsgRmFjdG9yeVByb3ZpZGVyLCBJbmplY3RhYmxlLCBPcHRpb25hbCwgU2tpcFNlbGYsIE9uRGVzdHJveSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgT2JzZXJ2YWJsZSwgU3ViamVjdCB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgRGF0ZUFkYXB0ZXIgfSBmcm9tICcuLi9hZGFwdGVyL2RhdGUtYWRhcHRlcic7XG5cbi8qKiBBIGNsYXNzIHJlcHJlc2VudGluZyBhIHJhbmdlIG9mIGRhdGVzLiAqL1xuZXhwb3J0IGNsYXNzIERhdGVSYW5nZTxEPiB7XG4gIC8qKlxuICAgKiBFbnN1cmVzIHRoYXQgb2JqZWN0cyB3aXRoIGEgYHN0YXJ0YCBhbmQgYGVuZGAgcHJvcGVydHkgY2FuJ3QgYmUgYXNzaWduZWQgdG8gYSB2YXJpYWJsZSB0aGF0XG4gICAqIGV4cGVjdHMgYSBgRGF0ZVJhbmdlYFxuICAgKi9cbiAgcHJpdmF0ZSBfZGlzYWJsZVN0cnVjdHVyYWxFcXVpdmFsZW5jeTogbmV2ZXI7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgLyoqIFRoZSBzdGFydCBkYXRlIG9mIHRoZSByYW5nZS4gKi9cbiAgICByZWFkb25seSBzdGFydDogRCB8IG51bGwsXG4gICAgLyoqIFRoZSBlbmQgZGF0ZSBvZiB0aGUgcmFuZ2UuICovXG4gICAgcmVhZG9ubHkgZW5kOiBEIHwgbnVsbFxuICApIHt9XG59XG5cbi8qKlxuICogQ29uZGl0aW9uYWxseSBwaWNrcyB0aGUgZGF0ZSB0eXBlLCBpZiBhIERhdGVSYW5nZSBpcyBwYXNzZWQgaW4uXG4gKiBAZG9jcy1wcml2YXRlXG4gKi9cbmV4cG9ydCB0eXBlIEV4dHJhY3REYXRlVHlwZUZyb21TZWxlY3Rpb248VD4gPSBUIGV4dGVuZHMgRGF0ZVJhbmdlPGluZmVyIEQ+ID8gRCA6IE5vbk51bGxhYmxlPFQ+O1xuXG4vKipcbiAqIEV2ZW50IGVtaXR0ZWQgYnkgdGhlIGRhdGUgc2VsZWN0aW9uIG1vZGVsIHdoZW4gaXRzIHNlbGVjdGlvbiBjaGFuZ2VzLlxuICogQGRvY3MtcHJpdmF0ZVxuICovXG5leHBvcnQgaW50ZXJmYWNlIERhdGVTZWxlY3Rpb25Nb2RlbENoYW5nZTxTPiB7XG4gIC8qKiBOZXcgdmFsdWUgZm9yIHRoZSBzZWxlY3Rpb24uICovXG4gIHNlbGVjdGlvbjogUztcblxuICAvKiogT2JqZWN0IHRoYXQgdHJpZ2dlcmVkIHRoZSBjaGFuZ2UuICovXG4gIHNvdXJjZTogdW5rbm93bjtcblxuICAvKiogUHJldmlvdXMgdmFsdWUgKi9cbiAgb2xkVmFsdWU/OiBTO1xufVxuXG4vKipcbiAqIEEgc2VsZWN0aW9uIG1vZGVsIGNvbnRhaW5pbmcgYSBkYXRlIHNlbGVjdGlvbi5cbiAqIEBkb2NzLXByaXZhdGVcbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIERhdGVTZWxlY3Rpb25Nb2RlbDxTLCBEID0gRXh0cmFjdERhdGVUeXBlRnJvbVNlbGVjdGlvbjxTPj5cbiAgaW1wbGVtZW50cyBPbkRlc3Ryb3lcbntcbiAgcHJpdmF0ZSByZWFkb25seSBfc2VsZWN0aW9uQ2hhbmdlZCA9IG5ldyBTdWJqZWN0PERhdGVTZWxlY3Rpb25Nb2RlbENoYW5nZTxTPj4oKTtcblxuICAvKiogRW1pdHMgd2hlbiB0aGUgc2VsZWN0aW9uIGhhcyBjaGFuZ2VkLiAqL1xuICBzZWxlY3Rpb25DaGFuZ2VkOiBPYnNlcnZhYmxlPERhdGVTZWxlY3Rpb25Nb2RlbENoYW5nZTxTPj4gPSB0aGlzLl9zZWxlY3Rpb25DaGFuZ2VkO1xuXG4gIHByb3RlY3RlZCBjb25zdHJ1Y3RvcihcbiAgICAvKiogVGhlIGN1cnJlbnQgc2VsZWN0aW9uLiAqL1xuICAgIHJlYWRvbmx5IHNlbGVjdGlvbjogUyxcbiAgICBwcm90ZWN0ZWQgX2FkYXB0ZXI6IERhdGVBZGFwdGVyPEQ+XG4gICkge1xuICAgIHRoaXMuc2VsZWN0aW9uID0gc2VsZWN0aW9uO1xuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZXMgdGhlIGN1cnJlbnQgc2VsZWN0aW9uIGluIHRoZSBtb2RlbC5cbiAgICogQHBhcmFtIHZhbHVlIE5ldyBzZWxlY3Rpb24gdGhhdCBzaG91bGQgYmUgYXNzaWduZWQuXG4gICAqIEBwYXJhbSBzb3VyY2UgT2JqZWN0IHRoYXQgdHJpZ2dlcmVkIHRoZSBzZWxlY3Rpb24gY2hhbmdlLlxuICAgKi9cbiAgdXBkYXRlU2VsZWN0aW9uKHZhbHVlOiBTLCBzb3VyY2U6IHVua25vd24pIHtcbiAgICBjb25zdCBvbGRWYWx1ZSA9ICh0aGlzIGFzIHsgc2VsZWN0aW9uOiBTIH0pLnNlbGVjdGlvbjtcbiAgICAodGhpcyBhcyB7IHNlbGVjdGlvbjogUyB9KS5zZWxlY3Rpb24gPSB2YWx1ZTtcbiAgICB0aGlzLl9zZWxlY3Rpb25DaGFuZ2VkLm5leHQoeyBzZWxlY3Rpb246IHZhbHVlLCBzb3VyY2UsIG9sZFZhbHVlIH0pO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgdGhpcy5fc2VsZWN0aW9uQ2hhbmdlZC5jb21wbGV0ZSgpO1xuICB9XG5cbiAgcHJvdGVjdGVkIF9pc1ZhbGlkRGF0ZUluc3RhbmNlKGRhdGU6IEQpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fYWRhcHRlci5pc0RhdGVJbnN0YW5jZShkYXRlKSAmJiB0aGlzLl9hZGFwdGVyLmlzVmFsaWQoZGF0ZSk7XG4gIH1cblxuICAvKiogQWRkcyBhIGRhdGUgdG8gdGhlIGN1cnJlbnQgc2VsZWN0aW9uLiAqL1xuICBhYnN0cmFjdCBhZGQoZGF0ZTogRCB8IG51bGwpOiB2b2lkO1xuXG4gIC8qKiBDaGVja3Mgd2hldGhlciB0aGUgY3VycmVudCBzZWxlY3Rpb24gaXMgdmFsaWQuICovXG4gIGFic3RyYWN0IGlzVmFsaWQoKTogYm9vbGVhbjtcblxuICAvKiogQ2hlY2tzIHdoZXRoZXIgdGhlIGN1cnJlbnQgc2VsZWN0aW9uIGlzIGNvbXBsZXRlLiAqL1xuICBhYnN0cmFjdCBpc0NvbXBsZXRlKCk6IGJvb2xlYW47XG5cbiAgLyoqIENsb25lcyB0aGUgc2VsZWN0aW9uIG1vZGVsLiAqL1xuICBhYnN0cmFjdCBjbG9uZSgpOiBEYXRlU2VsZWN0aW9uTW9kZWw8UywgRD47XG59XG5cbi8qKlxuICogQSBzZWxlY3Rpb24gbW9kZWwgdGhhdCBjb250YWlucyBhIHNpbmdsZSBkYXRlLlxuICogQGRvY3MtcHJpdmF0ZVxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgU2luZ2xlRGF0ZVNlbGVjdGlvbk1vZGVsPEQ+IGV4dGVuZHMgRGF0ZVNlbGVjdGlvbk1vZGVsPEQgfCBudWxsLCBEPiB7XG4gIGNvbnN0cnVjdG9yKGFkYXB0ZXI6IERhdGVBZGFwdGVyPEQ+KSB7XG4gICAgc3VwZXIobnVsbCwgYWRhcHRlcik7XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBhIGRhdGUgdG8gdGhlIGN1cnJlbnQgc2VsZWN0aW9uLiBJbiB0aGUgY2FzZSBvZiBhIHNpbmdsZSBkYXRlIHNlbGVjdGlvbiwgdGhlIGFkZGVkIGRhdGVcbiAgICogc2ltcGx5IG92ZXJ3cml0ZXMgdGhlIHByZXZpb3VzIHNlbGVjdGlvblxuICAgKi9cbiAgYWRkKGRhdGU6IEQgfCBudWxsKSB7XG4gICAgc3VwZXIudXBkYXRlU2VsZWN0aW9uKGRhdGUsIHRoaXMpO1xuICB9XG5cbiAgLyoqIENoZWNrcyB3aGV0aGVyIHRoZSBjdXJyZW50IHNlbGVjdGlvbiBpcyB2YWxpZC4gKi9cbiAgaXNWYWxpZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5zZWxlY3Rpb24gIT0gbnVsbCAmJiB0aGlzLl9pc1ZhbGlkRGF0ZUluc3RhbmNlKHRoaXMuc2VsZWN0aW9uKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3Mgd2hldGhlciB0aGUgY3VycmVudCBzZWxlY3Rpb24gaXMgY29tcGxldGUuIEluIHRoZSBjYXNlIG9mIGEgc2luZ2xlIGRhdGUgc2VsZWN0aW9uLCB0aGlzXG4gICAqIGlzIHRydWUgaWYgdGhlIGN1cnJlbnQgc2VsZWN0aW9uIGlzIG5vdCBudWxsLlxuICAgKi9cbiAgaXNDb21wbGV0ZSgpIHtcbiAgICByZXR1cm4gdGhpcy5zZWxlY3Rpb24gIT0gbnVsbDtcbiAgfVxuXG4gIC8qKiBDbG9uZXMgdGhlIHNlbGVjdGlvbiBtb2RlbC4gKi9cbiAgY2xvbmUoKSB7XG4gICAgY29uc3QgY2xvbmUgPSBuZXcgU2luZ2xlRGF0ZVNlbGVjdGlvbk1vZGVsPEQ+KHRoaXMuX2FkYXB0ZXIpO1xuICAgIGNsb25lLnVwZGF0ZVNlbGVjdGlvbih0aGlzLnNlbGVjdGlvbiwgdGhpcyk7XG4gICAgcmV0dXJuIGNsb25lO1xuICB9XG59XG5cbi8qKiBAZG9jcy1wcml2YXRlICovXG5leHBvcnQgZnVuY3Rpb24gU0lOR0xFX0RBVEVfU0VMRUNUSU9OX01PREVMX0ZBQ1RPUlkoXG4gIHBhcmVudDogU2luZ2xlRGF0ZVNlbGVjdGlvbk1vZGVsPHVua25vd24+LFxuICBhZGFwdGVyOiBEYXRlQWRhcHRlcjx1bmtub3duPlxuKSB7XG4gIHJldHVybiBwYXJlbnQgfHwgbmV3IFNpbmdsZURhdGVTZWxlY3Rpb25Nb2RlbChhZGFwdGVyKTtcbn1cblxuLyoqXG4gKiBVc2VkIHRvIHByb3ZpZGUgYSBzaW5nbGUgc2VsZWN0aW9uIG1vZGVsIHRvIGEgY29tcG9uZW50LlxuICogQGRvY3MtcHJpdmF0ZVxuICovXG5leHBvcnQgY29uc3QgU0lOR0xFX0RBVEVfU0VMRUNUSU9OX01PREVMX1BST1ZJREVSOiBGYWN0b3J5UHJvdmlkZXIgPSB7XG4gIHByb3ZpZGU6IERhdGVTZWxlY3Rpb25Nb2RlbCxcbiAgZGVwczogW1tuZXcgT3B0aW9uYWwoKSwgbmV3IFNraXBTZWxmKCksIERhdGVTZWxlY3Rpb25Nb2RlbF0sIERhdGVBZGFwdGVyXSxcbiAgdXNlRmFjdG9yeTogU0lOR0xFX0RBVEVfU0VMRUNUSU9OX01PREVMX0ZBQ1RPUlksXG59O1xuIl19