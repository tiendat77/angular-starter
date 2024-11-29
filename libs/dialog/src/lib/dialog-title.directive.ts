import { CdkPortal } from '@angular/cdk/portal';
import { Directive, TemplateRef, ViewContainerRef } from '@angular/core';

@Directive({
  standalone: true,
  selector: '[dialog-title], [dialogTitle]',
})
export class DialogTitleDirective extends CdkPortal {
  constructor(templateRef: TemplateRef<any>, viewContainerRef: ViewContainerRef) {
    super(templateRef, viewContainerRef);
  }
}
