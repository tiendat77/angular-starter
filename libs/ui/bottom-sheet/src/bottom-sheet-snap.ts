import { UiBottomSheetDragEndResolution } from './bottom-sheet.types';

const FLING_VELOCITY_THRESHOLD_PX_PER_MS = 0.5;
const DISMISS_OVERSHOOT_RATIO = 0.5;

export function snapPointsToPixels(snapPoints: number[], viewportHeightPx: number): number[] {
  return snapPoints.map((fraction) => fraction * viewportHeightPx);
}

export interface ResolveDragEndInput {
  /** Current panel translateY in px (0 = fully revealed at the largest snap, panelHeightPx = fully hidden). */
  currentTranslateY: number;
  /** Signed pointer velocity in px/ms at release; positive = moving down. */
  velocityPxPerMs: number;
  /** Visible height in px for each snap index, ascending. */
  snapPixels: number[];
  /** The panel's fixed total height in px (== max(snapPixels)). */
  panelHeightPx: number;
  /** When true, a would-be dismiss clamps to the smallest snap instead. */
  disableClose: boolean;
}

export function resolveDragEnd(input: ResolveDragEndInput): UiBottomSheetDragEndResolution {
  const { currentTranslateY, velocityPxPerMs, snapPixels, panelHeightPx, disableClose } = input;
  const smallestIndex = 0;
  const largestIndex = snapPixels.length - 1;
  const nearestIndex = nearestSnapIndex(currentTranslateY, snapPixels, panelHeightPx);

  const smallestSnapTranslateY = panelHeightPx - snapPixels[smallestIndex];
  const dismissThresholdTranslateY =
    smallestSnapTranslateY + snapPixels[smallestIndex] * DISMISS_OVERSHOOT_RATIO;
  const pastDismissThreshold = currentTranslateY > dismissThresholdTranslateY;

  const isFlingingDown = velocityPxPerMs >= FLING_VELOCITY_THRESHOLD_PX_PER_MS;
  const isFlingingUp = velocityPxPerMs <= -FLING_VELOCITY_THRESHOLD_PX_PER_MS;

  if (isFlingingDown && nearestIndex === smallestIndex && pastDismissThreshold) {
    return disableClose ? { index: smallestIndex } : { dismiss: true };
  }
  if (isFlingingDown) {
    return { index: Math.max(smallestIndex, nearestIndex - 1) };
  }
  if (isFlingingUp) {
    return { index: Math.min(largestIndex, nearestIndex + 1) };
  }
  if (pastDismissThreshold && nearestIndex === smallestIndex) {
    return disableClose ? { index: smallestIndex } : { dismiss: true };
  }
  return { index: nearestIndex };
}

function nearestSnapIndex(translateY: number, snapPixels: number[], panelHeightPx: number): number {
  let closestIndex = 0;
  let closestDistance = Infinity;
  for (let i = 0; i < snapPixels.length; i++) {
    const candidateTranslateY = panelHeightPx - snapPixels[i];
    const distance = Math.abs(translateY - candidateTranslateY);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = i;
    }
  }
  return closestIndex;
}
