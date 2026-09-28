import { Directive } from '@angular/core';

@Directive({
  selector: '[uiMenuDivider]',
  exportAs: 'uiMenuDivider',
  standalone: true,
  host: {
    role: 'separator',
    class: 'my-1 border-t border-gray-200 dark:border-gray-800',
  },
})
export class UiMenuDividerDirective {}
