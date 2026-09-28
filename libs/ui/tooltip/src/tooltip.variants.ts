import { cva, UiColor } from '@libs/ui/core';
import { UiTooltipSize } from './tooltip.types';

const _tooltipVariants = cva({
  base: 'tooltip',
  variants: {
    color: {
      neutral: 'tooltip-neutral',
      primary: 'tooltip-primary',
      info: 'tooltip-info',
      success: 'tooltip-success',
      warning: 'tooltip-warning',
      error: 'tooltip-error',
    },
    size: {
      sm: 'tooltip-sm',
      md: 'tooltip-md',
    },
    interactive: {
      true: 'tooltip-interactive',
      false: '',
    },
  },
  defaultVariants: {
    color: 'neutral',
    size: 'md',
    interactive: 'false',
  },
});

export interface TooltipVariantProps {
  color?: UiColor;
  size?: UiTooltipSize;
  interactive?: boolean | 'true' | 'false';
}

export function tooltipVariants(props?: TooltipVariantProps, extraClass?: string): string {
  return _tooltipVariants(
    {
      color: props?.color,
      size: props?.size,
      interactive:
        props?.interactive !== undefined
          ? (String(props.interactive) as 'true' | 'false')
          : undefined,
    },
    extraClass
  );
}
