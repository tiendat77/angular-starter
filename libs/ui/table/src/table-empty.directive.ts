import { Directive, TemplateRef, inject } from '@angular/core';

/** Custom empty state: `<ng-template uiTableEmpty>…</ng-template>` inside `ui-table`. */
@Directive({ selector: 'ng-template[uiTableEmpty]' })
export class UiTableEmpty {
  readonly templateRef = inject<TemplateRef<void>>(TemplateRef);
}
