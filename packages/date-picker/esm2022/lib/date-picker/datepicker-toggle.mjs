/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/* eslint-disable @angular-eslint/no-input-rename */
import * as i0 from '@angular/core';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  Input,
  ViewEncapsulation,
} from '@angular/core';
import { merge, of as observableOf, Subscription } from 'rxjs';
export class DatepickerToggle {
  _changeDetectorRef;
  _stateChanges = Subscription.EMPTY;
  /** Datepicker instance that the button will toggle. */
  datepicker;
  /** Screen-reader label for the button. */
  ariaLabel;
  /** Whether the toggle button is disabled. */
  get disabled() {
    if (this._disabled === undefined && this.datepicker) {
      return this.datepicker.disabled;
    }
    return !!this._disabled;
  }
  set disabled(value) {
    this._disabled = value;
  }
  _disabled;
  constructor(_changeDetectorRef) {
    this._changeDetectorRef = _changeDetectorRef;
  }
  ngOnChanges(changes) {
    if (changes['datepicker']) {
      this._watchStateChanges();
    }
  }
  ngOnDestroy() {
    this._stateChanges.unsubscribe();
  }
  ngAfterContentInit() {
    this._watchStateChanges();
  }
  _open(event) {
    if (this.datepicker && !this.disabled) {
      this.datepicker.open();
      event.stopPropagation();
    }
  }
  _watchStateChanges() {
    const datepickerStateChanged = this.datepicker ? this.datepicker.stateChanges : observableOf();
    const inputStateChanged =
      this.datepicker && this.datepicker.datepickerInput
        ? this.datepicker.datepickerInput.stateChanges
        : observableOf();
    const datepickerToggled = this.datepicker
      ? merge(this.datepicker.openedStream, this.datepicker.closedStream)
      : observableOf();
    this._stateChanges.unsubscribe();
    this._stateChanges = merge(
      datepickerStateChanged,
      inputStateChanged,
      datepickerToggled
    ).subscribe(() => this._changeDetectorRef.markForCheck());
  }
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: '12.0.0',
    version: '18.2.13',
    ngImport: i0,
    type: DatepickerToggle,
    deps: [{ token: i0.ChangeDetectorRef }],
    target: i0.ɵɵFactoryTarget.Component,
  });
  static ɵcmp = i0.ɵɵngDeclareComponent({
    minVersion: '16.1.0',
    version: '18.2.13',
    type: DatepickerToggle,
    isStandalone: true,
    selector: 'datepicker-toggle',
    inputs: {
      datepicker: ['for', 'datepicker'],
      ariaLabel: ['aria-label', 'ariaLabel'],
      disabled: ['disabled', 'disabled', booleanAttribute],
    },
    host: { listeners: { click: '_open($event)' } },
    exportAs: ['datepickerToggle'],
    usesOnChanges: true,
    ngImport: i0,
    template:
      '<button\n  class="btn btn-circle btn-ghost btn-sm"\n  [disabled]="disabled"\n>\n  <svg\n    class="w-6 h-6"\n    viewBox="0 0 24 24"\n    fill="none"\n    stroke-width="1.5"\n    stroke="currentColor"\n    xmlns="http://www.w3.org/2000/svg"\n  >\n    <path\n      stroke-linecap="round"\n      stroke-linejoin="round"\n      d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"\n    />\n  </svg>\n</button>\n',
    changeDetection: i0.ChangeDetectionStrategy.OnPush,
    encapsulation: i0.ViewEncapsulation.None,
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: '12.0.0',
  version: '18.2.13',
  ngImport: i0,
  type: DatepickerToggle,
  decorators: [
    {
      type: Component,
      args: [
        {
          selector: 'datepicker-toggle',
          host: {
            '(click)': '_open($event)',
          },
          standalone: true,
          exportAs: 'datepickerToggle',
          encapsulation: ViewEncapsulation.None,
          changeDetection: ChangeDetectionStrategy.OnPush,
          template:
            '<button\n  class="btn btn-circle btn-ghost btn-sm"\n  [disabled]="disabled"\n>\n  <svg\n    class="w-6 h-6"\n    viewBox="0 0 24 24"\n    fill="none"\n    stroke-width="1.5"\n    stroke="currentColor"\n    xmlns="http://www.w3.org/2000/svg"\n  >\n    <path\n      stroke-linecap="round"\n      stroke-linejoin="round"\n      d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"\n    />\n  </svg>\n</button>\n',
        },
      ],
    },
  ],
  ctorParameters: () => [{ type: i0.ChangeDetectorRef }],
  propDecorators: {
    datepicker: [
      {
        type: Input,
        args: ['for'],
      },
    ],
    ariaLabel: [
      {
        type: Input,
        args: ['aria-label'],
      },
    ],
    disabled: [
      {
        type: Input,
        args: [{ transform: booleanAttribute }],
      },
    ],
  },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZXBpY2tlci10b2dnbGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9saWJzL2RhdGUtcGlja2VyL3NyYy9saWIvZGF0ZS1waWNrZXIvZGF0ZXBpY2tlci10b2dnbGUudHMiLCIuLi8uLi8uLi8uLi8uLi9saWJzL2RhdGUtcGlja2VyL3NyYy9saWIvZGF0ZS1waWNrZXIvZGF0ZXBpY2tlci10b2dnbGUuaHRtbCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxvREFBb0Q7QUFFcEQsT0FBTyxFQUVMLHVCQUF1QixFQUV2QixTQUFTLEVBQ1QsS0FBSyxFQUlMLGlCQUFpQixFQUNqQixnQkFBZ0IsR0FDakIsTUFBTSxlQUFlLENBQUM7QUFFdkIsT0FBTyxFQUFFLEtBQUssRUFBYyxFQUFFLElBQUksWUFBWSxFQUFFLFlBQVksRUFBRSxNQUFNLE1BQU0sQ0FBQzs7QUFjM0UsTUFBTSxPQUFPLGdCQUFnQjtJQXVCUDtJQXRCWixhQUFhLEdBQUcsWUFBWSxDQUFDLEtBQUssQ0FBQztJQUUzQyx1REFBdUQ7SUFDekMsVUFBVSxDQUE2QztJQUVyRSwwQ0FBMEM7SUFDckIsU0FBUyxDQUFTO0lBRXZDLDZDQUE2QztJQUM3QyxJQUNJLFFBQVE7UUFDVixJQUFJLElBQUksQ0FBQyxTQUFTLEtBQUssU0FBUyxJQUFJLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUNwRCxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDO1FBQ2xDLENBQUM7UUFFRCxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDO0lBQzFCLENBQUM7SUFDRCxJQUFJLFFBQVEsQ0FBQyxLQUFjO1FBQ3pCLElBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO0lBQ3pCLENBQUM7SUFDTyxTQUFTLENBQVU7SUFFM0IsWUFBb0Isa0JBQXFDO1FBQXJDLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBbUI7SUFBRyxDQUFDO0lBRTdELFdBQVcsQ0FBQyxPQUFzQjtRQUNoQyxJQUFJLE9BQU8sQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDO1lBQzFCLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1FBQzVCLENBQUM7SUFDSCxDQUFDO0lBRUQsV0FBVztRQUNULElBQUksQ0FBQyxhQUFhLENBQUMsV0FBVyxFQUFFLENBQUM7SUFDbkMsQ0FBQztJQUVELGtCQUFrQjtRQUNoQixJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztJQUM1QixDQUFDO0lBRUQsS0FBSyxDQUFDLEtBQVk7UUFDaEIsSUFBSSxJQUFJLENBQUMsVUFBVSxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ3RDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDdkIsS0FBSyxDQUFDLGVBQWUsRUFBRSxDQUFDO1FBQzFCLENBQUM7SUFDSCxDQUFDO0lBRU8sa0JBQWtCO1FBQ3hCLE1BQU0sc0JBQXNCLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLFlBQVksRUFBRSxDQUFDO1FBQy9GLE1BQU0saUJBQWlCLEdBQ3JCLElBQUksQ0FBQyxVQUFVLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxlQUFlO1lBQ2hELENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLGVBQWUsQ0FBQyxZQUFZO1lBQzlDLENBQUMsQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUNyQixNQUFNLGlCQUFpQixHQUFHLElBQUksQ0FBQyxVQUFVO1lBQ3ZDLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUM7WUFDbkUsQ0FBQyxDQUFDLFlBQVksRUFBRSxDQUFDO1FBRW5CLElBQUksQ0FBQyxhQUFhLENBQUMsV0FBVyxFQUFFLENBQUM7UUFFakMsSUFBSSxDQUFDLGFBQWEsR0FBRyxLQUFLLENBQ3hCLHNCQUEwQyxFQUMxQyxpQkFBaUIsRUFDakIsaUJBQWlCLENBQ2xCLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDO0lBQzVELENBQUM7d0dBL0RVLGdCQUFnQjs0RkFBaEIsZ0JBQWdCLDZLQVVQLGdCQUFnQixxSUMvQ3RDLGltQkFtQkE7OzRGRGtCYSxnQkFBZ0I7a0JBWDVCLFNBQVM7K0JBQ0UsbUJBQW1CLFFBRXZCO3dCQUNKLFNBQVMsRUFBRSxlQUFlO3FCQUMzQixjQUNXLElBQUksWUFDTixrQkFBa0IsaUJBQ2IsaUJBQWlCLENBQUMsSUFBSSxtQkFDcEIsdUJBQXVCLENBQUMsTUFBTTtzRkFNakMsVUFBVTtzQkFBdkIsS0FBSzt1QkFBQyxLQUFLO2dCQUdTLFNBQVM7c0JBQTdCLEtBQUs7dUJBQUMsWUFBWTtnQkFJZixRQUFRO3NCQURYLEtBQUs7dUJBQUMsRUFBRSxTQUFTLEVBQUUsZ0JBQWdCLEVBQUUiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuLyogZXNsaW50LWRpc2FibGUgQGFuZ3VsYXItZXNsaW50L25vLWlucHV0LXJlbmFtZSAqL1xuXG5pbXBvcnQge1xuICBBZnRlckNvbnRlbnRJbml0LFxuICBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSxcbiAgQ2hhbmdlRGV0ZWN0b3JSZWYsXG4gIENvbXBvbmVudCxcbiAgSW5wdXQsXG4gIE9uQ2hhbmdlcyxcbiAgT25EZXN0cm95LFxuICBTaW1wbGVDaGFuZ2VzLFxuICBWaWV3RW5jYXBzdWxhdGlvbixcbiAgYm9vbGVhbkF0dHJpYnV0ZSxcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7IG1lcmdlLCBPYnNlcnZhYmxlLCBvZiBhcyBvYnNlcnZhYmxlT2YsIFN1YnNjcmlwdGlvbiB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgRGF0ZXBpY2tlckNvbnRyb2wsIERhdGVwaWNrZXJQYW5lbCB9IGZyb20gJy4vZGF0ZXBpY2tlci1iYXNlJztcblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnZGF0ZXBpY2tlci10b2dnbGUnLFxuICB0ZW1wbGF0ZVVybDogJ2RhdGVwaWNrZXItdG9nZ2xlLmh0bWwnLFxuICBob3N0OiB7XG4gICAgJyhjbGljayknOiAnX29wZW4oJGV2ZW50KScsXG4gIH0sXG4gIHN0YW5kYWxvbmU6IHRydWUsXG4gIGV4cG9ydEFzOiAnZGF0ZXBpY2tlclRvZ2dsZScsXG4gIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLk5vbmUsXG4gIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuT25QdXNoLFxufSlcbmV4cG9ydCBjbGFzcyBEYXRlcGlja2VyVG9nZ2xlPEQ+IGltcGxlbWVudHMgQWZ0ZXJDb250ZW50SW5pdCwgT25DaGFuZ2VzLCBPbkRlc3Ryb3kge1xuICBwcml2YXRlIF9zdGF0ZUNoYW5nZXMgPSBTdWJzY3JpcHRpb24uRU1QVFk7XG5cbiAgLyoqIERhdGVwaWNrZXIgaW5zdGFuY2UgdGhhdCB0aGUgYnV0dG9uIHdpbGwgdG9nZ2xlLiAqL1xuICBASW5wdXQoJ2ZvcicpIGRhdGVwaWNrZXI6IERhdGVwaWNrZXJQYW5lbDxEYXRlcGlja2VyQ29udHJvbDxhbnk+LCBEPjtcblxuICAvKiogU2NyZWVuLXJlYWRlciBsYWJlbCBmb3IgdGhlIGJ1dHRvbi4gKi9cbiAgQElucHV0KCdhcmlhLWxhYmVsJykgYXJpYUxhYmVsOiBzdHJpbmc7XG5cbiAgLyoqIFdoZXRoZXIgdGhlIHRvZ2dsZSBidXR0b24gaXMgZGlzYWJsZWQuICovXG4gIEBJbnB1dCh7IHRyYW5zZm9ybTogYm9vbGVhbkF0dHJpYnV0ZSB9KVxuICBnZXQgZGlzYWJsZWQoKTogYm9vbGVhbiB7XG4gICAgaWYgKHRoaXMuX2Rpc2FibGVkID09PSB1bmRlZmluZWQgJiYgdGhpcy5kYXRlcGlja2VyKSB7XG4gICAgICByZXR1cm4gdGhpcy5kYXRlcGlja2VyLmRpc2FibGVkO1xuICAgIH1cblxuICAgIHJldHVybiAhIXRoaXMuX2Rpc2FibGVkO1xuICB9XG4gIHNldCBkaXNhYmxlZCh2YWx1ZTogYm9vbGVhbikge1xuICAgIHRoaXMuX2Rpc2FibGVkID0gdmFsdWU7XG4gIH1cbiAgcHJpdmF0ZSBfZGlzYWJsZWQ6IGJvb2xlYW47XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfY2hhbmdlRGV0ZWN0b3JSZWY6IENoYW5nZURldGVjdG9yUmVmKSB7fVxuXG4gIG5nT25DaGFuZ2VzKGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMpIHtcbiAgICBpZiAoY2hhbmdlc1snZGF0ZXBpY2tlciddKSB7XG4gICAgICB0aGlzLl93YXRjaFN0YXRlQ2hhbmdlcygpO1xuICAgIH1cbiAgfVxuXG4gIG5nT25EZXN0cm95KCkge1xuICAgIHRoaXMuX3N0YXRlQ2hhbmdlcy51bnN1YnNjcmliZSgpO1xuICB9XG5cbiAgbmdBZnRlckNvbnRlbnRJbml0KCkge1xuICAgIHRoaXMuX3dhdGNoU3RhdGVDaGFuZ2VzKCk7XG4gIH1cblxuICBfb3BlbihldmVudDogRXZlbnQpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5kYXRlcGlja2VyICYmICF0aGlzLmRpc2FibGVkKSB7XG4gICAgICB0aGlzLmRhdGVwaWNrZXIub3BlbigpO1xuICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfd2F0Y2hTdGF0ZUNoYW5nZXMoKSB7XG4gICAgY29uc3QgZGF0ZXBpY2tlclN0YXRlQ2hhbmdlZCA9IHRoaXMuZGF0ZXBpY2tlciA/IHRoaXMuZGF0ZXBpY2tlci5zdGF0ZUNoYW5nZXMgOiBvYnNlcnZhYmxlT2YoKTtcbiAgICBjb25zdCBpbnB1dFN0YXRlQ2hhbmdlZCA9XG4gICAgICB0aGlzLmRhdGVwaWNrZXIgJiYgdGhpcy5kYXRlcGlja2VyLmRhdGVwaWNrZXJJbnB1dFxuICAgICAgICA/IHRoaXMuZGF0ZXBpY2tlci5kYXRlcGlja2VySW5wdXQuc3RhdGVDaGFuZ2VzXG4gICAgICAgIDogb2JzZXJ2YWJsZU9mKCk7XG4gICAgY29uc3QgZGF0ZXBpY2tlclRvZ2dsZWQgPSB0aGlzLmRhdGVwaWNrZXJcbiAgICAgID8gbWVyZ2UodGhpcy5kYXRlcGlja2VyLm9wZW5lZFN0cmVhbSwgdGhpcy5kYXRlcGlja2VyLmNsb3NlZFN0cmVhbSlcbiAgICAgIDogb2JzZXJ2YWJsZU9mKCk7XG5cbiAgICB0aGlzLl9zdGF0ZUNoYW5nZXMudW5zdWJzY3JpYmUoKTtcblxuICAgIHRoaXMuX3N0YXRlQ2hhbmdlcyA9IG1lcmdlKFxuICAgICAgZGF0ZXBpY2tlclN0YXRlQ2hhbmdlZCBhcyBPYnNlcnZhYmxlPHZvaWQ+LFxuICAgICAgaW5wdXRTdGF0ZUNoYW5nZWQsXG4gICAgICBkYXRlcGlja2VyVG9nZ2xlZFxuICAgICkuc3Vic2NyaWJlKCgpID0+IHRoaXMuX2NoYW5nZURldGVjdG9yUmVmLm1hcmtGb3JDaGVjaygpKTtcbiAgfVxufVxuIiwiPGJ1dHRvblxuICBjbGFzcz1cImJ0biBidG4tY2lyY2xlIGJ0bi1naG9zdCBidG4tc21cIlxuICBbZGlzYWJsZWRdPVwiZGlzYWJsZWRcIlxuPlxuICA8c3ZnXG4gICAgY2xhc3M9XCJ3LTYgaC02XCJcbiAgICB2aWV3Qm94PVwiMCAwIDI0IDI0XCJcbiAgICBmaWxsPVwibm9uZVwiXG4gICAgc3Ryb2tlLXdpZHRoPVwiMS41XCJcbiAgICBzdHJva2U9XCJjdXJyZW50Q29sb3JcIlxuICAgIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIlxuICA+XG4gICAgPHBhdGhcbiAgICAgIHN0cm9rZS1saW5lY2FwPVwicm91bmRcIlxuICAgICAgc3Ryb2tlLWxpbmVqb2luPVwicm91bmRcIlxuICAgICAgZD1cIk02Ljc1IDN2Mi4yNU0xNy4yNSAzdjIuMjVNMyAxOC43NVY3LjVhMi4yNSAyLjI1IDAgMCAxIDIuMjUtMi4yNWgxMy41QTIuMjUgMi4yNSAwIDAgMSAyMSA3LjV2MTEuMjVtLTE4IDBBMi4yNSAyLjI1IDAgMCAwIDUuMjUgMjFoMTMuNUEyLjI1IDIuMjUgMCAwIDAgMjEgMTguNzVtLTE4IDB2LTcuNUEyLjI1IDIuMjUgMCAwIDEgNS4yNSA5aDEzLjVBMi4yNSAyLjI1IDAgMCAxIDIxIDExLjI1djcuNVwiXG4gICAgLz5cbiAgPC9zdmc+XG48L2J1dHRvbj5cbiJdfQ==
