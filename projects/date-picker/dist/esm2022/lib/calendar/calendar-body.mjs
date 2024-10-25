/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Platform, normalizePassiveListenerOptions } from '@angular/cdk/platform';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewEncapsulation, inject, } from '@angular/core';
import { NgClass } from '@angular/common';
import { take } from 'rxjs/operators';
import * as i0 from "@angular/core";
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
    constructor(value, displayValue, ariaLabel, enabled, cssClasses = {}, compareValue = value, rawValue) {
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
        }
        else if (this.startValue === value) {
            return this._startDateLabelId;
        }
        else if (this.endValue === value) {
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
                this._ngZone.run(() => this.previewChange.emit({ value: cell.enabled ? cell : null, event }));
            }
        }
    };
    _touchmoveHandler = (event) => {
        if (!this.isRange)
            return;
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
            if (event.target &&
                this._getCellFromElement(event.target) &&
                !(event.relatedTarget &&
                    this._getCellFromElement(event.relatedTarget))) {
                this._ngZone.run(() => this.previewChange.emit({ value: null, event }));
            }
        }
    };
    /**
     * Triggered on mousedown or touchstart on a date cell.
     * Respsonsible for starting a drag sequence.
     */
    _mousedownHandler = (event) => {
        if (!this.isRange)
            return;
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
        if (!this.isRange)
            return;
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
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: CalendarBody, deps: [{ token: i0.ElementRef }, { token: i0.NgZone }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "18.2.8", type: CalendarBody, isStandalone: true, selector: "[calendar-body]", inputs: { label: "label", rows: "rows", todayValue: "todayValue", startValue: "startValue", endValue: "endValue", labelMinRequiredCells: "labelMinRequiredCells", numCols: "numCols", activeCell: "activeCell", isRange: "isRange", cellAspectRatio: "cellAspectRatio", comparisonStart: "comparisonStart", comparisonEnd: "comparisonEnd", previewStart: "previewStart", previewEnd: "previewEnd", startDateAccessibleName: "startDateAccessibleName", endDateAccessibleName: "endDateAccessibleName" }, outputs: { selectedValueChange: "selectedValueChange", previewChange: "previewChange", activeDateChange: "activeDateChange", dragStarted: "dragStarted", dragEnded: "dragEnded" }, host: { classAttribute: "calendar-body" }, exportAs: ["calendarBody"], usesOnChanges: true, ngImport: i0, template: "<!-- eslint-disable @angular-eslint/template/no-call-expression -->\n<!-- Create the first row separately so we can include a special spacer cell. -->\n@for (row of rows; track row; let rowIndex = $index) {\n  <tr role=\"row\">\n    <!--\n      This cell is purely decorative, but we can't put `aria-hidden` or `role=\"presentation\"` on it,\n      because it throws off the week days for the rest of the row on NVDA. The aspect ratio of the\n      table cells is maintained by setting the top and bottom padding as a percentage of the width\n      (a variant of the trick described here: https://www.w3schools.com/howto/howto_css_aspect_ratio.asp).\n    -->\n    @if (rowIndex === 0 && _firstRowOffset) {\n      <td\n        class=\"calendar-body-label\"\n        [attr.colspan]=\"_firstRowOffset\"\n        [style.paddingTop]=\"_cellPadding\"\n        [style.paddingBottom]=\"_cellPadding\"\n      ></td>\n    }\n    <!--\n      Each gridcell in the calendar contains a button, which signals to assistive technology that the\n      cell is intractable, as well as the selection state via `aria-pressed`. See #23476 for\n      background.\n    -->\n    @for (item of row; track item; let colIndex = $index) {\n      <td\n        role=\"gridcell\"\n        class=\"calendar-body-cell-container\"\n        [style.width]=\"_cellWidth\"\n        [style.paddingTop]=\"_cellPadding\"\n        [style.paddingBottom]=\"_cellPadding\"\n        [attr.data-row]=\"rowIndex\"\n        [attr.data-col]=\"colIndex\"\n      >\n        <button\n          type=\"button\"\n          class=\"calendar-body-cell\"\n          [ngClass]=\"item.cssClasses\"\n          [tabindex]=\"_isActiveCell(rowIndex, colIndex) ? 0 : -1\"\n          [class.calendar-body-disabled]=\"!item.enabled\"\n          [class.calendar-body-active]=\"_isActiveCell(rowIndex, colIndex)\"\n          [class.calendar-body-range-start]=\"_isRangeStart(item.compareValue)\"\n          [class.calendar-body-range-end]=\"_isRangeEnd(item.compareValue)\"\n          [class.calendar-body-in-range]=\"_isInRange(item.compareValue)\"\n          [class.calendar-body-comparison-bridge-start]=\"\n            _isComparisonBridgeStart(item.compareValue, rowIndex, colIndex)\n          \"\n          [class.calendar-body-comparison-bridge-end]=\"\n            _isComparisonBridgeEnd(item.compareValue, rowIndex, colIndex)\n          \"\n          [class.calendar-body-comparison-start]=\"_isComparisonStart(item.compareValue)\"\n          [class.calendar-body-comparison-end]=\"_isComparisonEnd(item.compareValue)\"\n          [class.calendar-body-in-comparison-range]=\"_isInComparisonRange(item.compareValue)\"\n          [class.calendar-body-preview-start]=\"_isPreviewStart(item.compareValue)\"\n          [class.calendar-body-preview-end]=\"_isPreviewEnd(item.compareValue)\"\n          [class.calendar-body-in-preview]=\"_isInPreview(item.compareValue)\"\n          [attr.aria-label]=\"item.ariaLabel\"\n          [attr.aria-disabled]=\"!item.enabled || null\"\n          [attr.aria-pressed]=\"_isSelected(item.compareValue)\"\n          [attr.aria-current]=\"todayValue === item.compareValue ? 'date' : null\"\n          [attr.aria-describedby]=\"_getDescribedby(item.compareValue)\"\n          (click)=\"_cellClicked(item, $event)\"\n          (focus)=\"_emitActiveDateChange(item, $event)\"\n        >\n          <span\n            class=\"calendar-body-cell-content focus-indicator\"\n            [class.calendar-body-selected]=\"_isSelected(item.compareValue)\"\n            [class.calendar-body-comparison-identical]=\"_isComparisonIdentical(item.compareValue)\"\n            [class.calendar-body-today]=\"todayValue === item.compareValue\"\n          >\n            {{ item.displayValue }}\n          </span>\n          <span\n            class=\"calendar-body-cell-preview\"\n            aria-hidden=\"true\"\n          ></span>\n        </button>\n      </td>\n    }\n  </tr>\n}\n\n<label\n  class=\"calendar-body-hidden-label\"\n  for=\"\"\n  [id]=\"_startDateLabelId\"\n>\n  {{ startDateAccessibleName }}\n</label>\n\n<label\n  class=\"calendar-body-hidden-label\"\n  for=\"\"\n  [id]=\"_endDateLabelId\"\n>\n  {{ endDateAccessibleName }}\n</label>\n", styles: [".calendar-body{min-width:17.5rem}.calendar-body-today{border-color:var(--border)!important}.calendar-body-label{height:0;line-height:0;text-align:start;padding-left:4.7142857143%;padding-right:4.7142857143%}.calendar-body-hidden-label{display:none}.calendar-body-cell-container{position:relative;height:0;line-height:0}.calendar-body-cell{position:absolute;top:0;left:0;width:100%;height:100%;background:none;text-align:center;outline:none;font-family:inherit;margin:0}.calendar-body-cell-content{top:5%;left:5%;z-index:1;display:flex;align-items:center;justify-content:center;box-sizing:border-box;width:90%;height:90%;line-height:1;border-width:1px;border-style:solid;border-radius:999px;border-color:transparent}.calendar-body-cell-content.focus-indicator{position:absolute}.calendar-body-active .calendar-body-cell-content{background-color:var(--primary);color:var(--on-primary)}\n"], dependencies: [{ kind: "directive", type: NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: CalendarBody, decorators: [{
            type: Component,
            args: [{ selector: '[calendar-body]', host: {
                        class: 'calendar-body',
                    }, exportAs: 'calendarBody', standalone: true, encapsulation: ViewEncapsulation.None, changeDetection: ChangeDetectionStrategy.OnPush, imports: [NgClass], template: "<!-- eslint-disable @angular-eslint/template/no-call-expression -->\n<!-- Create the first row separately so we can include a special spacer cell. -->\n@for (row of rows; track row; let rowIndex = $index) {\n  <tr role=\"row\">\n    <!--\n      This cell is purely decorative, but we can't put `aria-hidden` or `role=\"presentation\"` on it,\n      because it throws off the week days for the rest of the row on NVDA. The aspect ratio of the\n      table cells is maintained by setting the top and bottom padding as a percentage of the width\n      (a variant of the trick described here: https://www.w3schools.com/howto/howto_css_aspect_ratio.asp).\n    -->\n    @if (rowIndex === 0 && _firstRowOffset) {\n      <td\n        class=\"calendar-body-label\"\n        [attr.colspan]=\"_firstRowOffset\"\n        [style.paddingTop]=\"_cellPadding\"\n        [style.paddingBottom]=\"_cellPadding\"\n      ></td>\n    }\n    <!--\n      Each gridcell in the calendar contains a button, which signals to assistive technology that the\n      cell is intractable, as well as the selection state via `aria-pressed`. See #23476 for\n      background.\n    -->\n    @for (item of row; track item; let colIndex = $index) {\n      <td\n        role=\"gridcell\"\n        class=\"calendar-body-cell-container\"\n        [style.width]=\"_cellWidth\"\n        [style.paddingTop]=\"_cellPadding\"\n        [style.paddingBottom]=\"_cellPadding\"\n        [attr.data-row]=\"rowIndex\"\n        [attr.data-col]=\"colIndex\"\n      >\n        <button\n          type=\"button\"\n          class=\"calendar-body-cell\"\n          [ngClass]=\"item.cssClasses\"\n          [tabindex]=\"_isActiveCell(rowIndex, colIndex) ? 0 : -1\"\n          [class.calendar-body-disabled]=\"!item.enabled\"\n          [class.calendar-body-active]=\"_isActiveCell(rowIndex, colIndex)\"\n          [class.calendar-body-range-start]=\"_isRangeStart(item.compareValue)\"\n          [class.calendar-body-range-end]=\"_isRangeEnd(item.compareValue)\"\n          [class.calendar-body-in-range]=\"_isInRange(item.compareValue)\"\n          [class.calendar-body-comparison-bridge-start]=\"\n            _isComparisonBridgeStart(item.compareValue, rowIndex, colIndex)\n          \"\n          [class.calendar-body-comparison-bridge-end]=\"\n            _isComparisonBridgeEnd(item.compareValue, rowIndex, colIndex)\n          \"\n          [class.calendar-body-comparison-start]=\"_isComparisonStart(item.compareValue)\"\n          [class.calendar-body-comparison-end]=\"_isComparisonEnd(item.compareValue)\"\n          [class.calendar-body-in-comparison-range]=\"_isInComparisonRange(item.compareValue)\"\n          [class.calendar-body-preview-start]=\"_isPreviewStart(item.compareValue)\"\n          [class.calendar-body-preview-end]=\"_isPreviewEnd(item.compareValue)\"\n          [class.calendar-body-in-preview]=\"_isInPreview(item.compareValue)\"\n          [attr.aria-label]=\"item.ariaLabel\"\n          [attr.aria-disabled]=\"!item.enabled || null\"\n          [attr.aria-pressed]=\"_isSelected(item.compareValue)\"\n          [attr.aria-current]=\"todayValue === item.compareValue ? 'date' : null\"\n          [attr.aria-describedby]=\"_getDescribedby(item.compareValue)\"\n          (click)=\"_cellClicked(item, $event)\"\n          (focus)=\"_emitActiveDateChange(item, $event)\"\n        >\n          <span\n            class=\"calendar-body-cell-content focus-indicator\"\n            [class.calendar-body-selected]=\"_isSelected(item.compareValue)\"\n            [class.calendar-body-comparison-identical]=\"_isComparisonIdentical(item.compareValue)\"\n            [class.calendar-body-today]=\"todayValue === item.compareValue\"\n          >\n            {{ item.displayValue }}\n          </span>\n          <span\n            class=\"calendar-body-cell-preview\"\n            aria-hidden=\"true\"\n          ></span>\n        </button>\n      </td>\n    }\n  </tr>\n}\n\n<label\n  class=\"calendar-body-hidden-label\"\n  for=\"\"\n  [id]=\"_startDateLabelId\"\n>\n  {{ startDateAccessibleName }}\n</label>\n\n<label\n  class=\"calendar-body-hidden-label\"\n  for=\"\"\n  [id]=\"_endDateLabelId\"\n>\n  {{ endDateAccessibleName }}\n</label>\n", styles: [".calendar-body{min-width:17.5rem}.calendar-body-today{border-color:var(--border)!important}.calendar-body-label{height:0;line-height:0;text-align:start;padding-left:4.7142857143%;padding-right:4.7142857143%}.calendar-body-hidden-label{display:none}.calendar-body-cell-container{position:relative;height:0;line-height:0}.calendar-body-cell{position:absolute;top:0;left:0;width:100%;height:100%;background:none;text-align:center;outline:none;font-family:inherit;margin:0}.calendar-body-cell-content{top:5%;left:5%;z-index:1;display:flex;align-items:center;justify-content:center;box-sizing:border-box;width:90%;height:90%;line-height:1;border-width:1px;border-style:solid;border-radius:999px;border-color:transparent}.calendar-body-cell-content.focus-indicator{position:absolute}.calendar-body-active .calendar-body-cell-content{background-color:var(--primary);color:var(--on-primary)}\n"] }]
        }], ctorParameters: () => [{ type: i0.ElementRef }, { type: i0.NgZone }], propDecorators: { label: [{
                type: Input
            }], rows: [{
                type: Input
            }], todayValue: [{
                type: Input
            }], startValue: [{
                type: Input
            }], endValue: [{
                type: Input
            }], labelMinRequiredCells: [{
                type: Input
            }], numCols: [{
                type: Input
            }], activeCell: [{
                type: Input
            }], isRange: [{
                type: Input
            }], cellAspectRatio: [{
                type: Input
            }], comparisonStart: [{
                type: Input
            }], comparisonEnd: [{
                type: Input
            }], previewStart: [{
                type: Input
            }], previewEnd: [{
                type: Input
            }], startDateAccessibleName: [{
                type: Input
            }], endDateAccessibleName: [{
                type: Input
            }], selectedValueChange: [{
                type: Output
            }], previewChange: [{
                type: Output
            }], activeDateChange: [{
                type: Output
            }], dragStarted: [{
                type: Output
            }], dragEnded: [{
                type: Output
            }] } });
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
    }
    else if (isTableCell(element.parentNode)) {
        cell = element.parentNode;
    }
    else if (isTableCell(element.parentNode?.parentNode)) {
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
    return (rangeEnabled &&
        start !== null &&
        end !== null &&
        start !== end &&
        value >= start &&
        value <= end);
}
/**
 * Extracts the element that actually corresponds to a touch event's location
 * (rather than the element that initiated the sequence of touch events).
 */
function getActualTouchTarget(event) {
    const touchLocation = event.changedTouches[0];
    return document.elementFromPoint(touchLocation.clientX, touchLocation.clientY);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FsZW5kYXItYm9keS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9saWIvY2FsZW5kYXIvY2FsZW5kYXItYm9keS50cyIsIi4uLy4uLy4uLy4uL3NyYy9saWIvY2FsZW5kYXIvY2FsZW5kYXItYm9keS5odG1sIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBRSxRQUFRLEVBQUUsK0JBQStCLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUNsRixPQUFPLEVBQ0wsdUJBQXVCLEVBQ3ZCLFNBQVMsRUFFVCxZQUFZLEVBQ1osS0FBSyxFQUNMLE1BQU0sRUFDTixpQkFBaUIsRUFNakIsTUFBTSxHQUNQLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUUxQyxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7O0FBV3RDOzs7R0FHRztBQUNILE1BQU0sT0FBTyxZQUFZO0lBRWQ7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFQVCxZQUNTLEtBQWEsRUFDYixZQUFvQixFQUNwQixTQUFpQixFQUNqQixPQUFnQixFQUNoQixhQUFxQyxFQUFFLEVBQ3ZDLGVBQWUsS0FBSyxFQUNwQixRQUFZO1FBTlosVUFBSyxHQUFMLEtBQUssQ0FBUTtRQUNiLGlCQUFZLEdBQVosWUFBWSxDQUFRO1FBQ3BCLGNBQVMsR0FBVCxTQUFTLENBQVE7UUFDakIsWUFBTyxHQUFQLE9BQU8sQ0FBUztRQUNoQixlQUFVLEdBQVYsVUFBVSxDQUE2QjtRQUN2QyxpQkFBWSxHQUFaLFlBQVksQ0FBUTtRQUNwQixhQUFRLEdBQVIsUUFBUSxDQUFJO0lBQ2xCLENBQUM7Q0FDTDtBQVFELElBQUksY0FBYyxHQUFHLENBQUMsQ0FBQztBQUV2Qix5RUFBeUU7QUFDekUsTUFBTSwyQkFBMkIsR0FBRywrQkFBK0IsQ0FBQztJQUNsRSxPQUFPLEVBQUUsS0FBSztJQUNkLE9BQU8sRUFBRSxJQUFJO0NBQ2QsQ0FBQyxDQUFDO0FBRUgseUVBQXlFO0FBQ3pFLE1BQU0sNEJBQTRCLEdBQUcsK0JBQStCLENBQUM7SUFDbkUsT0FBTyxFQUFFLElBQUk7SUFDYixPQUFPLEVBQUUsSUFBSTtDQUNkLENBQUMsQ0FBQztBQUVILDZFQUE2RTtBQUM3RSxNQUFNLG1CQUFtQixHQUFHLCtCQUErQixDQUFDLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7QUFFL0U7OztHQUdHO0FBY0gsTUFBTSxPQUFPLFlBQVk7SUFrR2I7SUFDQTtJQWxHRixTQUFTLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBRXJDOzs7T0FHRztJQUNLLGNBQWMsQ0FBVTtJQUVoQzs7T0FFRztJQUNLLGdDQUFnQyxHQUFHLEtBQUssQ0FBQztJQUVqRCxrREFBa0Q7SUFDekMsS0FBSyxDQUFTO0lBRXZCLHlDQUF5QztJQUNoQyxJQUFJLENBQW1CO0lBRWhDLHdEQUF3RDtJQUMvQyxVQUFVLENBQVM7SUFFNUIsOENBQThDO0lBQ3JDLFVBQVUsQ0FBUztJQUU1Qiw0Q0FBNEM7SUFDbkMsUUFBUSxDQUFTO0lBRTFCLGlGQUFpRjtJQUN4RSxxQkFBcUIsQ0FBUztJQUV2QywwQ0FBMEM7SUFDakMsT0FBTyxHQUFHLENBQUMsQ0FBQztJQUVyQix1REFBdUQ7SUFDOUMsVUFBVSxHQUFHLENBQUMsQ0FBQztJQUV4QixrQkFBa0I7UUFDaEIsSUFBSSxJQUFJLENBQUMsZ0NBQWdDLEVBQUUsQ0FBQztZQUMxQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztZQUN4QixJQUFJLENBQUMsZ0NBQWdDLEdBQUcsS0FBSyxDQUFDO1FBQ2hELENBQUM7SUFDSCxDQUFDO0lBRUQseUNBQXlDO0lBQ2hDLE9BQU8sR0FBRyxLQUFLLENBQUM7SUFFekI7OztPQUdHO0lBQ00sZUFBZSxHQUFHLENBQUMsQ0FBQztJQUU3QixxQ0FBcUM7SUFDNUIsZUFBZSxDQUFnQjtJQUV4QyxtQ0FBbUM7SUFDMUIsYUFBYSxDQUFnQjtJQUV0QyxrQ0FBa0M7SUFDekIsWUFBWSxHQUFrQixJQUFJLENBQUM7SUFFNUMsZ0NBQWdDO0lBQ3ZCLFVBQVUsR0FBa0IsSUFBSSxDQUFDO0lBRTFDLHVEQUF1RDtJQUM5Qyx1QkFBdUIsQ0FBZ0I7SUFFaEQscURBQXFEO0lBQzVDLHFCQUFxQixDQUFnQjtJQUU5QywwQ0FBMEM7SUFDdkIsbUJBQW1CLEdBQUcsSUFBSSxZQUFZLEVBQTZCLENBQUM7SUFFdkYsdUVBQXVFO0lBQ3BELGFBQWEsR0FBRyxJQUFJLFlBQVksRUFBMEMsQ0FBQztJQUUzRSxnQkFBZ0IsR0FBRyxJQUFJLFlBQVksRUFBNkIsQ0FBQztJQUVwRiw0REFBNEQ7SUFDekMsV0FBVyxHQUFHLElBQUksWUFBWSxFQUF3QixDQUFDO0lBRTFFLCtGQUErRjtJQUM1RSxTQUFTLEdBQUcsSUFBSSxZQUFZLEVBQStCLENBQUM7SUFFL0UsMkVBQTJFO0lBQzNFLGVBQWUsQ0FBUztJQUV4Qiw2Q0FBNkM7SUFDN0MsWUFBWSxDQUFTO0lBRXJCLG1DQUFtQztJQUNuQyxVQUFVLENBQVM7SUFFWCxzQkFBc0IsR0FBRyxLQUFLLENBQUM7SUFFdkMsWUFDVSxXQUFvQyxFQUNwQyxPQUFlO1FBRGYsZ0JBQVcsR0FBWCxXQUFXLENBQXlCO1FBQ3BDLFlBQU8sR0FBUCxPQUFPLENBQVE7UUFFdkIsT0FBTyxDQUFDLGlCQUFpQixDQUFDLEdBQUcsRUFBRTtZQUM3QixNQUFNLE9BQU8sR0FBRyxXQUFXLENBQUMsYUFBYSxDQUFDO1lBRTFDLGdFQUFnRTtZQUNoRSxPQUFPLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxpQkFBaUIsRUFBRSwyQkFBMkIsQ0FBQyxDQUFDO1lBRTNGLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLGFBQWEsRUFBRSw0QkFBNEIsQ0FBQyxDQUFDO1lBQ3pGLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLGFBQWEsRUFBRSw0QkFBNEIsQ0FBQyxDQUFDO1lBQ3BGLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLGFBQWEsRUFBRSw0QkFBNEIsQ0FBQyxDQUFDO1lBQ3pGLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLGFBQWEsRUFBRSw0QkFBNEIsQ0FBQyxDQUFDO1lBRW5GLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixFQUFFLG1CQUFtQixDQUFDLENBQUM7WUFDbkYsT0FBTyxDQUFDLGdCQUFnQixDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsaUJBQWlCLEVBQUUsbUJBQW1CLENBQUMsQ0FBQztZQUVwRixJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFLENBQUM7Z0JBQzdCLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO2dCQUN6RCxNQUFNLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1lBQzdELENBQUM7UUFDSCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRCxxQ0FBcUM7SUFDckMsWUFBWSxDQUFDLElBQWtCLEVBQUUsS0FBaUI7UUFDaEQsd0VBQXdFO1FBQ3hFLGdEQUFnRDtRQUNoRCxJQUFJLElBQUksQ0FBQyxzQkFBc0IsRUFBRSxDQUFDO1lBQ2hDLE9BQU87UUFDVCxDQUFDO1FBRUQsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDakIsSUFBSSxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7UUFDOUQsQ0FBQztJQUNILENBQUM7SUFFRCxxQkFBcUIsQ0FBQyxJQUFrQixFQUFFLEtBQWlCO1FBQ3pELElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ2pCLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBQzNELENBQUM7SUFDSCxDQUFDO0lBRUQsMkRBQTJEO0lBQzNELFdBQVcsQ0FBQyxLQUFhO1FBQ3ZCLE9BQU8sSUFBSSxDQUFDLFVBQVUsS0FBSyxLQUFLLElBQUksSUFBSSxDQUFDLFFBQVEsS0FBSyxLQUFLLENBQUM7SUFDOUQsQ0FBQztJQUVELFdBQVcsQ0FBQyxPQUFzQjtRQUNoQyxNQUFNLGFBQWEsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDekMsTUFBTSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFFL0IsSUFBSSxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksYUFBYSxFQUFFLENBQUM7WUFDckMsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLElBQUksSUFBSSxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzlGLENBQUM7UUFFRCxJQUFJLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLGFBQWEsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztZQUN0RSxJQUFJLENBQUMsWUFBWSxHQUFHLEdBQUcsQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLE9BQU8sR0FBRyxDQUFDO1FBQ2xFLENBQUM7UUFFRCxJQUFJLGFBQWEsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUN0QyxJQUFJLENBQUMsVUFBVSxHQUFHLEdBQUcsR0FBRyxHQUFHLE9BQU8sR0FBRyxDQUFDO1FBQ3hDLENBQUM7SUFDSCxDQUFDO0lBRUQsV0FBVztRQUNULE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsYUFBYSxDQUFDO1FBRS9DLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixFQUFFLDJCQUEyQixDQUFDLENBQUM7UUFFOUYsT0FBTyxDQUFDLG1CQUFtQixDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsYUFBYSxFQUFFLDRCQUE0QixDQUFDLENBQUM7UUFDNUYsT0FBTyxDQUFDLG1CQUFtQixDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsYUFBYSxFQUFFLDRCQUE0QixDQUFDLENBQUM7UUFDdkYsT0FBTyxDQUFDLG1CQUFtQixDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsYUFBYSxFQUFFLDRCQUE0QixDQUFDLENBQUM7UUFDNUYsT0FBTyxDQUFDLG1CQUFtQixDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsYUFBYSxFQUFFLDRCQUE0QixDQUFDLENBQUM7UUFFdEYsT0FBTyxDQUFDLG1CQUFtQixDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsaUJBQWlCLEVBQUUsbUJBQW1CLENBQUMsQ0FBQztRQUN0RixPQUFPLENBQUMsbUJBQW1CLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxtQkFBbUIsQ0FBQyxDQUFDO1FBRXZGLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUM3QixNQUFNLENBQUMsbUJBQW1CLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUM1RCxNQUFNLENBQUMsbUJBQW1CLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBQ2hFLENBQUM7SUFDSCxDQUFDO0lBRUQsd0NBQXdDO0lBQ3hDLGFBQWEsQ0FBQyxRQUFnQixFQUFFLFFBQWdCO1FBQzlDLElBQUksVUFBVSxHQUFHLFFBQVEsR0FBRyxJQUFJLENBQUMsT0FBTyxHQUFHLFFBQVEsQ0FBQztRQUVwRCxzRUFBc0U7UUFDdEUsSUFBSSxRQUFRLEVBQUUsQ0FBQztZQUNiLFVBQVUsSUFBSSxJQUFJLENBQUMsZUFBZSxDQUFDO1FBQ3JDLENBQUM7UUFFRCxPQUFPLFVBQVUsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDO0lBQ3ZDLENBQUM7SUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O09BcUJHO0lBQ0gsZ0JBQWdCLENBQUMsV0FBVyxHQUFHLElBQUk7UUFDakMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLEVBQUU7WUFDbEMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUU7Z0JBQ2pELFVBQVUsQ0FBQyxHQUFHLEVBQUU7b0JBQ2QsTUFBTSxVQUFVLEdBQ2QsSUFBSSxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMsYUFBYSxDQUFDLHVCQUF1QixDQUFDLENBQUM7b0JBRXhFLElBQUksVUFBVSxFQUFFLENBQUM7d0JBQ2YsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDOzRCQUNqQixJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQzt3QkFDN0IsQ0FBQzt3QkFFRCxVQUFVLENBQUMsS0FBSyxFQUFFLENBQUM7b0JBQ3JCLENBQUM7Z0JBQ0gsQ0FBQyxDQUFDLENBQUM7WUFDTCxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVELCtGQUErRjtJQUMvRix3Q0FBd0M7UUFDdEMsSUFBSSxDQUFDLGdDQUFnQyxHQUFHLElBQUksQ0FBQztJQUMvQyxDQUFDO0lBRUQsMkRBQTJEO0lBQzNELGFBQWEsQ0FBQyxLQUFhO1FBQ3pCLE9BQU8sT0FBTyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUN4RCxDQUFDO0lBRUQseURBQXlEO0lBQ3pELFdBQVcsQ0FBQyxLQUFhO1FBQ3ZCLE9BQU8sS0FBSyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUN0RCxDQUFDO0lBRUQsbUVBQW1FO0lBQ25FLFVBQVUsQ0FBQyxLQUFhO1FBQ3RCLE9BQU8sU0FBUyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ3hFLENBQUM7SUFFRCxpRUFBaUU7SUFDakUsa0JBQWtCLENBQUMsS0FBYTtRQUM5QixPQUFPLE9BQU8sQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLGVBQWUsRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDbEUsQ0FBQztJQUVELHNGQUFzRjtJQUN0Rix3QkFBd0IsQ0FBQyxLQUFhLEVBQUUsUUFBZ0IsRUFBRSxRQUFnQjtRQUN4RSxJQUFJLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxJQUFJLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUM7WUFDNUYsT0FBTyxLQUFLLENBQUM7UUFDZixDQUFDO1FBRUQsSUFBSSxZQUFZLEdBQTZCLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBRS9FLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztZQUNsQixNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUM1QyxZQUFZLEdBQUcsV0FBVyxJQUFJLFdBQVcsQ0FBQyxXQUFXLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ3BFLENBQUM7UUFFRCxPQUFPLFlBQVksSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQ3RFLENBQUM7SUFFRCxxRkFBcUY7SUFDckYsc0JBQXNCLENBQUMsS0FBYSxFQUFFLFFBQWdCLEVBQUUsUUFBZ0I7UUFDdEUsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDO1lBQ3hGLE9BQU8sS0FBSyxDQUFDO1FBQ2YsQ0FBQztRQUVELElBQUksUUFBUSxHQUE2QixJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUUzRSxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDZCxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUN4QyxRQUFRLEdBQUcsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNuQyxDQUFDO1FBRUQsT0FBTyxRQUFRLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUNoRSxDQUFDO0lBRUQsK0RBQStEO0lBQy9ELGdCQUFnQixDQUFDLEtBQWE7UUFDNUIsT0FBTyxLQUFLLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQ2hFLENBQUM7SUFFRCxtRUFBbUU7SUFDbkUsb0JBQW9CLENBQUMsS0FBYTtRQUNoQyxPQUFPLFNBQVMsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLGVBQWUsRUFBRSxJQUFJLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNsRixDQUFDO0lBRUQ7Ozs7Ozs7OztPQVNHO0lBQ0gsc0JBQXNCLENBQUMsS0FBYTtRQUNsQyxzREFBc0Q7UUFDdEQsb0RBQW9EO1FBQ3BELE9BQU8sSUFBSSxDQUFDLGVBQWUsS0FBSyxJQUFJLENBQUMsYUFBYSxJQUFJLEtBQUssS0FBSyxJQUFJLENBQUMsZUFBZSxDQUFDO0lBQ3ZGLENBQUM7SUFFRCw4REFBOEQ7SUFDOUQsZUFBZSxDQUFDLEtBQWE7UUFDM0IsT0FBTyxPQUFPLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQzVELENBQUM7SUFFRCw0REFBNEQ7SUFDNUQsYUFBYSxDQUFDLEtBQWE7UUFDekIsT0FBTyxLQUFLLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQzFELENBQUM7SUFFRCx3REFBd0Q7SUFDeEQsWUFBWSxDQUFDLEtBQWE7UUFDeEIsT0FBTyxTQUFTLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDNUUsQ0FBQztJQUVELDJFQUEyRTtJQUMzRSxlQUFlLENBQUMsS0FBYTtRQUMzQixJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ2xCLE9BQU8sSUFBSSxDQUFDO1FBQ2QsQ0FBQztRQUVELElBQUksSUFBSSxDQUFDLFVBQVUsS0FBSyxLQUFLLElBQUksSUFBSSxDQUFDLFFBQVEsS0FBSyxLQUFLLEVBQUUsQ0FBQztZQUN6RCxPQUFPLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixJQUFJLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUM3RCxDQUFDO2FBQU0sSUFBSSxJQUFJLENBQUMsVUFBVSxLQUFLLEtBQUssRUFBRSxDQUFDO1lBQ3JDLE9BQU8sSUFBSSxDQUFDLGlCQUFpQixDQUFDO1FBQ2hDLENBQUM7YUFBTSxJQUFJLElBQUksQ0FBQyxRQUFRLEtBQUssS0FBSyxFQUFFLENBQUM7WUFDbkMsT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDO1FBQzlCLENBQUM7UUFDRCxPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFFRDs7O09BR0c7SUFDSyxhQUFhLEdBQUcsQ0FBQyxLQUFZLEVBQUUsRUFBRTtRQUN2QyxJQUFJLElBQUksQ0FBQyxjQUFjLElBQUksS0FBSyxDQUFDLElBQUksS0FBSyxPQUFPLEVBQUUsQ0FBQztZQUNsRCxJQUFJLENBQUMsY0FBYyxHQUFHLEtBQUssQ0FBQztZQUM1QixPQUFPO1FBQ1QsQ0FBQztRQUVELDZEQUE2RDtRQUM3RCxJQUFJLEtBQUssQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ2pDLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLENBQUMsTUFBcUIsQ0FBQyxDQUFDO1lBRW5FLElBQUksSUFBSSxFQUFFLENBQUM7Z0JBQ1QsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQ3BCLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQ3RFLENBQUM7WUFDSixDQUFDO1FBQ0gsQ0FBQztJQUNILENBQUMsQ0FBQztJQUVNLGlCQUFpQixHQUFHLENBQUMsS0FBaUIsRUFBRSxFQUFFO1FBQ2hELElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTztZQUFFLE9BQU87UUFFMUIsTUFBTSxNQUFNLEdBQUcsb0JBQW9CLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDM0MsTUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsTUFBcUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFFN0UsSUFBSSxNQUFNLEtBQUssS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQzVCLElBQUksQ0FBQyxzQkFBc0IsR0FBRyxJQUFJLENBQUM7UUFDckMsQ0FBQztRQUVELHdFQUF3RTtRQUN4RSw0Q0FBNEM7UUFDNUMsSUFBSSxjQUFjLENBQUMsS0FBSyxDQUFDLE1BQXFCLENBQUMsRUFBRSxDQUFDO1lBQ2hELEtBQUssQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUN6QixDQUFDO1FBRUQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ2pHLENBQUMsQ0FBQztJQUVGOzs7T0FHRztJQUNLLGFBQWEsR0FBRyxDQUFDLEtBQVksRUFBRSxFQUFFO1FBQ3ZDLDZEQUE2RDtRQUM3RCxJQUFJLElBQUksQ0FBQyxVQUFVLEtBQUssSUFBSSxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUM3QyxJQUFJLEtBQUssQ0FBQyxJQUFJLEtBQUssTUFBTSxFQUFFLENBQUM7Z0JBQzFCLElBQUksQ0FBQyxzQkFBc0IsR0FBRyxJQUFJLENBQUM7WUFDckMsQ0FBQztZQUVELGtGQUFrRjtZQUNsRiwrRUFBK0U7WUFDL0UsbUZBQW1GO1lBQ25GLElBQ0UsS0FBSyxDQUFDLE1BQU07Z0JBQ1osSUFBSSxDQUFDLG1CQUFtQixDQUFDLEtBQUssQ0FBQyxNQUFxQixDQUFDO2dCQUNyRCxDQUFDLENBQ0UsS0FBb0IsQ0FBQyxhQUFhO29CQUNuQyxJQUFJLENBQUMsbUJBQW1CLENBQUUsS0FBb0IsQ0FBQyxhQUE0QixDQUFDLENBQzdFLEVBQ0QsQ0FBQztnQkFDRCxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzFFLENBQUM7UUFDSCxDQUFDO0lBQ0gsQ0FBQyxDQUFDO0lBRUY7OztPQUdHO0lBQ0ssaUJBQWlCLEdBQUcsQ0FBQyxLQUFZLEVBQUUsRUFBRTtRQUMzQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU87WUFBRSxPQUFPO1FBRTFCLElBQUksQ0FBQyxzQkFBc0IsR0FBRyxLQUFLLENBQUM7UUFDcEMsZ0VBQWdFO1FBQ2hFLE1BQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLG1CQUFtQixDQUFDLEtBQUssQ0FBQyxNQUFxQixDQUFDLENBQUM7UUFDbkYsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUM7WUFDakQsT0FBTztRQUNULENBQUM7UUFFRCxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUU7WUFDcEIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUM7Z0JBQ3BCLEtBQUssRUFBRSxJQUFJLENBQUMsUUFBUTtnQkFDcEIsS0FBSzthQUNOLENBQUMsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQyxDQUFDO0lBRUYsOEVBQThFO0lBQ3RFLGVBQWUsR0FBRyxDQUFDLEtBQVksRUFBRSxFQUFFO1FBQ3pDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTztZQUFFLE9BQU87UUFFMUIsTUFBTSxXQUFXLEdBQUcsY0FBYyxDQUFDLEtBQUssQ0FBQyxNQUFxQixDQUFDLENBQUM7UUFDaEUsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ2pCLHVEQUF1RDtZQUN2RCxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUU7Z0JBQ3BCLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1lBQzlDLENBQUMsQ0FBQyxDQUFDO1lBQ0gsT0FBTztRQUNULENBQUM7UUFFRCxJQUFJLFdBQVcsQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxJQUFJLENBQUMsV0FBVyxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBQzdFLHNEQUFzRDtZQUN0RCxnQ0FBZ0M7WUFDaEMsT0FBTztRQUNULENBQUM7UUFFRCxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUU7WUFDcEIsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQ25ELElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxRQUFRLElBQUksSUFBSSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7UUFDaEUsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDLENBQUM7SUFFRiwrRUFBK0U7SUFDdkUsZ0JBQWdCLEdBQUcsQ0FBQyxLQUFpQixFQUFFLEVBQUU7UUFDL0MsTUFBTSxNQUFNLEdBQUcsb0JBQW9CLENBQUMsS0FBSyxDQUFDLENBQUM7UUFFM0MsSUFBSSxNQUFNLEVBQUUsQ0FBQztZQUNYLElBQUksQ0FBQyxlQUFlLENBQUMsRUFBRSxNQUFNLEVBQXNCLENBQUMsQ0FBQztRQUN2RCxDQUFDO0lBQ0gsQ0FBQyxDQUFDO0lBRUYsZ0VBQWdFO0lBQ3hELG1CQUFtQixDQUFDLE9BQW9CO1FBQzlDLE1BQU0sSUFBSSxHQUFHLGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUVyQyxJQUFJLElBQUksRUFBRSxDQUFDO1lBQ1QsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUMxQyxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBRTFDLElBQUksR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO2dCQUNmLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNqRCxDQUFDO1FBQ0gsQ0FBQztRQUVELE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUVPLEdBQUcsR0FBRyxpQkFBaUIsY0FBYyxFQUFFLEVBQUUsQ0FBQztJQUVsRCxpQkFBaUIsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLGFBQWEsQ0FBQztJQUU3QyxlQUFlLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxXQUFXLENBQUM7dUdBN2U5QixZQUFZOzJGQUFaLFlBQVksbzBCQzdGekIsbW5JQWdHQSwrNkJETFksT0FBTzs7MkZBRU4sWUFBWTtrQkFieEIsU0FBUzsrQkFDRSxpQkFBaUIsUUFHckI7d0JBQ0osS0FBSyxFQUFFLGVBQWU7cUJBQ3ZCLFlBQ1MsY0FBYyxjQUNaLElBQUksaUJBQ0QsaUJBQWlCLENBQUMsSUFBSSxtQkFDcEIsdUJBQXVCLENBQUMsTUFBTSxXQUN0QyxDQUFDLE9BQU8sQ0FBQztvR0FpQlQsS0FBSztzQkFBYixLQUFLO2dCQUdHLElBQUk7c0JBQVosS0FBSztnQkFHRyxVQUFVO3NCQUFsQixLQUFLO2dCQUdHLFVBQVU7c0JBQWxCLEtBQUs7Z0JBR0csUUFBUTtzQkFBaEIsS0FBSztnQkFHRyxxQkFBcUI7c0JBQTdCLEtBQUs7Z0JBR0csT0FBTztzQkFBZixLQUFLO2dCQUdHLFVBQVU7c0JBQWxCLEtBQUs7Z0JBVUcsT0FBTztzQkFBZixLQUFLO2dCQU1HLGVBQWU7c0JBQXZCLEtBQUs7Z0JBR0csZUFBZTtzQkFBdkIsS0FBSztnQkFHRyxhQUFhO3NCQUFyQixLQUFLO2dCQUdHLFlBQVk7c0JBQXBCLEtBQUs7Z0JBR0csVUFBVTtzQkFBbEIsS0FBSztnQkFHRyx1QkFBdUI7c0JBQS9CLEtBQUs7Z0JBR0cscUJBQXFCO3NCQUE3QixLQUFLO2dCQUdhLG1CQUFtQjtzQkFBckMsTUFBTTtnQkFHWSxhQUFhO3NCQUEvQixNQUFNO2dCQUVZLGdCQUFnQjtzQkFBbEMsTUFBTTtnQkFHWSxXQUFXO3NCQUE3QixNQUFNO2dCQUdZLFNBQVM7c0JBQTNCLE1BQU07O0FBNFpULHFEQUFxRDtBQUNyRCxTQUFTLFdBQVcsQ0FBQyxJQUE2QjtJQUNoRCxPQUFPLElBQUksRUFBRSxRQUFRLEtBQUssSUFBSSxDQUFDO0FBQ2pDLENBQUM7QUFFRDs7O0dBR0c7QUFDSCxTQUFTLGNBQWMsQ0FBQyxPQUFvQjtJQUMxQyxJQUFJLElBQTZCLENBQUM7SUFDbEMsSUFBSSxXQUFXLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztRQUN6QixJQUFJLEdBQUcsT0FBTyxDQUFDO0lBQ2pCLENBQUM7U0FBTSxJQUFJLFdBQVcsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQztRQUMzQyxJQUFJLEdBQUcsT0FBTyxDQUFDLFVBQXlCLENBQUM7SUFDM0MsQ0FBQztTQUFNLElBQUksV0FBVyxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsVUFBVSxDQUFDLEVBQUUsQ0FBQztRQUN2RCxJQUFJLEdBQUcsT0FBTyxDQUFDLFVBQVcsQ0FBQyxVQUF5QixDQUFDO0lBQ3ZELENBQUM7SUFFRCxPQUFPLElBQUksRUFBRSxZQUFZLENBQUMsVUFBVSxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztBQUM5RCxDQUFDO0FBRUQsc0RBQXNEO0FBQ3RELFNBQVMsT0FBTyxDQUFDLEtBQWEsRUFBRSxLQUFvQixFQUFFLEdBQWtCO0lBQ3RFLE9BQU8sR0FBRyxLQUFLLElBQUksSUFBSSxLQUFLLEtBQUssR0FBRyxJQUFJLEtBQUssR0FBRyxHQUFHLElBQUksS0FBSyxLQUFLLEtBQUssQ0FBQztBQUN6RSxDQUFDO0FBRUQsb0RBQW9EO0FBQ3BELFNBQVMsS0FBSyxDQUFDLEtBQWEsRUFBRSxLQUFvQixFQUFFLEdBQWtCO0lBQ3BFLE9BQU8sS0FBSyxLQUFLLElBQUksSUFBSSxLQUFLLEtBQUssR0FBRyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxLQUFLLEdBQUcsQ0FBQztBQUM1RSxDQUFDO0FBRUQsbURBQW1EO0FBQ25ELFNBQVMsU0FBUyxDQUNoQixLQUFhLEVBQ2IsS0FBb0IsRUFDcEIsR0FBa0IsRUFDbEIsWUFBcUI7SUFFckIsT0FBTyxDQUNMLFlBQVk7UUFDWixLQUFLLEtBQUssSUFBSTtRQUNkLEdBQUcsS0FBSyxJQUFJO1FBQ1osS0FBSyxLQUFLLEdBQUc7UUFDYixLQUFLLElBQUksS0FBSztRQUNkLEtBQUssSUFBSSxHQUFHLENBQ2IsQ0FBQztBQUNKLENBQUM7QUFFRDs7O0dBR0c7QUFDSCxTQUFTLG9CQUFvQixDQUFDLEtBQWlCO0lBQzdDLE1BQU0sYUFBYSxHQUFHLEtBQUssQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDOUMsT0FBTyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDakYsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgeyBQbGF0Zm9ybSwgbm9ybWFsaXplUGFzc2l2ZUxpc3RlbmVyT3B0aW9ucyB9IGZyb20gJ0Bhbmd1bGFyL2Nkay9wbGF0Zm9ybSc7XG5pbXBvcnQge1xuICBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSxcbiAgQ29tcG9uZW50LFxuICBFbGVtZW50UmVmLFxuICBFdmVudEVtaXR0ZXIsXG4gIElucHV0LFxuICBPdXRwdXQsXG4gIFZpZXdFbmNhcHN1bGF0aW9uLFxuICBOZ1pvbmUsXG4gIE9uQ2hhbmdlcyxcbiAgU2ltcGxlQ2hhbmdlcyxcbiAgT25EZXN0cm95LFxuICBBZnRlclZpZXdDaGVja2VkLFxuICBpbmplY3QsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgTmdDbGFzcyB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5cbmltcG9ydCB7IHRha2UgfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5cbi8qKiBFeHRyYSBDU1MgY2xhc3NlcyB0aGF0IGNhbiBiZSBhc3NvY2lhdGVkIHdpdGggYSBjYWxlbmRhciBjZWxsLiAqL1xuZXhwb3J0IHR5cGUgQ2FsZW5kYXJDZWxsQ3NzQ2xhc3NlcyA9IHN0cmluZyB8IHN0cmluZ1tdIHwgU2V0PHN0cmluZz4gfCBSZWNvcmQ8c3RyaW5nLCBhbnk+O1xuXG4vKiogRnVuY3Rpb24gdGhhdCBjYW4gZ2VuZXJhdGUgdGhlIGV4dHJhIGNsYXNzZXMgdGhhdCBzaG91bGQgYmUgYWRkZWQgdG8gYSBjYWxlbmRhciBjZWxsLiAqL1xuZXhwb3J0IHR5cGUgQ2FsZW5kYXJDZWxsQ2xhc3NGdW5jdGlvbjxEPiA9IChcbiAgZGF0ZTogRCxcbiAgdmlldzogJ21vbnRoJyB8ICd5ZWFyJyB8ICdtdWx0aS15ZWFyJ1xuKSA9PiBDYWxlbmRhckNlbGxDc3NDbGFzc2VzO1xuXG4vKipcbiAqIEFuIGludGVybmFsIGNsYXNzIHRoYXQgcmVwcmVzZW50cyB0aGUgZGF0YSBjb3JyZXNwb25kaW5nIHRvIGEgc2luZ2xlIGNhbGVuZGFyIGNlbGwuXG4gKiBAZG9jcy1wcml2YXRlXG4gKi9cbmV4cG9ydCBjbGFzcyBDYWxlbmRhckNlbGw8RCA9IGFueT4ge1xuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgdmFsdWU6IG51bWJlcixcbiAgICBwdWJsaWMgZGlzcGxheVZhbHVlOiBzdHJpbmcsXG4gICAgcHVibGljIGFyaWFMYWJlbDogc3RyaW5nLFxuICAgIHB1YmxpYyBlbmFibGVkOiBib29sZWFuLFxuICAgIHB1YmxpYyBjc3NDbGFzc2VzOiBDYWxlbmRhckNlbGxDc3NDbGFzc2VzID0ge30sXG4gICAgcHVibGljIGNvbXBhcmVWYWx1ZSA9IHZhbHVlLFxuICAgIHB1YmxpYyByYXdWYWx1ZT86IERcbiAgKSB7fVxufVxuXG4vKiogRXZlbnQgZW1pdHRlZCB3aGVuIGEgZGF0ZSBpbnNpZGUgdGhlIGNhbGVuZGFyIGlzIHRyaWdnZXJlZCBhcyBhIHJlc3VsdCBvZiBhIHVzZXIgYWN0aW9uLiAqL1xuZXhwb3J0IGludGVyZmFjZSBDYWxlbmRhclVzZXJFdmVudDxEPiB7XG4gIHZhbHVlOiBEO1xuICBldmVudDogRXZlbnQ7XG59XG5cbmxldCBjYWxlbmRhckJvZHlJZCA9IDE7XG5cbi8qKiBFdmVudCBvcHRpb25zIHRoYXQgY2FuIGJlIHVzZWQgdG8gYmluZCBhbiBhY3RpdmUsIGNhcHR1cmluZyBldmVudC4gKi9cbmNvbnN0IGFjdGl2ZUNhcHR1cmluZ0V2ZW50T3B0aW9ucyA9IG5vcm1hbGl6ZVBhc3NpdmVMaXN0ZW5lck9wdGlvbnMoe1xuICBwYXNzaXZlOiBmYWxzZSxcbiAgY2FwdHVyZTogdHJ1ZSxcbn0pO1xuXG4vKiogRXZlbnQgb3B0aW9ucyB0aGF0IGNhbiBiZSB1c2VkIHRvIGJpbmQgYSBwYXNzaXZlLCBjYXB0dXJpbmcgZXZlbnQuICovXG5jb25zdCBwYXNzaXZlQ2FwdHVyaW5nRXZlbnRPcHRpb25zID0gbm9ybWFsaXplUGFzc2l2ZUxpc3RlbmVyT3B0aW9ucyh7XG4gIHBhc3NpdmU6IHRydWUsXG4gIGNhcHR1cmU6IHRydWUsXG59KTtcblxuLyoqIEV2ZW50IG9wdGlvbnMgdGhhdCBjYW4gYmUgdXNlZCB0byBiaW5kIGEgcGFzc2l2ZSwgbm9uLWNhcHR1cmluZyBldmVudC4gKi9cbmNvbnN0IHBhc3NpdmVFdmVudE9wdGlvbnMgPSBub3JtYWxpemVQYXNzaXZlTGlzdGVuZXJPcHRpb25zKHsgcGFzc2l2ZTogdHJ1ZSB9KTtcblxuLyoqXG4gKiBBbiBpbnRlcm5hbCBjb21wb25lbnQgdXNlZCB0byBkaXNwbGF5IGNhbGVuZGFyIGRhdGEgaW4gYSB0YWJsZS5cbiAqIEBkb2NzLXByaXZhdGVcbiAqL1xuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnW2NhbGVuZGFyLWJvZHldJyxcbiAgdGVtcGxhdGVVcmw6ICdjYWxlbmRhci1ib2R5Lmh0bWwnLFxuICBzdHlsZVVybDogJ2NhbGVuZGFyLWJvZHkuc2NzcycsXG4gIGhvc3Q6IHtcbiAgICBjbGFzczogJ2NhbGVuZGFyLWJvZHknLFxuICB9LFxuICBleHBvcnRBczogJ2NhbGVuZGFyQm9keScsXG4gIHN0YW5kYWxvbmU6IHRydWUsXG4gIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLk5vbmUsXG4gIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuT25QdXNoLFxuICBpbXBvcnRzOiBbTmdDbGFzc10sXG59KVxuZXhwb3J0IGNsYXNzIENhbGVuZGFyQm9keTxEID0gYW55PiBpbXBsZW1lbnRzIE9uQ2hhbmdlcywgT25EZXN0cm95LCBBZnRlclZpZXdDaGVja2VkIHtcbiAgcHJpdmF0ZSBfcGxhdGZvcm0gPSBpbmplY3QoUGxhdGZvcm0pO1xuXG4gIC8qKlxuICAgKiBVc2VkIHRvIHNraXAgdGhlIG5leHQgZm9jdXMgZXZlbnQgd2hlbiByZW5kZXJpbmcgdGhlIHByZXZpZXcgcmFuZ2UuXG4gICAqIFdlIG5lZWQgYSBmbGFnIGxpa2UgdGhpcywgYmVjYXVzZSBzb21lIGJyb3dzZXJzIGZpcmUgZm9jdXMgZXZlbnRzIGFzeW5jaHJvbm91c2x5LlxuICAgKi9cbiAgcHJpdmF0ZSBfc2tpcE5leHRGb2N1czogYm9vbGVhbjtcblxuICAvKipcbiAgICogVXNlZCB0byBmb2N1cyB0aGUgYWN0aXZlIGNlbGwgYWZ0ZXIgY2hhbmdlIGRldGVjdGlvbiBoYXMgcnVuLlxuICAgKi9cbiAgcHJpdmF0ZSBfZm9jdXNBY3RpdmVDZWxsQWZ0ZXJWaWV3Q2hlY2tlZCA9IGZhbHNlO1xuXG4gIC8qKiBUaGUgbGFiZWwgZm9yIHRoZSB0YWJsZS4gKGUuZy4gXCJKYW4gMjAxN1wiKS4gKi9cbiAgQElucHV0KCkgbGFiZWw6IHN0cmluZztcblxuICAvKiogVGhlIGNlbGxzIHRvIGRpc3BsYXkgaW4gdGhlIHRhYmxlLiAqL1xuICBASW5wdXQoKSByb3dzOiBDYWxlbmRhckNlbGxbXVtdO1xuXG4gIC8qKiBUaGUgdmFsdWUgaW4gdGhlIHRhYmxlIHRoYXQgY29ycmVzcG9uZHMgdG8gdG9kYXkuICovXG4gIEBJbnB1dCgpIHRvZGF5VmFsdWU6IG51bWJlcjtcblxuICAvKiogU3RhcnQgdmFsdWUgb2YgdGhlIHNlbGVjdGVkIGRhdGUgcmFuZ2UuICovXG4gIEBJbnB1dCgpIHN0YXJ0VmFsdWU6IG51bWJlcjtcblxuICAvKiogRW5kIHZhbHVlIG9mIHRoZSBzZWxlY3RlZCBkYXRlIHJhbmdlLiAqL1xuICBASW5wdXQoKSBlbmRWYWx1ZTogbnVtYmVyO1xuXG4gIC8qKiBUaGUgbWluaW11bSBudW1iZXIgb2YgZnJlZSBjZWxscyBuZWVkZWQgdG8gZml0IHRoZSBsYWJlbCBpbiB0aGUgZmlyc3Qgcm93LiAqL1xuICBASW5wdXQoKSBsYWJlbE1pblJlcXVpcmVkQ2VsbHM6IG51bWJlcjtcblxuICAvKiogVGhlIG51bWJlciBvZiBjb2x1bW5zIGluIHRoZSB0YWJsZS4gKi9cbiAgQElucHV0KCkgbnVtQ29scyA9IDc7XG5cbiAgLyoqIFRoZSBjZWxsIG51bWJlciBvZiB0aGUgYWN0aXZlIGNlbGwgaW4gdGhlIHRhYmxlLiAqL1xuICBASW5wdXQoKSBhY3RpdmVDZWxsID0gMDtcblxuICBuZ0FmdGVyVmlld0NoZWNrZWQoKSB7XG4gICAgaWYgKHRoaXMuX2ZvY3VzQWN0aXZlQ2VsbEFmdGVyVmlld0NoZWNrZWQpIHtcbiAgICAgIHRoaXMuX2ZvY3VzQWN0aXZlQ2VsbCgpO1xuICAgICAgdGhpcy5fZm9jdXNBY3RpdmVDZWxsQWZ0ZXJWaWV3Q2hlY2tlZCA9IGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBXaGV0aGVyIGEgcmFuZ2UgaXMgYmVpbmcgc2VsZWN0ZWQuICovXG4gIEBJbnB1dCgpIGlzUmFuZ2UgPSBmYWxzZTtcblxuICAvKipcbiAgICogVGhlIGFzcGVjdCByYXRpbyAod2lkdGggLyBoZWlnaHQpIHRvIHVzZSBmb3IgdGhlIGNlbGxzIGluIHRoZSB0YWJsZS4gVGhpcyBhc3BlY3QgcmF0aW8gd2lsbCBiZVxuICAgKiBtYWludGFpbmVkIGV2ZW4gYXMgdGhlIHRhYmxlIHJlc2l6ZXMuXG4gICAqL1xuICBASW5wdXQoKSBjZWxsQXNwZWN0UmF0aW8gPSAxO1xuXG4gIC8qKiBTdGFydCBvZiB0aGUgY29tcGFyaXNvbiByYW5nZS4gKi9cbiAgQElucHV0KCkgY29tcGFyaXNvblN0YXJ0OiBudW1iZXIgfCBudWxsO1xuXG4gIC8qKiBFbmQgb2YgdGhlIGNvbXBhcmlzb24gcmFuZ2UuICovXG4gIEBJbnB1dCgpIGNvbXBhcmlzb25FbmQ6IG51bWJlciB8IG51bGw7XG5cbiAgLyoqIFN0YXJ0IG9mIHRoZSBwcmV2aWV3IHJhbmdlLiAqL1xuICBASW5wdXQoKSBwcmV2aWV3U3RhcnQ6IG51bWJlciB8IG51bGwgPSBudWxsO1xuXG4gIC8qKiBFbmQgb2YgdGhlIHByZXZpZXcgcmFuZ2UuICovXG4gIEBJbnB1dCgpIHByZXZpZXdFbmQ6IG51bWJlciB8IG51bGwgPSBudWxsO1xuXG4gIC8qKiBBUklBIEFjY2Vzc2libGUgbmFtZSBvZiB0aGUgYDxpbnB1dCBzdGFydERhdGUvPmAgKi9cbiAgQElucHV0KCkgc3RhcnREYXRlQWNjZXNzaWJsZU5hbWU6IHN0cmluZyB8IG51bGw7XG5cbiAgLyoqIEFSSUEgQWNjZXNzaWJsZSBuYW1lIG9mIHRoZSBgPGlucHV0IGVuZERhdGUvPmAgKi9cbiAgQElucHV0KCkgZW5kRGF0ZUFjY2Vzc2libGVOYW1lOiBzdHJpbmcgfCBudWxsO1xuXG4gIC8qKiBFbWl0cyB3aGVuIGEgbmV3IHZhbHVlIGlzIHNlbGVjdGVkLiAqL1xuICBAT3V0cHV0KCkgcmVhZG9ubHkgc2VsZWN0ZWRWYWx1ZUNoYW5nZSA9IG5ldyBFdmVudEVtaXR0ZXI8Q2FsZW5kYXJVc2VyRXZlbnQ8bnVtYmVyPj4oKTtcblxuICAvKiogRW1pdHMgd2hlbiB0aGUgcHJldmlldyBoYXMgY2hhbmdlZCBhcyBhIHJlc3VsdCBvZiBhIHVzZXIgYWN0aW9uLiAqL1xuICBAT3V0cHV0KCkgcmVhZG9ubHkgcHJldmlld0NoYW5nZSA9IG5ldyBFdmVudEVtaXR0ZXI8Q2FsZW5kYXJVc2VyRXZlbnQ8Q2FsZW5kYXJDZWxsIHwgbnVsbD4+KCk7XG5cbiAgQE91dHB1dCgpIHJlYWRvbmx5IGFjdGl2ZURhdGVDaGFuZ2UgPSBuZXcgRXZlbnRFbWl0dGVyPENhbGVuZGFyVXNlckV2ZW50PG51bWJlcj4+KCk7XG5cbiAgLyoqIEVtaXRzIHRoZSBkYXRlIGF0IHRoZSBwb3NzaWJsZSBzdGFydCBvZiBhIGRyYWcgZXZlbnQuICovXG4gIEBPdXRwdXQoKSByZWFkb25seSBkcmFnU3RhcnRlZCA9IG5ldyBFdmVudEVtaXR0ZXI8Q2FsZW5kYXJVc2VyRXZlbnQ8RD4+KCk7XG5cbiAgLyoqIEVtaXRzIHRoZSBkYXRlIGF0IHRoZSBjb25jbHVzaW9uIG9mIGEgZHJhZywgb3IgbnVsbCBpZiBtb3VzZSB3YXMgbm90IHJlbGVhc2VkIG9uIGEgZGF0ZS4gKi9cbiAgQE91dHB1dCgpIHJlYWRvbmx5IGRyYWdFbmRlZCA9IG5ldyBFdmVudEVtaXR0ZXI8Q2FsZW5kYXJVc2VyRXZlbnQ8RCB8IG51bGw+PigpO1xuXG4gIC8qKiBUaGUgbnVtYmVyIG9mIGJsYW5rIGNlbGxzIHRvIHB1dCBhdCB0aGUgYmVnaW5uaW5nIGZvciB0aGUgZmlyc3Qgcm93LiAqL1xuICBfZmlyc3RSb3dPZmZzZXQ6IG51bWJlcjtcblxuICAvKiogUGFkZGluZyBmb3IgdGhlIGluZGl2aWR1YWwgZGF0ZSBjZWxscy4gKi9cbiAgX2NlbGxQYWRkaW5nOiBzdHJpbmc7XG5cbiAgLyoqIFdpZHRoIG9mIGFuIGluZGl2aWR1YWwgY2VsbC4gKi9cbiAgX2NlbGxXaWR0aDogc3RyaW5nO1xuXG4gIHByaXZhdGUgX2RpZERyYWdTaW5jZU1vdXNlRG93biA9IGZhbHNlO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgX2VsZW1lbnRSZWY6IEVsZW1lbnRSZWY8SFRNTEVsZW1lbnQ+LFxuICAgIHByaXZhdGUgX25nWm9uZTogTmdab25lXG4gICkge1xuICAgIF9uZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4ge1xuICAgICAgY29uc3QgZWxlbWVudCA9IF9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQ7XG5cbiAgICAgIC8vIGB0b3VjaG1vdmVgIGlzIGFjdGl2ZSBzaW5jZSB3ZSBuZWVkIHRvIGNhbGwgYHByZXZlbnREZWZhdWx0YC5cbiAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgdGhpcy5fdG91Y2htb3ZlSGFuZGxlciwgYWN0aXZlQ2FwdHVyaW5nRXZlbnRPcHRpb25zKTtcblxuICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWVudGVyJywgdGhpcy5fZW50ZXJIYW5kbGVyLCBwYXNzaXZlQ2FwdHVyaW5nRXZlbnRPcHRpb25zKTtcbiAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignZm9jdXMnLCB0aGlzLl9lbnRlckhhbmRsZXIsIHBhc3NpdmVDYXB0dXJpbmdFdmVudE9wdGlvbnMpO1xuICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWxlYXZlJywgdGhpcy5fbGVhdmVIYW5kbGVyLCBwYXNzaXZlQ2FwdHVyaW5nRXZlbnRPcHRpb25zKTtcbiAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignYmx1cicsIHRoaXMuX2xlYXZlSGFuZGxlciwgcGFzc2l2ZUNhcHR1cmluZ0V2ZW50T3B0aW9ucyk7XG5cbiAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgdGhpcy5fbW91c2Vkb3duSGFuZGxlciwgcGFzc2l2ZUV2ZW50T3B0aW9ucyk7XG4gICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCB0aGlzLl9tb3VzZWRvd25IYW5kbGVyLCBwYXNzaXZlRXZlbnRPcHRpb25zKTtcblxuICAgICAgaWYgKHRoaXMuX3BsYXRmb3JtLmlzQnJvd3Nlcikge1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHRoaXMuX21vdXNldXBIYW5kbGVyKTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgdGhpcy5fdG91Y2hlbmRIYW5kbGVyKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBDYWxsZWQgd2hlbiBhIGNlbGwgaXMgY2xpY2tlZC4gKi9cbiAgX2NlbGxDbGlja2VkKGNlbGw6IENhbGVuZGFyQ2VsbCwgZXZlbnQ6IE1vdXNlRXZlbnQpOiB2b2lkIHtcbiAgICAvLyBJZ25vcmUgXCJjbGlja3NcIiB0aGF0IGFyZSBhY3R1YWxseSBjYW5jZWxlZCBkcmFncyAoZWcgdGhlIHVzZXIgZHJhZ2dlZFxuICAgIC8vIG9mZiBhbmQgdGhlbiB3ZW50IGJhY2sgdG8gdGhpcyBjZWxsIHRvIHVuZG8pLlxuICAgIGlmICh0aGlzLl9kaWREcmFnU2luY2VNb3VzZURvd24pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoY2VsbC5lbmFibGVkKSB7XG4gICAgICB0aGlzLnNlbGVjdGVkVmFsdWVDaGFuZ2UuZW1pdCh7IHZhbHVlOiBjZWxsLnZhbHVlLCBldmVudCB9KTtcbiAgICB9XG4gIH1cblxuICBfZW1pdEFjdGl2ZURhdGVDaGFuZ2UoY2VsbDogQ2FsZW5kYXJDZWxsLCBldmVudDogRm9jdXNFdmVudCk6IHZvaWQge1xuICAgIGlmIChjZWxsLmVuYWJsZWQpIHtcbiAgICAgIHRoaXMuYWN0aXZlRGF0ZUNoYW5nZS5lbWl0KHsgdmFsdWU6IGNlbGwudmFsdWUsIGV2ZW50IH0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBSZXR1cm5zIHdoZXRoZXIgYSBjZWxsIHNob3VsZCBiZSBtYXJrZWQgYXMgc2VsZWN0ZWQuICovXG4gIF9pc1NlbGVjdGVkKHZhbHVlOiBudW1iZXIpIHtcbiAgICByZXR1cm4gdGhpcy5zdGFydFZhbHVlID09PSB2YWx1ZSB8fCB0aGlzLmVuZFZhbHVlID09PSB2YWx1ZTtcbiAgfVxuXG4gIG5nT25DaGFuZ2VzKGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMpIHtcbiAgICBjb25zdCBjb2x1bW5DaGFuZ2VzID0gY2hhbmdlc1snbnVtQ29scyddO1xuICAgIGNvbnN0IHsgcm93cywgbnVtQ29scyB9ID0gdGhpcztcblxuICAgIGlmIChjaGFuZ2VzWydyb3dzJ10gfHwgY29sdW1uQ2hhbmdlcykge1xuICAgICAgdGhpcy5fZmlyc3RSb3dPZmZzZXQgPSByb3dzICYmIHJvd3MubGVuZ3RoICYmIHJvd3NbMF0ubGVuZ3RoID8gbnVtQ29scyAtIHJvd3NbMF0ubGVuZ3RoIDogMDtcbiAgICB9XG5cbiAgICBpZiAoY2hhbmdlc1snY2VsbEFzcGVjdFJhdGlvJ10gfHwgY29sdW1uQ2hhbmdlcyB8fCAhdGhpcy5fY2VsbFBhZGRpbmcpIHtcbiAgICAgIHRoaXMuX2NlbGxQYWRkaW5nID0gYCR7KDUwICogdGhpcy5jZWxsQXNwZWN0UmF0aW8pIC8gbnVtQ29sc30lYDtcbiAgICB9XG5cbiAgICBpZiAoY29sdW1uQ2hhbmdlcyB8fCAhdGhpcy5fY2VsbFdpZHRoKSB7XG4gICAgICB0aGlzLl9jZWxsV2lkdGggPSBgJHsxMDAgLyBudW1Db2xzfSVgO1xuICAgIH1cbiAgfVxuXG4gIG5nT25EZXN0cm95KCkge1xuICAgIGNvbnN0IGVsZW1lbnQgPSB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQ7XG5cbiAgICBlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIHRoaXMuX3RvdWNobW92ZUhhbmRsZXIsIGFjdGl2ZUNhcHR1cmluZ0V2ZW50T3B0aW9ucyk7XG5cbiAgICBlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlZW50ZXInLCB0aGlzLl9lbnRlckhhbmRsZXIsIHBhc3NpdmVDYXB0dXJpbmdFdmVudE9wdGlvbnMpO1xuICAgIGVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignZm9jdXMnLCB0aGlzLl9lbnRlckhhbmRsZXIsIHBhc3NpdmVDYXB0dXJpbmdFdmVudE9wdGlvbnMpO1xuICAgIGVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2VsZWF2ZScsIHRoaXMuX2xlYXZlSGFuZGxlciwgcGFzc2l2ZUNhcHR1cmluZ0V2ZW50T3B0aW9ucyk7XG4gICAgZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdibHVyJywgdGhpcy5fbGVhdmVIYW5kbGVyLCBwYXNzaXZlQ2FwdHVyaW5nRXZlbnRPcHRpb25zKTtcblxuICAgIGVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgdGhpcy5fbW91c2Vkb3duSGFuZGxlciwgcGFzc2l2ZUV2ZW50T3B0aW9ucyk7XG4gICAgZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgdGhpcy5fbW91c2Vkb3duSGFuZGxlciwgcGFzc2l2ZUV2ZW50T3B0aW9ucyk7XG5cbiAgICBpZiAodGhpcy5fcGxhdGZvcm0uaXNCcm93c2VyKSB7XG4gICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHRoaXMuX21vdXNldXBIYW5kbGVyKTtcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIHRoaXMuX3RvdWNoZW5kSGFuZGxlcik7XG4gICAgfVxuICB9XG5cbiAgLyoqIFJldHVybnMgd2hldGhlciBhIGNlbGwgaXMgYWN0aXZlLiAqL1xuICBfaXNBY3RpdmVDZWxsKHJvd0luZGV4OiBudW1iZXIsIGNvbEluZGV4OiBudW1iZXIpOiBib29sZWFuIHtcbiAgICBsZXQgY2VsbE51bWJlciA9IHJvd0luZGV4ICogdGhpcy5udW1Db2xzICsgY29sSW5kZXg7XG5cbiAgICAvLyBBY2NvdW50IGZvciB0aGUgZmFjdCB0aGF0IHRoZSBmaXJzdCByb3cgbWF5IG5vdCBoYXZlIGFzIG1hbnkgY2VsbHMuXG4gICAgaWYgKHJvd0luZGV4KSB7XG4gICAgICBjZWxsTnVtYmVyIC09IHRoaXMuX2ZpcnN0Um93T2Zmc2V0O1xuICAgIH1cblxuICAgIHJldHVybiBjZWxsTnVtYmVyID09IHRoaXMuYWN0aXZlQ2VsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBGb2N1c2VzIHRoZSBhY3RpdmUgY2VsbCBhZnRlciB0aGUgbWljcm90YXNrIHF1ZXVlIGlzIGVtcHR5LlxuICAgKlxuICAgKiBBZGRpbmcgYSAwbXMgc2V0VGltZW91dCBzZWVtcyB0byBmaXggVm9pY2VvdmVyIGxvc2luZyBmb2N1cyB3aGVuIHByZXNzaW5nIFBhZ2VVcC9QYWdlRG93blxuICAgKiAoaXNzdWUgIzI0MzMwKS5cbiAgICpcbiAgICogRGV0ZXJtaW5lZCBhIDBtcyBieSBncmFkdWFsbHkgaW5jcmVhc2luZyBkdXJhdGlvbiBmcm9tIDAgYW5kIHRlc3RpbmcgdHdvIHVzZSBjYXNlcyB3aXRoIHNjcmVlblxuICAgKiByZWFkZXIgZW5hYmxlZDpcbiAgICpcbiAgICogMS4gUHJlc3NpbmcgUGFnZVVwL1BhZ2VEb3duIHJlcGVhdGVkbHkgd2l0aCBwYXVzaW5nIGJldHdlZW4gZWFjaCBrZXkgcHJlc3MuXG4gICAqIDIuIFByZXNzaW5nIGFuZCBob2xkaW5nIHRoZSBQYWdlRG93biBrZXkgd2l0aCByZXBlYXRlZCBrZXlzIGVuYWJsZWQuXG4gICAqXG4gICAqIFRlc3QgMSB3b3JrZWQgcm91Z2hseSA5NS05OSUgb2YgdGhlIHRpbWUgd2l0aCAwbXMgYW5kIGdvdCBhIGxpdHRsZSBiaXQgYmV0dGVyIGFzIHRoZSBkdXJhdGlvblxuICAgKiBpbmNyZWFzZWQuIFRlc3QgMiBnb3Qgc2xpZ2h0bHkgYmV0dGVyIHVudGlsIHRoZSBkdXJhdGlvbiB3YXMgbG9uZyBlbm91Z2ggdG8gaW50ZXJmZXJlIHdpdGhcbiAgICogcmVwZWF0ZWQga2V5cy4gSWYgdGhlIHJlcGVhdGVkIGtleSBzcGVlZCB3YXMgZmFzdGVyIHRoYW4gdGhlIHRpbWVvdXQgZHVyYXRpb24sIHRoZW4gcHJlc3NpbmdcbiAgICogYW5kIGhvbGRpbmcgcGFnZWRvd24gY2F1c2VkIHRoZSBlbnRpcmUgcGFnZSB0byBzY3JvbGwuXG4gICAqXG4gICAqIFNpbmNlIHJlcGVhdGVkIGtleSBzcGVlZCBjYW4gdmVyaWZ5IGFjcm9zcyBtYWNoaW5lcywgZGV0ZXJtaW5lZCB0aGF0IGFueSBkdXJhdGlvbiBjb3VsZFxuICAgKiBwb3RlbnRpYWxseSBpbnRlcmZlcmUgd2l0aCByZXBlYXRlZCBrZXlzLiAwbXMgd291bGQgYmUgYmVzdCBiZWNhdXNlIGl0IGFsbW9zdCBlbnRpcmVseVxuICAgKiBlbGltaW5hdGVzIHRoZSBmb2N1cyBiZWluZyBsb3N0IGluIFZvaWNlb3ZlciAoIzI0MzMwKSB3aXRob3V0IGNhdXNpbmcgdW5pbnRlbmRlZCBzaWRlIGVmZmVjdHMuXG4gICAqIEFkZGluZyBkZWxheSBhbHNvIGNvbXBsaWNhdGVzIHdyaXRpbmcgdGVzdHMuXG4gICAqL1xuICBfZm9jdXNBY3RpdmVDZWxsKG1vdmVQcmV2aWV3ID0gdHJ1ZSkge1xuICAgIHRoaXMuX25nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XG4gICAgICB0aGlzLl9uZ1pvbmUub25TdGFibGUucGlwZSh0YWtlKDEpKS5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICBjb25zdCBhY3RpdmVDZWxsOiBIVE1MRWxlbWVudCB8IG51bGwgPVxuICAgICAgICAgICAgdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5jYWxlbmRhci1ib2R5LWFjdGl2ZScpO1xuXG4gICAgICAgICAgaWYgKGFjdGl2ZUNlbGwpIHtcbiAgICAgICAgICAgIGlmICghbW92ZVByZXZpZXcpIHtcbiAgICAgICAgICAgICAgdGhpcy5fc2tpcE5leHRGb2N1cyA9IHRydWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGFjdGl2ZUNlbGwuZm9jdXMoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICAvKiogRm9jdXNlcyB0aGUgYWN0aXZlIGNlbGwgYWZ0ZXIgY2hhbmdlIGRldGVjdGlvbiBoYXMgcnVuIGFuZCB0aGUgbWljcm90YXNrIHF1ZXVlIGlzIGVtcHR5LiAqL1xuICBfc2NoZWR1bGVGb2N1c0FjdGl2ZUNlbGxBZnRlclZpZXdDaGVja2VkKCkge1xuICAgIHRoaXMuX2ZvY3VzQWN0aXZlQ2VsbEFmdGVyVmlld0NoZWNrZWQgPSB0cnVlO1xuICB9XG5cbiAgLyoqIEdldHMgd2hldGhlciBhIHZhbHVlIGlzIHRoZSBzdGFydCBvZiB0aGUgbWFpbiByYW5nZS4gKi9cbiAgX2lzUmFuZ2VTdGFydCh2YWx1ZTogbnVtYmVyKSB7XG4gICAgcmV0dXJuIGlzU3RhcnQodmFsdWUsIHRoaXMuc3RhcnRWYWx1ZSwgdGhpcy5lbmRWYWx1ZSk7XG4gIH1cblxuICAvKiogR2V0cyB3aGV0aGVyIGEgdmFsdWUgaXMgdGhlIGVuZCBvZiB0aGUgbWFpbiByYW5nZS4gKi9cbiAgX2lzUmFuZ2VFbmQodmFsdWU6IG51bWJlcikge1xuICAgIHJldHVybiBpc0VuZCh2YWx1ZSwgdGhpcy5zdGFydFZhbHVlLCB0aGlzLmVuZFZhbHVlKTtcbiAgfVxuXG4gIC8qKiBHZXRzIHdoZXRoZXIgYSB2YWx1ZSBpcyB3aXRoaW4gdGhlIGN1cnJlbnRseS1zZWxlY3RlZCByYW5nZS4gKi9cbiAgX2lzSW5SYW5nZSh2YWx1ZTogbnVtYmVyKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGlzSW5SYW5nZSh2YWx1ZSwgdGhpcy5zdGFydFZhbHVlLCB0aGlzLmVuZFZhbHVlLCB0aGlzLmlzUmFuZ2UpO1xuICB9XG5cbiAgLyoqIEdldHMgd2hldGhlciBhIHZhbHVlIGlzIHRoZSBzdGFydCBvZiB0aGUgY29tcGFyaXNvbiByYW5nZS4gKi9cbiAgX2lzQ29tcGFyaXNvblN0YXJ0KHZhbHVlOiBudW1iZXIpIHtcbiAgICByZXR1cm4gaXNTdGFydCh2YWx1ZSwgdGhpcy5jb21wYXJpc29uU3RhcnQsIHRoaXMuY29tcGFyaXNvbkVuZCk7XG4gIH1cblxuICAvKiogV2hldGhlciB0aGUgY2VsbCBpcyBhIHN0YXJ0IGJyaWRnZSBjZWxsIGJldHdlZW4gdGhlIG1haW4gYW5kIGNvbXBhcmlzb24gcmFuZ2VzLiAqL1xuICBfaXNDb21wYXJpc29uQnJpZGdlU3RhcnQodmFsdWU6IG51bWJlciwgcm93SW5kZXg6IG51bWJlciwgY29sSW5kZXg6IG51bWJlcikge1xuICAgIGlmICghdGhpcy5faXNDb21wYXJpc29uU3RhcnQodmFsdWUpIHx8IHRoaXMuX2lzUmFuZ2VTdGFydCh2YWx1ZSkgfHwgIXRoaXMuX2lzSW5SYW5nZSh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBsZXQgcHJldmlvdXNDZWxsOiBDYWxlbmRhckNlbGwgfCB1bmRlZmluZWQgPSB0aGlzLnJvd3Nbcm93SW5kZXhdW2NvbEluZGV4IC0gMV07XG5cbiAgICBpZiAoIXByZXZpb3VzQ2VsbCkge1xuICAgICAgY29uc3QgcHJldmlvdXNSb3cgPSB0aGlzLnJvd3Nbcm93SW5kZXggLSAxXTtcbiAgICAgIHByZXZpb3VzQ2VsbCA9IHByZXZpb3VzUm93ICYmIHByZXZpb3VzUm93W3ByZXZpb3VzUm93Lmxlbmd0aCAtIDFdO1xuICAgIH1cblxuICAgIHJldHVybiBwcmV2aW91c0NlbGwgJiYgIXRoaXMuX2lzUmFuZ2VFbmQocHJldmlvdXNDZWxsLmNvbXBhcmVWYWx1ZSk7XG4gIH1cblxuICAvKiogV2hldGhlciB0aGUgY2VsbCBpcyBhbiBlbmQgYnJpZGdlIGNlbGwgYmV0d2VlbiB0aGUgbWFpbiBhbmQgY29tcGFyaXNvbiByYW5nZXMuICovXG4gIF9pc0NvbXBhcmlzb25CcmlkZ2VFbmQodmFsdWU6IG51bWJlciwgcm93SW5kZXg6IG51bWJlciwgY29sSW5kZXg6IG51bWJlcikge1xuICAgIGlmICghdGhpcy5faXNDb21wYXJpc29uRW5kKHZhbHVlKSB8fCB0aGlzLl9pc1JhbmdlRW5kKHZhbHVlKSB8fCAhdGhpcy5faXNJblJhbmdlKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGxldCBuZXh0Q2VsbDogQ2FsZW5kYXJDZWxsIHwgdW5kZWZpbmVkID0gdGhpcy5yb3dzW3Jvd0luZGV4XVtjb2xJbmRleCArIDFdO1xuXG4gICAgaWYgKCFuZXh0Q2VsbCkge1xuICAgICAgY29uc3QgbmV4dFJvdyA9IHRoaXMucm93c1tyb3dJbmRleCArIDFdO1xuICAgICAgbmV4dENlbGwgPSBuZXh0Um93ICYmIG5leHRSb3dbMF07XG4gICAgfVxuXG4gICAgcmV0dXJuIG5leHRDZWxsICYmICF0aGlzLl9pc1JhbmdlU3RhcnQobmV4dENlbGwuY29tcGFyZVZhbHVlKTtcbiAgfVxuXG4gIC8qKiBHZXRzIHdoZXRoZXIgYSB2YWx1ZSBpcyB0aGUgZW5kIG9mIHRoZSBjb21wYXJpc29uIHJhbmdlLiAqL1xuICBfaXNDb21wYXJpc29uRW5kKHZhbHVlOiBudW1iZXIpIHtcbiAgICByZXR1cm4gaXNFbmQodmFsdWUsIHRoaXMuY29tcGFyaXNvblN0YXJ0LCB0aGlzLmNvbXBhcmlzb25FbmQpO1xuICB9XG5cbiAgLyoqIEdldHMgd2hldGhlciBhIHZhbHVlIGlzIHdpdGhpbiB0aGUgY3VycmVudCBjb21wYXJpc29uIHJhbmdlLiAqL1xuICBfaXNJbkNvbXBhcmlzb25SYW5nZSh2YWx1ZTogbnVtYmVyKSB7XG4gICAgcmV0dXJuIGlzSW5SYW5nZSh2YWx1ZSwgdGhpcy5jb21wYXJpc29uU3RhcnQsIHRoaXMuY29tcGFyaXNvbkVuZCwgdGhpcy5pc1JhbmdlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHdoZXRoZXIgYSB2YWx1ZSBpcyB0aGUgc2FtZSBhcyB0aGUgc3RhcnQgYW5kIGVuZCBvZiB0aGUgY29tcGFyaXNvbiByYW5nZS5cbiAgICogRm9yIGNvbnRleHQsIHRoZSBmdW5jdGlvbnMgdGhhdCB3ZSB1c2UgdG8gZGV0ZXJtaW5lIHdoZXRoZXIgc29tZXRoaW5nIGlzIHRoZSBzdGFydC9lbmQgb2ZcbiAgICogYSByYW5nZSBkb24ndCBhbGxvdyBmb3IgdGhlIHN0YXJ0IGFuZCBlbmQgdG8gYmUgb24gdGhlIHNhbWUgZGF5LCBiZWNhdXNlIHdlJ2QgaGF2ZSB0byB1c2VcbiAgICogbXVjaCBtb3JlIHNwZWNpZmljIENTUyBzZWxlY3RvcnMgdG8gc3R5bGUgdGhlbSBjb3JyZWN0bHkgaW4gYWxsIHNjZW5hcmlvcy4gVGhpcyBpcyBmaW5lIGZvclxuICAgKiB0aGUgcmVndWxhciByYW5nZSwgYmVjYXVzZSB3aGVuIGl0IGhhcHBlbnMsIHRoZSBzZWxlY3RlZCBzdHlsZXMgdGFrZSBvdmVyIGFuZCBzdGlsbCBzaG93IHdoZXJlXG4gICAqIHRoZSByYW5nZSB3b3VsZCd2ZSBiZWVuLCBob3dldmVyIHdlIGRvbid0IGhhdmUgdGhlc2Ugc2VsZWN0ZWQgc3R5bGVzIGZvciBhIGNvbXBhcmlzb24gcmFuZ2UuXG4gICAqIFRoaXMgZnVuY3Rpb24gaXMgdXNlZCB0byBhcHBseSBhIGNsYXNzIHRoYXQgc2VydmVzIHRoZSBzYW1lIHB1cnBvc2UgYXMgdGhlIG9uZSBmb3Igc2VsZWN0ZWRcbiAgICogZGF0ZXMsIGJ1dCBpdCBvbmx5IGFwcGxpZXMgaW4gdGhlIGNvbnRleHQgb2YgYSBjb21wYXJpc29uIHJhbmdlLlxuICAgKi9cbiAgX2lzQ29tcGFyaXNvbklkZW50aWNhbCh2YWx1ZTogbnVtYmVyKSB7XG4gICAgLy8gTm90ZSB0aGF0IHdlIGRvbid0IG5lZWQgdG8gbnVsbCBjaGVjayB0aGUgc3RhcnQvZW5kXG4gICAgLy8gaGVyZSwgYmVjYXVzZSB0aGUgYHZhbHVlYCB3aWxsIGFsd2F5cyBiZSBkZWZpbmVkLlxuICAgIHJldHVybiB0aGlzLmNvbXBhcmlzb25TdGFydCA9PT0gdGhpcy5jb21wYXJpc29uRW5kICYmIHZhbHVlID09PSB0aGlzLmNvbXBhcmlzb25TdGFydDtcbiAgfVxuXG4gIC8qKiBHZXRzIHdoZXRoZXIgYSB2YWx1ZSBpcyB0aGUgc3RhcnQgb2YgdGhlIHByZXZpZXcgcmFuZ2UuICovXG4gIF9pc1ByZXZpZXdTdGFydCh2YWx1ZTogbnVtYmVyKSB7XG4gICAgcmV0dXJuIGlzU3RhcnQodmFsdWUsIHRoaXMucHJldmlld1N0YXJ0LCB0aGlzLnByZXZpZXdFbmQpO1xuICB9XG5cbiAgLyoqIEdldHMgd2hldGhlciBhIHZhbHVlIGlzIHRoZSBlbmQgb2YgdGhlIHByZXZpZXcgcmFuZ2UuICovXG4gIF9pc1ByZXZpZXdFbmQodmFsdWU6IG51bWJlcikge1xuICAgIHJldHVybiBpc0VuZCh2YWx1ZSwgdGhpcy5wcmV2aWV3U3RhcnQsIHRoaXMucHJldmlld0VuZCk7XG4gIH1cblxuICAvKiogR2V0cyB3aGV0aGVyIGEgdmFsdWUgaXMgaW5zaWRlIHRoZSBwcmV2aWV3IHJhbmdlLiAqL1xuICBfaXNJblByZXZpZXcodmFsdWU6IG51bWJlcikge1xuICAgIHJldHVybiBpc0luUmFuZ2UodmFsdWUsIHRoaXMucHJldmlld1N0YXJ0LCB0aGlzLnByZXZpZXdFbmQsIHRoaXMuaXNSYW5nZSk7XG4gIH1cblxuICAvKiogR2V0cyBpZHMgb2YgYXJpYSBkZXNjcmlwdGlvbnMgZm9yIHRoZSBzdGFydCBhbmQgZW5kIG9mIGEgZGF0ZSByYW5nZS4gKi9cbiAgX2dldERlc2NyaWJlZGJ5KHZhbHVlOiBudW1iZXIpOiBzdHJpbmcgfCBudWxsIHtcbiAgICBpZiAoIXRoaXMuaXNSYW5nZSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuc3RhcnRWYWx1ZSA9PT0gdmFsdWUgJiYgdGhpcy5lbmRWYWx1ZSA9PT0gdmFsdWUpIHtcbiAgICAgIHJldHVybiBgJHt0aGlzLl9zdGFydERhdGVMYWJlbElkfSAke3RoaXMuX2VuZERhdGVMYWJlbElkfWA7XG4gICAgfSBlbHNlIGlmICh0aGlzLnN0YXJ0VmFsdWUgPT09IHZhbHVlKSB7XG4gICAgICByZXR1cm4gdGhpcy5fc3RhcnREYXRlTGFiZWxJZDtcbiAgICB9IGVsc2UgaWYgKHRoaXMuZW5kVmFsdWUgPT09IHZhbHVlKSB7XG4gICAgICByZXR1cm4gdGhpcy5fZW5kRGF0ZUxhYmVsSWQ7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIEV2ZW50IGhhbmRsZXIgZm9yIHdoZW4gdGhlIHVzZXIgZW50ZXJzIGFuIGVsZW1lbnRcbiAgICogaW5zaWRlIHRoZSBjYWxlbmRhciBib2R5IChlLmcuIGJ5IGhvdmVyaW5nIGluIG9yIGZvY3VzKS5cbiAgICovXG4gIHByaXZhdGUgX2VudGVySGFuZGxlciA9IChldmVudDogRXZlbnQpID0+IHtcbiAgICBpZiAodGhpcy5fc2tpcE5leHRGb2N1cyAmJiBldmVudC50eXBlID09PSAnZm9jdXMnKSB7XG4gICAgICB0aGlzLl9za2lwTmV4dEZvY3VzID0gZmFsc2U7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gV2Ugb25seSBuZWVkIHRvIGhpdCB0aGUgem9uZSB3aGVuIHdlJ3JlIHNlbGVjdGluZyBhIHJhbmdlLlxuICAgIGlmIChldmVudC50YXJnZXQgJiYgdGhpcy5pc1JhbmdlKSB7XG4gICAgICBjb25zdCBjZWxsID0gdGhpcy5fZ2V0Q2VsbEZyb21FbGVtZW50KGV2ZW50LnRhcmdldCBhcyBIVE1MRWxlbWVudCk7XG5cbiAgICAgIGlmIChjZWxsKSB7XG4gICAgICAgIHRoaXMuX25nWm9uZS5ydW4oKCkgPT5cbiAgICAgICAgICB0aGlzLnByZXZpZXdDaGFuZ2UuZW1pdCh7IHZhbHVlOiBjZWxsLmVuYWJsZWQgPyBjZWxsIDogbnVsbCwgZXZlbnQgfSlcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgcHJpdmF0ZSBfdG91Y2htb3ZlSGFuZGxlciA9IChldmVudDogVG91Y2hFdmVudCkgPT4ge1xuICAgIGlmICghdGhpcy5pc1JhbmdlKSByZXR1cm47XG5cbiAgICBjb25zdCB0YXJnZXQgPSBnZXRBY3R1YWxUb3VjaFRhcmdldChldmVudCk7XG4gICAgY29uc3QgY2VsbCA9IHRhcmdldCA/IHRoaXMuX2dldENlbGxGcm9tRWxlbWVudCh0YXJnZXQgYXMgSFRNTEVsZW1lbnQpIDogbnVsbDtcblxuICAgIGlmICh0YXJnZXQgIT09IGV2ZW50LnRhcmdldCkge1xuICAgICAgdGhpcy5fZGlkRHJhZ1NpbmNlTW91c2VEb3duID0gdHJ1ZTtcbiAgICB9XG5cbiAgICAvLyBJZiB0aGUgaW5pdGlhbCB0YXJnZXQgb2YgdGhlIHRvdWNoIGlzIGEgZGF0ZSBjZWxsLCBwcmV2ZW50IGRlZmF1bHQgc29cbiAgICAvLyB0aGF0IHRoZSBtb3ZlIGlzIG5vdCBoYW5kbGVkIGFzIGEgc2Nyb2xsLlxuICAgIGlmIChnZXRDZWxsRWxlbWVudChldmVudC50YXJnZXQgYXMgSFRNTEVsZW1lbnQpKSB7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH1cblxuICAgIHRoaXMuX25nWm9uZS5ydW4oKCkgPT4gdGhpcy5wcmV2aWV3Q2hhbmdlLmVtaXQoeyB2YWx1ZTogY2VsbD8uZW5hYmxlZCA/IGNlbGwgOiBudWxsLCBldmVudCB9KSk7XG4gIH07XG5cbiAgLyoqXG4gICAqIEV2ZW50IGhhbmRsZXIgZm9yIHdoZW4gdGhlIHVzZXIncyBwb2ludGVyIGxlYXZlcyBhbiBlbGVtZW50XG4gICAqIGluc2lkZSB0aGUgY2FsZW5kYXIgYm9keSAoZS5nLiBieSBob3ZlcmluZyBvdXQgb3IgYmx1cnJpbmcpLlxuICAgKi9cbiAgcHJpdmF0ZSBfbGVhdmVIYW5kbGVyID0gKGV2ZW50OiBFdmVudCkgPT4ge1xuICAgIC8vIFdlIG9ubHkgbmVlZCB0byBoaXQgdGhlIHpvbmUgd2hlbiB3ZSdyZSBzZWxlY3RpbmcgYSByYW5nZS5cbiAgICBpZiAodGhpcy5wcmV2aWV3RW5kICE9PSBudWxsICYmIHRoaXMuaXNSYW5nZSkge1xuICAgICAgaWYgKGV2ZW50LnR5cGUgIT09ICdibHVyJykge1xuICAgICAgICB0aGlzLl9kaWREcmFnU2luY2VNb3VzZURvd24gPSB0cnVlO1xuICAgICAgfVxuXG4gICAgICAvLyBPbmx5IHJlc2V0IHRoZSBwcmV2aWV3IGVuZCB2YWx1ZSB3aGVuIGxlYXZpbmcgY2VsbHMuIFRoaXMgbG9va3MgYmV0dGVyLCBiZWNhdXNlXG4gICAgICAvLyB3ZSBoYXZlIGEgZ2FwIGJldHdlZW4gdGhlIGNlbGxzIGFuZCB0aGUgcm93cyBhbmQgd2UgZG9uJ3Qgd2FudCB0byByZW1vdmUgdGhlXG4gICAgICAvLyByYW5nZSBqdXN0IGZvciBpdCB0byBzaG93IHVwIGFnYWluIHdoZW4gdGhlIHVzZXIgbW92ZXMgYSBmZXcgcGl4ZWxzIHRvIHRoZSBzaWRlLlxuICAgICAgaWYgKFxuICAgICAgICBldmVudC50YXJnZXQgJiZcbiAgICAgICAgdGhpcy5fZ2V0Q2VsbEZyb21FbGVtZW50KGV2ZW50LnRhcmdldCBhcyBIVE1MRWxlbWVudCkgJiZcbiAgICAgICAgIShcbiAgICAgICAgICAoZXZlbnQgYXMgTW91c2VFdmVudCkucmVsYXRlZFRhcmdldCAmJlxuICAgICAgICAgIHRoaXMuX2dldENlbGxGcm9tRWxlbWVudCgoZXZlbnQgYXMgTW91c2VFdmVudCkucmVsYXRlZFRhcmdldCBhcyBIVE1MRWxlbWVudClcbiAgICAgICAgKVxuICAgICAgKSB7XG4gICAgICAgIHRoaXMuX25nWm9uZS5ydW4oKCkgPT4gdGhpcy5wcmV2aWV3Q2hhbmdlLmVtaXQoeyB2YWx1ZTogbnVsbCwgZXZlbnQgfSkpO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICAvKipcbiAgICogVHJpZ2dlcmVkIG9uIG1vdXNlZG93biBvciB0b3VjaHN0YXJ0IG9uIGEgZGF0ZSBjZWxsLlxuICAgKiBSZXNwc29uc2libGUgZm9yIHN0YXJ0aW5nIGEgZHJhZyBzZXF1ZW5jZS5cbiAgICovXG4gIHByaXZhdGUgX21vdXNlZG93bkhhbmRsZXIgPSAoZXZlbnQ6IEV2ZW50KSA9PiB7XG4gICAgaWYgKCF0aGlzLmlzUmFuZ2UpIHJldHVybjtcblxuICAgIHRoaXMuX2RpZERyYWdTaW5jZU1vdXNlRG93biA9IGZhbHNlO1xuICAgIC8vIEJlZ2luIGEgZHJhZyBpZiBhIGNlbGwgd2l0aGluIHRoZSBjdXJyZW50IHJhbmdlIHdhcyB0YXJnZXRlZC5cbiAgICBjb25zdCBjZWxsID0gZXZlbnQudGFyZ2V0ICYmIHRoaXMuX2dldENlbGxGcm9tRWxlbWVudChldmVudC50YXJnZXQgYXMgSFRNTEVsZW1lbnQpO1xuICAgIGlmICghY2VsbCB8fCAhdGhpcy5faXNJblJhbmdlKGNlbGwuY29tcGFyZVZhbHVlKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuX25nWm9uZS5ydW4oKCkgPT4ge1xuICAgICAgdGhpcy5kcmFnU3RhcnRlZC5lbWl0KHtcbiAgICAgICAgdmFsdWU6IGNlbGwucmF3VmFsdWUsXG4gICAgICAgIGV2ZW50LFxuICAgICAgfSk7XG4gICAgfSk7XG4gIH07XG5cbiAgLyoqIFRyaWdnZXJlZCBvbiBtb3VzZXVwIGFueXdoZXJlLiBSZXNwc29uc2libGUgZm9yIGVuZGluZyBhIGRyYWcgc2VxdWVuY2UuICovXG4gIHByaXZhdGUgX21vdXNldXBIYW5kbGVyID0gKGV2ZW50OiBFdmVudCkgPT4ge1xuICAgIGlmICghdGhpcy5pc1JhbmdlKSByZXR1cm47XG5cbiAgICBjb25zdCBjZWxsRWxlbWVudCA9IGdldENlbGxFbGVtZW50KGV2ZW50LnRhcmdldCBhcyBIVE1MRWxlbWVudCk7XG4gICAgaWYgKCFjZWxsRWxlbWVudCkge1xuICAgICAgLy8gTW91c2V1cCBoYXBwZW5lZCBvdXRzaWRlIG9mIGRhdGVwaWNrZXIuIENhbmNlbCBkcmFnLlxuICAgICAgdGhpcy5fbmdab25lLnJ1bigoKSA9PiB7XG4gICAgICAgIHRoaXMuZHJhZ0VuZGVkLmVtaXQoeyB2YWx1ZTogbnVsbCwgZXZlbnQgfSk7XG4gICAgICB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoY2VsbEVsZW1lbnQuY2xvc2VzdCgnLmNhbGVuZGFyLWJvZHknKSAhPT0gdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50KSB7XG4gICAgICAvLyBNb3VzZXVwIGhhcHBlbmVkIGluc2lkZSBhIGRpZmZlcmVudCBtb250aCBpbnN0YW5jZS5cbiAgICAgIC8vIEFsbG93IGl0IHRvIGhhbmRsZSB0aGUgZXZlbnQuXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5fbmdab25lLnJ1bigoKSA9PiB7XG4gICAgICBjb25zdCBjZWxsID0gdGhpcy5fZ2V0Q2VsbEZyb21FbGVtZW50KGNlbGxFbGVtZW50KTtcbiAgICAgIHRoaXMuZHJhZ0VuZGVkLmVtaXQoeyB2YWx1ZTogY2VsbD8ucmF3VmFsdWUgPz8gbnVsbCwgZXZlbnQgfSk7XG4gICAgfSk7XG4gIH07XG5cbiAgLyoqIFRyaWdnZXJlZCBvbiB0b3VjaGVuZCBhbnl3aGVyZS4gUmVzcHNvbnNpYmxlIGZvciBlbmRpbmcgYSBkcmFnIHNlcXVlbmNlLiAqL1xuICBwcml2YXRlIF90b3VjaGVuZEhhbmRsZXIgPSAoZXZlbnQ6IFRvdWNoRXZlbnQpID0+IHtcbiAgICBjb25zdCB0YXJnZXQgPSBnZXRBY3R1YWxUb3VjaFRhcmdldChldmVudCk7XG5cbiAgICBpZiAodGFyZ2V0KSB7XG4gICAgICB0aGlzLl9tb3VzZXVwSGFuZGxlcih7IHRhcmdldCB9IGFzIHVua25vd24gYXMgRXZlbnQpO1xuICAgIH1cbiAgfTtcblxuICAvKiogRmluZHMgdGhlIE1hdENhbGVuZGFyQ2VsbCB0aGF0IGNvcnJlc3BvbmRzIHRvIGEgRE9NIG5vZGUuICovXG4gIHByaXZhdGUgX2dldENlbGxGcm9tRWxlbWVudChlbGVtZW50OiBIVE1MRWxlbWVudCk6IENhbGVuZGFyQ2VsbCB8IG51bGwge1xuICAgIGNvbnN0IGNlbGwgPSBnZXRDZWxsRWxlbWVudChlbGVtZW50KTtcblxuICAgIGlmIChjZWxsKSB7XG4gICAgICBjb25zdCByb3cgPSBjZWxsLmdldEF0dHJpYnV0ZSgnZGF0YS1yb3cnKTtcbiAgICAgIGNvbnN0IGNvbCA9IGNlbGwuZ2V0QXR0cmlidXRlKCdkYXRhLWNvbCcpO1xuXG4gICAgICBpZiAocm93ICYmIGNvbCkge1xuICAgICAgICByZXR1cm4gdGhpcy5yb3dzW3BhcnNlSW50KHJvdyldW3BhcnNlSW50KGNvbCldO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgcHJpdmF0ZSBfaWQgPSBgY2FsZW5kYXItYm9keS0ke2NhbGVuZGFyQm9keUlkKyt9YDtcblxuICBfc3RhcnREYXRlTGFiZWxJZCA9IGAke3RoaXMuX2lkfS1zdGFydC1kYXRlYDtcblxuICBfZW5kRGF0ZUxhYmVsSWQgPSBgJHt0aGlzLl9pZH0tZW5kLWRhdGVgO1xufVxuXG4vKiogQ2hlY2tzIHdoZXRoZXIgYSBub2RlIGlzIGEgdGFibGUgY2VsbCBlbGVtZW50LiAqL1xuZnVuY3Rpb24gaXNUYWJsZUNlbGwobm9kZTogTm9kZSB8IHVuZGVmaW5lZCB8IG51bGwpOiBub2RlIGlzIEhUTUxUYWJsZUNlbGxFbGVtZW50IHtcbiAgcmV0dXJuIG5vZGU/Lm5vZGVOYW1lID09PSAnVEQnO1xufVxuXG4vKipcbiAqIEdldHMgdGhlIGRhdGUgdGFibGUgY2VsbCBlbGVtZW50IHRoYXQgaXMgb3IgY29udGFpbnMgdGhlIHNwZWNpZmllZCBlbGVtZW50LlxuICogT3IgcmV0dXJucyBudWxsIGlmIGVsZW1lbnQgaXMgbm90IHBhcnQgb2YgYSBkYXRlIGNlbGwuXG4gKi9cbmZ1bmN0aW9uIGdldENlbGxFbGVtZW50KGVsZW1lbnQ6IEhUTUxFbGVtZW50KTogSFRNTEVsZW1lbnQgfCBudWxsIHtcbiAgbGV0IGNlbGw6IEhUTUxFbGVtZW50IHwgdW5kZWZpbmVkO1xuICBpZiAoaXNUYWJsZUNlbGwoZWxlbWVudCkpIHtcbiAgICBjZWxsID0gZWxlbWVudDtcbiAgfSBlbHNlIGlmIChpc1RhYmxlQ2VsbChlbGVtZW50LnBhcmVudE5vZGUpKSB7XG4gICAgY2VsbCA9IGVsZW1lbnQucGFyZW50Tm9kZSBhcyBIVE1MRWxlbWVudDtcbiAgfSBlbHNlIGlmIChpc1RhYmxlQ2VsbChlbGVtZW50LnBhcmVudE5vZGU/LnBhcmVudE5vZGUpKSB7XG4gICAgY2VsbCA9IGVsZW1lbnQucGFyZW50Tm9kZSEucGFyZW50Tm9kZSBhcyBIVE1MRWxlbWVudDtcbiAgfVxuXG4gIHJldHVybiBjZWxsPy5nZXRBdHRyaWJ1dGUoJ2RhdGEtcm93JykgIT0gbnVsbCA/IGNlbGwgOiBudWxsO1xufVxuXG4vKiogQ2hlY2tzIHdoZXRoZXIgYSB2YWx1ZSBpcyB0aGUgc3RhcnQgb2YgYSByYW5nZS4gKi9cbmZ1bmN0aW9uIGlzU3RhcnQodmFsdWU6IG51bWJlciwgc3RhcnQ6IG51bWJlciB8IG51bGwsIGVuZDogbnVtYmVyIHwgbnVsbCk6IGJvb2xlYW4ge1xuICByZXR1cm4gZW5kICE9PSBudWxsICYmIHN0YXJ0ICE9PSBlbmQgJiYgdmFsdWUgPCBlbmQgJiYgdmFsdWUgPT09IHN0YXJ0O1xufVxuXG4vKiogQ2hlY2tzIHdoZXRoZXIgYSB2YWx1ZSBpcyB0aGUgZW5kIG9mIGEgcmFuZ2UuICovXG5mdW5jdGlvbiBpc0VuZCh2YWx1ZTogbnVtYmVyLCBzdGFydDogbnVtYmVyIHwgbnVsbCwgZW5kOiBudW1iZXIgfCBudWxsKTogYm9vbGVhbiB7XG4gIHJldHVybiBzdGFydCAhPT0gbnVsbCAmJiBzdGFydCAhPT0gZW5kICYmIHZhbHVlID49IHN0YXJ0ICYmIHZhbHVlID09PSBlbmQ7XG59XG5cbi8qKiBDaGVja3Mgd2hldGhlciBhIHZhbHVlIGlzIGluc2lkZSBvZiBhIHJhbmdlLiAqL1xuZnVuY3Rpb24gaXNJblJhbmdlKFxuICB2YWx1ZTogbnVtYmVyLFxuICBzdGFydDogbnVtYmVyIHwgbnVsbCxcbiAgZW5kOiBudW1iZXIgfCBudWxsLFxuICByYW5nZUVuYWJsZWQ6IGJvb2xlYW5cbik6IGJvb2xlYW4ge1xuICByZXR1cm4gKFxuICAgIHJhbmdlRW5hYmxlZCAmJlxuICAgIHN0YXJ0ICE9PSBudWxsICYmXG4gICAgZW5kICE9PSBudWxsICYmXG4gICAgc3RhcnQgIT09IGVuZCAmJlxuICAgIHZhbHVlID49IHN0YXJ0ICYmXG4gICAgdmFsdWUgPD0gZW5kXG4gICk7XG59XG5cbi8qKlxuICogRXh0cmFjdHMgdGhlIGVsZW1lbnQgdGhhdCBhY3R1YWxseSBjb3JyZXNwb25kcyB0byBhIHRvdWNoIGV2ZW50J3MgbG9jYXRpb25cbiAqIChyYXRoZXIgdGhhbiB0aGUgZWxlbWVudCB0aGF0IGluaXRpYXRlZCB0aGUgc2VxdWVuY2Ugb2YgdG91Y2ggZXZlbnRzKS5cbiAqL1xuZnVuY3Rpb24gZ2V0QWN0dWFsVG91Y2hUYXJnZXQoZXZlbnQ6IFRvdWNoRXZlbnQpOiBFbGVtZW50IHwgbnVsbCB7XG4gIGNvbnN0IHRvdWNoTG9jYXRpb24gPSBldmVudC5jaGFuZ2VkVG91Y2hlc1swXTtcbiAgcmV0dXJuIGRvY3VtZW50LmVsZW1lbnRGcm9tUG9pbnQodG91Y2hMb2NhdGlvbi5jbGllbnRYLCB0b3VjaExvY2F0aW9uLmNsaWVudFkpO1xufVxuIiwiPCEtLSBlc2xpbnQtZGlzYWJsZSBAYW5ndWxhci1lc2xpbnQvdGVtcGxhdGUvbm8tY2FsbC1leHByZXNzaW9uIC0tPlxuPCEtLSBDcmVhdGUgdGhlIGZpcnN0IHJvdyBzZXBhcmF0ZWx5IHNvIHdlIGNhbiBpbmNsdWRlIGEgc3BlY2lhbCBzcGFjZXIgY2VsbC4gLS0+XG5AZm9yIChyb3cgb2Ygcm93czsgdHJhY2sgcm93OyBsZXQgcm93SW5kZXggPSAkaW5kZXgpIHtcbiAgPHRyIHJvbGU9XCJyb3dcIj5cbiAgICA8IS0tXG4gICAgICBUaGlzIGNlbGwgaXMgcHVyZWx5IGRlY29yYXRpdmUsIGJ1dCB3ZSBjYW4ndCBwdXQgYGFyaWEtaGlkZGVuYCBvciBgcm9sZT1cInByZXNlbnRhdGlvblwiYCBvbiBpdCxcbiAgICAgIGJlY2F1c2UgaXQgdGhyb3dzIG9mZiB0aGUgd2VlayBkYXlzIGZvciB0aGUgcmVzdCBvZiB0aGUgcm93IG9uIE5WREEuIFRoZSBhc3BlY3QgcmF0aW8gb2YgdGhlXG4gICAgICB0YWJsZSBjZWxscyBpcyBtYWludGFpbmVkIGJ5IHNldHRpbmcgdGhlIHRvcCBhbmQgYm90dG9tIHBhZGRpbmcgYXMgYSBwZXJjZW50YWdlIG9mIHRoZSB3aWR0aFxuICAgICAgKGEgdmFyaWFudCBvZiB0aGUgdHJpY2sgZGVzY3JpYmVkIGhlcmU6IGh0dHBzOi8vd3d3Lnczc2Nob29scy5jb20vaG93dG8vaG93dG9fY3NzX2FzcGVjdF9yYXRpby5hc3ApLlxuICAgIC0tPlxuICAgIEBpZiAocm93SW5kZXggPT09IDAgJiYgX2ZpcnN0Um93T2Zmc2V0KSB7XG4gICAgICA8dGRcbiAgICAgICAgY2xhc3M9XCJjYWxlbmRhci1ib2R5LWxhYmVsXCJcbiAgICAgICAgW2F0dHIuY29sc3Bhbl09XCJfZmlyc3RSb3dPZmZzZXRcIlxuICAgICAgICBbc3R5bGUucGFkZGluZ1RvcF09XCJfY2VsbFBhZGRpbmdcIlxuICAgICAgICBbc3R5bGUucGFkZGluZ0JvdHRvbV09XCJfY2VsbFBhZGRpbmdcIlxuICAgICAgPjwvdGQ+XG4gICAgfVxuICAgIDwhLS1cbiAgICAgIEVhY2ggZ3JpZGNlbGwgaW4gdGhlIGNhbGVuZGFyIGNvbnRhaW5zIGEgYnV0dG9uLCB3aGljaCBzaWduYWxzIHRvIGFzc2lzdGl2ZSB0ZWNobm9sb2d5IHRoYXQgdGhlXG4gICAgICBjZWxsIGlzIGludHJhY3RhYmxlLCBhcyB3ZWxsIGFzIHRoZSBzZWxlY3Rpb24gc3RhdGUgdmlhIGBhcmlhLXByZXNzZWRgLiBTZWUgIzIzNDc2IGZvclxuICAgICAgYmFja2dyb3VuZC5cbiAgICAtLT5cbiAgICBAZm9yIChpdGVtIG9mIHJvdzsgdHJhY2sgaXRlbTsgbGV0IGNvbEluZGV4ID0gJGluZGV4KSB7XG4gICAgICA8dGRcbiAgICAgICAgcm9sZT1cImdyaWRjZWxsXCJcbiAgICAgICAgY2xhc3M9XCJjYWxlbmRhci1ib2R5LWNlbGwtY29udGFpbmVyXCJcbiAgICAgICAgW3N0eWxlLndpZHRoXT1cIl9jZWxsV2lkdGhcIlxuICAgICAgICBbc3R5bGUucGFkZGluZ1RvcF09XCJfY2VsbFBhZGRpbmdcIlxuICAgICAgICBbc3R5bGUucGFkZGluZ0JvdHRvbV09XCJfY2VsbFBhZGRpbmdcIlxuICAgICAgICBbYXR0ci5kYXRhLXJvd109XCJyb3dJbmRleFwiXG4gICAgICAgIFthdHRyLmRhdGEtY29sXT1cImNvbEluZGV4XCJcbiAgICAgID5cbiAgICAgICAgPGJ1dHRvblxuICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgIGNsYXNzPVwiY2FsZW5kYXItYm9keS1jZWxsXCJcbiAgICAgICAgICBbbmdDbGFzc109XCJpdGVtLmNzc0NsYXNzZXNcIlxuICAgICAgICAgIFt0YWJpbmRleF09XCJfaXNBY3RpdmVDZWxsKHJvd0luZGV4LCBjb2xJbmRleCkgPyAwIDogLTFcIlxuICAgICAgICAgIFtjbGFzcy5jYWxlbmRhci1ib2R5LWRpc2FibGVkXT1cIiFpdGVtLmVuYWJsZWRcIlxuICAgICAgICAgIFtjbGFzcy5jYWxlbmRhci1ib2R5LWFjdGl2ZV09XCJfaXNBY3RpdmVDZWxsKHJvd0luZGV4LCBjb2xJbmRleClcIlxuICAgICAgICAgIFtjbGFzcy5jYWxlbmRhci1ib2R5LXJhbmdlLXN0YXJ0XT1cIl9pc1JhbmdlU3RhcnQoaXRlbS5jb21wYXJlVmFsdWUpXCJcbiAgICAgICAgICBbY2xhc3MuY2FsZW5kYXItYm9keS1yYW5nZS1lbmRdPVwiX2lzUmFuZ2VFbmQoaXRlbS5jb21wYXJlVmFsdWUpXCJcbiAgICAgICAgICBbY2xhc3MuY2FsZW5kYXItYm9keS1pbi1yYW5nZV09XCJfaXNJblJhbmdlKGl0ZW0uY29tcGFyZVZhbHVlKVwiXG4gICAgICAgICAgW2NsYXNzLmNhbGVuZGFyLWJvZHktY29tcGFyaXNvbi1icmlkZ2Utc3RhcnRdPVwiXG4gICAgICAgICAgICBfaXNDb21wYXJpc29uQnJpZGdlU3RhcnQoaXRlbS5jb21wYXJlVmFsdWUsIHJvd0luZGV4LCBjb2xJbmRleClcbiAgICAgICAgICBcIlxuICAgICAgICAgIFtjbGFzcy5jYWxlbmRhci1ib2R5LWNvbXBhcmlzb24tYnJpZGdlLWVuZF09XCJcbiAgICAgICAgICAgIF9pc0NvbXBhcmlzb25CcmlkZ2VFbmQoaXRlbS5jb21wYXJlVmFsdWUsIHJvd0luZGV4LCBjb2xJbmRleClcbiAgICAgICAgICBcIlxuICAgICAgICAgIFtjbGFzcy5jYWxlbmRhci1ib2R5LWNvbXBhcmlzb24tc3RhcnRdPVwiX2lzQ29tcGFyaXNvblN0YXJ0KGl0ZW0uY29tcGFyZVZhbHVlKVwiXG4gICAgICAgICAgW2NsYXNzLmNhbGVuZGFyLWJvZHktY29tcGFyaXNvbi1lbmRdPVwiX2lzQ29tcGFyaXNvbkVuZChpdGVtLmNvbXBhcmVWYWx1ZSlcIlxuICAgICAgICAgIFtjbGFzcy5jYWxlbmRhci1ib2R5LWluLWNvbXBhcmlzb24tcmFuZ2VdPVwiX2lzSW5Db21wYXJpc29uUmFuZ2UoaXRlbS5jb21wYXJlVmFsdWUpXCJcbiAgICAgICAgICBbY2xhc3MuY2FsZW5kYXItYm9keS1wcmV2aWV3LXN0YXJ0XT1cIl9pc1ByZXZpZXdTdGFydChpdGVtLmNvbXBhcmVWYWx1ZSlcIlxuICAgICAgICAgIFtjbGFzcy5jYWxlbmRhci1ib2R5LXByZXZpZXctZW5kXT1cIl9pc1ByZXZpZXdFbmQoaXRlbS5jb21wYXJlVmFsdWUpXCJcbiAgICAgICAgICBbY2xhc3MuY2FsZW5kYXItYm9keS1pbi1wcmV2aWV3XT1cIl9pc0luUHJldmlldyhpdGVtLmNvbXBhcmVWYWx1ZSlcIlxuICAgICAgICAgIFthdHRyLmFyaWEtbGFiZWxdPVwiaXRlbS5hcmlhTGFiZWxcIlxuICAgICAgICAgIFthdHRyLmFyaWEtZGlzYWJsZWRdPVwiIWl0ZW0uZW5hYmxlZCB8fCBudWxsXCJcbiAgICAgICAgICBbYXR0ci5hcmlhLXByZXNzZWRdPVwiX2lzU2VsZWN0ZWQoaXRlbS5jb21wYXJlVmFsdWUpXCJcbiAgICAgICAgICBbYXR0ci5hcmlhLWN1cnJlbnRdPVwidG9kYXlWYWx1ZSA9PT0gaXRlbS5jb21wYXJlVmFsdWUgPyAnZGF0ZScgOiBudWxsXCJcbiAgICAgICAgICBbYXR0ci5hcmlhLWRlc2NyaWJlZGJ5XT1cIl9nZXREZXNjcmliZWRieShpdGVtLmNvbXBhcmVWYWx1ZSlcIlxuICAgICAgICAgIChjbGljayk9XCJfY2VsbENsaWNrZWQoaXRlbSwgJGV2ZW50KVwiXG4gICAgICAgICAgKGZvY3VzKT1cIl9lbWl0QWN0aXZlRGF0ZUNoYW5nZShpdGVtLCAkZXZlbnQpXCJcbiAgICAgICAgPlxuICAgICAgICAgIDxzcGFuXG4gICAgICAgICAgICBjbGFzcz1cImNhbGVuZGFyLWJvZHktY2VsbC1jb250ZW50IGZvY3VzLWluZGljYXRvclwiXG4gICAgICAgICAgICBbY2xhc3MuY2FsZW5kYXItYm9keS1zZWxlY3RlZF09XCJfaXNTZWxlY3RlZChpdGVtLmNvbXBhcmVWYWx1ZSlcIlxuICAgICAgICAgICAgW2NsYXNzLmNhbGVuZGFyLWJvZHktY29tcGFyaXNvbi1pZGVudGljYWxdPVwiX2lzQ29tcGFyaXNvbklkZW50aWNhbChpdGVtLmNvbXBhcmVWYWx1ZSlcIlxuICAgICAgICAgICAgW2NsYXNzLmNhbGVuZGFyLWJvZHktdG9kYXldPVwidG9kYXlWYWx1ZSA9PT0gaXRlbS5jb21wYXJlVmFsdWVcIlxuICAgICAgICAgID5cbiAgICAgICAgICAgIHt7IGl0ZW0uZGlzcGxheVZhbHVlIH19XG4gICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgIDxzcGFuXG4gICAgICAgICAgICBjbGFzcz1cImNhbGVuZGFyLWJvZHktY2VsbC1wcmV2aWV3XCJcbiAgICAgICAgICAgIGFyaWEtaGlkZGVuPVwidHJ1ZVwiXG4gICAgICAgICAgPjwvc3Bhbj5cbiAgICAgICAgPC9idXR0b24+XG4gICAgICA8L3RkPlxuICAgIH1cbiAgPC90cj5cbn1cblxuPGxhYmVsXG4gIGNsYXNzPVwiY2FsZW5kYXItYm9keS1oaWRkZW4tbGFiZWxcIlxuICBmb3I9XCJcIlxuICBbaWRdPVwiX3N0YXJ0RGF0ZUxhYmVsSWRcIlxuPlxuICB7eyBzdGFydERhdGVBY2Nlc3NpYmxlTmFtZSB9fVxuPC9sYWJlbD5cblxuPGxhYmVsXG4gIGNsYXNzPVwiY2FsZW5kYXItYm9keS1oaWRkZW4tbGFiZWxcIlxuICBmb3I9XCJcIlxuICBbaWRdPVwiX2VuZERhdGVMYWJlbElkXCJcbj5cbiAge3sgZW5kRGF0ZUFjY2Vzc2libGVOYW1lIH19XG48L2xhYmVsPlxuIl19