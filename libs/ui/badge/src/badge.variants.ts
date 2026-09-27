import { cva } from '@libs/ui/core';

export const badgeVariants = cva({
  base: 'badge',
  variants: {
    color: {
      neutral: 'badge-neutral',
      primary: 'badge-primary',
      info: 'badge-info',
      success: 'badge-success',
      warning: 'badge-warning',
      error: 'badge-error',
    },
    size: { sm: 'badge-sm', md: 'badge-md', dot: 'badge-dot' },
  },
  defaultVariants: { color: 'error', size: 'md' },
});

export const badgeOverlayVariants = cva({
  base: 'badge-overlay',
  variants: {
    position: {
      'top-end': 'badge-top-end',
      'top-start': 'badge-top-start',
      'bottom-end': 'badge-bottom-end',
      'bottom-start': 'badge-bottom-start',
    },
    overlap: { rectangular: '', circular: 'badge-circular' },
  },
  defaultVariants: { position: 'top-end', overlap: 'rectangular' },
});
