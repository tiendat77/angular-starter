export type UiBottomSheetSnapPoints = number[];

export interface UiBottomSheetSnapResolution {
  index: number;
}

export interface UiBottomSheetDismissResolution {
  dismiss: true;
}

export type UiBottomSheetDragEndResolution =
  | UiBottomSheetSnapResolution
  | UiBottomSheetDismissResolution;
