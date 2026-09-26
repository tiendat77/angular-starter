import { cva } from '@libs/ui/core';

export const buttonVariants = cva({
  base: 'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 select-none cursor-pointer',
  variants: {
    variant: {
      primary: 'bg-primary text-primary-content hover:bg-primary/90 focus-visible:outline-primary',
      secondary:
        'bg-secondary text-secondary-content hover:bg-secondary/90 focus-visible:outline-secondary',
      outline: 'border border-border bg-transparent hover:bg-muted text-foreground',
      ghost: 'hover:bg-muted text-foreground',
      danger: 'bg-error text-error-content hover:bg-error/90 focus-visible:outline-error',
    },
    size: {
      sm: 'h-8 px-3 text-xs rounded-md gap-1.5',
      md: 'h-10 px-4 text-sm rounded-lg gap-2',
      lg: 'h-12 px-6 text-base rounded-xl gap-2.5',
      icon: 'h-10 w-10 rounded-lg p-0',
    },
    fullWidth: {
      true: 'w-full',
      false: '',
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md',
    fullWidth: 'false',
  },
});
