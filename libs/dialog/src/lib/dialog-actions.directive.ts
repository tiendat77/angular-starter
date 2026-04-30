import { CdkPortal } from '@angular/cdk/portal';
import { Directive, TemplateRef, ViewContainerRef, inject } from '@angular/core';

@Directive({
  selector: '[dialog-actions], [dialogActions]',
})
export class DialogActionsDirective extends CdkPortal {
  constructor() {
    const templateRef = inject<TemplateRef<any>>(TemplateRef);
    const viewContainerRef = inject(ViewContainerRef);

    super(templateRef, viewContainerRef);
  }
}
