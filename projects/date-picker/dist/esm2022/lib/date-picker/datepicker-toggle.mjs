/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/* eslint-disable @angular-eslint/no-input-rename */
import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation, booleanAttribute, } from '@angular/core';
import { merge, of as observableOf, Subscription } from 'rxjs';
import * as i0 from "@angular/core";
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
        const inputStateChanged = this.datepicker && this.datepicker.datepickerInput
            ? this.datepicker.datepickerInput.stateChanges
            : observableOf();
        const datepickerToggled = this.datepicker
            ? merge(this.datepicker.openedStream, this.datepicker.closedStream)
            : observableOf();
        this._stateChanges.unsubscribe();
        this._stateChanges = merge(datepickerStateChanged, inputStateChanged, datepickerToggled).subscribe(() => this._changeDetectorRef.markForCheck());
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: DatepickerToggle, deps: [{ token: i0.ChangeDetectorRef }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "16.1.0", version: "18.2.8", type: DatepickerToggle, isStandalone: true, selector: "datepicker-toggle", inputs: { datepicker: ["for", "datepicker"], ariaLabel: ["aria-label", "ariaLabel"], disabled: ["disabled", "disabled", booleanAttribute] }, host: { listeners: { "click": "_open($event)" } }, exportAs: ["datepickerToggle"], usesOnChanges: true, ngImport: i0, template: "<button\n  class=\"btn btn-circle btn-ghost btn-sm\"\n  [disabled]=\"disabled\"\n>\n  <svg\n    class=\"w-6 h-6\"\n    viewBox=\"0 0 24 24\"\n    fill=\"none\"\n    stroke-width=\"1.5\"\n    stroke=\"currentColor\"\n    xmlns=\"http://www.w3.org/2000/svg\"\n  >\n    <path\n      stroke-linecap=\"round\"\n      stroke-linejoin=\"round\"\n      d=\"M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5\"\n    />\n  </svg>\n</button>\n", changeDetection: i0.ChangeDetectionStrategy.OnPush, encapsulation: i0.ViewEncapsulation.None });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.8", ngImport: i0, type: DatepickerToggle, decorators: [{
            type: Component,
            args: [{ selector: 'datepicker-toggle', host: {
                        '(click)': '_open($event)',
                    }, standalone: true, exportAs: 'datepickerToggle', encapsulation: ViewEncapsulation.None, changeDetection: ChangeDetectionStrategy.OnPush, template: "<button\n  class=\"btn btn-circle btn-ghost btn-sm\"\n  [disabled]=\"disabled\"\n>\n  <svg\n    class=\"w-6 h-6\"\n    viewBox=\"0 0 24 24\"\n    fill=\"none\"\n    stroke-width=\"1.5\"\n    stroke=\"currentColor\"\n    xmlns=\"http://www.w3.org/2000/svg\"\n  >\n    <path\n      stroke-linecap=\"round\"\n      stroke-linejoin=\"round\"\n      d=\"M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5\"\n    />\n  </svg>\n</button>\n" }]
        }], ctorParameters: () => [{ type: i0.ChangeDetectorRef }], propDecorators: { datepicker: [{
                type: Input,
                args: ['for']
            }], ariaLabel: [{
                type: Input,
                args: ['aria-label']
            }], disabled: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZXBpY2tlci10b2dnbGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvbGliL2RhdGUtcGlja2VyL2RhdGVwaWNrZXItdG9nZ2xlLnRzIiwiLi4vLi4vLi4vLi4vc3JjL2xpYi9kYXRlLXBpY2tlci9kYXRlcGlja2VyLXRvZ2dsZS5odG1sIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILG9EQUFvRDtBQUVwRCxPQUFPLEVBRUwsdUJBQXVCLEVBRXZCLFNBQVMsRUFDVCxLQUFLLEVBSUwsaUJBQWlCLEVBQ2pCLGdCQUFnQixHQUNqQixNQUFNLGVBQWUsQ0FBQztBQUV2QixPQUFPLEVBQUUsS0FBSyxFQUFjLEVBQUUsSUFBSSxZQUFZLEVBQUUsWUFBWSxFQUFFLE1BQU0sTUFBTSxDQUFDOztBQWMzRSxNQUFNLE9BQU8sZ0JBQWdCO0lBdUJQO0lBdEJaLGFBQWEsR0FBRyxZQUFZLENBQUMsS0FBSyxDQUFDO0lBRTNDLHVEQUF1RDtJQUN6QyxVQUFVLENBQTZDO0lBRXJFLDBDQUEwQztJQUNyQixTQUFTLENBQVM7SUFFdkMsNkNBQTZDO0lBQzdDLElBQ0ksUUFBUTtRQUNWLElBQUksSUFBSSxDQUFDLFNBQVMsS0FBSyxTQUFTLElBQUksSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBQ3BELE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUM7UUFDbEMsQ0FBQztRQUVELE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUM7SUFDMUIsQ0FBQztJQUNELElBQUksUUFBUSxDQUFDLEtBQWM7UUFDekIsSUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7SUFDekIsQ0FBQztJQUNPLFNBQVMsQ0FBVTtJQUUzQixZQUFvQixrQkFBcUM7UUFBckMsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFtQjtJQUFHLENBQUM7SUFFN0QsV0FBVyxDQUFDLE9BQXNCO1FBQ2hDLElBQUksT0FBTyxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUM7WUFDMUIsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7UUFDNUIsQ0FBQztJQUNILENBQUM7SUFFRCxXQUFXO1FBQ1QsSUFBSSxDQUFDLGFBQWEsQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUNuQyxDQUFDO0lBRUQsa0JBQWtCO1FBQ2hCLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO0lBQzVCLENBQUM7SUFFRCxLQUFLLENBQUMsS0FBWTtRQUNoQixJQUFJLElBQUksQ0FBQyxVQUFVLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDdEMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUN2QixLQUFLLENBQUMsZUFBZSxFQUFFLENBQUM7UUFDMUIsQ0FBQztJQUNILENBQUM7SUFFTyxrQkFBa0I7UUFDeEIsTUFBTSxzQkFBc0IsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDL0YsTUFBTSxpQkFBaUIsR0FDckIsSUFBSSxDQUFDLFVBQVUsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLGVBQWU7WUFDaEQsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsZUFBZSxDQUFDLFlBQVk7WUFDOUMsQ0FBQyxDQUFDLFlBQVksRUFBRSxDQUFDO1FBQ3JCLE1BQU0saUJBQWlCLEdBQUcsSUFBSSxDQUFDLFVBQVU7WUFDdkMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQztZQUNuRSxDQUFDLENBQUMsWUFBWSxFQUFFLENBQUM7UUFFbkIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUVqQyxJQUFJLENBQUMsYUFBYSxHQUFHLEtBQUssQ0FDeEIsc0JBQTBDLEVBQzFDLGlCQUFpQixFQUNqQixpQkFBaUIsQ0FDbEIsQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFlBQVksRUFBRSxDQUFDLENBQUM7SUFDNUQsQ0FBQzt1R0EvRFUsZ0JBQWdCOzJGQUFoQixnQkFBZ0IsNktBVVAsZ0JBQWdCLHFJQy9DdEMsaW1CQW1CQTs7MkZEa0JhLGdCQUFnQjtrQkFYNUIsU0FBUzsrQkFDRSxtQkFBbUIsUUFFdkI7d0JBQ0osU0FBUyxFQUFFLGVBQWU7cUJBQzNCLGNBQ1csSUFBSSxZQUNOLGtCQUFrQixpQkFDYixpQkFBaUIsQ0FBQyxJQUFJLG1CQUNwQix1QkFBdUIsQ0FBQyxNQUFNO3NGQU1qQyxVQUFVO3NCQUF2QixLQUFLO3VCQUFDLEtBQUs7Z0JBR1MsU0FBUztzQkFBN0IsS0FBSzt1QkFBQyxZQUFZO2dCQUlmLFFBQVE7c0JBRFgsS0FBSzt1QkFBQyxFQUFFLFNBQVMsRUFBRSxnQkFBZ0IsRUFBRSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG4vKiBlc2xpbnQtZGlzYWJsZSBAYW5ndWxhci1lc2xpbnQvbm8taW5wdXQtcmVuYW1lICovXG5cbmltcG9ydCB7XG4gIEFmdGVyQ29udGVudEluaXQsXG4gIENoYW5nZURldGVjdGlvblN0cmF0ZWd5LFxuICBDaGFuZ2VEZXRlY3RvclJlZixcbiAgQ29tcG9uZW50LFxuICBJbnB1dCxcbiAgT25DaGFuZ2VzLFxuICBPbkRlc3Ryb3ksXG4gIFNpbXBsZUNoYW5nZXMsXG4gIFZpZXdFbmNhcHN1bGF0aW9uLFxuICBib29sZWFuQXR0cmlidXRlLFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgbWVyZ2UsIE9ic2VydmFibGUsIG9mIGFzIG9ic2VydmFibGVPZiwgU3Vic2NyaXB0aW9uIH0gZnJvbSAncnhqcyc7XG5pbXBvcnQgeyBEYXRlcGlja2VyQ29udHJvbCwgRGF0ZXBpY2tlclBhbmVsIH0gZnJvbSAnLi9kYXRlcGlja2VyLWJhc2UnO1xuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdkYXRlcGlja2VyLXRvZ2dsZScsXG4gIHRlbXBsYXRlVXJsOiAnZGF0ZXBpY2tlci10b2dnbGUuaHRtbCcsXG4gIGhvc3Q6IHtcbiAgICAnKGNsaWNrKSc6ICdfb3BlbigkZXZlbnQpJyxcbiAgfSxcbiAgc3RhbmRhbG9uZTogdHJ1ZSxcbiAgZXhwb3J0QXM6ICdkYXRlcGlja2VyVG9nZ2xlJyxcbiAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24uTm9uZSxcbiAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5PblB1c2gsXG59KVxuZXhwb3J0IGNsYXNzIERhdGVwaWNrZXJUb2dnbGU8RD4gaW1wbGVtZW50cyBBZnRlckNvbnRlbnRJbml0LCBPbkNoYW5nZXMsIE9uRGVzdHJveSB7XG4gIHByaXZhdGUgX3N0YXRlQ2hhbmdlcyA9IFN1YnNjcmlwdGlvbi5FTVBUWTtcblxuICAvKiogRGF0ZXBpY2tlciBpbnN0YW5jZSB0aGF0IHRoZSBidXR0b24gd2lsbCB0b2dnbGUuICovXG4gIEBJbnB1dCgnZm9yJykgZGF0ZXBpY2tlcjogRGF0ZXBpY2tlclBhbmVsPERhdGVwaWNrZXJDb250cm9sPGFueT4sIEQ+O1xuXG4gIC8qKiBTY3JlZW4tcmVhZGVyIGxhYmVsIGZvciB0aGUgYnV0dG9uLiAqL1xuICBASW5wdXQoJ2FyaWEtbGFiZWwnKSBhcmlhTGFiZWw6IHN0cmluZztcblxuICAvKiogV2hldGhlciB0aGUgdG9nZ2xlIGJ1dHRvbiBpcyBkaXNhYmxlZC4gKi9cbiAgQElucHV0KHsgdHJhbnNmb3JtOiBib29sZWFuQXR0cmlidXRlIH0pXG4gIGdldCBkaXNhYmxlZCgpOiBib29sZWFuIHtcbiAgICBpZiAodGhpcy5fZGlzYWJsZWQgPT09IHVuZGVmaW5lZCAmJiB0aGlzLmRhdGVwaWNrZXIpIHtcbiAgICAgIHJldHVybiB0aGlzLmRhdGVwaWNrZXIuZGlzYWJsZWQ7XG4gICAgfVxuXG4gICAgcmV0dXJuICEhdGhpcy5fZGlzYWJsZWQ7XG4gIH1cbiAgc2V0IGRpc2FibGVkKHZhbHVlOiBib29sZWFuKSB7XG4gICAgdGhpcy5fZGlzYWJsZWQgPSB2YWx1ZTtcbiAgfVxuICBwcml2YXRlIF9kaXNhYmxlZDogYm9vbGVhbjtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9jaGFuZ2VEZXRlY3RvclJlZjogQ2hhbmdlRGV0ZWN0b3JSZWYpIHt9XG5cbiAgbmdPbkNoYW5nZXMoY2hhbmdlczogU2ltcGxlQ2hhbmdlcykge1xuICAgIGlmIChjaGFuZ2VzWydkYXRlcGlja2VyJ10pIHtcbiAgICAgIHRoaXMuX3dhdGNoU3RhdGVDaGFuZ2VzKCk7XG4gICAgfVxuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgdGhpcy5fc3RhdGVDaGFuZ2VzLnVuc3Vic2NyaWJlKCk7XG4gIH1cblxuICBuZ0FmdGVyQ29udGVudEluaXQoKSB7XG4gICAgdGhpcy5fd2F0Y2hTdGF0ZUNoYW5nZXMoKTtcbiAgfVxuXG4gIF9vcGVuKGV2ZW50OiBFdmVudCk6IHZvaWQge1xuICAgIGlmICh0aGlzLmRhdGVwaWNrZXIgJiYgIXRoaXMuZGlzYWJsZWQpIHtcbiAgICAgIHRoaXMuZGF0ZXBpY2tlci5vcGVuKCk7XG4gICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF93YXRjaFN0YXRlQ2hhbmdlcygpIHtcbiAgICBjb25zdCBkYXRlcGlja2VyU3RhdGVDaGFuZ2VkID0gdGhpcy5kYXRlcGlja2VyID8gdGhpcy5kYXRlcGlja2VyLnN0YXRlQ2hhbmdlcyA6IG9ic2VydmFibGVPZigpO1xuICAgIGNvbnN0IGlucHV0U3RhdGVDaGFuZ2VkID1cbiAgICAgIHRoaXMuZGF0ZXBpY2tlciAmJiB0aGlzLmRhdGVwaWNrZXIuZGF0ZXBpY2tlcklucHV0XG4gICAgICAgID8gdGhpcy5kYXRlcGlja2VyLmRhdGVwaWNrZXJJbnB1dC5zdGF0ZUNoYW5nZXNcbiAgICAgICAgOiBvYnNlcnZhYmxlT2YoKTtcbiAgICBjb25zdCBkYXRlcGlja2VyVG9nZ2xlZCA9IHRoaXMuZGF0ZXBpY2tlclxuICAgICAgPyBtZXJnZSh0aGlzLmRhdGVwaWNrZXIub3BlbmVkU3RyZWFtLCB0aGlzLmRhdGVwaWNrZXIuY2xvc2VkU3RyZWFtKVxuICAgICAgOiBvYnNlcnZhYmxlT2YoKTtcblxuICAgIHRoaXMuX3N0YXRlQ2hhbmdlcy51bnN1YnNjcmliZSgpO1xuXG4gICAgdGhpcy5fc3RhdGVDaGFuZ2VzID0gbWVyZ2UoXG4gICAgICBkYXRlcGlja2VyU3RhdGVDaGFuZ2VkIGFzIE9ic2VydmFibGU8dm9pZD4sXG4gICAgICBpbnB1dFN0YXRlQ2hhbmdlZCxcbiAgICAgIGRhdGVwaWNrZXJUb2dnbGVkXG4gICAgKS5zdWJzY3JpYmUoKCkgPT4gdGhpcy5fY2hhbmdlRGV0ZWN0b3JSZWYubWFya0ZvckNoZWNrKCkpO1xuICB9XG59XG4iLCI8YnV0dG9uXG4gIGNsYXNzPVwiYnRuIGJ0bi1jaXJjbGUgYnRuLWdob3N0IGJ0bi1zbVwiXG4gIFtkaXNhYmxlZF09XCJkaXNhYmxlZFwiXG4+XG4gIDxzdmdcbiAgICBjbGFzcz1cInctNiBoLTZcIlxuICAgIHZpZXdCb3g9XCIwIDAgMjQgMjRcIlxuICAgIGZpbGw9XCJub25lXCJcbiAgICBzdHJva2Utd2lkdGg9XCIxLjVcIlxuICAgIHN0cm9rZT1cImN1cnJlbnRDb2xvclwiXG4gICAgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiXG4gID5cbiAgICA8cGF0aFxuICAgICAgc3Ryb2tlLWxpbmVjYXA9XCJyb3VuZFwiXG4gICAgICBzdHJva2UtbGluZWpvaW49XCJyb3VuZFwiXG4gICAgICBkPVwiTTYuNzUgM3YyLjI1TTE3LjI1IDN2Mi4yNU0zIDE4Ljc1VjcuNWEyLjI1IDIuMjUgMCAwIDEgMi4yNS0yLjI1aDEzLjVBMi4yNSAyLjI1IDAgMCAxIDIxIDcuNXYxMS4yNW0tMTggMEEyLjI1IDIuMjUgMCAwIDAgNS4yNSAyMWgxMy41QTIuMjUgMi4yNSAwIDAgMCAyMSAxOC43NW0tMTggMHYtNy41QTIuMjUgMi4yNSAwIDAgMSA1LjI1IDloMTMuNUEyLjI1IDIuMjUgMCAwIDEgMjEgMTEuMjV2Ny41XCJcbiAgICAvPlxuICA8L3N2Zz5cbjwvYnV0dG9uPlxuIl19