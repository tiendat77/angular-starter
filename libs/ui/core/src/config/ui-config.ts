import { InjectionToken, Provider } from '@angular/core';
import { UiConfig } from './ui-config.interface';

export const UI_CONFIG = new InjectionToken<UiConfig>('UI_CONFIG');

export function provideUiConfig(config: UiConfig): Provider {
  return { provide: UI_CONFIG, useValue: config };
}
