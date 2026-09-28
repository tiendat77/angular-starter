import { ConnectedPosition } from '@angular/cdk/overlay';
import { UiTooltipPosition } from './tooltip.types';

export const TOOLTIP_POSITIONS: Record<UiTooltipPosition, ConnectedPosition[]> = {
  top: [
    { originX: 'center', originY: 'top', overlayX: 'center', overlayY: 'bottom', offsetY: -8 },
    { originX: 'center', originY: 'bottom', overlayX: 'center', overlayY: 'top', offsetY: 8 },
    { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -8 },
    { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom', offsetY: -8 },
  ],
  bottom: [
    { originX: 'center', originY: 'bottom', overlayX: 'center', overlayY: 'top', offsetY: 8 },
    { originX: 'center', originY: 'top', overlayX: 'center', overlayY: 'bottom', offsetY: -8 },
    { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 8 },
    { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top', offsetY: 8 },
  ],
  left: [
    { originX: 'start', originY: 'center', overlayX: 'end', overlayY: 'center', offsetX: -8 },
    { originX: 'end', originY: 'center', overlayX: 'start', overlayY: 'center', offsetX: 8 },
    { originX: 'start', originY: 'top', overlayX: 'end', overlayY: 'top', offsetX: -8 },
    { originX: 'start', originY: 'bottom', overlayX: 'end', overlayY: 'bottom', offsetX: -8 },
  ],
  right: [
    { originX: 'end', originY: 'center', overlayX: 'start', overlayY: 'center', offsetX: 8 },
    { originX: 'start', originY: 'center', overlayX: 'end', overlayY: 'center', offsetX: -8 },
    { originX: 'end', originY: 'top', overlayX: 'start', overlayY: 'top', offsetX: 8 },
    { originX: 'end', originY: 'bottom', overlayX: 'start', overlayY: 'bottom', offsetX: 8 },
  ],
};

export function mapConnectedPositionToPlacement(pos: ConnectedPosition): UiTooltipPosition {
  if (pos.originY === 'top' && pos.overlayY === 'bottom') return 'top';
  if (pos.originY === 'bottom' && pos.overlayY === 'top') return 'bottom';
  if (pos.originX === 'start' && pos.overlayX === 'end') return 'left';
  if (pos.originX === 'end' && pos.overlayX === 'start') return 'right';
  if (pos.offsetY != null && pos.offsetY < 0) return 'top';
  if (pos.offsetY != null && pos.offsetY > 0) return 'bottom';
  if (pos.offsetX != null && pos.offsetX < 0) return 'left';
  if (pos.offsetX != null && pos.offsetX > 0) return 'right';
  return 'top';
}
