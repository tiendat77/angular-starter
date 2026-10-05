export type UiQrCodeLevel = 'L' | 'M' | 'Q' | 'H';

export type UiQrCodeType = 'canvas' | 'svg';

export type UiQrCodeStatus = 'active' | 'loading' | 'expired' | 'scanned';

/** Dark modules are `true`; indexed `[row][column]`. */
export type UiQrCodeModules = readonly (readonly boolean[])[];

/** Texts used by the component; pass a partial object to override or localise some of them. */
export interface UiQrCodeLabels {
  /** Accessible name of the code itself. */
  qrCode: string;
  loading: string;
  expired: string;
  scanned: string;
  /** Text of the button on the expired overlay. */
  refresh: string;
}

/** Module-unit rectangle of modules cleared behind the icon. */
export interface UiQrCodeExcavation {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Position and size of the icon in module units (1 = one QR module). */
export interface UiQrCodeIconGeometry {
  x: number;
  y: number;
  w: number;
  h: number;
  excavation: UiQrCodeExcavation;
}

export interface UiQrCodeEncoding {
  modules: UiQrCodeModules;
  /** Error correction level actually used; can be higher than requested. */
  level: UiQrCodeLevel;
}
