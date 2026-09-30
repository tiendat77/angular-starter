import { cva } from '@libs/ui/core';

export const collapseVariants = cva({
  base: 'w-full block',
  variants: {
    variant: {
      bordered: 'border border-border rounded-lg divide-y divide-border bg-background',
      frameless: 'divide-y divide-border bg-transparent border-0',
      ghost: 'space-y-1 bg-transparent',
    },
  },
  defaultVariants: {
    variant: 'bordered',
  },
});

export const collapsePanelVariants = cva({
  base: 'group flex items-center justify-between w-full px-4 py-3 text-left font-medium select-none transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 aria-disabled:cursor-not-allowed aria-disabled:opacity-60',
  variants: {
    variant: {
      bordered: 'hover:bg-muted/50',
      frameless: 'hover:bg-muted/30',
      ghost: 'rounded-lg hover:bg-muted/30',
    },
    iconPosition: {
      left: 'flex-row',
      right: 'flex-row-reverse',
    },
  },
  defaultVariants: {
    variant: 'bordered',
    iconPosition: 'left',
  },
});
