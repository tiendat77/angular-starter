import { InjectionToken, TemplateRef } from '@angular/core';
import { UiColor } from '@libs/ui/core';

export type UiTooltipPosition = 'top' | 'bottom' | 'left' | 'right';
export type UiTooltipSize = 'sm' | 'md';
export type UiTooltipContent = string | TemplateRef<unknown> | null;

export interface UiTooltipConfig {
  position?: UiTooltipPosition;
  color?: UiColor;
  size?: UiTooltipSize;
  arrow?: boolean;
  showDelay?: number;
  hideDelay?: number;
  touchGestures?: 'auto' | 'on' | 'off';
}

export const UI_TOOLTIP_CONFIG = new InjectionToken<UiTooltipConfig>('UI_TOOLTIP_CONFIG');
