import { cva, UiSize } from '@libs/ui/core';

export const checkboxVariants = cva({
  base: 'relative flex items-start gap-2 text-foreground select-none cursor-pointer group',
  variants: {
    size: {
      xs: 'text-xs',
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base',
      xl: 'text-lg',
    },
    disabled: {
      true: 'cursor-not-allowed opacity-50 pointer-events-none',
      false: '',
    },
  },
  defaultVariants: {
    size: 'md',
    disabled: 'false',
  },
});

export const checkboxBoxVariants = cva({
  base: 'inline-flex items-center justify-center shrink-0 border border-border transition-colors duration-150 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary',
  variants: {
    size: {
      xs: 'h-3.5 w-3.5 rounded',
      sm: 'h-4 w-4 rounded',
      md: 'h-5 w-5 rounded-md',
      lg: 'h-6 w-6 rounded-md',
      xl: 'h-7 w-7 rounded-lg',
    },
    checked: {
      true: 'bg-primary border-primary text-primary-content',
      false: 'bg-background hover:bg-muted text-transparent',
    },
  },
  defaultVariants: {
    size: 'md',
    checked: 'false',
  },
});

export const switchVariants = cva({
  base: 'inline-flex items-center gap-2 select-none cursor-pointer',
  variants: {
    disabled: {
      true: 'cursor-not-allowed opacity-50 pointer-events-none',
      false: '',
    },
  },
  defaultVariants: {
    disabled: 'false',
  },
});

export const switchTrackVariants = cva({
  base: 'inline-flex shrink-0 items-center rounded-full p-0.5 border border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
  variants: {
    size: {
      xs: 'h-4 w-7',
      sm: 'h-5 w-9',
      md: 'h-6 w-11',
      lg: 'h-7 w-14',
      xl: 'h-8 w-16',
    },
    checked: {
      true: 'bg-primary border-primary',
      false: 'bg-muted border-border',
    },
  },
  defaultVariants: {
    size: 'md',
    checked: 'false',
  },
});

export const switchThumbVariants = cva({
  base: 'pointer-events-none block rounded-full bg-background shadow-xs transition-transform duration-200 ease-in-out',
  variants: {
    size: {
      xs: 'h-3 w-3',
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6',
      xl: 'h-7 w-7',
    },
    checked: {
      true: '',
      false: 'translate-x-0',
    },
  },
  defaultVariants: {
    size: 'md',
    checked: 'false',
  },
});

export const switchThumbTranslateMap: Record<UiSize, string> = {
  xs: 'translate-x-3',
  sm: 'translate-x-4',
  md: 'translate-x-5',
  lg: 'translate-x-7',
  xl: 'translate-x-8',
};
