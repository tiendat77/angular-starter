import { Component, ContentChild, Input, ViewChild, ViewEncapsulation, } from '@angular/core';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { PortalModule } from '@angular/cdk/portal';
import { Subject, fromEvent, takeUntil } from 'rxjs';
import { ScrollbarDirective } from '@libs/scrollbar';
import { DialogActionsDirective } from './dialog-actions.directive';
import { DialogBodyDirective } from './dialog-body.directive';
import { DialogDismissDirective } from './dialog-dismiss.directive';
import { DialogHeaderDirective } from './dialog-header.directive';
import { DialogTitleDirective } from './dialog-title.directive';
import * as i0 from "@angular/core";
import * as i1 from "@libs/scrollbar";
import * as i2 from "@angular/cdk/portal";
export class DialogLayoutComponent {
    _element;
    /**
     * Input
     */
    get alert() {
        return this._alert;
    }
    set alert(value) {
        this._alert = coerceBooleanProperty(value);
    }
    _alert = false;
    get fullscreen() {
        return this._fullscreen;
    }
    set fullscreen(value) {
        this._fullscreen = coerceBooleanProperty(value);
    }
    _fullscreen = false;
    /**
     * Content children
     */
    /** Content for the dialog title given by `<ng-template dialog-title>`. */
    _titleTemplate;
    /** Content for the dialog title given by `<ng-template dialog-actions>`. */
    _actionTemplate;
    /** Content for the dialog title given by `<ng-template dialog-body>`. */
    _bodyTemplate;
    _headerRef;
    _hasTitle = false;
    /**
     * Private properties
     */
    _destroyed$ = new Subject();
    constructor(_element) {
        this._element = _element;
    }
    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------
    ngAfterViewInit() {
        /**
         * Watch scroll event to slide the header up
         */
        fromEvent(this._element?.nativeElement, 'scroll')
            .pipe(takeUntil(this._destroyed$))
            .subscribe((event) => {
            this._onScroll(event);
        });
    }
    ngAfterContentInit() {
        this._checkTitleTypes();
    }
    ngOnDestroy() {
        this._destroyed$.next();
        this._destroyed$.complete();
    }
    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------
    _checkTitleTypes() {
        this._hasTitle = !!this._titleTemplate;
    }
    _onScroll(event) {
        if (this._getScrollTop(event) > 35) {
            this._headerRef?.visibility(true);
        }
        else {
            this._headerRef?.visibility(false);
        }
    }
    _getScrollTop(event) {
        return event?.target.scrollTop || event?.target?.documentElement?.scrollTop || 0;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.13", ngImport: i0, type: DialogLayoutComponent, deps: [{ token: i0.ElementRef }], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "18.2.13", type: DialogLayoutComponent, isStandalone: true, selector: "dialog-layout", inputs: { alert: "alert", fullscreen: "fullscreen" }, host: { properties: { "class.just-dialog": "!alert", "class.alert-dialog": "alert", "class.full-screen-dialog": "fullscreen" }, classAttribute: "animate__fadeInUp animate__animated animate__faster" }, queries: [{ propertyName: "_titleTemplate", first: true, predicate: DialogTitleDirective, descendants: true }, { propertyName: "_actionTemplate", first: true, predicate: DialogActionsDirective, descendants: true }, { propertyName: "_bodyTemplate", first: true, predicate: DialogBodyDirective, descendants: true }], viewQueries: [{ propertyName: "_headerRef", first: true, predicate: DialogHeaderDirective, descendants: true }], hostDirectives: [{ directive: i1.ScrollbarDirective }], ngImport: i0, template: "<!-- Header -->\n<div\n  class=\"min-h-18 sticky top-0 z-10 flex w-full items-center justify-center bg-base-100 p-3 transition duration-300 lg:px-4\"\n>\n  <div class=\"flex-auto overflow-hidden\">\n    @if (_hasTitle) {\n      <h2\n        dialogHeader\n        class=\"animate__animated animate__faster animate__slideInUp truncate text-lg font-semibold sm:text-xl\"\n      >\n        <ng-template [cdkPortalOutlet]=\"_titleTemplate\" />\n      </h2>\n    }\n  </div>\n\n  <div class=\"relative flex-shrink-0\">\n    <button\n      dialogDismiss\n      class=\"group btn btn-circle btn-ghost btn-sm\"\n    >\n      <svg\n        fill=\"currentColor\"\n        viewBox=\"0 0 20 20\"\n        xmlns=\"http://www.w3.org/2000/svg\"\n        class=\"h-6 w-6 transition duration-500 group-hover:rotate-90\"\n      >\n        <path\n          d=\"M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z\"\n        />\n      </svg>\n    </button>\n  </div>\n</div>\n\n<div class=\"mb-3 w-full px-3 lg:px-4\">\n  @if (_hasTitle) {\n    <h2 class=\"truncate text-2xl font-semibold\">\n      <ng-template [cdkPortalOutlet]=\"_titleTemplate\" />\n    </h2>\n  }\n</div>\n\n<!-- Body -->\n<div class=\"flex w-full flex-auto flex-col px-3 py-4 lg:px-4\">\n  <ng-template [cdkPortalOutlet]=\"_bodyTemplate\" />\n</div>\n\n<!-- Footer -->\n<div class=\"dialog-actions sticky bottom-0 z-10 flex w-full items-center gap-4 bg-base-100 p-3 sm:justify-end lg:px-4\">\n  <ng-template [cdkPortalOutlet]=\"_actionTemplate\" />\n</div>\n", styles: ["dialog-layout{position:relative;z-index:0;display:flex;flex-direction:column;overflow-x:hidden;overflow-y:auto;transition:.2s}dialog-layout.just-dialog{width:100vw;height:100vh}@media screen and (min-width: 640px){dialog-layout.just-dialog{border-radius:.375rem;width:100%;height:100%;max-width:95vw;max-height:95vh}}dialog-layout.alert-dialog{border-radius:.375rem;width:auto;height:auto;max-width:90vw;max-height:90vh}@media screen and (min-width: 640px){dialog-layout.alert-dialog{max-width:40rem}}dialog-layout.full-screen-dialog{width:100vw;height:100vh}\n"], dependencies: [{ kind: "ngmodule", type: PortalModule }, { kind: "directive", type: i2.CdkPortalOutlet, selector: "[cdkPortalOutlet]", inputs: ["cdkPortalOutlet"], outputs: ["attached"], exportAs: ["cdkPortalOutlet"] }, { kind: "directive", type: DialogDismissDirective, selector: "[dialog-dismiss], [dialogDismiss]" }, { kind: "directive", type: DialogHeaderDirective, selector: "[dialog-header], [dialogHeader]" }], encapsulation: i0.ViewEncapsulation.None });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.13", ngImport: i0, type: DialogLayoutComponent, decorators: [{
            type: Component,
            args: [{ standalone: true, selector: 'dialog-layout', encapsulation: ViewEncapsulation.None, imports: [
                        PortalModule,
                        ScrollbarDirective,
                        DialogActionsDirective,
                        DialogBodyDirective,
                        DialogDismissDirective,
                        DialogHeaderDirective,
                        DialogTitleDirective,
                    ], hostDirectives: [ScrollbarDirective], host: {
                        '[class.just-dialog]': '!alert',
                        '[class.alert-dialog]': 'alert',
                        '[class.full-screen-dialog]': 'fullscreen',
                        class: 'animate__fadeInUp animate__animated animate__faster',
                    }, template: "<!-- Header -->\n<div\n  class=\"min-h-18 sticky top-0 z-10 flex w-full items-center justify-center bg-base-100 p-3 transition duration-300 lg:px-4\"\n>\n  <div class=\"flex-auto overflow-hidden\">\n    @if (_hasTitle) {\n      <h2\n        dialogHeader\n        class=\"animate__animated animate__faster animate__slideInUp truncate text-lg font-semibold sm:text-xl\"\n      >\n        <ng-template [cdkPortalOutlet]=\"_titleTemplate\" />\n      </h2>\n    }\n  </div>\n\n  <div class=\"relative flex-shrink-0\">\n    <button\n      dialogDismiss\n      class=\"group btn btn-circle btn-ghost btn-sm\"\n    >\n      <svg\n        fill=\"currentColor\"\n        viewBox=\"0 0 20 20\"\n        xmlns=\"http://www.w3.org/2000/svg\"\n        class=\"h-6 w-6 transition duration-500 group-hover:rotate-90\"\n      >\n        <path\n          d=\"M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z\"\n        />\n      </svg>\n    </button>\n  </div>\n</div>\n\n<div class=\"mb-3 w-full px-3 lg:px-4\">\n  @if (_hasTitle) {\n    <h2 class=\"truncate text-2xl font-semibold\">\n      <ng-template [cdkPortalOutlet]=\"_titleTemplate\" />\n    </h2>\n  }\n</div>\n\n<!-- Body -->\n<div class=\"flex w-full flex-auto flex-col px-3 py-4 lg:px-4\">\n  <ng-template [cdkPortalOutlet]=\"_bodyTemplate\" />\n</div>\n\n<!-- Footer -->\n<div class=\"dialog-actions sticky bottom-0 z-10 flex w-full items-center gap-4 bg-base-100 p-3 sm:justify-end lg:px-4\">\n  <ng-template [cdkPortalOutlet]=\"_actionTemplate\" />\n</div>\n", styles: ["dialog-layout{position:relative;z-index:0;display:flex;flex-direction:column;overflow-x:hidden;overflow-y:auto;transition:.2s}dialog-layout.just-dialog{width:100vw;height:100vh}@media screen and (min-width: 640px){dialog-layout.just-dialog{border-radius:.375rem;width:100%;height:100%;max-width:95vw;max-height:95vh}}dialog-layout.alert-dialog{border-radius:.375rem;width:auto;height:auto;max-width:90vw;max-height:90vh}@media screen and (min-width: 640px){dialog-layout.alert-dialog{max-width:40rem}}dialog-layout.full-screen-dialog{width:100vw;height:100vh}\n"] }]
        }], ctorParameters: () => [{ type: i0.ElementRef }], propDecorators: { alert: [{
                type: Input
            }], fullscreen: [{
                type: Input
            }], _titleTemplate: [{
                type: ContentChild,
                args: [DialogTitleDirective]
            }], _actionTemplate: [{
                type: ContentChild,
                args: [DialogActionsDirective]
            }], _bodyTemplate: [{
                type: ContentChild,
                args: [DialogBodyDirective]
            }], _headerRef: [{
                type: ViewChild,
                args: [DialogHeaderDirective]
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlhbG9nLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL2xpYnMvZGlhbG9nL3NyYy9saWIvZGlhbG9nLmNvbXBvbmVudC50cyIsIi4uLy4uLy4uLy4uL2xpYnMvZGlhbG9nL3NyYy9saWIvZGlhbG9nLmNvbXBvbmVudC5odG1sIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFHTCxTQUFTLEVBQ1QsWUFBWSxFQUVaLEtBQUssRUFFTCxTQUFTLEVBQ1QsaUJBQWlCLEdBQ2xCLE1BQU0sZUFBZSxDQUFDO0FBRXZCLE9BQU8sRUFBZ0IscUJBQXFCLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUM1RSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFDbkQsT0FBTyxFQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBRXJELE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQ3JELE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQ3BFLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQzlELE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQ3BFLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBQ2xFLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLDBCQUEwQixDQUFDOzs7O0FBeUJoRSxNQUFNLE9BQU8scUJBQXFCO0lBK0NaO0lBOUNwQjs7T0FFRztJQUNILElBQ0ksS0FBSztRQUNQLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQztJQUNyQixDQUFDO0lBQ0QsSUFBSSxLQUFLLENBQUMsS0FBbUI7UUFDM0IsSUFBSSxDQUFDLE1BQU0sR0FBRyxxQkFBcUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUM3QyxDQUFDO0lB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QURSLEtBQUs7Z0JBVUYsVUFBVTtzQkFEYixLQUFLO2dCQWNJLGNBQWM7c0JBRHZCLFlBQVk7dUJBQUMsb0JBQW9CO2dCQUt4QixlQUFlO3NCQUR4QixZQUFZO3VCQUFDLHNCQUFzQjtnQkFLMUIsYUFBYTtzQkFEdEIsWUFBWTt1QkFBQyxtQkFBbUI7Z0JBSXpCLFVBQVU7c0JBRGpCLFNBQVM7dUJBQUMscUJBQXFCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgQWZ0ZXJDb250ZW50SW5pdCxcbiAgQWZ0ZXJWaWV3SW5pdCxcbiAgQ29tcG9uZW50LFxuICBDb250ZW50Q2hpbGQsXG4gIEVsZW1lbnRSZWYsXG4gIElucHV0LFxuICBPbkRlc3Ryb3ksXG4gIFZpZXdDaGlsZCxcbiAgVmlld0VuY2Fwc3VsYXRpb24sXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyBCb29sZWFuSW5wdXQsIGNvZXJjZUJvb2xlYW5Qcm9wZXJ0eSB9IGZyb20gJ0Bhbmd1bGFyL2Nkay9jb2VyY2lvbic7XG5pbXBvcnQgeyBQb3J0YWxNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jZGsvcG9ydGFsJztcbmltcG9ydCB7IFN1YmplY3QsIGZyb21FdmVudCwgdGFrZVVudGlsIH0gZnJvbSAncnhqcyc7XG5cbmltcG9ydCB7IFNjcm9sbGJhckRpcmVjdGl2ZSB9IGZyb20gJ0BsaWJzL3Njcm9sbGJhcic7XG5pbXBvcnQgeyBEaWFsb2dBY3Rpb25zRGlyZWN0aXZlIH0gZnJvbSAnLi9kaWFsb2ctYWN0aW9ucy5kaXJlY3RpdmUnO1xuaW1wb3J0IHsgRGlhbG9nQm9keURpcmVjdGl2ZSB9IGZyb20gJy4vZGlhbG9nLWJvZHkuZGlyZWN0aXZlJztcbmltcG9ydCB7IERpYWxvZ0Rpc21pc3NEaXJlY3RpdmUgfSBmcm9tICcuL2RpYWxvZy1kaXNtaXNzLmRpcmVjdGl2ZSc7XG5pbXBvcnQgeyBEaWFsb2dIZWFkZXJEaXJlY3RpdmUgfSBmcm9tICcuL2RpYWxvZy1oZWFkZXIuZGlyZWN0aXZlJztcbmltcG9ydCB7IERpYWxvZ1RpdGxlRGlyZWN0aXZlIH0gZnJvbSAnLi9kaWFsb2ctdGl0bGUuZGlyZWN0aXZlJztcblxuQENvbXBvbmVudCh7XG4gIHN0YW5kYWxvbmU6IHRydWUsXG4gIHNlbGVjdG9yOiAnZGlhbG9nLWxheW91dCcsXG4gIHRlbXBsYXRlVXJsOiAnLi9kaWFsb2cuY29tcG9uZW50Lmh0bWwnLFxuICBzdHlsZVVybDogJy4vZGlhbG9nLmNvbXBvbmVudC5zY3NzJyxcbiAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24uTm9uZSxcbiAgaW1wb3J0czogW1xuICAgIFBvcnRhbE1vZHVsZSxcbiAgICBTY3JvbGxiYXJEaXJlY3RpdmUsXG4gICAgRGlhbG9nQWN0aW9uc0RpcmVjdGl2ZSxcbiAgICBEaWFsb2dCb2R5RGlyZWN0aXZlLFxuICAgIERpYWxvZ0Rpc21pc3NEaXJlY3RpdmUsXG4gICAgRGlhbG9nSGVhZGVyRGlyZWN0aXZlLFxuICAgIERpYWxvZ1RpdGxlRGlyZWN0aXZlLFxuICBdLFxuICBob3N0RGlyZWN0aXZlczogW1Njcm9sbGJhckRpcmVjdGl2ZV0sXG4gIGhvc3Q6IHtcbiAgICAnW2NsYXNzLmp1c3QtZGlhbG9nXSc6ICchYWxlcnQnLFxuICAgICdbY2xhc3MuYWxlcnQtZGlhbG9nXSc6ICdhbGVydCcsXG4gICAgJ1tjbGFzcy5mdWxsLXNjcmVlbi1kaWFsb2ddJzogJ2Z1bGxzY3JlZW4nLFxuICAgIGNsYXNzOiAnYW5pbWF0ZV9fZmFkZUluVXAgYW5pbWF0ZV9fYW5pbWF0ZWQgYW5pbWF0ZV9fZmFzdGVyJyxcbiAgfSxcbn0pXG5leHBvcnQgY2xhc3MgRGlhbG9nTGF5b3V0Q29tcG9uZW50IGltcGxlbWVudHMgQWZ0ZXJWaWV3SW5pdCwgQWZ0ZXJDb250ZW50SW5pdCwgT25EZXN0cm95IHtcbiAgLyoqXG4gICAqIElucHV0XG4gICAqL1xuICBASW5wdXQoKVxuICBnZXQgYWxlcnQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2FsZXJ0O1xuICB9XG4gIHNldCBhbGVydCh2YWx1ZTogQm9vbGVhbklucHV0KSB7XG4gICAgdGhpcy5fYWxlcnQgPSBjb2VyY2VCb29sZWFuUHJvcGVydHkodmFsdWUpO1xuICB9XG4gIHByaXZhdGUgX2FsZXJ0ID0gZmFsc2U7XG5cbiAgQElucHV0KClcbiAgZ2V0IGZ1bGxzY3JlZW4oKSB7XG4gICAgcmV0dXJuIHRoaXMuX2Z1bGxzY3JlZW47XG4gIH1cbiAgc2V0IGZ1bGxzY3JlZW4odmFsdWU6IEJvb2xlYW5JbnB1dCkge1xuICAgIHRoaXMuX2Z1bGxzY3JlZW4gPSBjb2VyY2VCb29sZWFuUHJvcGVydHkodmFsdWUpO1xuICB9XG4gIHByaXZhdGUgX2Z1bGxzY3JlZW4gPSBmYWxzZTtcblxuICAvKipcbiAgICogQ29udGVudCBjaGlsZHJlblxuICAgKi9cbiAgLyoqIENvbnRlbnQgZm9yIHRoZSBkaWFsb2cgdGl0bGUgZ2l2ZW4gYnkgYDxuZy10ZW1wbGF0ZSBkaWFsb2ctdGl0bGU+YC4gKi9cbiAgQENvbnRlbnRDaGlsZChEaWFsb2dUaXRsZURpcmVjdGl2ZSlcbiAgcHJvdGVjdGVkIF90aXRsZVRlbXBsYXRlOiBEaWFsb2dUaXRsZURpcmVjdGl2ZSB8IHVuZGVmaW5lZDtcblxuICAvKiogQ29udGVudCBmb3IgdGhlIGRpYWxvZyB0aXRsZSBnaXZlbiBieSBgPG5nLXRlbXBsYXRlIGRpYWxvZy1hY3Rpb25zPmAuICovXG4gIEBDb250ZW50Q2hpbGQoRGlhbG9nQWN0aW9uc0RpcmVjdGl2ZSlcbiAgcHJvdGVjdGVkIF9hY3Rpb25UZW1wbGF0ZTogRGlhbG9nQWN0aW9uc0RpcmVjdGl2ZSB8IHVuZGVmaW5lZDtcblxuICAvKiogQ29udGVudCBmb3IgdGhlIGRpYWxvZyB0aXRsZSBnaXZlbiBieSBgPG5nLXRlbXBsYXRlIGRpYWxvZy1ib2R5PmAuICovXG4gIEBDb250ZW50Q2hpbGQoRGlhbG9nQm9keURpcmVjdGl2ZSlcbiAgcHJvdGVjdGVkIF9ib2R5VGVtcGxhdGU6IERpYWxvZ0JvZHlEaXJlY3RpdmUgfCB1bmRlZmluZWQ7XG5cbiAgQFZpZXdDaGlsZChEaWFsb2dIZWFkZXJEaXJlY3RpdmUpXG4gIHByaXZhdGUgX2hlYWRlclJlZjogRGlhbG9nSGVhZGVyRGlyZWN0aXZlIHwgdW5kZWZpbmVkO1xuXG4gIF9oYXNUaXRsZSA9IGZhbHNlO1xuXG4gIC8qKlxuICAgKiBQcml2YXRlIHByb3BlcnRpZXNcbiAgICovXG4gIHByaXZhdGUgX2Rlc3Ryb3llZCQgPSBuZXcgU3ViamVjdDx2b2lkPigpO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX2VsZW1lbnQ6IEVsZW1lbnRSZWYpIHt9XG5cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gQCBMaWZlY3ljbGUgaG9va3NcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICBuZ0FmdGVyVmlld0luaXQoKTogdm9pZCB7XG4gICAgLyoqXG4gICAgICogV2F0Y2ggc2Nyb2xsIGV2ZW50IHRvIHNsaWRlIHRoZSBoZWFkZXIgdXBcbiAgICAgKi9cbiAgICBmcm9tRXZlbnQodGhpcy5fZWxlbWVudD8ubmF0aXZlRWxlbWVudCwgJ3Njcm9sbCcpXG4gICAgICAucGlwZSh0YWtlVW50aWwodGhpcy5fZGVzdHJveWVkJCkpXG4gICAgICAuc3Vic2NyaWJlKChldmVudCkgPT4ge1xuICAgICAgICB0aGlzLl9vblNjcm9sbChldmVudCk7XG4gICAgICB9KTtcbiAgfVxuXG4gIG5nQWZ0ZXJDb250ZW50SW5pdCgpIHtcbiAgICB0aGlzLl9jaGVja1RpdGxlVHlwZXMoKTtcbiAgfVxuXG4gIG5nT25EZXN0cm95KCk6IHZvaWQge1xuICAgIHRoaXMuX2Rlc3Ryb3llZCQubmV4dCgpO1xuICAgIHRoaXMuX2Rlc3Ryb3llZCQuY29tcGxldGUoKTtcbiAgfVxuXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIEAgUHJpdmF0ZSBtZXRob2RzXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgcHJpdmF0ZSBfY2hlY2tUaXRsZVR5cGVzKCkge1xuICAgIHRoaXMuX2hhc1RpdGxlID0gISF0aGlzLl90aXRsZVRlbXBsYXRlO1xuICB9XG5cbiAgcHJpdmF0ZSBfb25TY3JvbGwoZXZlbnQ6IGFueSkge1xuICAgIGlmICh0aGlzLl9nZXRTY3JvbGxUb3AoZXZlbnQpID4gMzUpIHtcbiAgICAgIHRoaXMuX2hlYWRlclJlZj8udmlzaWJpbGl0eSh0cnVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5faGVhZGVyUmVmPy52aXNpYmlsaXR5KGZhbHNlKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9nZXRTY3JvbGxUb3AoZXZlbnQ6IGFueSkge1xuICAgIHJldHVybiBldmVudD8udGFyZ2V0LnNjcm9sbFRvcCB8fCBldmVudD8udGFyZ2V0Py5kb2N1bWVudEVsZW1lbnQ/LnNjcm9sbFRvcCB8fCAwO1xuICB9XG59XG4iLCI8IS0tIEhlYWRlciAtLT5cbjxkaXZcbiAgY2xhc3M9XCJtaW4taC0xOCBzdGlja3kgdG9wLTAgei0xMCBmbGV4IHctZnVsbCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgYmctYmFzZS0xMDAgcC0zIHRyYW5zaXRpb24gZHVyYXRpb24tMzAwIGxnOnB4LTRcIlxuPlxuICA8ZGl2IGNsYXNzPVwiZmxleC1hdXRvIG92ZXJmbG93LWhpZGRlblwiPlxuICAgIEBpZiAoX2hhc1RpdGxlKSB7XG4gICAgICA8aDJcbiAgICAgICAgZGlhbG9nSGVhZGVyXG4gICAgICAgIGNsYXNzPVwiYW5pbWF0ZV9fYW5pbWF0ZWQgYW5pbWF0ZV9fZmFzdGVyIGFuaW1hdGVfX3NsaWRlSW5VcCB0cnVuY2F0ZSB0ZXh0LWxnIGZvbnQtc2VtaWJvbGQgc206dGV4dC14bFwiXG4gICAgICA+XG4gICAgICAgIDxuZy10ZW1wbGF0ZSBbY2RrUG9ydGFsT3V0bGV0XT1cIl90aXRsZVRlbXBsYXRlXCIgLz5cbiAgICAgIDwvaDI+XG4gICAgfVxuICA8L2Rpdj5cblxuICA8ZGl2IGNsYXNzPVwicmVsYXRpdmUgZmxleC1zaHJpbmstMFwiPlxuICAgIDxidXR0b25cbiAgICAgIGRpYWxvZ0Rpc21pc3NcbiAgICAgIGNsYXNzPVwiZ3JvdXAgYnRuIGJ0bi1jaXJjbGUgYnRuLWdob3N0IGJ0bi1zbVwiXG4gICAgPlxuICAgICAgPHN2Z1xuICAgICAgICBmaWxsPVwiY3VycmVudENvbG9yXCJcbiAgICAgICAgdmlld0JveD1cIjAgMCAyMCAyMFwiXG4gICAgICAgIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIlxuICAgICAgICBjbGFzcz1cImgtNiB3LTYgdHJhbnNpdGlvbiBkdXJhdGlvbi01MDAgZ3JvdXAtaG92ZXI6cm90YXRlLTkwXCJcbiAgICAgID5cbiAgICAgICAgPHBhdGhcbiAgICAgICAgICBkPVwiTTYuMjggNS4yMmEuNzUuNzUgMCAwIDAtMS4wNiAxLjA2TDguOTQgMTBsLTMuNzIgMy43MmEuNzUuNzUgMCAxIDAgMS4wNiAxLjA2TDEwIDExLjA2bDMuNzIgMy43MmEuNzUuNzUgMCAxIDAgMS4wNi0xLjA2TDExLjA2IDEwbDMuNzItMy43MmEuNzUuNzUgMCAwIDAtMS4wNi0xLjA2TDEwIDguOTQgNi4yOCA1LjIyWlwiXG4gICAgICAgIC8+XG4gICAgICA8L3N2Zz5cbiAgICA8L2J1dHRvbj5cbiAgPC9kaXY+XG48L2Rpdj5cblxuPGRpdiBjbGFzcz1cIm1iLTMgdy1mdWxsIHB4LTMgbGc6cHgtNFwiPlxuICBAaWYgKF9oYXNUaXRsZSkge1xuICAgIDxoMiBjbGFzcz1cInRydW5jYXRlIHRleHQtMnhsIGZvbnQtc2VtaWJvbGRcIj5cbiAgICAgIDxuZy10ZW1wbGF0ZSBbY2RrUG9ydGFsT3V0bGV0XT1cIl90aXRsZVRlbXBsYXRlXCIgLz5cbiAgICA8L2gyPlxuICB9XG48L2Rpdj5cblxuPCEtLSBCb2R5IC0tPlxuPGRpdiBjbGFzcz1cImZsZXggdy1mdWxsIGZsZXgtYXV0byBmbGV4LWNvbCBweC0zIHB5LTQgbGc6cHgtNFwiPlxuICA8bmctdGVtcGxhdGUgW2Nka1BvcnRhbE91dGxldF09XCJfYm9keVRlbXBsYXRlXCIgLz5cbjwvZGl2PlxuXG48IS0tIEZvb3RlciAtLT5cbjxkaXYgY2xhc3M9XCJkaWFsb2ctYWN0aW9ucyBzdGlja3kgYm90dG9tLTAgei0xMCBmbGV4IHctZnVsbCBpdGVtcy1jZW50ZXIgZ2FwLTQgYmctYmFzZS0xMDAgcC0zIHNtOmp1c3RpZnktZW5kIGxnOnB4LTRcIj5cbiAgPG5nLXRlbXBsYXRlIFtjZGtQb3J0YWxPdXRsZXRdPVwiX2FjdGlvblRlbXBsYXRlXCIgLz5cbjwvZGl2PlxuIl19