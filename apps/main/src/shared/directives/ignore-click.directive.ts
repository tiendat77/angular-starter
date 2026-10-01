import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[ignoreClick]',
})
export class IgnoreClickDirective {
  @HostListener('click', ['$event'])
  onClick(event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();
  }
}
