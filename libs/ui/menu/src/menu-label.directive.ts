import { Directive } from '@angular/core';

@Directive({
  selector: '[uiMenuLabel]',
  exportAs: 'uiMenuLabel',
  standalone: true,
  host: {
    class:
      'menu-title px-3 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 select-none',
  },
})
export class UiMenuLabelDirective {}
