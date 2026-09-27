import { Directive } from '@angular/core';

/** Bold first line of a `ui-alert`. */
@Directive({ selector: '[uiAlertTitle]', host: { class: 'alert-title' } })
export class UiAlertTitleDirective {}

/** Replaces the default icon of a `ui-alert`. */
@Directive({ selector: '[uiAlertIcon]' })
export class UiAlertIconDirective {}

/** Row of actions under the alert's message. */
@Directive({ selector: '[uiAlertActions]', host: { class: 'alert-actions' } })
export class UiAlertActionsDirective {}
