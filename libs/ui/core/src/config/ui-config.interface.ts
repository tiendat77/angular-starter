import { UiSize } from '../types/size.type';

export interface UiConfig {
  defaultSize?: UiSize;
  button?: {
    defaultVariant?: string;
    defaultSize?: UiSize;
  };
  formField?: {
    appearance?: 'outline' | 'filled';
  };
}
