import * as i3 from '@angular/cdk/bidi';
import { coerceStringArray } from '@angular/cdk/coercion';
import {
  DOWN_ARROW,
  ESCAPE,
  hasModifierKey,
  LEFT_ARROW,
  PAGE_DOWN,
  PAGE_UP,
  RIGHT_ARROW,
  UP_ARROW,
} from '@angular/cdk/keycodes';
import * as i1 from '@angular/cdk/overlay';
import { FlexibleConnectedPositionStrategy, Overlay, OverlayConfig } from '@angular/cdk/overlay';
import { _getFocusedElementPierceShadowDom } from '@angular/cdk/platform';
import { ComponentPortal } from '@angular/cdk/portal';
import { DOCUMENT } from '@angular/common';
import * as i0 from '@angular/core';
import {
  booleanAttribute,
  Directive,
  EventEmitter,
  Inject,
  inject,
  InjectionToken,
  Input,
  Optional,
  Output,
} from '@angular/core';
import { merge, Subject, Subscription } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import * as i2 from '../adapter/date-adapter';
import { createMissingDateImplError } from '../utils/errors';
import * as i4 from './date-selection-model';
import { DatepickerContent } from './datepicker-content';
/** Used to generate a unique ID for each datepicker instance. */
let datepickerUid = 0;
/** Injection token that determines the scroll handling while the calendar is open. */
export const DATEPICKER_SCROLL_STRATEGY = new InjectionToken('datepicker-scroll-strategy', {
  providedIn: 'root',
  factory: () => {
    const overlay = inject(Overlay);
    return () => overlay.scrollStrategies.reposition();
  },
});
/** @docs-private */
export function DATEPICKER_SCROLL_STRATEGY_FACTORY(overlay) {
  return () => overlay.scrollStrategies.reposition();
}
/** @docs-private */
export const DATEPICKER_SCROLL_STRATEGY_FACTORY_PROVIDER = {
  provide: DATEPICKER_SCROLL_STRATEGY,
  deps: [Overlay],
  useFactory: DATEPICKER_SCROLL_STRATEGY_FACTORY,
};
/** Base class for a datepicker. */
export class DatepickerBase {
  _overlay;
  _ngZone;
  _viewContainerRef;
  _dateAdapter;
  _dir;
  _model;
  _scrollStrategy;
  _inputStateChanges = Subscription.EMPTY;
  _document = inject(DOCUMENT);
  /** An input indicating the type of the custom header component for the calendar, if set. */
  calendarHeaderComponent;
  /** The date to open the calendar to initially. */
  get startAt() {
    // If an explicit startAt is set we start there, otherwise we start at whatever the currently
    // selected value is.
    return this._startAt || (this.datepickerInput ? this.datepickerInput.getStartValue() : null);
  }
  set startAt(value) {
    this._startAt = this._dateAdapter.getValidDateOrNull(this._dateAdapter.deserialize(value));
  }
  _startAt;
  /** The view that the calendar should start in. */
  startView = 'month';
  /**
   * Whether the calendar UI is in touch mode. In touch mode the calendar opens in a dialog rather
   * than a dropdown and elements have more padding to allow for bigger touch targets.
   */
  touchUi = false;
  /** Whether the datepicker pop-up should be disabled. */
  get disabled() {
    return this._disabled === undefined && this.datepickerInput
      ? this.datepickerInput.disabled
      : !!this._disabled;
  }
  set disabled(value) {
    if (value !== this._disabled) {
      this._disabled = value;
      this.stateChanges.next(undefined);
    }
  }
  _disabled;
  /** Preferred position of the datepicker in the X axis. */
  xPosition = 'start';
  /** Preferred position of the datepicker in the Y axis. */
  yPosition = 'below';
  /**
   * Whether to restore focus to the previously-focused element when the calendar is closed.
   * Note that automatic focus restoration is an accessibility feature and it is recommended that
   * you provide your own equivalent, if you decide to turn it off.
   */
  restoreFocus = true;
  /**
   * Emits selected year in multiyear view.
   * This doesn't imply a change on the selected date.
   */
  yearSelected = new EventEmitter();
  /**
   * Emits selected month in year view.
   * This doesn't imply a change on the selected date.
   */
  monthSelected = new EventEmitter();
  /**
   * Emits when the current view changes.
   */
  viewChanged = new EventEmitter(true);
  /** Function that can be used to add custom CSS classes to dates. */
  dateClass;
  /** Emits when the datepicker has been opened. */
  openedStream = new EventEmitter();
  /** Emits when the datepicker has been closed. */
  closedStream = new EventEmitter();
  /**
   * Classes to be passed to the date picker panel.
   * Supports string and string array values, similar to `ngClass`.
   */
  get panelClass() {
    return this._panelClass;
  }
  set panelClass(value) {
    this._panelClass = coerceStringArray(value);
  }
  _panelClass;
  /** Whether the calendar is open. */
  get opened() {
    return this._opened;
  }
  set opened(value) {
    if (value) {
      this.open();
    } else {
      this.close();
    }
  }
  _opened = false;
  /** The id for the datepicker calendar. */
  id = `datepicker-${datepickerUid++}`;
  /** The minimum selectable date. */
  _getMinDate() {
    return this.datepickerInput && this.datepickerInput.min;
  }
  /** The maximum selectable date. */
  _getMaxDate() {
    return this.datepickerInput && this.datepickerInput.max;
  }
  _getDateFilter() {
    return this.datepickerInput && this.datepickerInput.dateFilter;
  }
  /** A reference to the overlay into which we've rendered the calendar. */
  _overlayRef;
  /** Reference to the component instance rendered in the overlay. */
  _componentRef;
  /** The element that was focused before the datepicker was opened. */
  _focusedElementBeforeOpen = null;
  /** Unique class that will be added to the backdrop so that the test harnesses can look it up. */
  _backdropHarnessClass = `${this.id}-backdrop`;
  /** The input element this datepicker is associated with. */
  datepickerInput;
  /** Emits when the datepicker's state changes. */
  stateChanges = new Subject();
  constructor(_overlay, _ngZone, _viewContainerRef, scrollStrategy, _dateAdapter, _dir, _model) {
    this._overlay = _overlay;
    this._ngZone = _ngZone;
    this._viewContainerRef = _viewContainerRef;
    this._dateAdapter = _dateAdapter;
    this._dir = _dir;
    this._model = _model;
    if (!this._dateAdapter) {
      throw createMissingDateImplError('DateAdapter');
    }
    this._scrollStrategy = scrollStrategy;
  }
  ngOnChanges(changes) {
    const positionChange = changes['xPosition'] || changes['yPosition'];
    if (positionChange && !positionChange.firstChange && this._overlayRef) {
      const positionStrategy = this._overlayRef.getConfig().positionStrategy;
      if (positionStrategy instanceof FlexibleConnectedPositionStrategy) {
        this._setConnectedPositions(positionStrategy);
        if (this.opened) {
          this._overlayRef.updatePosition();
        }
      }
    }
    this.stateChanges.next(undefined);
  }
  ngOnDestroy() {
    this._destroyOverlay();
    this.close();
    this._inputStateChanges.unsubscribe();
    this.stateChanges.complete();
  }
  /** Selects the given date */
  select(date) {
    this._model.add(date);
  }
  /** Emits the selected year in multiyear view */
  _selectYear(normalizedYear) {
    this.yearSelected.emit(normalizedYear);
  }
  /** Emits selected month in year view */
  _selectMonth(normalizedMonth) {
    this.monthSelected.emit(normalizedMonth);
  }
  /** Emits changed view */
  _viewChanged(view) {
    this.viewChanged.emit(view);
  }
  /**
   * Register an input with this datepicker.
   * @param input The datepicker input to register with this datepicker.
   * @returns Selection model that the input should hook itself up to.
   */
  registerInput(input) {
    if (this.datepickerInput) {
      throw Error('A Datepicker can only be associated with a single input.');
    }
    this._inputStateChanges.unsubscribe();
    this.datepickerInput = input;
    this._inputStateChanges = input.stateChanges.subscribe(() => this.stateChanges.next(undefined));
    return this._model;
  }
  /** Open the calendar. */
  open() {
    // Skip reopening if there's an in-progress animation to avoid overlapping
    // sequences which can cause "changed after checked" errors. See #25837.
    if (this._opened || this.disabled || this._componentRef?.instance._isAnimating) {
      return;
    }
    if (!this.datepickerInput) {
      throw Error('Attempted to open an Datepicker with no associated input.');
    }
    this._focusedElementBeforeOpen = _getFocusedElementPierceShadowDom();
    this._openOverlay();
    this._opened = true;
    this.openedStream.emit();
  }
  /** Close the calendar. */
  close() {
    // Skip reopening if there's an in-progress animation to avoid overlapping
    // sequences which can cause "changed after checked" errors. See #25837.
    if (!this._opened || this._componentRef?.instance._isAnimating) {
      return;
    }
    const canRestoreFocus =
      this.restoreFocus &&
      this._focusedElementBeforeOpen &&
      typeof this._focusedElementBeforeOpen.focus === 'function';
    const completeClose = () => {
      // The `_opened` could've been reset already if
      // we got two events in quick succession.
      if (this._opened) {
        this._opened = false;
        this.closedStream.emit();
      }
    };
    if (this._componentRef) {
      const { instance, location } = this._componentRef;
      instance._startExitAnimation();
      instance._animationDone.pipe(take(1)).subscribe(() => {
        const activeElement = this._document.activeElement;
        // Since we restore focus after the exit animation, we have to check that
        // the user didn't move focus themselves inside the `close` handler.
        if (
          canRestoreFocus &&
          (!activeElement ||
            activeElement === this._document.activeElement ||
            location.nativeElement.contains(activeElement))
        ) {
          this._focusedElementBeforeOpen.focus();
        }
        this._focusedElementBeforeOpen = null;
        this._destroyOverlay();
      });
    }
    if (canRestoreFocus) {
      // Because IE moves focus asynchronously, we can't count on it being restored before we've
      // marked the datepicker as closed. If the event fires out of sequence and the element that
      // we're refocusing opens the datepicker on focus, the user could be stuck with not being
      // able to close the calendar at all. We work around it by making the logic, that marks
      // the datepicker as closed, async as well.
      setTimeout(completeClose);
    } else {
      completeClose();
    }
  }
  apply() {
    this._applyPendingSelection();
    this.close();
  }
  /** Applies the current pending selection on the overlay to the model. */
  _applyPendingSelection() {
    this._componentRef?.instance?._applyPendingSelection();
  }
  /** Forwards relevant values from the datepicker to the datepicker content inside the overlay. */
  _forwardContentValues(instance) {
    instance.datepicker = this;
    instance._dialogLabelId = this.datepickerInput.getOverlayLabelId();
    instance._assignModel(false);
  }
  /** Opens the overlay with the calendar. */
  _openOverlay() {
    this._destroyOverlay();
    const isDialog = this.touchUi;
    const portal = new ComponentPortal(DatepickerContent, this._viewContainerRef);
    const overlayRef = (this._overlayRef = this._overlay.create(
      new OverlayConfig({
        positionStrategy: isDialog ? this._getDialogStrategy() : this._getDropdownStrategy(),
        hasBackdrop: true,
        backdropClass: [
          isDialog ? 'cdk-overlay-dark-backdrop' : 'overlay-transparent-backdrop',
          this._backdropHarnessClass,
        ],
        direction: this._dir,
        scrollStrategy: isDialog ? this._overlay.scrollStrategies.block() : this._scrollStrategy(),
        panelClass: `datepicker-${isDialog ? 'dialog' : 'popup'}`,
      })
    ));
    this._getCloseStream(overlayRef).subscribe((event) => {
      if (event) {
        event.preventDefault();
      }
      this.close();
    });
    // The `preventDefault` call happens inside the calendar as well, however focus moves into
    // it inside a timeout which can give browsers a chance to fire off a keyboard event in-between
    // that can scroll the page (see #24969). Always block default actions of arrow keys for the
    // entire overlay so the page doesn't get scrolled by accident.
    overlayRef.keydownEvents().subscribe((event) => {
      const keyCode = event.keyCode;
      if (
        keyCode === UP_ARROW ||
        keyCode === DOWN_ARROW ||
        keyCode === LEFT_ARROW ||
        keyCode === RIGHT_ARROW ||
        keyCode === PAGE_UP ||
        keyCode === PAGE_DOWN
      ) {
        event.preventDefault();
      }
    });
    this._componentRef = overlayRef.attach(portal);
    this._forwardContentValues(this._componentRef.instance);
    // Update the position once the calendar has rendered. Only relevant in dropdown mode.
    if (!isDialog) {
      this._ngZone.onStable.pipe(take(1)).subscribe(() => overlayRef.updatePosition());
    }
  }
  /** Destroys the current overlay. */
  _destroyOverlay() {
    if (this._overlayRef) {
      this._overlayRef.dispose();
      this._overlayRef = this._componentRef = null;
    }
  }
  /** Gets a position strategy that will open the calendar as a dropdown. */
  _getDialogStrategy() {
    return this._overlay.position().global().centerHorizontally().centerVertically();
  }
  /** Gets a position strategy that will open the calendar as a dropdown. */
  _getDropdownStrategy() {
    const strategy = this._overlay
      .position()
      .flexibleConnectedTo(this.datepickerInput.getConnectedOverlayOrigin())
      .withTransformOriginOn('.datepicker-content')
      .withFlexibleDimensions(false)
      .withViewportMargin(8)
      .withLockedPosition();
    return this._setConnectedPositions(strategy);
  }
  /** Sets the positions of the datepicker in dropdown mode based on the current configuration. */
  _setConnectedPositions(strategy) {
    const primaryX = this.xPosition === 'end' ? 'end' : 'start';
    const secondaryX = primaryX === 'start' ? 'end' : 'start';
    const primaryY = this.yPosition === 'above' ? 'bottom' : 'top';
    const secondaryY = primaryY === 'top' ? 'bottom' : 'top';
    return strategy.withPositions([
      {
        originX: primaryX,
        originY: secondaryY,
        overlayX: primaryX,
        overlayY: primaryY,
      },
      {
        originX: primaryX,
        originY: primaryY,
        overlayX: primaryX,
        overlayY: secondaryY,
      },
      {
        originX: secondaryX,
        originY: secondaryY,
        overlayX: secondaryX,
        overlayY: primaryY,
      },
      {
        originX: secondaryX,
        originY: primaryY,
        overlayX: secondaryX,
        overlayY: secondaryY,
      },
    ]);
  }
  /** Gets an observable that will emit when the overlay is supposed to be closed. */
  _getCloseStream(overlayRef) {
    const ctrlShiftMetaModifiers = ['ctrlKey', 'shiftKey', 'metaKey'];
    return merge(
      overlayRef.backdropClick(),
      overlayRef.detachments(),
      overlayRef.keydownEvents().pipe(
        filter((event) => {
          // Closing on alt + up is only valid when there's an input associated with the datepicker.
          return (
            (event.keyCode === ESCAPE && !hasModifierKey(event)) ||
            (this.datepickerInput &&
              hasModifierKey(event, 'altKey') &&
              event.keyCode === UP_ARROW &&
              ctrlShiftMetaModifiers.every((modifier) => !hasModifierKey(event, modifier)))
          );
        })
      )
    );
  }
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: '12.0.0',
    version: '18.2.13',
    ngImport: i0,
    type: DatepickerBase,
    deps: [
      { token: i1.Overlay },
      { token: i0.NgZone },
      { token: i0.ViewContainerRef },
      { token: DATEPICKER_SCROLL_STRATEGY },
      { token: i2.DateAdapter, optional: true },
      { token: i3.Directionality, optional: true },
      { token: i4.DateSelectionModel },
    ],
    target: i0.ɵɵFactoryTarget.Directive,
  });
  static ɵdir = i0.ɵɵngDeclareDirective({
    minVersion: '16.1.0',
    version: '18.2.13',
    type: DatepickerBase,
    inputs: {
      calendarHeaderComponent: 'calendarHeaderComponent',
      startAt: 'startAt',
      startView: 'startView',
      touchUi: ['touchUi', 'touchUi', booleanAttribute],
      disabled: ['disabled', 'disabled', booleanAttribute],
      xPosition: 'xPosition',
      yPosition: 'yPosition',
      restoreFocus: ['restoreFocus', 'restoreFocus', booleanAttribute],
      dateClass: 'dateClass',
      panelClass: 'panelClass',
      opened: ['opened', 'opened', booleanAttribute],
    },
    outputs: {
      yearSelected: 'yearSelected',
      monthSelected: 'monthSelected',
      viewChanged: 'viewChanged',
      openedStream: 'opened',
      closedStream: 'closed',
    },
    usesOnChanges: true,
    ngImport: i0,
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: '12.0.0',
  version: '18.2.13',
  ngImport: i0,
  type: DatepickerBase,
  decorators: [
    {
      type: Directive,
    },
  ],
  ctorParameters: () => [
    { type: i1.Overlay },
    { type: i0.NgZone },
    { type: i0.ViewContainerRef },
    {
      type: undefined,
      decorators: [
        {
          type: Inject,
          args: [DATEPICKER_SCROLL_STRATEGY],
        },
      ],
    },
    {
      type: i2.DateAdapter,
      decorators: [
        {
          type: Optional,
        },
      ],
    },
    {
      type: i3.Directionality,
      decorators: [
        {
          type: Optional,
        },
      ],
    },
    { type: i4.DateSelectionModel },
  ],
  propDecorators: {
    calendarHeaderComponent: [
      {
        type: Input,
      },
    ],
    startAt: [
      {
        type: Input,
      },
    ],
    startView: [
      {
        type: Input,
      },
    ],
    touchUi: [
      {
        type: Input,
        args: [{ transform: booleanAttribute }],
      },
    ],
    disabled: [
      {
        type: Input,
        args: [{ transform: booleanAttribute }],
      },
    ],
    xPosition: [
      {
        type: Input,
      },
    ],
    yPosition: [
      {
        type: Input,
      },
    ],
    restoreFocus: [
      {
        type: Input,
        args: [{ transform: booleanAttribute }],
      },
    ],
    yearSelected: [
      {
        type: Output,
      },
    ],
    monthSelected: [
      {
        type: Output,
      },
    ],
    viewChanged: [
      {
        type: Output,
      },
    ],
    dateClass: [
      {
        type: Input,
      },
    ],
    openedStream: [
      {
        type: Output,
        args: ['opened'],
      },
    ],
    closedStream: [
      {
        type: Output,
        args: ['closed'],
      },
    ],
    panelClass: [
      {
        type: Input,
      },
    ],
    opened: [
      {
        type: Input,
        args: [{ transform: booleanAttribute }],
      },
    ],
  },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZXBpY2tlci1iYXNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vbGlicy9kYXRlLXBpY2tlci9zcmMvbGliL2RhdGUtcGlja2VyL2RhdGVwaWNrZXItYmFzZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFVQSxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUMxRCxPQUFPLEVBQUUsaUNBQWlDLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUUxRSxPQUFPLEVBQ0wsVUFBVSxFQUNWLE1BQU0sRUFDTixjQUFjLEVBQ2QsVUFBVSxFQUVWLFNBQVMsRUFDVCxPQUFPLEVBQ1AsV0FBVyxFQUNYLFFBQVEsR0FDVCxNQUFNLHVCQUF1QixDQUFDO0FBQy9CLE9BQU8sRUFDTCxPQUFPLEVBQ1AsYUFBYSxFQUdiLGlDQUFpQyxHQUNsQyxNQUFNLHNCQUFzQixDQUFDO0FBQzlCLE9BQU8sRUFBRSxlQUFlLEVBQWlCLE1BQU0scUJBQXFCLENBQUM7QUFFckUsT0FBTyxFQUdMLFlBQVksRUFDWixNQUFNLEVBQ04sY0FBYyxFQUNkLEtBQUssRUFHTCxRQUFRLEVBQ1IsTUFBTSxFQUVOLFNBQVMsRUFHVCxNQUFNLEVBQ04sZ0JBQWdCLEdBQ2pCLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUUzQyxPQUFPLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBYyxZQUFZLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDaEUsT0FBTyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQU85QyxPQUFPLEVBQUUsMEJBQTBCLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQU03RCxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQzs7Ozs7O0FBRXpELGlFQUFpRTtBQUNqRSxJQUFJLGFBQWEsR0FBRyxDQUFDLENBQUM7QUFF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QUEvQixNQUFNO2dCQUtZLFdBQVc7c0JBQTdCLE1BQU07Z0JBR0UsU0FBUztzQkFBakIsS0FBSztnQkFHcUIsWUFBWTtzQkFBdEMsTUFBTTt1QkFBQyxRQUFRO2dCQUdXLFlBQVk7c0JBQXRDLE1BQU07dUJBQUMsUUFBUTtnQkFPWixVQUFVO3NCQURiLEtBQUs7Z0JBV0YsTUFBTTtzQkFEVCxLQUFLO3VCQUFDLEVBQUUsU0FBUyxFQUFFLGdCQUFnQixFQUFFIiwic291cmNlc0NvbnRlbnQiOlsiLyogZXNsaW50LWRpc2FibGUgQGFuZ3VsYXItZXNsaW50L25vLW91dHB1dC1yZW5hbWUgKi9cbi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgeyBEaXJlY3Rpb25hbGl0eSB9IGZyb20gJ0Bhbmd1bGFyL2Nkay9iaWRpJztcbmltcG9ydCB7IGNvZXJjZVN0cmluZ0FycmF5IH0gZnJvbSAnQGFuZ3VsYXIvY2RrL2NvZXJjaW9uJztcbmltcG9ydCB7IF9nZXRGb2N1c2VkRWxlbWVudFBpZXJjZVNoYWRvd0RvbSB9IGZyb20gJ0Bhbmd1bGFyL2Nkay9wbGF0Zm9ybSc7XG5cbmltcG9ydCB7XG4gIERPV05fQVJST1csXG4gIEVTQ0FQRSxcbiAgaGFzTW9kaWZpZXJLZXksXG4gIExFRlRfQVJST1csXG4gIE1vZGlmaWVyS2V5LFxuICBQQUdFX0RPV04sXG4gIFBBR0VfVVAsXG4gIFJJR0hUX0FSUk9XLFxuICBVUF9BUlJPVyxcbn0gZnJvbSAnQGFuZ3VsYXIvY2RrL2tleWNvZGVzJztcbmltcG9ydCB7XG4gIE92ZXJsYXksXG4gIE92ZXJsYXlDb25maWcsXG4gIE92ZXJsYXlSZWYsXG4gIFNjcm9sbFN0cmF0ZWd5LFxuICBGbGV4aWJsZUNvbm5lY3RlZFBvc2l0aW9uU3RyYXRlZ3ksXG59IGZyb20gJ0Bhbmd1bGFyL2Nkay9vdmVybGF5JztcbmltcG9ydCB7IENvbXBvbmVudFBvcnRhbCwgQ29tcG9uZW50VHlwZSB9IGZyb20gJ0Bhbmd1bGFyL2Nkay9wb3J0YWwnO1xuXG5pbXBvcnQge1xuICBDb21wb25lbnRSZWYsXG4gIEVsZW1lbnRSZWYsXG4gIEV2ZW50RW1pdHRlcixcbiAgSW5qZWN0LFxuICBJbmplY3Rpb25Ub2tlbixcbiAgSW5wdXQsXG4gIE5nWm9uZSxcbiAgT25EZXN0cm95LFxuICBPcHRpb25hbCxcbiAgT3V0cHV0LFxuICBWaWV3Q29udGFpbmVyUmVmLFxuICBEaXJlY3RpdmUsXG4gIE9uQ2hhbmdlcyxcbiAgU2ltcGxlQ2hhbmdlcyxcbiAgaW5qZWN0LFxuICBib29sZWFuQXR0cmlidXRlLFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IERPQ1VNRU5UIH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcblxuaW1wb3J0IHsgbWVyZ2UsIFN1YmplY3QsIE9ic2VydmFibGUsIFN1YnNjcmlwdGlvbiB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgZmlsdGVyLCB0YWtlIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuXG5pbXBvcnQgeyBEYXRlQWRhcHRlciB9IGZyb20gJy4uL2FkYXB0ZXIvZGF0ZS1hZGFwdGVyJztcbmltcG9ydCB7IENhbGVuZGFyVmlldyB9IGZyb20gJy4uL2NhbGVuZGFyL2NhbGVuZGFyJztcbmltcG9ydCB7IENhbGVuZGFyQ2VsbENsYXNzRnVuY3Rpb24gfSBmcm9tICcuLi9jYWxlbmRhci9jYWxlbmRhci1ib2R5JztcblxuaW1wb3J0IHsgRGF0ZUZpbHRlckZuIH0gZnJvbSAnLi9kYXRlcGlja2VyLWlucHV0LWJhc2UnO1xuaW1wb3J0IHsgY3JlYXRlTWlzc2luZ0RhdGVJbXBsRXJyb3IgfSBmcm9tICcuLi91dGlscy9lcnJvcnMnO1xuaW1wb3J0IHtcbiAgRXh0cmFjdERhdGVUeXBlRnJvbVNlbGVjdGlvbixcbiAgRGF0ZVNlbGVjdGlvbk1vZGVsLFxuICBEYXRlUmFuZ2UsXG59IGZyb20gJy4vZGF0ZS1zZWxlY3Rpb24tbW9kZWwnO1xuaW1wb3J0IHsgRGF0ZXBpY2tlckNvbnRlbnQgfSBmcm9tICcuL2RhdGVwaWNrZXItY29udGVudCc7XG5cbi8qKiBVc2VkIHRvIGdlbmVyYXRlIGEgdW5pcXVlIElEIGZvciBlYWNoIGRhdGVwaWNrZXIgaW5zdGFuY2UuICovXG5sZXQgZGF0ZXBpY2tlclVpZCA9IDA7XG5cbi8qKiBJbmplY3Rpb24gdG9rZW4gdGhhdCBkZXRlcm1pbmVzIHRoZSBzY3JvbGwgaGFuZGxpbmcgd2hpbGUgdGhlIGNhbGVuZGFyIGlzIG9wZW4uICovXG5leHBvcnQgY29uc3QgREFURVBJQ0tFUl9TQ1JPTExfU1RSQVRFR1kgPSBuZXcgSW5qZWN0aW9uVG9rZW48KCkgPT4gU2Nyb2xsU3RyYXRlZ3k+KFxuICAnZGF0ZXBpY2tlci1zY3JvbGwtc3RyYXRlZ3knLFxuICB7XG4gICAgcHJvdmlkZWRJbjogJ3Jvb3QnLFxuICAgIGZhY3Rvcnk6ICgpID0+IHtcbiAgICAgIGNvbnN0IG92ZXJsYXkgPSBpbmplY3QoT3ZlcmxheSk7XG4gICAgICByZXR1cm4gKCkgPT4gb3ZlcmxheS5zY3JvbGxTdHJhdGVnaWVzLnJlcG9zaXRpb24oKTtcbiAgICB9LFxuICB9XG4pO1xuXG4vKiogQGRvY3MtcHJpdmF0ZSAqL1xuZXhwb3J0IGZ1bmN0aW9uIERBVEVQSUNLRVJfU0NST0xMX1NUUkFURUdZX0ZBQ1RPUlkob3ZlcmxheTogT3ZlcmxheSk6ICgpID0+IFNjcm9sbFN0cmF0ZWd5IHtcbiAgcmV0dXJuICgpID0+IG92ZXJsYXkuc2Nyb2xsU3RyYXRlZ2llcy5yZXBvc2l0aW9uKCk7XG59XG5cbi8qKiBQb3NzaWJsZSBwb3NpdGlvbnMgZm9yIHRoZSBkYXRlcGlja2VyIGRyb3Bkb3duIGFsb25nIHRoZSBYIGF4aXMuICovXG5leHBvcnQgdHlwZSBEYXRlcGlja2VyRHJvcGRvd25Qb3NpdGlvblggPSAnc3RhcnQnIHwgJ2VuZCc7XG5cbi8qKiBQb3NzaWJsZSBwb3NpdGlvbnMgZm9yIHRoZSBkYXRlcGlja2VyIGRyb3Bkb3duIGFsb25nIHRoZSBZIGF4aXMuICovXG5leHBvcnQgdHlwZSBEYXRlcGlja2VyRHJvcGRvd25Qb3NpdGlvblkgPSAnYWJvdmUnIHwgJ2JlbG93JztcblxuLyoqIEBkb2NzLXByaXZhdGUgKi9cbmV4cG9ydCBjb25zdCBEQVRFUElDS0VSX1NDUk9MTF9TVFJBVEVHWV9GQUNUT1JZX1BST1ZJREVSID0ge1xuICBwcm92aWRlOiBEQVRFUElDS0VSX1NDUk9MTF9TVFJBVEVHWSxcbiAgZGVwczogW092ZXJsYXldLFxuICB1c2VGYWN0b3J5OiBEQVRFUElDS0VSX1NDUk9MTF9TVFJBVEVHWV9GQUNUT1JZLFxufTtcblxuLyoqIEZvcm0gY29udHJvbCB0aGF0IGNhbiBiZSBhc3NvY2lhdGVkIHdpdGggYSBkYXRlcGlja2VyLiAqL1xuZXhwb3J0IGludGVyZmFjZSBEYXRlcGlja2VyQ29udHJvbDxEPiB7XG4gIGdldFN0YXJ0VmFsdWUoKTogRCB8IG51bGw7XG4gIG1pbjogRCB8IG51bGw7XG4gIG1heDogRCB8IG51bGw7XG4gIGRpc2FibGVkOiBib29sZWFuO1xuICBkYXRlRmlsdGVyOiBEYXRlRmlsdGVyRm48RD47XG4gIGdldENvbm5lY3RlZE92ZXJsYXlPcmlnaW4oKTogRWxlbWVudFJlZjtcbiAgZ2V0T3ZlcmxheUxhYmVsSWQoKTogc3RyaW5nIHwgbnVsbDtcbiAgc3RhdGVDaGFuZ2VzOiBPYnNlcnZhYmxlPHZvaWQ+O1xufVxuXG4vKiogQSBkYXRlcGlja2VyIHRoYXQgY2FuIGJlIGF0dGFjaGVkIHRvIGEge0BsaW5rIERhdGVwaWNrZXJDb250cm9sfS4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgRGF0ZXBpY2tlclBhbmVsPFxuICBDIGV4dGVuZHMgRGF0ZXBpY2tlckNvbnRyb2w8RD4sXG4gIFMsXG4gIEQgPSBFeHRyYWN0RGF0ZVR5cGVGcm9tU2VsZWN0aW9uPFM+LFxuPiB7XG4gIC8qKiBTdHJlYW0gdGhhdCBlbWl0cyB3aGVuZXZlciB0aGUgZGF0ZSBwaWNrZXIgaXMgY2xvc2VkLiAqL1xuICBjbG9zZWRTdHJlYW06IEV2ZW50RW1pdHRlcjx2b2lkPjtcbiAgLyoqIFRoZSBpbnB1dCBlbGVtZW50IHRoZSBkYXRlcGlja2VyIGlzIGFzc29jaWF0ZWQgd2l0aC4gKi9cbiAgZGF0ZXBpY2tlcklucHV0OiBDO1xuICAvKiogV2hldGhlciB0aGUgZGF0ZXBpY2tlciBwb3AtdXAgc2hvdWxkIGJlIGRpc2FibGVkLiAqL1xuICBkaXNhYmxlZDogYm9vbGVhbjtcbiAgLyoqIFRoZSBpZCBmb3IgdGhlIGRhdGVwaWNrZXIncyBjYWxlbmRhci4gKi9cbiAgaWQ6IHN0cmluZztcbiAgLyoqIFdoZXRoZXIgdGhlIGRhdGVwaWNrZXIgaXMgb3Blbi4gKi9cbiAgb3BlbmVkOiBib29sZWFuO1xuICAvKiogU3RyZWFtIHRoYXQgZW1pdHMgd2hlbmV2ZXIgdGhlIGRhdGUgcGlja2VyIGlzIG9wZW5lZC4gKi9cbiAgb3BlbmVkU3RyZWFtOiBFdmVudEVtaXR0ZXI8dm9pZD47XG4gIC8qKiBFbWl0cyB3aGVuIHRoZSBkYXRlcGlja2VyJ3Mgc3RhdGUgY2hhbmdlcy4gKi9cbiAgc3RhdGVDaGFuZ2VzOiBTdWJqZWN0PHZvaWQ+O1xuICAvKiogT3BlbnMgdGhlIGRhdGVwaWNrZXIuICovXG4gIG9wZW4oKTogdm9pZDtcbiAgLyoqIFJlZ2lzdGVyIGFuIGlucHV0IHdpdGggdGhlIGRhdGVwaWNrZXIuICovXG4gIHJlZ2lzdGVySW5wdXQoaW5wdXQ6IEMpOiBEYXRlU2VsZWN0aW9uTW9kZWw8UywgRD47XG59XG5cbi8qKiBCYXNlIGNsYXNzIGZvciBhIGRhdGVwaWNrZXIuICovXG5ARGlyZWN0aXZlKClcbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBEYXRlcGlja2VyQmFzZTxcbiAgICBDIGV4dGVuZHMgRGF0ZXBpY2tlckNvbnRyb2w8RD4sXG4gICAgUyxcbiAgICBEID0gRXh0cmFjdERhdGVUeXBlRnJvbVNlbGVjdGlvbjxTPixcbiAgPlxuICBpbXBsZW1lbnRzIERhdGVwaWNrZXJQYW5lbDxDLCBTLCBEPiwgT25EZXN0cm95LCBPbkNoYW5nZXNcbntcbiAgcHJpdmF0ZSBfc2Nyb2xsU3RyYXRlZ3k6ICgpID0+IFNjcm9sbFN0cmF0ZWd5O1xuICBwcml2YXRlIF9pbnB1dFN0YXRlQ2hhbmdlcyA9IFN1YnNjcmlwdGlvbi5FTVBUWTtcbiAgcHJpdmF0ZSBfZG9jdW1lbnQgPSBpbmplY3QoRE9DVU1FTlQpO1xuXG4gIC8qKiBBbiBpbnB1dCBpbmRpY2F0aW5nIHRoZSB0eXBlIG9mIHRoZSBjdXN0b20gaGVhZGVyIGNvbXBvbmVudCBmb3IgdGhlIGNhbGVuZGFyLCBpZiBzZXQuICovXG4gIEBJbnB1dCgpIGNhbGVuZGFySGVhZGVyQ29tcG9uZW50OiBDb21wb25lbnRUeXBlPGFueT47XG5cbiAgLyoqIFRoZSBkYXRlIHRvIG9wZW4gdGhlIGNhbGVuZGFyIHRvIGluaXRpYWxseS4gKi9cbiAgQElucHV0KClcbiAgZ2V0IHN0YXJ0QXQoKTogRCB8IG51bGwge1xuICAgIC8vIElmIGFuIGV4cGxpY2l0IHN0YXJ0QXQgaXMgc2V0IHdlIHN0YXJ0IHRoZXJlLCBvdGhlcndpc2Ugd2Ugc3RhcnQgYXQgd2hhdGV2ZXIgdGhlIGN1cnJlbnRseVxuICAgIC8vIHNlbGVjdGVkIHZhbHVlIGlzLlxuICAgIHJldHVybiB0aGlzLl9zdGFydEF0IHx8ICh0aGlzLmRhdGVwaWNrZXJJbnB1dCA/IHRoaXMuZGF0ZXBpY2tlcklucHV0LmdldFN0YXJ0VmFsdWUoKSA6IG51bGwpO1xuICB9XG4gIHNldCBzdGFydEF0KHZhbHVlOiBEIHwgbnVsbCkge1xuICAgIHRoaXMuX3N0YXJ0QXQgPSB0aGlzLl9kYXRlQWRhcHRlci5nZXRWYWxpZERhdGVPck51bGwodGhpcy5fZGF0ZUFkYXB0ZXIuZGVzZXJpYWxpemUodmFsdWUpKTtcbiAgfVxuICBwcml2YXRlIF9zdGFydEF0OiBEIHwgbnVsbDtcblxuICAvKiogVGhlIHZpZXcgdGhhdCB0aGUgY2FsZW5kYXIgc2hvdWxkIHN0YXJ0IGluLiAqL1xuICBASW5wdXQoKSBzdGFydFZpZXc6ICdtb250aCcgfCAneWVhcicgfCAnbXVsdGkteWVhcicgPSAnbW9udGgnO1xuXG4gIC8qKlxuICAgKiBXaGV0aGVyIHRoZSBjYWxlbmRhciBVSSBpcyBpbiB0b3VjaCBtb2RlLiBJbiB0b3VjaCBtb2RlIHRoZSBjYWxlbmRhciBvcGVucyBpbiBhIGRpYWxvZyByYXRoZXJcbiAgICogdGhhbiBhIGRyb3Bkb3duIGFuZCBlbGVtZW50cyBoYXZlIG1vcmUgcGFkZGluZyB0byBhbGxvdyBmb3IgYmlnZ2VyIHRvdWNoIHRhcmdldHMuXG4gICAqL1xuICBASW5wdXQoeyB0cmFuc2Zvcm06IGJvb2xlYW5BdHRyaWJ1dGUgfSkgdG91Y2hVaSA9IGZhbHNlO1xuXG4gIC8qKiBXaGV0aGVyIHRoZSBkYXRlcGlja2VyIHBvcC11cCBzaG91bGQgYmUgZGlzYWJsZWQuICovXG4gIEBJbnB1dCh7IHRyYW5zZm9ybTogYm9vbGVhbkF0dHJpYnV0ZSB9KVxuICBnZXQgZGlzYWJsZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2Rpc2FibGVkID09PSB1bmRlZmluZWQgJiYgdGhpcy5kYXRlcGlja2VySW5wdXRcbiAgICAgID8gdGhpcy5kYXRlcGlja2VySW5wdXQuZGlzYWJsZWRcbiAgICAgIDogISF0aGlzLl9kaXNhYmxlZDtcbiAgfVxuICBzZXQgZGlzYWJsZWQodmFsdWU6IGJvb2xlYW4pIHtcbiAgICBpZiAodmFsdWUgIT09IHRoaXMuX2Rpc2FibGVkKSB7XG4gICAgICB0aGlzLl9kaXNhYmxlZCA9IHZhbHVlO1xuICAgICAgdGhpcy5zdGF0ZUNoYW5nZXMubmV4dCh1bmRlZmluZWQpO1xuICAgIH1cbiAgfVxuICBwcml2YXRlIF9kaXNhYmxlZDogYm9vbGVhbjtcblxuICAvKiogUHJlZmVycmVkIHBvc2l0aW9uIG9mIHRoZSBkYXRlcGlja2VyIGluIHRoZSBYIGF4aXMuICovXG4gIEBJbnB1dCgpIHhQb3NpdGlvbjogRGF0ZXBpY2tlckRyb3Bkb3duUG9zaXRpb25YID0gJ3N0YXJ0JztcblxuICAvKiogUHJlZmVycmVkIHBvc2l0aW9uIG9mIHRoZSBkYXRlcGlja2VyIGluIHRoZSBZIGF4aXMuICovXG4gIEBJbnB1dCgpIHlQb3NpdGlvbjogRGF0ZXBpY2tlckRyb3Bkb3duUG9zaXRpb25ZID0gJ2JlbG93JztcblxuICAvKipcbiAgICogV2hldGhlciB0byByZXN0b3JlIGZvY3VzIHRvIHRoZSBwcmV2aW91c2x5LWZvY3VzZWQgZWxlbWVudCB3aGVuIHRoZSBjYWxlbmRhciBpcyBjbG9zZWQuXG4gICAqIE5vdGUgdGhhdCBhdXRvbWF0aWMgZm9jdXMgcmVzdG9yYXRpb24gaXMgYW4gYWNjZXNzaWJpbGl0eSBmZWF0dXJlIGFuZCBpdCBpcyByZWNvbW1lbmRlZCB0aGF0XG4gICAqIHlvdSBwcm92aWRlIHlvdXIgb3duIGVxdWl2YWxlbnQsIGlmIHlvdSBkZWNpZGUgdG8gdHVybiBpdCBvZmYuXG4gICAqL1xuICBASW5wdXQoeyB0cmFuc2Zvcm06IGJvb2xlYW5BdHRyaWJ1dGUgfSkgcmVzdG9yZUZvY3VzID0gdHJ1ZTtcblxuICAvKipcbiAgICogRW1pdHMgc2VsZWN0ZWQgeWVhciBpbiBtdWx0aXllYXIgdmlldy5cbiAgICogVGhpcyBkb2Vzbid0IGltcGx5IGEgY2hhbmdlIG9uIHRoZSBzZWxlY3RlZCBkYXRlLlxuICAgKi9cbiAgQE91dHB1dCgpIHJlYWRvbmx5IHllYXJTZWxlY3RlZDogRXZlbnRFbWl0dGVyPEQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxEPigpO1xuXG4gIC8qKlxuICAgKiBFbWl0cyBzZWxlY3RlZCBtb250aCBpbiB5ZWFyIHZpZXcuXG4gICAqIFRoaXMgZG9lc24ndCBpbXBseSBhIGNoYW5nZSBvbiB0aGUgc2VsZWN0ZWQgZGF0ZS5cbiAgICovXG4gIEBPdXRwdXQoKSByZWFkb25seSBtb250aFNlbGVjdGVkOiBFdmVudEVtaXR0ZXI8RD4gPSBuZXcgRXZlbnRFbWl0dGVyPEQ+KCk7XG5cbiAgLyoqXG4gICAqIEVtaXRzIHdoZW4gdGhlIGN1cnJlbnQgdmlldyBjaGFuZ2VzLlxuICAgKi9cbiAgQE91dHB1dCgpIHJlYWRvbmx5IHZpZXdDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8Q2FsZW5kYXJWaWV3PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q2FsZW5kYXJWaWV3Pih0cnVlKTtcblxuICAvKiogRnVuY3Rpb24gdGhhdCBjYW4gYmUgdXNlZCB0byBhZGQgY3VzdG9tIENTUyBjbGFzc2VzIHRvIGRhdGVzLiAqL1xuICBASW5wdXQoKSBkYXRlQ2xhc3M6IENhbGVuZGFyQ2VsbENsYXNzRnVuY3Rpb248RD47XG5cbiAgLyoqIEVtaXRzIHdoZW4gdGhlIGRhdGVwaWNrZXIgaGFzIGJlZW4gb3BlbmVkLiAqL1xuICBAT3V0cHV0KCdvcGVuZWQnKSByZWFkb25seSBvcGVuZWRTdHJlYW0gPSBuZXcgRXZlbnRFbWl0dGVyPHZvaWQ+KCk7XG5cbiAgLyoqIEVtaXRzIHdoZW4gdGhlIGRhdGVwaWNrZXIgaGFzIGJlZW4gY2xvc2VkLiAqL1xuICBAT3V0cHV0KCdjbG9zZWQnKSByZWFkb25seSBjbG9zZWRTdHJlYW0gPSBuZXcgRXZlbnRFbWl0dGVyPHZvaWQ+KCk7XG5cbiAgLyoqXG4gICAqIENsYXNzZXMgdG8gYmUgcGFzc2VkIHRvIHRoZSBkYXRlIHBpY2tlciBwYW5lbC5cbiAgICogU3VwcG9ydHMgc3RyaW5nIGFuZCBzdHJpbmcgYXJyYXkgdmFsdWVzLCBzaW1pbGFyIHRvIGBuZ0NsYXNzYC5cbiAgICovXG4gIEBJbnB1dCgpXG4gIGdldCBwYW5lbENsYXNzKCk6IHN0cmluZyB8IHN0cmluZ1tdIHtcbiAgICByZXR1cm4gdGhpcy5fcGFuZWxDbGFzcztcbiAgfVxuICBzZXQgcGFuZWxDbGFzcyh2YWx1ZTogc3RyaW5nIHwgc3RyaW5nW10pIHtcbiAgICB0aGlzLl9wYW5lbENsYXNzID0gY29lcmNlU3RyaW5nQXJyYXkodmFsdWUpO1xuICB9XG4gIHByaXZhdGUgX3BhbmVsQ2xhc3M6IHN0cmluZ1tdO1xuXG4gIC8qKiBXaGV0aGVyIHRoZSBjYWxlbmRhciBpcyBvcGVuLiAqL1xuICBASW5wdXQoeyB0cmFuc2Zvcm06IGJvb2xlYW5BdHRyaWJ1dGUgfSlcbiAgZ2V0IG9wZW5lZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fb3BlbmVkO1xuICB9XG4gIHNldCBvcGVuZWQodmFsdWU6IGJvb2xlYW4pIHtcbiAgICBpZiAodmFsdWUpIHtcbiAgICAgIHRoaXMub3BlbigpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmNsb3NlKCk7XG4gICAgfVxuICB9XG4gIHByaXZhdGUgX29wZW5lZCA9IGZhbHNlO1xuXG4gIC8qKiBUaGUgaWQgZm9yIHRoZSBkYXRlcGlja2VyIGNhbGVuZGFyLiAqL1xuICBpZCA9IGBkYXRlcGlja2VyLSR7ZGF0ZXBpY2tlclVpZCsrfWA7XG5cbiAgLyoqIFRoZSBtaW5pbXVtIHNlbGVjdGFibGUgZGF0ZS4gKi9cbiAgX2dldE1pbkRhdGUoKTogRCB8IG51bGwge1xuICAgIHJldHVybiB0aGlzLmRhdGVwaWNrZXJJbnB1dCAmJiB0aGlzLmRhdGVwaWNrZXJJbnB1dC5taW47XG4gIH1cblxuICAvKiogVGhlIG1heGltdW0gc2VsZWN0YWJsZSBkYXRlLiAqL1xuICBfZ2V0TWF4RGF0ZSgpOiBEIHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuZGF0ZXBpY2tlcklucHV0ICYmIHRoaXMuZGF0ZXBpY2tlcklucHV0Lm1heDtcbiAgfVxuXG4gIF9nZXREYXRlRmlsdGVyKCk6IERhdGVGaWx0ZXJGbjxEPiB7XG4gICAgcmV0dXJuIHRoaXMuZGF0ZXBpY2tlcklucHV0ICYmIHRoaXMuZGF0ZXBpY2tlcklucHV0LmRhdGVGaWx0ZXI7XG4gIH1cblxuICAvKiogQSByZWZlcmVuY2UgdG8gdGhlIG92ZXJsYXkgaW50byB3aGljaCB3ZSd2ZSByZW5kZXJlZCB0aGUgY2FsZW5kYXIuICovXG4gIHByaXZhdGUgX292ZXJsYXlSZWY6IE92ZXJsYXlSZWYgfCBudWxsO1xuXG4gIC8qKiBSZWZlcmVuY2UgdG8gdGhlIGNvbXBvbmVudCBpbnN0YW5jZSByZW5kZXJlZCBpbiB0aGUgb3ZlcmxheS4gKi9cbiAgcHJpdmF0ZSBfY29tcG9uZW50UmVmOiBDb21wb25lbnRSZWY8RGF0ZXBpY2tlckNvbnRlbnQ8UywgRD4+IHwgbnVsbDtcblxuICAvKiogVGhlIGVsZW1lbnQgdGhhdCB3YXMgZm9jdXNlZCBiZWZvcmUgdGhlIGRhdGVwaWNrZXIgd2FzIG9wZW5lZC4gKi9cbiAgcHJpdmF0ZSBfZm9jdXNlZEVsZW1lbnRCZWZvcmVPcGVuOiBIVE1MRWxlbWVudCB8IG51bGwgPSBudWxsO1xuXG4gIC8qKiBVbmlxdWUgY2xhc3MgdGhhdCB3aWxsIGJlIGFkZGVkIHRvIHRoZSBiYWNrZHJvcCBzbyB0aGF0IHRoZSB0ZXN0IGhhcm5lc3NlcyBjYW4gbG9vayBpdCB1cC4gKi9cbiAgcHJpdmF0ZSBfYmFja2Ryb3BIYXJuZXNzQ2xhc3MgPSBgJHt0aGlzLmlkfS1iYWNrZHJvcGA7XG5cbiAgLyoqIFRoZSBpbnB1dCBlbGVtZW50IHRoaXMgZGF0ZXBpY2tlciBpcyBhc3NvY2lhdGVkIHdpdGguICovXG4gIGRhdGVwaWNrZXJJbnB1dDogQztcblxuICAvKiogRW1pdHMgd2hlbiB0aGUgZGF0ZXBpY2tlcidzIHN0YXRlIGNoYW5nZXMuICovXG4gIHJlYWRvbmx5IHN0YXRlQ2hhbmdlcyA9IG5ldyBTdWJqZWN0PHZvaWQ+KCk7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBfb3ZlcmxheTogT3ZlcmxheSxcbiAgICBwcml2YXRlIF9uZ1pvbmU6IE5nWm9uZSxcbiAgICBwcml2YXRlIF92aWV3Q29udGFpbmVyUmVmOiBWaWV3Q29udGFpbmVyUmVmLFxuICAgIEBJbmplY3QoREFURVBJQ0tFUl9TQ1JPTExfU1RSQVRFR1kpIHNjcm9sbFN0cmF0ZWd5OiBhbnksXG4gICAgQE9wdGlvbmFsKCkgcHJpdmF0ZSBfZGF0ZUFkYXB0ZXI6IERhdGVBZGFwdGVyPEQ+LFxuICAgIEBPcHRpb25hbCgpIHByaXZhdGUgX2RpcjogRGlyZWN0aW9uYWxpdHksXG4gICAgcHJpdmF0ZSBfbW9kZWw6IERhdGVTZWxlY3Rpb25Nb2RlbDxTLCBEPlxuICApIHtcbiAgICBpZiAoIXRoaXMuX2RhdGVBZGFwdGVyKSB7XG4gICAgICB0aHJvdyBjcmVhdGVNaXNzaW5nRGF0ZUltcGxFcnJvcignRGF0ZUFkYXB0ZXInKTtcbiAgICB9XG5cbiAgICB0aGlzLl9zY3JvbGxTdHJhdGVneSA9IHNjcm9sbFN0cmF0ZWd5O1xuICB9XG5cbiAgbmdPbkNoYW5nZXMoY2hhbmdlczogU2ltcGxlQ2hhbmdlcykge1xuICAgIGNvbnN0IHBvc2l0aW9uQ2hhbmdlID0gY2hhbmdlc1sneFBvc2l0aW9uJ10gfHwgY2hhbmdlc1sneVBvc2l0aW9uJ107XG5cbiAgICBpZiAocG9zaXRpb25DaGFuZ2UgJiYgIXBvc2l0aW9uQ2hhbmdlLmZpcnN0Q2hhbmdlICYmIHRoaXMuX292ZXJsYXlSZWYpIHtcbiAgICAgIGNvbnN0IHBvc2l0aW9uU3RyYXRlZ3kgPSB0aGlzLl9vdmVybGF5UmVmLmdldENvbmZpZygpLnBvc2l0aW9uU3RyYXRlZ3k7XG5cbiAgICAgIGlmIChwb3NpdGlvblN0cmF0ZWd5IGluc3RhbmNlb2YgRmxleGlibGVDb25uZWN0ZWRQb3NpdGlvblN0cmF0ZWd5KSB7XG4gICAgICAgIHRoaXMuX3NldENvbm5lY3RlZFBvc2l0aW9ucyhwb3NpdGlvblN0cmF0ZWd5KTtcblxuICAgICAgICBpZiAodGhpcy5vcGVuZWQpIHtcbiAgICAgICAgICB0aGlzLl9vdmVybGF5UmVmLnVwZGF0ZVBvc2l0aW9uKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLnN0YXRlQ2hhbmdlcy5uZXh0KHVuZGVmaW5lZCk7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICB0aGlzLl9kZXN0cm95T3ZlcmxheSgpO1xuICAgIHRoaXMuY2xvc2UoKTtcbiAgICB0aGlzLl9pbnB1dFN0YXRlQ2hhbmdlcy51bnN1YnNjcmliZSgpO1xuICAgIHRoaXMuc3RhdGVDaGFuZ2VzLmNvbXBsZXRlKCk7XG4gIH1cblxuICAvKiogU2VsZWN0cyB0aGUgZ2l2ZW4gZGF0ZSAqL1xuICBzZWxlY3QoZGF0ZTogRCk6IHZvaWQge1xuICAgIHRoaXMuX21vZGVsLmFkZChkYXRlKTtcbiAgfVxuXG4gIC8qKiBFbWl0cyB0aGUgc2VsZWN0ZWQgeWVhciBpbiBtdWx0aXllYXIgdmlldyAqL1xuICBfc2VsZWN0WWVhcihub3JtYWxpemVkWWVhcjogRCk6IHZvaWQge1xuICAgIHRoaXMueWVhclNlbGVjdGVkLmVtaXQobm9ybWFsaXplZFllYXIpO1xuICB9XG5cbiAgLyoqIEVtaXRzIHNlbGVjdGVkIG1vbnRoIGluIHllYXIgdmlldyAqL1xuICBfc2VsZWN0TW9udGgobm9ybWFsaXplZE1vbnRoOiBEKTogdm9pZCB7XG4gICAgdGhpcy5tb250aFNlbGVjdGVkLmVtaXQobm9ybWFsaXplZE1vbnRoKTtcbiAgfVxuXG4gIC8qKiBFbWl0cyBjaGFuZ2VkIHZpZXcgKi9cbiAgX3ZpZXdDaGFuZ2VkKHZpZXc6IENhbGVuZGFyVmlldyk6IHZvaWQge1xuICAgIHRoaXMudmlld0NoYW5nZWQuZW1pdCh2aWV3KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWdpc3RlciBhbiBpbnB1dCB3aXRoIHRoaXMgZGF0ZXBpY2tlci5cbiAgICogQHBhcmFtIGlucHV0IFRoZSBkYXRlcGlja2VyIGlucHV0IHRvIHJlZ2lzdGVyIHdpdGggdGhpcyBkYXRlcGlja2VyLlxuICAgKiBAcmV0dXJucyBTZWxlY3Rpb24gbW9kZWwgdGhhdCB0aGUgaW5wdXQgc2hvdWxkIGhvb2sgaXRzZWxmIHVwIHRvLlxuICAgKi9cbiAgcmVnaXN0ZXJJbnB1dChpbnB1dDogQyk6IERhdGVTZWxlY3Rpb25Nb2RlbDxTLCBEPiB7XG4gICAgaWYgKHRoaXMuZGF0ZXBpY2tlcklucHV0KSB7XG4gICAgICB0aHJvdyBFcnJvcignQSBEYXRlcGlja2VyIGNhbiBvbmx5IGJlIGFzc29jaWF0ZWQgd2l0aCBhIHNpbmdsZSBpbnB1dC4nKTtcbiAgICB9XG4gICAgdGhpcy5faW5wdXRTdGF0ZUNoYW5nZXMudW5zdWJzY3JpYmUoKTtcbiAgICB0aGlzLmRhdGVwaWNrZXJJbnB1dCA9IGlucHV0O1xuICAgIHRoaXMuX2lucHV0U3RhdGVDaGFuZ2VzID0gaW5wdXQuc3RhdGVDaGFuZ2VzLnN1YnNjcmliZSgoKSA9PiB0aGlzLnN0YXRlQ2hhbmdlcy5uZXh0KHVuZGVmaW5lZCkpO1xuICAgIHJldHVybiB0aGlzLl9tb2RlbDtcbiAgfVxuXG4gIC8qKiBPcGVuIHRoZSBjYWxlbmRhci4gKi9cbiAgb3BlbigpOiB2b2lkIHtcbiAgICAvLyBTa2lwIHJlb3BlbmluZyBpZiB0aGVyZSdzIGFuIGluLXByb2dyZXNzIGFuaW1hdGlvbiB0byBhdm9pZCBvdmVybGFwcGluZ1xuICAgIC8vIHNlcXVlbmNlcyB3aGljaCBjYW4gY2F1c2UgXCJjaGFuZ2VkIGFmdGVyIGNoZWNrZWRcIiBlcnJvcnMuIFNlZSAjMjU4MzcuXG4gICAgaWYgKHRoaXMuX29wZW5lZCB8fCB0aGlzLmRpc2FibGVkIHx8IHRoaXMuX2NvbXBvbmVudFJlZj8uaW5zdGFuY2UuX2lzQW5pbWF0aW5nKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKCF0aGlzLmRhdGVwaWNrZXJJbnB1dCkge1xuICAgICAgdGhyb3cgRXJyb3IoJ0F0dGVtcHRlZCB0byBvcGVuIGFuIERhdGVwaWNrZXIgd2l0aCBubyBhc3NvY2lhdGVkIGlucHV0LicpO1xuICAgIH1cblxuICAgIHRoaXMuX2ZvY3VzZWRFbGVtZW50QmVmb3JlT3BlbiA9IF9nZXRGb2N1c2VkRWxlbWVudFBpZXJjZVNoYWRvd0RvbSgpO1xuICAgIHRoaXMuX29wZW5PdmVybGF5KCk7XG4gICAgdGhpcy5fb3BlbmVkID0gdHJ1ZTtcbiAgICB0aGlzLm9wZW5lZFN0cmVhbS5lbWl0KCk7XG4gIH1cblxuICAvKiogQ2xvc2UgdGhlIGNhbGVuZGFyLiAqL1xuICBjbG9zZSgpOiB2b2lkIHtcbiAgICAvLyBTa2lwIHJlb3BlbmluZyBpZiB0aGVyZSdzIGFuIGluLXByb2dyZXNzIGFuaW1hdGlvbiB0byBhdm9pZCBvdmVybGFwcGluZ1xuICAgIC8vIHNlcXVlbmNlcyB3aGljaCBjYW4gY2F1c2UgXCJjaGFuZ2VkIGFmdGVyIGNoZWNrZWRcIiBlcnJvcnMuIFNlZSAjMjU4MzcuXG4gICAgaWYgKCF0aGlzLl9vcGVuZWQgfHwgdGhpcy5fY29tcG9uZW50UmVmPy5pbnN0YW5jZS5faXNBbmltYXRpbmcpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBjYW5SZXN0b3JlRm9jdXMgPVxuICAgICAgdGhpcy5yZXN0b3JlRm9jdXMgJiZcbiAgICAgIHRoaXMuX2ZvY3VzZWRFbGVtZW50QmVmb3JlT3BlbiAmJlxuICAgICAgdHlwZW9mIHRoaXMuX2ZvY3VzZWRFbGVtZW50QmVmb3JlT3Blbi5mb2N1cyA9PT0gJ2Z1bmN0aW9uJztcblxuICAgIGNvbnN0IGNvbXBsZXRlQ2xvc2UgPSAoKSA9PiB7XG4gICAgICAvLyBUaGUgYF9vcGVuZWRgIGNvdWxkJ3ZlIGJlZW4gcmVzZXQgYWxyZWFkeSBpZlxuICAgICAgLy8gd2UgZ290IHR3byBldmVudHMgaW4gcXVpY2sgc3VjY2Vzc2lvbi5cbiAgICAgIGlmICh0aGlzLl9vcGVuZWQpIHtcbiAgICAgICAgdGhpcy5fb3BlbmVkID0gZmFsc2U7XG4gICAgICAgIHRoaXMuY2xvc2VkU3RyZWFtLmVtaXQoKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgaWYgKHRoaXMuX2NvbXBvbmVudFJlZikge1xuICAgICAgY29uc3QgeyBpbnN0YW5jZSwgbG9jYXRpb24gfSA9IHRoaXMuX2NvbXBvbmVudFJlZjtcbiAgICAgIGluc3RhbmNlLl9zdGFydEV4aXRBbmltYXRpb24oKTtcbiAgICAgIGluc3RhbmNlLl9hbmltYXRpb25Eb25lLnBpcGUodGFrZSgxKSkuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgICAgY29uc3QgYWN0aXZlRWxlbWVudCA9IHRoaXMuX2RvY3VtZW50LmFjdGl2ZUVsZW1lbnQ7XG5cbiAgICAgICAgLy8gU2luY2Ugd2UgcmVzdG9yZSBmb2N1cyBhZnRlciB0aGUgZXhpdCBhbmltYXRpb24sIHdlIGhhdmUgdG8gY2hlY2sgdGhhdFxuICAgICAgICAvLyB0aGUgdXNlciBkaWRuJ3QgbW92ZSBmb2N1cyB0aGVtc2VsdmVzIGluc2lkZSB0aGUgYGNsb3NlYCBoYW5kbGVyLlxuICAgICAgICBpZiAoXG4gICAgICAgICAgY2FuUmVzdG9yZUZvY3VzICYmXG4gICAgICAgICAgKCFhY3RpdmVFbGVtZW50IHx8XG4gICAgICAgICAgICBhY3RpdmVFbGVtZW50ID09PSB0aGlzLl9kb2N1bWVudC5hY3RpdmVFbGVtZW50IHx8XG4gICAgICAgICAgICBsb2NhdGlvbi5uYXRpdmVFbGVtZW50LmNvbnRhaW5zKGFjdGl2ZUVsZW1lbnQpKVxuICAgICAgICApIHtcbiAgICAgICAgICB0aGlzLl9mb2N1c2VkRWxlbWVudEJlZm9yZU9wZW4hLmZvY3VzKCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9mb2N1c2VkRWxlbWVudEJlZm9yZU9wZW4gPSBudWxsO1xuICAgICAgICB0aGlzLl9kZXN0cm95T3ZlcmxheSgpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKGNhblJlc3RvcmVGb2N1cykge1xuICAgICAgLy8gQmVjYXVzZSBJRSBtb3ZlcyBmb2N1cyBhc3luY2hyb25vdXNseSwgd2UgY2FuJ3QgY291bnQgb24gaXQgYmVpbmcgcmVzdG9yZWQgYmVmb3JlIHdlJ3ZlXG4gICAgICAvLyBtYXJrZWQgdGhlIGRhdGVwaWNrZXIgYXMgY2xvc2VkLiBJZiB0aGUgZXZlbnQgZmlyZXMgb3V0IG9mIHNlcXVlbmNlIGFuZCB0aGUgZWxlbWVudCB0aGF0XG4gICAgICAvLyB3ZSdyZSByZWZvY3VzaW5nIG9wZW5zIHRoZSBkYXRlcGlja2VyIG9uIGZvY3VzLCB0aGUgdXNlciBjb3VsZCBiZSBzdHVjayB3aXRoIG5vdCBiZWluZ1xuICAgICAgLy8gYWJsZSB0byBjbG9zZSB0aGUgY2FsZW5kYXIgYXQgYWxsLiBXZSB3b3JrIGFyb3VuZCBpdCBieSBtYWtpbmcgdGhlIGxvZ2ljLCB0aGF0IG1hcmtzXG4gICAgICAvLyB0aGUgZGF0ZXBpY2tlciBhcyBjbG9zZWQsIGFzeW5jIGFzIHdlbGwuXG4gICAgICBzZXRUaW1lb3V0KGNvbXBsZXRlQ2xvc2UpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb21wbGV0ZUNsb3NlKCk7XG4gICAgfVxuICB9XG5cbiAgYXBwbHkoKTogdm9pZCB7XG4gICAgdGhpcy5fYXBwbHlQZW5kaW5nU2VsZWN0aW9uKCk7XG4gICAgdGhpcy5jbG9zZSgpO1xuICB9XG5cbiAgLyoqIEFwcGxpZXMgdGhlIGN1cnJlbnQgcGVuZGluZyBzZWxlY3Rpb24gb24gdGhlIG92ZXJsYXkgdG8gdGhlIG1vZGVsLiAqL1xuICBfYXBwbHlQZW5kaW5nU2VsZWN0aW9uKCkge1xuICAgIHRoaXMuX2NvbXBvbmVudFJlZj8uaW5zdGFuY2U/Ll9hcHBseVBlbmRpbmdTZWxlY3Rpb24oKTtcbiAgfVxuXG4gIC8qKiBGb3J3YXJkcyByZWxldmFudCB2YWx1ZXMgZnJvbSB0aGUgZGF0ZXBpY2tlciB0byB0aGUgZGF0ZXBpY2tlciBjb250ZW50IGluc2lkZSB0aGUgb3ZlcmxheS4gKi9cbiAgcHJvdGVjdGVkIF9mb3J3YXJkQ29udGVudFZhbHVlcyhpbnN0YW5jZTogRGF0ZXBpY2tlckNvbnRlbnQ8UywgRD4pIHtcbiAgICBpbnN0YW5jZS5kYXRlcGlja2VyID0gdGhpcztcbiAgICBpbnN0YW5jZS5fZGlhbG9nTGFiZWxJZCA9IHRoaXMuZGF0ZXBpY2tlcklucHV0LmdldE92ZXJsYXlMYWJlbElkKCk7XG4gICAgaW5zdGFuY2UuX2Fzc2lnbk1vZGVsKGZhbHNlKTtcbiAgfVxuXG4gIC8qKiBPcGVucyB0aGUgb3ZlcmxheSB3aXRoIHRoZSBjYWxlbmRhci4gKi9cbiAgcHJpdmF0ZSBfb3Blbk92ZXJsYXkoKTogdm9pZCB7XG4gICAgdGhpcy5fZGVzdHJveU92ZXJsYXkoKTtcblxuICAgIGNvbnN0IGlzRGlhbG9nID0gdGhpcy50b3VjaFVpO1xuICAgIGNvbnN0IHBvcnRhbCA9IG5ldyBDb21wb25lbnRQb3J0YWw8RGF0ZXBpY2tlckNvbnRlbnQ8UywgRD4+KFxuICAgICAgRGF0ZXBpY2tlckNvbnRlbnQsXG4gICAgICB0aGlzLl92aWV3Q29udGFpbmVyUmVmXG4gICAgKTtcbiAgICBjb25zdCBvdmVybGF5UmVmID0gKHRoaXMuX292ZXJsYXlSZWYgPSB0aGlzLl9vdmVybGF5LmNyZWF0ZShcbiAgICAgIG5ldyBPdmVybGF5Q29uZmlnKHtcbiAgICAgICAgcG9zaXRpb25TdHJhdGVneTogaXNEaWFsb2cgPyB0aGlzLl9nZXREaWFsb2dTdHJhdGVneSgpIDogdGhpcy5fZ2V0RHJvcGRvd25TdHJhdGVneSgpLFxuICAgICAgICBoYXNCYWNrZHJvcDogdHJ1ZSxcbiAgICAgICAgYmFja2Ryb3BDbGFzczogW1xuICAgICAgICAgIGlzRGlhbG9nID8gJ2Nkay1vdmVybGF5LWRhcmstYmFja2Ryb3AnIDogJ292ZXJsYXktdHJhbnNwYXJlbnQtYmFja2Ryb3AnLFxuICAgICAgICAgIHRoaXMuX2JhY2tkcm9wSGFybmVzc0NsYXNzLFxuICAgICAgICBdLFxuICAgICAgICBkaXJlY3Rpb246IHRoaXMuX2RpcixcbiAgICAgICAgc2Nyb2xsU3RyYXRlZ3k6IGlzRGlhbG9nID8gdGhpcy5fb3ZlcmxheS5zY3JvbGxTdHJhdGVnaWVzLmJsb2NrKCkgOiB0aGlzLl9zY3JvbGxTdHJhdGVneSgpLFxuICAgICAgICBwYW5lbENsYXNzOiBgZGF0ZXBpY2tlci0ke2lzRGlhbG9nID8gJ2RpYWxvZycgOiAncG9wdXAnfWAsXG4gICAgICB9KVxuICAgICkpO1xuXG4gICAgdGhpcy5fZ2V0Q2xvc2VTdHJlYW0ob3ZlcmxheVJlZikuc3Vic2NyaWJlKChldmVudCkgPT4ge1xuICAgICAgaWYgKGV2ZW50KSB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICB9XG4gICAgICB0aGlzLmNsb3NlKCk7XG4gICAgfSk7XG5cbiAgICAvLyBUaGUgYHByZXZlbnREZWZhdWx0YCBjYWxsIGhhcHBlbnMgaW5zaWRlIHRoZSBjYWxlbmRhciBhcyB3ZWxsLCBob3dldmVyIGZvY3VzIG1vdmVzIGludG9cbiAgICAvLyBpdCBpbnNpZGUgYSB0aW1lb3V0IHdoaWNoIGNhbiBnaXZlIGJyb3dzZXJzIGEgY2hhbmNlIHRvIGZpcmUgb2ZmIGEga2V5Ym9hcmQgZXZlbnQgaW4tYmV0d2VlblxuICAgIC8vIHRoYXQgY2FuIHNjcm9sbCB0aGUgcGFnZSAoc2VlICMyNDk2OSkuIEFsd2F5cyBibG9jayBkZWZhdWx0IGFjdGlvbnMgb2YgYXJyb3cga2V5cyBmb3IgdGhlXG4gICAgLy8gZW50aXJlIG92ZXJsYXkgc28gdGhlIHBhZ2UgZG9lc24ndCBnZXQgc2Nyb2xsZWQgYnkgYWNjaWRlbnQuXG4gICAgb3ZlcmxheVJlZi5rZXlkb3duRXZlbnRzKCkuc3Vic2NyaWJlKChldmVudCkgPT4ge1xuICAgICAgY29uc3Qga2V5Q29kZSA9IGV2ZW50LmtleUNvZGU7XG5cbiAgICAgIGlmIChcbiAgICAgICAga2V5Q29kZSA9PT0gVVBfQVJST1cgfHxcbiAgICAgICAga2V5Q29kZSA9PT0gRE9XTl9BUlJPVyB8fFxuICAgICAgICBrZXlDb2RlID09PSBMRUZUX0FSUk9XIHx8XG4gICAgICAgIGtleUNvZGUgPT09IFJJR0hUX0FSUk9XIHx8XG4gICAgICAgIGtleUNvZGUgPT09IFBBR0VfVVAgfHxcbiAgICAgICAga2V5Q29kZSA9PT0gUEFHRV9ET1dOXG4gICAgICApIHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMuX2NvbXBvbmVudFJlZiA9IG92ZXJsYXlSZWYuYXR0YWNoKHBvcnRhbCk7XG4gICAgdGhpcy5fZm9yd2FyZENvbnRlbnRWYWx1ZXModGhpcy5fY29tcG9uZW50UmVmLmluc3RhbmNlKTtcblxuICAgIC8vIFVwZGF0ZSB0aGUgcG9zaXRpb24gb25jZSB0aGUgY2FsZW5kYXIgaGFzIHJlbmRlcmVkLiBPbmx5IHJlbGV2YW50IGluIGRyb3Bkb3duIG1vZGUuXG4gICAgaWYgKCFpc0RpYWxvZykge1xuICAgICAgdGhpcy5fbmdab25lLm9uU3RhYmxlLnBpcGUodGFrZSgxKSkuc3Vic2NyaWJlKCgpID0+IG92ZXJsYXlSZWYudXBkYXRlUG9zaXRpb24oKSk7XG4gICAgfVxuICB9XG5cbiAgLyoqIERlc3Ryb3lzIHRoZSBjdXJyZW50IG92ZXJsYXkuICovXG4gIHByaXZhdGUgX2Rlc3Ryb3lPdmVybGF5KCkge1xuICAgIGlmICh0aGlzLl9vdmVybGF5UmVmKSB7XG4gICAgICB0aGlzLl9vdmVybGF5UmVmLmRpc3Bvc2UoKTtcbiAgICAgIHRoaXMuX292ZXJsYXlSZWYgPSB0aGlzLl9jb21wb25lbnRSZWYgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBHZXRzIGEgcG9zaXRpb24gc3RyYXRlZ3kgdGhhdCB3aWxsIG9wZW4gdGhlIGNhbGVuZGFyIGFzIGEgZHJvcGRvd24uICovXG4gIHByaXZhdGUgX2dldERpYWxvZ1N0cmF0ZWd5KCkge1xuICAgIHJldHVybiB0aGlzLl9vdmVybGF5LnBvc2l0aW9uKCkuZ2xvYmFsKCkuY2VudGVySG9yaXpvbnRhbGx5KCkuY2VudGVyVmVydGljYWxseSgpO1xuICB9XG5cbiAgLyoqIEdldHMgYSBwb3NpdGlvbiBzdHJhdGVneSB0aGF0IHdpbGwgb3BlbiB0aGUgY2FsZW5kYXIgYXMgYSBkcm9wZG93bi4gKi9cbiAgcHJpdmF0ZSBfZ2V0RHJvcGRvd25TdHJhdGVneSgpIHtcbiAgICBjb25zdCBzdHJhdGVneSA9IHRoaXMuX292ZXJsYXlcbiAgICAgIC5wb3NpdGlvbigpXG4gICAgICAuZmxleGlibGVDb25uZWN0ZWRUbyh0aGlzLmRhdGVwaWNrZXJJbnB1dC5nZXRDb25uZWN0ZWRPdmVybGF5T3JpZ2luKCkpXG4gICAgICAud2l0aFRyYW5zZm9ybU9yaWdpbk9uKCcuZGF0ZXBpY2tlci1jb250ZW50JylcbiAgICAgIC53aXRoRmxleGlibGVEaW1lbnNpb25zKGZhbHNlKVxuICAgICAgLndpdGhWaWV3cG9ydE1hcmdpbig4KVxuICAgICAgLndpdGhMb2NrZWRQb3NpdGlvbigpO1xuXG4gICAgcmV0dXJuIHRoaXMuX3NldENvbm5lY3RlZFBvc2l0aW9ucyhzdHJhdGVneSk7XG4gIH1cblxuICAvKiogU2V0cyB0aGUgcG9zaXRpb25zIG9mIHRoZSBkYXRlcGlja2VyIGluIGRyb3Bkb3duIG1vZGUgYmFzZWQgb24gdGhlIGN1cnJlbnQgY29uZmlndXJhdGlvbi4gKi9cbiAgcHJpdmF0ZSBfc2V0Q29ubmVjdGVkUG9zaXRpb25zKHN0cmF0ZWd5OiBGbGV4aWJsZUNvbm5lY3RlZFBvc2l0aW9uU3RyYXRlZ3kpIHtcbiAgICBjb25zdCBwcmltYXJ5WCA9IHRoaXMueFBvc2l0aW9uID09PSAnZW5kJyA/ICdlbmQnIDogJ3N0YXJ0JztcbiAgICBjb25zdCBzZWNvbmRhcnlYID0gcHJpbWFyeVggPT09ICdzdGFydCcgPyAnZW5kJyA6ICdzdGFydCc7XG4gICAgY29uc3QgcHJpbWFyeVkgPSB0aGlzLnlQb3NpdGlvbiA9PT0gJ2Fib3ZlJyA/ICdib3R0b20nIDogJ3RvcCc7XG4gICAgY29uc3Qgc2Vjb25kYXJ5WSA9IHByaW1hcnlZID09PSAndG9wJyA/ICdib3R0b20nIDogJ3RvcCc7XG5cbiAgICByZXR1cm4gc3RyYXRlZ3kud2l0aFBvc2l0aW9ucyhbXG4gICAgICB7XG4gICAgICAgIG9yaWdpblg6IHByaW1hcnlYLFxuICAgICAgICBvcmlnaW5ZOiBzZWNvbmRhcnlZLFxuICAgICAgICBvdmVybGF5WDogcHJpbWFyeVgsXG4gICAgICAgIG92ZXJsYXlZOiBwcmltYXJ5WSxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIG9yaWdpblg6IHByaW1hcnlYLFxuICAgICAgICBvcmlnaW5ZOiBwcmltYXJ5WSxcbiAgICAgICAgb3ZlcmxheVg6IHByaW1hcnlYLFxuICAgICAgICBvdmVybGF5WTogc2Vjb25kYXJ5WSxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIG9yaWdpblg6IHNlY29uZGFyeVgsXG4gICAgICAgIG9yaWdpblk6IHNlY29uZGFyeVksXG4gICAgICAgIG92ZXJsYXlYOiBzZWNvbmRhcnlYLFxuICAgICAgICBvdmVybGF5WTogcHJpbWFyeVksXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBvcmlnaW5YOiBzZWNvbmRhcnlYLFxuICAgICAgICBvcmlnaW5ZOiBwcmltYXJ5WSxcbiAgICAgICAgb3ZlcmxheVg6IHNlY29uZGFyeVgsXG4gICAgICAgIG92ZXJsYXlZOiBzZWNvbmRhcnlZLFxuICAgICAgfSxcbiAgICBdKTtcbiAgfVxuXG4gIC8qKiBHZXRzIGFuIG9ic2VydmFibGUgdGhhdCB3aWxsIGVtaXQgd2hlbiB0aGUgb3ZlcmxheSBpcyBzdXBwb3NlZCB0byBiZSBjbG9zZWQuICovXG4gIHByaXZhdGUgX2dldENsb3NlU3RyZWFtKG92ZXJsYXlSZWY6IE92ZXJsYXlSZWYpIHtcbiAgICBjb25zdCBjdHJsU2hpZnRNZXRhTW9kaWZpZXJzOiBNb2RpZmllcktleVtdID0gWydjdHJsS2V5JywgJ3NoaWZ0S2V5JywgJ21ldGFLZXknXTtcbiAgICByZXR1cm4gbWVyZ2UoXG4gICAgICBvdmVybGF5UmVmLmJhY2tkcm9wQ2xpY2soKSxcbiAgICAgIG92ZXJsYXlSZWYuZGV0YWNobWVudHMoKSxcbiAgICAgIG92ZXJsYXlSZWYua2V5ZG93bkV2ZW50cygpLnBpcGUoXG4gICAgICAgIGZpbHRlcigoZXZlbnQpID0+IHtcbiAgICAgICAgICAvLyBDbG9zaW5nIG9uIGFsdCArIHVwIGlzIG9ubHkgdmFsaWQgd2hlbiB0aGVyZSdzIGFuIGlucHV0IGFzc29jaWF0ZWQgd2l0aCB0aGUgZGF0ZXBpY2tlci5cbiAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgKGV2ZW50LmtleUNvZGUgPT09IEVTQ0FQRSAmJiAhaGFzTW9kaWZpZXJLZXkoZXZlbnQpKSB8fFxuICAgICAgICAgICAgKHRoaXMuZGF0ZXBpY2tlcklucHV0ICYmXG4gICAgICAgICAgICAgIGhhc01vZGlmaWVyS2V5KGV2ZW50LCAnYWx0S2V5JykgJiZcbiAgICAgICAgICAgICAgZXZlbnQua2V5Q29kZSA9PT0gVVBfQVJST1cgJiZcbiAgICAgICAgICAgICAgY3RybFNoaWZ0TWV0YU1vZGlmaWVycy5ldmVyeShcbiAgICAgICAgICAgICAgICAobW9kaWZpZXI6IE1vZGlmaWVyS2V5KSA9PiAhaGFzTW9kaWZpZXJLZXkoZXZlbnQsIG1vZGlmaWVyKVxuICAgICAgICAgICAgICApKVxuICAgICAgICAgICk7XG4gICAgICAgIH0pXG4gICAgICApXG4gICAgKTtcbiAgfVxufVxuIl19
