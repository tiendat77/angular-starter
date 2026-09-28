import { cva } from '@libs/ui/core';
import { UiMenuSize } from './menu.types';

const _menuItemVariants = cva({
  base: 'flex w-full items-center justify-between gap-3 text-left select-none transition-colors outline-none cursor-pointer',
  variants: {
    size: {
      sm: 'px-2.5 py-1 text-xs rounded-md',
      md: 'px-3 py-1.5 text-sm rounded-lg',
      lg: 'px-3.5 py-2 text-base rounded-lg',
    },
    danger: {
      false:
        'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 focus-visible:bg-gray-100 dark:focus-visible:bg-gray-800',
      true: 'text-error hover:bg-error/10 focus-visible:bg-error/10',
    },
    disabled: {
      true: 'opacity-50 pointer-events-none cursor-not-allowed',
      false: '',
    },
  },
  defaultVariants: {
    size: 'md',
    danger: 'false',
    disabled: 'false',
  },
});

export interface MenuItemVariantProps {
  size?: UiMenuSize;
  danger?: boolean;
  disabled?: boolean;
}

export function menuItemVariants(props?: MenuItemVariantProps, extraClass?: string): string {
  return _menuItemVariants(
    {
      size: props?.size,
      danger: props?.danger ? 'true' : 'false',
      disabled: props?.disabled ? 'true' : 'false',
    },
    extraClass
  );
}
