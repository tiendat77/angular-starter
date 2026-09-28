import { ConnectedPosition } from '@angular/cdk/overlay';
import { UiMenuPosition } from './menu.types';

export function getMenuPositions(position: UiMenuPosition, offsetY = 4): ConnectedPosition[] {
  switch (position) {
    case 'bottom-start':
      return [
        { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY },
        {
          originX: 'start',
          originY: 'top',
          overlayX: 'start',
          overlayY: 'bottom',
          offsetY: -offsetY,
        },
      ];
    case 'bottom-end':
      return [
        { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top', offsetY },
        { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom', offsetY: -offsetY },
      ];
    case 'top-start':
      return [
        {
          originX: 'start',
          originY: 'top',
          overlayX: 'start',
          overlayY: 'bottom',
          offsetY: -offsetY,
        },
        { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY },
      ];
    case 'top-end':
      return [
        { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom', offsetY: -offsetY },
        { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top', offsetY },
      ];
    case 'left-start':
      return [
        { originX: 'start', originY: 'top', overlayX: 'end', overlayY: 'top', offsetX: -offsetY },
        { originX: 'end', originY: 'top', overlayX: 'start', overlayY: 'top', offsetX: offsetY },
      ];
    case 'right-start':
      return [
        { originX: 'end', originY: 'top', overlayX: 'start', overlayY: 'top', offsetX: offsetY },
        { originX: 'start', originY: 'top', overlayX: 'end', overlayY: 'top', offsetX: -offsetY },
      ];
  }
}
