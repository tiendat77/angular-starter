import { cva } from '@libs/ui/core';
import { UiTableDensity } from './table.types';

const _tableVariants = cva({
  base: 'data-table',
  variants: {
    density: {
      compact: 'data-table-compact',
      middle: 'data-table-middle',
      default: 'data-table-default',
    },
    bordered: { true: 'data-table-bordered', false: '' },
    striped: { true: 'data-table-striped', false: '' },
  },
  defaultVariants: { density: 'default', bordered: 'false', striped: 'false' },
});

export interface TableVariantProps {
  density?: UiTableDensity;
  bordered?: boolean;
  striped?: boolean;
}

export function tableVariants(props?: TableVariantProps, extraClass?: string): string {
  return _tableVariants(
    {
      density: props?.density,
      bordered: props?.bordered ? 'true' : 'false',
      striped: props?.striped ? 'true' : 'false',
    },
    extraClass
  );
}
