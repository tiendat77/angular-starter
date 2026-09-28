import { InjectionToken, Signal } from '@angular/core';

export type UiMenuPosition =
  | 'bottom-start'
  | 'bottom-end'
  | 'top-start'
  | 'top-end'
  | 'left-start'
  | 'right-start';

export type UiMenuSize = 'sm' | 'md' | 'lg';

export interface UiMenuContext {
  size: Signal<UiMenuSize>;
  close: () => void;
  selectItem: (value: unknown) => void;
  activeItem: Signal<unknown>;
  setActiveItem: (item: unknown) => void;
}

export const UI_MENU_CONTEXT = new InjectionToken<UiMenuContext>('UI_MENU_CONTEXT');

export interface UiMenuConfig {
  size?: UiMenuSize;
  position?: UiMenuPosition;
  offsetY?: number;
}

export const UI_MENU_CONFIG = new InjectionToken<UiMenuConfig>('UI_MENU_CONFIG');

export interface UiMenuTrigger {
  close: () => void;
  open: (focusDirection?: 'first' | 'last') => void;
  toggle: () => void;
  isOpen: () => boolean;
  menuId: Signal<string>;
  focusDirection: Signal<'first' | 'last'>;
}

export const UI_MENU_TRIGGER = new InjectionToken<UiMenuTrigger>('UI_MENU_TRIGGER');
