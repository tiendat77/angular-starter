/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { inject, InjectionToken, LOCALE_ID } from '@angular/core';
import { Subject } from 'rxjs';
/** InjectionToken for datepicker that can be used to override default locale code. */
export const DATE_LOCALE = new InjectionToken('DATE_LOCALE', {
    providedIn: 'root',
    factory: DATE_LOCALE_FACTORY,
});
/** @docs-private */
export function DATE_LOCALE_FACTORY() {
    return inject(LOCALE_ID);
}
/** Adapts type `D` to be usable as a date by cdk-based components that work with dates. */
export class DateAdapter {
    /** The locale to use for all dates. */
    locale;
    _localeChanges = new Subject();
    /** A stream that emits when the locale changes. */
    localeChanges = this._localeChanges;
    /**
     * Given a potential date object, returns that same date object if it is
     * a valid date, or `null` if it's not a valid date.
     * @param obj The object to check.
     * @returns A date or `null`.
     */
    getValidDateOrNull(obj) {
        return this.isDateInstance(obj) && this.isValid(obj) ? obj : null;
    }
    /**
     * Attempts to deserialize a value to a valid date object. This is different from parsing in that
     * deserialize should only accept non-ambiguous, locale-independent formats (e.g. a ISO 8601
     * string). The default implementation does not allow any deserialization, it simply checks that
     * the given value is already a valid date object or null. The `<datepicker>` will call this
     * method on all of its `@Input()` properties that accept dates. It is therefore possible to
     * support passing values from your backend directly to these properties by overriding this method
     * to also deserialize the format used by your backend.
     * @param value The value to be deserialized into a date object.
     * @returns The deserialized date object, either a valid date, null if the value can be
     *     deserialized into a null date (e.g. the empty string), or an invalid date.
     */
    deserialize(value) {
        if (value == null || (this.isDateInstance(value) && this.isValid(value))) {
            return value;
        }
        return this.invalid();
    }
    /**
     * Sets the locale used for all dates.
     * @param locale The new locale.
     */
    setLocale(locale) {
        this.locale = locale;
        this._localeChanges.next();
    }
    /**
     * Compares two dates.
     * @param first The first date to compare.
     * @param second The second date to compare.
     * @returns 0 if the dates are equal, a number less than 0 if the first date is earlier,
     *     a number greater than 0 if the first date is later.
     */
    compareDate(first, second) {
        return (this.getYear(first) - this.getYear(second) ||
            this.getMonth(first) - this.getMonth(second) ||
            this.getDate(first) - this.getDate(second));
    }
    /**
     * Checks if two dates are equal.
     * @param first The first date to check.
     * @param second The second date to check.
     * @returns Whether the two dates are equal.
     *     Null dates are considered equal to other null dates.
     */
    sameDate(first, second) {
        if (first && second) {
            const firstValid = this.isValid(first);
            const secondValid = this.isValid(second);
            if (firstValid && secondValid) {
                return !this.compareDate(first, second);
            }
            return firstValid == secondValid;
        }
        return first == second;
    }
    /**
     * Clamp the given date between min and max dates.
     * @param date The date to clamp.
     * @param min The minimum value to allow. If null or omitted no min is enforced.
     * @param max The maximum value to allow. If null or omitted no max is enforced.
     * @returns `min` if `date` is less than `min`, `max` if date is greater than `max`,
     *     otherwise `date`.
     */
    clampDate(date, min, max) {
        if (min && this.compareDate(date, min) < 0) {
            return min;
        }
        if (max && this.compareDate(date, max) > 0) {
            return max;
        }
        return date;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZS1hZGFwdGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2xpYi9hZGFwdGVyL2RhdGUtYWRhcHRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUUsTUFBTSxFQUFFLGNBQWMsRUFBRSxTQUFTLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDbEUsT0FBTyxFQUFjLE9BQU8sRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUUzQyxzRkFBc0Y7QUFDdEYsTUFBTSxDQUFDLE1BQU0sV0FBVyxHQUFHLElBQUksY0FBYyxDQUFNLGFBQWEsRUFBRTtJQUNoRSxVQUFVLEVBQUUsTUFBTTtJQUNsQixPQUFPLEVBQUUsbUJBQW1CO0NBQzdCLENBQUMsQ0FBQztBQUVILG9CQUFvQjtBQUNwQixNQUFNLFVBQVUsbUJBQW1CO0lBQ2pDLE9BQU8sTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQzNCLENBQUM7QUFFRCwyRkFBMkY7QUFDM0YsTUFBTSxPQUFnQixXQUFXO0lBQy9CLHVDQUF1QztJQUM3QixNQUFNLENBQUk7SUFDRCxjQUFjLEdBQUcsSUFBSSxPQUFPLEVBQVEsQ0FBQztJQUV4RCxtREFBbUQ7SUFDMUMsYUFBYSxHQUFxQixJQUFJLENBQUMsY0FBYyxDQUFDO0lBd0svRDs7Ozs7T0FLRztJQUNILGtCQUFrQixDQUFDLEdBQVk7UUFDN0IsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBUSxDQUFDLENBQUMsQ0FBQyxDQUFFLEdBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO0lBQ2hGLENBQUM7SUFFRDs7Ozs7Ozs7Ozs7T0FXRztJQUNILFdBQVcsQ0FBQyxLQUFVO1FBQ3BCLElBQUksS0FBSyxJQUFJLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUM7WUFDekUsT0FBTyxLQUFLLENBQUM7UUFDZixDQUFDO1FBQ0QsT0FBTyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDeEIsQ0FBQztJQUVEOzs7T0FHRztJQUNILFNBQVMsQ0FBQyxNQUFTO1FBQ2pCLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDN0IsQ0FBQztJQUVEOzs7Ozs7T0FNRztJQUNILFdBQVcsQ0FBQyxLQUFRLEVBQUUsTUFBUztRQUM3QixPQUFPLENBQ0wsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQztZQUMxQyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDO1lBQzVDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FDM0MsQ0FBQztJQUNKLENBQUM7SUFFRDs7Ozs7O09BTUc7SUFDSCxRQUFRLENBQUMsS0FBZSxFQUFFLE1BQWdCO1FBQ3hDLElBQUksS0FBSyxJQUFJLE1BQU0sRUFBRSxDQUFDO1lBQ3BCLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDdkMsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUN6QyxJQUFJLFVBQVUsSUFBSSxXQUFXLEVBQUUsQ0FBQztnQkFDOUIsT0FBTyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQzFDLENBQUM7WUFDRCxPQUFPLFVBQVUsSUFBSSxXQUFXLENBQUM7UUFDbkMsQ0FBQztRQUNELE9BQU8sS0FBSyxJQUFJLE1BQU0sQ0FBQztJQUN6QixDQUFDO0lBRUQ7Ozs7Ozs7T0FPRztJQUNILFNBQVMsQ0FBQyxJQUFPLEVBQUUsR0FBYyxFQUFFLEdBQWM7UUFDL0MsSUFBSSxHQUFHLElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7WUFDM0MsT0FBTyxHQUFHLENBQUM7UUFDYixDQUFDO1FBQ0QsSUFBSSxHQUFHLElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7WUFDM0MsT0FBTyxHQUFHLENBQUM7UUFDYixDQUFDO1FBQ0QsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0NBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHsgaW5qZWN0LCBJbmplY3Rpb25Ub2tlbiwgTE9DQUxFX0lEIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBPYnNlcnZhYmxlLCBTdWJqZWN0IH0gZnJvbSAncnhqcyc7XG5cbi8qKiBJbmplY3Rpb25Ub2tlbiBmb3IgZGF0ZXBpY2tlciB0aGF0IGNhbiBiZSB1c2VkIHRvIG92ZXJyaWRlIGRlZmF1bHQgbG9jYWxlIGNvZGUuICovXG5leHBvcnQgY29uc3QgREFURV9MT0NBTEUgPSBuZXcgSW5qZWN0aW9uVG9rZW48YW55PignREFURV9MT0NBTEUnLCB7XG4gIHByb3ZpZGVkSW46ICdyb290JyxcbiAgZmFjdG9yeTogREFURV9MT0NBTEVfRkFDVE9SWSxcbn0pO1xuXG4vKiogQGRvY3MtcHJpdmF0ZSAqL1xuZXhwb3J0IGZ1bmN0aW9uIERBVEVfTE9DQUxFX0ZBQ1RPUlkoKTogYW55IHtcbiAgcmV0dXJuIGluamVjdChMT0NBTEVfSUQpO1xufVxuXG4vKiogQWRhcHRzIHR5cGUgYERgIHRvIGJlIHVzYWJsZSBhcyBhIGRhdGUgYnkgY2RrLWJhc2VkIGNvbXBvbmVudHMgdGhhdCB3b3JrIHdpdGggZGF0ZXMuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgRGF0ZUFkYXB0ZXI8RCwgTCA9IGFueT4ge1xuICAvKiogVGhlIGxvY2FsZSB0byB1c2UgZm9yIGFsbCBkYXRlcy4gKi9cbiAgcHJvdGVjdGVkIGxvY2FsZTogTDtcbiAgcHJvdGVjdGVkIHJlYWRvbmx5IF9sb2NhbGVDaGFuZ2VzID0gbmV3IFN1YmplY3Q8dm9pZD4oKTtcblxuICAvKiogQSBzdHJlYW0gdGhhdCBlbWl0cyB3aGVuIHRoZSBsb2NhbGUgY2hhbmdlcy4gKi9cbiAgcmVhZG9ubHkgbG9jYWxlQ2hhbmdlczogT2JzZXJ2YWJsZTx2b2lkPiA9IHRoaXMuX2xvY2FsZUNoYW5nZXM7XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIHllYXIgY29tcG9uZW50IG9mIHRoZSBnaXZlbiBkYXRlLlxuICAgKiBAcGFyYW0gZGF0ZSBUaGUgZGF0ZSB0byBleHRyYWN0IHRoZSB5ZWFyIGZyb20uXG4gICAqIEByZXR1cm5zIFRoZSB5ZWFyIGNvbXBvbmVudC5cbiAgICovXG4gIGFic3RyYWN0IGdldFllYXIoZGF0ZTogRCk6IG51bWJlcjtcblxuICAvKipcbiAgICogR2V0cyB0aGUgbW9udGggY29tcG9uZW50IG9mIHRoZSBnaXZlbiBkYXRlLlxuICAgKiBAcGFyYW0gZGF0ZSBUaGUgZGF0ZSB0byBleHRyYWN0IHRoZSBtb250aCBmcm9tLlxuICAgKiBAcmV0dXJucyBUaGUgbW9udGggY29tcG9uZW50ICgwLWluZGV4ZWQsIDAgPSBKYW51YXJ5KS5cbiAgICovXG4gIGFic3RyYWN0IGdldE1vbnRoKGRhdGU6IEQpOiBudW1iZXI7XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIGRhdGUgb2YgdGhlIG1vbnRoIGNvbXBvbmVudCBvZiB0aGUgZ2l2ZW4gZGF0ZS5cbiAgICogQHBhcmFtIGRhdGUgVGhlIGRhdGUgdG8gZXh0cmFjdCB0aGUgZGF0ZSBvZiB0aGUgbW9udGggZnJvbS5cbiAgICogQHJldHVybnMgVGhlIG1vbnRoIGNvbXBvbmVudCAoMS1pbmRleGVkLCAxID0gZmlyc3Qgb2YgbW9udGgpLlxuICAgKi9cbiAgYWJzdHJhY3QgZ2V0RGF0ZShkYXRlOiBEKTogbnVtYmVyO1xuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBkYXkgb2YgdGhlIHdlZWsgY29tcG9uZW50IG9mIHRoZSBnaXZlbiBkYXRlLlxuICAgKiBAcGFyYW0gZGF0ZSBUaGUgZGF0ZSB0byBleHRyYWN0IHRoZSBkYXkgb2YgdGhlIHdlZWsgZnJvbS5cbiAgICogQHJldHVybnMgVGhlIG1vbnRoIGNvbXBvbmVudCAoMC1pbmRleGVkLCAwID0gU3VuZGF5KS5cbiAgICovXG4gIGFic3RyYWN0IGdldERheU9mV2VlayhkYXRlOiBEKTogbnVtYmVyO1xuXG4gIC8qKlxuICAgKiBHZXRzIGEgbGlzdCBvZiBuYW1lcyBmb3IgdGhlIG1vbnRocy5cbiAgICogQHBhcmFtIHN0eWxlIFRoZSBuYW1pbmcgc3R5bGUgKGUuZy4gbG9uZyA9ICdKYW51YXJ5Jywgc2hvcnQgPSAnSmFuJywgbmFycm93ID0gJ0onKS5cbiAgICogQHJldHVybnMgQW4gb3JkZXJlZCBsaXN0IG9mIGFsbCBtb250aCBuYW1lcywgc3RhcnRpbmcgd2l0aCBKYW51YXJ5LlxuICAgKi9cbiAgYWJzdHJhY3QgZ2V0TW9udGhOYW1lcyhzdHlsZTogJ2xvbmcnIHwgJ3Nob3J0JyB8ICduYXJyb3cnKTogc3RyaW5nW107XG5cbiAgLyoqXG4gICAqIEdldHMgYSBsaXN0IG9mIG5hbWVzIGZvciB0aGUgZGF0ZXMgb2YgdGhlIG1vbnRoLlxuICAgKiBAcmV0dXJucyBBbiBvcmRlcmVkIGxpc3Qgb2YgYWxsIGRhdGUgb2YgdGhlIG1vbnRoIG5hbWVzLCBzdGFydGluZyB3aXRoICcxJy5cbiAgICovXG4gIGFic3RyYWN0IGdldERhdGVOYW1lcygpOiBzdHJpbmdbXTtcblxuICAvKipcbiAgICogR2V0cyBhIGxpc3Qgb2YgbmFtZXMgZm9yIHRoZSBkYXlzIG9mIHRoZSB3ZWVrLlxuICAgKiBAcGFyYW0gc3R5bGUgVGhlIG5hbWluZyBzdHlsZSAoZS5nLiBsb25nID0gJ1N1bmRheScsIHNob3J0ID0gJ1N1bicsIG5hcnJvdyA9ICdTJykuXG4gICAqIEByZXR1cm5zIEFuIG9yZGVyZWQgbGlzdCBvZiBhbGwgd2Vla2RheSBuYW1lcywgc3RhcnRpbmcgd2l0aCBTdW5kYXkuXG4gICAqL1xuICBhYnN0cmFjdCBnZXREYXlPZldlZWtOYW1lcyhzdHlsZTogJ2xvbmcnIHwgJ3Nob3J0JyB8ICduYXJyb3cnKTogc3RyaW5nW107XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIG5hbWUgZm9yIHRoZSB5ZWFyIG9mIHRoZSBnaXZlbiBkYXRlLlxuICAgKiBAcGFyYW0gZGF0ZSBUaGUgZGF0ZSB0byBnZXQgdGhlIHllYXIgbmFtZSBmb3IuXG4gICAqIEByZXR1cm5zIFRoZSBuYW1lIG9mIHRoZSBnaXZlbiB5ZWFyIChlLmcuICcyMDE3JykuXG4gICAqL1xuICBhYnN0cmFjdCBnZXRZZWFyTmFtZShkYXRlOiBEKTogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBmaXJzdCBkYXkgb2YgdGhlIHdlZWsuXG4gICAqIEByZXR1cm5zIFRoZSBmaXJzdCBkYXkgb2YgdGhlIHdlZWsgKDAtaW5kZXhlZCwgMCA9IFN1bmRheSkuXG4gICAqL1xuICBhYnN0cmFjdCBnZXRGaXJzdERheU9mV2VlaygpOiBudW1iZXI7XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIG51bWJlciBvZiBkYXlzIGluIHRoZSBtb250aCBvZiB0aGUgZ2l2ZW4gZGF0ZS5cbiAgICogQHBhcmFtIGRhdGUgVGhlIGRhdGUgd2hvc2UgbW9udGggc2hvdWxkIGJlIGNoZWNrZWQuXG4gICAqIEByZXR1cm5zIFRoZSBudW1iZXIgb2YgZGF5cyBpbiB0aGUgbW9udGggb2YgdGhlIGdpdmVuIGRhdGUuXG4gICAqL1xuICBhYnN0cmFjdCBnZXROdW1EYXlzSW5Nb250aChkYXRlOiBEKTogbnVtYmVyO1xuXG4gIC8qKlxuICAgKiBDbG9uZXMgdGhlIGdpdmVuIGRhdGUuXG4gICAqIEBwYXJhbSBkYXRlIFRoZSBkYXRlIHRvIGNsb25lXG4gICAqIEByZXR1cm5zIEEgbmV3IGRhdGUgZXF1YWwgdG8gdGhlIGdpdmVuIGRhdGUuXG4gICAqL1xuICBhYnN0cmFjdCBjbG9uZShkYXRlOiBEKTogRDtcblxuICAvKipcbiAgICogQ3JlYXRlcyBhIGRhdGUgd2l0aCB0aGUgZ2l2ZW4geWVhciwgbW9udGgsIGFuZCBkYXRlLiBEb2VzIG5vdCBhbGxvdyBvdmVyL3VuZGVyLWZsb3cgb2YgdGhlXG4gICAqIG1vbnRoIGFuZCBkYXRlLlxuICAgKiBAcGFyYW0geWVhciBUaGUgZnVsbCB5ZWFyIG9mIHRoZSBkYXRlLiAoZS5nLiA4OSBtZWFucyB0aGUgeWVhciA4OSwgbm90IHRoZSB5ZWFyIDE5ODkpLlxuICAgKiBAcGFyYW0gbW9udGggVGhlIG1vbnRoIG9mIHRoZSBkYXRlICgwLWluZGV4ZWQsIDAgPSBKYW51YXJ5KS4gTXVzdCBiZSBhbiBpbnRlZ2VyIDAgLSAxMS5cbiAgICogQHBhcmFtIGRhdGUgVGhlIGRhdGUgb2YgbW9udGggb2YgdGhlIGRhdGUuIE11c3QgYmUgYW4gaW50ZWdlciAxIC0gbGVuZ3RoIG9mIHRoZSBnaXZlbiBtb250aC5cbiAgICogQHJldHVybnMgVGhlIG5ldyBkYXRlLCBvciBudWxsIGlmIGludmFsaWQuXG4gICAqL1xuICBhYnN0cmFjdCBjcmVhdGVEYXRlKHllYXI6IG51bWJlciwgbW9udGg6IG51bWJlciwgZGF0ZTogbnVtYmVyKTogRDtcblxuICAvKipcbiAgICogR2V0cyB0b2RheSdzIGRhdGUuXG4gICAqIEByZXR1cm5zIFRvZGF5J3MgZGF0ZS5cbiAgICovXG4gIGFic3RyYWN0IHRvZGF5KCk6IEQ7XG5cbiAgLyoqXG4gICAqIFBhcnNlcyBhIGRhdGUgZnJvbSBhIHVzZXItcHJvdmlkZWQgdmFsdWUuXG4gICAqIEBwYXJhbSB2YWx1ZSBUaGUgdmFsdWUgdG8gcGFyc2UuXG4gICAqIEBwYXJhbSBwYXJzZUZvcm1hdCBUaGUgZXhwZWN0ZWQgZm9ybWF0IG9mIHRoZSB2YWx1ZSBiZWluZyBwYXJzZWRcbiAgICogICAgICh0eXBlIGlzIGltcGxlbWVudGF0aW9uLWRlcGVuZGVudCkuXG4gICAqIEByZXR1cm5zIFRoZSBwYXJzZWQgZGF0ZS5cbiAgICovXG4gIGFic3RyYWN0IHBhcnNlKHZhbHVlOiBhbnksIHBhcnNlRm9ybWF0OiBhbnkpOiBEIHwgbnVsbDtcblxuICAvKipcbiAgICogRm9ybWF0cyBhIGRhdGUgYXMgYSBzdHJpbmcgYWNjb3JkaW5nIHRvIHRoZSBnaXZlbiBmb3JtYXQuXG4gICAqIEBwYXJhbSBkYXRlIFRoZSB2YWx1ZSB0byBmb3JtYXQuXG4gICAqIEBwYXJhbSBkaXNwbGF5Rm9ybWF0IFRoZSBmb3JtYXQgdG8gdXNlIHRvIGRpc3BsYXkgdGhlIGRhdGUgYXMgYSBzdHJpbmcuXG4gICAqIEByZXR1cm5zIFRoZSBmb3JtYXR0ZWQgZGF0ZSBzdHJpbmcuXG4gICAqL1xuICBhYnN0cmFjdCBmb3JtYXQoZGF0ZTogRCwgZGlzcGxheUZvcm1hdDogYW55KTogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBBZGRzIHRoZSBnaXZlbiBudW1iZXIgb2YgeWVhcnMgdG8gdGhlIGRhdGUuIFllYXJzIGFyZSBjb3VudGVkIGFzIGlmIGZsaXBwaW5nIDEyIHBhZ2VzIG9uIHRoZVxuICAgKiBjYWxlbmRhciBmb3IgZWFjaCB5ZWFyIGFuZCB0aGVuIGZpbmRpbmcgdGhlIGNsb3Nlc3QgZGF0ZSBpbiB0aGUgbmV3IG1vbnRoLiBGb3IgZXhhbXBsZSB3aGVuXG4gICAqIGFkZGluZyAxIHllYXIgdG8gRmViIDI5LCAyMDE2LCB0aGUgcmVzdWx0aW5nIGRhdGUgd2lsbCBiZSBGZWIgMjgsIDIwMTcuXG4gICAqIEBwYXJhbSBkYXRlIFRoZSBkYXRlIHRvIGFkZCB5ZWFycyB0by5cbiAgICogQHBhcmFtIHllYXJzIFRoZSBudW1iZXIgb2YgeWVhcnMgdG8gYWRkIChtYXkgYmUgbmVnYXRpdmUpLlxuICAgKiBAcmV0dXJucyBBIG5ldyBkYXRlIGVxdWFsIHRvIHRoZSBnaXZlbiBvbmUgd2l0aCB0aGUgc3BlY2lmaWVkIG51bWJlciBvZiB5ZWFycyBhZGRlZC5cbiAgICovXG4gIGFic3RyYWN0IGFkZENhbGVuZGFyWWVhcnMoZGF0ZTogRCwgeWVhcnM6IG51bWJlcik6IEQ7XG5cbiAgLyoqXG4gICAqIEFkZHMgdGhlIGdpdmVuIG51bWJlciBvZiBtb250aHMgdG8gdGhlIGRhdGUuIE1vbnRocyBhcmUgY291bnRlZCBhcyBpZiBmbGlwcGluZyBhIHBhZ2Ugb24gdGhlXG4gICAqIGNhbGVuZGFyIGZvciBlYWNoIG1vbnRoIGFuZCB0aGVuIGZpbmRpbmcgdGhlIGNsb3Nlc3QgZGF0ZSBpbiB0aGUgbmV3IG1vbnRoLiBGb3IgZXhhbXBsZSB3aGVuXG4gICAqIGFkZGluZyAxIG1vbnRoIHRvIEphbiAzMSwgMjAxNywgdGhlIHJlc3VsdGluZyBkYXRlIHdpbGwgYmUgRmViIDI4LCAyMDE3LlxuICAgKiBAcGFyYW0gZGF0ZSBUaGUgZGF0ZSB0byBhZGQgbW9udGhzIHRvLlxuICAgKiBAcGFyYW0gbW9udGhzIFRoZSBudW1iZXIgb2YgbW9udGhzIHRvIGFkZCAobWF5IGJlIG5lZ2F0aXZlKS5cbiAgICogQHJldHVybnMgQSBuZXcgZGF0ZSBlcXVhbCB0byB0aGUgZ2l2ZW4gb25lIHdpdGggdGhlIHNwZWNpZmllZCBudW1iZXIgb2YgbW9udGhzIGFkZGVkLlxuICAgKi9cbiAgYWJzdHJhY3QgYWRkQ2FsZW5kYXJNb250aHMoZGF0ZTogRCwgbW9udGhzOiBudW1iZXIpOiBEO1xuXG4gIC8qKlxuICAgKiBBZGRzIHRoZSBnaXZlbiBudW1iZXIgb2YgZGF5cyB0byB0aGUgZGF0ZS4gRGF5cyBhcmUgY291bnRlZCBhcyBpZiBtb3Zpbmcgb25lIGNlbGwgb24gdGhlXG4gICAqIGNhbGVuZGFyIGZvciBlYWNoIGRheS5cbiAgICogQHBhcmFtIGRhdGUgVGhlIGRhdGUgdG8gYWRkIGRheXMgdG8uXG4gICAqIEBwYXJhbSBkYXlzIFRoZSBudW1iZXIgb2YgZGF5cyB0byBhZGQgKG1heSBiZSBuZWdhdGl2ZSkuXG4gICAqIEByZXR1cm5zIEEgbmV3IGRhdGUgZXF1YWwgdG8gdGhlIGdpdmVuIG9uZSB3aXRoIHRoZSBzcGVjaWZpZWQgbnVtYmVyIG9mIGRheXMgYWRkZWQuXG4gICAqL1xuICBhYnN0cmFjdCBhZGRDYWxlbmRhckRheXMoZGF0ZTogRCwgZGF5czogbnVtYmVyKTogRDtcblxuICAvKipcbiAgICogR2V0cyB0aGUgUkZDIDMzMzkgY29tcGF0aWJsZSBzdHJpbmcgKGh0dHBzOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmMzMzM5KSBmb3IgdGhlIGdpdmVuIGRhdGUuXG4gICAqIFRoaXMgbWV0aG9kIGlzIHVzZWQgdG8gZ2VuZXJhdGUgZGF0ZSBzdHJpbmdzIHRoYXQgYXJlIGNvbXBhdGlibGUgd2l0aCBuYXRpdmUgSFRNTCBhdHRyaWJ1dGVzXG4gICAqIHN1Y2ggYXMgdGhlIGBtaW5gIG9yIGBtYXhgIGF0dHJpYnV0ZSBvZiBhbiBgPGlucHV0PmAuXG4gICAqIEBwYXJhbSBkYXRlIFRoZSBkYXRlIHRvIGdldCB0aGUgSVNPIGRhdGUgc3RyaW5nIGZvci5cbiAgICogQHJldHVybnMgVGhlIElTTyBkYXRlIHN0cmluZyBkYXRlIHN0cmluZy5cbiAgICovXG4gIGFic3RyYWN0IHRvSXNvODYwMShkYXRlOiBEKTogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBDaGVja3Mgd2hldGhlciB0aGUgZ2l2ZW4gb2JqZWN0IGlzIGNvbnNpZGVyZWQgYSBkYXRlIGluc3RhbmNlIGJ5IHRoaXMgRGF0ZUFkYXB0ZXIuXG4gICAqIEBwYXJhbSBvYmogVGhlIG9iamVjdCB0byBjaGVja1xuICAgKiBAcmV0dXJucyBXaGV0aGVyIHRoZSBvYmplY3QgaXMgYSBkYXRlIGluc3RhbmNlLlxuICAgKi9cbiAgYWJzdHJhY3QgaXNEYXRlSW5zdGFuY2Uob2JqOiBhbnkpOiBib29sZWFuO1xuXG4gIC8qKlxuICAgKiBDaGVja3Mgd2hldGhlciB0aGUgZ2l2ZW4gZGF0ZSBpcyB2YWxpZC5cbiAgICogQHBhcmFtIGRhdGUgVGhlIGRhdGUgdG8gY2hlY2suXG4gICAqIEByZXR1cm5zIFdoZXRoZXIgdGhlIGRhdGUgaXMgdmFsaWQuXG4gICAqL1xuICBhYnN0cmFjdCBpc1ZhbGlkKGRhdGU6IEQpOiBib29sZWFuO1xuXG4gIC8qKlxuICAgKiBHZXRzIGRhdGUgaW5zdGFuY2UgdGhhdCBpcyBub3QgdmFsaWQuXG4gICAqIEByZXR1cm5zIEFuIGludmFsaWQgZGF0ZS5cbiAgICovXG4gIGFic3RyYWN0IGludmFsaWQoKTogRDtcblxuICAvKipcbiAgICogR2l2ZW4gYSBwb3RlbnRpYWwgZGF0ZSBvYmplY3QsIHJldHVybnMgdGhhdCBzYW1lIGRhdGUgb2JqZWN0IGlmIGl0IGlzXG4gICAqIGEgdmFsaWQgZGF0ZSwgb3IgYG51bGxgIGlmIGl0J3Mgbm90IGEgdmFsaWQgZGF0ZS5cbiAgICogQHBhcmFtIG9iaiBUaGUgb2JqZWN0IHRvIGNoZWNrLlxuICAgKiBAcmV0dXJucyBBIGRhdGUgb3IgYG51bGxgLlxuICAgKi9cbiAgZ2V0VmFsaWREYXRlT3JOdWxsKG9iajogdW5rbm93bik6IEQgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5pc0RhdGVJbnN0YW5jZShvYmopICYmIHRoaXMuaXNWYWxpZChvYmogYXMgRCkgPyAob2JqIGFzIEQpIDogbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBBdHRlbXB0cyB0byBkZXNlcmlhbGl6ZSBhIHZhbHVlIHRvIGEgdmFsaWQgZGF0ZSBvYmplY3QuIFRoaXMgaXMgZGlmZmVyZW50IGZyb20gcGFyc2luZyBpbiB0aGF0XG4gICAqIGRlc2VyaWFsaXplIHNob3VsZCBvbmx5IGFjY2VwdCBub24tYW1iaWd1b3VzLCBsb2NhbGUtaW5kZXBlbmRlbnQgZm9ybWF0cyAoZS5nLiBhIElTTyA4NjAxXG4gICAqIHN0cmluZykuIFRoZSBkZWZhdWx0IGltcGxlbWVudGF0aW9uIGRvZXMgbm90IGFsbG93IGFueSBkZXNlcmlhbGl6YXRpb24sIGl0IHNpbXBseSBjaGVja3MgdGhhdFxuICAgKiB0aGUgZ2l2ZW4gdmFsdWUgaXMgYWxyZWFkeSBhIHZhbGlkIGRhdGUgb2JqZWN0IG9yIG51bGwuIFRoZSBgPGRhdGVwaWNrZXI+YCB3aWxsIGNhbGwgdGhpc1xuICAgKiBtZXRob2Qgb24gYWxsIG9mIGl0cyBgQElucHV0KClgIHByb3BlcnRpZXMgdGhhdCBhY2NlcHQgZGF0ZXMuIEl0IGlzIHRoZXJlZm9yZSBwb3NzaWJsZSB0b1xuICAgKiBzdXBwb3J0IHBhc3NpbmcgdmFsdWVzIGZyb20geW91ciBiYWNrZW5kIGRpcmVjdGx5IHRvIHRoZXNlIHByb3BlcnRpZXMgYnkgb3ZlcnJpZGluZyB0aGlzIG1ldGhvZFxuICAgKiB0byBhbHNvIGRlc2VyaWFsaXplIHRoZSBmb3JtYXQgdXNlZCBieSB5b3VyIGJhY2tlbmQuXG4gICAqIEBwYXJhbSB2YWx1ZSBUaGUgdmFsdWUgdG8gYmUgZGVzZXJpYWxpemVkIGludG8gYSBkYXRlIG9iamVjdC5cbiAgICogQHJldHVybnMgVGhlIGRlc2VyaWFsaXplZCBkYXRlIG9iamVjdCwgZWl0aGVyIGEgdmFsaWQgZGF0ZSwgbnVsbCBpZiB0aGUgdmFsdWUgY2FuIGJlXG4gICAqICAgICBkZXNlcmlhbGl6ZWQgaW50byBhIG51bGwgZGF0ZSAoZS5nLiB0aGUgZW1wdHkgc3RyaW5nKSwgb3IgYW4gaW52YWxpZCBkYXRlLlxuICAgKi9cbiAgZGVzZXJpYWxpemUodmFsdWU6IGFueSk6IEQgfCBudWxsIHtcbiAgICBpZiAodmFsdWUgPT0gbnVsbCB8fCAodGhpcy5pc0RhdGVJbnN0YW5jZSh2YWx1ZSkgJiYgdGhpcy5pc1ZhbGlkKHZhbHVlKSkpIHtcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuaW52YWxpZCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIGxvY2FsZSB1c2VkIGZvciBhbGwgZGF0ZXMuXG4gICAqIEBwYXJhbSBsb2NhbGUgVGhlIG5ldyBsb2NhbGUuXG4gICAqL1xuICBzZXRMb2NhbGUobG9jYWxlOiBMKSB7XG4gICAgdGhpcy5sb2NhbGUgPSBsb2NhbGU7XG4gICAgdGhpcy5fbG9jYWxlQ2hhbmdlcy5uZXh0KCk7XG4gIH1cblxuICAvKipcbiAgICogQ29tcGFyZXMgdHdvIGRhdGVzLlxuICAgKiBAcGFyYW0gZmlyc3QgVGhlIGZpcnN0IGRhdGUgdG8gY29tcGFyZS5cbiAgICogQHBhcmFtIHNlY29uZCBUaGUgc2Vjb25kIGRhdGUgdG8gY29tcGFyZS5cbiAgICogQHJldHVybnMgMCBpZiB0aGUgZGF0ZXMgYXJlIGVxdWFsLCBhIG51bWJlciBsZXNzIHRoYW4gMCBpZiB0aGUgZmlyc3QgZGF0ZSBpcyBlYXJsaWVyLFxuICAgKiAgICAgYSBudW1iZXIgZ3JlYXRlciB0aGFuIDAgaWYgdGhlIGZpcnN0IGRhdGUgaXMgbGF0ZXIuXG4gICAqL1xuICBjb21wYXJlRGF0ZShmaXJzdDogRCwgc2Vjb25kOiBEKTogbnVtYmVyIHtcbiAgICByZXR1cm4gKFxuICAgICAgdGhpcy5nZXRZZWFyKGZpcnN0KSAtIHRoaXMuZ2V0WWVhcihzZWNvbmQpIHx8XG4gICAgICB0aGlzLmdldE1vbnRoKGZpcnN0KSAtIHRoaXMuZ2V0TW9udGgoc2Vjb25kKSB8fFxuICAgICAgdGhpcy5nZXREYXRlKGZpcnN0KSAtIHRoaXMuZ2V0RGF0ZShzZWNvbmQpXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3MgaWYgdHdvIGRhdGVzIGFyZSBlcXVhbC5cbiAgICogQHBhcmFtIGZpcnN0IFRoZSBmaXJzdCBkYXRlIHRvIGNoZWNrLlxuICAgKiBAcGFyYW0gc2Vjb25kIFRoZSBzZWNvbmQgZGF0ZSB0byBjaGVjay5cbiAgICogQHJldHVybnMgV2hldGhlciB0aGUgdHdvIGRhdGVzIGFyZSBlcXVhbC5cbiAgICogICAgIE51bGwgZGF0ZXMgYXJlIGNvbnNpZGVyZWQgZXF1YWwgdG8gb3RoZXIgbnVsbCBkYXRlcy5cbiAgICovXG4gIHNhbWVEYXRlKGZpcnN0OiBEIHwgbnVsbCwgc2Vjb25kOiBEIHwgbnVsbCk6IGJvb2xlYW4ge1xuICAgIGlmIChmaXJzdCAmJiBzZWNvbmQpIHtcbiAgICAgIGNvbnN0IGZpcnN0VmFsaWQgPSB0aGlzLmlzVmFsaWQoZmlyc3QpO1xuICAgICAgY29uc3Qgc2Vjb25kVmFsaWQgPSB0aGlzLmlzVmFsaWQoc2Vjb25kKTtcbiAgICAgIGlmIChmaXJzdFZhbGlkICYmIHNlY29uZFZhbGlkKSB7XG4gICAgICAgIHJldHVybiAhdGhpcy5jb21wYXJlRGF0ZShmaXJzdCwgc2Vjb25kKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBmaXJzdFZhbGlkID09IHNlY29uZFZhbGlkO1xuICAgIH1cbiAgICByZXR1cm4gZmlyc3QgPT0gc2Vjb25kO1xuICB9XG5cbiAgLyoqXG4gICAqIENsYW1wIHRoZSBnaXZlbiBkYXRlIGJldHdlZW4gbWluIGFuZCBtYXggZGF0ZXMuXG4gICAqIEBwYXJhbSBkYXRlIFRoZSBkYXRlIHRvIGNsYW1wLlxuICAgKiBAcGFyYW0gbWluIFRoZSBtaW5pbXVtIHZhbHVlIHRvIGFsbG93LiBJZiBudWxsIG9yIG9taXR0ZWQgbm8gbWluIGlzIGVuZm9yY2VkLlxuICAgKiBAcGFyYW0gbWF4IFRoZSBtYXhpbXVtIHZhbHVlIHRvIGFsbG93LiBJZiBudWxsIG9yIG9taXR0ZWQgbm8gbWF4IGlzIGVuZm9yY2VkLlxuICAgKiBAcmV0dXJucyBgbWluYCBpZiBgZGF0ZWAgaXMgbGVzcyB0aGFuIGBtaW5gLCBgbWF4YCBpZiBkYXRlIGlzIGdyZWF0ZXIgdGhhbiBgbWF4YCxcbiAgICogICAgIG90aGVyd2lzZSBgZGF0ZWAuXG4gICAqL1xuICBjbGFtcERhdGUoZGF0ZTogRCwgbWluPzogRCB8IG51bGwsIG1heD86IEQgfCBudWxsKTogRCB7XG4gICAgaWYgKG1pbiAmJiB0aGlzLmNvbXBhcmVEYXRlKGRhdGUsIG1pbikgPCAwKSB7XG4gICAgICByZXR1cm4gbWluO1xuICAgIH1cbiAgICBpZiAobWF4ICYmIHRoaXMuY29tcGFyZURhdGUoZGF0ZSwgbWF4KSA+IDApIHtcbiAgICAgIHJldHVybiBtYXg7XG4gICAgfVxuICAgIHJldHVybiBkYXRlO1xuICB9XG59XG4iXX0=