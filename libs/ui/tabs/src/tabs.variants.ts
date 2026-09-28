import { cva, UiColor } from '@libs/ui/core';
import { UiTabsOrientation, UiTabsSize, UiTabsVariant } from './tabs.types';

const _tabVariants = cva({
  base: 'tab',
  variants: {
    variant: {
      bordered: 'tab-bordered-item',
      lift: 'tab-lift-item',
      pill: 'tab-pill-item',
    },
    size: {
      sm: 'tab-sm',
      md: 'tab-md',
      lg: 'tab-lg',
    },
    color: {
      primary: 'tab-color-primary',
      neutral: 'tab-color-neutral',
      secondary: 'tab-color-secondary',
      info: 'tab-color-info',
      success: 'tab-color-success',
      warning: 'tab-color-warning',
      error: 'tab-color-error',
    },
    orientation: {
      horizontal: 'tab-horizontal',
      vertical: 'tab-vertical',
    },
  },
  defaultVariants: {
    variant: 'bordered',
    size: 'md',
    color: 'primary',
    orientation: 'horizontal',
  },
});

export interface TabVariantProps {
  variant?: UiTabsVariant;
  size?: UiTabsSize;
  color?: UiColor;
  orientation?: UiTabsOrientation;
}

export function tabVariants(props?: TabVariantProps, extraClass?: string): string {
  return _tabVariants(
    {
      variant: props?.variant,
      size: props?.size,
      color: props?.color,
      orientation: props?.orientation,
    },
    extraClass
  );
}
