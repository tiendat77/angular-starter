import { cva } from '@libs/ui/core';

export const spinnerVariants = cva({
  base: 'spinner-ring',
  variants: {
    size: {
      inherit: '',
      xs: 'spinner-xs',
      sm: 'spinner-sm',
      md: 'spinner-md',
      lg: 'spinner-lg',
      xl: 'spinner-xl',
    },
    color: {
      current: '',
      neutral: 'spinner-neutral',
      primary: 'spinner-primary',
      info: 'spinner-info',
      success: 'spinner-success',
      warning: 'spinner-warning',
      error: 'spinner-error',
    },
    mode: {
      determinate: 'spinner-determinate',
      indeterminate: 'spinner-indeterminate',
    },
  },
  defaultVariants: { size: 'inherit', color: 'current', mode: 'indeterminate' },
});

export const progressBarVariants = cva({
  base: 'progress-bar',
  variants: {
    size: { sm: 'progress-bar-sm', md: 'progress-bar-md', lg: 'progress-bar-lg' },
    color: {
      neutral: 'progress-bar-neutral',
      primary: 'progress-bar-primary',
      info: 'progress-bar-info',
      success: 'progress-bar-success',
      warning: 'progress-bar-warning',
      error: 'progress-bar-error',
    },
    mode: { determinate: '', indeterminate: 'progress-bar-indeterminate' },
  },
  defaultVariants: { size: 'md', color: 'primary', mode: 'determinate' },
});
