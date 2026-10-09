# QR Code

A QR code drawn on a `<canvas>` or as an `<svg>`, with an optional icon in the centre and a status overlay (`loading`, `expired` with a refresh button, `scanned`). It encodes in the browser; nothing is sent anywhere.

```ts
import { UiQrCode } from '@libs/ui/qr-code';
```

## Usage

```html
<ui-qr-code value="https://example.com/invite/42" />

<!-- Bigger, vector, with a logo (raise the error correction when you cover the centre) -->
<ui-qr-code
  value="https://example.com/pay/9f3"
  [size]="220"
  type="svg"
  level="Q"
  icon="/images/logo.svg"
  [iconSize]="48"
/>

<!-- A login code that expires -->
<ui-qr-code
  [value]="loginUrl()"
  [status]="status()"
  (refresh)="renew()"
/>
```

`status` goes `loading` while you fetch a new code, `expired` when it runs out (the overlay shows a refresh button that emits `(refresh)`), and `scanned` once the phone has read it.

The colours are literal CSS colours, not theme tokens: a scanner needs a fixed dark-on-light contrast, so the code stays black on white in dark mode too.

## API

| Input       | Type                                              | Default     | Description                                                                                        |
| ----------- | ------------------------------------------------- | ----------- | -------------------------------------------------------------------------------------------------- |
| `value`     | `string`                                          | required    | Text or URL to encode.                                                                             |
| `size`      | `number`                                          | `160`       | Side of the drawn code in CSS pixels, without the frame's padding and border.                      |
| `color`     | `string`                                          | `'#000000'` | Colour of the modules.                                                                             |
| `bgColor`   | `string`                                          | `'#FFFFFF'` | Background (also the quiet zone).                                                                  |
| `level`     | `'L' \| 'M' \| 'Q' \| 'H'`                        | `'M'`       | Minimum error correction; raised automatically when that costs no extra size.                      |
| `type`      | `'canvas' \| 'svg'`                               | `'canvas'`  | How it is drawn.                                                                                   |
| `icon`      | `string`                                          | –           | Image URL or data URI drawn in the middle; the modules behind it are cleared.                      |
| `iconSize`  | `number`                                          | `40`        | Side of the icon in CSS pixels.                                                                    |
| `status`    | `'active' \| 'loading' \| 'expired' \| 'scanned'` | `'active'`  | State overlay.                                                                                     |
| `bordered`  | `boolean`                                         | `true`      | Draws the frame's border.                                                                          |
| `labels`    | `Partial<UiQrCodeLabels>`                         | English     | Texts: `qrCode` (accessible name), `loading`, `expired`, `scanned`, `refresh`. Use it to localise. |
| `ariaLabel` | `string`                                          | derived     | Replaces the derived accessible name.                                                              |

| Output    | Type   | Description                                      |
| --------- | ------ | ------------------------------------------------ |
| `refresh` | `void` | The button on the `expired` overlay was clicked. |
