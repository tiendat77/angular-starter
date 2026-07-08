import { CdkPortal } from '@angular/cdk/portal';
import { Directive } from '@angular/core';

@Directive({
  selector: '[dialog-actions], [dialogActions]',
})
export class DialogActionsDirective extends CdkPortal {}
