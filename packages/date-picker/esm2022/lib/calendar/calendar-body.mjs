/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Platform, normalizePassiveListenerOptions } from '@angular/cdk/platform';
import { NgClass } from '@angular/common';
import * as i0 from '@angular/core';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation,
  inject,
} from '@angular/core';
import { take } from 'rxjs/operators';
/**
 * An internal class that represents the data corresponding to a single calendar cell.
 * @docs-private
 */
export class CalendarCell {
  value;
  displayValue;
  ariaLabel;
  enabled;
  cssClasses;
  compareValue;
  rawValue;
  constructor(
    value,
    displayValue,
    ariaLabel,
    enabled,
    cssClasses = {},
    compareValue = value,
    rawValue
  ) {
    this.value = value;
    this.displayValue = displayValue;
    this.ariaLabel = ariaLabel;
    this.enabled = enabled;
    this.cssClasses = cssClasses;
    this.compareValue = compareValue;
    this.rawValue = rawValue;
  }
}
let calendarBodyId = 1;
/** Event options that can be used to bind an active, capturing event. */
const activeCapturingEventOptions = normalizePassiveListenerOptions({
  passive: false,
  capture: true,
});
/** Event options that can be used to bind a passive, capturing event. */
const passiveCapturingEventOptions = normalizePassiveListenerOptions({
  passive: true,
  capture: true,
});
/** Event options that can be used to bind a passive, non-capturing event. */
const passiveEventOptions = normalizePassiveListenerOptions({ passive: true });
/**
 * An internal component used to display calendar data in a table.
 * @docs-private
 */
export class CalendarBody {
  _elementRef;
  _ngZone;
  _platform = inject(Platform);
  /**
   * Used to skip the next focus event when rendering the preview range.
   * We need a flag like this, because some browsers fire focus events asynchronously.
   */
  _skipNextFocus;
  /**
   * Used to focus the active cell after change detection has run.
   */
  _focusActiveCellAfterViewChecked = false;
  /** The label for the table. (e.g. "Jan 2017"). */
  label;
  /** The cells to display in the table. */
  rows;
  /** The value in the table that corresponds to today. */
  todayValue;
  /** Start value of the selected date range. */
  startValue;
  /** End value of the selected date range. */
  endValue;
  /** The minimum number of free cells needed to fit the label in the first row. */
  labelMinRequiredCells;
  /** The number of columns in the table. */
  numCols = 7;
  /** The cell number of the active cell in the table. */
  activeCell = 0;
  ngAfterViewChecked() {
    if (this._focusActiveCellAfterViewChecked) {
      this._focusActiveCell();
      this._focusActiveCellAfterViewChecked = false;
    }
  }
  /** Whether a range is being selected. */
  isRange = false;
  /**
   * The aspect ratio (width / height) to use for the cells in the table. This aspect ratio will be
   * maintained even as the table resizes.
   */
  cellAspectRatio = 1;
  /** Start of the comparison range. */
  comparisonStart;
  /** End of the comparison range. */
  comparisonEnd;
  /** Start of the preview range. */
  previewStart = null;
  /** End of the preview range. */
  previewEnd = null;
  /** ARIA Accessible name of the `<input startDate/>` */
  startDateAccessibleName;
  /** ARIA Accessible name of the `<input endDate/>` */
  endDateAccessibleName;
  /** Emits when a new value is selected. */
  selectedValueChange = new EventEmitter();
  /** Emits when the preview has changed as a result of a user action. */
  previewChange = new EventEmitter();
  activeDateChange = new EventEmitter();
  /** Emits the date at the possible start of a drag event. */
  dragStarted = new EventEmitter();
  /** Emits the date at the conclusion of a drag, or null if mouse was not released on a date. */
  dragEnded = new EventEmitter();
  /** The number of blank cells to put at the beginning for the first row. */
  _firstRowOffset;
  /** Padding for the individual date cells. */
  _cellPadding;
  /** Width of an individual cell. */
  _cellWidth;
  _didDragSinceMouseDown = false;
  constructor(_elementRef, _ngZone) {
    this._elementRef = _elementRef;
    this._ngZone = _ngZone;
    _ngZone.runOutsideAngular(() => {
      const element = _elementRef.nativeElement;
      // `touchmove` is active since we need to call `preventDefault`.
      element.addEventListener('touchmove', this._touchmoveHandler, activeCapturingEventOptions);
      element.addEventListener('mouseenter', this._enterHandler, passiveCapturingEventOptions);
      element.addEventListener('focus', this._enterHandler, passiveCapturingEventOptions);
      element.addEventListener('mouseleave', this._leaveHandler, passiveCapturingEventOptions);
      element.addEventListener('blur', this._leaveHandler, passiveCapturingEventOptions);
      element.addEventListener('mousedown', this._mousedownHandler, passiveEventOptions);
      element.addEventListener('touchstart', this._mousedownHandler, passiveEventOptions);
      if (this._platform.isBrowser) {
        window.addEventListener('mouseup', this._mouseupHandler);
        window.addEventListener('touchend', this._touchendHandler);
      }
    });
  }
  /** Called when a cell is clicked. */
  _cellClicked(cell, event) {
    // Ignore "clicks" that are actually canceled drags (eg the user dragged
    // off and then went back to this cell to undo).
    if (this._didDragSinceMouseDown) {
      return;
    }
    if (cell.enabled) {
      this.selectedValueChange.emit({ value: cell.value, event });
    }
  }
  _emitActiveDateChange(cell, event) {
    if (cell.enabled) {
      this.activeDateChange.emit({ value: cell.value, event });
    }
  }
  /** Returns whether a cell should be marked as selected. */
  _isSelected(value) {
    return this.startValue === value || this.endValue === value;
  }
  ngOnChanges(changes) {
    const columnChanges = changes['numCols'];
    const { rows, numCols } = this;
    if (changes['rows'] || columnChanges) {
      this._firstRowOffset = rows && rows.length && rows[0].length ? numCols - rows[0].length : 0;
    }
    if (changes['cellAspectRatio'] || columnChanges || !this._cellPadding) {
      this._cellPadding = `${(50 * this.cellAspectRatio) / numCols}%`;
    }
    if (columnChanges || !this._cellWidth) {
      this._cellWidth = `${100 / numCols}%`;
    }
  }
  ngOnDestroy() {
    const element = this._elementRef.nativeElement;
    element.removeEventListener('touchmove', this._touchmoveHandler, activeCapturingEventOptions);
    element.removeEventListener('mouseenter', this._enterHandler, passiveCapturingEventOptions);
    element.removeEventListener('focus', this._enterHandler, passiveCapturingEventOptions);
    element.removeEventListener('mouseleave', this._leaveHandler, passiveCapturingEventOptions);
    element.removeEventListener('blur', this._leaveHandler, passiveCapturingEventOptions);
    element.removeEventListener('mousedown', this._mousedownHandler, passiveEventOptions);
    element.removeEventListener('touchstart', this._mousedownHandler, passiveEventOptions);
    if (this._platform.isBrowser) {
      window.removeEventListener('mouseup', this._mouseupHandler);
      window.removeEventListener('touchend', this._touchendHandler);
    }
  }
  /** Returns whether a cell is active. */
  _isActiveCell(rowIndex, colIndex) {
    let cellNumber = rowIndex * this.numCols + colIndex;
    // Account for the fact that the first row may not have as many cells.
    if (rowIndex) {
      cellNumber -= this._firstRowOffset;
    }
    return cellNumber == this.activeCell;
  }
  /**
   * Focuses the active cell after the microtask queue is empty.
   *
   * Adding a 0ms setTimeout seems to fix Voiceover losing focus when pressing PageUp/PageDown
   * (issue #24330).
   *
   * Determined a 0ms by gradually increasing duration from 0 and testing two use cases with screen
   * reader enabled:
   *
   * 1. Pressing PageUp/PageDown repeatedly with pausing between each key press.
   * 2. Pressing and holding the PageDown key with repeated keys enabled.
   *
   * Test 1 worked roughly 95-99% of the time with 0ms and got a little bit better as the duration
   * increased. Test 2 got slightly better until the duration was long enough to interfere with
   * repeated keys. If the repeated key speed was faster than the timeout duration, then pressing
   * and holding pagedown caused the entire page to scroll.
   *
   * Since repeated key speed can verify across machines, determined that any duration could
   * potentially interfere with repeated keys. 0ms would be best because it almost entirely
   * eliminates the focus being lost in Voiceover (#24330) without causing unintended side effects.
   * Adding delay also complicates writing tests.
   */
  _focusActiveCell(movePreview = true) {
    this._ngZone.runOutsideAngular(() => {
      this._ngZone.onStable.pipe(take(1)).subscribe(() => {
        setTimeout(() => {
          const activeCell = this._elementRef.nativeElement.querySelector('.calendar-body-active');
          if (activeCell) {
            if (!movePreview) {
              this._skipNextFocus = true;
            }
            activeCell.focus();
          }
        });
      });
    });
  }
  /** Focuses the active cell after change detection has run and the microtask queue is empty. */
  _scheduleFocusActiveCellAfterViewChecked() {
    this._focusActiveCellAfterViewChecked = true;
  }
  /** Gets whether a value is the start of the main range. */
  _isRangeStart(value) {
    return isStart(value, this.startValue, this.endValue);
  }
  /** Gets whether a value is the end of the main range. */
  _isRangeEnd(value) {
    return isEnd(value, this.startValue, this.endValue);
  }
  /** Gets whether a value is within the currently-selected range. */
  _isInRange(value) {
    return isInRange(value, this.startValue, this.endValue, this.isRange);
  }
  /** Gets whether a value is the start of the comparison range. */
  _isComparisonStart(value) {
    return isStart(value, this.comparisonStart, this.comparisonEnd);
  }
  /** Whether the cell is a start bridge cell between the main and comparison ranges. */
  _isComparisonBridgeStart(value, rowIndex, colIndex) {
    if (!this._isComparisonStart(value) || this._isRangeStart(value) || !this._isInRange(value)) {
      return false;
    }
    let previousCell = this.rows[rowIndex][colIndex - 1];
    if (!previousCell) {
      const previousRow = this.rows[rowIndex - 1];
      previousCell = previousRow && previousRow[previousRow.length - 1];
    }
    return previousCell && !this._isRangeEnd(previousCell.compareValue);
  }
  /** Whether the cell is an end bridge cell between the main and comparison ranges. */
  _isComparisonBridgeEnd(value, rowIndex, colIndex) {
    if (!this._isComparisonEnd(value) || this._isRangeEnd(value) || !this._isInRange(value)) {
      return false;
    }
    let nextCell = this.rows[rowIndex][colIndex + 1];
    if (!nextCell) {
      const nextRow = this.rows[rowIndex + 1];
      nextCell = nextRow && nextRow[0];
    }
    return nextCell && !this._isRangeStart(nextCell.compareValue);
  }
  /** Gets whether a value is the end of the comparison range. */
  _isComparisonEnd(value) {
    return isEnd(value, this.comparisonStart, this.comparisonEnd);
  }
  /** Gets whether a value is within the current comparison range. */
  _isInComparisonRange(value) {
    return isInRange(value, this.comparisonStart, this.comparisonEnd, this.isRange);
  }
  /**
   * Gets whether a value is the same as the start and end of the comparison range.
   * For context, the functions that we use to determine whether something is the start/end of
   * a range don't allow for the start and end to be on the same day, because we'd have to use
   * much more specific CSS selectors to style them correctly in all scenarios. This is fine for
   * the regular range, because when it happens, the selected styles take over and still show where
   * the range would've been, however we don't have these selected styles for a comparison range.
   * This function is used to apply a class that serves the same purpose as the one for selected
   * dates, but it only applies in the context of a comparison range.
   */
  _isComparisonIdentical(value) {
    // Note that we don't need to null check the start/end
    // here, because the `value` will always be defined.
    return this.comparisonStart === this.comparisonEnd && value === this.comparisonStart;
  }
  /** Gets whether a value is the start of the preview range. */
  _isPreviewStart(value) {
    return isStart(value, this.previewStart, this.previewEnd);
  }
  /** Gets whether a value is the end of the preview range. */
  _isPreviewEnd(value) {
    return isEnd(value, this.previewStart, this.previewEnd);
  }
  /** Gets whether a value is inside the preview range. */
  _isInPreview(value) {
    return isInRange(value, this.previewStart, this.previewEnd, this.isRange);
  }
  /** Gets ids of aria descriptions for the start and end of a date range. */
  _getDescribedby(value) {
    if (!this.isRange) {
      return null;
    }
    if (this.startValue === value && this.endValue === value) {
      return `${this._startDateLabelId} ${this._endDateLabelId}`;
    } else if (this.startValue === value) {
      return this._startDateLabelId;
    } else if (this.endValue === value) {
      return this._endDateLabelId;
    }
    return null;
  }
  /**
   * Event handler for when the user enters an element
   * inside the calendar body (e.g. by hovering in or focus).
   */
  _enterHandler = (event) => {
    if (this._skipNextFocus && event.type === 'focus') {
      this._skipNextFocus = false;
      return;
    }
    // We only need to hit the zone when we're selecting a range.
    if (event.target && this.isRange) {
      const cell = this._getCellFromElement(event.target);
      if (cell) {
        this._ngZone.run(() =>
          this.previewChange.emit({ value: cell.enabled ? cell : null, event })
        );
      }
    }
  };
  _touchmoveHandler = (event) => {
    if (!this.isRange) return;
    const target = getActualTouchTarget(event);
    const cell = target ? this._getCellFromElement(target) : null;
    if (target !== event.target) {
      this._didDragSinceMouseDown = true;
    }
    // If the initial target of the touch is a date cell, prevent default so
    // that the move is not handled as a scroll.
    if (getCellElement(event.target)) {
      event.preventDefault();
    }
    this._ngZone.run(() => this.previewChange.emit({ value: cell?.enabled ? cell : null, event }));
  };
  /**
   * Event handler for when the user's pointer leaves an element
   * inside the calendar body (e.g. by hovering out or blurring).
   */
  _leaveHandler = (event) => {
    // We only need to hit the zone when we're selecting a range.
    if (this.previewEnd !== null && this.isRange) {
      if (event.type !== 'blur') {
        this._didDragSinceMouseDown = true;
      }
      // Only reset the preview end value when leaving cells. This looks better, because
      // we have a gap between the cells and the rows and we don't want to remove the
      // range just for it to show up again when the user moves a few pixels to the side.
      if (
        event.target &&
        this._getCellFromElement(event.target) &&
        !(event.relatedTarget && this._getCellFromElement(event.relatedTarget))
      ) {
        this._ngZone.run(() => this.previewChange.emit({ value: null, event }));
      }
    }
  };
  /**
   * Triggered on mousedown or touchstart on a date cell.
   * Respsonsible for starting a drag sequence.
   */
  _mousedownHandler = (event) => {
    if (!this.isRange) return;
    this._didDragSinceMouseDown = false;
    // Begin a drag if a cell within the current range was targeted.
    const cell = event.target && this._getCellFromElement(event.target);
    if (!cell || !this._isInRange(cell.compareValue)) {
      return;
    }
    this._ngZone.run(() => {
      this.dragStarted.emit({
        value: cell.rawValue,
        event,
      });
    });
  };
  /** Triggered on mouseup anywhere. Respsonsible for ending a drag sequence. */
  _mouseupHandler = (event) => {
    if (!this.isRange) return;
    const cellElement = getCellElement(event.target);
    if (!cellElement) {
      // Mouseup happened outside of datepicker. Cancel drag.
      this._ngZone.run(() => {
        this.dragEnded.emit({ value: null, event });
      });
      return;
    }
    if (cellElement.closest('.calendar-body') !== this._elementRef.nativeElement) {
      // Mouseup happened inside a different month instance.
      // Allow it to handle the event.
      return;
    }
    this._ngZone.run(() => {
      const cell = this._getCellFromElement(cellElement);
      this.dragEnded.emit({ value: cell?.rawValue ?? null, event });
    });
  };
  /** Triggered on touchend anywhere. Respsonsible for ending a drag sequence. */
  _touchendHandler = (event) => {
    const target = getActualTouchTarget(event);
    if (target) {
      this._mouseupHandler({ target });
    }
  };
  /** Finds the MatCalendarCell that corresponds to a DOM node. */
  _getCellFromElement(element) {
    const cell = getCellElement(element);
    if (cell) {
      const row = cell.getAttribute('data-row');
      const col = cell.getAttribute('data-col');
      if (row && col) {
        return this.rows[parseInt(row)][parseInt(col)];
      }
    }
    return null;
  }
  _id = `calendar-body-${calendarBodyId++}`;
  _startDateLabelId = `${this._id}-start-date`;
  _endDateLabelId = `${this._id}-end-date`;
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: '12.0.0',
    version: '18.2.13',
    ngImport: i0,
    type: CalendarBody,
    deps: [{ token: i0.ElementRef }, { token: i0.NgZone }],
    target: i0.ɵɵFactoryTarget.Component,
  });
  static ɵcmp = i0.ɵɵngDeclareComponent({
    minVersion: '17.0.0',
    version: '18.2.13',
    type: CalendarBody,
    isStandalone: true,
    selector: '[calendar-body]',
    inputs: {
      label: 'label',
      rows: 'rows',
      todayValue: 'todayValue',
      startValue: 'startValue',
      endValue: 'endValue',
      labelMinRequiredCells: 'labelMinRequiredCells',
      numCols: 'numCols',
      activeCell: 'activeCell',
      isRange: 'isRange',
      cellAspectRatio: 'cellAspectRatio',
      comparisonStart: 'comparisonStart',
      comparisonEnd: 'comparisonEnd',
      previewStart: 'previewStart',
      previewEnd: 'previewEnd',
      startDateAccessibleName: 'startDateAccessibleName',
      endDateAccessibleName: 'endDateAccessibleName',
    },
    outputs: {
      selectedValueChange: 'selectedValueChange',
      previewChange: 'previewChange',
      activeDateChange: 'activeDateChange',
      dragStarted: 'dragStarted',
      dragEnded: 'dragEnded',
    },
    host: { classAttribute: 'calendar-body' },
    exportAs: ['calendarBody'],
    usesOnChanges: true,
    ngImport: i0,
    template:
      '<!-- eslint-disable @angular-eslint/template/no-call-expression -->\n<!-- Create the first row separately so we can include a special spacer cell. -->\n@for (row of rows; track row; let rowIndex = $index) {\n  <tr role="row">\n    <!--\n      This cell is purely decorative, but we can\'t put `aria-hidden` or `role="presentation"` on it,\n      because it throws off the week days for the rest of the row on NVDA. The aspect ratio of the\n      table cells is maintained by setting the top and bottom padding as a percentage of the width\n      (a variant of the trick described here: https://www.w3schools.com/howto/howto_css_aspect_ratio.asp).\n    -->\n    @if (rowIndex === 0 && _firstRowOffset) {\n      <td\n        class="calendar-body-label"\n        [attr.colspan]="_firstRowOffset"\n        [style.paddingTop]="_cellPadding"\n        [style.paddingBottom]="_cellPadding"\n      ></td>\n    }\n    <!--\n      Each gridcell in the calendar contains a button, which signals to assistive technology that the\n      cell is intractable, as well as the selection state via `aria-pressed`. See #23476 for\n      background.\n    -->\n    @for (item of row; track item; let colIndex = $index) {\n      <td\n        role="gridcell"\n        class="calendar-body-cell-container"\n        [style.width]="_cellWidth"\n        [style.paddingTop]="_cellPadding"\n        [style.paddingBottom]="_cellPadding"\n        [attr.data-row]="rowIndex"\n        [attr.data-col]="colIndex"\n      >\n        <button\n          type="button"\n          class="calendar-body-cell"\n          [ngClass]="item.cssClasses"\n          [tabindex]="_isActiveCell(rowIndex, colIndex) ? 0 : -1"\n          [class.calendar-body-disabled]="!item.enabled"\n          [class.calendar-body-active]="_isActiveCell(rowIndex, colIndex)"\n          [class.calendar-body-range-start]="_isRangeStart(item.compareValue)"\n          [class.calendar-body-range-end]="_isRangeEnd(item.compareValue)"\n          [class.calendar-body-in-range]="_isInRange(item.compareValue)"\n          [class.calendar-body-comparison-bridge-start]="\n            _isComparisonBridgeStart(item.compareValue, rowIndex, colIndex)\n          "\n          [class.calendar-body-comparison-bridge-end]="\n            _isComparisonBridgeEnd(item.compareValue, rowIndex, colIndex)\n          "\n          [class.calendar-body-comparison-start]="_isComparisonStart(item.compareValue)"\n          [class.calendar-body-comparison-end]="_isComparisonEnd(item.compareValue)"\n          [class.calendar-body-in-comparison-range]="_isInComparisonRange(item.compareValue)"\n          [class.calendar-body-preview-start]="_isPreviewStart(item.compareValue)"\n          [class.calendar-body-preview-end]="_isPreviewEnd(item.compareValue)"\n          [class.calendar-body-in-preview]="_isInPreview(item.compareValue)"\n          [attr.aria-label]="item.ariaLabel"\n          [attr.aria-disabled]="!item.enabled || null"\n          [attr.aria-pressed]="_isSelected(item.compareValue)"\n          [attr.aria-current]="todayValue === item.compareValue ? \'date\' : null"\n          [attr.aria-describedby]="_getDescribedby(item.compareValue)"\n          (click)="_cellClicked(item, $event)"\n          (focus)="_emitActiveDateChange(item, $event)"\n        >\n          <span\n            class="calendar-body-cell-content focus-indicator"\n            [class.calendar-body-selected]="_isSelected(item.compareValue)"\n            [class.calendar-body-comparison-identical]="_isComparisonIdentical(item.compareValue)"\n            [class.calendar-body-today]="todayValue === item.compareValue"\n          >\n            {{ item.displayValue }}\n          </span>\n          <span\n            class="calendar-body-cell-preview"\n            aria-hidden="true"\n          ></span>\n        </button>\n      </td>\n    }\n  </tr>\n}\n\n<label\n  class="calendar-body-hidden-label"\n  for=""\n  [id]="_startDateLabelId"\n>\n  {{ startDateAccessibleName }}\n</label>\n\n<label\n  class="calendar-body-hidden-label"\n  for=""\n  [id]="_endDateLabelId"\n>\n  {{ endDateAccessibleName }}\n</label>\n',
    styles: [
      '.calendar-body{min-width:17.5rem}.calendar-body-today{border-color:var(--border)!important}.calendar-body-label{height:0;line-height:0;text-align:start;padding-left:4.7142857143%;padding-right:4.7142857143%}.calendar-body-hidden-label{display:none}.calendar-body-cell-container{position:relative;height:0;line-height:0}.calendar-body-cell{position:absolute;top:0;left:0;width:100%;height:100%;background:none;text-align:center;outline:none;font-family:inherit;margin:0}.calendar-body-cell-content{top:5%;left:5%;z-index:1;display:flex;align-items:center;justify-content:center;box-sizing:border-box;width:90%;height:90%;line-height:1;border-width:1px;border-style:solid;border-radius:999px;border-color:transparent}.calendar-body-cell-content.focus-indicator{position:absolute}.calendar-body-active .calendar-body-cell-content{background-color:var(--primary);color:var(--on-primary)}\n',
    ],
    dependencies: [
      { kind: 'directive', type: NgClass, selector: '[ngClass]', inputs: ['class', 'ngClass'] },
    ],
    changeDetection: i0.ChangeDetectionStrategy.OnPush,
    encapsulation: i0.ViewEncapsulation.None,
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: '12.0.0',
  version: '18.2.13',
  ngImport: i0,
  type: CalendarBody,
  decorators: [
    {
      type: Component,
      args: [
        {
          selector: '[calendar-body]',
          host: {
            class: 'calendar-body',
          },
          exportAs: 'calendarBody',
          standalone: true,
          encapsulation: ViewEncapsulation.None,
          changeDetection: ChangeDetectionStrategy.OnPush,
          imports: [NgClass],
          template:
            '<!-- eslint-disable @angular-eslint/template/no-call-expression -->\n<!-- Create the first row separately so we can include a special spacer cell. -->\n@for (row of rows; track row; let rowIndex = $index) {\n  <tr role="row">\n    <!--\n      This cell is purely decorative, but we can\'t put `aria-hidden` or `role="presentation"` on it,\n      because it throws off the week days for the rest of the row on NVDA. The aspect ratio of the\n      table cells is maintained by setting the top and bottom padding as a percentage of the width\n      (a variant of the trick described here: https://www.w3schools.com/howto/howto_css_aspect_ratio.asp).\n    -->\n    @if (rowIndex === 0 && _firstRowOffset) {\n      <td\n        class="calendar-body-label"\n        [attr.colspan]="_firstRowOffset"\n        [style.paddingTop]="_cellPadding"\n        [style.paddingBottom]="_cellPadding"\n      ></td>\n    }\n    <!--\n      Each gridcell in the calendar contains a button, which signals to assistive technology that the\n      cell is intractable, as well as the selection state via `aria-pressed`. See #23476 for\n      background.\n    -->\n    @for (item of row; track item; let colIndex = $index) {\n      <td\n        role="gridcell"\n        class="calendar-body-cell-container"\n        [style.width]="_cellWidth"\n        [style.paddingTop]="_cellPadding"\n        [style.paddingBottom]="_cellPadding"\n        [attr.data-row]="rowIndex"\n        [attr.data-col]="colIndex"\n      >\n        <button\n          type="button"\n          class="calendar-body-cell"\n          [ngClass]="item.cssClasses"\n          [tabindex]="_isActiveCell(rowIndex, colIndex) ? 0 : -1"\n          [class.calendar-body-disabled]="!item.enabled"\n          [class.calendar-body-active]="_isActiveCell(rowIndex, colIndex)"\n          [class.calendar-body-range-start]="_isRangeStart(item.compareValue)"\n          [class.calendar-body-range-end]="_isRangeEnd(item.compareValue)"\n          [class.calendar-body-in-range]="_isInRange(item.compareValue)"\n          [class.calendar-body-comparison-bridge-start]="\n            _isComparisonBridgeStart(item.compareValue, rowIndex, colIndex)\n          "\n          [class.calendar-body-comparison-bridge-end]="\n            _isComparisonBridgeEnd(item.compareValue, rowIndex, colIndex)\n          "\n          [class.calendar-body-comparison-start]="_isComparisonStart(item.compareValue)"\n          [class.calendar-body-comparison-end]="_isComparisonEnd(item.compareValue)"\n          [class.calendar-body-in-comparison-range]="_isInComparisonRange(item.compareValue)"\n          [class.calendar-body-preview-start]="_isPreviewStart(item.compareValue)"\n          [class.calendar-body-preview-end]="_isPreviewEnd(item.compareValue)"\n          [class.calendar-body-in-preview]="_isInPreview(item.compareValue)"\n          [attr.aria-label]="item.ariaLabel"\n          [attr.aria-disabled]="!item.enabled || null"\n          [attr.aria-pressed]="_isSelected(item.compareValue)"\n          [attr.aria-current]="todayValue === item.compareValue ? \'date\' : null"\n          [attr.aria-describedby]="_getDescribedby(item.compareValue)"\n          (click)="_cellClicked(item, $event)"\n          (focus)="_emitActiveDateChange(item, $event)"\n        >\n          <span\n            class="calendar-body-cell-content focus-indicator"\n            [class.calendar-body-selected]="_isSelected(item.compareValue)"\n            [class.calendar-body-comparison-identical]="_isComparisonIdentical(item.compareValue)"\n            [class.calendar-body-today]="todayValue === item.compareValue"\n          >\n            {{ item.displayValue }}\n          </span>\n          <span\n            class="calendar-body-cell-preview"\n            aria-hidden="true"\n          ></span>\n        </button>\n      </td>\n    }\n  </tr>\n}\n\n<label\n  class="calendar-body-hidden-label"\n  for=""\n  [id]="_startDateLabelId"\n>\n  {{ startDateAccessibleName }}\n</label>\n\n<label\n  class="calendar-body-hidden-label"\n  for=""\n  [id]="_endDateLabelId"\n>\n  {{ endDateAccessibleName }}\n</label>\n',
          styles: [
            '.calendar-body{min-width:17.5rem}.calendar-body-today{border-color:var(--border)!important}.calendar-body-label{height:0;line-height:0;text-align:start;padding-left:4.7142857143%;padding-right:4.7142857143%}.calendar-body-hidden-label{display:none}.calendar-body-cell-container{position:relative;height:0;line-height:0}.calendar-body-cell{position:absolute;top:0;left:0;width:100%;height:100%;background:none;text-align:center;outline:none;font-family:inherit;margin:0}.calendar-body-cell-content{top:5%;left:5%;z-index:1;display:flex;align-items:center;justify-content:center;box-sizing:border-box;width:90%;height:90%;line-height:1;border-width:1px;border-style:solid;border-radius:999px;border-color:transparent}.calendar-body-cell-content.focus-indicator{position:absolute}.calendar-body-active .calendar-body-cell-content{background-color:var(--primary);color:var(--on-primary)}\n',
          ],
        },
      ],
    },
  ],
  ctorParameters: () => [{ type: i0.ElementRef }, { type: i0.NgZone }],
  propDecorators: {
    label: [
      {
        type: Input,
      },
    ],
    rows: [
      {
        type: Input,
      },
    ],
    todayValue: [
      {
        type: Input,
      },
    ],
    startValue: [
      {
        type: Input,
      },
    ],
    endValue: [
      {
        type: Input,
      },
    ],
    labelMinRequiredCells: [
      {
        type: Input,
      },
    ],
    numCols: [
      {
        type: Input,
      },
    ],
    activeCell: [
      {
        type: Input,
      },
    ],
    isRange: [
      {
        type: Input,
      },
    ],
    cellAspectRatio: [
      {
        type: Input,
      },
    ],
    comparisonStart: [
      {
        type: Input,
      },
    ],
    comparisonEnd: [
      {
        type: Input,
      },
    ],
    previewStart: [
      {
        type: Input,
      },
    ],
    previewEnd: [
      {
        type: Input,
      },
    ],
    startDateAccessibleName: [
      {
        type: Input,
      },
    ],
    endDateAccessibleName: [
      {
        type: Input,
      },
    ],
    selectedValueChange: [
      {
        type: Output,
      },
    ],
    previewChange: [
      {
        type: Output,
      },
    ],
    activeDateChange: [
      {
        type: Output,
      },
    ],
    dragStarted: [
      {
        type: Output,
      },
    ],
    dragEnded: [
      {
        type: Output,
      },
    ],
  },
});
/** Checks whether a node is a table cell element. */
function isTableCell(node) {
  return node?.nodeName === 'TD';
}
/**
 * Gets the date table cell element that is or contains the specified element.
 * Or returns null if element is not part of a date cell.
 */
function getCellElement(element) {
  let cell;
  if (isTableCell(element)) {
    cell = element;
  } else if (isTableCell(element.parentNode)) {
    cell = element.parentNode;
  } else if (isTableCell(element.parentNode?.parentNode)) {
    cell = element.parentNode.parentNode;
  }
  return cell?.getAttribute('data-row') != null ? cell : null;
}
/** Checks whether a value is the start of a range. */
function isStart(value, start, end) {
  return end !== null && start !== end && value < end && value === start;
}
/** Checks whether a value is the end of a range. */
function isEnd(value, start, end) {
  return start !== null && start !== end && value >= start && value === end;
}
/** Checks whether a value is inside of a range. */
function isInRange(value, start, end, rangeEnabled) {
  return (
    rangeEnabled &&
    start !== null &&
    end !== null &&
    start !== end &&
    value >= start &&
    value <= end
  );
}
/**
 * Extracts the element that actually corresponds to a touch event's location
 * (rather than the element that initiated the sequence of touch events).
 */
function getActualTouchTarget(event) {
  const touchLocation = event.changedTouches[0];
  return document.elementFromPoint(touchLocation.clientX, touchLocation.clientY);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FsZW5kYXItYm9keS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2xpYnMvZGF0ZS1waWNrZXIvc3JjL2xpYi9jYWxlbmRhci9jYWxlbmRhci1ib2R5LnRzIiwiLi4vLi4vLi4vLi4vLi4vbGlicy9kYXRlLXBpY2tlci9zcmMvbGliL2NhbGVuZGFyL2NhbGVuZGFyLWJvZHkuaHRtbCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUUsUUFBUSxFQUFFLCtCQUErQixFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFDbEYsT0FBTyxFQUNMLHVCQUF1QixFQUN2QixTQUFTLEVBRVQsWUFBWSxFQUNaLEtBQUssRUFDTCxNQUFNLEVBQ04saUJBQWlCLEVBTWpCLE1BQU0sR0FDUCxNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFFMUMsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLGdCQUFnQixDQUFDOztBQVd0Qzs7O0dBR0c7QUFDSCxNQUFNLE9BQU8sWUFBWTtJQUVkO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBUFQsWUFDUyxLQUFhLEVBQ2IsWUFBb0IsRUFDcEIsU0FBaUIsRUFDakIsT0FBZ0IsRUFDaEIsYUFBcUMsRUFBRSxFQUN2QyxlQUFlLEtBQUssRUFDcEIsUUFBWTtRQU5aLFVBQUssR0FBTCxLQUFLLENBQVE7UUFDYixpQkFBWSxHQUFaLFlBQVksQ0FBUTtRQUNwQixjQUFTLEdBQVQsU0FBUyxDQUFRO1FBQ2pCLFlBQU8sR0FBUCxPQUFPLENBQVM7UUFDaEIsZUFBVSxHQUFWLFVBQVUsQ0FBNkI7UUFDdkMsaUJBQVksR0FBWixZQUFZLENBQVE7UUFDcEIsYUFBUSxHQUFSLFFBQVEsQ0FBSTtJQUNsQixDQUFDO0NBQ0w7QUFRRCxJQUFJLGNBQWMsR0FBRyxDQUFDLENBQUM7QUFFdkIseUVBQXlFO0FBQ3pFLE1BQU0sMkJBQTJCLEdBQUcsK0JBQStCLENBQUM7SUFDbEUsT0FBTyxFQUFFLEtBQUs7SUFDZCxPQUFPLEVBQUUsSUFBSTtDQUNkLENBQUMsQ0FBQztBQUVILHlFQUF5RTtBQUN6RSxNQUFNLDRCQUE0QixHQUFHLCtCQUErQixDQUFDO0lBQ25FLE9BQU8sRUFBRSxJQUFJO0lBQ2IsT0FBTyxFQUFFLElBQUk7Q0FDZCxDQUFDLENBQUM7QUFFSCw2RUFBNkU7QUFDN0UsTUFBTSxtQkFBbUIsR0FBRywrQkFBK0IsQ0FBQyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO0FBRS9FOzs7R0FHRztBQWNILE1BQU0sT0FBTyxZQUFZO0lBa0diO0lBQ0E7SUFsR0YsU0FBUyxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUVyQzs7O09BR0c7SUFDSyxjQUFjLENBQVU7SUFFaEM7O09BRUc7SUFDSyxnQ0FBZ0MsR0FBRyxLQUFLLENBQUM7SUFFakQsa0RBQWtEO0lBQ3pDLEtBQUssQ0FBUztJQUV2Qix5Q0FBeUM7SUFDaEMsSUFBSSxDQUFtQjtJQUVoQyx3REFBd0Q7SUFDL0MsVUFBVSxDQUFTO0lBRTVCLDhDQUE4QztJQUNyQyxVQUFVLENBQVM7SUFFNUIsNENBQTRDO0lBQ25DLFFBQVEsQ0FBUztJQUUxQixpRkFBaUY7SUFDeEUscUJBQXFCLENBQVM7SUFFdkMsMENBQTBDO0lBQ2pDLE9BQU8sR0FBRyxDQUFDLENBQUM7SUFFckIsdURBQXVEO0lBQzlDLFVBQVUsR0FBRyxDQUFDLENBQUM7SUFFeEIsa0JBQWtCO1FBQ2hCLElBQUksSUFBSSxDQUFDLGdDQUFnQyxFQUFFLENBQUM7WUFDMUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7WUFDeEIsSUFBSSxDQUFDLGdDQUFnQyxHQUFHLEtBQUssQ0FBQztRQUNoRCxDQUFDO0lBQ0gsQ0FBQztJQUVELHlDQUF5QztJQUNoQyxPQUFPLEdBQUcsS0FBSyxDQUFDO0lBRXpCOzs7T0FHRztJQUNNLGVBQWUsR0FBRyxDQUFDLENBQUM7SUFFN0IscUNBQXFDO0lBQzVCLGVBQWUsQ0FBZ0I7SUFFeEMsbUNBQW1DO0lBQzFCLGFBQWEsQ0FBZ0I7SUFFdEMsa0NBQWtDO0lBQ3pCLFlBQVksR0FBa0IsSUFBSSxDQUFDO0lBRTVDLGdDQUFnQztJQUN2QixVQUFVLEdBQWtCLElBQUksQ0FBQztJQUUxQyx1REFBdUQ7SUFDOUMsdUJBQXVCLENBQWdCO0lBRWhELHFEQUFxRDtJQUM1QyxxQkFBcUIsQ0FBZ0I7SUFFOUMsMENBQTBDO0lBQ3ZCLG1CQUFtQixHQUFHLElBQUksWUFBWSxFQUE2QixDQUFDO0lBRXZGLHVFQUF1RTtJQUNwRCxhQUFhLEdBQUcsSUFBSSxZQUFZLEVBQTBDLENBQUM7SUFFM0UsZ0JBQWdCLEdBQUcsSUFBSSxZQUFZLEVBQTZCLENBQUM7SUFFcEYsNERBQTREO0lBQ3pDLFdBQVcsR0FBRyxJQUFJLFlBQVksRUFBd0IsQ0FBQztJQUUxRSwrRkFBK0Y7SUFDNUUsU0FBUyxHQUFHLElBQUksWUFBWSxFQUErQixDQUFDO0lBRS9FLDJFQUEyRTtJQUMzRSxlQUFlLENBQVM7SUFFeEIsNkNBQTZDO0lBQzdDLFlBQVksQ0FBUztJQUVyQixtQ0FBbUM7SUFDbkMsVUFBVSxDQUFTO0lBRVgsc0JBQXNCLEdBQUcsS0FBSyxDQUFDO0lBRXZDLFlBQ1UsV0FBb0MsRUFDcEMsT0FBZTtRQURmLGdCQUFXLEdBQVgsV0FBVyxDQUF5QjtRQUNwQyxZQUFPLEdBQVAsT0FBTyxDQUFRO1FBRXZCLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLEVBQUU7WUFDN0IsTUFBTSxPQUFPLEdBQUcsV0FBVyxDQUFDLGFBQWEsQ0FBQztZQUUxQyxnRUFBZ0U7WUFDaEUsT0FBTyxDQUFDLGdCQUFnQixDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsaUJBQWlCLEVBQUUsMkJBQTJCLENBQUMsQ0FBQztZQUUzRixPQUFPLENBQUMsZ0JBQWdCLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxhQUFhLEVBQUUsNEJBQTRCLENBQUMsQ0FBQztZQUN6RixPQUFPLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxhQUFhLEVBQUUsNEJBQTRCLENBQUMsQ0FBQztZQUNwRixPQUFPLENBQUMsZ0JBQWdCLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxhQUFhLEVBQUUsNEJBQTRCLENBQUMsQ0FBQztZQUN6RixPQUFPLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxhQUFhLEVBQUUsNEJBQTRCLENBQUMsQ0FBQztZQUVuRixPQUFPLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxtQkFBbUIsQ0FBQyxDQUFDO1lBQ25GLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixFQUFFLG1CQUFtQixDQUFDLENBQUM7WUFFcEYsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBRSxDQUFDO2dCQUM3QixNQUFNLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztnQkFDekQsTUFBTSxDQUFDLGdCQUFnQixDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztZQUM3RCxDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQscUNBQXFDO0lBQ3JDLFlBQVksQ0FBQyxJQUFrQixFQUFFLEtBQWlCO1FBQ2hELHdFQUF3RTtRQUN4RSxnREFBZ0Q7UUFDaEQsSUFBSSxJQUFJLENBQUMsc0JBQXNCLEVBQUUsQ0FBQztZQUNoQyxPQUFPO1FBQ1QsQ0FBQztRQUVELElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ2pCLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBQzlELENBQUM7SUFDSCxDQUFDO0lBRUQscUJBQXFCLENBQUMsSUFBa0IsRUFBRSxLQUFpQjtRQUN6RCxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUNqQixJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztRQUMzRCxDQUFDO0lBQ0gsQ0FBQztJQUVELDJEQUEyRDtJQUMzRCxXQUFXLENBQUMsS0FBYTtRQUN2QixPQUFPLElBQUksQ0FBQyxVQUFVLEtBQUssS0FBSyxJQUFJLElBQUksQ0FBQyxRQUFRLEtBQUssS0FBSyxDQUFDO0lBQzlELENBQUM7SUFFRCxXQUFXLENBQUMsT0FBc0I7UUFDaEMsTUFBTSxhQUFhLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3pDLE1BQU0sRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLEdBQUcsSUFBSSxDQUFDO1FBRS9CLElBQUksT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLGFBQWEsRUFBRSxDQUFDO1lBQ3JDLElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxJQUFJLElBQUksQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM5RixDQUFDO1FBRUQsSUFBSSxPQUFPLENBQUMsaUJBQWlCLENBQUMsSUFBSSxhQUFhLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7WUFDdEUsSUFBSSxDQUFDLFlBQVksR0FBRyxHQUFHLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxPQUFPLEdBQUcsQ0FBQztRQUNsRSxDQUFDO1FBRUQsSUFBSSxhQUFhLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDdEMsSUFBSSxDQUFDLFVBQVUsR0FBRyxHQUFHLEdBQUcsR0FBRyxPQUFPLEdBQUcsQ0FBQztRQUN4QyxDQUFDO0lBQ0gsQ0FBQztJQUVELFdBQVc7UUFDVCxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQztRQUUvQyxPQUFPLENBQUMsbUJBQW1CLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxpQkFBaUIsRUFBRSwyQkFBMkIsQ0FBQyxDQUFDO1FBRTlGLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLGFBQWEsRUFBRSw0QkFBNEIsQ0FBQyxDQUFDO1FBQzVGLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLGFBQWEsRUFBRSw0QkFBNEIsQ0FBQyxDQUFDO1FBQ3ZGLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLGFBQWEsRUFBRSw0QkFBNEIsQ0FBQyxDQUFDO1FBQzVGLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLGFBQWEsRUFBRSw0QkFBNEIsQ0FBQyxDQUFDO1FBRXRGLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixFQUFFLG1CQUFtQixDQUFDLENBQUM7UUFDdEYsT0FBTyxDQUFDLG1CQUFtQixDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsaUJBQWlCLEVBQUUsbUJBQW1CLENBQUMsQ0FBQztRQUV2RixJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDN0IsTUFBTSxDQUFDLG1CQUFtQixDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7WUFDNUQsTUFBTSxDQUFDLG1CQUFtQixDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUNoRSxDQUFDO0lBQ0gsQ0FBQztJQUVELHdDQUF3QztJQUN4QyxhQUFhLENBQUMsUUFBZ0IsRUFBRSxRQUFnQjtRQUM5QyxJQUFJLFVBQVUsR0FBRyxRQUFRLEdBQUcsSUFBSSxDQUFDLE9BQU8sR0FBRyxRQUFRLENBQUM7UUFFcEQsc0VBQXNFO1FBQ3RFLElBQUksUUFBUSxFQUFFLENBQUM7WUFDYixVQUFVLElBQUksSUFBSSxDQUFDLGVBQWUsQ0FBQztRQUNyQyxDQUFDO1FBRUQsT0FBTyxVQUFVLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQztJQUN2QyxDQUFDO0lBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztPQXFCRztJQUNILGdCQUFnQixDQUFDLFdBQVcsR0FBRyxJQUFJO1FBQ2pDLElBQUksQ0FBQyxPQUFPLENBQUMsaUJBQWlCLENBQUMsR0FBRyxFQUFFO1lBQ2xDLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFO2dCQUNqRCxVQUFVLENBQUMsR0FBRyxFQUFFO29CQUNkLE1BQU0sVUFBVSxHQUNkLElBQUksQ0FBQyxXQUFXLENBQUMsYUFBYSxDQUFDLGFBQWEsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO29CQUV4RSxJQUFJLFVBQVUsRUFBRSxDQUFDO3dCQUNmLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQzs0QkFDakIsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUM7d0JBQzdCLENBQUM7d0JBRUQsVUFBVSxDQUFDLEtBQUssRUFBRSxDQUFDO29CQUNyQixDQUFDO2dCQUNILENBQUMsQ0FBQyxDQUFDO1lBQ0wsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRCwrRkFBK0Y7SUFDL0Ysd0NBQXdDO1FBQ3RDLElBQUksQ0FBQyxnQ0FBZ0MsR0FBRyxJQUFJLENBQUM7SUFDL0MsQ0FBQztJQUVELDJEQUEyRDtJQUMzRCxhQUFhLENBQUMsS0FBYTtRQUN6QixPQUFPLE9BQU8sQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDeEQsQ0FBQztJQUVELHlEQUF5RDtJQUN6RCxXQUFXLENBQUMsS0FBYTtRQUN2QixPQUFPLEtBQUssQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDdEQsQ0FBQztJQUVELG1FQUFtRTtJQUNuRSxVQUFVLENBQUMsS0FBYTtRQUN0QixPQUFPLFNBQVMsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUN4RSxDQUFDO0lBRUQsaUVBQWlFO0lBQ2pFLGtCQUFrQixDQUFDLEtBQWE7UUFDOUIsT0FBTyxPQUFPLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQ2xFLENBQUM7SUFFRCxzRkFBc0Y7SUFDdEYsd0JBQXdCLENBQUMsS0FBYSxFQUFFLFFBQWdCLEVBQUUsUUFBZ0I7UUFDeEUsSUFBSSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDO1lBQzVGLE9BQU8sS0FBSyxDQUFDO1FBQ2YsQ0FBQztRQUVELElBQUksWUFBWSxHQUE2QixJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUUvRSxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7WUFDbEIsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDNUMsWUFBWSxHQUFHLFdBQVcsSUFBSSxXQUFXLENBQUMsV0FBVyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNwRSxDQUFDO1FBRUQsT0FBTyxZQUFZLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUN0RSxDQUFDO0lBRUQscUZBQXFGO0lBQ3JGLHNCQUFzQixDQUFDLEtBQWEsRUFBRSxRQUFnQixFQUFFLFFBQWdCO1FBQ3RFLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQztZQUN4RixPQUFPLEtBQUssQ0FBQztRQUNmLENBQUM7UUFFRCxJQUFJLFFBQVEsR0FBNkIsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFFM0UsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ2QsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDeEMsUUFBUSxHQUFHLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbkMsQ0FBQztRQUVELE9BQU8sUUFBUSxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDaEUsQ0FBQztJQUVELCtEQUErRDtJQUMvRCxnQkFBZ0IsQ0FBQyxLQUFhO1FBQzVCLE9BQU8sS0FBSyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUNoRSxDQUFDO0lBRUQsbUVBQW1FO0lBQ25FLG9CQUFvQixDQUFDLEtBQWE7UUFDaEMsT0FBTyxTQUFTLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDbEYsQ0FBQztJQUVEOzs7Ozs7Ozs7T0FTRztJQUNILHNCQUFzQixDQUFDLEtBQWE7UUFDbEMsc0RBQXNEO1FBQ3RELG9EQUFvRDtRQUNwRCxPQUFPLElBQUksQ0FBQyxlQUFlLEtBQUssSUFBSSxDQUFDLGFBQWEsSUFBSSxLQUFLLEtBQUssSUFBSSxDQUFDLGVBQWUsQ0FBQztJQUN2RixDQUFDO0lBRUQsOERBQThEO0lBQzlELGVBQWUsQ0FBQyxLQUFhO1FBQzNCLE9BQU8sT0FBTyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUM1RCxDQUFDO0lBRUQsNERBQTREO0lBQzVELGFBQWEsQ0FBQyxLQUFhO1FBQ3pCLE9BQU8sS0FBSyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUMxRCxDQUFDO0lBRUQsd0RBQXdEO0lBQ3hELFlBQVksQ0FBQyxLQUFhO1FBQ3hCLE9BQU8sU0FBUyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQzVFLENBQUM7SUFFRCwyRUFBMkU7SUFDM0UsZUFBZSxDQUFDLEtBQWE7UUFDM0IsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUNsQixPQUFPLElBQUksQ0FBQztRQUNkLENBQUM7UUFFRCxJQUFJLElBQUksQ0FBQyxVQUFVLEtBQUssS0FBSyxJQUFJLElBQUksQ0FBQyxRQUFRLEtBQUssS0FBSyxFQUFFLENBQUM7WUFDekQsT0FBTyxHQUFHLElBQUksQ0FBQyxpQkFBaUIsSUFBSSxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7UUFDN0QsQ0FBQzthQUFNLElBQUksSUFBSSxDQUFDLFVBQVUsS0FBSyxLQUFLLEVBQUUsQ0FBQztZQUNyQyxPQUFPLElBQUksQ0FBQyxpQkFBaUIsQ0FBQztRQUNoQyxDQUFDO2FBQU0sSUFBSSxJQUFJLENBQUMsUUFBUSxLQUFLLEtBQUssRUFBRSxDQUFDO1lBQ25DLE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQztRQUM5QixDQUFDO1FBQ0QsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBRUQ7OztPQUdHO0lBQ0ssYUFBYSxHQUFHLENBQUMsS0FBWSxFQUFFLEVBQUU7UUFDdkMsSUFBSSxJQUFJLENBQUMsY0FBYyxJQUFJLEtBQUssQ0FBQyxJQUFJLEtBQUssT0FBTyxFQUFFLENBQUM7WUFDbEQsSUFBSSxDQUFDLGNBQWMsR0FBRyxLQUFLLENBQUM7WUFDNUIsT0FBTztRQUNULENBQUM7UUFFRCw2REFBNkQ7UUFDN0QsSUFBSSxLQUFLLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUNqQyxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsS0FBSyxDQUFDLE1BQXFCLENBQUMsQ0FBQztZQUVuRSxJQUFJLElBQUksRUFBRSxDQUFDO2dCQUNULElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUNwQixJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUN0RSxDQUFDO1lBQ0osQ0FBQztRQUNILENBQUM7SUFDSCxDQUFDLENBQUM7SUFFTSxpQkFBaUIsR0FBRyxDQUFDLEtBQWlCLEVBQUUsRUFBRTtRQUNoRCxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU87WUFBRSxPQUFPO1FBRTFCLE1BQU0sTUFBTSxHQUFHLG9CQUFvQixDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzNDLE1BQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLE1BQXFCLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1FBRTdFLElBQUksTUFBTSxLQUFLLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUM1QixJQUFJLENBQUMsc0JBQXNCLEdBQUcsSUFBSSxDQUFDO1FBQ3JDLENBQUM7UUFFRCx3RUFBd0U7UUFDeEUsNENBQTRDO1FBQzVDLElBQUksY0FBYyxDQUFDLEtBQUssQ0FBQyxNQUFxQixDQUFDLEVBQUUsQ0FBQztZQUNoRCxLQUFLLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDekIsQ0FBQztRQUVELElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztJQUNqRyxDQUFDLENBQUM7SUFFRjs7O09BR0c7SUFDSyxhQUFhLEdBQUcsQ0FBQyxLQUFZLEVBQUUsRUFBRTtRQUN2Qyw2REFBNkQ7UUFDN0QsSUFBSSxJQUFJLENBQUMsVUFBVSxLQUFLLElBQUksSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDN0MsSUFBSSxLQUFLLENBQUMsSUFBSSxLQUFLLE1BQU0sRUFBRSxDQUFDO2dCQUMxQixJQUFJLENBQUMsc0JBQXNCLEdBQUcsSUFBSSxDQUFDO1lBQ3JDLENBQUM7WUFFRCxrRkFBa0Y7WUFDbEYsK0VBQStFO1lBQy9FLG1GQUFtRjtZQUNuRixJQUNFLEtBQUssQ0FBQyxNQUFNO2dCQUNaLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLENBQUMsTUFBcUIsQ0FBQztnQkFDckQsQ0FBQyxDQUNFLEtBQW9CLENBQUMsYUFBYTtvQkFDbkMsSUFBSSxDQUFDLG1CQUFtQixDQUFFLEtBQW9CLENBQUMsYUFBNEIsQ0FBQyxDQUM3RSxFQUNELENBQUM7Z0JBQ0QsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztZQUMxRSxDQUFDO1FBQ0gsQ0FBQztJQUNILENBQUMsQ0FBQztJQUVGOzs7T0FHRztJQUNLLGlCQUFpQixHQUFHLENBQUMsS0FBWSxFQUFFLEVBQUU7UUFDM0MsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPO1lBQUUsT0FBTztRQUUxQixJQUFJLENBQUMsc0JBQXNCLEdBQUcsS0FBSyxDQUFDO1FBQ3BDLGdFQUFnRTtRQUNoRSxNQUFNLElBQUksR0FBRyxLQUFLLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLENBQUMsTUFBcUIsQ0FBQyxDQUFDO1FBQ25GLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDO1lBQ2pELE9BQU87UUFDVCxDQUFDO1FBRUQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFO1lBQ3BCLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDO2dCQUNwQixLQUFLLEVBQUUsSUFBSSxDQUFDLFFBQVE7Z0JBQ3BCLEtBQUs7YUFDTixDQUFDLENBQUM7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUMsQ0FBQztJQUVGLDhFQUE4RTtJQUN0RSxlQUFlLEdBQUcsQ0FBQyxLQUFZLEVBQUUsRUFBRTtRQUN6QyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU87WUFBRSxPQUFPO1FBRTFCLE1BQU0sV0FBVyxHQUFHLGNBQWMsQ0FBQyxLQUFLLENBQUMsTUFBcUIsQ0FBQyxDQUFDO1FBQ2hFLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUNqQix1REFBdUQ7WUFDdkQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFO2dCQUNwQixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztZQUM5QyxDQUFDLENBQUMsQ0FBQztZQUNILE9BQU87UUFDVCxDQUFDO1FBRUQsSUFBSSxXQUFXLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLEtBQUssSUFBSSxDQUFDLFdBQVcsQ0FBQyxhQUFhLEVBQUUsQ0FBQztZQUM3RSxzREFBc0Q7WUFDdEQsZ0NBQWdDO1lBQ2hDLE9BQU87UUFDVCxDQUFDO1FBRUQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFO1lBQ3BCLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUNuRCxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsUUFBUSxJQUFJLElBQUksRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBQ2hFLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQyxDQUFDO0lBRUYsK0VBQStFO0lBQ3ZFLGdCQUFnQixHQUFHLENBQUMsS0FBaUIsRUFBRSxFQUFFO1FBQy9DLE1BQU0sTUFBTSxHQUFHLG9CQUFvQixDQUFDLEtBQUssQ0FBQyxDQUFDO1FBRTNDLElBQUksTUFBTSxFQUFFLENBQUM7WUFDWCxJQUFJLENBQUMsZUFBZSxDQUFDLEVBQUUsTUFBTSxFQUFzQixDQUFDLENBQUM7UUFDdkQsQ0FBQztJQUNILENBQUMsQ0FBQztJQUVGLGdFQUFnRTtJQUN4RCxtQkFBbUIsQ0FBQyxPQUFvQjtRQUM5QyxNQUFNLElBQUksR0FBRyxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUM7UUFFckMsSUFBSSxJQUFJLEVBQUUsQ0FBQztZQUNULE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDMUMsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUUxQyxJQUFJLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztnQkFDZixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDakQsQ0FBQztRQUNILENBQUM7UUFFRCxPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFFTyxHQUFHLEdBQUcsaUJBQWlCLGNBQWMsRUFBRSxFQUFFLENBQUM7SUFFbEQsaUJBQWlCLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxhQUFhLENBQUM7SUFFN0MsZUFBZSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsV0FBVyxDQUFDO3dHQTdlOUIsWUFBWTs0RkFBWixZQUFZLG8wQkM3RnpCLG1uSUFnR0EsKzZCRExZLE9BQU87OzRGQUVOLFlBQVk7a0JBYnhCLFNBQVM7K0JBQ0UsaUJBQWlCLFFBR3JCO3dCQUNKLEtBQUssRUFBRSxlQUFlO3FCQUN2QixZQUNTLGNBQWMsY0FDWixJQUFJLGlCQUNELGlCQUFpQixDQUFDLElBQUksbUJBQ3BCLHVCQUF1QixDQUFDLE1BQU0sV0FDdEMsQ0FBQyxPQUFPLENBQUM7b0dBaUJULEtBQUs7c0JBQWIsS0FBSztnQkFHRyxJQUFJO3NCQUFaLEtBQUs7Z0JBR0csVUFBVTtzQkFBbEIsS0FBSztnQkFHRyxVQUFVO3NCQUFsQixLQUFLO2dCQUdHLFFBQVE7c0JBQWhCLEtBQUs7Z0JBR0cscUJBQXFCO3NCQUE3QixLQUFLO2dCQUdHLE9BQU87c0JBQWYsS0FBSztnQkFHRyxVQUFVO3NCQUFsQixLQUFLO2dCQVVHLE9BQU87c0JBQWYsS0FBSztnQkFNRyxlQUFlO3NCQUF2QixLQUFLO2dCQUdHLGVBQWU7c0JBQXZCLEtBQUs7Z0JBR0csYUFBYTtzQkFBckIsS0FBSztnQkFHRyxZQUFZO3NCQUFwQixLQUFLO2dCQUdHLFVBQVU7c0JBQWxCLEtBQUs7Z0JBR0csdUJBQXVCO3NCQUEvQixLQUFLO2dCQUdHLHFCQUFxQjtzQkFBN0IsS0FBSztnQkFHYSxtQkFBbUI7c0JBQXJDLE1BQU07Z0JBR1ksYUFBYTtzQkFBL0IsTUFBTTtnQkFFWSxnQkFBZ0I7c0JBQWxDLE1BQU07Z0JBR1ksV0FBVztzQkFBN0IsTUFBTTtnQkFHWSxTQUFTO3NCQUEzQixNQUFNOztBQTRaVCxxREFBcUQ7QUFDckQsU0FBUyxXQUFXLENBQUMsSUFBNkI7SUFDaEQsT0FBTyxJQUFJLEVBQUUsUUFBUSxLQUFLLElBQUksQ0FBQztBQUNqQyxDQUFDO0FBRUQ7OztHQUdHO0FBQ0gsU0FBUyxjQUFjLENBQUMsT0FBb0I7SUFDMUMsSUFBSSxJQUE2QixDQUFDO0lBQ2xDLElBQUksV0FBVyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7UUFDekIsSUFBSSxHQUFHLE9BQU8sQ0FBQztJQUNqQixDQUFDO1NBQU0sSUFBSSxXQUFXLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUM7UUFDM0MsSUFBSSxHQUFHLE9BQU8sQ0FBQyxVQUF5QixDQUFDO0lBQzNDLENBQUM7U0FBTSxJQUFJLFdBQVcsQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLFVBQVUsQ0FBQyxFQUFFLENBQUM7UUFDdkQsSUFBSSxHQUFHLE9BQU8sQ0FBQyxVQUFXLENBQUMsVUFBeUIsQ0FBQztJQUN2RCxDQUFDO0lBRUQsT0FBTyxJQUFJLEVBQUUsWUFBWSxDQUFDLFVBQVUsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7QUFDOUQsQ0FBQztBQUVELHNEQUFzRDtBQUN0RCxTQUFTLE9BQU8sQ0FBQyxLQUFhLEVBQUUsS0FBb0IsRUFBRSxHQUFrQjtJQUN0RSxPQUFPLEdBQUcsS0FBSyxJQUFJLElBQUksS0FBSyxLQUFLLEdBQUcsSUFBSSxLQUFLLEdBQUcsR0FBRyxJQUFJLEtBQUssS0FBSyxLQUFLLENBQUM7QUFDekUsQ0FBQztBQUVELG9EQUFvRDtBQUNwRCxTQUFTLEtBQUssQ0FBQyxLQUFhLEVBQUUsS0FBb0IsRUFBRSxHQUFrQjtJQUNwRSxPQUFPLEtBQUssS0FBSyxJQUFJLElBQUksS0FBSyxLQUFLLEdBQUcsSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssS0FBSyxHQUFHLENBQUM7QUFDNUUsQ0FBQztBQUVELG1EQUFtRDtBQUNuRCxTQUFTLFNBQVMsQ0FDaEIsS0FBYSxFQUNiLEtBQW9CLEVBQ3BCLEdBQWtCLEVBQ2xCLFlBQXFCO0lBRXJCLE9BQU8sQ0FDTCxZQUFZO1FBQ1osS0FBSyxLQUFLLElBQUk7UUFDZCxHQUFHLEtBQUssSUFBSTtRQUNaLEtBQUssS0FBSyxHQUFHO1FBQ2IsS0FBSyxJQUFJLEtBQUs7UUFDZCxLQUFLLElBQUksR0FBRyxDQUNiLENBQUM7QUFDSixDQUFDO0FBRUQ7OztHQUdHO0FBQ0gsU0FBUyxvQkFBb0IsQ0FBQyxLQUFpQjtJQUM3QyxNQUFNLGFBQWEsR0FBRyxLQUFLLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzlDLE9BQU8sUUFBUSxDQUFDLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ2pGLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHsgUGxhdGZvcm0sIG5vcm1hbGl6ZVBhc3NpdmVMaXN0ZW5lck9wdGlvbnMgfSBmcm9tICdAYW5ndWxhci9jZGsvcGxhdGZvcm0nO1xuaW1wb3J0IHtcbiAgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksXG4gIENvbXBvbmVudCxcbiAgRWxlbWVudFJlZixcbiAgRXZlbnRFbWl0dGVyLFxuICBJbnB1dCxcbiAgT3V0cHV0LFxuICBWaWV3RW5jYXBzdWxhdGlvbixcbiAgTmdab25lLFxuICBPbkNoYW5nZXMsXG4gIFNpbXBsZUNoYW5nZXMsXG4gIE9uRGVzdHJveSxcbiAgQWZ0ZXJWaWV3Q2hlY2tlZCxcbiAgaW5qZWN0LFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IE5nQ2xhc3MgfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuXG5pbXBvcnQgeyB0YWtlIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuXG4vKiogRXh0cmEgQ1NTIGNsYXNzZXMgdGhhdCBjYW4gYmUgYXNzb2NpYXRlZCB3aXRoIGEgY2FsZW5kYXIgY2VsbC4gKi9cbmV4cG9ydCB0eXBlIENhbGVuZGFyQ2VsbENzc0NsYXNzZXMgPSBzdHJpbmcgfCBzdHJpbmdbXSB8IFNldDxzdHJpbmc+IHwgUmVjb3JkPHN0cmluZywgYW55PjtcblxuLyoqIEZ1bmN0aW9uIHRoYXQgY2FuIGdlbmVyYXRlIHRoZSBleHRyYSBjbGFzc2VzIHRoYXQgc2hvdWxkIGJlIGFkZGVkIHRvIGEgY2FsZW5kYXIgY2VsbC4gKi9cbmV4cG9ydCB0eXBlIENhbGVuZGFyQ2VsbENsYXNzRnVuY3Rpb248RD4gPSAoXG4gIGRhdGU6IEQsXG4gIHZpZXc6ICdtb250aCcgfCAneWVhcicgfCAnbXVsdGkteWVhcidcbikgPT4gQ2FsZW5kYXJDZWxsQ3NzQ2xhc3NlcztcblxuLyoqXG4gKiBBbiBpbnRlcm5hbCBjbGFzcyB0aGF0IHJlcHJlc2VudHMgdGhlIGRhdGEgY29ycmVzcG9uZGluZyB0byBhIHNpbmdsZSBjYWxlbmRhciBjZWxsLlxuICogQGRvY3MtcHJpdmF0ZVxuICovXG5leHBvcnQgY2xhc3MgQ2FsZW5kYXJDZWxsPEQgPSBhbnk+IHtcbiAgY29uc3RydWN0b3IoXG4gICAgcHVibGljIHZhbHVlOiBudW1iZXIsXG4gICAgcHVibGljIGRpc3BsYXlWYWx1ZTogc3RyaW5nLFxuICAgIHB1YmxpYyBhcmlhTGFiZWw6IHN0cmluZyxcbiAgICBwdWJsaWMgZW5hYmxlZDogYm9vbGVhbixcbiAgICBwdWJsaWMgY3NzQ2xhc3NlczogQ2FsZW5kYXJDZWxsQ3NzQ2xhc3NlcyA9IHt9LFxuICAgIHB1YmxpYyBjb21wYXJlVmFsdWUgPSB2YWx1ZSxcbiAgICBwdWJsaWMgcmF3VmFsdWU/OiBEXG4gICkge31cbn1cblxuLyoqIEV2ZW50IGVtaXR0ZWQgd2hlbiBhIGRhdGUgaW5zaWRlIHRoZSBjYWxlbmRhciBpcyB0cmlnZ2VyZWQgYXMgYSByZXN1bHQgb2YgYSB1c2VyIGFjdGlvbi4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQ2FsZW5kYXJVc2VyRXZlbnQ8RD4ge1xuICB2YWx1ZTogRDtcbiAgZXZlbnQ6IEV2ZW50O1xufVxuXG5sZXQgY2FsZW5kYXJCb2R5SWQgPSAxO1xuXG4vKiogRXZlbnQgb3B0aW9ucyB0aGF0IGNhbiBiZSB1c2VkIHRvIGJpbmQgYW4gYWN0aXZlLCBjYXB0dXJpbmcgZXZlbnQuICovXG5jb25zdCBhY3RpdmVDYXB0dXJpbmdFdmVudE9wdGlvbnMgPSBub3JtYWxpemVQYXNzaXZlTGlzdGVuZXJPcHRpb25zKHtcbiAgcGFzc2l2ZTogZmFsc2UsXG4gIGNhcHR1cmU6IHRydWUsXG59KTtcblxuLyoqIEV2ZW50IG9wdGlvbnMgdGhhdCBjYW4gYmUgdXNlZCB0byBiaW5kIGEgcGFzc2l2ZSwgY2FwdHVyaW5nIGV2ZW50LiAqL1xuY29uc3QgcGFzc2l2ZUNhcHR1cmluZ0V2ZW50T3B0aW9ucyA9IG5vcm1hbGl6ZVBhc3NpdmVMaXN0ZW5lck9wdGlvbnMoe1xuICBwYXNzaXZlOiB0cnVlLFxuICBjYXB0dXJlOiB0cnVlLFxufSk7XG5cbi8qKiBFdmVudCBvcHRpb25zIHRoYXQgY2FuIGJlIHVzZWQgdG8gYmluZCBhIHBhc3NpdmUsIG5vbi1jYXB0dXJpbmcgZXZlbnQuICovXG5jb25zdCBwYXNzaXZlRXZlbnRPcHRpb25zID0gbm9ybWFsaXplUGFzc2l2ZUxpc3RlbmVyT3B0aW9ucyh7IHBhc3NpdmU6IHRydWUgfSk7XG5cbi8qKlxuICogQW4gaW50ZXJuYWwgY29tcG9uZW50IHVzZWQgdG8gZGlzcGxheSBjYWxlbmRhciBkYXRhIGluIGEgdGFibGUuXG4gKiBAZG9jcy1wcml2YXRlXG4gKi9cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ1tjYWxlbmRhci1ib2R5XScsXG4gIHRlbXBsYXRlVXJsOiAnY2FsZW5kYXItYm9keS5odG1sJyxcbiAgc3R5bGVVcmw6ICdjYWxlbmRhci1ib2R5LnNjc3MnLFxuICBob3N0OiB7XG4gICAgY2xhc3M6ICdjYWxlbmRhci1ib2R5JyxcbiAgfSxcbiAgZXhwb3J0QXM6ICdjYWxlbmRhckJvZHknLFxuICBzdGFuZGFsb25lOiB0cnVlLFxuICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lLFxuICBjaGFuZ2VEZXRlY3Rpb246IENoYW5nZURldGVjdGlvblN0cmF0ZWd5Lk9uUHVzaCxcbiAgaW1wb3J0czogW05nQ2xhc3NdLFxufSlcbmV4cG9ydCBjbGFzcyBDYWxlbmRhckJvZHk8RCA9IGFueT4gaW1wbGVtZW50cyBPbkNoYW5nZXMsIE9uRGVzdHJveSwgQWZ0ZXJWaWV3Q2hlY2tlZCB7XG4gIHByaXZhdGUgX3BsYXRmb3JtID0gaW5qZWN0KFBsYXRmb3JtKTtcblxuICAvKipcbiAgICogVXNlZCB0byBza2lwIHRoZSBuZXh0IGZvY3VzIGV2ZW50IHdoZW4gcmVuZGVyaW5nIHRoZSBwcmV2aWV3IHJhbmdlLlxuICAgKiBXZSBuZWVkIGEgZmxhZyBsaWtlIHRoaXMsIGJlY2F1c2Ugc29tZSBicm93c2VycyBmaXJlIGZvY3VzIGV2ZW50cyBhc3luY2hyb25vdXNseS5cbiAgICovXG4gIHByaXZhdGUgX3NraXBOZXh0Rm9jdXM6IGJvb2xlYW47XG5cbiAgLyoqXG4gICAqIFVzZWQgdG8gZm9jdXMgdGhlIGFjdGl2ZSBjZWxsIGFmdGVyIGNoYW5nZSBkZXRlY3Rpb24gaGFzIHJ1bi5cbiAgICovXG4gIHByaXZhdGUgX2ZvY3VzQWN0aXZlQ2VsbEFmdGVyVmlld0NoZWNrZWQgPSBmYWxzZTtcblxuICAvKiogVGhlIGxhYmVsIGZvciB0aGUgdGFibGUuIChlLmcuIFwiSmFuIDIwMTdcIikuICovXG4gIEBJbnB1dCgpIGxhYmVsOiBzdHJpbmc7XG5cbiAgLyoqIFRoZSBjZWxscyB0byBkaXNwbGF5IGluIHRoZSB0YWJsZS4gKi9cbiAgQElucHV0KCkgcm93czogQ2FsZW5kYXJDZWxsW11bXTtcblxuICAvKiogVGhlIHZhbHVlIGluIHRoZSB0YWJsZSB0aGF0IGNvcnJlc3BvbmRzIHRvIHRvZGF5LiAqL1xuICBASW5wdXQoKSB0b2RheVZhbHVlOiBudW1iZXI7XG5cbiAgLyoqIFN0YXJ0IHZhbHVlIG9mIHRoZSBzZWxlY3RlZCBkYXRlIHJhbmdlLiAqL1xuICBASW5wdXQoKSBzdGFydFZhbHVlOiBudW1iZXI7XG5cbiAgLyoqIEVuZCB2YWx1ZSBvZiB0aGUgc2VsZWN0ZWQgZGF0ZSByYW5nZS4gKi9cbiAgQElucHV0KCkgZW5kVmFsdWU6IG51bWJlcjtcblxuICAvKiogVGhlIG1pbmltdW0gbnVtYmVyIG9mIGZyZWUgY2VsbHMgbmVlZGVkIHRvIGZpdCB0aGUgbGFiZWwgaW4gdGhlIGZpcnN0IHJvdy4gKi9cbiAgQElucHV0KCkgbGFiZWxNaW5SZXF1aXJlZENlbGxzOiBudW1iZXI7XG5cbiAgLyoqIFRoZSBudW1iZXIgb2YgY29sdW1ucyBpbiB0aGUgdGFibGUuICovXG4gIEBJbnB1dCgpIG51bUNvbHMgPSA3O1xuXG4gIC8qKiBUaGUgY2VsbCBudW1iZXIgb2YgdGhlIGFjdGl2ZSBjZWxsIGluIHRoZSB0YWJsZS4gKi9cbiAgQElucHV0KCkgYWN0aXZlQ2VsbCA9IDA7XG5cbiAgbmdBZnRlclZpZXdDaGVja2VkKCkge1xuICAgIGlmICh0aGlzLl9mb2N1c0FjdGl2ZUNlbGxBZnRlclZpZXdDaGVja2VkKSB7XG4gICAgICB0aGlzLl9mb2N1c0FjdGl2ZUNlbGwoKTtcbiAgICAgIHRoaXMuX2ZvY3VzQWN0aXZlQ2VsbEFmdGVyVmlld0NoZWNrZWQgPSBmYWxzZTtcbiAgICB9XG4gIH1cblxuICAvKiogV2hldGhlciBhIHJhbmdlIGlzIGJlaW5nIHNlbGVjdGVkLiAqL1xuICBASW5wdXQoKSBpc1JhbmdlID0gZmFsc2U7XG5cbiAgLyoqXG4gICAqIFRoZSBhc3BlY3QgcmF0aW8gKHdpZHRoIC8gaGVpZ2h0KSB0byB1c2UgZm9yIHRoZSBjZWxscyBpbiB0aGUgdGFibGUuIFRoaXMgYXNwZWN0IHJhdGlvIHdpbGwgYmVcbiAgICogbWFpbnRhaW5lZCBldmVuIGFzIHRoZSB0YWJsZSByZXNpemVzLlxuICAgKi9cbiAgQElucHV0KCkgY2VsbEFzcGVjdFJhdGlvID0gMTtcblxuICAvKiogU3RhcnQgb2YgdGhlIGNvbXBhcmlzb24gcmFuZ2UuICovXG4gIEBJbnB1dCgpIGNvbXBhcmlzb25TdGFydDogbnVtYmVyIHwgbnVsbDtcblxuICAvKiogRW5kIG9mIHRoZSBjb21wYXJpc29uIHJhbmdlLiAqL1xuICBASW5wdXQoKSBjb21wYXJpc29uRW5kOiBudW1iZXIgfCBudWxsO1xuXG4gIC8qKiBTdGFydCBvZiB0aGUgcHJldmlldyByYW5nZS4gKi9cbiAgQElucHV0KCkgcHJldmlld1N0YXJ0OiBudW1iZXIgfCBudWxsID0gbnVsbDtcblxuICAvKiogRW5kIG9mIHRoZSBwcmV2aWV3IHJhbmdlLiAqL1xuICBASW5wdXQoKSBwcmV2aWV3RW5kOiBudW1iZXIgfCBudWxsID0gbnVsbDtcblxuICAvKiogQVJJQSBBY2Nlc3NpYmxlIG5hbWUgb2YgdGhlIGA8aW5wdXQgc3RhcnREYXRlLz5gICovXG4gIEBJbnB1dCgpIHN0YXJ0RGF0ZUFjY2Vzc2libGVOYW1lOiBzdHJpbmcgfCBudWxsO1xuXG4gIC8qKiBBUklBIEFjY2Vzc2libGUgbmFtZSBvZiB0aGUgYDxpbnB1dCBlbmREYXRlLz5gICovXG4gIEBJbnB1dCgpIGVuZERhdGVBY2Nlc3NpYmxlTmFtZTogc3RyaW5nIHwgbnVsbDtcblxuICAvKiogRW1pdHMgd2hlbiBhIG5ldyB2YWx1ZSBpcyBzZWxlY3RlZC4gKi9cbiAgQE91dHB1dCgpIHJlYWRvbmx5IHNlbGVjdGVkVmFsdWVDaGFuZ2UgPSBuZXcgRXZlbnRFbWl0dGVyPENhbGVuZGFyVXNlckV2ZW50PG51bWJlcj4+KCk7XG5cbiAgLyoqIEVtaXRzIHdoZW4gdGhlIHByZXZpZXcgaGFzIGNoYW5nZWQgYXMgYSByZXN1bHQgb2YgYSB1c2VyIGFjdGlvbi4gKi9cbiAgQE91dHB1dCgpIHJlYWRvbmx5IHByZXZpZXdDaGFuZ2UgPSBuZXcgRXZlbnRFbWl0dGVyPENhbGVuZGFyVXNlckV2ZW50PENhbGVuZGFyQ2VsbCB8IG51bGw+PigpO1xuXG4gIEBPdXRwdXQoKSByZWFkb25seSBhY3RpdmVEYXRlQ2hhbmdlID0gbmV3IEV2ZW50RW1pdHRlcjxDYWxlbmRhclVzZXJFdmVudDxudW1iZXI+PigpO1xuXG4gIC8qKiBFbWl0cyB0aGUgZGF0ZSBhdCB0aGUgcG9zc2libGUgc3RhcnQgb2YgYSBkcmFnIGV2ZW50LiAqL1xuICBAT3V0cHV0KCkgcmVhZG9ubHkgZHJhZ1N0YXJ0ZWQgPSBuZXcgRXZlbnRFbWl0dGVyPENhbGVuZGFyVXNlckV2ZW50PEQ+PigpO1xuXG4gIC8qKiBFbWl0cyB0aGUgZGF0ZSBhdCB0aGUgY29uY2x1c2lvbiBvZiBhIGRyYWcsIG9yIG51bGwgaWYgbW91c2Ugd2FzIG5vdCByZWxlYXNlZCBvbiBhIGRhdGUuICovXG4gIEBPdXRwdXQoKSByZWFkb25seSBkcmFnRW5kZWQgPSBuZXcgRXZlbnRFbWl0dGVyPENhbGVuZGFyVXNlckV2ZW50PEQgfCBudWxsPj4oKTtcblxuICAvKiogVGhlIG51bWJlciBvZiBibGFuayBjZWxscyB0byBwdXQgYXQgdGhlIGJlZ2lubmluZyBmb3IgdGhlIGZpcnN0IHJvdy4gKi9cbiAgX2ZpcnN0Um93T2Zmc2V0OiBudW1iZXI7XG5cbiAgLyoqIFBhZGRpbmcgZm9yIHRoZSBpbmRpdmlkdWFsIGRhdGUgY2VsbHMuICovXG4gIF9jZWxsUGFkZGluZzogc3RyaW5nO1xuXG4gIC8qKiBXaWR0aCBvZiBhbiBpbmRpdmlkdWFsIGNlbGwuICovXG4gIF9jZWxsV2lkdGg6IHN0cmluZztcblxuICBwcml2YXRlIF9kaWREcmFnU2luY2VNb3VzZURvd24gPSBmYWxzZTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIF9lbGVtZW50UmVmOiBFbGVtZW50UmVmPEhUTUxFbGVtZW50PixcbiAgICBwcml2YXRlIF9uZ1pvbmU6IE5nWm9uZVxuICApIHtcbiAgICBfbmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcbiAgICAgIGNvbnN0IGVsZW1lbnQgPSBfZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50O1xuXG4gICAgICAvLyBgdG91Y2htb3ZlYCBpcyBhY3RpdmUgc2luY2Ugd2UgbmVlZCB0byBjYWxsIGBwcmV2ZW50RGVmYXVsdGAuXG4gICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIHRoaXMuX3RvdWNobW92ZUhhbmRsZXIsIGFjdGl2ZUNhcHR1cmluZ0V2ZW50T3B0aW9ucyk7XG5cbiAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VlbnRlcicsIHRoaXMuX2VudGVySGFuZGxlciwgcGFzc2l2ZUNhcHR1cmluZ0V2ZW50T3B0aW9ucyk7XG4gICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2ZvY3VzJywgdGhpcy5fZW50ZXJIYW5kbGVyLCBwYXNzaXZlQ2FwdHVyaW5nRXZlbnRPcHRpb25zKTtcbiAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VsZWF2ZScsIHRoaXMuX2xlYXZlSGFuZGxlciwgcGFzc2l2ZUNhcHR1cmluZ0V2ZW50T3B0aW9ucyk7XG4gICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2JsdXInLCB0aGlzLl9sZWF2ZUhhbmRsZXIsIHBhc3NpdmVDYXB0dXJpbmdFdmVudE9wdGlvbnMpO1xuXG4gICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHRoaXMuX21vdXNlZG93bkhhbmRsZXIsIHBhc3NpdmVFdmVudE9wdGlvbnMpO1xuICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgdGhpcy5fbW91c2Vkb3duSGFuZGxlciwgcGFzc2l2ZUV2ZW50T3B0aW9ucyk7XG5cbiAgICAgIGlmICh0aGlzLl9wbGF0Zm9ybS5pc0Jyb3dzZXIpIHtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0aGlzLl9tb3VzZXVwSGFuZGxlcik7XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIHRoaXMuX3RvdWNoZW5kSGFuZGxlcik7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKiogQ2FsbGVkIHdoZW4gYSBjZWxsIGlzIGNsaWNrZWQuICovXG4gIF9jZWxsQ2xpY2tlZChjZWxsOiBDYWxlbmRhckNlbGwsIGV2ZW50OiBNb3VzZUV2ZW50KTogdm9pZCB7XG4gICAgLy8gSWdub3JlIFwiY2xpY2tzXCIgdGhhdCBhcmUgYWN0dWFsbHkgY2FuY2VsZWQgZHJhZ3MgKGVnIHRoZSB1c2VyIGRyYWdnZWRcbiAgICAvLyBvZmYgYW5kIHRoZW4gd2VudCBiYWNrIHRvIHRoaXMgY2VsbCB0byB1bmRvKS5cbiAgICBpZiAodGhpcy5fZGlkRHJhZ1NpbmNlTW91c2VEb3duKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKGNlbGwuZW5hYmxlZCkge1xuICAgICAgdGhpcy5zZWxlY3RlZFZhbHVlQ2hhbmdlLmVtaXQoeyB2YWx1ZTogY2VsbC52YWx1ZSwgZXZlbnQgfSk7XG4gICAgfVxuICB9XG5cbiAgX2VtaXRBY3RpdmVEYXRlQ2hhbmdlKGNlbGw6IENhbGVuZGFyQ2VsbCwgZXZlbnQ6IEZvY3VzRXZlbnQpOiB2b2lkIHtcbiAgICBpZiAoY2VsbC5lbmFibGVkKSB7XG4gICAgICB0aGlzLmFjdGl2ZURhdGVDaGFuZ2UuZW1pdCh7IHZhbHVlOiBjZWxsLnZhbHVlLCBldmVudCB9KTtcbiAgICB9XG4gIH1cblxuICAvKiogUmV0dXJucyB3aGV0aGVyIGEgY2VsbCBzaG91bGQgYmUgbWFya2VkIGFzIHNlbGVjdGVkLiAqL1xuICBfaXNTZWxlY3RlZCh2YWx1ZTogbnVtYmVyKSB7XG4gICAgcmV0dXJuIHRoaXMuc3RhcnRWYWx1ZSA9PT0gdmFsdWUgfHwgdGhpcy5lbmRWYWx1ZSA9PT0gdmFsdWU7XG4gIH1cblxuICBuZ09uQ2hhbmdlcyhjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKSB7XG4gICAgY29uc3QgY29sdW1uQ2hhbmdlcyA9IGNoYW5nZXNbJ251bUNvbHMnXTtcbiAgICBjb25zdCB7IHJvd3MsIG51bUNvbHMgfSA9IHRoaXM7XG5cbiAgICBpZiAoY2hhbmdlc1sncm93cyddIHx8IGNvbHVtbkNoYW5nZXMpIHtcbiAgICAgIHRoaXMuX2ZpcnN0Um93T2Zmc2V0ID0gcm93cyAmJiByb3dzLmxlbmd0aCAmJiByb3dzWzBdLmxlbmd0aCA/IG51bUNvbHMgLSByb3dzWzBdLmxlbmd0aCA6IDA7XG4gICAgfVxuXG4gICAgaWYgKGNoYW5nZXNbJ2NlbGxBc3BlY3RSYXRpbyddIHx8IGNvbHVtbkNoYW5nZXMgfHwgIXRoaXMuX2NlbGxQYWRkaW5nKSB7XG4gICAgICB0aGlzLl9jZWxsUGFkZGluZyA9IGAkeyg1MCAqIHRoaXMuY2VsbEFzcGVjdFJhdGlvKSAvIG51bUNvbHN9JWA7XG4gICAgfVxuXG4gICAgaWYgKGNvbHVtbkNoYW5nZXMgfHwgIXRoaXMuX2NlbGxXaWR0aCkge1xuICAgICAgdGhpcy5fY2VsbFdpZHRoID0gYCR7MTAwIC8gbnVtQ29sc30lYDtcbiAgICB9XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICBjb25zdCBlbGVtZW50ID0gdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50O1xuXG4gICAgZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCB0aGlzLl90b3VjaG1vdmVIYW5kbGVyLCBhY3RpdmVDYXB0dXJpbmdFdmVudE9wdGlvbnMpO1xuXG4gICAgZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZWVudGVyJywgdGhpcy5fZW50ZXJIYW5kbGVyLCBwYXNzaXZlQ2FwdHVyaW5nRXZlbnRPcHRpb25zKTtcbiAgICBlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2ZvY3VzJywgdGhpcy5fZW50ZXJIYW5kbGVyLCBwYXNzaXZlQ2FwdHVyaW5nRXZlbnRPcHRpb25zKTtcbiAgICBlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlbGVhdmUnLCB0aGlzLl9sZWF2ZUhhbmRsZXIsIHBhc3NpdmVDYXB0dXJpbmdFdmVudE9wdGlvbnMpO1xuICAgIGVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignYmx1cicsIHRoaXMuX2xlYXZlSGFuZGxlciwgcGFzc2l2ZUNhcHR1cmluZ0V2ZW50T3B0aW9ucyk7XG5cbiAgICBlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHRoaXMuX21vdXNlZG93bkhhbmRsZXIsIHBhc3NpdmVFdmVudE9wdGlvbnMpO1xuICAgIGVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIHRoaXMuX21vdXNlZG93bkhhbmRsZXIsIHBhc3NpdmVFdmVudE9wdGlvbnMpO1xuXG4gICAgaWYgKHRoaXMuX3BsYXRmb3JtLmlzQnJvd3Nlcikge1xuICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0aGlzLl9tb3VzZXVwSGFuZGxlcik7XG4gICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCB0aGlzLl90b3VjaGVuZEhhbmRsZXIpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBSZXR1cm5zIHdoZXRoZXIgYSBjZWxsIGlzIGFjdGl2ZS4gKi9cbiAgX2lzQWN0aXZlQ2VsbChyb3dJbmRleDogbnVtYmVyLCBjb2xJbmRleDogbnVtYmVyKTogYm9vbGVhbiB7XG4gICAgbGV0IGNlbGxOdW1iZXIgPSByb3dJbmRleCAqIHRoaXMubnVtQ29scyArIGNvbEluZGV4O1xuXG4gICAgLy8gQWNjb3VudCBmb3IgdGhlIGZhY3QgdGhhdCB0aGUgZmlyc3Qgcm93IG1heSBub3QgaGF2ZSBhcyBtYW55IGNlbGxzLlxuICAgIGlmIChyb3dJbmRleCkge1xuICAgICAgY2VsbE51bWJlciAtPSB0aGlzLl9maXJzdFJvd09mZnNldDtcbiAgICB9XG5cbiAgICByZXR1cm4gY2VsbE51bWJlciA9PSB0aGlzLmFjdGl2ZUNlbGw7XG4gIH1cblxuICAvKipcbiAgICogRm9jdXNlcyB0aGUgYWN0aXZlIGNlbGwgYWZ0ZXIgdGhlIG1pY3JvdGFzayBxdWV1ZSBpcyBlbXB0eS5cbiAgICpcbiAgICogQWRkaW5nIGEgMG1zIHNldFRpbWVvdXQgc2VlbXMgdG8gZml4IFZvaWNlb3ZlciBsb3NpbmcgZm9jdXMgd2hlbiBwcmVzc2luZyBQYWdlVXAvUGFnZURvd25cbiAgICogKGlzc3VlICMyNDMzMCkuXG4gICAqXG4gICAqIERldGVybWluZWQgYSAwbXMgYnkgZ3JhZHVhbGx5IGluY3JlYXNpbmcgZHVyYXRpb24gZnJvbSAwIGFuZCB0ZXN0aW5nIHR3byB1c2UgY2FzZXMgd2l0aCBzY3JlZW5cbiAgICogcmVhZGVyIGVuYWJsZWQ6XG4gICAqXG4gICAqIDEuIFByZXNzaW5nIFBhZ2VVcC9QYWdlRG93biByZXBlYXRlZGx5IHdpdGggcGF1c2luZyBiZXR3ZWVuIGVhY2gga2V5IHByZXNzLlxuICAgKiAyLiBQcmVzc2luZyBhbmQgaG9sZGluZyB0aGUgUGFnZURvd24ga2V5IHdpdGggcmVwZWF0ZWQga2V5cyBlbmFibGVkLlxuICAgKlxuICAgKiBUZXN0IDEgd29ya2VkIHJvdWdobHkgOTUtOTklIG9mIHRoZSB0aW1lIHdpdGggMG1zIGFuZCBnb3QgYSBsaXR0bGUgYml0IGJldHRlciBhcyB0aGUgZHVyYXRpb25cbiAgICogaW5jcmVhc2VkLiBUZXN0IDIgZ290IHNsaWdodGx5IGJldHRlciB1bnRpbCB0aGUgZHVyYXRpb24gd2FzIGxvbmcgZW5vdWdoIHRvIGludGVyZmVyZSB3aXRoXG4gICAqIHJlcGVhdGVkIGtleXMuIElmIHRoZSByZXBlYXRlZCBrZXkgc3BlZWQgd2FzIGZhc3RlciB0aGFuIHRoZSB0aW1lb3V0IGR1cmF0aW9uLCB0aGVuIHByZXNzaW5nXG4gICAqIGFuZCBob2xkaW5nIHBhZ2Vkb3duIGNhdXNlZCB0aGUgZW50aXJlIHBhZ2UgdG8gc2Nyb2xsLlxuICAgKlxuICAgKiBTaW5jZSByZXBlYXRlZCBrZXkgc3BlZWQgY2FuIHZlcmlmeSBhY3Jvc3MgbWFjaGluZXMsIGRldGVybWluZWQgdGhhdCBhbnkgZHVyYXRpb24gY291bGRcbiAgICogcG90ZW50aWFsbHkgaW50ZXJmZXJlIHdpdGggcmVwZWF0ZWQga2V5cy4gMG1zIHdvdWxkIGJlIGJlc3QgYmVjYXVzZSBpdCBhbG1vc3QgZW50aXJlbHlcbiAgICogZWxpbWluYXRlcyB0aGUgZm9jdXMgYmVpbmcgbG9zdCBpbiBWb2ljZW92ZXIgKCMyNDMzMCkgd2l0aG91dCBjYXVzaW5nIHVuaW50ZW5kZWQgc2lkZSBlZmZlY3RzLlxuICAgKiBBZGRpbmcgZGVsYXkgYWxzbyBjb21wbGljYXRlcyB3cml0aW5nIHRlc3RzLlxuICAgKi9cbiAgX2ZvY3VzQWN0aXZlQ2VsbChtb3ZlUHJldmlldyA9IHRydWUpIHtcbiAgICB0aGlzLl9uZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4ge1xuICAgICAgdGhpcy5fbmdab25lLm9uU3RhYmxlLnBpcGUodGFrZSgxKSkuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgY29uc3QgYWN0aXZlQ2VsbDogSFRNTEVsZW1lbnQgfCBudWxsID1cbiAgICAgICAgICAgIHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuY2FsZW5kYXItYm9keS1hY3RpdmUnKTtcblxuICAgICAgICAgIGlmIChhY3RpdmVDZWxsKSB7XG4gICAgICAgICAgICBpZiAoIW1vdmVQcmV2aWV3KSB7XG4gICAgICAgICAgICAgIHRoaXMuX3NraXBOZXh0Rm9jdXMgPSB0cnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBhY3RpdmVDZWxsLmZvY3VzKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqIEZvY3VzZXMgdGhlIGFjdGl2ZSBjZWxsIGFmdGVyIGNoYW5nZSBkZXRlY3Rpb24gaGFzIHJ1biBhbmQgdGhlIG1pY3JvdGFzayBxdWV1ZSBpcyBlbXB0eS4gKi9cbiAgX3NjaGVkdWxlRm9jdXNBY3RpdmVDZWxsQWZ0ZXJWaWV3Q2hlY2tlZCgpIHtcbiAgICB0aGlzLl9mb2N1c0FjdGl2ZUNlbGxBZnRlclZpZXdDaGVja2VkID0gdHJ1ZTtcbiAgfVxuXG4gIC8qKiBHZXRzIHdoZXRoZXIgYSB2YWx1ZSBpcyB0aGUgc3RhcnQgb2YgdGhlIG1haW4gcmFuZ2UuICovXG4gIF9pc1JhbmdlU3RhcnQodmFsdWU6IG51bWJlcikge1xuICAgIHJldHVybiBpc1N0YXJ0KHZhbHVlLCB0aGlzLnN0YXJ0VmFsdWUsIHRoaXMuZW5kVmFsdWUpO1xuICB9XG5cbiAgLyoqIEdldHMgd2hldGhlciBhIHZhbHVlIGlzIHRoZSBlbmQgb2YgdGhlIG1haW4gcmFuZ2UuICovXG4gIF9pc1JhbmdlRW5kKHZhbHVlOiBudW1iZXIpIHtcbiAgICByZXR1cm4gaXNFbmQodmFsdWUsIHRoaXMuc3RhcnRWYWx1ZSwgdGhpcy5lbmRWYWx1ZSk7XG4gIH1cblxuICAvKiogR2V0cyB3aGV0aGVyIGEgdmFsdWUgaXMgd2l0aGluIHRoZSBjdXJyZW50bHktc2VsZWN0ZWQgcmFuZ2UuICovXG4gIF9pc0luUmFuZ2UodmFsdWU6IG51bWJlcik6IGJvb2xlYW4ge1xuICAgIHJldHVybiBpc0luUmFuZ2UodmFsdWUsIHRoaXMuc3RhcnRWYWx1ZSwgdGhpcy5lbmRWYWx1ZSwgdGhpcy5pc1JhbmdlKTtcbiAgfVxuXG4gIC8qKiBHZXRzIHdoZXRoZXIgYSB2YWx1ZSBpcyB0aGUgc3RhcnQgb2YgdGhlIGNvbXBhcmlzb24gcmFuZ2UuICovXG4gIF9pc0NvbXBhcmlzb25TdGFydCh2YWx1ZTogbnVtYmVyKSB7XG4gICAgcmV0dXJuIGlzU3RhcnQodmFsdWUsIHRoaXMuY29tcGFyaXNvblN0YXJ0LCB0aGlzLmNvbXBhcmlzb25FbmQpO1xuICB9XG5cbiAgLyoqIFdoZXRoZXIgdGhlIGNlbGwgaXMgYSBzdGFydCBicmlkZ2UgY2VsbCBiZXR3ZWVuIHRoZSBtYWluIGFuZCBjb21wYXJpc29uIHJhbmdlcy4gKi9cbiAgX2lzQ29tcGFyaXNvbkJyaWRnZVN0YXJ0KHZhbHVlOiBudW1iZXIsIHJvd0luZGV4OiBudW1iZXIsIGNvbEluZGV4OiBudW1iZXIpIHtcbiAgICBpZiAoIXRoaXMuX2lzQ29tcGFyaXNvblN0YXJ0KHZhbHVlKSB8fCB0aGlzLl9pc1JhbmdlU3RhcnQodmFsdWUpIHx8ICF0aGlzLl9pc0luUmFuZ2UodmFsdWUpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgbGV0IHByZXZpb3VzQ2VsbDogQ2FsZW5kYXJDZWxsIHwgdW5kZWZpbmVkID0gdGhpcy5yb3dzW3Jvd0luZGV4XVtjb2xJbmRleCAtIDFdO1xuXG4gICAgaWYgKCFwcmV2aW91c0NlbGwpIHtcbiAgICAgIGNvbnN0IHByZXZpb3VzUm93ID0gdGhpcy5yb3dzW3Jvd0luZGV4IC0gMV07XG4gICAgICBwcmV2aW91c0NlbGwgPSBwcmV2aW91c1JvdyAmJiBwcmV2aW91c1Jvd1twcmV2aW91c1Jvdy5sZW5ndGggLSAxXTtcbiAgICB9XG5cbiAgICByZXR1cm4gcHJldmlvdXNDZWxsICYmICF0aGlzLl9pc1JhbmdlRW5kKHByZXZpb3VzQ2VsbC5jb21wYXJlVmFsdWUpO1xuICB9XG5cbiAgLyoqIFdoZXRoZXIgdGhlIGNlbGwgaXMgYW4gZW5kIGJyaWRnZSBjZWxsIGJldHdlZW4gdGhlIG1haW4gYW5kIGNvbXBhcmlzb24gcmFuZ2VzLiAqL1xuICBfaXNDb21wYXJpc29uQnJpZGdlRW5kKHZhbHVlOiBudW1iZXIsIHJvd0luZGV4OiBudW1iZXIsIGNvbEluZGV4OiBudW1iZXIpIHtcbiAgICBpZiAoIXRoaXMuX2lzQ29tcGFyaXNvbkVuZCh2YWx1ZSkgfHwgdGhpcy5faXNSYW5nZUVuZCh2YWx1ZSkgfHwgIXRoaXMuX2lzSW5SYW5nZSh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBsZXQgbmV4dENlbGw6IENhbGVuZGFyQ2VsbCB8IHVuZGVmaW5lZCA9IHRoaXMucm93c1tyb3dJbmRleF1bY29sSW5kZXggKyAxXTtcblxuICAgIGlmICghbmV4dENlbGwpIHtcbiAgICAgIGNvbnN0IG5leHRSb3cgPSB0aGlzLnJvd3Nbcm93SW5kZXggKyAxXTtcbiAgICAgIG5leHRDZWxsID0gbmV4dFJvdyAmJiBuZXh0Um93WzBdO1xuICAgIH1cblxuICAgIHJldHVybiBuZXh0Q2VsbCAmJiAhdGhpcy5faXNSYW5nZVN0YXJ0KG5leHRDZWxsLmNvbXBhcmVWYWx1ZSk7XG4gIH1cblxuICAvKiogR2V0cyB3aGV0aGVyIGEgdmFsdWUgaXMgdGhlIGVuZCBvZiB0aGUgY29tcGFyaXNvbiByYW5nZS4gKi9cbiAgX2lzQ29tcGFyaXNvbkVuZCh2YWx1ZTogbnVtYmVyKSB7XG4gICAgcmV0dXJuIGlzRW5kKHZhbHVlLCB0aGlzLmNvbXBhcmlzb25TdGFydCwgdGhpcy5jb21wYXJpc29uRW5kKTtcbiAgfVxuXG4gIC8qKiBHZXRzIHdoZXRoZXIgYSB2YWx1ZSBpcyB3aXRoaW4gdGhlIGN1cnJlbnQgY29tcGFyaXNvbiByYW5nZS4gKi9cbiAgX2lzSW5Db21wYXJpc29uUmFuZ2UodmFsdWU6IG51bWJlcikge1xuICAgIHJldHVybiBpc0luUmFuZ2UodmFsdWUsIHRoaXMuY29tcGFyaXNvblN0YXJ0LCB0aGlzLmNvbXBhcmlzb25FbmQsIHRoaXMuaXNSYW5nZSk7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyB3aGV0aGVyIGEgdmFsdWUgaXMgdGhlIHNhbWUgYXMgdGhlIHN0YXJ0IGFuZCBlbmQgb2YgdGhlIGNvbXBhcmlzb24gcmFuZ2UuXG4gICAqIEZvciBjb250ZXh0LCB0aGUgZnVuY3Rpb25zIHRoYXQgd2UgdXNlIHRvIGRldGVybWluZSB3aGV0aGVyIHNvbWV0aGluZyBpcyB0aGUgc3RhcnQvZW5kIG9mXG4gICAqIGEgcmFuZ2UgZG9uJ3QgYWxsb3cgZm9yIHRoZSBzdGFydCBhbmQgZW5kIHRvIGJlIG9uIHRoZSBzYW1lIGRheSwgYmVjYXVzZSB3ZSdkIGhhdmUgdG8gdXNlXG4gICAqIG11Y2ggbW9yZSBzcGVjaWZpYyBDU1Mgc2VsZWN0b3JzIHRvIHN0eWxlIHRoZW0gY29ycmVjdGx5IGluIGFsbCBzY2VuYXJpb3MuIFRoaXMgaXMgZmluZSBmb3JcbiAgICogdGhlIHJlZ3VsYXIgcmFuZ2UsIGJlY2F1c2Ugd2hlbiBpdCBoYXBwZW5zLCB0aGUgc2VsZWN0ZWQgc3R5bGVzIHRha2Ugb3ZlciBhbmQgc3RpbGwgc2hvdyB3aGVyZVxuICAgKiB0aGUgcmFuZ2Ugd291bGQndmUgYmVlbiwgaG93ZXZlciB3ZSBkb24ndCBoYXZlIHRoZXNlIHNlbGVjdGVkIHN0eWxlcyBmb3IgYSBjb21wYXJpc29uIHJhbmdlLlxuICAgKiBUaGlzIGZ1bmN0aW9uIGlzIHVzZWQgdG8gYXBwbHkgYSBjbGFzcyB0aGF0IHNlcnZlcyB0aGUgc2FtZSBwdXJwb3NlIGFzIHRoZSBvbmUgZm9yIHNlbGVjdGVkXG4gICAqIGRhdGVzLCBidXQgaXQgb25seSBhcHBsaWVzIGluIHRoZSBjb250ZXh0IG9mIGEgY29tcGFyaXNvbiByYW5nZS5cbiAgICovXG4gIF9pc0NvbXBhcmlzb25JZGVudGljYWwodmFsdWU6IG51bWJlcikge1xuICAgIC8vIE5vdGUgdGhhdCB3ZSBkb24ndCBuZWVkIHRvIG51bGwgY2hlY2sgdGhlIHN0YXJ0L2VuZFxuICAgIC8vIGhlcmUsIGJlY2F1c2UgdGhlIGB2YWx1ZWAgd2lsbCBhbHdheXMgYmUgZGVmaW5lZC5cbiAgICByZXR1cm4gdGhpcy5jb21wYXJpc29uU3RhcnQgPT09IHRoaXMuY29tcGFyaXNvbkVuZCAmJiB2YWx1ZSA9PT0gdGhpcy5jb21wYXJpc29uU3RhcnQ7XG4gIH1cblxuICAvKiogR2V0cyB3aGV0aGVyIGEgdmFsdWUgaXMgdGhlIHN0YXJ0IG9mIHRoZSBwcmV2aWV3IHJhbmdlLiAqL1xuICBfaXNQcmV2aWV3U3RhcnQodmFsdWU6IG51bWJlcikge1xuICAgIHJldHVybiBpc1N0YXJ0KHZhbHVlLCB0aGlzLnByZXZpZXdTdGFydCwgdGhpcy5wcmV2aWV3RW5kKTtcbiAgfVxuXG4gIC8qKiBHZXRzIHdoZXRoZXIgYSB2YWx1ZSBpcyB0aGUgZW5kIG9mIHRoZSBwcmV2aWV3IHJhbmdlLiAqL1xuICBfaXNQcmV2aWV3RW5kKHZhbHVlOiBudW1iZXIpIHtcbiAgICByZXR1cm4gaXNFbmQodmFsdWUsIHRoaXMucHJldmlld1N0YXJ0LCB0aGlzLnByZXZpZXdFbmQpO1xuICB9XG5cbiAgLyoqIEdldHMgd2hldGhlciBhIHZhbHVlIGlzIGluc2lkZSB0aGUgcHJldmlldyByYW5nZS4gKi9cbiAgX2lzSW5QcmV2aWV3KHZhbHVlOiBudW1iZXIpIHtcbiAgICByZXR1cm4gaXNJblJhbmdlKHZhbHVlLCB0aGlzLnByZXZpZXdTdGFydCwgdGhpcy5wcmV2aWV3RW5kLCB0aGlzLmlzUmFuZ2UpO1xuICB9XG5cbiAgLyoqIEdldHMgaWRzIG9mIGFyaWEgZGVzY3JpcHRpb25zIGZvciB0aGUgc3RhcnQgYW5kIGVuZCBvZiBhIGRhdGUgcmFuZ2UuICovXG4gIF9nZXREZXNjcmliZWRieSh2YWx1ZTogbnVtYmVyKTogc3RyaW5nIHwgbnVsbCB7XG4gICAgaWYgKCF0aGlzLmlzUmFuZ2UpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnN0YXJ0VmFsdWUgPT09IHZhbHVlICYmIHRoaXMuZW5kVmFsdWUgPT09IHZhbHVlKSB7XG4gICAgICByZXR1cm4gYCR7dGhpcy5fc3RhcnREYXRlTGFiZWxJZH0gJHt0aGlzLl9lbmREYXRlTGFiZWxJZH1gO1xuICAgIH0gZWxzZSBpZiAodGhpcy5zdGFydFZhbHVlID09PSB2YWx1ZSkge1xuICAgICAgcmV0dXJuIHRoaXMuX3N0YXJ0RGF0ZUxhYmVsSWQ7XG4gICAgfSBlbHNlIGlmICh0aGlzLmVuZFZhbHVlID09PSB2YWx1ZSkge1xuICAgICAgcmV0dXJuIHRoaXMuX2VuZERhdGVMYWJlbElkO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBFdmVudCBoYW5kbGVyIGZvciB3aGVuIHRoZSB1c2VyIGVudGVycyBhbiBlbGVtZW50XG4gICAqIGluc2lkZSB0aGUgY2FsZW5kYXIgYm9keSAoZS5nLiBieSBob3ZlcmluZyBpbiBvciBmb2N1cykuXG4gICAqL1xuICBwcml2YXRlIF9lbnRlckhhbmRsZXIgPSAoZXZlbnQ6IEV2ZW50KSA9PiB7XG4gICAgaWYgKHRoaXMuX3NraXBOZXh0Rm9jdXMgJiYgZXZlbnQudHlwZSA9PT0gJ2ZvY3VzJykge1xuICAgICAgdGhpcy5fc2tpcE5leHRGb2N1cyA9IGZhbHNlO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFdlIG9ubHkgbmVlZCB0byBoaXQgdGhlIHpvbmUgd2hlbiB3ZSdyZSBzZWxlY3RpbmcgYSByYW5nZS5cbiAgICBpZiAoZXZlbnQudGFyZ2V0ICYmIHRoaXMuaXNSYW5nZSkge1xuICAgICAgY29uc3QgY2VsbCA9IHRoaXMuX2dldENlbGxGcm9tRWxlbWVudChldmVudC50YXJnZXQgYXMgSFRNTEVsZW1lbnQpO1xuXG4gICAgICBpZiAoY2VsbCkge1xuICAgICAgICB0aGlzLl9uZ1pvbmUucnVuKCgpID0+XG4gICAgICAgICAgdGhpcy5wcmV2aWV3Q2hhbmdlLmVtaXQoeyB2YWx1ZTogY2VsbC5lbmFibGVkID8gY2VsbCA6IG51bGwsIGV2ZW50IH0pXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIHByaXZhdGUgX3RvdWNobW92ZUhhbmRsZXIgPSAoZXZlbnQ6IFRvdWNoRXZlbnQpID0+IHtcbiAgICBpZiAoIXRoaXMuaXNSYW5nZSkgcmV0dXJuO1xuXG4gICAgY29uc3QgdGFyZ2V0ID0gZ2V0QWN0dWFsVG91Y2hUYXJnZXQoZXZlbnQpO1xuICAgIGNvbnN0IGNlbGwgPSB0YXJnZXQgPyB0aGlzLl9nZXRDZWxsRnJvbUVsZW1lbnQodGFyZ2V0IGFzIEhUTUxFbGVtZW50KSA6IG51bGw7XG5cbiAgICBpZiAodGFyZ2V0ICE9PSBldmVudC50YXJnZXQpIHtcbiAgICAgIHRoaXMuX2RpZERyYWdTaW5jZU1vdXNlRG93biA9IHRydWU7XG4gICAgfVxuXG4gICAgLy8gSWYgdGhlIGluaXRpYWwgdGFyZ2V0IG9mIHRoZSB0b3VjaCBpcyBhIGRhdGUgY2VsbCwgcHJldmVudCBkZWZhdWx0IHNvXG4gICAgLy8gdGhhdCB0aGUgbW92ZSBpcyBub3QgaGFuZGxlZCBhcyBhIHNjcm9sbC5cbiAgICBpZiAoZ2V0Q2VsbEVsZW1lbnQoZXZlbnQudGFyZ2V0IGFzIEhUTUxFbGVtZW50KSkge1xuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICB9XG5cbiAgICB0aGlzLl9uZ1pvbmUucnVuKCgpID0+IHRoaXMucHJldmlld0NoYW5nZS5lbWl0KHsgdmFsdWU6IGNlbGw/LmVuYWJsZWQgPyBjZWxsIDogbnVsbCwgZXZlbnQgfSkpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBFdmVudCBoYW5kbGVyIGZvciB3aGVuIHRoZSB1c2VyJ3MgcG9pbnRlciBsZWF2ZXMgYW4gZWxlbWVudFxuICAgKiBpbnNpZGUgdGhlIGNhbGVuZGFyIGJvZHkgKGUuZy4gYnkgaG92ZXJpbmcgb3V0IG9yIGJsdXJyaW5nKS5cbiAgICovXG4gIHByaXZhdGUgX2xlYXZlSGFuZGxlciA9IChldmVudDogRXZlbnQpID0+IHtcbiAgICAvLyBXZSBvbmx5IG5lZWQgdG8gaGl0IHRoZSB6b25lIHdoZW4gd2UncmUgc2VsZWN0aW5nIGEgcmFuZ2UuXG4gICAgaWYgKHRoaXMucHJldmlld0VuZCAhPT0gbnVsbCAmJiB0aGlzLmlzUmFuZ2UpIHtcbiAgICAgIGlmIChldmVudC50eXBlICE9PSAnYmx1cicpIHtcbiAgICAgICAgdGhpcy5fZGlkRHJhZ1NpbmNlTW91c2VEb3duID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgLy8gT25seSByZXNldCB0aGUgcHJldmlldyBlbmQgdmFsdWUgd2hlbiBsZWF2aW5nIGNlbGxzLiBUaGlzIGxvb2tzIGJldHRlciwgYmVjYXVzZVxuICAgICAgLy8gd2UgaGF2ZSBhIGdhcCBiZXR3ZWVuIHRoZSBjZWxscyBhbmQgdGhlIHJvd3MgYW5kIHdlIGRvbid0IHdhbnQgdG8gcmVtb3ZlIHRoZVxuICAgICAgLy8gcmFuZ2UganVzdCBmb3IgaXQgdG8gc2hvdyB1cCBhZ2FpbiB3aGVuIHRoZSB1c2VyIG1vdmVzIGEgZmV3IHBpeGVscyB0byB0aGUgc2lkZS5cbiAgICAgIGlmIChcbiAgICAgICAgZXZlbnQudGFyZ2V0ICYmXG4gICAgICAgIHRoaXMuX2dldENlbGxGcm9tRWxlbWVudChldmVudC50YXJnZXQgYXMgSFRNTEVsZW1lbnQpICYmXG4gICAgICAgICEoXG4gICAgICAgICAgKGV2ZW50IGFzIE1vdXNlRXZlbnQpLnJlbGF0ZWRUYXJnZXQgJiZcbiAgICAgICAgICB0aGlzLl9nZXRDZWxsRnJvbUVsZW1lbnQoKGV2ZW50IGFzIE1vdXNlRXZlbnQpLnJlbGF0ZWRUYXJnZXQgYXMgSFRNTEVsZW1lbnQpXG4gICAgICAgIClcbiAgICAgICkge1xuICAgICAgICB0aGlzLl9uZ1pvbmUucnVuKCgpID0+IHRoaXMucHJldmlld0NoYW5nZS5lbWl0KHsgdmFsdWU6IG51bGwsIGV2ZW50IH0pKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIFRyaWdnZXJlZCBvbiBtb3VzZWRvd24gb3IgdG91Y2hzdGFydCBvbiBhIGRhdGUgY2VsbC5cbiAgICogUmVzcHNvbnNpYmxlIGZvciBzdGFydGluZyBhIGRyYWcgc2VxdWVuY2UuXG4gICAqL1xuICBwcml2YXRlIF9tb3VzZWRvd25IYW5kbGVyID0gKGV2ZW50OiBFdmVudCkgPT4ge1xuICAgIGlmICghdGhpcy5pc1JhbmdlKSByZXR1cm47XG5cbiAgICB0aGlzLl9kaWREcmFnU2luY2VNb3VzZURvd24gPSBmYWxzZTtcbiAgICAvLyBCZWdpbiBhIGRyYWcgaWYgYSBjZWxsIHdpdGhpbiB0aGUgY3VycmVudCByYW5nZSB3YXMgdGFyZ2V0ZWQuXG4gICAgY29uc3QgY2VsbCA9IGV2ZW50LnRhcmdldCAmJiB0aGlzLl9nZXRDZWxsRnJvbUVsZW1lbnQoZXZlbnQudGFyZ2V0IGFzIEhUTUxFbGVtZW50KTtcbiAgICBpZiAoIWNlbGwgfHwgIXRoaXMuX2lzSW5SYW5nZShjZWxsLmNvbXBhcmVWYWx1ZSkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLl9uZ1pvbmUucnVuKCgpID0+IHtcbiAgICAgIHRoaXMuZHJhZ1N0YXJ0ZWQuZW1pdCh7XG4gICAgICAgIHZhbHVlOiBjZWxsLnJhd1ZhbHVlLFxuICAgICAgICBldmVudCxcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9O1xuXG4gIC8qKiBUcmlnZ2VyZWQgb24gbW91c2V1cCBhbnl3aGVyZS4gUmVzcHNvbnNpYmxlIGZvciBlbmRpbmcgYSBkcmFnIHNlcXVlbmNlLiAqL1xuICBwcml2YXRlIF9tb3VzZXVwSGFuZGxlciA9IChldmVudDogRXZlbnQpID0+IHtcbiAgICBpZiAoIXRoaXMuaXNSYW5nZSkgcmV0dXJuO1xuXG4gICAgY29uc3QgY2VsbEVsZW1lbnQgPSBnZXRDZWxsRWxlbWVudChldmVudC50YXJnZXQgYXMgSFRNTEVsZW1lbnQpO1xuICAgIGlmICghY2VsbEVsZW1lbnQpIHtcbiAgICAgIC8vIE1vdXNldXAgaGFwcGVuZWQgb3V0c2lkZSBvZiBkYXRlcGlja2VyLiBDYW5jZWwgZHJhZy5cbiAgICAgIHRoaXMuX25nWm9uZS5ydW4oKCkgPT4ge1xuICAgICAgICB0aGlzLmRyYWdFbmRlZC5lbWl0KHsgdmFsdWU6IG51bGwsIGV2ZW50IH0pO1xuICAgICAgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKGNlbGxFbGVtZW50LmNsb3Nlc3QoJy5jYWxlbmRhci1ib2R5JykgIT09IHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudCkge1xuICAgICAgLy8gTW91c2V1cCBoYXBwZW5lZCBpbnNpZGUgYSBkaWZmZXJlbnQgbW9udGggaW5zdGFuY2UuXG4gICAgICAvLyBBbGxvdyBpdCB0byBoYW5kbGUgdGhlIGV2ZW50LlxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuX25nWm9uZS5ydW4oKCkgPT4ge1xuICAgICAgY29uc3QgY2VsbCA9IHRoaXMuX2dldENlbGxGcm9tRWxlbWVudChjZWxsRWxlbWVudCk7XG4gICAgICB0aGlzLmRyYWdFbmRlZC5lbWl0KHsgdmFsdWU6IGNlbGw/LnJhd1ZhbHVlID8/IG51bGwsIGV2ZW50IH0pO1xuICAgIH0pO1xuICB9O1xuXG4gIC8qKiBUcmlnZ2VyZWQgb24gdG91Y2hlbmQgYW55d2hlcmUuIFJlc3Bzb25zaWJsZSBmb3IgZW5kaW5nIGEgZHJhZyBzZXF1ZW5jZS4gKi9cbiAgcHJpdmF0ZSBfdG91Y2hlbmRIYW5kbGVyID0gKGV2ZW50OiBUb3VjaEV2ZW50KSA9PiB7XG4gICAgY29uc3QgdGFyZ2V0ID0gZ2V0QWN0dWFsVG91Y2hUYXJnZXQoZXZlbnQpO1xuXG4gICAgaWYgKHRhcmdldCkge1xuICAgICAgdGhpcy5fbW91c2V1cEhhbmRsZXIoeyB0YXJnZXQgfSBhcyB1bmtub3duIGFzIEV2ZW50KTtcbiAgICB9XG4gIH07XG5cbiAgLyoqIEZpbmRzIHRoZSBNYXRDYWxlbmRhckNlbGwgdGhhdCBjb3JyZXNwb25kcyB0byBhIERPTSBub2RlLiAqL1xuICBwcml2YXRlIF9nZXRDZWxsRnJvbUVsZW1lbnQoZWxlbWVudDogSFRNTEVsZW1lbnQpOiBDYWxlbmRhckNlbGwgfCBudWxsIHtcbiAgICBjb25zdCBjZWxsID0gZ2V0Q2VsbEVsZW1lbnQoZWxlbWVudCk7XG5cbiAgICBpZiAoY2VsbCkge1xuICAgICAgY29uc3Qgcm93ID0gY2VsbC5nZXRBdHRyaWJ1dGUoJ2RhdGEtcm93Jyk7XG4gICAgICBjb25zdCBjb2wgPSBjZWxsLmdldEF0dHJpYnV0ZSgnZGF0YS1jb2wnKTtcblxuICAgICAgaWYgKHJvdyAmJiBjb2wpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucm93c1twYXJzZUludChyb3cpXVtwYXJzZUludChjb2wpXTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHByaXZhdGUgX2lkID0gYGNhbGVuZGFyLWJvZHktJHtjYWxlbmRhckJvZHlJZCsrfWA7XG5cbiAgX3N0YXJ0RGF0ZUxhYmVsSWQgPSBgJHt0aGlzLl9pZH0tc3RhcnQtZGF0ZWA7XG5cbiAgX2VuZERhdGVMYWJlbElkID0gYCR7dGhpcy5faWR9LWVuZC1kYXRlYDtcbn1cblxuLyoqIENoZWNrcyB3aGV0aGVyIGEgbm9kZSBpcyBhIHRhYmxlIGNlbGwgZWxlbWVudC4gKi9cbmZ1bmN0aW9uIGlzVGFibGVDZWxsKG5vZGU6IE5vZGUgfCB1bmRlZmluZWQgfCBudWxsKTogbm9kZSBpcyBIVE1MVGFibGVDZWxsRWxlbWVudCB7XG4gIHJldHVybiBub2RlPy5ub2RlTmFtZSA9PT0gJ1REJztcbn1cblxuLyoqXG4gKiBHZXRzIHRoZSBkYXRlIHRhYmxlIGNlbGwgZWxlbWVudCB0aGF0IGlzIG9yIGNvbnRhaW5zIHRoZSBzcGVjaWZpZWQgZWxlbWVudC5cbiAqIE9yIHJldHVybnMgbnVsbCBpZiBlbGVtZW50IGlzIG5vdCBwYXJ0IG9mIGEgZGF0ZSBjZWxsLlxuICovXG5mdW5jdGlvbiBnZXRDZWxsRWxlbWVudChlbGVtZW50OiBIVE1MRWxlbWVudCk6IEhUTUxFbGVtZW50IHwgbnVsbCB7XG4gIGxldCBjZWxsOiBIVE1MRWxlbWVudCB8IHVuZGVmaW5lZDtcbiAgaWYgKGlzVGFibGVDZWxsKGVsZW1lbnQpKSB7XG4gICAgY2VsbCA9IGVsZW1lbnQ7XG4gIH0gZWxzZSBpZiAoaXNUYWJsZUNlbGwoZWxlbWVudC5wYXJlbnROb2RlKSkge1xuICAgIGNlbGwgPSBlbGVtZW50LnBhcmVudE5vZGUgYXMgSFRNTEVsZW1lbnQ7XG4gIH0gZWxzZSBpZiAoaXNUYWJsZUNlbGwoZWxlbWVudC5wYXJlbnROb2RlPy5wYXJlbnROb2RlKSkge1xuICAgIGNlbGwgPSBlbGVtZW50LnBhcmVudE5vZGUhLnBhcmVudE5vZGUgYXMgSFRNTEVsZW1lbnQ7XG4gIH1cblxuICByZXR1cm4gY2VsbD8uZ2V0QXR0cmlidXRlKCdkYXRhLXJvdycpICE9IG51bGwgPyBjZWxsIDogbnVsbDtcbn1cblxuLyoqIENoZWNrcyB3aGV0aGVyIGEgdmFsdWUgaXMgdGhlIHN0YXJ0IG9mIGEgcmFuZ2UuICovXG5mdW5jdGlvbiBpc1N0YXJ0KHZhbHVlOiBudW1iZXIsIHN0YXJ0OiBudW1iZXIgfCBudWxsLCBlbmQ6IG51bWJlciB8IG51bGwpOiBib29sZWFuIHtcbiAgcmV0dXJuIGVuZCAhPT0gbnVsbCAmJiBzdGFydCAhPT0gZW5kICYmIHZhbHVlIDwgZW5kICYmIHZhbHVlID09PSBzdGFydDtcbn1cblxuLyoqIENoZWNrcyB3aGV0aGVyIGEgdmFsdWUgaXMgdGhlIGVuZCBvZiBhIHJhbmdlLiAqL1xuZnVuY3Rpb24gaXNFbmQodmFsdWU6IG51bWJlciwgc3RhcnQ6IG51bWJlciB8IG51bGwsIGVuZDogbnVtYmVyIHwgbnVsbCk6IGJvb2xlYW4ge1xuICByZXR1cm4gc3RhcnQgIT09IG51bGwgJiYgc3RhcnQgIT09IGVuZCAmJiB2YWx1ZSA+PSBzdGFydCAmJiB2YWx1ZSA9PT0gZW5kO1xufVxuXG4vKiogQ2hlY2tzIHdoZXRoZXIgYSB2YWx1ZSBpcyBpbnNpZGUgb2YgYSByYW5nZS4gKi9cbmZ1bmN0aW9uIGlzSW5SYW5nZShcbiAgdmFsdWU6IG51bWJlcixcbiAgc3RhcnQ6IG51bWJlciB8IG51bGwsXG4gIGVuZDogbnVtYmVyIHwgbnVsbCxcbiAgcmFuZ2VFbmFibGVkOiBib29sZWFuXG4pOiBib29sZWFuIHtcbiAgcmV0dXJuIChcbiAgICByYW5nZUVuYWJsZWQgJiZcbiAgICBzdGFydCAhPT0gbnVsbCAmJlxuICAgIGVuZCAhPT0gbnVsbCAmJlxuICAgIHN0YXJ0ICE9PSBlbmQgJiZcbiAgICB2YWx1ZSA+PSBzdGFydCAmJlxuICAgIHZhbHVlIDw9IGVuZFxuICApO1xufVxuXG4vKipcbiAqIEV4dHJhY3RzIHRoZSBlbGVtZW50IHRoYXQgYWN0dWFsbHkgY29ycmVzcG9uZHMgdG8gYSB0b3VjaCBldmVudCdzIGxvY2F0aW9uXG4gKiAocmF0aGVyIHRoYW4gdGhlIGVsZW1lbnQgdGhhdCBpbml0aWF0ZWQgdGhlIHNlcXVlbmNlIG9mIHRvdWNoIGV2ZW50cykuXG4gKi9cbmZ1bmN0aW9uIGdldEFjdHVhbFRvdWNoVGFyZ2V0KGV2ZW50OiBUb3VjaEV2ZW50KTogRWxlbWVudCB8IG51bGwge1xuICBjb25zdCB0b3VjaExvY2F0aW9uID0gZXZlbnQuY2hhbmdlZFRvdWNoZXNbMF07XG4gIHJldHVybiBkb2N1bWVudC5lbGVtZW50RnJvbVBvaW50KHRvdWNoTG9jYXRpb24uY2xpZW50WCwgdG91Y2hMb2NhdGlvbi5jbGllbnRZKTtcbn1cbiIsIjwhLS0gZXNsaW50LWRpc2FibGUgQGFuZ3VsYXItZXNsaW50L3RlbXBsYXRlL25vLWNhbGwtZXhwcmVzc2lvbiAtLT5cbjwhLS0gQ3JlYXRlIHRoZSBmaXJzdCByb3cgc2VwYXJhdGVseSBzbyB3ZSBjYW4gaW5jbHVkZSBhIHNwZWNpYWwgc3BhY2VyIGNlbGwuIC0tPlxuQGZvciAocm93IG9mIHJvd3M7IHRyYWNrIHJvdzsgbGV0IHJvd0luZGV4ID0gJGluZGV4KSB7XG4gIDx0ciByb2xlPVwicm93XCI+XG4gICAgPCEtLVxuICAgICAgVGhpcyBjZWxsIGlzIHB1cmVseSBkZWNvcmF0aXZlLCBidXQgd2UgY2FuJ3QgcHV0IGBhcmlhLWhpZGRlbmAgb3IgYHJvbGU9XCJwcmVzZW50YXRpb25cImAgb24gaXQsXG4gICAgICBiZWNhdXNlIGl0IHRocm93cyBvZmYgdGhlIHdlZWsgZGF5cyBmb3IgdGhlIHJlc3Qgb2YgdGhlIHJvdyBvbiBOVkRBLiBUaGUgYXNwZWN0IHJhdGlvIG9mIHRoZVxuICAgICAgdGFibGUgY2VsbHMgaXMgbWFpbnRhaW5lZCBieSBzZXR0aW5nIHRoZSB0b3AgYW5kIGJvdHRvbSBwYWRkaW5nIGFzIGEgcGVyY2VudGFnZSBvZiB0aGUgd2lkdGhcbiAgICAgIChhIHZhcmlhbnQgb2YgdGhlIHRyaWNrIGRlc2NyaWJlZCBoZXJlOiBodHRwczovL3d3dy53M3NjaG9vbHMuY29tL2hvd3RvL2hvd3RvX2Nzc19hc3BlY3RfcmF0aW8uYXNwKS5cbiAgICAtLT5cbiAgICBAaWYgKHJvd0luZGV4ID09PSAwICYmIF9maXJzdFJvd09mZnNldCkge1xuICAgICAgPHRkXG4gICAgICAgIGNsYXNzPVwiY2FsZW5kYXItYm9keS1sYWJlbFwiXG4gICAgICAgIFthdHRyLmNvbHNwYW5dPVwiX2ZpcnN0Um93T2Zmc2V0XCJcbiAgICAgICAgW3N0eWxlLnBhZGRpbmdUb3BdPVwiX2NlbGxQYWRkaW5nXCJcbiAgICAgICAgW3N0eWxlLnBhZGRpbmdCb3R0b21dPVwiX2NlbGxQYWRkaW5nXCJcbiAgICAgID48L3RkPlxuICAgIH1cbiAgICA8IS0tXG4gICAgICBFYWNoIGdyaWRjZWxsIGluIHRoZSBjYWxlbmRhciBjb250YWlucyBhIGJ1dHRvbiwgd2hpY2ggc2lnbmFscyB0byBhc3Npc3RpdmUgdGVjaG5vbG9neSB0aGF0IHRoZVxuICAgICAgY2VsbCBpcyBpbnRyYWN0YWJsZSwgYXMgd2VsbCBhcyB0aGUgc2VsZWN0aW9uIHN0YXRlIHZpYSBgYXJpYS1wcmVzc2VkYC4gU2VlICMyMzQ3NiBmb3JcbiAgICAgIGJhY2tncm91bmQuXG4gICAgLS0+XG4gICAgQGZvciAoaXRlbSBvZiByb3c7IHRyYWNrIGl0ZW07IGxldCBjb2xJbmRleCA9ICRpbmRleCkge1xuICAgICAgPHRkXG4gICAgICAgIHJvbGU9XCJncmlkY2VsbFwiXG4gICAgICAgIGNsYXNzPVwiY2FsZW5kYXItYm9keS1jZWxsLWNvbnRhaW5lclwiXG4gICAgICAgIFtzdHlsZS53aWR0aF09XCJfY2VsbFdpZHRoXCJcbiAgICAgICAgW3N0eWxlLnBhZGRpbmdUb3BdPVwiX2NlbGxQYWRkaW5nXCJcbiAgICAgICAgW3N0eWxlLnBhZGRpbmdCb3R0b21dPVwiX2NlbGxQYWRkaW5nXCJcbiAgICAgICAgW2F0dHIuZGF0YS1yb3ddPVwicm93SW5kZXhcIlxuICAgICAgICBbYXR0ci5kYXRhLWNvbF09XCJjb2xJbmRleFwiXG4gICAgICA+XG4gICAgICAgIDxidXR0b25cbiAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICBjbGFzcz1cImNhbGVuZGFyLWJvZHktY2VsbFwiXG4gICAgICAgICAgW25nQ2xhc3NdPVwiaXRlbS5jc3NDbGFzc2VzXCJcbiAgICAgICAgICBbdGFiaW5kZXhdPVwiX2lzQWN0aXZlQ2VsbChyb3dJbmRleCwgY29sSW5kZXgpID8gMCA6IC0xXCJcbiAgICAgICAgICBbY2xhc3MuY2FsZW5kYXItYm9keS1kaXNhYmxlZF09XCIhaXRlbS5lbmFibGVkXCJcbiAgICAgICAgICBbY2xhc3MuY2FsZW5kYXItYm9keS1hY3RpdmVdPVwiX2lzQWN0aXZlQ2VsbChyb3dJbmRleCwgY29sSW5kZXgpXCJcbiAgICAgICAgICBbY2xhc3MuY2FsZW5kYXItYm9keS1yYW5nZS1zdGFydF09XCJfaXNSYW5nZVN0YXJ0KGl0ZW0uY29tcGFyZVZhbHVlKVwiXG4gICAgICAgICAgW2NsYXNzLmNhbGVuZGFyLWJvZHktcmFuZ2UtZW5kXT1cIl9pc1JhbmdlRW5kKGl0ZW0uY29tcGFyZVZhbHVlKVwiXG4gICAgICAgICAgW2NsYXNzLmNhbGVuZGFyLWJvZHktaW4tcmFuZ2VdPVwiX2lzSW5SYW5nZShpdGVtLmNvbXBhcmVWYWx1ZSlcIlxuICAgICAgICAgIFtjbGFzcy5jYWxlbmRhci1ib2R5LWNvbXBhcmlzb24tYnJpZGdlLXN0YXJ0XT1cIlxuICAgICAgICAgICAgX2lzQ29tcGFyaXNvbkJyaWRnZVN0YXJ0KGl0ZW0uY29tcGFyZVZhbHVlLCByb3dJbmRleCwgY29sSW5kZXgpXG4gICAgICAgICAgXCJcbiAgICAgICAgICBbY2xhc3MuY2FsZW5kYXItYm9keS1jb21wYXJpc29uLWJyaWRnZS1lbmRdPVwiXG4gICAgICAgICAgICBfaXNDb21wYXJpc29uQnJpZGdlRW5kKGl0ZW0uY29tcGFyZVZhbHVlLCByb3dJbmRleCwgY29sSW5kZXgpXG4gICAgICAgICAgXCJcbiAgICAgICAgICBbY2xhc3MuY2FsZW5kYXItYm9keS1jb21wYXJpc29uLXN0YXJ0XT1cIl9pc0NvbXBhcmlzb25TdGFydChpdGVtLmNvbXBhcmVWYWx1ZSlcIlxuICAgICAgICAgIFtjbGFzcy5jYWxlbmRhci1ib2R5LWNvbXBhcmlzb24tZW5kXT1cIl9pc0NvbXBhcmlzb25FbmQoaXRlbS5jb21wYXJlVmFsdWUpXCJcbiAgICAgICAgICBbY2xhc3MuY2FsZW5kYXItYm9keS1pbi1jb21wYXJpc29uLXJhbmdlXT1cIl9pc0luQ29tcGFyaXNvblJhbmdlKGl0ZW0uY29tcGFyZVZhbHVlKVwiXG4gICAgICAgICAgW2NsYXNzLmNhbGVuZGFyLWJvZHktcHJldmlldy1zdGFydF09XCJfaXNQcmV2aWV3U3RhcnQoaXRlbS5jb21wYXJlVmFsdWUpXCJcbiAgICAgICAgICBbY2xhc3MuY2FsZW5kYXItYm9keS1wcmV2aWV3LWVuZF09XCJfaXNQcmV2aWV3RW5kKGl0ZW0uY29tcGFyZVZhbHVlKVwiXG4gICAgICAgICAgW2NsYXNzLmNhbGVuZGFyLWJvZHktaW4tcHJldmlld109XCJfaXNJblByZXZpZXcoaXRlbS5jb21wYXJlVmFsdWUpXCJcbiAgICAgICAgICBbYXR0ci5hcmlhLWxhYmVsXT1cIml0ZW0uYXJpYUxhYmVsXCJcbiAgICAgICAgICBbYXR0ci5hcmlhLWRpc2FibGVkXT1cIiFpdGVtLmVuYWJsZWQgfHwgbnVsbFwiXG4gICAgICAgICAgW2F0dHIuYXJpYS1wcmVzc2VkXT1cIl9pc1NlbGVjdGVkKGl0ZW0uY29tcGFyZVZhbHVlKVwiXG4gICAgICAgICAgW2F0dHIuYXJpYS1jdXJyZW50XT1cInRvZGF5VmFsdWUgPT09IGl0ZW0uY29tcGFyZVZhbHVlID8gJ2RhdGUnIDogbnVsbFwiXG4gICAgICAgICAgW2F0dHIuYXJpYS1kZXNjcmliZWRieV09XCJfZ2V0RGVzY3JpYmVkYnkoaXRlbS5jb21wYXJlVmFsdWUpXCJcbiAgICAgICAgICAoY2xpY2spPVwiX2NlbGxDbGlja2VkKGl0ZW0sICRldmVudClcIlxuICAgICAgICAgIChmb2N1cyk9XCJfZW1pdEFjdGl2ZURhdGVDaGFuZ2UoaXRlbSwgJGV2ZW50KVwiXG4gICAgICAgID5cbiAgICAgICAgICA8c3BhblxuICAgICAgICAgICAgY2xhc3M9XCJjYWxlbmRhci1ib2R5LWNlbGwtY29udGVudCBmb2N1cy1pbmRpY2F0b3JcIlxuICAgICAgICAgICAgW2NsYXNzLmNhbGVuZGFyLWJvZHktc2VsZWN0ZWRdPVwiX2lzU2VsZWN0ZWQoaXRlbS5jb21wYXJlVmFsdWUpXCJcbiAgICAgICAgICAgIFtjbGFzcy5jYWxlbmRhci1ib2R5LWNvbXBhcmlzb24taWRlbnRpY2FsXT1cIl9pc0NvbXBhcmlzb25JZGVudGljYWwoaXRlbS5jb21wYXJlVmFsdWUpXCJcbiAgICAgICAgICAgIFtjbGFzcy5jYWxlbmRhci1ib2R5LXRvZGF5XT1cInRvZGF5VmFsdWUgPT09IGl0ZW0uY29tcGFyZVZhbHVlXCJcbiAgICAgICAgICA+XG4gICAgICAgICAgICB7eyBpdGVtLmRpc3BsYXlWYWx1ZSB9fVxuICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICA8c3BhblxuICAgICAgICAgICAgY2xhc3M9XCJjYWxlbmRhci1ib2R5LWNlbGwtcHJldmlld1wiXG4gICAgICAgICAgICBhcmlhLWhpZGRlbj1cInRydWVcIlxuICAgICAgICAgID48L3NwYW4+XG4gICAgICAgIDwvYnV0dG9uPlxuICAgICAgPC90ZD5cbiAgICB9XG4gIDwvdHI+XG59XG5cbjxsYWJlbFxuICBjbGFzcz1cImNhbGVuZGFyLWJvZHktaGlkZGVuLWxhYmVsXCJcbiAgZm9yPVwiXCJcbiAgW2lkXT1cIl9zdGFydERhdGVMYWJlbElkXCJcbj5cbiAge3sgc3RhcnREYXRlQWNjZXNzaWJsZU5hbWUgfX1cbjwvbGFiZWw+XG5cbjxsYWJlbFxuICBjbGFzcz1cImNhbGVuZGFyLWJvZHktaGlkZGVuLWxhYmVsXCJcbiAgZm9yPVwiXCJcbiAgW2lkXT1cIl9lbmREYXRlTGFiZWxJZFwiXG4+XG4gIHt7IGVuZERhdGVBY2Nlc3NpYmxlTmFtZSB9fVxuPC9sYWJlbD5cbiJdfQ==
