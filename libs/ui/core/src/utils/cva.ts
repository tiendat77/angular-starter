import { cn } from './cn';

export interface CvaConfig<T extends Record<string, Record<string, string>>> {
  base?: string;
  variants?: T;
  defaultVariants?: { [K in keyof T]?: keyof T[K] };
}

export function cva<T extends Record<string, Record<string, string>>>(config: CvaConfig<T>) {
  return (props?: { [K in keyof T]?: keyof T[K] }, extraClass?: string): string => {
    const classes: string[] = [];
    if (config.base) classes.push(config.base);

    if (config.variants) {
      for (const variantKey in config.variants) {
        const propValue = props?.[variantKey] ?? config.defaultVariants?.[variantKey];
        if (propValue && config.variants[variantKey][propValue as string]) {
          classes.push(config.variants[variantKey][propValue as string]);
        }
      }
    }

    if (extraClass) classes.push(extraClass);
    return cn(...classes);
  };
}
