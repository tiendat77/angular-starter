import { CdkPortal } from '@angular/cdk/portal';
import { Directive, TemplateRef, ViewContainerRef } from '@angular/core';

@Directive({
  standalone: true,
  selector: '[dialog-body], [dialogBody]',
})
export class DialogBodyDirective extends CdkPortal {
  constructor(templateRef: TemplateRef<any>, viewContainerRef: ViewContainerRef) {
    super(templateRef, viewContainerRef);
  }
}
