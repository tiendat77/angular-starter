import { CdkPortal } from '@angular/cdk/portal';
import { Directive } from '@angular/core';

@Directive({
  selector: '[dialog-body], [dialogBody]',
})
export class DialogBodyDirective extends CdkPortal {}
