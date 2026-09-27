import { Directive, ElementRef, OnInit, inject } from '@angular/core';

@Directive({
  selector: '[dialog-header], [dialogHeader]',
})
export class DialogHeaderDirective implements OnInit {
  private _element = inject(ElementRef);

  get element() {
    return this._element.nativeElement as HTMLElement;
  }

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
