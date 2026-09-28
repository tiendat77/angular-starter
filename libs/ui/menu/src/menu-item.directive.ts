import {
  Directive,
  ElementRef,
  booleanAttribute,
  computed,
  inject,
  input,
  output,
} from '@angular/core';
import { UI_MENU_CONTEXT } from './menu.types';
import { menuItemVariants } from './menu.variants';

@Directive({
  selector: '[uiMenuItem]',
  exportAs: 'uiMenuItem',
  standalone: true,
  host: {
    role: 'menuitem',
    '[attr.tabindex]': 'tabIndex()',
    '[class]': 'classes()',
    '[attr.aria-disabled]': 'disabled() ? "true" : null',
    '[attr.disabled]': 'disabled() ? "" : null',
    '(click)': 'handleClick($event)',
    '(keydown)': 'handleKeydown($event)',
    '(focusin)': 'handleFocusIn()',
  },
})
export class UiMenuItemDirective {
  private readonly context = inject(UI_MENU_CONTEXT, { optional: true });
  readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly value = input<unknown>(undefined);
  readonly danger = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });

  readonly triggered = output<unknown>();

  readonly isActive = computed(() => this.context?.activeItem() === this);
  readonly tabIndex = computed(() => (this.isActive() ? 0 : -1));

  readonly classes = computed(() => {
    return menuItemVariants({
      size: this.context?.size() ?? 'md',
      danger: this.danger(),
      disabled: this.disabled(),
    });
  });

  focus(): void {
    this.elementRef.nativeElement.focus();
    this.context?.setActiveItem(this);
  }

  isFocused(): boolean {
    return document.activeElement === this.elementRef.nativeElement;
  }

  handleFocusIn(): void {
    if (!this.disabled()) {
      this.context?.setActiveItem(this);
    }
  }

  handleClick(event: MouseEvent): void {
    if (this.disabled()) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    this.triggered.emit(this.value());
    this.context?.selectItem(this.value());
    this.context?.close();
  }

  handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (!this.disabled()) {
        this.elementRef.nativeElement.click();
      }
    }
  }
}
