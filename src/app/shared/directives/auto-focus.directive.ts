import { AfterViewInit, Directive, ElementRef, inject } from '@angular/core';

@Directive({
  standalone: true,
  selector: 'input[autofocus]',
})
export class AutoFocusDirective implements AfterViewInit {
  private _element = inject(ElementRef<HTMLInputElement>);

  ngAfterViewInit(): void {
    setTimeout(() => {
      this._element?.nativeElement?.focus();
    });
  }
}
