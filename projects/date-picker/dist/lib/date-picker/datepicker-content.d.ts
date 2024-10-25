import { AfterViewInit, ElementRef, OnDestroy, ChangeDetectorRef, OnInit } from '@angular/core';
import { AnimationEvent } from '@angular/animations';
import { Subject } from 'rxjs';
import { DateAdapter } from '../adapter/date-adapter';
import { DateFormats } from '../adapter/date-formats';
import { Calendar } from '../calendar/calendar';
import { CalendarUserEvent } from '../calendar/calendar-body';
import { DatepickerBase } from './datepicker-base';
import { ExtractDateTypeFromSelection, DateSelectionModel, DateRange } from './date-selection-model';
import * as i0 from "@angular/core";
/**
 * Component used as the content for the datepicker overlay. We use this instead of using
 * Calendar directly as the content so we can control the initial focus. This also gives us a
 * place to put additional features of the overlay that are not part of the calendar itself in the
 * future. (e.g. confirmation buttons).
 * @docs-private
 */
export declare class DatepickerContent<S, D = ExtractDateTypeFromSelection<S>> implements OnInit, AfterViewInit, OnDestroy {
    protected _elementRef: ElementRef;
    private _changeDetectorRef;
    private _globalModel;
    private _dateAdapter;
    private _dateFormats;
    private _subscriptions;
    private _model;
    /** Reference to the internal calendar component. */
    _calendar: Calendar<D>;
    /** Reference to the datepicker that created the overlay. */
    datepicker: DatepickerBase<any, S, D>;
    /** Start of the comparison range. */
    comparisonStart: D | null;
    /** End of the comparison range. */
    comparisonEnd: D | null;
    /** ARIA Accessible name of the `<input startDate/>` */
    startDateAccessibleName: string | null;
    /** ARIA Accessible name of the `<input endDate/>` */
    endDateAccessibleName: string | null;
    /** Whether the datepicker is above or below the input. */
    _isAbove: boolean;
    /** Current state of the animation. */
    _animationState: 'enter-dropdown' | 'enter-dialog' | 'void';
    /** Emits when an animation has finished. */
    readonly _animationDone: Subject<void>;
    /** Whether there is an in-progress animation. */
    _isAnimating: boolean;
    /** Whether the close button currently has focus. */
    _closeButtonFocused: boolean;
    /** Id of the label for the `role="dialog"` element. */
    _dialogLabelId: string | null;
    constructor(_elementRef: ElementRef, _changeDetectorRef: ChangeDetectorRef, _globalModel: DateSelectionModel<S, D>, _dateAdapter: DateAdapter<D>, _dateFormats: DateFormats);
    ngOnInit(): void;
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
    _handleUserSelection(event: CalendarUserEvent<D | null>): void;
    _handleUserDragDrop(event: CalendarUserEvent<DateRange<D>>): void;
    _startExitAnimation(): void;
    _handleAnimationEvent(event: AnimationEvent): void;
    _getSelected(): D | DateRange<D> | null;
    _getSelectedDisplay(): string;
    /** Applies the current pending selection to the global model. */
    _applyPendingSelection(): void;
    /**
     * @param forceRerender
     */
    _assignModel(forceRerender: boolean): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<DatepickerContent<any, any>, [null, null, null, null, { optional: true; }]>;
    static ɵcmp: i0.ɵɵComponentDeclaration<DatepickerContent<any, any>, "datepicker-content", ["datepickerContent"], {}, {}, never, never, true, never>;
}
