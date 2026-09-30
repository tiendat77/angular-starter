import { Directive, TemplateRef, inject } from '@angular/core';

@Directive({
  selector: '[uiCollapseHeader], ng-template[uiCollapseHeader]',
  exportAs: 'uiCollapseHeader',
})
export class UiCollapseHeaderDirective {
  readonly templateRef = inject<TemplateRef<unknown>>(TemplateRef, { optional: true });
}

@Directive({
  selector: '[uiCollapseExtra], ng-template[uiCollapseExtra]',
  exportAs: 'uiCollapseExtra',
})
export class UiCollapseExtraDirective {
  readonly templateRef = inject<TemplateRef<unknown>>(TemplateRef, { optional: true });
}

@Directive({
  selector: 'ng-template[uiCollapseContent], [uiCollapseContent]',
  exportAs: 'uiCollapseContent',
})
export class UiCollapseContentDirective {
  readonly templateRef = inject<TemplateRef<unknown>>(TemplateRef);
}

@Directive({
  selector: 'ng-template[uiCollapseIcon], [uiCollapseIcon]',
  exportAs: 'uiCollapseIcon',
})
export class UiCollapseIconDirective {
  readonly templateRef = inject<TemplateRef<unknown>>(TemplateRef);
}
