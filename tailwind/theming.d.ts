export type Contrast =
  | 'DEFAULT'
  | '50'
  | '100'
  | '200'
  | '300'
  | '400'
  | '500'
  | '600'
  | '700'
  | '800'
  | '900'
  | '950';

export type Palette = Record<Contrast | string | number, string>;

export type Theme = Record<string, Palette>;
