import { cva } from '@libs/ui/core';

/**
 * The toast panel: a soft tint of the toast's status color.
 *
 * It builds on the `alert` utility, which mixes `--alert-color` into `--alert-surface` (12% by
 * default). The `alert-{type}` utilities are not used because they make that surface
 * `transparent`, and a toast floats over the page, so its tint must be opaque: the surface is the
 * page background instead. The text stays in the foreground color (the `alert` default would
 * color it with the status color).
 */
export const toastVariants = cva({
  base: 'alert alert-soft relative min-w-60 border-0 px-4 py-3 shadow-lg [--alert-fg:var(--color-foreground)] [--alert-surface:var(--color-background)]',
  variants: {
    type: {
      info: '[--alert-color:var(--color-info)]',
      success: '[--alert-color:var(--color-success)]',
      warning: '[--alert-color:var(--color-warning)]',
      error: '[--alert-color:var(--color-error)]',
    },
  },
  defaultVariants: {
    type: 'info',
  },
});
