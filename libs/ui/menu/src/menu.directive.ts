import {
  Directive,
  ElementRef,
  Signal,
  afterNextRender,
  computed,
  contentChildren,
  forwardRef,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { cn } from '@libs/ui/core';
import { UiMenuItemDirective } from './menu-item.directive';
import {
  UI_MENU_CONFIG,
  UI_MENU_CONTEXT,
  UI_MENU_TRIGGER,
  UiMenuConfig,
  UiMenuContext,
  UiMenuSize,
  UiMenuTrigger,
} from './menu.types';

@Directive({
  selector: '[uiMenu]',
  exportAs: 'uiMenu',
  standalone: true,
  providers: [
    {
      provide: UI_MENU_CONTEXT,
      useFactory: (menu: UiMenuDirective): UiMenuContext => ({
        size: menu.effectiveSize,
        close: () => menu.closeMenu(),
        selectItem: (val: unknown) => menu.itemSelected.emit(val),
        activeItem: menu.activeItem,
        setActiveItem: (item: unknown) => menu.activeItem.set(item as UiMenuItemDirective),
      }),
      deps: [forwardRef(() => UiMenuDirective)],
    },
  ],
  host: {
    role: 'menu',
    tabindex: '-1',
    '[id]': 'effectiveId()',
    '[class]': 'hostClasses()',
    '(keydown)': 'handleKeydown($event)',
  },
})
export class UiMenuDirective {
  private readonly config = inject<UiMenuConfig>(UI_MENU_CONFIG, { optional: true });
  private readonly trigger = inject<UiMenuTrigger>(UI_MENU_TRIGGER, { optional: true });
  readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly id = input<string>('');
  readonly class = input<string>('');
  readonly uiMenuSize = input<UiMenuSize | undefined>(undefined);

  readonly closeRequested = output<void>();
  readonly itemSelected = output<unknown>();

  readonly items = contentChildren(UiMenuItemDirective, { descendants: true });
  readonly activeItem = signal<UiMenuItemDirective | null>(null);

  readonly effectiveId = computed(() => {
    return this.id() || this.trigger?.menuId() || null;
  });

  readonly effectiveSize: Signal<UiMenuSize> = computed(() => {
    return this.uiMenuSize() ?? this.config?.size ?? 'md';
  });

  readonly hostClasses = computed(() => {
    return cn(
      'menu menu-box bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg p-1 min-w-44 outline-none',
      `menu-${this.effectiveSize()}`,
      this.class()
    );
  });

  constructor() {
    afterNextRender(() => {
      if (this.trigger?.focusDirection() === 'last') {
        this.focusLastItem();
      } else {
        this.focusFirstItem();
      }
    });
  }

  closeMenu(): void {
    this.closeRequested.emit();
    this.trigger?.close();
  }

  getEnabledItems(): UiMenuItemDirective[] {
    return this.items().filter((item) => !item.disabled());
  }

  focusFirstItem(): void {
    const enabled = this.getEnabledItems();
    if (enabled.length > 0) {
      enabled[0].focus();
      this.activeItem.set(enabled[0]);
    }
  }

  focusLastItem(): void {
    const enabled = this.getEnabledItems();
    if (enabled.length > 0) {
      enabled[enabled.length - 1].focus();
      this.activeItem.set(enabled[enabled.length - 1]);
    }
  }

  focusNextItem(): void {
    const enabled = this.getEnabledItems();
    if (enabled.length === 0) return;
    const currentIndex = enabled.findIndex((item) => item.isFocused());
    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % enabled.length;
    enabled[nextIndex].focus();
    this.activeItem.set(enabled[nextIndex]);
  }

  focusPreviousItem(): void {
    const enabled = this.getEnabledItems();
    if (enabled.length === 0) return;
    const currentIndex = enabled.findIndex((item) => item.isFocused());
    const prevIndex = currentIndex <= 0 ? enabled.length - 1 : currentIndex - 1;
    enabled[prevIndex].focus();
    this.activeItem.set(enabled[prevIndex]);
  }

  handleKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.focusNextItem();
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.focusPreviousItem();
        break;
      case 'Home':
        event.preventDefault();
        this.focusFirstItem();
        break;
      case 'End':
        event.preventDefault();
        this.focusLastItem();
        break;
      case 'Escape':
        event.preventDefault();
        this.closeMenu();
        break;
      case 'Tab':
        this.closeMenu();
        break;
    }
  }
}
