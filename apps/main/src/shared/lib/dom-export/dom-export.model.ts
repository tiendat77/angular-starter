export type DomImageFormat = 'png' | 'jpeg' | 'webp' | 'svg';

export interface DomExportOptions {
  /** Image format. Default `png`. */
  format?: DomImageFormat;
  /** Pixel ratio of the output. Default `2`; lowered automatically when the canvas would be too large. */
  scale?: number;
  /** Quality of `jpeg` / `webp`, from 0 to 1. Default `0.92`. */
  quality?: number;
  /**
   * CSS color behind the content. `'auto'` (default) takes the first opaque background of the
   * element or its ancestors; `null` keeps it transparent (`png`, `webp` and `svg` only).
   */
  background?: string | 'auto' | null;
  /** Capture the whole content of a scrollable element, not only its visible part. Default `true`. */
  fullScroll?: boolean;
  /** Return `false` to leave a node out. Nodes with `data-export-ignore` are always left out. */
  filter?: (node: Node) => boolean;
  /** File name without extension, used by `download`. Default `export`. */
  fileName?: string;
}

export interface DomPdfOptions extends Omit<DomExportOptions, 'format' | 'quality'> {
  /** Default `a4`. */
  pageSize?: 'a4' | 'a3' | 'letter';
  /** `auto` picks the one that fits the content better. Default `auto`. */
  orientation?: 'portrait' | 'landscape' | 'auto';
  /** Page margin in mm. Default `10`. */
  margin?: number;
  /**
   * Move a page break out of a line of text, a table row or an image, instead of cutting through it.
   * Default `true`. Standard CSS is read from the elements too: `break-inside: avoid` keeps an element
   * whole and `break-before: page` / `break-after: page` start a new page (Tailwind:
   * `break-inside-avoid`, `break-before-page`, `break-after-page`).
   */
  avoidBreaks?: boolean;
}

export type DomExportErrorCode = 'EMPTY' | 'TOO_LARGE' | 'RENDER_FAILED';

export class DomExportError extends Error {
  constructor(
    readonly code: DomExportErrorCode,
    message: string,
    options?: ErrorOptions
  ) {
    super(message, options);
    this.name = 'DomExportError';
  }
}
