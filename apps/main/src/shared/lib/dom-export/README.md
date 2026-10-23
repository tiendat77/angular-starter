# DomExportHelper

Export a DOM element to an image (PNG, JPEG, WebP, SVG), to the clipboard, or to a multi-page PDF.

```ts
import { DomExportHelper } from '@/shared/lib/dom-export';
```

## Quick start

```ts
@Component({
  template: `<div #report>...</div>
    <button (click)="save()">Save</button>`,
})
export class ReportComponent {
  private _report = viewChild.required<ElementRef<HTMLElement>>('report');

  save() {
    return DomExportHelper.download(this._report().nativeElement, {
      format: 'png',
      fileName: 'report',
    });
  }
}
```

## API

All methods are `static`, async, and take the element to export as the first argument.

| Method                      | Returns         | Use it to                                   |
| --------------------------- | --------------- | ------------------------------------------- |
| `toBlob(el, options?)`      | `Promise<Blob>` | Get the image to upload, preview or process |
| `download(el, options?)`    | `Promise<void>` | Render and save as `<fileName>.<ext>`       |
| `copy(el, options?)`        | `Promise<void>` | Copy as PNG to the clipboard                |
| `toPdf(el, options?)`       | `Promise<Blob>` | Get the PDF to upload or preview            |
| `downloadPdf(el, options?)` | `Promise<void>` | Render and save as `<fileName>.pdf`         |

Prefer `toBlob` / `toPdf` when you also want to show or upload the result: render once, then save the
same blob with `FileHelper.download(blob, 'name.png')`.

### Image options (`DomExportOptions`)

| Option       | Default    | Description                                                                                                                                                                    |
| ------------ | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `format`     | `'png'`    | `'png' \| 'jpeg' \| 'webp' \| 'svg'` (ignored by `copy`, which is always PNG)                                                                                                  |
| `scale`      | `2`        | Pixel ratio. Lowered automatically when the canvas would exceed the browser limit                                                                                              |
| `quality`    | `0.92`     | `jpeg` / `webp` quality, 0 to 1                                                                                                                                                |
| `background` | `'auto'`   | `'auto'` uses the first opaque background of the element or its ancestors. A CSS color sets it. `null` keeps it transparent (`png`, `webp`, `svg`; `jpeg` falls back to white) |
| `fullScroll` | `true`     | Capture all of a scrollable element, not only the visible part                                                                                                                 |
| `filter`     | –          | `(node) => boolean`, return `false` to leave a node out                                                                                                                        |
| `fileName`   | `'export'` | Without extension. Used by `download` / `downloadPdf`                                                                                                                          |

### PDF options (`DomPdfOptions`)

Takes `scale`, `background`, `fullScroll`, `filter` and `fileName` from above, plus:

| Option        | Default  | Description                                                           |
| ------------- | -------- | --------------------------------------------------------------------- |
| `pageSize`    | `'a4'`   | `'a4' \| 'a3' \| 'letter'`                                            |
| `orientation` | `'auto'` | `'auto'` picks portrait or landscape by the content shape             |
| `margin`      | `10`     | Page margin in mm                                                     |
| `avoidBreaks` | `true`   | Move page breaks out of text lines, table rows and images (see below) |

The content is fitted to the page width and split over as many pages as it needs.

## Recipes

### Download, copy, preview

```ts
const el = this._report().nativeElement;

await DomExportHelper.download(el, { format: 'jpeg', quality: 0.85, fileName: 'report' });
await DomExportHelper.copy(el);

const blob = await DomExportHelper.toBlob(el, { format: 'webp' });
this.previewUrl = URL.createObjectURL(blob); // revoke it when you are done
```

### Leave things out of the export

Add `data-export-ignore` to anything that must not appear (buttons, tooltips, menus):

```html
<div #report>
  <h2>Sales</h2>
  <button
    data-export-ignore
    (click)="save()"
  >
    Export
  </button>
</div>
```

Or filter by code:

```ts
DomExportHelper.toBlob(el, {
  filter: (node) => !(node instanceof Element && node.matches('.no-print')),
});
```

### Background and dark mode

`background: 'auto'` follows the theme, so dark mode exports dark. Pass `'#ffffff'` to force a white
page, or `null` for a transparent PNG.

### PDF with page control

```ts
await DomExportHelper.downloadPdf(el, {
  fileName: 'invoice',
  pageSize: 'a4',
  orientation: 'portrait',
  margin: 12,
});
```

### Keep text from being cut between pages

By default the helper never cuts through a line of text, a table row (`tr`), an `img`, an `svg` or a
`figure`: it moves the page break above them. You can also drive it with **standard CSS**, which the
helper reads from the elements (the browser ignores these on screen, so they only describe the PDF):

```html
<section class="break-inside-avoid">...</section>
<!-- never split this block -->
<h2 class="break-before-page">Details</h2>
<!-- always start a new page here -->
<div class="break-after-page">...</div>
<!-- start a new page after this -->
```

Plain CSS works too: `break-inside: avoid`, `break-before: page`, `break-after: page`.
A block taller than about 75% of a page cannot be kept whole and is cut where the page is full.
Turn the whole thing off with `avoidBreaks: false`.

## Errors

Failures reject with a `DomExportError`; check `error.code`:

| Code            | Cause                                                           |
| --------------- | --------------------------------------------------------------- |
| `EMPTY`         | The element has no size (hidden, `display: none`, not attached) |
| `TOO_LARGE`     | Too big to render even at the minimum scale                     |
| `RENDER_FAILED` | The renderer failed. The original error is in `error.cause`     |

```ts
try {
  await DomExportHelper.downloadPdf(el);
} catch (error) {
  this._toast.error(error instanceof DomExportError ? error.message : 'Export failed');
}
```

## How it works

`modern-screenshot` clones the element, inlines its computed styles into an SVG `foreignObject`, and
lets the browser rasterize it. Because the browser does the rendering, modern CSS (`oklch()`,
`color-mix()`, `data-theme` tokens, web fonts) comes out right, which `html2canvas` cannot do. PDFs
render the same way, are sliced into pages and assembled with `jspdf`. Both libraries are loaded with
a dynamic `import()` the first time you export, so they are not part of the initial bundle.

`jspdf`'s optional packages (`html2canvas`, `dompurify`, `canvg`) are marked in `externalDependencies`
in `angular.json` so they stay out of the build. If you ever call `jsPDF.html()` or its SVG methods,
remove them from that list.

## Limits and tips

- **PDF pages are images.** The text is not selectable or searchable and files are larger than a
  vector PDF. For invoices or anything that must be searched or archived, render on a server with
  headless Chromium (`page.pdf()`) instead.
- **Cross-origin images** need CORS (`crossorigin="anonymous"` and an `Access-Control-Allow-Origin`
  header). Without it the image is replaced by an empty placeholder.
- **Not captured:** cross-origin iframes, `<video>`, and CDK overlays (dialogs, select panels, tooltips)
  because they live outside the element. Export the overlay element itself.
- **Nested scroll boxes** keep their visible size; only the exported element is expanded by `fullScroll`.
- **`data-export-ignore` nodes are removed**, so anything after them can shift up in the image. Use
  `visibility: hidden` if the layout must not change. This also shifts PDF page-break measurements.
- **Huge elements:** the scale is lowered automatically to stay under the canvas limit (about 16.7M
  pixels). Very large content may come out less sharp, or throw `TOO_LARGE`.
- **Safari is untested here.** Libraries of this kind are known to sometimes render images and fonts
  blank on the very first export there; if you see that, export once more.
- **SVG output is large** (web fonts are embedded as base64). Prefer PNG or WebP for sharing.
- **The first export loads the libraries**, so it is slower than the following ones.

## Tests

- Unit tests: `dom-export.helper.spec.ts`, `page-breaks.spec.ts` (`npx ng test main --watch=false`).
  jsdom cannot rasterize, so they mock the renderer and cover options, limits, filtering and page
  breaks.
- Visual check: export each format in light and dark mode on a real page; jsdom cannot show you
  the result.
