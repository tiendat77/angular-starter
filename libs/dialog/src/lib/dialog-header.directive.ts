import { Directive, ElementRef, OnInit } from '@angular/core';

@Directive({
  standalone: true,
  selector: '[dialog-header], [dialogHeader]',
})
export class DialogHeaderDirective implements OnInit {
  get element() {
    return this._element.nativeElement as HTMLElement;
  }

  constructor(private _element: ElementRef) {}

  ngOnInit(): void {
    this.element.classList.add('hidden');
  }

  visibility(enable: boolean) {
    if (enable) {
      this.element.classList.remove('hidden');
    } else {
      this.element.classList.add('hidden');
    }
  }
}
