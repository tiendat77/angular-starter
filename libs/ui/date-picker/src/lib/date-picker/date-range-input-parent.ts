import { DateFilterFn } from './datepicker-input-base';

/**
 * What the start and end inputs need from the `<date-range-input>` they sit in. A token of its own,
 * so the inputs do not import the component that queries them (which would be circular).
 */
export abstract class DateRangeInputParent<D> {
  abstract min: D | null;
  abstract max: D | null;
  abstract dateFilter: DateFilterFn<D | null>;

  /** `[disabled]` on the wrapper only: it disables both inputs; each input's own state is separate. */
  abstract readonly _disabledInput: boolean;

  /** Opens the range picker (Alt + Down in either input). */
  abstract _openPicker(): void;

  /** An input wrote the model: both inputs revalidate (the start must not be after the end). */
  abstract _handleChildValueChange(): void;
}
