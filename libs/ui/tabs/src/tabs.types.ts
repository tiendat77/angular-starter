import { InjectionToken, Signal } from '@angular/core';
import { UiColor } from '@libs/ui/core';

export type UiTabsVariant = 'bordered' | 'lift' | 'pill';
export type UiTabsSize = 'sm' | 'md' | 'lg';
export type UiTabsOrientation = 'horizontal' | 'vertical';

export interface UiTabsContext {
  variant: Signal<UiTabsVariant>;
  size: Signal<UiTabsSize>;
  orientation: Signal<UiTabsOrientation>;
  color: Signal<UiColor>;
}

export const UI_TABS_CONTEXT = new InjectionToken<UiTabsContext>('UI_TABS_CONTEXT');

export interface UiTabsConfig {
  variant?: UiTabsVariant;
  size?: UiTabsSize;
  orientation?: UiTabsOrientation;
  color?: UiColor;
  selectionMode?: 'follow' | 'explicit';
}

export const UI_TABS_CONFIG = new InjectionToken<UiTabsConfig>('UI_TABS_CONFIG');
