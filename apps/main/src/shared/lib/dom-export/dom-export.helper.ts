import type { Options } from 'modern-screenshot';
import { FileHelper } from '../file.helper';
import {
  DomExportError,
  DomExportOptions,
  DomImageFormat,
  DomPdfOptions,
} from './dom-export.model';
import { BreakSpan, computePageBreaks } from './page-breaks';

/** Browsers refuse canvases above ~16.7M pixels (Safari / iOS are the strictest). */
const MAX_PIXELS = 16_777_216;
const MIN_SCALE = 0.25;

const MIME: Record<DomImageFormat, string> = {
  png: 'image/png',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  svg: 'image/svg+xml',
};

/** Page sizes in mm, portrait. */
const PAGE_SIZE = { a4: [210, 297], a3: [297, 420], letter: [215.9, 279.4] } as const;

export class DomExportHelper {
  /** Renders the element to an image `Blob`. */
  static async toBlob(element: HTMLElement, options: DomExportOptions = {}): Promise<Blob> {
    const { format = 'png' } = options;
    const { domToBlob, domToForeignObjectSvg } = await import('modern-screenshot');
    const renderOptions = await DomExportHelper._renderOptions(element, options, format);

    try {
      if (format === 'svg') {
        const svg = await domToForeignObjectSvg(element, renderOptions);

        return new Blob([new XMLSerializer().serializeToString(svg)], { type: MIME.svg });
      }

      return await domToBlob(element, { ...renderOptions, type: MIME[format] });
    } catch (error) {
      throw new DomExportError('RENDER_FAILED', 'Could not render the element.', { cause: error });
    }
  }

  /** Renders the element and downloads it as an image. */
  static async download(element: HTMLElement, options: DomExportOptions = {}): Promise<void> {
    const blob = await DomExportHelper.toBlob(element, options);
    const extension = (options.format ?? 'png') === 'jpeg' ? 'jpg' : (options.format ?? 'png');

    FileHelper.download(blob, `${options.fileName ?? 'export'}.${extension}`);
  }

  /** Renders the element and copies it to the clipboard (as PNG). */
  static async copy(element: HTMLElement, options: Omit<DomExportOptions, 'format'> = {}) {
    // Safari only accepts the clipboard write inside the user gesture, so hand it the promise.
    const blob = DomExportHelper.toBlob(element, { ...options, format: 'png' });

    await navigator.clipboard.write([new ClipboardItem({ [MIME.png]: blob })]);
  }

  /** Renders the element to a PDF `Blob`, split over as many pages as the content needs. */
  static async toPdf(element: HTMLElement, options: DomPdfOptions = {}): Promise<Blob> {
    const { pageSize = 'a4', orientation = 'auto', margin = 10, avoidBreaks = true } = options;
    const [{ domToCanvas }, { jsPDF }] = await Promise.all([
      import('modern-screenshot'),
      import('jspdf'),
    ]);
    // JPEG has no alpha, so the page background has to be opaque.
    const renderOptions = await DomExportHelper._renderOptions(element, options, 'jpeg');

    let canvas: HTMLCanvasElement;
    try {
      canvas = await domToCanvas(element, renderOptions);
    } catch (error) {
      throw new DomExportError('RENDER_FAILED', 'Could not render the element.', { cause: error });
    }

    const [shortSide, longSide] = PAGE_SIZE[pageSize];
    const landscape =
      orientation === 'auto' ? canvas.width > canvas.height : orientation === 'landscape';
    const pageWidth = landscape ? longSide : shortSide;
    const pageHeight = landscape ? shortSide : longSide;
    const contentWidth = pageWidth - margin * 2;
    const contentHeight = pageHeight - margin * 2;

    // The content is fitted to the page width; the height that fits one page, in canvas pixels:
    const pageCanvasHeight = Math.floor((contentHeight * canvas.width) / contentWidth);
    const scale = canvas.width / renderOptions.width!;
    const layout = avoidBreaks
      ? DomExportHelper._measureLayout(element, options.fullScroll ?? true)
      : { keep: [], forced: [] };
    const starts = computePageBreaks(
      canvas.height / scale,
      pageCanvasHeight / scale,
      layout.keep,
      layout.forced
    ).map((y) => Math.round(y * scale));
    const pdf = new jsPDF({
      unit: 'mm',
      format: [pageWidth, pageHeight],
      orientation: landscape ? 'landscape' : 'portrait',
      compress: true,
    });

    starts.forEach((y, page) => {
      const height = Math.min(starts[page + 1] ?? canvas.height, canvas.height) - y;
      const slice = document.createElement('canvas');
      slice.width = canvas.width;
      slice.height = height;

      const context = slice.getContext('2d')!;
      context.fillStyle = renderOptions.backgroundColor ?? '#fff';
      context.fillRect(0, 0, slice.width, slice.height);
      context.drawImage(canvas, 0, y, canvas.width, height, 0, 0, canvas.width, height);

      if (page > 0) {
        pdf.addPage([pageWidth, pageHeight], landscape ? 'landscape' : 'portrait');
      }
      pdf.addImage(
        slice.toDataURL('image/jpeg', 0.95),
        'JPEG',
        margin,
        margin,
        contentWidth,
        (height * contentWidth) / canvas.width
      );
    });

    return pdf.output('blob');
  }

  /** Renders the element and downloads it as a PDF. */
  static async downloadPdf(element: HTMLElement, options: DomPdfOptions = {}): Promise<void> {
    FileHelper.download(
      await DomExportHelper.toPdf(element, options),
      `${options.fileName ?? 'export'}.pdf`
    );
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------

  private static async _renderOptions(
    element: HTMLElement,
    options: DomExportOptions,
    format: DomImageFormat
  ): Promise<Options> {
    const { scale = 2, quality = 0.92, fullScroll = true, filter, background = 'auto' } = options;

    // Web fonts that are still loading would be rendered with the fallback font.
    await document.fonts?.ready;

    // The whole content plus the borders; the scrollbars are gone once the overflow is visible.
    const full = (client: number, scroll: number, border: number, offset: number) =>
      fullScroll && client ? Math.max(client, scroll) + border * 2 : offset;
    const width = full(
      element.clientWidth,
      element.scrollWidth,
      element.clientLeft,
      element.offsetWidth
    );
    const height = full(
      element.clientHeight,
      element.scrollHeight,
      element.clientTop,
      element.offsetHeight
    );

    if (!width || !height) {
      throw new DomExportError('EMPTY', 'The element has no size (is it hidden?).');
    }

    const fitted = Math.min(scale, Math.sqrt(MAX_PIXELS / (width * height)));
    if (fitted < MIN_SCALE) {
      throw new DomExportError('TOO_LARGE', 'The element is too large to be rendered.');
    }

    let backgroundColor: string | null =
      background === 'auto' ? DomExportHelper._resolveBackground(element) : background;
    if (!backgroundColor && format === 'jpeg') {
      backgroundColor = '#fff';
    }

    return {
      width,
      height,
      scale: fitted,
      quality,
      backgroundColor,
      style: fullScroll
        ? { overflow: 'visible', maxHeight: 'none', width: `${width}px`, height: `${height}px` }
        : null,
      filter: (node) =>
        !(node instanceof Element && node.hasAttribute('data-export-ignore')) &&
        (filter?.(node) ?? true),
    };
  }

  /** Where the element has content that a page break must not cut (CSS px from its top). */
  private static _measureLayout(element: HTMLElement, fullScroll: boolean) {
    const top = element.getBoundingClientRect().top - (fullScroll ? element.scrollTop : 0);
    const keep: BreakSpan[] = [];
    const forced: number[] = [];
    const span = (rect: DOMRect) => {
      if (rect.height > 0) {
        keep.push([rect.top - top, rect.bottom - top]);
      }
    };
    const ignored = (node: Node) =>
      !!(node instanceof Element ? node : node.parentElement)?.closest('[data-export-ignore]');

    // Every line of text...
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    const range = document.createRange();
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (node.textContent?.trim() && !ignored(node)) {
        range.selectNodeContents(node);
        Array.from(range.getClientRects()).forEach(span);
      }
    }

    // ... the blocks that read better whole, and the ones the CSS says how to break around. Print
    // fragmentation properties do nothing on screen, so they are free to describe the PDF pages.
    element.querySelectorAll('*').forEach((block) => {
      if (ignored(block)) {
        return;
      }

      const style = getComputedStyle(block);
      const rect = block.getBoundingClientRect();

      if (block.matches('tr, img, svg, figure') || style.breakInside.startsWith('avoid')) {
        span(rect);
      }
      if (/^(page|always|left|right)$/.test(style.breakBefore)) {
        forced.push(rect.top - top);
      }
      if (/^(page|always|left|right)$/.test(style.breakAfter)) {
        forced.push(rect.bottom - top);
      }
    });

    return { keep, forced };
  }

  /** The first opaque background of the element or its ancestors. */
  private static _resolveBackground(element: HTMLElement): string | null {
    for (let node: HTMLElement | null = element; node; node = node.parentElement) {
      const color = getComputedStyle(node).backgroundColor;

      // Computed colors are `rgb()` / `rgba()` / `color()`; a fully transparent one ends in `/ 0)` or `, 0)`.
      if (color && color !== 'transparent' && !/(,|\/)\s*0\)$/.test(color)) {
        return color;
      }
    }

    return null;
  }
}
