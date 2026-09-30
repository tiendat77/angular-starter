import { Directive, TemplateRef, inject } from '@angular/core';

/** Context of the `datepickerDayExtra` template. */
export interface DatepickerDayExtraContext<D = any> {
  /** The date of the cell the template is rendered in. */
  $implicit: D;
}

/**
 * Marks an `<ng-template>` that renders extra content below the day number of every cell in the
 * month view (e.g. the best price of the day). Place it inside `<date-picker>`:
 *
 * ```html
 * <date-picker>
 *   <ng-template datepickerDayExtra let-date>{{ priceOf(date) }}</ng-template>
 * </date-picker>
 * ```
 */
@Directive({
  selector: 'ng-template[datepickerDayExtra]',
})
export class DatepickerDayExtra<D = any> {
  readonly template = inject<TemplateRef<DatepickerDayExtraContext<D>>>(TemplateRef);

  static ngTemplateContextGuard<D>(
    _dir: DatepickerDayExtra<D>,
    _ctx: unknown
  ): _ctx is DatepickerDayExtraContext<D> {
    return true;
  }
}
