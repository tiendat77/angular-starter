import qrcodegen from './lib/qrcodegen';
import {
  UiQrCodeEncoding,
  UiQrCodeExcavation,
  UiQrCodeIconGeometry,
  UiQrCodeLevel,
  UiQrCodeModules,
} from './qr-code.types';

const { QrCode, QrSegment } = qrcodegen;

const ECC_BY_LEVEL = {
  L: QrCode.Ecc.LOW,
  M: QrCode.Ecc.MEDIUM,
  Q: QrCode.Ecc.QUARTILE,
  H: QrCode.Ecc.HIGH,
} as const;

/** Index = `Ecc.ordinal`. */
const LEVEL_BY_ORDINAL: readonly UiQrCodeLevel[] = ['L', 'M', 'Q', 'H'];

/**
 * Share of the code each error correction level can restore. An icon covering more than this
 * cannot be recovered even in theory, so the code would not scan.
 */
export const ICON_COVERAGE_LIMIT: Readonly<Record<UiQrCodeLevel, number>> = {
  L: 0.07,
  M: 0.15,
  Q: 0.25,
  H: 0.3,
};

/**
 * Encodes `value` into a module grid, or returns `null` when it cannot be encoded (too long for
 * the largest QR version at this level) so callers never have to catch.
 *
 * The level is raised when that costs no extra size, so `level` is a minimum.
 */
export function encodeQrCode(value: string, level: UiQrCodeLevel): UiQrCodeEncoding | null {
  try {
    const qr = QrCode.encodeSegments(
      QrSegment.makeSegments(value),
      ECC_BY_LEVEL[level],
      1,
      40,
      -1,
      true
    );
    return {
      modules: qr.getModules(),
      level: LEVEL_BY_ORDINAL[qr.errorCorrectionLevel.ordinal],
    };
  } catch {
    return null;
  }
}

/**
 * Builds one SVG/Path2D path for all dark modules (one rectangle per horizontal run), in module
 * units. Fewer, longer rectangles keep both the path string and the draw call small.
 */
export function buildModulesPath(modules: UiQrCodeModules): string {
  const commands: string[] = [];
  modules.forEach((row, y) => {
    let start = -1;
    for (let x = 0; x <= row.length; x++) {
      const dark = x < row.length && row[x];
      if (dark && start < 0) {
        start = x;
      } else if (!dark && start >= 0) {
        const length = x - start;
        commands.push(`M${start} ${y}h${length}v1h-${length}z`);
        start = -1;
      }
    }
  });
  return commands.join('');
}

/** Centres an `iconSize`-pixel icon on a code drawn at `size` pixels, in module units. */
export function iconGeometry(
  numModules: number,
  size: number,
  iconSize: number
): UiQrCodeIconGeometry {
  const scale = numModules / size;
  const w = iconSize * scale;
  const h = iconSize * scale;
  const x = numModules / 2 - w / 2;
  const y = numModules / 2 - h / 2;

  // Whole modules only, rounded outwards so the icon never sits on a half-cleared module.
  const left = Math.floor(x);
  const top = Math.floor(y);
  return {
    x,
    y,
    w,
    h,
    excavation: {
      x: left,
      y: top,
      w: Math.ceil(w + x - left),
      h: Math.ceil(h + y - top),
    },
  };
}

/** Returns a copy of `modules` with every module inside `excavation` cleared. */
export function excavateModules(
  modules: UiQrCodeModules,
  excavation: UiQrCodeExcavation
): UiQrCodeModules {
  return modules.map((row, y) => {
    if (y < excavation.y || y >= excavation.y + excavation.h) {
      return row;
    }
    return row.map((dark, x) =>
      x >= excavation.x && x < excavation.x + excavation.w ? false : dark
    );
  });
}

/** Share of the whole `numModules`² grid that `excavation` covers. */
export function iconCoverage(numModules: number, excavation: UiQrCodeExcavation): number {
  return (excavation.w * excavation.h) / (numModules * numModules);
}
