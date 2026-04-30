import { Directive, ElementRef, HostListener, inject, Input } from '@angular/core';

@Directive({
  selector: 'img[avatar]',
})
export class AvatarDirective {
  @Input() name = '';

  get element() {
    return this.elementRef?.nativeElement as HTMLImageElement;
  }

  private elementRef = inject(ElementRef<HTMLImageElement>);

  @HostListener('error')
  onError() {
    if (this.element) {
      this.element.src = `https://ui-avatars.com/api/?format=svg&name=${this.name || 'Unknown'}&rounded=true&background=random&color=ffffff`;
    }
  }
}
