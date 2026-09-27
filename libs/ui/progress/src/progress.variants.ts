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
