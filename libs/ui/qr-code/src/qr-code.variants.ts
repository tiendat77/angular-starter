import { cva } from '@libs/ui/core';

/**
 * The frame around the code. Its padding doubles as the QR quiet zone, and the component paints
 * the background with `bgColor` so the quiet zone always matches the code, in dark mode too.
 */
export const qrCodeFrameVariants = cva({
  base: 'relative inline-flex items-center justify-center overflow-hidden rounded-lg p-3',
  variants: {
    bordered: {
      true: 'border border-border',
      false: '',
    },
  },
  defaultVariants: {
    bordered: 'true',
  },
});
