import { TabContent } from '@angular/aria/tabs';
import { Directive } from '@angular/core';

@Directive({
  selector: 'ng-template[uiTabContent]',
  exportAs: 'uiTabContent',
  standalone: true,
  hostDirectives: [TabContent],
})
export class UiTabContentDirective {}
