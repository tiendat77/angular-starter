import { Directive, HostListener } from '@angular/core';

@Directive({
  standalone: true,
  selector: '[ignoreClick]',
})
export class IgnoreClickDirective {
  @HostListener('click', ['$event'])
  onClick(event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();
  }
}
