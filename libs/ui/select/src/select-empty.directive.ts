import { Directive, inject, TemplateRef } from '@angular/core';

/** Custom "no results" content for `ui-select`. Context: `$implicit` = current search term. */
@Directive({
  selector: 'ng-template[uiSelectEmpty]',
})
export class UiSelectEmptyDirective {
  readonly template = inject<TemplateRef<{ $implicit: string }>>(TemplateRef);
}
