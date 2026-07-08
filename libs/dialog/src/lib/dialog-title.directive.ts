import { CdkPortal } from '@angular/cdk/portal';
import { Directive } from '@angular/core';

@Directive({
  selector: '[dialog-title], [dialogTitle]',
})
export class DialogTitleDirective extends CdkPortal {}
