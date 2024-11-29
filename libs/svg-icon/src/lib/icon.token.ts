import { InjectionToken } from '@angular/core';
import { IconNamespace } from './icon.interface';

export const ICON_NAMESPACES = new InjectionToken<IconNamespace[]>('Icon Namespaces to register');
